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
import { ref, onMounted,onUnmounted, watch } from 'vue'
import { API_BASE_URL } from '@/config'
import { connectSocket, getSocket } from '@/utils/socketClient'
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
      return other?.name || other?.email || 'Client'
  }
}

const getSubLabel = (room: any) => {
  if (!room.systemName) return 'Chat with a client'
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
 //   rooms.value = allRooms.filter((room: any) => {
  //    if (!room.systemName) return true
  //    return room.systemName === 'system_all' || room.systemName === 'system_providers'
   // })
   rooms.value = allRooms.filter((room: any) => {
      // Show all direct chats and provider announcements
      if (!room.systemName) return true

      // Allow system chats unless they are irrelevant (like client-only)
      return !room.systemName.includes('clients')
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
/*onMounted(() => {
  if (!rooms.value.length) loadRooms();
});
const loadRooms = async () => {
  if (loading.value) return;
  loading.value = true;
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/chats/rooms`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  rooms.value = await res.json();
  loading.value = false;
};

onMounted(async () => {
  await fetchRooms()

  const s = getSocket()
  if (s) {
    s.on('chat:new', handleNewChat)
  }
})*/

onUnmounted(() => {
  const s = getSocket()
  s?.off('chat:new', handleNewChat)
})

const handleNewChat = (room: any) => {
  if (!rooms.value.find(r => r._id === room._id)) {
    rooms.value.unshift(room);
  }
};


/*onMounted(async () => {
  await fetchRooms()

  if (props.initialRoomId) {
    const match = rooms.value.find(r => r._id === props.initialRoomId)
    if (match) openRoom(match)
  }

  if (token) {
    const s = connectSocket(token)
    s.on('connect', () => {
      const userId = localStorage.getItem("userId");
      s.emit('registerRole', { role: 'provider' });
      s.emit("register", { userId, role: "provider" });
      console.log('✅ Registered role:', 'provider')
    })
    s.on("chat:new", () => fetchRooms());
    s.on('message:new', () => fetchRooms())
    s.on('announcement:new', () => fetchRooms())
    s.on('reconnect', () => s.emit('registerRole', { role: 'provider' }))
  }
})*/

/*onMounted(async () => {
  if (loading.value) return;

  loading.value = true;
  await fetchRooms();
  loading.value = false;

  // Auto-select initial room if provided
  if (props.initialRoomId) {
    const match = rooms.value.find(r => r._id === props.initialRoomId);
    if (match) openRoom(match);
  }

  // ✅ Connect socket once
  if (token) {
    const s = connectSocket(token);

    s.on("connect", () => {
      const userId = localStorage.getItem("userId");
      s.emit("registerRole", { role: "provider" });
      s.emit("register", { userId, role: "provider" });
      console.log("✅ Registered provider socket:", s.id);
    });

    // Refresh rooms on relevant socket events
    ["chat:new", "message:new", "announcement:new"].forEach(evt => {
      s.off(evt);
      s.on(evt, () => fetchRooms());
    });

    // Auto re-register if socket reconnects
    s.off("reconnect");
    s.on("reconnect", () => {
      const userId = localStorage.getItem("userId");
      s.emit("registerRole", { role: "provider" });
      s.emit("register", { userId, role: "provider" });
    });
  }
});
*/
onMounted(async () => {
  await fetchRooms();

  const s = connectSocket(token);
  const userId = localStorage.getItem("userId");

  s.on("connect", () => {
    s.emit("registerRole", { role: "provider" });
    s.emit("register", { userId, role: "provider" });
    console.log("✅ Provider registered:", s.id);
  });

  // --- handle incoming chat rooms
  s.off("chat:new");
  s.on("chat:new", (room: any) => {
    console.log("🆕 New chat for provider:", room);
    const exists = rooms.value.find((r) => r._id === room._id);
    if (!exists) rooms.value.unshift(room);
  });

  // --- handle new messages (update preview)
  s.off("message:new");
  s.on("message:new", (msg: any) => {
    const room = rooms.value.find(
      (r) => String(r._id) === String(msg.chatRoom)
    );
    if (room) {
      room.lastMessage = msg;
      // move updated room to top
      rooms.value = [
        room,
        ...rooms.value.filter((r) => r._id !== room._id),
      ];
    } else {
      // Optional: fetchRooms() if missing
      fetchRooms();
    }
  });

  // --- handle announcements
  s.off("announcement:new");
  s.on("announcement:new", () => fetchRooms());

  // re-register on reconnect
  s.off("reconnect");
  s.on("reconnect", () => {
    s.emit("registerRole", { role: "provider" });
    s.emit("register", { userId, role: "provider" });
  });
});

watch(() => props.selectedRoomId, v => (selectedRoomId.value = v || ''))
</script>
