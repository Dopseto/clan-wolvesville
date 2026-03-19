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
        fetch('/clan/ledger').then(r => r.json()),
        fetch('/clan/quests/available').then(r => r.json()),
        fetch('/clan/quests/votes').then(r => r.json())
    ]).then(([info, quests, anuncios, ledger, available, votes]) => mostrarInicio(info, quests, anuncios, ledger, available, votes))
}

function mostrarInicio(info, quests, anuncios, ledger, available, votes) {
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

    // ANUNCIOS
    html += `<div class="card"><h3>📢 Anuncios</h3>
        ${(rolActual === 'admin' || rolActual === 'lider') ? `
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
        </div>` : ''}
    </div>`

    // HISTORIAL DE ANUNCIOS con scroll
    html += `<div class="card"><h3>📜 Historial de anuncios</h3>
        <div style="max-height:280px; overflow-y:auto; padding-right:4px">`
    if (anuncios && anuncios.length > 0) {
        anuncios.slice(0, 10).forEach(a => {
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
    html += `</div></div>`

    // MISIÓN ACTIVA
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

    // MISIONES DISPONIBLES
    html += `<div class="card"><h3>🗳️ Misiones disponibles</h3>`
    if (available && available.length > 0) {
        const votosMap = votes && votes.votes ? votes.votes : {}
        html += `<div style="display:flex; flex-wrap:wrap; gap:14px; justify-content:flex-start">`
        available.forEach(q => {
            const qid = q.id
            const votantes = votosMap[qid] ? votosMap[qid].length : 0
            const esPorGemas = q.purchasableWithGems === true
            const costoLabel = esPorGemas ? `💎 Gemas` : `🥇 Oro`
            const imagen = q.promoImageUrl || ''
            html += `
            <div id="quest-card-${qid}"
                style="display:flex; flex-direction:column; align-items:center; gap:8px; padding:12px; background:rgba(255,252,235,0.5); border:2px solid rgba(160,128,64,0.3); border-radius:var(--radius-sm); cursor:pointer; transition:all 0.2s; width:130px"
                onclick="seleccionarMision('${qid}')"
                onmouseover="if(!this.classList.contains('selected')) { this.style.borderColor='var(--accent)'; this.style.background='rgba(196,122,42,0.08)' }"
                onmouseout="if(!this.classList.contains('selected')) { this.style.borderColor='rgba(160,128,64,0.3)'; this.style.background='rgba(255,252,235,0.5)' }">
                ${imagen
                    ? `<img src="${imagen}" style="width:100px; height:100px; object-fit:cover; border-radius:4px; border:1px solid rgba(160,128,64,0.3)">`
                    : `<div style="width:100px; height:100px; border-radius:4px; background:rgba(160,128,64,0.2); display:flex; align-items:center; justify-content:center; font-size:36px">⚔️</div>`
                }
                <p style="font-size:12px; color:var(--muted); text-align:center">${costoLabel}</p>
                <p style="font-size:11px; color:var(--ink-light); text-align:center">🗳️ ${votantes} voto${votantes !== 1 ? 's' : ''}</p>
            </div>`
        })
        html += `</div>`
        if (rolActual === 'admin' || rolActual === 'lider') {
            html += `<button class="btn-primary" style="margin-top:16px" onclick="confirmarIniciarMision()">⚔️ Iniciar misión seleccionada</button>`
        }
    } else {
        html += `<p style="color:var(--muted); font-style:italic">No hay misiones disponibles</p>`
    }
    html += `</div>`

    html += `<div class="card">
        <h3>🔄 Registro de donaciones</h3>
        <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center; margin-bottom:16px">
            ${(rolActual === 'admin' || rolActual === 'lider') ? `<button class="btn-primary" id="btn-sincronizar-inicio" style="background:linear-gradient(180deg,#1a5e6b,#0a3e4a)" onclick="sincronizarDonaciones('inicio')">🔄 Sincronizar</button>` : ''}
            <button class="btn-tracker" onclick="abrirModalDonaciones()">📋 Ver registro completo</button>
            <span id="sync-info-inicio" style="font-size:12px; color:var(--muted); font-style:italic"></span>
        </div>
        <div id="sync-registro"></div>
    </div>`

    contenido.innerHTML = html

    fetch('/clan/sincronizar/info').then(r => r.json()).then(data => {
        const el = document.getElementById('sync-info-inicio')
        if (el && data.ultima_sincronizacion) {
            const fecha = new Date(data.ultima_sincronizacion).toLocaleString('es-AR')
            el.textContent = `Última sincronización: ${fecha}`
        }
        cargarRegistroDonaciones()
    }).catch(() => {})
}

// =================== MISIONES DISPONIBLES ===================
let misionSeleccionada = null

function seleccionarMision(questId) {
    document.querySelectorAll('[id^="quest-card-"]').forEach(el => {
        el.classList.remove('selected')
        el.style.borderColor = 'rgba(160,128,64,0.3)'
        el.style.background = 'rgba(255,252,235,0.5)'
    })
    const card = document.getElementById(`quest-card-${questId}`)
    if (card) {
        card.classList.add('selected')
        card.style.borderColor = 'var(--accent)'
        card.style.background = 'rgba(196,122,42,0.12)'
    }
    misionSeleccionada = questId
}

function confirmarIniciarMision() {
    if (!misionSeleccionada) { mostrarToast('Seleccioná una misión primero', 'error'); return }
    const card = document.getElementById(`quest-card-${misionSeleccionada}`)
    if (!card) return
    const imagen = card.querySelector('img')?.src || ''
    const infoTexts = card.querySelectorAll('p')
    const costoLabel = infoTexts[0]?.textContent || ''
    const votosLabel = infoTexts[1]?.textContent || ''
    const activos = miembrosCache.filter(m => m.participateInClanQuests !== false)

    let modal = document.getElementById('modal-confirmar-mision')
    if (!modal) {
        modal = document.createElement('div')
        modal.id = 'modal-confirmar-mision'
        modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:998; display:flex; align-items:center; justify-content:center; padding:20px'
        modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none' })
        document.body.appendChild(modal)
    }

    modal.innerHTML = `
        <div style="background:var(--parchment); border:2px solid var(--border); border-radius:4px; padding:28px; width:100%; max-width:480px; max-height:85vh; display:flex; flex-direction:column; box-shadow:0 8px 40px rgba(0,0,0,0.5)">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid rgba(160,128,64,0.3); padding-bottom:12px">
                <span style="font-family:Cinzel,serif; font-size:14px; font-weight:700; color:var(--ink)">⚔️ Confirmar misión</span>
                <button onclick="document.getElementById('modal-confirmar-mision').style.display='none'" style="background:none; border:none; cursor:pointer; font-size:20px; color:var(--accent-dark); padding:0; line-height:1">✕</button>
            </div>
            <div style="overflow-y:auto; flex:1">
                <div style="display:flex; gap:16px; align-items:center; margin-bottom:20px; padding:14px; background:rgba(196,122,42,0.08); border:1px solid var(--accent); border-radius:var(--radius-sm)">
                    ${imagen ? `<img src="${imagen}" style="width:80px; height:80px; object-fit:cover; border-radius:4px; border:1px solid rgba(160,128,64,0.3); flex-shrink:0">` : '<div style="width:80px; height:80px; border-radius:4px; background:rgba(160,128,64,0.2); flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:32px">⚔️</div>'}
                    <div>
                        <p style="font-size:14px; color:var(--ink); font-weight:600; margin-bottom:4px">${costoLabel}</p>
                        <p style="font-size:13px; color:var(--muted)">${votosLabel}</p>
                    </div>
                </div>
                <p style="font-family:Cinzel,serif; font-size:11px; color:var(--muted); letter-spacing:1px; margin-bottom:10px">MIEMBROS ACTIVOS (${activos.length})</p>
                <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px">
                    ${activos.length > 0
                        ? activos.map(m => `<span style="font-family:Cinzel,serif; font-size:11px; background:rgba(45,106,30,0.12); color:#2d6a1e; border:1px solid rgba(45,106,30,0.3); border-radius:3px; padding:3px 10px">✓ ${m.username}</span>`).join('')
                        : `<p style="color:var(--muted); font-style:italic; font-size:13px">No hay miembros activos</p>`
                    }
                </div>
            </div>
            <div style="display:flex; gap:10px; margin-top:16px; padding-top:16px; border-top:1px solid rgba(160,128,64,0.3)">
                <button class="btn-primary" style="flex:1" onclick="iniciarMision()">⚔️ Confirmar e iniciar</button>
                <button class="btn-tracker" style="flex:1" onclick="document.getElementById('modal-confirmar-mision').style.display='none'">Cancelar</button>
            </div>
        </div>`
    modal.style.display = 'flex'
}

function iniciarMision() {
    if (!misionSeleccionada) return
    const btn = document.querySelector('#modal-confirmar-mision .btn-primary')
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Iniciando...' }
    fetch('/clan/quests/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId: misionSeleccionada })
    }).then(r => r.json()).then(data => {
        if (data.ok) {
            mostrarToast('✓ ¡Misión iniciada!')
            document.getElementById('modal-confirmar-mision').style.display = 'none'
            misionSeleccionada = null
            cargarInicio()
        } else {
            mostrarToast('Error: ' + (data.error || 'No se pudo iniciar'), 'error')
            if (btn) { btn.disabled = false; btn.textContent = '⚔️ Confirmar e iniciar' }
        }
    }).catch(() => {
        mostrarToast('Error al iniciar la misión', 'error')
        if (btn) { btn.disabled = false; btn.textContent = '⚔️ Confirmar e iniciar' }
    })
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
        const membrosReales = members.filter(m => m.status !== 'INVITED') 
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

    const LEADER_ID = '304dec10-4074-40ff-884d-392099bacdf1'
    members.sort((a, b) => {
        const rango = m => m.playerId === LEADER_ID ? 0 : m.isCoLeader ? 1 : 2
        const diff = rango(a) - rango(b)
        if (diff !== 0) return diff
        return (a.username || '').localeCompare(b.username || '', 'es', { sensitivity: 'base' })
    })

    let html = `<h1>👥 Miembros</h1>`

    html += `<div class="card" style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0">🔄 Cambios de nombre</h3>
        <div style="display:flex; gap:8px; align-items:center">
            ${(rolActual === 'admin' || rolActual === 'lider') ? `<button class="btn-primary" style="background:linear-gradient(180deg,#8b2010,#6b1008); padding:6px 14px; font-size:10px" onclick="abrirModalClean()">🧹 Clean</button>` : ''}
            <button class="btn-tracker" onclick="abrirDrawerCambios()">Ver historial</button>
        </div>
    </div>`



    // Panel de acciones masivas - solo para admin y lider
    if (rolActual === 'admin' || rolActual === 'lider') {
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
    }


    html += `<div style="display:flex; flex-direction:column; gap:16px">`

    members.forEach(m => {
        const nivel = m.level === -1 ? '?' : (m.level || '?')
        const participa = m.participateInClanQuests !== false
        const cartera = carteras[m.playerId] || { oro: 0, gemas: 0 }
        const goldDonado = cartera.oro
        const gemsDonado = cartera.gemas
        const xpSemana = m.xpDurations?.week || 0
        const esLider = m.playerId === LEADER_ID
        const esCoLider = !esLider && m.isCoLeader === true
        const rolBadge = esLider
            ? `<span style="font-size:11px; font-weight:600; background:#FAEEDA; color:#633806; border:1px solid #EF9F27; border-radius:3px; padding:2px 9px; font-family:Cinzel,serif; letter-spacing:0.5px">👑 Líder</span>`
            : esCoLider
            ? `<span style="font-size:11px; font-weight:600; background:#f2e8c9; color:#5a3c1e; border:1px solid #c9b87a; border-radius:3px; padding:2px 9px; font-family:Cinzel,serif; letter-spacing:0.5px">⭐ Co-líder</span>`
            : `<span style="font-size:11px; font-weight:600; background:rgba(160,128,64,0.12); color:var(--muted); border:1px solid rgba(160,128,64,0.3); border-radius:3px; padding:2px 9px; font-family:Cinzel,serif; letter-spacing:0.5px">🐺 Miembro</span>`

        html += `
        <div class="card" style="display:flex; gap:20px; align-items:flex-start; flex-wrap:wrap">
            <div style="flex-shrink:0; text-align:center">
                <img id="avatar-${m.playerId}" src="" alt="${m.username}"
                    style="display:none; width:80px; height:80px; object-fit:contain; border-radius:8px; border:2px solid var(--parchment-shadow); background:rgba(255,252,235,0.5)">
                <div id="avatar-placeholder-${m.playerId}"
                    style="width:80px; height:80px; border-radius:8px; border:2px solid var(--parchment-shadow); background:rgba(160,128,64,0.2); display:flex; align-items:center; justify-content:center; font-family:Cinzel,serif; font-size:22px; font-weight:700; color:var(--ink)">${(m.username || '?')[0].toUpperCase()}</div>
            </div>

            <div style="flex:1; min-width:160px">
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px; flex-wrap:wrap">
                    <p style="font-family:Cinzel,serif; font-size:16px; font-weight:700; color:var(--ink); margin:0">${m.username || 'N/A'}</p>
                    ${rolBadge}
                </div>
                <p style="font-size:13px; color:var(--muted); margin-bottom:12px">Nivel ${nivel} &nbsp;·&nbsp; XP semana: ${xpSemana}</p>

                <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px">
                    <span style="font-family:Cinzel,serif; font-size:11px; color:var(--ink-light); letter-spacing:0.5px">MISIÓN</span>
                    ${(rolActual === 'admin' || rolActual === 'lider') ? `
                    <div onclick="toggleParticipacion('${m.playerId}', ${participa})"
                         id="toggle-${m.playerId}"
                         style="width:44px; height:24px; border-radius:12px; background:${participa ? '#2d6a1e' : 'var(--muted)'}; cursor:pointer; position:relative; transition:background 0.3s; border:1px solid rgba(0,0,0,0.1); flex-shrink:0">
                        <div style="width:18px; height:18px; border-radius:50%; background:white; position:absolute; top:2px; left:${participa ? '22px' : '2px'}; transition:left 0.3s; box-shadow:0 1px 3px rgba(0,0,0,0.2)" id="toggle-ball-${m.playerId}"></div>
                    </div>` : `
                    <div style="width:44px; height:24px; border-radius:12px; background:${participa ? '#2d6a1e' : 'var(--muted)'}; position:relative; border:1px solid rgba(0,0,0,0.1); flex-shrink:0; opacity:0.7">
                        <div style="width:18px; height:18px; border-radius:50%; background:white; position:absolute; top:2px; left:${participa ? '22px' : '2px'}; box-shadow:0 1px 3px rgba(0,0,0,0.2)"></div>
                    </div>`}
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

    abrirDrawerCambios(false)
}

function hexToRgb(hex) {
    if (!hex || hex.length < 7) return '160,128,64'
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `${r},${g},${b}`
}

function abrirDrawerCambios(abrir = true) {
    let drawer = document.getElementById('drawer-cambios')
    if (!drawer) {
        drawer = document.createElement('div')
        drawer.id = 'drawer-cambios'
        drawer.innerHTML = `
            <div id="drawer-overlay-cambios" onclick="cerrarDrawerCambios()" style="position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:998; display:none"></div>
            <div id="drawer-panel-cambios" style="position:fixed; top:0; right:0; height:100vh; width:320px; background:var(--parchment); border-left:2px solid var(--border); padding:24px; z-index:999; transform:translateX(100%); transition:transform 0.3s ease; overflow-y:auto; box-shadow:-4px 0 20px rgba(0,0,0,0.3)">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid rgba(160,128,64,0.3); padding-bottom:12px">
                    <span style="font-family:Cinzel,serif; font-size:14px; font-weight:700; color:var(--ink)">🔄 Cambios de nombre</span>
                    <button onclick="cerrarDrawerCambios()" style="background:none; border:none; cursor:pointer; font-size:20px; color:var(--accent-dark); padding:0; line-height:1">✕</button>
                </div>
                <div id="drawer-cambios-contenido"><p style="color:var(--muted); font-style:italic; font-size:14px">Cargando...</p></div>
            </div>`
        document.body.appendChild(drawer)
    }

    fetch('/clan/cambios_nombre').then(r => r.json()).then(cambios => {
        const el = document.getElementById('drawer-cambios-contenido')
        if (!el) return
        if (!cambios || cambios.length === 0) {
            el.innerHTML = `<p style="color:var(--muted); font-style:italic; font-size:14px">Sin cambios registrados</p>`
            return
        }
        let h = ''
        cambios.forEach(c => {
            const fecha = c.created_at ? c.created_at.slice(0,10).split('-').reverse().join('-') : 'N/A'
            h += `<div class="anuncio">
                <span class="anuncio-autor">${c.nombre_anterior}</span>
                <span style="color:var(--muted); margin:0 6px">→</span>
                <span class="anuncio-autor">${c.nombre_nuevo}</span>
                <span class="anuncio-fecha">${fecha}</span>
            </div>`
        })
        el.innerHTML = h
    }).catch(() => {
        const el = document.getElementById('drawer-cambios-contenido')
        if (el) el.innerHTML = `<p style="color:var(--red); font-size:14px">Error al cargar</p>`
    })

    if (abrir) {
        document.getElementById('drawer-overlay-cambios').style.display = 'block'
        document.getElementById('drawer-panel-cambios').style.transform = 'translateX(0)'
    }
}

function cerrarDrawerCambios() {
    const overlay = document.getElementById('drawer-overlay-cambios')
    const panel = document.getElementById('drawer-panel-cambios')
    if (overlay) overlay.style.display = 'none'
    if (panel) panel.style.transform = 'translateX(100%)'
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
    const oroInput = document.getElementById('filtroOro')
    const gemasInput = document.getElementById('filtroGemas')

    if (!oroInput || !gemasInput) {
        mostrarToast('Error: no se encontraron los campos', 'error')
        return
    }

    const oroVal = oroInput.value.trim()
    const gemasVal = gemasInput.value.trim()

    const minGold = tipo === 'oro' ? (oroVal !== '' ? parseInt(oroVal) : null) : null
    const minGems = tipo === 'gemas' ? (gemasVal !== '' ? parseInt(gemasVal) : null) : null

    if (minGold === null && minGems === null) {
        mostrarToast('Ingresá un valor primero', 'error')
        return
    }

    if ((minGold !== null && isNaN(minGold)) || (minGems !== null && isNaN(minGems))) {
        mostrarToast('El valor debe ser un número', 'error')
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

function cargarRegistroDonaciones() {
    fetch('/clan/ledger').then(r => r.json()).then(ledger => {
        const el = document.getElementById('sync-registro')
        if (!el) return

        const FECHA_INICIO = '2026-03-17T00:00:00Z'
        const hace14dias = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        const desde = hace14dias > FECHA_INICIO ? hace14dias : FECHA_INICIO
        const recientes = ledger.filter(d => d.creationTime && d.creationTime >= desde)

        if (recientes.length === 0) {
            el.innerHTML = `<p style="color:var(--muted); font-style:italic; font-size:13px">No hay donaciones en los últimos 14 días.</p>`
            return
        }

        let html = `<table><tr><th>Jugador</th><th>Oro</th><th>Gemas</th><th>Fecha</th></tr>`
        recientes.forEach(d => {
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

function abrirModalDonaciones() {
    let modal = document.getElementById('modal-donaciones')
    if (!modal) {
        modal = document.createElement('div')
        modal.id = 'modal-donaciones'
        modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:998; display:flex; align-items:center; justify-content:center; padding:20px'
        modal.innerHTML = `
            <div style="background:var(--parchment); border:2px solid var(--border); border-radius:4px; padding:28px; width:100%; max-width:600px; max-height:80vh; display:flex; flex-direction:column; box-shadow:0 8px 40px rgba(0,0,0,0.5)">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid rgba(160,128,64,0.3); padding-bottom:12px">
                    <span style="font-family:Cinzel,serif; font-size:14px; font-weight:700; color:var(--ink)">📋 Registro completo de donaciones</span>
                    <button onclick="document.getElementById('modal-donaciones').style.display='none'" style="background:none; border:none; cursor:pointer; font-size:20px; color:var(--accent-dark); padding:0; line-height:1">✕</button>
                </div>
                <div id="modal-donaciones-contenido" style="overflow-y:auto; flex:1">
                    <p style="color:var(--muted); font-style:italic; font-size:14px">Cargando...</p>
                </div>
            </div>`
        modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none' })
        document.body.appendChild(modal)
    } else {
        modal.style.display = 'flex'
    }

    fetch('/clan/ledger').then(r => r.json()).then(ledger => {
        const el = document.getElementById('modal-donaciones-contenido')
        if (!el) return
        const FECHA_INICIO = '2026-03-17T00:00:00Z'
        const todos = ledger.filter(d => d.creationTime && d.creationTime >= FECHA_INICIO)
        if (todos.length === 0) {
            el.innerHTML = `<p style="color:var(--muted); font-style:italic; font-size:14px">Sin registros.</p>`
            return
        }
        let html = `<table><tr><th>Jugador</th><th>Oro</th><th>Gemas</th><th>Fecha</th></tr>`
        todos.forEach(d => {
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
    }).catch(() => {
        const el = document.getElementById('modal-donaciones-contenido')
        if (el) el.innerHTML = `<p style="color:var(--red); font-size:14px">Error al cargar</p>`
    })
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

    const topbarUser = document.getElementById('topbar-username')
    if (topbarUser) topbarUser.textContent = data.username

    // Mostrar nombre de usuario y botón logout en sidebar
    const footer = document.querySelector('.sidebar-footer')
    if (footer) {
        const rolLabel = data.rol === 'admin' ? '✦ ADMIN ✦' : data.rol === 'lider' ? '✦ LÍDER ✦' : ''
        const rolColor = data.rol === 'admin' ? 'var(--accent)' : data.rol === 'lider' ? '#9b5e1a' : ''
        footer.innerHTML = `
            <p style="color:rgba(160,128,80,0.6); font-size:10px; margin-bottom:8px">${data.username}</p>
            ${rolLabel ? `<p style="color:${rolColor}; font-size:9px; letter-spacing:1px; margin-bottom:10px">${rolLabel}</p>` : ''}
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

    // Agregar botón Admin en nav si es admin o lider
    if (data.rol === 'admin' || data.rol === 'lider') {
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
    if (rolActual !== 'admin' && rolActual !== 'lider') {
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

    const pendientes = usuarios.filter(u => !u.aprobado && u.rol !== 'admin')
    const lideres = usuarios.filter(u => u.aprobado && u.rol === 'lider')
    const miembros = usuarios.filter(u => u.aprobado && u.rol === 'miembro')
    const admins = usuarios.filter(u => u.aprobado && u.rol === 'admin')

    // Solicitudes pendientes / desactivados
    if (pendientes.length > 0) {
        html += `<div class="card"><h3>⏳ Pendientes / Desactivados</h3>`
        pendientes.forEach(u => {
            html += `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid rgba(160,128,64,0.2); flex-wrap:wrap; gap:10px">
                <div>
                    <span style="font-family:Cinzel,serif; font-weight:600; color:var(--ink)">${u.username}</span>
                    <span style="font-size:12px; color:var(--muted); margin-left:8px">${u.created_at ? u.created_at.slice(0,10) : ''}</span>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap">
                    <button class="btn-primary" style="padding:6px 14px; font-size:10px" onclick="toggleAcceso(${u.id}, true, '${u.username}')">✓ Activar</button>
                    <button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#8b2010,#6b1008)" onclick="eliminarUsuarioAdmin(${u.id}, '${u.username}')">✗ Eliminar</button>
                </div>
            </div>`
        })
        html += `</div>`
    } else {
        html += `<div class="card"><p style="color:var(--muted); font-style:italic">No hay solicitudes pendientes ✓</p></div>`
    }

    // Admin
    if (admins.length > 0) {
        html += `<div class="card"><h3>🛡️ Administradores</h3>`
        admins.forEach(u => {
            const conectado = estaConectado(u.ultima_actividad)
            const luz = conectado
                ? `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#2d6a1e; box-shadow:0 0 6px #2d6a1e; margin-right:8px; flex-shrink:0"></span>`
                : `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#8b2010; box-shadow:0 0 4px #8b2010; margin-right:8px; flex-shrink:0"></span>`
            html += `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid rgba(160,128,64,0.2); flex-wrap:wrap; gap:10px">
                <div style="display:flex; align-items:center">
                    ${luz}
                    <span style="font-family:Cinzel,serif; font-weight:600; color:var(--ink)">${u.username}</span>
                    <span style="font-size:10px; color:var(--accent); margin-left:8px; font-family:Cinzel,serif">ADMIN</span>
                    <span style="font-size:11px; color:var(--muted); margin-left:10px; font-style:italic">${conectado ? 'En línea' : (u.ultima_actividad ? 'Última vez: ' + new Date(u.ultima_actividad).toLocaleString('es-AR') : 'Nunca')}</span>
                </div>
            </div>`
        })
        html += `</div>`
    }

    // Líderes
    html += `<div class="card"><h3>👑 Líderes</h3>`
    if (lideres.length === 0) {
        html += `<p style="color:var(--muted); font-style:italic; font-size:13px">No hay líderes</p>`
    } else {
        lideres.forEach(u => {
            const conectado = estaConectado(u.ultima_actividad)
            const luz = conectado
                ? `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#2d6a1e; box-shadow:0 0 6px #2d6a1e; margin-right:8px; flex-shrink:0"></span>`
                : `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#8b2010; box-shadow:0 0 4px #8b2010; margin-right:8px; flex-shrink:0"></span>`
            html += `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid rgba(160,128,64,0.2); flex-wrap:wrap; gap:10px">
                <div style="display:flex; align-items:center">
                    ${luz}
                    <span style="font-family:Cinzel,serif; font-weight:600; color:var(--ink)">${u.username}</span>
                    <span style="font-size:11px; color:var(--muted); margin-left:10px; font-style:italic">${conectado ? 'En línea' : (u.ultima_actividad ? 'Última vez: ' + new Date(u.ultima_actividad).toLocaleString('es-AR') : 'Nunca')}</span>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap">
                    ${rolActual === 'admin' ? `<button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#5a3c1e,#3a2010)" onclick="cambiarRol(${u.id}, 'miembro', '${u.username}')">↓ Bajar a Miembro</button>` : ''}
                    <button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#8b5e1a,#6b3e0a)" onclick="toggleAcceso(${u.id}, false, '${u.username}')">⛔ Desactivar</button>
                    ${rolActual === 'admin' ? `<button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#8b2010,#6b1008)" onclick="eliminarUsuarioAdmin(${u.id}, '${u.username}')">🗑️ Eliminar</button>` : ''}
                </div>
            </div>`
        })
    }
    html += `</div>`

    // Miembros
    html += `<div class="card"><h3>🐺 Miembros</h3>`
    if (miembros.length === 0) {
        html += `<p style="color:var(--muted); font-style:italic; font-size:13px">No hay miembros</p>`
    } else {
        miembros.forEach(u => {
            const conectado = estaConectado(u.ultima_actividad)
            const luz = conectado
                ? `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#2d6a1e; box-shadow:0 0 6px #2d6a1e; margin-right:8px; flex-shrink:0"></span>`
                : `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#8b2010; box-shadow:0 0 4px #8b2010; margin-right:8px; flex-shrink:0"></span>`
            html += `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid rgba(160,128,64,0.2); flex-wrap:wrap; gap:10px">
                <div style="display:flex; align-items:center">
                    ${luz}
                    <span style="font-family:Cinzel,serif; font-weight:600; color:var(--ink)">${u.username}</span>
                    <span style="font-size:11px; color:var(--muted); margin-left:10px; font-style:italic">${conectado ? 'En línea' : (u.ultima_actividad ? 'Última vez: ' + new Date(u.ultima_actividad).toLocaleString('es-AR') : 'Nunca')}</span>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap">
                    ${rolActual === 'admin' ? `<button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#c47a2a,#9b5e1a)" onclick="cambiarRol(${u.id}, 'lider', '${u.username}')">↑ Subir a Líder</button>` : ''}
                    <button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#8b5e1a,#6b3e0a)" onclick="toggleAcceso(${u.id}, false, '${u.username}')">⛔ Desactivar</button>
                    ${rolActual === 'admin' ? `<button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#8b2010,#6b1008)" onclick="eliminarUsuarioAdmin(${u.id}, '${u.username}')">🗑️ Eliminar</button>` : ''}
                </div>
            </div>`
        })
    }
    html += `</div>`

    contenido.innerHTML = html
}

function cambiarRol(id, nuevoRol, username) {
    const texto = nuevoRol === 'lider' ? `¿Subir a ${username} a Líder?` : `¿Bajar a ${username} a Miembro?`
    if (!confirm(texto)) return
    fetch(`/admin/usuarios/${id}/rol`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol: nuevoRol })
    }).then(r => r.json()).then(data => {
        if (data.ok) { mostrarToast(`✓ Rol actualizado`); cargarAdmin() }
        else mostrarToast('Error: ' + data.error, 'error')
    })
}

function toggleAcceso(id, activar, username) {
    const texto = activar ? `¿Activar acceso de ${username}?` : `¿Desactivar acceso de ${username}?`
    if (!confirm(texto)) return
    fetch(`/admin/usuarios/${id}/aprobar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aprobado: activar })
    }).then(r => r.json()).then(data => {
        if (data.ok) { mostrarToast(activar ? `✓ ${username} activado` : `✓ ${username} desactivado`); cargarAdmin() }
        else mostrarToast('Error: ' + data.error, 'error')
    })
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

function abrirModalClean() {
    let modal = document.getElementById('modal-clean')
    if (!modal) {
        modal = document.createElement('div')
        modal.id = 'modal-clean'
        modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:998; display:flex; align-items:center; justify-content:center; padding:20px'
        modal.innerHTML = `
            <div style="background:var(--parchment); border:2px solid var(--border); border-radius:4px; padding:28px; width:100%; max-width:500px; max-height:80vh; display:flex; flex-direction:column; box-shadow:0 8px 40px rgba(0,0,0,0.5)">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid rgba(160,128,64,0.3); padding-bottom:12px">
                    <span style="font-family:Cinzel,serif; font-size:14px; font-weight:700; color:var(--ink)">🧹 Limpiar ex-miembros</span>
                    <button onclick="document.getElementById('modal-clean').style.display='none'" style="background:none; border:none; cursor:pointer; font-size:20px; color:var(--accent-dark); padding:0; line-height:1">✕</button>
                </div>
                <div id="modal-clean-contenido" style="overflow-y:auto; flex:1">
                    <p style="color:var(--muted); font-style:italic; font-size:14px">Cargando...</p>
                </div>
            </div>`
        modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none' })
        document.body.appendChild(modal)
    } else {
        modal.style.display = 'flex'
    }

    fetch('/clan/ex-miembros').then(r => r.json()).then(ex => {
        const el = document.getElementById('modal-clean-contenido')
        if (!el) return
        if (!ex || ex.length === 0) {
            el.innerHTML = `<p style="color:var(--muted); font-style:italic; font-size:14px">✓ No hay ex-miembros con cartera.</p>`
            return
        }
        let h = `<p style="font-size:13px; color:var(--muted); margin-bottom:16px; font-style:italic">Estos jugadores ya no están en el clan pero tienen cartera guardada:</p>`
        h += `<button class="btn-primary" style="background:linear-gradient(180deg,#8b2010,#6b1008); margin-bottom:16px; width:100%" onclick="eliminarTodosExMiembros()">🗑️ Eliminar todos (${ex.length})</button>`
        ex.forEach(c => {
            h += `<div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid rgba(160,128,64,0.2)">
                <div>
                    <span style="font-family:Cinzel,serif; font-weight:600; color:var(--ink); font-size:14px">${c.username || c.player_id}</span>
                    <span style="font-size:12px; color:var(--muted); margin-left:8px">🥇 ${c.oro || 0} · 💎 ${c.gemas || 0}</span>
                </div>
                <button class="btn-primary" style="background:linear-gradient(180deg,#8b2010,#6b1008); padding:5px 12px; font-size:10px"
                    onclick="eliminarExMiembro('${c.player_id}', '${c.username || c.player_id}', this.closest('div[style]'))">Eliminar</button>
            </div>`
        })
        el.innerHTML = h
    }).catch(() => {
        const el = document.getElementById('modal-clean-contenido')
        if (el) el.innerHTML = `<p style="color:var(--red); font-size:14px">Error al cargar</p>`
    })
}

function eliminarExMiembro(playerId, username, fila) {
    fetch(`/clan/carteras/${playerId}`, { method: 'DELETE' })
        .then(r => r.json())
        .then(data => {
            if (data.ok) {
                mostrarToast(`✓ ${username} eliminado`)
                if (fila) fila.remove()
            } else mostrarToast('Error: ' + data.error, 'error')
        }).catch(() => mostrarToast('Error al eliminar', 'error'))
}

function eliminarTodosExMiembros() {
    if (!confirm('¿Eliminar las carteras de todos los ex-miembros?')) return
    fetch('/clan/ex-miembros', { method: 'DELETE' })
        .then(r => r.json())
        .then(data => {
            if (data.ok) {
                mostrarToast(`✓ ${data.eliminados} cartera(s) eliminada(s)`)
                document.getElementById('modal-clean').style.display = 'none'
            } else mostrarToast('Error: ' + data.error, 'error')
        }).catch(() => mostrarToast('Error al eliminar', 'error'))
}
