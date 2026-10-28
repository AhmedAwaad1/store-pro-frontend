export type NouranNavigationItem = {
  label: string
  href: string
}

export type NouranBrandName = {
  first: string
  connector: string
  last: string
  full: string
}

export type NouranSiteContent = {
  instagramUrl: string
  brand: NouranBrandName
  seo: {
    title: string
    description: string
    openGraphDescription: string
    doctorName: string
    jobTitle: string
  }
  header: {
    announcement: string
    doctor: string
    bookingLabel: string
    skipLinkLabel: string
    navigationLabel: string
    mobileNavigationLabel: string
    homeLabel: string
    openMenuLabel: string
    closeMenuLabel: string
    navigation: NouranNavigationItem[]
  }
  hero: {
    eyebrow: string
    firstLine: string
    emphasizedLine: string
    lastLine: string
    description: string
    primaryCta: string
    secondaryCta: string
    note: string
    quote: string
    quoteEmphasis: string
    evidence: string
    evidenceEmphasis: string
    caption: string
    bottomLabel: string
    scrollLabel: string
    imageAlt: string
    image_path: string | null
    image_url?: string | null
  }
  values: string[]
  about: {
    eyebrow: string
    title: string
    doctorName: string
    lead: string
    paragraphs: string[]
    linkLabel: string
    imageAlt: string
    scriptLine: string
    scriptEmphasis: string
    sideLabel: string
    stickerLine: string
    stickerEmphasis: string
    image_path: string | null
    image_url?: string | null
  }
  approach: {
    eyebrow: string
    title: string
    emphasis: string
    description: string
    steps: Array<{ id: string; title: string; description: string }>
  }
  services: {
    eyebrow: string
    title: string
    emphasis: string
    description: string
    items: Array<{ title: string; description: string }>
    cta: string
    artEyebrow: string
    artTitle: string
    artEmphasis: string
    artCaption: string
    sealTitle: string
    sealEmphasis: string
  }
  content: {
    eyebrow: string
    title: string
    emphasis: string
    description: string
    linkLabel: string
    topics: Array<{ id: string; category: string; tag: string; title: string; subtitle: string; symbol: string; accent: string }>
  }
  reminder: {
    eyebrow: string
    firstLine: string
    emphasizedLine: string
  }
  faq: {
    eyebrow: string
    title: string
    emphasis: string
    description: string
    items: Array<{ question: string; answer: string }>
  }
  contact: {
    eyebrow: string
    title: string
    emphasis: string
    description: string
    cta: string
  }
  footer: {
    tagline: string
    disclaimer: string
    copyright: string
    instagramLabel: string
    homeLabel: string
  }
  blog: {
    eyebrow: string
    title: string
    description: string
    readArticle: string
    articleLabel: string
    allArticles: string
    loading: string
    emptyTitle: string
    emptyDescription: string
    notFound: string
    backToArticles: string
  }
}

export type NouranBlogArticle = {
  id: number
  title?: string
  title_en?: string
  title_ar?: string
  description?: string
  description_en?: string
  description_ar?: string
  content?: string
  content_en?: string
  content_ar?: string
  slug: string
  image?: string | null
  published_at?: string | null
  seo_title_ar?: string | null
  seo_title_en?: string | null
  seo_description_ar?: string | null
  seo_description_en?: string | null
}

export type NouranGlobalSettings = {
  website_name: string
  brand: NouranBrandName
  instagram_url: string
  whatsapp_url: string
  booking_url: string
  seo: NouranSiteContent['seo'] & { social_image_path?: string | null; social_image_url?: string | null }
}

export const nouranSiteContent: NouranSiteContent = {
  instagramUrl: 'https://www.instagram.com/dr_nouran_awaad/',
  brand: { first: 'Nourish', connector: 'to', last: 'Flourish', full: 'Nourish to Flourish' },
  seo: {
    title: 'د. نوران عواد | Nourish to Flourish',
    description: 'رحلة تغذية أهدى، بخطوات واقعية ومتابعة أونلاين مع د. نوران عواد.',
    openGraphDescription: 'رحلة تغذية أهدى، بخطوات واقعية ومتابعة أونلاين.',
    doctorName: 'Dr. Nouran Awaad',
    jobTitle: 'Nutritionist',
  },
  header: {
    announcement: 'مساحة صغيرة لتغذية متوازنة وحياة ألطف',
    doctor: 'DR. NOURAN AWAAD',
    bookingLabel: 'احجز استشارتك',
    skipLinkLabel: 'تخطي إلى المحتوى',
    navigationLabel: 'التنقل الرئيسي',
    mobileNavigationLabel: 'قائمة الموبايل',
    homeLabel: 'الرئيسية',
    openMenuLabel: 'فتح القائمة',
    closeMenuLabel: 'إغلاق القائمة',
    navigation: [
      { label: 'الرئيسية', href: '#home' },
      { label: 'عن نوران', href: '#about' },
      { label: 'طريقتنا', href: '#approach' },
      { label: 'الخدمات', href: '#services' },
      { label: 'محتوى مفيد', href: '#content' },
    ],
  },
  hero: {
    eyebrow: 'NUTRITION WITH KINDNESS',
    firstLine: 'مش دايت جديد.',
    emphasizedLine: 'دي بداية علاقة أحلى',
    lastLine: 'مع أكلك وجسمك.',
    description: 'مع د. نوران عواد، هتلاقي مساعدة علشان تبني عادات غذائية تناسب يومك — بخطط أكل مرنة، متابعة أونلاين، ومعلومات مبنية على أسس علمية.',
    primaryCta: 'ابدأ رحلتك مع نوران',
    secondaryCta: 'اعرف أكتر',
    note: 'خطوة صغيرة كل يوم، ممكن تغيّر حاجات كتير.',
    quote: 'Balanced, not',
    quoteEmphasis: 'restricted.',
    evidence: 'Evidence-based',
    evidenceEmphasis: 'nutrition',
    caption: 'EAT WELL, FEEL GOOD',
    bottomLabel: 'A LITTLE BETTER, EVERY DAY',
    scrollLabel: 'اكتشف الموقع',
    imageAlt: 'الدكتورة نوران عواد بإطلالة طبيعية مبتسمة',
    image_path: null,
  },
  values: ['عادات مستدامة', 'بدون حرمان قاسي', 'أساس علمي', 'متابعة أونلاين'],
  about: {
    eyebrow: '01 / THE PERSON BEHIND THE PAGE',
    title: 'أهلًا، أنا',
    doctorName: 'د. نوران عواد',
    lead: 'مؤمنة إن التغذية الصح مش لازم تكون معقدة، وإن علاقتك بالأكل تستحق تكون أهدى وألطف.',
    paragraphs: [
      'من خلال Nourish to Flourish، بقدّم محتوى توعوي عن التغذية ومتابعة أونلاين بخطط غذائية تتناسب مع احتياجات كل شخص، مع الاهتمام بالمعلومة الموثوقة والخطوات القابلة للتطبيق.',
    ],
    linkLabel: 'تعرف على المحتوى من إنستجرام',
    imageAlt: 'الدكتورة نوران عواد في صورة وسط الطبيعة',
    scriptLine: 'nourish your',
    scriptEmphasis: 'wellbeing.',
    sideLabel: 'SMALL STEPS · BIG CHANGE',
    stickerLine: 'Food is more',
    stickerEmphasis: 'than numbers.',
    image_path: null,
  },
  approach: {
    eyebrow: '02 / THE NOURISH WAY',
    title: 'مفيش مقاس واحد',
    emphasis: 'يناسب الكل.',
    description: 'التغيير اللي بيكمّل يبدأ بخطة مرنة، وفهم احتياجاتك، ودعم يساعدك تكمل.',
    steps: [
      { id: 'understand', title: 'نفهم احتياجك الأول', description: 'كل رحلة مختلفة، وعلشان كده البداية بتكون بفهم عاداتك وروتينك وهدفك.' },
      { id: 'flexible', title: 'خطة فيها مرونة', description: 'اختيارات عملية تناسب الحياة الحقيقية، من غير قواعد قاسية أو إحساس دائم بالذنب.' },
      { id: 'support', title: 'دعم وخطوات ثابتة', description: 'المتابعة بتساعدك تلاحظ تقدمك، وتعدّل المسار لما تحتاج، بدل ما تبدأ من الصفر كل مرة.' },
    ],
  },
  services: {
    eyebrow: '03 / WORK WITH NOURAN',
    title: 'رحلتك الصحية،',
    emphasis: 'على طريقتك.',
    description: 'متابعة أونلاين وخطط غذائية مبنية على احتياجاتك — علشان تكون التغذية جزء طبيعي من يومك، مش عبء إضافي عليه.',
    items: [
      { title: 'خطط غذائية فردية', description: 'بما يتناسب مع أهدافك وتفضيلاتك الغذائية.' },
      { title: 'متابعة عن بُعد', description: 'تواصل ومراجعة للخطوات خلال رحلة التغذية.' },
      { title: 'تثقيف غذائي مبني على العلم', description: 'فهم أفضل للعادات واختيارات الأكل اليومية.' },
    ],
    cta: 'اسأل عن تفاصيل المتابعة',
    artEyebrow: 'A WELL-NOURISHED LIFE',
    artTitle: 'good food,',
    artEmphasis: 'good mood.',
    artCaption: 'الاستمرارية أهم من المثالية',
    sealTitle: 'YOU DESERVE',
    sealEmphasis: 'TO FLOURISH',
  },
  content: {
    eyebrow: "04 / LET'S LEARN TOGETHER",
    title: 'معلومة صغيرة،',
    emphasis: 'فرق كبير.',
    description: 'من الموضوعات اللي بتشاركها د. نوران على إنستجرام.',
    linkLabel: 'شوف كل المحتوى',
    topics: [
      { id: 'insulin', category: 'HEALTH', tag: 'توعية غذائية', title: 'مقاومة الإنسولين:', subtitle: 'إزاي نفهم علاماتها؟', symbol: '✺', accent: '〰' },
      { id: 'liver', category: 'WELLNESS', tag: 'صحة الجسم', title: 'الكبد الدهني:', subtitle: 'معلومات تستحق تعرفها', symbol: '◒', accent: '﹏' },
      { id: 'daily', category: 'NUTRITION', tag: 'عادات يومية', title: 'تغيير العادات:', subtitle: 'ابدأ بخطوات بسيطة', symbol: '☼', accent: '✳ ✳' },
    ],
  },
  reminder: {
    eyebrow: 'A GENTLE REMINDER',
    firstLine: 'الأكل مش اختبار لازم تنجح فيه كل يوم.',
    emphasizedLine: 'هو جزء من حياة تستحق تستمتع بيها.',
  },
  faq: {
    eyebrow: '05 / QUESTIONS & ANSWERS',
    title: 'عندك سؤال؟',
    emphasis: 'إحنا هنا.',
    description: 'كام سؤال ممكن يكونوا في بالك قبل ما تبدأ رحلتك.',
    items: [
      { question: 'هل المتابعة متاحة أونلاين؟', answer: 'أيوه، حساب د. نوران بيقدم خطط غذائية ومتابعة أونلاين. تقدر تتواصل مباشرة لمعرفة التفاصيل والمواعيد المتاحة.' },
      { question: 'هل الخطة بتكون مناسبة لاحتياجاتي؟', answer: 'الهدف من المتابعة الفردية هو وضع اختيارات غذائية تراعي احتياجاتك وروتين حياتك بعد تقييم مناسب لحالتك.' },
      { question: 'إزاي أعرف الأسعار أو أحجز؟', answer: 'تقدر تبعت رسالة لحساب د. نوران على إنستجرام وتسأل عن الباقات، الأسعار، وخطوات بدء المتابعة.' },
      { question: 'هل المحتوى على الموقع بديل للاستشارة الطبية؟', answer: 'لأ. المحتوى عام للتوعية فقط، والحالات الطبية تحتاج تقييمًا فرديًا من المختصين.' },
    ],
  },
  contact: {
    eyebrow: 'YOUR JOURNEY STARTS HERE',
    title: 'جاهز تبدأ خطوة',
    emphasis: 'تفرق معاك؟',
    description: 'راسل د. نوران واعرف تفاصيل المتابعة والخطط الغذائية.',
    cta: 'تواصل عبر إنستجرام',
  },
  footer: {
    tagline: 'تغذية مبنية على العلم، وخطوات ألطف كل يوم.',
    disclaimer: 'المحتوى للتوعية العامة ولا يغني عن المشورة الطبية الفردية.',
    copyright: 'All rights reserved.',
    instagramLabel: 'زيارة إنستجرام',
    homeLabel: 'الرئيسية - د. نوران عواد',
  },
  blog: {
    eyebrow: 'NOURISH TO FLOURISH / ARTICLES',
    title: 'مقالات ومعلومات غذائية',
    description: 'محتوى توعوي عن التغذية والعادات اليومية من د. نوران عواد.',
    readArticle: 'اقرأ المقال',
    articleLabel: 'محتوى توعوي',
    allArticles: 'كل المقالات',
    loading: 'جاري تحميل المقالات…',
    emptyTitle: 'محتوى جديد قريبًا',
    emptyDescription: 'تابع إنستجرام للاطلاع على المحتوى المنشور حاليًا.',
    notFound: 'المقال غير متاح',
    backToArticles: 'العودة إلى المقالات',
  },
}
