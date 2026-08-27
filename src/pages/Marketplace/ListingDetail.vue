<!-- src/pages/Marketplace/ListingDetail.vue -->
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marketService } from '../../services/marketService'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://egzfowxhslazwyclxopt.supabase.co' 
const SUPABASE_KEY = 'sb_publishable_8QGwpT9OXn0g2KDwpb_YOA_SW0cYHug'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const route = useRoute() 
const router = useRouter() 

const listing = ref(null)
const storeListings = ref([])
const isLoading = ref(true)
const errorMessage = ref(null)
const isOwner = ref(false)

const currentUserId = ref(null)
const userGameStatus = ref(null)

onMounted(async () => {
  const listingId = route.params.id 
  
  const response = await marketService.getListingById(listingId)
  
  if (response.success) {
    listing.value = response.data

    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      currentUserId.value = session.user.id
      
      if (response.data.seller_id) {
        isOwner.value = session.user.id === response.data.seller_id
      }

      if (response.data.game_id) {
        const { data: userGameData } = await supabase
          .from('user_games')
          .select('status')
          .eq('user_id', session.user.id)
          .eq('game_id', response.data.game_id)
          .single()

        if (userGameData) {
          userGameStatus.value = userGameData.status
        }
      }
    }

    // DÜZELTME BURADA: Oyun ID'sine ait yasal mağaza fiyatlarını ve mağaza adlarını doğrudan çekiyoruz
    if (response.data.game_id) {
      const { data: storeData, error: storeError } = await supabase
        .from('store_listings')
        .select(`
          id, price, product_url, in_stock, updated_at,
          stores ( id, name, logo_url, website_url )
        `)
        .eq('game_id', response.data.game_id)
        .order('price', { ascending: true })

      if (!storeError && storeData) {
        storeListings.value = storeData
      }
    }

  } else {
    errorMessage.value = "İlan bulunamadı veya yayından kaldırılmış."
  }
  
  isLoading.value = false
})

const conditionInfo = computed(() => {
  const conditions = {
    new_in_shrink: 'Sıfır (Jelatininde)',
    punched_unplayed: 'Oynanmamış',
    like_new: 'Yeni Gibi',
    good: 'İyi',
    fair: 'Yıpranmış'
  }
  return conditions[listing.value?.condition] || 'Bilinmiyor'
})

const formattedPrice = computed(() => {
  if (!listing.value) return ''
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(listing.value.price)
})

const goToEdit = () => {
  router.push(`/marketplace/${route.params.id}/edit`)
}

const handleToggleGame = async (status) => {
  if (!currentUserId.value) {
    alert('Koleksiyonunuza oyun eklemek için giriş yapmalısınız.')
    router.push('/login')
    return
  }

  const gameId = listing.value.game_id
  const res = await marketService.saveUserGame(currentUserId.value, gameId, status)

  if (res.success) {
    if (res.action === 'removed') {
      userGameStatus.value = null
    } else {
      userGameStatus.value = status
    }
  } else {
    alert('İşlem başarısız oldu: ' + res.error)
  }
}
</script>

<template>
  <div class="detail-page">
    <div class="top-nav-bar">
      <button class="back-btn" @click="router.push({ name: 'Marketplace' })">← Pazar Yerine Dön</button>
      
      <button v-if="isOwner" class="edit-listing-btn" @click="goToEdit">
        ✏️ Bu İlanı Düzenle
      </button>
    </div>

    <div v-if="isLoading" class="state-box">⏳ İlan detayları yükleniyor...</div>
    <div v-else-if="errorMessage" class="state-box error">{{ errorMessage }}</div>
    
    <div v-else-if="listing" class="detail-container-wrapper">
      <div class="detail-container">
        <!-- Sol Taraf: Placeholder Destekli Görsel Alanı -->
        <div class="image-section">
          <div class="placeholder-container">
            <img 
              :src="listing.games?.thumbnail_url" 
              :alt="listing.games?.title" 
              class="main-image"
              @error="(e) => e.target.style.display = 'none'"
            />
            <div class="placeholder-overlay">
              <img src="/placeholder.jpg" class="bg-placeholder" alt="" />
              <span class="game-title-text">{{ listing.games?.title || 'Masa Oyunu' }}</span>
            </div>
          </div>
        </div>
        
        <!-- Sağ Taraf: Detaylar -->
        <div class="info-section">
          <div class="title-action-row">
            <h1 class="title">{{ listing.games?.title }}</h1>
            
            <div v-if="currentUserId" class="collection-buttons">
              <button 
                v-if="userGameStatus === 'owned'"
                @click="handleToggleGame('owned')" 
                class="col-btn active owned"
                title="Koleksiyonunuzdan kaldırmak için tıklayın"
              >
                ✅ Sahibim
              </button>

              <button 
                v-else-if="userGameStatus === 'wishlist'"
                @click="handleToggleGame('wishlist')" 
                class="col-btn active wishlist"
                title="İstek listenizden kaldırmak için tıklayın"
              >
                ❤️ İstek Listemde
              </button>

              <template v-else>
                <button 
                  @click="handleToggleGame('owned')" 
                  class="col-btn"
                  title="Koleksiyonuma ekle"
                >
                  ➕ Koleksiyona Ekle
                </button>
                <button 
                  @click="handleToggleGame('wishlist')" 
                  class="col-btn wishlist-add"
                  title="İstek listeme ekle"
                >
                  📌 İstiyorum
                </button>
              </template>
            </div>
          </div>

          <div class="price-tag">{{ formattedPrice }} <span class="second-hand-label">(İkinci El Fiyatı)</span></div>
          
          <div class="specs">
            <p><strong>Kategori:</strong> {{ listing.games?.categories?.name || 'Belirtilmemiş' }}</p>
            <p><strong>Kondisyon:</strong> {{ conditionInfo }}</p>
            <p><strong>Kart Koruması (Sleeve):</strong> {{ listing.has_sleeves ? 'Mevcut ✅' : 'Yok ❌' }}</p>
            <p>
              <strong>Oyuncu Sayısı:</strong> 
              {{ listing.games?.min_players === listing.games?.max_players ? `${listing.games?.min_players} Oyuncu` : `${listing.games?.min_players} - ${listing.games?.max_players} Oyuncu` }}
            </p>
            <p v-if="listing.games?.min_age"><strong>Yaş Sınırı:</strong> {{ listing.games.min_age }}+ Yaş</p>
            <p v-if="listing.games?.play_time"><strong>Süre:</strong> {{ listing.games.play_time }} dk</p>
            <p><strong>Dil Bağımlılığı:</strong> {{ listing.games?.language_dependence || 'Belirtilmemiş' }}</p>
          </div>
          
          <div class="description-box">
            <h3>Satıcı Açıklaması</h3>
            <p>{{ listing.description || 'Satıcı ek bir açıklama girmemiş.' }}</p>
          </div>
          
          <div class="seller-card">
            <div class="seller-header">
              <h3>Satıcı: {{ listing.profiles?.username || 'Topluluk Üyesi' }}</h3>
              <span>⭐ Puan: {{ listing.profiles?.reputation_score || 100 }}/100</span>
            </div>
            <button class="contact-btn" v-if="!isOwner">Satıcıya Mesaj Gönder</button>
            <div v-else class="owner-badge-text">Bu ilan size ait.</div>
          </div>
        </div>
      </div>

      <!-- Yasal Mağaza Sıfır Fiyat Karşılaştırma Bölümü -->
      <div class="store-comparison-section" v-if="storeListings.length > 0">
        <div class="comparison-header">
          <h3>🏪 Sıfır Fiyat Karşılaştırması (Yasal Mağazalar)</h3>
          <p>Bu oyunun yetkili satıcılardaki güncel sıfır fiyatları:</p>
        </div>
        
        <div class="store-listings-grid">
          <div v-for="storePrice in storeListings" :key="storePrice.id" class="store-card">
            <div class="store-info-row">
              <span class="store-name"><strong>{{ storePrice.stores?.name }}</strong></span>
              <span :class="['stock-status', storePrice.in_stock ? 'in-stock' : 'out-stock']">
                {{ storePrice.in_stock ? 'Stokta Var ✅' : 'Tükendi ❌' }}
              </span>
            </div>
            <div class="store-price-action">
              <span class="store-price">{{ storePrice.price }} TL</span>
              <a :href="storePrice.product_url" target="_blank" class="buy-store-btn" v-if="storePrice.in_stock">
                Mağazaya Git ↗
              </a>
              <span class="disabled-btn" v-else>Tükendi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-page { padding: 2rem 0; max-width: 1200px; margin: 0 auto; box-sizing: border-box; }

.top-nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.back-btn { background: none; border: none; color: #42b983; cursor: pointer; font-size: 1rem; font-weight: 700; padding: 0; }
.back-btn:hover { text-decoration: underline; }

.edit-listing-btn {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #0f172a;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
}

.edit-listing-btn:hover {
  background: #e2e8f0;
  border-color: #94a3b8;
}

.detail-container-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  background: #fff;
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  box-sizing: border-box;
}

@media (min-width: 768px) {
  .detail-container { flex-direction: row; }
  .image-section { flex: 0 0 400px; }
}

/* Placeholder Stilleri */
.image-section {
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background: #f1f5f9;
  width: 100%;
}

.placeholder-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-container img.main-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 2;
  border: none;
  border-radius: 0;
}

.placeholder-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.bg-placeholder {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.35;
  filter: grayscale(20%);
}

.game-title-text {
  position: relative;
  z-index: 3;
  padding: 0 1.5rem;
  text-align: center;
  font-family: sans-serif;
  font-weight: 800;
  font-size: 1.35rem;
  color: #0f172a;
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.9), 0 0 8px rgba(255, 255, 255, 0.8);
}

.info-section { flex: 1; display: flex; flex-direction: column; gap: 1.5rem; min-width: 0; }

.title-action-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.title { font-size: 2.2rem; margin: 0; color: #0f172a; font-weight: 800; flex: 1; min-width: 200px; word-break: break-word; }

/* Koleksiyon Butonları */
.collection-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.col-btn {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.col-btn:hover { background: #e2e8f0; }
.col-btn.owned { background: #d1fae5; color: #065f46; border-color: #34d399; }
.col-btn.owned:hover { background: #a7f3d0; }
.col-btn.wishlist { background: #fee2e2; color: #991b1b; border-color: #f87171; }
.col-btn.wishlist:hover { background: #fecaca; }

.price-tag { font-size: 2rem; font-weight: 800; color: #42b983; display: flex; align-items: baseline; gap: 0.5rem; flex-wrap: wrap; }
.second-hand-label { font-size: 0.9rem; color: #64748b; font-weight: 600; }

.specs p { margin: 0.5rem 0; font-size: 1.05rem; color: #334155; word-break: break-word; }
.description-box { background: #f8fafc; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; border-left: 4px solid #42b983; }
.description-box h3 { margin-top: 0; margin-bottom: 0.5rem; color: #0f172a; }
.description-box p { word-break: break-word; color: #475569; margin: 0; }

.seller-card { margin-top: auto; border: 1px solid #e2e8f0; padding: 1.5rem; border-radius: 12px; background: #f8fafc; }
.seller-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
.seller-header h3 { margin: 0; color: #0f172a; }
.contact-btn { width: 100%; padding: 1rem; background: #42b983; color: white; border: none; border-radius: 10px; font-size: 1.05rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 15px rgba(66, 185, 131, 0.3); }
.contact-btn:hover { background: #369c6d; transform: translateY(-2px); }
.owner-badge-text { text-align: center; color: #64748b; font-weight: 600; font-size: 0.95rem; padding: 0.5rem; }

/* Mağaza Fiyat Karşılaştırma Stilleri */
.store-comparison-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  box-sizing: border-box;
}

.comparison-header h3 {
  margin: 0 0 0.25rem 0;
  color: #0f172a;
  font-size: 1.35rem;
  font-weight: 800;
}

.comparison-header p {
  margin: 0 0 1.5rem 0;
  color: #64748b;
  font-size: 0.95rem;
}

.store-listings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

.store-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.store-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.04);
  border-color: #cbd5e1;
}

.store-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.store-name {
  color: #1e293b;
  font-size: 1.05rem;
}

.stock-status {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}

.stock-status.in-stock { background: #d1fae5; color: #065f46; }
.stock-status.out-stock { background: #fee2e2; color: #991b1b; }

.store-price-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e2e8f0;
  padding-top: 0.75rem;
}

.store-price {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
}

.buy-store-btn {
  background: #2563eb;
  color: white;
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s;
}

.buy-store-btn:hover { background: #1d4ed8; }

.disabled-btn {
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 600;
}

.state-box { text-align: center; padding: 3rem; font-size: 1.1rem; color: #64748b; background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; }
.error { color: #e74c3c; background: #fdf2f2; border-color: #f8d7da; }

/* Mobil Uyumluluk Koruması */
@media (max-width: 600px) {
  .detail-container {
    padding: 1rem;
  }
  .store-comparison-section {
    padding: 1.2rem;
  }
  .title {
    font-size: 1.6rem;
  }
}
</style>