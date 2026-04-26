import urllib.request
import urllib.error
import json
import os
import webbrowser
import threading
import hashlib
import secrets
import time
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse, quote

base = os.path.dirname(os.path.abspath(__file__))

SUPABASE_URL = "https://dtsjfrtofhvfjsqncsjl.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0c2pmcnRvZmh2ZmpzcW5jc2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MjQ5NTcsImV4cCI6MjA4OTIwMDk1N30.7IW5IMb-1aLdEUo6wq5L90vTZDmXbG9P9Kvd_cwosS0"

# ID del super-admin (dopseto) — nunca cambia
DOPSETO_CLAN_WID = "b734e3a5-cb89-4645-b9f5-0bd4229d4a99"
SUPER_ADMIN_PASSWORD = hash("universitario99")  # se recalcula abajo con sha256

# =================== SESIONES EN SUPABASE ===================
SESSION_DURATION = 60 * 60 * 24 * 30  # 30 dias

def crear_sesion(username, rol, clan_id=None):
    token = secrets.token_hex(32)
    expires = int(time.time()) + SESSION_DURATION
    try:
        supabase_request("POST", "sesiones", {
            "token": token,
            "username": username,
            "rol": rol,
            "clan_id": clan_id,
            "expires": expires
        })
    except Exception as e:
        print(f"[SESION] Error al crear sesion: {e}")
    return token

def obtener_sesion(token):
    if not token:
        return None
    try:
        rows = supabase_request("GET", f"sesiones?token=eq.{token}&select=*")
        if not rows:
            return None
        s = rows[0]
        if int(time.time()) > s["expires"]:
            supabase_request("DELETE", f"sesiones?token=eq.{token}")
            return None
        return {"username": s["username"], "rol": s["rol"], "clan_id": s.get("clan_id")}
    except Exception as e:
        print(f"[SESION] Error al obtener sesion: {e}")
        return None

def get_token_from_request(handler):
    cookie = handler.headers.get("Cookie", "")
    for part in cookie.split(";"):
        part = part.strip()
        if part.startswith("session="):
            return part[len("session="):]
    return None

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# =================== SUPABASE ===================
def supabase_request(method, endpoint, data=None):
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    req = urllib.request.Request(url, method=method)
    req.add_header("apikey", SUPABASE_KEY)
    req.add_header("Authorization", f"Bearer {SUPABASE_KEY}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Prefer", "return=representation,resolution=merge-duplicates")
    body = json.dumps(data).encode("utf-8") if data else None
    with urllib.request.urlopen(req, body) as response:
        return json.loads(response.read())

# =================== CLANES ===================
def listar_clanes():
    return supabase_request("GET", "clanes?select=*&order=nombre.asc")

def obtener_clan(clan_id):
    rows = supabase_request("GET", f"clanes?id=eq.{clan_id}&select=*")
    return rows[0] if rows else None

def crear_clan(nombre, wolvesville_clan_id, api_key, secciones=None):
    if secciones is None:
        secciones = {"inicio": True, "miembros": True, "stats": True, "logs": True,
                     "ajustes": True, "comandos": True, "admin": True}
    return supabase_request("POST", "clanes", {
        "nombre": nombre,
        "wolvesville_clan_id": wolvesville_clan_id,
        "api_key": api_key,
        "secciones": json.dumps(secciones)
    })

def actualizar_clan(clan_id, campos):
    supabase_request("PATCH", f"clanes?id=eq.{clan_id}", campos)

def eliminar_clan(clan_id):
    supabase_request("DELETE", f"clanes?id=eq.{clan_id}")

def get_clan_api_key(clan_id):
    """Devuelve la api_key del clan."""
    clan = obtener_clan(clan_id)
    return clan["api_key"] if clan else None

def get_clan_wid(clan_id):
    """Devuelve el wolvesville_clan_id del clan."""
    clan = obtener_clan(clan_id)
    return clan["wolvesville_clan_id"] if clan else None

def get_clan_secciones(clan_id):
    clan = obtener_clan(clan_id)
    if not clan:
        return {}
    s = clan.get("secciones", "{}")
    if isinstance(s, str):
        try:
            return json.loads(s)
        except:
            return {}
    return s or {}

# =================== JUGADORES ===================
def cargar_jugadores():
    rows = supabase_request("GET", "jugadores?select=*")
    jugadores = {}
    for row in rows:
        jugadores[row["id"]] = {
            "nombre_original": row["nombre_original"],
            "nombre_actual": row["nombre_actual"],
            "nota": row.get("nota", "")
        }
    return jugadores

def guardar_jugador(id_jugador, nombre_original, nombre_actual, nota=""):
    supabase_request("POST", "jugadores", {"id": id_jugador, "nombre_original": nombre_original, "nombre_actual": nombre_actual, "nota": nota})

def actualizar_jugador(id_jugador, campos):
    supabase_request("PATCH", f"jugadores?id=eq.{id_jugador}", campos)

# =================== USUARIOS ===================
def crear_usuario_supabase(username, password_hash, rol="miembro", aprobado=False, clan_id=None):
    return supabase_request("POST", "usuarios", {
        "username": username,
        "password": password_hash,
        "rol": rol,
        "aprobado": aprobado,
        "clan_id": clan_id
    })

def buscar_usuario(username):
    rows = supabase_request("GET", f"usuarios?username=eq.{username}&select=*")
    return rows[0] if rows else None

def listar_usuarios(clan_id=None):
    if clan_id:
        return supabase_request("GET", f"usuarios?clan_id=eq.{clan_id}&select=*&order=created_at.desc")
    return supabase_request("GET", "usuarios?select=*&order=created_at.desc")

def aprobar_usuario(user_id, aprobado):
    supabase_request("PATCH", f"usuarios?id=eq.{user_id}", {"aprobado": aprobado})

def cambiar_rol_usuario(user_id, rol):
    supabase_request("PATCH", f"usuarios?id=eq.{user_id}", {"rol": rol})

def eliminar_usuario(user_id):
    supabase_request("DELETE", f"usuarios?id=eq.{user_id}")

def actualizar_actividad(username):
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    try:
        supabase_request("PATCH", f"usuarios?username=eq.{username}", {"ultima_actividad": now})
    except:
        pass

def init_admin():
    try:
        existente = buscar_usuario("dopseto")
        if not existente:
            # Buscar clan de dopseto por wolvesville_clan_id
            clanes = supabase_request("GET", f"clanes?wolvesville_clan_id=eq.{DOPSETO_CLAN_WID}&select=id")
            dopseto_clan_id = clanes[0]["id"] if clanes else None
            crear_usuario_supabase("dopseto", hash_password("universitario99"), rol="admin", aprobado=True, clan_id=dopseto_clan_id)
            print("Admin creado: dopseto")
        elif existente.get("rol") != "admin":
            supabase_request("PATCH", "usuarios?username=eq.dopseto", {"rol": "admin"})
        # Asegurarse que dopseto tenga su clan asignado si falta
        if existente and not existente.get("clan_id"):
            clanes = supabase_request("GET", f"clanes?wolvesville_clan_id=eq.{DOPSETO_CLAN_WID}&select=id")
            if clanes:
                supabase_request("PATCH", "usuarios?username=eq.dopseto", {"clan_id": clanes[0]["id"]})
    except Exception as e:
        print(f"Error iniciando admin: {e}")

# =================== VERIFICACIONES ===================
VERIFICACION_DURATION = 60 * 30  # 30 minutos para poner el código

def crear_verificacion(username_juego, clan_id):
    """Genera un código aleatorio de 6 caracteres para verificar identidad."""
    codigo = secrets.token_hex(3).upper()  # ej: A3F9B2
    expires = int(time.time()) + VERIFICACION_DURATION
    # Eliminar verificaciones previas del mismo usuario
    try:
        supabase_request("DELETE", f"verificaciones?username_juego=eq.{username_juego}")
    except:
        pass
    supabase_request("POST", "verificaciones", {
        "username_juego": username_juego,
        "clan_id": clan_id,
        "codigo": codigo,
        "expires": expires,
        "verificado": False
    })
    return codigo

def confirmar_verificacion(username_juego, clan_id, api_key, wolvesville_clan_id, password_hash=None):
    """Lee la bio del jugador y compara con el código guardado."""
    try:
        rows = supabase_request("GET", f"verificaciones?username_juego=eq.{username_juego}&clan_id=eq.{clan_id}&select=*")
        if not rows:
            return {"ok": False, "error": "No hay verificación pendiente"}
        v = rows[0]
        if int(time.time()) > v["expires"]:
            supabase_request("DELETE", f"verificaciones?username_juego=eq.{username_juego}")
            return {"ok": False, "error": "El código expiró. Iniciá el proceso nuevamente."}
        if v["verificado"]:
            return {"ok": False, "error": "Ya fue verificado"}

        # Buscar al jugador en la API de Wolvesville
        nombre_encoded = quote(username_juego)
        jugador = consultar_api_key(f"https://api.wolvesville.com/players/search?username={nombre_encoded}", api_key)
        bio = jugador.get("personalMessage", "") or ""

        if v["codigo"] not in bio:
            return {"ok": False, "error": f"No encontré el código '{v['codigo']}' en tu mensaje personal. Asegurate de haberlo guardado."}

        # Verificación exitosa — determinar rol según rango en el clan
        player_id = jugador.get("id", "")
        rol = determinar_rol_por_rango(player_id, wolvesville_clan_id, api_key)

        # Marcar como verificado
        supabase_request("PATCH", f"verificaciones?username_juego=eq.{username_juego}", {"verificado": True})

        # Crear o actualizar usuario en la tabla usuarios
        existente = buscar_usuario(username_juego)
        if existente:
            campos = {"aprobado": True, "rol": rol, "clan_id": clan_id, "player_id": player_id}
            if password_hash:
                campos["password"] = password_hash
            supabase_request("PATCH", f"usuarios?username=eq.{username_juego}", campos)
        else:
            supabase_request("POST", "usuarios", {
                "username": username_juego,
                "password": password_hash,
                "rol": rol,
                "aprobado": True,
                "clan_id": clan_id,
                "player_id": player_id
            })

        return {"ok": True, "rol": rol, "player_id": player_id}

    except Exception as e:
        return {"ok": False, "error": str(e)}

def determinar_rol_por_rango(player_id, wolvesville_clan_id, api_key):
    """Consulta la API y devuelve 'lider', 'colider' o 'miembro' según el rango del jugador."""
    try:
        members = consultar_api_key(f"https://api.wolvesville.com/clans/{wolvesville_clan_id}/members", api_key)
        for m in members:
            if m.get("playerId") == player_id:
                if m.get("isCoLeader"):
                    return "colider"
                return "miembro"
        # Si es el líder del clan (primer miembro sin isCoLeader con rango más alto)
        # La API de Wolvesville no distingue al líder en /members, hay que comparar con el ID del líder
        # Por eso el líder deberá ser asignado manualmente por el admin desde el panel Admin
        # Si no está en la lista (raro), miembro por defecto
        return "miembro"
    except:
        return "miembro"

def verificar_pertenencia_clan(username_juego, wolvesville_clan_id, api_key):
    """Verifica que el username exista y pertenezca al clan."""
    try:
        nombre_encoded = quote(username_juego)
        jugador = consultar_api_key(f"https://api.wolvesville.com/players/search?username={nombre_encoded}", api_key)
        if not jugador or jugador.get("error"):
            return {"ok": False, "error": "Jugador no encontrado en Wolvesville"}
        player_id = jugador.get("id", "")
        clan_actual = jugador.get("clanId", "") or jugador.get("clan", {}).get("id", "")
        if clan_actual != wolvesville_clan_id:
            return {"ok": False, "error": "Este usuario no pertenece al clan seleccionado"}
        return {"ok": True, "player_id": player_id}
    except Exception as e:
        return {"ok": False, "error": f"Error al verificar: {str(e)}"}

# =================== CARTERAS ===================
def cargar_carteras(clan_id=None):
    if clan_id:
        rows = supabase_request("GET", f"carteras?clan_id=eq.{clan_id}&select=*")
    else:
        rows = supabase_request("GET", "carteras?select=*")
    carteras = {}
    for row in rows:
        carteras[row["player_id"]] = {"oro": row.get("oro", 0), "gemas": row.get("gemas", 0)}
    return carteras

def upsert_cartera(player_id, username, clan_id, oro=0, gemas=0):
    url = f"{SUPABASE_URL}/rest/v1/carteras"
    req = urllib.request.Request(url, method="POST")
    req.add_header("apikey", SUPABASE_KEY)
    req.add_header("Authorization", f"Bearer {SUPABASE_KEY}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Prefer", "resolution=ignore-duplicates,return=minimal")
    body = json.dumps({
        "player_id": player_id,
        "username": username,
        "clan_id": clan_id,
        "oro": oro,
        "gemas": gemas
    }).encode("utf-8")
    with urllib.request.urlopen(req, body) as response:
        response.read()

def eliminar_cartera(player_id):
    supabase_request("DELETE", f"carteras?player_id=eq.{player_id}")

def actualizar_cartera(player_id, campos):
    supabase_request("PATCH", f"carteras?player_id=eq.{player_id}", campos)

def obtener_ex_miembros(members, clan_id):
    carteras = supabase_request("GET", f"carteras?clan_id=eq.{clan_id}&select=*")
    ids_actuales = {m.get("playerId") for m in members}
    return [c for c in carteras if c["player_id"] not in ids_actuales]

def inicializar_carteras(members, clan_id):
    carteras = cargar_carteras(clan_id)
    for m in members:
        player_id = m.get("playerId")
        username = m.get("username", "")
        if player_id and player_id not in carteras:
            upsert_cartera(player_id, username, clan_id, 0, 0)
            carteras[player_id] = {"oro": 0, "gemas": 0}
    return carteras

# =================== CAMBIOS DE NOMBRE ===================
def registrar_cambio_nombre(player_id, nombre_anterior, nombre_nuevo):
    supabase_request("POST", "cambios_nombre", {
        "player_id": player_id,
        "nombre_anterior": nombre_anterior,
        "nombre_nuevo": nombre_nuevo
    })

def obtener_cambios_nombre():
    return supabase_request("GET", "cambios_nombre?select=*&order=created_at.desc")

# =================== ANUNCIOS AUTOMÁTICOS ===================
def obtener_anuncios_auto(clan_id):
    return supabase_request("GET", f"anuncios_auto?clan_id=eq.{clan_id}&select=*&order=id.asc")

def guardar_anuncio_auto(anuncio_id, mensaje, activo, dia_semana, hora_gmt):
    supabase_request("PATCH", f"anuncios_auto?id=eq.{anuncio_id}", {
        "mensaje": mensaje,
        "activo": activo,
        "dia_semana": int(dia_semana),
        "hora_gmt": hora_gmt
    })

def marcar_publicado(anuncio_id, dia, hora):
    ahora = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    supabase_request("PATCH", f"anuncios_auto?id=eq.{anuncio_id}", {
        "ultima_publicacion": ahora,
        "ultimo_dia_publicado": dia,
        "ultima_hora_publicada": hora
    })

def verificar_y_publicar_anuncios(clan_id, wid, api_key):
    try:
        anuncios = obtener_anuncios_auto(clan_id)
        ahora = time.gmtime()
        dia_hoy = ahora.tm_wday
        hora_actual = f"{ahora.tm_hour:02d}:{ahora.tm_min:02d}"
        fecha_hoy = time.strftime("%Y-%m-%d", ahora)
        for a in anuncios:
            if not a.get("activo"): continue
            if not a.get("mensaje", "").strip(): continue
            if a.get("dia_semana") != dia_hoy: continue
            if a.get("hora_gmt", "") > hora_actual: continue
            ultima = a.get("ultima_publicacion")
            ultimo_dia = a.get("ultimo_dia_publicado")
            ultima_hora = a.get("ultima_hora_publicada")
            dia_actual = a.get("dia_semana")
            hora_programada = a.get("hora_gmt", "")
            if ultima:
                ultima_fecha = ultima[:10]
                if ultima_fecha == fecha_hoy and ultimo_dia == dia_actual and ultima_hora == hora_programada:
                    continue
            try:
                post_api_key(f"https://api.wolvesville.com/clans/{wid}/announcements", {"message": a["mensaje"]}, api_key)
                marcar_publicado(a["id"], dia_actual, hora_programada)
            except Exception as e:
                print(f"[ANUNCIO AUTO] Error: {e}")
    except Exception as e:
        print(f"[ANUNCIO AUTO] Error general: {e}")

# =================== CONFIG ===================
FECHA_INICIO = "2026-03-17T00:00:00Z"

def get_config(clave, clan_id=None):
    try:
        if clan_id:
            rows = supabase_request("GET", f"config?clave=eq.{clave}&clan_id=eq.{clan_id}&select=*")
        else:
            rows = supabase_request("GET", f"config?clave=eq.{clave}&select=*")
        return rows[0]["valor"] if rows else None
    except:
        return None

def set_config(clave, valor, clan_id=None):
    try:
        if clan_id:
            existing = supabase_request("GET", f"config?clave=eq.{clave}&clan_id=eq.{clan_id}&select=id")
            if existing:
                supabase_request("PATCH", f"config?clave=eq.{clave}&clan_id=eq.{clan_id}", {"valor": valor})
            else:
                supabase_request("POST", "config", {"clave": clave, "valor": valor, "clan_id": clan_id})
        else:
            supabase_request("PATCH", f"config?clave=eq.{clave}", {"valor": valor})
    except Exception as e:
        print(f"[CONFIG] ERROR al guardar {clave}: {e}")

# =================== COMANDOS DE CHAT ===================
def obtener_comandos_bot(clan_id):
    rows = supabase_request("GET", f"comandos_bot?clan_id=eq.{clan_id}&select=*&order=id.asc")
    return sorted(rows, key=lambda c: (0 if c["nombre"] == "!comandos" else 1, c["id"]))

def es_lider_o_colider(player_id, wid, api_key):
    """Verifica si el player_id es líder o co-líder según la API de Wolvesville."""
    try:
        members = consultar_api_key(f"https://api.wolvesville.com/clans/{wid}/members", api_key)
        leader_id = None
        # El líder es el único sin isCoLeader en la lista que tiene el rango más alto
        for m in members:
            if m.get("playerId") == player_id:
                return m.get("isCoLeader", False) or m.get("isLeader", False)
    except:
        pass
    return False

def procesar_comandos_chat(clan_id, wid, api_key):
    try:
        ultima = get_config("ultima_lectura_chat", clan_id) or "2000-01-01T00:00:00.000Z"
        mensajes = consultar_api_key(f"https://api.wolvesville.com/clans/{wid}/chat", api_key)
        if not mensajes:
            return
        ultimo = mensajes[0]
        if ultimo.get("date", "") <= ultima:
            return
        set_config("ultima_lectura_chat", ultimo.get("date", ""), clan_id)
        msg = (ultimo.get("msg") or "").strip()
        pid = ultimo.get("playerId", "")
        if ultimo.get("isSystem"): return
        if msg.startswith("[Bot]"): return
        comandos = obtener_comandos_bot(clan_id)
        cfg = {c["nombre"]: c["acceso"] for c in comandos}
        carteras_rows = supabase_request("GET", f"carteras?clan_id=eq.{clan_id}&select=*")
        carteras_por_pid = {r["player_id"]: r for r in carteras_rows}
        carteras_por_username = {r["username"].lower(): r for r in carteras_rows if r.get("username")}

        # Mapa de respuestas personalizadas por nombre de comando
        def reemplazar_keywords(texto, pid, msg_original=""):
            cartera = carteras_por_pid.get(pid, {})
            members_info = {}
            try:
                ml = consultar_api_key(f"https://api.wolvesville.com/clans/{wid}/members", api_key)
                for m in ml:
                    if m.get("playerId") == pid:
                        members_info = m
                        break
            except: pass
            uname = members_info.get("username", carteras_por_pid.get(pid, {}).get("username", pid))
            ahora = time.strftime("%d/%m/%Y", time.gmtime())
            texto = texto.replace("{usuario}", uname)
            texto = texto.replace("{cartera}", f"🥇 {cartera.get('oro', 0)} oro · 💎 {cartera.get('gemas', 0)} gemas")
            texto = texto.replace("{oro}", str(cartera.get("oro", 0)))
            texto = texto.replace("{gemas}", str(cartera.get("gemas", 0)))
            texto = texto.replace("{clan}", wid)
            texto = texto.replace("{fecha}", ahora)
            try:
                info = consultar_api_key(f"https://api.wolvesville.com/clans/{wid}/info", api_key)
                texto = texto.replace("{clan}", info.get("name", wid))
                texto = texto.replace("{miembros}", str(info.get("memberCount", "?")))
            except: pass
            return texto

        respuestas_custom = {c["nombre"].lower(): c["respuesta"] for c in comandos if c.get("respuesta")}

        if msg.lower() == "!cartera":
            acceso = cfg.get("!cartera", "desactivado")
            if acceso == "desactivado": return
            if acceso == "lideres" and not es_lider_o_colider(pid, wid, api_key): return
            # Si tiene respuesta personalizada, usarla en lugar de la lógica original
            if "!cartera" in respuestas_custom:
                try:
                    respuesta_final = reemplazar_keywords(respuestas_custom["!cartera"], pid, msg)
                    post_api_key(f"https://api.wolvesville.com/clans/{wid}/chat", {"message": f"[Bot] {respuesta_final}"}, api_key)
                except: pass
                return
            try:
                sincronizar_donaciones(clan_id, wid, api_key)
            except: pass
            cartera_actualizada = supabase_request("GET", f"carteras?player_id=eq.{pid}&clan_id=eq.{clan_id}&select=*")
            cartera = cartera_actualizada[0] if cartera_actualizada else None
            if cartera:
                respuesta = f"[Bot] Cartera de {cartera['username']}: 🥇 {cartera.get('oro', 0)} oro · 💎 {cartera.get('gemas', 0)} gemas"
            else:
                respuesta = "[Bot] No encontré tu cartera. Asegurate de estar en el clan."
            try:
                post_api_key(f"https://api.wolvesville.com/clans/{wid}/chat", {"message": respuesta}, api_key)
            except Exception as e:
                print(f"[CHAT BOT] Error: {e}")

        elif msg.lower().startswith("!info @"):
            acceso = cfg.get("!info @", "desactivado")
            if acceso == "desactivado": return
            if acceso == "lideres" and not es_lider_o_colider(pid, wid, api_key): return
            if "!info @" in respuestas_custom:
                try:
                    respuesta_final = reemplazar_keywords(respuestas_custom["!info @"], pid, msg)
                    post_api_key(f"https://api.wolvesville.com/clans/{wid}/chat", {"message": f"[Bot] {respuesta_final}"}, api_key)
                except: pass
                return
            objetivo = msg[7:].strip().lower()
            cartera = carteras_por_username.get(objetivo)
            if cartera:
                respuesta = f"[Bot] Cartera de {cartera['username']}: 🥇 {cartera.get('oro', 0)} oro · 💎 {cartera.get('gemas', 0)} gemas"
            else:
                respuesta = f"[Bot] No encontré la cartera de @{objetivo}."
            try:
                post_api_key(f"https://api.wolvesville.com/clans/{wid}/chat", {"message": respuesta}, api_key)
            except: pass

        elif msg.lower() == "!comandos":
            acceso = cfg.get("!comandos", "desactivado")
            if acceso == "desactivado": return
            if acceso == "lideres" and not es_lider_o_colider(pid, wid, api_key): return
            activos = [
                c["nombre"] + (" (solo líderes)" if c.get("acceso") == "lideres" else "")
                for c in comandos if c.get("acceso") != "desactivado"
            ]
            respuesta = "[Bot] Comandos disponibles:\n" + "\n".join(activos) if activos else "[Bot] No hay comandos activos."
            try:
                post_api_key(f"https://api.wolvesville.com/clans/{wid}/chat", {"message": respuesta}, api_key)
            except: pass

        elif msg.lower().startswith("!donaroro "):
            acceso = cfg.get("!donarOro", "desactivado")
            if acceso == "desactivado": return
            if acceso == "lideres" and not es_lider_o_colider(pid, wid, api_key): return
            partes = msg.split()
            if len(partes) != 3 or not partes[1].startswith("@"):
                respuesta = "[Bot] Uso correcto: !donarOro @usuario cantidad"
            else:
                destinatario = partes[1][1:].lower()
                try:
                    cantidad = int(partes[2])
                    cartera_origen = carteras_por_pid.get(pid)
                    cartera_destino = carteras_por_username.get(destinatario)
                    if not cartera_origen: respuesta = "[Bot] No encontré tu cartera."
                    elif not cartera_destino: respuesta = f"[Bot] No encontré la cartera de @{destinatario}."
                    elif cartera_origen["player_id"] == cartera_destino["player_id"]: respuesta = "[Bot] No podés donarte a vos mismo."
                    elif (cartera_origen.get("oro") or 0) < cantidad: respuesta = f"[Bot] Fondos insuficientes. Tu saldo: 🥇 {cartera_origen.get('oro', 0)}."
                    else:
                        supabase_request("PATCH", f"carteras?player_id=eq.{cartera_origen['player_id']}", {"oro": cartera_origen.get("oro", 0) - cantidad})
                        supabase_request("PATCH", f"carteras?player_id=eq.{cartera_destino['player_id']}", {"oro": cartera_destino.get("oro", 0) + cantidad})
                        respuesta = f"[Bot] ✅ {cartera_origen['username']} donó 🥇 {cantidad} oro a {cartera_destino['username']}."
                except ValueError:
                    respuesta = "[Bot] La cantidad debe ser un número entero."
            try:
                post_api_key(f"https://api.wolvesville.com/clans/{wid}/chat", {"message": respuesta}, api_key)
            except: pass

        elif msg.lower().startswith("!donargemas "):
            acceso = cfg.get("!donarGemas", "desactivado")
            if acceso == "desactivado": return
            if acceso == "lideres" and not es_lider_o_colider(pid, wid, api_key): return
            partes = msg.split()
            if len(partes) != 3 or not partes[1].startswith("@"):
                respuesta = "[Bot] Uso correcto: !donarGemas @usuario cantidad"
            else:
                destinatario = partes[1][1:].lower()
                try:
                    cantidad = int(partes[2])
                    cartera_origen = carteras_por_pid.get(pid)
                    cartera_destino = carteras_por_username.get(destinatario)
                    if not cartera_origen: respuesta = "[Bot] No encontré tu cartera."
                    elif not cartera_destino: respuesta = f"[Bot] No encontré la cartera de @{destinatario}."
                    elif cartera_origen["player_id"] == cartera_destino["player_id"]: respuesta = "[Bot] No podés donarte a vos mismo."
                    elif (cartera_origen.get("gemas") or 0) < cantidad: respuesta = f"[Bot] Fondos insuficientes. Tu saldo: 💎 {cartera_origen.get('gemas', 0)}."
                    else:
                        supabase_request("PATCH", f"carteras?player_id=eq.{cartera_origen['player_id']}", {"gemas": cartera_origen.get("gemas", 0) - cantidad})
                        supabase_request("PATCH", f"carteras?player_id=eq.{cartera_destino['player_id']}", {"gemas": cartera_destino.get("gemas", 0) + cantidad})
                        respuesta = f"[Bot] ✅ {cartera_origen['username']} donó 💎 {cantidad} gemas a {cartera_destino['username']}."
                except ValueError:
                    respuesta = "[Bot] La cantidad debe ser un número entero."
            try:
                post_api_key(f"https://api.wolvesville.com/clans/{wid}/chat", {"message": respuesta}, api_key)
            except: pass

        # Función para reemplazar keywords en respuestas
        # Comandos predefinidos con keywords
        for cmd_nombre in ["!cartera", "!info @", "!comandos", "!donaroro ", "!donargemas "]:
            pass  # ya procesados arriba

        # Comandos personalizados (solo los que NO son builtins ya manejados arriba)
        BUILTINS = {"!cartera", "!info @", "!comandos", "!donaroro ", "!donargemas "}
        for c in comandos:
            if not c.get("respuesta"): continue
            nombre_lower = c["nombre"].lower()
            if nombre_lower in BUILTINS: continue  # ya manejado arriba
            if msg.lower() == nombre_lower:
                acceso = c.get("acceso", "desactivado")
                if acceso == "desactivado": break
                if acceso == "lideres" and not es_lider_o_colider(pid, wid, api_key): break
                try:
                    respuesta_final = reemplazar_keywords(c["respuesta"], pid, msg)
                    post_api_key(f"https://api.wolvesville.com/clans/{wid}/chat", {"message": f"[Bot] {respuesta_final}"}, api_key)
                except: pass
                break

    except Exception as e:
        print(f"[CHAT BOT] Error general clan {clan_id}: {e}")

def sincronizar_donaciones(clan_id, wid, api_key):
    ultima = get_config("ultima_sincronizacion", clan_id) or FECHA_INICIO
    ledger = consultar_api_key(f"https://api.wolvesville.com/clans/{wid}/ledger", api_key)
    nuevas = [e for e in ledger if e.get("creationTime", "") > ultima]
    if not nuevas:
        return {"ok": True, "procesadas": 0, "mensaje": "No hay donaciones nuevas"}
    sumas = {}
    for entry in nuevas:
        username = entry.get("playerUsername", "")
        if not username: continue
        if username not in sumas:
            sumas[username] = {"gold": 0, "gems": 0}
        sumas[username]["gold"] += entry.get("gold", 0) or 0
        sumas[username]["gems"] += entry.get("gems", 0) or 0
    carteras_rows = supabase_request("GET", f"carteras?clan_id=eq.{clan_id}&select=*")
    carteras_por_player_id = {row["player_id"]: row for row in carteras_rows}
    player_id_por_username = {}
    for entry in nuevas:
        pid = entry.get("playerId")
        uname = entry.get("playerUsername", "")
        if pid and uname:
            player_id_por_username[uname] = pid
    procesadas = 0
    for username, montos in sumas.items():
        pid = player_id_por_username.get(username)
        if pid and pid in carteras_por_player_id:
            row = carteras_por_player_id[pid]
            nuevo_oro = row.get("oro", 0) + montos["gold"]
            nuevo_gemas = row.get("gemas", 0) + montos["gems"]
            username_guardado = row.get("username", "")
            if username_guardado and username_guardado != username:
                registrar_cambio_nombre(pid, username_guardado, username)
            supabase_request("PATCH", f"carteras?player_id=eq.{pid}", {
                "oro": nuevo_oro, "gemas": nuevo_gemas, "username": username
            })
            procesadas += 1
    if nuevas:
        ultima_nueva = max(e.get("creationTime", "") for e in nuevas)
        set_config("ultima_sincronizacion", ultima_nueva, clan_id)
    return {"ok": True, "procesadas": procesadas, "mensaje": f"{procesadas} cartera(s) actualizada(s)", "donaciones": nuevas}

# =================== DETECCIÓN DE NUEVOS MIEMBROS ===================
def detectar_nuevos_miembros(clan_id, wid, api_key):
    try:
        ultima = get_config("ultimo_log_procesado", clan_id)
        if not ultima:
            # Primera vez o después de reset: guardar fecha actual sin procesar nada
            now = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.000Z")
            set_config("ultimo_log_procesado", now, clan_id)
            return
        logs = consultar_api_key(f"https://api.wolvesville.com/clans/{wid}/logs", api_key)
        if not logs: return
        nuevos_ingresos = [l for l in logs if l.get("creationTime", "") > ultima and l.get("action", "").upper() == "PLAYER_JOINED"]
        if not nuevos_ingresos:
            ultimo_log = max(logs, key=lambda l: l.get("creationTime", ""))
            ultima_fecha = ultimo_log.get("creationTime", "")
            if ultima_fecha > ultima:
                set_config("ultimo_log_procesado", ultima_fecha, clan_id)
            return
        ultima_nueva = max(l.get("creationTime", "") for l in nuevos_ingresos)
        set_config("ultimo_log_procesado", ultima_nueva, clan_id)
        carteras_existentes = supabase_request("GET", f"carteras?clan_id=eq.{clan_id}&select=player_id")
        ids_con_cartera = {r["player_id"] for r in carteras_existentes}
        for log in nuevos_ingresos:
            username = log.get("playerUsername", "")
            player_id = log.get("playerId", "")
            if not player_id or not username: continue
            if player_id not in ids_con_cartera:
                upsert_cartera(player_id, username, clan_id, 0, 0)
                ids_con_cartera.add(player_id)
            try:
                plantilla = get_config("mensaje_bienvenida", clan_id) or "[Bot] ¡Bienvenido/a al clan, {username}! 🐺"
                bienvenida = plantilla.replace("{username}", username)
                post_api_key(f"https://api.wolvesville.com/clans/{wid}/chat", {"message": bienvenida}, api_key)
            except Exception as e:
                print(f"[NUEVO MIEMBRO] Error bienvenida: {e}")
    except Exception as e:
        print(f"[NUEVO MIEMBRO] Error general: {e}")

# =================== PARTICIPACIÓN EN MISIONES ===================
def registrar_participacion_mision(clan_id, wid, api_key):
    try:
        quest_data = consultar_api_key(f"https://api.wolvesville.com/clans/{wid}/quests/active", api_key)
        if not quest_data or not quest_data.get("quest"): return
        quest = quest_data.get("quest", {})
        mission_id = quest.get("id", "")
        if not mission_id: return
        ultima = get_config("ultima_mision_registrada", clan_id)
        if ultima == mission_id: return
        tier_start = quest_data.get("tierStartTime", "")
        mission_date = tier_start[:10] if tier_start else time.strftime("%Y-%m-%d", time.gmtime())
        participants = quest_data.get("participants", [])
        ids_participantes = {p.get("playerId") for p in participants if p.get("playerId")}
        members = consultar_api_key(f"https://api.wolvesville.com/clans/{wid}/members", api_key)
        if not members: return
        logs = consultar_api_key(f"https://api.wolvesville.com/clans/{wid}/logs", api_key)
        fecha_ingreso = {}
        for log in (logs or []):
            if log.get("action", "").upper() == "PLAYER_JOINED":
                pid = log.get("playerId", "")
                fecha = log.get("creationTime", "")[:10]
                if pid and fecha:
                    if pid not in fecha_ingreso or fecha > fecha_ingreso[pid]:
                        fecha_ingreso[pid] = fecha
        for m in members:
            pid = m.get("playerId", "")
            username = m.get("username", "")
            if not pid: continue
            ingreso = fecha_ingreso.get(pid, "")
            if ingreso and ingreso > mission_date: continue
            participo = pid in ids_participantes
            existente = supabase_request("GET", f"participacion?player_id=eq.{pid}&mission_id=eq.{mission_id}&clan_id=eq.{clan_id}&select=id")
            if existente: continue
            supabase_request("POST", "participacion", {
                "player_id": pid, "username": username, "mission_id": mission_id,
                "mission_date": mission_date, "participo": participo, "clan_id": clan_id
            })
        set_config("ultima_mision_registrada", mission_id, clan_id)
    except Exception as e:
        print(f"[PARTICIPACION] Error: {e}")

# =================== API WOLVESVILLE ===================
def consultar_api_key(url, api_key):
    req = urllib.request.Request(url)
    req.add_header("Authorization", "Bot " + api_key)
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    req.add_header("User-Agent", "Mozilla/5.0")
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read())

def post_api_key(url, data, api_key):
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Authorization", "Bot " + api_key)
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    req.add_header("User-Agent", "Mozilla/5.0")
    with urllib.request.urlopen(req) as response:
        raw = response.read()
        return json.loads(raw) if raw else {"ok": True}

def put_api_key(url, data, api_key):
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, method="PUT")
    req.add_header("Authorization", "Bot " + api_key)
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    req.add_header("User-Agent", "Mozilla/5.0")
    with urllib.request.urlopen(req) as response:
        raw = response.read()
        return json.loads(raw) if raw else {"ok": True}

def patch_api_key(url, data, api_key):
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, method="PATCH")
    req.add_header("Authorization", "Bot " + api_key)
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    req.add_header("User-Agent", "Mozilla/5.0")
    with urllib.request.urlopen(req) as response:
        raw = response.read()
        return json.loads(raw) if raw else {"ok": True}

def delete_api_key(url, api_key):
    req = urllib.request.Request(url, method="DELETE")
    req.add_header("Authorization", "Bot " + api_key)
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    req.add_header("User-Agent", "Mozilla/5.0")
    with urllib.request.urlopen(req) as response:
        raw = response.read()
        return json.loads(raw) if raw else {"ok": True}

def formato_fecha(fecha):
    if not fecha or fecha == 'N/A':
        return 'N/A'
    partes = fecha[:10].split('-')
    return f"{partes[2]}-{partes[1]}-{partes[0]}"

def servir_archivo(path, content_type):
    with open(os.path.join(base, path), "rb") as f:
        return f.read(), content_type

def obtener_avatar(player_id, api_key):
    try:
        slot = consultar_api_key(f"https://api.wolvesville.com/avatars/sharedAvatarId/{player_id}/0", api_key)
        shared_id = slot.get("sharedAvatarId")
        if shared_id:
            avatar = consultar_api_key(f"https://api.wolvesville.com/avatars/{shared_id}", api_key)
            return avatar.get("avatar", {}).get("url", None)
    except:
        pass
    return None

# =================== HELPER: obtener clan de la sesión ===================
def get_clan_context(sesion):
    """Devuelve (clan_id, wid, api_key) según la sesión activa."""
    clan_id = sesion.get("clan_id")
    if not clan_id:
        return None, None, None
    clan = obtener_clan(clan_id)
    if not clan:
        return None, None, None
    return clan_id, clan["wolvesville_clan_id"], clan["api_key"]

# =================== HANDLER ===================
class Handler(BaseHTTPRequestHandler):

    def send_json(self, data, status=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def send_html(self, body_bytes, content_type="text/html; charset=utf-8"):
        self.send_response(200)
        self.send_header("Content-type", content_type)
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body_bytes)

    def redirect(self, location):
        self.send_response(302)
        self.send_header("Location", location)
        self.end_headers()

    def get_sesion(self):
        token = get_token_from_request(self)
        return obtener_sesion(token)

    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        try:
            # Rutas públicas
            if parsed.path == "/":
                sesion = self.get_sesion()
                if sesion:
                    if sesion["rol"] == "admin":
                        self.redirect("/panel/")
                    else:
                        self.redirect("/clan/")
                else:
                    body, ct = servir_archivo("login.html", "text/html; charset=utf-8")
                    self.send_html(body, ct)
                return

            if parsed.path in ("/login", "/login/"):
                body, ct = servir_archivo("login.html", "text/html; charset=utf-8")
                self.send_html(body, ct)
                return

            # Ruta pública: lista de clanes para el selector del login
            if parsed.path == "/clanes/lista":
                clanes = listar_clanes()
                self.send_json([{"id": c["id"], "nombre": c["nombre"]} for c in clanes])
                return

            sesion = self.get_sesion()

            # Panel admin
            if parsed.path in ("/panel/", "/panel/index.html"):
                if not sesion or sesion["rol"] != "admin":
                    self.redirect("/")
                    return
                body, ct = servir_archivo("clan/index.html", "text/html; charset=utf-8")
                self.send_html(body, ct)
                return

            if parsed.path == "/panel/script.js":
                if not sesion or sesion["rol"] != "admin" or sesion.get("clan_id"):
                    self.send_json({"error": "No autorizado"}, 401)
                    return
                body, ct = servir_archivo("clan/script.js", "application/javascript")
                self.send_html(body, ct)
                return

            # Panel clan
            if parsed.path in ("/clan/", "/clan/index.html"):
                if not sesion:
                    self.redirect("/")
                    return
                if sesion["rol"] == "admin":
                    self.redirect("/panel/")
                    return
                actualizar_actividad(sesion["username"])
                body, ct = servir_archivo("clan/index.html", "text/html; charset=utf-8")
                self.send_html(body, ct)
                return

            if parsed.path == "/clan/script.js":
                if not sesion:
                    self.send_json({"error": "No autorizado"}, 401)
                    return
                body, ct = servir_archivo("clan/script.js", "application/javascript")
                self.send_html(body, ct)
                return

            if parsed.path in ("/tracker/", "/tracker/index.html"):
                clan_sesion = obtener_clan(sesion["clan_id"]) if sesion and sesion.get("clan_id") else None
                es_mi_clan = clan_sesion and clan_sesion.get("wolvesville_clan_id") == DOPSETO_CLAN_WID
                if not sesion or sesion["rol"] != "admin" or not es_mi_clan:
                    self.redirect("/")
                    return
                body, ct = servir_archivo("tracker/index.html", "text/html; charset=utf-8")
                self.send_html(body, ct)
                return

            if parsed.path == "/tracker/script.js":
                clan_sesion = obtener_clan(sesion["clan_id"]) if sesion and sesion.get("clan_id") else None
                es_mi_clan = clan_sesion and clan_sesion.get("wolvesville_clan_id") == DOPSETO_CLAN_WID
                if not sesion or sesion["rol"] != "admin" or not es_mi_clan:
                    self.send_json({"error": "No autorizado"}, 401)
                    return
                body, ct = servir_archivo("tracker/script.js", "application/javascript")
                self.send_html(body, ct)
                return

            # APIs — requieren sesión
            if not sesion:
                self.send_json({"error": "No autorizado"}, 401)
                return

            # =================== SUPERADMIN APIs ===================
            if parsed.path == "/panel/clanes":
                if sesion["rol"] != "admin":
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                self.send_json(listar_clanes())
                return

            if parsed.path.startswith("/panel/clanes/") and parsed.path.endswith("/usuarios"):
                if sesion["rol"] != "admin":
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                cid = parsed.path.split("/panel/clanes/")[1].replace("/usuarios", "")
                self.send_json(listar_usuarios(cid))
                return

            # Superadmin impersonando un clan
            if parsed.path.startswith("/panel/entrar/"):
                if sesion["rol"] != "admin":
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                cid = parsed.path.split("/panel/entrar/")[1]
                clan = obtener_clan(cid)
                if not clan:
                    self.send_json({"error": "Clan no encontrado"}, 404)
                    return
                # Crear sesión temporal como admin de ese clan
                token = crear_sesion("dopseto", "admin", cid)
                body = json.dumps({"ok": True}).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.send_header("Set-Cookie", f"session={token}; Path=/; HttpOnly; Max-Age={SESSION_DURATION}")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(body)
                return

            # Lista de clanes para el selector de dopseto (desde dentro del clan)
            if parsed.path == "/admin/clanes-lista":
                if sesion["rol"] != "admin":
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                clanes = listar_clanes()
                self.send_json([{"id": c["id"], "nombre": c["nombre"]} for c in clanes])
                return

            # Cambiar clan temporalmente (solo dopseto)
            if parsed.path.startswith("/admin/cambiar-clan/"):
                if sesion["rol"] != "admin":
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                cid = parsed.path.split("/admin/cambiar-clan/")[1]
                clan = obtener_clan(cid)
                if not clan:
                    self.send_json({"error": "Clan no encontrado"}, 404)
                    return
                # Invalidar sesión actual
                token_actual = get_token_from_request(self)
                if token_actual:
                    try:
                        supabase_request("DELETE", f"sesiones?token=eq.{token_actual}")
                    except: pass
                # Crear nueva sesión con el clan elegido
                token = crear_sesion("dopseto", "admin", cid)
                body = json.dumps({"ok": True}).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.send_header("Set-Cookie", f"session={token}; Path=/; HttpOnly; Max-Age={SESSION_DURATION}")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(body)
                return

            # =================== APIs de clan ===================
            clan_id, wid, api_key = get_clan_context(sesion)

            if parsed.path == "/auth/ping":
                actualizar_actividad(sesion["username"])
                if clan_id and wid and api_key:
                    verificar_y_publicar_anuncios(clan_id, wid, api_key)
                    procesar_comandos_chat(clan_id, wid, api_key)
                    detectar_nuevos_miembros(clan_id, wid, api_key)
                    registrar_participacion_mision(clan_id, wid, api_key)
                self.send_json({"ok": True})
                return

            if parsed.path == "/auth/me":
                secciones = get_clan_secciones(clan_id) if clan_id else {}
                usuario = buscar_usuario(sesion["username"])
                idioma = usuario.get("idioma", "es") if usuario else "es"
                tema = {}
                if clan_id:
                    clan = obtener_clan(clan_id)
                    if clan:
                        tema = {
                            "color_bg": clan.get("color_bg") or "#1a1208",
                            "color_accent": clan.get("color_accent") or "#c47a2a",
                            "color_parchment": clan.get("color_parchment") or "#f2e8c9",
                            "icono": clan.get("icono") or "🐺",
                            "nombre_display": clan.get("nombre_display") or None
                        }
                self.send_json({
                    "username": sesion["username"],
                    "rol": sesion["rol"],
                    "clan_id": clan_id,
                    "secciones": secciones,
                    "idioma": idioma,
                    "tema": tema
                })
                return

            if parsed.path == "/admin/usuarios":
                if sesion["rol"] != "admin":
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                self.send_json(listar_usuarios(clan_id))
                return

            if not clan_id or not wid or not api_key:
                self.send_json({"error": "Clan no configurado"}, 400)
                return

            if parsed.path == "/clan/info":
                self.send_json(consultar_api_key(f"https://api.wolvesville.com/clans/{wid}/info", api_key))
                return

            if parsed.path == "/clan/members":
                members = consultar_api_key(f"https://api.wolvesville.com/clans/{wid}/members/detailed", api_key)
                carteras = inicializar_carteras(members, clan_id)
                for m in members:
                    pid = m.get("playerId")
                    m["cartera"] = carteras.get(pid, {"oro": 0, "gemas": 0})
                self.send_json(members)
                return

            if parsed.path.startswith("/clan/avatar/"):
                player_id = parsed.path.split("/clan/avatar/")[1]
                self.send_json({"avatarUrl": obtener_avatar(player_id, api_key)})
                return

            if parsed.path == "/clan/quests":
                self.send_json(consultar_api_key(f"https://api.wolvesville.com/clans/{wid}/quests/active", api_key))
                return

            if parsed.path == "/clan/quests/available":
                self.send_json(consultar_api_key(f"https://api.wolvesville.com/clans/{wid}/quests/available", api_key))
                return

            if parsed.path == "/clan/quests/votes":
                self.send_json(consultar_api_key(f"https://api.wolvesville.com/clans/{wid}/quests/votes", api_key))
                return

            if parsed.path == "/clan/quests/history":
                self.send_json(consultar_api_key(f"https://api.wolvesville.com/clans/{wid}/quests/history", api_key))
                return

            if parsed.path == "/clan/estadisticas":
                rows = supabase_request("GET", f"participacion?clan_id=eq.{clan_id}&select=*&order=mission_date.asc")
                self.send_json(rows)
                return

            if parsed.path == "/clan/announcements":
                self.send_json(consultar_api_key(f"https://api.wolvesville.com/clans/{wid}/announcements", api_key))
                return

            if parsed.path == "/clan/ledger":
                self.send_json(consultar_api_key(f"https://api.wolvesville.com/clans/{wid}/ledger", api_key))
                return

            if parsed.path == "/clan/logs":
                self.send_json(consultar_api_key(f"https://api.wolvesville.com/clans/{wid}/logs", api_key))
                return

            if parsed.path == "/clan/carteras":
                self.send_json(cargar_carteras(clan_id))
                return

            if parsed.path == "/clan/stats/limpiar-ex":
                if sesion["rol"] not in ("admin", "lider", "colider"):
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                # Obtener miembros actuales
                members = consultar_api_key(f"https://api.wolvesville.com/clans/{wid}/members", api_key)
                ids_actuales = {m.get("playerId") for m in members}
                # Obtener todos los player_ids en participacion de este clan
                rows = supabase_request("GET", f"participacion?clan_id=eq.{clan_id}&select=player_id")
                ids_en_stats = {r["player_id"] for r in rows}
                # Eliminar los que ya no están
                ex_ids = ids_en_stats - ids_actuales
                eliminados = 0
                for pid in ex_ids:
                    try:
                        supabase_request("DELETE", f"participacion?player_id=eq.{pid}&clan_id=eq.{clan_id}")
                        eliminados += 1
                    except: pass
                self.send_json({"ok": True, "eliminados": eliminados})
                return

            if parsed.path == "/clan/ex-miembros":
                members = consultar_api_key(f"https://api.wolvesville.com/clans/{wid}/members/detailed", api_key)
                self.send_json(obtener_ex_miembros(members, clan_id))
                return

            if parsed.path == "/clan/cambios_nombre":
                self.send_json(obtener_cambios_nombre())
                return

            if parsed.path == "/ajustes/anuncios_auto":
                self.send_json(obtener_anuncios_auto(clan_id))
                return

            if parsed.path == "/comandos":
                self.send_json(obtener_comandos_bot(clan_id))
                return

            if parsed.path == "/clan/sincronizar/info":
                ultima = get_config("ultima_sincronizacion", clan_id) or FECHA_INICIO
                self.send_json({"ultima_sincronizacion": ultima})
                return

            if parsed.path.startswith("/config/"):
                clave = parsed.path.split("/config/")[1]
                valor = get_config(clave, clan_id) or ""
                self.send_json({"clave": clave, "valor": valor})
                return

            if parsed.path == "/jugadores":
                self.send_json(cargar_jugadores())
                return

            if parsed.path == "/buscar":
                nombre = params.get("nombre", [""])[0]
                if nombre:
                    data = consultar_api_key(f"https://api.wolvesville.com/players/search?username={nombre}", api_key)
                    id_j = data["id"]
                    nombre_actual = data["username"]
                    jugadores = cargar_jugadores()
                    nombre_original = jugadores.get(id_j, {}).get("nombre_original", nombre_actual)
                    nota = jugadores.get(id_j, {}).get("nota", "")
                    guardar_jugador(id_j, nombre_original, nombre_actual, nota)
                    nivel = data.get("level", "N/A")
                    if nivel == -1: nivel = "Oculto"
                    self.send_json({"id": id_j, "nombre_original": nombre_original, "nombre_actual": nombre_actual, "nivel": nivel, "fecha": formato_fecha(data.get("creationTime", "N/A")), "clan": data.get("clanName") or "Oculto o sin clan", "nota": nota})
                return

            if parsed.path == "/buscarid":
                id_j = params.get("id", [""])[0]
                if id_j:
                    data = consultar_api_key(f"https://api.wolvesville.com/players/{id_j}", api_key)
                    nombre_actual = data["username"]
                    jugadores = cargar_jugadores()
                    nombre_original = jugadores.get(id_j, {}).get("nombre_original", nombre_actual)
                    nota = jugadores.get(id_j, {}).get("nota", "")
                    guardar_jugador(id_j, nombre_original, nombre_actual, nota)
                    nivel = data.get("level", "N/A")
                    if nivel == -1: nivel = "Oculto"
                    self.send_json({"id": id_j, "nombre_original": nombre_original, "nombre_actual": nombre_actual, "nivel": nivel, "fecha": formato_fecha(data.get("creationTime", "N/A")), "clan": data.get("clanName") or "Oculto o sin clan", "nota": nota})
                return

            if parsed.path == "/guardarnota":
                id_j = params.get("id", [""])[0]
                nota = params.get("nota", [""])[0]
                if id_j:
                    actualizar_jugador(id_j, {"nota": nota})
                    self.send_json({"ok": True})
                return

            if parsed.path == "/verificarid":
                id_j = params.get("id", [""])[0]
                if id_j:
                    jugadores = cargar_jugadores()
                    info = jugadores.get(id_j, {})
                    nombre_anterior = info.get("nombre_actual", "")
                    nombre_original = info.get("nombre_original", "")
                    nota = info.get("nota", "")
                    data = consultar_api_key(f"https://api.wolvesville.com/players/{id_j}", api_key)
                    nombre_actual = data["username"]
                    cambio = nombre_actual != nombre_anterior
                    if cambio:
                        actualizar_jugador(id_j, {"nombre_actual": nombre_actual})
                    nivel = data.get("level", "N/A")
                    if nivel == -1: nivel = "Oculto"
                    self.send_json({"id": id_j, "nombre_original": nombre_original, "nombre_actual": nombre_actual, "nombre_anterior": nombre_anterior, "cambio": cambio, "nivel": nivel, "fecha": formato_fecha(data.get("creationTime", "N/A")), "clan": data.get("clanName") or "Oculto o sin clan", "nota": nota})
                return

            if parsed.path == "/verificar":
                jugadores = cargar_jugadores()
                resultados = []
                for id_j, info in list(jugadores.items()):
                    nombre_anterior = info.get("nombre_actual", "")
                    nombre_original = info.get("nombre_original", "")
                    nota = info.get("nota", "")
                    data = consultar_api_key(f"https://api.wolvesville.com/players/{id_j}", api_key)
                    nombre_actual = data["username"]
                    cambio = nombre_actual != nombre_anterior
                    if cambio:
                        actualizar_jugador(id_j, {"nombre_actual": nombre_actual})
                    nivel = data.get("level", "N/A")
                    if nivel == -1: nivel = "Oculto"
                    resultados.append({"id": id_j, "nombre_original": nombre_original, "nombre_actual": nombre_actual, "nombre_anterior": nombre_anterior, "cambio": cambio, "nivel": nivel, "fecha": formato_fecha(data.get("creationTime", "N/A")), "clan": data.get("clanName") or "Oculto o sin clan", "nota": nota})
                self.send_json(resultados)
                return

            self.send_json({"error": "Not found"}, 404)

        except urllib.error.HTTPError as e:
            self.send_json({"error": f"{e.code} {e.reason}"})
        except Exception as e:
            self.send_json({"error": str(e)})

    def do_POST(self):
        parsed = urlparse(self.path)
        # =================== CÁMARA (va ANTES del try para no leer el body como JSON) ===================
        if parsed.path == '/clan/camara':
            try:
                sesion = self.get_sesion()
                if not sesion:
                    self.send_json({'error': 'No autorizado'}, 401)
                    return
                length = int(self.headers.get('Content-Length', 0))
                raw = self.rfile.read(length)
                data = json.loads(raw) if raw else {}
                video_b64 = data.get('video')
                if video_b64:
                    import base64
                    video_bytes = base64.b64decode(video_b64)
                    nombre = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{sesion['username']}.webm"
                    url = f"{SUPABASE_URL}/storage/v1/object/videos/{nombre}"
                    req = urllib.request.Request(url, method='POST')
                    req.add_header("apikey", SUPABASE_KEY)
                    req.add_header("Authorization", f"Bearer {SUPABASE_KEY}")
                    req.add_header("Content-Type", "video/webm")
                    with urllib.request.urlopen(req, video_bytes) as r:
                        r.read()
                self.send_json({'ok': True})
            except Exception as e:
                self.send_json({'error': str(e)})
            return
        # =================== FIN CÁMARA ===================

        try:
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length)
            data = json.loads(raw) if raw else {}

            # =================== Login con contraseña (admin) ===================
            if parsed.path == "/auth/login":
                username = data.get("username", "").strip()
                password = data.get("password", "")
                if not username or not password:
                    self.send_json({"error": "Campos incompletos"})
                    return
                usuario = buscar_usuario(username)
                if not usuario or not usuario.get("password") or usuario["password"] != hash_password(password):
                    self.send_json({"error": "Usuario o contraseña incorrectos"})
                    return
                if not usuario["aprobado"]:
                    if usuario.get("ultima_actividad"):
                        self.send_json({"suspendido": True, "error": "Cuenta temporalmente suspendida"})
                    else:
                        self.send_json({"pendiente": True, "error": "Cuenta pendiente de aprobación"})
                    return
                token = crear_sesion(usuario["username"], usuario["rol"], usuario.get("clan_id"))
                actualizar_actividad(usuario["username"])
                redirect_url = "/panel/" if usuario["rol"] == "admin" and not usuario.get("clan_id") else "/clan/"
                body = json.dumps({"ok": True, "rol": usuario["rol"], "redirect": redirect_url}).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.send_header("Set-Cookie", f"session={token}; Path=/; HttpOnly; Max-Age={SESSION_DURATION}")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(body)
                return

            if parsed.path == "/auth/iniciar-reset":
                username_juego = data.get("username_juego", "").strip()
                clan_id = data.get("clan_id", "").strip()
                if not username_juego or not clan_id:
                    self.send_json({"error": "Datos incompletos"})
                    return
                # Verificar que el usuario existe y pertenece a ese clan
                usuario = buscar_usuario(username_juego)
                if not usuario:
                    self.send_json({"error": "No encontré una cuenta con ese usuario"})
                    return
                if str(usuario.get("clan_id", "")) != str(clan_id):
                    self.send_json({"error": "El usuario no pertenece al clan seleccionado"})
                    return
                clan = obtener_clan(clan_id)
                if not clan:
                    self.send_json({"error": "Clan no encontrado"})
                    return
                codigo = crear_verificacion(username_juego, clan_id)
                self.send_json({"ok": True, "codigo": codigo})
                return

            if parsed.path == "/auth/confirmar-reset":
                username_juego = data.get("username_juego", "").strip()
                clan_id = data.get("clan_id", "").strip()
                password = data.get("password", "")
                if not username_juego or not clan_id or not password:
                    self.send_json({"error": "Datos incompletos"})
                    return
                if len(password) < 4:
                    self.send_json({"error": "La contraseña debe tener al menos 4 caracteres"})
                    return
                clan = obtener_clan(clan_id)
                if not clan:
                    self.send_json({"error": "Clan no encontrado"})
                    return
                # Verificar código en la bio
                try:
                    rows = supabase_request("GET", f"verificaciones?username_juego=eq.{username_juego}&clan_id=eq.{clan_id}&select=*")
                    if not rows:
                        self.send_json({"error": "No hay verificación pendiente"})
                        return
                    v = rows[0]
                    if int(time.time()) > v["expires"]:
                        supabase_request("DELETE", f"verificaciones?username_juego=eq.{username_juego}")
                        self.send_json({"error": "El código expiró. Iniciá el proceso nuevamente."})
                        return
                    nombre_encoded = quote(username_juego)
                    jugador = consultar_api_key(f"https://api.wolvesville.com/players/search?username={nombre_encoded}", clan["api_key"])
                    bio = jugador.get("personalMessage", "") or ""
                    if v["codigo"] not in bio:
                        self.send_json({"error": f"No encontré el código '{v['codigo']}' en tu mensaje personal."})
                        return
                    # Código correcto — actualizar contraseña
                    supabase_request("DELETE", f"verificaciones?username_juego=eq.{username_juego}")
                    supabase_request("PATCH", f"usuarios?username=eq.{username_juego}", {"password": hash_password(password)})
                    self.send_json({"ok": True})
                except Exception as e:
                    self.send_json({"error": str(e)})
                return

            # =================== Registro/verificación con cuenta del juego ===================
            if parsed.path == "/auth/iniciar-verificacion":
                username_juego = data.get("username_juego", "").strip()
                clan_id = data.get("clan_id", "").strip()
                if not username_juego or not clan_id:
                    self.send_json({"error": "Datos incompletos"})
                    return
                clan = obtener_clan(clan_id)
                if not clan:
                    self.send_json({"error": "Clan no encontrado"})
                    return
                # Verificar que el jugador pertenece al clan
                resultado = verificar_pertenencia_clan(username_juego, clan["wolvesville_clan_id"], clan["api_key"])
                if not resultado["ok"]:
                    self.send_json({"error": resultado["error"]})
                    return
                # Generar código
                codigo = crear_verificacion(username_juego, clan_id)
                self.send_json({"ok": True, "codigo": codigo})
                return

            if parsed.path == "/auth/confirmar-verificacion":
                username_juego = data.get("username_juego", "").strip()
                clan_id = data.get("clan_id", "").strip()
                password = data.get("password", "")
                if not username_juego or not clan_id:
                    self.send_json({"error": "Datos incompletos"})
                    return
                if not password or len(password) < 4:
                    self.send_json({"error": "La contraseña debe tener al menos 4 caracteres"})
                    return
                clan = obtener_clan(clan_id)
                if not clan:
                    self.send_json({"error": "Clan no encontrado"})
                    return
                resultado = confirmar_verificacion(username_juego, clan_id, clan["api_key"], clan["wolvesville_clan_id"], hash_password(password))
                if not resultado["ok"]:
                    self.send_json({"error": resultado["error"]})
                    return
                # Crear sesión
                token = crear_sesion(username_juego, resultado["rol"], clan_id)
                actualizar_actividad(username_juego)
                body = json.dumps({"ok": True, "rol": resultado["rol"]}).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.send_header("Set-Cookie", f"session={token}; Path=/; HttpOnly; Max-Age={SESSION_DURATION}")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(body)
                return

            if parsed.path == "/auth/logout":
                token = get_token_from_request(self)
                if token:
                    try:
                        supabase_request("DELETE", f"sesiones?token=eq.{token}")
                    except: pass
                body = json.dumps({"ok": True}).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.send_header("Set-Cookie", "session=; Path=/; HttpOnly; Max-Age=0")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(body)
                return

            sesion = self.get_sesion()
            if not sesion:
                self.send_json({"error": "No autorizado"}, 401)
                return

            # =================== SUPERADMIN: CRUD clanes ===================
            if parsed.path == "/panel/clanes":
                if sesion["rol"] != "admin":
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                nombre = data.get("nombre", "").strip()
                wolvesville_clan_id = data.get("wolvesville_clan_id", "").strip()
                api_key_clan = data.get("api_key", "").strip()
                if not nombre or not wolvesville_clan_id or not api_key_clan:
                    self.send_json({"error": "Nombre, clan ID y API key son obligatorios"})
                    return
                secciones = data.get("secciones", None)
                result = crear_clan(nombre, wolvesville_clan_id, api_key_clan, secciones)
                self.send_json({"ok": True, "clan": result[0] if result else {}})
                return

            clan_id, wid, api_key = get_clan_context(sesion)

            if parsed.path == "/clan/chat":
                if sesion["rol"] not in ("admin", "lider", "colider"):
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                mensaje = data.get("message", "").strip()
                if mensaje:
                    post_api_key(f"https://api.wolvesville.com/clans/{wid}/chat", {"message": mensaje}, api_key)
                    self.send_json({"ok": True})
                else:
                    self.send_json({"error": "Mensaje vacío"})
                return

            if parsed.path == "/clan/announcements":
                if sesion["rol"] not in ("admin", "lider", "colider"):
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                mensaje = data.get("message", "").strip()
                if mensaje:
                    post_api_key(f"https://api.wolvesville.com/clans/{wid}/announcements", {"message": mensaje}, api_key)
                    self.send_json({"ok": True})
                else:
                    self.send_json({"error": "Mensaje vacío"})
                return

            if parsed.path == "/clan/actualizar-nombres":
                if sesion["rol"] not in ("admin", "lider", "colider"):
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                try:
                    members = consultar_api_key(f"https://api.wolvesville.com/clans/{wid}/members", api_key)
                    carteras_rows = supabase_request("GET", f"carteras?clan_id=eq.{clan_id}&select=*")
                    carteras_por_pid = {r["player_id"]: r for r in carteras_rows}
                    actualizados = 0
                    for m in members:
                        pid = m.get("playerId", "")
                        username_actual = m.get("username", "")
                        if not pid or not username_actual: continue
                        cartera = carteras_por_pid.get(pid)
                        if cartera and cartera.get("username") != username_actual:
                            registrar_cambio_nombre(pid, cartera["username"], username_actual)
                            supabase_request("PATCH", f"carteras?player_id=eq.{pid}&clan_id=eq.{clan_id}", {"username": username_actual})
                            actualizados += 1
                        elif not cartera:
                            upsert_cartera(pid, username_actual, clan_id, 0, 0)
                    self.send_json({"ok": True, "actualizados": actualizados})
                except Exception as e:
                    self.send_json({"error": str(e)})
                return

            if parsed.path == "/clan/sincronizar":
                if sesion["rol"] not in ("admin", "lider", "colider"):
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                resultado = sincronizar_donaciones(clan_id, wid, api_key)
                self.send_json(resultado)
                return

            if parsed.path == "/clan/quests/claim":
                if sesion["rol"] not in ("admin", "lider", "colider"):
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                quest_id = data.get("questId")
                if not quest_id:
                    self.send_json({"error": "questId requerido"})
                    return
                post_api_key(f"https://api.wolvesville.com/clans/{wid}/quests/claim", {"questId": quest_id}, api_key)
                self.send_json({"ok": True})
                return

            if parsed.path == "/clan/quests/shuffle":
                if sesion["rol"] not in ("admin", "lider", "colider"):
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                post_api_key(f"https://api.wolvesville.com/clans/{wid}/quests/available/shuffle", {}, api_key)
                self.send_json({"ok": True})
                return

            if parsed.path.startswith("/config/"):
                if sesion["rol"] != "admin":
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                clave = parsed.path.split("/config/")[1]
                valor = data.get("valor", "")
                set_config(clave, str(valor), clan_id)
                self.send_json({"ok": True})
                return

            if parsed.path.startswith("/ajustes/anuncios_auto/"):
                if sesion["rol"] not in ("admin", "lider", "colider"):
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                anuncio_id = parsed.path.split("/ajustes/anuncios_auto/")[1]
                guardar_anuncio_auto(anuncio_id, data.get("mensaje", ""), data.get("activo", False), data.get("dia_semana", 0), data.get("hora_gmt", "20:00"))
                self.send_json({"ok": True})
                return

            if parsed.path == "/comandos/nuevo":
                if sesion["rol"] not in ("admin", "lider", "colider"):
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                nombre = data.get("nombre", "").strip()
                respuesta_cmd = data.get("respuesta", "").strip()
                if not nombre or not respuesta_cmd:
                    self.send_json({"error": "Nombre y respuesta son obligatorios"})
                    return
                if not nombre.startswith("!"):
                    self.send_json({"error": "El nombre debe empezar con !"})
                    return
                existentes = supabase_request("GET", f"comandos_bot?nombre=eq.{nombre}&clan_id=eq.{clan_id}&select=id")
                if existentes:
                    self.send_json({"error": f"Ya existe un comando con el nombre {nombre}"})
                    return
                supabase_request("POST", "comandos_bot", {
                    "nombre": nombre,
                    "descripcion": respuesta_cmd[:60] + ("..." if len(respuesta_cmd) > 60 else ""),
                    "respuesta": respuesta_cmd,
                    "acceso": "todos",
                    "personalizado": True,
                    "clan_id": clan_id
                })
                self.send_json({"ok": True})
                return

            if parsed.path.startswith("/comandos/"):
                if sesion["rol"] not in ("admin", "lider", "colider"):
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                cmd_id = parsed.path.split("/comandos/")[1]
                # Actualizar acceso
                if "acceso" in data:
                    acceso = data.get("acceso", "desactivado")
                    if acceso not in ("todos", "lideres", "desactivado"):
                        self.send_json({"error": "Acceso inválido"})
                        return
                    supabase_request("PATCH", f"comandos_bot?id=eq.{cmd_id}", {"acceso": acceso})
                # Actualizar respuesta editable
                if "respuesta" in data:
                    supabase_request("PATCH", f"comandos_bot?id=eq.{cmd_id}", {"respuesta": data["respuesta"]})
                self.send_json({"ok": True})
                return

        except urllib.error.HTTPError as e:
            self.send_json({"error": f"{e.code} {e.reason}"})
        except Exception as e:
            self.send_json({"error": str(e)})

    def do_PUT(self):
        parsed = urlparse(self.path)
        try:
            sesion = self.get_sesion()
            if not sesion:
                self.send_json({"error": "No autorizado"}, 401)
                return
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length)
            data = json.loads(raw) if raw else {}

            # Cambiar idioma del usuario
            if parsed.path == "/auth/idioma":
                idioma = data.get("idioma", "es")
                if idioma not in ("es", "en", "pt"):
                    self.send_json({"error": "Idioma inválido"})
                    return
                supabase_request("PATCH", f"usuarios?username=eq.{sesion['username']}", {"idioma": idioma})
                self.send_json({"ok": True})
                return

            clan_id, wid, api_key = get_clan_context(sesion)

            # SUPERADMIN: actualizar clan
            if parsed.path.startswith("/panel/clanes/"):
                if sesion["rol"] != "admin":
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                cid = parsed.path.split("/panel/clanes/")[1]
                campos = {}
                if "nombre" in data: campos["nombre"] = data["nombre"]
                if "wolvesville_clan_id" in data: campos["wolvesville_clan_id"] = data["wolvesville_clan_id"]
                if "api_key" in data: campos["api_key"] = data["api_key"]
                if "secciones" in data: campos["secciones"] = json.dumps(data["secciones"])
                if campos:
                    actualizar_clan(cid, campos)
                self.send_json({"ok": True})
                return

            if parsed.path == "/admin/resetear-password":
                if sesion["rol"] != "admin":
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                username = data.get("username", "").strip()
                nueva_password = data.get("nueva_password", "")
                if not username or not nueva_password or len(nueva_password) < 4:
                    self.send_json({"error": "Datos inválidos"})
                    return
                supabase_request("PATCH", f"usuarios?username=eq.{username}", {"password": hash_password(nueva_password)})
                self.send_json({"ok": True})
                return

            if parsed.path.startswith("/admin/usuarios/") and parsed.path.endswith("/aprobar"):
                if sesion["rol"] != "admin":
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                user_id = parsed.path.split("/admin/usuarios/")[1].replace("/aprobar", "")
                aprobar_usuario(user_id, data.get("aprobado", True))
                self.send_json({"ok": True})
                return

            if parsed.path.startswith("/admin/usuarios/") and parsed.path.endswith("/rol"):
                if sesion["rol"] != "admin":
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                user_id = parsed.path.split("/admin/usuarios/")[1].replace("/rol", "")
                nuevo_rol = data.get("rol", "miembro")
                if nuevo_rol not in ("miembro", "lider", "colider", "espectador"):
                    self.send_json({"error": "Rol inválido"})
                    return
                cambiar_rol_usuario(user_id, nuevo_rol)
                self.send_json({"ok": True})
                return

            if parsed.path == "/clan/members/all/participate":
                if sesion["rol"] not in ("admin", "lider", "colider"):
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                participar = data.get("participateInQuests", True)
                min_gold = data.get("minGold", None)
                min_gems = data.get("minGems", None)
                if min_gold is not None or min_gems is not None:
                    carteras = cargar_carteras(clan_id)
                    members = consultar_api_key(f"https://api.wolvesville.com/clans/{wid}/members/detailed", api_key)
                    actualizados = 0
                    for m in members:
                        pid = m.get("playerId")
                        cartera = carteras.get(pid, {"oro": 0, "gemas": 0})
                        cumple = True
                        if min_gold is not None and (cartera.get("oro") or 0) < min_gold: cumple = False
                        if min_gems is not None and (cartera.get("gemas") or 0) < min_gems: cumple = False
                        if cumple:
                            try:
                                put_api_key(f"https://api.wolvesville.com/clans/{wid}/members/{pid}/participateInQuests", {"participateInQuests": participar}, api_key)
                                actualizados += 1
                            except: pass
                    self.send_json({"ok": True, "actualizados": actualizados})
                else:
                    put_api_key(f"https://api.wolvesville.com/clans/{wid}/members/all/participateInQuests", {"participateInQuests": participar}, api_key)
                    self.send_json({"ok": True})
                return

            if parsed.path.startswith("/clan/members/") and parsed.path.endswith("/participate"):
                if sesion["rol"] not in ("admin", "lider", "colider"):
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                member_id = parsed.path.split("/clan/members/")[1].replace("/participate", "")
                put_api_key(f"https://api.wolvesville.com/clans/{wid}/members/{member_id}/participateInQuests", {"participateInQuests": data.get("participateInQuests", True)}, api_key)
                self.send_json({"ok": True})
                return

        except urllib.error.HTTPError as e:
            self.send_json({"error": f"{e.code} {e.reason}"})
        except Exception as e:
            self.send_json({"error": str(e)})

    def do_PATCH(self):
        parsed = urlparse(self.path)
        try:
            sesion = self.get_sesion()
            if not sesion:
                self.send_json({"error": "No autorizado"}, 401)
                return
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length)
            data = json.loads(raw) if raw else {}

            clan_id, wid, api_key = get_clan_context(sesion)

            if parsed.path.startswith("/clan/announcements/"):
                anuncio_id = parsed.path.split("/clan/announcements/")[1]
                contenido = data.get("content", "").strip()
                if anuncio_id and contenido:
                    patch_api_key(f"https://api.wolvesville.com/clans/{wid}/announcements/{anuncio_id}", {"message": contenido}, api_key)
                    self.send_json({"ok": True})
                else:
                    self.send_json({"error": "Datos inválidos"})
                return

            if parsed.path.startswith("/clan/carteras/"):
                if sesion["rol"] not in ("admin", "lider", "colider"):
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                player_id = parsed.path.split("/clan/carteras/")[1]
                restar = data.get("restar", False)
                if restar:
                    rows = supabase_request("GET", f"carteras?player_id=eq.{player_id}&select=oro,gemas")
                    if rows:
                        actual_oro = rows[0].get("oro", 0) or 0
                        actual_gemas = rows[0].get("gemas", 0) or 0
                        campos = {}
                        if data.get("oro") is not None: campos["oro"] = actual_oro + int(data["oro"])
                        if data.get("gemas") is not None: campos["gemas"] = actual_gemas + int(data["gemas"])
                        if campos: actualizar_cartera(player_id, campos)
                else:
                    campos = {}
                    if data.get("oro") is not None: campos["oro"] = int(data["oro"])
                    if data.get("gemas") is not None: campos["gemas"] = int(data["gemas"])
                    if campos: actualizar_cartera(player_id, campos)
                self.send_json({"ok": True})
                return

        except urllib.error.HTTPError as e:
            self.send_json({"error": f"{e.code} {e.reason}"})
        except Exception as e:
            self.send_json({"error": str(e)})

    def do_DELETE(self):
        parsed = urlparse(self.path)
        try:
            sesion = self.get_sesion()
            if not sesion:
                self.send_json({"error": "No autorizado"}, 401)
                return

            clan_id, wid, api_key = get_clan_context(sesion)

            # SUPERADMIN: eliminar clan
            if parsed.path.startswith("/panel/clanes/"):
                if sesion["rol"] != "admin":
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                cid = parsed.path.split("/panel/clanes/")[1]
                eliminar_clan(cid)
                self.send_json({"ok": True})
                return

            if parsed.path.startswith("/comandos/"):
                if sesion["rol"] not in ("admin", "lider", "colider"):
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                cmd_id = parsed.path.split("/comandos/")[1]
                cmd = supabase_request("GET", f"comandos_bot?id=eq.{cmd_id}&select=*")
                if not cmd or not cmd[0].get("personalizado"):
                    self.send_json({"error": "Solo se pueden eliminar comandos personalizados"})
                    return
                supabase_request("DELETE", f"comandos_bot?id=eq.{cmd_id}")
                self.send_json({"ok": True})
                return

            if parsed.path.startswith("/admin/usuarios/"):
                if sesion["rol"] != "admin":
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                eliminar_usuario(parsed.path.split("/admin/usuarios/")[1])
                self.send_json({"ok": True})
                return

            if parsed.path.startswith("/clan/carteras/"):
                if sesion["rol"] not in ("admin", "lider", "colider"):
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                player_id = parsed.path.split("/clan/carteras/")[1]
                eliminar_cartera(player_id)
                self.send_json({"ok": True})
                return

            if parsed.path == "/clan/stats/limpiar-ex":
                if sesion["rol"] not in ("admin", "lider", "colider"):
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                # Obtener miembros actuales
                members = consultar_api_key(f"https://api.wolvesville.com/clans/{wid}/members", api_key)
                ids_actuales = {m.get("playerId") for m in members}
                # Obtener todos los player_ids en participacion de este clan
                rows = supabase_request("GET", f"participacion?clan_id=eq.{clan_id}&select=player_id")
                ids_en_stats = {r["player_id"] for r in rows}
                # Eliminar los que ya no están
                ex_ids = ids_en_stats - ids_actuales
                eliminados = 0
                for pid in ex_ids:
                    try:
                        supabase_request("DELETE", f"participacion?player_id=eq.{pid}&clan_id=eq.{clan_id}")
                        eliminados += 1
                    except: pass
                self.send_json({"ok": True, "eliminados": eliminados})
                return

            if parsed.path == "/clan/ex-miembros":
                if sesion["rol"] not in ("admin", "lider", "colider"):
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                members = consultar_api_key(f"https://api.wolvesville.com/clans/{wid}/members/detailed", api_key)
                ex = obtener_ex_miembros(members, clan_id)
                for c in ex:
                    eliminar_cartera(c["player_id"])
                    # También eliminar de participacion
                    try:
                        supabase_request("DELETE", f"participacion?player_id=eq.{c['player_id']}&clan_id=eq.{clan_id}")
                    except: pass
                self.send_json({"ok": True, "eliminados": len(ex)})
                return

            if parsed.path.startswith("/clan/announcements/"):
                anuncio_id = parsed.path.split("/clan/announcements/")[1]
                if anuncio_id:
                    delete_api_key(f"https://api.wolvesville.com/clans/{wid}/announcements/{anuncio_id}", api_key)
                    self.send_json({"ok": True})
                return

        except urllib.error.HTTPError as e:
            self.send_json({"error": f"{e.code} {e.reason}"})
        except Exception as e:
            self.send_json({"error": str(e)})

    def log_message(self, format, *args):
        pass

def init_storage():
    try:
        url = f"{SUPABASE_URL}/storage/v1/bucket"
        req = urllib.request.Request(url, method='POST')
        req.add_header("apikey", SUPABASE_KEY)
        req.add_header("Authorization", f"Bearer {SUPABASE_KEY}")
        req.add_header("Content-Type", "application/json")
        body = json.dumps({"id": "videos", "name": "videos", "public": False}).encode()
        with urllib.request.urlopen(req, body) as r:
            r.read()
        print("[STORAGE] Bucket 'videos' creado")
    except Exception as e:
        # Si ya existe el bucket, no pasa nada
        pass

init_storage()
print("Iniciando Wolvesville Multi-Clan...")
init_admin()
threading.Timer(1, lambda: webbrowser.open("http://localhost:8080/")).start()
HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
