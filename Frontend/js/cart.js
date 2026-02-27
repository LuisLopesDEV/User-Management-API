const API_BASE = "http://127.0.0.1:8000"; // troque pela porta da sua API

document.getElementById("cadastro").addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name: document.getElementById("cad-nome").value,
    email: document.getElementById("cad-email").value,
    senha: document.getElementById("cad-senha").value,
    ativo: true,
    remember: false,
    admin: false,
  };

  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Se a API retornar erro (ex: email duplicado), vamos mostrar a mensagem
    const text = await res.text();
    let data;
    console.log("Resposta da API:", text);
    try { data = JSON.parse(text); } catch { data = text; }

    document.getElementById("saida").textContent =
      `Status: ${res.status}\n` + JSON.stringify(data, null, 2);

  } catch (err) {
    document.getElementById("saida").textContent = "Erro: " + err.message;
  }
  
});

document.getElementById("login").addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    email: document.getElementById("login-email").value,
    senha: document.getElementById("login-senha").value,
  };

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log("Status:", res.status, "Resposta:", text);
});