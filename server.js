const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const PASSWORD = "minecraft123"; // пароль для панели админа

const giftsFile = path.join(__dirname, "gifts.json");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 📂 Проверяем, есть ли gifts.json
if (!fs.existsSync(giftsFile)) {
  fs.writeFileSync(giftsFile, "[]");
}

// 🧩 Читаем список подарков
app.get("/api/gifts", (req, res) => {
  const data = fs.readFileSync(giftsFile, "utf8");
  res.json(JSON.parse(data));
});

// 🎁 Добавить подарок (только админ)
app.post("/api/add", (req, res) => {
  const { title, link, image, password } = req.body;
  if (password !== PASSWORD)
    return res.status(403).json({ error: "Senha incorreta" });

  const gifts = JSON.parse(fs.readFileSync(giftsFile, "utf8"));
  const newGift = {
    id: Date.now(),
    title,
    link,
    image: image || "",
    reserved: false,
    reservedBy: "",
  };
  gifts.push(newGift);
  fs.writeFileSync(giftsFile, JSON.stringify(gifts, null, 2));
  res.json({ success: true, gift: newGift });
});

// 🧱 Резервировать подарок
app.post("/api/reserve/:id", (req, res) => {
  const { name } = req.body;
  const id = parseInt(req.params.id);
  let gifts = JSON.parse(fs.readFileSync(giftsFile, "utf8"));

  const gift = gifts.find((g) => g.id === id);
  if (!gift) return res.status(404).json({ error: "Presente não encontrado" });
  if (gift.reserved)
    return res.status(400).json({ error: "Presente já reservado" });

  gift.reserved = true;
  gift.reservedBy = name;
  fs.writeFileSync(giftsFile, JSON.stringify(gifts, null, 2));
  res.json({ success: true });
});

// 🔓 Отменить резерв (только админ)
app.post("/api/unreserve/:id", (req, res) => {
  const { password } = req.body;
  if (password !== PASSWORD)
    return res.status(403).json({ error: "Senha incorreta" });

  const id = parseInt(req.params.id);
  let gifts = JSON.parse(fs.readFileSync(giftsFile, "utf8"));

  const gift = gifts.find((g) => g.id === id);
  if (!gift) return res.status(404).json({ error: "Presente não encontrado" });

  gift.reserved = false;
  gift.reservedBy = "";
  fs.writeFileSync(giftsFile, JSON.stringify(gifts, null, 2));
  res.json({ success: true });
});

// 🗑 Удалить подарок (только админ)
app.delete("/api/delete/:id", (req, res) => {
  const { password } = req.body;
  if (password !== PASSWORD)
    return res.status(403).json({ error: "Senha incorreta" });

  const id = parseInt(req.params.id);
  let gifts = JSON.parse(fs.readFileSync(giftsFile, "utf8"));
  gifts = gifts.filter((g) => g.id !== id);

  fs.writeFileSync(giftsFile, JSON.stringify(gifts, null, 2));
  res.json({ success: true });
});

// 🧨 Удалить все подарки (только админ)
app.post("/api/reset", (req, res) => {
  const { password } = req.body;
  if (password !== PASSWORD)
    return res.status(403).json({ error: "Senha incorreta" });

  fs.writeFileSync(giftsFile, "[]");
  res.json({ success: true });
});

// 🌍 Стартуем сервер
app.listen(PORT, () =>
  console.log(`Servidor rodando em http://localhost:${PORT}`)
);
