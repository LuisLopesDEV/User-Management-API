document.getElementById('year').textContent = new Date().getFullYear();

// ==============================
// Elementos do carrinho
// ==============================
const cartCount = document.querySelector('.cart__count');
const cartBody = document.querySelector('.cart-drawer__body');
const cartOverlay = document.querySelector('.cart-overlay');
const cartButton = document.querySelector('.cart');
const cartDrawer = document.querySelector('.cart-drawer');
const closeButton = document.querySelector('.icon-btn');



// ==============================
// Elementos do modal de produto
// ==============================
const pmodal = document.querySelector('#produtoModal');

const pmodalImg = document.querySelector('#pmodal-img');
const pmodalName = document.querySelector('#pmodal-name');
const pmodalPrice = document.querySelector('#pmodal-price');
const pmodalDescription = document.querySelector('#pmodal-desc');
const pmodalSlot = document.querySelector('.pmodal__slot');


const addCartButton = document.querySelector('#pmodal-add');
const cancelCartButton = document.querySelector('#pmodal-cancel');
const closePmodalButton = document.querySelector('#CloseItemMenu');

// ==============================
// Cardápio
// ==============================
const menuContainer = document.getElementById('menu-container');

// ==============================
// Estado
// ==============================
const cart = [];

function generateCartItemId() {
  // remove null/undefined e itens sem id antes de calcular
  const ids = cart
    .filter(item => item && typeof item.id === "number")
    .map(item => item.id);

  return ids.length ? Math.max(...ids) + 1 : 1;
}

function persistCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}
const savedCart = localStorage.getItem('cart');
if (savedCart) {
  const parsed = JSON.parse(savedCart);
  if (Array.isArray(parsed)) cart.push(...parsed.filter(Boolean));
  else localStorage.removeItem('cart');
}

// ==============================
// Renderização
// ==============================
function renderMenu() {
  let html = '';

  menuData.slice(0, 6).forEach((product) => {
    html += `
      <article class="card">
        <div class="card__img">
          <img src="${product.img}" alt="${product.name}">
          <div class="card__imgOverlay"></div>
        </div>

        <div class="card__body">
          <div class="card__top">
            <h3>${product.name}</h3>
            <span class="price">R$ ${product.price}</span>
          </div>

          <p class="muted">${product.description}</p>

          <div class="card__actions">
            <button class="btn btn--sm btn--primary addButton" data-product="${product.id}">
              Adicionar
            </button>
          </div>
        </div>
      </article>
    `;
  });

  menuContainer.innerHTML = html;
}

function renderCart() {
  cart.splice(0, cart.length, ...cart.filter(item => item && item.produtoId));
const totalCount = cart.reduce((sum, item) => sum + (item?.qty || 0), 0);

  if (totalCount === 0) {
    cartBody.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty__icon">🛒</div>
        <h4>Carrinho vazio</h4>
        <p class="muted">Adicione um café ou uma comida para começar.</p>
        <a class="btn btn--primary IrCardapio" href="#menu">Ir ao cardápio</a>
      </div>
    `;
    return;
  }

  let html = '';
  let subtotal = 0;

  for (const item of cart) {
  if (!item) continue; 
  if (!item.produtoId) continue; 
  const produto = menuData.find(p => p.id === item.produtoId);
  if (!produto) continue;

  const size = produto.sizes?.find(s => s.id === item.sizeId);
  const addon = produto.addons?.find(a => a.id === item.addonId);
  const sizePrice = size ? size.price : 0;
  const addonPrice = addon ? addon.price : 0;

  const produtoTotal = (produto.price + sizePrice + addonPrice)

  const TotalCart = (produto.price + sizePrice + addonPrice) * item.qty;

  const sizeLabel = size ? size.label : "Padrão";
  const addonLabel = addon ? addon.label : "Nenhum";

  subtotal += TotalCart;

    html += `
  <div class="cart-item" data-product="${item.id}">
    <div class="cart-item__main">
      <div class="cart-item__details">
        <h4>${produto.name}</h4>
        <p class="cart-item__line">
          <span class="muted">R$ ${(produtoTotal).toFixed(2)}</span>
        </p>
      </div>

      <div class="cart-item__controls">
        <div class="qty" aria-label="Quantidade">
          <button class="qty__btn qty__btn--minus" type="button" data-product="${item.id}" aria-label="Diminuir">−</button>
          <span class="qty__value" aria-label="Quantidade atual">${item.qty}</span>
          <button class="qty__btn qty__btn--plus" type="button" data-product="${item.id}" aria-label="Aumentar">+</button>
        </div>

        <button class="trash-btn" type="button" data-product="${item.id}" aria-label="Remover item">🗑️</button>

        <!-- NOVO: Toggle (seta) -->
        <button class="expand-btn" type="button" data-expand="${item.id}" aria-expanded="false" aria-label="Ver detalhes do item">
          <span class="expand-btn__icon">▾</span>
        </button>
      </div>
    </div>

    <!-- NOVO: Área expandida -->
    <div class="cart-item__expand" id="expand-${item.id}" aria-hidden="true">
      <div class="cart-expand__grid">
        <div class="cart-expand__col">
          <h5>Detalhes</h5>
          <p class="cart-expand__desc">${produto.description}</p>

          <div class="cart-expand__kv">
            <span>Tamanho</span>
            <strong class="muted">${sizeLabel}</strong>
          </div>

          <div class="cart-expand__kv">
            <span>Adicionais</span>
            <strong class="muted">${addonLabel}</strong>
          </div>
        </div>

        <div class="cart-expand__col">
          <h5>Resumo</h5>

          <div class="cart-expand__kv">
            <span>Preço unitário</span>
            <strong>R$ ${Number(produtoTotal).toFixed(2)}</strong>
          </div>

          <div class="cart-expand__kv">
            <span>Total do item</span>
            <strong>R$ ${(produtoTotal * item.qty).toFixed(2)}</strong>
          </div>

          <div class="cart-expand__meta">
            <span class="meta-pill">⏱️ 15–25 min (placeholder)</span>
            <span class="status-pill status-pill--created">🟡 Criado</span>
          </div>
        </div>
      </div>
    </div>
  </div>
`;
      }
          html += `
      <div class="cart-summary">
        <div class="cart-summary__row">
          <span>Subtotal</span>
          <strong>R$ ${subtotal.toFixed(2)}</strong>
        </div>

        <button class="btn btn--green btn--block">
          Finalizar pedido
        </button>
      </div>
    `;
  cartBody.innerHTML = html;


}

// ==============================
// Modal de produto
// ==============================
function carregarProduto(produtoid) {
  const produto = menuData.find((p) => String(p.id) === String(produtoid));
  if (!produto) return;

  selectedSize = produto.sizes?.[0]?.id || "";
  selectedAddon = "";

  pmodalImg.src = produto.img;
  pmodalName.textContent = produto.name;
  pmodalPrice.textContent = `R$ ${produto.price}`;
  pmodalDescription.textContent = produto.description;

pmodalSlot.innerHTML = `
  <div class="pmodal__option">
    <label for="size">Tamanho</label>
    <select id="size">
      ${(produto.sizes || []).map(s => `
        <option value="${s.id}">
          ${s.label}${s.price ? ` (+R$ ${s.price})` : ""}
        </option>
      `).join("")}
    </select>
  </div>

  <div class="pmodal__option">
    <label for="addon">Adicional</label>
    <select id="addon">
      <option value="">Nenhum</option>
      ${(produto.addons || []).map(a => `
        <option value="${a.id}">
          ${a.label} (+R$ ${a.price})
        </option>
      `).join("")}
    </select>
  </div>

  <div class="pmodal__total">
    <span>Total</span>
    <strong id="pmodal-total">R$ ${Number(produto.price).toFixed(2)}</strong>
  </div>
`;

const sizeSelect = document.getElementById("size");
const addonSelect = document.getElementById("addon");

function updateModalTotal() {
  selectedSize = sizeSelect.value;
  selectedAddon = addonSelect.value;

  const sizeObj = (produto.sizes || []).find(s => s.id === selectedSize);
  const addonObj = (produto.addons || []).find(a => a.id === selectedAddon);

  const sizePrice = sizeObj ? sizeObj.price : 0;
  const addonPrice = addonObj ? addonObj.price : 0;

  const total = Number(produto.price) + sizePrice + addonPrice;

  document.getElementById("pmodal-total").textContent = `R$ ${total.toFixed(2)}`;
}

sizeSelect.addEventListener("change", updateModalTotal);
addonSelect.addEventListener("change", updateModalTotal);

updateModalTotal();
}

function updateCartCount() {
  const total = cart.reduce((sum, item) => {
    if (!item) return sum;
    return sum + (item.qty || 0);
  }, 0);

  cartCount.textContent = total;
}

// ==============================
// Carrinho (ações)
// ==============================
function addCart() {

  const newItem = {
    id: generateCartItemId(),
    produtoId: produtoid,
    sizeId: selectedSize,
    addonId: selectedAddon,
    qty: 1
  };

  cart.push(newItem);

  persistCart();
  renderCart();
  updateCartCount();
}

function removeCart(itemId) {
  const idx = cart.findIndex(item => item && item.id === Number(itemId));
  if (idx !== -1) cart.splice(idx, 1);

  persistCart();
  renderCart();
  updateCartCount();
}

// ==============================
// Drawer do carrinho
// ==============================
function openCart() {
  cartDrawer.classList.add('is-open');
  cartOverlay.classList.add('is-open');
  cartButton?.setAttribute('aria-expanded', 'true');
}

function closeCart() {
  cartDrawer.classList.remove('is-open');
  cartOverlay.classList.remove('is-open');
  cartButton?.setAttribute('aria-expanded', 'false');
}

// ==============================
// Inicialização
// ==============================
renderMenu();
renderCart();
updateCartCount();

const addButtons = document.querySelectorAll('.addButton');

let produtoid = null;
let selectedSize = "";
let selectedAddon = "";

addButtons.forEach((button) => {
  button.addEventListener('click', (e) => {
    produtoid = e.currentTarget.getAttribute('data-product');

    if (pmodal.classList.contains('is-open')) {
      pmodal.classList.remove('is-open');
      return;
    }

    pmodal.classList.add('is-open');
    carregarProduto(produtoid);
  });
});

// ==============================
// Eventos do modal
// ==============================

closePmodalButton.addEventListener('click', () => {
  pmodal.classList.remove('is-open');
});

cancelCartButton.addEventListener('click', () => {
  pmodal.classList.remove('is-open');
});

addCartButton.addEventListener('click', (e) => {
  addCart.call(addCartButton);
  pmodal.classList.remove('is-open');
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') pmodal.classList.remove('is-open');
});



// ==============================
// Eventos do carrinho
// ==============================
closeButton?.addEventListener('click', closeCart);
cartOverlay?.addEventListener('click', closeCart);

cartButton?.addEventListener('click', (e) => {
  e.preventDefault();
  openCart();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCart();
});

cartBody.addEventListener('click', (e) => {
  const btnIrCardapio = e.target.closest('.IrCardapio');
  if (btnIrCardapio) {
    closeCart();
    console.log("Navegar para o cardápio");
  }

  const minusBtn = e.target.closest('.qty__btn--minus');
  const plusBtn  = e.target.closest('.qty__btn--plus');
  const trashBtn = e.target.closest('.trash-btn');
  const expandBtn = e.target.closest('.expand-btn');
  
  if (!minusBtn && !plusBtn && !trashBtn && !expandBtn) return;
  const btn = trashBtn || minusBtn || plusBtn || expandBtn;

  const id = btn.getAttribute('data-product');

  if (expandBtn) {const cartItem = expandBtn.closest('.cart-item');
  const isOpen = cartItem.classList.toggle('is-expanded');

  expandBtn.setAttribute('aria-expanded', String(isOpen));

  const expandArea = cartItem.querySelector('.cart-item__expand');
  if (expandArea) expandArea.setAttribute('aria-hidden', String(!isOpen));

  return;
}


if (trashBtn){
  return removeCart(id);
}
if (minusBtn) {

  const item = cart.find(item => item && item.id === Number(id));
  if (!item) return;

  if (item.qty > 1) {
    item.qty -= 1;
  } else {
    removeCart(id);
  }

} else if (plusBtn) {

  const item = cart.find(item => item && item.id === Number(id));
  if (!item) return;

  item.qty += 1;
}




  persistCart();
  renderCart();
  updateCartCount();
});

