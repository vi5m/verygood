let selectedCurrency = "SAR"

document.addEventListener("DOMContentLoaded", () => {
  initializeCheckout()
})

function initializeCheckout() {
  initializeTheme()
  setupCurrencySelector()
  setupFormHandlers()
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
  const cart = JSON.parse(localStorage.getItem("checkout_cart")) || JSON.parse(localStorage.getItem("cart")) || []
  const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value || "like-card"

  const formData = {
    id: "ORD-" + Date.now(),
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    country: document.getElementById("country").value,
    currency: selectedCurrency,
    paymentMethod: paymentMethod,
    notes: document.getElementById("notes").value,
    items: cart,
    serviceName: cart.length > 0 ? cart[0].name : "خدمة",
    quantity: cart.length,
    total: Number.parseFloat(document.getElementById("summary-total").textContent),
    date: new Date().toISOString(),
    status: "pending",
  }

  const adminOrders = JSON.parse(localStorage.getItem("admin_orders")) || []
  adminOrders.push(formData)
  localStorage.setItem("admin_orders", JSON.stringify(adminOrders))

  // Clear checkout cart
  localStorage.removeItem("checkout_cart")
  localStorage.setItem("cart", JSON.stringify([]))

  console.log("[v0] Order processed and saved:", formData.id)
  showSuccessPage(formData)
}

function showSuccessPage(order) {
  const successDiv = document.createElement("div")
  successDiv.style.cssText = `
    text-align: center;
    padding: 3rem;
    background: var(--border-color);
    border-radius: 15px;
    margin: 2rem auto;
    max-width: 600px;
    animation: slideIn 0.5s ease-out;
  `

  const paymentMethodText = order.paymentMethod === "like-card" ? "Like Card" : "تحويل بنكي"

  successDiv.innerHTML = `
    <div style="font-size: 3rem; color: var(--success); margin-bottom: 1rem;">
      <i class="fas fa-check-circle"></i>
    </div>
    <h2 style="color: var(--primary-color); margin-bottom: 1rem; font-size: 2rem;">
      تم استقبال طلبك بنجاح!
    </h2>
    <p style="color: var(--text-secondary); margin-bottom: 2rem; font-size: 1.1rem;">
      سيتم التواصل معك قريباً على رقمك <strong>${order.phone}</strong>
    </p>

    <div style="background: var(--bg-dark); padding: 2rem; border-radius: 10px; margin: 2rem 0; text-align: right; border-left: 4px solid var(--primary-color);">
      <div style="margin-bottom: 1rem;">
        <strong style="color: var(--primary-color);">رقم الطلب:</strong>
        <span style="color: var(--text-dark); margin-right: 0.5rem;">${order.id}</span>
      </div>
      <div style="margin-bottom: 1rem;">
        <strong style="color: var(--primary-color);">البريد الإلكتروني:</strong>
        <span style="color: var(--text-dark); margin-right: 0.5rem;">${order.email}</span>
      </div>
      <div style="margin-bottom: 1rem;">
        <strong style="color: var(--primary-color);">طريقة الدفع:</strong>
        <span style="color: var(--text-dark); margin-right: 0.5rem;">${paymentMethodText}</span>
      </div>
      <div style="margin-bottom: 1rem;">
        <strong style="color: var(--primary-color);">المبلغ الإجمالي:</strong>
        <span style="color: var(--text-dark); margin-right: 0.5rem;">${order.total.toFixed(2)} ${order.currency}</span>
      </div>
      <div>
        <strong style="color: var(--primary-color);">عدد الخدمات:</strong>
        <span style="color: var(--text-dark); margin-right: 0.5rem;">${order.items.length}</span>
      </div>
    </div>

    <div style="background: rgba(16, 185, 129, 0.1); padding: 1rem; border-radius: 10px; margin: 1rem 0;">
      <p style="color: var(--success); margin: 0;">
        <i class="fas fa-check"></i> تم حفظ الطلب بنجاح
      </p>
    </div>

    <p style="color: var(--text-secondary); margin: 1.5rem 0;">
      <i class="fas fa-info-circle"></i> تحقق من بريدك الإلكتروني للحصول على تفاصيل الطلب
    </p>

    <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center;">
      <button onclick="window.location.href='index.html'" style="
        background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
        color: var(--bg-dark);
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 700;
        font-size: 0.95rem;
        transition: all 0.3s;
      " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        <i class="fas fa-home"></i> العودة للرئيسية
      </button>
      <button onclick="shareOrder('${order.id}')" style="
        background: var(--secondary-color);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 700;
        font-size: 0.95rem;
        transition: all 0.3s;
      " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        <i class="fas fa-share"></i> مشاركة
      </button>
    </div>
  `

  const container = document.querySelector(".checkout-container")
  if (container && container.parentNode) {
    container.style.display = "none"
    container.parentNode.insertBefore(successDiv, container)
  }
}

function shareOrder(orderId) {
  const text = `تم إنشاء طلبي برقم ${orderId} بنجاح! 🎉\n\nمن متجر الخدمات: https://example.com`
  if (navigator.share) {
    navigator.share({
      title: "طلب جديد",
      text: text,
    })
  } else {
    showCheckoutNotification("تم النسخ إلى الحافظة", "success")
  }
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
