// Admin Configuration
const ADMIN_CONFIG = {
  adminUsername: "admin",
  adminPassword: "admin123",
  defaultCurrencies: ["SAR", "AED", "USD", "OMR"],
  defaultPlatforms: [
    { id: "platform_tiktok", name: "TikTok", icon: "fab fa-tiktok", color: "#25F4EE" },
    { id: "platform_instagram", name: "Instagram", icon: "fab fa-instagram", color: "#E4405F" },
    { id: "platform_facebook", name: "Facebook", icon: "fab fa-facebook", color: "#1877F2" },
    { id: "platform_youtube", name: "YouTube", icon: "fab fa-youtube", color: "#FF0000" },
    { id: "platform_twitter", name: "Twitter/X", icon: "fab fa-x-twitter", color: "#000000" },
    { id: "platform_linkedin", name: "LinkedIn", icon: "fab fa-linkedin", color: "#0A66C2" },
  ],
}

let adminSession = null
let editingServiceId = null
let editingProductId = null

document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] Admin initializing...")
  initializeTheme()
  checkAdminAuth()
  initializeEventListeners()
  loadDefaultData()
})

function initializeTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark"
  if (savedTheme === "light") {
    document.body.classList.add("light-mode")
  }

  const themeToggle = document.getElementById("theme-toggle")
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme)
  }
}

function toggleTheme() {
  document.body.classList.toggle("light-mode")
  const theme = document.body.classList.contains("light-mode") ? "light" : "dark"
  localStorage.setItem("theme", theme)
}

function loadDefaultData() {
  const platforms = JSON.parse(localStorage.getItem("admin_platforms")) || []
  if (platforms.length === 0) {
    localStorage.setItem("admin_platforms", JSON.stringify(ADMIN_CONFIG.defaultPlatforms))
    console.log("[v0] Default platforms loaded")
  }
}

function checkAdminAuth() {
  const session = localStorage.getItem("adminSession")
  if (session) {
    adminSession = session
    showAdminDashboard()
  } else {
    showLoginPage()
  }
}

function showLoginPage() {
  document.getElementById("login-page").classList.add("active")
  document.getElementById("admin-page").classList.remove("active")
}

function showAdminDashboard() {
  document.getElementById("login-page").classList.remove("active")
  document.getElementById("admin-page").classList.add("active")
  switchAdminPage("dashboard")
  loadDashboardData()
}

function initializeEventListeners() {
  const loginForm = document.getElementById("login-form")
  if (loginForm) {
    loginForm.addEventListener("submit", handleAdminLogin)
  }

  const logoutBtn = document.getElementById("logout-btn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault()
      handleAdminLogout()
    })
  }

  const menuLinks = document.querySelectorAll(".admin-menu-link")
  menuLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      if (link.id !== "logout-btn") {
        e.preventDefault()
        const page = link.getAttribute("data-page")
        if (page) {
          switchAdminPage(page)
        }
      }
    })
  })

  // Form submissions
  const serviceForm = document.getElementById("service-form")
  if (serviceForm) {
    serviceForm.addEventListener("submit", saveService)
  }

  const productForm = document.getElementById("product-form")
  if (productForm) {
    productForm.addEventListener("submit", saveProduct)
  }

  const platformForm = document.getElementById("platform-form")
  if (platformForm) {
    platformForm.addEventListener("submit", savePlatform)
  }

  const paymentForm = document.getElementById("payment-form")
  if (paymentForm) {
    paymentForm.addEventListener("submit", savePayment)
  }

  const settingsForm = document.getElementById("settings-form")
  if (settingsForm) {
    settingsForm.addEventListener("submit", saveSettings)
  }

  // Modal close buttons
  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal-overlay")
      if (modal) modal.classList.remove("active")
    })
  })

  // Close modals on overlay click
  document.querySelectorAll(".modal-overlay").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active")
      }
    })
  })
}

function handleAdminLogin(e) {
  e.preventDefault()
  const username = document.getElementById("username").value.trim()
  const password = document.getElementById("password").value.trim()

  if (username === ADMIN_CONFIG.adminUsername && password === ADMIN_CONFIG.adminPassword) {
    const sessionToken = "admin_" + Date.now() + "_" + Math.random().toString(36).substring(7)
    localStorage.setItem("adminSession", sessionToken)
    localStorage.setItem("adminLoginTime", new Date().toISOString())
    adminSession = sessionToken
    showAdminDashboard()
    showNotification("تم تسجيل الدخول بنجاح", "success")
  } else {
    showNotification("بيانات دخول غير صحيحة", "error")
  }
}

function handleAdminLogout() {
  if (confirm("هل تريد تسجيل الخروج؟")) {
    localStorage.removeItem("adminSession")
    localStorage.removeItem("adminLoginTime")
    adminSession = null
    location.reload()
  }
}

function switchAdminPage(page) {
  console.log("[v0] Switching to page:", page)

  // Update menu active state
  document.querySelectorAll(".admin-menu-link").forEach((link) => {
    const linkPage = link.getAttribute("data-page")
    if (linkPage === page) {
      link.classList.add("active")
    } else {
      link.classList.remove("active")
    }
  })

  // Hide all pages then show selected page
  document.querySelectorAll(".admin-page").forEach((p) => {
    p.classList.remove("active")
  })

  const targetPage = document.getElementById(page + "-page")
  if (targetPage) {
    targetPage.classList.add("active")
    console.log("[v0] Page displayed:", page + "-page")
  }

  // Load data for the page
  if (page === "dashboard") loadDashboardData()
  if (page === "orders") loadOrders()
  if (page === "products") loadProducts()
  if (page === "services") loadServices()
  if (page === "platforms") loadPlatforms()
  if (page === "payments") loadPaymentMethods()
  if (page === "contact") loadContactMessages()
  if (page === "settings") loadSettingsForm()
}

function loadDashboardData() {
  const orders = JSON.parse(localStorage.getItem("admin_orders")) || []
  const services = JSON.parse(localStorage.getItem("admin_services")) || []
  const platforms = JSON.parse(localStorage.getItem("admin_platforms")) || []
  const products = JSON.parse(localStorage.getItem("admin_products")) || []

  document.getElementById("stat-orders").textContent = orders.length
  document.getElementById("stat-services").textContent = services.length
  document.getElementById("stat-platforms").textContent = platforms.length
  document.getElementById("stat-products").textContent = products.length
}

// ===== SERVICES MANAGEMENT =====
function openServiceModal(serviceId = null) {
  editingServiceId = serviceId
  const form = document.getElementById("service-form")
  form.reset()

  if (serviceId) {
    const services = JSON.parse(localStorage.getItem("admin_services")) || []
    const service = services.find((s) => s.id === serviceId)
    if (service) {
      document.getElementById("service-name").value = service.name
      document.getElementById("service-platform").value = service.platformId
      document.getElementById("service-price").value = service.price
      document.getElementById("service-currency").value = service.currency
      document.getElementById("service-description").value = service.description
    }
  }

  loadPlatformsForSelect()
  document.getElementById("service-modal").classList.add("active")
}

function saveService(e) {
  e.preventDefault()

  const service = {
    id: editingServiceId || "service_" + Date.now(),
    name: document.getElementById("service-name").value,
    platformId: document.getElementById("service-platform").value,
    price: Number.parseFloat(document.getElementById("service-price").value),
    currency: document.getElementById("service-currency").value,
    description: document.getElementById("service-description").value,
    createdAt: new Date().toISOString(),
  }

  let services = JSON.parse(localStorage.getItem("admin_services")) || []

  if (editingServiceId) {
    services = services.map((s) => (s.id === editingServiceId ? service : s))
    showNotification("تم تحديث الخدمة بنجاح", "success")
  } else {
    services.push(service)
    showNotification("تم إضافة الخدمة بنجاح", "success")
  }

  localStorage.setItem("admin_services", JSON.stringify(services))
  closeModal("service-modal")
  loadServices()
  loadDashboardData()
  editingServiceId = null
}

function loadServices() {
  const services = JSON.parse(localStorage.getItem("admin_services")) || []
  const platforms = JSON.parse(localStorage.getItem("admin_platforms")) || []
  const tbody = document.getElementById("services-table-body")
  tbody.innerHTML = ""

  if (services.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">لا توجد خدمات</td></tr>'
    return
  }

  services.forEach((service) => {
    const platform = platforms.find((p) => p.id === service.platformId)
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${service.name}</td>
      <td>${platform ? platform.name : "غير محدد"}</td>
      <td>${service.price} ${service.currency}</td>
      <td>${service.description || "-"}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-small btn-edit" onclick="openServiceModal('${service.id}')">
            <i class="fas fa-edit"></i> تعديل
          </button>
          <button class="btn-small btn-delete" onclick="deleteService('${service.id}')">
            <i class="fas fa-trash"></i> حذف
          </button>
        </div>
      </td>
    `
    tbody.appendChild(row)
  })
}

function deleteService(serviceId) {
  if (confirm("هل تريد حذف هذه الخدمة؟")) {
    let services = JSON.parse(localStorage.getItem("admin_services")) || []
    services = services.filter((s) => s.id !== serviceId)
    localStorage.setItem("admin_services", JSON.stringify(services))
    loadServices()
    loadDashboardData()
    showNotification("تم حذف الخدمة", "success")
  }
}

// ===== PRODUCTS MANAGEMENT =====
function openProductModal(productId = null) {
  editingProductId = productId
  const form = document.getElementById("product-form")
  form.reset()

  if (productId) {
    const products = JSON.parse(localStorage.getItem("admin_products")) || []
    const product = products.find((p) => p.id === productId)
    if (product) {
      document.getElementById("product-name").value = product.name
      document.getElementById("product-price").value = product.price
      document.getElementById("product-currency").value = product.currency
      document.getElementById("product-stock").value = product.stock
      document.getElementById("product-category").value = product.category
      document.getElementById("product-description").value = product.description
      if (product.image) {
        document.getElementById("product-image-preview").src = product.image
        document.getElementById("product-image-preview").style.display = "block"
      }
    }
  }

  document.getElementById("product-modal").classList.add("active")
}

function saveProduct(e) {
  e.preventDefault()

  const imageInput = document.getElementById("product-image")
  const reader = new FileReader()

  reader.onload = (event) => {
    const product = {
      id: editingProductId || "product_" + Date.now(),
      name: document.getElementById("product-name").value,
      price: Number.parseFloat(document.getElementById("product-price").value),
      currency: document.getElementById("product-currency").value,
      stock: Number.parseInt(document.getElementById("product-stock").value),
      category: document.getElementById("product-category").value,
      description: document.getElementById("product-description").value,
      image: event.target.result || (editingProductId ? document.getElementById("product-image-preview").src : ""),
      createdAt: new Date().toISOString(),
    }

    let products = JSON.parse(localStorage.getItem("admin_products")) || []

    if (editingProductId) {
      products = products.map((p) => (p.id === editingProductId ? product : p))
      showNotification("تم تحديث المنتج بنجاح", "success")
    } else {
      products.push(product)
      showNotification("تم إضافة المنتج بنجاح", "success")
    }

    localStorage.setItem("admin_products", JSON.stringify(products))
    closeModal("product-modal")
    loadProducts()
    loadDashboardData()
    editingProductId = null
  }

  if (imageInput.files.length > 0) {
    reader.readAsDataURL(imageInput.files[0])
  } else {
    reader.onload({ target: { result: "" } })
  }
}

function loadProducts() {
  const products = JSON.parse(localStorage.getItem("admin_products")) || []
  const tbody = document.getElementById("products-table-body")
  tbody.innerHTML = ""

  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">لا توجد منتجات</td></tr>'
    return
  }

  products.forEach((product) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td><img src="${product.image}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;"></td>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${product.price} ${product.currency}</td>
      <td>${product.stock}</td>
      <td>${product.description || "-"}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-small btn-edit" onclick="openProductModal('${product.id}')">
            <i class="fas fa-edit"></i> تعديل
          </button>
          <button class="btn-small btn-delete" onclick="deleteProduct('${product.id}')">
            <i class="fas fa-trash"></i> حذف
          </button>
        </div>
      </td>
    `
    tbody.appendChild(row)
  })
}

function deleteProduct(productId) {
  if (confirm("هل تريد حذف هذا المنتج؟")) {
    let products = JSON.parse(localStorage.getItem("admin_products")) || []
    products = products.filter((p) => p.id !== productId)
    localStorage.setItem("admin_products", JSON.stringify(products))
    loadProducts()
    loadDashboardData()
    showNotification("تم حذف المنتج", "success")
  }
}

// ===== PLATFORMS MANAGEMENT =====
function openPlatformModal() {
  document.getElementById("platform-form").reset()
  document.getElementById("platform-modal").classList.add("active")
}

function savePlatform(e) {
  e.preventDefault()

  const platform = {
    id: "platform_" + Date.now(),
    name: document.getElementById("platform-name").value,
    icon: document.getElementById("platform-icon").value,
    color: document.getElementById("platform-color").value,
    createdAt: new Date().toISOString(),
  }

  const platforms = JSON.parse(localStorage.getItem("admin_platforms")) || []
  platforms.push(platform)
  localStorage.setItem("admin_platforms", JSON.stringify(platforms))

  closeModal("platform-modal")
  loadPlatforms()
  loadPlatformsForSelect()
  loadDashboardData()
  showNotification("تم إضافة المنصة بنجاح", "success")
}

function loadPlatformsForSelect() {
  const platforms = JSON.parse(localStorage.getItem("admin_platforms")) || []
  const select = document.getElementById("service-platform")
  select.innerHTML = '<option value="">اختر منصة</option>'
  platforms.forEach((p) => {
    const option = document.createElement("option")
    option.value = p.id
    option.textContent = p.name
    select.appendChild(option)
  })
}

function loadPlatforms() {
  const platforms = JSON.parse(localStorage.getItem("admin_platforms")) || []
  const tbody = document.getElementById("platforms-table-body")
  tbody.innerHTML = ""

  if (platforms.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;">لا توجد منصات</td></tr>'
    return
  }

  platforms.forEach((platform) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${platform.name}</td>
      <td><i class="fas ${platform.icon}"></i> ${platform.icon}</td>
      <td><div style="width: 30px; height: 30px; background: ${platform.color}; border-radius: 6px; border: 1px solid var(--border-color);"></div></td>
      <td>
        <div class="action-buttons">
          <button class="btn-small btn-delete" onclick="deletePlatform('${platform.id}')">
            <i class="fas fa-trash"></i> حذف
          </button>
        </div>
      </td>
    `
    tbody.appendChild(row)
  })
}

function deletePlatform(platformId) {
  if (confirm("حذف هذه المنصة سيحذف جميع الخدمات المرتبطة بها. هل تريد المتابعة؟")) {
    let platforms = JSON.parse(localStorage.getItem("admin_platforms")) || []
    let services = JSON.parse(localStorage.getItem("admin_services")) || []

    platforms = platforms.filter((p) => p.id !== platformId)
    services = services.filter((s) => s.platformId !== platformId)

    localStorage.setItem("admin_platforms", JSON.stringify(platforms))
    localStorage.setItem("admin_services", JSON.stringify(services))
    loadPlatforms()
    loadServices()
    loadDashboardData()
    showNotification("تم حذف المنصة والخدمات المرتبطة بها", "success")
  }
}

// ===== ORDERS MANAGEMENT =====
function loadOrders() {
  const orders = JSON.parse(localStorage.getItem("admin_orders")) || []
  const tbody = document.getElementById("orders-table-body")
  tbody.innerHTML = ""

  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">لا توجد طلبات</td></tr>'
    return
  }

  orders.forEach((order) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>#${order.id.substring(0, 8)}</td>
      <td>${order.customerName}</td>
      <td>${order.total} ${order.currency}</td>
      <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
      <td>${new Date(order.date).toLocaleDateString("ar-SA")}</td>
      <td>${order.paymentMethod}</td>
      <td>
        <div class="action-buttons">
          ${
            order.status === "pending"
              ? `
            <button class="btn-small btn-approve" onclick="updateOrderStatus('${order.id}', 'approved')">
              <i class="fas fa-check"></i> موافق
            </button>
            <button class="btn-small btn-reject" onclick="updateOrderStatus('${order.id}', 'rejected')">
              <i class="fas fa-times"></i> رفض
            </button>
          `
              : ""
          }
          <button class="btn-small btn-delete" onclick="deleteOrder('${order.id}')">
            <i class="fas fa-trash"></i> حذف
          </button>
        </div>
      </td>
    `
    tbody.appendChild(row)
  })
}

function getStatusText(status) {
  const statusMap = {
    pending: "في الانتظار",
    approved: "موافق عليه",
    rejected: "مرفوض",
  }
  return statusMap[status] || status
}

function updateOrderStatus(orderId, newStatus) {
  const orders = JSON.parse(localStorage.getItem("admin_orders")) || []
  const order = orders.find((o) => o.id === orderId)

  if (order) {
    order.status = newStatus
    localStorage.setItem("admin_orders", JSON.stringify(orders))
    loadOrders()
    loadDashboardData()
    showNotification(`تم ${newStatus === "approved" ? "الموافقة على" : "رفض"} الطلب`, "success")
  }
}

function deleteOrder(orderId) {
  if (confirm("هل تريد حذف هذا الطلب؟")) {
    let orders = JSON.parse(localStorage.getItem("admin_orders")) || []
    orders = orders.filter((o) => o.id !== orderId)
    localStorage.setItem("admin_orders", JSON.stringify(orders))
    loadOrders()
    loadDashboardData()
    showNotification("تم حذف الطلب", "success")
  }
}

// ===== PAYMENT METHODS MANAGEMENT =====
function openPaymentModal() {
  document.getElementById("payment-form").reset()
  document.getElementById("payment-modal").classList.add("active")
}

function savePayment(e) {
  e.preventDefault()

  const payment = {
    id: "payment_" + Date.now(),
    name: document.getElementById("payment-name").value,
    code: document.getElementById("payment-code").value,
    type: document.getElementById("payment-type").value,
    info: document.getElementById("payment-info").value,
    createdAt: new Date().toISOString(),
  }

  const payments = JSON.parse(localStorage.getItem("admin_payments")) || []
  payments.push(payment)
  localStorage.setItem("admin_payments", JSON.stringify(payments))

  closeModal("payment-modal")
  loadPaymentMethods()
  showNotification("تم إضافة طريقة الدفع بنجاح", "success")
}

function loadPaymentMethods() {
  const payments = JSON.parse(localStorage.getItem("admin_payments")) || []
  const tbody = document.getElementById("payments-table-body")
  tbody.innerHTML = ""

  if (payments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">لا توجد طرق دفع</td></tr>'
    return
  }

  payments.forEach((payment) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${payment.name}</td>
      <td><code style="background: rgba(255, 149, 0, 0.1); padding: 0.3rem 0.6rem; border-radius: 4px;">${payment.code}</code></td>
      <td>${payment.type}</td>
      <td>${payment.info || "-"}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-small btn-delete" onclick="deletePayment('${payment.id}')">
            <i class="fas fa-trash"></i> حذف
          </button>
        </div>
      </td>
    `
    tbody.appendChild(row)
  })
}

function deletePayment(paymentId) {
  if (confirm("هل تريد حذف هذه الطريقة؟")) {
    let payments = JSON.parse(localStorage.getItem("admin_payments")) || []
    payments = payments.filter((p) => p.id !== paymentId)
    localStorage.setItem("admin_payments", JSON.stringify(payments))
    loadPaymentMethods()
    showNotification("تم حذف طريقة الدفع", "success")
  }
}

// ===== CONTACT MESSAGES =====
function loadContactMessages() {
  const messages = JSON.parse(localStorage.getItem("contact_messages")) || []
  const tbody = document.getElementById("contact-table-body")
  tbody.innerHTML = ""

  if (messages.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">لا توجد رسائل</td></tr>'
    return
  }

  messages.forEach((msg) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${msg.name}</td>
      <td>${msg.email}</td>
      <td><small>${msg.message.substring(0, 40)}...</small></td>
      <td>${new Date(msg.date).toLocaleDateString("ar-SA")}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-small btn-edit" onclick="viewMessage('${msg.id}')">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn-small btn-delete" onclick="deleteMessage('${msg.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `
    tbody.appendChild(row)
  })
}

function viewMessage(messageId) {
  const messages = JSON.parse(localStorage.getItem("contact_messages")) || []
  const msg = messages.find((m) => m.id === messageId)
  if (msg) {
    alert(`من: ${msg.name}\nالبريد: ${msg.email}\n\nالرسالة:\n${msg.message}`)
  }
}

function deleteMessage(messageId) {
  if (confirm("هل تريد حذف هذه الرسالة؟")) {
    let messages = JSON.parse(localStorage.getItem("contact_messages")) || []
    messages = messages.filter((m) => m.id !== messageId)
    localStorage.setItem("contact_messages", JSON.stringify(messages))
    loadContactMessages()
    showNotification("تم حذف الرسالة", "success")
  }
}

// ===== SETTINGS =====
function loadSettingsForm() {
  const settings = JSON.parse(localStorage.getItem("store_settings")) || {}
  document.getElementById("whatsapp-link").value = settings.whatsapp || ""
  document.getElementById("telegram-link").value = settings.telegram || ""
  document.getElementById("email-link").value = settings.email || ""
  document.getElementById("instagram-link").value = settings.instagram || ""
  document.getElementById("store-name").value = settings.storeName || ""
  document.getElementById("store-description").value = settings.storeDescription || ""
}

function saveSettings(e) {
  e.preventDefault()

  const settings = {
    whatsapp: document.getElementById("whatsapp-link").value,
    telegram: document.getElementById("telegram-link").value,
    email: document.getElementById("email-link").value,
    instagram: document.getElementById("instagram-link").value,
    storeName: document.getElementById("store-name").value,
    storeDescription: document.getElementById("store-description").value,
  }

  localStorage.setItem("store_settings", JSON.stringify(settings))
  showNotification("تم حفظ الإعدادات بنجاح", "success")
}

// ===== UTILITIES =====
function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.classList.remove("active")
  }
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.innerHTML = `<strong>${type === "success" ? "✓" : "✕"}</strong> ${message}`
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.remove()
  }, 3000)
}

document.addEventListener("DOMContentLoaded", () => {
  const productImageInput = document.getElementById("product-image")
  if (productImageInput) {
    productImageInput.addEventListener("change", (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const preview = document.getElementById("product-image-preview")
          if (preview) {
            preview.src = event.target.result
            preview.style.display = "block"
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }
})

console.log("[v0] Admin script loaded successfully")
