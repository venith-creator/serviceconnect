<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">Your Chats</h2>
      <button @click="refresh" class="text-sm px-3 py-1 rounded bg-gray-100">Refresh</button>
    </div>

    <div v-if="loading" class="text-center py-6">Loading...</div>

    <ul class="space-y-2 overflow-auto">
      <li
        v-for="room in rooms"
        :key="room._id"
        @click="openRoom(room)"
        :class="['p-3 rounded cursor-pointer','bg-white','hover:bg-gray-50',(selectedRoomId===room._id)?'ring-2 ring-purple-300':'']"
      >
        <div class="flex justify-between items-start">
          <div>
            <div class="text-sm font-medium">{{ otherName(room) }}</div>
            <div class="text-xs text-gray-500">{{ room.job?.title || (room.systemName || 'Chat') }}</div>
          </div>
          <div class="text-xs text-gray-400">{{ lastMessagePreview(room) }}</div>
        </div>
      </li>
    </ul>

    <div v-if="!rooms.length && !loading" class="text-center text-gray-500 mt-6">No chats yet.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { API_BASE_URL } from '@/config';
import { connectSocket, getSocket } from '@/utils/socketClient';

const props = defineProps<{ selectedRoomId?: string; initialRoomId?: string }>();
const emit = defineEmits<{
  (e: 'select', room: any): void;
}>();

const rooms = ref<any[]>([]);
const loading = ref(false);
const selectedRoomId = ref(props.selectedRoomId || '');

const token = localStorage.getItem('token') || '';

const fetchRooms = async () => {
  try {
    loading.value = true;
    const res = await fetch(`${API_BASE_URL}/chats/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to load chat rooms');
    rooms.value = await res.json();
  } catch (err) {
    console.error('fetchRooms:', err);
  } finally {
    loading.value = false;
  }
};

const openRoom = (room: any) => {
  selectedRoomId.value = room._id;
  emit('select', room);
};

const otherName = (room: any) => {
  if (room.systemName) return room.systemName.replace('system_', '').toUpperCase();
  const me = localStorage.getItem('userId');
  const other = room.participants?.find((p: any) => p && p._id !== me);
  return other?.name || other?.email || 'Participant';
};

const lastMessagePreview = (room: any) => {
  return room.lastMessage?.text?.slice(0, 40) || '';
};

const refresh = fetchRooms;

onMounted(async () => {
  await fetchRooms();

  // if initialRoomId was passed, try to auto-open it
  if (props.initialRoomId) {
    const match = rooms.value.find(r => r._id === props.initialRoomId);
    if (match) openRoom(match);
  }

  if (token) {
    connectSocket(token);
    const s = getSocket();
    s.on('message:new', () => fetchRooms());
    s.on('announcement:new', () => fetchRooms());
  }
});

watch(() => props.selectedRoomId, (v) => selectedRoomId.value = v || '');
</script>
