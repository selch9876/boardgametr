<!-- src/pages/Profile/Profile.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://egzfowxhslazwyclxopt.supabase.co' 
const SUPABASE_KEY = 'sb_publishable_8QGwpT9OXn0g2KDwpb_YOA_SW0cYHug'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const router = useRouter()

const user = ref(null)
const profile = ref(null)
const myListings = ref([])
const isLoading = ref(true)
const errorMessage = ref(null)

onMounted(async () => {
  // 1. Oturum açan kullanıcıyı kontrol et
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    alert('Profil sayfasına erişmek için giriş yapmalısınız.')
    router.push('/login')
    return
  }

  user.value = session.user

  // 2. Profiles tablosundan kullanıcı detaylarını çek
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (profileError) {
    errorMessage.value = 'Profil bilgileri yüklenemedi: ' + profileError.message
  } else {
    profile.value = profileData
  }

  // 3. Kullanıcının açtığı ilanları marketService mantığıyla çek
  const { data: listingsData, error: listingsError } = await supabase
    .from('listings')
    .select('*, games(title)')
    .eq('seller_id', session.user.id)
    .order('created_at', { ascending: false })

  if (!listingsError && listingsData) {
    myListings.value = listingsData
  }

  isLoading.value = false
})

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

const goToCollection = () => {
  router.push('/profile/collection')
}

// Yeni ilan verme sayfasına yönlendirme (Router yolunuza göre burayı /marketplace/new veya /marketplace/create yapabilirsiniz)
const goToNewListing = () => {
  router.push('/marketplace/create') 
}
</script>

<template>
  <div class="profile-page">
    <!-- Durum Alanları -->
    <div v-if="isLoading" class="state-box">⏳ Profil yükleniyor...</div>
    <div v-else-if="errorMessage" class="state-box error">❌ {{ errorMessage }}</div>

    <div v-else-if="user" class="profile-container">
      <!-- Profil Üst Kartı -->
      <div class="profile-header-card">
        <div class="avatar-placeholder">
          👤
        </div>
        <div class="user-meta">
          <h2>{{ profile?.username || 'Topluluk Üyesi' }}</h2>
          <p class="email">{{ user.email }}</p>
          <div class="score-badge">
            ⭐ Puan: {{ profile?.reputation_score || 100 }}/100
          </div>
        </div>
        <div class="header-actions">
          <button @click="handleLogout" class="logout-btn">Çıkış Yap 🚪</button>
        </div>
      </div>

      <!-- Hızlı Erişim Menü Kartları -->
      <div class="profile-menu-grid">
        <!-- Koleksiyon Kartı -->
        <div class="menu-card clickable" @click="goToCollection">
          <div class="icon">📦</div>
          <div class="menu-info">
            <h3>Koleksiyonum ve İstek Listem</h3>
            <p>Sahip olduğun oyunları yönet, istek listeni incele.</p>
          </div>
          <div class="arrow">→</div>
        </div>
      </div>

      <!-- İlanlarım Bölümü -->
      <div class="listings-section-card">
        <div class="section-header">
          <div class="section-title-wrapper">
            <div class="icon-small">🏷️</div>
            <div>
              <h3>İlanlarım</h3>
              <p>Pazar yerinde oluşturduğun aktif ve onay bekleyen ilanların.</p>
            </div>
          </div>
          <!-- Buton yönlendirmesi düzeltildi -->
          <button class="add-listing-btn" @click="goToNewListing">+ Yeni İlan</button>
        </div>

        <div v-if="myListings.length === 0" class="empty-listings">
          Henüz pazar yerinde oluşturulmuş bir ilanınız yok.
        </div>

        <div v-else class="listings-list">
          <div v-for="item in myListings" :key="item.id" class="listing-item">
            <div class="listing-details">
              <h4>{{ item.games?.title || 'Masa Oyunu' }}</h4>
              <p class="listing-meta-info">
                <strong>{{ item.price }} TL</strong> • 
                <span :class="item.status === 'approved' ? 'status-approved' : 'status-pending'">
                  {{ item.status === 'approved' ? 'Onaylandı ✅' : 'Onay Bekliyor ⏳' }}
                </span>
              </p>
            </div>
            <button class="edit-btn" @click="router.push(`/marketplace/edit/${item.id}`)">Düzenle / Yönet ⚙️</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 2rem 0;
  max-width: 900px;
  margin: 0 auto;
}

.profile-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-header-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 2.5rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  flex-wrap: wrap;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  flex-shrink: 0;
}

.user-meta {
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.user-meta h2 {
  margin: 0;
  font-size: 1.8rem;
  color: #0f172a;
  font-weight: 800;
}

.email {
  margin: 0;
  color: #64748b;
  font-size: 1rem;
}

.score-badge {
  align-self: flex-start;
  background: #fef3c7;
  color: #d97706;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  margin-top: 0.3rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.logout-btn {
  background: #fdf2f2;
  color: #e74c3c;
  border: 1px solid #f8d7da;
  padding: 0.75rem 1.2rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #fae1e1;
}

.profile-menu-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.menu-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.menu-card.clickable {
  cursor: pointer;
}

.menu-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.05);
  border-color: #cbd5e1;
}

.icon {
  font-size: 2rem;
  background: #f1f5f9;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-info {
  flex: 1;
}

.menu-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.15rem;
  color: #0f172a;
  font-weight: 700;
}

.menu-info p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

.arrow {
  font-size: 1.2rem;
  color: #94a3b8;
  font-weight: 700;
}

.listings-section-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-small {
  font-size: 1.5rem;
  background: #f1f5f9;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.section-title-wrapper h3 {
  margin: 0 0 0.15rem 0;
  font-size: 1.1rem;
  color: #0f172a;
  font-weight: 700;
}

.section-title-wrapper p {
  margin: 0;
  color: #64748b;
  font-size: 0.85rem;
}

.add-listing-btn {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.add-listing-btn:hover {
  background: #369c6d;
}

.listings-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.listing-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  gap: 1rem;
}

.listing-details h4 {
  margin: 0 0 0.25rem 0;
  color: #1e293b;
  font-weight: 700;
  font-size: 1rem;
}

.listing-meta-info {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

.status-approved {
  color: #10b981;
  font-weight: 700;
}

.status-pending {
  color: #f59e0b;
  font-weight: 700;
}

.edit-btn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  white-space: nowrap;
}

.edit-btn:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.empty-listings {
  text-align: center;
  color: #64748b;
  padding: 1.5rem 0;
  font-size: 0.95rem;
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

.error {
  color: #e74c3c;
  background: #fdf2f2;
  border-color: #f8d7da;
}
</style>