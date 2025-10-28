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

          <div class="flex items-center space-x-1.5">
            <div class="flex items-center space-x-1.5 relative">
              <ProviderSettingsDropdown />
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
import {ref, onMounted, onUnmounted, watch, } from 'vue'
import {useRoute} from 'vue-router'
import {Menu,} from 'lucide-vue-next'
import ProviderDashboardSidebar from './ProviderDashboardSidebar.vue'
import Badge from './ui/Badge.vue'
import {useAuthStore} from '@/stores/auth'
import DashboardSwitchModal from './DashboardSwitchmodal.vue'
import { connectSocket } from '@/utils/socketClient'
import ProviderSettingsDropdown from '../components/provider/ProviderSettingsDropdown.vue'


const showSwitch = ref(false)

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
  return item ? item.label : 'provider'
}

const sidebarItems = [
  {label: 'Dashboard', href: '/dashboard/provider'},
  {label: 'View Jobs', href: '/dashboard/provider/viewjobs'},
  {label: 'Proposals', href: '/dashboard/provider/ManagesProposals'},
  {label: 'Chats', href: '/dashboard/provider/Manageschats'},
  {label: 'Reviews', href: '/dashboard/provider/ManagesReview'},
  {label: 'Blog', href: '/dashboard/provider/ProviderPortfolio'},
]
</script>

