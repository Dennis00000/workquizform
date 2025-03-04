const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.user.id);

    socket.on('join-template', (templateId) => {
      socket.join(`template:${templateId}`);
    });

    socket.on('leave-template', (templateId) => {
      socket.leave(`template:${templateId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.user.id);
    });
  });
};

const emitTemplateUpdate = (templateId, data) => {
  if (io) {
    io.to(`template:${templateId}`).emit('template-updated', data);
  }
};

const emitNewComment = (templateId, comment) => {
  if (io) {
    io.to(`template:${templateId}`).emit('new-comment', comment);
  }
};

module.exports = {
  initSocket,
  emitTemplateUpdate,
  emitNewComment
}; 