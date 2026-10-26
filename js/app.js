/**
 * منطق واجهة متجر قصر العطور الملكي
 * Royal Perfumes Palace - Main Store Frontend Controller
 */

class RoyalStoreApp {
  constructor() {
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.sortBy = 'featured';
    this.inStockOnly = false;
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderProducts();
    this.setupCurrencySelector();

    // الاستماع للتحديثات في قاعدة البيانات
    window.addEventListener('db:productsUpdated', () => this.renderProducts());
    window.addEventListener('db:stockUpdated', () => this.renderProducts());
    window.addEventListener('db:wishlistUpdated', () => this.renderProducts());
    window.addEventListener('currencyChanged', () => {
      this.renderProducts();
      window.cartManager.renderCartUI();
    });
  }

  bindEvents() {
    // شريط البحث
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.renderProducts();
      });
    }

    // تصنيفات العطور
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        categoryTabs.forEach(t => t.classList.remove('active-tab'));
        tab.classList.add('active-tab');
        this.currentCategory = tab.dataset.category || 'all';
        this.renderProducts();
      });
    });

    // الترتيب
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.renderProducts();
      });
    }

    // تصفية المتوفر فقط
    const stockFilter = document.getElementById('stock-filter-checkbox');
    if (stockFilter) {
      stockFilter.addEventListener('change', (e) => {
        this.inStockOnly = e.target.checked;
        this.renderProducts();
      });
    }
  }

  setupCurrencySelector() {
    const selector = document.getElementById('currency-select');
    if (selector) {
      selector.value = window.cartManager.currentCurrency;
      selector.addEventListener('change', (e) => {
        window.cartManager.setCurrency(e.target.value);
      });
    }
  }

  getFilteredProducts() {
    let products = window.db.getProducts();

    // 1. فلتر التصنيف
    if (this.currentCategory !== 'all') {
      products = products.filter(p => p.category === this.currentCategory);
    }

    // 2. فلتر البحث
    if (this.searchQuery) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(this.searchQuery) ||
        p.brand.toLowerCase().includes(this.searchQuery) ||
        (p.topNotes && p.topNotes.toLowerCase().includes(this.searchQuery)) ||
        (p.heartNotes && p.heartNotes.toLowerCase().includes(this.searchQuery)) ||
        (p.baseNotes && p.baseNotes.toLowerCase().includes(this.searchQuery)) ||
        (p.description && p.description.toLowerCase().includes(this.searchQuery))
      );
    }

    // 3. فلتر المتوفر بالمخزون
    if (this.inStockOnly) {
      products = products.filter(p => p.stock > 0);
    }

    // 4. الترتيب
    switch (this.sortBy) {
      case 'price-asc':
        products.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price-desc':
        products.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'bestseller':
        products.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
        break;
      case 'featured':
      default:
        products.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return products;
  }

  renderProducts() {
    const grid = document.getElementById('products-grid');
    const emptyState = document.getElementById('products-empty');
    const countDisplay = document.getElementById('products-count');

    if (!grid) return;

    const products = this.getFilteredProducts();

    if (countDisplay) {
      countDisplay.textContent = `عرض ${products.length} عطر فاخر`;
    }

    if (products.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    grid.innerHTML = products.map(product => this.createProductCardHTML(product)).join('');
  }

  createProductCardHTML(p) {
    const isWishlist = window.db.isInWishlist(p.id);
    const hasDiscount = p.discountPrice && p.discountPrice < p.price;
    const discountPercent = hasDiscount ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0;
    const isOutOfStock = p.stock <= 0;
    const isLowStock = p.stock > 0 && p.stock <= 4;

    return `
      <div class="royal-card group rounded-2xl overflow-hidden bg-neutral-900/90 border border-amber-900/40 hover:border-amber-500/70 transition-all duration-300 flex flex-col relative shadow-xl">
        <!-- الصورة والشارات -->
        <div class="relative overflow-hidden aspect-[4/5] bg-black/50">
          <img 
            src="${p.image}" 
            alt="${p.name}" 
            loading="lazy" 
            class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/30 pointer-events-none"></div>

          <!-- شارات الحالة -->
          <div class="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
            ${p.badge ? `<span class="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-gradient-to-r from-amber-600 to-yellow-500 text-black shadow-md">${p.badge}</span>` : ''}
            ${hasDiscount ? `<span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-600 text-white shadow-md">خصم ${discountPercent}%</span>` : ''}
          </div>

          <!-- زر المفضلة -->
          <button 
            onclick="royalApp.toggleWishlist('${p.id}')" 
            class="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 flex items-center justify-center text-amber-200 hover:text-rose-500 hover:border-rose-500 transition z-10"
            title="${isWishlist ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}"
          >
            <i class="${isWishlist ? 'fas fa-heart text-rose-500' : 'far fa-heart'} text-sm"></i>
          </button>

          <!-- حالة المخزون المنخفض -->
          ${isOutOfStock ? `
            <div class="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center z-20">
              <span class="px-4 py-1.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-600 text-xs font-bold">نفد من المخزون</span>
            </div>
          ` : isLowStock ? `
            <div class="absolute bottom-2 right-2 left-2 text-center py-1 bg-amber-950/80 border border-amber-500/40 rounded-lg text-[11px] text-amber-300 font-semibold backdrop-blur-sm">
              <i class="fas fa-fire ml-1 text-amber-400"></i> متبقي ${p.stock} قطع فقط!
            </div>
          ` : ''}

          <!-- زر المعاينة السريعة يظهر عند التمرير -->
          <button 
            onclick="royalApp.openQuickView('${p.id}')" 
            class="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/80 hover:bg-amber-600 text-amber-200 hover:text-black border border-amber-500/40 text-xs font-bold backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1.5 z-10"
          >
            <i class="fas fa-eye"></i> معاينة سريعة
          </button>
        </div>

        <!-- معلومات العطر -->
        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span class="text-amber-500/90 font-medium">${p.brand}</span>
              <span class="text-[11px] bg-neutral-800/80 px-2 py-0.5 rounded text-neutral-300">${p.size}</span>
            </div>

            <h3 class="text-base font-bold text-amber-100 group-hover:text-amber-300 transition line-clamp-1 mb-1.5">
              ${p.name}
            </h3>

            <!-- الهرم العطري المبسط -->
            <p class="text-xs text-neutral-400 line-clamp-1 mb-2">
              <i class="fas fa-feather-alt text-amber-500/70 text-[10px] ml-1"></i>
              ${p.topNotes || p.description}
            </p>

            <!-- التقييم -->
            <div class="flex items-center gap-1.5 mb-3">
              <div class="flex text-amber-400 text-xs">
                ${'<i class="fas fa-star"></i>'.repeat(Math.floor(p.rating))}
              </div>
              <span class="text-xs font-bold text-amber-300">${p.rating}</span>
              <span class="text-[11px] text-neutral-500">(${p.reviewsCount})</span>
            </div>
          </div>

          <!-- السعر والأزرار -->
          <div class="pt-3 border-t border-amber-900/30 flex items-center justify-between gap-2">
            <div>
              <div class="flex items-baseline gap-1.5">
                <span class="text-lg font-black text-amber-400">${window.cartManager.formatPrice(p.discountPrice || p.price)}</span>
                ${hasDiscount ? `
                  <span class="text-xs text-neutral-500 line-through">${window.cartManager.formatPrice(p.price)}</span>
                ` : ''}
              </div>
            </div>

            <button 
              onclick="window.cartManager.addItem('${p.id}')" 
              ${isOutOfStock ? 'disabled' : ''}
              class="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                isOutOfStock 
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black hover:shadow-lg hover:shadow-amber-500/20 active:scale-95'
              }"
            >
              <i class="fas fa-shopping-bag"></i>
              <span>${isOutOfStock ? 'نفد' : 'شراء'}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  toggleWishlist(productId) {
    const res = window.db.toggleWishlist(productId);
    const p = window.db.getProductById(productId);
    if (p) {
      if (res.added) {
        window.cartManager.notify(`تمت إضافة "${p.name}" إلى قائمة المفضلة ❤️`, 'success');
      } else {
        window.cartManager.notify(`تمت إزالة "${p.name}" من المفضلة`, 'info');
      }
    }
  }

  // === المعاينة السريعة (Quick View Modal) ===
  openQuickView(productId) {
    const p = window.db.getProductById(productId);
    if (!p) return;

    const modal = document.getElementById('quickview-modal');
    const container = document.getElementById('quickview-content');
    if (!modal || !container) return;

    const hasDiscount = p.discountPrice && p.discountPrice < p.price;
    const isOutOfStock = p.stock <= 0;

    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <!-- صورة العطر -->
        <div class="relative rounded-2xl overflow-hidden bg-black/60 border border-amber-900/40 aspect-square flex items-center justify-center">
          <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover">
          ${p.badge ? `<span class="absolute top-4 right-4 px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-amber-600 to-yellow-500 text-black shadow-md">${p.badge}</span>` : ''}
        </div>

        <!-- تفاصيل العطر والهرم العطري -->
        <div class="flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs uppercase tracking-wider text-amber-500 font-bold">${p.brand}</span>
              <span class="text-xs bg-amber-950/60 text-amber-300 border border-amber-800/40 px-2.5 py-0.5 rounded-full">${p.concentration}</span>
            </div>

            <h2 class="text-2xl font-black text-amber-100 mb-2">${p.name}</h2>

            <div class="flex items-baseline gap-2 mb-4">
              <span class="text-2xl font-bold text-amber-400">${window.cartManager.formatPrice(p.discountPrice || p.price)}</span>
              ${hasDiscount ? `<span class="text-sm text-neutral-500 line-through">${window.cartManager.formatPrice(p.price)}</span>` : ''}
              <span class="text-xs text-neutral-400 mr-2">(${p.size})</span>
            </div>

            <p class="text-neutral-300 text-xs leading-relaxed mb-4">${p.description}</p>

            <!-- الهرم العطري الفاخر -->
            <div class="bg-neutral-900/90 border border-amber-900/40 rounded-xl p-3.5 mb-4 space-y-2">
              <h4 class="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-2">
                <i class="fas fa-layer-group text-amber-400"></i> الهرم العطري والمكونات:
              </h4>
              <div class="text-xs text-neutral-300 flex items-start gap-2">
                <span class="text-amber-400 font-bold min-w-[75px]">🌿 الافتتاحية:</span>
                <span>${p.topNotes || 'نوتات منعشة فاخرة'}</span>
              </div>
              <div class="text-xs text-neutral-300 flex items-start gap-2">
                <span class="text-amber-400 font-bold min-w-[75px]">🌸 قلب العطر:</span>
                <span>${p.heartNotes || 'أزهار وتوابل ملكية'}</span>
              </div>
              <div class="text-xs text-neutral-300 flex items-start gap-2">
                <span class="text-amber-400 font-bold min-w-[75px]">🪵 القاعدة:</span>
                <span>${p.baseNotes || 'أخشاب ثمينة وعنبر ومسك'}</span>
              </div>
            </div>

            <!-- مؤشرات الثبات والفوحان -->
            <div class="grid grid-cols-2 gap-2 text-xs mb-4">
              <div class="p-2 rounded-lg bg-neutral-900 border border-amber-950/80 flex items-center gap-2">
                <i class="fas fa-stopwatch text-amber-400"></i>
                <span class="text-neutral-300">${p.longevity || 'ثبات 24 ساعة'}</span>
              </div>
              <div class="p-2 rounded-lg bg-neutral-900 border border-amber-950/80 flex items-center gap-2">
                <i class="fas fa-wind text-amber-400"></i>
                <span class="text-neutral-300">${p.sillage || 'فوحان ممتاز'}</span>
              </div>
            </div>
          </div>

          <!-- إجراءات الشراء -->
          <div class="space-y-2.5 pt-3 border-t border-amber-900/40">
            <div class="flex items-center gap-3">
              <div class="flex items-center border border-amber-500/40 rounded-xl overflow-hidden bg-black/50">
                <button onclick="royalApp.adjustQuickViewQty(-1)" class="w-9 h-9 flex items-center justify-center text-amber-300 hover:bg-amber-900/40 transition">-</button>
                <input id="quickview-qty" type="number" value="1" min="1" max="${p.stock}" readonly class="w-10 text-center bg-transparent text-amber-100 text-sm font-bold border-none focus:outline-none">
                <button onclick="royalApp.adjustQuickViewQty(1, ${p.stock})" class="w-9 h-9 flex items-center justify-center text-amber-300 hover:bg-amber-900/40 transition">+</button>
              </div>

              <button 
                onclick="royalApp.addQuickViewToCart('${p.id}')"
                ${isOutOfStock ? 'disabled' : ''}
                class="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition ${
                  isOutOfStock 
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black hover:shadow-lg hover:shadow-amber-500/20'
                }"
              >
                <i class="fas fa-shopping-bag"></i>
                <span>${isOutOfStock ? 'المنتج غير متوفر' : 'إضافة إلى السلة'}</span>
              </button>
            </div>

            <button 
              onclick="royalApp.buyViaWhatsAppDirect('${p.id}')"
              class="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600/90 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition border border-emerald-400/40"
            >
              <i class="fab fa-whatsapp text-base"></i>
              <span>طلب مباشر وفوري عبر الواتساب</span>
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeQuickView() {
    const modal = document.getElementById('quickview-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  adjustQuickViewQty(delta, maxStock = 99) {
    const input = document.getElementById('quickview-qty');
    if (!input) return;
    let current = parseInt(input.value) || 1;
    let next = current + delta;
    if (next < 1) next = 1;
    if (next > maxStock) next = maxStock;
    input.value = next;
  }

  addQuickViewToCart(productId) {
    const input = document.getElementById('quickview-qty');
    const qty = input ? parseInt(input.value) || 1 : 1;
    window.cartManager.addItem(productId, qty);
    this.closeQuickView();
  }

  buyViaWhatsAppDirect(productId) {
    const p = window.db.getProductById(productId);
    if (!p) return;
    const input = document.getElementById('quickview-qty');
    const qty = input ? parseInt(input.value) || 1 : 1;
    const settings = window.db.getSettings();
    const phone = settings.whatsappNumber.replace(/[^0-9]/g, '');

    const text = `⚜️ *استفسار وطلب مباشر من قصر العطور الملكي* ⚜️\n` +
                 `━━━━━━━━━━━━━━━━━━━━━\n` +
                 `العطر: *${p.name}* (${p.brand})\n` +
                 `الحجم: ${p.size}\n` +
                 `الكمية: ${qty}\n` +
                 `السعر: ${window.cartManager.formatPrice((p.discountPrice || p.price) * qty)}\n` +
                 `━━━━━━━━━━━━━━━━━━━━━\n` +
                 `أود تأكيد طلب هذا العطر والشحن إلى عنواني، برجاء تزويدي بالتفاصيل.`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  // === إتمام الطلب (Checkout Process) ===
  openCheckoutModal() {
    if (window.cartManager.getItems().length === 0) {
      window.cartManager.notify('سلة مشترياتك فارغة!', 'warning');
      return;
    }

    const modal = document.getElementById('checkout-modal');
    if (!modal) return;

    // ملء بيانات العميل تلقائياً إن كان مسجل دخول
    const user = window.authManager.currentUser;
    if (user) {
      const nameInput = document.getElementById('checkout-name');
      const phoneInput = document.getElementById('checkout-phone');
      const emailInput = document.getElementById('checkout-email');
      const cityInput = document.getElementById('checkout-city');
      const addressInput = document.getElementById('checkout-address');

      if (nameInput) nameInput.value = user.name || '';
      if (phoneInput) phoneInput.value = user.phone || '';
      if (emailInput) emailInput.value = user.email || '';
      if (cityInput) cityInput.value = user.city || '';
      if (addressInput) addressInput.value = user.address || '';
    }

    // تحديث ملخص السلة في المودال
    this.renderCheckoutSummary();

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    this.toggleCartDrawer(false); // غلق السلة
  }

  closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  renderCheckoutSummary() {
    const summaryContainer = document.getElementById('checkout-summary-items');
    if (!summaryContainer) return;

    const items = window.cartManager.getItems();
    summaryContainer.innerHTML = items.map(item => `
      <div class="flex items-center justify-between text-xs py-1.5 border-b border-neutral-800">
        <div class="flex items-center gap-2 truncate">
          <span class="text-amber-400 font-bold">×${item.quantity}</span>
          <span class="text-neutral-200 truncate">${item.name}</span>
        </div>
        <span class="text-amber-300 font-semibold">${window.cartManager.formatPrice(item.price * item.quantity)}</span>
      </div>
    `).join('');

    const elSubtotal = document.getElementById('checkout-subtotal');
    const elDiscount = document.getElementById('checkout-discount');
    const elShipping = document.getElementById('checkout-shipping');
    const elTotal = document.getElementById('checkout-total');

    if (elSubtotal) elSubtotal.textContent = window.cartManager.formatPrice(window.cartManager.getSubtotal());
    if (elDiscount) elDiscount.textContent = `-${window.cartManager.formatPrice(window.cartManager.getDiscount())}`;
    if (elShipping) elShipping.textContent = window.cartManager.getShipping() === 0 ? 'مجاني' : window.cartManager.formatPrice(window.cartManager.getShipping());
    if (elTotal) elTotal.textContent = window.cartManager.formatPrice(window.cartManager.getTotal());
  }

  handleCheckoutSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('checkout-name')?.value.trim();
    const phone = document.getElementById('checkout-phone')?.value.trim();
    const city = document.getElementById('checkout-city')?.value.trim();
    const address = document.getElementById('checkout-address')?.value.trim();
    const email = document.getElementById('checkout-email')?.value.trim();
    const notes = document.getElementById('checkout-notes')?.value.trim();
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cod';

    if (!name || !phone || !city || !address) {
      window.cartManager.notify('يرجى ملء جميع الحقول الإلزامية (الاسم، الجوال، المدينة، العنوان)', 'error');
      return;
    }

    const orderData = {
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      city: city,
      address: address,
      notes: notes,
      paymentMethod: paymentMethod,
      items: window.cartManager.getItems(),
      subtotal: window.cartManager.getSubtotal(),
      discount: window.cartManager.getDiscount(),
      shipping: window.cartManager.getShipping(),
      total: window.cartManager.getTotal(),
      couponCode: window.cartManager.coupon ? window.cartManager.coupon.code : ''
    };

    const newOrder = window.db.addOrder(orderData);
    this.closeCheckoutModal();
    window.cartManager.clear();

    // عرض شاشة تأكيد الطلب الملكية
    this.showOrderConfirmation(newOrder);
  }

  showOrderConfirmation(order) {
    const modal = document.getElementById('order-success-modal');
    if (!modal) return;

    const numEl = document.getElementById('success-order-id');
    const totalEl = document.getElementById('success-order-total');
    const nameEl = document.getElementById('success-order-name');
    const waBtn = document.getElementById('success-whatsapp-btn');

    if (numEl) numEl.textContent = order.id;
    if (totalEl) totalEl.textContent = window.cartManager.formatPrice(order.total);
    if (nameEl) nameEl.textContent = order.customerName;

    if (waBtn) {
      waBtn.onclick = () => {
        const settings = window.db.getSettings();
        const phone = settings.whatsappNumber.replace(/[^0-9]/g, '');
        const msg = `مرحباً، أود تأكيد طلبي رقم *${order.id}* باسم *${order.customerName}* بمبلغ *${window.cartManager.formatPrice(order.total)}*.`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
      };
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeOrderConfirmation() {
    const modal = document.getElementById('order-success-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  // التحكم بـ Drawer السلة
  toggleCartDrawer(open = true) {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-drawer-overlay');
    if (!drawer) return;

    if (open) {
      drawer.classList.remove('-translate-x-full');
      if (overlay) overlay.classList.remove('hidden');
    } else {
      drawer.classList.add('-translate-x-full');
      if (overlay) overlay.classList.add('hidden');
    }
  }
}

// تشغيل التطبيق بعد تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  window.royalApp = new RoyalStoreApp();
});
