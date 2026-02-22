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
const cart = {};

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
  const totalCount = Object.values(cart).reduce((a, b) => a + b, 0);
  
  if (totalCount === 0) {
    cartBody.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty__icon">🛒</div>
        <h4>Carrinho vazio</h4>
        <p class="muted">Adicione um café ou uma comida para começar.</p>
        <a class="btn btn--primary" href="#menu">Ir ao cardápio</a>
      </div>
    `;
    return;
  }

  let html = '';

  for (const [id, qty] of Object.entries(cart)) {
    const produto = menuData.find((p) => String(p.id) === String(id));
    if (!produto) continue;

    html += `
  <div class="cart-item">
    <div class="cart-item__details">
      <h4>${produto.name}</h4>
      <p class="cart-item__line">
        <span class="muted">R$ ${(produto.price * qty).toFixed(2)}</span>
      </p>
    </div>

    <div class="cart-item__controls">
      <div class="qty" aria-label="Quantidade">
        <button class="qty__btn qty__btn--minus" type="button" data-product="${id}" aria-label="Diminuir">−</button>
        <span class="qty__value" aria-label="Quantidade atual">${qty}</span>
        <button class="qty__btn qty__btn--plus" type="button" data-product="${id}" aria-label="Aumentar">+</button>
      </div>

      <button class="trash-btn" type="button" data-product="${id}" aria-label="Remover item">
        🗑️
      </button>
    </div>
  </div>
`;
  }

  cartBody.innerHTML = html;
}

// ==============================
// Modal de produto
// ==============================
function carregarProduto(produtoid) {
  const produto = menuData.find((p) => String(p.id) === String(produtoid));
  if (!produto) return;

  pmodalImg.src = produto.img;
  pmodalName.textContent = produto.name;
  pmodalPrice.textContent = `R$ ${produto.price}`;
  pmodalDescription.textContent = produto.description;
}

// ==============================
// Carrinho (ações)
// ==============================
function addCart() {
  cart[produtoid] = (cart[produtoid] || 0) + 1;

  // contador total:
  cartCount.textContent = Object.values(cart).reduce((a, b) => a + b, 0);

  renderCart();
}

function removeCart(produtoid) {
  let count = parseInt(cartCount.textContent);
  if (count > 0) count -= 1;

  cartCount.textContent = count;
  delete cart[produtoid];
  renderCart();
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

const addButtons = document.querySelectorAll('.addButton');

let produtoid = null;

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
  const minusBtn = e.target.closest('.qty__btn--minus');
  const plusBtn  = e.target.closest('.qty__btn--plus');
  const trashBtn = e.target.closest('.trash-btn');

  if (!minusBtn && !plusBtn && !trashBtn) return;
  const btn = trashBtn || minusBtn || plusBtn;
  const id = btn.getAttribute('data-product');

  if (trashBtn){
    return removeCart(id);
  }
if (minusBtn) {
    if (cart[id] > 1) cart[id] -= 1;
    else removeCart(id);
  } else if (plusBtn) {
    cart[id] += 1;
  }

  renderCart();
});

