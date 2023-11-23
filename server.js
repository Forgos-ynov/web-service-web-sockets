const express = require("express");
const http = require("http");
const webSocket = require("ws");
const clientsConnected = new Map();
let pixels = [];

const app = express();
const server = http.createServer(app);
const ws = new webSocket.Server({server});

ws.on("connection", socket => {
    socket.on("message", m => {
        const clients = Array.from(ws.clients);
        const {action, data} = JSON.parse(m);
        if (action === "draw") {
            const existingPixel = pixels.find(pixel => pixel.id === data.id);

            if (!existingPixel) {
                pixels.push(data);
            } else {
                const indexToRemove = pixels.indexOf(data.id);
                pixels.splice(indexToRemove, 1);
                data.color = "rgb(255, 255, 255)";
            }
            for (let i = 0; i < clients.length; i++) {
                const client = clients[i];
                if (client.readyState === webSocket.OPEN) {
                    client.send(JSON.stringify({action, data}));
                }
            }
        }

        if (action === "clear") {
            pixels = [];
            for (let i = 0; i < clients.length; i++) {
                const client = clients[i];
                if (client.readyState === webSocket.OPEN) {
                    client.send(JSON.stringify({action: "clear"}));
                }
            }
        }

        if (action === "firstConnexion") {
            if (data.pseudo === null) {
                socket.send(JSON.stringify({action: "redirect", data: "pas de user donné"}));
            } else {
                const clientId = generateUniqueId();
                clientsConnected.set(clientId, ws);
                socket.send(JSON.stringify({action: "getClientId", data: {clientId: clientId, pseudo: data.pseudo}}));

                if (socket.readyState === webSocket.OPEN) {
                    for (let j = 0; j < pixels.length; j++) {
                        const pixel = pixels[j];
                        socket.send(JSON.stringify({action: "draw", data: pixel}));
                    }
                }
            }
        }

        if (action === "lastConnexion") {
            clientsConnected.delete(data.clientId);
        }
    });
});

function getClientIdByConnection(connection) {
    for (const [clientId, clientConnection] of clients.entries()) {
        if (clientConnection === connection) {
            return clientId;
        }
    }
    return null;
}

function generateUniqueId() {
    return Math.random().toString(36).substring(7);
}

app.get('/pixelWar.html', (req, res) => {
    const pseudo = req.query.pseudo;
    const pseudoScript = `<script>const pseudo = "${pseudo}";</script>`;
    res.sendFile(__dirname + '/public/pixelWar.html', pseudoScript);
});

server.listen(8080, () => {
    console.log("Server listening on port 8080");
});