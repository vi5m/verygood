// Admin Configuration & Data Management
const ADMIN_CONFIG = {
  adminUsername: "admin",
  adminPassword: "admin123",
  defaultCurrencies: ["SAR", "AED", "USD", "OMR"],
}

let adminSession = null
let editingServiceId = null
let editingProductId = null

// Initialize admin panel on page load
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] Admin panel loading...")
  initializeTheme()
  checkAdminAuth()
  initializeEventListeners()
  console.log("[v0] Admin panel initialized successfully")
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
  const loginPage = document.getElementById("login-page")
  const adminPage = document.getElementById("admin-page")

  if (loginPage) loginPage.classList.add("active")
  if (adminPage) adminPage.classList.remove("active")
}

function showAdminDashboard() {
  const loginPage = document.getElementById("login-page")
  const adminPage = document.getElementById("admin-page")

  if (loginPage) loginPage.classList.remove("active")
  if (adminPage) adminPage.classList.add("active")

  loadDashboardData()
  switchAdminPage("dashboard")
}

function initializeEventListeners() {
  // Login form
  const loginForm = document.getElementById("login-form")
  if (loginForm) {
    loginForm.addEventListener("submit", handleAdminLogin)
  }

  // Logout button
  const logoutBtn = document.getElementById("logout-btn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleAdminLogout)
  }

  // Menu links - fixed menu link event listeners
  document.querySelectorAll(".admin-menu-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const page = link.getAttribute("data-page")
      console.log("[v0] Switching to page:", page)
      switchAdminPage(page)
    })
  })

  // Modal close on overlay click
  document.querySelectorAll(".modal-overlay").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active")
      }
    })
  })

  // Forms
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

  const productImageInput = document.getElementById("product-image")
  if (productImageInput) {
    productImageInput.addEventListener("change", previewProductImage)
  }

  initializeDefaultData()
}

// Login Handler
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
  console.log("[v0] Switching page to:", page)

  // Update menu active state
  document.querySelectorAll(".admin-menu-link").forEach((link) => {
    link.classList.remove("active")
    if (link.getAttribute("data-page") === page) {
      link.classList.add("active")
    }
  })

  // Hide all pages
  document.querySelectorAll(".admin-page").forEach((p) => {
    p.classList.remove("active")
  })

  // Show target page
  const targetPage = document.getElementById(page + "-page")
  if (targetPage) {
    targetPage.classList.add("active")
    console.log("[v0] Page displayed:", page + "-page")
  } else {
    console.error("[v0] Page not found:", page + "-page")
  }

  // Load data for specific pages
  if (page === "dashboard") loadDashboardData()
  if (page === "orders") loadOrders()
  if (page === "products") loadProducts()
  if (page === "services") loadServices()
  if (page === "platforms") loadPlatforms()
  if (page === "payments") loadPaymentMethods()
  if (page === "contact") loadContactMessages()
  if (page === "settings") loadSettingsForm()
}

// Dashboard Data
function loadDashboardData() {
  const orders = JSON.parse(localStorage.getItem("admin_orders")) || []
  const services = JSON.parse(localStorage.getItem("admin_services")) || []
  const platforms = JSON.parse(localStorage.getItem("admin_platforms")) || []
  const products = JSON.parse(localStorage.getItem("admin_products")) || []

  const statOrders = document.getElementById("stat-orders")
  const statServices = document.getElementById("stat-services")
  const statPlatforms = document.getElementById("stat-platforms")
  const statPending = document.getElementById("stat-pending")

  if (statOrders) statOrders.textContent = orders.length
  if (statServices) statServices.textContent = services.length
  if (statPlatforms) statPlatforms.textContent = platforms.length
  if (statPending) statPending.textContent = orders.filter((o) => o.status === "pending").length
}

// Services Management
function openServiceModal(serviceId = null) {
  editingServiceId = serviceId
  const form = document.getElementById("service-form")
  if (!form) return

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
  const modal = document.getElementById("service-modal")
  if (modal) modal.classList.add("active")
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
  if (!tbody) return

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
    showNotification("تم حذف الخدمة بنجاح", "success")
    loadServices()
    loadDashboardData()
  }
}

function loadPlatformsForSelect() {
  const platforms = JSON.parse(localStorage.getItem("admin_platforms")) || []
  const select = document.getElementById("service-platform")
  if (!select) return

  select.innerHTML = '<option value="">اختر منصة</option>'
  platforms.forEach((platform) => {
    const option = document.createElement("option")
    option.value = platform.id
    option.textContent = platform.name
    select.appendChild(option)
  })
}

// Orders Management
function loadOrders() {
  const orders = JSON.parse(localStorage.getItem("admin_orders")) || []
  const tbody = document.getElementById("orders-table-body")
  if (!tbody) return

  tbody.innerHTML = ""

  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">لا توجد طلبات</td></tr>'
    return
  }

  orders.forEach((order) => {
    const statusClass = order.status === "approved" ? "success" : order.status === "rejected" ? "danger" : "warning"
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>#${order.id.substring(0, 8)}</td>
      <td>${order.customerName}</td>
      <td>${order.total}</td>
      <td>${order.currency}</td>
      <td><span class="status-badge ${statusClass}">${getStatusText(order.status)}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn-small btn-approve" onclick="updateOrderStatus('${order.id}', 'approved')" ${order.status !== "pending" ? "disabled" : ""}>
            <i class="fas fa-check"></i> موافقة
          </button>
          <button class="btn-small btn-reject" onclick="updateOrderStatus('${order.id}', 'rejected')" ${order.status !== "pending" ? "disabled" : ""}>
            <i class="fas fa-times"></i> رفض
          </button>
          <button class="btn-small btn-delete" onclick="deleteOrder('${order.id}')">
            <i class="fas fa-trash"></i> حذف
          </button>
        </div>
      </td>
    `
    tbody.appendChild(row)
  })
}

function updateOrderStatus(orderId, status) {
  let orders = JSON.parse(localStorage.getItem("admin_orders")) || []
  orders = orders.map((o) => (o.id === orderId ? { ...o, status } : o))
  localStorage.setItem("admin_orders", JSON.stringify(orders))
  showNotification(`تم تحديث حالة الطلب إلى ${getStatusText(status)}`, "success")
  loadOrders()
  loadDashboardData()
}

function deleteOrder(orderId) {
  if (confirm("هل تريد حذف هذا الطلب؟")) {
    let orders = JSON.parse(localStorage.getItem("admin_orders")) || []
    orders = orders.filter((o) => o.id !== orderId)
    localStorage.setItem("admin_orders", JSON.stringify(orders))
    showNotification("تم حذف الطلب بنجاح", "success")
    loadOrders()
    loadDashboardData()
  }
}

function getStatusText(status) {
  const statusMap = {
    pending: "قيد الانتظار",
    approved: "موافق",
    rejected: "مرفوض",
  }
  return statusMap[status] || status
}

// Platforms Management
function openPlatformModal(platformId = null) {
  const form = document.getElementById("platform-form")
  if (!form) return

  form.reset()

  if (platformId) {
    const platforms = JSON.parse(localStorage.getItem("admin_platforms")) || []
    const platform = platforms.find((p) => p.id === platformId)
    if (platform) {
      document.getElementById("platform-name").value = platform.name
      document.getElementById("platform-color").value = platform.color
      document.getElementById("platform-icon").value = platform.icon
    }
  }

  const modal = document.getElementById("platform-modal")
  if (modal) modal.classList.add("active")
}

function savePlatform(e) {
  e.preventDefault()

  const platform = {
    id: "platform_" + Date.now(),
    name: document.getElementById("platform-name").value,
    color: document.getElementById("platform-color").value,
    icon: document.getElementById("platform-icon").value,
    createdAt: new Date().toISOString(),
  }

  const platforms = JSON.parse(localStorage.getItem("admin_platforms")) || []
  platforms.push(platform)
  localStorage.setItem("admin_platforms", JSON.stringify(platforms))
  showNotification("تم إضافة المنصة بنجاح", "success")
  closeModal("platform-modal")
  loadPlatforms()
  loadDashboardData()
}

function loadPlatforms() {
  const platforms = JSON.parse(localStorage.getItem("admin_platforms")) || []
  const tbody = document.getElementById("platforms-table-body")
  if (!tbody) return

  tbody.innerHTML = ""

  platforms.forEach((platform) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td><i class="${platform.icon}"></i> ${platform.name}</td>
      <td><span style="width: 30px; height: 30px; background-color: ${platform.color}; border-radius: 50%; display: inline-block;"></span></td>
      <td>${platform.icon}</td>
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
  if (confirm("هل تريد حذف هذه المنصة؟")) {
    let platforms = JSON.parse(localStorage.getItem("admin_platforms")) || []
    platforms = platforms.filter((p) => p.id !== platformId)
    localStorage.setItem("admin_platforms", JSON.stringify(platforms))
    showNotification("تم حذف المنصة بنجاح", "success")
    loadPlatforms()
    loadDashboardData()
  }
}

// Payment Methods Management
function openPaymentModal() {
  const form = document.getElementById("payment-form")
  if (form) form.reset()

  const modal = document.getElementById("payment-modal")
  if (modal) modal.classList.add("active")
}

function savePayment(e) {
  e.preventDefault()

  const payment = {
    id: "payment_" + Date.now(),
    name: document.getElementById("payment-name").value,
    code: document.getElementById("payment-code").value,
    type: document.getElementById("payment-type").value,
    instructions: document.getElementById("payment-instructions").value,
    createdAt: new Date().toISOString(),
  }

  const payments = JSON.parse(localStorage.getItem("admin_payments")) || []
  payments.push(payment)
  localStorage.setItem("admin_payments", JSON.stringify(payments))
  showNotification("تم إضافة طريقة دفع جديدة بنجاح", "success")
  closeModal("payment-modal")
  loadPaymentMethods()
}

function loadPaymentMethods() {
  const payments = JSON.parse(localStorage.getItem("admin_payments")) || []
  const tbody = document.getElementById("payments-table-body")
  if (!tbody) return

  tbody.innerHTML = ""

  if (payments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">لا توجد طرق دفع</td></tr>'
    return
  }

  payments.forEach((payment) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${payment.name}</td>
      <td>${payment.type}</td>
      <td><code>${payment.code}</code></td>
      <td>${payment.instructions}</td>
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
    showNotification("تم حذف طريقة الدفع بنجاح", "success")
    loadPaymentMethods()
  }
}

// Contact Messages
function loadContactMessages() {
  const messages = JSON.parse(localStorage.getItem("contact_messages")) || []
  const tbody = document.getElementById("contact-table-body")
  if (!tbody) return

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
      <td>${msg.phone}</td>
      <td>${msg.message}</td>
      <td>
        <button class="btn-small btn-delete" onclick="deleteContactMessage('${msg.id}')">
          <i class="fas fa-trash"></i> حذف
        </button>
      </td>
    `
    tbody.appendChild(row)
  })
}

function deleteContactMessage(messageId) {
  if (confirm("هل تريد حذف هذه الرسالة؟")) {
    let messages = JSON.parse(localStorage.getItem("contact_messages")) || []
    messages = messages.filter((m) => m.id !== messageId)
    localStorage.setItem("contact_messages", JSON.stringify(messages))
    showNotification("تم حذف الرسالة بنجاح", "success")
    loadContactMessages()
  }
}

// Settings
function loadSettingsForm() {
  const settings = JSON.parse(localStorage.getItem("admin_settings")) || {}

  document.getElementById("settings-whatsapp").value = settings.whatsapp || "+970594569011"
  document.getElementById("settings-telegram").value = settings.telegram || ""
  document.getElementById("settings-email").value = settings.email || ""
  document.getElementById("settings-instagram").value = settings.instagram || ""
  document.getElementById("settings-storename").value = settings.storename || "متجر خدمات المنصات"
  document.getElementById("settings-description").value = settings.description || ""
}

function saveSettings(e) {
  e.preventDefault()

  const settings = {
    whatsapp: document.getElementById("settings-whatsapp").value,
    telegram: document.getElementById("settings-telegram").value,
    email: document.getElementById("settings-email").value,
    instagram: document.getElementById("settings-instagram").value,
    storename: document.getElementById("settings-storename").value,
    description: document.getElementById("settings-description").value,
  }

  localStorage.setItem("admin_settings", JSON.stringify(settings))
  showNotification("تم حفظ الإعدادات بنجاح", "success")
}

// Products Management
function openProductModal(productId = null) {
  editingProductId = productId
  const form = document.getElementById("product-form")
  if (!form) return

  form.reset()
  const preview = document.getElementById("product-image-preview")
  if (preview) preview.innerHTML = ""

  if (productId) {
    const products = JSON.parse(localStorage.getItem("admin_products")) || []
    const product = products.find((p) => p.id === productId)
    if (product) {
      document.getElementById("product-name").value = product.name
      document.getElementById("product-category").value = product.category
      document.getElementById("product-price").value = product.price
      document.getElementById("product-stock").value = product.stock
      document.getElementById("product-description").value = product.description || ""

      if (preview && product.image) {
        preview.innerHTML = `<img src="${product.image}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">`
      }
    }
  }

  const modal = document.getElementById("product-modal")
  if (modal) modal.classList.add("active")
}

function previewProductImage(e) {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    const preview = document.getElementById("product-image-preview")
    if (preview) {
      preview.innerHTML = `<img src="${event.target.result}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">`
    }
  }
  reader.readAsDataURL(file)
}

function saveProduct(e) {
  e.preventDefault()

  const imageInput = document.getElementById("product-image")
  const imageFile = imageInput ? imageInput.files[0] : null

  if (imageFile) {
    const reader = new FileReader()
    reader.onload = (event) => {
      const product = {
        id: editingProductId || "product_" + Date.now(),
        name: document.getElementById("product-name").value,
        category: document.getElementById("product-category").value,
        price: Number.parseFloat(document.getElementById("product-price").value),
        stock: Number.parseInt(document.getElementById("product-stock").value),
        description: document.getElementById("product-description").value,
        image: event.target.result,
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
    reader.readAsDataURL(imageFile)
  } else {
    const product = {
      id: editingProductId || "product_" + Date.now(),
      name: document.getElementById("product-name").value,
      category: document.getElementById("product-category").value,
      price: Number.parseFloat(document.getElementById("product-price").value),
      stock: Number.parseInt(document.getElementById("product-stock").value),
      description: document.getElementById("product-description").value,
      image: "",
      createdAt: new Date().toISOString(),
    }

    let products = JSON.parse(localStorage.getItem("admin_products")) || []

    if (editingProductId) {
      const existing = products.find((p) => p.id === editingProductId)
      product.image = existing ? existing.image : ""
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
}

function loadProducts() {
  const products = JSON.parse(localStorage.getItem("admin_products")) || []
  const tbody = document.getElementById("products-table-body")
  if (!tbody) return

  tbody.innerHTML = ""

  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">لا توجد منتجات</td></tr>'
    return
  }

  products.forEach((product) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${product.price} ريال</td>
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
    showNotification("تم حذف المنتج بنجاح", "success")
    loadProducts()
    loadDashboardData()
  }
}

// Utilities
function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) modal.classList.remove("active")
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.remove()
  }, 3000)
}

// Initialize Default Data
function initializeDefaultData() {
  if (!localStorage.getItem("admin_platforms") || JSON.parse(localStorage.getItem("admin_platforms")).length === 0) {
    const defaultPlatforms = [
      { id: "tiktok", name: "TikTok", color: "#00f7ef", icon: "fab fa-tiktok", createdAt: new Date().toISOString() },
      {
        id: "instagram",
        name: "Instagram",
        color: "#e1306c",
        icon: "fab fa-instagram",
        createdAt: new Date().toISOString(),
      },
      {
        id: "facebook",
        name: "Facebook",
        color: "#1877f2",
        icon: "fab fa-facebook",
        createdAt: new Date().toISOString(),
      },
      { id: "youtube", name: "YouTube", color: "#ff0000", icon: "fab fa-youtube", createdAt: new Date().toISOString() },
      { id: "twitter", name: "Twitter", color: "#1da1f2", icon: "fab fa-twitter", createdAt: new Date().toISOString() },
      {
        id: "linkedin",
        name: "LinkedIn",
        color: "#0077b5",
        icon: "fab fa-linkedin",
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem("admin_platforms", JSON.stringify(defaultPlatforms))
  }

  if (!localStorage.getItem("admin_services") || JSON.parse(localStorage.getItem("admin_services")).length === 0) {
    const defaultServices = [
      {
        id: "service_1",
        name: "مسح 1000 متابع",
        platformId: "tiktok",
        price: 50,
        currency: "SAR",
        description: "إضافة 1000 متابع حقيقي",
        createdAt: new Date().toISOString(),
      },
      {
        id: "service_2",
        name: "مسح 500 لايك",
        platformId: "instagram",
        price: 30,
        currency: "SAR",
        description: "إضافة 500 لايك حقيقي",
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem("admin_services", JSON.stringify(defaultServices))
  }
}

console.log("[v0] Admin script loaded successfully")
