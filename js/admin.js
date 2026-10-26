/**
 * لوحة تحكم متجر قصر العطور الملكي
 * Royal Perfumes Palace - Admin & Inventory Controller
 */

class RoyalAdminPanel {
  constructor() {
    this.currentTab = 'overview';
    this.editingProductId = null;
    this.init();
  }

  init() {
    this.checkAdminAccess();
    this.bindEvents();
    this.renderCurrentTab();

    // الاستماع للتحديثات
    window.addEventListener('db:productsUpdated', () => this.refreshData());
    window.addEventListener('db:ordersUpdated', () => this.refreshData());
    window.addEventListener('db:stockUpdated', () => this.refreshData());
  }

  checkAdminAccess() {
    const user = window.db.getCurrentUser();
    const loginGuard = document.getElementById('admin-login-guard');
    const mainContent = document.getElementById('admin-main-content');

    if (!user || user.role !== 'admin') {
      if (loginGuard) loginGuard.classList.remove('hidden');
      if (mainContent) mainContent.classList.add('hidden');
    } else {
      if (loginGuard) loginGuard.classList.add('hidden');
      if (mainContent) mainContent.classList.remove('hidden');
      const adminNameEl = document.getElementById('admin-profile-name');
      if (adminNameEl) adminNameEl.textContent = user.name;
    }
  }

  adminQuickLogin() {
    try {
      window.db.loginUser('admin@royalperfumes.com', 'admin');
      this.checkAdminAccess();
      this.refreshData();
      window.cartManager.notify('تم تسجيل الدخول كمدير بنجاح 👑', 'success');
    } catch (err) {
      window.cartManager.notify(err.message, 'error');
    }
  }

  bindEvents() {
    // تبويبات لوحة التحكم
    const navItems = document.querySelectorAll('.admin-nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        navItems.forEach(n => n.classList.remove('active-admin-nav'));
        item.classList.add('active-admin-nav');
        this.currentTab = item.dataset.tab;
        this.renderCurrentTab();
      });
    });

    // معالجة رفع صورة العطر وتحويلها لـ Base64
    const imgFileInput = document.getElementById('perfume-image-file');
    if (imgFileInput) {
      imgFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const urlInput = document.getElementById('perfume-image');
            if (urlInput) urlInput.value = event.target.result;
            const preview = document.getElementById('perfume-image-preview');
            if (preview) {
              preview.src = event.target.result;
              preview.classList.remove('hidden');
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // معاينة رابط الصورة العادي
    const imgUrlInput = document.getElementById('perfume-image');
    if (imgUrlInput) {
      imgUrlInput.addEventListener('input', (e) => {
        const preview = document.getElementById('perfume-image-preview');
        if (preview && e.target.value) {
          preview.src = e.target.value;
          preview.classList.remove('hidden');
        }
      });
    }
  }

  refreshData() {
    this.renderStats();
    if (this.currentTab === 'products') this.renderProductsTable();
    if (this.currentTab === 'inventory') this.renderInventoryTable();
    if (this.currentTab === 'orders') this.renderOrdersTable();
    if (this.currentTab === 'customers') this.renderCustomersTable();
  }

  renderCurrentTab() {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.admin-section').forEach(sec => sec.classList.add('hidden'));

    const activeSection = document.getElementById(`section-${this.currentTab}`);
    if (activeSection) {
      activeSection.classList.remove('hidden');
    }

    this.renderStats();

    switch (this.currentTab) {
      case 'overview':
        this.renderOverview();
        break;
      case 'products':
        this.renderProductsTable();
        break;
      case 'inventory':
        this.renderInventoryTable();
        break;
      case 'orders':
        this.renderOrdersTable();
        break;
      case 'customers':
        this.renderCustomersTable();
        break;
      case 'coupons':
        this.renderCouponsTable();
        break;
      case 'settings':
        this.renderSettingsForm();
        break;
    }
  }

  // === الإحصائيات (Metrics) ===
  renderStats() {
    const products = window.db.getProducts();
    const orders = window.db.getOrders();

    const totalSales = orders.reduce((sum, o) => o.status !== 'cancelled' ? sum + o.total : sum, 0);
    const lowStockCount = products.filter(p => p.stock <= 4).length;
    const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

    const elSales = document.getElementById('stat-total-sales');
    const elOrders = document.getElementById('stat-total-orders');
    const elProducts = document.getElementById('stat-total-products');
    const elProductsOverview = document.getElementById('stat-total-products-overview');
    const elLowStock = document.getElementById('stat-low-stock');
    const elLowStockOverview = document.getElementById('stat-low-stock-overview');
    const elPendingBadge = document.getElementById('stat-pending-orders-badge');

    if (elSales) elSales.textContent = window.cartManager.formatPrice(totalSales);
    if (elOrders) elOrders.textContent = orders.length;
    if (elProducts) elProducts.textContent = products.length;
    if (elProductsOverview) elProductsOverview.textContent = products.length;
    if (elLowStock) elLowStock.textContent = lowStockCount;
    if (elLowStockOverview) elLowStockOverview.textContent = lowStockCount;
    if (elPendingBadge) {
      elPendingBadge.textContent = pendingOrdersCount;
      elPendingBadge.style.display = pendingOrdersCount > 0 ? 'inline-block' : 'none';
    }
  }

  renderOverview() {
    const orders = window.db.getOrders().slice(0, 5);
    const products = window.db.getProducts();
    const lowStockItems = products.filter(p => p.stock <= 4).slice(0, 4);

    const recentOrdersContainer = document.getElementById('overview-recent-orders');
    if (recentOrdersContainer) {
      if (orders.length === 0) {
        recentOrdersContainer.innerHTML = `<p class="text-neutral-500 text-xs py-4 text-center">لا توجد طلبات بعد</p>`;
      } else {
        recentOrdersContainer.innerHTML = orders.map(o => `
          <div class="flex items-center justify-between p-3 bg-neutral-900/60 rounded-xl border border-amber-950/60">
            <div>
              <div class="text-xs font-bold text-amber-200">${o.id} - ${o.customerName}</div>
              <div class="text-[11px] text-neutral-400">${o.createdAt} • ${o.items.length} عطور</div>
            </div>
            <div class="text-left">
              <div class="text-xs font-bold text-amber-400">${window.cartManager.formatPrice(o.total)}</div>
              <span class="text-[10px] px-2 py-0.5 rounded-full ${this.getStatusBadgeClass(o.status)}">${this.getStatusLabel(o.status)}</span>
            </div>
          </div>
        `).join('');
      }
    }

    const lowStockContainer = document.getElementById('overview-low-stock-items');
    if (lowStockContainer) {
      if (lowStockItems.length === 0) {
        lowStockContainer.innerHTML = `<p class="text-emerald-400 text-xs py-4 text-center"><i class="fas fa-check-circle ml-1"></i> المخزون ممتاز لجميع العطور</p>`;
      } else {
        lowStockContainer.innerHTML = lowStockItems.map(p => `
          <div class="flex items-center justify-between p-2.5 bg-neutral-900/60 rounded-xl border border-rose-950/40">
            <div class="flex items-center gap-2.5">
              <img src="${p.image}" class="w-10 h-10 object-cover rounded-lg border border-amber-500/20">
              <div>
                <div class="text-xs font-bold text-neutral-200 truncate max-w-[150px]">${p.name}</div>
                <div class="text-[11px] text-rose-400 font-semibold">${p.stock === 0 ? 'نفد تماماً' : `متبقي ${p.stock} فقط`}</div>
              </div>
            </div>
            <button onclick="royalAdmin.quickAddStock('${p.id}', 10)" class="px-2.5 py-1 text-xs bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black rounded-lg transition font-bold">
              +10 تزويد
            </button>
          </div>
        `).join('');
      }
    }
  }

  // === إدارة المنتجات (Products Table & Modal) ===
  renderProductsTable() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    const products = window.db.getProducts();
    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-neutral-500">لا توجد منتجات مسجلة</td></tr>`;
      return;
    }

    tbody.innerHTML = products.map(p => `
      <tr class="border-b border-neutral-800/80 hover:bg-neutral-900/50 transition">
        <td class="p-3">
          <div class="flex items-center gap-3">
            <img src="${p.image}" alt="${p.name}" class="w-12 h-12 object-cover rounded-xl border border-amber-500/30">
            <div>
              <div class="font-bold text-amber-100 text-sm">${p.name}</div>
              <div class="text-xs text-neutral-400">${p.brand} • ${p.size}</div>
            </div>
          </div>
        </td>
        <td class="p-3 text-xs text-neutral-300">${p.categoryName || p.category}</td>
        <td class="p-3 text-xs">
          <div class="font-bold text-amber-400">${window.cartManager.formatPrice(p.discountPrice || p.price)}</div>
          ${p.discountPrice && p.discountPrice < p.price ? `<div class="text-[10px] text-neutral-500 line-through">${window.cartManager.formatPrice(p.price)}</div>` : ''}
        </td>
        <td class="p-3 text-xs">
          <span class="px-2.5 py-1 rounded-full text-xs font-bold ${
            p.stock === 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
            p.stock <= 4 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }">
            ${p.stock} قطعة
          </span>
        </td>
        <td class="p-3 text-xs">
          <div class="flex items-center gap-1 text-amber-400">
            <i class="fas fa-star text-[10px]"></i>
            <span>${p.rating}</span>
          </div>
        </td>
        <td class="p-3 text-xs text-center">
          ${p.badge ? `<span class="bg-amber-950/80 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded text-[10px]">${p.badge}</span>` : '-'}
        </td>
        <td class="p-3 text-xs text-left">
          <div class="flex items-center justify-end gap-2">
            <button onclick="royalAdmin.openEditProductModal('${p.id}')" class="p-2 text-amber-400 hover:text-amber-200 hover:bg-neutral-800 rounded-lg transition" title="تعديل">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="royalAdmin.deleteProduct('${p.id}')" class="p-2 text-rose-400 hover:text-rose-200 hover:bg-neutral-800 rounded-lg transition" title="حذف">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  openAddProductModal() {
    this.editingProductId = null;
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('product-modal-title');
    const preview = document.getElementById('perfume-image-preview');

    if (form) form.reset();
    if (preview) {
      preview.src = '';
      preview.classList.add('hidden');
    }
    if (title) title.textContent = 'إضافة عطر جديد إلى المتجر ⚜️';

    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  openEditProductModal(id) {
    const p = window.db.getProductById(id);
    if (!p) return;

    this.editingProductId = id;
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('product-modal-title');

    if (title) title.textContent = `تعديل عطر: ${p.name}`;

    // ملء حقول النموذج
    document.getElementById('perfume-name').value = p.name;
    document.getElementById('perfume-brand').value = p.brand;
    document.getElementById('perfume-category').value = p.category;
    document.getElementById('perfume-price').value = p.price;
    document.getElementById('perfume-discount-price').value = p.discountPrice || p.price;
    document.getElementById('perfume-stock').value = p.stock;
    document.getElementById('perfume-size').value = p.size;
    document.getElementById('perfume-concentration').value = p.concentration;
    document.getElementById('perfume-image').value = p.image;
    document.getElementById('perfume-badge').value = p.badge || '';
    document.getElementById('perfume-description').value = p.description || '';
    document.getElementById('perfume-top-notes').value = p.topNotes || '';
    document.getElementById('perfume-heart-notes').value = p.heartNotes || '';
    document.getElementById('perfume-base-notes').value = p.baseNotes || '';
    document.getElementById('perfume-longevity').value = p.longevity || '';
    document.getElementById('perfume-sillage').value = p.sillage || '';
    document.getElementById('perfume-featured').checked = !!p.isFeatured;
    document.getElementById('perfume-bestseller').checked = !!p.isBestseller;

    const preview = document.getElementById('perfume-image-preview');
    if (preview && p.image) {
      preview.src = p.image;
      preview.classList.remove('hidden');
    }

    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    this.editingProductId = null;
  }

  handleProductSubmit(e) {
    e.preventDefault();

    const data = {
      name: document.getElementById('perfume-name').value.trim(),
      brand: document.getElementById('perfume-brand').value.trim(),
      category: document.getElementById('perfume-category').value,
      price: Number(document.getElementById('perfume-price').value),
      discountPrice: document.getElementById('perfume-discount-price').value ? Number(document.getElementById('perfume-discount-price').value) : null,
      stock: Number(document.getElementById('perfume-stock').value),
      size: document.getElementById('perfume-size').value.trim(),
      concentration: document.getElementById('perfume-concentration').value.trim(),
      image: document.getElementById('perfume-image').value.trim() || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
      badge: document.getElementById('perfume-badge').value.trim(),
      description: document.getElementById('perfume-description').value.trim(),
      topNotes: document.getElementById('perfume-top-notes').value.trim(),
      heartNotes: document.getElementById('perfume-heart-notes').value.trim(),
      baseNotes: document.getElementById('perfume-base-notes').value.trim(),
      longevity: document.getElementById('perfume-longevity').value.trim(),
      sillage: document.getElementById('perfume-sillage').value.trim(),
      isFeatured: document.getElementById('perfume-featured').checked,
      isBestseller: document.getElementById('perfume-bestseller').checked
    };

    if (this.editingProductId) {
      window.db.updateProduct(this.editingProductId, data);
      window.cartManager.notify('تم تحديث بيانات العطر بنجاح!', 'success');
    } else {
      window.db.addProduct(data);
      window.cartManager.notify('تمت إضافة العطر الجديد للمتجر بنجاح!', 'success');
    }

    this.closeProductModal();
    this.refreshData();
  }

  deleteProduct(id) {
    const p = window.db.getProductById(id);
    if (!p) return;
    if (confirm(`هل أنت متأكد من حذف عطر "${p.name}"؟ لن يمكن التراجع.`)) {
      window.db.deleteProduct(id);
      window.cartManager.notify('تم حذف العطر بنجاح', 'info');
      this.refreshData();
    }
  }

  // === إدارة المخزون (Inventory Management) ===
  renderInventoryTable() {
    const tbody = document.getElementById('inventory-table-body');
    if (!tbody) return;

    const products = window.db.getProducts();

    tbody.innerHTML = products.map(p => `
      <tr class="border-b border-neutral-800/80 hover:bg-neutral-900/50 transition">
        <td class="p-3">
          <div class="flex items-center gap-3">
            <img src="${p.image}" class="w-10 h-10 object-cover rounded-lg border border-amber-500/20">
            <div>
              <div class="font-bold text-amber-100 text-xs">${p.name}</div>
              <div class="text-[11px] text-neutral-400">${p.brand}</div>
            </div>
          </div>
        </td>
        <td class="p-3 text-xs text-neutral-300">${p.categoryName || p.category}</td>
        <td class="p-3 text-xs font-bold text-amber-300">${window.cartManager.formatPrice(p.discountPrice || p.price)}</td>
        <td class="p-3 text-xs">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full ${p.stock === 0 ? 'bg-rose-500' : p.stock <= 4 ? 'bg-yellow-400 animate-pulse' : 'bg-emerald-500'}"></span>
            <span class="font-bold text-xs ${p.stock === 0 ? 'text-rose-400' : p.stock <= 4 ? 'text-yellow-400' : 'text-emerald-400'}">
              ${p.stock === 0 ? 'نفد من المخزون' : p.stock <= 4 ? `مخزون حرج (${p.stock})` : `متوفر (${p.stock})`}
            </span>
          </div>
        </td>
        <td class="p-3">
          <div class="flex items-center gap-2">
            <button onclick="royalAdmin.adjustStockDirect('${p.id}', -1)" class="w-7 h-7 bg-neutral-800 hover:bg-rose-950 text-neutral-200 rounded-lg text-xs font-bold transition">-1</button>
            <input 
              type="number" 
              value="${p.stock}" 
              min="0"
              onchange="royalAdmin.setStockDirect('${p.id}', this.value)"
              class="w-14 text-center bg-black/60 border border-neutral-700 rounded-lg text-xs font-bold text-amber-200 py-1 focus:border-amber-500 focus:outline-none"
            >
            <button onclick="royalAdmin.adjustStockDirect('${p.id}', 1)" class="w-7 h-7 bg-neutral-800 hover:bg-emerald-950 text-neutral-200 rounded-lg text-xs font-bold transition">+1</button>
            <button onclick="royalAdmin.quickAddStock('${p.id}', 10)" class="px-2 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black rounded-lg text-[11px] font-bold transition">
              +10 تزويد
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  adjustStockDirect(id, delta) {
    window.db.adjustStock(id, delta);
    this.refreshData();
  }

  setStockDirect(id, val) {
    window.db.updateStock(id, parseInt(val) || 0);
    this.refreshData();
  }

  quickAddStock(id, amount) {
    window.db.adjustStock(id, amount);
    window.cartManager.notify(`تم تزويد المخزون بـ ${amount} قطعة بنجاح!`, 'success');
    this.refreshData();
  }

  // === إدارة الطلبات (Orders Management) ===
  renderOrdersTable() {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;

    const orders = window.db.getOrders();
    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-neutral-500">لا توجد طلبات واردة حتى الآن</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(o => `
      <tr class="border-b border-neutral-800/80 hover:bg-neutral-900/50 transition">
        <td class="p-3 text-xs font-bold text-amber-400">${o.id}</td>
        <td class="p-3 text-xs">
          <div class="font-bold text-neutral-200">${o.customerName}</div>
          <div class="text-[11px] text-neutral-400">${o.customerPhone} • ${o.city}</div>
        </td>
        <td class="p-3 text-xs text-neutral-400">${o.createdAt}</td>
        <td class="p-3 text-xs">
          <span class="text-neutral-300 font-semibold">${o.items.length} منتجات</span>
        </td>
        <td class="p-3 text-xs font-bold text-amber-300">${window.cartManager.formatPrice(o.total)}</td>
        <td class="p-3 text-xs">
          <select 
            onchange="royalAdmin.changeOrderStatus('${o.id}', this.value)"
            class="text-xs bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 font-semibold text-neutral-200 focus:outline-none focus:border-amber-500"
          >
            <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>🟡 قيد المراجعة</option>
            <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>🔵 جاري التجهيز</option>
            <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>🟣 تم الشحن</option>
            <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>🟢 مكتمل ومستلم</option>
            <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>🔴 ملغي</option>
          </select>
        </td>
        <td class="p-3 text-xs text-left">
          <button onclick="royalAdmin.viewInvoice('${o.id}')" class="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black rounded-lg transition font-bold flex items-center gap-1.5 text-xs">
            <i class="fas fa-file-invoice"></i> الفاتورة
          </button>
        </td>
      </tr>
    `).join('');
  }

  changeOrderStatus(id, newStatus) {
    window.db.updateOrderStatus(id, newStatus);
    window.cartManager.notify(`تم تغيير حالة الطلب ${id} إلى "${this.getStatusLabel(newStatus)}"`, 'success');
    this.refreshData();
  }

  viewInvoice(orderId) {
    const order = window.db.getOrderById(orderId);
    if (!order) return;

    const modal = document.getElementById('invoice-modal');
    const container = document.getElementById('invoice-content');
    if (!modal || !container) return;

    const settings = window.db.getSettings();

    container.innerHTML = `
      <div id="printable-invoice" class="p-8 bg-neutral-950 text-neutral-100 rounded-2xl border border-amber-500/40 font-sans">
        <!-- ترويسة الفاتورة -->
        <div class="flex items-center justify-between border-b border-amber-900/60 pb-6 mb-6">
          <div>
            <h1 class="text-2xl font-black text-amber-400 tracking-wider mb-1">${settings.storeNameAr}</h1>
            <p class="text-xs text-neutral-400">${settings.storeNameEn} • فاتورة شراء ملكية</p>
          </div>
          <div class="text-left">
            <div class="text-lg font-black text-amber-200">#${order.id}</div>
            <div class="text-xs text-neutral-400">${order.createdAt}</div>
          </div>
        </div>

        <!-- بيانات العميل والمتجر -->
        <div class="grid grid-cols-2 gap-6 mb-6 text-xs bg-neutral-900/80 p-4 rounded-xl border border-neutral-800">
          <div>
            <h4 class="text-amber-400 font-bold mb-2">بيانات العميل:</h4>
            <p class="text-neutral-200 font-bold">${order.customerName}</p>
            <p class="text-neutral-400">الجوال: ${order.customerPhone}</p>
            <p class="text-neutral-400">المدينة: ${order.city}</p>
            <p class="text-neutral-400">العنوان: ${order.address}</p>
          </div>
          <div>
            <h4 class="text-amber-400 font-bold mb-2">طريقة الدفع والحالة:</h4>
            <p class="text-neutral-300">الدفع: ${order.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : order.paymentMethod === 'card' ? 'بطاقة بنكية' : 'تحويل بنكي'}</p>
            <p class="text-neutral-300">حالة الطلب: <span class="font-bold text-amber-300">${this.getStatusLabel(order.status)}</span></p>
            ${order.notes ? `<p class="text-neutral-400 mt-1">ملاحظات: ${order.notes}</p>` : ''}
          </div>
        </div>

        <!-- جدول المنتجات -->
        <table class="w-full text-xs mb-6 text-right">
          <thead>
            <tr class="border-b border-amber-900/40 text-neutral-400">
              <th class="py-2.5">العطر</th>
              <th class="py-2.5 text-center">الكمية</th>
              <th class="py-2.5 text-center">سعر الوحدة</th>
              <th class="py-2.5 text-left">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr class="border-b border-neutral-900">
                <td class="py-3 font-medium text-neutral-200">${item.name}</td>
                <td class="py-3 text-center text-amber-200">${item.quantity}</td>
                <td class="py-3 text-center text-neutral-300">${window.cartManager.formatPrice(item.price)}</td>
                <td class="py-3 text-left font-bold text-amber-400">${window.cartManager.formatPrice(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- الإجمالي والخصم -->
        <div class="border-t border-amber-900/60 pt-4 space-y-1.5 text-xs text-left max-w-[280px] mr-auto">
          <div class="flex justify-between text-neutral-400">
            <span>المجموع الفرعي:</span>
            <span>${window.cartManager.formatPrice(order.subtotal)}</span>
          </div>
          ${order.discount > 0 ? `
            <div class="flex justify-between text-rose-400">
              <span>الخصم (${order.couponCode}):</span>
              <span>-${window.cartManager.formatPrice(order.discount)}</span>
            </div>
          ` : ''}
          <div class="flex justify-between text-neutral-400">
            <span>الشحن:</span>
            <span>${order.shipping === 0 ? 'مجاني' : window.cartManager.formatPrice(order.shipping)}</span>
          </div>
          <div class="flex justify-between text-base font-black text-amber-400 border-t border-neutral-800 pt-2 mt-2">
            <span>المجموع الصافي:</span>
            <span>${window.cartManager.formatPrice(order.total)}</span>
          </div>
        </div>

        <div class="mt-8 pt-4 border-t border-neutral-900 text-center text-[11px] text-neutral-500">
          شكراً لتسوقكم من ${settings.storeNameAr} • نسعد دائماً بخدمتكم 👑
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeInvoiceModal() {
    const modal = document.getElementById('invoice-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  printInvoice() {
    const content = document.getElementById('printable-invoice');
    if (!content) return;
    const printWin = window.open('', '_blank');
    printWin.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>فاتورة شراء</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-black text-white p-8">
          ${content.outerHTML}
          <script>window.onload = () => { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    printWin.document.close();
  }

  // === إدارة العملاء (Customers) ===
  renderCustomersTable() {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;

    const users = window.db.getUsers();
    const orders = window.db.getOrders();

    tbody.innerHTML = users.map(u => {
      const userOrders = orders.filter(o => o.customerEmail === u.email || o.customerName === u.name);
      const spent = userOrders.reduce((sum, o) => sum + o.total, 0);

      return `
        <tr class="border-b border-neutral-800/80 hover:bg-neutral-900/50 transition">
          <td class="p-3 text-xs font-bold text-amber-100">${u.name}</td>
          <td class="p-3 text-xs text-neutral-400">${u.email}</td>
          <td class="p-3 text-xs text-neutral-300">${u.phone || '-'}</td>
          <td class="p-3 text-xs text-neutral-400">${u.city || '-'}</td>
          <td class="p-3 text-xs">
            <span class="px-2 py-0.5 rounded-full text-[11px] ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold' : 'bg-neutral-800 text-neutral-300'}">
              ${u.role === 'admin' ? 'مدير' : 'عميل'}
            </span>
          </td>
          <td class="p-3 text-xs text-amber-300 font-bold">${userOrders.length} طلبات</td>
          <td class="p-3 text-xs text-amber-400 font-bold">${window.cartManager.formatPrice(spent)}</td>
        </tr>
      `;
    }).join('');
  }

  // === إدارة الكوبونات (Coupons) ===
  renderCouponsTable() {
    const tbody = document.getElementById('coupons-table-body');
    if (!tbody) return;

    const coupons = window.db.getCoupons();

    tbody.innerHTML = coupons.map(c => `
      <tr class="border-b border-neutral-800/80 hover:bg-neutral-900/50 transition">
        <td class="p-3 text-xs font-black text-amber-400 tracking-wider">${c.code}</td>
        <td class="p-3 text-xs font-bold text-emerald-400">${c.discountPercent}%</td>
        <td class="p-3 text-xs text-neutral-300">${c.minSpend ? window.cartManager.formatPrice(c.minSpend) : 'بدون حد'}</td>
        <td class="p-3 text-xs text-neutral-400">${c.description || '-'}</td>
        <td class="p-3 text-xs text-left">
          <button onclick="royalAdmin.deleteCoupon('${c.code}')" class="p-1.5 text-rose-400 hover:text-rose-200 transition" title="حذف الكوبون">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  handleAddCoupon(e) {
    e.preventDefault();
    const code = document.getElementById('new-coupon-code')?.value.trim();
    const percent = document.getElementById('new-coupon-percent')?.value;
    const minSpend = document.getElementById('new-coupon-minspend')?.value || 0;
    const desc = document.getElementById('new-coupon-desc')?.value.trim();

    if (!code || !percent) {
      window.cartManager.notify('يرجى ملء كود الكوبون ونسبة الخصم', 'warning');
      return;
    }

    window.db.addCoupon({ code, discountPercent: percent, minSpend, description: desc });
    window.cartManager.notify(`تمت إضافة الكوبون "${code}" بنجاح!`, 'success');
    e.target.reset();
    this.renderCouponsTable();
  }

  deleteCoupon(code) {
    if (confirm(`هل أنت متأكد من حذف الكوبون ${code}؟`)) {
      window.db.deleteCoupon(code);
      window.cartManager.notify('تم حذف الكوبون', 'info');
      this.renderCouponsTable();
    }
  }

  // === إعدادات المتجر (Settings & Backup) ===
  renderSettingsForm() {
    const s = window.db.getSettings();

    const nameAr = document.getElementById('setting-name-ar');
    const nameEn = document.getElementById('setting-name-en');
    const wa = document.getElementById('setting-whatsapp');
    const phone = document.getElementById('setting-phone');
    const email = document.getElementById('setting-email');
    const shipping = document.getElementById('setting-shipping');
    const freeThresh = document.getElementById('setting-free-shipping');

    if (nameAr) nameAr.value = s.storeNameAr;
    if (nameEn) nameEn.value = s.storeNameEn;
    if (wa) wa.value = s.whatsappNumber;
    if (phone) phone.value = s.phone;
    if (email) email.value = s.email;
    if (shipping) shipping.value = s.shippingCost;
    if (freeThresh) freeThresh.value = s.freeShippingThreshold;
  }

  handleSettingsSubmit(e) {
    e.preventDefault();

    const updated = {
      storeNameAr: document.getElementById('setting-name-ar').value.trim(),
      storeNameEn: document.getElementById('setting-name-en').value.trim(),
      whatsappNumber: document.getElementById('setting-whatsapp').value.trim(),
      phone: document.getElementById('setting-phone').value.trim(),
      email: document.getElementById('setting-email').value.trim(),
      shippingCost: Number(document.getElementById('setting-shipping').value),
      freeShippingThreshold: Number(document.getElementById('setting-free-shipping').value)
    };

    window.db.updateSettings(updated);
    window.cartManager.notify('تم حفظ إعدادات المتجر بنجاح 👑', 'success');
  }

  exportData() {
    const json = window.db.exportDatabaseJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `royal_perfumes_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.cartManager.notify('تم تصدير نسخة احتياطية من قاعدة البيانات بنجاح!', 'success');
  }

  importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const res = window.db.importDatabaseJSON(e.target.result);
      if (res.success) {
        window.cartManager.notify('تم استيراد قاعدة البيانات بنجاح!', 'success');
        this.refreshData();
      } else {
        window.cartManager.notify('فشل الاستيراد: ' + res.error, 'error');
      }
    };
    reader.readAsText(file);
  }

  resetAllData() {
    if (confirm('تحذير: هل أنت متأكد من إعادة تعيين جميع البيانات للمنتجات والطلبات النموذجية؟')) {
      window.db.resetToDefault();
      window.cartManager.notify('تمت إعادة ضبط البيانات بنجاح', 'info');
      this.refreshData();
    }
  }

  // Helpers
  getStatusLabel(status) {
    const map = {
      pending: 'قيد المراجعة',
      processing: 'جاري التجهيز',
      shipped: 'تم الشحن',
      delivered: 'مكتمل ومستلم',
      cancelled: 'ملغي'
    };
    return map[status] || status;
  }

  getStatusBadgeClass(status) {
    const map = {
      pending: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
      processing: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      shipped: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      delivered: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      cancelled: 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
    };
    return map[status] || 'bg-neutral-800 text-neutral-300';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.royalAdmin = new RoyalAdminPanel();
});
