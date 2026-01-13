const APP_CONFIG = {
  adminUsername: "admin",
  adminPassword: "admin123",
  defaultCurrencies: ["SAR", "AED", "USD", "OMR"],
}

let platforms = []
let services = []
const cart = []
let currentCurrency = "SAR"
const orders = []

document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] App initializing...")
  loadAllData()
  initializeTheme()
  renderPlatforms()
  renderServices()
  setupEventListeners()
  updateCart()
  setupFilters()
  console.log("[v0] App initialized successfully")
})

function loadAllData() {
  const adminPlatforms = JSON.parse(localStorage.getItem("admin_platforms")) || getDefaultPlatforms()
  const adminServices = JSON.parse(localStorage.getItem("admin_services")) || getDefaultServices()
  const storedCurrency = localStorage.getItem("currency") || "SAR"

  platforms = adminPlatforms
  services = adminServices
  currentCurrency = storedCurrency

  console.log("[v0] Loaded platforms:", platforms.length, "services:", services.length)
}

function getDefaultPlatforms() {
  const defaultPlatforms = [
    { id: "p1", name: "TikTok", icon: "fa-tiktok", color: "#25F4EE" },
    { id: "p2", name: "Instagram", icon: "fa-instagram", color: "#E1306C" },
    { id: "p3", name: "Facebook", icon: "fa-facebook", color: "#1877F2" },
    { id: "p4", name: "YouTube", icon: "fa-youtube", color: "#FF0000" },
    { id: "p5", name: "Twitter", icon: "fa-twitter", color: "#1DA1F2" },
    { id: "p6", name: "LinkedIn", icon: "fa-linkedin", color: "#0A66C2" },
  ]
  localStorage.setItem("admin_platforms", JSON.stringify(defaultPlatforms))
  return defaultPlatforms
}

function getDefaultServices() {
  const defaultServices = [
    {
      id: "s1",
      name: "زيادة المتابعين",
      platformId: "p1",
      price: 50,
      currency: "SAR",
      description: "زيادة 1000 متابع حقيقيين",
    },
    {
      id: "s2",
      name: "زيادة الإعجابات",
      platformId: "p1",
      price: 30,
      currency: "SAR",
      description: "زيادة 500 إعجابة للمنشور",
    },
    {
      id: "s3",
      name: "زيادة المتابعين",
      platformId: "p2",
      price: 100,
      currency: "SAR",
      description: "زيادة 1000 متابع حقيقيين",
    },
    {
      id: "s4",
      name: "تعليقات عربية",
      platformId: "p2",
      price: 50,
      currency: "SAR",
      description: "إضافة 50 تعليق عربي",
    },
    {
      id: "s5",
      name: "مشاهدات الفيديو",
      platformId: "p3",
      price: 25,
      currency: "SAR",
      description: "إضافة 1000 مشاهدة للفيديو",
    },
  ]
  localStorage.setItem("admin_services", JSON.stringify(defaultServices))
  return defaultServices
}

function initializeTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark"
  if (savedTheme === "light") {
    document.body.classList.add("light-mode")
    updateThemeIcon()
  }

  const themeToggle = document.getElementById("theme-toggle")
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme)
  }
}

function toggleTheme() {
  document.body.classList.toggle("light-mode")
  const isDark = !document.body.classList.contains("light-mode")
  localStorage.setItem("theme", isDark ? "dark" : "light")
  updateThemeIcon()
  showNotification(isDark ? "تم التبديل إلى الوضع الداكن" : "تم التبديل إلى الوضع الفاتح")
}

function updateThemeIcon() {
  const icon = document.getElementById("theme-toggle")?.querySelector("i")
  if (icon) {
    const isDark = !document.body.classList.contains("light-mode")
    icon.className = isDark ? "fas fa-moon" : "fas fa-sun"
  }
}

function renderPlatforms() {
  const platformsGrid = document.getElementById("platforms-grid")
  if (!platformsGrid) return

  platformsGrid.innerHTML = platforms
    .map(
      (platform) => `
        <div class="platform-card" data-platform-id="${platform.id}">
            <div class="platform-icon" style="color: ${platform.color}">
                <i class="fab ${platform.icon}"></i>
            </div>
            <div class="platform-name">${platform.name}</div>
        </div>
    `,
    )
    .join("")

  console.log("[v0] Rendered platforms:", platforms.length)
}

function renderServices(filter = "all") {
  const servicesGrid = document.getElementById("services-grid")
  if (!servicesGrid) return

  let filteredServices = services

  if (filter !== "all") {
    filteredServices = services.filter((s) => s.platformId === filter)
  }

  servicesGrid.innerHTML = filteredServices
    .map((service) => {
      const platform = platforms.find((p) => p.id === service.platformId)
      return `
            <div class="service-card">
                <div class="service-image" style="color: ${platform?.color || "#ff9600"}">
                    <i class="fab ${platform?.icon || "fa-star"}"></i>
                </div>
                <div class="service-content">
                    <div class="service-header">
                        <h3 class="service-name">${service.name}</h3>
                        <p class="service-description">${service.description || "خدمة احترافية"}</p>
                        <span class="service-platform">${platform?.name || "خدمة"}</span>
                    </div>
                    <div class="service-footer">
                        <div class="service-price">
                            <span class="price-value">${service.price}</span>
                            <span class="service-currency">${service.currency}</span>
                        </div>
                        <button class="add-to-cart-btn" onclick="addToCart('${service.id}')">
                            <i class="fas fa-cart-plus"></i> أضف
                        </button>
                    </div>
                </div>
            </div>
        `
    })
    .join("")

  console.log("[v0] Rendered services:", filteredServices.length)
}

function setupFilters() {
  const filterContainer = document.getElementById("platform-filters")
  if (!filterContainer) return

  filterContainer.innerHTML = platforms
    .map((platform) => `<button class="filter-btn" data-filter="${platform.id}">${platform.name}</button>`)
    .join("")

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"))
      e.target.classList.add("active")
      renderServices(e.target.dataset.filter)
    })
  })
}

function addToCart(serviceId) {
  const service = services.find((s) => s.id === serviceId)
  if (!service) {
    showNotification("لم يتم العثور على الخدمة")
    return
  }

  const existingItem = cart.find((item) => item.id === serviceId)

  if (existingItem) {
    existingItem.quantity++
  } else {
    cart.push({
      ...service,
      quantity: 1,
      cartItemId: Date.now(),
    })
  }

  saveToStorage()
  updateCart()
  showNotification("تمت إضافة الخدمة للسلة")
  console.log("[v0] Item added to cart:", serviceId)
}

function removeFromCart(index) {
  const removedItem = cart[index]
  cart.splice(index, 1)
  saveToStorage()
  updateCart()
  showNotification("تمت إزالة الخدمة من السلة")
  console.log("[v0] Item removed from cart:", removedItem.name)
}

function updateCart() {
  const cartCount = document.getElementById("cart-count")
  if (cartCount) {
    cartCount.textContent = cart.length
  }
  renderCartItems()
}

function renderCartItems() {
  const cartItems = document.getElementById("cart-items")
  if (!cartItems) return

  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="empty-cart">السلة فارغة</div>'
    return
  }

  let total = 0
  cartItems.innerHTML = cart
    .map((item, index) => {
      const itemTotal = item.price * item.quantity
      total += itemTotal
      return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.quantity} × ${item.price} ${item.currency}</p>
                </div>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <span class="cart-item-price">${itemTotal} ${item.currency}</span>
                    <button class="remove-item" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `
    })
    .join("")

  const cartTotal = document.getElementById("cart-total")
  if (cartTotal) {
    cartTotal.textContent = `${total} ${currentCurrency}`
  }
}

function saveToStorage() {
  localStorage.setItem("cart", JSON.stringify(cart))
}

function setupEventListeners() {
  const cartModal = document.getElementById("cart-modal")
  const cartBtn = document.getElementById("cart-btn")
  const closeModal = document.querySelector(".close-modal")

  if (cartBtn) {
    cartBtn.addEventListener("click", (e) => {
      e.preventDefault()
      if (cartModal) cartModal.classList.add("active")
    })
  }

  if (closeModal) {
    closeModal.addEventListener("click", () => {
      if (cartModal) cartModal.classList.remove("active")
    })
  }

  if (cartModal) {
    cartModal.addEventListener("click", (e) => {
      if (e.target === cartModal) {
        cartModal.classList.remove("active")
      }
    })
  }

  const checkoutBtn = document.getElementById("checkout-btn")
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (cart.length === 0) {
        showNotification("السلة فارغة")
        return
      }
      localStorage.setItem("checkout_cart", JSON.stringify(cart))
      window.location.href = "checkout.html"
    })
  }

  const ctaButton = document.querySelector(".cta-button")
  if (ctaButton) {
    ctaButton.addEventListener("click", () => {
      const servicesSection = document.getElementById("services")
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: "smooth" })
      }
    })
  }
}

function showNotification(message) {
  const notification = document.createElement("div")
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
        color: var(--bg-dark);
        padding: 1rem 1.5rem;
        border-radius: 10px;
        font-weight: 700;
        z-index: 3000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 5px 20px rgba(255, 149, 0, 0.3);
  `
  notification.textContent = message
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-out"
    setTimeout(() => {
      notification.remove()
    }, 300)
  }, 3000)
}

console.log("[v0] App script loaded successfully")
