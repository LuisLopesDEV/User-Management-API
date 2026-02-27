const API_BASE = "http://127.0.0.1:8000"; // troque pela porta da sua API

document.getElementById("cadastro").addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload =  {schema_user: {
    name: document.getElementById("cad-nome").value,
    email: document.getElementById("cad-email").value,
    senha: document.getElementById("cad-senha").value,
    ativo: true,
    remember: false,
    admin: false,
  },
   schema_local: {
    cep: document.getElementById("cad-cep").value,
    city: document.getElementById("cad-cidade").value,
    neighborhood: document.getElementById("cad-bairro").value,
    street: document.getElementById("cad-rua").value,
    number: document.getElementById("cad-numero").value,
    complement: document.getElementById("cad-comp").value.trim() !== "" ? 
    document.getElementById("cad-comp").value : null}
  };
  
  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data;
    console.log("Resposta da API:", text);
    try { data = JSON.parse(text); } catch (e) { data = text; }

    document.getElementById("saida").textContent =
      `Status: ${res.status}\n` + JSON.stringify(data, null, 2);

  } catch (err) {
    console.log("Erro na requisição:", err);
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

