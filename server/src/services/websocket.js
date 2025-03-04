const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map(); // Map to store client connections with their user IDs

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });
  }

  handleConnection(ws, req) {
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'auth') {
          this.authenticateClient(ws, data.token);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      this.clients.forEach((client, userId) => {
        if (client === ws) {
          this.clients.delete(userId);
        }
      });
    });

    // Send ping every 30 seconds
    const pingInterval = setInterval(() => {
      if (ws.isAlive === false) {
        clearInterval(pingInterval);
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    }, 30000);
  }

  authenticateClient(ws, token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      this.clients.set(decoded.id, ws);
    } catch (error) {
      console.error('WebSocket authentication error:', error);
      ws.close();
    }
  }

  // Broadcast to all connected clients
  broadcast(data) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Send to specific users
  sendTo(userIds, data) {
    userIds.forEach(userId => {
      const client = this.clients.get(userId);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}

module.exports = WebSocketService; 