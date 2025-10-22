<template>
  <AdminDashboardLayout>
    <div class="p-6 bg-gray-50 min-h-screen">
      <h1 class="text-3xl font-bold mb-8 text-purple-700 text-center">
        Manage Contact Messages
      </h1>

      <!-- Loading -->
      <div v-if="loading" class="text-center text-gray-500 text-lg animate-pulse">
        Loading messages...
      </div>

      <!-- Empty -->
      <div
        v-else-if="contacts.length === 0"
        class="text-center text-gray-400 mt-16 text-lg"
      >
        No contact messages yet 😔
      </div>

      <!-- Contact Cards -->
      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="contact in paginatedContacts"
          :key="contact._id"
          class="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-lg text-gray-800">
              {{ contact.name }}
            </h3>
            <span class="text-xs text-gray-400">
              {{ new Date(contact.createdAt).toLocaleString() }}
            </span>
          </div>

          <div class="space-y-1 mb-3">
            <p class="text-sm text-gray-600">
              <strong>Email:</strong> {{ contact.email }}
            </p>
            <p class="text-sm text-gray-600">
              <strong>Whatsapp:</strong> {{ contact.whatsapp || 'N/A' }}
            </p>
          </div>

          <div class="bg-gray-50 rounded-md p-3 text-gray-700 text-sm">
            {{ contact.message }}
          </div>

          <div class="mt-4 text-right">
            <button
              class="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
              @click="openReplyModal(contact)"
            >
              {{ contact.reply ? 'Replied' : 'Reply' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center items-center mt-10 gap-2">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium disabled:opacity-40"
        >
          Previous
        </button>

        <button
          v-for="page in visiblePages"
          :key="page"
          @click="goToPage(page)"
          :class="[
            'px-3 py-1 rounded-lg text-sm font-medium transition',
            page === currentPage
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          ]"
        >
          {{ page }}
        </button>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium disabled:opacity-40"
        >
          Next
        </button>
      </div>

      <!-- Reply Modal -->
      <div
        v-if="showReplyModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white w-full max-w-md p-6 rounded-xl shadow-xl">
          <h2 class="text-xl font-semibold mb-3 text-purple-700">
            Reply to {{ selectedContact?.name }}
          </h2>
          <textarea
            v-model="replyMessage"
            rows="6"
            placeholder="Type your reply..."
            class="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          ></textarea>
          <div class="flex justify-end space-x-2">
            <button
              class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              @click="showReplyModal = false"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              :disabled="sending"
              @click="sendReply"
            >
              {{ sending ? 'Sending...' : 'Send Reply' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminDashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminDashboardLayout from '@/components/AdminDashboardLayout.vue'
import { API_BASE_URL } from '@/config'

interface Contact {
  _id: string
  name: string
  email: string
  whatsapp?: string
  message: string
  reply?: string
  createdAt: string
  repliedAt?: string
}

const contacts = ref<Contact[]>([])
const loading = ref(true)
const showReplyModal = ref(false)
const selectedContact = ref<Contact | null>(null)
const replyMessage = ref('')
const sending = ref(false)

// Pagination
const currentPage = ref(1)
const itemsPerPage = 6

const totalPages = computed(() => Math.ceil(contacts.value.length / itemsPerPage))

const paginatedContacts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return contacts.value.slice(start, start + itemsPerPage)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 3) return [1, 2, 3, 4, 5]
  if (current >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total]
  return [current - 2, current - 1, current, current + 1, current + 2]
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(`${API_BASE_URL}/contact`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    contacts.value = await res.json()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

function openReplyModal(contact: Contact) {
  selectedContact.value = contact
  replyMessage.value = contact.reply || ''
  showReplyModal.value = true
}

async function sendReply() {
  if (!selectedContact.value || !replyMessage.value.trim()) return
  sending.value = true
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(`${API_BASE_URL}/contact/reply/${selectedContact.value._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ replyMessage: replyMessage.value }),
    })
    const data = await res.json()
    if (res.ok) {
      alert('✅ Reply sent successfully!')
      selectedContact.value.reply = replyMessage.value
      showReplyModal.value = false
    } else {
      alert(data.message || 'Failed to send reply')
    }
  } catch (error) {
    console.error(error)
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
button {
  font-family: 'Inter', sans-serif;
}
</style>
