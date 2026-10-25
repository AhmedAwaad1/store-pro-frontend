<script setup lang="ts">
const route = useRoute()
const query = { ...route.query }

if (query.sort === 'sale') {
  query.sort = 'discount'
  query.on_sale = '1'
}

await navigateTo({ path: '/search', query }, { replace: true, redirectCode: 302 })
</script>
