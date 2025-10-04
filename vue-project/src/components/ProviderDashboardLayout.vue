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
    <ProviderDashboardSidebar
      :is-mobile-sidebar-open="isMobileSidebarOpen"
      @close-mobile-sidebar="closeMobileSidebar"
    />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col lg:ml-64 min-h-screen">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
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
            <Badge class="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded-full">
              Provider
            </Badge>
            <Bell class="w-6 h-6 text-gray-600" />
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User class="w-4 h-4 text-gray-600" />
              </div>
              <span class="text-sm font-medium text-gray-900 hidden sm:block">{{ name }}</span>
            </div>
          </div>
        </div>
      </header>

      <main class="flex-1 p-4 lg:p-6 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, Bell, User } from 'lucide-vue-next'
import ProviderDashboardSidebar from './ProviderDashboardSidebar.vue'
import Badge from './ui/Badge.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const name = ref('')

watch(() => auth.user, (newUser) => {
  if (newUser) name.value = newUser.name
}, { immediate: true })

const isMobileSidebarOpen = ref(false)
const toggleMobileSidebar = () => { isMobileSidebarOpen.value = !isMobileSidebarOpen.value }
const closeMobileSidebar = () => { isMobileSidebarOpen.value = false }

watch(isMobileSidebarOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : 'unset'
})

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeMobileSidebar()
}
onMounted(() => document.addEventListener('keydown', handleEscape))
onUnmounted(() => document.removeEventListener('keydown', handleEscape))

const sidebarItems = [
  { label: 'Dashboard', href: '/dashboard/provider' },
  { label: 'View Jobs', href: '/dashboard/provider/viewjobs' },
  { label: 'Proposals', href: '/dashboard/provider/ManagesProposals' },
  { label: 'Chats', href: '/dashboard/provider/Manageschats' },
  { label: 'Reviews', href: '/dashboard/provider/ManagesReview' }
]
const getCurrentPageTitle = () => sidebarItems.find(i => i.href === route.path)?.label || 'Dashboard'
</script>

