// mostrarjuegos.js - CON MONEDA EN GUARANÍES
console.log("🎮 Script de juegos cargado");

// Variables globales
let carrito = [];
let todosLosProductos = [];

// ===== FUNCIONES DE FORMATO DE PRECIO =====
function formatearPrecioGs(precio) {
    if (!precio) return '₲ 0';
    
    // Si ya es string con formato "90.000"
    if (typeof precio === 'string' && precio.includes('.')) {
        // Convertir "90.000" a "₲ 90.000"
        return `₲ ${precio}`;
    }
    
    // Si es número o string sin formato
    const precioNum = parseInt(precio);
    if (isNaN(precioNum)) return '₲ 0';
    
    // Formatear con separadores de miles (90.000)
    return `₲ ${precioNum.toLocaleString('es-PY')}`;
}

function precioStringANumero(precioString) {
    if (!precioString) return 0;
    // Convertir "90.000" a 90000
    return parseInt(precioString.toString().replace(/\./g, ''));
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ DOM cargado");
    
    // 1. Cargar carrito desde localStorage
    cargarCarritoDesdeStorage();
    
    // 2. Cargar productos
    cargarTodosLosProductos();
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
        // Crear contador si no existe
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
    console.log("➕ Añadiendo producto ID:", id);
    
    // Buscar producto en la lista completa
    const productoOriginal = todosLosProductos.find(p => p.id == id);
    if (!productoOriginal) {
        console.error("❌ Producto no encontrado:", id);
        return;
    }
    
    // Verificar si ya está en el carrito
    const index = carrito.findIndex(item => item.id == id);
    
    if (index === -1) {
        // Producto nuevo en el carrito
        const productoCarrito = {
            id: id,
            nombre: nombre,
            precio: precio,
            imagen: imagen,
            cantidad: 1,
            consola: productoOriginal.consola || productoOriginal.Consola || 'PS2'
        };
        
        carrito.push(productoCarrito);
        mostrarNotificacion(`"${nombre}" añadido al carrito`);
        console.log("✅ Producto añadido:", productoCarrito);
        
    } else {
        // Incrementar cantidad
        carrito[index].cantidad += 1;
        mostrarNotificacion(`"${nombre}" cantidad: ${carrito[index].cantidad}`);
        console.log("📈 Cantidad aumentada:", carrito[index]);
    }
    
    // Guardar en localStorage
    guardarCarritoEnStorage();
    
    // Actualizar interfaz
    actualizarContadorCarrito();
    actualizarBotonesCarrito();
}

function actualizarBotonesCarrito() {
    console.log("🔄 Actualizando botones...");
    
    document.querySelectorAll('.btn-carrito').forEach(boton => {
        // Obtener ID del botón
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

// ===== CARGAR PRODUCTOS =====
async function cargarTodosLosProductos() {
    console.log("🔄 Cargando productos...");
    
    try {
        // Lista de archivos JSON
        const archivosJSON = [
            'JUEGOS/juegosps2.json',
            'JUEGOS/juegosps3.json',
            'JUEGOS/juegosps4.json'
        ];
        
        let productosCargados = [];
        
        // Cargar cada archivo
        for (const archivo of archivosJSON) {
            try {
                console.log(`📄 Intentando cargar: ${archivo}`);
                const productos = await cargarArchivoJSON(archivo);
                
                if (productos && productos.length > 0) {
                    // Añadir consola a cada producto
                    const consola = archivo.includes('ps2') ? 'PS2' : 
                                   archivo.includes('ps3') ? 'PS3' : 'PS4';
                    
                    productos.forEach(p => {
                        p.consola = consola;
                        if (!p.id) p.id = Date.now() + Math.random();
                    });
                    
                    productosCargados = productosCargados.concat(productos);
                    console.log(`✅ ${archivo}: ${productos.length} productos`);
                }
                
            } catch (error) {
                console.warn(`⚠️ No se pudo cargar ${archivo}:`, error);
            }
        }
        
        // Si no hay productos, usar ejemplo
        if (productosCargados.length === 0) {
            console.log("📝 Usando datos de ejemplo");
            productosCargados = datosEjemplo();
        }
        
        // Guardar en variable global
        todosLosProductos = productosCargados;
        console.log("🎮 Total productos cargados:", todosLosProductos.length);
        
        // Mostrar productos
        mostrarProductos(todosLosProductos);
        
    } catch (error) {
        console.error("❌ Error general:", error);
        mostrarError();
    }
}

async function cargarArchivoJSON(url) {
    const respuesta = await fetch(url);
    
    if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status} en ${url}`);
    }
    
    const data = await respuesta.json();
    
    // Manejar diferentes estructuras
    if (Array.isArray(data)) {
        return data;
    } else if (data.juegosps2 || data.juegosps3 || data.juegosps4) {
        const productos = [];
        if (data.juegosps2) productos.push(...data.juegosps2);
        if (data.juegosps3) productos.push(...data.juegosps3);
        if (data.juegosps4) productos.push(...data.juegosps4);
        return productos;
    } else if (data.juegos || data.productos) {
        return data.juegos || data.productos || [];
    }
    
    return [];
}

function mostrarProductos(productos) {
    const container = document.getElementById('juegosContainer');
    
    if (!container) {
        console.error("❌ No se encontró #juegosContainer");
        return;
    }
    
    if (!productos || productos.length === 0) {
        container.innerHTML = `
            <div class="error">
                <p>📭 No se encontraron productos</p>
                <button onclick="cargarTodosLosProductos()">Reintentar</button>
            </div>
        `;
        return;
    }
    
    console.log("🎨 Mostrando", productos.length, "productos");
    
    let html = '';
    productos.forEach(producto => {
        const nombre = producto.Nombre || producto.nombre || producto.titulo || 'Sin nombre';
        const precio = producto.precio || producto.Precio || '0';
        const imagen = producto.imagen || producto.Imagen || 'https://via.placeholder.com/300x200/333/666?text=Producto';
        const id = producto.id;
        const consola = producto.consola || producto.Consola || 'PS';
        
        // Formatear precio a guaraníes
        const precioFormateado = formatearPrecioGs(precio);
        
        // Verificar si está en carrito
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
                    <span class="juego-consola">${consola}</span>
                    <h3 class="juego-titulo">${nombre}</h3>
                    <div class="juego-precio precio-gs">${precioFormateado}</div>
                    <button class="${claseBoton}" 
                            onclick="añadirAlCarrito(${id}, '${nombre.replace(/'/g, "\\'")}', '${precio}', '${imagen}')">
                        ${textoBoton}
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    console.log("✅ Productos mostrados");
}

// ===== NOTIFICACIONES =====
function mostrarNotificacion(mensaje) {
    console.log("🔔 Notificación:", mensaje);
    
    // Crear elemento
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion';
    notificacion.textContent = mensaje;
    
    // Añadir al body
    document.body.appendChild(notificacion);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        notificacion.style.animation = 'desaparecer 0.3s ease';
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
}

function mostrarError() {
    const container = document.getElementById('juegosContainer');
    if (container) {
        container.innerHTML = `
            <div class="error">
                <p>⚠️ Error al cargar productos</p>
                <p>Revisa la consola para más detalles</p>
                <button onclick="cargarTodosLosProductos()">Reintentar</button>
            </div>
        `;
    }
}
// ===== FUNCIONES GLOBALES =====
window.cargarTodosLosProductos = cargarTodosLosProductos;
window.añadirAlCarrito = añadirAlCarrito;

console.log("🚀 Script listo para usar");