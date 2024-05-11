const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const recommendSongsBtn = document.getElementById('recommend-songs-btn');
const songsPanel = document.getElementById('songs-panel');

let chatHistory = [];

function appendMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.setAttribute('data-label', sender === 'user' ? 'You:' : 'Bot: ');
    messageElement.innerText = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}



// Function to handle sending a message
function sendMessage() {
    const messageText = userInput.value.trim();
    if (messageText === '') return;

    appendMessage(messageText, 'user');
    userInput.value = '';

    // Sending message to Flask API to generate response
    fetch('/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: messageText })
    })
    .then(response => response.json())
    .then(data => {
        const botResponse = data.answer;
        appendMessage(botResponse, 'bot');
    })
    .catch(error => console.error('Error:', error));
}

// Event listener for sending message when "Send" button is clicked
sendBtn.addEventListener('click', sendMessage);

// Event listener for sending message when "Enter" key is pressed
userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Function to toggle the display of the songs panel
function toggleSongsPanel() {
    songsPanel.classList.toggle('open'); // Toggle the "open" class
}


// Event listener for the "Recommend Songs" button
recommendSongsBtn.addEventListener('click', function() {
    toggleSongsPanel(); // Toggle the display of songs panel
    analyzeTone(); // Trigger tone analysis
});

function analyzeTone() {
    fetch('/analyze_tone', {
        method: 'POST',  // POST method
        headers: {
            'Content-Type': 'application/json'  // Correct content type
        },
        body: JSON.stringify({ chatText: "Chat History" })  // Data to send
    })
    .then(response => response.json())
    .then(data => {
        console.log("Tone Analysis:");  // Handle the tone analysis result
        const songsListContainer = document.getElementById('songs-list');
        songsListContainer.innerHTML = '';
        
        // Iterate over the song recommendations and create HTML elements
        data.forEach(song => {
            const songElement = document.createElement('div');
            songElement.classList.add('song-details');
            songElement.innerHTML = `
                <div>Name: ${song.name}</div>
                <div>Artist: ${song.artist.name}</div>
                <div>Song URL: <a href="${song.url}">${song.url}</a></div>
                <div class="image-container">
                    <img src="${song.image[2]['#text']}" alt="Song Image">
                </div>
            `;
            songsListContainer.appendChild(songElement);
        });
    })
    .catch(error => console.error('Error:', error));
}


