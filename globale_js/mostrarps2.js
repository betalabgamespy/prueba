// mostrarps2.js - MOSTRAR SOLO 9 JUEGOS DE PS2
console.log("🎮 Script PS2 cargado");

// Variables globales
let carrito = [];
let juegosPS2 = [];

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
    console.log("✅ DOM cargado - PS2");
    
    // 1. Cargar carrito desde localStorage
    cargarCarritoDesdeStorage();
    
    // 2. Cargar juegos PS2
    cargarJuegosPS2();
});

// ===== FUNCIONES DEL CARRITO =====
function cargarCarritoDesdeStorage() {
    try {
        const carritoGuardado = localStorage.getItem('carrito');
        console.log("📦 Carrito en localStorage:", carritoGuardado);
        
        if (carritoGuardado) {
            carrito = JSON.parse(carritoGuardado);
        } else {
            carrito = [];
            localStorage.setItem('carrito', JSON.stringify([]));
        }
        
        console.log("🛒 Carrito cargado:", carrito);
        actualizarContadorCarrito();
        
    } catch (error) {
        console.error("❌ Error cargando carrito:", error);
        carrito = [];
    }
}

function guardarCarritoEnStorage() {
    try {
        localStorage.setItem('carrito', JSON.stringify(carrito));
        console.log("💾 Carrito guardado:", carrito);
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
        console.log("🔢 Contador actualizado:", totalItems);
    }
}

// ===== FUNCIÓN PRINCIPAL - AÑADIR AL CARRITO =====
function añadirAlCarrito(id, nombre, precio, imagen) {
    console.log("➕ Añadiendo producto PS2 ID:", id);
    
    const productoOriginal = juegosPS2.find(p => p.id == id);
    if (!productoOriginal) {
        console.error("❌ Producto no encontrado:", id);
        return;
    }
    
    const index = carrito.findIndex(item => item.id == id);
    
    if (index === -1) {
        const productoCarrito = {
            id: id,
            nombre: nombre,
            precio: precio,
            imagen: imagen,
            cantidad: 1,
            consola: 'PS2'
        };
        
        carrito.push(productoCarrito);
        mostrarNotificacion(`"${nombre}" añadido al carrito`);
        console.log("✅ Producto PS2 añadido:", productoCarrito);
        
    } else {
        carrito[index].cantidad += 1;
        mostrarNotificacion(`"${nombre}" cantidad: ${carrito[index].cantidad}`);
        console.log("📈 Cantidad aumentada:", carrito[index]);
    }
    
    guardarCarritoEnStorage();
    actualizarContadorCarrito();
    actualizarBotonesCarrito();
}

function actualizarBotonesCarrito() {
    console.log("🔄 Actualizando botones PS2...");
    
    document.querySelectorAll('.btn-carrito').forEach(boton => {
        const onclick = boton.getAttribute('onclick');
        if (!onclick) return;
        
        const match = onclick.match(/añadirAlCarrito\((\d+)/);
        if (!match) return;
        
        const id = parseInt(match[1]);
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

// ===== CARGAR JUEGOS PS2 =====
async function cargarJuegosPS2() {
    console.log("🔄 Cargando juegos PS2...");
    
    try {
        const respuesta = await fetch('JUEGOS/juegosps2.json');
        
        if (!respuesta.ok) {
            throw new Error(`Error ${respuesta.status} al cargar PS2`);
        }
        
        const data = await respuesta.json();
        
        // Manejar diferentes estructuras
        if (Array.isArray(data)) {
            juegosPS2 = data;
        } else if (data.juegosps2) {
            juegosPS2 = data.juegosps2;
        } else if (data.juegos) {
            juegosPS2 = data.juegos;
        } else {
            juegosPS2 = [];
        }
        
        // Asignar IDs si no tienen
        juegosPS2.forEach((p, index) => {
            if (!p.id) p.id = `ps2_${index}_${Date.now()}`;
            p.consola = 'PS2';
        });
        
        console.log(`✅ PS2: ${juegosPS2.length} juegos cargados`);
        
        // Mostrar solo los primeros 9 juegos
        mostrarJuegosPS2Limitados();
        
    } catch (error) {
        console.error("❌ Error cargando PS2:", error);
        mostrarErrorPS2();
    }
}

// ===== MOSTRAR SOLO 9 JUEGOS PS2 =====
function mostrarJuegosPS2Limitados() {
    const container = document.getElementById('juegosContainer');
    
    if (!container) {
        console.error("❌ No se encontró #juegosContainer");
        return;
    }
    
    if (!juegosPS2 || juegosPS2.length === 0) {
        container.innerHTML = `
            <div class="error">
                <p>📭 No se encontraron juegos de PS2</p>
                <button onclick="cargarJuegosPS2()">Reintentar</button>
            </div>
        `;
        return;
    }
    
    console.log("🎨 Mostrando 9 juegos de PS2");
    
    // Tomar solo los primeros 9 juegos
    const juegosAMostrar = juegosPS2.slice(0, 9);
    
    let html = '';
    
    juegosAMostrar.forEach(producto => {
        const nombre = producto.Nombre || producto.nombre || producto.titulo || 'Sin nombre';
        const precio = producto.precio || producto.Precio || '0';
        const imagen = producto.imagen || producto.Imagen || 'https://via.placeholder.com/300x200/333/666?text=PS2';
        const id = producto.id;
        
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
                    <span class="juego-consola" style="display: inline-block; background: #ff4757; color: white; padding: 3px 10px; border-radius: 12px; font-size: 11px; margin-bottom: 8px;">PS2</span>
                    <h3 class="juego-titulo">${nombre}</h3>
                    <div class="juego-precio precio-gs">${precioFormateado}</div>
                    <button class="${claseBoton}" 
                            onclick="añadirAlCarrito('${id}', '${nombre.replace(/'/g, "\\'")}', '${precio}', '${imagen}')">
                        ${textoBoton}
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    console.log("✅ 9 juegos de PS2 mostrados");
}

// ===== NOTIFICACIONES =====
function mostrarNotificacion(mensaje) {
    console.log("🔔 Notificación:", mensaje);
    
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

function mostrarErrorPS2() {
    const container = document.getElementById('juegosContainer');
    if (container) {
        container.innerHTML = `
            <div class="error">
                <p>⚠️ Error al cargar juegos de PS2</p>
                <p>Revisa la consola para más detalles</p>
                <button onclick="cargarJuegosPS2()">Reintentar</button>
            </div>
        `;
    }
}

// ===== FUNCIONES GLOBALES =====
window.cargarJuegosPS2 = cargarJuegosPS2;
window.añadirAlCarrito = añadirAlCarrito;

console.log("🚀 Script PS2 listo para usar");