import urllib.request
import urllib.error
import json
import os
import webbrowser
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

api_key = "FkUKPpQhT9jlJspDzwKeuBK3MuvSOvFVHIfeMn9E0TiB9UrrzNzegAkJNCQWPbun"
clan_id = "b734e3a5-cb89-4645-b9f5-0bd4229d4a99"
base = os.path.dirname(os.path.abspath(__file__))

SUPABASE_URL = "https://dtsjfrtofhvfjsqncsjl.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0c2pmcnRvZmh2ZmpzcW5jc2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MjQ5NTcsImV4cCI6MjA4OTIwMDk1N30.7IW5IMb-1aLdEUo6wq5L90vTZDmXbG9P9Kvd_cwosS0"

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

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        content_type = "application/json"
        body = None

        try:
            if parsed.path == "/":
                body, content_type = servir_archivo("clan/index.html", "text/html; charset=utf-8")
            elif parsed.path == "/tracker/" or parsed.path == "/tracker/index.html":
                body, content_type = servir_archivo("tracker/index.html", "text/html; charset=utf-8")
            elif parsed.path == "/tracker/script.js":
                body, content_type = servir_archivo("tracker/script.js", "application/javascript")
            elif parsed.path == "/clan/" or parsed.path == "/clan/index.html":
                body, content_type = servir_archivo("clan/index.html", "text/html; charset=utf-8")
            elif parsed.path == "/clan/script.js":
                body, content_type = servir_archivo("clan/script.js", "application/javascript")
            elif parsed.path == "/jugadores":
                body = json.dumps(cargar_jugadores()).encode("utf-8")
            elif parsed.path == "/buscar":
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
                    resultado = {"id": id_jugador, "nombre_original": nombre_original, "nombre_actual": nombre_actual, "nivel": nivel, "fecha": formato_fecha(data.get("creationTime", "N/A")), "clan": data.get("clanName") or "Oculto o sin clan", "nota": nota}
                    body = json.dumps(resultado).encode("utf-8")
            elif parsed.path == "/buscarid":
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
                    resultado = {"id": id_jugador, "nombre_original": nombre_original, "nombre_actual": nombre_actual, "nivel": nivel, "fecha": formato_fecha(data.get("creationTime", "N/A")), "clan": data.get("clanName") or "Oculto o sin clan", "nota": nota}
                    body = json.dumps(resultado).encode("utf-8")
            elif parsed.path == "/guardarnota":
                id_jugador = params.get("id", [""])[0]
                nota = params.get("nota", [""])[0]
                if id_jugador:
                    actualizar_jugador(id_jugador, {"nota": nota})
                    body = json.dumps({"ok": True}).encode("utf-8")
            elif parsed.path == "/verificarid":
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
                    resultado = {"id": id_j, "nombre_original": nombre_original, "nombre_actual": nombre_actual, "nombre_anterior": nombre_anterior, "cambio": cambio, "nivel": nivel, "fecha": formato_fecha(data.get("creationTime", "N/A")), "clan": data.get("clanName") or "Oculto o sin clan", "nota": nota}
                    body = json.dumps(resultado).encode("utf-8")
            elif parsed.path == "/verificar":
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
                body = json.dumps(resultados).encode("utf-8")
            elif parsed.path == "/clan/info":
                data = consultar_api(f"https://api.wolvesville.com/clans/{clan_id}/info")
                body = json.dumps(data).encode("utf-8")
            elif parsed.path == "/clan/members":
                data = consultar_api(f"https://api.wolvesville.com/clans/{clan_id}/members/detailed")
                body = json.dumps(data).encode("utf-8")
            elif parsed.path == "/clan/members/withavatar":
                members = consultar_api(f"https://api.wolvesville.com/clans/{clan_id}/members/detailed")
                for m in members:
                    player_id = m.get("playerId")
                    if player_id:
                        m["avatarUrl"] = obtener_avatar(player_id)
                body = json.dumps(members).encode("utf-8")
            elif parsed.path == "/clan/quests":
                data = consultar_api(f"https://api.wolvesville.com/clans/{clan_id}/quests/active")
                body = json.dumps(data).encode("utf-8")
            elif parsed.path == "/clan/announcements":
                data = consultar_api(f"https://api.wolvesville.com/clans/{clan_id}/announcements")
                body = json.dumps(data).encode("utf-8")
            elif parsed.path == "/clan/ledger":
                data = consultar_api(f"https://api.wolvesville.com/clans/{clan_id}/ledger")
                body = json.dumps(data).encode("utf-8")
            elif parsed.path == "/clan/logs":
                data = consultar_api(f"https://api.wolvesville.com/clans/{clan_id}/logs")
                body = json.dumps(data).encode("utf-8")

        except urllib.error.HTTPError as e:
            body = json.dumps({"error": f"{e.code} {e.reason}"}).encode("utf-8")
        except Exception as e:
            body = json.dumps({"error": str(e)}).encode("utf-8")

        if body is None:
            body = json.dumps({}).encode("utf-8")

        self.send_response(200)
        self.send_header("Content-type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        parsed = urlparse(self.path)
        content_type = "application/json"
        body = None

        try:
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length)
            data = json.loads(raw) if raw else {}

            if parsed.path == "/clan/announcements":
                mensaje = data.get("message", "").strip()
                if mensaje:
                    post_api(f"https://api.wolvesville.com/clans/{clan_id}/announcements", {"message": mensaje})
                    body = json.dumps({"ok": True}).encode("utf-8")
                else:
                    body = json.dumps({"error": "Mensaje vacío"}).encode("utf-8")

        except urllib.error.HTTPError as e:
            body = json.dumps({"error": f"{e.code} {e.reason}"}).encode("utf-8")
        except Exception as e:
            body = json.dumps({"error": str(e)}).encode("utf-8")

        if body is None:
            body = json.dumps({}).encode("utf-8")

        self.send_response(200)
        self.send_header("Content-type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_PUT(self):
        parsed = urlparse(self.path)
        content_type = "application/json"
        body = None

        try:
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length)
            data = json.loads(raw) if raw else {}

            # PUT /clan/members/{id}/participate → toggle individual
            if parsed.path.startswith("/clan/members/") and parsed.path.endswith("/participate"):
                member_id = parsed.path.split("/clan/members/")[1].replace("/participate", "")
                participar = data.get("participateInQuests", True)
                put_api(f"https://api.wolvesville.com/clans/{clan_id}/members/{member_id}/participateInQuests", {"participateInQuests": participar})
                body = json.dumps({"ok": True}).encode("utf-8")

            # PUT /clan/members/all/participate → activar todos o con filtro
            elif parsed.path == "/clan/members/all/participate":
                participar = data.get("participateInQuests", True)
                min_gold = data.get("minGold", None)
                min_gems = data.get("minGems", None)

                if min_gold is not None or min_gems is not None:
                    # Activar solo los que cumplen el filtro
                    members = consultar_api(f"https://api.wolvesville.com/clans/{clan_id}/members/detailed")
                    actualizados = 0
                    for m in members:
                        gold = m.get("donated", {}).get("gold", {}).get("allTime", 0)
                        gems = m.get("donated", {}).get("gems", {}).get("allTime", 0)
                        cumple = True
                        if min_gold is not None and gold < min_gold:
                            cumple = False
                        if min_gems is not None and gems < min_gems:
                            cumple = False
                        if cumple:
                            try:
                                put_api(f"https://api.wolvesville.com/clans/{clan_id}/members/{m['playerId']}/participateInQuests", {"participateInQuests": participar})
                                actualizados += 1
                            except:
                                pass
                    body = json.dumps({"ok": True, "actualizados": actualizados}).encode("utf-8")
                else:
                    # Activar/desactivar a todos de una vez
                    put_api(f"https://api.wolvesville.com/clans/{clan_id}/members/all/participateInQuests", {"participateInQuests": participar})
                    body = json.dumps({"ok": True}).encode("utf-8")

        except urllib.error.HTTPError as e:
            body = json.dumps({"error": f"{e.code} {e.reason}"}).encode("utf-8")
        except Exception as e:
            body = json.dumps({"error": str(e)}).encode("utf-8")

        if body is None:
            body = json.dumps({}).encode("utf-8")

        self.send_response(200)
        self.send_header("Content-type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_PATCH(self):
        parsed = urlparse(self.path)
        content_type = "application/json"
        body = None

        try:
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length)
            data = json.loads(raw) if raw else {}

            if parsed.path.startswith("/clan/announcements/"):
                anuncio_id = parsed.path.split("/clan/announcements/")[1]
                contenido = data.get("content", "").strip()
                if anuncio_id and contenido:
                    patch_api(f"https://api.wolvesville.com/clans/{clan_id}/announcements/{anuncio_id}", {"message": contenido})
                    body = json.dumps({"ok": True}).encode("utf-8")
                else:
                    body = json.dumps({"error": "Datos inválidos"}).encode("utf-8")

        except urllib.error.HTTPError as e:
            body = json.dumps({"error": f"{e.code} {e.reason}"}).encode("utf-8")
        except Exception as e:
            body = json.dumps({"error": str(e)}).encode("utf-8")

        if body is None:
            body = json.dumps({}).encode("utf-8")

        self.send_response(200)
        self.send_header("Content-type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_DELETE(self):
        parsed = urlparse(self.path)
        content_type = "application/json"
        body = None

        try:
            if parsed.path.startswith("/clan/announcements/"):
                anuncio_id = parsed.path.split("/clan/announcements/")[1]
                if anuncio_id:
                    delete_api(f"https://api.wolvesville.com/clans/{clan_id}/announcements/{anuncio_id}")
                    body = json.dumps({"ok": True}).encode("utf-8")
                else:
                    body = json.dumps({"error": "ID inválido"}).encode("utf-8")

        except urllib.error.HTTPError as e:
            body = json.dumps({"error": f"{e.code} {e.reason}"}).encode("utf-8")
        except Exception as e:
            body = json.dumps({"error": str(e)}).encode("utf-8")

        if body is None:
            body = json.dumps({}).encode("utf-8")

        self.send_response(200)
        self.send_header("Content-type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        pass

print("Abriendo Wolvesville...")
threading.Timer(1, lambda: webbrowser.open("http://localhost:8080/clan/")).start()
threading.Timer(1, lambda: webbrowser.open("http://localhost:8080/tracker/")).start()
HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
