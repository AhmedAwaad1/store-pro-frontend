<template>
  <div class="empty-state"><div class="empty-icon"><slot name="icon">♡</slot></div><h2>{{ title }}</h2><p>{{ text }}</p><NuxtLink :to="actionTo" class="btn primary">{{ action }}</NuxtLink></div>
</template>
<script setup lang="ts">defineProps<{ title:string; text:string; action:string; actionTo:string }>()</script>
