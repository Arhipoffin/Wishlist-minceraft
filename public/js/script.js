async function loadGifts() {
  const res = await fetch("/api/gifts");
  const gifts = await res.json();

  const list = document.getElementById("gift-list");
  list.innerHTML = "";

  gifts.forEach((g) => {
    const div = document.createElement("div");
    div.className = "gift-card";

    const img = g.image ? `<img src="${g.image}" alt="${g.title}">` : "";
    const btnReserve = g.reservedBy
      ? `<button disabled>Reservado</button>`
      : `<button onclick="reserveGift(${g.id})">Reservar</button>`;
    const btnLink = g.reservedBy
      ? ""
      : `<a href="${g.link}" target="_blank"><button>Ver link</button></a>`;

    div.innerHTML = `
      ${img}
      <h3>${g.title}</h3>
      ${btnLink}
      ${btnReserve}
    `;
    list.appendChild(div);
  });
}

async function reserveGift(id) {
  const name = prompt("Digite seu nome para reservar este presente:");
  if (!name) return;

  const res = await fetch(`/api/reserve/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (res.ok) loadGifts();
  else alert("Erro ao reservar.");
}

loadGifts();
