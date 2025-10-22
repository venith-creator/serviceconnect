<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">Provider Chats</h2>
      <button @click="refresh" class="text-sm px-3 py-1 rounded bg-gray-100">Refresh</button>
    </div>

    <div v-if="loading" class="text-center py-6">Loading...</div>

    <ul class="space-y-2 overflow-auto">
      <li
        v-for="room in rooms"
        :key="room._id"
        @click="openRoom(room)"
        :class="[
          'p-3 rounded cursor-pointer bg-white hover:bg-gray-50',
          selectedRoomId === room._id ? 'ring-2 ring-purple-300' : ''
        ]"
      >
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-2">
            <component :is="getIcon(room)" class="w-4 h-4 text-purple-500" v-if="getIcon(room)" />
            <div>
              <div class="text-sm font-medium">{{ getDisplayName(room) }}</div>
              <div class="text-xs text-gray-500">
                {{ room.job?.title || getSubLabel(room) }}
              </div>
            </div>
          </div>
          <div class="text-xs text-gray-400">{{ lastMessagePreview(room) }}</div>
        </div>
      </li>
    </ul>

    <div v-if="!rooms.length && !loading" class="text-center text-gray-500 mt-6">No chats yet.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { API_BASE_URL } from '@/config'
import { connectSocket } from '@/utils/socketClient'
import { SpeakerWaveIcon, UserGroupIcon } from '@heroicons/vue/24/solid'

const props = defineProps<{ selectedRoomId?: string; initialRoomId?: string }>()
const emit = defineEmits<{ (e: 'select', room: any): void }>()

const rooms = ref<any[]>([])
const loading = ref(false)
const selectedRoomId = ref(props.selectedRoomId || '')
const token = localStorage.getItem('token') || ''

const getDisplayName = (room: any) => {
  switch (room.systemName) {
    case 'system_all':
      return 'Announcements for Everyone'
    case 'system_providers':
      return 'Announcements for Service Providers'
    default:
      const me = localStorage.getItem('userId')
      const other = room.participants?.find((p: any) => p && p._id !== me)
      return other?.name || other?.email || 'Chat Participant'
  }
}

const getSubLabel = (room: any) => {
  if (!room.systemName) return 'Direct Chat'
  if (room.systemName === 'system_all') return 'Broadcast Announcement'
  if (room.systemName === 'system_providers') return 'Provider Updates'
  return 'Announcement'
}

const getIcon = (room: any) => {
  if (room.systemName) return SpeakerWaveIcon
  return UserGroupIcon
}

const fetchRooms = async () => {
  try {
    loading.value = true
    const res = await fetch(`${API_BASE_URL}/chats/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Failed to load chat rooms')
    const allRooms = await res.json()

    // ✅ Providers see global + provider-specific rooms
    rooms.value = allRooms.filter((room: any) => {
      if (!room.systemName) return true
      return room.systemName === 'system_all' || room.systemName === 'system_providers'
    })
  } catch (err) {
    console.error('fetchRooms:', err)
  } finally {
    loading.value = false
  }
}

const openRoom = (room: any) => {
  selectedRoomId.value = room._id
  emit('select', room)
}

const lastMessagePreview = (room: any) =>
  room.lastMessage?.text?.slice(0, 40) || ''

const refresh = fetchRooms

onMounted(async () => {
  await fetchRooms()

  if (props.initialRoomId) {
    const match = rooms.value.find(r => r._id === props.initialRoomId)
    if (match) openRoom(match)
  }

  if (token) {
    const s = connectSocket(token)
    s.on('connect', () => {
      s.emit('registerRole', { role: 'provider' })
      console.log('✅ Registered role:', 'provider')
    })
    s.on('message:new', () => fetchRooms())
    s.on('announcement:new', () => fetchRooms())
    s.on('reconnect', () => s.emit('registerRole', { role: 'provider' }))
  }
})

watch(() => props.selectedRoomId, v => (selectedRoomId.value = v || ''))
</script>
