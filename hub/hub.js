document.addEventListener('DOMContentLoaded', function() {
    // Verificar estado de autenticación
    checkAuthStatus();
    
    // Configurar la interfaz según el usuario
    setupUI();
    
    // Animación de texto rotatorio
    initRotatingText();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Verificar y mostrar enlaces especiales (clientes/admin)
    checkSpecialAccess();
});

// Función para verificar autenticación
function checkAuthStatus() {
    const userData = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!userData) {
        // Si no hay usuario logueado, redirigir al login
        window.location.href = '../login/login.html';
        return;
    }
    
    // Actualizar la UI con la información del usuario
    updateUserUI(userData);
}

// Configurar la interfaz de usuario
function setupUI() {
    // Botón de comprar
    document.getElementById('comprar-btn')?.addEventListener('click', () => {
        window.open('https://discord.com/channels/1372703053618217052/1372703055757447245', '_blank');
    });
    
    // Botón de Discord
    document.getElementById('discord-btn')?.addEventListener('click', () => {
        window.open('https://discord.com/channels/1372703053618217052/1372703055757447245', '_blank');
    });
    
    // Botón de logout
    document.getElementById('logout-btn')?.addEventListener('click', logout);
}

// Inicializar texto rotatorio
function initRotatingText() {
    const texts = [
        "Tu Proyecto, Tu idea, te ayudamos a comenzar",
        "Tu idea cobra vida",
        "Tu proyecto empieza hoy"
    ];
    
    let currentIndex = 0;
    const textElement = document.querySelector('.rotating-text');
    
    if (!textElement) return;
    
    function rotateText() {
        textElement.style.opacity = 0;
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % texts.length;
            textElement.textContent = texts[currentIndex];
            textElement.style.opacity = 1;
        }, 500);
    }
    
    // Rotar cada 3 segundos
    setInterval(rotateText, 3000);
}

// Verificar acceso especial (clientes/admin)
function checkSpecialAccess() {
    const userData = JSON.parse(localStorage.getItem('currentUser'));
    if (!userData) return;
    
    // Obtener listas de clientes y admins
    const clients = JSON.parse(localStorage.getItem('clientes')) || [];
    const admins = JSON.parse(localStorage.getItem('admin')) || [];
    
    // Mostrar enlace de clientes si corresponde
    if (clients.includes(userData.email)) {
        document.getElementById('clientes-link').style.display = 'block';
    }
    
    // Mostrar enlace de admin si corresponde
    if (admins.includes(userData.email)) {
        document.getElementById('admin-link').style.display = 'block';
    }
}

// Actualizar UI con datos del usuario
function updateUserUI(userData) {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;
    
    authButtons.innerHTML = `
        <button id="logout-btn" class="btn-logout">
            <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
        </button>
        <span class="user-email">${userData.email}</span>
    `;
}

// Función de logout
function logout() {
    // Eliminar datos de sesión
    localStorage.removeItem('currentUser');
    
    // Redirigir al login
    window.location.href = '../login/login.html';
}

// Función para verificar privilegios (usada en otras páginas)
function checkUserPrivileges() {
    const userData = JSON.parse(localStorage.getItem('currentUser'));
    if (!userData) return false;
    
    const clients = JSON.parse(localStorage.getItem('clientes') || []);
    const admins = JSON.parse(localStorage.getItem('admin') || []);
    
    return {
        isClient: clients.includes(userData.email),
        isAdmin: admins.includes(userData.email)
    };
}

// Función para mostrar notificaciones
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}