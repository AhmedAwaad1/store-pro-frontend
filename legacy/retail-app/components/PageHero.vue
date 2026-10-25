<template>
  <section class="page-hero"><div class="container"><div><span class="eyebrow">{{ eyebrow }}</span><h1>{{ title }}</h1><p v-if="description">{{ description }}</p></div><slot /></div></section>
</template>
<script setup lang="ts">defineProps<{ title: string; description?: string; eyebrow?: string }>()</script>
