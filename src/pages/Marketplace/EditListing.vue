<!-- src/pages/Marketplace/EditListing.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://egzfowxhslazwyclxopt.supabase.co' 
const SUPABASE_KEY = 'sb_publishable_8QGwpT9OXn0g2KDwpb_YOA_SW0cYHug'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const route = useRoute()
const router = useRouter()

const listing = ref({
  price: '',
  condition: 'good',
  has_sleeves: false,
  description: ''
})

const gameTitle = ref('')
const isLoading = ref(true)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const errorMessage = ref(null)

onMounted(async () => {
  const listingId = route.params.id

  // 1. Oturum kontrolü
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    alert('Bu sayfaya erişmek için giriş yapmalısınız.')
    router.push('/login')
    return
  }

  // 2. İlan detaylarını çek
  const { data, error } = await supabase
    .from('listings')
    .select('*, games(title)')
    .eq('id', listingId)
    .single()

  if (error || !data) {
    errorMessage.value = 'İlan bulunamadı.'
    isLoading.value = false
    return
  }

  // 3. Yetki kontrolü: Sadece ilanın sahibi düzenleyebilir
  if (data.seller_id !== session.user.id) {
    alert('Bu ilanı düzenleme yetkiniz yok!')
    router.push(`/marketplace/${listingId}`)
    return
  }

  listing.value = {
    price: data.price,
    condition: data.condition,
    has_sleeves: data.has_sleeves,
    description: data.description || ''
  }
  gameTitle.value = data.games?.title || 'Masa Oyunu'
  isLoading.value = false
})

const handleUpdate = async () => {
  isSubmitting.value = true
  errorMessage.value = null

  // İlan güncellendiğinde onay mekanizması gereği statüyü tekrar 'pending' (onay bekliyor) yapabiliriz
  const { error } = await supabase
    .from('listings')
    .update({
      price: parseFloat(listing.value.price),
      condition: listing.value.condition,
      has_sleeves: listing.value.has_sleeves,
      description: listing.value.description,
      status: 'pending' // Metinli/İçerikli güncellemeler onay havuzuna geri döner
    })
    .eq('id', route.params.id)

  if (error) {
    errorMessage.value = 'İlan güncellenirken hata oluştu: ' + error.message
  } else {
    alert('İlanınız güncellendi ve onay sürecine gönderildi! ⏳')
    router.push('/marketplace')
  }
  isSubmitting.value = false
}

// İlanı silme fonksiyonu
const handleDeleteListing = async () => {
  if (!confirm('Bu ilanı kalıcı olarak silmek istediğinize emin misiniz?')) {
    return
  }

  isDeleting.value = true
  errorMessage.value = null

  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', route.params.id)

  if (error) {
    errorMessage.value = 'İlan silinirken bir hata oluştu: ' + error.message
    isDeleting.value = false
  } else {
    alert('İlanınız başarıyla silindi.')
    router.push('/marketplace')
  }
}
</script>

<template>
  <div class="edit-listing-page">
    <button class="back-btn" @click="router.back()">← İlan Detayına Dön</button>
    
    <div class="form-card">
      <h2>İlanı Düzenle</h2>
      <p class="subtitle"><strong>{{ gameTitle }}</strong> için ilan detaylarını güncelleyin.</p>

      <div v-if="isLoading" class="state">Yükleniyor...</div>
      <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>

      <form v-if="!isLoading" @submit.prevent="handleUpdate" class="cms-form">
        <div class="form-group">
          <label>Fiyat (TL)</label>
          <input v-model.number="listing.price" type="number" class="form-input" min="0" required />
        </div>

        <div class="form-group">
          <label>Kondisyon (Durum)</label>
          <select v-model="listing.condition" class="form-input" required>
            <option value="new_in_shrink">Sıfır (Jelatininde)</option>
            <option value="punched_unplayed">Oynanmamış</option>
            <option value="like_new">Yeni Gibi</option>
            <option value="good">İyi</option>
            <option value="fair">Yıpranmış</option>
          </select>
        </div>

        <div class="form-group checkbox-group">
          <label>
            <input v-model="listing.has_sleeves" type="checkbox" />
            Kart Koruması (Sleeves) Mevcut ✅
          </label>
        </div>

        <div class="form-group">
          <label>Satıcı Açıklaması</label>
          <textarea v-model="listing.description" rows="4" class="form-input" placeholder="Oyunun kondisyonu veya kutu içeriği hakkında ek bilgi verin..."></textarea>
        </div>

        <div class="action-buttons">
          <button type="submit" class="submit-btn" :disabled="isSubmitting || isDeleting">
            {{ isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet & Onaya Gönder 💾' }}
          </button>

          <button type="button" class="delete-btn" @click="handleDeleteListing" :disabled="isSubmitting || isDeleting">
            {{ isDeleting ? 'Siliniyor...' : 'İlanı Sil 🗑️' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.edit-listing-page { max-width: 600px; margin: 0 auto; padding: 2rem 0; }
.back-btn { background: none; border: none; color: #42b983; font-weight: 700; cursor: pointer; margin-bottom: 1.5rem; padding: 0; }
.back-btn:hover { text-decoration: underline; }
.form-card { background: #fff; padding: 2.5rem; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
.form-card h2 { margin: 0 0 0.5rem 0; color: #0f172a; font-weight: 800; }
.subtitle { color: #64748b; margin-bottom: 2rem; }
.cms-form { display: flex; flex-direction: column; gap: 1.25rem; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group label { font-weight: 700; color: #1e293b; font-size: 0.9rem; }
.form-input { padding: 0.8rem 1rem; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 1rem; outline: none; background: #fff; color: #0f172a; width: 100%; box-sizing: border-box; }
.form-input:focus { border-color: #42b983; box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.15); }
.checkbox-group label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 600; color: #334155; }
.checkbox-group input[type="checkbox"] { width: 18px; height: 18px; accent-color: #42b983; cursor: pointer; }
.action-buttons { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }
.submit-btn { background: #42b983; color: white; border: none; padding: 1rem; border-radius: 10px; font-weight: 700; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 15px rgba(66, 185, 131, 0.3); width: 100%; }
.submit-btn:hover { background: #369c6d; }
.delete-btn { background: #fee2e2; color: #dc2626; border: none; padding: 1rem; border-radius: 10px; font-weight: 700; font-size: 1rem; cursor: pointer; width: 100%; transition: background 0.2s; }
.delete-btn:hover { background: #fecaca; }
.error-banner { background: #fdf2f2; color: #e74c3c; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-weight: 600; }
.state { text-align: center; padding: 2rem; color: #64748b; }
</style>