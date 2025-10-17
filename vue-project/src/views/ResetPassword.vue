<template>
  <div class="min-h-screen flex items-center justify-center bg-secondary/20 px-4">
    <div class="bg-white p-8 rounded-xl shadow w-full max-w-md space-y-5">
      <h2 class="text-xl font-bold text-center">Reset Password</h2>

      <form @submit.prevent="handleReset" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">New Password</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="Enter new password"
            class="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Confirm Password</label>
          <input
            v-model="confirm"
            type="password"
            required
            placeholder="Confirm new password"
            class="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90 transition"
        >
          Reset Password
        </button>
      </form>

      <p v-if="message" class="text-green-600 text-center text-sm">{{ message }}</p>
      <p v-if="error" class="text-red-500 text-center text-sm">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_BASE_URL } from '@/config'

const route = useRoute()
const router = useRouter()
const token = route.params.token

const password = ref('')
const confirm = ref('')
const message = ref('')
const error = ref('')

const handleReset = async () => {
  if (password.value !== confirm.value) {
    error.value = 'Passwords do not match'
    return
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password.value }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    message.value = 'Password reset successful! Redirecting...'
    setTimeout(() => router.push('/login'), 2000)
  } catch (err) {
    error.value = err.message
  }
}
</script>
