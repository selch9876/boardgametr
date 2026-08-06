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

  // 2. Profiles tablosundan kullanıcı detaylarını (username, reputation_score vb.) çek
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

  isLoading.value = false
})

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

const goToCollection = () => {
  router.push('/profile/collection')
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
        <div class="menu-card clickable" @click="goToCollection">
          <div class="icon">📦</div>
          <div class="menu-info">
            <h3>Koleksiyonum ve İstek Listem</h3>
            <p>Sahip olduğun oyunları yönet, istek listeni incele.</p>
          </div>
          <div class="arrow">→</div>
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