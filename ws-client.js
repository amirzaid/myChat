const messageForm = document.querySelector('#message-form');
const messageInput = document.querySelector('#message-input');
const messageButton = document.querySelector('#send-button');
const addPersonButton = document.querySelector('#add-person-btn');
const mainChatConainer = document.querySelector('#chat');
const tabs = document.querySelector('.tabs');
var room = 'public';
var message_count = 0; // save message id in clients chat
var chat_count = 0; // save chat id in clients view
// Map room names to their elements id
const chats = new Map([
    ["public", "public"],
    ["server", "public"],
]);

// Create socket to server
const socket = io('http://localhost:3000');
socket.on('connect', () => {
    displayMessage({
        id: message_count,
        text: `You connected with id: ${socket.id}`,
        room: 'public',
    }, 'server');
});

// Handle message receiving
socket.on('receive-message', (message, id) => {
    displayMessage(message, id);
    socket.emit('delivered', message.id, id); // Notify server the message was seen
});

socket.on('mark-seen', (message_id) => {
    const deliveredMessage = document.querySelector(`#${message_id}`);
    deliveredMessage.querySelector('.tik-icon').classList.add('blue-text');
});

// Send a message
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Check if message is not empty
    if (messageInput.value === '') return;
    
    // Build message object
    const message = {
        id: `m${++message_count}`,
        text: messageInput.value,
        room: room,
    }
    console.log(message);
    
    // Display my message
    const card = displayMessage(message, 'you');
    socket.emit('send-message', message, messageRecieved(card));
    
    // Reset message value
    messageInput.value = '';
})

// Display message on chat
function displayMessage (message, source) {
    // Create a card element
    const card = document.createElement('div');
    card.className = 'card';
    if (source === 'you') {
        card.setAttribute('id', message.id);
    }
    // Card's element content
    const cardContent = document.createElement('div');
    cardContent.classList.add('card-content');
    // Card title
    const title = document.createElement('span');
    title.textContent = `${source}`;
    title.classList.add('teal-text', 'text-lighten-2');
    // Card's text (message)
    const text = document.createElement('p');
    text.textContent = message.text;
    // Card's timestamp
    const timestamp = document.createElement('span');
    const currentDate = new Date();
    timestamp.textContent = `${('0' + currentDate.getHours()).slice(-2)}:${('0' + currentDate.getMinutes()).slice(-2)}`;
    timestamp.classList.add('timestamp');
    // When my message
    if (source === 'you') {
        card.classList.add('light-green', 'lighten-3');
    }
    if (source === 'server') {
        card.classList.add('yellow', 'lighten-3');
    }
    cardContent.append(title);
    cardContent.append(text);
    card.append(cardContent);
    card.append(timestamp);
    
    // If i sent the meesage display it in the room the message was sent in
    if (source === 'you') {
        document.querySelector(`#${chats.get(message.room)}`).append(card); // Append message to chat with source
    } else if (message.room !== 'public') {
        // When receiving a message from a new chat
        if (!chats.get(source)) {
            // Create the chat
            addChatWithUser(source);
        }
        document.querySelector(`#${chats.get(source)}`).append(card); // Append message to chat with source
    } else {
    // Is public message
    document.querySelector(`#${chats.get(message.room)}`).append(card);
    }
    
    if (source !== room && message.room !== 'public' && source !== 'server' && source !== 'you') {
        createNotifactionOnTab(chats.get(source));
    }
    return card;
}

// Display a notifcation on a tab
function createNotifactionOnTab (tab_id) {
    const tab = document.querySelector(`a[href='#${tab_id}']`);
    tab.children[0].classList.remove('notification-disabled');
}

const add_contact_btn = document.querySelector('#add-contact-btn');
add_contact_btn.addEventListener('click', () => {
    const id = document.querySelector('#add_id');
    addChatWithUser(id.value); // add to contacts
    id.value = ''; // clear input field
});

// add chat with user
function addChatWithUser (id) {
    chats.set(id, `c${++chat_count}`); // Add to chats map
    // add new chat to sidebar
    const emptyChatMessage = document.querySelector('.subheader');
    if (emptyChatMessage.style.display === 'block') {
        emptyChatMessage.style.display = 'none';
    }
    const slideOut = document.querySelector('#slide-out');
    const chat = document.createElement('li');
    const chatLink = document.createElement('a');
    chatLink.textContent = id;
    chatLink.href = '#!';
    chatLink.classList.add('sidenav-contact');
    chatLink.addEventListener('click', (e) => {room=id;});
    chat.append(chatLink);
    slideOut.append(chat);
    // add new chat tab
    const newTab = document.createElement('li');
    newTab.classList.add("tab", "col", "s3");
    const newTabLink = document.createElement('a');
    newTabLink.setAttribute('href', `#${chats.get(id)}`);
    newTabLink.textContent = id;
    newTabLink.innerHTML += '<i class="material-icons text-lighten-2 tiny notification-disabled">notifications</i>';
    newTabLink.addEventListener('click', (e) => {
        room=id;
        e.target.children[0].classList.add('notification-disabled');
    });
    newTab.append(newTabLink);
    tabs.append(newTab);
    // add new chat container
    const newChatContainer = document.createElement('div');
    newChatContainer.setAttribute('id', chats.get(id));
    newChatContainer.style.display = 'none'; // The new chat is not focused so it should appear blank
    mainChatConainer.append(newChatContainer);
}

// add double tick icon to a message
function messageRecieved (card) {
    const tikIcon = document.createElement('i');
    tikIcon.classList.add("material-icons", "text-lighten-2", "tik-icon");
    tikIcon.textContent = 'done';
    card.append(tikIcon);
}

// edit username handler
document.querySelector('#change-username-btn').addEventListener('click', () => {
    const newUsername = document.querySelector('#edit-username').value;
    const id_field = document.querySelector('#id');
    id_field.textContent = newUsername; 
});

// switch to public tab
document.querySelector('#public-tab').addEventListener('click', () => {room='public'});
