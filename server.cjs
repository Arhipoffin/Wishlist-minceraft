const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_PASSWORD = "minecraft123";

// Middleware
app.use(cors());
app.use(bodyParser.json());

// =====================
// Путь к public
// =====================
// Поскольку server.cjs в корне и public тоже в корне:
const publicPath = path.join(__dirname, "public");
console.log("Public folder path:", publicPath);

app.use(express.static(publicPath));

// Файл с подарками
const giftsFile = path.join(__dirname, "gifts.json");

// ========================
// API
// ========================

app.get("/api/gifts", (req, res) => {
  let gifts = [];
  if (fs.existsSync(giftsFile)) gifts = JSON.parse(fs.readFileSync(giftsFile));
  res.json(gifts);
});

app.post("/api/gifts", (req, res) => {
  const { title, link, image, password } = req.body;
  if (password !== ADMIN_PASSWORD)
    return res.status(401).send("Senha incorreta");

  let gifts = [];
  if (fs.existsSync(giftsFile)) gifts = JSON.parse(fs.readFileSync(giftsFile));

  const id = Date.now();
  gifts.push({ id, title, link, image, reserved: false, reservedBy: "" });
  fs.writeFileSync(giftsFile, JSON.stringify(gifts, null, 2));
  res.json({ success: true });
});

app.post("/api/reserve/:id", (req, res) => {
  const { name } = req.body;
  const id = parseInt(req.params.id);

  if (!name) return res.status(400).send("Nome é obrigatório");

  let gifts = [];
  if (fs.existsSync(giftsFile)) gifts = JSON.parse(fs.readFileSync(giftsFile));

  const gift = gifts.find((g) => g.id === id);
  if (!gift) return res.status(404).send("Presente não encontrado");
  if (gift.reserved) return res.status(400).send("Presente já reservado");

  gift.reserved = true;
  gift.reservedBy = name;
  fs.writeFileSync(giftsFile, JSON.stringify(gifts, null, 2));
  res.json({ success: true });
});

app.post("/api/unreserve/:id", (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD)
    return res.status(401).send("Senha incorreta");

  const id = parseInt(req.params.id);
  let gifts = [];
  if (fs.existsSync(giftsFile)) gifts = JSON.parse(fs.readFileSync(giftsFile));

  const gift = gifts.find((g) => g.id === id);
  if (!gift) return res.status(404).send("Presente não encontrado");

  gift.reserved = false;
  gift.reservedBy = "";
  fs.writeFileSync(giftsFile, JSON.stringify(gifts, null, 2));
  res.json({ success: true });
});

app.post("/api/delete/:id", (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD)
    return res.status(401).send("Senha incorreta");

  const id = parseInt(req.params.id);
  let gifts = [];
  if (fs.existsSync(giftsFile)) gifts = JSON.parse(fs.readFileSync(giftsFile));

  gifts = gifts.filter((g) => g.id !== id);
  fs.writeFileSync(giftsFile, JSON.stringify(gifts, null, 2));
  res.json({ success: true });
});

app.post("/api/reset", (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD)
    return res.status(401).send("Senha incorreta");

  fs.writeFileSync(giftsFile, JSON.stringify([], null, 2));
  res.json({ success: true });
});

// ========================
// HTML страницы
// ========================

app.get("/", (req, res) => res.sendFile(path.join(publicPath, "index.html")));
app.get("/admin.html", (req, res) =>
  res.sendFile(path.join(publicPath, "admin.html"))
);

// ========================
// Запуск сервера
// ========================

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
