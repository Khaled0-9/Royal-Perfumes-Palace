/**
 * إدارة سلة المشتريات والطلبات والعملات
 * Royal Perfumes Palace - Cart & Checkout Engine
 */

class CartManager {
  constructor() {
    this.items = window.db.getCart();
    this.coupon = null;
    this.currentCurrency = localStorage.getItem('royal_perfumes_currency') || 'EGP';
    this.init();
  }

  init() {
    window.addEventListener('db:cartUpdated', (e) => {
      this.items = e.detail.cart;
      this.renderCartUI();
    });

    window.addEventListener('db:stockUpdated', () => {
      this.validateCartStock();
    });
  }

  // === العملة والتحويل ===
  getCurrencyInfo() {
    const settings = window.db.getSettings();
    return settings.currencies[this.currentCurrency] || settings.currencies['EGP'];
  }

  setCurrency(currencyCode) {
    const settings = window.db.getSettings();
    if (settings.currencies[currencyCode]) {
      this.currentCurrency = currencyCode;
      localStorage.setItem('royal_perfumes_currency', currencyCode);
      window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency: currencyCode } }));
      this.renderCartUI();
      return true;
    }
    return false;
  }

  formatPrice(amountInSAR) {
    const curr = this.getCurrencyInfo();
    const converted = amountInSAR * curr.rate;
    // إذا كانت عملة الكويت 3 خانات عشرية، غير ذلك تقريب مناسب
    const formattedNum = this.currentCurrency === 'KWD' 
      ? converted.toFixed(2) 
      : Math.round(converted).toLocaleString('ar-EG');
    return `${formattedNum} ${curr.symbol}`;
  }

  // === عناصر السلة ===
  getItems() {
    return this.items;
  }

  getTotalCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  addItem(productId, quantity = 1) {
    const product = window.db.getProductById(productId);
    if (!product) {
      this.notify('المنتج غير موجود!', 'error');
      return false;
    }

    if (product.stock <= 0) {
      this.notify('عذراً، هذا العطر نفد مؤقتاً من المخزون', 'warning');
      return false;
    }

    const existingIndex = this.items.findIndex(item => item.id === productId);
    const currentQtyInCart = existingIndex > -1 ? this.items[existingIndex].quantity : 0;
    const requestedQty = currentQtyInCart + quantity;

    if (requestedQty > product.stock) {
      this.notify(`المخزون المتوفر هو ${product.stock} فقط لهذا العطر`, 'warning');
      return false;
    }

    const effectivePrice = product.discountPrice || product.price;

    if (existingIndex > -1) {
      this.items[existingIndex].quantity = requestedQty;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: effectivePrice,
        originalPrice: product.price,
        size: product.size,
        image: product.image,
        quantity: quantity,
        stock: product.stock
      });
    }

    window.db.saveCart(this.items);
    this.notify(`تمت إضافة "${product.name}" إلى السلة`, 'success');
    this.renderCartUI();
    return true;
  }

  updateQuantity(productId, newQty) {
    const product = window.db.getProductById(productId);
    const itemIndex = this.items.findIndex(item => item.id === productId);
    
    if (itemIndex === -1) return;

    if (newQty <= 0) {
      this.removeItem(productId);
      return;
    }

    if (product && newQty > product.stock) {
      this.notify(`المتاح بالمخزون حالياً: ${product.stock}`, 'warning');
      this.items[itemIndex].quantity = product.stock;
    } else {
      this.items[itemIndex].quantity = newQty;
    }

    window.db.saveCart(this.items);
    this.renderCartUI();
  }

  removeItem(productId) {
    const item = this.items.find(i => i.id === productId);
    this.items = this.items.filter(i => i.id !== productId);
    window.db.saveCart(this.items);
    if (item) {
      this.notify(`تم إزالة "${item.name}" من السلة`, 'info');
    }
    this.renderCartUI();
  }

  clear() {
    this.items = [];
    this.coupon = null;
    window.db.clearCart();
    this.renderCartUI();
  }

  validateCartStock() {
    let changed = false;
    this.items.forEach(item => {
      const p = window.db.getProductById(item.id);
      if (p) {
        if (p.stock === 0) {
          this.items = this.items.filter(i => i.id !== item.id);
          this.notify(`نفد مخزون "${item.name}" وتم حذفه من السلة`, 'warning');
          changed = true;
        } else if (item.quantity > p.stock) {
          item.quantity = p.stock;
          this.notify(`تم تعديل كمية "${item.name}" لتناسب المخزون المتاح (${p.stock})`, 'info');
          changed = true;
        }
      }
    });
    if (changed) {
      window.db.saveCart(this.items);
      this.renderCartUI();
    }
  }

  // === الكوبون والحسابات ===
  applyCoupon(code) {
    if (!code || !code.trim()) {
      this.coupon = null;
      this.renderCartUI();
      return { success: false, message: 'يرجى إدخال كود الكوبون' };
    }

    const subtotal = this.getSubtotal();
    const result = window.db.validateCoupon(code, subtotal);
    if (result.valid) {
      this.coupon = result;
      this.notify(result.message, 'success');
      this.renderCartUI();
      return { success: true, message: result.message };
    } else {
      this.coupon = null;
      this.notify(result.message, 'error');
      this.renderCartUI();
      return { success: false, message: result.message };
    }
  }

  removeCoupon() {
    this.coupon = null;
    this.notify('تم إلغاء كود الخصم', 'info');
    this.renderCartUI();
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getDiscount() {
    if (!this.coupon) return 0;
    const subtotal = this.getSubtotal();
    return Math.round((subtotal * this.coupon.percent) / 100);
  }

  getShipping() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    const settings = window.db.getSettings();
    if (subtotal >= settings.freeShippingThreshold) {
      return 0; // شحن مجاني
    }
    return settings.shippingCost;
  }

  getTotal() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    const discount = this.getDiscount();
    const shipping = this.getShipping();
    return Math.max(0, subtotal - discount + shipping);
  }

  // === رسالة طلب الواتساب المجهزة تلقائياً ===
  generateWhatsAppOrderMessage(customerData = {}) {
    const settings = window.db.getSettings();
    const subtotal = this.getSubtotal();
    const discount = this.getDiscount();
    const shipping = this.getShipping();
    const total = this.getTotal();
    const curr = this.getCurrencyInfo();

    let text = `⚜️ *طلب شراء جديد - ${settings.storeNameAr}* ⚜️\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `👤 *بيانات العميل:*\n`;
    text += `• الاسم: ${customerData.name || 'عميل المتجر'}\n`;
    text += `• الجوال: ${customerData.phone || 'غير محدد'}\n`;
    text += `• المدينة: ${customerData.city || 'غير محددة'}\n`;
    if (customerData.address) text += `• العنوان: ${customerData.address}\n`;
    if (customerData.paymentMethod) {
      const payNames = { cod: 'دفع عند الاستلام', card: 'بطاقة بنكية', bank: 'تحويل بنكي / فودافون كاش' };
      text += `• طريقة الدفع: ${payNames[customerData.paymentMethod] || customerData.paymentMethod}\n`;
    }
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🛍️ *قائمة العطور المطلوبة:*\n`;

    this.items.forEach((item, index) => {
      text += `${index + 1}. *${item.name}* (${item.size})\n`;
      text += `   الكمية: ${item.quantity} × ${this.formatPrice(item.price)}\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💰 *الملخص المالي:*\n`;
    text += `• المجموع الفرعي: ${this.formatPrice(subtotal)}\n`;
    if (discount > 0) {
      text += `• الخصم (${this.coupon.code}): -${this.formatPrice(discount)}\n`;
    }
    text += `• الشحن: ${shipping === 0 ? '✨ مجاني' : this.formatPrice(shipping)}\n`;
    text += `• *المجموع الإجمالي: ${this.formatPrice(total)}*\n`;
    if (customerData.notes) {
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `📝 *ملاحظات:* ${customerData.notes}\n`;
    }
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `شكراً لاختياركم قصر العطور الملكي 👑`;

    return text;
  }

  openWhatsAppCheckout(customerData = {}) {
    const settings = window.db.getSettings();
    const phone = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const message = this.generateWhatsAppOrderMessage(customerData);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  // === إشعارات التوست الفاخرة ===
  notify(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `royal-toast ${type} animate-slide-in`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle text-amber-400';
    if (type === 'warning') icon = 'fa-exclamation-triangle text-yellow-500';
    if (type === 'error') icon = 'fa-times-circle text-rose-500';

    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <i class="fas ${icon} text-lg"></i>
        <div class="text-sm font-medium text-amber-100">${message}</div>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  // تحديث واجهة السلة في أي مكان بالصفحة
  renderCartUI() {
    const countBadges = document.querySelectorAll('.cart-badge');
    const totalCount = this.getTotalCount();
    countBadges.forEach(badge => {
      badge.textContent = totalCount;
      badge.style.display = totalCount > 0 ? 'flex' : 'none';
    });

    const cartDrawerItems = document.getElementById('cart-drawer-items');
    const cartEmptyState = document.getElementById('cart-empty-state');
    const cartFooter = document.getElementById('cart-footer');

    if (!cartDrawerItems) return;

    if (this.items.length === 0) {
      cartDrawerItems.innerHTML = '';
      if (cartEmptyState) cartEmptyState.style.display = 'flex';
      if (cartFooter) cartFooter.style.display = 'none';
      return;
    }

    if (cartEmptyState) cartEmptyState.style.display = 'none';
    if (cartFooter) cartFooter.style.display = 'block';

    const subtotal = this.getSubtotal();
    const discount = this.getDiscount();
    const shipping = this.getShipping();
    const total = this.getTotal();
    const settings = window.db.getSettings();

    // رندرة عناصر السلة
    cartDrawerItems.innerHTML = this.items.map(item => `
      <div class="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/80 border border-amber-900/30 hover:border-amber-600/40 transition">
        <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg border border-amber-500/20 shadow-md">
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-1">
            <h4 class="text-sm font-bold text-amber-100 truncate">${item.name}</h4>
            <button onclick="cartManager.removeItem('${item.id}')" class="text-neutral-500 hover:text-rose-400 p-1 transition" title="حذف">
              <i class="fas fa-trash-alt text-xs"></i>
            </button>
          </div>
          <div class="text-xs text-neutral-400 mt-0.5">${item.brand} • ${item.size}</div>
          <div class="flex items-center justify-between mt-2">
            <span class="text-amber-400 font-bold text-sm">${this.formatPrice(item.price)}</span>
            <div class="flex items-center border border-amber-900/50 rounded-lg overflow-hidden bg-black/40">
              <button onclick="cartManager.updateQuantity('${item.id}', ${item.quantity - 1})" class="w-7 h-7 flex items-center justify-center text-amber-200 hover:bg-amber-950/60 transition">-</button>
              <span class="w-8 text-center text-xs font-semibold text-amber-100">${item.quantity}</span>
              <button onclick="cartManager.updateQuantity('${item.id}', ${item.quantity + 1})" class="w-7 h-7 flex items-center justify-center text-amber-200 hover:bg-amber-950/60 transition">+</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // مؤشر الشحن المجاني
    const shippingProgressEl = document.getElementById('shipping-progress-container');
    if (shippingProgressEl) {
      const remainingForFree = Math.max(0, settings.freeShippingThreshold - subtotal);
      const percent = Math.min(100, Math.round((subtotal / settings.freeShippingThreshold) * 100));
      shippingProgressEl.innerHTML = `
        <div class="bg-amber-950/40 border border-amber-800/40 rounded-xl p-3 mb-3">
          <div class="flex justify-between text-xs text-amber-200 mb-1.5 font-medium">
            ${remainingForFree > 0 
              ? `<span>أضف <strong>${this.formatPrice(remainingForFree)}</strong> للشحن المجاني!</span>` 
              : `<span class="text-emerald-400 font-bold"><i class="fas fa-shipping-fast ml-1"></i> مبروك! حصلت على شحن ملكي مجاني</span>`}
            <span class="text-amber-400 font-bold">${percent}%</span>
          </div>
          <div class="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-amber-600 to-yellow-400 rounded-full transition-all duration-500" style="width: ${percent}%"></div>
          </div>
        </div>
      `;
    }

    // الملخص المالي
    const elSubtotal = document.getElementById('cart-subtotal-val');
    const elDiscount = document.getElementById('cart-discount-val');
    const elDiscountRow = document.getElementById('cart-discount-row');
    const elShipping = document.getElementById('cart-shipping-val');
    const elTotal = document.getElementById('cart-total-val');

    if (elSubtotal) elSubtotal.textContent = this.formatPrice(subtotal);
    if (elDiscountRow && elDiscount) {
      if (discount > 0) {
        elDiscountRow.style.display = 'flex';
        elDiscount.textContent = `-${this.formatPrice(discount)}`;
      } else {
        elDiscountRow.style.display = 'none';
      }
    }
    if (elShipping) {
      elShipping.textContent = shipping === 0 ? 'مجاني' : this.formatPrice(shipping);
      if (shipping === 0) elShipping.className = 'text-emerald-400 font-bold text-sm';
      else elShipping.className = 'text-amber-100 text-sm';
    }
    if (elTotal) elTotal.textContent = this.formatPrice(total);
  }
}

// إنشاء نسخة السلة العامة
window.cartManager = new CartManager();
