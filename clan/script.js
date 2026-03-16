let seccionActual = 'inicio'

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

    let html = `
        <h1>${info.name || 'Clan'} <span class="tag">${info.tag || ''}</span></h1>
        <div class="card">
            <p style="color:#a0a3b8; font-size:15px">${(info.description || 'Sin descripción').replace(/\n/g, '<br>')}</p>
        </div>
        <div class="grid">
            <div class="stat">
                <div class="stat-valor">${info.memberCount || 0}</div>
                <div class="stat-label">Miembros</div>
            </div>
            <div class="stat">
                <div class="stat-valor">${info.gold || 0}</div>
                <div class="stat-label">Oro</div>
            </div>
            <div class="stat">
                <div class="stat-valor">${info.xp || 0}</div>
                <div class="stat-label">XP Total</div>
            </div>
            <div class="stat">
                <div class="stat-valor">${info.language || 'N/A'}</div>
                <div class="stat-label">Idioma</div>
            </div>
        </div>
    `

    // Misión activa
    html += `<div class="card" style="margin-top:16px"><h3>⚔️ Misión activa</h3>`
    if (quests && quests.quest) {
        const progreso = quests.currentValue || 0
        const objetivo = quests.quest.targetValue || 1
        const pct = Math.min(100, Math.round((progreso / objetivo) * 100))
        html += `
            <p style="margin-bottom:8px"><span style="color:#a0a3b8">Misión:</span> <b>${quests.quest.name || 'N/A'}</b></p>
            <div style="background:#1e2035; border-radius:6px; height:8px; overflow:hidden; margin:10px 0">
                <div style="background:#e94560; width:${pct}%; height:100%; border-radius:6px; transition:width 0.5s"></div>
            </div>
            <p style="font-size:13px; color:#7b7f96">${progreso} / ${objetivo} &nbsp;·&nbsp; Recompensa: ${quests.quest.goldReward || 0} oro</p>
        `
    } else {
        html += `<p style="color:#7b7f96">No hay misión activa</p>`
    }
    html += `</div>`

    // Publicar anuncio
    html += `
        <div class="card">
            <h3>📝 Publicar anuncio</h3>
            <textarea id="nuevoAnuncio" placeholder="Escribí tu anuncio acá..."></textarea>
            <button class="btn-primary" onclick="publicarAnuncio()">📢 Publicar</button>
        </div>
    `

    // Anuncios existentes
    html += `<div class="card"><h3>📢 Anuncios</h3>`
    if (anuncios && anuncios.length > 0) {
        anuncios.slice(0, 5).forEach(a => {
            const fecha = a.timestamp ? a.timestamp.slice(0, 10).split('-').reverse().join('-') : 'N/A'
            html += `
                <div class="anuncio">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px">
                        <div>
                            <span class="anuncio-autor">${a.author || 'N/A'}</span>
                            <span class="anuncio-fecha">${fecha}</span>
                        </div>
                        <div style="display:flex; gap:6px">
                            <button class="btn-tracker" onclick="editarAnuncio('${a.id}', this)">✏️ Editar</button>
                            <button class="btn-tracker" style="color:#8b2010; border-color:#8b2010" onclick="eliminarAnuncio('${a.id}')">🗑 Eliminar</button>
                        </div>
                    </div>
                    <p class="anuncio-msg" id="anuncio-msg-${a.id}">${(a.content || '').replace(/\n/g, '<br>')}</p>
                </div>
            `
        })
    } else {
        html += `<p style="color:#7b7f96">No hay anuncios</p>`
    }
    html += `</div>`

    // Donaciones
    html += `<div class="card"><h3>💰 Donaciones recientes</h3>`
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
        html += `<p style="color:#7b7f96">No hay donaciones registradas</p>`
    }
    html += `</div>`

    contenido.innerHTML = html
}

// =================== PUBLICAR ANUNCIO ===================
function publicarAnuncio() {
    const mensaje = document.getElementById('nuevoAnuncio').value.trim()
    if (!mensaje) {
        mostrarToast('Escribí un mensaje primero', 'error')
        return
    }
    const btn = document.querySelector('#contenido .btn-primary')
    btn.disabled = true
    btn.textContent = 'Publicando...'

    fetch('/clan/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: mensaje })
    })
    .then(r => r.json())
    .then(data => {
        if (data.error) {
            mostrarToast('Error: ' + data.error, 'error')
            btn.disabled = false
            btn.textContent = '📢 Publicar'
        } else {
            mostrarToast('✓ Anuncio publicado!')
            document.getElementById('nuevoAnuncio').value = ''
            btn.disabled = false
            btn.textContent = '📢 Publicar'
            // Recargar inicio para ver el nuevo anuncio
            setTimeout(() => cargarInicio(), 1000)
        }
    })
    .catch(() => {
        mostrarToast('Error al publicar', 'error')
        btn.disabled = false
        btn.textContent = '📢 Publicar'
    })
}

// =================== MIEMBROS ===================
function cargarMiembros() {
    fetch('/clan/members').then(r => r.json()).then(mostrarMiembros)
}

function mostrarMiembros(members) {
    const contenido = document.getElementById('contenido')
    let html = `<h1>👥 Miembros</h1>`
    if (!members || members.length === 0) {
        html += `<div class="card"><p style="color:#7b7f96">No hay miembros</p></div>`
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
        html += `<p style="color:#7b7f96">No hay actividad registrada</p>`
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
            <p style="color:#7b7f96">Próximamente...</p>
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

// ============== EDITAR ANUNCIOS ===================
function editarAnuncio(id, btn) {
    const p = document.getElementById(`anuncio-msg-${id}`)
    const textoActual = p.innerText
    p.outerHTML = `
        <textarea id="edit-${id}" style="width:100%; margin-top:8px; padding:8px; font-family:Almendra,serif; font-size:15px; border:1px solid var(--border); background:rgba(255,252,235,0.8); color:var(--ink); border-radius:3px; resize:vertical">${textoActual}</textarea>
        <button class="btn-primary" style="margin-top:8px" onclick="guardarEdicionAnuncio('${id}')">💾 Guardar</button>
    `
}

function guardarEdicionAnuncio(id) {
    const texto = document.getElementById(`edit-${id}`).value.trim()
    if (!texto) return
    fetch(`/clan/announcements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: texto })
    })
    .then(r => r.json())
    .then(data => {
        if (data.error) mostrarToast('Error: ' + data.error, 'error')
        else { mostrarToast('✓ Anuncio editado!'); setTimeout(() => cargarInicio(), 1000) }
    })
}

function eliminarAnuncio(id) {
    if (!confirm('¿Eliminar este anuncio?')) return
    fetch(`/clan/announcements/${id}`, { method: 'DELETE' })
    .then(r => r.json())
    .then(data => {
        if (data.error) mostrarToast('Error: ' + data.error, 'error')
        else { mostrarToast('✓ Anuncio eliminado!'); setTimeout(() => cargarInicio(), 1000) }
    })
}