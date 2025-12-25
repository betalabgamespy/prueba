// Configuración global
const CONFIG = {
    jsonPath: '../JUEGOS/juegosps2.json',
    itemsPerPage: 12,
    defaultImage: '../IMAGENES/default-game.jpg'
};

// Estado global
let estado = {
    juegos: [],
    juegosFiltrados: [],
    paginaActual: 1,
    carrito: JSON.parse(localStorage.getItem('carrito')) || []
};

// ============================================
// NUEVO: Código para ir al juego exacto
// ============================================
// Leer parámetros de la URL
const urlParams = new URLSearchParams(window.location.search);
const juegoParam = urlParams.get('juego');
const paginaParam = urlParams.get('pagina');
const buscarParam = urlParams.get('buscar');

// Función para hacer scroll al juego específico
function scrollAlJuegoEspecifico() {
    if (!juegoParam && !buscarParam) return;
    
    const nombreBuscado = decodeURIComponent(juegoParam || buscarParam);
    console.log('🔍 Buscando juego específico:', nombreBuscado);
    
    // Esperar a que los juegos se muestren
    setTimeout(() => {
        // Buscar la card del juego
        const cards = document.querySelectorAll('.juego-card');
        let cardEncontrada = null;
        
        for (const card of cards) {
            const titulo = card.querySelector('.juego-titulo');
            if (titulo && titulo.textContent.toLowerCase().includes(nombreBuscado.toLowerCase())) {
                cardEncontrada = card;
                break;
            }
        }
        
        if (cardEncontrada) {
            // Hacer scroll suave a la card
            cardEncontrada.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center'
            });
            
            // Destacar la card
            cardEncontrada.style.boxShadow = '0 0 0 3px #4299e1';
            cardEncontrada.style.transition = 'box-shadow 0.3s';
            
            console.log('✅ Juego encontrado y destacado');
            
            // Quitar el destaque después de 3 segundos
            setTimeout(() => {
                cardEncontrada.style.boxShadow = '';
            }, 3000);
        } else {
            console.log('⚠️ Juego no encontrado en las cards visibles');
        }
    }, 1000);
}

// Función para ir a la página específica
function irAPaginaEspecifica() {
    if (paginaParam) {
        const pagina = parseInt(paginaParam);
        if (!isNaN(pagina) && pagina > 0 && pagina !== estado.paginaActual) {
            console.log(`📄 Yendo a la página ${pagina}`);
            estado.paginaActual = pagina;
            mostrarJuegos();
            
            // Después de mostrar juegos, hacer scroll al juego
            setTimeout(() => {
                scrollAlJuegoEspecifico();
            }, 800);
            return true;
        }
    }
    return false;
}

// Modificar la función mostrarJuegos para agregar data-id a las cards
function crearCardJuego(juego) {
    const enCarrito = estado.carrito.some(item => item.id === juego.id);
    
    return `
        <div class="juego-card" data-id="${juego.id}" data-nombre="${juego.nombre}">
            <img src="${juego.imagen}" 
                 alt="${juego.nombre}" 
                 class="juego-imagen"
                 onerror="this.src='${CONFIG.defaultImage}'">
            <div class="juego-info">
                <h3 class="juego-titulo">${juego.nombre}</h3>
                <p class="juego-precio">${formatearPrecio(juego.precio)}</p>
                <button class="btn-carrito ${enCarrito ? 'agregado' : ''}" 
                        onclick="toggleCarrito(${juego.id})"
                        data-id="${juego.id}">
                    ${enCarrito ? '✓ En carrito' : '+ Añadir al carrito'}
                </button>
            </div>
        </div>
    `;
}

// ============================================
// FIN del nuevo código
// ============================================

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', iniciarApp);

async function iniciarApp() {
    await cargarJuegosDesdeJSON();
    configurarEventos();
    actualizarContadorCarrito();
    
    // NUEVO: Verificar si hay que ir a un juego específico
    if (juegoParam || buscarParam) {
        // Primero ver si hay que cambiar de página
        if (!irAPaginaEspecifica()) {
            // Si no cambiamos de página, solo hacer scroll
            setTimeout(() => {
                scrollAlJuegoEspecifico();
            }, 1500);
        }
    }
}

// Función para formatear precio: "G 90.000"
function formatearPrecio(precio) {
    // Convertir a número si es string
    const precioNum = typeof precio === 'string' ? parseFloat(precio) : precio;
    
    // Formatear con separadores de miles
    return `G ${precioNum.toLocaleString('es-PY')}`;
}

// Cargar juegos desde JSON
async function cargarJuegosDesdeJSON() {
    const container = document.getElementById('juegosContainer');
    
    try {
        // Mostrar estado de carga
        container.innerHTML = '<div class="loading">🔄 Cargando juegos de PS2...</div>';
        
        // Hacer petición al archivo JSON
        const respuesta = await fetch(CONFIG.jsonPath);
        
        if (!respuesta.ok) {
            throw new Error(`Error ${respuesta.status}: No se pudo cargar el archivo`);
        }
        
        const datos = await respuesta.json();
        
        // Verificar si es array simple o tiene objeto juegosps2
        let arrayJuegos;
        
        if (Array.isArray(datos)) {
            // Si es array simple
            arrayJuegos = datos;
        } else if (datos.juegosps2 && Array.isArray(datos.juegosps2)) {
            // Si tiene estructura {juegosps2: [...]}
            arrayJuegos = datos.juegosps2;
        } else {
            throw new Error('Formato JSON no reconocido');
        }
        
        // Procesar los juegos según tu estructura
        estado.juegos = arrayJuegos.map((juego, index) => {
            // Obtener precio y manejar diferentes formatos
            let precio;
            const precioOriginal = juego.precio;
            
            if (typeof precioOriginal === 'string') {
                // Quitar "G ", puntos y comas, luego convertir a número
                const precioLimpio = precioOriginal
                    .replace(/^G\s*/i, '')  // Quitar "G " al inicio
                    .replace(/\./g, '')     // Quitar puntos de miles
                    .replace(',', '.')      // Convertir coma decimal a punto
                    .trim();
                
                precio = parseFloat(precioLimpio) || 0;
            } else {
                precio = Number(precioOriginal) || 0;
            }
            
            return {
                id: juego.id || index + 1,
                nombre: juego.Nombre || juego.nombre || 'Juego sin nombre',
                precio: precio,
                imagen: juego.imagen || CONFIG.defaultImage,
                consola: 'PS2'
            };
        });
        
        estado.juegosFiltrados = [...estado.juegos];
        estado.paginaActual = 1;
        
        mostrarJuegos();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarError(`Error al cargar juegos: ${error.message}`);
    }
}

// Mostrar juegos en la página
function mostrarJuegos() {
    const container = document.getElementById('juegosContainer');
    
    if (estado.juegosFiltrados.length === 0) {
        container.innerHTML = `
            <div class="no-resultados">
                <p>No se encontraron juegos</p>
                ${document.querySelector('.caja-texto')?.value ? 
                    '<button onclick="resetearBusqueda()">Mostrar todos</button>' : 
                    '<button onclick="cargarJuegosDesdeJSON()">Reintentar</button>'}
            </div>
        `;
        return;
    }
    
    // Calcular qué juegos mostrar según la página actual
    const inicio = (estado.paginaActual - 1) * CONFIG.itemsPerPage;
    const fin = inicio + CONFIG.itemsPerPage;
    const juegosParaMostrar = estado.juegosFiltrados.slice(inicio, fin);
    
    // Crear el grid de juegos
    const gridHTML = juegosParaMostrar.map(juego => crearCardJuego(juego)).join('');
    
    container.innerHTML = `
        <div class="grid-juegos">
            ${gridHTML}
        </div>
    `;
    
    // Agregar paginación si es necesario
    agregarPaginacion();
}

// Agregar controles de paginación
function agregarPaginacion() {
    const totalPaginas = Math.ceil(estado.juegosFiltrados.length / CONFIG.itemsPerPage);
    
    if (totalPaginas <= 1) return;
    
    const container = document.getElementById('juegosContainer');
    const paginacion = document.createElement('div');
    paginacion.className = 'contenedor-botones';
    
    // Botón anterior
    if (estado.paginaActual > 1) {
        const btnAnterior = document.createElement('button');
        btnAnterior.className = 'btnver-mas';
        btnAnterior.textContent = '← Anterior';
        btnAnterior.onclick = () => {
            estado.paginaActual--;
            mostrarJuegos();
            scrollToJuegos();
        };
        paginacion.appendChild(btnAnterior);
    }
    
    // Información de página
    const infoPagina = document.createElement('span');
    infoPagina.style.cssText = 'color: white; margin: 0 15px; font-size: 16px;';
    infoPagina.textContent = `Página ${estado.paginaActual} de ${totalPaginas}`;
    paginacion.appendChild(infoPagina);
    
    // Botón siguiente
    if (estado.paginaActual < totalPaginas) {
        const btnSiguiente = document.createElement('button');
        btnSiguiente.className = 'btnver-mas';
        btnSiguiente.textContent = 'Siguiente →';
        btnSiguiente.onclick = () => {
            estado.paginaActual++;
            mostrarJuegos();
            scrollToJuegos();
        };
        paginacion.appendChild(btnSiguiente);
    }
    
    container.appendChild(paginacion);
}

// Función para buscar juegos
function buscarJuegos() {
    const busqueda = document.querySelector('.caja-texto').value.toLowerCase().trim();
    
    if (busqueda === '') {
        estado.juegosFiltrados = [...estado.juegos];
    } else {
        estado.juegosFiltrados = estado.juegos.filter(juego => 
            juego.nombre.toLowerCase().includes(busqueda)
        );
    }
    
    estado.paginaActual = 1;
    mostrarJuegos();
}

// Función para resetear búsqueda
function resetearBusqueda() {
    document.querySelector('.caja-texto').value = '';
    estado.juegosFiltrados = [...estado.juegos];
    estado.paginaActual = 1;
    mostrarJuegos();
}

// Función para manejar el carrito
function toggleCarrito(juegoId) {
    const juego = estado.juegos.find(j => j.id === juegoId);
    const boton = document.querySelector(`[data-id="${juegoId}"]`);
    const indice = estado.carrito.findIndex(item => item.id === juegoId);
    
    if (indice === -1) {
        // Agregar al carrito
        estado.carrito.push({
            id: juego.id,
            nombre: juego.nombre,
            precio: juego.precio,
            precioFormateado: formatearPrecio(juego.precio),
            imagen: juego.imagen,
            cantidad: 1
        });
        
        if (boton) {
            boton.textContent = '✓ En carrito';
            boton.classList.add('agregado');
        }
        
        mostrarNotificacion(`"${juego.nombre}" agregado al carrito`);
    } else {
        // Quitar del carrito
        estado.carrito.splice(indice, 1);
        
        if (boton) {
            boton.textContent = '+ Añadir al carrito';
            boton.classList.remove('agregado');
        }
        
        mostrarNotificacion(`"${juego.nombre}" eliminado del carrito`);
    }
    
    // Guardar en localStorage
    localStorage.setItem('carrito', JSON.stringify(estado.carrito));
    
    // Actualizar contador
    actualizarContadorCarrito();
}

// Actualizar contador del carrito
function actualizarContadorCarrito() {
    const contador = document.getElementById('contador-carrito');
    if (contador) {
        const total = estado.carrito.reduce((sum, item) => sum + item.cantidad, 0);
        contador.textContent = total;
        contador.style.display = total > 0 ? 'flex' : 'none';
    }
}

// Mostrar notificación
function mostrarNotificacion(mensaje) {
    // Remover notificación anterior si existe
    const notifAnterior = document.querySelector('.notificacion');
    if (notifAnterior) notifAnterior.remove();
    
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion';
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'desaparecer 0.3s ease forwards';
        setTimeout(() => notificacion.remove(), 300);
    }, 2000);
}

// Mostrar error
function mostrarError(mensaje) {
    const container = document.getElementById('juegosContainer');
    container.innerHTML = `
        <div class="error">
            <p>${mensaje}</p>
            <p style="font-size: 14px; margin-top: 10px; color: #ccc;">
                Ruta del archivo: ${CONFIG.jsonPath}
            </p>
            <button onclick="cargarJuegosDesdeJSON()">Reintentar</button>
        </div>
    `;
}

// Scroll suave a la sección de juegos
function scrollToJuegos() {
    const juegosContainer = document.getElementById('juegosContainer');
    if (juegosContainer) {
        window.scrollTo({
            top: juegosContainer.offsetTop - 100,
            behavior: 'smooth'
        });
    }
}

// Configurar eventos
function configurarEventos() {
    const btnBuscar = document.querySelector('.btn-buscar');
    const inputBuscar = document.querySelector('.caja-texto');
    
    if (btnBuscar) {
        btnBuscar.addEventListener('click', buscarJuegos);
    }
    
    if (inputBuscar) {
        inputBuscar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') buscarJuegos();
        });
        
        // Limpiar búsqueda cuando se borra el texto
        inputBuscar.addEventListener('input', (e) => {
            if (e.target.value === '') {
                resetearBusqueda();
            }
        });
    }
}

// Hacer funciones disponibles globalmente
window.buscarJuegos = buscarJuegos;
window.resetearBusqueda = resetearBusqueda;
window.toggleCarrito = toggleCarrito;
window.cargarJuegosDesdeJSON = cargarJuegosDesdeJSON;