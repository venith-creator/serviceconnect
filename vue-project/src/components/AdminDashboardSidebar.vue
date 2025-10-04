<template>
  <div
    :class="[
      'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col h-screen overflow-y-auto',
      'transform transition-transform duration-300 ease-in-out lg:transform-none',
      isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <!-- Logo + Close Button -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <img
            src="/Service_connect_logo.png"
            alt="ServiceConnect Logo"
            class="w-8 h-8"
          />
          <span class="font-bold text-xl text-gray-900">ServiceConnect</span>
        </div>

        <!-- Mobile close -->
        <button
          @click="closeMobileSidebar"
          class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close sidebar"
        >
          <X class="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4">
      <div class="space-y-2">
        <RouterLink
          v-for="item in menu"
          :key="item.name"
          :to="item.path"
          @click="closeMobileSidebar"
          :class="[
            'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors',
            isActive(item.path)
              ? 'bg-purple-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span class="font-medium">{{ item.label }}</span>
        </RouterLink>
      </div>
    </nav>

    <!-- User info + logout -->
    <div class="p-4 border-t border-gray-200">
      <div class="flex items-center space-x-3 mb-4">
        <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <User class="w-4 h-4 text-gray-600" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ email }}</p>
          <p class="text-xs text-gray-500">Administrator</p>
        </div>
      </div>

      <button
        @click="auth.logout"
        class="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        <LogOut class="w-4 h-4" />
        <span class="text-sm font-medium">Logout</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, watch } from 'vue'
import {
  Briefcase,
  DollarSign,
  MessageSquare,
  Settings,
  Star,
  Users,
  X,
  User,
  LogOut
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

// ✅ Sidebar open/close state (for mobile)
interface Props {
  isMobileSidebarOpen: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{ closeMobileSidebar: [] }>()


const closeMobileSidebar = () => {
  emit('closeMobileSidebar')
}
defineExpose({ isMobileSidebarOpen: props.isMobileSidebarOpen })

// ✅ Active route tracking
const route = useRoute()
const isActive = (href: string) => route.path === href

// ✅ Auth (to show admin email)
const auth = useAuthStore()
const email = ref('')
watch(
  () => auth.user,
  newUser => {
    if (newUser) email.value = newUser.email
  },
  { immediate: true }
)

// ✅ Menu links (your admin routes)
const menu = [
  { name: 'dashboard', label: 'Overview', path: '/dashboard/admin', icon: Briefcase },
  { name: 'manageProviders', label: 'Providers', path: '/dashboard/admin/ManageProviders', icon: Users },
  { name: 'manageHomeowners', label: 'Homeowners', path: '/dashboard/admin/ManageHomeowners', icon: Users },
  { name: 'manageJobs', label: 'Jobs', path: '/dashboard/admin/ManageJobs', icon: Briefcase },
  { name: 'managePayments', label: 'Payments', path: '/dashboard/admin/ManagePayments', icon: DollarSign },
  { name: 'manageReviews', label: 'Reviews', path: '/dashboard/admin/ManageReviewss', icon: Star },
  { name: 'manageChats', label: 'Chats', path: '/dashboard/admin/managechats', icon: MessageSquare },
  { name: 'announcements', label: 'Announcements', path: '/dashboard/admin/makeAnnouncement', icon: Settings }
]
</script>

<style scoped>
/* Optional subtle scroll smoothing for overflow-y sidebar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 8px;
}
</style>
