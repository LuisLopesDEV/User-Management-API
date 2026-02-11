// ====== CONFIG ======
const API_BASE_URL = "http://localhost:3000"; // << TROQUE AQUI

// ====== STATE ======
const appEl = document.getElementById("app");
const toastEl = document.getElementById("toast");
const logoutBtn = document.getElementById("logoutBtn");

document.getElementById("year").textContent = new Date().getFullYear();

// ====== HELPERS ======
function showToast(message, type = "ok") {
  toastEl.textContent = message;
  toastEl.className = `toast toast--show toast--${type === "err" ? "err" : "ok"}`;
  setTimeout(() => {
    toastEl.className = "toast";
  }, 3200);
}

function getToken() {
  return localStorage.getItem("token");
}
function setToken(token) {
  localStorage.setItem("token", token);
}
function clearToken() {
  localStorage.removeItem("token");
}

function isLoggedIn() {
  return !!getToken();
}

function updateNavVisibility() {
  const logged = isLoggedIn();

  // links visíveis só para guest (não logado)
  document.querySelectorAll('[data-guest="true"]').forEach(a => {
    a.style.display = logged ? "none" : "inline-flex";
  });

  // links que fazem sentido só logado (mas também protegemos via rota)
  document.querySelectorAll('[data-protected="true"]').forEach(a => {
    a.style.display = logged ? "inline-flex" : "none";
  });

  logoutBtn.style.display = logged ? "inline-flex" : "none";
}

async function apiRequest(path, { method = "GET", body } = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: b
