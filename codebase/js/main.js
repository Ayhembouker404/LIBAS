/* ==========================================================================
   main.js — product data, rendering, filtering, navigation, reveal animations
   ========================================================================== */

/* ---------- Product Catalog ---------- */
/* Replace the `image` paths with your own files in assets/images/ */
const PRODUCTS = [
  {
    id: "p01",
    title: "57.60 Carats Natural Lemon Quartz",
    category: "gems",
    tags: ["gems",],
    price: 1705,
    image: "assets/images/NaturalLemonQuartz1.jpg",
  },
    {
    id: "p02",
    title: "4 Carats Oval Cut Natural Umbalite Garnet",
    category: "gems",
    tags: ["gems",],
    price: 2439,
    image: "assets/images/NaturalUmbaliteGarnet.jpg",
  },
    {
    id: "p03",
    title: "19.70 Carats Natural Ametrine(Pair)",
    category: "gems",
    tags: ["gems",],
    price: 4003,
    image: "assets/images/NaturalAmetrine.jpg",
  },
    {
    id: "p04",
    title: "11.50 Carats Natural Rutile Green Peridot",
    category: "gems",
    tags: ["gems",],
    price: 7009,
    image: "assets/images/NaturalRutileGreenPeridot.jpg",
  },


];

/* 
  {
    id: "p01",
    title: "The Aldridge Wool Coat",
    category: "clothing",
    tags: ["clothing", "new"],
    price: 890,
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "p02",
    title: "Signet Ring, 18K Vermeil",
    category: "jewelry",
    tags: ["jewelry", "new"],
    price: 340,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "p03",
    title: "Cambridge Merino Sweater Vest",
    category: "clothing",
    tags: ["clothing"],
    price: 265,
    image: "https://images.unsplash.com/photo-1614251055880-ee96e4803393?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "p04",
    title: "Heirloom Pearl Drop Earrings",
    category: "jewelry",
    tags: ["jewelry"],
    price: 410,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "p05",
    title: "The Hartley Silk Trousers",
    category: "clothing",
    tags: ["clothing"],
    price: 375,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "p06",
    title: "Oak Leaf Gold Cufflinks",
    category: "jewelry",
    tags: ["jewelry", "new"],
    price: 220,
    image: "https://images.unsplash.com/photo-1620656798932-89039a89d94a?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "p07",
    title: "The Whitmore Tweed Blazer",
    category: "clothing",
    tags: ["clothing", "new"],
    price: 720,
    image: "https://images.unsplash.com/photo-1600091166971-7f9faad6c1e2?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "p08",
    title: "Vintage Rope Chain Necklace",
    category: "jewelry",
    tags: ["jewelry"],
    price: 495,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
  },

Expose to cart.js */
window.PRODUCTS = PRODUCTS;

const formatPrice = (n) =>
  "¥" + n.toLocaleString("cn-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ---------- Render Product Grid ---------- */
const productGrid = document.getElementById("productGrid");

function renderProducts(filter = "all") {
  const list =
    filter === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.tags.includes(filter));

  productGrid.innerHTML = list
    .map(
      (p) => `
    <div class="product-card reveal is-visible" data-id="${p.id}">
      <div class="product-media">
        ${p.tags.includes("new") ? '<span class="product-tag">New Arrival</span>' : ""}
        <img src="${p.image}" alt="${p.title}" loading="lazy" />
      </div>
      <div class="product-info">
        <span class="product-category">${p.category}</span>
        <h3 class="product-title">${p.title}</h3>
        <span class="product-price">${formatPrice(p.price)}</span>
        <button class="add-to-bag" data-id="${p.id}">Add to Bag</button>
      </div>
    </div>
  `
    )
    .join("");
}

renderProducts();

/* ---------- Filter Bar ---------- */
const filterButtons = document.querySelectorAll(".filter-btn");
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderProducts(btn.dataset.filter);
  });
});

/* ---------- Sticky Header on Scroll ---------- */
const siteHeader = document.getElementById("siteHeader");
window.addEventListener("scroll", () => {
  siteHeader.classList.toggle("scrolled", window.scrollY > 40);
});

/* ---------- Mobile Nav Toggle ---------- */
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navLinks.classList.toggle("active");
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navLinks.classList.remove("active");
  });
});

/* ---------- Scroll Reveal Animations ---------- */
const revealEls = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
revealEls.forEach((el) => revealObserver.observe(el));

/* ---------- Newsletter Form (demo only — wire to EmailJS/Mailchimp as needed) ---------- */
const newsletterForm = document.getElementById("newsletterForm");
newsletterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  showToast("Thank you — you're on the list.");
  newsletterForm.reset();
});

/* ---------- Toast Helper (shared with cart.js) ---------- */
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("active");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("active"), 3200);
}
window.showToast = showToast;
