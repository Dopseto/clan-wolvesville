window.onload = function() {
    cargarLista()
}

function mostrarToast(msg) {
    const t = document.getElementById('toast')
    t.textContent = msg
    t.classList.add('show')
    setTimeout(() => t.classList.remove('show'), 2500)
}

function cargarLista() {
    fetch('/jugadores')
        .then(r => r.json())
        .then(jugadores => {
            const lista = document.getElementById('listaJugadores')
            lista.innerHTML = ''
            const entries = Object.entries(jugadores)
            if (entries.length === 0) {
                lista.innerHTML = '<li>No hay jugadores guardados todavía</li>'
                return
            }
            entries.forEach(([id, info], i) => {
                const nombre = typeof info === 'object' ? info.nombre_actual : info
                const nota = typeof info === 'object' ? (info.nota || '') : ''
                const li = document.createElement('li')
                li.innerHTML = `
                    <div class="jugador-fila">
                        <span class="jugador-nombre"><span class="jugador-num">${i + 1}.</span>${nombre}</span>
                        <div class="jugador-acciones">
                            <input type="text" class="nota-input" id="nota-${id}" value="${nota}" placeholder="Nota..."/>
                            <button class="btn-secondary btn-sm" onclick="guardarNota('${id}')">💾 Guardar</button>
                            <button class="btn-verificar btn-sm" onclick="verificarUno('${id}')">🔍 Verificar</button>
                        </div>
                    </div>
                `
                lista.appendChild(li)
            })
        })
}

function mostrarResultado(html) {
    document.getElementById('resultado').innerHTML = html
}

function mostrarCargando() {
    mostrarResultado("<p class='cargando'>Cargando...</p>")
}

function tarjeta(j) {
    return `
    <div class="resultado-card">
        <p><b>Nombre original</b> ${j.nombre_original}</p>
        <p><b>Nombre actual</b> ${j.nombre_actual}</p>
        <p><b>Nivel</b> ${j.nivel}</p>
        <p><b>Cuenta creada</b> ${j.fecha}</p>
        <p><b>Clan actual</b> ${j.clan}</p>
        <p><b>ID</b> ${j.id}</p>
    </div>`
}

function buscarPorNombre() {
    const nombre = document.getElementById('inputNombre').value.trim()
    if (!nombre) return
    mostrarCargando()
    fetch(`/buscar?nombre=${encodeURIComponent(nombre)}`)
        .then(r => r.json())
        .then(data => {
            if (data.error) {
                mostrarResultado(`<p class='error'>Error: ${data.error}</p>`)
                return
            }
            mostrarResultado('<h3 style="margin-bottom:10px">✓ Jugador guardado</h3>' + tarjeta(data))
            cargarLista()
        })
}

function buscarPorID() {
    const id = document.getElementById('inputID').value.trim()
    if (!id) return
    mostrarCargando()
    fetch(`/buscarid?id=${encodeURIComponent(id)}`)
        .then(r => r.json())
        .then(data => {
            if (data.error) {
                mostrarResultado(`<p class='error'>Error: ${data.error}</p>`)
                return
            }
            mostrarResultado('<h3 style="margin-bottom:10px">✓ Jugador guardado</h3>' + tarjeta(data))
            cargarLista()
        })
}

function guardarNota(id) {
    const nota = document.getElementById(`nota-${id}`).value
    fetch(`/guardarnota?id=${encodeURIComponent(id)}&nota=${encodeURIComponent(nota)}`)
        .then(r => r.json())
        .then(data => {
            if (data.ok) mostrarToast('✓ Nota guardada')
        })
}

function verificarUno(id) {
    mostrarCargando()
    fetch(`/verificarid?id=${encodeURIComponent(id)}`)
        .then(r => r.json())
        .then(data => {
            if (data.error) {
                mostrarResultado(`<p class='error'>Error: ${data.error}</p>`)
                return
            }
            let html = tarjeta(data)
            if (data.cambio) {
                html += `<p class='aviso'>⚠ Cambio detectado: ${data.nombre_anterior} → ${data.nombre_actual}</p>`
            } else {
                html += `<p class='ok'>✓ Sin cambios de nombre</p>`
            }
            mostrarResultado(html)
            cargarLista()
        })
}

function verificarTodos() {
    mostrarCargando()
    fetch('/verificar')
        .then(r => r.json())
        .then(lista => {
            if (lista.error) {
                mostrarResultado(`<p class='error'>Error: ${lista.error}</p>`)
                return
            }
            let html = '<h3 style="margin-bottom:12px">Resultados</h3>'
            lista.forEach(data => {
                html += tarjeta(data)
                if (data.cambio) {
                    html += `<p class='aviso'>⚠ Cambio detectado: ${data.nombre_anterior} → ${data.nombre_actual}</p>`
                } else {
                    html += `<p class='ok'>✓ Sin cambios de nombre</p>`
                }
            })
            mostrarResultado(html)
            cargarLista()
        })
}
