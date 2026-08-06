<!-- src/pages/Admin/AdminDashboard.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../services/supabase'
import { marketService } from '../../services/marketService'

const router = useRouter()

const activeTab = ref('reviews') // 'reviews', 'games', 'listings'
const reviews = ref([])
const pendingGames = ref([])
const listings = ref([])
const isLoading = ref(true)
const errorMessage = ref(null)
const successMessage = ref(null)

onMounted(async () => {
  // 1. Admin yetki kontrolü
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    alert('Yönetim paneline erişmek için giriş yapmalısınız.')
    router.push('/login')
    return
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single()

  if (!profile?.is_admin) {
    alert('Bu sayfaya erişim yetkiniz yok.')
    router.push('/')
    return
  }

  await loadAdminData()
})

const loadAdminData = async () => {
  isLoading.value = true
  errorMessage.value = null

  // İncelemeleri çek
  const reviewsRes = await marketService.getAllReviewsForAdmin()
  if (reviewsRes.success) {
    reviews.value = reviewsRes.data
  }

  // Onay bekleyen oyunları çek
  const { data: gamesData } = await supabase
    .from('games')
    .select('*, categories:category_id(name)')
    .eq('is_approved', false)
    .order('title', { ascending: true })
  
  if (gamesData) pendingGames.value = gamesData

  // Aktif ilanları çek
  const listingsRes = await marketService.getAllListings()
  if (listingsRes.success) {
    listings.value = listingsRes.data
  }

  isLoading.value = false
}

// İnceleme Onay Durumunu Değiştir
const handleToggleReviewApproval = async (reviewId, currentStatus) => {
  const newStatus = !currentStatus
  const res = await marketService.updateReviewApproval(reviewId, newStatus)
  if (res.success) {
    const review = reviews.value.find(r => r.id === reviewId)
    if (review) review.is_approved = newStatus
    showSuccess('İnceleme onay durumu güncellendi.')
  } else {
    alert('Hata: ' + res.error)
  }
}

// İncelemeyi Sil
const handleDeleteReview = async (reviewId) => {
  if (!confirm('Bu incelemeyi tamamen silmek istediğinize emin misiniz?')) return
  const res = await marketService.deleteGameReview(reviewId)
  if (res.success) {
    reviews.value = reviews.value.filter(r => r.id !== reviewId)
    showSuccess('İnceleme silindi.')
  } else {
    alert('Silinemedi: ' + res.error)
  }
}

// Oyunu Onayla
const handleApproveGame = async (gameId) => {
  const { error } = await supabase
    .from('games')
    .update({ is_approved: true })
    .eq('id', gameId)

  if (!error) {
    pendingGames.value = pendingGames.value.filter(g => g.id !== gameId)
    showSuccess('Oyun onaylandı ve katalogda yayınlandı!')
  } else {
    alert('Onaylanırken hata oluştu: ' + error.message)
  }
}

// Oyunu Reddet / Sil
const handleDeleteGame = async (gameId) => {
  if (!confirm('Bu oyunu katalogdan tamamen silmek/reddetmek istediğinize emin misiniz?')) return
  const { error } = await supabase.from('games').delete().eq('id', gameId)
  if (!error) {
    pendingGames.value = pendingGames.value.filter(g => g.id !== gameId)
    showSuccess('Oyun kaldırıldı.')
  } else {
    alert('Hata: ' + error.message)
  }
}

// İlanı Kaldır
const handleDeleteListing = async (listingId) => {
  if (!confirm('Bu ilanı yayından kaldırmak istediğinize emin misiniz?')) return
  const { error } = await supabase.from('listings').delete().eq('id', listingId)
  if (!error) {
    listings.value = listings.value.filter(l => l.id !== listingId)
    showSuccess('İlan kaldırıldı.')
  } else {
    alert('Hata: ' + error.message)
  }
}

const showSuccess = (msg) => {
  successMessage.value = msg
  setTimeout(() => { successMessage.value = null }, 3000)
}
</script>

<template>
  <div class="admin-dashboard-page">
    <div class="admin-header">
      <h2>🛡️ Yönetim Paneli (Admin CMS)</h2>
      <p>Platformdaki incelemeleri, oyun önerilerini ve pazar yeri ilanlarını denetle.</p>
    </div>

    <!-- Başarı Bildirimi -->
    <div v-if="successMessage" class="alert-box success">✨ {{ successMessage }}</div>
    <div v-if="errorMessage" class="alert-box error">❌ {{ errorMessage }}</div>

    <!-- Sekme Butonları -->
    <div class="admin-tabs">
      <button 
        @click="activeTab = 'reviews'" 
        :class="['tab-btn', { active: activeTab === 'reviews' }]"
      >
        💬 İnceleme Moderasyonu ({{ reviews.filter(r => !r.is_approved).length }} Bekleyen)
      </button>
      <button 
        @click="activeTab = 'games'" 
        :class="['tab-btn', { active: activeTab === 'games' }]"
      >
        🎲 Oyun Onayları ({{ pendingGames.length }})
      </button>
      <button 
        @click="activeTab = 'listings'" 
        :class="['tab-btn', { active: activeTab === 'listings' }]"
      >
        📦 Pazar Yeri İlanları ({{ listings.length }})
      </button>
    </div>

    <div v-if="isLoading" class="state-box">⏳ Yönetim verileri yükleniyor...</div>

    <div v-else class="admin-content-card">
      
      <!-- 1. SEKME: İNCELEME MODERASYONU -->
      <div v-if="activeTab === 'reviews'">
        <h3>Topluluk İncelemeleri ve Yorumlar</h3>
        <div v-if="reviews.length > 0" class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Oyun</th>
                <th>Kullanıcı</th>
                <th>Puan / Yorum</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rev in reviews" :key="rev.id">
                <td class="font-bold">{{ rev.games?.title || 'Bilinmeyen Oyun' }}</td>
                <td>{{ rev.profiles?.username || 'Kullanıcı' }}</td>
                <td>
                  <div class="review-cell-content">
                    <span class="stars">{'⭐'.repeat(rev.rating)}</span>
                    <p class="comment-preview">{{ rev.comment || 'Yorum yazılmamış.' }}</p>
                  </div>
                </td>
                <td>
                  <span :class="['status-badge', rev.is_approved ? 'approved' : 'pending']">
                    {{ rev.is_approved ? 'Onaylı Yayın' : 'Onay Bekliyor' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      @click="handleToggleReviewApproval(rev.id, rev.is_approved)" 
                      :class="['sm-btn', rev.is_approved ? 'reject' : 'approve']"
                    >
                      {{ rev.is_approved ? 'Gizle' : 'Onayla' }}
                    </button>
                    <button @click="handleDeleteReview(rev.id)" class="sm-btn delete">Sil</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="empty-text">Henüz yapılmış bir inceleme bulunmuyor.</p>
      </div>

      <!-- 2. SEKME: OYUN ONAYLARI -->
      <div v-if="activeTab === 'games'">
        <h3>Katalog Onayı Bekleyen Oyunlar</h3>
        <div v-if="pendingGames.length > 0" class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Oyun Adı</th>
                <th>Kategori</th>
                <th>Oyuncu / Süre</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="game in pendingGames" :key="game.id">
                <td class="font-bold">{{ game.title }}</td>
                <td>{{ game.categories?.name || 'Kategorisiz' }}</td>
                <td>👥 {{ game.min_players }}-{{ game.max_players }} | ⏱️ {{ game.play_time }} dk</td>
                <td>
                  <div class="action-buttons">
                    <button @click="handleApproveGame(game.id)" class="sm-btn approve">Onayla</button>
                    <button @click="handleDeleteGame(game.id)" class="sm-btn delete">Reddet / Sil</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="empty-text">Onay bekleyen yeni oyun önerisi bulunmuyor.</p>
      </div>

      <!-- 3. SEKME: PAZAR YERİ İLANLARI -->
      <div v-if="activeTab === 'listings'">
        <h3>Aktif İkinci El İlanları Yönetimi</h3>
        <div v-if="listings.length > 0" class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Oyun</th>
                <th>Satıcı</th>
                <th>Fiyat / Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in listings" :key="item.id">
                <td class="font-bold">{{ item.games?.title }}</td>
                <td>{{ item.profiles?.username }}</td>
                <td><span class="price-text">{{ item.price }} TL</span> ({{ item.condition }})</td>
                <td>
                  <button @click="handleDeleteListing(item.id)" class="sm-btn delete">İlanı Kaldır</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="empty-text">Aktif ilan bulunmuyor.</p>
      </div>

    </div>
  </div>
</template>

<style scoped>
.admin-dashboard-page {
  padding: 1.5rem 0 4rem 0;
  max-width: 1100px;
  margin: 0 auto;
}

.admin-header h2 {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.4rem 0;
}

.admin-header p {
  color: #64748b;
  margin: 0 0 2rem 0;
}

.alert-box {
  padding: 0.9rem 1.2rem;
  border-radius: 10px;
  font-weight: 700;
  margin-bottom: 1.5rem;
}
.alert-box.success { background: #d1fae5; color: #065f46; border: 1px solid #34d399; }
.alert-box.error { background: #fdf2f2; color: #b91c1c; border: 1px solid #f87171; }

.admin-tabs {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.tab-btn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #f1f5f9;
}

.tab-btn.active {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
}

.admin-content-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}

.admin-content-card h3 {
  margin: 0 0 1.25rem 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
}

.table-responsive {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.95rem;
}

.admin-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 700;
  padding: 0.85rem 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.admin-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  vertical-align: middle;
}

.font-bold { font-weight: 700; }

.review-cell-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-width: 350px;
}

.comment-preview {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
  font-style: italic;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
}

.status-badge.approved { background: #d1fae5; color: #065f46; }
.status-badge.pending { background: #fef3c7; color: #92400e; }

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.sm-btn {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.sm-btn.approve { background: #d1fae5; color: #065f46; }
.sm-btn.approve:hover { background: #a7f3d0; }

.sm-btn.reject { background: #fef3c7; color: #92400e; }
.sm-btn.reject:hover { background: #fde68a; }

.sm-btn.delete { background: #fee2e2; color: #991b1b; }
.sm-btn.delete:hover { background: #fecaca; }

.price-text {
  font-weight: 800;
  color: #42b983;
}

.empty-text {
  color: #64748b;
  text-align: center;
  padding: 2rem;
  margin: 0;
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
</style>