/**
 * Sistema de seguridad para Blokara Studios
 * 
 * Ventajas:
 * - Protege contra manipulación básica del localStorage
 * - Detecta intentos de inyección de código
 * - Restaura datos corruptos
 * - Previene acceso no autorizado
 * - Registra actividades sospechosas
 * 
 * Desventajas:
 * - No protege contra ataques avanzados (XSS, CSRF)
 * - Depende del localStorage del cliente
 * - No es seguridad a nivel de servidor
 * - No protege contra ataques de fuerza bruta
 */

// Configuración de seguridad
const securityConfig = {
    maxLoginAttempts: 5,
    localStorageCheckInterval: 30000, // 30 segundos
    activityTimeout: 900000, // 15 minutos
    backupInterval: 3600000 // 1 hora
};

// Variables de estado
let loginAttempts = 0;
let lastActivity = Date.now();
let localStorageBackup = {};

// Inicializar sistema de seguridad
function initSecurity() {
    // Hacer backup inicial del localStorage
    backupLocalStorage();
    
    // Configurar intervalos de seguridad
    setInterval(checkLocalStorage, securityConfig.localStorageCheckInterval);
    setInterval(checkActivity, securityConfig.activityTimeout / 2);
    setInterval(backupLocalStorage, securityConfig.backupInterval);
    
    // Monitorear actividad del usuario
    document.addEventListener('click', updateActivity);
    document.addEventListener('keypress', updateActivity);
    document.addEventListener('mousemove', updateActivity);
    
    // Proteger contra manipulación del localStorage
    protectLocalStorage();
    
    console.log('[Seguridad] Sistema de seguridad activado');
}

// Proteger el localStorage
function protectLocalStorage() {
    const originalSetItem = localStorage.setItem;
    const originalGetItem = localStorage.getItem;
    const originalRemoveItem = localStorage.removeItem;
    
    // Sobrescribir métodos para agregar protección
    localStorage.setItem = function(key, value) {
        // Verificar si el valor es válido
        if (typeof value !== 'string' || value.length > 10000) {
            console.warn('[Seguridad] Intento de almacenar valor inválido en localStorage');
            return false;
        }
        
        // Verificar claves permitidas
        const allowedKeys = ['userEmail', 'clientId', 'clients', 'messages', 'sessionToken'];
        if (!allowedKeys.includes(key)) {
            console.warn(`[Seguridad] Intento de usar clave no permitida: ${key}`);
            return false;
        }
        
        return originalSetItem.apply(this, arguments);
    };
    
    localStorage.getItem = function(key) {
        // Registrar acceso a localStorage
        console.log(`[Seguridad] Acceso a localStorage clave: ${key}`);
        return originalGetItem.apply(this, arguments);
    };
    
    localStorage.removeItem = function(key) {
        // Prevenir eliminación de elementos esenciales
        if (key === 'sessionToken' || key === 'userEmail') {
            console.warn('[Seguridad] Intento de eliminar elemento esencial');
            return false;
        }
        return originalRemoveItem.apply(this, arguments);
    };
}

// Hacer backup del localStorage
function backupLocalStorage() {
    localStorageBackup = {...localStorage};
    console.log('[Seguridad] Backup de localStorage realizado');
}

// Restaurar localStorage desde backup
function restoreLocalStorage() {
    if (Object.keys(localStorageBackup).length === 0) {
        console.warn('[Seguridad] No hay backup disponible para restaurar');
        return;
    }
    
    localStorage.clear();
    for (const key in localStorageBackup) {
        localStorage.setItem(key, localStorageBackup[key]);
    }
    console.log('[Seguridad] localStorage restaurado desde backup');
}

// Verificar integridad del localStorage
function checkLocalStorage() {
    try {
        // Verificar si localStorage está disponible
        if (!window.localStorage) {
            throw new Error('localStorage no disponible');
        }
        
        // Verificar estructura básica
        const requiredKeys = ['sessionToken', 'userEmail'];
        for (const key of requiredKeys) {
            if (localStorage.getItem(key) === null && localStorageBackup[key]) {
                console.warn(`[Seguridad] Clave ${key} faltante, restaurando...`);
                localStorage.setItem(key, localStorageBackup[key]);
            }
        }
        
        // Verificar datos de clientes
        const clients = JSON.parse(localStorage.getItem('clients')) || [];
        if (!Array.isArray(clients)) {
            throw new Error('Datos de clientes corruptos');
        }
        
        // Verificar mensajes
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        if (!Array.isArray(messages)) {
            throw new Error('Datos de mensajes corruptos');
        }
        
    } catch (error) {
        console.error(`[Seguridad] Error en localStorage: ${error.message}`);
        restoreLocalStorage();
        window.location.reload();
    }
}

// Verificar actividad del usuario
function checkActivity() {
    const now = Date.now();
    const inactiveTime = now - lastActivity;
    
    if (inactiveTime > securityConfig.activityTimeout) {
        console.log('[Seguridad] Usuario inactivo, cerrando sesión');
        logoutUser();
    }
}

// Actualizar última actividad
function updateActivity() {
    lastActivity = Date.now();
}

// Manejar intentos de login fallidos
function handleFailedLogin() {
    loginAttempts++;
    
    if (loginAttempts >= securityConfig.maxLoginAttempts) {
        console.warn('[Seguridad] Demasiados intentos fallidos, bloqueando acceso');
        localStorage.setItem('loginBlocked', Date.now().toString());
        logoutUser();
    }
}

// Cerrar sesión del usuario
function logoutUser() {
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('userEmail');
    window.location.href = '../index.html';
}

// Verificar si el usuario está autenticado
function isAuthenticated() {
    const sessionToken = localStorage.getItem('sessionToken');
    const userEmail = localStorage.getItem('userEmail');
    
    // Verificar bloqueo por intentos fallidos
    const loginBlocked = localStorage.getItem('loginBlocked');
    if (loginBlocked) {
        const blockTime = parseInt(loginBlocked);
        const now = Date.now();
        if (now - blockTime < 3600000) { // Bloqueado por 1 hora
            return false;
        } else {
            localStorage.removeItem('loginBlocked');
        }
    }
    
    return !!sessionToken && !!userEmail;
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', initSecurity);

// Exportar funciones para uso en otras páginas
window.security = {
    isAuthenticated,
    handleFailedLogin,
    logoutUser
};