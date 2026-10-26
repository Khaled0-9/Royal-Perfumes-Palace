/**
 * إدارة الحسابات والمصادقة والملف الشخصي
 * Royal Perfumes Palace - Auth & Account Engine
 */

class AuthManager {
  constructor() {
    this.currentUser = window.db.getCurrentUser();
    this.init();
  }

  init() {
    this.updateUI();

    window.addEventListener('db:authChanged', (e) => {
      this.currentUser = e.detail.user;
      this.updateUI();
    });

    window.addEventListener('db:wishlistUpdated', () => {
      this.updateWishlistCount();
      if (document.getElementById('account-tab-wishlist')) {
        this.renderUserWishlist();
      }
    });

    this.updateWishlistCount();
  }

  isLoggedIn() {
    return !!this.currentUser;
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  }

  login(email, password) {
    try {
      const user = window.db.loginUser(email, password);
      window.cartManager.notify(`مرحباً بك مجدداً يا ${user.name} 👑`, 'success');
      this.closeAuthModal();
      return { success: true, user };
    } catch (err) {
      window.cartManager.notify(err.message, 'error');
      return { success: false, message: err.message };
    }
  }

  quickAdminLogin() {
    return this.login('admin@royalperfumes.com', 'admin');
  }

  register(userData) {
    try {
      const newUser = window.db.registerUser(userData);
      window.db.setCurrentUser(newUser);
      window.cartManager.notify(`تم إنشاء حسابك الملكي بنجاح! أهلاً بك يا ${newUser.name}`, 'success');
      this.closeAuthModal();
      return { success: true, user: newUser };
    } catch (err) {
      window.cartManager.notify(err.message, 'error');
      return { success: false, message: err.message };
    }
  }

  logout() {
    window.db.logout();
    window.cartManager.notify('تم تسجيل الخروج بنجاح. نراك قريباً!', 'info');
    const accountDrawer = document.getElementById('account-drawer');
    if (accountDrawer) accountDrawer.classList.add('translate-x-full');
  }

  openAuthModal(tab = 'login') {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    this.switchAuthTab(tab);
  }

  closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  switchAuthTab(tab) {
    const tabLoginBtn = document.getElementById('tab-btn-login');
    const tabRegisterBtn = document.getElementById('tab-btn-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    if (tab === 'login') {
      if (tabLoginBtn) tabLoginBtn.className = 'flex-1 py-2.5 text-center font-bold text-amber-400 border-b-2 border-amber-500 transition';
      if (tabRegisterBtn) tabRegisterBtn.className = 'flex-1 py-2.5 text-center font-medium text-neutral-400 border-b-2 border-transparent hover:text-amber-200 transition';
      if (formLogin) formLogin.classList.remove('hidden');
      if (formRegister) formRegister.classList.add('hidden');
    } else {
      if (tabRegisterBtn) tabRegisterBtn.className = 'flex-1 py-2.5 text-center font-bold text-amber-400 border-b-2 border-amber-500 transition';
      if (tabLoginBtn) tabLoginBtn.className = 'flex-1 py-2.5 text-center font-medium text-neutral-400 border-b-2 border-transparent hover:text-amber-200 transition';
      if (formRegister) formRegister.classList.remove('hidden');
      if (formLogin) formLogin.classList.add('hidden');
    }
  }

  toggleAccountDrawer() {
    if (!this.isLoggedIn()) {
      this.openAuthModal('login');
      return;
    }

    const drawer = document.getElementById('account-drawer');
    const overlay = document.getElementById('account-drawer-overlay');
    if (!drawer) return;

    if (drawer.classList.contains('translate-x-full')) {
      drawer.classList.remove('translate-x-full');
      if (overlay) overlay.classList.remove('hidden');
      this.renderAccountDrawerData();
    } else {
      drawer.classList.add('translate-x-full');
      if (overlay) overlay.classList.add('hidden');
    }
  }

  renderAccountDrawerData() {
    if (!this.currentUser) return;

    const nameEl = document.getElementById('account-drawer-name');
    const emailEl = document.getElementById('account-drawer-email');
    const roleBadgeEl = document.getElementById('account-drawer-role-badge');
    const adminLinkEl = document.getElementById('account-drawer-admin-link');

    if (nameEl) nameEl.textContent = this.currentUser.name;
    if (emailEl) emailEl.textContent = this.currentUser.email;
    
    if (roleBadgeEl) {
      if (this.currentUser.role === 'admin') {
        roleBadgeEl.textContent = 'مدير النظام 👑';
        roleBadgeEl.className = 'text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold';
      } else {
        roleBadgeEl.textContent = 'عميل مميز ⭐';
        roleBadgeEl.className = 'text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700';
      }
    }

    if (adminLinkEl) {
      adminLinkEl.style.display = this.currentUser.role === 'admin' ? 'flex' : 'none';
    }

    this.renderUserOrders();
    this.renderUserWishlist();
  }

  renderUserOrders() {
    const container = document.getElementById('account-orders-list');
    if (!container) return;

    const allOrders = window.db.getOrders();
    // تصفية طلبات هذا المستخدم بالبريد أو الاسم، وإذا كان مديراً يعرض آخر طلبات
    const userOrders = this.currentUser.role === 'admin'
      ? allOrders.slice(0, 5)
      : allOrders.filter(o => o.customerEmail === this.currentUser.email || o.customerName === this.currentUser.name);

    if (userOrders.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-neutral-400">
          <i class="fas fa-box-open text-3xl text-amber-500/30 mb-2"></i>
          <p class="text-xs">لا توجد طلبات سابقة حتى الآن</p>
        </div>
      `;
      return;
    }

    const statusMap = {
      pending: { label: 'قيد المراجعة', class: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
      processing: { label: 'جاري التجهيز', class: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
      shipped: { label: 'تم الشحن', class: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
      delivered: { label: 'مكتمل ومستلم', class: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
      cancelled: { label: 'ملغي', class: 'bg-rose-500/20 text-rose-300 border-rose-500/30' }
    };

    container.innerHTML = userOrders.map(order => {
      const st = statusMap[order.status] || { label: order.status, class: 'bg-neutral-800 text-neutral-300' };
      return `
        <div class="p-3 bg-neutral-900/90 border border-amber-900/30 rounded-xl mb-2.5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-amber-300">${order.id}</span>
            <span class="text-[11px] px-2 py-0.5 rounded-full border ${st.class} font-medium">${st.label}</span>
          </div>
          <div class="text-xs text-neutral-400 mb-2 flex items-center justify-between">
            <span>${order.createdAt}</span>
            <span class="text-amber-200 font-bold">${window.cartManager.formatPrice(order.total)}</span>
          </div>
          <div class="text-[11px] text-neutral-300 border-t border-neutral-800 pt-1.5 flex flex-wrap gap-1">
            ${order.items.map(it => `<span class="bg-black/50 px-2 py-0.5 rounded text-neutral-300">${it.name} (${it.quantity})</span>`).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  renderUserWishlist() {
    const container = document.getElementById('account-wishlist-list');
    if (!container) return;

    const wishlistIds = window.db.getWishlist();
    if (wishlistIds.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-neutral-400">
          <i class="far fa-heart text-3xl text-amber-500/30 mb-2"></i>
          <p class="text-xs">قائمة المفضلة فارغة حالياً</p>
        </div>
      `;
      return;
    }

    const products = wishlistIds.map(id => window.db.getProductById(id)).filter(Boolean);

    container.innerHTML = products.map(p => `
      <div class="flex items-center gap-3 p-2.5 bg-neutral-900/90 border border-amber-900/30 rounded-xl mb-2">
        <img src="${p.image}" alt="${p.name}" class="w-12 h-12 object-cover rounded-lg border border-amber-500/20">
        <div class="flex-1 min-w-0">
          <h5 class="text-xs font-bold text-amber-100 truncate">${p.name}</h5>
          <div class="text-[11px] text-amber-400 font-semibold mt-0.5">${window.cartManager.formatPrice(p.discountPrice || p.price)}</div>
        </div>
        <div class="flex items-center gap-1.5">
          <button onclick="window.cartManager.addItem('${p.id}');" class="px-2.5 py-1 text-xs bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black rounded-lg transition font-medium">
            <i class="fas fa-cart-plus"></i>
          </button>
          <button onclick="window.db.toggleWishlist('${p.id}');" class="p-1 text-rose-400 hover:text-rose-300 transition" title="حذف من المفضلة">
            <i class="fas fa-trash-alt text-xs"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  updateWishlistCount() {
    const wishlistIds = window.db.getWishlist();
    const countBadges = document.querySelectorAll('.wishlist-badge');
    countBadges.forEach(badge => {
      badge.textContent = wishlistIds.length;
      badge.style.display = wishlistIds.length > 0 ? 'flex' : 'none';
    });
  }

  updateUI() {
    const userBtnLabel = document.getElementById('user-btn-label');
    const userBtnIcon = document.getElementById('user-btn-icon');
    const adminNavBtn = document.getElementById('admin-nav-btn');

    if (this.currentUser) {
      if (userBtnLabel) userBtnLabel.textContent = this.currentUser.name.split(' ')[0];
      if (userBtnIcon) userBtnIcon.className = 'fas fa-user-check text-amber-400';
      if (adminNavBtn) {
        adminNavBtn.style.display = this.currentUser.role === 'admin' ? 'inline-flex' : 'none';
      }
    } else {
      if (userBtnLabel) userBtnLabel.textContent = 'حسابي';
      if (userBtnIcon) userBtnIcon.className = 'far fa-user text-neutral-300';
      if (adminNavBtn) {
        // نتركه مرئياً كزر اختياري للمدير للدخول إلى لوحة الإدارة بسهولة
        adminNavBtn.style.display = 'inline-flex';
      }
    }
  }
}

// إنشاء نسخة مدير الحسابات
window.authManager = new AuthManager();
