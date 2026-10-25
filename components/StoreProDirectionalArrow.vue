<template>
  <ArrowLeft v-if="!isEnglish" :size="size" aria-hidden="true" />
  <ArrowRight v-else :size="size" aria-hidden="true" />
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowRight } from 'lucide-vue-next'

withDefaults(defineProps<{ size?: number }>(), { size: 16 })
const { isEnglish } = useLocale()
</script>
