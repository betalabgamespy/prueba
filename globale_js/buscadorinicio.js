// BUSCADOR CON SUGERENCIAS E IMÁGENES - RESPONSIVE
// VERSIÓN PARA PÁGINA DE INICIO
document.addEventListener('DOMContentLoaded', function() {
    console.log('Buscador para inicio cargado');
    
    setTimeout(() => {
        const input = document.querySelector('.caja-texto');
        if (input) {
            configurarBuscadorConImagenes(input);
            crearContenedorSugerencias(input);
        }
    }, 100);
});

function configurarBuscadorConImagenes(input) {
    // Solo buscar con Enter
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const termino = this.value.trim();
            if (termino.length >= 2) {
                ocultarSugerencias();
                buscarJuegoExacto(termino);
            }
        }
    });
    
    // Mostrar sugerencias al escribir
    let timeoutSugerencias;
    input.addEventListener('input', function(e) {
        clearTimeout(timeoutSugerencias);
        const termino = this.value.trim();
        
        if (termino.length === 0) {
            ocultarSugerencias();
            return;
        }
        
        if (termino.length >= 2) {
            timeoutSugerencias = setTimeout(() => {
                mostrarSugerenciasConImagenes(termino);
            }, 300);
        }
    });
    
    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.contenedor-buscador') && 
            !e.target.closest('.sugerencias-container')) {
            ocultarSugerencias();
        }
    });
    
    // Tecla ESC para cerrar sugerencias
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            ocultarSugerencias();
        }
    });
}

function crearContenedorSugerencias(input) {
    // Crear contenedor para sugerencias con imágenes
    const sugerenciasHTML = `
        <div class="sugerencias-container" id="sugerencias-buscador">
            <div class="sugerencias-header">
                <span class="sugerencias-titulo">Sugerencias</span>
                <button class="btn-cerrar-sugerencias" onclick="ocultarSugerencias()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="sugerencias-lista" id="lista-sugerencias"></div>
        </div>
    `;
    
    // Insertar después del buscador
    const buscador = input.closest('.contenedor-buscador');
    if (buscador) {
        buscador.insertAdjacentHTML('beforeend', sugerenciasHTML);
    }
}

// SOLO MODIFICAR ESTA FUNCIÓN - Para mostrar sugerencias de TODAS las consolas
async function mostrarSugerenciasConImagenes(termino) {
    const listaSugerencias = document.getElementById('lista-sugerencias');
    const contenedor = document.getElementById('sugerencias-buscador');
    
    if (!listaSugerencias || !contenedor) return;
    
    try {
        const terminoLower = termino.toLowerCase();
        let todasSugerencias = [];
        
        // Cargar TODAS las consolas
        const consolas = ['ps2', 'ps3', 'ps4'];
        
        for (const consola of consolas) {
            try {
                const juegos = await cargarJuegosConsola(consola);
                const sugerenciasConsola = juegos
                    .filter(juego => {
                        const nombre = (juego.Nombre || juego.nombre || '').toLowerCase();
                        return nombre.includes(terminoLower);
                    })
                    .map(juego => ({
                        ...juego,
                        consola: consola,
                        colorConsola: consola === 'ps2' ? '#0070d1' : 
                                     consola === 'ps3' ? '#665cbe' : '#0072ce'
                    }))
                    .slice(0, 3); // 3 por consola, total máximo 9
                
                todasSugerencias = [...todasSugerencias, ...sugerenciasConsola];
            } catch (error) {
                console.error(`Error cargando ${consola}:`, error);
            }
        }
        
        // Ordenar: primeros los que empiezan con el término
        todasSugerencias.sort((a, b) => {
            const nombreA = (a.Nombre || a.nombre || '').toLowerCase();
            const nombreB = (b.Nombre || b.nombre || '').toLowerCase();
            
            const empiezaConA = nombreA.startsWith(terminoLower);
            const empiezaConB = nombreB.startsWith(terminoLower);
            
            if (empiezaConA && !empiezaConB) return -1;
            if (!empiezaConA && empiezaConB) return 1;
            
            // Si ambos empiezan igual o ninguno, ordenar por consola (ps4 > ps3 > ps2)
            const ordenConsola = { 'ps4': 1, 'ps3': 2, 'ps2': 3 };
            return ordenConsola[a.consola] - ordenConsola[b.consola];
        });
        
        // Limitar a 6 sugerencias máximo
        todasSugerencias = todasSugerencias.slice(0, 6);
        
        if (todasSugerencias.length > 0) {
            listaSugerencias.innerHTML = todasSugerencias.map(juego => `
                <div class="sugerencia-item" onclick="seleccionarSugerencia('${escapeHTML(juego.Nombre || juego.nombre)}')">
                    <div class="sugerencia-imagen">
                        <img src="${juego.imagen || 'IMAGENES/default-game.jpg'}" 
                             alt="${escapeHTML(juego.Nombre || juego.nombre)}"
                             onerror="this.src='IMAGENES/default-game.jpg'">
                    </div>
                    <div class="sugerencia-contenido">
                        <div class="sugerencia-nombre">${escapeHTML(juego.Nombre || juego.nombre)}</div>
                        <div class="sugerencia-detalles">
                            <span class="sugerencia-consola" style="background: ${juego.colorConsola}20; color: ${juego.colorConsola}; border: 1px solid ${juego.colorConsola}40;">
                                ${juego.consola.toUpperCase()}
                            </span>
                            <span class="sugerencia-precio">${juego.precio || 'G 0'}</span>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Actualizar título para indicar búsqueda en todas las consolas
            const titulo = contenedor.querySelector('.sugerencias-titulo');
            if (titulo) {
                titulo.textContent = `Sugerencias en PS2, PS3 y PS4`;
            }
            
            contenedor.style.display = 'block';
            
            // Posicionar debajo del input
            const input = document.querySelector('.caja-texto');
            if (input) {
                const rect = input.getBoundingClientRect();
                contenedor.style.top = (rect.bottom + window.scrollY) + 'px';
                contenedor.style.left = rect.left + 'px';
                contenedor.style.width = '380px'; // Un poco más ancho para las etiquetas
                
                if (window.innerWidth <= 768) {
                    contenedor.style.width = 'calc(100vw - 20px)';
                    contenedor.style.left = '10px';
                }
            }
        } else {
            listaSugerencias.innerHTML = `
                <div class="sin-sugerencias">
                    <div class="icono-sin-sugerencias">🔍</div>
                    <p>No hay sugerencias para</p>
                    <p class="termino-busqueda">"${escapeHTML(termino)}"</p>
                </div>
            `;
            contenedor.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error cargando sugerencias:', error);
        listaSugerencias.innerHTML = `
            <div class="error-sugerencias">
                <div class="icono-error">⚠️</div>
                <p>Error al cargar sugerencias</p>
            </div>
        `;
        contenedor.style.display = 'block';
    }
}

// Y AGREGAR ESTE PEQUEÑO ESTILO AL FINAL DEL CSS EXISTENTE
const estiloExtra = `
    .sugerencia-consola {
        /* Ya existe, solo añadir para diferenciar consolas */
        font-weight: 700 !important;
        letter-spacing: 0.8px !important;
    }
`;

// Insertar el estilo extra si no existe
if (!document.querySelector('#estilo-extra-consolas')) {
    const style = document.createElement('style');
    style.id = 'estilo-extra-consolas';
    style.textContent = estiloExtra;
    document.head.appendChild(style);
}

function seleccionarSugerencia(nombre) {
    const input = document.querySelector('.caja-texto');
    if (input) {
        input.value = nombre;
        ocultarSugerencias();
        buscarJuegoExacto(nombre);
    }
}

function ocultarSugerencias() {
    const contenedor = document.getElementById('sugerencias-buscador');
    if (contenedor) {
        contenedor.style.display = 'none';
    }
}

// FUNCIÓN DE BÚSQUEDA (MODIFICADA PARA INICIO)
async function buscarJuegoExacto(termino) {
    console.log('🔍 Buscando juego desde inicio:', termino);
    
    try {
        // Buscar en todas las consolas (en orden: PS4, PS3, PS2)
        const consolas = ['ps4', 'ps3', 'ps2'];
        const terminoLower = termino.toLowerCase();
        
        for (const consola of consolas) {
            try {
                const todosJuegos = await cargarTodosJuegos(consola);
                
                const juegoEncontrado = todosJuegos.find(juego => {
                    const nombreJuego = (juego.Nombre || juego.nombre || '').toLowerCase();
                    return nombreJuego.includes(terminoLower);
                });
                
                if (juegoEncontrado) {
                    const itemsPorPagina = 12;
                    const indexJuego = todosJuegos.findIndex(j => 
                        (j.Nombre || j.nombre).toLowerCase() === (juegoEncontrado.Nombre || juegoEncontrado.nombre).toLowerCase()
                    );
                    
                    const paginaDelJuego = Math.floor(indexJuego / itemsPorPagina) + 1;
                    const numero = consola.slice(-1);
                    const nombreJuego = encodeURIComponent(juegoEncontrado.Nombre || juegoEncontrado.nombre);
                    
                    // Desde inicio, redirigir directamente a la consola
                    window.location.href = `PLAYSTATION${numero}/ps${numero}.html?juego=${nombreJuego}&pagina=${paginaDelJuego}&buscar=${nombreJuego}`;
                    return;
                }
            } catch (error) {
                console.error(`Error buscando en ${consola}:`, error);
            }
        }
        
        // Si no se encontró en ninguna consola
        mostrarMensaje(`"${termino}" no encontrado en PS2, PS3 ni PS4`);
        
    } catch (error) {
        console.error('Error en búsqueda:', error);
        mostrarMensaje('Error al buscar el juego');
    }
}

async function cargarTodosJuegos(consola) {
    try {
        // Ruta modificada para inicio
        const ruta = `JUEGOS/juegos${consola}.json`;
        const respuesta = await fetch(ruta);
        
        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);
        
        const datos = await respuesta.json();
        
        let juegosArray;
        if (Array.isArray(datos)) {
            juegosArray = datos;
        } else if (datos[`juegos${consola}`]) {
            juegosArray = datos[`juegos${consola}`];
        } else {
            for (const key in datos) {
                if (Array.isArray(datos[key])) {
                    juegosArray = datos[key];
                    break;
                }
            }
        }
        
        return juegosArray || [];
        
    } catch (error) {
        console.error('Error cargando juegos:', error);
        return [];
    }
}

async function cargarJuegosConsola(consola) {
    try {
        // Ruta modificada para inicio
        const ruta = `JUEGOS/juegos${consola}.json`;
        const respuesta = await fetch(ruta);
        
        if (!respuesta.ok) throw new Error('Error cargando juegos');
        
        const datos = await respuesta.json();
        
        if (Array.isArray(datos)) {
            return datos;
        } else if (datos[`juegos${consola}`]) {
            return datos[`juegos${consola}`];
        } else {
            return [];
        }
        
    } catch (error) {
        console.error('Error cargando:', consola, error);
        return [];
    }
}

function mostrarMensaje(texto) {
    const mensaje = document.createElement('div');
    mensaje.textContent = texto;
    mensaje.className = 'notificacion-buscador';
    
    document.body.appendChild(mensaje);
    
    setTimeout(() => {
        mensaje.classList.add('desapareciendo');
        setTimeout(() => mensaje.remove(), 300);
    }, 3000);
}

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// EXPONER FUNCIONES GLOBALES
window.seleccionarSugerencia = seleccionarSugerencia;
window.ocultarSugerencias = ocultarSugerencias;

// INYECTAR ESTILOS CSS CON IMÁGENES (IGUAL)
if (!document.querySelector('#estilos-buscador-imagenes')) {
    const estilos = `
        /* SUGERENCIAS CON IMÁGENES */
        .sugerencias-container {
            position: absolute;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 1000;
            display: none;
            max-height: 450px;
            overflow-y: auto;
            border: 1px solid #e2e8f0;
            top: 100%;
            left: 0;
            margin-top: 8px;
            width: 350px;
        }
        
        .sugerencias-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 15px;
            border-bottom: 1px solid #e2e8f0;
            background: #f8fafc;
            border-radius: 10px 10px 0 0;
            position: sticky;
            top: 0;
            z-index: 2;
        }
        
        .sugerencias-titulo {
            font-weight: 600;
            color: #2d3748;
            font-size: 15px;
        }
        
        .btn-cerrar-sugerencias {
            background: none;
            border: none;
            color: #718096;
            cursor: pointer;
            padding: 5px;
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        
        .btn-cerrar-sugerencias:hover {
            background: #e2e8f0;
            color: #4a5568;
        }
        
        .sugerencias-lista {
            padding: 8px 0;
        }
        
        /* ITEMS CON IMÁGENES */
        .sugerencia-item {
            display: flex;
            align-items: center;
            padding: 10px 15px;
            cursor: pointer;
            transition: all 0.2s;
            border-bottom: 1px solid #f1f5f9;
            gap: 12px;
        }
        
        .sugerencia-item:last-child {
            border-bottom: none;
        }
        
        .sugerencia-item:hover {
            background: #f8fafc;
            transform: translateX(2px);
        }
        
        .sugerencia-imagen {
            width: 50px;
            height: 50px;
            border-radius: 6px;
            overflow: hidden;
            flex-shrink: 0;
            border: 1px solid #e2e8f0;
        }
        
        .sugerencia-imagen img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s;
        }
        
        .sugerencia-item:hover .sugerencia-imagen img {
            transform: scale(1.05);
        }
        
        .sugerencia-contenido {
            flex: 1;
            min-width: 0; /* Para que el texto no rompa el layout */
        }
        
        .sugerencia-nombre {
            color: #2d3748;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 5px;
            line-height: 1.3;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .sugerencia-detalles {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
        }
        
        .sugerencia-consola {
            color: #4299e1;
            font-size: 11px;
            background: #ebf8ff;
            padding: 3px 8px;
            border-radius: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .sugerencia-precio {
            color: #38a169;
            font-size: 12px;
            font-weight: bold;
            white-space: nowrap;
        }
        
        /* ESTADOS SIN SUGERENCIAS */
        .sin-sugerencias, .error-sugerencias {
            padding: 30px 20px;
            text-align: center;
            color: #94a3b8;
        }
        
        .icono-sin-sugerencias, .icono-error {
            font-size: 40px;
            margin-bottom: 15px;
            opacity: 0.5;
        }
        
        .termino-busqueda {
            color: #475569;
            font-weight: 500;
            margin-top: 5px;
            font-size: 15px;
        }
        
        /* NOTIFICACIONES */
        .notificacion-buscador {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4299e1;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 6px 16px rgba(0,0,0,0.15);
            z-index: 10001;
            animation: slideIn 0.3s ease;
            max-width: 350px;
        }
        
        .notificacion-buscador.desapareciendo {
            animation: slideOut 0.3s ease forwards;
        }
        
        /* ANIMACIONES */
        @keyframes slideIn {
            from { 
                transform: translateY(-20px) translateX(100%); 
                opacity: 0; 
            }
            to { 
                transform: translateY(0) translateX(0); 
                opacity: 1; 
            }
        }
        
        @keyframes slideOut {
            from { 
                transform: translateY(0) translateX(0); 
                opacity: 1; 
            }
            to { 
                transform: translateY(-20px) translateX(100%); 
                opacity: 0; 
            }
        }
        
        /* RESPONSIVE */
        @media (max-width: 768px) {
            .sugerencias-container {
                position: fixed;
                top: auto !important;
                left: 10px !important;
                right: 10px !important;
                width: auto !important;
                max-width: calc(100vw - 20px);
                max-height: 400px;
                margin-top: 10px;
            }
            
            .sugerencia-item {
                padding: 12px 15px;
            }
            
            .sugerencia-imagen {
                width: 45px;
                height: 45px;
            }
            
            .sugerencia-nombre {
                font-size: 13px;
            }
            
            .sugerencia-precio {
                font-size: 11px;
            }
            
            .notificacion-buscador {
                left: 10px;
                right: 10px;
                top: 10px;
                max-width: none;
            }
        }
        
        @media (max-width: 480px) {
            .sugerencias-container {
                max-height: 350px;
            }
            
            .sugerencia-item {
                padding: 10px 12px;
                gap: 10px;
            }
            
            .sugerencia-imagen {
                width: 40px;
                height: 40px;
            }
            
            .sugerencia-nombre {
                font-size: 12px;
            }
            
            .sugerencia-consola {
                font-size: 10px;
                padding: 2px 6px;
            }
        }
        
        /* SCROLLBAR PERSONALIZADO */
        .sugerencias-container::-webkit-scrollbar {
            width: 8px;
        }
        
        .sugerencias-container::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 0 10px 10px 0;
        }
        
        .sugerencias-container::-webkit-scrollbar-thumb {
            background: #cbd5e0;
            border-radius: 4px;
        }
        
        .sugerencias-container::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
        
        /* EFECTO DE CARGA PARA IMÁGENES */
        .sugerencia-imagen {
            position: relative;
            background: #f1f5f9;
        }
        
        .sugerencia-imagen::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
            border-radius: 6px;
        }
        
        .sugerencia-imagen img {
            position: relative;
            z-index: 1;
        }
        
        @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        
        /* QUITAR EFECTO DE CARGA CUANDO LA IMAGEN SE CARGA */
        .sugerencia-imagen img.loaded {
            opacity: 1;
        }
        
        .sugerencia-imagen img.loaded + .sugerencia-imagen::before {
            display: none;
        }
    `;
    
    const style = document.createElement('style');
    style.id = 'estilos-buscador-imagenes';
    style.textContent = estilos;
    document.head.appendChild(style);
}

// MEJORAR LA CARGA DE IMÁGENES (IGUAL)
function mejorarCargaImagenes() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px'
    });
    
    // Observar imágenes en sugerencias
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.sugerencia-imagen img').forEach(img => {
            if (img.dataset.src) {
                observer.observe(img);
            }
        });
    });
}

// Iniciar mejor carga de imágenes
setTimeout(mejorarCargaImagenes, 1000);