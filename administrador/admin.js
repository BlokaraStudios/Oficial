// Lista de correos autorizados como administradores
const authorizedAdmins = [
    "e123disonff@gmail.com"
];

// Verificar si el usuario está logueado y es admin
document.addEventListener('DOMContentLoaded', function() {
    const userEmail = localStorage.getItem('userEmail');
    const isAdmin = authorizedAdmins.includes(userEmail);
    
    if (!userEmail || !isAdmin) {
        window.location.href = '../index.html';
        return;
    }

    loadClients();
    setupEventListeners();
});

function setupEventListeners() {
    // Botón de logout
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('userEmail');
        window.location.href = '../index.html';
    });

    // Botón para agregar cliente
    document.getElementById('addClientBtn').addEventListener('click', addNewClient);

    // Botón para enviar mensaje
    document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);

    // Input para enviar mensaje con Enter
    document.getElementById('messageInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Subir archivo
    document.getElementById('fileInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const currentClient = document.querySelector('.client-item.active');
                if (currentClient) {
                    const clientId = currentClient.dataset.clientId;
                    saveMessage(clientId, null, event.target.result, true);
                    displayMessages(clientId);
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

function loadClients() {
    const clientList = document.getElementById('clientList');
    clientList.innerHTML = '';
    
    // Obtener lista de clientes del localStorage
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    
    clients.forEach(client => {
        const clientItem = document.createElement('div');
        clientItem.className = 'client-item';
        clientItem.dataset.clientId = client.id;
        clientItem.innerHTML = `
            <strong>${client.name}</strong>
            <div class="client-email">${client.email}</div>
        `;
        
        clientItem.addEventListener('click', function() {
            // Marcar como activo
            document.querySelectorAll('.client-item').forEach(item => {
                item.classList.remove('active');
            });
            this.classList.add('active');
            
            // Mostrar chat con este cliente
            document.getElementById('currentChatName').textContent = `Chat con ${client.name}`;
            displayMessages(client.id);
        });
        
        clientList.appendChild(clientItem);
    });
}

function addNewClient() {
    const nameInput = document.getElementById('newClientName');
    const emailInput = document.getElementById('newClientEmail');
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    
    if (!name || !email) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    // Obtener clientes existentes
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    
    // Verificar si el cliente ya existe
    if (clients.some(client => client.email === email)) {
        alert('Ya existe un cliente con este correo electrónico');
        return;
    }
    
    // Crear nuevo cliente
    const newClient = {
        id: Date.now().toString(),
        name,
        email,
        date: new Date().toISOString()
    };
    
    clients.push(newClient);
    localStorage.setItem('clients', JSON.stringify(clients));
    
    // Limpiar inputs
    nameInput.value = '';
    emailInput.value = '';
    
    // Recargar lista de clientes
    loadClients();
}

function displayMessages(clientId) {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
    
    // Obtener mensajes del localStorage
    const messages = JSON.parse(localStorage.getItem('messages')) || [];
    const clientMessages = messages.filter(msg => msg.clientId === clientId);
    
    clientMessages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.sender === 'admin' ? 'admin' : 'client'}`;
        
        let contentHTML = '';
        if (msg.isImage) {
            contentHTML = `<img src="${msg.content}" class="message-image" alt="Imagen enviada">`;
        } else {
            contentHTML = `<div class="message-content">${msg.content}</div>`;
        }
        
        messageDiv.innerHTML = `
            <div class="message-info">
                ${msg.sender === 'admin' ? 'Administrador' : 'Cliente'} • ${new Date(msg.timestamp).toLocaleString()}
            </div>
            ${contentHTML}
        `;
        
        chatMessages.appendChild(messageDiv);
    });
    
    // Scroll al final de los mensajes
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const currentClient = document.querySelector('.client-item.active');
    if (!currentClient) {
        alert('Selecciona un cliente primero');
        return;
    }
    
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    const clientId = currentClient.dataset.clientId;
    saveMessage(clientId, message);
    
    // Limpiar input
    messageInput.value = '';
    
    // Mostrar mensaje en el chat
    displayMessages(clientId);
}

function saveMessage(clientId, content, imageData = null, isImage = false) {
    // Obtener mensajes existentes
    const messages = JSON.parse(localStorage.getItem('messages')) || [];
    
    // Crear nuevo mensaje
    const newMessage = {
        id: Date.now().toString(),
        clientId,
        sender: 'admin',
        content: isImage ? imageData : content,
        isImage,
        timestamp: new Date().toISOString()
    };
    
    messages.push(newMessage);
    localStorage.setItem('messages', JSON.stringify(messages));
}