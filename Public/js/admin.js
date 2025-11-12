let password = "";

async function login() {
  password = document.getElementById("admin-pass").value;
  document.getElementById("login-section").style.display = "none";
  document.getElementById("admin-panel").style.display = "block";
  loadAdminGifts();
}

document.getElementById("login-btn").addEventListener("click", login);

async function loadAdminGifts() {
  const res = await fetch("/api/gifts");
  const gifts = await res.json();

  const tbody = document.querySelector("#admin-gifts tbody");
  tbody.innerHTML = "";

  gifts.forEach((g) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${g.title}</td>
      <td>${g.reservedBy ? g.reservedBy : "-"}</td>
      <td>
        <button onclick="unreserve(${g.id})">Liberar</button>
        <button onclick="deleteGift(${g.id})">Excluir</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

document.getElementById("add-btn").addEventListener("click", async () => {
  const title = document.getElementById("title").value;
  const link = document.getElementById("link").value;
  const image = document.getElementById("image").value;

  await fetch("/api/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, title, link, image }),
  });

  loadAdminGifts();
});

document.getElementById("reset-btn").addEventListener("click", async () => {
  if (!confirm("Tem certeza que deseja deletar todos os presentes?")) return;
  await fetch("/api/reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  loadAdminGifts();
});

async function deleteGift(id) {
  await fetch(`/api/delete/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  loadAdminGifts();
}

async function unreserve(id) {
  await fetch(`/api/unreserve/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  loadAdminGifts();
}
