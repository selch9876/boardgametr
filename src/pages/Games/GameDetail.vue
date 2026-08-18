<!-- src/pages/Games/GameDetail.vue -->
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

const game = ref(null)
const listings = ref([])
const reviews = ref([])
const isLoading = ref(true)
const errorMessage = ref(null)
const isAdmin = ref(false)

// Koleksiyon yönetimi için state'ler
const currentUserId = ref(null)
const userGameStatus = ref(null) // 'owned', 'wishlist' veya null

// İnceleme / Puanlama state'leri
const userRating = ref(5)
const userComment = ref('')
const isSubmittingReview = ref(false)
const reviewError = ref(null)
const reviewSuccess = ref(null)

onMounted(async () => {
  const gameId = route.params.id
  
  // 1. Oturum ve Admin Yetki Kontrolü
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    currentUserId.value = session.user.id

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()
    
    isAdmin.value = !!profile?.is_admin

    // Kullanıcının bu oyunu koleksiyonuna ekleyip eklemediğini kontrol et
    const { data: userGameData } = await supabase
      .from('user_games')
      .select('status')
      .eq('user_id', session.user.id)
      .eq('game_id', gameId)
      .single()

    if (userGameData) {
      userGameStatus.value = userGameData.status
    }
  }

  // 2. Oyun, İlanlar ve İncelemeleri Çekme
  const [gameRes, listingsRes, reviewsRes] = await Promise.all([
    marketService.getGameById(gameId),
    marketService.getListingsByGameId(gameId),
    marketService.getGameReviews(gameId)
  ])

  if (gameRes.success) {
    game.value = gameRes.data
  } else {
    errorMessage.value = 'Oyun bilgileri bulunamadı.'
  }

  if (listingsRes.success) {
    listings.value = listingsRes.data
  }

  if (reviewsRes.success) {
    reviews.value = reviewsRes.data
    // Eğer oturum açan kullanıcının daha önceden yaptığı bir inceleme varsa formu dolduralım
    if (currentUserId.value) {
      const myExistingReview = reviews.value.find(r => r.user_id === currentUserId.value)
      if (myExistingReview) {
        userRating.value = myExistingReview.rating
        userComment.value = myExistingReview.comment || ''
      }
    }
  }

  isLoading.value = false
})

const goToTheListing = (listingId) => {
  router.push(`/marketplace/${listingId}`)
}

const goToAdminEdit = () => {
  router.push(`/admin/games/${game.value.id}/edit`)
}

// Koleksiyona ekleme / çıkarma / güncelleme fonksiyonu (Toggle)
const handleToggleGame = async (status) => {
  if (!currentUserId.value) {
    alert('Koleksiyonunuza oyun eklemek için giriş yapmalısınız.')
    router.push('/login')
    return
  }

  const gameId = game.value.id
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

// İnceleme Gönderme / Güncelleme
const handleSubmitReview = async () => {
  if (!currentUserId.value) {
    alert('İnceleme yapmak için giriş yapmalısınız.')
    router.push('/login')
    return
  }

  isSubmittingReview.value = true
  reviewError.value = null
  reviewSuccess.value = null

  const res = await marketService.upsertGameReview(
    currentUserId.value, 
    game.value.id, 
    userRating.value, 
    userComment.value
  )

  if (res.success) {
    reviewSuccess.value = 'Değerlendirmeniz başarıyla kaydedildi!'
    // Listeyi güncelleyelim
    const updatedReviews = await marketService.getGameReviews(game.value.id)
    if (updatedReviews.success) {
      reviews.value = updatedReviews.data
    }
  } else {
    reviewError.value = res.error
  }

  isSubmittingReview.value = false
}

// İnceleme Silme
const handleDeleteReview = async (reviewId) => {
  if (!confirm('Değerlendirmenizi silmek istediğinize emin misiniz?')) return

  const res = await marketService.deleteGameReview(reviewId)
  if (res.success) {
    reviews.value = reviews.value.filter(r => r.id !== reviewId)
    userComment.value = ''
    userRating.value = 5
    reviewSuccess.value = 'Değerlendirmeniz kaldırıldı.'
  } else {
    alert('Silinirken hata oluştu: ' + res.error)
  }
}

// Ortalama Puan Hesaplama
const averageRating = computed(() => {
  if (!reviews.value || reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, curr) => acc + curr.rating, 0)
  return (sum / reviews.value.length).toFixed(1)
})

// Sadece yazılı yorum içeren değerlendirmeleri filtreleyen computed property
const filteredReviews = computed(() => {
  if (!reviews.value) return []
  return reviews.value.filter(r => r.comment && r.comment.trim() !== '' && r.comment !== 'EMPTY')
})

// Nokta ile yarım kalmayı önleyen, karakter limitli ve akıllı özet fonksiyonu
const oyunOzeti = computed(() => {
  if (!game.value || !game.value.description) return ''
  
  let temizMetin = game.value.description.replace(/<[^>]*>?/gm, '')
  temizMetin = temizMetin.replace(/&nbsp;/g, ' ').trim()
  
  if (temizMetin.length <= 180) return temizMetin
  
  let kesikMetin = temizMetin.substring(0, 180)
  let sonBosluk = kesikMetin.lastIndexOf(' ')
  
  return sonBosluk > 0 ? kesikMetin.substring(0, sonBosluk) + '...' : kesikMetin + '...'
})

const formatliAciklama = computed(() => {
  if (!game.value || !game.value.description) return ''
  
  let metin = game.value.description
  metin = metin.replace(/&nbsp;/g, '')

  let paragraflar = metin.split(/\r?\n\s*\r?\n/)
  
  metin = paragraflar
    .filter(p => p.trim() !== '')
    .map(p => {
       if (p.trim().match(/^<\/?(h[1-6]|ul|li|div|p|img)/i)) {
         return p.trim()
       }
       return `<p>${p.trim()}</p>`
    })
    .join('')
    
  metin = metin.replace(/\r?\n/g, '<br>')
  
  return metin
})
</script>

<template>
  <div class="page-container">
    <div class="top-nav-bar">
      <button class="back-btn" @click="router.push('/games')">← Kataloğa Geri Dön</button>
      
      <button v-if="isAdmin" class="admin-edit-btn" @click="goToAdminEdit">
        ✏️ Bu Oyunu Düzenle (CMS)
      </button>
    </div>

    <div v-if="isLoading" class="state-box">⏳ Oyun yükleniyor...</div>
    <div v-else-if="errorMessage" class="state-box error">❌ {{ errorMessage }}</div>

    <template v-else-if="game">
      <!-- Oyun Detay Kartı (Hero Alanı) -->
      <div class="game-detail-card">
        <div class="game-image-wrapper">
          <img 
            :src="game.thumbnail_url || '/placeholder.jpg'" 
            :alt="game.title" 
            @error="(e) => e.target.src = '/placeholder.jpg'"
          />
        </div>

        <div class="game-content">
          <div class="header-top-row">
            <div class="category-tag" v-if="game.categories">
              🏷️ {{ game.categories.name }}
            </div>

            <!-- Akıllı Koleksiyon ve İstek Listesi Butonları -->
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
          
          <div class="title-rating-row">
            <h1>{{ game.title }}</h1>
            <div class="overall-rating-badge" v-if="reviews.length > 0">
              ⭐ {{ averageRating }} <span class="review-count">({{ reviews.length }} değerlendirme)</span>
            </div>
          </div>

          <!-- Özellik Grid Kutuları -->
          <div class="features-grid">
            <div class="feature-box">
              <span class="f-label">Oyuncu Sayısı</span>
              <span class="f-value">
                👥 {{ game.min_players === game.max_players ? `${game.min_players} Oyuncu` : `${game.min_players}-${game.max_players} Oyuncu` }}
              </span>
            </div>
            <div class="feature-box">
              <span class="f-label">Yaş Sınırı</span>
              <span class="f-value">👶 {{ game.min_age ? `${game.min_age}+ Yaş` : 'Her Yaş' }}</span>
            </div>
            <div class="feature-box">
              <span class="f-label">Ortalama Süre</span>
              <span class="f-value">⏱️ {{ game.play_time }} dk</span>
            </div>
            <div class="feature-box">
              <span class="f-label">Dil Bağımlılığı</span>
              <span class="f-value">💬 {{ game.language_dependence || 'Bağımsız' }}</span>
            </div>
          </div>

          <!-- Akıllı Özet Alanı -->
          <div class="description-section" v-if="game.description">
            <h3>Oyun Hakkında</h3>
            <p>{{ oyunOzeti }}</p>
          </div>

          <!-- İlan Ver Butonu -->
          <div class="action-section">
            <router-link 
              :to="{ path: '/marketplace/create', query: { game_id: game.id, game_title: game.title } }" 
              class="create-listing-btn"
            >
              + Bu Oyun İçin İlan Ver
            </router-link>
          </div>
        </div>
      </div>

      <!-- Alt Kısım: Tam Genişlikte Orijinal Makale ve İnceleme Alanı -->
      <div class="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 my-6" v-if="game.description">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Oyun İncelemesi ve Detaylı Açıklama</h3>
        <div class="text-gray-700 leading-relaxed full-text-content" v-html="formatliAciklama"></div>
      </div>

      <!-- Topluluk Değerlendirmeleri ve Puanlama Alanı -->
      <div class="reviews-section">
        <h3>Topluluk Değerlendirmeleri ({{ reviews.length }})</h3>

        <!-- Puan Verme Formu (Giriş Yapmış Kullanıcılar İçin) -->
        <div v-if="currentUserId" class="review-form-card">
          <h4>Oyunu Değerlendir</h4>
          <form @submit.prevent="handleSubmitReview">
            <div class="rating-select-group">
              <label>Puanınız:</label>
              <select v-model.number="userRating" class="rating-select">
                <option :value="5">⭐⭐⭐⭐⭐ (5 - Mükemmel)</option>
                <option :value="4">⭐⭐⭐⭐ (4 - Çok İyi)</option>
                <option :value="3">⭐⭐⭐ (3 - Ortalama)</option>
                <option :value="2">⭐⭐ (2 - Zayıf)</option>
                <option :value="1">⭐ (1 - Çok Kötü)</option>
              </select>
            </div>

            <div class="comment-group">
              <textarea 
                v-model="userComment" 
                placeholder="Bu oyun hakkındaki düşüncelerinizi, deneyimlerinizi paylaşın..."
                rows="3"
                class="review-textarea"
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="submit" class="submit-review-btn" :disabled="isSubmittingReview">
                {{ isSubmittingReview ? 'Gönderiliyor...' : 'Değerlendirmeyi Kaydet' }}
              </button>
              <button 
                type="button" 
                v-if="reviews.some(r => r.user_id === currentUserId)" 
                @click="handleDeleteReview(reviews.find(r => r.user_id === currentUserId)?.id)"
                class="delete-review-btn"
              >
                Değerlendirmeni Sil
              </button>
            </div>

            <p v-if="reviewSuccess" class="success-msg">{{ reviewSuccess }}</p>
            <p v-if="reviewError" class="error-msg">{{ reviewError }}</p>
          </form>
        </div>
        <div v-else class="login-prompt-box">
          Bu oyun için puan vermek ve inceleme yazmak için lütfen <router-link to="/auth">giriş yapın</router-link>.
        </div>

        <!-- İncelemeler Listesi (Sadece yazılı yorumu olanlar gösterilir) -->
        <div v-if="filteredReviews.length > 0" class="reviews-list">
          <div v-for="review in filteredReviews" :key="review.id" class="review-item">
            <div class="review-header">
              <span class="reviewer-name">{{ review.profiles?.username || 'Topluluk Üyesi' }}</span>
              <div class="review-rating-stars" v-text="'⭐'.repeat(review.rating)"></div>
            </div>
            <p class="review-comment">{{ review.comment }}</p>
            <span class="review-date">{{ new Date(review.created_at).toLocaleDateString('tr-TR') }}</span>
          </div>
        </div>
        <div v-else class="no-reviews-box">
          💬 Bu oyun için henüz yazılı bir değerlendirme yapılmamış. İlk değerlendirmeyi sen yaz!
        </div>
      </div>

      <!-- Bu Oyun İçin İkinci El İlanlar -->
      <div class="listings-section">
        <h3>Pazar Yeri İlanları ({{ listings.length }})</h3>

        <div v-if="listings.length > 0" class="listings-grid">
          <div 
            v-for="listing in listings" 
            :key="listing.id" 
            class="listing-card clickable"
            @click="goToTheListing(listing.id)"
          >
            <div class="listing-header">
              <span class="price">{{ listing.price }} TL</span>
              <span class="condition-badge">{{ listing.condition }}</span>
            </div>
            <div class="listing-details">
              <p><strong>Satıcı:</strong> {{ listing.profiles?.username || 'Gizli Satıcı' }}</p>
              <p><strong>Kart Kılıfı:</strong> {{ listing.has_sleeves ? 'Var (Sleeved) ✅' : 'Yok ❌' }}</p>
              <p class="listing-desc" v-if="listing.description">"{{ listing.description }}"</p>
            </div>
          </div>
        </div>

        <div v-else class="no-listings-box">
          📦 Bu oyun için henüz aktif ikinci el ilan bulunmuyor. İlk ilanı sen açabilirsin!
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-container {
  padding: 1rem 0 4rem 0;
  max-width: 950px;
  margin: 0 auto;
}

.top-nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.back-btn {
  background: none;
  border: none;
  color: #42b983;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
  padding: 0;
}
.back-btn:hover { text-decoration: underline; }

.admin-edit-btn {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #0f172a;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-edit-btn:hover {
  background: #e2e8f0;
  border-color: #94a3b8;
}

.game-detail-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 6px 24px rgba(0,0,0,0.05);
  display: grid;
  grid-template-columns: 1fr;
  margin-bottom: 3rem;
}

@media (min-width: 768px) {
  .game-detail-card {
    grid-template-columns: 400px 1fr;
  }
}

.game-image-wrapper {
  background: #f1f5f9;
  height: 100%;
  min-height: 380px;
}

.game-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.game-content {
  padding: 2.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.header-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.category-tag {
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.3rem 0.8rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
}

/* Koleksiyon Butonları */
.collection-buttons {
  display: flex;
  gap: 0.5rem;
}

.col-btn {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.col-btn:hover {
  background: #e2e8f0;
}

.col-btn.owned {
  background: #d1fae5;
  color: #065f46;
  border-color: #34d399;
}

.col-btn.owned:hover {
  background: #a7f3d0;
}

.col-btn.wishlist {
  background: #fee2e2;
  color: #991b1b;
  border-color: #f87171;
}

.col-btn.wishlist:hover {
  background: #fecaca;
}

.title-rating-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.game-content h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #0f172a;
  font-weight: 800;
  line-height: 1.2;
}

.overall-rating-badge {
  font-size: 1.1rem;
  font-weight: 800;
  color: #d97706;
  background: #fef3c7;
  padding: 0.3rem 0.8rem;
  border-radius: 8px;
}

.review-count {
  font-size: 0.85rem;
  color: #92400e;
  font-weight: 600;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .features-grid { 
    grid-template-columns: repeat(2, 1fr); 
  }
}

.feature-box {
  background: #f8fafc;
  padding: 0.5rem 0.6rem;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.f-label {
  font-size: 0.65rem;
  color: #64748b;
  font-weight: 600;
  white-space: nowrap;
}

.f-value {
  font-size: 0.8rem;
  color: #1e293b;
  font-weight: 700;
  line-height: 1.2;
}

.description-section h3 {
  margin: 0 0 0.4rem 0;
  font-size: 1.05rem;
  color: #1e293b;
  font-weight: 700;
}

.description-section p {
  margin: 0;
  color: #475569;
  line-height: 1.55;
  font-size: 0.92rem;
}

.action-section {
  margin-top: auto;
  padding-top: 0.5rem;
}

.create-listing-btn {
  display: inline-block;
  background-color: #42b983;
  color: white;
  padding: 0.85rem 1.5rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(66, 185, 131, 0.3);
  transition: all 0.2s;
}

.create-listing-btn:hover {
  background-color: #369c6d;
  transform: translateY(-2px);
}

/* İncelemeler Alanı Stilleri */
.reviews-section, .listings-section {
  margin-top: 3rem;
}

.reviews-section h3, .listings-section h3 {
  font-size: 1.5rem;
  color: #0f172a;
  margin-bottom: 1.5rem;
  font-weight: 800;
}

.review-form-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}

.review-form-card h4 {
  margin: 0 0 1rem 0;
  color: #0f172a;
  font-size: 1.1rem;
}

.rating-select-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.rating-select {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 0.95rem;
  background: #f8fafc;
}

.comment-group {
  margin-bottom: 1rem;
}

.review-textarea {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  background: #f8fafc;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.submit-review-btn {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-review-btn:hover {
  background: #369c6d;
}

.delete-review-btn {
  background: #fef2f2;
  color: #e74c3c;
  border: 1px solid #f8d7da;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.success-msg { color: #10b981; font-weight: 600; margin-top: 0.5rem; font-size: 0.9rem; }
.error-msg { color: #ef4444; font-weight: 600; margin-top: 0.5rem; font-size: 0.9rem; }

.login-prompt-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 1.2rem;
  border-radius: 12px;
  text-align: center;
  color: #64748b;
  margin-bottom: 1.5rem;
}

.login-prompt-box a { color: #42b983; font-weight: 700; text-decoration: none; }
.login-prompt-box a:hover { text-decoration: underline; }

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-item {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.reviewer-name {
  font-weight: 700;
  color: #0f172a;
}

.review-rating-stars {
  font-size: 0.9rem;
}

.review-comment {
  margin: 0 0 0.5rem 0;
  color: #334155;
  font-size: 0.95rem;
  line-height: 1.4;
}

.review-date {
  font-size: 0.75rem;
  color: #94a3b8;
}

.no-reviews-box, .no-listings-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 2rem;
  text-align: center;
  border-radius: 14px;
  color: #64748b;
}

.listings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.2rem;
}

.listing-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.25rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.listing-card.clickable {
  cursor: pointer;
}

.listing-card.clickable:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.06);
  border-color: #cbd5e1;
}

.listing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 1.25rem;
  font-weight: 800;
  color: #42b983;
}

.condition-badge {
  font-size: 0.75rem;
  background: #f1f5f9;
  color: #334155;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-weight: 600;
}

.listing-details {
  font-size: 0.9rem;
  color: #475569;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.listing-desc {
  margin-top: 0.5rem;
  font-style: italic;
  color: #64748b;
  background: #f8fafc;
  padding: 0.5rem;
  border-radius: 8px;
}

.state-box {
  text-align: center;
  padding: 3rem;
  color: #64748b;
  font-size: 1.1rem;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}
.error { color: #e74c3c; background: #fdf2f2; border-color: #f8d7da; }

.full-text-content :deep(p) {
  margin-bottom: 1.25rem;
  text-align: justify;
}

.full-text-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

.full-text-content :deep(strong),
.full-text-content :deep(b) {
  color: #0f172a;
  font-weight: 700;
}

.full-text-content :deep(ul) {
  margin-bottom: 1.25rem;
  padding-left: 1.5rem;
  list-style-type: disc;
}

.full-text-content :deep(li) {
  margin-bottom: 0.5rem;
}

.full-text-content :deep(a) {
  color: #42b983;
  text-decoration: none;
}

.full-text-content :deep(a:hover) {
  text-decoration: underline;
}

/* --- MOBİL UYUMLU İNCELEME FORMU DÜZENLEMELERİ --- */
.rating-select-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap; /* Mobilde alt alta kaymasını sağlar */
}

.rating-select {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 0.95rem;
  background: #f8fafc;
  max-width: 100%; /* Kutudan taşmayı önler */
  box-sizing: border-box;
}

.form-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap; /* Mobilde butonların taşmasını önler */
}

.submit-review-btn, .delete-review-btn {
  flex: 1; /* Mobilde butonların esnek ve tam genişlikte olmasını sağlar */
  min-width: 130px;
}

/* Mobil Ekranlar İçin Ekstra Kural */
@media (max-width: 600px) {
  .rating-select-group {
    flex-direction: column;
    align-items: stretch;
    gap: 0.4rem;
  }
  
  .rating-select {
    width: 100%; /* Mobilde select kutusu tam genişlik olur, taşma yapmaz */
  }
}
</style>