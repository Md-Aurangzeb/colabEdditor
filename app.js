const express = require('express');
const app = express();
const server = require('http').createServer(app);
const WebSocket = require('ws');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));

const wss = new WebSocket.Server({ server });

const connectedClients = new Set();
// let data="";


mongoose.connect("mongodb://localhost:27017/dataDB").catch(err=>console.log(err));

const dataSchema = new mongoose.Schema({
  _id : Number,
  content : String
});

const Data = mongoose.model('Data',dataSchema);


function broadcastMessage(message, sender) {
  connectedClients.forEach((client) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
function updateNewConnectedClient(client){
  const findMessage = async ()=>{
    const foundMessage = await Data.findOne({_id:1});
    if(foundMessage)
      client.send(foundMessage.content);
    else{
      const insertData = new Data({
        _id : 1,
        content : ""
      });
      insertData.save().catch(err=>console.log(err));
      client.send("");
    }
  }
    findMessage().catch(err=>console.log(err));
}
wss.on('connection', (ws) => {
  console.log('New client connected.');
  connectedClients.add(ws)
  updateNewConnectedClient(ws);
  // if(connectedClients.size!=1){
  //   ws.send(data);
  // }
  ws.on('message', (message) => {
    const updateData = async ()=>{
      const updatedData = await Data.updateOne({_id : 1},{$set : {content : message}});
      console.log(`Received message: ${message}`);
      broadcastMessage(message, ws);
    }
    updateData().catch(err=>console.log());
  });

  ws.on('close', () => {
    console.log('Client disconnected.');
    connectedClients.delete(ws);
  });
});
const PORT = process.env.PORT||3000;
server.listen(PORT, () => {
  console.log(`WebSocket hub server listening http://localhost:${PORT}!`);
});

