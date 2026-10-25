export type StoreProLocaleText = { en: string; ar: string }
export type StoreProService = { id: string; icon: string; title: StoreProLocaleText; description: StoreProLocaleText }

export const storeProServices: StoreProService[] = [
  { id: 'custom-store', icon: 'Store', title: { ar: 'متجر إلكتروني مخصص', en: 'Custom online store' }, description: { ar: 'تصميم متجر يعكس هوية نشاطك ويمنح عملاءك تجربة تسوق واضحة وسهلة.', en: 'A storefront shaped around your brand with a clear, easy shopping experience.' } },
  { id: 'dashboard', icon: 'LayoutDashboard', title: { ar: 'تصميم واجهة المستخدم', en: 'Store and dashboard design' }, description: { ar: 'واجهات عملية لإدارة متجرك ومتابعة نشاطك من لوحة واحدة.', en: 'Practical interfaces for managing your store and following business activity.' } },
  { id: 'mobile', icon: 'Smartphone', title: { ar: 'تطبيقات الجوال', en: 'Mobile applications' }, description: { ar: 'تجربة متوافقة مع الجوال، مع إمكانية تصميم تطبيق يناسب احتياجات مشروعك.', en: 'A mobile-ready experience, with an app tailored to your business needs.' } },
  { id: 'operations', icon: 'Boxes', title: { ar: 'إدارة المنتجات والمخزون', en: 'Product and inventory management' }, description: { ar: 'إدارة المنتجات والطلبات والمخزون ضمن سير عمل منظم.', en: 'Keep products, orders, and inventory organized in one workflow.' } },
  { id: 'integrations', icon: 'CreditCard', title: { ar: 'بوابات الدفع والتكاملات', en: 'Payments and integrations' }, description: { ar: 'ربط المتجر بالخدمات المناسبة لنشاطك واحتياجات عملائك.', en: 'Connect your store to services that fit your business and customers.' } },
  { id: 'support', icon: 'LifeBuoy', title: { ar: 'دعم فني مستمر', en: 'Ongoing technical support' }, description: { ar: 'مساندة في الإطلاق والتشغيل لمساعدتك على مواصلة تطوير متجرك.', en: 'Launch and operation support as you continue to improve your store.' } },
]

export const storeProBenefits: Array<{ icon: string; title: StoreProLocaleText; description: StoreProLocaleText }> = [
  { icon: 'Users', title: { ar: 'سهولة الإدارة', en: 'Simple management' }, description: { ar: 'واجهة واضحة تساعد فريقك على إدارة العمل اليومي.', en: 'A clear workspace helps your team handle day-to-day tasks.' } },
  { icon: 'ShieldCheck', title: { ar: 'أمان وموثوقية', en: 'Security and reliability' }, description: { ar: 'أساس تقني موثوق لحماية بيانات متجرك وعملائك.', en: 'A dependable technical foundation for your store and customer data.' } },
  { icon: 'TrendingUp', title: { ar: 'قابلية للتوسع', en: 'Built to grow' }, description: { ar: 'أضف الخدمات والخصائص المناسبة مع نمو احتياجك.', en: 'Add the capabilities your business needs as it grows.' } },
  { icon: 'Zap', title: { ar: 'سرعة في التنفيذ', en: 'A clear path to launch' }, description: { ar: 'خطة تنفيذ واضحة من تحديد المتطلبات حتى الإطلاق.', en: 'A clear delivery plan from requirements through launch.' } },
]

export const storeProPortfolio = [
  { id: 'fashion', title: { ar: 'متجر أزياء', en: 'Fashion storefront' }, category: { ar: 'الأزياء والإكسسوارات', en: 'Fashion and accessories' }, image: '/images/storepro/portfolio-fashion.png' },
  { id: 'beauty', title: { ar: 'متجر عناية وجمال', en: 'Beauty storefront' }, category: { ar: 'مستحضرات التجميل والعناية', en: 'Beauty and skincare' }, image: '/images/storepro/portfolio-beauty.png' },
  { id: 'electronics', title: { ar: 'متجر إلكترونيات', en: 'Electronics storefront' }, category: { ar: 'الأجهزة والتقنية', en: 'Devices and technology' }, image: '/images/storepro/portfolio-electronics.png' },
]

export const storeProPlans = [
  { id: 'starter', title: { ar: 'الأساسية', en: 'Essential' }, description: { ar: 'للبداية المنظمة وإطلاق متجرك الإلكتروني.', en: 'A focused start for launching your online store.' }, features: [{ ar: 'تصميم متجر إلكتروني', en: 'Online store design' }, { ar: 'إدارة المنتجات والطلبات', en: 'Product and order management' }, { ar: 'تصميم متوافق مع الجوال', en: 'Mobile-ready design' }, { ar: 'دعم فني عند الإطلاق', en: 'Launch support' }] },
  { id: 'growth', title: { ar: 'الاحترافية', en: 'Professional' }, description: { ar: 'للمتاجر التي تحتاج إلى أدوات نمو وتكاملات إضافية.', en: 'For stores that need more growth tools and integrations.' }, features: [{ ar: 'كل مميزات الباقة الأساسية', en: 'Everything in Essential' }, { ar: 'ربط بوابات الدفع والشحن', en: 'Payment and shipping integrations' }, { ar: 'تقارير وتحليلات', en: 'Reports and analytics' }, { ar: 'دعم مستمر لمدة سنة', en: 'One year of ongoing support' }], popular: true },
  { id: 'enterprise', title: { ar: 'الشركات', en: 'Business' }, description: { ar: 'حلول مخصصة للفرق والأنشطة ذات المتطلبات المتقدمة.', en: 'Custom solutions for teams with advanced requirements.' }, features: [{ ar: 'حلول مصممة حسب النشاط', en: 'Business-specific setup' }, { ar: 'تكامل مع الأنظمة الخارجية', en: 'External system integrations' }, { ar: 'تدريب للفريق', en: 'Team onboarding' }, { ar: 'خطة دعم مخصصة', en: 'Tailored support plan' }] },
]

export const storeProText = (value: StoreProLocaleText, isEnglish: boolean) => isEnglish ? value.en : value.ar

