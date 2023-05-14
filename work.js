const script = document.createElement('script');
script.src = chrome.runtime.getURL('lib/mqttws31.js');
(document.head || document.documentElement).appendChild(script);


// Create a variable to hold the MQTT client object
let client;

function connect() {
    client = new Paho.MQTT.Client("localhost", 8883, "myclientid");
    client.connect({ onSuccess: onConnect, onFailure: onFailure });
}

function onConnect() {
    console.log('Connected to MQTT broker');
}

function onFailure(message) {
    console.error('Failed to connect to MQTT broker: ', message);
}

function sendTitle(title) {
    if (client && client.isConnected()) {
        const message = new Paho.MQTT.Message(title);
        message.destinationName = 'youtube_music/title';
        client.send(message);
    }
}

function sendElapsedTime(elapsedTime) {
    if (client && client.isConnected()) {
        const message = new Paho.MQTT.Message(elapsedTime);
        message.destinationName = 'youtube_music/elapsed_time';
        client.send(message);
    }
}

function sendCoverImage(coverImage) {
    if (client && client.isConnected()) {
        const message = new Paho.MQTT.Message(coverImage);
        message.destinationName = 'youtube_music/cover_image';
        client.send(message);
    }
}

function init() {
    connect();

    const titleElement = document.querySelector('ytmusic-player-bar .title.ytmusic-player-bar');
    const timeElement = document.querySelector('ytmusic-player-bar .time-info.ytmusic-player-bar');
    const imgElement = document.querySelector('ytmusic-player-bar .ytmusic-player-bar img.cover');

    if (titleElement) {
        const observer = new MutationObserver((mutationsList, observer) => {
            const title = titleElement.innerText.trim();
            console.log('New title:', title);
            sendTitle(title);
        });
        observer.observe(titleElement, { characterData: true, childList: true });
    }

    if (timeElement) {
        const observer = new MutationObserver((mutationsList, observer) => {
            const elapsedTime = timeElement.innerText.trim();
            console.log('New elapsed time:', elapsedTime);
            sendElapsedTime(elapsedTime);
        });
        observer.observe(timeElement, { characterData: true, childList: true });
    }

    if (imgElement) {
        const observer = new MutationObserver((mutationsList, observer) => {
            const coverImage = imgElement.getAttribute('src');
            console.log('New cover image:', coverImage);
            sendCoverImage(coverImage);
        });
        observer.observe(imgElement, { attributes: true });
    }
}

init();