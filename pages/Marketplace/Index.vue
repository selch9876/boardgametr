<!-- src/pages/Marketplace/Index.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router' // <-- Route'u import ettik
import { marketService } from '../../services/marketService'
import GameCard from '../../components/marketplace/GameCard.vue'
import MarketSidebar from '../../components/marketplace/MarketSidebar.vue'

const route = useRoute()
const listings = ref([])
const isLoading = ref(true)
const errorMessage = ref(null)

const fetchListings = async () => {
  isLoading.value = true
  const response = await marketService.getActiveListings()
  if (response.success) {
    listings.value = response.data
  } else {
    errorMessage.value = response.error
  }
  isLoading.value = false
}

// Sayfa ilk açıldığında çalışır
onMounted(() => {
  fetchListings()
})

// Sidebar'dan gelecek filtre bilgilerini tutacağımız obje
const activeFilters = ref({
  search: '',
  minPrice: null,
  maxPrice: null,
  condition: ''
})

// Sidebar'dan '@filter-changed' olayı tetiklendiğinde çalışacak fonksiyon
const updateFilters = (newFilters) => {
  activeFilters.value = newFilters
}

// 2. SİHİRLİ KISIM: Vue'nun Computed özelliği
// Bu özellik, listings veya activeFilters içindeki en ufak bir değişiklikte sayfadaki kartları anında günceller!
const filteredListings = computed(() => {
  return listings.value.filter(listing => {
    // 1. Arama Filtresi (Oyun adına göre)
    const titleMatch = listing.games?.title?.toLowerCase().includes(activeFilters.value.search.toLowerCase())
    
    // 2. Fiyat Filtresi
    const minMatch = activeFilters.value.minPrice ? listing.price >= activeFilters.value.minPrice : true
    const maxMatch = activeFilters.value.maxPrice ? listing.price <= activeFilters.value.maxPrice : true
    
    // 3. Kondisyon Filtresi
    const conditionMatch = activeFilters.value.condition ? listing.condition === activeFilters.value.condition : true

    // Kartın ekranda kalması için tüm koşullardan "true" alması (geçmesi) gerekir
    return titleMatch && minMatch && maxMatch && conditionMatch
  })
})

onMounted(async () => {
  isLoading.value = true
  const response = await marketService.getActiveListings()
  if (response.success) {
    listings.value = response.data
  } else {
    errorMessage.value = response.error
  }
  isLoading.value = false
})
</script>

<template>
  <div class="marketplace-page">
    <header class="page-header">
      <h2>İkinci El Pazar Yeri</h2>
      <p>Topluluğumuzdaki diğer oyuncuların satışa çıkardığı oyunları keşfet.</p>
    </header>

    <!-- Sayfayı ikiye bölen ana taşıyıcı -->
    <div class="marketplace-layout">
      
      <!-- SOL TARAF: Sidebar Bileşenimiz -->
      <aside class="sidebar-container">
        <MarketSidebar @filter-changed="updateFilters" />
      </aside>

      <!-- SAĞ TARAF: İlan Listesi -->
      <main class="content-container">
        <div v-if="isLoading" class="state-box loading-state">
          ⏳ Oyunlar yükleniyor...
        </div>
        <div v-else-if="errorMessage" class="state-box error-state">
          ❌ Bir hata oluştu: {{ errorMessage }}
        </div>
        
        <!-- DİKKAT: Artık listings yerine filteredListings içinde dönüyoruz! -->
        <div v-else-if="filteredListings.length > 0" class="listings-grid">
          <GameCard 
            v-for="listing in filteredListings" 
            :key="listing.id" 
            :listing="listing" 
          />
        </div>
        
        <div v-else class="state-box empty-state">
          🔍 Bu filtreleme kriterlerine uygun ilan bulunamadı.
        </div>
      </main>

    </div>
  </div>
</template>

<style scoped>
.marketplace-page {
  padding: 1rem 0;
}
.page-header {
  margin-bottom: 2rem;
}
.page-header h2 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}
.page-header p {
  color: #7f8c8d;
}

/* YENİ EKLENEN: Layout Düzeni (Flexbox) */
.marketplace-layout {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Tablet ve Masaüstü için yan yana dizilim */
@media (min-width: 768px) {
  .marketplace-layout {
    flex-direction: row;
    align-items: flex-start;
  }
  .sidebar-container {
    width: 250px;
    flex-shrink: 0; /* Sidebar genişliği daralmasın */
  }
  .content-container {
    flex-grow: 1; /* Liste alanı kalan tüm boşluğu kaplasın */
  }
}

/* Önceden Yaptığımız Grid Yapısı */
.listings-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
}
@media (min-width: 768px) {
  .listings-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .listings-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.state-box {
  text-align: center;
  padding: 3rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  color: #7f8c8d;
  font-size: 1.1rem;
}
.error-state {
  color: #e74c3c;
  background-color: #fdf0ed;
}
</style>