import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import url from 'url';

const onlineUsers = new Map();

export const initializeWebSocketServer = (server) => {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const parsedUrl = url.parse(request.url, true);
    const token = parsedUrl.query?.token;

    if (!token) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request, decoded);
      });
    } catch (error) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
    }
  });

  wss.on('connection', (ws, request, decoded) => {
    const userId = decoded._id.toString();

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(ws);

    if (onlineUsers.get(userId).size === 1) {
      broadcast({
        type: 'user_online',
        userId,
      });
    }

    const onlineIds = Array.from(onlineUsers.keys());
    ws.send(JSON.stringify({
      type: 'online_users',
      userIds: onlineIds,
    }));

    ws.on('close', () => {
      const userConnections = onlineUsers.get(userId);
      if (userConnections) {
        userConnections.delete(ws);
        if (userConnections.size === 0) {
          onlineUsers.delete(userId);
          broadcast({
            type: 'user_offline',
            userId,
          });
        }
      }
    });

    ws.on('error', (err) => {
      console.error(`WebSocket error for user ${userId}:`, err);
    });
  });

  return wss;
};

export const sendToUser = (userId, data) => {
  const connections = onlineUsers.get(userId.toString());
  if (connections) {
    const payload = JSON.stringify(data);
    for (const ws of connections) {
      if (ws.readyState === 1) { // 1 = OPEN
        ws.send(payload);
      }
    }
  }
};

const broadcast = (data) => {
  const payload = JSON.stringify(data);
  for (const connections of onlineUsers.values()) {
    for (const ws of connections) {
      if (ws.readyState === 1) { // 1 = OPEN
        ws.send(payload);
      }
    }
  }
};

export const isUserOnline = (userId) => {
  return onlineUsers.has(userId.toString());
};
