/* ==========================================================================
   cart.js — cart state, drawer UI, checkout modal, order email submission
   ========================================================================== */

/* =========================================================================
   1. EMAILJS CONFIG
   Sign up free at https://www.emailjs.com, create an Email Service + Template,
   then paste your IDs below. See README.md for full step-by-step setup.
   ========================================================================= */
const EMAILJS_CONFIG = {
  PUBLIC_KEY: "fyfR4zx5j3hO6dPKm",
  SERVICE_ID: "service_LIBAS",
  TEMPLATE_ID: "template_order",
};

/* If true, orders are also POSTed to the Node/Nodemailer backend in /backend
   (useful if you'd rather not expose EmailJS keys client-side).
   Set to true only once backend/server.js is deployed and reachable. */
const USE_BACKEND_API = true;
const BACKEND_ENDPOINT = "http://localhost:3000/api/order";

/* Initialize EmailJS (safe no-op if the library hasn't loaded / not configured yet) */
if (window.emailjs && EMAILJS_CONFIG.PUBLIC_KEY !== "fyfR4zx5j3hO6dPKm") {
  emailjs.init({ publicKey: EMAILJS_CONFIG.PUBLIC_KEY });
}

/* ---------- Cart State ---------- */
let cart = JSON.parse(localStorage.getItem("aureumCart") || "[]");

function saveCart() {
  localStorage.setItem("aureumCart", JSON.stringify(cart));
}

function getProduct(id) {
  return window.PRODUCTS.find((p) => p.id === id);
}

function addToCart(id) {
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }
  saveCart();
  renderCart();
  openCart();
  const product = getProduct(id);
  if (product) window.showToast(`${product.title} added to your bag.`);
}

function updateQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((i) => i.id !== id);
  }
  saveCart();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter((i) => i.id !== id);
  saveCart();
  renderCart();
}

function cartTotal() {
  return cart.reduce((sum, item) => {
    const product = getProduct(item.id);
    return product ? sum + product.price * item.qty : sum;
  }, 0);
}

function cartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

const formatPrice2 = (n) =>
  "¥" + n.toLocaleString("cn-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ---------- Render Cart Drawer ---------- */
const cartItemsEl = document.getElementById("cartItems");
const cartSubtotalEl = document.getElementById("cartSubtotal");
const cartCountEl = document.getElementById("cartCount");

function renderCart() {
  cartCountEl.textContent = cartCount();

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p class="cart-empty">Your bag is empty.</p>`;
    cartSubtotalEl.textContent = formatPrice2(0);
    return;
  }

  cartItemsEl.innerHTML = cart
    .map((item) => {
      const product = getProduct(item.id);
      if (!product) return "";
      return `
      <div class="cart-item" data-id="${product.id}">
        <img src="${product.image}" alt="${product.title}" />
        <div class="cart-item-info">
          <h4>${product.title}</h4>
          <div class="item-price">${formatPrice2(product.price)}</div>
          <div class="qty-control">
            <button class="qty-minus" data-id="${product.id}">–</button>
            <span>${item.qty}</span>
            <button class="qty-plus" data-id="${product.id}">+</button>
          </div>
        </div>
        <button class="remove-item" data-id="${product.id}">Remove</button>
      </div>`;
    })
    .join("");

  cartSubtotalEl.textContent = formatPrice2(cartTotal());
}

cartItemsEl.addEventListener("click", (e) => {
  const id = e.target.dataset.id;
  if (!id) return;
  if (e.target.classList.contains("qty-plus")) updateQty(id, 1);
  if (e.target.classList.contains("qty-minus")) updateQty(id, -1);
  if (e.target.classList.contains("remove-item")) removeItem(id);
});

/* ---------- Add to Bag (event delegation on product grid) ---------- */
document.getElementById("productGrid").addEventListener("click", (e) => {
  if (e.target.classList.contains("add-to-bag")) {
    addToCart(e.target.dataset.id);
  }
});

/* ---------- Drawer Open / Close ---------- */
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const cartToggle = document.getElementById("cartToggle");
const closeCart = document.getElementById("closeCart");

function openCart() {
  cartDrawer.classList.add("active");
  overlay.classList.add("active");
}
function closeCartDrawer() {
  cartDrawer.classList.remove("active");
  if (!checkoutModal.classList.contains("active")) overlay.classList.remove("active");
}

cartToggle.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartDrawer);
overlay.addEventListener("click", () => {
  closeCartDrawer();
  closeCheckoutModal();
});

/* ---------- Checkout Modal ---------- */
const checkoutModal = document.getElementById("checkoutModal");
const checkoutBtn = document.getElementById("checkoutBtn");
const modalClose = document.getElementById("modalClose");
const modalBackdrop = document.getElementById("modalBackdrop");
const orderSummaryMini = document.getElementById("orderSummaryMini");
const checkoutForm = document.getElementById("checkoutForm");
const formStatus = document.getElementById("formStatus");
const submitLabel = document.getElementById("submitLabel");

function openCheckoutModal() {
  if (cart.length === 0) {
    window.showToast("Your bag is empty.");
    return;
  }
  renderOrderSummary();
  checkoutModal.classList.add("active");
  overlay.classList.add("active");
}

function closeCheckoutModal() {
  checkoutModal.classList.remove("active");
  if (!cartDrawer.classList.contains("active")) overlay.classList.remove("active");
}

function renderOrderSummary() {
  const rows = cart
    .map((item) => {
      const product = getProduct(item.id);
      return `<div class="row"><span>${product.title} × ${item.qty}</span><span>${formatPrice2(
        product.price * item.qty
      )}</span></div>`;
    })
    .join("");
  orderSummaryMini.innerHTML = `
    ${rows}
    <div class="row total"><span>Total</span><span>${formatPrice2(cartTotal())}</span></div>
  `;
}

checkoutBtn.addEventListener("click", openCheckoutModal);
modalClose.addEventListener("click", closeCheckoutModal);
modalBackdrop.addEventListener("click", closeCheckoutModal);

/* ---------- Handle Order Submission ---------- */
checkoutForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  formStatus.textContent = "";
  formStatus.className = "form-status";
  submitLabel.textContent = "Sending...";

  const orderLines = cart
    .map((item) => {
      const product = getProduct(item.id);
      return `${product.title} (x${item.qty}) — ${formatPrice2(product.price * item.qty)}`;
    })
    .join("\n");

  const orderData = {
    customer_name: document.getElementById("custName").value,
    customer_email: document.getElementById("custEmail").value,
    shipping_address: document.getElementById("custAddress").value,
    order_notes: document.getElementById("custNotes").value || "None",
    order_items: orderLines,
    order_total: formatPrice2(cartTotal()),
    order_date: new Date().toLocaleString(),
  };

  try {
    if (USE_BACKEND_API) {
      /* --- Option A: send via your own Node/Nodemailer backend --- */
      const res = await fetch(BACKEND_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) throw new Error("Backend request failed");
    } else {
      /* --- Option B: send via EmailJS directly from the browser --- */
      if (!window.emailjs || EMAILJS_CONFIG.PUBLIC_KEY === "fyfR4zx5j3hO6dPKm") {
        throw new Error("EmailJS is not configured yet. See README.md setup steps.");
      }
      await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, orderData);
    }

    formStatus.textContent = "Order received — a confirmation has been sent to our team.";
    formStatus.classList.add("success");
    cart = [];
    saveCart();
    renderCart();
    checkoutForm.reset();

    setTimeout(() => {
      closeCheckoutModal();
      closeCartDrawer();
      window.showToast("Thank you for your order.");
      formStatus.textContent = "";
    }, 1800);
  } catch (err) {
    console.error(err);
    formStatus.textContent = err.message || "Something went wrong. Please try again.";
    formStatus.classList.add("error");
  } finally {
    submitLabel.textContent = "Confirm & Send Order";
  }
});

/* ---------- Init ---------- */
renderCart();
