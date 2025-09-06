/*ssconst hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const openIcon = document.querySelector('.hamburger .open-icon');
const closeIcon = document.querySelector('.hamburger .close-icon');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    openIcon.style.display = openIcon.style.display === 'none' ? 'block' : 'none';
    closeIcon.style.display = closeIcon.style.display === 'none' ? 'block' : 'none';
});*/


// Smooth scroll for Shop Now button
document.querySelector('.hero-text .btn').addEventListener('click', function(e){
    e.preventDefault();
    document.querySelector('#products').scrollIntoView({ behavior: 'smooth' });
});


/* ===== Navbar Toggle (already in your file) ===== */
const hamburger = document.querySelector(".hamburger");
if (hamburger) {
  const navLinks = document.querySelector(".nav-links");
  const openIcon = document.querySelector(".open-icon");
  const closeIcon = document.querySelector(".close-icon");
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    openIcon.classList.toggle("hidden");
    closeIcon.classList.toggle("hidden");
  });
}

/* ===== Smooth scroll for Hero Shop Now (optional) ===== */
const heroBtn = document.querySelector('.hero .btn[href="#products"]');
if (heroBtn) {
  heroBtn.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" });
  });
}

/* ================= CART LOGIC ================= */
const CART_KEY = "mariAuraCart";
const PROMO_KEY = "mariAuraPromo";

const loadCart = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
};
const saveCart = (items) => localStorage.setItem(CART_KEY, JSON.stringify(items));

const formatMoney = (n) => `$${n.toFixed(2)}`;

// Optional: attach add-to-cart to any element with data-product attrs
// Example: <a class="shop-btn" data-id="1" data-name="Product 1" data-price="49.99" data-img="./image/product1.jpg">Add</a>
document.querySelectorAll("[data-add-to-cart]").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const el = e.currentTarget;
    const item = {
      id: el.dataset.id,
      name: el.dataset.name,
      price: parseFloat(el.dataset.price || "0"),
      img: el.dataset.img || "",
      qty: parseInt(el.dataset.qty || "1", 10)
    };
    const cart = loadCart();
    const existing = cart.find(c => c.id === item.id);
    if (existing) existing.qty += item.qty;
    else cart.push(item);
    saveCart(cart);
    alert("Added to cart!");
    // Optionally update a badge here
  });
});

/* ===== Render Cart Page if present ===== */
const grid = document.getElementById("cart-grid");
const emptyBox = document.getElementById("cart-empty");
const summaryBox = document.getElementById("cart-summary");

function renderCart() {
  if (!grid || !emptyBox || !summaryBox) return; // not on cart page
  const cart = loadCart();

  if (!cart.length) {
    grid.style.display = "none";
    summaryBox.style.display = "none";
    emptyBox.style.display = "block";
    return;
  }

  emptyBox.style.display = "none";
  summaryBox.style.display = "grid";
  grid.style.display = "grid";

  // Build items container
  grid.innerHTML = `
    <div class="cart-items" id="cart-items"></div>
    <div></div>
  `;
  const list = document.getElementById("cart-items");

  cart.forEach((item, idx) => {
    const el = document.createElement("div");
    el.className = "cart-item";
    el.innerHTML = `
      <div class="thumb"><img src="${item.img}" alt="${item.name}"></div>
      <div class="meta">
        <h3>${item.name}</h3>
        <p>SKU: ${item.id || "N/A"}</p>
      </div>
      <div class="actions">
        <div class="qty">
          <button data-action="dec" data-index="${idx}">−</button>
          <input type="text" value="${item.qty}" data-index="${idx}" aria-label="Quantity" />
          <button data-action="inc" data-index="${idx}">+</button>
        </div>
        <span class="price-tag">${formatMoney(item.price * item.qty)}</span>
        <button class="remove-btn" data-action="remove" data-index="${idx}">Remove</button>
      </div>
    `;
    list.appendChild(el);
  });

  attachItemHandlers();
  updateTotals();
}

function attachItemHandlers() {
  document.querySelectorAll(".qty button").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index, 10);
      const action = btn.dataset.action;
      const cart = loadCart();
      if (!cart[idx]) return;
      if (action === "inc") cart[idx].qty++;
      if (action === "dec") cart[idx].qty = Math.max(1, cart[idx].qty - 1);
      saveCart(cart);
      renderCart();
    });
  });
  document.querySelectorAll(".qty input").forEach(inp => {
    inp.addEventListener("change", () => {
      const idx = parseInt(inp.dataset.index, 10);
      let val = parseInt(inp.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      const cart = loadCart();
      if (!cart[idx]) return;
      cart[idx].qty = val;
      saveCart(cart);
      renderCart();
    });
  });
  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index, 10);
      const cart = loadCart();
      cart.splice(idx, 1);
      saveCart(cart);
      renderCart();
    });
  });
}

function getPromo() {
  try { return JSON.parse(localStorage.getItem(PROMO_KEY)) || null; }
  catch { return null; }
}
function setPromo(code, discountValue) {
  localStorage.setItem(PROMO_KEY, JSON.stringify({ code, discountValue }));
}
function clearPromo() { localStorage.removeItem(PROMO_KEY); }

function updateTotals() {
  const subtotalEl = document.getElementById("subtotal");
  const discountEl = document.getElementById("discount");
  const shippingEl = document.getElementById("shipping");
  const totalEl = document.getElementById("grand-total");

  const cart = loadCart();
  const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);

  let discount = 0;
  const promo = getPromo();
  if (promo && promo.discountValue) discount = Math.min(subtotal, promo.discountValue);

  const shipping = subtotal - discount >= 100 ? 0 : 7.99; // free over $100
  const total = Math.max(0, subtotal - discount) + (subtotal ? shipping : 0);

  subtotalEl.textContent = formatMoney(subtotal);
  discountEl.textContent = `-${formatMoney(discount)}`;
  shippingEl.textContent = subtotal ? formatMoney(shipping) : "$0.00";
  totalEl.textContent = formatMoney(total);
}

/* Promo code */
const applyBtn = document.getElementById("apply-promo");
if (applyBtn) {
  applyBtn.addEventListener("click", () => {
    const input = document.getElementById("promo");
    const msg = document.getElementById("promo-msg");
    const code = (input.value || "").trim().toUpperCase();

    // Example rules
    // MARI10 => 10% off
    // MARI20 => $20 flat off
    const cart = loadCart();
    const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);

    if (!code) { msg.textContent = "Please enter a code."; return; }

    let discountValue = 0;
    if (code === "MARI10") discountValue = subtotal * 0.10;
    else if (code === "MARI20") discountValue = 20;
    else { msg.textContent = "Invalid code."; clearPromo(); updateTotals(); return; }

    setPromo(code, discountValue);
    msg.textContent = `Code applied: ${code}`;
    updateTotals();
  });
}

/* Checkout */
const checkoutBtn = document.getElementById("checkout-btn");
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    const cart = loadCart();
    if (!cart.length) { alert("Your cart is empty."); return; }
    alert("Proceeding to checkout (demo)!");
    // You can redirect to payment page here later.
  });
}

/* Init render on cart page */
renderCart();


// Product Filter
const filterBtns = document.querySelectorAll(".filter-btn");
const productCards = document.querySelectorAll(".product-card");

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    // active button change
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const category = btn.getAttribute("data-filter");

    productCards.forEach(card => {
      if (category === "all" || card.getAttribute("data-category") === category) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
});
