<template>
  <div class="min-h-screen bg-gray-50 flex overflow-x-hidden">
    <div
      v-if="isMobileSidebarOpen"
      class="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-30"
      @click="closeMobileSidebar"
    />
    <ClientDashboardSidebar
      :is-mobile-sidebar-open="isMobileSidebarOpen"
      @close-mobile-sidebar="closeMobileSidebar"
    />
    <div class="flex-1 flex flex-col lg:ml-64 min-h-screen  overflow-x-hidden">
      <header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-1.5">
            <button @click="toggleMobileSidebar" class="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              <Menu class="h-6 w-6 text-gray-600" />
            </button>
            <h1 class="text-2xl font-bold text-gray-900">{{ getCurrentPageTitle() }}</h1>
          </div>
          <div class="flex items-center space-x-1.5">
            <div class="flex items-center space-x-1.5">
            <button
              @click="showSwitch = true"
              class="px-3 py-1 border rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Switch Role
            </button>

            <Badge class="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded-full">
              Client
            </Badge>
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User class="w-4 h-4 text-gray-600" />
              </div>
              <span class="text-sm font-medium text-gray-900 hidden sm:block">{{ name }}</span>
            </div>
          </div>

          </div>
        </div>
      </header>

      <main class="flex-1 p-4 lg:p-6 overflow-y-auto">
        <slot />
      </main>
    </div>
    <DashboardSwitchModal :open="showSwitch" @close="showSwitch = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, User } from 'lucide-vue-next'
import ClientDashboardSidebar from './ClientDashboardSidebar.vue'
import Badge from './ui/Badge.vue'
import { useAuthStore } from '@/stores/auth'
import DashboardSwitchModal from './DashboardSwitchmodal.vue'
const showSwitch = ref(false)


const auth = useAuthStore()
const route = useRoute()
const name = ref('')

watch(() => auth.user, (u) => { if (u) name.value = u.name }, { immediate: true })

const isMobileSidebarOpen = ref(false)
const toggleMobileSidebar = () => { isMobileSidebarOpen.value = !isMobileSidebarOpen.value }
const closeMobileSidebar = () => { isMobileSidebarOpen.value = false }

watch(isMobileSidebarOpen, (open) => document.body.style.overflow = open ? 'hidden' : 'unset')

const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMobileSidebar() }
onMounted(() => document.addEventListener('keydown', handleEscape))
onUnmounted(() => document.removeEventListener('keydown', handleEscape))

const sidebarItems = [
  { label: 'Dashboard', href: '/dashboard/client' },
  { label: 'My Jobs', href: '/dashboard/client/Managesjobs' },
  { label: 'Chats', href: '/dashboard/client/Manageschat' },
  { label: 'Reviews', href: '/dashboard/client/ManagesReviews' },
  { label: 'Providers', href: '/dashboard/client/ViewProviders' },
  { label: 'Providers List', href: '/dashboard/client/ProvidersList' },
]
const getCurrentPageTitle = () => sidebarItems.find(i => i.href === route.path)?.label || 'client'
</script>
