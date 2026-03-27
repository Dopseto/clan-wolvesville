// =================== PANEL SUPER-ADMIN ===================
const SECCIONES_DISPONIBLES = [
    { key: 'inicio',    label: '🏠 Inicio' },
    { key: 'miembros',  label: '👥 Miembros' },
    { key: 'logs',      label: '📋 Registros' },
    { key: 'stats',     label: '📊 Estadísticas' },
    { key: 'comandos',  label: '🤖 Comandos' },
    { key: 'ajustes',   label: '⚙️ Ajustes' },
    { key: 'admin',     label: '🛡️ Admin' },
]

let clanEditandoId = null
let seccionesEditar = {}
let seccionesNuevo = {}

// Init secciones por defecto (todo activado)
SECCIONES_DISPONIBLES.forEach(s => {
    seccionesNuevo[s.key] = true
})

window.onload = async function() {
    const res = await fetch('/auth/me')
    if (res.status === 401) { window.location.href = '/'; return }
    const data = await res.json()
    if (data.rol !== 'admin' || data.clan_id) { window.location.href = '/'; return }
    document.getElementById('user-label').textContent = data.username.toUpperCase()
    renderTogglesNuevo()
    cargarClanes()
}

// =================== TOAST ===================
function mostrarToast(msg, tipo = 'ok') {
    const t = document.getElementById('toast')
    t.textContent = msg
    t.className = `toast ${tipo} show`
    setTimeout(() => t.classList.remove('show'), 3000)
}

// =================== TOGGLES ===================
function renderTogglesNuevo() {
    const container = document.getElementById('toggles-nuevo')
    container.innerHTML = ''
    SECCIONES_DISPONIBLES.forEach(s => {
        container.appendChild(crearToggle(s, seccionesNuevo, 'nuevo'))
    })
}

function renderTogglesEditar() {
    const container = document.getElementById('toggles-editar')
    container.innerHTML = ''
    SECCIONES_DISPONIBLES.forEach(s => {
        container.appendChild(crearToggle(s, seccionesEditar, 'edit'))
    })
}

function crearToggle(seccion, obj, prefix) {
    const wrapper = document.createElement('div')
    wrapper.className = 'seccion-toggle'
    const isOn = obj[seccion.key] !== false
    const sw = document.createElement('div')
    sw.className = `toggle-switch ${isOn ? 'on' : ''}`
    sw.id = `${prefix}-toggle-${seccion.key}`
    sw.onclick = () => {
        obj[seccion.key] = !obj[seccion.key]
        sw.classList.toggle('on', obj[seccion.key])
    }
    const lbl = document.createElement('span')
    lbl.textContent = seccion.label
    wrapper.appendChild(sw)
    wrapper.appendChild(lbl)
    return wrapper
}

// =================== CARGAR CLANES ===================
async function cargarClanes() {
    const el = document.getElementById('lista-clanes')
    el.innerHTML = '<p class="cargando">Cargando...</p>'
    try {
        const res = await fetch('/panel/clanes')
        const clanes = await res.json()
        if (!clanes || clanes.length === 0) {
            el.innerHTML = '<p class="empty">No hay clanes registrados todavía.</p>'
            return
        }
        el.innerHTML = ''
        const grid = document.createElement('div')
        grid.className = 'clan-grid'
        clanes.forEach(c => grid.appendChild(renderClanRow(c)))
        el.appendChild(grid)
    } catch(e) {
        el.innerHTML = '<p class="empty" style="color:var(--red)">Error al cargar clanes.</p>'
    }
}

function renderClanRow(c) {
    let secciones = {}
    try { secciones = typeof c.secciones === 'string' ? JSON.parse(c.secciones) : (c.secciones || {}) } catch(e) {}

    const row = document.createElement('div')
    row.className = 'clan-row'
    row.id = `clan-row-${c.id}`

    const badges = SECCIONES_DISPONIBLES.map(s => {
        const on = secciones[s.key] !== false
        return `<span class="badge ${on ? 'on' : 'off'}">${s.label}</span>`
    }).join('')

    row.innerHTML = `
        <div class="clan-info">
            <h3>🏰 ${c.nombre}</h3>
            <p>ID: ${c.wolvesville_clan_id}</p>
            <div class="secciones-badges">${badges}</div>
        </div>
        <div class="clan-actions">
            <button class="btn btn-enter" onclick="entrarClan('${c.id}')">🚪 Entrar</button>
            <button class="btn btn-edit" onclick="abrirEditar('${c.id}', '${c.nombre}', '${c.wolvesville_clan_id}', '${c.api_key}', ${JSON.stringify(JSON.stringify(secciones))})">✏️ Editar</button>
            <button class="btn btn-delete" onclick="eliminarClan('${c.id}', '${c.nombre}')">🗑️ Eliminar</button>
        </div>`
    return row
}

// =================== ENTRAR A CLAN ===================
async function entrarClan(clanId) {
    try {
        const res = await fetch(`/panel/entrar/${clanId}`)
        const data = await res.json()
        if (data.ok) {
            window.location.href = '/clan/'
        } else {
            mostrarToast('Error: ' + (data.error || 'No se pudo entrar'), 'error')
        }
    } catch(e) {
        mostrarToast('Error al entrar al clan', 'error')
    }
}

// =================== CREAR CLAN ===================
async function crearClan() {
    const nombre = document.getElementById('nuevo-nombre').value.trim()
    const wid = document.getElementById('nuevo-wid').value.trim()
    const apikey = document.getElementById('nuevo-apikey').value.trim()
    if (!nombre || !wid || !apikey) {
        mostrarToast('Completá todos los campos', 'error')
        return
    }
    try {
        const res = await fetch('/panel/clanes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, wolvesville_clan_id: wid, api_key: apikey, secciones: seccionesNuevo })
        })
        const data = await res.json()
        if (data.ok) {
            mostrarToast('✓ Clan creado')
            document.getElementById('nuevo-nombre').value = ''
            document.getElementById('nuevo-wid').value = ''
            document.getElementById('nuevo-apikey').value = ''
            seccionesNuevo = {}
            SECCIONES_DISPONIBLES.forEach(s => { seccionesNuevo[s.key] = true })
            renderTogglesNuevo()
            cargarClanes()
        } else {
            mostrarToast('Error: ' + (data.error || 'desconocido'), 'error')
        }
    } catch(e) {
        mostrarToast('Error al crear clan', 'error')
    }
}

// =================== EDITAR CLAN ===================
function abrirEditar(id, nombre, wid, apikey, seccionesStr) {
    clanEditandoId = id
    document.getElementById('edit-nombre').value = nombre
    document.getElementById('edit-wid').value = wid
    document.getElementById('edit-apikey').value = apikey
    try { seccionesEditar = JSON.parse(seccionesStr) } catch(e) { seccionesEditar = {} }
    SECCIONES_DISPONIBLES.forEach(s => {
        if (seccionesEditar[s.key] === undefined) seccionesEditar[s.key] = true
    })
    renderTogglesEditar()
    document.getElementById('modal-editar').classList.add('open')
}

function cerrarModal() {
    document.getElementById('modal-editar').classList.remove('open')
    clanEditandoId = null
}

async function guardarEdicion() {
    if (!clanEditandoId) return
    const nombre = document.getElementById('edit-nombre').value.trim()
    const wid = document.getElementById('edit-wid').value.trim()
    const apikey = document.getElementById('edit-apikey').value.trim()
    if (!nombre || !wid || !apikey) {
        mostrarToast('Completá todos los campos', 'error')
        return
    }
    try {
        const res = await fetch(`/panel/clanes/${clanEditandoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, wolvesville_clan_id: wid, api_key: apikey, secciones: seccionesEditar })
        })
        const data = await res.json()
        if (data.ok) {
            mostrarToast('✓ Clan actualizado')
            cerrarModal()
            cargarClanes()
        } else {
            mostrarToast('Error: ' + (data.error || 'desconocido'), 'error')
        }
    } catch(e) {
        mostrarToast('Error al guardar', 'error')
    }
}

// =================== ELIMINAR CLAN ===================
async function eliminarClan(id, nombre) {
    if (!confirm(`¿Eliminar el clan "${nombre}"? Esta acción no se puede deshacer.`)) return
    try {
        const res = await fetch(`/panel/clanes/${id}`, { method: 'DELETE' })
        const data = await res.json()
        if (data.ok) {
            mostrarToast(`✓ Clan "${nombre}" eliminado`)
            cargarClanes()
        } else {
            mostrarToast('Error: ' + (data.error || 'desconocido'), 'error')
        }
    } catch(e) {
        mostrarToast('Error al eliminar', 'error')
    }
}

// =================== CERRAR SESIÓN ===================
async function cerrarSesion() {
    await fetch('/auth/logout', { method: 'POST' })
    window.location.href = '/'
}

// Cerrar modal al hacer click afuera
document.getElementById('modal-editar').addEventListener('click', function(e) {
    if (e.target === this) cerrarModal()
})
