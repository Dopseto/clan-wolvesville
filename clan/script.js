// Sección activa
let seccionActual = 'inicio'

window.onload = function() {
    mostrarSeccion('inicio')
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
    fetch('/clan/info')
        .then(r => r.json())
        .then(info => {
            fetch('/clan/quests')
                .then(r => r.json())
                .then(quests => {
                    fetch('/clan/announcements')
                        .then(r => r.json())
                        .then(anuncios => {
                            fetch('/clan/ledger')
                                .then(r => r.json())
                                .then(ledger => {
                                    mostrarInicio(info, quests, anuncios, ledger)
                                })
                        })
                })
        })
}

function mostrarInicio(info, quests, anuncios, ledger) {
    const contenido = document.getElementById('contenido')

    // Info general
    let html = `
        <h1>${info.name || 'Clan'} <span class="tag">${info.tag || ''}</span></h1>
        <div class="card">
            <p>${info.description || 'Sin descripción'}</p>
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
    html += `<div class="card"><h3>⚔️ Misión activa</h3>`
    if (quests && quests.quest) {
        html += `
            <p><b>Misión:</b> ${quests.quest.name || 'N/A'}</p>
            <p><b>Progreso:</b> ${quests.currentValue || 0} / ${quests.quest.targetValue || 0}</p>
            <p><b>Recompensa:</b> ${quests.quest.goldReward || 0} oro</p>
        `
    } else {
        html += `<p>No hay misión activa</p>`
    }
    html += `</div>`

    // Anuncios
    html += `<div class="card"><h3>📢 Anuncios</h3>`
    if (anuncios && anuncios.length > 0) {
        anuncios.slice(0, 5).forEach(a => {
            const fecha = a.creationTime ? a.creationTime.slice(0, 10).split('-').reverse().join('-') : 'N/A'
            html += `
                <div style="border-bottom: 1px solid #0f3460; padding: 10px 0">
                    <p><b>${a.author || 'N/A'}</b> <span style="color:#aaa; font-size:12px">${fecha}</span></p>
                    <p>${a.message || ''}</p>
                </div>
            `
        })
    } else {
        html += `<p>No hay anuncios</p>`
    }
    html += `</div>`

    // Donaciones
    html += `<div class="card"><h3>💰 Registro de donaciones</h3>`
    if (ledger && ledger.length > 0) {
        html += `
            <table>
                <tr>
                    <th>Jugador</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Fecha</th>
                </tr>
        `
        ledger.slice(0, 20).forEach(d => {
            const fecha = d.creationTime ? d.creationTime.slice(0, 10).split('-').reverse().join('-') : 'N/A'
            html += `
                <tr>
                    <td>${d.username || 'N/A'}</td>
                    <td>${d.type || 'N/A'}</td>
                    <td>${d.amount || 0}</td>
                    <td>${fecha}</td>
                </tr>
            `
        })
        html += `</table>`
    } else {
        html += `<p>No hay donaciones registradas</p>`
    }
    html += `</div>`

    contenido.innerHTML = html
}

// =================== MIEMBROS ===================
function cargarMiembros() {
    fetch('/clan/members')
        .then(r => r.json())
        .then(members => {
            mostrarMiembros(members)
        })
}

function mostrarMiembros(members) {
    const contenido = document.getElementById('contenido')

    let html = `<h1>👥 Miembros</h1>`

    if (!members || members.length === 0) {
        html += `<div class="card"><p>No hay miembros</p></div>`
        contenido.innerHTML = html
        return
    }

    html += `
        <div class="card">
            <table>
                <tr>
                    <th>Nombre</th>
                    <th>Rango</th>
                    <th>Nivel</th>
                    <th>XP donado</th>
                    <th>Oro donado</th>
                    <th>Acción</th>
                </tr>
    `

    members.forEach(m => {
        const nivel = m.level === -1 ? 'Oculto' : (m.level || 'N/A')
        html += `
            <tr>
                <td>${m.username || 'N/A'}</td>
                <td>${m.clanRole || 'N/A'}</td>
                <td>${nivel}</td>
                <td>${m.xpDonated || 0}</td>
                <td>${m.goldDonated || 0}</td>
                <td><button onclick="agregarAlTracker('${m.playerId}', '${m.username}')">+ Tracker</button></td>
            </tr>
        `
    })

    html += `</table></div>`
    contenido.innerHTML = html
}

// =================== LOGS ===================
function cargarLogs() {
    fetch('/clan/logs')
        .then(r => r.json())
        .then(logs => {
            mostrarLogs(logs)
        })
}

function mostrarLogs(logs) {
    const contenido = document.getElementById('contenido')

    let html = `<h1>📋 Historial de actividad</h1><div class="card">`

    if (!logs || logs.length === 0) {
        html += `<p>No hay actividad registrada</p>`
    } else {
        html += `<table>
            <tr>
                <th>Fecha</th>
                <th>Evento</th>
                <th>Jugador</th>
            </tr>`
        logs.forEach(l => {
            const fecha = l.creationTime ? l.creationTime.slice(0, 10).split('-').reverse().join('-') : 'N/A'
            html += `
                <tr>
                    <td>${fecha}</td>
                    <td>${l.type || 'N/A'}</td>
                    <td>${l.username || 'N/A'}</td>
                </tr>
            `
        })
        html += `</table>`
    }

    html += `</div>`
    contenido.innerHTML = html
}

// =================== STATS ===================
function cargarStats() {
    const contenido = document.getElementById('contenido')
    contenido.innerHTML = `
        <h1>📊 Estadísticas</h1>
        <div class="card">
            <p>Próximamente...</p>
        </div>
    `
}

// =================== AGREGAR AL TRACKER ===================
function agregarAlTracker(id, nombre) {
    fetch(`/buscarid?id=${encodeURIComponent(id)}`)
        .then(r => r.json())
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error)
            } else {
                alert(`✓ ${nombre} agregado al tracker!`)
            }
        })
}