<template>
  <div class="sp-admin-root" dir="rtl">
    <header class="sp-admin-topbar">
      <NuxtLink class="sp-admin-brand" to="/admin" aria-label="StorePro admin home">
        <span class="sp-brand-mark"><Store :size="22" stroke-width="2.5" /></span>
        <span><strong>StorePro</strong><small>إدارة المنصة</small></span>
      </NuxtLink>

      <div class="sp-admin-tools">
        <span class="sp-admin-user">{{ user?.username || 'مدير المنصة' }}</span>
        <button class="sp-theme-toggle" type="button" :aria-label="theme === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'" :aria-pressed="theme === 'dark'" @click="toggleTheme">
          <Sun v-show="theme === 'dark'" :size="18" aria-hidden="true" />
          <Moon v-show="theme !== 'dark'" :size="18" aria-hidden="true" />
        </button>
        <button class="sp-admin-logout" type="button" @click="signOut"><LogOut :size="16" /> <span>تسجيل الخروج</span></button>
      </div>
    </header>

    <div class="sp-admin-frame">
      <aside class="sp-admin-sidebar">
        <p class="sp-admin-nav-label">إدارة الموقع</p>
        <nav aria-label="التنقل في لوحة الإدارة">
          <NuxtLink v-for="item in visibleItems" :key="item.to" :to="item.to" :aria-current="normalizedPath === item.to ? 'page' : undefined">
            <component :is="item.icon" :size="18" aria-hidden="true" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>
        <NuxtLink class="sp-admin-site-link" to="/">عرض الموقع <ExternalLink :size="15" /></NuxtLink>
      </aside>

      <div class="sp-admin-content"><slot /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ContactRound, ExternalLink, FileText, LayoutDashboard, LogOut, MessagesSquare, Moon, Search, Sun, Store } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { user, logout, hasPermission } = useApi()
const { theme, toggleTheme } = useStoreProTheme()
const items = [
  { to: '/admin', label: 'الرئيسية', icon: LayoutDashboard },
  { to: '/admin/inquiries', label: 'استفسارات المبيعات', icon: MessagesSquare, permission: 'support.manage' },
  { to: '/admin/contacts', label: 'رسائل التواصل', icon: ContactRound, permission: 'support.manage' },
  { to: '/admin/content', label: 'صفحات الموقع', icon: FileText, permission: 'content.manage' },
  { to: '/admin/blog', label: 'المقالات', icon: FileText, permission: 'content.manage' },
  { to: '/admin/seo', label: 'إعادة توجيه الروابط', icon: Search, permission: 'content.manage' },
]
const visibleItems = computed(() => items.filter(item => !item.permission || hasPermission(item.permission)))
const normalizedPath = computed(() => route.path.replace(/\/+$/, '') || '/')

async function signOut() {
  try {
    await logout()
  } finally {
    await router.replace('/admin/login')
  }
}
</script>
