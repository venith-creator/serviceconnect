<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Mobile Sidebar Backdrop -->
    <div
      v-if="isMobileSidebarOpen"
      class="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-30"
      @click="closeMobileSidebar"
      aria-hidden="true"
    />

    <!-- Sidebar -->
    <AdminDashboardSidebar
      :is-mobile-sidebar-open="isMobileSidebarOpen"
      @close-mobile-sidebar="closeMobileSidebar"
    />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col lg:ml-64 min-h-screen">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <!-- Mobile Hamburger -->
            <button
              @click="toggleMobileSidebar"
              class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu class="h-6 w-6 text-gray-600" />
            </button>
            <h1 class="text-2xl font-bold text-gray-900">{{ getCurrentPageTitle() }}</h1>
          </div>

          <div class="flex items-center space-x-4">
            <Badge class="bg-purple-100 text-white-800 px-2 py-1 text-xs font-medium rounded-full">
              Admin
            </Badge>
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User class="w-4 h-4 text-gray-600" />
              </div>
              <span class="text-sm font-medium text-gray-900 hidden sm:block">{{ name }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Main content -->
      <main class="flex-1 p-4 lg:p-6 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, User } from 'lucide-vue-next'
import AdminDashboardSidebar from './AdminDashboardSidebar.vue'
import Badge from './ui/Badge.vue'
import { useAuthStore } from '@/stores/auth'

// Store and route setup
const auth = useAuthStore()
const route = useRoute()
const name = ref('')

// Watch for user name updates
watch(
  () => auth.user,
  (newUser) => {
    if (newUser) name.value = newUser.name
  },
  { immediate: true }
)

// Sidebar behavior
const isMobileSidebarOpen = ref(false)

const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}
const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false
}

// Lock scroll when sidebar open
watch(isMobileSidebarOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : 'unset'
})

// Handle ESC key to close sidebar
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeMobileSidebar()
}

onMounted(() => document.addEventListener('keydown', handleEscape))
onUnmounted(() => document.removeEventListener('keydown', handleEscape))

// Dynamic title based on route
const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard/admin' },
  { id: 'providers', label: 'Providers', href: '/dashboard/admin/ManageProviders' },
  { id: 'homeowners', label: 'Homeowners', href: '/dashboard/admin/ManageHomeowners' },
  { id: 'jobs', label: 'Jobs', href: '/dashboard/admin/ManageJobs' },
  { id: 'payments', label: 'Payments', href: '/dashboard/admin/ManagePayments' },
  { id: 'reviews', label: 'Reviews', href: '/dashboard/admin/ManageReviews' },
  { id: 'chats', label: 'Chats', href: '/dashboard/admin/managechats' },
  { id: 'announcements', label: 'Announcements', href: '/dashboard/admin/makeAnnouncement' },
  { id: 'contacts', label: 'Contact Messages', href: '/dashboard/admin/ManageContacts' },
]

const getCurrentPageTitle = () => {
  const current = sidebarItems.find((item) => item.href === route.path)
  return current?.label || 'admin'
}
</script>
