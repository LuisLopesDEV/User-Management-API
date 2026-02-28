const API_BASE = "http://127.0.0.1:8000";

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
  boot(); // Atualiza a interface após login
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

function showLoggedUser(user) {
  document.getElementById("btn-login-header").style.display = "none";
  const userArea = document.getElementById("user-area");
  userArea.style.display = "flex";

  document.getElementById("user-name").textContent = user.name || user.email;

  // Avatar automático baseado no nome
  document.getElementById("user-avatar").src =
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6f4e37&color=fff`;
}

function showGuest() {
  document.getElementById("btn-login-header").style.display = "";
  document.getElementById("user-area").style.display = "none";
}

async function boot() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const res = await fetch(`${API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.ok) {
    const me = await res.json();
    showLoggedUser(me);
  } else {
    localStorage.removeItem("token");
    showGuest();
  }
}

boot();

document.getElementById("btn-logout").addEventListener("click", () => {
  localStorage.removeItem("token");
  showGuest();
});