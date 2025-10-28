<template>
  <div
    :class="[
      'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col h-screen overflow-y-auto',
      'transform transition-transform duration-300 ease-in-out lg:transform-none',
      isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <div class="p-6 border-b border-gray-200 flex items-center justify-between">
      <!-- Left side: logo + name + trial -->
      <div class="flex items-start space-x-3">
        <!-- Logo -->
        <img
          src="/Service_connect_logo.png"
          alt="ServiceConnect Logo"
          class="w-8 h-8 mt-1"
        />

        <!-- Name + Trial stacked -->
        <div class="flex flex-col">
          <span class="font-bold text-xl text-gray-900">ServiceConnect</span>

          <div
            v-if="trialDaysRemaining > 0"
            class="flex items-center bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-1 rounded-lg text-sm mt-1 w-fit"
          >
            <svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ trialDaysRemaining }} days left in trial</span>
          </div>
        </div>
      </div>

      <!-- Close button (mobile) -->
      <button
        @click="closeMobileSidebar"
        class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Close sidebar"
      >
        <X class="h-5 w-5 text-gray-600" />
      </button>
    </div>

    <nav class="flex-1 p-4 space-y-2">
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
    </nav>

    <div class="p-4 border-t border-gray-200">
      <div class="flex items-center space-x-3 mb-4">
        <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <User class="w-4 h-4 text-gray-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900 truncate">{{ email }}</p>
          <p class="text-xs text-gray-500">Provider</p>
        </div>
      </div>
      <button
        @click="auth.logout"
        class="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
      >
        <LogOut class="w-4 h-4" />
        <span class="text-sm font-medium">Logout</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, watch, computed } from 'vue'
import { Briefcase, MessageSquare, Star, X, User, LogOut, FileText, CreditCard, Video } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

interface Props {
  isMobileSidebarOpen: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{ closeMobileSidebar: [] }>()
const closeMobileSidebar = () => emit('closeMobileSidebar')
defineExpose({ isMobileSidebarOpen: props.isMobileSidebarOpen })

const route = useRoute()
const isActive = (href: string) => route.path === href

const auth = useAuthStore()
const email = ref('')
watch(() => auth.user, (newUser) => { if (newUser) email.value = newUser.email }, { immediate: true })
const trialDaysRemaining = computed(() => {
  const trialEnd: Date = new Date()
  trialEnd.setDate(trialEnd.getDate() + 14)

  const today: Date = new Date()
  const diffTime: number = trialEnd.getTime() - today.getTime()
  const diffDays: number = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
})
const menu = [
  { name: 'dashboard', label: 'Dashboard', path: '/dashboard/provider', icon: Briefcase },
  { name: 'viewJobs', label: 'View Jobs', path: '/dashboard/provider/viewjobs', icon: FileText },
  { name: 'proposals', label: 'Proposals', path: '/dashboard/provider/ManagesProposals', icon: Briefcase },
  { name: 'chats', label: 'Chats', path: '/dashboard/provider/Manageschats', icon: MessageSquare },
  { name: 'reviews', label: 'Reviews', path: '/dashboard/provider/ManagesReview', icon: Star },
  { name: 'subscription', label: 'Subscription', path: '/dashboard/provider/subscription', icon: CreditCard },
  { name: 'Blog', label: 'Blog', path: '/dashboard/provider/ProviderPortfolio', icon: Video}
]
</script>
