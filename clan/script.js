let seccionActual = 'inicio'

// Mensajes pregrabados para anuncios automáticos
const ANUNCIOS_AUTO = [
    "¡Ya están las nuevas misiones para votar! Recuerden que tienen 12 horas para participar en la votación.",
    "¡La misión de la semana ha comenzado! Tienen hasta el domingo para completarla. ¡Mucho éxito a todos!",
    "Recordatorio: donen oro o gemas al clan para mantener los recursos. ¡Gracias a todos por su apoyo!",
    "¡Felicitaciones al clan por completar la misión! Los premios serán entregados en breve.",
]

window.onload = function() {
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
    if (btn) {
        btn.classList.add('activo')
    } else {
        document.querySelectorAll('.nav-btn')[0].classList.add('activo')
    }
    const contenido = document.getElementById('contenido')
    contenido.innerHTML = "<p class='cargando'>Cargando...</p>"
    if (seccion === 'inicio') cargarInicio()
    else if (seccion === 'miembros') cargarMiembros()
    else if (seccion === 'logs') cargarLogs()
    else if (seccion === 'stats') cargarStats()
}

// =================== INICIO ===================
function cargarInicio() {
    Promise.all([
        fetch('/clan/info').then(r => r.json()),
        fetch('/clan/quests').then(r => r.json()),
        fetch('/clan/announcements').then(r => r.json()),
        fetch('/clan/ledger').then(r => r.json())
    ]).then(([info, quests, anuncios, ledger]) => {
        mostrarInicio(info, quests, anuncios, ledger)
    })
}

function mostrarInicio(info, quests, anuncios, ledger) {
    const contenido = document.getElementById('contenido')

    // Título
    let html = `<h1>${info.name || 'Clan'} <span class="tag">${info.tag || ''}</span></h1>`

    // Descripción del clan
    html += `
        <div class="card">
            <h3>📜 Descripción</h3>
            <p style="font-size:15px; line-height:1.7">${(info.description || 'Sin descripción').replace(/\n/g, '<br>')}</p>
        </div>
    `

    // Stats generales
    html += `
        <div class="grid">
            <div class="stat">
                <div class="stat-valor">${info.memberCount || 0}</div>
                <div class="stat-label">Miembros</div>
            </div>
            <div class="stat">
                <div class="stat-valor">${info.xp || 0}</div>
                <div class="stat-label">XP Total</div>
            </div>
            <div class="stat">
                <div class="stat-valor">${info.language || 'N/A'}</div>
                <div class="stat-label">Idioma</div>
            </div>
            <div class="stat">
                <div class="stat-valor">${info.minLevel || 0}</div>
                <div class="stat-label">Nivel mínimo</div>
            </div>
        </div>
    `

    // Recursos del clan
    html += `
        <div class="card" style="margin-top:16px">
            <h3>💰 Recursos del clan</h3>
            <div class="grid">
                <div class="stat">
                    <div class="stat-valor">🥇 ${info.gold || 0}</div>
                    <div class="stat-label">Oro</div>
                </div>
                <div class="stat">
                    <div class="stat-valor">💎 ${info.gems || 0}</div>
                    <div class="stat-label">Gemas</div>
                </div>
                <div class="stat">
                    <div class="stat-valor">🥇 ${info.goldReserve || 0}</div>
                    <div class="stat-label">Reserva de oro</div>
                </div>
                <div class="stat">
                    <div class="stat-valor">💎 ${info.gemsReserve || 0}</div>
                    <div class="stat-label">Reserva de gemas</div>
                </div>
            </div>
        </div>
    `

    // Misión activa
    html += `<div class="card"><h3>⚔️ Misión activa</h3>`
    if (quests && quests.quest) {
        const progreso = quests.currentValue || 0
        const objetivo = quests.quest.targetValue || 1
        const pct = Math.min(100, Math.round((progreso / objetivo) * 100))
        html += `
            <p style="margin-bottom:8px"><b>${quests.quest.name || 'N/A'}</b></p>
            <div style="background:rgba(160,128,64,0.2); border-radius:6px; height:10px; overflow:hidden; margin:10px 0; border:1px solid rgba(160,128,64,0.3)">
                <div style="background:var(--accent); width:${pct}%; height:100%; border-radius:6px; transition:width 0.5s"></div>
            </div>
            <p style="font-size:14px; color:var(--muted)">${progreso} / ${objetivo} &nbsp;·&nbsp; Recompensa: ${quests.quest.goldReward || 0} 🥇</p>
        `
    } else {
        html += `<p style="color:var(--muted); font-style:italic">No hay misión activa</p>`
    }
    html += `</div>`

    // Anuncios - tabs Manual / Automático
    html += `
        <div class="card">
            <h3>📢 Anuncios</h3>
            <div style="display:flex; gap:0; margin-bottom:16px; border:1px solid var(--border); border-radius:var(--radius-sm); overflow:hidden; width:fit-content">
                <button id="tab-manual" onclick="switchTab('manual')" style="padding:8px 20px; border:none; cursor:pointer; font-family:Cinzel,serif; font-size:11px; letter-spacing:1px; background:var(--accent); color:#fff8e8; transition:all 0.2s">Manual</button>
                <button id="tab-auto" onclick="switchTab('auto')" style="padding:8px 20px; border:none; cursor:pointer; font-family:Cinzel,serif; font-size:11px; letter-spacing:1px; background:rgba(160,128,64,0.1); color:var(--muted); transition:all 0.2s">Automático</button>
            </div>

            <div id="panel-manual">
                <textarea id="nuevoAnuncio" placeholder="Escribí tu anuncio acá..."></textarea>
                <button class="btn-primary" onclick="publicarAnuncio()">📢 Publicar</button>
            </div>

            <div id="panel-auto" style="display:none">
                <p style="font-size:14px; color:var(--muted); margin-bottom:12px; font-style:italic">Seleccioná un mensaje pregrabado para publicar:</p>
                ${ANUNCIOS_AUTO.map((msg, i) => `
                    <div style="background:rgba(255,252,235,0.5); border:1px solid rgba(160,128,64,0.3); border-radius:var(--radius-sm); padding:12px 14px; margin-bottom:8px; cursor:pointer; transition:all 0.2s" onclick="seleccionarAutoAnuncio(${i})" id="auto-${i}">
                        <p style="font-size:14px; color:var(--ink-light)">${msg}</p>
                    </div>
                `).join('')}
                <button class="btn-primary" style="margin-top:8px" onclick="publicarAutoAnuncio()">📢 Publicar seleccionado</button>
            </div>
        </div>
    `

    // Historial de anuncios
    html += `<div class="card"><h3>📜 Historial de anuncios</h3>`
    if (anuncios && anuncios.length > 0) {
        anuncios.slice(0, 5).forEach(a => {
            const fecha = a.timestamp ? a.timestamp.slice(0, 10).split('-').reverse().join('-') : 'N/A'
            html += `
                <div class="anuncio">
                    <span class="anuncio-autor">${a.author || 'N/A'}</span>
                    <span class="anuncio-fecha">${fecha}</span>
                    <p class="anuncio-msg">${(a.content || '').replace(/\n/g, '<br>')}</p>
                </div>
            `
        })
    } else {
        html += `<p style="color:var(--muted); font-style:italic">No hay anuncios</p>`
    }
    html += `</div>`

    // Donaciones recientes
    html += `<div class="card"><h3>🏦 Donaciones recientes</h3>`
    if (ledger && ledger.length > 0) {
        html += `<table>
            <tr><th>Jugador</th><th>Tipo</th><th>Cantidad</th><th>Fecha</th></tr>`
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

    contenido.innerHTML = html
}

// =================== TABS ANUNCIOS ===================
let autoSeleccionado = null

function switchTab(tab) {
    const manual = document.getElementById('panel-manual')
    const auto = document.getElementById('panel-auto')
    const btnManual = document.getElementById('tab-manual')
    const btnAuto = document.getElementById('tab-auto')

    if (tab === 'manual') {
        manual.style.display = 'block'
        auto.style.display = 'none'
        btnManual.style.background = 'var(--accent)'
        btnManual.style.color = '#fff8e8'
        btnAuto.style.background = 'rgba(160,128,64,0.1)'
        btnAuto.style.color = 'var(--muted)'
    } else {
        manual.style.display = 'none'
        auto.style.display = 'block'
        btnManual.style.background = 'rgba(160,128,64,0.1)'
        btnManual.style.color = 'var(--muted)'
        btnAuto.style.background = 'var(--accent)'
        btnAuto.style.color = '#fff8e8'
    }
}

function seleccionarAutoAnuncio(i) {
    // Deseleccionar todos
    ANUNCIOS_AUTO.forEach((_, idx) => {
        const el = document.getElementById(`auto-${idx}`)
        if (el) {
            el.style.background = 'rgba(255,252,235,0.5)'
            el.style.borderColor = 'rgba(160,128,64,0.3)'
        }
    })
    // Seleccionar el elegido
    const el = document.getElementById(`auto-${i}`)
    if (el) {
        el.style.background = 'rgba(196,122,42,0.15)'
        el.style.borderColor = 'var(--accent)'
    }
    autoSeleccionado = i
}

function publicarAutoAnuncio() {
    if (autoSeleccionado === null) {
        mostrarToast('Seleccioná un mensaje primero', 'error')
        return
    }
    const mensaje = ANUNCIOS_AUTO[autoSeleccionado]
    enviarAnuncio(mensaje)
}

// =================== PUBLICAR ANUNCIO ===================
function publicarAnuncio() {
    const mensaje = document.getElementById('nuevoAnuncio').value.trim()
    if (!mensaje) {
        mostrarToast('Escribí un mensaje primero', 'error')
        return
    }
    enviarAnuncio(mensaje)
}

function enviarAnuncio(mensaje) {
    fetch('/clan/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: mensaje })
    })
    .then(r => r.json())
    .then(data => {
        if (data.error) {
            mostrarToast('Error: ' + data.error, 'error')
        } else {
            mostrarToast('✓ Anuncio publicado!')
            setTimeout(() => cargarInicio(), 1000)
        }
    })
    .catch(() => mostrarToast('Error al publicar', 'error'))
}

// =================== MIEMBROS ===================
function cargarMiembros() {
    fetch('/clan/members').then(r => r.json()).then(mostrarMiembros)
}

function mostrarMiembros(members) {
    const contenido = document.getElementById('contenido')
    let html = `<h1>👥 Miembros</h1>`
    if (!members || members.length === 0) {
        html += `<div class="card"><p style="color:var(--muted); font-style:italic">No hay miembros</p></div>`
        contenido.innerHTML = html
        return
    }
    html += `<div class="card"><table>
        <tr><th>Nombre</th><th>Rango</th><th>Nivel</th><th>XP donado</th><th>Oro donado</th><th>Gemas donadas</th><th></th></tr>`
    members.forEach(m => {
        const nivel = m.level === -1 ? 'Oculto' : (m.level || 'N/A')
        html += `<tr>
            <td><b>${m.username || 'N/A'}</b></td>
            <td>${m.clanRole || 'N/A'}</td>
            <td>${nivel}</td>
            <td>${m.xpDonated || 0}</td>
            <td>${m.goldDonated || 0}</td>
            <td>${m.gemsDonated || 0}</td>
            <td><button class="btn-tracker" onclick="agregarAlTracker('${m.playerId}', '${m.username}')">+ Tracker</button></td>
        </tr>`
    })
    html += `</table></div>`
    contenido.innerHTML = html
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
        html += `<table>
            <tr><th>Fecha</th><th>Evento</th><th>Jugador</th></tr>`
        logs.forEach(l => {
            const fecha = l.creationTime ? l.creationTime.slice(0, 10).split('-').reverse().join('-') : 'N/A'
            html += `<tr>
                <td>${fecha}</td>
                <td>${l.action || 'N/A'}</td>
                <td>${l.playerUsername || 'N/A'}</td>
            </tr>`
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
        <div class="card">
            <p style="color:var(--muted); font-style:italic">Próximamente...</p>
        </div>`
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
