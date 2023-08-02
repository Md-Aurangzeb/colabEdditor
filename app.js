const express = require('express');
const app = express();
const server = require('http').createServer(app);
const WebSocket = require('ws');


app.use(express.static('public'));


const wss = new WebSocket.Server({ server });

const connectedClients = new Set();
let data="";
function broadcastMessage(message, sender) {
  connectedClients.forEach((client) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on('connection', (ws) => {
  console.log('New client connected.');
  
  connectedClients.add(ws);
  if(connectedClients.size!=1){
    ws.send(data);
  }
  ws.on('message', (message) => {
    data=message;
    console.log(`Received message: ${message}`);
    broadcastMessage(message, ws);
  });

  ws.on('close', () => {
    console.log('Client disconnected.');
    connectedClients.delete(ws);
  });
});
const port = 3000;
server.listen(port, () => {
  console.log(`WebSocket hub server listening on port ${port}!`);
});
