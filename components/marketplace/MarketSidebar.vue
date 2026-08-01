<!-- src/components/marketplace/MarketSidebar.vue -->
<script setup>
import { ref, watch } from 'vue'

// Ana sayfaya (Index.vue) filtrelerin değiştiğini haber vereceğimiz olay (event)
const emit = defineEmits(['filter-changed'])

// Filtrelerimizin anlık durumunu tutan obje
const filters = ref({
  search: '',
  minPrice: null,
  maxPrice: null,
  condition: ''
})

// watch: Vue'nun takipcisidir. filters objesindeki herhangi bir değer değiştiği anda çalışır
// ve yeni filtreleri ana sayfaya fırlatır (emit).
watch(filters, (newValues) => {
  emit('filter-changed', newValues)
}, { deep: true })
</script>

<template>
  <div class="sidebar">
    <h3 class="sidebar-title">Filtreler</h3>

    <!-- 1. Oyun Adına Göre Arama -->
    <div class="filter-group">
      <label>Oyun Adı</label>
      <input 
        v-model="filters.search" 
        type="text" 
        placeholder="Örn: Scythe, Catan..." 
        class="filter-input"
      />
    </div>

    <!-- 2. Fiyat Aralığı -->
    <div class="filter-group">
      <label>Fiyat Aralığı (TL)</label>
      <div class="price-inputs">
        <input v-model="filters.minPrice" type="number" placeholder="Min" class="filter-input" />
        <span>-</span>
        <input v-model="filters.maxPrice" type="number" placeholder="Max" class="filter-input" />
      </div>
    </div>

    <!-- 3. Kondisyon Seçimi -->
    <div class="filter-group">
      <label>Kondisyon</label>
      <select v-model="filters.condition" class="filter-input">
        <option value="">Tümü</option>
        <option value="new_in_shrink">Sıfır (Jelatininde)</option>
        <option value="punched_unplayed">Oynanmamış</option>
        <option value="like_new">Yeni Gibi</option>
        <option value="good">İyi</option>
        <option value="fair">Yıpranmış</option>
      </select>
    </div>
    
    <button @click="filters = { search: '', minPrice: null, maxPrice: null, condition: '' }" class="clear-btn">
      Filtreleri Temizle
    </button>
  </div>
</template>

<style scoped>
.sidebar {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #eaeaea;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.sidebar-title {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.2rem;
}

.filter-group {
  margin-bottom: 1.5rem;
}

.filter-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: bold;
  color: #34495e;
  margin-bottom: 0.5rem;
}

.filter-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.clear-btn {
  width: 100%;
  padding: 0.5rem;
  background-color: transparent;
  border: 1px solid #e74c3c;
  color: #e74c3c;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background-color: #e74c3c;
  color: white;
}
</style>