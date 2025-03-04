const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const users = [
  {
    id: uuidv4(),
    name: 'Admin User',
    email: 'admin@example.com',
    password_hash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    status: 'active'
  },
  {
    id: uuidv4(),
    name: 'Test User',
    email: 'user@example.com',
    password_hash: bcrypt.hashSync('user123', 10),
    role: 'user',
    status: 'active'
  }
];

module.exports = users; 