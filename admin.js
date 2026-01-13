// Admin Dashboard Configuration
const ADMIN_CONFIG = {
  username: "admin",
  password: "admin123",
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
}

// Data storage
let adminData = {
  services: [],
  products: [],
  platforms: [],
  payments: [],
  orders: [],
  messages: [],
  settings: {
    storeName: "متجر الخدمات",
    storeDescription: "متجر متخصص في خدمات التواصل الاجتماعي",
    whatsapp: "",
    whatsappChannel: "",
    telegram: "",
    email: "",
    instagram: "",
  },
}

let currentUser = null
let editingServiceId = null
let editingProductId = null
let editingPlatformId = null

// Initialize Admin Panel
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] Admin panel initializing...")

  // Check if user is logged in
  const sessionData = sessionStorage.getItem("adminSession")
  if (!sessionData) {
    showLoginPage()
  } else {
    loadAdminPanel()
  }
})

function showLoginPage() {
  document.body.innerHTML = `
    <div class="login-container">
      <div class="login-box">
        <h1>لوحة التحكم</h1>
        <form id="loginForm">
          <div class="form-group">
            <label>اسم المستخدم</label>
            <input type="text" id="username" placeholder="أدخل اسم المستخدم" required>
          </div>
          <div class="form-group">
            <label>كلمة المرور</label>
            <input type="password" id="password" placeholder="أدخل كلمة المرور" required>
          </div>
          <button type="submit" class="btn-primary" style="width: 100%;">دخول</button>
        </form>
        <p id="loginError" class="error-message"></p>
      </div>
    </div>
    <style>
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      }
      .login-box {
        background: var(--bg-dark);
        padding: 40px;
        border-radius: 10px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        width: 100%;
        max-width: 400px;
      }
      .login-box h1 {
        text-align: center;
        margin-bottom: 30px;
        color: var(--primary-color);
      }
      .form-group {
        margin-bottom: 20px;
      }
      .form-group label {
        display: block;
        margin-bottom: 5px;
        color: var(--text-dark);
      }
      .form-group input {
        width: 100%;
        padding: 10px;
        border: 1px solid var(--border-color);
        border-radius: 5px;
        background: var(--bg-darker);
        color: var(--text-dark);
      }
      .error-message {
        color: var(--danger);
        text-align: center;
        margin-top: 10px;
      }
    </style>
  `

  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault()
    const username = document.getElementById("username").value
    const password = document.getElementById("password").value

    if (username === ADMIN_CONFIG.username && password === ADMIN_CONFIG.password) {
      const sessionData = {
        username: username,
        loginTime: Date.now(),
        token: Math.random().toString(36).substr(2, 9),
      }
      sessionStorage.setItem("adminSession", JSON.stringify(sessionData))
      currentUser = sessionData
      loadAdminPanel()
    } else {
      document.getElementById("loginError").textContent = "بيانات دخول خاطئة!"
    }
  })
}

function loadAdminPanel() {
  loadDataFromStorage()
  setupEventListeners()
  renderDashboard()
  initializeTheme()
  console.log("[v0] Admin panel loaded successfully")
}

function loadDataFromStorage() {
  const stored = localStorage.getItem("admin_data")
  if (stored) {
    adminData = JSON.parse(stored)
  } else {
    initializeDefaultData()
  }
}

function initializeDefaultData() {
  adminData.platforms = [
    { id: "p1", name: "TikTok", icon: "fa-tiktok", color: "#25F4EE" },
    { id: "p2", name: "Instagram", icon: "fa-instagram", color: "#E1306C" },
    { id: "p3", name: "Facebook", icon: "fa-facebook", color: "#1877F2" },
    { id: "p4", name: "YouTube", icon: "fa-youtube", color: "#FF0000" },
    { id: "p5", name: "Twitter", icon: "fa-twitter", color: "#1DA1F2" },
    { id: "p6", name: "LinkedIn", icon: "fa-linkedin", color: "#0A66C2" },
  ]

  adminData.services = [
    { id: "s1", name: "زيادة المتابعين", platformId: "p1", price: 50, description: "زيادة متابعين حقيقيين" },
    { id: "s2", name: "زيادة الإعجابات", platformId: "p1", price: 30, description: "زيادة إعجابات المنشورات" },
  ]

  adminData.payments = [
    { id: "py1", name: "Like Card", code: "LIKECARD", type: "card" },
    { id: "py2", name: "تحويل بنكي", code: "BANK_TRANSFER", type: "transfer" },
  ]

  saveDataToStorage()
}

function saveDataToStorage() {
  localStorage.setItem("admin_data", JSON.stringify(adminData))
  localStorage.setItem("admin_platforms", JSON.stringify(adminData.platforms))
  localStorage.setItem("admin_services", JSON.stringify(adminData.services))
}

function setupEventListeners() {
  // Navigation
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", handleNavigation)
  })

  // Service Modal
  document.getElementById("addServiceBtn")?.addEventListener("click", openServiceModal)
  document.getElementById("closeServiceModal")?.addEventListener("click", closeServiceModal)
  document.getElementById("cancelServiceBtn")?.addEventListener("click", closeServiceModal)
  document.getElementById("saveServiceBtn")?.addEventListener("click", saveService)

  // Product Modal
  document.getElementById("addProductBtn")?.addEventListener("click", openProductModal)
  document.getElementById("closeProductModal")?.addEventListener("click", closeProductModal)
  document.getElementById("cancelProductBtn")?.addEventListener("click", closeProductModal)
  document.getElementById("saveProductBtn")?.addEventListener("click", saveProduct)
  document.getElementById("productImage")?.addEventListener("change", previewProductImage)

  // Platform Modal
  document.getElementById("addPlatformBtn")?.addEventListener("click", openPlatformModal)
  document.getElementById("closePlatformModal")?.addEventListener("click", closePlatformModal)
  document.getElementById("cancelPlatformBtn")?.addEventListener("click", closePlatformModal)
  document.getElementById("savePlatformBtn")?.addEventListener("click", savePlatform)

  // Payment Modal
  document.getElementById("addPaymentBtn")?.addEventListener("click", openPaymentModal)
  document.getElementById("closePaymentModal")?.addEventListener("click", closePaymentModal)
  document.getElementById("cancelPaymentBtn")?.addEventListener("click", closePaymentModal)
  document.getElementById("savePaymentBtn")?.addEventListener("click", savePayment)

  // Settings
  document.getElementById("saveSettingsBtn")?.addEventListener("click", saveSettings)

  // Logout
  document.getElementById("logoutBtn")?.addEventListener("click", logout)

  // Theme toggle
  document.getElementById("themeToggle")?.addEventListener("click", toggleTheme)
}

function handleNavigation(e) {
  if (!e.target.closest(".nav-item")) return

  const page = e.target.closest(".nav-item").dataset.page

  showPage(page)
}

function showPage(page) {
  // Hide all pages
  document.querySelectorAll(".page-content").forEach((p) => p.classList.add("hidden"))

  // Remove active from nav items
  document.querySelectorAll(".nav-item").forEach((btn) => btn.classList.remove("active"))

  // Show selected page
  let pageId
  switch (page) {
    case "dashboard":
      pageId = "dashboardPage"
      renderDashboard()
      break
    case "orders":
      pageId = "ordersPage"
      renderOrders()
      break
    case "services":
      pageId = "servicesPage"
      renderServices()
      break
    case "products":
      pageId = "productsPage"
      renderProducts()
      break
    case "platforms":
      pageId = "platformsPage"
      renderPlatforms()
      break
    case "payments":
      pageId = "paymentsPage"
      renderPayments()
      break
    case "messages":
      pageId = "messagesPage"
      renderMessages()
      break
    case "settings":
      pageId = "settingsPage"
      loadSettings()
      break
    case "trust":
      pageId = "trustPage"
      renderTrustImagesOnly()
      break
  }

  if (pageId) {
    document.getElementById(pageId)?.classList.remove("hidden")
    document.querySelector(`[data-page="${page}"]`)?.classList.add("active")
  }
}

function renderDashboard() {
  document.getElementById("totalOrders").textContent = adminData.orders.length
  document.getElementById("completedOrders").textContent = adminData.orders.filter(
    (o) => o.status === "approved",
  ).length
  document.getElementById("pendingOrders").textContent = adminData.orders.filter((o) => o.status === "pending").length
  document.getElementById("totalServices").textContent = adminData.services.length
}

function renderOrders() {
  const tbody = document.getElementById("ordersTableBody")
  if (adminData.orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">لا توجد طلبات</td></tr>'
    return
  }

  tbody.innerHTML = adminData.orders
    .map(
      (order) => `
    <tr>
      <td>#${order.id}</td>
      <td>${order.customerName}</td>
      <td>${order.serviceName}</td>
      <td>${order.price} ${order.currency}</td>
      <td>
        <select class="status-select" onchange="updateOrderStatus('${order.id}', this.value)">
          <option value="pending" ${order.status === "pending" ? "selected" : ""}>معلق</option>
          <option value="approved" ${order.status === "approved" ? "selected" : ""}>موافق عليه</option>
          <option value="rejected" ${order.status === "rejected" ? "selected" : ""}>مرفوض</option>
        </select>
      </td>
      <td>
        <button class="btn-small btn-danger" onclick="deleteOrder('${order.id}')">حذف</button>
      </td>
    </tr>
  `,
    )
    .join("")
}

function updateOrderStatus(orderId, status) {
  const order = adminData.orders.find((o) => o.id === orderId)
  if (order) {
    order.status = status
    saveDataToStorage()
    renderOrders()
  }
}

function deleteOrder(orderId) {
  if (confirm("هل تريد حذف هذا الطلب؟")) {
    adminData.orders = adminData.orders.filter((o) => o.id !== orderId)
    saveDataToStorage()
    renderOrders()
  }
}

function renderServices() {
  const grid = document.getElementById("servicesGrid")
  if (adminData.services.length === 0) {
    grid.innerHTML = '<p style="text-align: center;">لا توجد خدمات</p>'
    return
  }

  grid.innerHTML = adminData.services
    .map((service) => {
      const platform = adminData.platforms.find((p) => p.id === service.platformId)
      return `
      <div class="card">
        <h3>${service.name}</h3>
        <p><strong>المنصة:</strong> ${platform?.name || "غير معروفة"}</p>
        <p><strong>السعر:</strong> ${service.price} ريال</p>
        <p><strong>الوصف:</strong> ${service.description}</p>
        <div class="card-actions">
          <button class="btn-small" onclick="editService('${service.id}')">تعديل</button>
          <button class="btn-small btn-danger" onclick="deleteService('${service.id}')">حذف</button>
        </div>
      </div>
    `
    })
    .join("")
}

function openServiceModal() {
  editingServiceId = null
  document.getElementById("serviceModalTitle").textContent = "إضافة خدمة جديدة"
  document.getElementById("serviceName").value = ""
  document.getElementById("servicePrice").value = ""
  document.getElementById("serviceDescription").value = ""

  // Populate platforms
  const select = document.getElementById("servicePlatform")
  select.innerHTML =
    '<option value="">اختر منصة</option>' +
    adminData.platforms.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")

  document.getElementById("serviceModal").classList.remove("hidden")
}

function closeServiceModal() {
  document.getElementById("serviceModal").classList.add("hidden")
}

function saveService() {
  const name = document.getElementById("serviceName").value
  const platformId = document.getElementById("servicePlatform").value
  const price = document.getElementById("servicePrice").value
  const description = document.getElementById("serviceDescription").value

  if (!name || !platformId || !price) {
    alert("يرجى ملء جميع الحقول المطلوبة")
    return
  }

  if (editingServiceId) {
    const service = adminData.services.find((s) => s.id === editingServiceId)
    if (service) {
      service.name = name
      service.platformId = platformId
      service.price = Number.parseFloat(price)
      service.description = description
    }
  } else {
    adminData.services.push({
      id: "s" + Date.now(),
      name,
      platformId,
      price: Number.parseFloat(price),
      description,
    })
  }

  saveDataToStorage()
  renderServices()
  closeServiceModal()
}

function editService(serviceId) {
  const service = adminData.services.find((s) => s.id === serviceId)
  if (!service) return

  editingServiceId = serviceId
  document.getElementById("serviceModalTitle").textContent = "تعديل الخدمة"
  document.getElementById("serviceName").value = service.name
  document.getElementById("servicePlatform").value = service.platformId
  document.getElementById("servicePrice").value = service.price
  document.getElementById("serviceDescription").value = service.description

  document.getElementById("serviceModal").classList.remove("hidden")
}

function deleteService(serviceId) {
  if (confirm("هل تريد حذف هذه الخدمة؟")) {
    adminData.services = adminData.services.filter((s) => s.id !== serviceId)
    saveDataToStorage()
    renderServices()
  }
}

function renderProducts() {
  const grid = document.getElementById("productsGrid")
  if (adminData.products.length === 0) {
    grid.innerHTML = '<p style="text-align: center;">لا توجد منتجات</p>'
    return
  }

  grid.innerHTML = adminData.products
    .map(
      (product) => `
    <div class="card">
      ${product.image ? `<img src="${product.image}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 5px;">` : ""}
      <h3>${product.name}</h3>
      <p><strong>السعر:</strong> ${product.price} ريال</p>
      <p><strong>الكمية:</strong> ${product.stock}</p>
      <p><strong>الوصف:</strong> ${product.description}</p>
      <div class="card-actions">
        <button class="btn-small" onclick="editProduct('${product.id}')">تعديل</button>
        <button class="btn-small btn-danger" onclick="deleteProduct('${product.id}')">حذف</button>
      </div>
    </div>
  `,
    )
    .join("")
}

function openProductModal() {
  editingProductId = null
  document.getElementById("productModalTitle").textContent = "إضافة منتج جديد"
  document.getElementById("productName").value = ""
  document.getElementById("productPrice").value = ""
  document.getElementById("productStock").value = ""
  document.getElementById("productDescription").value = ""
  document.getElementById("productImage").value = ""
  document.getElementById("productImagePreview").style.display = "none"

  document.getElementById("productModal").classList.remove("hidden")
}

function closeProductModal() {
  document.getElementById("productModal").classList.add("hidden")
}

function previewProductImage(e) {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      const preview = document.getElementById("productImagePreview")
      preview.src = event.target.result
      preview.style.display = "block"
    }
    reader.readAsDataURL(file)
  }
}

function saveProduct() {
  const name = document.getElementById("productName").value
  const price = document.getElementById("productPrice").value
  const stock = document.getElementById("productStock").value
  const description = document.getElementById("productDescription").value
  const imagePreview = document.getElementById("productImagePreview")

  if (!name || !price || !stock) {
    alert("يرجى ملء جميع الحقول المطلوبة")
    return
  }

  const productData = {
    name,
    price: Number.parseFloat(price),
    stock: Number.parseInt(stock),
    description,
    image: imagePreview.src || null,
  }

  if (editingProductId) {
    const product = adminData.products.find((p) => p.id === editingProductId)
    if (product) {
      Object.assign(product, productData)
    }
  } else {
    adminData.products.push({
      id: "pr" + Date.now(),
      ...productData,
    })
  }

  saveDataToStorage()
  renderProducts()
  closeProductModal()
}

function editProduct(productId) {
  const product = adminData.products.find((p) => p.id === productId)
  if (!product) return

  editingProductId = productId
  document.getElementById("productModalTitle").textContent = "تعديل المنتج"
  document.getElementById("productName").value = product.name
  document.getElementById("productPrice").value = product.price
  document.getElementById("productStock").value = product.stock
  document.getElementById("productDescription").value = product.description

  if (product.image) {
    const preview = document.getElementById("productImagePreview")
    preview.src = product.image
    preview.style.display = "block"
  }

  document.getElementById("productModal").classList.remove("hidden")
}

function deleteProduct(productId) {
  if (confirm("هل تريد حذف هذا المنتج؟")) {
    adminData.products = adminData.products.filter((p) => p.id !== productId)
    saveDataToStorage()
    renderProducts()
  }
}

function renderPlatforms() {
  const grid = document.getElementById("platformsGrid")
  grid.innerHTML = adminData.platforms
    .map(
      (platform) => `
    <div class="card" style="border-right: 4px solid ${platform.color}">
      <i class="fas ${platform.icon}" style="font-size: 2rem; color: ${platform.color}; margin-bottom: 10px;"></i>
      <h3>${platform.name}</h3>
      <p style="color: ${platform.color}; font-weight: bold;">${platform.icon}</p>
      <div class="card-actions">
        <button class="btn-small" onclick="editPlatform('${platform.id}')">تعديل</button>
        <button class="btn-small btn-danger" onclick="deletePlatform('${platform.id}')">حذف</button>
      </div>
    </div>
  `,
    )
    .join("")
}

function openPlatformModal() {
  editingPlatformId = null
  document.getElementById("platformModalTitle").textContent = "إضافة منصة جديدة"
  document.getElementById("platformName").value = ""
  document.getElementById("platformIcon").value = ""
  document.getElementById("platformColor").value = "#ff9500"

  document.getElementById("platformModal").classList.remove("hidden")
}

function closePlatformModal() {
  document.getElementById("platformModal").classList.add("hidden")
}

function savePlatform() {
  const name = document.getElementById("platformName").value
  const icon = document.getElementById("platformIcon").value
  const color = document.getElementById("platformColor").value

  if (!name || !icon) {
    alert("يرجى ملء جميع الحقول")
    return
  }

  if (editingPlatformId) {
    const platform = adminData.platforms.find((p) => p.id === editingPlatformId)
    if (platform) {
      platform.name = name
      platform.icon = icon
      platform.color = color
    }
  } else {
    adminData.platforms.push({
      id: "p" + Date.now(),
      name,
      icon,
      color,
    })
  }

  saveDataToStorage()
  renderPlatforms()
  closePlatformModal()
}

function editPlatform(platformId) {
  const platform = adminData.platforms.find((p) => p.id === platformId)
  if (!platform) return

  editingPlatformId = platformId
  document.getElementById("platformModalTitle").textContent = "تعديل المنصة"
  document.getElementById("platformName").value = platform.name
  document.getElementById("platformIcon").value = platform.icon
  document.getElementById("platformColor").value = platform.color

  document.getElementById("platformModal").classList.remove("hidden")
}

function deletePlatform(platformId) {
  if (confirm("هل تريد حذف هذه المنصة؟")) {
    adminData.platforms = adminData.platforms.filter((p) => p.id !== platformId)
    saveDataToStorage()
    renderPlatforms()
  }
}

function renderPayments() {
  const tbody = document.getElementById("paymentsTableBody")
  if (adminData.payments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">لا توجد طرق دفع</td></tr>'
    return
  }

  tbody.innerHTML = adminData.payments
    .map(
      (payment) => `
    <tr>
      <td>${payment.name}</td>
      <td>${payment.code}</td>
      <td>${payment.type}</td>
      <td>
        <button class="btn-small btn-danger" onclick="deletePayment('${payment.id}')">حذف</button>
      </td>
    </tr>
  `,
    )
    .join("")
}

function openPaymentModal() {
  document.getElementById("paymentName").value = ""
  document.getElementById("paymentCode").value = ""
  document.getElementById("paymentType").value = "card"

  document.getElementById("paymentModal").classList.remove("hidden")
}

function closePaymentModal() {
  document.getElementById("paymentModal").classList.add("hidden")
}

function savePayment() {
  const name = document.getElementById("paymentName").value
  const code = document.getElementById("paymentCode").value
  const type = document.getElementById("paymentType").value

  if (!name || !code) {
    alert("يرجى ملء جميع الحقول")
    return
  }

  adminData.payments.push({
    id: "py" + Date.now(),
    name,
    code,
    type,
  })

  saveDataToStorage()
  renderPayments()
  closePaymentModal()
}

function deletePayment(paymentId) {
  if (confirm("هل تريد حذف هذه طريقة الدفع؟")) {
    adminData.payments = adminData.payments.filter((p) => p.id !== paymentId)
    saveDataToStorage()
    renderPayments()
  }
}

function renderMessages() {
  const tbody = document.getElementById("messagesTableBody")
  const messages = JSON.parse(localStorage.getItem("contact_messages")) || []

  if (messages.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">لا توجد رسائل</td></tr>'
    return
  }

  tbody.innerHTML = messages
    .map(
      (msg, idx) => `
    <tr>
      <td>${msg.name}</td>
      <td>${msg.email}</td>
      <td>${msg.message.substring(0, 50)}...</td>
      <td>${new Date(msg.date).toLocaleString("ar-SA")}</td>
      <td>
        <button class="btn-small btn-danger" onclick="deleteMessage(${idx})">حذف</button>
      </td>
    </tr>
  `,
    )
    .join("")
}

function deleteMessage(idx) {
  if (confirm("هل تريد حذف هذه الرسالة؟")) {
    const messages = JSON.parse(localStorage.getItem("contact_messages")) || []
    messages.splice(idx, 1)
    localStorage.setItem("contact_messages", JSON.stringify(messages))
    renderMessages()
  }
}

function loadSettings() {
  document.getElementById("storeName").value = adminData.settings.storeName
  document.getElementById("storeDescription").value = adminData.settings.storeDescription
  document.getElementById("whatsappNumber").value = adminData.settings.whatsapp
  document.getElementById("whatsappChannel").value = adminData.settings.whatsappChannel
}

function saveSettings() {
  adminData.settings.storeName = document.getElementById("storeName").value
  adminData.settings.storeDescription = document.getElementById("storeDescription").value
  adminData.settings.whatsapp = document.getElementById("whatsappNumber").value
  adminData.settings.whatsappChannel = document.getElementById("whatsappChannel").value

  saveDataToStorage()
  alert("تم حفظ الإعدادات بنجاح")
}

function renderTrustImagesOnly() {
  const container = document.getElementById("trustImagesContainer")
  const trustImages = JSON.parse(localStorage.getItem("trustImages")) || []

  if (trustImages.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; color: var(--text-muted); padding: 40px;">لا توجد صور ثقة حتى الآن</p>'
    return
  }

  container.innerHTML = trustImages
    .map(
      (img, index) => `
    <div class="trust-image-card">
      <img src="${img.image}" alt="${img.title}" class="trust-card-image">
      <div class="trust-card-content">
        <h3>${img.title}</h3>
        <p>${img.description}</p>
        <div class="trust-card-actions">
          <button class="btn-danger" onclick="deleteTrustImage(${index})">
            <i class="fas fa-trash"></i> حذف
          </button>
        </div>
      </div>
    </div>
  `,
    )
    .join("")
}

function deleteTrustImage(index) {
  if (confirm("هل تريد حذف هذه الصورة؟")) {
    const trustImages = JSON.parse(localStorage.getItem("trustImages")) || []
    trustImages.splice(index, 1)
    localStorage.setItem("trustImages", JSON.stringify(trustImages))
    renderTrustImagesOnly()
    alert("تم حذف الصورة بنجاح")
  }
}

function initializeTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark"
  if (savedTheme === "light") {
    document.body.classList.add("light-mode")
  }
}

function toggleTheme() {
  document.body.classList.toggle("light-mode")
  const theme = document.body.classList.contains("light-mode") ? "light" : "dark"
  localStorage.setItem("theme", theme)
}

function logout() {
  if (confirm("هل تريد تسجيل الخروج؟")) {
    sessionStorage.removeItem("adminSession")
    location.reload()
  }
}

// Add CSS for admin panel
const adminStyles = `
.admin-wrapper {
  display: flex;
  height: 100vh;
  background: var(--bg-dark);
}

.admin-sidebar {
  width: 250px;
  background: var(--bg-darker);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  position: fixed;
  height: 100vh;
  right: 0;
  overflow-y: auto;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  color: var(--primary-color);
  font-size: 1.3rem;
}

.logout-btn {
  background: transparent;
  border: none;
  color: var(--danger);
  cursor: pointer;
  font-size: 1.2rem;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.nav-item {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 15px 20px;
  text-align: right;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-item:hover {
  background: rgba(255, 149, 0, 0.1);
  color: var(--primary-color);
}

.nav-item.active {
  background: rgba(255, 149, 0, 0.2);
  color: var(--primary-color);
  border-right: 3px solid var(--primary-color);
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid var(--border-color);
}

.theme-toggle {
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-dark);
  cursor: pointer;
  border-radius: 5px;
}

.admin-main {
  margin-right: 250px;
  flex: 1;
  overflow-y: auto;
  padding: 30px;
}

.page-content {
  animation: fadeIn 0.3s;
}

.page-content.hidden {
  display: none;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: var(--text-dark);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgba(255, 149, 0, 0.05);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  gap: 20px;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.stat-info h3 {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.stat-number {
  color: var(--text-dark);
  font-size: 1.8rem;
  font-weight: bold;
}

.table-container {
  background: var(--bg-darker);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table thead {
  background: rgba(255, 149, 0, 0.1);
}

.admin-table th {
  padding: 15px;
  text-align: right;
  color: var(--primary-color);
  font-weight: 600;
}

.admin-table td {
  padding: 12px 15px;
  border-top: 1px solid var(--border-color);
}

.admin-table tr:hover {
  background: rgba(255, 149, 0, 0.05);
}

.status-select {
  padding: 5px 10px;
  background: var(--bg-dark);
  border: 1px solid var(--border-color);
  color: var(--text-dark);
  border-radius: 5px;
}

.services-grid, .products-grid, .platforms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.card {
  background: var(--bg-darker);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 20px;
  transition: all 0.3s;
}

.card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.card h3 {
  color: var(--text-dark);
  margin-bottom: 10px;
}

.card p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-small {
  flex: 1;
  padding: 8px 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.btn-small:hover {
  background: var(--primary-dark);
}

.btn-small.btn-danger {
  background: var(--danger);
}

.btn-small.btn-danger:hover {
  background: #d83030;
}

.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 2000;
  align-items: center;
  justify-content: center;
}

.modal:not(.hidden) {
  display: flex;
}

.modal-content {
  background: var(--bg-dark);
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  color: var(--text-dark);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 2rem;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 10px;
}

.btn-secondary {
  flex: 1;
  padding: 10px;
  background: var(--border-color);
  color: var(--text-dark);
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.settings-container {
  display: grid;
  gap: 20px;
}

.settings-section {
  background: var(--bg-darker);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 20px;
}

.settings-section h2 {
  color: var(--primary-color);
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  color: var(--text-dark);
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  background: var(--bg-dark);
  border: 1px solid var(--border-color);
  color: var(--text-dark);
  border-radius: 5px;
  font-family: inherit;
  resize: vertical;
}

.currency-checkboxes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.currency-checkboxes label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-dark);
}

.currency-checkboxes input {
  width: auto;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .admin-sidebar {
    width: 100%;
    height: auto;
    position: static;
    flex-direction: row;
    border-left: none;
    border-bottom: 1px solid var(--border-color);
  }

  .admin-main {
    margin-right: 0;
    padding: 20px;
  }

  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
  }

  .nav-item {
    flex: 0 0 auto;
    min-width: 150px;
  }
}
`

// Add styles to page
if (!document.querySelector("style[data-admin-styles]")) {
  const style = document.createElement("style")
  style.setAttribute("data-admin-styles", "true")
  style.textContent = adminStyles
  document.head.appendChild(style)
}

console.log("[v0] Admin panel script loaded successfully")
