<template>
  <footer class="sp-footer">
    <div class="sp-footer-cta">
      <div class="sp-container sp-footer-cta-row">
        <div><span class="sp-eyebrow">{{ isEnglish ? 'Your next step' : 'خطوتك القادمة' }}</span><h2>{{ isEnglish ? 'Ready to launch your online store?' : 'جاهز تبدأ متجرك الإلكتروني؟' }}</h2><p>{{ isEnglish ? 'Talk with our team about the right setup for your business.' : 'تحدث مع فريقنا لاختيار الحل المناسب لنشاطك.' }}</p></div>
        <NuxtLink class="sp-btn sp-btn-light" to="/contact#inquiry">{{ isEnglish ? 'Request a consultation' : 'اطلب استشارة مجانية' }} <ArrowUpLeft :size="18" /></NuxtLink>
      </div>
    </div>
    <div class="sp-container sp-footer-main">
      <div class="sp-footer-brand"><NuxtLink class="sp-brand" to="/"><span class="sp-brand-mark"><Store :size="23" /></span><span class="sp-brand-copy"><strong>StorePro</strong><small>{{ isEnglish ? 'E-commerce solutions' : 'حلول التجارة الإلكترونية' }}</small></span></NuxtLink><p>{{ isEnglish ? 'A practical platform for building and growing your online business.' : 'منصة عملية لبناء متجرك الإلكتروني وتنمية أعمالك.' }}</p></div>
      <div><h3>{{ isEnglish ? 'Explore' : 'اكتشف' }}</h3><NuxtLink to="/services">{{ isEnglish ? 'Services' : 'خدماتنا' }}</NuxtLink><NuxtLink to="/portfolio">{{ isEnglish ? 'Our work' : 'أعمالنا' }}</NuxtLink><NuxtLink to="/pricing">{{ isEnglish ? 'Pricing' : 'الأسعار' }}</NuxtLink></div>
      <div><h3>{{ isEnglish ? 'StorePro' : 'ستور برو' }}</h3><NuxtLink to="/about">{{ isEnglish ? 'About us' : 'من نحن' }}</NuxtLink><NuxtLink to="/blog">{{ isEnglish ? 'Articles' : 'مقالات' }}</NuxtLink><NuxtLink to="/contact">{{ isEnglish ? 'Contact' : 'تواصل معنا' }}</NuxtLink></div>
    </div>
    <div class="sp-container sp-footer-bottom"><span>© {{ new Date().getFullYear() }} StorePro. {{ isEnglish ? 'All rights reserved.' : 'جميع الحقوق محفوظة.' }}</span><NuxtLink to="/contact">{{ isEnglish ? 'Get in touch' : 'تواصل مع فريقنا' }}</NuxtLink></div>
  </footer>
</template>
<script setup lang="ts">
import { ArrowUpLeft, Store } from 'lucide-vue-next'
const { isEnglish } = useLocale()
</script>
