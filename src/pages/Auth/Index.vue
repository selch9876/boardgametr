<!-- src/pages/Auth.vue (veya giriş sayfanın olduğu dosya) -->
<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <h2 class="auth-title">{{ isLogin ? 'Giriş Yap' : 'Kayıt Ol' }}</h2>
      
      <form @submit.prevent="handleAuth" class="auth-form">
        <!-- Sadece Kayıt Olurken Görünecek Kullanıcı Adı Alanı -->
        <div v-if="!isLogin" class="input-group">
          <label>Kullanıcı Adın</label>
          <input 
            type="text" 
            v-model="username" 
            placeholder="Kullanıcı adını gir" 
            required 
          />
        </div>

        <div class="input-group">
          <label>E-posta</label>
          <input 
            type="email" 
            v-model="email" 
            placeholder="ornek@mail.com" 
            required 
          />
        </div>
        
        <div class="input-group">
          <label>Şifre</label>
          <input 
            type="password" 
            v-model="password" 
            placeholder="••••••••" 
            required 
          />
        </div>

        <!-- Hata Mesajı Alanı -->
        <div v-if="errorMessage" class="error-box">
          {{ errorMessage }}
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? 'İşlem yapılıyor...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol') }}
        </button>
      </form>

      <div class="auth-toggle">
        <p>
          {{ isLogin ? "Hesabın yok mu?" : "Zaten hesabın var mı?" }}
          <a href="#" @click.prevent="toggleMode">
            {{ isLogin ? 'Kayıt Ol' : 'Giriş Yap' }}
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '../../services/supabase'

const router = useRouter()
const route = useRoute()

const isLogin = ref(true)
const isLoading = ref(false)
const email = ref('')
const password = ref('')
const username = ref('')
const errorMessage = ref('')

const toggleMode = () => {
  isLogin.value = !isLogin.value
  errorMessage.value = ''
  password.value = ''
  username.value = ''
}

const handleAuth = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    if (isLogin.value) {
      // Giriş Yapma İşlemi
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
      if (error) throw error
      
      // Başarılı girişte kullanıcının gelmek istediği sayfaya (veya varsayılan olarak ana sayfaya) yönlendir
      const redirectTo = route.query.redirect || '/'
      router.push(redirectTo)
    } else {
      // Kayıt Olma İşlemi (Kullanıcı adı meta data ile gönderiliyor)
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          data: {
            username: username.value,
          }
        }
      })
      if (error) throw error
      
      alert('Kayıt başarılı! Lütfen giriş yapın.')
      isLogin.value = true
      password.value = ''
      username.value = ''
    }
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.auth-card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.auth-title {
  text-align: center;
  color: #1a202c;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  font-weight: 700;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.input-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.input-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.input-group input:focus {
  outline: none;
  border-color: #e53e3e;
}

.submit-btn {
  background-color: #e53e3e;
  color: white;
  border: none;
  padding: 0.85rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background-color: #c53030;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-box {
  background-color: #fff5f5;
  color: #c53030;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
  border: 1px solid #fed7d7;
}

.auth-toggle {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.95rem;
  color: #718096;
}

.auth-toggle a {
  color: #e53e3e;
  font-weight: 600;
  text-decoration: none;
}

.auth-toggle a:hover {
  text-decoration: underline;
}
</style>