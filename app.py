import urllib.request
import urllib.error
import json
import os
import webbrowser
import threading
import hashlib
import secrets
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

api_key = "FkUKPpQhT9jlJspDzwKeuBK3MuvSOvFVHIfeMn9E0TiB9UrrzNzegAkJNCQWPbun"
clan_id = "b734e3a5-cb89-4645-b9f5-0bd4229d4a99"
base = os.path.dirname(os.path.abspath(__file__))

SUPABASE_URL = "https://dtsjfrtofhvfjsqncsjl.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0c2pmcnRvZmh2ZmpzcW5jc2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MjQ5NTcsImV4cCI6MjA4OTIwMDk1N30.7IW5IMb-1aLdEUo6wq5L90vTZDmXbG9P9Kvd_cwosS0"

# =================== SESIONES EN MEMORIA ===================
# { token: { "username": ..., "rol": ..., "expires": timestamp } }
sesiones = {}
SESSION_DURATION = 60 * 60 * 8  # 8 horas

def crear_sesion(username, rol):
    token = secrets.token_hex(32)
    sesiones[token] = {
        "username": username,
        "rol": rol,
        "expires": time.time() + SESSION_DURATION
    }
    return token

def obtener_sesion(token):
    if not token or token not in sesiones:
        return None
    s = sesiones[token]
    if time.time() > s["expires"]:
        del sesiones[token]
        return None
    return s

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
    data = {"id": id_jugador, "nombre_original": nombre_original, "nombre_actual": nombre_actual, "nota": nota}
    supabase_request("POST", "jugadores", data)

def actualizar_jugador(id_jugador, campos):
    supabase_request("PATCH", f"jugadores?id=eq.{id_jugador}", campos)

# =================== USUARIOS (Supabase) ===================
def crear_usuario_supabase(username, password_hash, rol="user", aprobado=False):
    data = {"username": username, "password": password_hash, "rol": rol, "aprobado": aprobado}
    return supabase_request("POST", "usuarios", data)

def buscar_usuario(username):
    rows = supabase_request("GET", f"usuarios?username=eq.{username}&select=*")
    return rows[0] if rows else None

def listar_usuarios():
    return supabase_request("GET", "usuarios?select=*&order=created_at.desc")

def aprobar_usuario(user_id, aprobado):
    supabase_request("PATCH", f"usuarios?id=eq.{user_id}", {"aprobado": aprobado})

def eliminar_usuario(user_id):
    supabase_request("DELETE", f"usuarios?id=eq.{user_id}")

def init_admin():
    """Crea el usuario admin si no existe"""
    try:
        existente = buscar_usuario("dopseto")
        if not existente:
            crear_usuario_supabase("dopseto", hash_password("universitario99"), rol="admin", aprobado=True)
            print("Admin creado: dopseto")
    except Exception as e:
        print(f"Error iniciando admin: {e}")

# =================== API WOLVESVILLE ===================
def consultar_api(url):
    req = urllib.request.Request(url)
    req.add_header("Authorization", "Bot " + api_key)
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    req.add_header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read())

def post_api(url, data):
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Authorization", "Bot " + api_key)
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    req.add_header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
    with urllib.request.urlopen(req) as response:
        raw = response.read()
        return json.loads(raw) if raw else {"ok": True}

def put_api(url, data):
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, method="PUT")
    req.add_header("Authorization", "Bot " + api_key)
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    req.add_header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
    with urllib.request.urlopen(req) as response:
        raw = response.read()
        return json.loads(raw) if raw else {"ok": True}

def patch_api(url, data):
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, method="PATCH")
    req.add_header("Authorization", "Bot " + api_key)
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    req.add_header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
    with urllib.request.urlopen(req) as response:
        raw = response.read()
        return json.loads(raw) if raw else {"ok": True}

def delete_api(url):
    req = urllib.request.Request(url, method="DELETE")
    req.add_header("Authorization", "Bot " + api_key)
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    req.add_header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
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

def obtener_avatar(player_id):
    try:
        slot = consultar_api(f"https://api.wolvesville.com/avatars/sharedAvatarId/{player_id}/0")
        shared_id = slot.get("sharedAvatarId")
        if shared_id:
            avatar = consultar_api(f"https://api.wolvesville.com/avatars/{shared_id}")
            return avatar.get("avatar", {}).get("url", None)
    except:
        pass
    return None

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
            # ===== RUTAS PÚBLICAS =====
            if parsed.path == "/":
                # Si ya tiene sesión válida, redirigir al clan
                sesion = self.get_sesion()
                if sesion:
                    self.redirect("/clan/")
                else:
                    body, ct = servir_archivo("login.html", "text/html; charset=utf-8")
                    self.send_html(body, ct)
                return

            if parsed.path == "/login" or parsed.path == "/login/":
                body, ct = servir_archivo("login.html", "text/html; charset=utf-8")
                self.send_html(body, ct)
                return

            # ===== RUTAS PROTEGIDAS - verificar sesión =====
            sesion = self.get_sesion()

            if parsed.path in ("/clan/", "/clan/index.html"):
                if not sesion:
                    self.redirect("/")
                    return
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

            # Tracker (solo admin)
            if parsed.path in ("/tracker/", "/tracker/index.html"):
                if not sesion or sesion["rol"] != "admin":
                    self.redirect("/")
                    return
                body, ct = servir_archivo("tracker/index.html", "text/html; charset=utf-8")
                self.send_html(body, ct)
                return

            if parsed.path == "/tracker/script.js":
                if not sesion or sesion["rol"] != "admin":
                    self.send_json({"error": "No autorizado"}, 401)
                    return
                body, ct = servir_archivo("tracker/script.js", "application/javascript")
                self.send_html(body, ct)
                return

            # ===== APIs — requieren sesión =====
            if not sesion:
                self.send_json({"error": "No autorizado"}, 401)
                return

            # Info de sesión actual (para que el frontend sepa el rol)
            if parsed.path == "/auth/me":
                self.send_json({"username": sesion["username"], "rol": sesion["rol"]})
                return

            # Panel admin: listar usuarios (solo admin)
            if parsed.path == "/admin/usuarios":
                if sesion["rol"] != "admin":
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                usuarios = listar_usuarios()
                self.send_json(usuarios)
                return

            # APIs del clan
            if parsed.path == "/clan/info":
                data = consultar_api(f"https://api.wolvesville.com/clans/{clan_id}/info")
                self.send_json(data)
                return

            if parsed.path == "/clan/members":
                data = consultar_api(f"https://api.wolvesville.com/clans/{clan_id}/members/detailed")
                self.send_json(data)
                return

            if parsed.path.startswith("/clan/avatar/"):
                player_id = parsed.path.split("/clan/avatar/")[1]
                avatar_url = obtener_avatar(player_id)
                self.send_json({"avatarUrl": avatar_url})
                return

            if parsed.path == "/clan/quests":
                data = consultar_api(f"https://api.wolvesville.com/clans/{clan_id}/quests/active")
                self.send_json(data)
                return

            if parsed.path == "/clan/announcements":
                data = consultar_api(f"https://api.wolvesville.com/clans/{clan_id}/announcements")
                self.send_json(data)
                return

            if parsed.path == "/clan/ledger":
                data = consultar_api(f"https://api.wolvesville.com/clans/{clan_id}/ledger")
                self.send_json(data)
                return

            if parsed.path == "/clan/logs":
                data = consultar_api(f"https://api.wolvesville.com/clans/{clan_id}/logs")
                self.send_json(data)
                return

            # APIs del tracker
            if parsed.path == "/jugadores":
                self.send_json(cargar_jugadores())
                return

            if parsed.path == "/buscar":
                nombre = params.get("nombre", [""])[0]
                if nombre:
                    data = consultar_api(f"https://api.wolvesville.com/players/search?username={nombre}")
                    id_jugador = data["id"]
                    nombre_actual = data["username"]
                    jugadores = cargar_jugadores()
                    nombre_original = jugadores.get(id_jugador, {}).get("nombre_original", nombre_actual)
                    nota = jugadores.get(id_jugador, {}).get("nota", "")
                    guardar_jugador(id_jugador, nombre_original, nombre_actual, nota)
                    nivel = data.get("level", "N/A")
                    if nivel == -1: nivel = "Oculto"
                    self.send_json({"id": id_jugador, "nombre_original": nombre_original, "nombre_actual": nombre_actual, "nivel": nivel, "fecha": formato_fecha(data.get("creationTime", "N/A")), "clan": data.get("clanName") or "Oculto o sin clan", "nota": nota})
                    return

            if parsed.path == "/buscarid":
                id_jugador = params.get("id", [""])[0]
                if id_jugador:
                    data = consultar_api(f"https://api.wolvesville.com/players/{id_jugador}")
                    nombre_actual = data["username"]
                    jugadores = cargar_jugadores()
                    nombre_original = jugadores.get(id_jugador, {}).get("nombre_original", nombre_actual)
                    nota = jugadores.get(id_jugador, {}).get("nota", "")
                    guardar_jugador(id_jugador, nombre_original, nombre_actual, nota)
                    nivel = data.get("level", "N/A")
                    if nivel == -1: nivel = "Oculto"
                    self.send_json({"id": id_jugador, "nombre_original": nombre_original, "nombre_actual": nombre_actual, "nivel": nivel, "fecha": formato_fecha(data.get("creationTime", "N/A")), "clan": data.get("clanName") or "Oculto o sin clan", "nota": nota})
                    return

            if parsed.path == "/guardarnota":
                id_jugador = params.get("id", [""])[0]
                nota = params.get("nota", [""])[0]
                if id_jugador:
                    actualizar_jugador(id_jugador, {"nota": nota})
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
                    data = consultar_api(f"https://api.wolvesville.com/players/{id_j}")
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
                    data = consultar_api(f"https://api.wolvesville.com/players/{id_j}")
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
        try:
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length)
            data = json.loads(raw) if raw else {}

            # ===== AUTH: LOGIN =====
            if parsed.path == "/auth/login":
                username = data.get("username", "").strip()
                password = data.get("password", "")
                if not username or not password:
                    self.send_json({"error": "Campos incompletos"})
                    return
                usuario = buscar_usuario(username)
                if not usuario:
                    self.send_json({"error": "Usuario o contraseña incorrectos"})
                    return
                if usuario["password"] != hash_password(password):
                    self.send_json({"error": "Usuario o contraseña incorrectos"})
                    return
                if not usuario["aprobado"]:
                    self.send_json({"pendiente": True, "error": "Cuenta pendiente de aprobación"})
                    return
                token = crear_sesion(usuario["username"], usuario["rol"])
                body = json.dumps({"ok": True, "rol": usuario["rol"]}).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.send_header("Set-Cookie", f"session={token}; Path=/; HttpOnly; Max-Age={SESSION_DURATION}")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(body)
                return

            # ===== AUTH: REGISTRO =====
            if parsed.path == "/auth/registro":
                username = data.get("username", "").strip()
                password = data.get("password", "")
                if not username or not password:
                    self.send_json({"error": "Campos incompletos"})
                    return
                if len(username) < 3:
                    self.send_json({"error": "El usuario debe tener al menos 3 caracteres"})
                    return
                existente = buscar_usuario(username)
                if existente:
                    self.send_json({"error": "Ese nombre de usuario ya está en uso"})
                    return
                crear_usuario_supabase(username, hash_password(password), rol="user", aprobado=False)
                self.send_json({"ok": True})
                return

            # ===== AUTH: LOGOUT =====
            if parsed.path == "/auth/logout":
                token = get_token_from_request(self)
                if token and token in sesiones:
                    del sesiones[token]
                body = json.dumps({"ok": True}).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.send_header("Set-Cookie", "session=; Path=/; HttpOnly; Max-Age=0")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(body)
                return

            # ===== RUTAS PROTEGIDAS =====
            sesion = self.get_sesion()
            if not sesion:
                self.send_json({"error": "No autorizado"}, 401)
                return

            if parsed.path == "/clan/announcements":
                mensaje = data.get("message", "").strip()
                if mensaje:
                    post_api(f"https://api.wolvesville.com/clans/{clan_id}/announcements", {"message": mensaje})
                    self.send_json({"ok": True})
                else:
                    self.send_json({"error": "Mensaje vacío"})
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

            # Admin: aprobar/rechazar usuario
            if parsed.path.startswith("/admin/usuarios/") and parsed.path.endswith("/aprobar"):
                if sesion["rol"] != "admin":
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                user_id = parsed.path.split("/admin/usuarios/")[1].replace("/aprobar", "")
                aprobado = data.get("aprobado", True)
                aprobar_usuario(user_id, aprobado)
                self.send_json({"ok": True})
                return

            if parsed.path.startswith("/clan/members/") and parsed.path.endswith("/participate"):
                member_id = parsed.path.split("/clan/members/")[1].replace("/participate", "")
                participar = data.get("participateInQuests", True)
                put_api(f"https://api.wolvesville.com/clans/{clan_id}/members/{member_id}/participateInQuests", {"participateInQuests": participar})
                self.send_json({"ok": True})
                return

            if parsed.path == "/clan/members/all/participate":
                participar = data.get("participateInQuests", True)
                min_gold = data.get("minGold", None)
                min_gems = data.get("minGems", None)
                if min_gold is not None or min_gems is not None:
                    members = consultar_api(f"https://api.wolvesville.com/clans/{clan_id}/members/detailed")
                    actualizados = 0
                    for m in members:
                        gold = m.get("donated", {}).get("gold", {}).get("allTime", 0)
                        gems = m.get("donated", {}).get("gems", {}).get("allTime", 0)
                        cumple = True
                        if min_gold is not None and gold < min_gold: cumple = False
                        if min_gems is not None and gems < min_gems: cumple = False
                        if cumple:
                            try:
                                put_api(f"https://api.wolvesville.com/clans/{clan_id}/members/{m['playerId']}/participateInQuests", {"participateInQuests": participar})
                                actualizados += 1
                            except: pass
                    self.send_json({"ok": True, "actualizados": actualizados})
                else:
                    put_api(f"https://api.wolvesville.com/clans/{clan_id}/members/all/participateInQuests", {"participateInQuests": participar})
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

            if parsed.path.startswith("/clan/announcements/"):
                anuncio_id = parsed.path.split("/clan/announcements/")[1]
                contenido = data.get("content", "").strip()
                if anuncio_id and contenido:
                    patch_api(f"https://api.wolvesville.com/clans/{clan_id}/announcements/{anuncio_id}", {"message": contenido})
                    self.send_json({"ok": True})
                else:
                    self.send_json({"error": "Datos inválidos"})
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

            # Admin: eliminar usuario
            if parsed.path.startswith("/admin/usuarios/"):
                if sesion["rol"] != "admin":
                    self.send_json({"error": "Sin permisos"}, 403)
                    return
                user_id = parsed.path.split("/admin/usuarios/")[1]
                eliminar_usuario(user_id)
                self.send_json({"ok": True})
                return

            if parsed.path.startswith("/clan/announcements/"):
                anuncio_id = parsed.path.split("/clan/announcements/")[1]
                if anuncio_id:
                    delete_api(f"https://api.wolvesville.com/clans/{clan_id}/announcements/{anuncio_id}")
                    self.send_json({"ok": True})
                else:
                    self.send_json({"error": "ID inválido"})
                return

        except urllib.error.HTTPError as e:
            self.send_json({"error": f"{e.code} {e.reason}"})
        except Exception as e:
            self.send_json({"error": str(e)})

    def log_message(self, format, *args):
        pass

print("Iniciando Wolvesville...")
init_admin()
threading.Timer(1, lambda: webbrowser.open("http://localhost:8080/")).start()
HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
