// Configuración de EmailJS - REEMPLAZA ESTOS VALORES CON LOS TUYOS
const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_eeweg3r', // Reemplaza con tu Service ID
    TEMPLATE_ID: 'template_zw15n6b', // Reemplaza con tu Template ID
    PUBLIC_KEY: 'KClowgIj1k6B1J6cg' // Reemplaza con tu Public Key
};

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar EmailJS
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    
    // Elementos del DOM
    const soporteForm = document.getElementById('soporteForm');
    const mensajeExito = document.getElementById('mensajeExito');
    const submitBtn = document.getElementById('submitBtn');
    const nuevoReporteBtn = document.getElementById('nuevoReporteBtn');
    
    // Validación en tiempo real
    document.getElementById('email').addEventListener('input', validateEmail);
    document.getElementById('nombre').addEventListener('input', validateNombre);
    document.getElementById('asunto').addEventListener('input', validateAsunto);
    document.getElementById('descripcion').addEventListener('input', validateDescripcion);
    
    // Envío del formulario
    soporteForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validar todos los campos antes de enviar
        const isEmailValid = validateEmail();
        const isNombreValid = validateNombre();
        const isAsuntoValid = validateAsunto();
        const isDescripcionValid = validateDescripcion();
        
        if (!isEmailValid || !isNombreValid || !isAsuntoValid || !isDescripcionValid) {
            return;
        }
        
        // Cambiar estado del botón
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        
        try {
            // Obtener datos del formulario
            const formData = {
                from_email: document.getElementById('email').value,
                from_name: `${document.getElementById('nombre').value} ${document.getElementById('apellido').value || ''}`.trim(),
                subject: document.getElementById('asunto').value,
                message: document.getElementById('descripcion').value,
                date: new Date().toLocaleString()
            };
            
            // Enviar correo usando EmailJS
            await emailjs.send(
                EMAILJS_CONFIG.SERVICE_ID,
                EMAILJS_CONFIG.TEMPLATE_ID,
                formData
            );
            
            // Guardar copia local del reporte
            guardarReporteLocal(formData);
            
            // Mostrar mensaje de éxito
            soporteForm.style.display = 'none';
            mensajeExito.style.display = 'flex';
            
            // Limpiar formulario
            soporteForm.reset();
            
        } catch (error) {
            console.error('Error al enviar el reporte:', error);
            alert('Ocurrió un error al enviar tu reporte. Por favor intenta nuevamente.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Reporte';
        }
    });
    
    // Botón para nuevo reporte
    nuevoReporteBtn.addEventListener('click', function() {
        mensajeExito.style.display = 'none';
        soporteForm.style.display = 'block';
    });
});

// Función para guardar reporte en localStorage
function guardarReporteLocal(formData) {
    const reportes = JSON.parse(localStorage.getItem('soporteReportes') || '[]');
    reportes.push({
        ...formData,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('soporteReportes', JSON.stringify(reportes));
}

// Funciones de validación
function validateEmail() {
    const email = document.getElementById('email').value;
    const errorElement = document.getElementById('emailError');
    
    if (!email) {
        showError(errorElement, 'El email es requerido');
        return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError(errorElement, 'Ingresa un email válido');
        return false;
    }
    
    hideError(errorElement);
    return true;
}

function validateNombre() {
    const nombre = document.getElementById('nombre').value;
    const errorElement = document.getElementById('nombreError');
    
    if (!nombre) {
        showError(errorElement, 'El nombre es requerido');
        return false;
    }
    
    if (nombre.length < 2) {
        showError(errorElement, 'El nombre debe tener al menos 2 caracteres');
        return false;
    }
    
    hideError(errorElement);
    return true;
}

function validateAsunto() {
    const asunto = document.getElementById('asunto').value;
    const errorElement = document.getElementById('asuntoError');
    
    if (!asunto) {
        showError(errorElement, 'El asunto es requerido');
        return false;
    }
    
    if (asunto.length < 5) {
        showError(errorElement, 'El asunto debe tener al menos 5 caracteres');
        return false;
    }
    
    hideError(errorElement);
    return true;
}

function validateDescripcion() {
    const descripcion = document.getElementById('descripcion').value;
    const errorElement = document.getElementById('descripcionError');
    
    if (!descripcion) {
        showError(errorElement, 'La descripción es requerida');
        return false;
    }
    
    if (descripcion.length < 10) {
        showError(errorElement, 'La descripción debe tener al menos 10 caracteres');
        return false;
    }
    
    hideError(errorElement);
    return true;
}

function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

function hideError(element) {
    element.textContent = '';
    element.style.display = 'none';
}