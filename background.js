import { connect } from 'mqtt';

// Set up MQTT client
const client = connect("wss://broker.example.com", {
    clientId: "clientId",
    username: "username",
    password: "password",
});

// Set up callback functions
client.on('connect', onConnect);
client.on('message', onMessage);
client.on('error', onError);

// Connect to broker
function onConnect() {
    console.log("Connected to broker");
    const message = "Hello from Chrome extension";
    client.publish("topic/example", message);
}

// Function called when message arrives
function onMessage(topic, message) {
    console.log("Message received: " + message.toString());
}

// Function called when error occurs
function onError(error) {
    console.error("Error: " + error);
}