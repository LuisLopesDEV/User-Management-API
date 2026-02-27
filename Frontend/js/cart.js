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

    console.log("Status:", res.status, "Resposta:", data);

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

  const data = await res.json();

  console.log("Status:", res.status, "Resposta:", data);

  if (!res.ok) {
    alert(data.detail || "Erro ao fazer login");
    return;
  }

  localStorage.setItem("token", data.access_token);
  location.hash = "#topo";
  console.log("Token armazenado:", data.access_token);
});

async function authFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  return res;}

  async function boot() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const res = await authFetch("/users/me"); // TROQUE pela sua rota real

  if (res.status === 401) {
    localStorage.removeItem("token");
    return;
  }

  const me = await res.json();
  console.log("Logado como:", me);

  // aqui você atualiza a interface (ex.: mostrar nome, esconder botão Entrar)
  // document.getElementById("userName").textContent = me.name;
}

boot();