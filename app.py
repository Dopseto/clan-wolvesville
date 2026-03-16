import urllib.request
import urllib.error
import json
import os
import webbrowser
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

api_key = "FkUKPpQhT9jlJspDzwKeuBK3MuvSOvFVHIfeMn9E0TiB9UrrzNzegAkJNCQWPbun"
archivo = r"D:\usuarios\alumno\escritorio\wolvesville\jugadores.json"
clan_id = "b734e3a5-cb89-4645-b9f5-0bd4229d4a99"
base = r"D:\usuarios\alumno\escritorio\wolvesville"

def cargar_jugadores():
    if os.path.exists(archivo):
        with open(archivo, "r") as f:
            return json.load(f)
    return {}

def guardar_jugadores(jugadores):
    with open(archivo, "w") as f:
        json.dump(jugadores, f, indent=2)

def consultar_api(url):
    req = urllib.request.Request(url)
    req.add_header("Authorization", "Bot " + api_key)
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    req.add_header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read())

def formato_fecha(fecha):
    if not fecha or fecha == 'N/A':
        return 'N/A'
    partes = fecha[:10].split('-')
    return f"{partes[2]}-{partes[1]}-{partes[0]}"

def servir_archivo(path, content_type):
    with open(os.path.join(base, path), "rb") as f:
        return f.read(), content_type

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        content_type = "application/json"
        body = None

        try:
            # Archivos estáticos
            if parsed.path == "/" or parsed.path == "/tracker/" or parsed.path == "/tracker/index.html":
                body, content_type = servir_archivo("tracker/index.html", "text/html; charset=utf-8")
            elif parsed.path == "/tracker/script.js":
                body, content_type = servir_archivo("tracker/script.js", "application/javascript")
            elif parsed.path == "/clan/" or parsed.path == "/clan/index.html":
                body, content_type = servir_archivo("clan/index.html", "text/html; charset=utf-8")
            elif parsed.path == "/clan/script.js":
                body, content_type = servir_archivo("clan/script.js", "application/javascript")

            # API del tracker
            elif parsed.path == "/jugadores":
                body = json.dumps(cargar_jugadores()).encode("utf-8")
            elif parsed.path == "/buscar":
                nombre = params.get("nombre", [""])[0]
                if nombre:
                    data = consultar_api(f"https://api.wolvesville.com/players/search?username={nombre}")
                    id_jugador = data["id"]
                    nombre_actual = data["username"]
                    jugadores = cargar_jugadores()
                    nombre_original = jugadores.get(id_jugador, {}).get("nombre_original", nombre_actual) if isinstance(jugadores.get(id_jugador), dict) else nombre_actual
                    nota = jugadores.get(id_jugador, {}).get("nota", "") if isinstance(jugadores.get(id_jugador), dict) else ""
                    jugadores[id_jugador] = {"nombre_original": nombre_original, "nombre_actual": nombre_actual, "nota": nota}
                    guardar_jugadores(jugadores)
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
                    nombre_original = jugadores.get(id_jugador, {}).get("nombre_original", nombre_actual) if isinstance(jugadores.get(id_jugador), dict) else nombre_actual
                    nota = jugadores.get(id_jugador, {}).get("nota", "") if isinstance(jugadores.get(id_jugador), dict) else ""
                    jugadores[id_jugador] = {"nombre_original": nombre_original, "nombre_actual": nombre_actual, "nota": nota}
                    guardar_jugadores(jugadores)
                    nivel = data.get("level", "N/A")
                    if nivel == -1: nivel = "Oculto"
                    resultado = {"id": id_jugador, "nombre_original": nombre_original, "nombre_actual": nombre_actual, "nivel": nivel, "fecha": formato_fecha(data.get("creationTime", "N/A")), "clan": data.get("clanName") or "Oculto o sin clan", "nota": nota}
                    body = json.dumps(resultado).encode("utf-8")
            elif parsed.path == "/guardarnota":
                id_jugador = params.get("id", [""])[0]
                nota = params.get("nota", [""])[0]
                if id_jugador:
                    jugadores = cargar_jugadores()
                    if id_jugador in jugadores and isinstance(jugadores[id_jugador], dict):
                        jugadores[id_jugador]["nota"] = nota
                        guardar_jugadores(jugadores)
                    body = json.dumps({"ok": True}).encode("utf-8")
            elif parsed.path == "/verificarid":
                id_j = params.get("id", [""])[0]
                if id_j:
                    jugadores = cargar_jugadores()
                    info = jugadores.get(id_j, {})
                    nombre_anterior = info["nombre_actual"] if isinstance(info, dict) else info
                    nombre_original = info["nombre_original"] if isinstance(info, dict) else info
                    nota = info.get("nota", "") if isinstance(info, dict) else ""
                    data = consultar_api(f"https://api.wolvesville.com/players/{id_j}")
                    nombre_actual = data["username"]
                    cambio = nombre_actual != nombre_anterior
                    if cambio:
                        jugadores[id_j]["nombre_actual"] = nombre_actual
                        guardar_jugadores(jugadores)
                    nivel = data.get("level", "N/A")
                    if nivel == -1: nivel = "Oculto"
                    resultado = {"id": id_j, "nombre_original": nombre_original, "nombre_actual": nombre_actual, "nombre_anterior": nombre_anterior, "cambio": cambio, "nivel": nivel, "fecha": formato_fecha(data.get("creationTime", "N/A")), "clan": data.get("clanName") or "Oculto o sin clan", "nota": nota}
                    body = json.dumps(resultado).encode("utf-8")
            elif parsed.path == "/verificar":
                jugadores = cargar_jugadores()
                resultados = []
                for id_j, info in list(jugadores.items()):
                    nombre_anterior = info["nombre_actual"] if isinstance(info, dict) else info
                    nombre_original = info["nombre_original"] if isinstance(info, dict) else info
                    nota = info.get("nota", "") if isinstance(info, dict) else ""
                    data = consultar_api(f"https://api.wolvesville.com/players/{id_j}")
                    nombre_actual = data["username"]
                    cambio = nombre_actual != nombre_anterior
                    if cambio:
                        jugadores[id_j]["nombre_actual"] = nombre_actual
                    nivel = data.get("level", "N/A")
                    if nivel == -1: nivel = "Oculto"
                    resultados.append({"id": id_j, "nombre_original": nombre_original, "nombre_actual": nombre_actual, "nombre_anterior": nombre_anterior, "cambio": cambio, "nivel": nivel, "fecha": formato_fecha(data.get("creationTime", "N/A")), "clan": data.get("clanName") or "Oculto o sin clan", "nota": nota})
                guardar_jugadores(jugadores)
                body = json.dumps(resultados).encode("utf-8")

            # API del clan
            elif parsed.path == "/clan/info":
                data = consultar_api(f"https://api.wolvesville.com/clans/{clan_id}/info")
                body = json.dumps(data).encode("utf-8")
            elif parsed.path == "/clan/members":
                data = consultar_api(f"https://api.wolvesville.com/clans/{clan_id}/members/detailed")
                body = json.dumps(data).encode("utf-8")
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
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        pass

print("Abriendo Wolvesville...")
threading.Timer(1, lambda: webbrowser.open("http://localhost:8080/tracker/")).start()
threading.Timer(1, lambda: webbrowser.open("http://localhost:8080/clan/")).start()
HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()