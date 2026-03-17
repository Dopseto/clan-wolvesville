let seccionActual = 'inicio'
let miembrosCache = [] // Guardamos los miembros para el filtro

const ANUNCIOS_AUTO = [
    "¡Ya están las nuevas misiones para votar! Recuerden que tienen 12 horas para participar en la votación.",
    "¡La misión de la semana ha comenzado! Tienen hasta el domingo para completarla. ¡Mucho éxito a todos!",
    "Recordatorio: donen oro o gemas al clan para mantener los recursos. ¡Gracias a todos por su apoyo!",
    "¡Felicitaciones al clan por completar la misión! Los premios serán entregados en breve.",
]

window.onload = async function() {
    await cargarSesion()
    mostrarSeccion('inicio')
}

function mostrarToast(msg, tipo = 'ok') {
    const t = document.getElementById('toast')
    t.textContent = msg
    t.className = `toast ${tipo} show`
    setTimeout(() => t.classList.remove('show'), 3000)
}

function mostrarSeccion(seccion, btn = null) {
    seccionActual = seccion
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('activo'))
    if (btn) btn.classList.add('activo')
    else document.querySelectorAll('.nav-btn')[0].classList.add('activo')
    const contenido = document.getElementById('contenido')
    contenido.innerHTML = "<p class='cargando'>Cargando...</p>"
    if (seccion === 'inicio') cargarInicio()
    else if (seccion === 'miembros') cargarMiembros()
    else if (seccion === 'logs') cargarLogs()
    else if (seccion === 'stats') cargarStats()
    else if (seccion === 'admin') cargarAdmin()
}

// =================== INICIO ===================
function cargarInicio() {
    Promise.all([
        fetch('/clan/info').then(r => r.json()),
        fetch('/clan/quests').then(r => r.json()),
        fetch('/clan/announcements').then(r => r.json()),
        fetch('/clan/ledger').then(r => r.json())
    ]).then(([info, quests, anuncios, ledger]) => mostrarInicio(info, quests, anuncios, ledger))
}

function mostrarInicio(info, quests, anuncios, ledger) {
    const contenido = document.getElementById('contenido')
    let html = `<h1>${info.name || 'Clan'} <span class="tag">${info.tag || ''}</span></h1>`

    html += `<div class="card"><h3>📜 Descripción</h3>
        <p style="font-size:15px; line-height:1.7">${(info.description || 'Sin descripción').replace(/\n/g, '<br>')}</p>
    </div>`

    html += `<div class="grid">
        <div class="stat"><div class="stat-valor">${info.memberCount || 0}</div><div class="stat-label">Miembros</div></div>
        <div class="stat"><div class="stat-valor">${info.xp || 0}</div><div class="stat-label">XP Total</div></div>
        <div class="stat"><div class="stat-valor">${info.language || 'N/A'}</div><div class="stat-label">Idioma</div></div>
        <div class="stat"><div class="stat-valor">${info.minLevel || 0}</div><div class="stat-label">Nivel mínimo</div></div>
    </div>`

    html += `<div class="card" style="margin-top:16px"><h3>💰 Recursos del clan</h3>
        <div class="grid">
            <div class="stat"><div class="stat-valor">🥇 ${info.gold || 0}</div><div class="stat-label">Oro</div></div>
            <div class="stat"><div class="stat-valor">💎 ${info.gems || 0}</div><div class="stat-label">Gemas</div></div>
        </div>
    </div>`

    html += `<div class="card"><h3>⚔️ Misión activa</h3>`
    if (quests && quests.quest) {
        const progreso = quests.currentValue || 0
        const objetivo = quests.quest.targetValue || 1
        const pct = Math.min(100, Math.round((progreso / objetivo) * 100))
        html += `<p style="margin-bottom:8px"><b>${quests.quest.name || 'N/A'}</b></p>
            <div style="background:rgba(160,128,64,0.2); border-radius:6px; height:10px; overflow:hidden; margin:10px 0; border:1px solid rgba(160,128,64,0.3)">
                <div style="background:var(--accent); width:${pct}%; height:100%; border-radius:6px; transition:width 0.5s"></div>
            </div>
            <p style="font-size:14px; color:var(--muted)">${progreso} / ${objetivo} &nbsp;·&nbsp; Recompensa: ${quests.quest.goldReward || 0} 🥇</p>`
    } else {
        html += `<p style="color:var(--muted); font-style:italic">No hay misión activa</p>`
    }
    html += `</div>`

    html += `<div class="card"><h3>📢 Anuncios</h3>
        <div style="display:flex; gap:0; margin-bottom:16px; border:1px solid var(--border); border-radius:var(--radius-sm); overflow:hidden; width:fit-content">
            <button id="tab-manual" onclick="switchTab('manual')" style="padding:8px 20px; border:none; cursor:pointer; font-family:Cinzel,serif; font-size:11px; letter-spacing:1px; background:var(--accent); color:#fff8e8; transition:all 0.2s">Manual</button>
            <button id="tab-auto" onclick="switchTab('auto')" style="padding:8px 20px; border:none; cursor:pointer; font-family:Cinzel,serif; font-size:11px; letter-spacing:1px; background:rgba(160,128,64,0.1); color:var(--muted); transition:all 0.2s">Automático</button>
        </div>
        <div id="panel-manual">
            <textarea id="nuevoAnuncio" placeholder="Escribí tu anuncio acá..."></textarea>
            <button class="btn-primary" onclick="publicarAnuncio()">📢 Publicar</button>
        </div>
        <div id="panel-auto" style="display:none">
            <p style="font-size:14px; color:var(--muted); margin-bottom:12px; font-style:italic">Seleccioná un mensaje pregrabado:</p>
            ${ANUNCIOS_AUTO.map((msg, i) => `
                <div style="background:rgba(255,252,235,0.5); border:1px solid rgba(160,128,64,0.3); border-radius:var(--radius-sm); padding:12px 14px; margin-bottom:8px; cursor:pointer; transition:all 0.2s" onclick="seleccionarAutoAnuncio(${i})" id="auto-${i}">
                    <p style="font-size:14px; color:var(--ink-light)">${msg}</p>
                </div>`).join('')}
            <button class="btn-primary" style="margin-top:8px" onclick="publicarAutoAnuncio()">📢 Publicar seleccionado</button>
        </div>
    </div>`

    html += `<div class="card"><h3>📜 Historial de anuncios</h3>`
    if (anuncios && anuncios.length > 0) {
        anuncios.slice(0, 5).forEach(a => {
            const fecha = a.timestamp ? a.timestamp.slice(0, 10).split('-').reverse().join('-') : 'N/A'
            html += `<div class="anuncio">
                <span class="anuncio-autor">${a.author || 'N/A'}</span>
                <span class="anuncio-fecha">${fecha}</span>
                <p class="anuncio-msg">${(a.content || '').replace(/\n/g, '<br>')}</p>
            </div>`
        })
    } else {
        html += `<p style="color:var(--muted); font-style:italic">No hay anuncios</p>`
    }
    html += `</div>`

    html += `<div class="card"><h3>🏦 Donaciones recientes</h3>`
    if (ledger && ledger.length > 0) {
        html += `<table><tr><th>Jugador</th><th>Tipo</th><th>Cantidad</th><th>Fecha</th></tr>`
        ledger.slice(0, 20).forEach(d => {
            const fecha = d.creationTime ? d.creationTime.slice(0, 10).split('-').reverse().join('-') : 'N/A'
            html += `<tr>
                <td>${d.playerUsername || 'N/A'}</td>
                <td>${d.type || 'N/A'}</td>
                <td>${d.gold ? d.gold + ' 🥇' : ''} ${d.gems ? d.gems + ' 💎' : ''}</td>
                <td>${fecha}</td>
            </tr>`
        })
        html += `</table>`
    } else {
        html += `<p style="color:var(--muted); font-style:italic">No hay donaciones registradas</p>`
    }
    html += `</div>`

    html += `<div class="card">
        <h3>🔄 Registro de donaciones</h3>
        <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center; margin-bottom:16px">
            <button class="btn-primary" id="btn-sincronizar-inicio" style="background:linear-gradient(180deg,#1a5e6b,#0a3e4a)" onclick="sincronizarDonaciones('inicio')">🔄 Sincronizar</button>
            <span id="sync-info-inicio" style="font-size:12px; color:var(--muted); font-style:italic"></span>
        </div>
        <div id="sync-registro"></div>
    </div>`

    contenido.innerHTML = html

    // Cargar info de última sincronización
    fetch('/clan/sincronizar/info').then(r => r.json()).then(data => {
        const el = document.getElementById('sync-info-inicio')
        if (el && data.ultima_sincronizacion) {
            const fecha = new Date(data.ultima_sincronizacion).toLocaleString('es-AR')
            el.textContent = `Última sincronización: ${fecha}`
        }
        cargarRegistroDonaciones()
    }).catch(() => {})
}

// =================== TABS ANUNCIOS ===================
let autoSeleccionado = null

function switchTab(tab) {
    const manual = document.getElementById('panel-manual')
    const auto = document.getElementById('panel-auto')
    const btnManual = document.getElementById('tab-manual')
    const btnAuto = document.getElementById('tab-auto')
    if (tab === 'manual') {
        manual.style.display = 'block'; auto.style.display = 'none'
        btnManual.style.background = 'var(--accent)'; btnManual.style.color = '#fff8e8'
        btnAuto.style.background = 'rgba(160,128,64,0.1)'; btnAuto.style.color = 'var(--muted)'
    } else {
        manual.style.display = 'none'; auto.style.display = 'block'
        btnManual.style.background = 'rgba(160,128,64,0.1)'; btnManual.style.color = 'var(--muted)'
        btnAuto.style.background = 'var(--accent)'; btnAuto.style.color = '#fff8e8'
    }
}

function seleccionarAutoAnuncio(i) {
    ANUNCIOS_AUTO.forEach((_, idx) => {
        const el = document.getElementById(`auto-${idx}`)
        if (el) { el.style.background = 'rgba(255,252,235,0.5)'; el.style.borderColor = 'rgba(160,128,64,0.3)' }
    })
    const el = document.getElementById(`auto-${i}`)
    if (el) { el.style.background = 'rgba(196,122,42,0.15)'; el.style.borderColor = 'var(--accent)' }
    autoSeleccionado = i
}

function publicarAutoAnuncio() {
    if (autoSeleccionado === null) { mostrarToast('Seleccioná un mensaje primero', 'error'); return }
    enviarAnuncio(ANUNCIOS_AUTO[autoSeleccionado])
}

function publicarAnuncio() {
    const mensaje = document.getElementById('nuevoAnuncio').value.trim()
    if (!mensaje) { mostrarToast('Escribí un mensaje primero', 'error'); return }
    enviarAnuncio(mensaje)
}

function enviarAnuncio(mensaje) {
    fetch('/clan/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: mensaje })
    }).then(r => r.json()).then(data => {
        if (data.error) mostrarToast('Error: ' + data.error, 'error')
        else { mostrarToast('✓ Anuncio publicado!'); setTimeout(() => cargarInicio(), 1000) }
    }).catch(() => mostrarToast('Error al publicar', 'error'))
}

// =================== MIEMBROS ===================
function cargarMiembros() {
    const contenido = document.getElementById('contenido')
    contenido.innerHTML = `<h1>👥 Miembros</h1><p class="cargando">Cargando miembros...</p>`
    Promise.all([
        fetch('/clan/members').then(r => r.json()),
        fetch('/clan/carteras').then(r => r.json())
    ]).then(([members, carteras]) => {
        const membrosReales = members.filter(m => m.status !== 'invited')
        miembrosCache = membrosReales
        // Crear carteras para miembros que no tienen una todavía
        membrosReales.forEach(m => {
            if (!carteras[m.playerId]) {
                fetch(`/clan/carteras/${m.playerId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ oro: 0, gemas: 0, username: m.username, crear: true })
                }).catch(() => {})
                carteras[m.playerId] = { oro: 0, gemas: 0 }
            }
        })
        mostrarMiembros(membrosReales, carteras)
        cargarAvatares(membrosReales)
    }).catch(() => {
        contenido.innerHTML = `<h1>👥 Miembros</h1><div class="card"><p style="color:var(--muted)">Error al cargar miembros</p></div>`
    })
}

function cargarAvatares(members) {
    members.forEach(m => {
        const playerId = m.playerId
        if (!playerId) return
        fetch(`/clan/avatar/${playerId}`)
            .then(r => r.json())
            .then(data => {
                if (data.avatarUrl) {
                    const img = document.getElementById(`avatar-${playerId}`)
                    if (img) {
                        img.src = data.avatarUrl
                        img.style.display = 'block'
                        const placeholder = document.getElementById(`avatar-placeholder-${playerId}`)
                        if (placeholder) placeholder.style.display = 'none'
                    }
                }
            })
            .catch(() => {})
    })
}

function mostrarMiembros(members, carteras = {}) {
    const contenido = document.getElementById('contenido')
    if (!members || members.length === 0) {
        contenido.innerHTML = `<h1>👥 Miembros</h1><div class="card"><p style="color:var(--muted); font-style:italic">No hay miembros</p></div>`
        return
    }

    const orden = { 'LEADER': 0, 'CO_LEADER': 1, 'MEMBER': 2 }
    members.sort((a, b) => (orden[a.clanRole] ?? 3) - (orden[b.clanRole] ?? 3))

    let html = `<h1>👥 Miembros</h1>`

    // Panel de acciones masivas
    html += `
    <div class="card">
        <h3>⚡ Acciones masivas</h3>
        <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:flex-end; margin-bottom:16px">
            <button class="btn-primary" onclick="activarTodos(true)">✅ Activar todos</button>
            <button class="btn-primary" style="background:linear-gradient(180deg,#8b5e1a,#6b3e0a)" onclick="activarTodos(false)">❌ Desactivar todos</button>
        </div>
        <div style="padding-top:16px; border-top:1px solid rgba(160,128,64,0.2)">
            <p style="font-family:Cinzel,serif; font-size:11px; color:var(--muted); letter-spacing:1px; margin-bottom:12px">ACTIVAR POR CARTERA:</p>
            <div style="display:flex; flex-direction:column; gap:12px">
                <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center">
                    <span style="font-size:13px; color:var(--ink-light); min-width:16px">🥇</span>
                    <input type="number" id="filtroOro" placeholder="Oro mínimo (ej: 500)" min="0"
                        style="flex:1; min-width:160px; max-width:220px; padding:7px 10px; border-radius:var(--radius-sm); border:1px solid var(--parchment-shadow); background:rgba(255,252,235,0.8); color:var(--ink); font-family:Almendra,serif; font-size:14px; outline:none">
                    <button class="btn-primary" style="padding:7px 16px; font-size:11px; white-space:nowrap" onclick="activarConFiltro('oro')">✅ Activar con este oro</button>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center">
                    <span style="font-size:13px; color:var(--ink-light); min-width:16px">💎</span>
                    <input type="number" id="filtroGemas" placeholder="Gemas mínimas (ej: 10)" min="0"
                        style="flex:1; min-width:160px; max-width:220px; padding:7px 10px; border-radius:var(--radius-sm); border:1px solid var(--parchment-shadow); background:rgba(255,252,235,0.8); color:var(--ink); font-family:Almendra,serif; font-size:14px; outline:none">
                    <button class="btn-primary" style="padding:7px 16px; font-size:11px; white-space:nowrap" onclick="activarConFiltro('gemas')">✅ Activar con estas gemas</button>
                </div>
            </div>
        </div>
    </div>`


    html += `<div style="display:flex; flex-direction:column; gap:16px">`

    members.forEach(m => {
        const nivel = m.level === -1 ? '?' : (m.level || '?')
        const participa = m.participateInClanQuests !== false
        const cartera = carteras[m.playerId] || { oro: 0, gemas: 0 }
        const goldDonado = cartera.oro
        const gemsDonado = cartera.gemas
        const xpSemana = m.xpDurations?.week || 0
        const rolColor = m.clanRole === 'LEADER' ? '#c47a2a' : m.clanRole === 'CO_LEADER' ? '#9b5e1a' : 'var(--muted)'
        const rolTexto = m.clanRole === 'LEADER' ? '👑 Líder' : m.clanRole === 'CO_LEADER' ? '⭐ Co-líder' : '🐺 Miembro'

        html += `
        <div class="card" style="display:flex; gap:20px; align-items:flex-start; flex-wrap:wrap">
            <div style="flex-shrink:0; text-align:center">
                <img id="avatar-${m.playerId}" src="" alt="${m.username}"
                    style="display:none; width:80px; height:80px; object-fit:contain; border-radius:8px; border:2px solid var(--parchment-shadow); background:rgba(255,252,235,0.5)">
                <div id="avatar-placeholder-${m.playerId}"
                    style="width:80px; height:80px; border-radius:8px; border:2px solid var(--parchment-shadow); background:rgba(160,128,64,0.2); display:flex; align-items:center; justify-content:center; font-family:Cinzel,serif; font-size:22px; font-weight:700; color:var(--ink)">${(m.username || '?')[0].toUpperCase()}</div>
                <p style="font-size:10px; color:${rolColor}; margin-top:6px; font-family:Cinzel,serif; letter-spacing:0.5px">${rolTexto}</p>
            </div>

            <div style="flex:1; min-width:160px">
                <p style="font-family:Cinzel,serif; font-size:16px; font-weight:700; color:var(--ink); margin-bottom:4px">${m.username || 'N/A'}</p>
                <p style="font-size:13px; color:var(--muted); margin-bottom:12px">Nivel ${nivel} &nbsp;·&nbsp; XP semana: ${xpSemana}</p>

                <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px">
                    <span style="font-family:Cinzel,serif; font-size:11px; color:var(--ink-light); letter-spacing:0.5px">MISIÓN</span>
                    <div onclick="toggleParticipacion('${m.playerId}', ${participa})"
                         id="toggle-${m.playerId}"
                         style="width:44px; height:24px; border-radius:12px; background:${participa ? '#2d6a1e' : 'var(--muted)'}; cursor:pointer; position:relative; transition:background 0.3s; border:1px solid rgba(0,0,0,0.1); flex-shrink:0">
                        <div style="width:18px; height:18px; border-radius:50%; background:white; position:absolute; top:2px; left:${participa ? '22px' : '2px'}; transition:left 0.3s; box-shadow:0 1px 3px rgba(0,0,0,0.2)" id="toggle-ball-${m.playerId}"></div>
                    </div>
                    <span style="font-size:12px; color:${participa ? '#2d6a1e' : 'var(--muted)'}; font-style:italic" id="toggle-label-${m.playerId}">${participa ? 'Activo' : 'Inactivo'}</span>
                </div>

                <div style="background:rgba(255,252,235,0.5); border:1px solid rgba(160,128,64,0.3); border-radius:var(--radius-sm); padding:10px 14px">
                    <p style="font-family:Cinzel,serif; font-size:10px; color:var(--muted); letter-spacing:1px; margin-bottom:8px">CARTERA</p>
                    <div style="display:flex; gap:20px; flex-wrap:wrap; align-items:flex-end">
                        <div>
                            ${rolActual === 'admin'
                                ? `<div style="display:flex; align-items:center; gap:6px">
                                    <span style="font-size:16px">🥇</span>
                                    <input type="number" id="oro-${m.playerId}" value="${goldDonado}" min="0"
                                        style="width:90px; padding:4px 8px; border:1px solid var(--parchment-shadow); border-radius:3px; background:rgba(255,252,235,0.9); color:var(--ink); font-family:Cinzel,serif; font-size:15px; font-weight:700; color:var(--accent-dark)">
                                   </div>`
                                : `<span style="font-size:18px; font-weight:700; color:var(--accent-dark); font-family:Cinzel,serif">🥇 ${goldDonado}</span>`
                            }
                            <p style="font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:0.8px; margin-top:4px">Oro total</p>
                        </div>
                        <div>
                            ${rolActual === 'admin'
                                ? `<div style="display:flex; align-items:center; gap:6px">
                                    <span style="font-size:16px">💎</span>
                                    <input type="number" id="gemas-${m.playerId}" value="${gemsDonado}" min="0"
                                        style="width:90px; padding:4px 8px; border:1px solid var(--parchment-shadow); border-radius:3px; background:rgba(255,252,235,0.9); color:var(--ink); font-family:Cinzel,serif; font-size:15px; font-weight:700; color:#7b2da8">
                                   </div>`
                                : `<span style="font-size:18px; font-weight:700; color:#7b2da8; font-family:Cinzel,serif">💎 ${gemsDonado}</span>`
                            }
                            <p style="font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:0.8px; margin-top:4px">Gemas total</p>
                        </div>
                        ${rolActual === 'admin'
                            ? `<button class="btn-primary" style="padding:5px 12px; font-size:10px; margin-bottom:18px"
                                onclick="guardarCartera('${m.playerId}', '${m.username}')">💾 Guardar</button>`
                            : ''
                        }
                    </div>
                </div>
            </div>

            ${rolActual === 'admin' ? `<div style="flex-shrink:0">
                <button class="btn-tracker" onclick="agregarAlTracker('${m.playerId}', '${m.username}')">+ Tracker</button>
            </div>` : ''}
        </div>`
    })

    html += `</div>`
    contenido.innerHTML = html
}

function hexToRgb(hex) {
    if (!hex || hex.length < 7) return '160,128,64'
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `${r},${g},${b}`
}

function toggleParticipacion(playerId, estadoActual) {
    const nuevoEstado = !estadoActual
    const toggle = document.getElementById(`toggle-${playerId}`)
    const ball = document.getElementById(`toggle-ball-${playerId}`)
    const label = document.getElementById(`toggle-label-${playerId}`)

    toggle.style.background = nuevoEstado ? '#2d6a1e' : 'var(--muted)'
    ball.style.left = nuevoEstado ? '22px' : '2px'
    label.textContent = nuevoEstado ? 'Activo' : 'Inactivo'
    label.style.color = nuevoEstado ? '#2d6a1e' : 'var(--muted)'
    toggle.setAttribute('onclick', `toggleParticipacion('${playerId}', ${nuevoEstado})`)

    fetch(`/clan/members/${playerId}/participate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participateInQuests: nuevoEstado })
    }).then(r => r.json()).then(data => {
        if (data.error) {
            mostrarToast('Error: ' + data.error, 'error')
            toggle.style.background = estadoActual ? '#2d6a1e' : 'var(--muted)'
            ball.style.left = estadoActual ? '22px' : '2px'
            label.textContent = estadoActual ? 'Activo' : 'Inactivo'
            toggle.setAttribute('onclick', `toggleParticipacion('${playerId}', ${estadoActual})`)
        } else {
            mostrarToast('✓ Participación actualizada')
        }
    }).catch(() => mostrarToast('Error al actualizar', 'error'))
}

function activarTodos(participar) {
    fetch('/clan/members/all/participate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participateInQuests: participar })
    }).then(r => r.json()).then(data => {
        if (data.error) mostrarToast('Error: ' + data.error, 'error')
        else { mostrarToast(participar ? '✓ Todos activados' : '✓ Todos desactivados'); setTimeout(() => cargarMiembros(), 1000) }
    }).catch(() => mostrarToast('Error al actualizar', 'error'))
}

function activarConFiltro(tipo) {
    const minGold = tipo === 'oro' ? (parseInt(document.getElementById('filtroOro').value) || null) : null
    const minGems = tipo === 'gemas' ? (parseInt(document.getElementById('filtroGemas').value) || null) : null

    if (!minGold && !minGems) {
        mostrarToast('Ingresá un valor primero', 'error')
        return
    }

    fetch('/clan/members/all/participate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participateInQuests: true, minGold, minGems })
    }).then(r => r.json()).then(data => {
        if (data.error) mostrarToast('Error: ' + data.error, 'error')
        else { mostrarToast(`✓ ${data.actualizados} miembro(s) activados`); setTimeout(() => cargarMiembros(), 1000) }
    }).catch(() => mostrarToast('Error al actualizar', 'error'))
}

// =================== SINCRONIZAR ===================
function sincronizarDonaciones(origen = 'miembros') {
    const btnId = origen === 'inicio' ? 'btn-sincronizar-inicio' : 'btn-sincronizar'
    const infoId = origen === 'inicio' ? 'sync-info-inicio' : 'sync-info'
    const btn = document.getElementById(btnId)
    const info = document.getElementById(infoId)
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Sincronizando...' }

    fetch('/clan/sincronizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    }).then(r => r.json()).then(data => {
        if (data.error) {
            mostrarToast('Error: ' + data.error, 'error')
        } else {
            mostrarToast(`✓ ${data.mensaje}`)
            const ahora = new Date().toLocaleString('es-AR')
            if (info) info.textContent = `Última sincronización: ${ahora} · ${data.procesadas} cartera(s) actualizada(s)`
            if (origen === 'inicio') cargarRegistroDonaciones(new Date().toISOString())
        }
        if (btn) { btn.disabled = false; btn.textContent = '🔄 Sincronizar' }
    }).catch(() => {
        mostrarToast('Error al sincronizar', 'error')
        if (btn) { btn.disabled = false; btn.textContent = '🔄 Sincronizar' }
    })
}

function cargarRegistroDonaciones(desdefecha) {
    fetch('/clan/ledger').then(r => r.json()).then(ledger => {
        const el = document.getElementById('sync-registro')
        if (!el) return

        // Filtrar solo desde la fecha de inicio
        const FECHA_INICIO = '2026-03-17T00:00:00Z'
        const desde = FECHA_INICIO
        const recientes = ledger.filter(d => d.creationTime && d.creationTime >= desde)

        if (recientes.length === 0) {
            el.innerHTML = `<p style="color:var(--muted); font-style:italic; font-size:13px">No hay donaciones registradas desde el inicio del seguimiento.</p>`
            return
        }

        let html = `<table><tr><th>Jugador</th><th>Oro</th><th>Gemas</th><th>Fecha</th></tr>`
        recientes.slice(0, 50).forEach(d => {
            const fecha = d.creationTime ? d.creationTime.slice(0,10).split('-').reverse().join('-') : 'N/A'
            const hora = d.creationTime ? d.creationTime.slice(11,16) : ''
            html += `<tr>
                <td style="font-family:Cinzel,serif; font-weight:600">${d.playerUsername || 'N/A'}</td>
                <td>${d.gold ? `<span style="color:var(--accent-dark)">🥇 +${d.gold}</span>` : '—'}</td>
                <td>${d.gems ? `<span style="color:#7b2da8">💎 +${d.gems}</span>` : '—'}</td>
                <td style="font-size:12px; color:var(--muted)">${fecha} ${hora}</td>
            </tr>`
        })
        html += `</table>`
        el.innerHTML = html
    }).catch(() => {})
}

// =================== LOGS ===================
function cargarLogs() {
    fetch('/clan/logs').then(r => r.json()).then(mostrarLogs)
}

function mostrarLogs(logs) {
    const contenido = document.getElementById('contenido')
    let html = `<h1>📋 Actividad del clan</h1><div class="card">`
    if (!logs || logs.length === 0) {
        html += `<p style="color:var(--muted); font-style:italic">No hay actividad registrada</p>`
    } else {
        html += `<table><tr><th>Fecha</th><th>Evento</th><th>Jugador</th></tr>`
        logs.forEach(l => {
            const fecha = l.creationTime ? l.creationTime.slice(0, 10).split('-').reverse().join('-') : 'N/A'
            html += `<tr><td>${fecha}</td><td>${l.action || 'N/A'}</td><td>${l.playerUsername || 'N/A'}</td></tr>`
        })
        html += `</table>`
    }
    html += `</div>`
    contenido.innerHTML = html
}

// =================== STATS ===================
function cargarStats() {
    document.getElementById('contenido').innerHTML = `
        <h1>📊 Estadísticas</h1>
        <div class="card"><p style="color:var(--muted); font-style:italic">Próximamente...</p></div>`
}

// =================== TRACKER ===================
function agregarAlTracker(id, nombre) {
    fetch(`/buscarid?id=${encodeURIComponent(id)}`)
        .then(r => r.json())
        .then(data => {
            if (data.error) mostrarToast('Error: ' + data.error, 'error')
            else mostrarToast(`✓ ${nombre} agregado al tracker!`)
        })
}

// =================== SESIÓN Y ADMIN ===================
let rolActual = null

async function cargarSesion() {
    // Ping de actividad cada 2 minutos
    setInterval(() => fetch('/auth/ping').catch(() => {}), 2 * 60 * 1000)
    const res = await fetch('/auth/me')
    if (res.status === 401) {
        window.location.href = '/'
        return
    }
    const data = await res.json()
    rolActual = data.rol

    // Mostrar nombre de usuario y botón logout en sidebar
    const footer = document.querySelector('.sidebar-footer')
    if (footer) {
        footer.innerHTML = `
            <p style="color:rgba(160,128,80,0.6); font-size:10px; margin-bottom:8px">${data.username}</p>
            ${data.rol === 'admin' ? '<p style="color:var(--accent); font-size:9px; letter-spacing:1px; margin-bottom:10px">✦ ADMIN ✦</p>' : ''}
            <button onclick="cerrarSesion()" style="width:100%; padding:7px; background:transparent; color:rgba(160,100,60,0.6); border:1px solid rgba(160,100,60,0.2); border-radius:2px; cursor:pointer; font-family:Cinzel,serif; font-size:9px; letter-spacing:1px; transition:all 0.2s"
                onmouseover="this.style.background='rgba(139,32,16,0.15)'; this.style.color='#c87060'"
                onmouseout="this.style.background='transparent'; this.style.color='rgba(160,100,60,0.6)'">
                Cerrar sesión
            </button>
        `
    }

    // Mostrar/ocultar botón Tracker según rol
    const btnTracker = document.getElementById('btn-tracker')
    if (btnTracker) {
        if (data.rol !== 'admin') btnTracker.style.display = 'none'
    }

    // Agregar botón Admin en nav si es admin
    if (data.rol === 'admin') {
        const navSection = document.querySelector('.nav-section')
        if (navSection && !document.getElementById('btn-admin')) {
            const btn = document.createElement('button')
            btn.className = 'nav-btn'
            btn.id = 'btn-admin'
            btn.innerHTML = '<span class="nav-icon">🛡️</span> Admin'
            btn.onclick = function() { mostrarSeccion('admin', this) }
            navSection.appendChild(btn)
        }
    }
}

async function cerrarSesion() {
    await fetch('/auth/logout', { method: 'POST' })
    window.location.href = '/'
}

// =================== PANEL ADMIN ===================
function cargarAdmin() {
    if (rolActual !== 'admin') {
        document.getElementById('contenido').innerHTML = `<h1>🛡️ Admin</h1><div class="card"><p style="color:var(--muted)">Sin permisos</p></div>`
        return
    }
    document.getElementById('contenido').innerHTML = `<h1>🛡️ Panel de administración</h1><p class="cargando">Cargando usuarios...</p>`
    fetch('/admin/usuarios')
        .then(r => r.json())
        .then(mostrarAdmin)
}

function estaConectado(ultimaActividad) {
    if (!ultimaActividad) return false
    const hace = (Date.now() - new Date(ultimaActividad).getTime()) / 1000 / 60
    return hace < 5 // conectado si activo en los últimos 5 minutos
}

function mostrarAdmin(usuarios) {
    const contenido = document.getElementById('contenido')
    let html = `<h1>🛡️ Panel de administración</h1>`

    const pendientes = usuarios.filter(u => !u.aprobado)
    const aprobados = usuarios.filter(u => u.aprobado)

    if (pendientes.length > 0) {
        html += `<div class="card"><h3>⏳ Solicitudes pendientes</h3>`
        pendientes.forEach(u => {
            html += `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid rgba(160,128,64,0.2); flex-wrap:wrap; gap:10px">
                <div>
                    <span style="font-family:Cinzel,serif; font-weight:600; color:var(--ink)">${u.username}</span>
                    <span style="font-size:12px; color:var(--muted); margin-left:8px">${u.created_at ? u.created_at.slice(0,10) : ''}</span>
                </div>
                <div style="display:flex; gap:8px">
                    <button class="btn-primary" style="padding:6px 14px; font-size:10px" onclick="gestionarUsuario(${u.id}, true)">✓ Aprobar</button>
                    <button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#8b2010,#6b1008)" onclick="eliminarUsuarioAdmin(${u.id}, '${u.username}')">✗ Rechazar</button>
                </div>
            </div>`
        })
        html += `</div>`
    } else {
        html += `<div class="card"><p style="color:var(--muted); font-style:italic">No hay solicitudes pendientes ✓</p></div>`
    }

    html += `<div class="card"><h3>👥 Usuarios aprobados</h3>`
    if (aprobados.length === 0) {
        html += `<p style="color:var(--muted); font-style:italic">No hay usuarios aprobados aún</p>`
    } else {
        aprobados.forEach(u => {
            const esAdmin = u.rol === 'admin'
            const conectado = estaConectado(u.ultima_actividad)
            const luz = conectado
                ? `<span title="Conectado" style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#2d6a1e; box-shadow:0 0 6px #2d6a1e; margin-right:8px; flex-shrink:0"></span>`
                : `<span title="Desconectado" style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#8b2010; box-shadow:0 0 4px #8b2010; margin-right:8px; flex-shrink:0"></span>`
            html += `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid rgba(160,128,64,0.2); flex-wrap:wrap; gap:10px">
                <div style="display:flex; align-items:center">
                    ${luz}
                    <span style="font-family:Cinzel,serif; font-weight:600; color:var(--ink)">${u.username}</span>
                    ${esAdmin ? '<span style="font-size:10px; color:var(--accent); margin-left:8px; font-family:Cinzel,serif">ADMIN</span>' : ''}
                    <span style="font-size:11px; color:var(--muted); margin-left:10px; font-style:italic">${conectado ? 'En línea' : (u.ultima_actividad ? 'Última vez: ' + new Date(u.ultima_actividad).toLocaleString('es-AR') : 'Nunca')}</span>
                </div>
                ${!esAdmin ? `<button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#8b2010,#6b1008)" onclick="eliminarUsuarioAdmin(${u.id}, '${u.username}')">Revocar acceso</button>` : ''}
            </div>`
        })
    }
    html += `</div>`
    contenido.innerHTML = html
}

function gestionarUsuario(id, aprobar) {
    fetch(`/admin/usuarios/${id}/aprobar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aprobado: aprobar })
    }).then(r => r.json()).then(data => {
        if (data.ok) { mostrarToast(aprobar ? '✓ Usuario aprobado' : '✓ Usuario desactivado'); cargarAdmin() }
        else mostrarToast('Error: ' + data.error, 'error')
    })
}

function eliminarUsuarioAdmin(id, nombre) {
    if (!confirm(`¿Eliminar a ${nombre}?`)) return
    fetch(`/admin/usuarios/${id}`, { method: 'DELETE' })
        .then(r => r.json())
        .then(data => {
            if (data.ok) { mostrarToast(`✓ ${nombre} eliminado`); cargarAdmin() }
            else mostrarToast('Error: ' + data.error, 'error')
        })
}

// =================== CARTERAS ===================
function guardarCartera(playerId, username) {
    const oro = parseInt(document.getElementById(`oro-${playerId}`).value) || 0
    const gemas = parseInt(document.getElementById(`gemas-${playerId}`).value) || 0
    fetch(`/clan/carteras/${playerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oro, gemas, username, crear: true })
    }).then(r => r.json()).then(data => {
        if (data.ok) mostrarToast('✓ Cartera guardada')
        else mostrarToast('Error: ' + data.error, 'error')
    }).catch(() => mostrarToast('Error al guardar', 'error'))
}
