document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el almacenamiento y datos de prueba
    initializeStorage();
    
    // Configurar los tabs de login/registro
    setupTabs();
    
    // Configurar el indicador de fortaleza de contraseña
    setupPasswordStrengthIndicator();
    
    // Configurar el toggle para mostrar contraseña
    setupShowPasswordToggle();
    
    // Configurar los formularios
    setupLoginForm();
    setupRegisterForm();
});

function initializeStorage() {
    // Solo inicializar si no existe la estructura
    if (!localStorage.getItem('users')) {
        const initialUsers = [
            {
                id: 1,
                name: "Administrador Blokara",
                email: "admin@blokara.com",
                password: hashPassword("Admin123!"),
                isAdmin: true,
                isClient: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: "Cliente Ejemplo",
                email: "cliente@ejemplo.com",
                password: hashPassword("Cliente123!"),
                isAdmin: false,
                isClient: true,
                createdAt: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('users', JSON.stringify(initialUsers));
    }
    
    // Inicializar otros datos necesarios
    if (!localStorage.getItem('loginAttempts')) {
        localStorage.setItem('loginAttempts', JSON.stringify({}));
    }
}

function hashPassword(password) {
    // Hashing simple para demostración (en producción usa bcrypt)
    return btoa(unescape(encodeURIComponent(`blokara-${password}-${password.length}`)));
}

function setupTabs() {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    
    loginTab.addEventListener('click', () => {
        switchTab('login');
        document.getElementById('login-email').focus();
    });
    
    registerTab.addEventListener('click', () => {
        switchTab('register');
        document.getElementById('register-name').focus();
    });
    
    // Comprobar si viene de redirección para registro
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('register') === 'true') {
        switchTab('register');
    }
}

function switchTab(tab) {
    document.getElementById('login-tab').classList.toggle('active', tab === 'login');
    document.getElementById('register-tab').classList.toggle('active', tab === 'register');
    document.getElementById('login-form').classList.toggle('active', tab === 'login');
    document.getElementById('register-form').classList.toggle('active', tab === 'register');
    
    // Limpiar mensajes de error al cambiar de tab
    clearMessages();
}

function setupPasswordStrengthIndicator() {
    const passwordInput = document.getElementById('register-password');
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = calculatePasswordStrength(password);
        
        // Actualizar barras de fortaleza
        const bars = document.querySelectorAll('.strength-bar');
        bars.forEach((bar, index) => {
            bar.style.backgroundColor = index < strength.level ? strength.color : 'rgba(255, 255, 255, 0.1)';
        });
        
        // Actualizar texto
        document.querySelector('.strength-text').textContent = strength.text;
        
        // Actualizar requisitos
        updatePasswordRequirements(password);
    });
}

function calculatePasswordStrength(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };
    
    const metRequirements = Object.values(requirements).filter(Boolean).length;
    const totalRequirements = Object.keys(requirements).length;
    const strengthPercentage = (metRequirements / totalRequirements) * 100;
    
    let level, text, color;
    
    if (strengthPercentage < 40) {
        level = 1;
        text = 'Muy débil';
        color = '#ff0000';
    } else if (strengthPercentage < 60) {
        level = 2;
        text = 'Débil';
        color = '#ff6600';
    } else if (strengthPercentage < 80) {
        level = 3;
        text = 'Moderada';
        color = '#ffcc00';
    } else if (strengthPercentage < 100) {
        level = 4;
        text = 'Fuerte';
        color = '#33cc33';
    } else {
        level = 4;
        text = 'Muy fuerte';
        color = '#009900';
    }
    
    return { level, text, color, requirements };
}

function updatePasswordRequirements(password) {
    const requirements = calculatePasswordStrength(password).requirements;
    
    document.getElementById('req-length').classList.toggle('valid', requirements.length);
    document.getElementById('req-uppercase').classList.toggle('valid', requirements.uppercase);
    document.getElementById('req-number').classList.toggle('valid', requirements.number);
    document.getElementById('req-special').classList.toggle('valid', requirements.special);
}

function setupShowPasswordToggle() {
    // Para login
    const showLoginPassword = document.getElementById('show-login-password');
    const loginPasswordInput = document.getElementById('login-password');
    
    showLoginPassword.addEventListener('change', function() {
        loginPasswordInput.type = this.checked ? 'text' : 'password';
    });
    
    // Para registro
    const showRegisterPassword = document.getElementById('show-register-password');
    const registerPasswordInput = document.getElementById('register-password');
    const confirmPasswordInput = document.getElementById('register-confirm');
    
    showRegisterPassword.addEventListener('change', function() {
        registerPasswordInput.type = this.checked ? 'text' : 'password';
        confirmPasswordInput.type = this.checked ? 'text' : 'password';
    });
}

function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Deshabilitar botón durante el envío
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner loading-spinner"></i> Ingresando...';
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        
        try {
            // Validar campos
            if (!email || !password) {
                throw new Error('Por favor completa todos los campos');
            }
            
            // Verificar credenciales
            const user = authenticateUser(email, password);
            
            if (!user) {
                throw new Error('Credenciales incorrectas');
            }
            
            // Registrar inicio de sesión exitoso
            registerSuccessfulLogin(email);
            
            // Mostrar mensaje de éxito
            showSuccess('¡Ingreso exitoso! Redirigiendo...');
            
            // Redirigir después de breve espera
            setTimeout(() => {
                window.location.href = '../hub/hub.html';
            }, 1500);
            
        } catch (error) {
            // Registrar intento fallido
            registerFailedLoginAttempt(email);
            
            // Mostrar mensaje de error
            showError(error.message);
            
            // Habilitar botón nuevamente
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Ingresar';
        }
    });
}

function authenticateUser(email, password) {
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.email === email);
    
    if (user && user.password === hashPassword(password)) {
        // Crear sesión de usuario
        const session = {
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin || false,
            isClient: user.isClient || false,
            lastLogin: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(session));
        return user;
    }
    
    return null;
}

function registerSuccessfulLogin(email) {
    // Limpiar intentos fallidos para este email
    const loginAttempts = JSON.parse(localStorage.getItem('loginAttempts'));
    delete loginAttempts[email];
    localStorage.setItem('loginAttempts', JSON.stringify(loginAttempts));
}

function registerFailedLoginAttempt(email) {
    const loginAttempts = JSON.parse(localStorage.getItem('loginAttempts'));
    
    if (!loginAttempts[email]) {
        loginAttempts[email] = 1;
    } else {
        loginAttempts[email]++;
    }
    
    localStorage.setItem('loginAttempts', JSON.stringify(loginAttempts));
    
    // Si hay muchos intentos fallidos, bloquear temporalmente
    if (loginAttempts[email] >= 5) {
        showError('Demasiados intentos fallidos. Por favor intenta más tarde.');
        document.getElementById('login-btn').disabled = true;
        
        // Habilitar después de 5 minutos
        setTimeout(() => {
            document.getElementById('login-btn').disabled = false;
        }, 5 * 60 * 1000);
    }
}

function setupRegisterForm() {
    const registerForm = document.getElementById('register-form');
    const registerBtn = document.getElementById('register-btn');
    
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Deshabilitar botón durante el envío
        registerBtn.disabled = true;
        registerBtn.innerHTML = '<i class="fas fa-spinner loading-spinner"></i> Registrando...';
        
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;
        
        try {
            // Validar campos
            if (!name || !email || !password || !confirmPassword) {
                throw new Error('Todos los campos son requeridos');
            }
            
            if (password !== confirmPassword) {
                throw new Error('Las contraseñas no coinciden');
            }
            
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                throw new Error('Ingresa un correo electrónico válido');
            }
            
            const strength = calculatePasswordStrength(password);
            if (strength.level < 3) {
                throw new Error('La contraseña es demasiado débil');
            }
            
            // Registrar nuevo usuario
            registerNewUser(name, email, password);
            
            // Mostrar mensaje de éxito
            showSuccess('¡Registro exitoso! Redirigiendo...');
            
            // Iniciar sesión automáticamente
            const user = authenticateUser(email, password);
            if (user) {
                setTimeout(() => {
                    window.location.href = '../hub/hub.html';
                }, 1500);
            }
            
        } catch (error) {
            // Mostrar mensaje de error
            showError(error.message);
            
            // Habilitar botón nuevamente
            registerBtn.disabled = false;
            registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> Registrarse';
        }
    });
}

function registerNewUser(name, email, password) {
    const users = JSON.parse(localStorage.getItem('users'));
    
    // Verificar si el email ya está registrado
    if (users.some(u => u.email === email)) {
        throw new Error('El correo electrónico ya está registrado');
    }
    
    // Crear nuevo usuario
    const newUser = {
        id: Date.now(),
        name,
        email,
        password: hashPassword(password),
        isAdmin: false,
        isClient: true,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
}

function showError(message) {
    clearMessages();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    document.querySelector('.auth-form.active').appendChild(errorDiv);
}

function showSuccess(message) {
    clearMessages();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    
    document.querySelector('.auth-form.active').appendChild(successDiv);
}

function clearMessages() {
    document.querySelectorAll('.error-message, .success-message').forEach(el => el.remove());
}
