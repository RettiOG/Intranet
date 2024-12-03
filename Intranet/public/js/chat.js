// Verbinde mit dem Socket.IO-Server
const socket = io();

// HTML-Elemente referenzieren
const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

// Funktion zum Hinzufügen einer Nachricht in den Chat
function addMessage(message, isOwnMessage = false) {
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    if (isOwnMessage) {
        messageElement.style.fontWeight = 'bold'; // Eigene Nachrichten hervorheben
        messageElement.style.textAlign = 'right';
    }
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Scrollen nach unten
}

// Nachricht an den Server senden
sendBtn.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message) {
        addMessage(`Du: ${message}`, true); // Eigene Nachricht im Chat anzeigen
        socket.emit('message', message); // Nachricht an den Server senden
        messageInput.value = ''; // Eingabefeld leeren
    }
});

// Nachricht beim Drücken der Enter-Taste senden
messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendBtn.click(); // Klicke virtuell auf den Senden-Button
    }
});

// Eingehende Nachricht vom Server empfangen
socket.on('message', (message) => {
    addMessage(message); // Nachricht im Chat anzeigen
});
