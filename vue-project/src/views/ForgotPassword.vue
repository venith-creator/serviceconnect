<template>
  <div class="min-h-screen flex items-center justify-center bg-secondary/20 px-4">
    <div class="bg-white p-8 rounded-xl shadow w-full max-w-md space-y-5">
      <h2 class="text-xl font-bold text-center">Forgot Password</h2>
      <p class="text-gray-600 text-sm text-center">Enter your email to reset your password</p>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="Enter your email"
            class="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90 transition"
        >
          Send Reset Link
        </button>
      </form>

      <p v-if="message" class="text-green-600 text-center text-sm">{{ message }}</p>
      <p v-if="error" class="text-red-500 text-center text-sm">{{ error }}</p>

      <router-link to="/login" class="block text-center text-primary text-sm hover:underline">Back to Login</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { API_BASE_URL } from '@/config'

const email = ref('')
const message = ref('')
const error = ref('')

const handleSubmit = async () => {
  message.value = ''
  error.value = ''

  try {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    message.value = data.message
  } catch (err) {
    error.value = err.message
  }
}
</script>
