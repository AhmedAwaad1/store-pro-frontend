<template>
  <main class="admin-page">
    <div class="admin-shell">
      <header class="admin-heading">
        <div><p>3B / ADMIN</p><h1>Catalog foundation</h1><span>Manage brands, technical specification templates, and warranties.</span></div>
        <button type="button" class="refresh" :disabled="loading" @click="load">Refresh data</button>
      </header>

      <p v-if="message" class="notice" role="status">{{ message }}</p>
      <p v-if="error" class="error" role="alert">{{ error }}</p>

      <section class="panel">
        <div class="panel-title"><div><p>CATALOG</p><h2>Brands</h2></div><span>{{ brands.length }} records</span></div>
        <form class="form-grid" @submit.prevent="saveBrand">
          <label>English name<input v-model="brandForm.name_en" required></label>
          <label>Arabic name<input v-model="brandForm.name_ar" required dir="rtl"></label>
          <label>Slug<input v-model="brandForm.slug" required pattern="[A-Za-z0-9_-]+"></label>
          <label>Website<input v-model="brandForm.website_url" type="url" placeholder="https://"></label>
          <label>Display order<input v-model.number="brandForm.sort_order" type="number" min="0"></label>
          <label>Brand logo<input ref="brandLogoInput" type="file" accept="image/jpeg,image/png,image/webp"></label>
          <label class="wide">English brand-store introduction<textarea v-model="brandForm.description_en" rows="3"></textarea></label>
          <label class="wide">Arabic brand-store introduction<textarea v-model="brandForm.description_ar" rows="3" dir="rtl"></textarea></label>
          <label>English SEO title<input v-model="brandForm.meta_title_en"></label><label>Arabic SEO title<input v-model="brandForm.meta_title_ar" dir="rtl"></label>
          <label>English SEO description<textarea v-model="brandForm.meta_description_en" rows="2"></textarea></label><label>Arabic SEO description<textarea v-model="brandForm.meta_description_ar" rows="2" dir="rtl"></textarea></label>
          <label class="check"><input v-model="brandForm.is_featured" type="checkbox"> Featured</label>
          <label class="check"><input v-model="brandForm.is_active" type="checkbox"> Active</label>
          <div class="form-actions"><button class="primary" :disabled="saving">{{ editingBrandId ? 'Save brand changes' : 'Add brand' }}</button><button v-if="editingBrandId" type="button" class="quiet cancel-edit" @click="resetBrandForm">Cancel edit</button></div>
        </form>
        <div class="table-wrap"><table><thead><tr><th>Brand</th><th>Slug</th><th>Featured</th><th>Status</th><th></th></tr></thead><tbody>
          <tr v-for="(brand, index) in brands" :key="brand.id"><td>{{ brand.name_en }} <small>{{ brand.name_ar }}</small></td><td>{{ brand.slug }}</td><td>{{ brand.is_featured ? 'Yes' : 'No' }}</td><td>{{ brand.is_active ? 'Active' : 'Archived' }}</td><td class="actions"><button class="quiet" @click="editBrand(brand)">Edit</button><button class="quiet" :disabled="index === 0" aria-label="Move brand up" @click="moveBrand(brand, -1)">↑</button><button class="quiet" :disabled="index === brands.length - 1" aria-label="Move brand down" @click="moveBrand(brand, 1)">↓</button><button class="quiet" @click="toggleBrand(brand)">{{ brand.is_active ? 'Archive' : 'Activate' }}</button></td></tr>
          <tr v-if="!brands.length"><td colspan="5" class="empty">No brands yet.</td></tr>
        </tbody></table></div>
      </section>

      <section class="panel">
        <div class="panel-title"><div><p>PRODUCT RECORDS</p><h2>Electronics identity and specifications</h2></div><span>{{ products.length }} loaded</span></div>
        <label class="product-search">Find by name, SKU, or model<input v-model="productSearch" @input="searchProducts" placeholder="e.g. refrigerator or model code"></label>
        <div class="product-list">
          <button v-for="product in products" :key="product.id" type="button" :class="['product-row', { selected: selectedProductId === product.id }]" @click="editProduct(product.id)">
            <span><b>{{ product.identity.name_en }}</b><small>{{ product.identity.sku || 'No SKU' }} · {{ product.identity.model_number || 'No model number' }}</small></span>
            <span class="completeness"><b>{{ product.completeness }}%</b><small>complete</small></span>
          </button>
          <p v-if="!products.length" class="empty">Products will appear here after the catalog is populated.</p>
        </div>
        <form v-if="selectedProductId" class="product-editor" @submit.prevent="saveProduct">
          <div class="panel-title"><div><p>EDIT PRODUCT</p><h3>{{ productForm.name_en || `Product #${selectedProductId}` }}</h3></div><span>{{ selectedProductCompleteness }}% complete</span></div>
          <div class="form-grid">
            <label>English name<input v-model="productForm.name_en" required></label>
            <label>Arabic name<input v-model="productForm.name_ar" required dir="rtl"></label>
            <label>SKU<input v-model="productForm.sku"></label>
            <label>Model number<input v-model="productForm.model_number"></label>
            <label>GTIN / barcode<input v-model="productForm.gtin"></label>
            <label>Country of origin<input v-model="productForm.country_of_origin" maxlength="2" placeholder="EG"></label>
            <label>Brand<select v-model.number="productForm.brand_id"><option :value="null">No brand</option><option v-for="brand in brands" :key="brand.id" :value="brand.id">{{ brand.name_en }}</option></select></label>
            <label>Warranty<select v-model.number="productForm.warranty_id"><option :value="null">No warranty selected</option><option v-for="warranty in warranties" :key="warranty.id" :value="warranty.id">{{ warranty.provider }} · {{ warranty.duration_months }} months</option></select></label>
            <label>Category<select v-model.number="productForm.category_id" @change="loadProductSpecifications"><option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name_en }}</option></select></label>
            <label>Release status<select v-model="productForm.release_status"><option value="released">Released</option><option value="coming_soon">Coming soon</option><option value="discontinued">Discontinued</option></select></label>
            <label>Condition<select v-model="productForm.condition"><option value="new">New</option><option value="refurbished">Refurbished</option><option value="open_box">Open box</option></select></label>
            <label>Price (EGP)<input v-model.number="productForm.price" type="number" min="0" step="0.01"></label>
            <label>Discount price (EGP)<input v-model.number="productForm.price_after_discount" type="number" min="0" step="0.01"></label>
            <label class="check"><input v-model="productForm.status" type="checkbox"> Visible in storefront</label>
            <label class="wide">English description<textarea v-model="productForm.description_en" rows="3"></textarea></label>
            <label class="wide">Arabic description<textarea v-model="productForm.description_ar" rows="3" dir="rtl"></textarea></label>
            <label>English highlights, one per line<textarea v-model="highlightsEnText" rows="4"></textarea></label>
            <label>Arabic highlights, one per line<textarea v-model="highlightsArText" rows="4" dir="rtl"></textarea></label>
            <label>Included in box, English<textarea v-model="includedInBoxEnText" rows="4" placeholder="One item per line"></textarea></label>
            <label>Included in box, Arabic<textarea v-model="includedInBoxArText" rows="4" dir="rtl" placeholder="عنصر واحد في كل سطر"></textarea></label>
            <label>Handling class<select v-model="productForm.handling_class"><option value="standard">Standard</option><option value="oversized">Oversized appliance</option><option value="fragile">Fragile</option><option value="installation_required">Installation required</option><option value="digital">Digital delivery</option></select></label>
            <label v-if="productForm.handling_class === 'installation_required'">Installation service fee (EGP)<input v-model.number="productForm.installation_fee" type="number" min="0" step="0.01"><small>Added as a separate order line for each purchased unit.</small></label>
            <label>English SEO title<input v-model="productForm.meta_title_en" maxlength="255"></label>
            <label>Arabic SEO title<input v-model="productForm.meta_title_ar" maxlength="255" dir="rtl"></label>
            <label>English SEO description<textarea v-model="productForm.meta_description_en" rows="3" maxlength="1000"></textarea></label>
            <label>Arabic SEO description<textarea v-model="productForm.meta_description_ar" rows="3" maxlength="1000" dir="rtl"></textarea></label>
          </div>
          <div v-if="productSpecifications.length" class="editor-specifications"><h4>Category specifications</h4><div class="form-grid">
            <label v-for="spec in productSpecifications" :key="spec.id">{{ spec.name_en }}<small>{{ spec.value_type }}<template v-if="spec.unit"> · {{ spec.unit }}</template><template v-if="spec.is_required"> · required</template></small>
              <input v-if="['number','measurement'].includes(spec.value_type)" v-model.number="spec.value" type="number" :required="spec.is_required" :step="spec.value_type === 'measurement' ? 'any' : '1'">
              <input v-else-if="spec.value_type === 'boolean'" v-model="spec.value" type="checkbox">
              <select v-else-if="spec.value_type === 'select'" v-model="spec.value" :required="spec.is_required"><option value="">Choose</option><option v-for="option in spec.options || []" :key="option" :value="option">{{ option }}</option></select>
              <textarea v-else-if="spec.value_type === 'multi_select'" v-model="spec.multiText" rows="2" placeholder="One value per line"></textarea>
              <input v-else v-model="spec.value" :required="spec.is_required">
            </label>
          </div></div>
          <button class="primary" :disabled="saving">Save product foundation</button>
          <div class="product-assets">
            <h4>Product media</h4>
            <div class="media-grid"><figure v-for="image in productImages" :key="image.id"><img :src="image.thumbnails?.small || image.image" :alt="locale === 'ar' ? (image.alt_ar || productForm.name_ar) : (image.alt_en || productForm.name_en)"><figcaption><select v-model="image.role" :aria-label="`Image role ${image.id}`"><option value="main">Main</option><option value="gallery">Gallery</option><option value="lifestyle">Lifestyle</option><option value="dimension_diagram">Dimension diagram</option><option value="energy_label">Energy label</option><option value="variant_image">Variant image</option></select><input v-model="image.alt_en" placeholder="English alt text"><input v-model="image.alt_ar" placeholder="Arabic alt text" dir="rtl"><input v-model="image.caption_en" placeholder="English caption"><input v-model="image.caption_ar" placeholder="Arabic caption" dir="rtl"><button type="button" class="quiet" @click="saveProductImage(image)">Save details</button><button type="button" class="quiet" @click="deleteProductImage(image.id)">Remove</button></figcaption></figure></div>
            <label>Add product images<input type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple @change="uploadProductImages"></label>
            <h4>Variants <small>{{ productVariants.length }} records</small></h4>
            <div v-for="variant in productVariants" :key="variant.id" class="variant-entry">
              <div class="variant-row"><input v-model="variant.sku" aria-label="Variant SKU" placeholder="SKU"><input v-model.number="variant.price" type="number" min="0" step="0.01" aria-label="Variant price"><input v-model.number="variant.price_after_discount" type="number" min="0" step="0.01" aria-label="Discount price" placeholder="Discount"><input v-model.number="variant.quantity" type="number" min="0" aria-label="Variant stock"><button type="button" class="quiet" :disabled="saving" @click="saveVariant(variant)">Save variant</button></div>
              <div v-if="variant.images?.length" class="variant-image-list">
                <figure v-for="image in variant.images" :key="image.id">
                  <img :src="image.thumbnails?.small || image.image" :alt="image.alt_en || variant.sku" loading="lazy">
                  <figcaption>{{ image.is_main ? 'Variant image' : 'Alternate view' }}<button type="button" class="quiet" :disabled="saving" @click="deleteVariantImage(variant, image.id)">Remove</button></figcaption>
                </figure>
              </div>
              <label class="variant-image-upload">Add images for {{ variant.sku }}<input type="file" accept="image/jpeg,image/png,image/webp" multiple @change="uploadVariantImages(variant, $event)"></label>
            </div>
            <h4>Product documents</h4>
            <form class="document-form" @submit.prevent="uploadProductDocument"><select v-model="documentForm.type"><option value="manual">Manual</option><option value="datasheet">Datasheet</option><option value="energy_label">Energy label</option><option value="warranty">Warranty</option><option value="installation_guide">Installation guide</option></select><input v-model="documentForm.title_en" required placeholder="English title"><input v-model="documentForm.title_ar" required placeholder="Arabic title" dir="rtl"><input ref="documentFileInput" type="file" accept=".pdf,image/jpeg,image/png,image/webp" required><button class="primary" :disabled="saving">Upload document</button></form>
            <div v-for="document in productDocuments" :key="document.id" class="asset-row"><a :href="document.url || `/storage/${document.file_path}`" target="_blank" rel="noreferrer">{{ document.title_en }}</a> · {{ document.type }} <button type="button" class="quiet" @click="deleteProductDocument(document.id)">Remove</button></div>
            <h4>Product videos</h4>
            <form class="document-form" @submit.prevent="uploadProductVideo"><input v-model="videoForm.title_en" required placeholder="English title"><input v-model="videoForm.title_ar" required placeholder="Arabic title" dir="rtl"><select v-model.number="videoForm.product_variant_id"><option :value="null">All variants</option><option v-for="variant in productVariants" :key="variant.id" :value="variant.id">{{ variant.sku }}</option></select><input ref="videoFileInput" type="file" accept="video/mp4,video/webm" required><button class="primary" :disabled="saving">Upload video</button></form>
            <div v-for="video in productVideos" :key="video.id" class="asset-row">{{ video.title_en }} · {{ video.mime_type }} <button type="button" class="quiet" @click="deleteProductVideo(video.id)">Remove</button></div>
            <h4>Product relationships <small>Compatibility, accessories, bundles, and alternatives.</small></h4>
            <div v-for="(relationship, index) in productRelationships" :key="index" class="relationship-row">
              <select v-model.number="relationship.related_product_id" aria-label="Related product"><option :value="0" disabled>Choose a product</option><option v-for="candidate in products.filter(item => item.id !== selectedProductId)" :key="candidate.id" :value="candidate.id">{{ candidate.identity.name_en }} · {{ candidate.identity.sku || `#${candidate.id}` }}</option></select>
              <select v-model="relationship.type" aria-label="Relationship type"><option value="related">Related</option><option value="compatible">Compatible</option><option value="accessory">Accessory</option><option value="alternative">Alternative</option><option value="bundle">Bundle</option></select>
              <button type="button" class="quiet" @click="productRelationships.splice(index, 1)">Remove</button>
            </div>
            <div class="form-actions"><button type="button" class="quiet" @click="productRelationships.push({ related_product_id: 0, type: 'related', sort_order: productRelationships.length })">Add relationship</button><button type="button" class="primary" :disabled="saving" @click="saveProductRelationships">Save relationships</button></div>
          </div>
        </form>
      </section>

      <section class="panel">
        <div class="panel-title"><div><p>PRODUCT DATA</p><h2>Specification groups</h2></div><span>{{ groups.length }} groups</span></div>
        <form class="form-grid compact" @submit.prevent="saveGroup">
          <label>English name<input v-model="groupForm.name_en" required></label>
          <label>Arabic name<input v-model="groupForm.name_ar" required dir="rtl"></label>
          <label>Slug<input v-model="groupForm.slug" required pattern="[A-Za-z0-9_-]+"></label>
          <div class="form-actions"><button class="primary" :disabled="saving">Add group</button></div>
        </form>
        <div class="group-grid">
          <article v-for="group in groups" :key="group.id" class="group-card"><h3>{{ group.name_en }} <span>{{ group.name_ar }}</span></h3><p>{{ group.slug }}</p><ul><li v-for="spec in group.specifications" :key="spec.id">{{ spec.name_en }} <small>{{ spec.value_type }}<template v-if="spec.unit"> · {{ spec.unit }}</template></small></li></ul></article>
          <p v-if="!groups.length" class="empty">Create groups such as Display, Performance, Capacity, or Connectivity.</p>
        </div>
      </section>

      <section class="panel">
        <div class="panel-title"><div><p>ATTRIBUTE DEFINITIONS</p><h2>Add specification</h2></div></div>
        <form class="form-grid" @submit.prevent="saveSpecification">
          <label>Group<select v-model.number="specForm.specification_group_id" required><option :value="0" disabled>Select a group</option><option v-for="group in groups" :key="group.id" :value="group.id">{{ group.name_en }}</option></select></label>
          <label>Stable key<input v-model="specForm.key" required pattern="[A-Za-z0-9_-]+" placeholder="screen_size"></label>
          <label>English name<input v-model="specForm.name_en" required></label>
          <label>Arabic name<input v-model="specForm.name_ar" required dir="rtl"></label>
          <label>Value type<select v-model="specForm.value_type"><option v-for="type in valueTypes" :key="type" :value="type">{{ type }}</option></select></label>
          <label>Unit<input v-model="specForm.unit" placeholder="inch, GB, liter"></label>
          <label v-if="['select', 'multi_select'].includes(specForm.value_type)" class="wide">Allowed values, one per line<textarea v-model="optionsText" rows="4"></textarea></label>
          <label class="check"><input v-model="specForm.is_filterable" type="checkbox"> Filterable</label>
          <label class="check"><input v-model="specForm.is_comparable" type="checkbox"> Comparable</label>
          <label class="check"><input v-model="specForm.is_required" type="checkbox"> Required by default</label>
          <label class="check"><input v-model="specForm.is_visible" type="checkbox"> Visible on product page</label>
          <div class="form-actions"><button class="primary" :disabled="saving || !groups.length">Add specification</button></div>
        </form>
      </section>

      <section class="panel">
        <div class="panel-title"><div><p>CATEGORY TEMPLATE</p><h2>Assign specifications to a category</h2></div></div>
        <p class="help">Enter the existing category ID. The category API can be used to look up category IDs.</p>
        <form class="assignment" @submit.prevent="assignSpecifications">
          <label>Category ID<input v-model.number="categoryId" type="number" min="1" required></label>
          <div class="assignment-list"><label v-for="spec in flatSpecifications" :key="spec.id" class="check"><input v-model="selectedSpecificationIds" type="checkbox" :value="spec.id">{{ spec.name_en }} <small>{{ spec.groupName }}</small></label></div>
          <button class="primary" :disabled="saving || !flatSpecifications.length">Save category template</button>
        </form>
      </section>

      <section class="panel">
        <div class="panel-title"><div><p>AFTER SALES</p><h2>Warranty records</h2></div><span>{{ warranties.length }} records</span></div>
        <form class="form-grid compact" @submit.prevent="saveWarranty">
          <label>Provider<input v-model="warrantyForm.provider" required></label>
          <label>Type<select v-model="warrantyForm.type"><option value="manufacturer">Manufacturer</option><option value="seller">Seller</option><option value="extended">Extended</option></select></label>
          <label>Months<input v-model.number="warrantyForm.duration_months" required type="number" min="0" max="120"></label>
          <label>Service center<input v-model="warrantyForm.service_center_name"></label>
          <label>Service phone<input v-model="warrantyForm.service_center_phone"></label>
          <label class="wide">English terms<textarea v-model="warrantyForm.terms_en" rows="2"></textarea></label>
          <label class="wide">Arabic terms<textarea v-model="warrantyForm.terms_ar" rows="2" dir="rtl"></textarea></label>
          <div class="form-actions"><button class="primary" :disabled="saving">Add warranty</button></div>
        </form>
        <div class="table-wrap"><table><thead><tr><th>Provider</th><th>Type</th><th>Duration</th><th>Service center</th><th></th></tr></thead><tbody>
          <tr v-for="warranty in warranties" :key="warranty.id"><td>{{ warranty.provider }}</td><td>{{ warranty.type }}</td><td>{{ warranty.duration_months }} months</td><td>{{ warranty.service_center_name || '—' }}</td><td><button class="quiet" @click="deleteWarranty(warranty.id)">Delete</button></td></tr>
          <tr v-if="!warranties.length"><td colspan="5" class="empty">No warranty records yet.</td></tr>
        </tbody></table></div>
      </section>

      <section class="panel">
        <div class="panel-title"><div><p>MERCHANDISING</p><h2>{{ collectionForm.id ? 'Edit collection' : 'Campaigns and curated groups' }}</h2></div><span>{{ collections.length }} collections</span></div>
        <form class="form-grid" @submit.prevent="saveCollection">
          <label>English name<input v-model="collectionForm.name_en" required></label><label>Arabic name<input v-model="collectionForm.name_ar" required dir="rtl"></label>
          <label>Type<select v-model="collectionForm.type"><option value="campaign">Campaign</option><option value="featured_categories">Featured categories</option><option value="curated">Curated products</option></select></label>
          <label>Order<input v-model.number="collectionForm.sort_order" type="number" min="0"></label><label>Start time<input v-model="collectionForm.starts_at" type="datetime-local"></label><label>End time<input v-model="collectionForm.ends_at" type="datetime-local"></label>
          <label>Campaign image<input ref="collectionImageInput" type="file" accept="image/jpeg,image/png,image/webp"></label><label>Product IDs, comma separated<input v-model="collectionProductIds" placeholder="for example: 2, 5, 8"></label>
          <label class="wide">English description<textarea v-model="collectionForm.description_en" rows="2"></textarea></label><label class="wide">Arabic description<textarea v-model="collectionForm.description_ar" rows="2" dir="rtl"></textarea></label>
          <label>English SEO title<input v-model.trim="collectionForm.meta_title_en" maxlength="255"></label><label>Arabic SEO title<input v-model.trim="collectionForm.meta_title_ar" maxlength="255" dir="rtl"></label>
          <label class="wide">English SEO description<textarea v-model="collectionForm.meta_description_en" rows="2" maxlength="1000"></textarea></label><label class="wide" dir="rtl">وصف الحملة لمحركات البحث<textarea v-model="collectionForm.meta_description_ar" rows="2" maxlength="1000" dir="rtl"></textarea></label>
          <label class="check"><input v-model="collectionForm.is_active" type="checkbox"> Active</label><label class="check"><input v-model="collectionForm.is_featured" type="checkbox"> Feature in navigation and homepage</label>
          <div class="form-actions"><button class="primary" :disabled="saving">{{ collectionForm.id ? 'Save collection' : 'Create collection' }}</button><button v-if="collectionForm.id" type="button" class="quiet" @click="resetCollection">Cancel</button></div>
        </form>
        <div class="table-wrap"><table><thead><tr><th>Collection</th><th>Type</th><th>Products</th><th>Order</th><th>Active</th><th></th></tr></thead><tbody><tr v-for="collection in collections" :key="collection.id"><td>{{ collection.name_en }}<small>{{ collection.name_ar }}</small></td><td>{{ collection.type }}</td><td>{{ collection.products_count }}</td><td>{{ collection.sort_order }}</td><td>{{ collection.is_active ? 'Yes' : 'No' }}</td><td><button class="quiet" @click="editCollection(collection)">Edit</button><button class="quiet" @click="moveCollection(collection,-1)">↑</button><button class="quiet" @click="moveCollection(collection,1)">↓</button><button class="quiet" @click="deleteCollectionRecord(collection.id)">Delete</button></td></tr><tr v-if="!collections.length"><td colspan="6" class="empty">No collections yet.</td></tr></tbody></table></div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
type Brand = { id: number; name_en: string; name_ar: string; slug: string; is_active: boolean; is_featured: boolean; website_url?: string | null; sort_order: number; description_en?: string | null; description_ar?: string | null; meta_title_en?: string | null; meta_title_ar?: string | null; meta_description_en?: string | null; meta_description_ar?: string | null }
type Spec = { id: number; name_en: string; name_ar: string; key: string; value_type: string; unit: string | null; specification_group_id: number }
type SpecGroup = { id: number; name_en: string; name_ar: string; slug: string; specifications: Spec[] }
type Warranty = { id: number; provider: string; type: string; duration_months: number; service_center_name?: string | null }
type AdminProduct = { id: number; identity: Record<string, any>; brand?: Brand | null; category?: { id: number } | null; warranty?: Warranty | null; specifications: Array<any>; completeness: number; prices?: Array<any>; images?: Array<any>; variants?: Array<any>; documents?: Array<any>; videos?: Array<any>; relationships?: Array<any>; included_in_box_en?: string[]; included_in_box_ar?: string[]; handling_class?: string; installation_fee?: number; is_active?: boolean; has_variants?: boolean }
type Category = { id: number; name_en: string; name_ar: string }

definePageMeta({
  middleware: ['admin'],
  adminPermission: 'catalog.manage',
})

const { request } = useApi()
const { locale } = useLocale()
const brands = ref<Brand[]>([])
const groups = ref<SpecGroup[]>([])
const warranties = ref<Warranty[]>([])
const collections = ref<any[]>([])
const products = ref<AdminProduct[]>([])
const categories = ref<Category[]>([])
const selectedProductId = ref<number | null>(null)
const selectedProductCompleteness = ref(0)
const productImages = ref<any[]>([])
const productVariants = ref<any[]>([])
const productDocuments = ref<any[]>([])
const productVideos = ref<any[]>([])
const productRelationships = ref<Array<{ related_product_id: number; type: string; sort_order: number }>>([])
const documentFileInput = ref<HTMLInputElement | null>(null)
const videoFileInput = ref<HTMLInputElement | null>(null)
const documentForm = reactive({ type: 'manual', title_en: '', title_ar: '' })
const videoForm = reactive({ title_en: '', title_ar: '', product_variant_id: null as number | null })
const collectionImageInput = ref<HTMLInputElement | null>(null)
const collectionProductIds = ref('')
const collectionForm = reactive({ id: 0, name_en: '', name_ar: '', type: 'curated', description_en: '', description_ar: '', meta_title_en: '', meta_title_ar: '', meta_description_en: '', meta_description_ar: '', sort_order: 0, is_active: true, is_featured: false, starts_at: '', ends_at: '' })
const productSearch = ref('')
const productSpecifications = ref<Array<any>>([])
const highlightsEnText = ref('')
const highlightsArText = ref('')
const includedInBoxEnText = ref('')
const includedInBoxArText = ref('')
const loading = ref(false)
const saving = ref(false)
const message = ref('')
const error = ref('')
const categoryId = ref<number | null>(null)
const selectedSpecificationIds = ref<number[]>([])
const editingBrandId = ref<number | null>(null)
const optionsText = ref('')
const valueTypes = ['text', 'number', 'boolean', 'select', 'multi_select', 'measurement']
const brandForm = reactive({ name_en: '', name_ar: '', slug: '', website_url: '', description_en: '', description_ar: '', meta_title_en: '', meta_title_ar: '', meta_description_en: '', meta_description_ar: '', is_featured: false, is_active: true, sort_order: 0 })
const brandLogoInput = ref<HTMLInputElement | null>(null)
const groupForm = reactive({ name_en: '', name_ar: '', slug: '' })
const specForm = reactive({ specification_group_id: 0, key: '', name_en: '', name_ar: '', value_type: 'text', unit: '', is_filterable: false, is_comparable: true, is_required: false, is_visible: true })
const warrantyForm = reactive({ provider: '', type: 'manufacturer', duration_months: 12, service_center_name: '', service_center_phone: '', terms_en: '', terms_ar: '' })
const productForm = reactive({ name_en: '', name_ar: '', description_en: '', description_ar: '', sku: '', model_number: '', gtin: '', country_of_origin: '', brand_id: null as number | null, warranty_id: null as number | null, category_id: 0, release_status: 'released', condition: 'new', handling_class: 'standard', installation_fee: 0 as number, price: 0 as number, price_after_discount: null as number | null, status: true, meta_title_en: '', meta_title_ar: '', meta_description_en: '', meta_description_ar: '' })
const flatSpecifications = computed(() => groups.value.flatMap(group => group.specifications.map(spec => ({ ...spec, groupName: group.name_en }))))

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const [brandResponse, specificationResponse, warrantyResponse, categoryResponse, productResponse, collectionResponse] = await Promise.all([
      request<any>('/admin/catalog/brands'),
      request<SpecGroup[]>('/admin/catalog/specifications'),
      request<any>('/admin/catalog/warranties'),
      request<any>('/category'),
      request<any>(`/admin/catalog/products${productSearch.value ? `?search=${encodeURIComponent(productSearch.value)}` : ''}`),
      request<any>('/admin/catalog/collections'),
    ])
    brands.value = brandResponse.data.data || brandResponse.data
    groups.value = specificationResponse.data
    warranties.value = warrantyResponse.data.data || warrantyResponse.data
    categories.value = categoryResponse.data.data || categoryResponse.data
    products.value = productResponse.data.data || productResponse.data
    collections.value = collectionResponse.data.data || collectionResponse.data
  } catch (exception) { error.value = exception instanceof Error ? exception.message : 'Unable to load catalog settings.' }
  finally { loading.value = false }
}

const runSave = async (action: () => Promise<unknown>, success: string, reset: () => void) => {
  saving.value = true
  error.value = ''
  message.value = ''
  try { await action(); reset(); message.value = success; await load() }
  catch (exception) { error.value = exception instanceof Error ? exception.message : 'Unable to save this record.' }
  finally { saving.value = false }
}
const resetBrandForm = () => { editingBrandId.value = null; Object.assign(brandForm, { name_en: '', name_ar: '', slug: '', website_url: '', description_en: '', description_ar: '', meta_title_en: '', meta_title_ar: '', meta_description_en: '', meta_description_ar: '', is_featured: false, is_active: true, sort_order: 0 }); if (brandLogoInput.value) brandLogoInput.value.value = '' }
const editBrand = (brand: Brand) => { editingBrandId.value = brand.id; Object.assign(brandForm, { name_en: brand.name_en, name_ar: brand.name_ar, slug: brand.slug, website_url: brand.website_url || '', description_en: brand.description_en || '', description_ar: brand.description_ar || '', meta_title_en: brand.meta_title_en || '', meta_title_ar: brand.meta_title_ar || '', meta_description_en: brand.meta_description_en || '', meta_description_ar: brand.meta_description_ar || '', is_featured: brand.is_featured, is_active: brand.is_active, sort_order: brand.sort_order }) }
const saveBrand = () => { const body = new FormData(); Object.entries(brandForm).forEach(([key, value]) => body.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value))); if (brandLogoInput.value?.files?.[0]) body.append('logo', brandLogoInput.value.files[0]); if (editingBrandId.value) body.append('_method', 'PUT'); return runSave(() => request(editingBrandId.value ? `/admin/catalog/brands/${editingBrandId.value}` : '/admin/catalog/brands', { method: 'POST', body }), editingBrandId.value ? 'Brand store updated.' : 'Brand added.', resetBrandForm) }
const toggleBrand = (brand: Brand) => runSave(() => request(`/admin/catalog/brands/${brand.id}`, { method: 'PUT', body: { is_active: !brand.is_active } }), 'Brand status updated.', () => {})
const moveBrand = (brand: Brand, direction: -1 | 1) => {
  const ordered = [...brands.value].sort((a, b) => a.sort_order - b.sort_order)
  const index = ordered.findIndex(item => item.id === brand.id)
  const destination = index + direction
  if (!ordered[destination]) return
  const [moved] = ordered.splice(index, 1)
  ordered.splice(destination, 0, moved)
  return runSave(() => Promise.all(ordered.map((item, sort_order) =>
    request(`/admin/catalog/brands/${item.id}`, { method: 'PUT', body: { sort_order } })
  )), 'Brand order updated.', () => {})
}
const saveGroup = () => runSave(() => request('/admin/catalog/specification-groups', { method: 'POST', body: groupForm }), 'Specification group added.', () => Object.assign(groupForm, { name_en: '', name_ar: '', slug: '' }))
const saveSpecification = () => runSave(() => request('/admin/catalog/specifications', { method: 'POST', body: { ...specForm, options: ['select', 'multi_select'].includes(specForm.value_type) ? optionsText.value.split('\n').map(value => value.trim()).filter(Boolean) : null } }), 'Specification added.', () => { Object.assign(specForm, { key: '', name_en: '', name_ar: '', unit: '' }); optionsText.value = '' })
const assignSpecifications = () => runSave(() => request(`/admin/catalog/categories/${categoryId.value}/specifications`, { method: 'PUT', body: { specifications: selectedSpecificationIds.value.map((specification_id, sort_order) => ({ specification_id, sort_order })) } }), 'Category specification template saved.', () => {})
const saveWarranty = () => runSave(() => request('/admin/catalog/warranties', { method: 'POST', body: warrantyForm }), 'Warranty added.', () => Object.assign(warrantyForm, { provider: '', type: 'manufacturer', duration_months: 12, service_center_name: '', service_center_phone: '', terms_en: '', terms_ar: '' }))
const deleteWarranty = (id: number) => runSave(() => request(`/admin/catalog/warranties/${id}`, { method: 'DELETE' }), 'Warranty deleted.', () => {})
let searchTimer: ReturnType<typeof setTimeout> | undefined
const searchProducts = () => { if (searchTimer) clearTimeout(searchTimer); searchTimer = setTimeout(load, 300) }
const editProduct = async (id: number) => {
  error.value = ''
  try {
    const response = await request<AdminProduct>(`/admin/catalog/products/${id}`)
    const product = response.data
    selectedProductId.value = id
    selectedProductCompleteness.value = product.completeness
    Object.assign(productForm, {
      name_en: product.identity.name_en, name_ar: product.identity.name_ar,
      sku: product.identity.sku || '', model_number: product.identity.model_number || '', gtin: product.identity.gtin || '',
      country_of_origin: product.identity.country_of_origin || '', release_status: product.identity.release_status,
      condition: product.identity.condition, brand_id: product.brand?.id || null,
      handling_class: product.handling_class || 'standard',
      installation_fee: product.installation_fee || 0,
      warranty_id: product.warranty?.id || null, category_id: product.category?.id || 0,
      description_en: product.description_en || '', description_ar: product.description_ar || '',
      price: product.prices?.[0]?.price ?? 0, price_after_discount: product.prices?.[0]?.price_after_discount ?? null,
      status: product.is_active ?? true,
      meta_title_en: product.seo?.meta_title_en || '', meta_title_ar: product.seo?.meta_title_ar || '',
      meta_description_en: product.seo?.meta_description_en || '', meta_description_ar: product.seo?.meta_description_ar || '',
    })
    highlightsEnText.value = (product.highlights_en || []).join('\n')
    highlightsArText.value = (product.highlights_ar || []).join('\n')
    includedInBoxEnText.value = (product.included_in_box_en || []).join('\n')
    includedInBoxArText.value = (product.included_in_box_ar || []).join('\n')
    productImages.value = product.images || []
    productVariants.value = product.variants || []
    productDocuments.value = product.documents || []
    productVideos.value = product.videos || []
    productRelationships.value = (product.relationships || []).map(({ related_product_id, type, sort_order }) => ({ related_product_id, type, sort_order }))
    await loadProductSpecifications()
    for (const specification of product.specifications || []) {
      const field = productSpecifications.value.find(item => item.id === specification.specification_id)
      if (!field) continue
      field.value = specification.value_number ?? specification.value_boolean ?? specification.value_text ?? ''
      field.multiText = Array.isArray(specification.value_json) ? specification.value_json.join('\n') : ''
    }
  } catch (exception) { error.value = exception instanceof Error ? exception.message : 'Unable to load product.' }
}
const loadProductSpecifications = async () => {
  if (!productForm.category_id) { productSpecifications.value = []; return }
  const response = await request<any[]>(`/admin/catalog/categories/${productForm.category_id}/specifications`)
  productSpecifications.value = (response.data || []).flatMap((group: any) => group.items.map((spec: any) => ({ ...spec, group_name: group.name_en, value: spec.value_type === 'boolean' ? false : '', multiText: '' })))
}
const saveProduct = () => {
  if (!selectedProductId.value) return
  const values = productSpecifications.value.filter(spec => spec.value !== '' || spec.multiText).map(spec => ({
    specification_id: spec.id,
    value: spec.value_type === 'multi_select' ? spec.multiText.split('\n').map((value: string) => value.trim()).filter(Boolean) : spec.value,
  }))
  return runSave(() => request(`/products/${selectedProductId.value}`, { method: 'PUT', body: {
    ...productForm,
    sub_category_id: null,
    specifications: values,
    highlights_en: highlightsEnText.value.split('\n').map(value => value.trim()).filter(Boolean),
    highlights_ar: highlightsArText.value.split('\n').map(value => value.trim()).filter(Boolean),
    included_in_box_en: includedInBoxEnText.value.split('\n').map(value => value.trim()).filter(Boolean),
    included_in_box_ar: includedInBoxArText.value.split('\n').map(value => value.trim()).filter(Boolean),
  } }), 'Product foundation saved.', () => {})
}
const uploadProductImages = async (event: Event) => {
  if (!selectedProductId.value) return
  const files = (event.target as HTMLInputElement).files
  if (!files?.length) return
  const body = new FormData()
  body.append('_method', 'PUT')
  Array.from(files).forEach((file, index) => { body.append(`images[${index}][path]`, file); body.append(`images[${index}][is_main]`, index === 0 && productImages.value.length === 0 ? '1' : '0') })
  await runSave(() => request(`/products/${selectedProductId.value}`, { method: 'POST', body }), 'Product images uploaded.', () => editProduct(selectedProductId.value!))
}
const deleteProductImage = async (id: number) => {
  if (!selectedProductId.value) return
  const body = new FormData(); body.append('_method', 'PUT'); body.append('deleted_images[]', String(id))
  await runSave(() => request(`/products/${selectedProductId.value}`, { method: 'POST', body }), 'Product image removed.', () => editProduct(selectedProductId.value!))
}
const uploadProductDocument = async () => {
  if (!selectedProductId.value || !documentFileInput.value?.files?.[0]) return
  const body = new FormData(); body.append('type', documentForm.type); body.append('title_en', documentForm.title_en); body.append('title_ar', documentForm.title_ar); body.append('file', documentFileInput.value.files[0])
  await runSave(() => request(`/admin/catalog/products/${selectedProductId.value}/documents`, { method: 'POST', body }), 'Product document uploaded.', () => { Object.assign(documentForm, { type: 'manual', title_en: '', title_ar: '' }); if (documentFileInput.value) documentFileInput.value.value = ''; return editProduct(selectedProductId.value!) })
}
const deleteProductDocument = (id: number) => runSave(() => request(`/admin/catalog/products/${selectedProductId.value}/documents/${id}`, { method: 'DELETE' }), 'Product document removed.', () => editProduct(selectedProductId.value!))
const uploadProductVideo = async () => {
  if (!selectedProductId.value || !videoFileInput.value?.files?.[0]) return
  const body = new FormData()
  body.append('title_en', videoForm.title_en)
  body.append('title_ar', videoForm.title_ar)
  body.append('file', videoFileInput.value.files[0])
  if (videoForm.product_variant_id) body.append('product_variant_id', String(videoForm.product_variant_id))
  await runSave(() => request(`/admin/catalog/products/${selectedProductId.value}/videos`, { method: 'POST', body }), 'Product video uploaded.', () => {
    Object.assign(videoForm, { title_en: '', title_ar: '', product_variant_id: null })
    if (videoFileInput.value) videoFileInput.value.value = ''
    return editProduct(selectedProductId.value!)
  })
}
const deleteProductVideo = (id: number) => runSave(() => request(`/admin/catalog/products/${selectedProductId.value}/videos/${id}`, { method: 'DELETE' }), 'Product video removed.', () => editProduct(selectedProductId.value!))
const saveProductRelationships = () => {
  if (!selectedProductId.value) return
  return runSave(() => request(`/admin/catalog/products/${selectedProductId.value}/relationships`, {
    method: 'PUT', body: { relationships: productRelationships.value },
  }), 'Product relationships saved.', () => {})
}
const saveVariant = (variant: any) => runSave(() => request(`/product-variants/${variant.id}`, { method: 'PUT', body: { sku: variant.sku, price: variant.price, price_after_discount: variant.price_after_discount || null, quantity: variant.quantity, barcode: variant.barcode, weight: variant.weight, is_active: variant.is_active } }), 'Variant saved.', () => editProduct(selectedProductId.value!))
const uploadVariantImages = async (variant: any, event: Event) => {
  if (!selectedProductId.value) return
  const files = (event.target as HTMLInputElement).files
  if (!files?.length) return
  const body = new FormData()
  body.append('_method', 'PUT')
  body.append('quantity', String(variant.quantity ?? 0))
  Array.from(files).forEach((file, index) => {
    body.append(`images[${index}][path]`, file)
    body.append(`images[${index}][is_main]`, index === 0 && !(variant.images || []).some((image: any) => image.is_main) ? '1' : '0')
  })
  await runSave(() => request(`/product-variants/${variant.id}`, { method: 'POST', body }), 'Variant images uploaded.', () => editProduct(selectedProductId.value!))
}
const deleteVariantImage = (variant: any, imageId: number) => {
  const body = new FormData()
  body.append('_method', 'PUT')
  body.append('quantity', String(variant.quantity ?? 0))
  body.append('deleted_images[]', String(imageId))
  return runSave(() => request(`/product-variants/${variant.id}`, { method: 'POST', body }), 'Variant image removed.', () => editProduct(selectedProductId.value!))
}
const saveProductImage = (image: any) => runSave(() => request(`/admin/catalog/products/${selectedProductId.value}/images/${image.id}`, { method: 'PATCH', body: { role: image.role, is_main: image.role === 'main', alt_en: image.alt_en, alt_ar: image.alt_ar, caption_en: image.caption_en, caption_ar: image.caption_ar } }), 'Image details saved.', () => editProduct(selectedProductId.value!))
const resetCollection = () => { Object.assign(collectionForm, { id: 0, name_en: '', name_ar: '', type: 'curated', description_en: '', description_ar: '', meta_title_en: '', meta_title_ar: '', meta_description_en: '', meta_description_ar: '', sort_order: 0, is_active: true, is_featured: false, starts_at: '', ends_at: '' }); collectionProductIds.value=''; if(collectionImageInput.value) collectionImageInput.value.value='' }
const editCollection = (collection: any) => { Object.assign(collectionForm, { ...collection, starts_at: collection.starts_at ? String(collection.starts_at).slice(0,16) : '', ends_at: collection.ends_at ? String(collection.ends_at).slice(0,16) : '' }); collectionProductIds.value=(collection.products || []).map((product:any)=>product.id).join(', '); }
const saveCollection = () => { const id=collectionForm.id; const body=new FormData(); Object.entries(collectionForm).forEach(([key,value])=>{ if(key!=='id' && value!=='' && value!==null) body.append(key, typeof value==='boolean'?(value?'1':'0'):String(value)) }); collectionProductIds.value.split(',').map(value=>value.trim()).filter(Boolean).forEach((value,index)=>body.append(`product_ids[${index}]`,value)); if(collectionImageInput.value?.files?.[0]) body.append('image',collectionImageInput.value.files[0]); if(id) body.append('_method','PUT'); return runSave(()=>request(id?`/collections/${id}`:'/collections',{method:'POST',body}),id?'Collection updated.':'Collection created.',resetCollection) }
const moveCollection = (collection:any, direction:-1|1) => { const ordered=[...collections.value].sort((a,b)=>a.sort_order-b.sort_order); const index=ordered.findIndex(item=>item.id===collection.id); const target=ordered[index+direction]; if(!target) return; const currentOrder=collection.sort_order; collection.sort_order=target.sort_order; target.sort_order=currentOrder; return runSave(()=>Promise.all([request(`/collections/${collection.id}`,{method:'PUT',body:{sort_order:collection.sort_order}}),request(`/collections/${target.id}`,{method:'PUT',body:{sort_order:target.sort_order}})]),'Collection order updated.',()=>{}) }
const deleteCollectionRecord = (id:number) => runSave(()=>request(`/collections/${id}`,{method:'DELETE'}),'Collection deleted.',()=>{})

onMounted(load)
</script>

<style scoped>
.admin-page{min-height:100vh;background:#f4f6f8;padding:38px 18px 70px;color:#16212b}.admin-shell{max-width:1180px;margin:auto}.admin-heading,.panel-title{display:flex;align-items:center;justify-content:space-between;gap:18px}.admin-heading{margin-bottom:24px}.admin-heading p,.panel-title p{margin:0;color:#657482;font-size:.7rem;font-weight:800;letter-spacing:.13em}.admin-heading h1{margin:6px 0;font-size:2rem}.admin-heading span,.help{color:#697784}.refresh,.quiet{border:1px solid #d6dde3;border-radius:8px;background:#fff;color:#253748;padding:9px 14px;cursor:pointer}.panel{background:white;border:1px solid #e1e6ea;border-radius:14px;padding:24px;margin:18px 0;box-shadow:0 3px 14px #1a2a3808}.panel-title{margin-bottom:18px}.panel-title h2{font-size:1.22rem;margin:4px 0 0}.panel-title>span{color:#63717d;font-size:.82rem}.form-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.form-grid.compact{grid-template-columns:repeat(4,minmax(0,1fr))}.form-grid label,.assignment>label{display:flex;flex-direction:column;gap:6px;color:#425363;font-size:.8rem;font-weight:650}.form-grid input,.form-grid select,.form-grid textarea,.assignment input{width:100%;min-height:40px;border:1px solid #d6dde3;border-radius:8px;padding:8px 10px;font:inherit;background:#fff;color:#172430}.form-grid .check,.assignment-list .check{flex-direction:row;align-items:center}.check input{width:auto!important;min-height:auto!important;accent-color:#153e57}.form-actions{display:flex;align-items:end}.primary{min-height:40px;border:0;border-radius:8px;background:#153e57;color:#fff;padding:0 17px;font-weight:750;cursor:pointer}.primary:disabled{opacity:.5;cursor:wait}.wide{grid-column:1/-1}.table-wrap{overflow:auto;margin-top:20px}table{width:100%;border-collapse:collapse;font-size:.86rem}th,td{text-align:start;padding:12px 10px;border-bottom:1px solid #e9edf0}th{color:#687783;font-size:.72rem;text-transform:uppercase;letter-spacing:.04em}td small{display:block;color:#7a8792;margin-top:3px}.quiet{padding:6px 10px;font-size:.78rem}.empty{padding:22px;color:#7a8792;text-align:center}.group-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px;margin-top:18px}.group-card{border:1px solid #e3e8ec;border-radius:10px;padding:15px}.group-card h3{font-size:.95rem;margin:0}.group-card h3 span{color:#74818c;font-weight:500}.group-card p{color:#74818c;font-size:.76rem}.group-card ul{padding-inline-start:18px;margin-bottom:0}.group-card li{margin:8px 0;font-size:.85rem}.group-card li small{display:inline;color:#74818c;margin-inline-start:7px}.assignment{display:grid;grid-template-columns:200px 1fr;gap:16px;align-items:end}.assignment-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}.assignment-list .check{font-size:.84rem;color:#3e4d59}.assignment-list small{color:#7d8993}.assignment>button{grid-column:2;justify-self:start}.notice,.error{border-radius:8px;padding:12px 14px}.notice{background:#e8f5ed;color:#1e6a3a}.error{background:#fff0ee;color:#a62d21}
.product-search{display:flex;flex-direction:column;gap:7px;max-width:430px;color:#51616e;font-size:.82rem}.product-search input{min-height:40px;border:1px solid #d6dde3;border-radius:8px;padding:8px 10px}.product-list{max-height:350px;overflow:auto;margin:12px 0}.product-row{width:100%;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:11px 13px;text-align:start;background:#fff;border:0;border-bottom:1px solid #edf0f2;color:#263541;cursor:pointer}.product-row:hover,.product-row.selected{background:#f2f7fa}.product-row small,.completeness small{display:block;color:#74818c;font-size:.76rem;margin-top:4px}.completeness{text-align:end;color:#1c7650}.product-editor{border-top:1px solid #e4e9ed;padding-top:20px;margin-top:12px}.product-editor h3{margin:5px 0}.product-editor .panel-title{margin-bottom:20px}.editor-specifications{padding:18px 0}.editor-specifications h4{margin:0 0 14px}.editor-specifications label small{font-weight:500;color:#73808a}
.product-assets{border-top:1px solid #e4e9ed;margin-top:20px;padding-top:10px}.product-assets h4{margin:20px 0 10px}.product-assets h4 small{font-size:.75rem;color:#73808a;font-weight:500}.media-grid{display:flex;flex-wrap:wrap;gap:12px}.media-grid figure{width:150px;margin:0;border:1px solid #e1e6ea;border-radius:8px;overflow:hidden}.media-grid img{width:100%;height:110px;object-fit:contain;background:#f7f8f9}.media-grid figcaption{padding:8px;font-size:.76rem}.document-form{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}.document-form input,.document-form select{min-height:38px;max-width:210px;border:1px solid #d6dde3;border-radius:7px;padding:7px}.asset-row{padding:9px 0;border-bottom:1px solid #edf0f2;font-size:.84rem}.asset-row a{color:#175272}
.variant-row{display:grid;grid-template-columns:1.2fr repeat(3,minmax(100px,.8fr)) auto;gap:8px;padding:8px 0;border-bottom:1px solid #edf0f2}.variant-row input{min-width:0;min-height:38px;border:1px solid #d6dde3;border-radius:7px;padding:7px}
.variant-entry{padding:8px 0 14px;border-bottom:1px solid #dfe5e9}.variant-image-list{display:flex;flex-wrap:wrap;gap:9px;margin:7px 0 10px}.variant-image-list figure{width:104px;margin:0;border:1px solid #e1e6ea;border-radius:8px;overflow:hidden;background:#fff}.variant-image-list img{display:block;width:100%;height:76px;object-fit:contain;background:#f7f8f9}.variant-image-list figcaption{display:flex;align-items:center;justify-content:space-between;gap:5px;padding:5px;font-size:.67rem;color:#52616d}.variant-image-list .quiet{padding:4px 6px}.variant-image-upload{display:flex;align-items:center;gap:10px;color:#52616d;font-size:.78rem}.variant-image-upload input{max-width:250px;font:inherit}
.relationship-row{display:grid;grid-template-columns:2fr 1fr auto;gap:8px;margin:8px 0}.relationship-row select{min-height:38px;min-width:0;border:1px solid #d6dde3;border-radius:7px;padding:7px;background:white}
@media(max-width:760px){.admin-heading{align-items:flex-start;flex-direction:column}.form-grid,.form-grid.compact{grid-template-columns:repeat(2,minmax(0,1fr))}.assignment{grid-template-columns:1fr}.assignment>button{grid-column:1}.panel{padding:17px}.admin-page{padding-inline:12px}}
@media(max-width:460px){.form-grid,.form-grid.compact{grid-template-columns:1fr}.wide{grid-column:auto}.form-actions{grid-column:1}.admin-heading h1{font-size:1.65rem}.relationship-row{grid-template-columns:1fr}}
</style>
