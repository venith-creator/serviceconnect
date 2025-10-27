<template>
  <div
    :class="[
      'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col h-screen overflow-y-auto',
      'transform transition-transform duration-300 ease-in-out lg:transform-none',
      isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <div class="p-6 border-b border-gray-200 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <img src="/Service_connect_logo.png" alt="ServiceConnect Logo" class="w-8 h-8" />
        <span class="font-bold text-xl text-gray-900">ServiceConnect</span>
      </div>
      <button @click="closeMobileSidebar" class="lg:hidden p-2 rounded-lg hover:bg-gray-100">
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
            ? 'bg-green-600 text-white'
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
          <p class="text-xs text-gray-500">Client</p>
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
import { ref, watch } from 'vue'
import { Briefcase, MessageSquare, Star, Users, X, User, LogOut, Video, ToolCase } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

interface Props { isMobileSidebarOpen: boolean }
const props = defineProps<Props>()
const emit = defineEmits<{ closeMobileSidebar: [] }>()
const closeMobileSidebar = () => emit('closeMobileSidebar')
defineExpose({ isMobileSidebarOpen: props.isMobileSidebarOpen })

const route = useRoute()
const isActive = (href: string) => route.path === href

const auth = useAuthStore()
const email = ref('')
watch(() => auth.user, (u) => { if (u) email.value = u.email }, { immediate: true })

const menu = [
  { name: 'dashboard', label: 'Dashboard', path: '/dashboard/client', icon: Briefcase },
  { name: 'jobs', label: 'My Jobs', path: '/dashboard/client/Managesjobs', icon: ToolCase },
  { name: 'chats', label: 'Chats', path: '/dashboard/client/Manageschat', icon: MessageSquare },
  { name: 'reviews', label: 'Reviews', path: '/dashboard/client/ManagesReviews', icon: Star },
  { name: 'providers', label: 'Service Providers Blog', path: '/dashboard/client/ViewProviders', icon: Video },
  { name: 'providersList', label: 'Service Providers List', path: '/dashboard/client/ProvidersList', icon: Users },
]
</script>

