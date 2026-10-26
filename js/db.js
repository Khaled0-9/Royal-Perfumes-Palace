/**
 * قاعدة بيانات متجر قصر العطور الملكي
 * Royal Perfumes Palace - Database & Storage Engine
 * العملة الأساسية: الجنيه المصري (EGP / ج.م)
 */

const STORAGE_KEYS = {
  VERSION: 'royal_perfumes_v2_egp',
  PRODUCTS: 'royal_perfumes_products',
  ORDERS: 'royal_perfumes_orders',
  USERS: 'royal_perfumes_users',
  COUPONS: 'royal_perfumes_coupons',
  SETTINGS: 'royal_perfumes_settings',
  WISHLIST: 'royal_perfumes_wishlist',
  CURRENT_USER: 'royal_perfumes_current_user',
  CART: 'royal_perfumes_cart'
};

// البيانات الأولية الفاخرة بالجنيه المصري (EGP)
const DEFAULT_PRODUCTS = [
  {
    id: 'perf-001',
    name: 'سوفاج إليكسير الملكي',
    brand: 'Dior',
    category: 'men',
    categoryName: 'عطور رجالية',
    price: 2850,
    discountPrice: 2450,
    size: '100 مل',
    concentration: 'Extrait de Parfum',
    stock: 14,
    rating: 4.9,
    reviewsCount: 38,
    isFeatured: true,
    isBestseller: true,
    badge: 'الأكثر طلباً',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    description: 'تحفة عطرية مكثفة وغامضة تعبر عن الفخامة والرجولة الصارخة. نفحات حارة دافئة تمتزج بقلب زهري مهدئ وقاعدة غنية بالأخشاب الثمينة.',
    topNotes: 'جوزة الطيب، القرفة، الحبهان، الجريب فروت',
    heartNotes: 'اللافندر الفرنسي الفاخر، نبات الفيتيفر',
    baseNotes: 'العرقسوس، خشب الصندل، العنبر، الباتشولي',
    longevity: 'ثبات فائق +24 ساعة',
    sillage: 'فوحان قوي جداً',
    createdAt: '2026-01-15'
  },
  {
    id: 'perf-002',
    name: 'عود أصفهان الإمبراطوري',
    brand: 'Christian Dior',
    category: 'oriental',
    categoryName: 'عطور شرقية ودهن عود',
    price: 3600,
    discountPrice: 3100,
    size: '125 مل',
    concentration: 'Eau de Parfum',
    stock: 8,
    rating: 5.0,
    reviewsCount: 52,
    isFeatured: true,
    isBestseller: true,
    badge: 'إصدار ملكي',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
    description: 'ترنيمة شرقية تمزج بين رقة الورد الدمشقي وقوة العود الشرقي المهيب، مستوحاة من القصور الشرقية العريقة.',
    topNotes: 'القريضة، الزعفران الملكي',
    heartNotes: 'الورد الدمشقي، الباتشولي الفاخر',
    baseNotes: 'العود الطبيعي، خشب الصندل، خشب الأرز',
    longevity: 'ثبات يدوم طويلاً',
    sillage: 'فوحان فخم ومميز',
    createdAt: '2026-01-10'
  },
  {
    id: 'perf-003',
    name: 'بلاك أفغانو النيش النادر',
    brand: 'Nasomatto',
    category: 'niche',
    categoryName: 'عطور نيش فاخرة',
    price: 3900,
    discountPrice: 3400,
    size: '30 مل',
    concentration: 'Extrait de Parfum',
    stock: 5,
    rating: 4.8,
    reviewsCount: 29,
    isFeatured: true,
    isBestseller: false,
    badge: 'مخزون نادر',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
    description: 'عطر غامض وجريء مصمم لإيقاظ الحواس وإثارة التميز بنفحاته الدخانية والراتنجية المكثفة التي تترك بصمة لا تنسى.',
    topNotes: 'القنب الأخضر، النوتات الخضراء النقية',
    heartNotes: 'الراتنجات، الأخشاب، القهوة المحمصة، التبغ',
    baseNotes: 'البخور الملكي، العود المركز',
    longevity: 'ثبات خارق +48 ساعة',
    sillage: 'فوحان استثنائي',
    createdAt: '2026-02-01'
  },
  {
    id: 'perf-004',
    name: 'توباكو فانيلا المخملي',
    brand: 'Tom Ford',
    category: 'unisex',
    categoryName: 'عطور للجنسين',
    price: 4200,
    discountPrice: 3750,
    size: '100 مل',
    concentration: 'Eau de Parfum',
    stock: 12,
    rating: 4.9,
    reviewsCount: 64,
    isFeatured: true,
    isBestseller: true,
    badge: 'أيقونة العطور',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    description: 'الدفء والفخامة في زجاجة واحدة. نفحات التبغ الفاخر تمتزج بحلاوة الفانيلا الكريمية والكاكاو والتوابل الدافئة.',
    topNotes: 'أوراق التبغ النبيل، التوابل العطرية',
    heartNotes: 'حبوب التونكا، زهر التبغ، الفانيلا، الكاكاو',
    baseNotes: 'الفواكه المجففة، نوتات الأخشاب الدافئة',
    longevity: 'ثبات 24 ساعة',
    sillage: 'فوحان دافئ وآسر',
    createdAt: '2026-01-20'
  },
  {
    id: 'perf-005',
    name: 'روز فانيلا الساحر',
    brand: 'Mancera',
    category: 'women',
    categoryName: 'عطور نسائية',
    price: 1950,
    discountPrice: 1650,
    size: '120 مل',
    concentration: 'Eau de Parfum',
    stock: 18,
    rating: 4.9,
    reviewsCount: 45,
    isFeatured: true,
    isBestseller: true,
    badge: 'الأكثر أنوثة',
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
    description: 'أنوثة متفجرة وجاذبية فائقة تجمع بين رقة الورود السكرية وانتعاش الليمون مع قاعدة غنية بالفانيلا المدغشقرية.',
    topNotes: 'الليمون الصقلي المنعش، نوتات مائية نقية',
    heartNotes: 'الورد التركي السكري، بهجة الأزهار',
    baseNotes: 'الفانيلا، السكر الأبيض، خشب الأرز، المسك الأبيض',
    longevity: 'ثبات ممتاز +18 ساعة',
    sillage: 'فوحان ساحر وجذاب',
    createdAt: '2026-02-05'
  },
  {
    id: 'perf-006',
    name: 'مسك كشمير النقي',
    brand: 'Attar Collection',
    category: 'unisex',
    categoryName: 'عطور للجنسين',
    price: 2100,
    discountPrice: 1850,
    size: '100 مل',
    concentration: 'Eau de Parfum',
    stock: 9,
    rating: 4.8,
    reviewsCount: 31,
    isFeatured: false,
    isBestseller: false,
    badge: 'نقاء فائق',
    image: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80',
    description: 'إحساس النظافة الفاخرة كقطعة حرير تلامس بشرتك. مسك نقي هادئ مع لمسات خشب الصندل والجاردينيا البيضاء.',
    topNotes: 'المسك الأبيض النقي، الفلفل الأبيض',
    heartNotes: 'زهرة الجاردينيا، زهر القرنفل',
    baseNotes: 'خشب الصندل الكشميري، المسك الفاخر',
    longevity: 'ثبات هادئ طوال اليوم',
    sillage: 'فوحان ناعم ومريح',
    createdAt: '2026-02-10'
  },
  {
    id: 'perf-007',
    name: 'أفنتوس الإمبراطوري الكلاسيكي',
    brand: 'Creed',
    category: 'men',
    categoryName: 'عطور رجالية',
    price: 4800,
    discountPrice: 4200,
    size: '100 مل',
    concentration: 'Eau de Parfum',
    stock: 6,
    rating: 5.0,
    reviewsCount: 88,
    isFeatured: true,
    isBestseller: true,
    badge: 'عطر النخبة',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
    description: 'العطر الأكثر شهرة وشعبية بين القادة والملوك. افتتاحية مدوية من الأناناس والبرغموت تستقر على قاعدة مدخنة فريدة.',
    topNotes: 'الأناناس، البرغموت، الكشمش الأسود، التفاح',
    heartNotes: 'خشب البتولا، الباتشولي، الياسمين المغربي، الورد',
    baseNotes: 'المسك، طحلب البلوط، العنبر، الفانيلا',
    longevity: 'ثبات جبار 24 ساعة',
    sillage: 'فوحان ملفت يملأ المكان',
    createdAt: '2026-01-05'
  },
  {
    id: 'perf-008',
    name: 'بكرات روج 540 إكستريت',
    brand: 'Maison Francis Kurkdjian',
    category: 'niche',
    categoryName: 'عطور نيش فاخرة',
    price: 5200,
    discountPrice: 4600,
    size: '70 مل',
    concentration: 'Extrait de Parfum',
    stock: 4,
    rating: 4.9,
    reviewsCount: 73,
    isFeatured: true,
    isBestseller: true,
    badge: 'قطعة فنية',
    image: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80',
    description: 'تألق الكريستال الذهبي والزعفران النادر مع لمسات العنبر واللوز المر، عطر يفيض بالأرستقراطية والسحر الذي لا يقاوم.',
    topNotes: 'اللوز المر، الزعفران الإيراني الممتاز',
    heartNotes: 'الياسمين المصري، خشب الأرز',
    baseNotes: 'العنبر الرمادي، روائح الأخشاب، المسك',
    longevity: 'ثبات فوق التوقعات',
    sillage: 'فوحان يترك أثراً دائماً',
    createdAt: '2026-01-25'
  },
  {
    id: 'perf-009',
    name: 'دهن عود كلمنتان طبيعي مالينو',
    brand: 'قصر العطور الملكي',
    category: 'oriental',
    categoryName: 'عطور شرقية ودهن عود',
    price: 2400,
    discountPrice: 1950,
    size: 'تولة كاملة (12 مل)',
    concentration: 'Pure Dehn Oud 100%',
    stock: 15,
    rating: 5.0,
    reviewsCount: 41,
    isFeatured: true,
    isBestseller: false,
    badge: 'طبيعي 100%',
    image: 'https://images.unsplash.com/photo-1608528577891-9855f4c864e0?auto=format&fit=crop&w=800&q=80',
    description: 'دهن عود كلمنتان بيور معتق لأكثر من عشر سنوات، نكهة سويتية بخورية غنية وفاخرة تناسب المناسبات الملكية والجمعات الفخمة.',
    topNotes: 'نفحات خشبية عتيقة، رطوبة الغابات الطبيعية',
    heartNotes: 'بخور عطري دافئ، نكهة ترابية زكية',
    baseNotes: 'عنبر معتق، سويتية العود الهادئة',
    longevity: 'ثبات يدوم لأيام على الملابس',
    sillage: 'فوحان بخوري أصيل',
    createdAt: '2026-02-12'
  },
  {
    id: 'perf-010',
    name: 'ليبر إنتنس الباريسي',
    brand: 'Yves Saint Laurent',
    category: 'women',
    categoryName: 'عطور نسائية',
    price: 2200,
    discountPrice: 1890,
    size: '90 مل',
    concentration: 'Eau de Parfum Intense',
    stock: 11,
    rating: 4.8,
    reviewsCount: 39,
    isFeatured: false,
    isBestseller: true,
    badge: 'حرية وأناقة',
    image: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&q=80',
    description: 'عطر المرأة الواثقة الحرة. مزيج جريء من زهر البرتقال المغربي والخزامى الفرنسية مع لمسة أوركيد وفانيلا دافئة.',
    topNotes: 'الخزامى، اليوسفي، البرغموت',
    heartNotes: 'زهر البرتقال، الأوركيد، ياسمين سامباك',
    baseNotes: 'فانيلا مدغشقر، حبوب التونكا، العنبر، نجيل الهند',
    longevity: 'ثبات قوي 20 ساعة',
    sillage: 'فوحان أنثوي ملفت',
    createdAt: '2026-02-14'
  },
  {
    id: 'perf-011',
    name: 'إنترلود مان الأزرق (عطر الموتوسيكل)',
    brand: 'Amouage',
    category: 'oriental',
    categoryName: 'عطور شرقية ودهن عود',
    price: 4600,
    discountPrice: 3950,
    size: '100 مل',
    concentration: 'Eau de Parfum',
    stock: 3,
    rating: 4.9,
    reviewsCount: 27,
    isFeatured: false,
    isBestseller: false,
    badge: 'مخزون محدود',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    description: 'الملقب بالوحش الأزرق. هيبة وسلطان لا مثيل لهما بمزيج من اللبان الحوجري العماني والعنبر والجلود الفاخرة.',
    topNotes: 'البرغموت، الأوريغانو، الفلفل الإفرنجي',
    heartNotes: 'اللبان الحوجري، العنبر، الأوبوبوناكس، القريضة',
    baseNotes: 'الجلود، خشب العود، الباتشولي، خشب الصندل',
    longevity: 'ثبات أسطوري +30 ساعة',
    sillage: 'فوحان ساحق وشديد القوة',
    createdAt: '2026-02-02'
  },
  {
    id: 'perf-012',
    name: 'مسك الطهارة والبودرة الملكي',
    brand: 'قصر العطور الملكي',
    category: 'unisex',
    categoryName: 'عطور للجنسين',
    price: 650,
    discountPrice: 490,
    size: 'ربع تولة فاخرة',
    concentration: 'Concentrated Perfume Oil',
    stock: 25,
    rating: 4.9,
    reviewsCount: 96,
    isFeatured: false,
    isBestseller: true,
    badge: 'الأكثر انتعاشاً',
    image: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=80',
    description: 'نقاء الطبيعة وانتعاش النظافة المطلقة. زيت عطري كثيف يدوم لأيام بنكهة البودرة الناعمة والمسك الأبيض الأصلي.',
    topNotes: 'زهور بيضاء نقية، نوتات بودرية خفيفة',
    heartNotes: 'مسك نقي، زنبق الوادي، السوسن',
    baseNotes: 'خشب الصندل الهادئ، عنبر خفيف',
    longevity: 'ثبات يدوم 48 ساعة على الأقمشة',
    sillage: 'فوحان هادئ وفواح بالقرب منك',
    createdAt: '2026-01-08'
  }
];

// المستخدمين الافتراضيين
const DEFAULT_USERS = [
  {
    id: 'user-admin',
    name: 'المدير العام للمتجر',
    email: 'admin@royalperfumes.com',
    phone: '01012345678',
    password: 'admin',
    role: 'admin',
    city: 'القاهرة',
    address: 'التجمع الخامس - القاهرة الجديدة',
    createdAt: '2026-01-01'
  },
  {
    id: 'user-002',
    name: 'أحمد محمود الشريف',
    email: 'ahmed@example.com',
    phone: '01234567890',
    password: '123',
    role: 'customer',
    city: 'الإسكندرية',
    address: 'سموحة، شارع فوزي معاذ',
    createdAt: '2026-02-01'
  }
];

// طلبات تجريبية أولية بالجنيه المصري
const DEFAULT_ORDERS = [
  {
    id: 'ORD-8821',
    customerName: 'محمد طارق عبدالفتاح',
    customerPhone: '01099887766',
    customerEmail: 'mohamed@example.com',
    city: 'الشيخ زايد',
    address: 'كمبوند الربوة، فيلا 45',
    notes: 'يرجى التغليف كهدية ملكية مع كارت إهداء',
    paymentMethod: 'cod',
    status: 'delivered',
    items: [
      { id: 'perf-002', name: 'عود أصفهان الإمبراطوري', price: 3100, quantity: 1, image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80' },
      { id: 'perf-009', name: 'دهن عود كلمنتان طبيعي مالينو', price: 1950, quantity: 2, image: 'https://images.unsplash.com/photo-1608528577891-9855f4c864e0?auto=format&fit=crop&w=800&q=80' }
    ],
    subtotal: 7000,
    discount: 700,
    shipping: 0,
    total: 6300,
    couponCode: 'ROYAL10',
    createdAt: '2026-10-24 14:30'
  },
  {
    id: 'ORD-8822',
    customerName: 'سارة المهندس',
    customerPhone: '01122334455',
    customerEmail: 'sara@example.com',
    city: 'القاهرة',
    address: 'مصر الجديدة، شارع النزهة',
    notes: 'التوصيل في الفترة المسائية',
    paymentMethod: 'card',
    status: 'processing',
    items: [
      { id: 'perf-005', name: 'روز فانيلا الساحر', price: 1650, quantity: 1, image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80' },
      { id: 'perf-008', name: 'بكرات روج 540 إكستريت', price: 4600, quantity: 1, image: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80' }
    ],
    subtotal: 6250,
    discount: 0,
    shipping: 0,
    total: 6250,
    couponCode: '',
    createdAt: '2026-10-25 18:45'
  },
  {
    id: 'ORD-8823',
    customerName: 'كريم الجوهري',
    customerPhone: '01555667788',
    customerEmail: 'karim@example.com',
    city: 'المعادي',
    address: 'دجلة المعادي، شارع 200',
    notes: '',
    paymentMethod: 'bank',
    status: 'pending',
    items: [
      { id: 'perf-001', name: 'سوفاج إليكسير الملكي', price: 2450, quantity: 1, image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80' }
    ],
    subtotal: 2450,
    discount: 245,
    shipping: 65,
    total: 2270,
    couponCode: 'ROYAL10',
    createdAt: '2026-10-26 10:15'
  }
];

// الكوبونات بالجنيه المصري
const DEFAULT_COUPONS = [
  { code: 'ROYAL10', discountPercent: 10, minSpend: 800, description: 'خصم ملكي 10% للطلبات فوق 800 ج.م' },
  { code: 'OUD20', discountPercent: 20, minSpend: 1500, description: 'خصم عشاق العود 20% للطلبات فوق 1,500 ج.م' },
  { code: 'WELCOME', discountPercent: 15, minSpend: 500, description: 'خصم الترحيب 15% للعملاء الجدد فوق 500 ج.م' }
];

// إعدادات المتجر العامة بالجنيه المصري كعملة رئيسية
const DEFAULT_SETTINGS = {
  storeNameAr: 'قصر العطور الملكي',
  storeNameEn: 'Royal Perfumes Palace',
  tagline: 'أفخم العطور الشرقية والفرنسية الملكية',
  whatsappNumber: '201000000000',
  phone: '01000000000',
  email: 'info@royalperfumes.com',
  address: 'جمهورية مصر العربية / الوطن العربي',
  defaultCurrency: 'EGP',
  currencySymbol: 'ج.م',
  shippingCost: 65, // تكلفة الشحن بالجنيه
  freeShippingThreshold: 1200, // شحن مجاني للطلبات فوق 1,200 جنيه
  vatPercent: 0,
  allowWhatsAppOrder: true,
  currencies: {
    EGP: { symbol: 'ج.م', rate: 1.0, name: 'جنيه مصري' },
    SAR: { symbol: 'ر.س', rate: 0.077, name: 'ريال سعودي' },
    AED: { symbol: 'د.إ', rate: 0.075, name: 'درهم إماراتي' },
    USD: { symbol: '$', rate: 0.020, name: 'دولار أمريكي' },
    KWD: { symbol: 'د.ك', rate: 0.0062, name: 'دينار كويتي' }
  }
};

/**
 * محرك قاعدة البيانات
 */
class RoyalDB {
  constructor() {
    this.init();
  }

  init() {
    // ترقية / ترحيل تلقائي إلى الجنيه المصري إذا كانت النسخة القديمة بالريال
    const currentVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
    if (!currentVersion || currentVersion !== '2.0_egp') {
      localStorage.setItem(STORAGE_KEYS.VERSION, '2.0_egp');
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(DEFAULT_COUPONS));
      localStorage.setItem('royal_perfumes_currency', 'EGP');
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COUPONS)) {
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(DEFAULT_COUPONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.WISHLIST)) {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CART)) {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
    }
  }

  // === المنتجات (Products) ===
  getProducts() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)) || [];
    } catch {
      return DEFAULT_PRODUCTS;
    }
  }

  getProductById(id) {
    const products = this.getProducts();
    return products.find(p => p.id === id);
  }

  addProduct(productData) {
    const products = this.getProducts();
    const newProduct = {
      id: 'perf-' + Date.now().toString().slice(-6),
      name: productData.name,
      brand: productData.brand || 'قصر العطور',
      category: productData.category || 'oriental',
      categoryName: this.getCategoryName(productData.category),
      price: Number(productData.price),
      discountPrice: productData.discountPrice ? Number(productData.discountPrice) : Number(productData.price),
      size: productData.size || '100 مل',
      concentration: productData.concentration || 'Eau de Parfum',
      stock: Number(productData.stock) || 0,
      rating: 5.0,
      reviewsCount: 1,
      isFeatured: !!productData.isFeatured,
      isBestseller: !!productData.isBestseller,
      badge: productData.badge || 'جديد',
      image: productData.image || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
      description: productData.description || 'عطر فاخر مصنوع بعناية من أجود المكونات الطبيعية.',
      topNotes: productData.topNotes || '',
      heartNotes: productData.heartNotes || '',
      baseNotes: productData.baseNotes || '',
      longevity: productData.longevity || 'ثبات ممتاز',
      sillage: productData.sillage || 'فوحان جذاب',
      createdAt: new Date().toISOString().split('T')[0]
    };
    products.unshift(newProduct);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.dispatch('db:productsUpdated', { products });
    return newProduct;
  }

  updateProduct(id, updatedData) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = {
        ...products[index],
        ...updatedData,
        price: Number(updatedData.price),
        discountPrice: updatedData.discountPrice ? Number(updatedData.discountPrice) : Number(updatedData.price),
        stock: Number(updatedData.stock),
        categoryName: this.getCategoryName(updatedData.category || products[index].category)
      };
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      this.dispatch('db:productsUpdated', { products });
      return products[index];
    }
    return null;
  }

  deleteProduct(id) {
    let products = this.getProducts();
    products = products.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.dispatch('db:productsUpdated', { products });
    return true;
  }

  // تحديث سريع للكمية في المخزون
  updateStock(id, newStock) {
    const products = this.getProducts();
    const product = products.find(p => p.id === id);
    if (product) {
      product.stock = Math.max(0, Number(newStock));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      this.dispatch('db:stockUpdated', { product, newStock: product.stock });
      return product;
    }
    return null;
  }

  adjustStock(id, delta) {
    const products = this.getProducts();
    const product = products.find(p => p.id === id);
    if (product) {
      product.stock = Math.max(0, product.stock + delta);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      this.dispatch('db:stockUpdated', { product, newStock: product.stock });
      return product;
    }
    return null;
  }

  // === الطلبات (Orders) ===
  getOrders() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS)) || [];
    } catch {
      return DEFAULT_ORDERS;
    }
  }

  getOrderById(id) {
    const orders = this.getOrders();
    return orders.find(o => o.id === id);
  }

  addOrder(orderData) {
    const orders = this.getOrders();
    const orderNumber = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newOrder = {
      id: orderNumber,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerEmail: orderData.customerEmail || '',
      city: orderData.city || '',
      address: orderData.address || '',
      notes: orderData.notes || '',
      paymentMethod: orderData.paymentMethod || 'cod',
      status: 'pending',
      items: orderData.items || [],
      subtotal: Number(orderData.subtotal) || 0,
      discount: Number(orderData.discount) || 0,
      shipping: Number(orderData.shipping) || 0,
      total: Number(orderData.total) || 0,
      couponCode: orderData.couponCode || '',
      createdAt: formattedDate
    };

    // خصم الكميات من المخزون تلقائياً
    if (newOrder.items && newOrder.items.length) {
      newOrder.items.forEach(item => {
        this.adjustStock(item.id, -item.quantity);
      });
    }

    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.dispatch('db:ordersUpdated', { orders, newOrder });
    return newOrder;
  }

  updateOrderStatus(id, newStatus) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === id);
    if (order) {
      order.status = newStatus;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      this.dispatch('db:ordersUpdated', { orders, updatedOrder: order });
      return order;
    }
    return null;
  }

  // === المستخدمين (Users & Authentication) ===
  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    } catch {
      return DEFAULT_USERS;
    }
  }

  getUserByEmail(email) {
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  registerUser(userData) {
    const users = this.getUsers();
    if (this.getUserByEmail(userData.email)) {
      throw new Error('البريد الإلكتروني مسجل بالفعل!');
    }
    const newUser = {
      id: 'user-' + Date.now().toString().slice(-6),
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      password: userData.password,
      role: 'customer',
      city: userData.city || '',
      address: userData.address || '',
      createdAt: new Date().toISOString().split('T')[0]
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  }

  loginUser(email, password) {
    const user = this.getUserByEmail(email);
    if (!user || user.password !== password) {
      throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
    this.setCurrentUser(user);
    return user;
  }

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) || null;
    } catch {
      return null;
    }
  }

  setCurrentUser(user) {
    if (user) {
      const safeUser = { ...user };
      delete safeUser.password;
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    this.dispatch('db:authChanged', { user });
  }

  logout() {
    this.setCurrentUser(null);
  }

  // === الكوبونات (Coupons) ===
  getCoupons() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.COUPONS)) || [];
    } catch {
      return DEFAULT_COUPONS;
    }
  }

  validateCoupon(code, currentSubtotal = 0) {
    const coupons = this.getCoupons();
    const coupon = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!coupon) {
      return { valid: false, message: 'كوبون الخصم غير صحيح أو منتهي' };
    }
    if (currentSubtotal < coupon.minSpend) {
      return { valid: false, message: `الحد الأدنى لتطبيق الكوبون هو ${coupon.minSpend} ج.م` };
    }
    const discountAmount = (currentSubtotal * coupon.discountPercent) / 100;
    return {
      valid: true,
      code: coupon.code,
      percent: coupon.discountPercent,
      amount: discountAmount,
      message: `تم تطبيق خصم ${coupon.discountPercent}% بنجاح!`
    };
  }

  addCoupon(coupon) {
    const coupons = this.getCoupons();
    coupons.push({
      code: coupon.code.toUpperCase().trim(),
      discountPercent: Number(coupon.discountPercent),
      minSpend: Number(coupon.minSpend) || 0,
      description: coupon.description || ''
    });
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
    return coupons;
  }

  deleteCoupon(code) {
    let coupons = this.getCoupons();
    coupons = coupons.filter(c => c.code !== code);
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
    return coupons;
  }

  // === الإعدادات (Settings) ===
  getSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  updateSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    this.dispatch('db:settingsUpdated', { settings: updated });
    return updated;
  }

  // === قائمة الرغبات (Wishlist) ===
  getWishlist() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.WISHLIST)) || [];
    } catch {
      return [];
    }
  }

  toggleWishlist(productId) {
    let wishlist = this.getWishlist();
    const index = wishlist.indexOf(productId);
    let added = false;
    if (index === -1) {
      wishlist.push(productId);
      added = true;
    } else {
      wishlist.splice(index, 1);
      added = false;
    }
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    this.dispatch('db:wishlistUpdated', { wishlist, productId, added });
    return { wishlist, added };
  }

  isInWishlist(productId) {
    return this.getWishlist().includes(productId);
  }

  // === السلة (Cart Persistence) ===
  getCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART)) || [];
    } catch {
      return [];
    }
  }

  saveCart(cart) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    this.dispatch('db:cartUpdated', { cart });
  }

  clearCart() {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
    this.dispatch('db:cartUpdated', { cart: [] });
  }

  // === النسخ الاحتياطي والاستعادة (Backup & Restore) ===
  exportDatabaseJSON() {
    const fullBackup = {
      version: '2.0_egp',
      exportedAt: new Date().toISOString(),
      products: this.getProducts(),
      orders: this.getOrders(),
      users: this.getUsers(),
      coupons: this.getCoupons(),
      settings: this.getSettings()
    };
    return JSON.stringify(fullBackup, null, 2);
  }

  importDatabaseJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.products && Array.isArray(data.products)) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data.products));
      }
      if (data.orders && Array.isArray(data.orders)) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(data.orders));
      }
      if (data.users && Array.isArray(data.users)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
      }
      if (data.coupons && Array.isArray(data.coupons)) {
        localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(data.coupons));
      }
      if (data.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      this.dispatch('db:imported', {});
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  resetToDefault() {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(DEFAULT_COUPONS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
    localStorage.setItem('royal_perfumes_currency', 'EGP');
    this.dispatch('db:reset', {});
    return true;
  }

  getCategoryName(cat) {
    const map = {
      men: 'عطور رجالية',
      women: 'عطور نسائية',
      oriental: 'عطور شرقية ودهن عود',
      niche: 'عطور نيش فاخرة',
      unisex: 'عطور للجنسين'
    };
    return map[cat] || 'عطور فاخرة';
  }

  dispatch(eventName, detail) {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
}

// إنشاء نسخة عامة واحدة لجميع ملفات التطبيق
window.db = new RoyalDB();
