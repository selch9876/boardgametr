<!-- src/pages/Marketplace/Index.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { marketService } from '../../services/marketService.js'
import GameCard from '../../components/marketplace/GameCard.vue'

// Reaktif Durum (State) Değişkenlerimiz
const listings = ref([])        // İlanları tutacağımız dizi
const isLoading = ref(true)     // Yükleniyor animasyonu için kontrol
const errorMessage = ref(null)  // Olası bir hatayı tutacağımız değişken

// Sayfa ekrana çizildiği (mount olduğu) anda çalışacak fonksiyon
onMounted(async () => {
  isLoading.value = true
  
  // marketService üzerinden Supabase'e bağlanıp aktif ilanları çekiyoruz
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

    <!-- 1. Durum: Veriler Yüklenirken -->
    <div v-if="isLoading" class="state-box loading-state">
      ⏳ Oyunlar yükleniyor, lütfen bekleyin...
    </div>

    <!-- 2. Durum: Bir Hata Oluşursa -->
    <div v-else-if="errorMessage" class="state-box error-state">
      ❌ Bir hata oluştu: {{ errorMessage }}
    </div>

    <!-- 3. Durum: İlanlar Başarıyla Çekilirse (Grid Listeleme) -->
    <div v-else-if="listings.length > 0" class="listings-grid">
      <!-- v-for döngüsü ile çektiğimiz her bir ilan için bir GameCard basıyoruz -->
      <GameCard 
        v-for="listing in listings" 
        :key="listing.id" 
        :listing="listing" 
      />
    </div>

    <!-- 4. Durum: Veritabanında Hiç İlan Yoksa -->
    <div v-else class="state-box empty-state">
      📦 Şu an için pazar yerinde aktif bir ilan bulunmuyor.
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

/* CSS Grid Mimarisi: Kartların yan yana dizilmesi için */
.listings-grid {
  display: grid;
  /* Min 280px genişliğinde kartlar, ekrana sığdığı kadar yan yana dizilir */
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

/* Durum Kutuları (Yükleniyor, Hata, Boş) Tasarımı */
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