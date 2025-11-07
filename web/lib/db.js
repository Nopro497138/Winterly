// web/lib/db.js
const fs = require('fs');
const path = require('path');
const DB_FILE = path.join(process.cwd(), 'data', 'users.json');

function ensure() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], sessions: [] }));
}

function read() {
  ensure();
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function write(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  getUsers() { const d = read(); return d.users; },
  saveUsers(users) { const d = read(); d.users = users; write(d); },
  findUserByEmail(email) { return this.getUsers().find(u => u.email === email); },
  findUserById(id) { return this.getUsers().find(u => u.id === id); },
  addUser(user) {
    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);
    return user;
  },
  updateUser(id, patch) {
    const users = this.getUsers().map(u => u.id === id ? { ...u, ...patch } : u);
    this.saveUsers(users);
    return users.find(u => u.id === id);
  }
};
