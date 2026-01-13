let selectedCurrency = "SAR"
let selectedPaymentMethod = null

document.addEventListener("DOMContentLoaded", () => {
  initializeCheckout()
})

function initializeCheckout() {
  initializeTheme()
  setupCurrencySelector()
  setupFormHandlers()
  renderPaymentMethods()
  renderOrderSummary()
  updateSummary()
}

function initializeTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark"
  if (savedTheme === "light") {
    document.body.classList.add("light-mode")
    updateThemeIcon()
  }

  const themeToggle = document.getElementById("theme-toggle")
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("light-mode")
      const isDark = !document.body.classList.contains("light-mode")
      localStorage.setItem("theme", isDark ? "dark" : "light")
      updateThemeIcon()
    })
  }
}

function updateThemeIcon() {
  const icon = document.getElementById("theme-toggle")?.querySelector("i")
  if (icon) {
    const isDark = !document.body.classList.contains("light-mode")
    icon.className = isDark ? "fas fa-moon" : "fas fa-sun"
  }
}

function setupCurrencySelector() {
  document.querySelectorAll(".currency-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault()
      document.querySelectorAll(".currency-btn").forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
      selectedCurrency = btn.dataset.currency
      updateSummary()
    })
  })
}

function setupFormHandlers() {
  const checkoutForm = document.getElementById("checkout-form")
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault()
      if (validateForm()) {
        processOrder()
      }
    })
  }
}

function validateForm() {
  const name = document.getElementById("name").value.trim()
  const email = document.getElementById("email").value.trim()
  const phone = document.getElementById("phone").value.trim()
  const country = document.getElementById("country").value.trim()

  if (!name || !email || !phone || !country) {
    showCheckoutNotification("يرجى ملء جميع الحقول المطلوبة", "error")
    return false
  }

  if (!validateEmail(email)) {
    showCheckoutNotification("البريد الإلكتروني غير صحيح", "error")
    return false
  }

  const cart = JSON.parse(localStorage.getItem("checkout_cart")) || JSON.parse(localStorage.getItem("cart")) || []
  if (cart.length === 0) {
    showCheckoutNotification("السلة فارغة", "error")
    return false
  }

  return true
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

function renderPaymentMethods() {
  const adminData = JSON.parse(localStorage.getItem("admin_data")) || {}
  const payments = adminData.payments || []
  const container = document.getElementById("paymentMethods")

  if (payments.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary);">لا توجد طرق دفع متاحة</p>'
    return
  }

  container.innerHTML = payments
    .map(
      (payment) => `
    <div class="payment-option">
      <input type="radio" name="payment" value="${payment.id}" onchange="selectPaymentMethod('${payment.id}', '${payment.code}', '${payment.name}')">
      <div style="flex: 1;">
        <strong>${payment.name}</strong>
        <br>
        <small style="color: var(--primary-color); font-weight: 600;">الكود: ${payment.code}</small>
      </div>
    </div>
  `,
    )
    .join("")
}

function selectPaymentMethod(id, code, name) {
  selectedPaymentMethod = {
    id: id,
    code: code,
    name: name,
  }
}

function renderOrderSummary() {
  const summaryItems = document.getElementById("summary-items")
  const cart = JSON.parse(localStorage.getItem("checkout_cart")) || JSON.parse(localStorage.getItem("cart")) || []

  if (cart.length === 0) {
    summaryItems.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
        <i class="fas fa-shopping-cart" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
        السلة فارغة
      </div>
    `
    document.getElementById("pay-button").disabled = true
    return
  }

  summaryItems.innerHTML = cart
    .map(
      (item) => `
        <div class="summary-item">
            <span>${item.name}</span>
            <span class="summary-item-price">${(item.price * item.quantity).toFixed(2)} ${item.currency}</span>
        </div>
    `,
    )
    .join("")

  console.log("[v0] Order summary rendered with", cart.length, "items")
}

function updateSummary() {
  const cart = JSON.parse(localStorage.getItem("checkout_cart")) || JSON.parse(localStorage.getItem("cart")) || []
  let total = 0

  const conversionRates = {
    SAR: 1,
    AED: 0.98,
    USD: 0.266,
    OMR: 0.103,
  }

  cart.forEach((item) => {
    const basePrice = item.price
    const baseCurrency = item.currency || "SAR"
    const baseCurrencyRate = conversionRates[baseCurrency] || 1
    const targetRate = conversionRates[selectedCurrency] || 1

    const convertedPrice = (basePrice * targetRate) / baseCurrencyRate
    total += convertedPrice * item.quantity
  })

  document.getElementById("summary-total").textContent = `${total.toFixed(2)} ${selectedCurrency}`
  console.log("[v0] Summary updated - Total:", total, selectedCurrency)
}

function processOrder() {
  const name = document.getElementById("name").value.trim()
  const email = document.getElementById("email").value.trim()
  const phone = document.getElementById("phone").value.trim()
  const country = document.getElementById("country").value.trim()

  const cart = JSON.parse(localStorage.getItem("checkout_cart")) || JSON.parse(localStorage.getItem("cart")) || []

  localStorage.setItem("lastCustomerEmail", email)

  const orders = JSON.parse(localStorage.getItem("admin_orders")) || []
  const newOrder = {
    id: Date.now(),
    name,
    email,
    phone,
    country,
    items: cart,
    paymentMethod: selectedPaymentMethod?.name || "غير محدد",
    paymentCode: selectedPaymentMethod?.code || "",
    total: calculateTotal(),
    currency: selectedCurrency,
    status: "waiting",
    date: new Date().toLocaleString("ar-SA"),
    paymentProof: null,
  }

  orders.push(newOrder)
  localStorage.setItem("admin_orders", JSON.stringify(orders))

  showOrderSuccess(newOrder.id)
}

function showOrderSuccess(orderId) {
  const checkoutForm = document.getElementById("checkout-form")
  const summarySection = document.querySelector(".checkout-summary")

  if (checkoutForm) checkoutForm.style.display = "none"
  if (summarySection) summarySection.style.display = "none"

  const successContainer = document.getElementById("success-container") || createSuccessContainer()
  successContainer.style.display = "block"
  successContainer.innerHTML = `
    <div class="success-message">
      <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
      <h2>تم استلام طلبك بنجاح!</h2>
      <p>رقم الطلب: <strong style="color: var(--primary-color); font-size: 1.2rem;">#${orderId}</strong></p>
      <p style="margin-top: 1rem; color: var(--text-secondary);">يرجى رفع صورة عملية الدفع لتأكيد الطلب</p>
      
      <div class="payment-proof-upload" style="margin-top: 2rem; padding: 2rem; background: var(--border-color); border-radius: 10px; border: 2px dashed var(--primary-color);">
        <input type="file" id="paymentProofFile" accept="image/*" style="display: none;">
        <button onclick="document.getElementById('paymentProofFile').click()" class="btn-primary" style="width: 100%; margin-bottom: 1rem;">
          <i class="fas fa-upload"></i> رفع صورة عملية الدفع
        </button>
        <div id="proofPreview" style="margin-top: 1rem; text-align: center;">
          <p style="color: var(--text-secondary);">لم يتم رفع صورة</p>
        </div>
        <button onclick="completeOrder(${orderId})" class="btn-success" style="width: 100%; margin-top: 1rem; background: linear-gradient(135deg, var(--primary-color), var(--accent-color)); color: white; border: none; padding: 0.75rem; border-radius: 8px; cursor: pointer; font-weight: 600;">
          <i class="fas fa-check"></i> إتمام الطلب
        </button>
      </div>
      
      <button onclick="location.href='index.html'" class="btn-secondary" style="margin-top: 2rem; width: 100%;">
        العودة للمتجر
      </button>
    </div>
  `

  const fileInput = document.getElementById("paymentProofFile")
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const previewDiv = document.getElementById("proofPreview")
        previewDiv.innerHTML = `
          <img src="${event.target.result}" style="max-width: 200px; border-radius: 8px; margin-bottom: 1rem;">
          <p style="color: var(--primary-color);">تم رفع الصورة بنجاح</p>
        `
        // Store the proof image
        localStorage.setItem(`order_proof_${orderId}`, event.target.result)
      }
    }
  })
}

function createSuccessContainer() {
  const container = document.createElement("div")
  container.id = "success-container"
  container.style.cssText =
    "padding: 3rem; text-align: center; background: var(--border-color); border-radius: 15px; margin: 2rem 0;"
  document
    .querySelector(".checkout-container")
    .parentElement.insertBefore(container, document.querySelector(".checkout-container"))
  return container
}

function completeOrder(orderId) {
  const proof = localStorage.getItem(`order_proof_${orderId}`)

  if (!proof) {
    showCheckoutNotification("يرجى رفع صورة عملية الدفع", "error")
    return
  }

  // Update order with proof
  const orders = JSON.parse(localStorage.getItem("admin_orders")) || []
  const orderIndex = orders.findIndex((o) => o.id === orderId)

  if (orderIndex !== -1) {
    orders[orderIndex].paymentProof = proof
    orders[orderIndex].status = "pending"
    localStorage.setItem("admin_orders", JSON.stringify(orders))
  }

  showCheckoutNotification("شكراً! تم إرسال طلبك وصورة العملية بنجاح", "success")
  setTimeout(() => (location.href = "index.html"), 2000)
}

function calculateTotal() {
  const cart = JSON.parse(localStorage.getItem("checkout_cart")) || JSON.parse(localStorage.getItem("cart")) || []
  let total = 0

  const conversionRates = {
    SAR: 1,
    AED: 0.98,
    USD: 0.266,
    OMR: 0.103,
  }

  cart.forEach((item) => {
    const basePrice = item.price
    const baseCurrency = item.currency || "SAR"
    const baseCurrencyRate = conversionRates[baseCurrency] || 1
    const targetRate = conversionRates[selectedCurrency] || 1

    const convertedPrice = (basePrice * targetRate) / baseCurrencyRate
    total += convertedPrice * item.quantity
  })

  return total
}

function showCheckoutNotification(message, type = "success") {
  const notification = document.createElement("div")
  const backgroundColor = type === "error" ? "var(--danger)" : "var(--success)"

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${backgroundColor};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    font-weight: 700;
    z-index: 4000;
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  `

  notification.textContent = message
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-out"
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

console.log("[v0] Checkout script loaded successfully")
