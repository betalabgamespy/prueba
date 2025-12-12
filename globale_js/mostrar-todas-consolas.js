// mostrar-todas-consolas.js - Muestra 9 juegos de cada consola en contenedores separados
console.log("🎮 Script para todas las consolas cargado");

// Variables globales
let carrito = [];

// ===== FUNCIONES DE FORMATO DE PRECIO =====
function formatearPrecioGs(precio) {
    if (!precio) return '₲ 0';
    
    if (typeof precio === 'string' && precio.includes('.')) {
        return `₲ ${precio}`;
    }
    
    const precioNum = parseInt(precio);
    if (isNaN(precioNum)) return '₲ 0';
    
    return `₲ ${precioNum.toLocaleString('es-PY')}`;
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ DOM cargado");
    
    // 1. Cargar carrito desde localStorage
    cargarCarritoDesdeStorage();
    
    // 2. Configurar navegación por anclas
    configurarNavegacionAnclas();
    
    // 3. Cargar todas las consolas
    cargarTodasLasConsolas();
});

// ===== FUNCIONES DEL CARRITO =====
function cargarCarritoDesdeStorage() {
    try {
        const carritoGuardado = localStorage.getItem('carrito');
        
        if (carritoGuardado) {
            carrito = JSON.parse(carritoGuardado);
        } else {
            carrito = [];
            localStorage.setItem('carrito', JSON.stringify([]));
        }
        
        console.log("🛒 Carrito cargado:", carrito.length, "productos");
        actualizarContadorCarrito();
        
    } catch (error) {
        console.error("❌ Error cargando carrito:", error);
        carrito = [];
    }
}

function guardarCarritoEnStorage() {
    try {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    } catch (error) {
        console.error("❌ Error guardando carrito:", error);
    }
}

function actualizarContadorCarrito() {
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    
    let contador = document.getElementById('contador-carrito');
    
    if (!contador) {
        const enlaceCarrito = document.querySelector('a[href="carrito.html"]');
        if (enlaceCarrito) {
            contador = document.createElement('span');
            contador.id = 'contador-carrito';
            contador.className = 'contador-carrito';
            enlaceCarrito.appendChild(contador);
        }
    }
    
    if (contador) {
        contador.textContent = totalItems;
        contador.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// ===== CONFIGURAR NAVEGACIÓN POR ANCLAS =====
function configurarNavegacionAnclas() {
    const botones = document.querySelectorAll('.navegadores');
    
    botones.forEach(boton => {
        boton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Quitar clase activa de todos los botones
            botones.forEach(b => b.classList.remove('activo'));
            
            // Añadir clase activa al botón clickeado
            this.classList.add('activo');
            
            // Desplazar suavemente a la sección
            const targetId = this.getAttribute('href').replace('#', '');
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== CARGAR TODAS LAS CONSOLAS =====
async function cargarTodasLasConsolas() {
    console.log("🔄 Cargando todas las consolas...");
    
    // Cargar PS2
    await cargarYMostrarConsola('ps2', 'juegosContainerPS2');
    
    // Cargar PS3
    await cargarYMostrarConsola('ps3', 'juegosContainerPS3');
    
    // Cargar PS4
    await cargarYMostrarConsola('ps4', 'juegosContainerPS4');
    
    console.log("✅ Todas las consolas cargadas");
}

// ===== CARGAR Y MOSTRAR UNA CONSOLA ESPECÍFICA =====
async function cargarYMostrarConsola(consola, containerId) {
    console.log(`🔄 Cargando ${consola.toUpperCase()}...`);
    
    try {
        const archivoJSON = `JUEGOS/juegos${consola}.json`;
        const respuesta = await fetch(archivoJSON);
        
        if (!respuesta.ok) {
            throw new Error(`Error ${respuesta.status} al cargar ${consola}`);
        }
        
        const data = await respuesta.json();
        
        // Manejar diferentes estructuras
        let juegos = [];
        if (Array.isArray(data)) {
            juegos = data;
        } else if (data[`juegos${consola}`]) {
            juegos = data[`juegos${consola}`];
        } else if (data.juegos) {
            juegos = data.juegos;
        }
        
        console.log(`✅ ${consola.toUpperCase()}: ${juegos.length} juegos encontrados`);
        
        // Mostrar solo los primeros 9 juegos
        mostrarJuegosEnContenedor(consola, juegos, containerId);
        
    } catch (error) {
        console.error(`❌ Error cargando ${consola}:`, error);
        mostrarErrorEnContenedor(consola, containerId);
    }
}

// ===== MOSTRAR 9 JUEGOS EN UN CONTENEDOR ESPECÍFICO =====
function mostrarJuegosEnContenedor(consola, juegos, containerId) {
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error(`❌ No se encontró #${containerId}`);
        return;
    }
    
    if (!juegos || juegos.length === 0) {
        container.innerHTML = `
            <div class="error">
                <p>📭 No se encontraron juegos de ${consola.toUpperCase()}</p>
                <button onclick="recargarConsola('${consola}', '${containerId}')">Reintentar</button>
            </div>
        `;
        return;
    }
    
    console.log(`🎨 Mostrando 8 juegos de ${consola.toUpperCase()} en #${containerId}`);
    
    // Tomar solo los primeros 9 juegos
    const juegosAMostrar = juegos.slice(0, 10);
    
    let html = '';
    
    // Colores diferentes para cada consola
    const colores = {
        ps2: '#ff4757', // Rojo
        ps3: '#2ed573', // Verde
        ps4: '#00a8ff'  // Azul
    };
    
    const color = colores[consola] || '#ff4757';
    
    juegosAMostrar.forEach((producto, index) => {
        const nombre = producto.Nombre || producto.nombre || producto.titulo || 'Sin nombre';
        const precio = producto.precio || producto.Precio || '0';
        const imagen = producto.imagen || producto.Imagen || `https://via.placeholder.com/300x200/333/666?text=${consola.toUpperCase()}`;
        const id = producto.id || `${consola}_${index}_${Date.now()}`;
        const nombreConsola = producto.consola || consola.toUpperCase();
        
        const precioFormateado = formatearPrecioGs(precio);
        const enCarrito = carrito.some(item => item.id == id);
        const textoBoton = enCarrito ? '✅ En Carrito' : '🛒 Añadir al Carrito';
        const claseBoton = enCarrito ? 'btn-carrito agregado' : 'btn-carrito';
        
        html += `
            <div class="juego-card" data-id="${id}">
                <img src="${imagen}" 
                     alt="${nombre}" 
                     class="juego-imagen"
                     onerror="this.src='https://via.placeholder.com/300x200/333/666?text=Imagen+No+Disponible'">
                <div class="juego-info">
                    <span class="juego-consola" style="display: inline-block; background: ${color}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 11px; margin-bottom: 8px;">${nombreConsola}</span>
                    <h3 class="juego-titulo">${nombre}</h3>
                    <div class="juego-precio precio-gs">${precioFormateado}</div>
                    <button class="${claseBoton}" 
                            onclick="añadirAlCarrito('${id}', '${nombre.replace(/'/g, "\\'")}', '${precio}', '${imagen}', '${nombreConsola}')">
                        ${textoBoton}
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    console.log(`✅ 8 juegos de ${consola.toUpperCase()} mostrados`);
}

// ===== FUNCIÓN PARA RECARGAR UNA CONSOLA =====
function recargarConsola(consola, containerId) {
    console.log(`🔄 Recargando ${consola}...`);
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <p>Recargando juegos de ${consola.toUpperCase()}...</p>
            </div>
        `;
    }
    
    // Esperar un momento y recargar
    setTimeout(() => {
        cargarYMostrarConsola(consola, containerId);
    }, 500);
}

// ===== FUNCIÓN PRINCIPAL - AÑADIR AL CARRITO =====
function añadirAlCarrito(id, nombre, precio, imagen, consola) {
    console.log(`➕ Añadiendo producto ${consola} ID:`, id);
    
    const index = carrito.findIndex(item => item.id == id);
    
    if (index === -1) {
        const productoCarrito = {
            id: id,
            nombre: nombre,
            precio: precio,
            imagen: imagen,
            cantidad: 1,
            consola: consola
        };
        
        carrito.push(productoCarrito);
        mostrarNotificacion(`"${nombre}" añadido al carrito`);
        console.log("✅ Producto añadido:", productoCarrito);
        
    } else {
        carrito[index].cantidad += 1;
        mostrarNotificacion(`"${nombre}" cantidad: ${carrito[index].cantidad}`);
        console.log("📈 Cantidad aumentada:", carrito[index]);
    }
    
    guardarCarritoEnStorage();
    actualizarContadorCarrito();
    actualizarTodosLosBotonesCarrito();
}

// ===== ACTUALIZAR TODOS LOS BOTONES DEL CARRITO =====
function actualizarTodosLosBotonesCarrito() {
    document.querySelectorAll('.btn-carrito').forEach(boton => {
        const onclick = boton.getAttribute('onclick');
        if (!onclick) return;
        
        // Extraer el ID del onclick
        const match = onclick.match(/añadirAlCarrito\('([^']+)'/);
        if (!match) return;
        
        const id = match[1];
        const enCarrito = carrito.some(item => item.id == id);
        
        if (enCarrito) {
            boton.textContent = '✅ En Carrito';
            boton.classList.add('agregado');
        } else {
            boton.textContent = '🛒 Añadir al Carrito';
            boton.classList.remove('agregado');
        }
    });
}

// ===== NOTIFICACIONES =====
function mostrarNotificacion(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion';
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'desaparecer 0.3s ease';
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
}

function mostrarErrorEnContenedor(consola, containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="error">
                <p>⚠️ Error al cargar juegos de ${consola.toUpperCase()}</p>
                <p>Revisa la consola para más detalles</p>
                <button onclick="recargarConsola('${consola}', '${containerId}')">Reintentar</button>
            </div>
        `;
    }
}

// ===== FUNCIONES GLOBALES =====
window.cargarTodasLasConsolas = cargarTodasLasConsolas;
window.añadirAlCarrito = añadirAlCarrito;
window.recargarConsola = recargarConsola;


console.log("🚀 Script para todas las consolas listo");
