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
import { ref, onMounted, watch } from 'vue';
import { API_BASE_URL } from '@/config';
import { connectSocket} from '@/utils/socketClient';
import { SpeakerWaveIcon, UserGroupIcon } from '@heroicons/vue/24/solid'

const props = defineProps<{ selectedRoomId?: string; initialRoomId?: string }>();
const emit = defineEmits<{
  (e: 'select', room: any): void;
}>();

const rooms = ref<any[]>([]);
const loading = ref(false);
const selectedRoomId = ref(props.selectedRoomId || '');

const token = localStorage.getItem('token') || '';

// ✅ Map system names to readable titles and icons
const getDisplayName = (room: any) => {
  switch (room.systemName) {
    case 'system_all':
      return 'Announcements for Everyone'
    case 'system_clients':
      return 'Announcements for Homeowners'
    default:
      const me = localStorage.getItem('userId')
      const other = room.participants?.find((p: any) => p && p._id !== me)
      return other?.name || other?.email || 'Service Provider'
  }
}

const getSubLabel = (room: any) => {
  if (!room.systemName) return 'Chat with your service provider'
  if (room.systemName === 'system_all') return 'Broadcast Announcement'
  if (room.systemName === 'system_clients') return 'Homeowner Updates'
  return 'Announcement'
}

const getIcon = (room: any) => {
  if (room.systemName) return SpeakerWaveIcon
  return UserGroupIcon
}

const fetchRooms = async () => {
  try {
    loading.value = true;
    const res = await fetch(`${API_BASE_URL}/chats/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to load chat rooms');
    const allRooms = await res.json();

    // ✅ Filter: clients shouldn’t see provider-only system rooms
    rooms.value = allRooms.filter((room: any) => {
      if (!room.systemName) return true; // normal chats
      return room.systemName === "system_all" || room.systemName === "system_clients";
    });
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

/*const otherName = (room: any) => {
  if (room.systemName) return room.systemName.replace('system_', '').toUpperCase();
  const me = localStorage.getItem('userId');
  const other = room.participants?.find((p: any) => p && p._id !== me);
  return other?.name || other?.email || 'Participant';
};*/

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

  /*if (token) {
    connectSocket(token);
    const s = getSocket();
    s.emit("registerRole", { role: "client" });
    s.on('message:new', () => fetchRooms());
    s.on('announcement:new', () => fetchRooms());
  }*/
    if (token) {
      const s = connectSocket(token);

      s.on("connect", () => {
        const userId = localStorage.getItem("userId");
        s.emit("registerRole", { role: "client" }); // or "provider"
        s.emit("register", { userId, role: "client" });
        console.log("✅ Registered role:", "client");
      });

      s.on("chat:new", () => fetchRooms());
      s.on("message:new", () => fetchRooms());
      s.on("announcement:new", (announcement) => {
        console.log("📢 New announcement received:", announcement);
        fetchRooms();
      });

      // Optional — re-register after reconnect
      s.on("reconnect", () => {
        s.emit("registerRole", { role: "client" });
      });
    }

    });

watch(() => props.selectedRoomId, (v) => selectedRoomId.value = v || '');
</script>
