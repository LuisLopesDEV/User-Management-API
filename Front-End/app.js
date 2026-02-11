/* =========================
   Café Aurora — app.js
   SPA Offline (Hash Router)
   - Vanilla JS
   - Dados mock locais
   - Persistência localStorage
   - Auth local
   - Carrinho + checkout
   - Dashboard + Admin local
   - Acessibilidade: foco/aria-live, modais/drawer com teclado
   ========================= */

/* -------------------------
   Helpers & Storage
------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const LS_KEYS = Object.freeze({
  theme: "ca_theme",
  session: "ca_session",
  users: "ca_users",
  cart: "ca_cart",
  contactMsgs: "ca_contact_messages",
  reservations: "ca_reservations",
  orders: "ca_orders",
  favorites: "ca_favorites",
  newsletter: "ca_newsletter",
  serviceFee: "ca_service_fee"
});

function safeJSONParse(str, fallback) {
  try { return JSON.parse(str); } catch { return fallback; }
}
function lsGet(key, fallback) {
  const raw = localStorage.getItem(key);
  if (raw == null) return fallback;
  return safeJSONParse(raw, fallback);
}
function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/** Escape básico de HTML para evitar injeção em conteúdos vindos de inputs/localStorage */
function escapeHTML(input) {
  return String(input ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/** Formata BRL */
function brl(value) {
  const n = Number(value || 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Gera id simples */
function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

/* -------------------------
   Crypto/Hash simples (obfuscation)
   - NÃO é segurança real, apenas requisito de "hash/obfuscation simples".
------------------------- */
async function simpleHash(text) {
  const enc = new TextEncoder().encode(String(text));
  const buf = await crypto.subtle.digest("SHA-256", enc);
  const hashArray = Array.from(new Uint8Array(buf));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/* -------------------------
   Mock Data
------------------------- */
const META = Object.freeze({
  address: "Rua do Aroma, 123 • Vila Creme • São Paulo/SP",
  hours: "Seg–Sex 08:00–20:00 • Sáb/Dom 09:00–18:00",
  contact: "☎ (11) 4000-1234 • ✉ contato@cafeaurora.local"
});

const MENU_CATEGORIES = ["Cafés", "Gelados", "Chás", "Doces", "Salgados"];

const MENU_ITEMS = [
  // Cafés
  { id: 1,  name: "Espresso Aurora", category: "Cafés", price: 8.5, tags: ["intenso"], desc: "Blend da casa com crema aveludada e final achocolatado." },
  { id: 2,  name: "Cappuccino Canela", category: "Cafés", price: 14.9, tags: ["queridinho"], desc: "Café, leite vaporizado, cacau e toque de canela." },
  { id: 3,  name: "Latte Baunilha", category: "Cafés", price: 16.9, tags: ["sem lactose"], desc: "Latte com calda de baunilha (opção sem lactose)." },
  { id: 4,  name: "Mocha Cremoso", category: "Cafés", price: 18.9, tags: ["doce"], desc: "Espresso, chocolate e leite. Aconchego em forma de xícara." },
  { id: 5,  name: "Coado V60", category: "Cafés", price: 13.5, tags: ["grãos especiais"], desc: "Extração manual com notas florais e cítricas." },

  // Gelados
  { id: 6,  name: "Cold Brew Clássico", category: "Gelados", price: 15.9, tags: ["refrescante"], desc: "Infusão a frio por 18h. Suave, doce e encorpado." },
  { id: 7,  name: "Iced Latte Caramelo", category: "Gelados", price: 18.5, tags: ["doce"], desc: "Latte gelado com caramelo e gelo triturado." },
  { id: 8,  name: "Frappé Cacau", category: "Gelados", price: 19.9, tags: ["sem lactose"], desc: "Cacau, café e leite vegetal batidos. Final sedoso." },
  { id: 9,  name: "Chá Gelado de Pêssego", category: "Gelados", price: 13.9, tags: ["vegano"], desc: "Chá preto infusionado e pêssego (zero leite)." },

  // Chás
  { id: 10, name: "Matcha Latte", category: "Chás", price: 18.9, tags: ["sem lactose"], desc: "Matcha cerimonial com leite (opção vegetal)." },
  { id: 11, name: "Chá de Hibisco", category: "Chás", price: 11.9, tags: ["vegano"], desc: "Hibisco com frutas vermelhas. Aromático e vibrante." },
  { id: 12, name: "Earl Grey", category: "Chás", price: 12.5, tags: ["clássico"], desc: "Bergamota elegante, perfeito para acompanhar doces." },
  { id: 13, name: "Camomila & Mel", category: "Chás", price: 10.9, tags: ["calmante"], desc: "Infusão suave com mel (pode ser sem mel)." },

  // Doces
  { id: 14, name: "Brownie Intenso", category: "Doces", price: 12.9, tags: ["sem glúten"], desc: "Brownie de cacau 70% (receita sem glúten)." },
  { id: 15, name: "Cheesecake de Frutas", category: "Doces", price: 16.9, tags: ["favorito"], desc: "Base crocante, creme leve e calda de frutas." },
  { id: 16, name: "Cookie Triplo Chocolate", category: "Doces", price: 9.9, tags: ["doce"], desc: "Cookie macio com gotas e pedaços de chocolate." },
  { id: 17, name: "Bolo de Cenoura", category: "Doces", price: 11.5, tags: ["caseiro"], desc: "Fatia generosa com cobertura de chocolate." },

  // Salgados
  { id: 18, name: "Pão de Queijo", category: "Salgados", price: 8.9, tags: ["sem glúten"], desc: "Quentinho, casquinha crocante e centro macio." },
  { id: 19, name: "Croissant Manteiga", category: "Salgados", price: 12.9, tags: ["clássico"], desc: "Folhado leve e amanteigado, assado na hora." },
  { id: 20, name: "Toast Avocado", category: "Salgados", price: 21.9, tags: ["vegano"], desc: "Pão artesanal, avocado, limão, pimenta e sementes." },
  { id: 21, name: "Quiche de Alho-Poró", category: "Salgados", price: 19.9, tags: ["vegetariano"], desc: "Massa amanteigada e recheio cremoso de alho-poró." },
  { id: 22, name: "Sanduíche Caprese", category: "Salgados", price: 22.9, tags: ["vegetariano"], desc: "Tomate, muçarela, pesto e rúcula no pão ciabatta." }
];

const BLOG_CATEGORIES = ["Bastidores", "Métodos", "Grãos", "Receitas", "Cultura"];

const BLOG_POSTS = [
  {
    slug: "guia-espresso-perfeito",
    title: "Guia rápido do espresso perfeito",
    category: "Métodos",
    summary: "Entenda moagem, tempo e proporção para extrair um espresso equilibrado.",
    content: `
O espresso é curto, mas cheio de detalhes. Ajuste a moagem para alcançar um tempo de extração entre 25–30s
(para a proporção de referência), observe a crema e busque equilíbrio: doçura, acidez e corpo.

Dicas:
- Moagem mais fina = extração mais lenta.
- Café muito amargo? Reduza tempo/moagem.
- Café muito ácido? Aumente tempo ou refine a moagem.

No Café Aurora, usamos grãos com torra média para realçar chocolate e frutas.
`
  },
  {
    slug: "graos-especiais-o-que-sao",
    title: "Grãos especiais: o que são (de verdade)?",
    category: "Grãos",
    summary: "De pontuação à rastreabilidade: por que o café especial muda a experiência.",
    content: `
Cafés especiais geralmente têm rastreabilidade, colheita seletiva e padrões de qualidade superiores.
O resultado aparece na xícara: complexidade e doçura natural, sem precisar mascarar defeitos.

Aqui no Aurora: priorizamos lotes de pequenas fazendas e perfis sensoriais bem definidos.
`
  },
  {
    slug: "cold-brew-mito-ou-maravilha",
    title: "Cold brew: mito ou maravilha?",
    category: "Métodos",
    summary: "Por que o cold brew é tão suave e como ele fica doce sem açúcar.",
    content: `
Cold brew é extraído com água fria por muitas horas. A baixa temperatura reduz amargor e ressalta doçura.
Resultado: bebida encorpada, refrescante e versátil (vai bem com leite, tônica, frutas…).
`
  },
  {
    slug: "nossa-historia-em-3-xicaras",
    title: "Nossa história em 3 xícaras",
    category: "Bastidores",
    summary: "Três momentos que definiram o jeito Aurora de servir café.",
    content: `
1) A primeira bancada improvisada (2018).
2) O dia em que o V60 virou estrela (2020).
3) A comunidade: eventos e workshops (2022).

Café é encontro. E a gente leva isso a sério.
`
  },
  {
    slug: "cookie-da-casa-receita",
    title: "Cookie da casa: uma receita para testar",
    category: "Receitas",
    summary: "Uma versão caseira inspirada no nosso cookie triplo chocolate.",
    content: `
Misture manteiga, açúcar, ovos, farinha e muito chocolate. O segredo é não assar demais:
deixe o centro levemente macio — ele termina de firmar fora do forno.

Dica Aurora: uma pitada de sal realça o chocolate.
`
  },
  {
    slug: "cafe-e-cultura-um-ritual",
    title: "Café e cultura: um ritual diário",
    category: "Cultura",
    summary: "Do coado ao espresso: como cada método conta uma história.",
    content: `
Café é ritual. Às vezes, um coado lento; outras, um espresso rápido no balcão.
O importante é a pausa: respirar, sentir aroma e retomar o dia com calma.
`
  }
];

/* -------------------------
   Store (estado global simples)
------------------------- */
const store = {
  theme: "light",
  user: null, // {id, name, email, role}
  cart: {
    items: [], // [{productId, qty}]
    serviceFee: false
  }
};

function loadInitialState() {
  store.theme = lsGet(LS_KEYS.theme, "light");
  store.cart = lsGet(LS_KEYS.cart, { items: [], serviceFee: lsGet(LS_KEYS.serviceFee, false) });
  store.cart.serviceFee = lsGet(LS_KEYS.serviceFee, false);

  const session = lsGet(LS_KEYS.session, null);
  if (session?.userId) {
    const users = lsGet(LS_KEYS.users, []);
    const u = users.find(x => x.id === session.userId);
    if (u) store.user = { id: u.id, name: u.name, email: u.email, role: u.role || "user" };
  }
}

function persistTheme() { lsSet(LS_KEYS.theme, store.theme); }
function persistCart() {
  lsSet(LS_KEYS.cart, store.cart);
  lsSet(LS_KEYS.serviceFee, store.cart.serviceFee);
}

/* -------------------------
   UI: Toasts
------------------------- */
function toast(type, title, msg) {
  const host = $("#toasts");
  const el = document.createElement("div");
  el.className = `toast ${type === "ok" ? "toast--ok" : "toast--err"}`;
  el.setAttribute("role", "status");
  el.innerHTML = `
    <div class="toast__title">${escapeHTML(title)}</div>
    <div class="toast__msg">${escapeHTML(msg)}</div>
  `;
  host.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateY(8px)"; }, 3200);
  setTimeout(() => el.remove(), 3600);
}

/* -------------------------
   Cart helpers
------------------------- */
function getProductById(id) {
  return MENU_ITEMS.find(p => p.id === Number(id));
}

function cartCount() {
  return store.cart.items.reduce((acc, it) => acc + it.qty, 0);
}

function cartSubtotal() {
  return store.cart.items.reduce((acc, it) => {
    const p = getProductById(it.productId);
    return acc + (p ? p.price * it.qty : 0);
  }, 0);
}

function cartTotal() {
  const sub = cartSubtotal();
  const fee = store.cart.serviceFee ? sub * 0.10 : 0;
  return sub + fee;
}

function addToCart(productId, qty = 1) {
  const id = Number(productId);
  const existing = store.cart.items.find(i => i.productId === id);
  if (existing) existing.qty += qty;
  else store.cart.items.push({ productId: id, qty });
  persistCart();
  renderCartBadge();
  renderCartDrawer(); // leve e localizado
  toast("ok", "Adicionado", "Item adicionado ao carrinho.");
}

function setCartQty(productId, qty) {
  const id = Number(productId);
  const item = store.cart.items.find(i => i.productId === id);
  if (!item) return;
  item.qty = Math.max(1, Math.min(99, Number(qty) || 1));
  persistCart();
  renderCartBadge();
  renderCartDrawer();
}

function removeFromCart(productId) {
  const id = Number(productId);
  store.cart.items = store.cart.items.filter(i => i.productId !== id);
  persistCart();
  renderCartBadge();
  renderCartDrawer();
}

function clearCart() {
  store.cart.items = [];
  store.cart.serviceFee = false;
  persistCart();
  renderCartBadge();
  renderCartDrawer();
}

/* -------------------------
   Auth helpers
------------------------- */
function getUsers() { return lsGet(LS_KEYS.users, []); }
function setUsers(users) { lsSet(LS_KEYS.users, users); }

function setSession(user) {
  store.user = { id: user.id, name: user.name, email: user.email, role: user.role || "user" };
  lsSet(LS_KEYS.session, { userId: user.id, createdAt: new Date().toISOString() });
  renderAuthArea();
}

function logout() {
  store.user = null;
  localStorage.removeItem(LS_KEYS.session);
  toast("ok", "Sessão encerrada", "Você saiu da sua conta.");
  renderAuthArea();
  // se estiver em rota protegida, manda para login
  const r = currentRoute();
  if (r.path === "/dashboard" || r.path === "/admin-local") {
    location.hash = "#/login";
  }
}

function ensureSeedAdmin() {
  // Admin local "fixo" (credenciais padrão) — pode ser removido se quiser.
  // email: admin@aurora.local / senha: aurora123
  const users = getUsers();
  const already = users.some(u => u.email.toLowerCase() === "admin@aurora.local");
  if (already) return;

  // cria com hash async em init
}

/* -------------------------
   Favorites
------------------------- */
function favKeyForUser() {
  const userId = store.user?.id || "guest";
  return `${LS_KEYS.favorites}:${userId}`;
}
function getFavorites() { return lsGet(favKeyForUser(), []); } // [productId]
function setFavorites(list) { lsSet(favKeyForUser(), list); }

function toggleFavorite(productId) {
  const id = Number(productId);
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx >= 0) favs.splice(idx, 1);
  else favs.push(id);
  setFavorites(favs);
  return favs;
}

/* -------------------------
   Orders / Messages / Reservations / Newsletter
------------------------- */
function getOrders() { return lsGet(LS_KEYS.orders, []); }
function setOrders(list) { lsSet(LS_KEYS.orders, list); }

function getContactMessages() { return lsGet(LS_KEYS.contactMsgs, []); }
function setContactMessages(list) { lsSet(LS_KEYS.contactMsgs, list); }

function getReservations() { return lsGet(LS_KEYS.reservations, []); }
function setReservations(list) { lsSet(LS_KEYS.reservations, list); }

function getNewsletter() { return lsGet(LS_KEYS.newsletter, []); }
function setNewsletter(list) { lsSet(LS_KEYS.newsletter, list); }

/* -------------------------
   Validation
------------------------- */
function isEmail(v) {
  const s = String(v || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
}
function minLen(v, n) { return String(v || "").trim().length >= n; }
function required(v) { return String(v || "").trim().length > 0; }

function maskPhoneBR(inputEl) {
  // máscara simples (11) 9xxxx-xxxx
  let digits = String(inputEl.value || "").replace(/\D/g, "").slice(0, 11);
  const d = digits;

  if (d.length <= 2) inputEl.value = d ? `(${d}` : "";
  else if (d.length <= 7) inputEl.value = `(${d.slice(0,2)}) ${d.slice(2)}`;
  else if (d.length <= 11) inputEl.value = `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

/* -------------------------
   Router
------------------------- */
function currentRoute() {
  const raw = location.hash.replace(/^#/, "") || "/home";
  const [pathPart, queryPart] = raw.split("?");
  const path = pathPart.startsWith("/") ? pathPart : `/${pathPart}`;
  const query = new URLSearchParams(queryPart || "");
  const segs = path.split("/").filter(Boolean); // e.g. ["produto","12"]
  return { raw, path, segs, query };
}

const routes = [
  { pattern: /^\/home$/, render: pageHome },
  { pattern: /^\/menu$/, render: pageMenu },
  { pattern: /^\/produto\/(\d+)$/, render: pageProduct },
  { pattern: /^\/sobre$/, render: pageSobre },
  { pattern: /^\/blog$/, render: pageBlog },
  { pattern: /^\/blog\/([a-z0-9\-]+)$/, render: pageBlogPost },
  { pattern: /^\/contato$/, render: pageContato },
  { pattern: /^\/reservas$/, render: pageReservas },
  { pattern: /^\/login$/, render: pageLogin },
  { pattern: /^\/signup$/, render: pageSignup },
  { pattern: /^\/dashboard$/, render: pageDashboard, protected: true },
  { pattern: /^\/admin-local$/, render: pageAdminLocal, protected: true, admin: true }
];

function matchRoute(path) {
  for (const r of routes) {
    const m = path.match(r.pattern);
    if (m) return { ...r, params: m.slice(1) };
  }
  return null;
}

function setLoading(on) {
  const el = $("#routeLoading");
  el.hidden = !on;
}

async function navigate() {
  const app = $("#app");
  const route = currentRoute();
  const matched = matchRoute(route.path);

  // fake loading state
  setLoading(true);
  await new Promise(r => setTimeout(r, 180));
  setLoading(false);

  if (!matched) {
    app.innerHTML = `
      <section class="card">
        <div class="card__body">
          <h1>Página não encontrada</h1>
          <p class="muted">A rota <strong>${escapeHTML(route.path)}</strong> não existe.</p>
          <a class="btn btn--primary" href="#/home">Voltar para Home</a>
        </div>
      </section>
    `;
    return;
  }

  // proteção
  if (matched.protected) {
    if (!store.user) {
      toast("err", "Acesso restrito", "Faça login para continuar.");
      location.hash = "#/login";
      return;
    }
    if (matched.admin && store.user.role !== "admin") {
      toast("err", "Acesso restrito", "Somente admin local pode acessar.");
      location.hash = "#/dashboard";
      return;
    }
  }

  // renderiza (páginas são funções puras de template + pequenos binds)
  app.innerHTML = matched.render(matched.params);

  // foco no main para acessibilidade
  $("#main").focus({ preventScroll: false });

  // binds específicos por página
  afterPageRender(route.path);
}

/* -------------------------
   Render helpers
------------------------- */
function renderAuthArea() {
  const host = $("#authArea");
  if (!store.user) {
    host.innerHTML = `
      <a class="btn btn--ghost" href="#/login">Login</a>
      <a class="btn btn--primary" href="#/signup">Criar conta</a>
    `;
    return;
  }
  host.innerHTML = `
    <span class="badge badge--muted" title="Usuário logado">Olá, ${escapeHTML(store.user.name.split(" ")[0] || store.user.name)} 👋</span>
    <a class="btn btn--ghost" href="#/dashboard">Dashboard</a>
    <button class="btn btn--ghost" id="logoutBtn" type="button">Sair</button>
  `;
  $("#logoutBtn")?.addEventListener("click", logout);
}

function renderCartBadge() {
  $("#cartCount").textContent = String(cartCount());
}

function cartItemTemplate(it) {
  const p = getProductById(it.productId);
  if (!p) return "";
  return `
    <div class="cart-item" data-cart-item="${p.id}">
      <div class="row between">
        <div>
          <div><strong>${escapeHTML(p.name)}</strong></div>
          <div class="muted small">${escapeHTML(p.category)} • ${brl(p.price)}</div>
        </div>
        <button class="btn btn--ghost" type="button" data-cart-action="remove" data-product-id="${p.id}" aria-label="Remover item">🗑️</button>
      </div>

      <div class="row between wrap">
        <div class="qty" aria-label="Quantidade">
          <button class="btn btn--ghost" type="button" data-cart-action="dec" data-product-id="${p.id}" aria-label="Diminuir">−</button>
          <input type="number" min="1" max="99" value="${it.qty}" inputmode="numeric"
            aria-label="Quantidade de ${escapeHTML(p.name)}" data-cart-action="qty" data-product-id="${p.id}" />
          <button class="btn btn--ghost" type="button" data-cart-action="inc" data-product-id="${p.id}" aria-label="Aumentar">+</button>
        </div>
        <strong>${brl(p.price * it.qty)}</strong>
      </div>
    </div>
  `;
}

function renderCartDrawer() {
  const host = $("#cartItems");
  if (!host) return;

  if (store.cart.items.length === 0) {
    host.innerHTML = `
      <div class="card">
        <div class="card__body">
          <h3>Seu carrinho está vazio</h3>
          <p class="muted">Que tal um espresso para começar? ☕</p>
          <a class="btn btn--primary" href="#/menu" data-close="cart">Ver Cardápio</a>
        </div>
      </div>
    `;
  } else {
    host.innerHTML = store.cart.items.map(cartItemTemplate).join("");
  }

  // totals
  $("#cartSubtotal").textContent = brl(cartSubtotal());
  $("#cartTotal").textContent = brl(cartTotal());
  $("#checkoutTotal").textContent = brl(cartTotal());

  // service fee
  const fee = $("#serviceFee");
  if (fee) fee.checked = !!store.cart.serviceFee;

  // checkout enable
  const btn = $("#checkoutBtn");
  if (btn) btn.disabled = store.cart.items.length === 0;
}

/* -------------------------
   Drawer/Modal mechanics (A11y)
------------------------- */
function openOverlay(type) {
  const el = type === "cart" ? $("#cartDrawer") : $("#checkoutModal");
  if (!el) return;
  el.setAttribute("aria-hidden", "false");
  // foco no painel
  const panel = el.querySelector(type === "cart" ? ".drawer__panel" : ".modal__panel");
  panel?.focus({ preventScroll: true });
  // trava scroll no body
  document.body.style.overflow = "hidden";
}

function closeOverlay(type) {
  const el = type === "cart" ? $("#cartDrawer") : $("#checkoutModal");
  if (!el) return;
  el.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  // devolve foco para botão
  if (type === "cart") $("#cartOpenBtn")?.focus({ preventScroll: true });
}

function bindOverlayEvents() {
  // abrir carrinho
  $("#cartOpenBtn")?.addEventListener("click", () => {
    renderCartDrawer();
    openOverlay("cart");
  });

  // fechar por click em backdrop / botões
  document.addEventListener("click", (e) => {
    const close = e.target?.getAttribute?.("data-close");
    if (close === "cart") closeOverlay("cart");
    if (close === "checkout") closeOverlay("checkout");
  });

  // esc para fechar
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const cartOpen = $("#cartDrawer")?.getAttribute("aria-hidden") === "false";
    const checkoutOpen = $("#checkoutModal")?.getAttribute("aria-hidden") === "false";
    if (checkoutOpen) closeOverlay("checkout");
    else if (cartOpen) closeOverlay("cart");
  });

  // delegação para ações do carrinho
  document.addEventListener("click", (e) => {
    const action = e.target?.getAttribute?.("data-cart-action");
    const pid = e.target?.getAttribute?.("data-product-id");
    if (!action || !pid) return;

    if (action === "remove") return removeFromCart(pid);
    if (action === "inc") return setCartQty(pid, (store.cart.items.find(i => i.productId === Number(pid))?.qty || 1) + 1);
    if (action === "dec") return setCartQty(pid, (store.cart.items.find(i => i.productId === Number(pid))?.qty || 1) - 1);
  });

  document.addEventListener("input", (e) => {
    const action = e.target?.getAttribute?.("data-cart-action");
    const pid = e.target?.getAttribute?.("data-product-id");
    if (action !== "qty" || !pid) return;
    setCartQty(pid, e.target.value);
  });

  // taxa de serviço
  $("#serviceFee")?.addEventListener("change", (e) => {
    store.cart.serviceFee = !!e.target.checked;
    persistCart();
    renderCartDrawer();
  });

  // abrir checkout
  $("#checkoutBtn")?.addEventListener("click", () => {
    if (store.cart.items.length === 0) return;
    $("#checkoutTotal").textContent = brl(cartTotal());
    openOverlay("checkout");
  });

  // submit checkout
  $("#checkoutForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const mode = $("#checkoutMode").value;
    const err = $('[data-error-for="checkoutMode"]');
    if (!mode) {
      if (err) err.textContent = "Selecione uma opção.";
      toast("err", "Ops", "Escolha Retirar ou Consumir no local.");
      return;
    }
    if (err) err.textContent = "";

    const notes = ($("#checkoutNotes").value || "").trim();

    const orders = getOrders();
    const statusPool = ["Recebido", "Em preparo", "Pronto", "Finalizado"];
    const newOrder = {
      id: uid("order"),
      createdAt: new Date().toISOString(),
      userId: store.user?.id || null,
      guestName: store.user ? null : "Convidado",
      mode,
      notes: escapeHTML(notes),
      items: store.cart.items.map(i => ({ ...i })),
      subtotal: cartSubtotal(),
      serviceFee: store.cart.serviceFee ? 0.10 : 0,
      total: cartTotal(),
      status: statusPool[Math.floor(Math.random() * statusPool.length)]
    };
    orders.unshift(newOrder);
    setOrders(orders);

    clearCart();
    closeOverlay("checkout");
    closeOverlay("cart");
    toast("ok", "Pedido confirmado!", "Seu pedido foi salvo neste dispositivo.");
  });
}

/* -------------------------
   Header / Footer binds
------------------------- */
function bindHeader() {
  // nav mobile toggle
  $("#navToggle")?.addEventListener("click", () => {
    const menu = $("#navMenu");
    const isOpen = menu.classList.toggle("is-open");
    $("#navToggle").setAttribute("aria-expanded", String(isOpen));
  });

  // fecha menu ao clicar em link (mobile)
  document.addEventListener("click", (e) => {
    const link = e.target.closest?.(".nav__link");
    if (!link) return;
    const menu = $("#navMenu");
    if (menu?.classList.contains("is-open")) {
      menu.classList.remove("is-open");
      $("#navToggle")?.setAttribute("aria-expanded", "false");
    }
  });

  // tema
  $("#themeToggle")?.addEventListener("click", () => {
    store.theme = store.theme === "dark" ? "light" : "dark";
    applyTheme();
    persistTheme();
    toast("ok", "Tema", `Tema ${store.theme === "dark" ? "escuro" : "claro"} ativado.`);
  });
}

function applyTheme() {
  document.documentElement.setAttribute("data-theme", store.theme);
}

function renderFooterMeta() {
  $("#footerAddress").textContent = META.address;
  $("#footerHours").textContent = META.hours;
  $("#footerContact").textContent = META.contact;
  $("#year").textContent = String(new Date().getFullYear());
}

/* -------------------------
   Newsletter
------------------------- */
function bindNewsletter() {
  $("#newsletterForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = ($("#newsletterEmail").value || "").trim();
    if (!isEmail(email)) {
      toast("err", "Email inválido", "Digite um email válido para assinar.");
      $("#newsletterEmail").focus();
      return;
    }
    const list = getNewsletter();
    const exists = list.some(x => x.email.toLowerCase() === email.toLowerCase());
    if (!exists) {
      list.unshift({ id: uid("nl"), email, createdAt: new Date().toISOString() });
      setNewsletter(list);
    }
    $("#newsletterEmail").value = "";
    toast("ok", "Inscrito!", "Email salvo localmente (newsletter fake).");
  });
}

/* -------------------------
   Pages
------------------------- */
function pageHome() {
  const featured = MENU_ITEMS.slice(0, 6);
  const testimonies = [
    { name: "Lia", text: "O cappuccino canela virou meu ritual de manhã. Aconchego puro." },
    { name: "Rafa", text: "Cold brew suave e doce sem açúcar — sério, perfeito." },
    { name: "Mina", text: "Ambiente lindo, atendimento rápido e grãos especiais de verdade." }
  ];

  return `
    <section class="hero">
      <div class="hero__inner">
        <div>
          <div class="kicker"><span aria-hidden="true">✨</span> Grãos especiais • torra fresca</div>
          <h1 class="mt-2">Um café moderno, com alma aconchegante.</h1>
          <p class="muted">Bem-vindo ao <strong>Café Aurora</strong> — onde cada xícara tem história. Explore o cardápio, marque uma reserva e aproveite o momento.</p>

          <div class="row wrap mt-2">
            <a class="btn btn--primary" href="#/menu">Ver Cardápio</a>
            <a class="btn" href="#/reservas">Reservar Mesa</a>
          </div>

          <div class="divider"></div>

          <div class="grid grid--3">
            <div class="card"><div class="card__body">
              <div class="card__title">Torra fresca</div>
              <p class="muted">Perfis equilibrados para espresso e coado.</p>
            </div></div>
            <div class="card"><div class="card__body">
              <div class="card__title">Opções inclusivas</div>
              <p class="muted">Vegano, sem lactose e sem glúten em vários itens.</p>
            </div></div>
            <div class="card"><div class="card__body">
              <div class="card__title">Feito com carinho</div>
              <p class="muted">Do balcão à mesa: consistência e cuidado.</p>
            </div></div>
          </div>
        </div>

        <div class="hero__art" aria-label="Ilustração abstrata do café (CSS)"></div>
      </div>
    </section>

    <section class="mt-3">
      <h2>Destaques do dia</h2>
      <p class="muted">Sugestões da casa (mock local). Clique para ver detalhes.</p>

      <div class="grid grid--3 mt-2">
        ${featured.map(p => productCard(p)).join("")}
      </div>
    </section>

    <section class="mt-3">
      <h2>Depoimentos</h2>
      <div class="grid grid--3 mt-2">
        ${testimonies.map(t => `
          <div class="card">
            <div class="card__body">
              <div class="card__title">“${escapeHTML(t.text)}”</div>
              <div class="muted">— ${escapeHTML(t.name)}</div>
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function productCard(p) {
  const tags = (p.tags || []).slice(0, 3);
  return `
    <article class="card">
      <div class="card__body">
        <div class="row between">
          <div class="card__title">${escapeHTML(p.name)}</div>
          <span class="badge badge--pill">${brl(p.price)}</span>
        </div>
        <p class="muted">${escapeHTML(p.desc)}</p>
        <div class="card__meta">
          <span class="badge badge--muted">${escapeHTML(p.category)}</span>
          ${tags.map(t => `<span class="badge">${escapeHTML(t)}</span>`).join("")}
        </div>
        <div class="row wrap mt-2">
          <a class="btn" href="#/produto/${p.id}">Ver detalhes</a>
          <button class="btn btn--primary" type="button" data-action="add-to-cart" data-product-id="${p.id}">
            Adicionar
          </button>
        </div>
      </div>
    </article>
  `;
}

function pageMenu() {
  return `
    <section>
      <div class="row between wrap">
        <div>
          <h1>Cardápio</h1>
          <p class="muted">Busque, filtre e ordene. Tudo offline com dados locais.</p>
        </div>
        <span class="kicker"><span aria-hidden="true">🫘</span> ${MENU_ITEMS.length} itens</span>
      </div>

      <div class="controls card mt-2">
        <div class="card__body grid" style="gap:.85rem;">
          <div class="field">
            <label for="menuSearch">Busca</label>
            <input id="menuSearch" type="search" placeholder="Nome ou descrição..." />
          </div>

          <div class="field">
            <label for="menuCategory">Categoria</label>
            <select id="menuCategory">
              <option value="">Todas</option>
              ${MENU_CATEGORIES.map(c => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join("")}
            </select>
          </div>

          <div class="field">
            <label for="menuSort">Ordenação</label>
            <select id="menuSort">
              <option value="featured">Destaques</option>
              <option value="price-asc">Preço: menor → maior</option>
              <option value="price-desc">Preço: maior → menor</option>
              <option value="az">A → Z</option>
            </select>
          </div>
        </div>
      </div>

      <div class="mt-2">
        <div class="row between wrap">
          <h2 class="mt-1" style="margin:0;">Itens</h2>
          <span class="muted small" id="menuCount">—</span>
        </div>
        <div class="grid grid--3 mt-2" id="menuGrid"></div>
      </div>
    </section>
  `;
}

function pageProduct(params) {
  const id = params?.[0];
  const p = getProductById(id);

  if (!p) {
    return `
      <section class="card">
        <div class="card__body">
          <h1>Produto não encontrado</h1>
          <p class="muted">Esse item não existe no nosso mock.</p>
          <a class="btn btn--primary" href="#/menu">Voltar ao cardápio</a>
        </div>
      </section>
    `;
  }

  return `
    <section class="card">
      <div class="card__body">
        <div class="row between wrap">
          <div>
            <div class="kicker"><span aria-hidden="true">☕</span> ${escapeHTML(p.category)}</div>
            <h1 class="mt-2">${escapeHTML(p.name)}</h1>
            <p class="muted">${escapeHTML(p.desc)}</p>
            <div class="row wrap">
              ${(p.tags || []).map(t => `<span class="badge">${escapeHTML(t)}</span>`).join("")}
            </div>
          </div>
          <div class="card" style="min-width: 220px;">
            <div class="card__body">
              <div class="row between">
                <span class="muted">Preço</span>
                <strong style="font-size:1.2rem">${brl(p.price)}</strong>
              </div>
              <div class="divider"></div>
              <div class="field">
                <label for="prodQty">Quantidade</label>
                <input id="prodQty" type="number" min="1" max="20" value="1" inputmode="numeric" />
              </div>
              <button class="btn btn--primary btn--full" type="button" data-action="add-to-cart-from-detail" data-product-id="${p.id}">
                Adicionar ao carrinho
              </button>
              <button class="btn btn--ghost btn--full mt-1" type="button" data-action="toggle-fav" data-product-id="${p.id}">
                ❤️ Favoritar
              </button>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="grid grid--2">
          <div class="card"><div class="card__body">
            <div class="card__title">Sugestão do barista</div>
            <p class="muted">Combine com <strong>${escapeHTML(suggestPairing(p))}</strong>.</p>
          </div></div>

          <div class="card"><div class="card__body">
            <div class="card__title">Info</div>
            <p class="muted">Este é um produto mock (sem imagens externas). Ideal para testes offline.</p>
          </div></div>
        </div>
      </div>
    </section>
  `;
}

function suggestPairing(p) {
  const sweet = MENU_ITEMS.find(x => x.category === "Doces");
  const savory = MENU_ITEMS.find(x => x.category === "Salgados");
  if (p.category === "Cafés") return sweet?.name || "um doce da casa";
  if (p.category === "Gelados") return savory?.name || "um salgado leve";
  if (p.category === "Chás") return sweet?.name || "cookie";
  return "um café coado";
}

function pageSobre() {
  const values = [
    { title: "Qualidade", text: "Grãos especiais, controle de extração e consistência." },
    { title: "Comunidade", text: "Um espaço para trabalhar, conversar e respirar." },
    { title: "Simplicidade", text: "Cardápio claro e opções inclusivas sem complicar." }
  ];
  const timeline = [
    { year: "2018", title: "Fundação", text: "Uma micro-bancada e muita vontade de servir bem." },
    { year: "2020", title: "Métodos", text: "Coado e V60 ganham destaque e viram tradição." },
    { year: "2022", title: "Workshops", text: "Começamos encontros com a comunidade do café." },
    { year: "2025", title: "Aurora 2.0", text: "Reforma e novo cardápio com mais opções inclusivas." }
  ];

  return `
    <section>
      <h1>Sobre o Café Aurora</h1>
      <p class="muted">Somos uma cafeteria fictícia criada para um SPA offline: moderna, aconchegante e funcional.</p>

      <div class="grid grid--3 mt-2">
        ${values.map(v => `
          <div class="card"><div class="card__body">
            <div class="card__title">${escapeHTML(v.title)}</div>
            <p class="muted">${escapeHTML(v.text)}</p>
          </div></div>
        `).join("")}
      </div>

      <div class="mt-3">
        <h2>Timeline</h2>
        <div class="timeline mt-2">
          ${timeline.map(t => `
            <div class="tl-item">
              <div class="row between wrap">
                <strong>${escapeHTML(t.year)} — ${escapeHTML(t.title)}</strong>
                <span class="badge badge--muted">Aurora</span>
              </div>
              <p class="muted mt-1" style="margin-bottom:0;">${escapeHTML(t.text)}</p>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function pageBlog() {
  return `
    <section>
      <div class="row between wrap">
        <div>
          <h1>Blog</h1>
          <p class="muted">Posts mock locais com busca e categorias.</p>
        </div>
        <span class="kicker"><span aria-hidden="true">📝</span> ${BLOG_POSTS.length} posts</span>
      </div>

      <div class="controls card mt-2">
        <div class="card__body grid" style="gap:.85rem;">
          <div class="field">
            <label for="blogSearch">Busca</label>
            <input id="blogSearch" type="search" placeholder="Título, resumo..." />
          </div>

          <div class="field">
            <label for="blogCategory">Categoria</label>
            <select id="blogCategory">
              <option value="">Todas</option>
              ${BLOG_CATEGORIES.map(c => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join("")}
            </select>
          </div>

          <div class="field">
            <label for="blogSort">Ordenação</label>
            <select id="blogSort">
              <option value="recent">Mais recentes (mock)</option>
              <option value="az">A → Z</option>
            </select>
          </div>
        </div>
      </div>

      <div class="mt-2">
        <div class="row between wrap">
          <h2 style="margin:0;">Posts</h2>
          <span class="muted small" id="blogCount">—</span>
        </div>
        <div class="grid grid--3 mt-2" id="blogGrid"></div>
      </div>
    </section>
  `;
}

function pageBlogPost(params) {
  const slug = params?.[0];
  const post = BLOG_POSTS.find(p => p.slug === slug);
  if (!post) {
    return `
      <section class="card">
        <div class="card__body">
          <h1>Post não encontrado</h1>
          <p class="muted">O slug <strong>${escapeHTML(slug)}</strong> não existe.</p>
          <a class="btn btn--primary" href="#/blog">Voltar ao blog</a>
        </div>
      </section>
    `;
  }

  return `
    <article class="card">
      <div class="card__body">
        <div class="kicker"><span aria-hidden="true">🏷️</span> ${escapeHTML(post.category)}</div>
        <h1 class="mt-2">${escapeHTML(post.title)}</h1>
        <p class="muted">${escapeHTML(post.summary)}</p>
        <div class="divider"></div>

        <div class="card" style="box-shadow:none;">
          <div class="card__body">
            <div class="muted small">Conteúdo</div>
            <div class="mt-1" style="white-space:pre-wrap; line-height:1.6;">
              ${escapeHTML(post.content).replaceAll("\n", "<br>")}
            </div>
          </div>
        </div>

        <div class="row wrap mt-2">
          <a class="btn" href="#/blog">Voltar</a>
          <a class="btn btn--primary" href="#/menu">Ver Cardápio</a>
        </div>
      </div>
    </article>
  `;
}

function pageContato() {
  return `
    <section class="grid grid--2">
      <div>
        <h1>Contato</h1>
        <p class="muted">Envie uma mensagem (salva no localStorage). Validação completa.</p>

        <div class="card mt-2">
          <div class="card__body">
            <form id="contactForm" class="form" novalidate>
              <div class="field">
                <label for="cName">Nome</label>
                <input id="cName" name="name" autocomplete="name" required />
                <div class="error" data-err="name"></div>
              </div>

              <div class="field">
                <label for="cEmail">Email</label>
                <input id="cEmail" name="email" type="email" inputmode="email" autocomplete="email" required />
                <div class="error" data-err="email"></div>
              </div>

              <div class="field">
                <label for="cPhone">Telefone</label>
                <input id="cPhone" name="phone" inputmode="tel" placeholder="(11) 9xxxx-xxxx" />
                <div class="help">Máscara simples aplicada ao digitar.</div>
              </div>

              <div class="field">
                <label for="cSubject">Assunto</label>
                <input id="cSubject" name="subject" required />
                <div class="error" data-err="subject"></div>
              </div>

              <div class="field">
                <label for="cMsg">Mensagem</label>
                <textarea id="cMsg" name="message" rows="4" required></textarea>
                <div class="error" data-err="message"></div>
              </div>

              <button class="btn btn--primary btn--full" type="submit">Enviar</button>
            </form>
          </div>
        </div>
      </div>

      <aside>
        <div class="card">
          <div class="card__body">
            <h2>Informações</h2>
            <p class="muted"><strong>Endereço:</strong><br>${escapeHTML(META.address)}</p>
            <p class="muted"><strong>Horários:</strong><br>${escapeHTML(META.hours)}</p>
            <p class="muted"><strong>Contato:</strong><br>${escapeHTML(META.contact)}</p>
            <div class="divider"></div>
            <p class="muted small">Dica: acesse <strong>Admin Local</strong> (conta admin) para ver e excluir mensagens e reservas.</p>
          </div>
        </div>
      </aside>
    </section>
  `;
}

function pageReservas() {
  return `
    <section class="grid grid--2">
      <div>
        <h1>Reservas</h1>
        <p class="muted">Reserve uma mesa (salva no localStorage). Se estiver logado, aparece em “Minhas Reservas”.</p>

        <div class="card mt-2">
          <div class="card__body">
            <form id="reserveForm" class="form" novalidate>
              <div class="field">
                <label for="rDate">Data</label>
                <input id="rDate" name="date" type="date" required />
                <div class="error" data-err="date"></div>
              </div>

              <div class="field">
                <label for="rTime">Hora</label>
                <input id="rTime" name="time" type="time" required />
                <div class="error" data-err="time"></div>
              </div>

              <div class="field">
                <label for="rPeople">Pessoas</label>
                <input id="rPeople" name="people" type="number" min="1" max="12" value="2" required />
                <div class="error" data-err="people"></div>
              </div>

              <div class="field">
                <label for="rPrefs">Preferências (opcional)</label>
                <textarea id="rPrefs" name="prefs" rows="3" placeholder="Ex.: perto da janela, cadeira infantil..."></textarea>
              </div>

              <button class="btn btn--primary btn--full" type="submit">Salvar reserva</button>
            </form>
          </div>
        </div>
      </div>

      <aside>
        <div class="card">
          <div class="card__body">
            <div class="row between wrap">
              <h2 style="margin:0;">Minhas Reservas</h2>
              <span class="badge badge--muted">${store.user ? "Logado" : "Convidado"}</span>
            </div>
            <p class="muted small mt-1">Mostra apenas reservas do usuário logado.</p>
            <div class="divider"></div>
            <div id="myReservations" class="stack"></div>
          </div>
        </div>
      </aside>
    </section>
  `;
}

function pageLogin() {
  return `
    <section class="grid grid--2">
      <div>
        <h1>Login</h1>
        <p class="muted">Autenticação local (sem API). Use sua conta ou a conta admin.</p>

        <div class="card mt-2">
          <div class="card__body">
            <form id="loginForm" class="form" novalidate>
              <div class="field">
                <label for="lEmail">Email</label>
                <input id="lEmail" name="email" type="email" inputmode="email" autocomplete="email" required />
                <div class="error" data-err="email"></div>
              </div>

              <div class="field">
                <label for="lPass">Senha</label>
                <input id="lPass" name="password" type="password" autocomplete="current-password" required />
                <div class="error" data-err="password"></div>
              </div>

              <button class="btn btn--primary btn--full" type="submit">Entrar</button>
              <p class="muted small">Sem conta? <a href="#/signup"><strong>Crie agora</strong></a>.</p>
            </form>
          </div>
        </div>
      </div>

      <aside>
        <div class="card">
          <div class="card__body">
            <h2>Conta Admin Local</h2>
            <p class="muted small">Para acessar <strong>#/admin-local</strong>:</p>
            <p class="muted"><strong>Email:</strong> admin@aurora.local<br><strong>Senha:</strong> aurora123</p>
            <div class="divider"></div>
            <p class="muted small">Dica: o admin existe apenas neste dispositivo (localStorage).</p>
          </div>
        </div>
      </aside>
    </section>
  `;
}

function pageSignup() {
  return `
    <section class="grid grid--2">
      <div>
        <h1>Criar conta</h1>
        <p class="muted">Cadastro local com senha “hasheada” (SHA-256). Mínimo 6 caracteres.</p>

        <div class="card mt-2">
          <div class="card__body">
            <form id="signupForm" class="form" novalidate>
              <div class="field">
                <label for="sName">Nome</label>
                <input id="sName" name="name" autocomplete="name" required />
                <div class="error" data-err="name"></div>
              </div>

              <div class="field">
                <label for="sEmail">Email</label>
                <input id="sEmail" name="email" type="email" inputmode="email" autocomplete="email" required />
                <div class="error" data-err="email"></div>
              </div>

              <div class="field">
                <label for="sPass">Senha</label>
                <input id="sPass" name="password" type="password" autocomplete="new-password" required />
                <div class="help">Mínimo: 6 caracteres</div>
                <div class="error" data-err="password"></div>
              </div>

              <button class="btn btn--primary btn--full" type="submit">Criar conta</button>
              <p class="muted small">Já tem conta? <a href="#/login"><strong>Fazer login</strong></a>.</p>
            </form>
          </div>
        </div>
      </div>

      <aside>
        <div class="card">
          <div class="card__body">
            <h2>Privacidade (offline)</h2>
            <p class="muted">Seus dados ficam no <strong>localStorage</strong> deste navegador/dispositivo.</p>
            <p class="muted small">Para “resetar”, limpe o storage do site nas configurações do navegador.</p>
          </div>
        </div>
      </aside>
    </section>
  `;
}

function pageDashboard() {
  const favs = getFavorites();
  const favProducts = favs.map(getProductById).filter(Boolean);
  const orders = getOrders().filter(o => o.userId === store.user?.id);

  return `
    <section>
      <div class="row between wrap">
        <div>
          <h1>Dashboard</h1>
          <p class="muted">Perfil, pedidos (mock do checkout) e favoritos.</p>
        </div>
        <span class="kicker"><span aria-hidden="true">👤</span> ${escapeHTML(store.user?.email || "")}</span>
      </div>

      <div class="grid grid--2 mt-2">
        <div class="card">
          <div class="card__body">
            <h2>Perfil</h2>
            <p class="muted"><strong>Nome:</strong> ${escapeHTML(store.user?.name || "")}</p>
            <p class="muted"><strong>Email:</strong> ${escapeHTML(store.user?.email || "")}</p>
            <p class="muted"><strong>Role:</strong> ${escapeHTML(store.user?.role || "user")}</p>
            <div class="divider"></div>
            <p class="muted small">Dica: finalize um pedido no carrinho para ver em “Meus pedidos”.</p>
          </div>
        </div>

        <div class="card">
          <div class="card__body">
            <div class="row between wrap">
              <h2 style="margin:0;">Favoritos</h2>
              <span class="badge badge--muted">${favProducts.length}</span>
            </div>
            <p class="muted small mt-1">CRUD local: favoritar/desfavoritar produtos.</p>
            <div class="divider"></div>
            <div class="stack">
              ${
                favProducts.length
                  ? favProducts.map(p => `
                    <div class="row between wrap">
                      <a href="#/produto/${p.id}"><strong>${escapeHTML(p.name)}</strong></a>
                      <button class="btn btn--ghost" type="button" data-action="toggle-fav" data-product-id="${p.id}">
                        Remover ❤️
                      </button>
                    </div>
                  `).join("")
                  : `<p class="muted">Nenhum favorito ainda. Abra um produto e clique em “Favoritar”.</p>`
              }
            </div>
          </div>
        </div>
      </div>

      <div class="mt-3">
        <div class="row between wrap">
          <h2 style="margin:0;">Meus pedidos</h2>
          <span class="badge badge--muted">${orders.length}</span>
        </div>

        <div class="grid grid--2 mt-2">
          ${
            orders.length
              ? orders.slice(0, 8).map(o => `
                <div class="card">
                  <div class="card__body">
                    <div class="row between wrap">
                      <strong>#${escapeHTML(o.id.slice(-6))}</strong>
                      <span class="badge">${escapeHTML(o.status)}</span>
                    </div>
                    <p class="muted small">Modo: ${escapeHTML(o.mode)} • ${new Date(o.createdAt).toLocaleString("pt-BR")}</p>
                    <div class="divider"></div>
                    <div class="stack">
                      ${o.items.map(it => {
                        const p = getProductById(it.productId);
                        return p ? `<div class="row between"><span>${escapeHTML(p.name)} × ${it.qty}</span><span class="muted">${brl(p.price * it.qty)}</span></div>` : "";
                      }).join("")}
                    </div>
                    <div class="divider"></div>
                    <div class="row between">
                      <span class="muted">Total</span>
                      <strong>${brl(o.total)}</strong>
                    </div>
                  </div>
                </div>
              `).join("")
              : `<p class="muted">Você ainda não tem pedidos. Abra o carrinho e finalize um checkout.</p>`
          }
        </div>
      </div>
    </section>
  `;
}

function pageAdminLocal() {
  const msgs = getContactMessages();
  const res = getReservations();
  const orders = getOrders();

  return `
    <section>
      <div class="row between wrap">
        <div>
          <h1>Admin Local</h1>
          <p class="muted">Painel offline: mensagens, reservas e estatísticas.</p>
        </div>
        <span class="kicker"><span aria-hidden="true">🛠️</span> Admin</span>
      </div>

      <div class="grid grid--3 mt-2">
        <div class="card"><div class="card__body">
          <div class="card__title">Mensagens</div>
          <p class="muted">Total: <strong>${msgs.length}</strong></p>
        </div></div>
        <div class="card"><div class="card__body">
          <div class="card__title">Reservas</div>
          <p class="muted">Total: <strong>${res.length}</strong></p>
        </div></div>
        <div class="card"><div class="card__body">
          <div class="card__title">Pedidos</div>
          <p class="muted">Total: <strong>${orders.length}</strong></p>
        </div></div>
      </div>

      <div class="mt-3 grid grid--2">
        <div class="card">
          <div class="card__body">
            <div class="row between wrap">
              <h2 style="margin:0;">Mensagens de contato</h2>
              <span class="badge badge--muted">${msgs.length}</span>
            </div>

            <div class="divider"></div>

            ${
              msgs.length
                ? `
                  <table class="table" aria-label="Mensagens">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>De</th>
                        <th>Assunto</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${msgs.slice(0, 30).map(m => `
                        <tr>
                          <td>${new Date(m.createdAt).toLocaleString("pt-BR")}</td>
                          <td>
                            <strong>${escapeHTML(m.name)}</strong><br>
                            <span class="muted small">${escapeHTML(m.email)}</span>
                          </td>
                          <td>
                            <strong>${escapeHTML(m.subject)}</strong><br>
                            <span class="muted small">${escapeHTML(m.message).slice(0, 90)}${m.message.length > 90 ? "…" : ""}</span>
                          </td>
                          <td>
                            <button class="btn btn--ghost" type="button" data-action="admin-del-msg" data-id="${escapeHTML(m.id)}">Excluir</button>
                          </td>
                        </tr>
                      `).join("")}
                    </tbody>
                  </table>
                `
                : `<p class="muted">Nenhuma mensagem ainda.</p>`
            }
          </div>
        </div>

        <div class="card">
          <div class="card__body">
            <div class="row between wrap">
              <h2 style="margin:0;">Reservas</h2>
              <span class="badge badge--muted">${res.length}</span>
            </div>

            <div class="divider"></div>

            ${
              res.length
                ? `
                  <table class="table" aria-label="Reservas">
                    <thead>
                      <tr>
                        <th>Data/Hora</th>
                        <th>Pessoas</th>
                        <th>Cliente</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${res.slice(0, 30).map(r => `
                        <tr>
                          <td>
                            <strong>${escapeHTML(r.date)} ${escapeHTML(r.time)}</strong><br>
                            <span class="muted small">${escapeHTML(r.prefs || "")}</span>
                          </td>
                          <td>${escapeHTML(String(r.people))}</td>
                          <td>
                            <strong>${escapeHTML(r.userName || "Convidado")}</strong><br>
                            <span class="muted small">${escapeHTML(r.userEmail || "-")}</span>
                          </td>
                          <td>
                            <button class="btn btn--ghost" type="button" data-action="admin-del-res" data-id="${escapeHTML(r.id)}">Excluir</button>
                          </td>
                        </tr>
                      `).join("")}
                    </tbody>
                  </table>
                `
                : `<p class="muted">Nenhuma reserva ainda.</p>`
            }
          </div>
        </div>
      </div>

      <div class="mt-3">
        <h2>Atalhos</h2>
        <div class="row wrap">
          <a class="btn" href="#/menu">Abrir Cardápio</a>
          <a class="btn" href="#/contato">Ver Contato</a>
          <a class="btn btn--primary" href="#/dashboard">Ir para Dashboard</a>
        </div>
      </div>
    </section>
  `;
}

/* -------------------------
   After-render page bindings
------------------------- */
function afterPageRender(path) {
  // binds globais por delegação
  bindGlobalDelegatedActions();

  if (path === "/menu") bindMenuPage();
  if (/^\/produto\/\d+$/.test(path)) bindProductDetail();
  if (path === "/blog") bindBlogPage();
  if (path === "/contato") bindContactForm();
  if (path === "/reservas") bindReserveForm();
  if (path === "/login") bindLoginForm();
  if (path === "/signup") bindSignupForm();
  if (path === "/dashboard") renderDashboardDynamicBits();
  if (path === "/admin-local") bindAdminActions();
}

let globalDelegationBound = false;
function bindGlobalDelegatedActions() {
  if (globalDelegationBound) return;
  globalDelegationBound = true;

  // botões "Adicionar" em cards
  document.addEventListener("click", (e) => {
    const btn = e.target.closest?.('[data-action="add-to-cart"]');
    if (!btn) return;
    const id = btn.getAttribute("data-product-id");
    addToCart(id, 1);
  });

  // toggles favoritos (em várias telas)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest?.('[data-action="toggle-fav"]');
    if (!btn) return;
    if (!store.user) {
      toast("err", "Faça login", "Entre para gerenciar favoritos.");
      location.hash = "#/login";
      return;
    }
    const id = btn.getAttribute("data-product-id");
    const favs = toggleFavorite(id);
    toast("ok", "Favoritos", favs.includes(Number(id)) ? "Adicionado aos favoritos." : "Removido dos favoritos.");
    // re-render leve quando fizer sentido
    const r = currentRoute();
    if (r.path === "/dashboard") navigate();
  });

  // fechar overlays ao clicar em links dentro do drawer (data-close)
  document.addEventListener("click", (e) => {
    const close = e.target?.getAttribute?.("data-close");
    if (close === "cart") closeOverlay("cart");
  });
}

/* Menu page logic */
function bindMenuPage() {
  const search = $("#menuSearch");
  const cat = $("#menuCategory");
  const sort = $("#menuSort");
  const grid = $("#menuGrid");

  function applyFilters() {
    const q = (search.value || "").trim().toLowerCase();
    const c = cat.value || "";
    const s = sort.value;

    let items = MENU_ITEMS.slice();

    if (c) items = items.filter(i => i.category === c);
    if (q) {
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.desc.toLowerCase().includes(q) ||
        (i.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    if (s === "price-asc") items.sort((a,b) => a.price - b.price);
    if (s === "price-desc") items.sort((a,b) => b.price - a.price);
    if (s === "az") items.sort((a,b) => a.name.localeCompare(b.name, "pt-BR"));
    if (s === "featured") {
      // "featured" mock: mantém ordem do array e destaca alguns
    }

    $("#menuCount").textContent = `${items.length} resultado(s)`;
    grid.innerHTML = items.map(productCard).join("") || `
      <div class="card" style="grid-column:1/-1;">
        <div class="card__body">
          <h3>Nenhum item encontrado</h3>
          <p class="muted">Tente remover filtros ou buscar por outro termo.</p>
        </div>
      </div>
    `;
  }

  // initial render
  applyFilters();

  // listeners
  ["input", "change"].forEach(evt => {
    search.addEventListener(evt, applyFilters);
    cat.addEventListener(evt, applyFilters);
    sort.addEventListener(evt, applyFilters);
  });
}

/* Product detail */
function bindProductDetail() {
  const btn = $('[data-action="add-to-cart-from-detail"]');
  if (!btn) return;

  btn.addEventListener("click", () => {
    const pid = btn.getAttribute("data-product-id");
    const qty = Number($("#prodQty").value || 1);
    addToCart(pid, Math.max(1, Math.min(20, qty)));
  });
}

/* Blog page logic */
function blogCard(p) {
  return `
    <article class="card">
      <div class="card__body">
        <div class="row between wrap">
          <div class="card__title">${escapeHTML(p.title)}</div>
          <span class="badge badge--muted">${escapeHTML(p.category)}</span>
        </div>
        <p class="muted">${escapeHTML(p.summary)}</p>
        <div class="row wrap">
          <a class="btn btn--primary" href="#/blog/${escapeHTML(p.slug)}">Ler</a>
        </div>
      </div>
    </article>
  `;
}

function bindBlogPage() {
  const search = $("#blogSearch");
  const cat = $("#blogCategory");
  const sort = $("#blogSort");
  const grid = $("#blogGrid");

  function apply() {
    const q = (search.value || "").trim().toLowerCase();
    const c = cat.value || "";
    const s = sort.value;

    let posts = BLOG_POSTS.slice();

    if (c) posts = posts.filter(p => p.category === c);
    if (q) posts = posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q)
    );

    if (s === "az") posts.sort((a,b) => a.title.localeCompare(b.title, "pt-BR"));
    if (s === "recent") {
      // mock: mantém ordem atual como "recent"
    }

    $("#blogCount").textContent = `${posts.length} resultado(s)`;
    grid.innerHTML = posts.map(blogCard).join("") || `
      <div class="card" style="grid-column:1/-1;">
        <div class="card__body">
          <h3>Nenhum post encontrado</h3>
          <p class="muted">Tente remover filtros ou buscar por outro termo.</p>
        </div>
      </div>
    `;
  }

  apply();
  ["input", "change"].forEach(evt => {
    search.addEventListener(evt, apply);
    cat.addEventListener(evt, apply);
    sort.addEventListener(evt, apply);
  });
}

/* Contact form */
function bindContactForm() {
  const form = $("#contactForm");
  if (!form) return;

  const phone = $("#cPhone");
  phone?.addEventListener("input", () => maskPhoneBR(phone));

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());
    const errs = {};

    if (!required(data.name)) errs.name = "Informe seu nome.";
    if (!isEmail(data.email)) errs.email = "Informe um email válido.";
    if (!required(data.subject)) errs.subject = "Informe um assunto.";
    if (!required(data.message) || String(data.message).trim().length < 10) errs.message = "Mensagem deve ter pelo menos 10 caracteres.";

    // render errors
    ["name","email","subject","message"].forEach(k => {
      const el = form.querySelector(`[data-err="${k}"]`);
      if (el) el.textContent = errs[k] || "";
    });

    if (Object.keys(errs).length) {
      toast("err", "Corrija o formulário", "Há campos com erro.");
      // foca primeiro inválido
      const first = Object.keys(errs)[0];
      form.querySelector(`[name="${first}"]`)?.focus();
      return;
    }

    const list = getContactMessages();
    list.unshift({
      id: uid("msg"),
      createdAt: new Date().toISOString(),
      name: escapeHTML(data.name),
      email: escapeHTML(data.email),
      phone: escapeHTML(data.phone || ""),
      subject: escapeHTML(data.subject),
      message: escapeHTML(data.message)
    });
    setContactMessages(list);

    form.reset();
    toast("ok", "Mensagem enviada!", "Salvamos sua mensagem neste dispositivo.");
  });
}

/* Reservations */
function bindReserveForm() {
  const form = $("#reserveForm");
  if (!form) return;

  function renderMyReservations() {
    const host = $("#myReservations");
    if (!host) return;
    if (!store.user) {
      host.innerHTML = `<p class="muted">Faça login para ver suas reservas.</p><a class="btn btn--primary" href="#/login">Entrar</a>`;
      return;
    }
    const list = getReservations().filter(r => r.userId === store.user.id);
    if (!list.length) {
      host.innerHTML = `<p class="muted">Nenhuma reserva ainda.</p>`;
      return;
    }
    host.innerHTML = list.slice(0, 10).map(r => `
      <div class="card">
        <div class="card__body">
          <div class="row between wrap">
            <strong>${escapeHTML(r.date)} ${escapeHTML(r.time)}</strong>
            <span class="badge">${escapeHTML(String(r.people))} pessoa(s)</span>
          </div>
          ${r.prefs ? `<p class="muted small mt-1" style="margin-bottom:0;">${escapeHTML(r.prefs)}</p>` : ""}
        </div>
      </div>
    `).join("");
  }

  renderMyReservations();

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());
    const errs = {};

    if (!required(data.date)) errs.date = "Escolha uma data.";
    if (!required(data.time)) errs.time = "Escolha uma hora.";
    const people = Number(data.people || 0);
    if (!(people >= 1 && people <= 12)) errs.people = "Escolha de 1 a 12 pessoas.";

    // render errors
    ["date","time","people"].forEach(k => {
      const el = form.querySelector(`[data-err="${k}"]`);
      if (el) el.textContent = errs[k] || "";
    });

    if (Object.keys(errs).length) {
      toast("err", "Reserva inválida", "Verifique os campos.");
      return;
    }

    const list = getReservations();
    list.unshift({
      id: uid("res"),
      createdAt: new Date().toISOString(),
      userId: store.user?.id || null,
      userName: store.user?.name || null,
      userEmail: store.user?.email || null,
      date: escapeHTML(data.date),
      time: escapeHTML(data.time),
      people: people,
      prefs: escapeHTML(data.prefs || "")
    });
    setReservations(list);

    form.reset();
    toast("ok", "Reserva salva!", "Sua reserva foi registrada neste dispositivo.");
    renderMyReservations();
  });
}

/* Login */
function bindLoginForm() {
  const form = $("#loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());
    const errs = {};

    if (!isEmail(data.email)) errs.email = "Email inválido.";
    if (!required(data.password)) errs.password = "Informe a senha.";

    ["email","password"].forEach(k => {
      const el = form.querySelector(`[data-err="${k}"]`);
      if (el) el.textContent = errs[k] || "";
    });

    if (Object.keys(errs).length) {
      toast("err", "Não foi possível entrar", "Verifique seus dados.");
      return;
    }

    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === String(data.email).toLowerCase());
    if (!user) {
      toast("err", "Conta não encontrada", "Crie uma conta ou verifique o email.");
      return;
    }

    const passHash = await simpleHash(data.password);
    if (passHash !== user.passHash) {
      toast("err", "Senha incorreta", "Tente novamente.");
      return;
    }

    setSession(user);
    toast("ok", "Bem-vindo!", "Login realizado com sucesso.");
    location.hash = "#/dashboard";
  });
}

/* Signup */
function bindSignupForm() {
  const form = $("#signupForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());
    const errs = {};

    if (!required(data.name)) errs.name = "Informe seu nome.";
    if (!isEmail(data.email)) errs.email = "Informe um email válido.";
    if (!minLen(data.password, 6)) errs.password = "Senha precisa ter no mínimo 6 caracteres.";

    ["name","email","password"].forEach(k => {
      const el = form.querySelector(`[data-err="${k}"]`);
      if (el) el.textContent = errs[k] || "";
    });

    if (Object.keys(errs).length) {
      toast("err", "Cadastro inválido", "Corrija os campos.");
      return;
    }

    const users = getUsers();
    const exists = users.some(u => u.email.toLowerCase() === String(data.email).toLowerCase());
    if (exists) {
      toast("err", "Email já cadastrado", "Use outro email ou faça login.");
      return;
    }

    const passHash = await simpleHash(data.password);

    const newUser = {
      id: uid("user"),
      createdAt: new Date().toISOString(),
      name: String(data.name).trim(),
      email: String(data.email).trim(),
      passHash,
      role: "user"
    };
    users.unshift(newUser);
    setUsers(users);

    setSession(newUser);
    toast("ok", "Conta criada!", "Você já está logado.");
    location.hash = "#/dashboard";
  });
}

/* Dashboard dynamic (se necessário no futuro) */
function renderDashboardDynamicBits() {
  // nesta versão, o dashboard já é renderizado com tudo via template
}

/* Admin actions */
function bindAdminActions() {
  document.addEventListener("click", (e) => {
    const delMsg = e.target.closest?.('[data-action="admin-del-msg"]');
    const delRes = e.target.closest?.('[data-action="admin-del-res"]');

    if (delMsg) {
      const id = delMsg.getAttribute("data-id");
      const list = getContactMessages().filter(m => m.id !== id);
      setContactMessages(list);
      toast("ok", "Excluído", "Mensagem removida.");
      navigate();
      return;
    }

    if (delRes) {
      const id = delRes.getAttribute("data-id");
      const list = getReservations().filter(r => r.id !== id);
      setReservations(list);
      toast("ok", "Excluído", "Reserva removida.");
      navigate();
      return;
    }
  }, { once: true });
}

/* -------------------------
   Init
------------------------- */
async function init() {
  loadInitialState();
  applyTheme();

  // seed admin, se necessário
  const users = getUsers();
  if (!users.some(u => u.email.toLowerCase() === "admin@aurora.local")) {
    const passHash = await simpleHash("aurora123");
    users.push({
      id: uid("user"),
      createdAt: new Date().toISOString(),
      name: "Admin Aurora",
      email: "admin@aurora.local",
      passHash,
      role: "admin"
    });
    setUsers(users);
  }

  renderAuthArea();
  renderCartBadge();
  renderFooterMeta();

  bindHeader();
  bindOverlayEvents();
  bindNewsletter();

  // route listeners
  window.addEventListener("hashchange", navigate);
  // default route
  if (!location.hash) location.hash = "#/home";
  await navigate();

  // re-render cart drawer values if it’s open and state changes elsewhere
  renderCartDrawer();
}

/* -------------------------
   Global click: close checkout on navigation etc.
------------------------- */
window.addEventListener("click", (e) => {
  // se navegar em links, fecha overlays abertos (experiência)
  const a = e.target.closest?.("a[href^='#/']");
  if (!a) return;
  closeOverlay("checkout");
});

/* Start */
init();
