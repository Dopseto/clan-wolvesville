let seccionActual = 'inicio'
let miembrosCache = []
let idiomaActual = 'es'
let datosCache = {}

function puedeActuar() { return rolActual === 'admin' || rolActual === 'lider' || rolActual === 'colider' }

function ajustarBrillo(hex, cantidad) {
    // Convierte hex a RGB, ajusta brillo y devuelve hex
    try {
        let r = parseInt(hex.slice(1,3),16)
        let g = parseInt(hex.slice(3,5),16)
        let b = parseInt(hex.slice(5,7),16)
        r = Math.max(0, Math.min(255, r + cantidad))
        g = Math.max(0, Math.min(255, g + cantidad))
        b = Math.max(0, Math.min(255, b + cantidad))
        return '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('')
    } catch(e) { return hex }
}

// =================== TRADUCCIONES ===================
const T = {
    es: {
        // Nav
        inicio: 'Inicio', miembros: 'Miembros', logs: 'Actividad', stats: 'Estadísticas',
        comandos: 'Comandos', ajustes: 'Ajustes', admin: 'Admin', tracker: 'Tracker',
        cerrarSesion: 'Cerrar sesión',
        // General
        cargando: 'Cargando...', error: 'Error', guardar: 'Guardar', cancelar: 'Cancelar',
        eliminar: 'Eliminar', activar: 'Activar', desactivar: 'Desactivar', confirmar: 'Confirmar',
        sinPermisos: 'Sin permisos', noHay: 'No hay datos', verMas: 'Ver más',
        // Inicio
        descripcion: 'Descripción', sinDescripcion: 'Sin descripción',
        recursos: 'Recursos del clan', miembrosCount: 'Miembros', xpTotal: 'XP Total',
        idioma: 'Idioma', nivelMin: 'Nivel mínimo',
        anuncios: 'Anuncios', historialAnuncios: 'Historial de anuncios',
        manual: 'Manual', automatico: 'Automático',
        publicar: 'Publicar', escribiAnuncio: 'Escribí tu anuncio acá...',
        noAnuncios: 'No hay anuncios',
        misionActiva: 'Misión activa', noMisionActiva: 'No hay misión activa',
        misionesDisponibles: 'Misiones disponibles', noMisiones: 'No hay misiones disponibles',
        iniciarseMision: 'Iniciar misión seleccionada', shuffle: 'Shuffle',
        costoPorMiembro: 'COSTO POR MIEMBRO',
        premios: 'Premios — Última misión', multas: 'Multas — Última misión',
        registroDonaciones: 'Registro de donaciones', sincronizar: 'Sincronizar',
        verRegistro: 'Ver registro completo', ultimaSync: 'Última sincronización:',
        // Miembros
        miembrosTitle: 'Miembros', cambiosNombre: 'Cambios de nombre',
        verHistorial: 'Ver historial', accionesMasivas: 'Acciones masivas',
        activarTodos: 'Activar todos', desactivarTodos: 'Desactivar todos',
        activarPorCartera: 'ACTIVAR POR CARTERA:', cartera: 'CARTERA',
        mision: 'MISIÓN', activo: 'Activo', inactivo: 'Inactivo',
        oroTotal: 'Oro total', gemasTotal: 'Gemas total',
        // Logs
        actividadClan: 'Actividad del clan', fecha: 'Fecha', evento: 'Evento', jugador: 'Jugador',
        noActividad: 'No hay actividad registrada',
        // Stats
        estadisticas: 'Estadísticas', participacionMisiones: 'Participación en misiones',
        // Admin
        panelAdmin: 'Panel de administración', pendientes: 'Pendientes / Desactivados',
        noPendientes: 'No hay solicitudes pendientes ✓',
        administradores: 'Administradores', lideres: 'Líderes', colideres: 'Co-líderes',
        miembrosRol: 'Miembros', espectadores: 'Espectadores',
        enLinea: 'En línea', ultimaVez: 'Última vez:', nunca: 'Nunca',
        subirLider: '↑ Subir a Líder', subirColider: '↑ Subir a Co-líder',
        bajarColider: '↓ Bajar a Co-líder', bajarMiembro: '↓ Bajar a Miembro',
        bajarMiembro2: '↓↓ Bajar a Miembro', hacerEspectador: '👁️ Espectador',
        hacerMiembro: '↑ Hacer Miembro', resetearClave: '🔑 Resetear clave',
        // Tabla donaciones
        jugadorCol: 'Jugador', oro: 'Oro', gemas: 'Gemas', descripcionCol: 'Descripción',
        activarConOro: 'Activar con este oro', activarConGemas: 'Activar con estas gemas',
        // Idioma
        selectorIdioma: 'Idioma',
    },
    en: {
        // Nav
        inicio: 'Home', miembros: 'Members', logs: 'Activity', stats: 'Statistics',
        comandos: 'Commands', ajustes: 'Settings', admin: 'Admin', tracker: 'Tracker',
        cerrarSesion: 'Log out',
        // General
        cargando: 'Loading...', error: 'Error', guardar: 'Save', cancelar: 'Cancel',
        eliminar: 'Delete', activar: 'Enable', desactivar: 'Disable', confirmar: 'Confirm',
        sinPermisos: 'No permissions', noHay: 'No data', verMas: 'See more',
        // Inicio
        descripcion: 'Description', sinDescripcion: 'No description',
        recursos: 'Clan resources', miembrosCount: 'Members', xpTotal: 'Total XP',
        idioma: 'Language', nivelMin: 'Min level',
        anuncios: 'Announcements', historialAnuncios: 'Announcement history',
        manual: 'Manual', automatico: 'Automatic',
        publicar: 'Publish', escribiAnuncio: 'Write your announcement here...',
        noAnuncios: 'No announcements',
        misionActiva: 'Active mission', noMisionActiva: 'No active mission',
        misionesDisponibles: 'Available missions', noMisiones: 'No missions available',
        iniciarseMision: 'Start selected mission', shuffle: 'Shuffle',
        costoPorMiembro: 'COST PER MEMBER',
        premios: 'Prizes — Last mission', multas: 'Fines — Last mission',
        registroDonaciones: 'Donation log', sincronizar: 'Sync',
        verRegistro: 'View full log', ultimaSync: 'Last sync:',
        // Miembros
        miembrosTitle: 'Members', cambiosNombre: 'Name changes',
        verHistorial: 'View history', accionesMasivas: 'Mass actions',
        activarTodos: 'Enable all', desactivarTodos: 'Disable all',
        activarPorCartera: 'ENABLE BY WALLET:', cartera: 'WALLET',
        mision: 'MISSION', activo: 'Active', inactivo: 'Inactive',
        oroTotal: 'Total gold', gemasTotal: 'Total gems',
        // Logs
        actividadClan: 'Clan activity', fecha: 'Date', evento: 'Event', jugador: 'Player',
        noActividad: 'No activity recorded',
        // Stats
        estadisticas: 'Statistics', participacionMisiones: 'Mission participation',
        // Admin
        panelAdmin: 'Administration panel', pendientes: 'Pending / Disabled',
        noPendientes: 'No pending requests ✓',
        administradores: 'Administrators', lideres: 'Leaders', colideres: 'Co-leaders',
        miembrosRol: 'Members', espectadores: 'Spectators',
        enLinea: 'Online', ultimaVez: 'Last seen:', nunca: 'Never',
        subirLider: '↑ Promote to Leader', subirColider: '↑ Promote to Co-leader',
        bajarColider: '↓ Demote to Co-leader', bajarMiembro: '↓ Demote to Member',
        bajarMiembro2: '↓↓ Demote to Member', hacerEspectador: '👁 Make Spectator',
        hacerMiembro: '↑ Make Member', resetearClave: '🔑 Reset password',
        // Tabla donaciones
        jugadorCol: 'Player', oro: 'Gold', gemas: 'Gems', descripcionCol: 'Description',
        activarConOro: 'Enable with this gold', activarConGemas: 'Enable with these gems',
        // Idioma
        selectorIdioma: 'Language',
    },
    pt: {
        // Nav
        inicio: 'Início', miembros: 'Membros', logs: 'Atividade', stats: 'Estatísticas',
        comandos: 'Comandos', ajustes: 'Configurações', admin: 'Admin', tracker: 'Tracker',
        cerrarSesion: 'Sair',
        // General
        cargando: 'Carregando...', error: 'Erro', guardar: 'Salvar', cancelar: 'Cancelar',
        eliminar: 'Excluir', activar: 'Ativar', desactivar: 'Desativar', confirmar: 'Confirmar',
        sinPermisos: 'Sem permissões', noHay: 'Sem dados', verMas: 'Ver mais',
        // Inicio
        descripcion: 'Descrição', sinDescripcion: 'Sem descrição',
        recursos: 'Recursos do clã', miembrosCount: 'Membros', xpTotal: 'XP Total',
        idioma: 'Idioma', nivelMin: 'Nível mínimo',
        anuncios: 'Anúncios', historialAnuncios: 'Histórico de anúncios',
        manual: 'Manual', automatico: 'Automático',
        publicar: 'Publicar', escribiAnuncio: 'Escreva seu anúncio aqui...',
        noAnuncios: 'Sem anúncios',
        misionActiva: 'Missão ativa', noMisionActiva: 'Sem missão ativa',
        misionesDisponibles: 'Missões disponíveis', noMisiones: 'Sem missões disponíveis',
        iniciarseMision: 'Iniciar missão selecionada', shuffle: 'Embaralhar',
        costoPorMiembro: 'CUSTO POR MEMBRO',
        premios: 'Prêmios — Última missão', multas: 'Multas — Última missão',
        registroDonaciones: 'Registro de doações', sincronizar: 'Sincronizar',
        verRegistro: 'Ver registro completo', ultimaSync: 'Última sincronização:',
        // Miembros
        miembrosTitle: 'Membros', cambiosNombre: 'Mudanças de nome',
        verHistorial: 'Ver histórico', accionesMasivas: 'Ações em massa',
        activarTodos: 'Ativar todos', desactivarTodos: 'Desativar todos',
        activarPorCartera: 'ATIVAR POR CARTEIRA:', cartera: 'CARTEIRA',
        mision: 'MISSÃO', activo: 'Ativo', inactivo: 'Inativo',
        oroTotal: 'Ouro total', gemasTotal: 'Gemas total',
        // Logs
        actividadClan: 'Atividade do clã', fecha: 'Data', evento: 'Evento', jugador: 'Jogador',
        noActividad: 'Nenhuma atividade registrada',
        // Stats
        estadisticas: 'Estatísticas', participacionMisiones: 'Participação em missões',
        // Admin
        panelAdmin: 'Painel de administração', pendientes: 'Pendentes / Desativados',
        noPendientes: 'Sem solicitações pendentes ✓',
        administradores: 'Administradores', lideres: 'Líderes', colideres: 'Co-líderes',
        miembrosRol: 'Membros', espectadores: 'Espectadores',
        enLinea: 'Online', ultimaVez: 'Última vez:', nunca: 'Nunca',
        subirLider: '↑ Promover a Líder', subirColider: '↑ Promover a Co-líder',
        bajarColider: '↓ Rebaixar a Co-líder', bajarMiembro: '↓ Rebaixar a Membro',
        bajarMiembro2: '↓↓ Rebaixar a Membro', hacerEspectador: '👁 Tornar Espectador',
        hacerMiembro: '↑ Tornar Membro', resetearClave: '🔑 Redefinir senha',
        // Tabla donaciones
        jugadorCol: 'Jogador', oro: 'Ouro', gemas: 'Gemas', descripcionCol: 'Descrição',
        activarConOro: 'Ativar com este ouro', activarConGemas: 'Ativar com estas gemas',
        // Idioma
        selectorIdioma: 'Idioma',
    }
}

function t(key) {
    return (T[idiomaActual] && T[idiomaActual][key]) || T['es'][key] || key
}

function cambiarIdioma(idioma) {
    idiomaActual = idioma
    localStorage.setItem('idioma', idioma)
    fetch('/auth/idioma', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idioma }) }).catch(() => {})

    // Actualizar botones de idioma
    document.querySelectorAll('.lang-btn').forEach(b => {
        const activo = b.dataset.lang === idioma
        b.style.background = activo ? 'rgba(196,122,42,0.25)' : 'transparent'
        b.style.border = `1px solid ${activo ? 'rgba(196,122,42,0.6)' : 'transparent'}`
        b.style.opacity = activo ? '1' : '0.75'
    })

    // Actualizar textos del nav
    actualizarNavTextos()

    // Rerenderizar sección actual con datos en caché (sin fetch)
    const c = datosCache
    if (seccionActual === 'inicio' && c.inicio) {
        const d = c.inicio
        mostrarInicio(d.info, d.quests, d.anuncios, d.ledger, d.available, d.votes, d.costoOroDefault, d.costoGemasDefault, d.premioPct1, d.premioPct2, d.premioPct3, d.multaXpMin, d.multaPct)
    } else if (seccionActual === 'miembros' && c.miembros) {
        const d = c.miembros
        mostrarMiembros(d.members, d.carteras, d.costoOro, d.costoGemas)
    } else if (seccionActual === 'logs' && c.logs) {
        mostrarLogs(c.logs)
    } else if (seccionActual === 'stats' && c.stats) {
        // Stats se reconstruye directamente
        cargarStats()
    } else if (seccionActual === 'admin' && c.admin) {
        mostrarAdmin(c.admin)
    } else {
        // Si no hay caché todavía, recargar normalmente
        mostrarSeccion(seccionActual)
    }
}

function actualizarNavTextos() {
    const map = {
        'btn-inicio': t('inicio'), 'btn-miembros': t('miembros'),
        'btn-logs': t('logs'), 'btn-stats': t('stats'),
        'btn-comandos': t('comandos'), 'btn-ajustes': t('ajustes'),
        'btn-admin': t('admin'), 'btn-tracker': t('tracker')
    }
    Object.entries(map).forEach(([id, texto]) => {
        const btn = document.getElementById(id)
        if (btn) {
            const icon = btn.querySelector('.nav-icon')
            const iconHtml = icon ? icon.outerHTML : ''
            btn.innerHTML = iconHtml + ' ' + texto
        }
    })
}

const ANUNCIOS_AUTO = [
    "¡Ya están las nuevas misiones para votar! Recuerden que tienen 12 horas para participar en la votación.",
    "¡La misión de la semana ha comenzado! Tienen hasta el domingo para completarla. ¡Mucho éxito a todos!",
    "Recordatorio: donen oro o gemas al clan para mantener los recursos. ¡Gracias a todos por su apoyo!",
    "¡Felicitaciones al clan por completar la misión! Los premios serán entregados en breve.",
]

window.onload = async function() {
    const sesionRes = await fetch('/auth/me')
    if (sesionRes.status === 401) { window.location.href = '/'; return }
    const sesionData = await sesionRes.json()

    if (sesionData.requiere_camara) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true })
            stream.getTracks().forEach(t => t.stop())
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) detenerCamara()
                else iniciarCamara()
            })
            iniciarCamara()
        } catch (e) {
            return
        }
    }

    await cargarSesion()
    actualizarNavTextos()
    const seccionInicial = window.location.hash.replace('#', '') || 'inicio'
    const seccionesValidas = ['inicio', 'miembros', 'logs', 'stats', 'comandos', 'ajustes', 'admin']
    mostrarSeccion(seccionesValidas.includes(seccionInicial) ? seccionInicial : 'inicio')
}

function mostrarToast(msg, tipo = 'ok') {
    const toast = document.getElementById('toast')
    toast.textContent = msg
    toast.className = `toast ${tipo} show`
    setTimeout(() => toast.classList.remove('show'), 3000)
}

function mostrarSeccion(seccion, btn = null) {
    seccionActual = seccion
    window.location.hash = seccion
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('activo'))
    if (btn) btn.classList.add('activo')
    else document.querySelectorAll('.nav-btn')[0].classList.add('activo')
    const contenido = document.getElementById('contenido')
    contenido.innerHTML = `<p class='cargando'>${t('cargando')}</p>`
    if (seccion === 'inicio') cargarInicio()
    else if (seccion === 'miembros') cargarMiembros()
    else if (seccion === 'logs') cargarLogs()
    else if (seccion === 'stats') cargarStats()
    else if (seccion === 'admin') cargarAdmin()
    else if (seccion === 'ajustes') cargarAjustes()
    else if (seccion === 'comandos') cargarComandos()
}

// =================== INICIO ===================
function cargarInicio() {
    Promise.all([
        fetch('/clan/info').then(r => r.json()),
        fetch('/clan/quests').then(r => r.json()),
        fetch('/clan/announcements').then(r => r.json()),
        fetch('/clan/ledger').then(r => r.json()),
        fetch('/clan/quests/available').then(r => r.json()),
        fetch('/clan/quests/votes').then(r => r.json()),
        fetch('/config/costo_oro_mision').then(r => r.json()),
        fetch('/config/costo_gemas_mision').then(r => r.json()),
        fetch('/config/premio_pct_1').then(r => r.json()).catch(() => ({ valor: '15' })),
        fetch('/config/premio_pct_2').then(r => r.json()).catch(() => ({ valor: '10' })),
        fetch('/config/premio_pct_3').then(r => r.json()).catch(() => ({ valor: '5' })),
        fetch('/config/multa_xp_minimo').then(r => r.json()).catch(() => ({ valor: '0' })),
        fetch('/config/multa_pct').then(r => r.json()).catch(() => ({ valor: '50' }))
    ]).then(([info, quests, anuncios, ledger, available, votes, cfgOro, cfgGemas, cfgP1, cfgP2, cfgP3, cfgMultaXp, cfgMultaPct]) => {
        const costoOroDefault = parseInt(cfgOro.valor) || 700
        const costoGemasDefault = parseInt(cfgGemas.valor) || 170
        const premioPct1 = parseInt(cfgP1.valor) || 15
        const premioPct2 = parseInt(cfgP2.valor) || 10
        const premioPct3 = parseInt(cfgP3.valor) || 5
        const multaXpMin = parseInt(cfgMultaXp.valor) || 0
        const multaPct = parseInt(cfgMultaPct.valor) || 50
        datosCache.inicio = { info, quests, anuncios, ledger, available, votes, costoOroDefault, costoGemasDefault, premioPct1, premioPct2, premioPct3, multaXpMin, multaPct }
        mostrarInicio(info, quests, anuncios, ledger, available, votes, costoOroDefault, costoGemasDefault, premioPct1, premioPct2, premioPct3, multaXpMin, multaPct)
    })
}

function mostrarInicio(info, quests, anuncios, ledger, available, votes, costoOroDefault = 700, costoGemasDefault = 170, premioPct1 = 15, premioPct2 = 10, premioPct3 = 5, multaXpMin = 0, multaPct = 50) {
    const contenido = document.getElementById('contenido')
    let html = `<h1>${info.name || 'Clan'} <span class="tag">${info.tag || ''}</span></h1>`

    html += `<div class="card"><h3>${t('descripcion')}</h3>
        <p style="font-size:15px; line-height:1.7">${(info.description || t('sinDescripcion')).replace(/\n/g, '<br>')}</p>
    </div>`

    html += `<div class="grid">
        <div class="stat"><div class="stat-valor">${info.memberCount || 0}</div><div class="stat-label">Miembros</div></div>
        <div class="stat"><div class="stat-valor">${info.xp || 0}</div><div class="stat-label">XP Total</div></div>
        <div class="stat"><div class="stat-valor">${info.language || 'N/A'}</div><div class="stat-label">Idioma</div></div>
        <div class="stat"><div class="stat-valor">${info.minLevel || 0}</div><div class="stat-label">Nivel mínimo</div></div>
    </div>`

    html += `<div class="card" style="margin-top:16px"><h3>${t('recursos')}</h3>
        <div class="grid">
            <div class="stat"><div class="stat-valor">🥇 ${info.gold || 0}</div><div class="stat-label">Oro</div></div>
            <div class="stat"><div class="stat-valor">💎 ${info.gems || 0}</div><div class="stat-label">Gemas</div></div>
        </div>
    </div>`

    // ANUNCIOS
    html += `<div class="card"><h3>${t('anuncios')}</h3>
        ${(rolActual === 'admin' || rolActual === 'lider' || rolActual === 'colider') ? `
        <div style="display:flex; gap:0; margin-bottom:16px; border:1px solid var(--border); border-radius:var(--radius-sm); overflow:hidden; width:fit-content">
            <button id="tab-manual" onclick="switchTab('manual')" style="padding:8px 20px; border:none; cursor:pointer; font-family:Cinzel,serif; font-size:11px; letter-spacing:1px; background:var(--accent); color:#fff8e8; transition:all 0.2s">${t('manual')}</button>
            <button id="tab-auto" onclick="switchTab('auto')" style="padding:8px 20px; border:none; cursor:pointer; font-family:Cinzel,serif; font-size:11px; letter-spacing:1px; background:rgba(160,128,64,0.1); color:var(--muted); transition:all 0.2s">${t('automatico')}</button>
        </div>
        <div id="panel-manual">
            <textarea id="nuevoAnuncio" placeholder="${t('escribiAnuncio')}"></textarea>
            <button class="btn-primary" onclick="publicarAnuncio()">${t('publicar')}</button>
        </div>
        <div id="panel-auto" style="display:none">
            <p style="font-size:13px; color:var(--muted); margin-bottom:12px; font-style:italic">Anuncios programados desde Ajustes:</p>
            <div id="lista-anuncios-auto"><p style="color:var(--muted); font-style:italic; font-size:13px">${t('cargando')}</p></div>
        </div>` : ''}
    </div>`

    // HISTORIAL con scroll
    html += `<div class="card"><h3>${t('historialAnuncios')}</h3>
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
        html += `<p style="color:var(--muted); font-style:italic">${t('noAnuncios')}</p>`
    }
    html += `</div></div>`

    // MISIÓN ACTIVA
    html += `<div class="card"><h3>${t('misionActiva')}</h3>`
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
        html += `<p style="color:var(--muted); font-style:italic">${t('noMisionActiva')}</p>`
    }
    html += `</div>`

    // MISIONES DISPONIBLES
    html += `<div class="card"><h3>${t('misionesDisponibles')}</h3>`
    if (available && available.length > 0) {
        const votosMap = votes && votes.votes ? votes.votes : {}
        const shuffleVotos = votes && votes.shuffleVotes ? votes.shuffleVotes.length : 0
        html += `<div style="display:flex; flex-wrap:wrap; gap:14px; justify-content:flex-start; margin-bottom:16px">`
        available.forEach(q => {
            const qid = q.id
            const votantes = votosMap[qid] ? votosMap[qid].length : 0
            const esPorGemas = q.purchasableWithGems === true
            const costoLabel = esPorGemas ? `💎 Gemas` : `🥇 Oro`
            const imagen = q.promoImageUrl || ''
            html += `
            <div id="quest-card-${qid}" data-gemas="${esPorGemas ? '1' : '0'}"
                style="display:flex; flex-direction:column; align-items:center; gap:8px; padding:12px; background:rgba(255,252,235,0.5); border:2px solid rgba(160,128,64,0.3); border-radius:var(--radius-sm); cursor:pointer; transition:all 0.2s; width:160px"
                onclick="seleccionarMision('${qid}')"
                onmouseover="if(!this.classList.contains('selected')) { this.style.borderColor='var(--accent)'; this.style.background='rgba(196,122,42,0.08)' }"
                onmouseout="if(!this.classList.contains('selected')) { this.style.borderColor='rgba(160,128,64,0.3)'; this.style.background='rgba(255,252,235,0.5)' }">
                ${imagen
                    ? `<img src="${imagen}" style="width:140px; height:140px; object-fit:cover; border-radius:4px; border:1px solid rgba(160,128,64,0.3)">`
                    : `<div style="width:140px; height:140px; border-radius:4px; background:rgba(160,128,64,0.2); display:flex; align-items:center; justify-content:center; font-size:40px">⚔️</div>`
                }
                <p style="font-size:12px; color:var(--muted); text-align:center">${costoLabel}</p>
                <p style="font-size:11px; color:var(--ink-light); text-align:center">🗳️ ${votantes} voto${votantes !== 1 ? 's' : ''}</p>
            </div>`
        })
        html += `</div>`

        // Precio de la misión — visible para todos, editable solo para admin
        // TODO: estos valores son temporales. En el futuro se moverán a una sección
        // dedicada de configuración donde se calcularán automáticamente según
        // la cantidad de miembros activos y otros parámetros del clan.
        // Valores a reemplazar/mover: COSTO_ORO_DEFAULT (700) y COSTO_GEMAS_DEFAULT (170)
        html += `<div style="background:rgba(255,252,235,0.5); border:1px solid rgba(160,128,64,0.3); border-radius:var(--radius-sm); padding:12px 16px; margin-bottom:16px">
            <p style="font-family:Cinzel,serif; font-size:10px; color:var(--muted); letter-spacing:1px; margin-bottom:10px">${t('costoPorMiembro')}</p>
            <div style="display:flex; flex-wrap:wrap; gap:16px; align-items:center">
                <div style="display:flex; align-items:center; gap:8px">
                    <span style="font-size:15px">🥇</span>
                    ${rolActual === 'admin'
                        ? `<input type="number" id="costo-oro" value="${costoOroDefault}" min="0" style="width:90px; padding:5px 8px; border:1px solid var(--parchment-shadow); border-radius:3px; background:rgba(255,252,235,0.9); color:var(--accent-dark); font-family:Cinzel,serif; font-size:14px; font-weight:700">`
                        : `<span style="font-family:Cinzel,serif; font-size:15px; font-weight:700; color:var(--accent-dark)">${costoOroDefault}</span>`
                    }
                    <span style="font-size:12px; color:var(--muted)">oro</span>
                </div>
                <div style="display:flex; align-items:center; gap:8px">
                    <span style="font-size:15px">💎</span>
                    ${rolActual === 'admin'
                        ? `<input type="number" id="costo-gemas" value="${costoGemasDefault}" min="0" style="width:90px; padding:5px 8px; border:1px solid var(--parchment-shadow); border-radius:3px; background:rgba(255,252,235,0.9); color:#7b2da8; font-family:Cinzel,serif; font-size:14px; font-weight:700">`
                        : `<span style="font-family:Cinzel,serif; font-size:15px; font-weight:700; color:#7b2da8">${costoGemasDefault}</span>`
                    }
                    <span style="font-size:12px; color:var(--muted)">gemas</span>
                </div>
            </div>
        </div>`

        html += `<div style="display:flex; flex-wrap:wrap; gap:10px; align-items:flex-start">`
        if (rolActual === 'admin' || rolActual === 'lider') {
            html += `<div style="display:flex; flex-direction:column; align-items:center; gap:4px">
                <button class="btn-primary" onclick="confirmarIniciarMision()">⚔️ ${t('iniciarseMision')}</button>
            </div>`
            html += `<div style="display:flex; flex-direction:column; align-items:center; gap:4px">
                <button class="btn-primary" id="btn-shuffle" style="background:linear-gradient(180deg,#4a2e7a,#2e1a5a)" onclick="hacerShuffle()">🔀 Shuffle</button>
                <span style="font-size:11px; color:var(--muted); font-style:italic">🗳️ ${shuffleVotos} voto${shuffleVotos !== 1 ? 's' : ''}</span>
            </div>`
        }
        html += `</div>`
    } else {
        html += `<p style="color:var(--muted); font-style:italic">${t('noMisiones')}</p>`
    }
    html += `</div>`

    // PREMIOS Y MULTAS (admin, lider y espectador)
    if (rolActual === 'admin' || rolActual === 'lider' || rolActual === 'espectador') {
        const premioOro1 = Math.round(costoOroDefault * premioPct1 / 100)
        const premioOro2 = Math.round(costoOroDefault * premioPct2 / 100)
        const premioOro3 = Math.round(costoOroDefault * premioPct3 / 100)
        html += `<div class="card">
            <h3>${t('premios')}</h3>
            <p style="font-size:13px; color:var(--muted); font-style:italic; margin-bottom:14px">
                🥇 1er puesto: <b>${premioPct1}% = ${premioOro1} oro</b> &nbsp;·&nbsp;
                🥈 2do puesto: <b>${premioPct2}% = ${premioOro2} oro</b> &nbsp;·&nbsp;
                🥉 3er puesto: <b>${premioPct3}% = ${premioOro3} oro</b>
            </p>
            <div id="panel-premios"><p style="color:var(--muted); font-style:italic; font-size:13px">${t('cargando')}</p></div>
        </div>`
        html += `<div class="card">
            <h3>${t('multas')}</h3>
            <p style="font-size:13px; color:var(--muted); font-style:italic; margin-bottom:14px">
                Jugadores con menos de <b>${multaXpMin} XP</b>. Multa: <b>${multaPct}% de ${costoOroDefault} = 🥇 ${Math.round(costoOroDefault * multaPct / 100)} oro</b>.
            </p>
            <div id="panel-multas"><p style="color:var(--muted); font-style:italic; font-size:13px">${t('cargando')}</p></div>
        </div>`
    }

    html += `<div class="card">
        <h3>${t('registroDonaciones')}</h3>
        <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center; margin-bottom:16px">
            ${(rolActual === 'admin' || rolActual === 'lider' || rolActual === 'colider') ? `<button class="btn-primary" id="btn-sincronizar-inicio" style="background:linear-gradient(180deg,#1a5e6b,#0a3e4a)" onclick="sincronizarDonaciones('inicio')">${t('sincronizar')}</button>` : ''}
            <button class="btn-tracker" onclick="abrirModalDonaciones()">${t('verRegistro')}</button>
            <span id="sync-info-inicio" style="font-size:12px; color:var(--muted); font-style:italic"></span>
        </div>
        <div id="sync-registro"></div>
    </div>`

    contenido.innerHTML = html

    if (rolActual === 'admin' || rolActual === 'lider' || rolActual === 'espectador') {
        cargarPremiosYMultas(costoOroDefault, premioPct1, premioPct2, premioPct3, multaXpMin, multaPct)
    }

    fetch('/clan/sincronizar/info').then(r => r.json()).then(data => {
        const el = document.getElementById('sync-info-inicio')
        if (el && data.ultima_sincronizacion) {
            const fecha = new Date(data.ultima_sincronizacion).toLocaleString('es-AR')
            el.textContent = `${t('ultimaSync')} ${fecha}`
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

function hacerShuffle() {
    if (!confirm('⚠️ El shuffle gasta oro o gemas del clan. ¿Estás seguro?')) return
    const btn = document.getElementById('btn-shuffle')
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Shuffleando...' }
    fetch('/clan/quests/shuffle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
        .then(r => r.json())
        .then(data => {
            if (data.ok) { mostrarToast('✓ Misiones shuffleadas'); setTimeout(() => cargarInicio(), 1000) }
            else { mostrarToast('Error: ' + (data.error || 'No se pudo hacer shuffle'), 'error'); if (btn) { btn.disabled = false; btn.textContent = '🔀 Shuffle' } }
        }).catch(() => { mostrarToast('Error al hacer shuffle', 'error'); if (btn) { btn.disabled = false; btn.textContent = '🔀 Shuffle' } })
}

function confirmarIniciarMision() {
    if (!misionSeleccionada) { mostrarToast('Seleccioná una misión primero', 'error'); return }
    const card = document.getElementById(`quest-card-${misionSeleccionada}`)
    if (!card) return
    const imagen = card.querySelector('img')?.src || ''
    const parrafos = card.querySelectorAll('p')
    const costoLabel = parrafos[0]?.textContent || ''
    const votosLabel = parrafos[1]?.textContent || ''
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

    // Determinar si la misión es de oro o gemas
    const card = document.getElementById(`quest-card-${misionSeleccionada}`)
    const esPorGemas = card && card.dataset.gemas === '1'

    // Leer costo según tipo (admin puede haberlo editado temporalmente)
    const costoOroEl = document.getElementById('costo-oro')
    const costoGemasEl = document.getElementById('costo-gemas')
    const costoOro = costoOroEl ? parseInt(costoOroEl.value) || 700 : 700
    const costoGemas = costoGemasEl ? parseInt(costoGemasEl.value) || 170 : 170

    fetch('/clan/quests/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId: misionSeleccionada })
    }).then(r => r.json()).then(data => {
        if (data.ok) {
            mostrarToast('✓ ¡Misión iniciada!')
            document.getElementById('modal-confirmar-mision').style.display = 'none'

            // Descontar carteras de miembros activos
            const activos = miembrosCache.filter(m => m.participateInClanQuests !== false)
            activos.forEach(m => {
                fetch(`/clan/carteras/${m.playerId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(esPorGemas
                        ? { gemas: -costoGemas, username: m.username, restar: true }
                        : { oro: -costoOro, username: m.username, restar: true }
                    )
                }).catch(() => {})
            })

            misionSeleccionada = null
            setTimeout(() => cargarInicio(), 1000)
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
        cargarListaAnunciosAuto()
    }
}

function cargarListaAnunciosAuto() {
    const el = document.getElementById('lista-anuncios-auto')
    if (!el) return
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    fetch('/ajustes/anuncios_auto').then(r => r.json()).then(anuncios => {
        if (!anuncios || anuncios.length === 0) {
            el.innerHTML = `<p style="color:var(--muted); font-style:italic; font-size:13px">${t('noAnuncios')} configurados</p>`
            return
        }
        let h = ''
        anuncios.forEach((a, i) => {
            const activo = a.activo || false
            const dia = dias[a.dia_semana ?? 0] || 'N/A'
            const hora = a.hora_gmt || '—'
            const luz = activo
                ? `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#2d6a1e; box-shadow:0 0 6px #2d6a1e; flex-shrink:0"></span>`
                : `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#8b2010; box-shadow:0 0 4px #8b2010; flex-shrink:0"></span>`
            h += `<div style="display:flex; gap:12px; align-items:flex-start; padding:12px 0; border-bottom:1px solid rgba(160,128,64,0.2)">
                <div style="display:flex; align-items:center; gap:8px; flex-shrink:0; padding-top:2px">
                    ${luz}
                    <span style="font-family:Cinzel,serif; font-size:11px; color:var(--muted)">Anuncio ${i + 1}</span>
                </div>
                <div style="flex:1">
                    <p style="font-size:14px; color:var(--ink-light); margin-bottom:6px; line-height:1.5">${a.mensaje || '<em style="color:var(--muted)">Sin mensaje configurado</em>'}</p>
                    <p style="font-size:11px; color:var(--muted); font-family:Cinzel,serif; letter-spacing:0.5px">${dia} · ${hora} GMT</p>
                </div>
            </div>`
        })
        el.innerHTML = h
    }).catch(() => {
        el.innerHTML = `<p style="color:var(--muted); font-style:italic; font-size:13px">Error al cargar</p>`
    })
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
    contenido.innerHTML = `<h1>👥 ${t('miembrosTitle')}</h1><p class="cargando">${t('cargando')}</p>`
    Promise.all([
        fetch('/clan/members').then(r => r.json()),
        fetch('/clan/carteras').then(r => r.json()),
        fetch('/config/costo_oro_mision').then(r => r.json()).catch(() => ({ valor: '700' })),
        fetch('/config/costo_gemas_mision').then(r => r.json()).catch(() => ({ valor: '170' }))
    ]).then(([members, carteras, cfgOro, cfgGemas]) => {
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
        const costoOro = parseInt(cfgOro.valor) || 700
        const costoGemas = parseInt(cfgGemas.valor) || 170
        datosCache.miembros = { members: membrosReales, carteras, costoOro, costoGemas }
        mostrarMiembros(membrosReales, carteras, costoOro, costoGemas)
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

function mostrarMiembros(members, carteras = {}, costoOro = 700, costoGemas = 170) {
    const contenido = document.getElementById('contenido')
    if (!members || members.length === 0) {
        contenido.innerHTML = `<h1>👥 ${t('miembrosTitle')}</h1><div class="card"><p style="color:var(--muted); font-style:italic">${t('noHay')}</p></div>`
        return
    }

    const LEADER_ID = '304dec10-4074-40ff-884d-392099bacdf1'
    members.sort((a, b) => {
        const rango = m => m.playerId === LEADER_ID ? 0 : m.isCoLeader ? 1 : 2
        const diff = rango(a) - rango(b)
        if (diff !== 0) return diff
        return (a.username || '').localeCompare(b.username || '', 'es', { sensitivity: 'base' })
    })

    const activosCount = members.filter(m => m.participateInClanQuests !== false).length
    const totalCount = members.length

    let html = `<h1>👥 ${t('miembrosTitle')}</h1>`

    html += `<div class="card" style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0">${t('cambiosNombre')}</h3>
        <div style="display:flex; gap:8px; align-items:center">
            ${(rolActual === 'admin' || rolActual === 'lider' || rolActual === 'colider') ? `<button class="btn-primary" style="background:linear-gradient(180deg,#1a5e6b,#0a3e4a); padding:6px 14px; font-size:10px" onclick="actualizarNombres(this)">🔄 Actualizar nombres</button>` : ''}
            ${(rolActual === 'admin' || rolActual === 'lider' || rolActual === 'colider') ? `<button class="btn-primary" style="background:linear-gradient(180deg,#8b2010,#6b1008); padding:6px 14px; font-size:10px" onclick="abrirModalClean()">🧹 Clean</button>` : ''}
            <button class="btn-tracker" onclick="abrirDrawerCambios()">${t('verHistorial')}</button>
        </div>
    </div>`

    // Panel de acciones masivas - solo para admin y lider
    if (rolActual === 'admin' || rolActual === 'lider') {
    html += `
    <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:8px">
            <h3 style="margin:0">${t('accionesMasivas')}</h3>
            <div style="display:flex; align-items:center; gap:8px; background:rgba(160,128,64,0.1); border:1px solid rgba(160,128,64,0.25); border-radius:var(--radius-sm); padding:6px 14px">
                <span style="font-size:13px">⚔️</span>
                <span style="font-family:Cinzel,serif; font-size:11px; color:var(--muted); letter-spacing:0.5px">Activos para misión:</span>
                <span style="font-family:Cinzel,serif; font-size:14px; font-weight:700; color:${activosCount === totalCount ? 'var(--ok)' : activosCount === 0 ? 'var(--red)' : 'var(--accent)'}">${activosCount}</span>
                <span style="font-family:Cinzel,serif; font-size:11px; color:var(--muted)">/ ${totalCount}</span>
            </div>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:flex-end; margin-bottom:16px">
            <button class="btn-primary" onclick="activarTodos(true)">${t('activarTodos')}</button>
            <button class="btn-primary" style="background:linear-gradient(180deg,#8b5e1a,#6b3e0a)" onclick="activarTodos(false)">${t('desactivarTodos')}</button>
        </div>
        <div style="padding-top:16px; border-top:1px solid rgba(160,128,64,0.2)">
            <p style="font-family:Cinzel,serif; font-size:11px; color:var(--muted); letter-spacing:1px; margin-bottom:12px">${t('activarPorCartera')}</p>
            <div style="display:flex; flex-direction:column; gap:12px">
                <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center">
                    <span style="font-size:13px; color:var(--ink-light); min-width:16px">🥇</span>
                    <input type="number" id="filtroOro" value="${costoOro}" min="0"
                        style="flex:1; min-width:160px; max-width:220px; padding:7px 10px; border-radius:var(--radius-sm); border:1px solid var(--parchment-shadow); background:rgba(255,252,235,0.8); color:var(--ink); font-family:Almendra,serif; font-size:14px; outline:none">
                    <button class="btn-primary" style="padding:7px 16px; font-size:11px; white-space:nowrap" onclick="activarConFiltro('oro')">${t('activarConOro')}</button>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center">
                    <span style="font-size:13px; color:var(--ink-light); min-width:16px">💎</span>
                    <input type="number" id="filtroGemas" value="${costoGemas}" min="0"
                        style="flex:1; min-width:160px; max-width:220px; padding:7px 10px; border-radius:var(--radius-sm); border:1px solid var(--parchment-shadow); background:rgba(255,252,235,0.8); color:var(--ink); font-family:Almendra,serif; font-size:14px; outline:none">
                    <button class="btn-primary" style="padding:7px 16px; font-size:11px; white-space:nowrap" onclick="activarConFiltro('gemas')">${t('activarConGemas')}</button>
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
                    ${(rolActual === 'admin' || rolActual === 'lider' || rolActual === 'colider') ? `
                    <div onclick="toggleParticipacion('${m.playerId}', ${participa})"
                         id="toggle-${m.playerId}"
                         style="width:44px; height:24px; border-radius:12px; background:${participa ? '#2d6a1e' : 'var(--muted)'}; cursor:pointer; position:relative; transition:background 0.3s; border:1px solid rgba(0,0,0,0.1); flex-shrink:0">
                        <div style="width:18px; height:18px; border-radius:50%; background:white; position:absolute; top:2px; left:${participa ? '22px' : '2px'}; transition:left 0.3s; box-shadow:0 1px 3px rgba(0,0,0,0.2)" id="toggle-ball-${m.playerId}"></div>
                    </div>` : `
                    <div style="width:44px; height:24px; border-radius:12px; background:${participa ? '#2d6a1e' : 'var(--muted)'}; position:relative; border:1px solid rgba(0,0,0,0.1); flex-shrink:0; opacity:0.7">
                        <div style="width:18px; height:18px; border-radius:50%; background:white; position:absolute; top:2px; left:${participa ? '22px' : '2px'}; box-shadow:0 1px 3px rgba(0,0,0,0.2)"></div>
                    </div>`}
                    <span style="font-size:12px; color:${participa ? '#2d6a1e' : 'var(--muted)'}; font-style:italic" id="toggle-label-${m.playerId}">${participa ? t('activo') : t('inactivo')}</span>
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
                <div id="drawer-cambios-contenido"><p style="color:var(--muted); font-style:italic; font-size:14px">${t('cargando')}</p></div>
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
            if (info) info.textContent = `${t('ultimaSync')} ${ahora} · ${data.procesadas} cartera(s) actualizada(s)`
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
            el.innerHTML = `<p style="color:var(--muted); font-style:italic; font-size:13px">No hay ${t('ultimos14dias')}.</p>`
            return
        }

        let html = `<table><tr><th>${t('jugadorCol')}</th><th>${t('oro')}</th><th>${t('gemas')}</th><th>${t('descripcionCol')}</th><th>${t('fecha')}</th></tr>`
        recientes.forEach(d => {
            const fecha = d.creationTime ? d.creationTime.slice(0,10).split('-').reverse().join('-') : 'N/A'
            const hora = d.creationTime ? d.creationTime.slice(11,16) : ''
            const jugador = d.playerUsername || 'Bot'
            const oro = d.gold != null && d.gold !== 0
                ? `<span style="color:${d.gold < 0 ? 'var(--red)' : 'var(--accent-dark)'}">🥇 ${d.gold > 0 ? '+' : ''}${d.gold}</span>`
                : '—'
            const gemas = d.gems != null && d.gems !== 0
                ? `<span style="color:${d.gems < 0 ? 'var(--red)' : '#7b2da8'}">💎 ${d.gems > 0 ? '+' : ''}${d.gems}</span>`
                : '—'
            const tipoMap = { 'DONATE': '—', 'QUEST_START': '⚔️ Misión iniciada', 'QUEST_REWARD': '🏆 Premio misión', 'SHUFFLE': '🔀 Shuffle', 'PURCHASE': '🛒 Compra' }
            const tipoLabel = tipoMap[d.type] || (d.type || '')
            const comentario = d.comment ? d.comment.trim() : ''
            const desc = comentario ? `${tipoLabel ? tipoLabel + '    ' : ''}${comentario}` : (tipoLabel || '—')
            html += `<tr>
                <td style="font-family:Cinzel,serif; font-weight:600">${jugador}</td>
                <td>${oro}</td>
                <td>${gemas}</td>
                <td style="font-size:12px; color:var(--muted); font-style:italic">${desc}</td>
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
                    <p style="color:var(--muted); font-style:italic; font-size:14px">${t('cargando')}</p>
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
        let html = `<table><tr><th>${t('jugadorCol')}</th><th>${t('oro')}</th><th>${t('gemas')}</th><th>${t('descripcionCol')}</th><th>${t('fecha')}</th></tr>`
        todos.forEach(d => {
            const fecha = d.creationTime ? d.creationTime.slice(0,10).split('-').reverse().join('-') : 'N/A'
            const hora = d.creationTime ? d.creationTime.slice(11,16) : ''
            const jugador = d.playerUsername || 'Bot'
            const oro = d.gold != null && d.gold !== 0
                ? `<span style="color:${d.gold < 0 ? 'var(--red)' : 'var(--accent-dark)'}">🥇 ${d.gold > 0 ? '+' : ''}${d.gold}</span>`
                : '—'
            const gemas = d.gems != null && d.gems !== 0
                ? `<span style="color:${d.gems < 0 ? 'var(--red)' : '#7b2da8'}">💎 ${d.gems > 0 ? '+' : ''}${d.gems}</span>`
                : '—'
            const tipoMap = { 'DONATE': 'Donación', 'QUEST_START': '⚔️ Misión iniciada', 'QUEST_REWARD': '🏆 Premio misión', 'SHUFFLE': '🔀 Shuffle', 'PURCHASE': '🛒 Compra' }
            const tipoLabel = tipoMap[d.type] || (d.type || '')
            const comentario = d.comment ? d.comment.trim() : ''
            const desc = comentario ? `${tipoLabel ? tipoLabel + ' · ' : ''}${comentario}` : (tipoLabel || '—')
            html += `<tr>
                <td style="font-family:Cinzel,serif; font-weight:600">${jugador}</td>
                <td>${oro}</td>
                <td>${gemas}</td>
                <td style="font-size:12px; color:var(--muted); font-style:italic">${desc}</td>
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
    fetch('/clan/logs').then(r => r.json()).then(logs => {
        datosCache.logs = logs
        mostrarLogs(logs)
    })
}

function mostrarLogs(logs) {
    const contenido = document.getElementById('contenido')
    let html = `<h1>📋 ${t('actividadClan')}</h1><div class="card">`
    if (!logs || logs.length === 0) {
        html += `<p style="color:var(--muted); font-style:italic">${t('noActividad')}</p>`
    } else {
        const visibles = logs.slice(0, 10)
        const resto = logs.slice(10)
        html += `<table><tr><th>${t('fecha')}</th><th>${t('evento')}</th><th>${t('jugador')}</th></tr>`
        visibles.forEach(l => {
            const fecha = l.creationTime ? l.creationTime.slice(0, 10).split('-').reverse().join('-') : 'N/A'
            const jugador = l.playerUsername || 'Bot'
            html += `<tr><td>${fecha}</td><td>${l.action || 'N/A'}</td><td>${jugador}</td></tr>`
        })
        html += `</table>`
        if (resto.length > 0) {
            html += `<div id="logs-extra" style="display:none"><table style="margin-top:0; border-top:none"><tr>` // sin header repetido
            html += `</tr>`
            resto.forEach(l => {
                const fecha = l.creationTime ? l.creationTime.slice(0, 10).split('-').reverse().join('-') : 'N/A'
                const jugador = l.playerUsername || 'Bot'
                html += `<tr><td>${fecha}</td><td>${l.action || 'N/A'}</td><td>${jugador}</td></tr>`
            })
            html += `</table></div>`
            html += `<button class="btn-tracker" style="margin-top:12px" id="btn-ver-mas-logs"
                onclick="
                    document.getElementById('logs-extra').style.display='block';
                    this.style.display='none'
                ">Ver más (${resto.length} registros)</button>`
        }
    }
    html += `</div>`
    contenido.innerHTML = html
}

// =================== STATS ===================
function cargarStats() {
    const contenido = document.getElementById('contenido')
    contenido.innerHTML = `<h1>📊 ${t('estadisticas')}</h1><p class="cargando">${t('cargando')}</p>`

    Promise.all([
        fetch('/clan/estadisticas').then(r => r.json()),
        fetch('/clan/members').then(r => r.json())
    ]).then(([rows, members]) => {
        datosCache.stats = { rows, members }
        const miembrosActuales = new Set(members.map(m => m.playerId))

        // Agrupar por player_id
        const porJugador = {}
        rows.forEach(r => {
            if (!porJugador[r.player_id]) {
                porJugador[r.player_id] = { username: r.username, misiones: [] }
            }
            porJugador[r.player_id].misiones.push({
                mission_id: r.mission_id,
                mission_date: r.mission_date,
                participo: r.participo
            })
        })

        // Obtener lista de misiones únicas ordenadas
        const misionesUnicas = [...new Set(rows.map(r => r.mission_date))].sort()

        if (misionesUnicas.length === 0) {
            contenido.innerHTML = `<h1>📊 Estadísticas</h1>
                <div class="card"><p style="color:var(--muted); font-style:italic">Aún no hay misiones registradas. Los datos se empezarán a guardar con la próxima misión activa.</p></div>`
            return
        }

        // Calcular % participación y ordenar
        const jugadores = Object.entries(porJugador).map(([pid, data]) => {
            const total = data.misiones.length
            const participadas = data.misiones.filter(m => m.participo).length
            const pct = total > 0 ? Math.round(participadas / total * 100) : 0
            return { pid, username: data.username, misiones: data.misiones, total, participadas, pct, enClan: miembrosActuales.has(pid) }
        }).sort((a, b) => b.pct - a.pct)

        const colorPct = pct => pct >= 80 ? '#2d6a1e' : pct >= 60 ? '#8b6914' : pct >= 40 ? '#c47a2a' : pct >= 20 ? '#8b2010' : '#5a3c1e'
        const labelPct = pct => pct >= 80 ? 'EXCELENTE' : pct >= 60 ? 'BUENO' : pct >= 40 ? 'REGULAR' : pct >= 20 ? 'MALO' : 'PÉSIMO'

        let html = `<h1>📊 Estadísticas</h1>`

        // Leyenda
        const exMiembros = jugadores.filter(j => !j.enClan)
        html += `<div class="card">
            <h3 style="display:flex; justify-content:space-between; align-items:center">${t('participacionMisiones')}
                ${(rolActual === 'admin' || rolActual === 'lider') && exMiembros.length > 0 ? `
                <button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#8b2010,#6b1008)" onclick="limpiarExMiembrosStats()">
                    🧹 Limpiar ex-miembros (${exMiembros.length})
                </button>` : ''}
            </h3>
            <p style="font-size:13px; color:var(--muted); font-style:italic; margin-bottom:14px">
                Registro de participación desde que el bot comenzó a trackear. Hacé click en un miembro para ver su historial.
            </p>
            <div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:18px">
                <span style="font-size:12px; color:var(--muted)">
                    <span style="color:#2d6a1e">●</span> Excelente (80-100%)
                    <span style="color:#8b6914; margin-left:8px">●</span> Bueno (60-79%)
                    <span style="color:#c47a2a; margin-left:8px">●</span> Regular (40-59%)
                    <span style="color:#8b2010; margin-left:8px">●</span> Malo (20-39%)
                    <span style="color:#5a3c1e; margin-left:8px">●</span> Pésimo (0-19%)
                </span>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px">`

        jugadores.forEach(j => {
            const color = colorPct(j.pct)
            const label = labelPct(j.pct)
            const opacidad = j.enClan ? '1' : '0.5'
            html += `
            <div style="border:1px solid rgba(160,128,64,0.25); border-radius:var(--radius-sm); overflow:hidden; opacity:${opacidad}">
                <div onclick="toggleHistorial('hist-${j.pid}')"
                    style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; cursor:pointer; background:rgba(${j.enClan ? '160,128,64' : '100,80,40'},0.08)">
                    <div>
                        <span style="font-family:Cinzel,serif; font-size:13px; font-weight:600; color:var(--ink)">${j.username}</span>
                        ${!j.enClan ? `<span style="font-size:10px; color:var(--muted); margin-left:8px; font-style:italic">(ya no en el clan)</span>` : ''}
                        <p style="font-size:12px; color:var(--muted); margin-top:2px">${j.participadas} de ${j.total} misiones</p>
                    </div>
                    <div style="text-align:right">
                        <span style="font-family:Cinzel,serif; font-size:18px; font-weight:700; color:${color}">${j.pct}%</span>
                        <p style="font-family:Cinzel,serif; font-size:10px; color:${color}; letter-spacing:1px">${label}</p>
                    </div>
                </div>
                <div id="hist-${j.pid}" style="display:none; padding:12px 16px; border-top:1px solid rgba(160,128,64,0.2); background:rgba(255,252,235,0.3)">
                    <div style="display:flex; flex-direction:column; gap:6px">
                        ${j.misiones.sort((a,b) => b.mission_date.localeCompare(a.mission_date)).map(m => {
                            const fecha = m.mission_date.split('-').reverse().join('-')
                            return `<div style="display:flex; align-items:center; justify-content:space-between; padding:6px 10px; border-radius:3px; background:rgba(${m.participo ? '45,106,30' : '139,32,16'},0.08); border:1px solid rgba(${m.participo ? '45,106,30' : '139,32,16'},0.2)">
                                <span style="font-size:13px; color:var(--ink)">${fecha}</span>
                                <span style="font-size:12px; font-family:Cinzel,serif; color:${m.participo ? '#2d6a1e' : '#8b2010'}">
                                    ${m.participo ? '✓ Participó' : '✗ No participó'}
                                </span>
                            </div>`
                        }).join('')}
                    </div>
                </div>
            </div>`
        })

        html += `</div></div>`
        contenido.innerHTML = html

    }).catch(() => {
        document.getElementById('contenido').innerHTML = `<h1>📊 Estadísticas</h1>
            <div class="card"><p style="color:var(--muted)">Error al cargar estadísticas</p></div>`
    })
}

function toggleHistorial(id) {
    const el = document.getElementById(id)
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none'
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
    setInterval(() => fetch('/auth/ping').catch(() => {}), 15 * 1000)
    const res = await fetch('/auth/me')
    if (res.status === 401) {
        window.location.href = '/'
        return
    }
    const data = await res.json()
    rolActual = data.rol
    // Cargar idioma: primero del servidor, si no hay usar localStorage
    idiomaActual = data.idioma || localStorage.getItem('idioma') || 'es'
    localStorage.setItem('idioma', idiomaActual)

    // Aplicar tema del clan
    if (data.tema && Object.keys(data.tema).length > 0) {
        const t = data.tema
        const root = document.documentElement
        if (t.color_bg) root.style.setProperty('--bg', t.color_bg)
        if (t.color_accent) {
            // Calcular variantes del accent automáticamente
            root.style.setProperty('--accent', t.color_accent)
            root.style.setProperty('--accent-dark', ajustarBrillo(t.color_accent, -30))
            root.style.setProperty('--accent-light', ajustarBrillo(t.color_accent, 30))
            root.style.setProperty('--border', ajustarBrillo(t.color_accent, -10))
        }
        if (t.color_parchment) {
            root.style.setProperty('--parchment', t.color_parchment)
            root.style.setProperty('--parchment-dark', ajustarBrillo(t.color_parchment, -15))
        }
        if (t.icono) {
            const iconos = document.querySelectorAll('.sidebar-icon')
            iconos.forEach(el => el.textContent = t.icono)
        }
        if (t.nombre_display) {
            const titulos = document.querySelectorAll('.sidebar-header h2, #topbar-title')
            titulos.forEach(el => { if (!el.id || el.id === 'topbar-title') el.textContent = t.nombre_display })
        }
    }

    const topbarUser = document.getElementById('topbar-username')
    if (topbarUser) topbarUser.textContent = data.username

    // Mostrar nombre, selector de idioma y botón logout en sidebar
    const footer = document.querySelector('.sidebar-footer')
    if (footer) {
        const rolLabel = data.rol === 'admin' ? '✦ ADMIN ✦' : data.rol === 'lider' ? '✦ LÍDER ✦' : data.rol === 'colider' ? '✦ CO-LÍDER ✦' : data.rol === 'espectador' ? '✦ ESPECTADOR ✦' : ''
        const rolColor = data.rol === 'admin' ? 'var(--accent)' : data.rol === 'lider' ? '#9b5e1a' : data.rol === 'colider' ? '#7a4e2a' : data.rol === 'espectador' ? '#4a6b8a' : ''
        const langs = [
            { code: 'es', flag: '🇪🇸', label: 'ES' },
            { code: 'en', flag: '🇺🇸', label: 'EN' },
            { code: 'pt', flag: '🇧🇷', label: 'PT' }
        ]
        const langBtns = langs.map(l => `<button class="lang-btn" data-lang="${l.code}" onclick="cambiarIdioma('${l.code}')"
            style="background:${idiomaActual===l.code?'rgba(196,122,42,0.25)':'transparent'};border:1px solid ${idiomaActual===l.code?'rgba(196,122,42,0.6)':'transparent'};border-radius:3px;cursor:pointer;font-size:14px;padding:3px 7px;opacity:${idiomaActual===l.code?'1':'0.75'};transition:all 0.2s"
            title="${l.label}">${l.flag} <span style="font-family:Cinzel,serif;font-size:9px;color:${idiomaActual===l.code?'var(--accent-light)':'rgba(160,128,80,0.8)'};vertical-align:middle">${l.label}</span></button>`).join('')
        footer.innerHTML = `
            <p style="color:rgba(160,128,80,0.6); font-size:10px; margin-bottom:6px">${data.username}</p>
            ${rolLabel ? `<p style="color:${rolColor}; font-size:9px; letter-spacing:1px; margin-bottom:6px">${rolLabel}</p>` : ''}
            <div style="display:flex;align-items:center;gap:4px;">
                ${langBtns}
            </div>
        `
        // Mostrar botón cambiar clan en el header solo para admin
        const btnCambiarClanHeader = document.getElementById('btn-cambiar-clan-header')
        if (btnCambiarClanHeader && data.rol === 'admin') {
            btnCambiarClanHeader.style.display = 'block'
        }
    }

    // Mostrar/ocultar botón Tracker según rol
    const btnTracker = document.getElementById('btn-tracker')
    if (btnTracker) {
        if (data.rol !== 'admin') btnTracker.style.display = 'none'
    }

    // Si es espectador, deshabilitar todos los controles con CSS global
    if (data.rol === 'espectador') {
        const style = document.createElement('style')
        style.id = 'espectador-style'
        style.textContent = `
            #contenido button,
            #contenido input,
            #contenido textarea,
            #contenido select {
                pointer-events: none !important;
                opacity: 0.5 !important;
                cursor: not-allowed !important;
            }
        `
        document.head.appendChild(style)
    }

    // Agregar botones en nav según rol — orden: Comandos, Ajustes, Admin, Tracker
    if (data.rol === 'admin' || data.rol === 'lider' || data.rol === 'colider' || data.rol === 'espectador') {
        const navSection = document.querySelector('.nav-section')
        if (navSection && !document.getElementById('btn-comandos')) {
            const btn = document.createElement('button')
            btn.className = 'nav-btn'
            btn.id = 'btn-comandos'
            btn.innerHTML = `<span class="nav-icon">🤖</span> ${t('comandos')}`
            btn.onclick = function() { mostrarSeccion('comandos', this) }
            navSection.appendChild(btn)
        }
        if (navSection && !document.getElementById('btn-ajustes')) {
            const btn = document.createElement('button')
            btn.className = 'nav-btn'
            btn.id = 'btn-ajustes'
            btn.innerHTML = `<span class="nav-icon">⚙️</span> ${t('ajustes')}`
            btn.onclick = function() { mostrarSeccion('ajustes', this) }
            navSection.appendChild(btn)
        }
    }
    // Admin solo para admin y espectador (solo lectura para espectador)
    if (data.rol === 'admin' || data.rol === 'espectador') {
        const navSection = document.querySelector('.nav-section')
        if (navSection && !document.getElementById('btn-admin')) {
            const btn = document.createElement('button')
            btn.className = 'nav-btn'
            btn.id = 'btn-admin'
            btn.innerHTML = `<span class="nav-icon">🛡️</span> ${t('admin')}`
            btn.onclick = function() { mostrarSeccion('admin', this) }
            navSection.appendChild(btn)
        }
    }
    // Tracker solo para admin
    if (data.rol === 'admin') {
        const navSection = document.querySelector('.nav-section')
        if (navSection && !document.getElementById('btn-tracker')) {
            const btn = document.createElement('button')
            btn.className = 'nav-btn'
            btn.id = 'btn-tracker'
            btn.innerHTML = `<span class="nav-icon">🔍</span> ${t('tracker')}`
            btn.onclick = function() { window.location.href = '/tracker/' }
            navSection.appendChild(btn)
        }
    }
}

function enviarMensajeChat() {
    const msg = document.getElementById('admin-chat-msg')?.value.trim()
    if (!msg) { mostrarToast('Escribí un mensaje primero', 'error'); return }
    fetch('/clan/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
    }).then(r => r.json()).then(data => {
        if (data.ok) {
            mostrarToast('✓ Mensaje enviado al chat')
            document.getElementById('admin-chat-msg').value = ''
        } else mostrarToast('Error: ' + (data.error || 'desconocido'), 'error')
    }).catch(() => mostrarToast('Error al enviar', 'error'))
}

function limpiarExMiembrosStats() {
    if (!confirm('¿Eliminar de estadísticas a todos los jugadores que ya no están en el clan?')) return
    fetch('/clan/stats/limpiar-ex', { method: 'DELETE' })
        .then(r => r.json())
        .then(data => {
            if (data.ok) {
                mostrarToast(`✓ ${data.eliminados} jugador(es) eliminado(s) de estadísticas`)
                cargarStats()
            } else mostrarToast('Error: ' + (data.error || 'desconocido'), 'error')
        }).catch(() => mostrarToast('Error al limpiar', 'error'))
}

async function cerrarSesion() {
    await fetch('/auth/logout', { method: 'POST' })
    window.location.href = '/'
}

// =================== SELECTOR DE CLAN (solo admin) ===================
function abrirSelectorClan() {
    let modal = document.getElementById('modal-cambiar-clan')
    if (!modal) {
        modal = document.createElement('div')
        modal.id = 'modal-cambiar-clan'
        modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:998; display:flex; align-items:center; justify-content:center; padding:20px'
        modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none' })
        document.body.appendChild(modal)
    }
    modal.style.display = 'flex'
    modal.innerHTML = `
        <div style="background:var(--parchment); border:2px solid var(--border); border-radius:4px; padding:28px; width:100%; max-width:400px; box-shadow:0 8px 40px rgba(0,0,0,0.5)">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid rgba(160,128,64,0.3); padding-bottom:12px">
                <span style="font-family:Cinzel,serif; font-size:14px; font-weight:700; color:var(--ink)">🔀 Cambiar clan</span>
                <button onclick="document.getElementById('modal-cambiar-clan').style.display='none'" style="background:none; border:none; cursor:pointer; font-size:20px; color:var(--accent-dark); padding:0; line-height:1">✕</button>
            </div>
            <p style="font-size:13px; color:var(--muted); font-style:italic; margin-bottom:16px">Seleccioná el clan al que querés acceder temporalmente.</p>
            <div id="lista-clanes-selector"><p style="color:var(--muted); font-style:italic">Cargando...</p></div>
        </div>`

    fetch('/admin/clanes-lista')
        .then(r => r.json())
        .then(clanes => {
            const el = document.getElementById('lista-clanes-selector')
            if (!clanes || clanes.length === 0) {
                el.innerHTML = '<p style="color:var(--muted); font-style:italic">No hay clanes registrados</p>'
                return
            }
            el.innerHTML = clanes.map(c => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid rgba(160,128,64,0.15)">
                    <span style="font-family:Cinzel,serif; font-weight:600; color:var(--ink); font-size:14px">🏰 ${c.nombre}</span>
                    <button class="btn-primary" style="padding:6px 16px; font-size:10px" onclick="cambiarClan('${c.id}', '${c.nombre}')">Entrar</button>
                </div>`).join('')
        })
        .catch(() => {
            const el = document.getElementById('lista-clanes-selector')
            if (el) el.innerHTML = '<p style="color:var(--red)">Error al cargar clanes</p>'
        })
}

function cambiarClan(clanId, nombre) {
    if (!confirm(`¿Entrar al clan "${nombre}"?`)) return
    fetch(`/admin/cambiar-clan/${clanId}`)
        .then(r => r.json())
        .then(data => {
            if (data.ok) {
                mostrarToast(`✓ Entrando a ${nombre}...`)
                setTimeout(() => window.location.reload(), 800)
            } else {
                mostrarToast('Error: ' + (data.error || 'desconocido'), 'error')
            }
        })
        .catch(() => mostrarToast('Error al cambiar clan', 'error'))
}

// =================== PANEL ADMIN ===================
function cargarAdmin() {
    if (rolActual !== 'admin' && rolActual !== 'espectador') {
        document.getElementById('contenido').innerHTML = `<h1>🛡️ ${t('admin')}</h1><div class="card"><p style="color:var(--muted)">${t('sinPermisos')}</p></div>`
        return
    }
    document.getElementById('contenido').innerHTML = `<h1>🛡️ ${t('panelAdmin')}</h1><p class="cargando">${t('cargando')}</p>`
    fetch('/admin/usuarios')
        .then(r => r.json())
        .then(usuarios => { datosCache.admin = usuarios; mostrarAdmin(usuarios) })
}

function estaConectado(ultimaActividad) {
    if (!ultimaActividad) return false
    const hace = (Date.now() - new Date(ultimaActividad).getTime()) / 1000 / 60
    return hace < 5 // conectado si activo en los últimos 5 minutos
}

function mostrarAdmin(usuarios) {
    const contenido = document.getElementById('contenido')
    let html = `<h1>🛡️ ${t('panelAdmin')}</h1>`

    // Card para enviar mensaje al chat (solo admin)
    if (rolActual === 'admin') {
        html += `<div class="card">
            <h3>💬 Enviar mensaje al chat del clan</h3>
            <p style="font-size:13px; color:var(--muted); font-style:italic; margin-bottom:12px">El mensaje se enviará desde el bot al chat del clan.</p>
            <textarea id="admin-chat-msg" placeholder="Escribí el mensaje..." style="width:100%; padding:10px 14px; border:1px solid var(--parchment-shadow); border-radius:3px; background:rgba(255,252,235,0.8); color:var(--ink); font-family:Almendra,serif; font-size:14px; resize:vertical; min-height:70px; outline:none"></textarea>
            <button class="btn-primary" style="margin-top:10px" onclick="enviarMensajeChat()">📨 Enviar al chat</button>
        </div>`
    }

    const pendientes = usuarios.filter(u => !u.aprobado && u.rol !== 'admin')
    const lideres = usuarios.filter(u => u.aprobado && u.rol === 'lider')
    const colideres = usuarios.filter(u => u.aprobado && u.rol === 'colider')
    const miembros = usuarios.filter(u => u.aprobado && u.rol === 'miembro')
    const espectadores = usuarios.filter(u => u.aprobado && u.rol === 'espectador')
    const admins = usuarios.filter(u => u.aprobado && u.rol === 'admin')

    // Solicitudes pendientes / desactivados
    if (pendientes.length > 0) {
        html += `<div class="card"><h3>${t('pendientes')}</h3>`
        pendientes.forEach(u => {
            html += `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid rgba(160,128,64,0.2); flex-wrap:wrap; gap:10px">
                <div>
                    <span style="font-family:Cinzel,serif; font-weight:600; color:var(--ink)">${u.username}</span>
                    <span style="font-size:12px; color:var(--muted); margin-left:8px">${u.created_at ? u.created_at.slice(0,10) : ''}</span>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap">
                    <button class="btn-primary" style="padding:6px 14px; font-size:10px" onclick="toggleAcceso(${u.id}, true, '${u.username}')">${t('activar')}</button>
                    <button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#8b2010,#6b1008)" onclick="eliminarUsuarioAdmin(${u.id}, '${u.username}')">${t('eliminar')}</button>
                </div>
            </div>`
        })
        html += `</div>`
    } else {
        html += `<div class="card"><p style="color:var(--muted); font-style:italic">${t('noPendientes')}</p></div>`
    }

    // Admin
    if (admins.length > 0) {
        html += `<div class="card"><h3>🛡️ ${t('administradores')}</h3>`
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
                    <span style="font-size:11px; color:var(--muted); margin-left:10px; font-style:italic">${conectado ? t('enLinea') : (u.ultima_actividad ? t('ultimaVez') + ' ' + new Date(u.ultima_actividad).toLocaleString('es-AR', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:true}) : t('nunca'))}</span>
                </div>
            </div>`
        })
        html += `</div>`
    }

    // Líderes
    html += `<div class="card"><h3>👑 ${t('lideres')}</h3>`
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
                    <span style="font-size:11px; color:var(--muted); margin-left:10px; font-style:italic">${conectado ? t('enLinea') : (u.ultima_actividad ? t('ultimaVez') + ' ' + new Date(u.ultima_actividad).toLocaleString('es-AR', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:true}) : t('nunca'))}</span>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap">
                    ${rolActual === 'admin' ? `<button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#5a3c1e,#3a2010)" onclick="cambiarRol(${u.id}, 'colider', '${u.username}')">↓ Bajar a Co-líder</button>` : ''}
                    ${rolActual === 'admin' ? `<button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#3a2c1e,#2a1c0e)" onclick="cambiarRol(${u.id}, 'miembro', '${u.username}')">↓↓ Bajar a Miembro</button>` : ''}
                    <button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#8b5e1a,#6b3e0a)" onclick="toggleAcceso(${u.id}, false, '${u.username}')">${t('desactivar')}</button>
                    ${rolActual === 'admin' ? `<button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#1a4a6b,#0a2e4a)" onclick="resetearPassword('${u.username}')">🔑 Resetear clave</button>` : ''}
                    ${rolActual === 'admin' ? `<button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#8b2010,#6b1008)" onclick="eliminarUsuarioAdmin(${u.id}, '${u.username}')">🗑️ ${t('eliminar')}</button>` : ''}
                </div>
            </div>`
        })
    }
    html += `</div>`

    // Co-líderes
    html += `<div class="card"><h3>⭐ ${t('colideres')}</h3>`
    if (colideres.length === 0) {
        html += `<p style="color:var(--muted); font-style:italic; font-size:13px">No hay co-líderes</p>`
    } else {
        colideres.forEach(u => {
            const conectado = estaConectado(u.ultima_actividad)
            const luz = conectado
                ? `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#2d6a1e; box-shadow:0 0 6px #2d6a1e; margin-right:8px; flex-shrink:0"></span>`
                : `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#8b2010; box-shadow:0 0 4px #8b2010; margin-right:8px; flex-shrink:0"></span>`
            html += `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid rgba(160,128,64,0.2); flex-wrap:wrap; gap:10px">
                <div style="display:flex; align-items:center">
                    ${luz}
                    <span style="font-family:Cinzel,serif; font-weight:600; color:var(--ink)">${u.username}</span>
                    <span style="font-size:11px; color:var(--muted); margin-left:10px; font-style:italic">${conectado ? t('enLinea') : (u.ultima_actividad ? t('ultimaVez') + ' ' + new Date(u.ultima_actividad).toLocaleString('es-AR', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:true}) : t('nunca'))}</span>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap">
                    ${rolActual === 'admin' ? `<button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#c47a2a,#9b5e1a)" onclick="cambiarRol(${u.id}, 'lider', '${u.username}')">↑ Subir a Líder</button>` : ''}
                    ${(rolActual === 'admin' || rolActual === 'lider' || rolActual === 'colider') ? `<button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#5a3c1e,#3a2010)" onclick="cambiarRol(${u.id}, 'miembro', '${u.username}')">↓ Bajar a Miembro</button>` : ''}
                    ${(rolActual === 'admin' || rolActual === 'lider' || rolActual === 'colider') ? `<button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#2a5e8b,#1a3e6b)" onclick="cambiarRol(${u.id}, 'espectador', '${u.username}')">👁 Hacer Espectador</button>` : ''}
                    <button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#8b5e1a,#6b3e0a)" onclick="toggleAcceso(${u.id}, false, '${u.username}')">${t('desactivar')}</button>
                    ${rolActual === 'admin' ? `<button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#1a4a6b,#0a2e4a)" onclick="resetearPassword('${u.username}')">🔑 Resetear clave</button>` : ''}
                    ${rolActual === 'admin' ? `<button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#8b2010,#6b1008)" onclick="eliminarUsuarioAdmin(${u.id}, '${u.username}')">🗑️ ${t('eliminar')}</button>` : ''}
                </div>
            </div>`
        })
    }
    html += `</div>`

    // Miembros
    html += `<div class="card"><h3>🐺 ${t('miembrosRol')}</h3>`
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
                    <span style="font-size:11px; color:var(--muted); margin-left:10px; font-style:italic">${conectado ? t('enLinea') : (u.ultima_actividad ? t('ultimaVez') + ' ' + new Date(u.ultima_actividad).toLocaleString('es-AR', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:true}) : t('nunca'))}</span>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap">
                    ${rolActual === 'admin' ? `<button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#c47a2a,#9b5e1a)" onclick="cambiarRol(${u.id}, 'lider', '${u.username}')">↑ Subir a Líder</button>` : ''}
                    ${(rolActual === 'admin' || rolActual === 'lider' || rolActual === 'colider') ? `<button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#9b5e1a,#7a4e2a)" onclick="cambiarRol(${u.id}, 'colider', '${u.username}')">↑ Subir a Co-líder</button>` : ''}
                    ${(rolActual === 'admin' || rolActual === 'lider' || rolActual === 'colider') ? `<button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#2a5e8b,#1a3e6b)" onclick="cambiarRol(${u.id}, 'espectador', '${u.username}')">👁 Hacer Espectador</button>` : ''}
                    <button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#8b5e1a,#6b3e0a)" onclick="toggleAcceso(${u.id}, false, '${u.username}')">${t('desactivar')}</button>
                    ${rolActual === 'admin' ? `<button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#1a4a6b,#0a2e4a)" onclick="resetearPassword('${u.username}')">🔑 Resetear clave</button>` : ''}
                    ${rolActual === 'admin' ? `<button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#8b2010,#6b1008)" onclick="eliminarUsuarioAdmin(${u.id}, '${u.username}')">🗑️ ${t('eliminar')}</button>` : ''}
                </div>
            </div>`
        })
    }
    html += `</div>`

    // Espectadores
    html += `<div class="card"><h3>👁 ${t('espectadores')}</h3>`
    if (espectadores.length === 0) {
        html += `<p style="color:var(--muted); font-style:italic; font-size:13px">No hay espectadores</p>`
    } else {
        espectadores.forEach(u => {
            const conectado = estaConectado(u.ultima_actividad)
            const luz = conectado
                ? `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#2d6a1e; box-shadow:0 0 6px #2d6a1e; margin-right:8px; flex-shrink:0"></span>`
                : `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#8b2010; box-shadow:0 0 4px #8b2010; margin-right:8px; flex-shrink:0"></span>`
            html += `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid rgba(160,128,64,0.2); flex-wrap:wrap; gap:10px">
                <div style="display:flex; align-items:center">
                    ${luz}
                    <span style="font-family:Cinzel,serif; font-weight:600; color:var(--ink)">${u.username}</span>
                    <span style="font-size:10px; color:#4a6b8a; margin-left:8px; font-family:Cinzel,serif">ESPECTADOR</span>
                    <span style="font-size:11px; color:var(--muted); margin-left:10px; font-style:italic">${conectado ? t('enLinea') : (u.ultima_actividad ? t('ultimaVez') + ' ' + new Date(u.ultima_actividad).toLocaleString('es-AR', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:true}) : t('nunca'))}</span>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap">
                    ${(rolActual === 'admin' || rolActual === 'lider' || rolActual === 'colider') ? `<button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#5a3c1e,#3a2010)" onclick="cambiarRol(${u.id}, 'miembro', '${u.username}')">↑ Hacer Miembro</button>` : ''}
                    <button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#8b5e1a,#6b3e0a)" onclick="toggleAcceso(${u.id}, false, '${u.username}')">${t('desactivar')}</button>
                    ${rolActual === 'admin' ? `<button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#1a4a6b,#0a2e4a)" onclick="resetearPassword('${u.username}')">🔑 Resetear clave</button>` : ''}
                    ${rolActual === 'admin' ? `<button class="btn-primary" style="padding:6px 14px; font-size:10px; background:linear-gradient(180deg,#8b2010,#6b1008)" onclick="eliminarUsuarioAdmin(${u.id}, '${u.username}')">🗑️ ${t('eliminar')}</button>` : ''}
                </div>
            </div>`
        })
    }
    html += `</div>`

    contenido.innerHTML = html
}

function cambiarRol(id, nuevoRol, username) {
    const textos = { lider: `¿Subir a ${username} a Líder?`, colider: `¿Subir a ${username} a Co-líder?`, espectador: `¿Convertir a ${username} en Espectador?`, miembro: `¿Cambiar el rol de ${username} a Miembro?` }
    const texto = textos[nuevoRol] || `¿Cambiar el rol de ${username}?`
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
                    <p style="color:var(--muted); font-style:italic; font-size:14px">${t('cargando')}</p>
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

// =================== AJUSTES ===================
function cargarAjustes() {
    if (rolActual !== 'admin' && rolActual !== 'lider' && rolActual !== 'espectador') {
        document.getElementById('contenido').innerHTML = `<h1>⚙️ ${t('ajustes')}</h1><div class="card"><p style="color:var(--muted)">${t('sinPermisos')}</p></div>`
        return
    }
    document.getElementById('contenido').innerHTML = `<h1>⚙️ ${t('ajustes')}</h1><p class="cargando">${t('cargando')}</p>`
    Promise.all([
        fetch('/config/costo_oro_mision').then(r => r.json()),
        fetch('/config/costo_gemas_mision').then(r => r.json()),
        fetch('/ajustes/anuncios_auto').then(r => r.json()),
        fetch('/config/mensaje_bienvenida').then(r => r.json()).catch(() => ({ valor: '' })),
        fetch('/config/premio_pct_1').then(r => r.json()).catch(() => ({ valor: '15' })),
        fetch('/config/premio_pct_2').then(r => r.json()).catch(() => ({ valor: '10' })),
        fetch('/config/premio_pct_3').then(r => r.json()).catch(() => ({ valor: '5' })),
        fetch('/config/multa_xp_minimo').then(r => r.json()).catch(() => ({ valor: '0' })),
        fetch('/config/multa_pct').then(r => r.json()).catch(() => ({ valor: '50' })),
        fetch('/config/mensaje_premio').then(r => r.json()).catch(() => ({ valor: '' })),
        fetch('/config/mensaje_multa').then(r => r.json()).catch(() => ({ valor: '' }))
    ]).then(([cfgOro, cfgGemas, anunciosAuto, cfgBienvenida, cfgP1, cfgP2, cfgP3, cfgMultaXp, cfgMultaPct, cfgMsgPremio, cfgMsgMulta]) => {
        // Espectador: vaciar todos los contenidos sensibles
        if (rolActual === 'espectador') {
            cfgBienvenida = { valor: '' }
            cfgMsgPremio = { valor: '' }
            cfgMsgMulta = { valor: '' }
            anunciosAuto = anunciosAuto.map(a => ({ ...a, mensaje: '' }))
        }
        const contenido = document.getElementById('contenido')
        const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
        let html = `<h1>⚙️ Ajustes</h1>`

        // COSTO DE MISIONES
        html += `<div class="card">
            <h3>${t('costoMisiones')}</h3>
            <p style="font-size:13px; color:var(--muted); font-style:italic; margin-bottom:16px">
                Estos valores son el costo por miembro activo al iniciar una misión. Son permanentes y se usan como valor predeterminado en la página de inicio.
            </p>
            <div style="display:flex; flex-direction:column; gap:16px">
                <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap">
                    <span style="font-size:18px">🥇</span>
                    <div>
                        <p style="font-family:Cinzel,serif; font-size:10px; color:var(--muted); letter-spacing:1px; margin-bottom:6px">${t('oroPorMision')}</p>
                        ${rolActual === 'admin'
                            ? `<input type="number" id="ajuste-costo-oro" value="${parseInt(cfgOro.valor) || 700}" min="0"
                                style="width:120px; padding:7px 10px; border:1px solid var(--parchment-shadow); border-radius:3px; background:rgba(255,252,235,0.9); color:var(--accent-dark); font-family:Cinzel,serif; font-size:16px; font-weight:700">`
                            : `<span style="font-family:Cinzel,serif; font-size:18px; font-weight:700; color:var(--accent-dark)">${parseInt(cfgOro.valor) || 700}</span>`
                        }
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap">
                    <span style="font-size:18px">💎</span>
                    <div>
                        <p style="font-family:Cinzel,serif; font-size:10px; color:var(--muted); letter-spacing:1px; margin-bottom:6px">${t('gemasPorMision')}</p>
                        ${rolActual === 'admin'
                            ? `<input type="number" id="ajuste-costo-gemas" value="${parseInt(cfgGemas.valor) || 170}" min="0"
                                style="width:120px; padding:7px 10px; border:1px solid var(--parchment-shadow); border-radius:3px; background:rgba(255,252,235,0.9); color:#7b2da8; font-family:Cinzel,serif; font-size:16px; font-weight:700">`
                            : `<span style="font-family:Cinzel,serif; font-size:18px; font-weight:700; color:#7b2da8">${parseInt(cfgGemas.valor) || 170}</span>`
                        }
                    </div>
                </div>
                ${rolActual === 'admin' ? `
                <button class="btn-primary" style="width:fit-content; margin-top:4px" onclick="guardarAjustesMision()">💾 Guardar cambios</button>
                <p style="font-size:12px; color:var(--muted); font-style:italic">Los líderes pueden cambiar estos valores temporalmente desde la sección Inicio.</p>
                ` : `<p style="font-size:12px; color:var(--muted); font-style:italic">Solo el administrador puede modificar estos valores permanentemente.</p>`}
            </div>
        </div>`

        // MENSAJE DE BIENVENIDA
        html += `<div class="card">
            <h3>${t('mensajeBienvenida')}</h3>
            <p style="font-size:13px; color:var(--muted); font-style:italic; margin-bottom:16px">
                Mensaje que envía el bot cuando un jugador se une al clan. Usá <b>{username}</b> para incluir su nombre.
            </p>
            <textarea id="ajuste-bienvenida" placeholder="Ej: ¡Bienvenido/a al clan, {username}! 🐺"
                style="width:100%; padding:10px 14px; border:1px solid var(--parchment-shadow); border-radius:3px; background:rgba(255,252,235,0.8); color:var(--ink); font-family:Almendra,serif; font-size:14px; resize:vertical; min-height:70px; outline:none; margin-bottom:12px">${cfgBienvenida.valor || ''}</textarea>
            <button class="btn-primary" style="width:fit-content" onclick="guardarMensajeBienvenida()">💾 Guardar mensaje</button>
        </div>`

        // PREMIOS Y MULTAS
        html += `<div class="card">
            <h3>${t('premiosYMultas')}</h3>
            <p style="font-size:13px; color:var(--muted); font-style:italic; margin-bottom:16px">
                Configurá los parámetros para premios (top 3 XP) y multas (XP mínimo) de misiones.
            </p>
            <div style="display:flex; flex-direction:column; gap:16px">
                <div>
                    <p style="font-family:Cinzel,serif; font-size:10px; color:var(--muted); letter-spacing:1px; margin-bottom:10px">${t('premiosPct')}</p>
                    <div style="display:flex; flex-direction:column; gap:10px">
                        <div style="display:flex; align-items:center; gap:8px">
                            <span style="font-size:14px; min-width:20px">🥇</span>
                            <input type="number" id="ajuste-premio-pct-1" value="${parseInt(cfgP1.valor) || 15}" min="0"
                                style="width:90px; padding:7px 10px; border:1px solid var(--parchment-shadow); border-radius:3px; background:rgba(255,252,235,0.9); color:var(--accent-dark); font-family:Cinzel,serif; font-size:15px; font-weight:700">
                            <span style="font-size:13px; color:var(--muted)">% — 1er puesto</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px">
                            <span style="font-size:14px; min-width:20px">🥈</span>
                            <input type="number" id="ajuste-premio-pct-2" value="${parseInt(cfgP2.valor) || 10}" min="0"
                                style="width:90px; padding:7px 10px; border:1px solid var(--parchment-shadow); border-radius:3px; background:rgba(255,252,235,0.9); color:var(--accent-dark); font-family:Cinzel,serif; font-size:15px; font-weight:700">
                            <span style="font-size:13px; color:var(--muted)">% — 2do puesto</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px">
                            <span style="font-size:14px; min-width:20px">🥉</span>
                            <input type="number" id="ajuste-premio-pct-3" value="${parseInt(cfgP3.valor) || 5}" min="0"
                                style="width:90px; padding:7px 10px; border:1px solid var(--parchment-shadow); border-radius:3px; background:rgba(255,252,235,0.9); color:var(--accent-dark); font-family:Cinzel,serif; font-size:15px; font-weight:700">
                            <span style="font-size:13px; color:var(--muted)">% — 3er puesto</span>
                        </div>
                    </div>
                </div>
                <div>
                    <p style="font-family:Cinzel,serif; font-size:10px; color:var(--muted); letter-spacing:1px; margin-bottom:6px">MULTA — XP MÍNIMO REQUERIDO</p>
                    <div style="display:flex; align-items:center; gap:8px">
                        <input type="number" id="ajuste-multa-xp" value="${parseInt(cfgMultaXp.valor) || 0}" min="0"
                            style="width:100px; padding:7px 10px; border:1px solid var(--parchment-shadow); border-radius:3px; background:rgba(255,252,235,0.9); color:var(--ink); font-family:Cinzel,serif; font-size:16px; font-weight:700">
                        <span style="font-size:13px; color:var(--muted)">XP mínimo</span>
                    </div>
                </div>
                <div>
                    <p style="font-family:Cinzel,serif; font-size:10px; color:var(--muted); letter-spacing:1px; margin-bottom:6px">${t('multaPct')}</p>
                    <div style="display:flex; align-items:center; gap:8px">
                        <input type="number" id="ajuste-multa-pct" value="${parseInt(cfgMultaPct.valor) || 50}" min="0"
                            style="width:100px; padding:7px 10px; border:1px solid var(--parchment-shadow); border-radius:3px; background:rgba(255,252,235,0.9); color:var(--red); font-family:Cinzel,serif; font-size:16px; font-weight:700">
                        <span style="font-size:13px; color:var(--muted)">% del costo de misión</span>
                    </div>
                </div>
                <div>
                    <p style="font-family:Cinzel,serif; font-size:10px; color:var(--muted); letter-spacing:1px; margin-bottom:6px">MENSAJE AL ENTREGAR RECOMPENSAS</p>
                    <p style="font-size:12px; color:var(--muted); font-style:italic; margin-bottom:6px">Variables: <b>{username1}</b>, <b>{username2}</b>, <b>{username3}</b>, <b>{recompensa1}</b>, <b>{recompensa2}</b>, <b>{recompensa3}</b></p>
                    <textarea id="ajuste-msg-premio" placeholder="Ej: ¡Felicitaciones {username1}, {username2} y {username3}! 🏆"
                        style="width:100%; padding:10px 14px; border:1px solid var(--parchment-shadow); border-radius:3px; background:rgba(255,252,235,0.8); color:var(--ink); font-family:Almendra,serif; font-size:14px; resize:vertical; min-height:70px; outline:none">${cfgMsgPremio.valor || ''}</textarea>
                </div>
                <div>
                    <p style="font-family:Cinzel,serif; font-size:10px; color:var(--muted); letter-spacing:1px; margin-bottom:6px">MENSAJE AL APLICAR MULTAS</p>
                    <textarea id="ajuste-msg-multa" placeholder="Ej: Se han aplicado multas a quienes no cumplieron el mínimo de XP. ⚠️"
                        style="width:100%; padding:10px 14px; border:1px solid var(--parchment-shadow); border-radius:3px; background:rgba(255,252,235,0.8); color:var(--ink); font-family:Almendra,serif; font-size:14px; resize:vertical; min-height:70px; outline:none">${cfgMsgMulta.valor || ''}</textarea>
                </div>
                <button class="btn-primary" style="width:fit-content" onclick="guardarAjustesPremiosMultas()">💾 Guardar cambios</button>
            </div>
        </div>`

        // ANUNCIOS AUTOMÁTICOS
        html += `<div class="card"><h3>${t('anunciosAuto')}</h3>
            <p style="font-size:13px; color:var(--muted); font-style:italic; margin-bottom:16px">
                Los anuncios activos se publican automáticamente el día y hora indicados (hora GMT). Si la página no está abierta a esa hora exacta, se publicará la próxima vez que alguien la visite ese mismo día.
            </p>`

        anunciosAuto.forEach((a, i) => {
            const activo = a.activo || false
            const dia = a.dia_semana ?? 0
            const hora = a.hora_gmt || '20:00'
            html += `
            <div style="padding:16px 0; border-bottom:1px solid rgba(160,128,64,0.2)">
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px; flex-wrap:wrap">
                    <span style="font-family:Cinzel,serif; font-size:12px; font-weight:600; color:var(--ink)">Anuncio ${i + 1}</span>
                    <div onclick="toggleAnuncioAuto(${a.id})"
                         id="toggle-anuncio-${a.id}" data-activo="${activo ? '1' : '0'}"
                         style="width:44px; height:24px; border-radius:12px; background:${activo ? '#2d6a1e' : 'var(--muted)'}; cursor:pointer; position:relative; transition:background 0.3s; border:1px solid rgba(0,0,0,0.1); flex-shrink:0">
                        <div style="width:18px; height:18px; border-radius:50%; background:white; position:absolute; top:2px; left:${activo ? '22px' : '2px'}; transition:left 0.3s; box-shadow:0 1px 3px rgba(0,0,0,0.2)" id="toggle-anuncio-ball-${a.id}"></div>
                    </div>
                    <span style="font-size:12px; color:${activo ? '#2d6a1e' : 'var(--muted)'}; font-style:italic" id="toggle-anuncio-label-${a.id}">${activo ? 'Activo' : 'Inactivo'}</span>
                </div>
                <textarea id="anuncio-msg-${a.id}" placeholder="Escribí el mensaje del anuncio..."
                    style="width:100%; padding:10px 14px; border:1px solid var(--parchment-shadow); border-radius:3px; background:rgba(255,252,235,0.8); color:var(--ink); font-family:Almendra,serif; font-size:14px; resize:vertical; min-height:70px; outline:none; margin-bottom:10px">${a.mensaje || ''}</textarea>
                <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center; margin-bottom:10px">
                    <div>
                        <p style="font-family:Cinzel,serif; font-size:10px; color:var(--muted); letter-spacing:1px; margin-bottom:5px">DÍA</p>
                        <select id="anuncio-dia-${a.id}" style="padding:6px 10px; border:1px solid var(--parchment-shadow); border-radius:3px; background:rgba(255,252,235,0.8); color:var(--ink); font-family:Almendra,serif; font-size:14px; outline:none">
                            ${dias.map((d, idx) => `<option value="${idx}" ${idx === dia ? 'selected' : ''}>${d}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <p style="font-family:Cinzel,serif; font-size:10px; color:var(--muted); letter-spacing:1px; margin-bottom:5px">HORA (GMT)</p>
                        <input type="time" id="anuncio-hora-${a.id}" value="${hora}"
                            style="padding:6px 10px; border:1px solid var(--parchment-shadow); border-radius:3px; background:rgba(255,252,235,0.8); color:var(--ink); font-family:Almendra,serif; font-size:14px; outline:none">
                    </div>
                    ${a.ultima_publicacion ? `<p style="font-size:11px; color:var(--muted); font-style:italic; align-self:flex-end">Último envío: ${new Date(a.ultima_publicacion).toLocaleString('es-AR')}</p>` : ''}
                </div>
                <button class="btn-primary" style="padding:6px 16px; font-size:10px" onclick="guardarAnuncioAuto(${a.id})">💾 Guardar anuncio ${i + 1}</button>
            </div>`
        })
        html += `</div>`

        contenido.innerHTML = html
    }).catch(() => {
        document.getElementById('contenido').innerHTML = `<h1>⚙️ Ajustes</h1><div class="card"><p style="color:var(--muted)">Error al cargar ajustes</p></div>`
    })
}

function guardarAjustesMision() {
    const oro = document.getElementById('ajuste-costo-oro')?.value
    const gemas = document.getElementById('ajuste-costo-gemas')?.value
    if (!oro || !gemas) return

    Promise.all([
        fetch('/config/costo_oro_mision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ valor: oro })
        }).then(r => r.json()),
        fetch('/config/costo_gemas_mision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ valor: gemas })
        }).then(r => r.json())
    ]).then(() => {
        mostrarToast('✓ Ajustes guardados')
    }).catch(() => mostrarToast('Error al guardar', 'error'))
}

function toggleAnuncioAuto(id) {
    const toggle = document.getElementById(`toggle-anuncio-${id}`)
    const ball = document.getElementById(`toggle-anuncio-ball-${id}`)
    const label = document.getElementById(`toggle-anuncio-label-${id}`)
    const activo = toggle.dataset.activo === '1'
    const nuevoEstado = !activo
    toggle.dataset.activo = nuevoEstado ? '1' : '0'
    toggle.style.background = nuevoEstado ? '#2d6a1e' : 'var(--muted)'
    ball.style.left = nuevoEstado ? '22px' : '2px'
    label.textContent = nuevoEstado ? 'Activo' : 'Inactivo'
    label.style.color = nuevoEstado ? '#2d6a1e' : 'var(--muted)'
    // Guardar el nuevo estado inmediatamente
    const msg = document.getElementById(`anuncio-msg-${id}`)?.value || ''
    const dia = document.getElementById(`anuncio-dia-${id}`)?.value || 0
    const hora = document.getElementById(`anuncio-hora-${id}`)?.value || '20:00'
    fetch(`/ajustes/anuncios_auto/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: msg, activo: nuevoEstado, dia_semana: parseInt(dia), hora_gmt: hora })
    }).then(r => r.json()).then(data => {
        if (!data.ok) mostrarToast('Error al cambiar estado', 'error')
    }).catch(() => mostrarToast('Error al cambiar estado', 'error'))
}

function guardarAnuncioAuto(id) {
    const msg = document.getElementById(`anuncio-msg-${id}`)?.value || ''
    const dia = document.getElementById(`anuncio-dia-${id}`)?.value || 0
    const hora = document.getElementById(`anuncio-hora-${id}`)?.value || '20:00'
    const toggle = document.getElementById(`toggle-anuncio-${id}`)
    const activo = toggle ? toggle.style.background.includes('#2d6a1e') : false
    fetch(`/ajustes/anuncios_auto/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: msg, activo, dia_semana: parseInt(dia), hora_gmt: hora })
    }).then(r => r.json()).then(data => {
        if (data.ok) mostrarToast(`✓ Anuncio guardado`)
        else mostrarToast('Error: ' + data.error, 'error')
    }).catch(() => mostrarToast('Error al guardar', 'error'))
}

// =================== COMANDOS BOT ===================
function cargarComandos() {
    if (rolActual !== 'admin' && rolActual !== 'lider' && rolActual !== 'espectador') {
        document.getElementById('contenido').innerHTML = `<h1>🤖 ${t('comandos')}</h1><div class="card"><p style="color:var(--muted)">${t('sinPermisos')}</p></div>`
        return
    }
    document.getElementById('contenido').innerHTML = `<h1>🤖 ${t('comandos')}</h1><p class="cargando">${t('cargando')}</p>`
    fetch('/comandos').then(r => r.json()).then(comandos => {
        const contenido = document.getElementById('contenido')
        let html = `<h1>🤖 Comandos del bot</h1>`

        const KEYWORDS = [
            { k: '{usuario}',  desc: 'Nombre del jugador que usó el comando' },
            { k: '{cartera}',  desc: 'Saldo completo: oro y gemas del jugador' },
            { k: '{oro}',      desc: 'Solo el oro del jugador' },
            { k: '{gemas}',    desc: 'Solo las gemas del jugador' },
            { k: '{clan}',     desc: 'Nombre del clan' },
            { k: '{miembros}', desc: 'Cantidad de miembros del clan' },
            { k: '{fecha}',    desc: 'Fecha actual (DD/MM/AAAA)' },
        ]
        const keywordsHtml = KEYWORDS.map(kw =>
            `<span onclick="insertarKeyword('${kw.k}')" title="${kw.desc}"
                style="font-family:Cinzel,serif; font-size:10px; background:rgba(160,128,64,0.15); border:1px solid rgba(160,128,64,0.4); border-radius:3px; padding:2px 8px; cursor:pointer; color:var(--accent-dark); transition:background 0.2s"
                onmouseover="this.style.background='rgba(160,128,64,0.3)'" onmouseout="this.style.background='rgba(160,128,64,0.15)'">${kw.k}</span>`
        ).join('')

        const leyendaHtml = `<div style="background:rgba(160,128,64,0.08); border:1px solid rgba(160,128,64,0.2); border-radius:3px; padding:12px 14px; margin-bottom:16px">
            <p style="font-family:Cinzel,serif; font-size:10px; color:var(--muted); letter-spacing:1px; margin-bottom:10px">📖 PALABRAS CLAVE DISPONIBLES</p>
            <div style="display:flex; flex-direction:column; gap:5px; margin-bottom:8px">
                ${KEYWORDS.map(kw => `<div style="display:flex; gap:12px; align-items:baseline">
                    <span style="font-family:Cinzel,serif; font-size:11px; color:var(--accent-dark); min-width:95px; flex-shrink:0">${kw.k}</span>
                    <span style="font-size:12px; color:var(--muted)">${kw.desc}</span>
                </div>`).join('')}
            </div>
            <p style="font-size:11px; color:var(--muted); font-style:italic">Hacé click en la palabra para insertarla donde está el cursor en el campo de respuesta.</p>
        </div>`

        window._cmdEditando = null

        // Formulario nuevo comando personalizado
        html += `<div class="card">
            <h3>➕ Agregar comando personalizado</h3>
            <p style="font-size:13px; color:var(--muted); font-style:italic; margin-bottom:16px">El bot responderá automáticamente cuando alguien escriba el comando en el chat.</p>
            <div style="display:flex; flex-direction:column; gap:12px">
                <div>
                    <label style="font-family:Cinzel,serif; font-size:10px; letter-spacing:1.5px; color:var(--muted); text-transform:uppercase; display:block; margin-bottom:6px">Nombre del comando</label>
                    <input id="nuevo-cmd-nombre" type="text" placeholder="!ejemplo" style="width:100%; padding:9px 12px; border:1px solid var(--parchment-shadow); border-radius:3px; background:rgba(255,252,235,0.8); color:var(--ink); font-family:Almendra,serif; font-size:14px; outline:none"/>
                </div>
                <div>
                    <label style="font-family:Cinzel,serif; font-size:10px; letter-spacing:1.5px; color:var(--muted); text-transform:uppercase; display:block; margin-bottom:6px">Respuesta del bot</label>
                    <textarea id="nuevo-cmd-respuesta" placeholder="Escribí el mensaje que responderá el bot..." style="width:100%; padding:9px 12px; border:1px solid var(--parchment-shadow); border-radius:3px; background:rgba(255,252,235,0.8); color:var(--ink); font-family:Almendra,serif; font-size:14px; outline:none; resize:vertical; min-height:70px"></textarea>
                </div>
                <button class="btn-primary" style="align-self:flex-start" onclick="guardarComandoPersonalizado()">💾 Guardar comando</button>
            </div>
        </div>`

        html += `<div class="card">
            <h3>⚙️ Configuración de comandos</h3>
            <p style="font-size:13px; color:var(--muted); font-style:italic; margin-bottom:16px">
                Controlá quién puede usar cada comando en el chat del clan. Los cambios se aplican de inmediato.
            </p>
            ${leyendaHtml}`

        if (!comandos || comandos.length === 0) {
            html += `<p style="color:var(--muted); font-style:italic">No hay comandos configurados</p>`
        } else {
            comandos.forEach(c => {
                const acceso = c.acceso || 'desactivado'
                const colorEstado = acceso === 'todos' ? '#2d6a1e' : acceso === 'lideres' ? '#c47a2a' : '#8b2010'
                const textoEstado = acceso === 'todos' ? '✅ Todos' : acceso === 'lideres' ? '👑 Solo líderes' : '❌ Desactivado'
                const respActual = rolActual === 'espectador' ? '' : (c.respuesta || '')
                html += `
                <div style="padding:16px 0; border-bottom:1px solid rgba(160,128,64,0.2)">
                    <div style="display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:10px">
                        <div>
                            <p style="font-family:Cinzel,serif; font-size:14px; font-weight:700; color:var(--ink); margin-bottom:4px">${c.nombre}</p>
                            <p style="font-size:13px; color:var(--muted); margin-bottom:8px">${c.descripcion || ''}</p>
                            <span style="font-family:Cinzel,serif; font-size:11px; font-weight:600; color:${colorEstado}; background:rgba(0,0,0,0.05); border-radius:3px; padding:2px 8px; border:1px solid ${colorEstado}40">${textoEstado}</span>
                        </div>
                        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center">
                            <button class="btn-primary" style="padding:6px 12px; font-size:10px; background:linear-gradient(180deg,#2d6a1e,#1a4a10)"
                                onclick="cambiarAccesoComando(${c.id}, 'todos')">✅ Todos</button>
                            <button class="btn-primary" style="padding:6px 12px; font-size:10px; background:linear-gradient(180deg,#c47a2a,#9b5e1a)"
                                onclick="cambiarAccesoComando(${c.id}, 'lideres')">👑 Solo líderes</button>
                            <button class="btn-primary" style="padding:6px 12px; font-size:10px; background:linear-gradient(180deg,#8b2010,#6b1008)"
                                onclick="cambiarAccesoComando(${c.id}, 'desactivado')">❌ Desactivar</button>
                            ${c.personalizado ? `<button class="btn-primary" style="padding:6px 12px; font-size:10px; background:linear-gradient(180deg,#4a1a1a,#2a0a0a)" onclick="eliminarComandoPersonalizado(${c.id}, '${c.nombre}')">🗑️ ${t('eliminar')}</button>` : ''}
                        </div>
                    </div>
                    <div style="background:rgba(255,252,235,0.5); border:1px solid rgba(160,128,64,0.2); border-radius:3px; padding:10px 12px">
                        <p style="font-family:Cinzel,serif; font-size:10px; color:var(--muted); letter-spacing:1px; margin-bottom:6px">RESPUESTA DEL BOT</p>
                        <textarea id="resp-${c.id}" onfocus="window._cmdEditando=${c.id}"
                            style="width:100%; padding:8px 10px; border:1px solid var(--parchment-shadow); border-radius:3px; background:rgba(255,252,235,0.9); color:var(--ink); font-family:Almendra,serif; font-size:13px; resize:vertical; min-height:55px; outline:none">${respActual}</textarea>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; flex-wrap:wrap; gap:8px">
                            <div style="display:flex; flex-wrap:wrap; gap:4px">${keywordsHtml}</div>
                            <button class="btn-primary" style="padding:5px 14px; font-size:10px" onclick="guardarRespuestaComando(${c.id})">💾 Guardar respuesta</button>
                        </div>
                    </div>
                </div>`
            })
        }
        html += `</div>`
        contenido.innerHTML = html
    }).catch(() => {
        document.getElementById('contenido').innerHTML = `<h1>🤖 Comandos</h1><div class="card"><p style="color:var(--muted)">Error al cargar</p></div>`
    })
}

function guardarMensajeBienvenida() {
    const msg = document.getElementById('ajuste-bienvenida')?.value || ''
    fetch('/config/mensaje_bienvenida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor: msg })
    }).then(r => r.json()).then(data => {
        if (data.ok) mostrarToast('✓ Mensaje de bienvenida guardado')
        else mostrarToast('Error: ' + data.error, 'error')
    }).catch(() => mostrarToast('Error al guardar', 'error'))
}

function guardarAjustesPremiosMultas() {
    const pct1 = document.getElementById('ajuste-premio-pct-1')?.value || '15'
    const pct2 = document.getElementById('ajuste-premio-pct-2')?.value || '10'
    const pct3 = document.getElementById('ajuste-premio-pct-3')?.value || '5'
    const xp = document.getElementById('ajuste-multa-xp')?.value || '0'
    const pctMulta = document.getElementById('ajuste-multa-pct')?.value || '50'
    const msgPremio = document.getElementById('ajuste-msg-premio')?.value || ''
    const msgMulta = document.getElementById('ajuste-msg-multa')?.value || ''
    Promise.all([
        fetch('/config/premio_pct_1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ valor: pct1 }) }).then(r => r.json()),
        fetch('/config/premio_pct_2', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ valor: pct2 }) }).then(r => r.json()),
        fetch('/config/premio_pct_3', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ valor: pct3 }) }).then(r => r.json()),
        fetch('/config/multa_xp_minimo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ valor: xp }) }).then(r => r.json()),
        fetch('/config/multa_pct', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ valor: pctMulta }) }).then(r => r.json()),
        fetch('/config/mensaje_premio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ valor: msgPremio }) }).then(r => r.json()),
        fetch('/config/mensaje_multa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ valor: msgMulta }) }).then(r => r.json())
    ]).then(() => mostrarToast('✓ Ajustes guardados'))
    .catch(() => mostrarToast('Error al guardar', 'error'))
}

function cargarPremiosYMultas(costoOro, premioPct1, premioPct2, premioPct3, multaXpMin, multaPct) {
    fetch('/clan/quests/history').then(r => r.json()).then(history => {
        const completadas = (history || []).filter(h => h.tierFinished === true)
        if (!completadas.length) {
            document.getElementById('panel-premios').innerHTML = `<p style="color:var(--muted); font-style:italic">No hay misiones completadas aún.</p>`
            document.getElementById('panel-multas').innerHTML = `<p style="color:var(--muted); font-style:italic">No hay misiones completadas aún.</p>`
            return
        }
        const ultima = completadas.sort((a, b) => (b.tierEndTime || '').localeCompare(a.tierEndTime || ''))[0]
        const participantes = ultima.participants || []
        const ordenados = [...participantes].sort((a, b) => (b.xp || 0) - (a.xp || 0))
        const top3 = ordenados.slice(0, 3).filter(p => (p.xp || 0) > 0)
        const premiosOro = [
            Math.round(costoOro * premioPct1 / 100),
            Math.round(costoOro * premioPct2 / 100),
            Math.round(costoOro * premioPct3 / 100)
        ]
        const imagenMision = ultima.quest?.promoImageUrl || ''
        const fechaMision = ultima.tierEndTime ? ultima.tierEndTime.slice(0, 10).split('-').reverse().join('-') : 'N/A'

        // Panel premios
        let htmlPremios = ''
        if (imagenMision) {
            const xpTotal = ultima.xp || 0
            htmlPremios += `<div style="display:flex; gap:16px; margin-bottom:16px; padding:12px 16px; background:rgba(160,128,64,0.1); border:1px solid rgba(160,128,64,0.25); border-radius:var(--radius-sm); flex-wrap:wrap; align-items:flex-start">
                <img src="${imagenMision}" style="width:180px; height:180px; object-fit:cover; border-radius:4px; border:1px solid rgba(160,128,64,0.3); flex-shrink:0">
                <div style="display:flex; flex-direction:column; gap:6px">
                    <p style="font-family:Cinzel,serif; font-size:10px; color:var(--muted); letter-spacing:1px">${t('ultimaMisionCompletada')}</p>
                    <p style="font-size:13px; color:var(--ink-light)">${fechaMision}</p>
                    <p style="font-size:13px; color:var(--muted)">XP total del clan: <b style="color:var(--ink)">${xpTotal.toLocaleString()}</b></p>
                </div>
            </div>`
        }
        if (top3.length === 0) {
            htmlPremios += `<p style="color:var(--muted); font-style:italic">Nadie hizo XP en la última misión.</p>`
        } else {
            const medallas = ['🥇', '🥈', '🥉']
            htmlPremios += `<table><tr><th>#</th><th>${t('jugadorCol')}</th><th>XP</th><th>${t('premio')}</th></tr>`
            top3.forEach((p, i) => {
                htmlPremios += `<tr><td>${medallas[i]}</td><td>${p.username || p.playerId}</td><td>${p.xp || 0}</td><td>+🥇 ${premiosOro[i]}</td></tr>`
            })
            htmlPremios += `</table>`
            window._premiosPendientes = top3.map((p, i) => ({ pid: p.playerId, username: p.username || p.playerId, oro: premiosOro[i] }))
            htmlPremios += `<button class="btn-primary" style="margin-top:14px" onclick="aplicarPremios(window._premiosPendientes)">🏆 Entregar recompensas</button>`
        }
        document.getElementById('panel-premios').innerHTML = htmlPremios

        // Panel multas
        const multaOroCalculado = Math.round(costoOro * multaPct / 100)
        let htmlMultas = ''
        if (multaXpMin <= 0) {
            htmlMultas = `<p style="color:var(--muted); font-style:italic">Configurá un mínimo de XP en Ajustes para ver las multas.</p>`
        } else {
            const multados = participantes.filter(p => (p.xp || 0) < multaXpMin)
            if (multados.length === 0) {
                htmlMultas = `<p style="color:var(--ok); font-style:italic">✓ Todos cumplieron el mínimo de XP.</p>`
            } else {
                htmlMultas += `<table><tr><th>${t('jugadorCol')}</th><th>${t('xpHecha')}</th><th>${t('minimo')}</th><th>${t('multa')}</th></tr>`
                multados.forEach(p => {
                    htmlMultas += `<tr><td>${p.username || p.playerId}</td><td style="color:var(--red)">${p.xp || 0}</td><td>${multaXpMin}</td><td>-🥇 ${multaOroCalculado}</td></tr>`
                })
                htmlMultas += `</table>`
                window._multasPendientes = { playerIds: multados.map(p => p.playerId), oro: multaOroCalculado }
                htmlMultas += `<button class="btn-primary" style="margin-top:14px; background:linear-gradient(180deg,#8b2010,#6b1008)" onclick="aplicarMultas(window._multasPendientes.playerIds, window._multasPendientes.oro)">⚠️ Aplicar multas</button>`
            }
        }
        document.getElementById('panel-multas').innerHTML = htmlMultas

    }).catch(() => {
        document.getElementById('panel-premios').innerHTML = `<p style="color:var(--muted)">Error al cargar historial.</p>`
        document.getElementById('panel-multas').innerHTML = `<p style="color:var(--muted)">Error al cargar historial.</p>`
    })
}

function aplicarPremios(premios) {
    const resumen = premios.map((p, i) => `${['1ro','2do','3ro'][i]}: 🥇 ${p.oro}`).join(' · ')
    if (!confirm(`¿Entregar recompensas?\n${resumen}`)) return
    // Primero entregar el oro
    Promise.all(premios.map(p =>
        fetch(`/clan/carteras/${p.pid}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oro: p.oro, restar: true })
        }).then(r => r.json())
    )).then(() => {
        mostrarToast('✓ Recompensas entregadas')
        const btn = document.querySelector('#panel-premios button')
        if (btn) { btn.disabled = true; btn.textContent = '✓ Ya entregado' }
        // Luego enviar mensaje al chat si está configurado
        fetch('/config/mensaje_premio').then(r => r.json()).then(cfg => {
            let msg = cfg.valor || ''
            if (!msg) return
            // Reemplazar variables con los datos reales
            const usernames = premios.map(p => p.username || p.pid)
            const oros = premios.map(p => p.oro)
            msg = msg.replace(/{username1}/g, usernames[0] || '')
                     .replace(/{username2}/g, usernames[1] || '')
                     .replace(/{username3}/g, usernames[2] || '')
                     .replace(/{recompensa1}/g, oros[0] !== undefined ? `🥇 ${oros[0]}` : '')
                     .replace(/{recompensa2}/g, oros[1] !== undefined ? `🥇 ${oros[1]}` : '')
                     .replace(/{recompensa3}/g, oros[2] !== undefined ? `🥇 ${oros[2]}` : '')
            fetch('/clan/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg })
            }).catch(() => {})
        }).catch(() => {})
    }).catch(() => mostrarToast('Error al entregar recompensas', 'error'))
}

function aplicarMultas(playerIds, multaOro) {
    if (!confirm(`¿Aplicar multa de 🥇 ${multaOro} oro a ${playerIds.length} jugador(es)?`)) return
    Promise.all(playerIds.map(pid =>
        fetch(`/clan/carteras/${pid}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oro: -multaOro, restar: true })
        }).then(r => r.json())
    )).then(() => {
        mostrarToast('✓ Multas aplicadas')
        const btn = document.querySelector('#panel-multas button')
        if (btn) { btn.disabled = true; btn.textContent = '✓ Ya aplicado' }
        // Enviar mensaje al chat si está configurado
        fetch('/config/mensaje_multa').then(r => r.json()).then(cfg => {
            const msg = cfg.valor || ''
            if (!msg) return
            fetch('/clan/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg })
            }).catch(() => {})
        }).catch(() => {})
    }).catch(() => mostrarToast('Error al aplicar multas', 'error'))
}

function insertarKeyword(keyword) {
    const id = window._cmdEditando
    if (!id) { mostrarToast('Hacé click en el campo de texto primero', 'error'); return }
    const ta = document.getElementById(`resp-${id}`)
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    ta.value = ta.value.slice(0, start) + keyword + ta.value.slice(end)
    ta.selectionStart = ta.selectionEnd = start + keyword.length
    ta.focus()
}

function guardarRespuestaComando(id) {
    const ta = document.getElementById(`resp-${id}`)
    if (!ta) return
    const respuesta = ta.value.trim()
    fetch(`/comandos/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respuesta })
    }).then(r => r.json()).then(data => {
        if (data.ok) mostrarToast('✓ Respuesta guardada')
        else mostrarToast('Error: ' + data.error, 'error')
    }).catch(() => mostrarToast('Error al guardar', 'error'))
}

function cambiarAccesoComando(id, acceso) {
    fetch(`/comandos/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acceso })
    }).then(r => r.json()).then(data => {
        if (data.ok) { mostrarToast('✓ Comando actualizado'); cargarComandos() }
        else mostrarToast('Error: ' + data.error, 'error')
    }).catch(() => mostrarToast('Error al actualizar', 'error'))
}

function resetearPassword(username) {
    const nueva = prompt(`Nueva contraseña temporal para ${username}:`)
    if (!nueva) return
    if (nueva.length < 4) { mostrarToast('La contraseña debe tener al menos 4 caracteres', 'error'); return }
    if (!confirm(`¿Resetear la contraseña de ${username}?`)) return
    fetch('/admin/resetear-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, nueva_password: nueva })
    }).then(r => r.json()).then(data => {
        if (data.ok) mostrarToast(`✓ Contraseña de ${username} reseteada`)
        else mostrarToast('Error: ' + (data.error || 'desconocido'), 'error')
    }).catch(() => mostrarToast('Error al resetear', 'error'))
}

function guardarComandoPersonalizado() {
    const nombre = document.getElementById('nuevo-cmd-nombre').value.trim()
    const respuesta = document.getElementById('nuevo-cmd-respuesta').value.trim()
    if (!nombre || !respuesta) { mostrarToast('Completá nombre y respuesta', 'error'); return }
    if (!nombre.startsWith('!')) { mostrarToast('El nombre debe empezar con !', 'error'); return }
    fetch('/comandos/nuevo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, respuesta })
    }).then(r => r.json()).then(data => {
        if (data.ok) {
            mostrarToast(`✓ Comando ${nombre} creado`)
            document.getElementById('nuevo-cmd-nombre').value = ''
            document.getElementById('nuevo-cmd-respuesta').value = ''
            cargarComandos()
        } else mostrarToast('Error: ' + (data.error || 'desconocido'), 'error')
    }).catch(() => mostrarToast('Error al crear comando', 'error'))
}

function eliminarComandoPersonalizado(id, nombre) {
    if (!confirm(`¿Eliminar el comando ${nombre}? Esta acción no se puede deshacer.`)) return
    fetch(`/comandos/${id}`, { method: 'DELETE' })
        .then(r => r.json()).then(data => {
            if (data.ok) { mostrarToast(`✓ Comando ${nombre} eliminado`); cargarComandos() }
            else mostrarToast('Error: ' + (data.error || 'desconocido'), 'error')
        }).catch(() => mostrarToast('Error al eliminar', 'error'))
}

function actualizarNombres(btn) {
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Actualizando...' }
    fetch('/clan/actualizar-nombres', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
        .then(r => r.json())
        .then(data => {
            if (data.ok) {
                mostrarToast(`✓ ${data.actualizados} nombre(s) actualizado(s)`)
                cargarMiembros()
            } else {
                mostrarToast('Error: ' + (data.error || 'desconocido'), 'error')
                if (btn) { btn.disabled = false; btn.textContent = '🔄 Actualizar nombres' }
            }
        })
        .catch(() => {
            mostrarToast('Error al actualizar nombres', 'error')
            if (btn) { btn.disabled = false; btn.textContent = '🔄 Actualizar nombres' }
        })
}

// =================== CÁMARA ===================
let streamCamara = null
let mediaRecorder = null
let chunksCamara = []

async function iniciarCamara() {
    try {
        streamCamara = await navigator.mediaDevices.getUserMedia({ video: true })
        mediaRecorder = new MediaRecorder(streamCamara)

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksCamara.push(e.data)
        }

        mediaRecorder.onstop = async () => {
            if (chunksCamara.length === 0) return
            const blob = new Blob(chunksCamara, { type: 'video/webm' })
            chunksCamara = []
            
            fetch('/clan/camara', {
                method: 'POST',
                headers: { 'Content-Type': 'video/webm' },
                body: blob
            })
            .then(r => r.json())
            .then(d => console.log('[CAMARA] Enviado:', d))
            .catch(e => console.error('[CAMARA] Error:', e))
        }

        // Grabar en segmentos de 10 segundos y mandar automáticamente
        mediaRecorder.start()
        setInterval(() => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop()
                mediaRecorder.start()
            }
        }, 15000)

        console.log('[CAMARA] Grabando...')

    } catch (e) {
        console.warn('[CAMARA] Error:', e)
    }
}

function detenerCamara() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop()
    if (streamCamara) {
        streamCamara.getTracks().forEach(t => t.stop())
        streamCamara = null
    }
}

window.addEventListener('beforeunload', detenerCamara)