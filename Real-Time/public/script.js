const ws = new WebSocket(`ws://${window.location.host}`);
let username = '';
let room = '';

// DOM Elements
const joinContainer = document.querySelector('.join-container');
const chatRoom = document.querySelector('.chat-room');
const messagesDiv = document.getElementById('messages');
const typingDiv = document.getElementById('typing');
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send-btn');
const usernameInput = document.getElementById('username');
const roomInput = document.getElementById('room');
const joinButton = document.getElementById('join-btn');

// Add new DOM Elements at the top with other DOM elements
const aiChatButton = document.getElementById('ai-chat-btn');
const aiChatContainer = document.querySelector('.ai-chat-container');
const aiMessagesDiv = document.getElementById('ai-messages');
const aiMessageInput = document.getElementById('ai-message');
const aiSendButton = document.getElementById('ai-send-btn');
const closeChatButton = document.getElementById('close-chat-btn');

// Event Listeners
joinButton.addEventListener('click', joinRoom);
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', handleKeyPress);
messageInput.addEventListener('input', handleTyping);

// Add new event listeners with other event listeners
aiChatButton.addEventListener('click', toggleAIChat);
aiSendButton.addEventListener('click', sendAIMessage);
aiMessageInput.addEventListener('keypress', handleAIKeyPress);
closeChatButton.addEventListener('click', toggleAIChat);

let typingTimeout;

function joinRoom() {
    username = usernameInput.value.trim();
    room = roomInput.value.trim();
    
    if (username && room) {
        ws.send(JSON.stringify({
            type: 'join',
            username,
            room
        }));
        
        joinContainer.classList.add('hidden');
        chatRoom.classList.remove('hidden');
    }
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        if (ws.readyState === WebSocket.OPEN) {
            try {
                // Check if message is directed to the bot
                const isAICommand = message.toLowerCase().startsWith('@bot');
                ws.send(JSON.stringify({
                    type: 'message',
                    username,
                    room,
                    message,
                    isAICommand // Add this flag to indicate AI commands
                }));
                messageInput.value = '';
            } catch (error) {
                console.error('Error sending message:', error);
                alert('Failed to send message');
            }
        } else {
            console.error('WebSocket is not connected');
            alert('Not connected to chat server');
        }
    }
}

function handleKeyPress(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
}

function handleTyping() {
    ws.send(JSON.stringify({
        type: 'typing',
        username,
        room
    }));
    
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        ws.send(JSON.stringify({
            type: 'typing',
            username: '',
            room
        }));
    }, 1000);
}

function toggleAIChat() {
    aiChatContainer.classList.toggle('hidden');
}

function sendAIMessage() {
    const message = aiMessageInput.value.trim();
    if (message) {
        if (ws.readyState === WebSocket.OPEN) {
            try {
                // Display user message
                displayAIMessage('You', message);
                
                ws.send(JSON.stringify({
                    type: 'ai_message',
                    username,
                    message
                }));
                aiMessageInput.value = '';
            } catch (error) {
                console.error('Error sending message to AI:', error);
                alert('Failed to send message to AI');
            }
        }
    }
}

function handleAIKeyPress(e) {
    if (e.key === 'Enter') {
        sendAIMessage();
    }
}

function displayAIMessage(sender, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${sender.toLowerCase() === 'ai' ? 'ai-response' : 'user-message'}`;
    messageDiv.innerHTML = `
        <span class="ai-username">${sender}:</span>
        <span class="ai-message-text">${message}</span>
    `;
    aiMessagesDiv.appendChild(messageDiv);
    aiMessagesDiv.scrollTop = aiMessagesDiv.scrollHeight;
}

ws.onopen = () => {
    console.log('Connected to WebSocket server');
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    alert('Failed to connect to chat server');
};

ws.onclose = () => {
    console.log('Disconnected from WebSocket server');
    alert('Connection to chat server lost');
};

ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message') {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            messageDiv.innerHTML = `
                <span class="username">${data.username}:</span>
                <span class="message-text">${data.message}</span>
            `;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
            
            // Add handling for AI commands in regular messages
            if (data.isAICommand) {
                // Display the message in AI chat as well
                displayAIMessage('You', data.message);
            }
        }
        
        else if (data.type === 'ai_response') {
            // Display in both regular chat and AI chat
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ai-message';
            messageDiv.innerHTML = `
                <span class="username">AI Bot:</span>
                <span class="message-text">${data.message}</span>
            `;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
            
            // Display in AI chat container
            displayAIMessage('AI', data.message);
        }
        
        else if (data.type === 'info') {
            const infoDiv = document.createElement('div');
            infoDiv.className = 'info-message';
            infoDiv.textContent = data.message;
            messagesDiv.appendChild(infoDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
        
        else if (data.type === 'typing') {
            if (data.username) {
                typingDiv.textContent = `${data.username} is typing...`;
            } else {
                typingDiv.textContent = '';
            }
        }
    } catch (error) {
        console.error('Error processing message:', error);
    }
};
