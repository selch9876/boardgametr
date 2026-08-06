<!-- src/App.vue -->
<template>
  <div id="app">
    <!-- Üst Menü / Navbar -->
    <header class="main-header">
      
      <!-- LOGO -->
      <router-link to="/" class="modern-brand-logo">
        <div class="logo-icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="isometric-cube">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="#e53e3e" stroke="#c53030" stroke-width="1.5" stroke-linejoin="round"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" fill="none" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"></line>
          </svg>
        </div>
        
        <div class="logo-text-wrapper">
          <span class="text-board">BOARD</span>
          <span class="text-game">GAME</span>
          <span class="text-turkiye">TÜRKİYE</span>
        </div>
      </router-link>

      <!-- NAVİGASYON VE DİNAMİK AUTH / ROZET ALANI -->
      <nav class="nav-links">
        <router-link to="/">Ana Sayfa</router-link>
        <router-link to="/marketplace">Pazar Yeri</router-link>
        <router-link to="/games">Oyun Kataloğu</router-link>

        <!-- Eğer kullanıcı giriş yaptıysa Profil, Admin (yetkiye göre), Çıkış Yap ve rozet görünsün -->
        <template v-if="user">
          <router-link to="/profile" class="profile-nav-link">Profilim 👤</router-link>
          
          <!-- Sadece Yetkili / Admin Kullanıcılara Özel Admin Paneli Linki -->
          <router-link 
            v-if="isAdmin || userRole === 'Site Sahibi' || userRole === 'Yönetici'" 
            to="/admin" 
            class="admin-nav-link"
          >
            Admin 🛡️
          </router-link>

          <button @click="handleSignOut" class="auth-link-btn logout-btn">Çıkış Yap</button>
          <span :class="['user-badge', getBadgeClass(userRole)]">{{ userRole }}</span>
        </template>

        <!-- Giriş yapmadıysa, tıklandığı sayfayı redirect olarak taşıyan Giriş Yap butonu -->
        <template v-else>
          <router-link 
            :to="{ path: '/auth', query: { redirect: route.fullPath } }" 
            class="auth-link-btn"
          >
            Giriş Yap
          </router-link>
        </template>
      </nav>
    </header>

    <!-- Sayfaların Değiştiği Alan -->
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from './services/supabase'

const router = useRouter()
const route = useRoute()

const user = ref(null)
const userRole = ref('Yeni Üye') // Varsayılan
const isAdmin = ref(false)

// Kullanıcı rolünü ve admin durumunu Supabase profiles tablosundan çekme fonksiyonu
const fetchUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role, is_admin')
    .eq('id', userId)
    .single()
    
  if (data) {
    if (data.role) userRole.value = data.role
    isAdmin.value = !!data.is_admin
  }
}

// Sayfa yüklendiğinde oturum ve profil durumunu tek elden yönetelim
onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  user.value = session?.user || null
  
  if (user.value) {
    await fetchUserProfile(user.value.id)
  }

  // Oturum değişikliklerini dinle
  supabase.auth.onAuthStateChange(async (event, session) => {
    user.value = session?.user || null
    if (user.value) {
      await fetchUserProfile(user.value.id)
    } else {
      userRole.value = 'Yeni Üye'
      isAdmin.value = false
    }
  })
})

// Unvana göre CSS sınıfı döndüren yardımcı fonksiyon
const getBadgeClass = (role) => {
  switch (role) {
    case 'Site Sahibi': return 'badge-site-sahibi'
    case 'Yönetici': return 'badge-yonetici'
    case 'Kıdemli Tüccar': return 'badge-kidemli-tuccar'
    case 'Kıdemli Üye': return 'badge-kidemli-uye'
    default: return 'badge-yeni-uye'
  }
}

// Çıkış Yap fonksiyonu
const handleSignOut = async () => {
  await supabase.auth.signOut()
  user.value = null
  userRole.value = 'Yeni Üye'
  isAdmin.value = false
  router.push('/')
}
</script>

<style>
/* Genel Sıfırlama ve Fontlar */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  background-color: #f4f6f8;
  color: #2c3e50;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.nav-links .auth-link-btn {
  background-color: #e53e3e;
  color: white !important;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  text-decoration: none;
  display: inline-block;
}

.nav-links .auth-link-btn:hover,
.nav-links .auth-link-btn.router-link-active {
  background-color: #c53030;
  color: white !important;
}

.logout-btn {
  background-color: #4a5568 !important;
}

.logout-btn:hover {
  background-color: #2d3748 !important;
}

.profile-nav-link,
.admin-nav-link {
  font-weight: 600;
  color: #334155 !important;
}

.admin-nav-link {
  color: #b91c1c !important;
}

.profile-nav-link:hover,
.profile-nav-link.router-link-active {
  color: #42b983 !important;
}

.admin-nav-link:hover,
.admin-nav-link.router-link-active {
  color: #991b1b !important;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid #eaeaea;
  margin-bottom: 2rem;
}

/* --- YENİ LOGO STİLLERİ --- */
.modern-brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  padding: 5px 0;
}

.logo-icon-wrapper {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.isometric-cube {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 6px rgba(229, 62, 62, 0.3));
}

.modern-brand-logo:hover .logo-icon-wrapper {
  transform: translateY(-2px) scale(1.05);
}

.logo-text-wrapper {
  display: flex;
  align-items: baseline;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  letter-spacing: -0.3px;
}

.text-board {
  font-size: 1.25rem;
  font-weight: 900;
  color: #1a202c;
}

.text-game {
  font-size: 1.25rem;
  font-weight: 400;
  color: #1a202c;
}

.text-turkiye {
  font-size: 1.25rem;
  font-weight: 900;
  color: #e53e3e;
  margin-left: 4px;
}
/* --- YENİ LOGO STİLLERİ BİTİŞ --- */

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-links a {
  text-decoration: none;
  color: #7f8c8d;
  font-weight: 600;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #42b983;
}

.user-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background-color: currentColor;
  border-radius: 50%;
  display: inline-block;
}

.badge-site-sahibi { background: linear-gradient(135deg, #fff1f2, #fee2e2); color: #991b1b; border: 1px solid #fecaca; }
.badge-yonetici { background: linear-gradient(135deg, #fffbeb, #fef3c7); color: #92400e; border: 1px solid #fde68a; }
.badge-kidemli-tuccar { background: linear-gradient(135deg, #eef2ff, #e0e7ff); color: #3730a3; border: 1px solid #c7d2fe; }
.badge-kidemli-uye { background: linear-gradient(135deg, #ecfdf5, #d1fae5); color: #065f46; border: 1px solid #a7f3d0; }
.badge-yeni-uye { background: linear-gradient(135deg, #f9fafb, #f3f4f6); color: #4b5563; border: 1px solid #e5e7eb; }
</style>