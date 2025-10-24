<template>
  <div class="min-h-screen bg-gray-50 flex overflow-x-hidden">
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
    <div class="flex-1 flex flex-col lg:ml-64 min-h-screen overflow-x-hidden">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              @click="toggleMobileSidebar"
              class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu class="h-6 w-6 text-gray-600"/>
            </button>
            <h1 class="text-2xl font-bold text-gray-900">{{ getCurrentPageTitle() }}</h1>
          </div>

          <div class="flex items-center space-x-4">
            <div v-if="trialDaysRemaining > 0"
                 class="flex items-center bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-1 rounded-lg text-sm">
              <svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"/>
              </svg>
              <span>{{ trialDaysRemaining }} days left in trial</span>
            </div>
            <button
              @click="showSwitch = true"
              class="px-3 py-1 border rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Switch Role
            </button>
            <Badge class="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded-full">
              Provider
            </Badge>
            <Bell class="w-6 h-6 text-gray-600"/>
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User class="w-4 h-4 text-gray-600"/>
              </div>
              <span class="text-sm font-medium text-gray-900 hidden sm:block">{{ name }}</span>
            </div>
          </div>
        </div>
      </header>

      <main class="flex-1 p-4 lg:p-6 overflow-y-auto">
        <slot/>
      </main>
    </div>
    <DashboardSwitchModal :open="showSwitch" @close="showSwitch = false"/>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onUnmounted, watch, computed} from 'vue'
import {useRoute} from 'vue-router'
import {Menu, Bell, User} from 'lucide-vue-next'
import ProviderDashboardSidebar from './ProviderDashboardSidebar.vue'
import Badge from './ui/Badge.vue'
import {useAuthStore} from '@/stores/auth'
import DashboardSwitchModal from './DashboardSwitchmodal.vue'
import { connectSocket } from '@/utils/socketClient'

const showSwitch = ref(false)
const trialDaysRemaining = computed(() => {
  const trialEnd: Date = new Date()
  trialEnd.setDate(trialEnd.getDate() + 14)

  const today: Date = new Date()
  const diffTime: number = trialEnd.getTime() - today.getTime()
  const diffDays: number = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
})

const auth = useAuthStore()
//const route = useRoute()
const name = ref('')

watch(() => auth.user, (newUser) => {
  if (newUser) name.value = newUser.name
}, {immediate: true})

const isMobileSidebarOpen = ref(false)
const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}
const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false
}

watch(isMobileSidebarOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : 'unset'
})

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeMobileSidebar()
}
onMounted(() => document.addEventListener('keydown', handleEscape))
onUnmounted(() => document.removeEventListener('keydown', handleEscape))
onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) connectSocket(token)
})
const getCurrentPageTitle = () => {
  const route = useRoute()
  const item = sidebarItems.find(item => item.href === route.path)
  return item ? item.label : 'Dashboard'
}

const sidebarItems = [
  {label: 'Dashboard', href: '/dashboard/provider'},
  {label: 'View Jobs', href: '/dashboard/provider/viewjobs'},
  {label: 'Proposals', href: '/dashboard/provider/ManagesProposals'},
  {label: 'Chats', href: '/dashboard/provider/Manageschats'},
  {label: 'Reviews', href: '/dashboard/provider/ManagesReview'},
  {label: 'Portfolio', href: '/dashboard/provider/ProviderPortfolio'},
]
</script>

