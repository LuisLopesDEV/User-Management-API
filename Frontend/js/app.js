document.getElementById('year').textContent = new Date().getFullYear();

const cartCount = document.querySelector('.cart__count');
const cartBody = document.querySelector('.cart-drawer__body');
const cartOverlay = document.querySelector('.cart-overlay');
const cartButton = document.querySelector('.cart');
const cartDrawer = document.querySelector('.cart-drawer');
const closeButton = document.querySelector('.icon-btn');

const pmodal = document.querySelector('#produtoModal');

const pmodalImg = document.querySelector('#pmodal-img');
const pmodalName = document.querySelector('#pmodal-name');
const pmodalPrice = document.querySelector('#pmodal-price');
const pmodalDescription = document.querySelector('#pmodal-desc');

const menuContainer = document.getElementById("menu-container");

const cart = {};

function renderMenu() {

  let html = "";
        menuData.slice(0,6).forEach(product => {
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

renderMenu();
renderCart();

const addButtons = document.querySelectorAll('.addButton');

addButtons.forEach((button) => {
  button.addEventListener('click', (e) => {
    const produtoid = e.currentTarget.getAttribute('data-product'); // ou button.getAttribute(...)
    
    if (pmodal.classList.contains('is-open')) {
      pmodal.classList.remove('is-open');
      return;
    }

    pmodal.classList.add('is-open');
    carregarProduto(produtoid);
  });
});

function carregarProduto(produtoid) {
  const produto = menuData.find(p => String(p.id) === String(produtoid));
  if (!produto) return;
  pmodalImg.src = produto.img;
  pmodalName.textContent = produto.name;
  pmodalPrice.textContent = `R$ ${produto.price}`;
  pmodalDescription.textContent = produto.description;  
}


function addCart() {
  const produtoid = this.getAttribute('data-product');

  cart[produtoid] = (cart[produtoid] || 0) + 1;

  // contador total:
  cartCount.textContent = Object.values(cart).reduce((a, b) => a + b, 0);

  renderCart();
}

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

closeButton?.addEventListener('click', closeCart);
cartOverlay?.addEventListener('click', closeCart);
cartButton?.addEventListener('click', (e) => {
  e.preventDefault();
  openCart();
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCart();
});

function renderCart() {
  const totalCount = Object.values(cart).reduce((a, b) => a + b, 0);

  if (totalCount === 0) {
    cartBody.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty__icon">🛒</div>
        <h4>Carrinho vazio</h4>
        <p class="muted">Adicione um café ou uma comida para começar.</p>
        <a class="btn btn--primary" href="#menu">Ir ao cardápio</a>
      </div>`;
    return;
  }

  let html = '';
  for (const [id, qty] of Object.entries(cart)) {
    const produto = menuData.find(p => String(p.id) === String(id));
    if (!produto) continue;

    html += `
      <div class="cart-item">
        <div class="cart-item__details">
          <h4>${produto.name}</h4>
          <p>Quantidade: ${qty}</p>
          <p>Preço: R$ ${(produto.price * qty).toFixed(2)}</p>
        </div>
        <button class="btn btn--danger removeButton" data-product="${id}">Remover</button>
      </div>`;
  }

  cartBody.innerHTML = html;
}

cartBody.addEventListener('click', (e) => {
  const btn = e.target.closest('.removeButton');
  if (!btn) return;
  removeCart(btn.getAttribute('data-product'));
});

function removeCart(produtoid) {
    let count = parseInt(cartCount.textContent);
    if (count > 0) count -= 1;
    cartCount.textContent = count;
    delete cart[produtoid];
    renderCart();
}