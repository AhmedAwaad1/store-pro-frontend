<template>
  <main class="sp-admin-page sp-admin-page-heading">
    <p>تم نقل لوحة الإدارة إلى <NuxtLink to="/admin">مساحة العمل الجديدة</NuxtLink>.</p>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin'] })

onMounted(() => navigateTo('/admin', { replace: true }))
</script>
