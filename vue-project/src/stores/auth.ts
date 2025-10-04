import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const isLoggedIn = ref(!!token.value)
  const router = useRouter()

  function login(newToken: string, newUser: any) {
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    token.value = newToken
    user.value = newUser
    isLoggedIn.value = true
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    token.value = ''
    user.value = null
    isLoggedIn.value = false

    // Navigate to home page
    router.push('/')
  }

  return {
    token,
    user,
    isLoggedIn,
    login,
    logout
  }
})
