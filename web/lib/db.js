// web/lib/db.js
import fs from 'fs';
import path from 'path';
const DB_FILE = path.join(process.cwd(), 'data', 'users.json');

function ensure() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
}

function read() {
  ensure();
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function write(data) {
  ensure();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function getUsers() {
  return read().users || [];
}
function saveUsers(users) {
  const d = read();
  d.users = users;
  write(d);
}
function findUserByEmail(email) {
  if (!email) return null;
  return getUsers().find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
}
function findUserById(id) {
  if (!id) return null;
  return getUsers().find(u => u.id === id);
}
function addUser(user) {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
  return user;
}
function updateUser(id, patch = {}) {
  const users = getUsers().map(u => u.id === id ? { ...u, ...patch } : u);
  saveUsers(users);
  return users.find(u => u.id === id);
}

export default {
  getUsers,
  saveUsers,
  findUserByEmail,
  findUserById,
  addUser,
  updateUser
};
