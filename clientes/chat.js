document.addEventListener('DOMContentLoaded', function() {
    const userEmail = localStorage.getItem('userEmail');
    
    // Verificar si el usuario está logueado y es cliente
    if (!userEmail) {
        window.location.href = '../index.html';
        return;
    }

    // Obtener el ID del cliente basado en el email
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    const client = clients.find(c => c.email === userEmail);
    
    if (!client) {
        window.location.href = '../index.html';
        return;
    }

    // Guardar el ID del cliente en localStorage
    localStorage.setItem('clientId', client.id);
    
    // Cargar mensajes
    displayMessages();
    setupEventListeners();
});

function setupEventListeners() {
    // Botón de logout
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('clientId');
        window.location.href = '../index.html';
    });

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
                saveMessage(null, event.target.result, true);
                displayMessages();
            };
            reader.readAsDataURL(file);
        }
    });
}

function displayMessages() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
    
    const clientId = localStorage.getItem('clientId');
    if (!clientId) return;
    
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
                ${msg.sender === 'admin' ? 'Soporte' : 'Tú'} • ${new Date(msg.timestamp).toLocaleString()}
            </div>
            ${contentHTML}
        `;
        
        chatMessages.appendChild(messageDiv);
    });
    
    // Scroll al final de los mensajes
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    saveMessage(message);
    
    // Limpiar input
    messageInput.value = '';
    
    // Mostrar mensaje en el chat
    displayMessages();
}

function saveMessage(content, imageData = null, isImage = false) {
    const clientId = localStorage.getItem('clientId');
    if (!clientId) return;
    
    // Obtener mensajes existentes
    const messages = JSON.parse(localStorage.getItem('messages')) || [];
    
    // Crear nuevo mensaje
    const newMessage = {
        id: Date.now().toString(),
        clientId,
        sender: 'client',
        content: isImage ? imageData : content,
        isImage,
        timestamp: new Date().toISOString()
    };
    
    messages.push(newMessage);
    localStorage.setItem('messages', JSON.stringify(messages));
}