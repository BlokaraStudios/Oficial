document.addEventListener('DOMContentLoaded', function() {
    // Inicializar datos si no existen
    initializeStorage();
    
    // Toggle entre login/register
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    loginTab.addEventListener('click', () => switchTab('login'));
    registerTab.addEventListener('click', () => switchTab('register'));
    
    // Check URL for register parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('register') === 'true') {
        switchTab('register');
    }
    
    // Password strength indicator
    const passwordInput = document.getElementById('register-password');
    passwordInput.addEventListener('input', updatePasswordStrength);
    
    // Form submissions
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
});

function initializeStorage() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    
    // Datos de ejemplo (puedes eliminarlos en producción)
    if (!localStorage.getItem('clientes')) {
        localStorage.setItem('clientes', JSON.stringify([
            "cliente@ejemplo.com",
            "user@test.com"
        ]));
    }
    
    if (!localStorage.getItem('admin')) {
        localStorage.setItem('admin', JSON.stringify([
            "admin@blokara.com"
        ]));
    }
}

function switchTab(tab) {
    document.getElementById('login-tab').classList.toggle('active', tab === 'login');
    document.getElementById('register-tab').classList.toggle('active', tab === 'register');
    document.getElementById('login-form').classList.toggle('active', tab === 'login');
    document.getElementById('register-form').classList.toggle('active', tab === 'register');
}

function updatePasswordStrength() {
    const password = this.value;
    const strength = checkPasswordStrength(password);
    const bars = document.querySelectorAll('.strength-bar');
    
    bars.forEach((bar, index) => {
        bar.style.backgroundColor = index < strength ? getStrengthColor(strength) : 'rgba(255, 255, 255, 0.1)';
    });
    
    document.querySelector('.strength-text').textContent = getStrengthText(strength);
}

function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return Math.min(strength, 5);
}

function getStrengthColor(strength) {
    const colors = ['#ff0000', '#ff3300', '#ffcc00', '#33cc33', '#009900'];
    return colors[strength - 1] || '#ff0000';
}

function getStrengthText(strength) {
    const texts = ['Muy débil', 'Débil', 'Moderada', 'Fuerte', 'Muy fuerte'];
    return texts[strength - 1] || '';
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify({
            email: user.email,
            name: user.name,
            isClient: checkIfClient(user.email),
            isAdmin: checkIfAdmin(user.email)
        }));
        
        showSuccess('¡Ingreso exitoso! Redirigiendo...');
        setTimeout(() => window.location.href = '../hub/hub.html', 1500);
    } else {
        showError('Credenciales incorrectas');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    
    if (password !== confirmPassword) {
        showError('Las contraseñas no coinciden');
        return;
    }
    
    if (checkPasswordStrength(password) < 3) {
        showError('La contraseña es demasiado débil');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users'));
    if (users.some(u => u.email === email)) {
        showError('El correo ya está registrado');
        return;
    }
    
    users.push({ name, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    
    showSuccess('¡Registro exitoso! Redirigiendo...');
    setTimeout(() => window.location.href = '../hub/hub.html', 1500);
}

function checkIfClient(email) {
    const clients = JSON.parse(localStorage.getItem('clientes') || '[]');
    return clients.includes(email);
}

function checkIfAdmin(email) {
    const admins = JSON.parse(localStorage.getItem('admin') || '[]');
    return admins.includes(email);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelector('.auth-form.active').appendChild(errorDiv);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    
    document.querySelectorAll('.success-message').forEach(el => el.remove());
    document.querySelector('.auth-form.active').appendChild(successDiv);
}