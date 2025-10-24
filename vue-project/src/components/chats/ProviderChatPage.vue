<template>
  <div class="min-h-[calc(100vh-120px)] md:h-[80vh] flex flex-col">
    <!-- Desktop layout -->
    <div class="hidden md:grid grid-cols-3 gap-4 h-full">
      <div class="col-span-1 bg-white rounded p-4 shadow">
        <ProviderChatList
          @select="selectRoom"
          :selectedRoomId="selectedRoom?._id"
          :initialRoomId="initialRoomId"
        />
      </div>

      <div class="col-span-2 bg-white rounded p-4 shadow">
        <ProviderChatWindow
          v-if="selectedRoom"
          :room="selectedRoom"
          @sent="onSent"
        />
        <div v-else class="text-center text-gray-500 p-6">
          Select a chat to start messaging
        </div>
      </div>
    </div>

    <!-- Mobile layout -->
    <div class="md:hidden h-full">
      <!-- Chat List (visible when no room selected) -->
      <div v-if="!selectedRoom" class="bg-white rounded p-4 shadow h-full">
        <ProviderChatList
          @select="selectRoom"
          :selectedRoomId="selectedRoom?._id"
          :initialRoomId="initialRoomId"
        />
      </div>

      <!-- Chat Window (visible when a room is selected) -->
      <div v-else class="bg-white rounded p-4 shadow h-full relative">
        <!-- Mobile Chat Header -->
        <div class="flex items-center gap-3 border-b border-gray-200 p-3 sticky top-0 bg-white z-10">
          <button @click="selectedRoom = null" class="text-purple-600 text-xl font-bold">←</button>
          <div class="font-semibold text-gray-800 truncate">
            {{ selectedRoom?.job?.title || 'Chat' }}
          </div>
        </div>

        <ProviderChatWindow
          :room="selectedRoom"
          @sent="onSent"
          class="pt-10"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ProviderChatList from './ProviderChatList.vue';
import ProviderChatWindow from './ProviderChatWindow.vue';
import { useRoute } from 'vue-router';
import { API_BASE_URL } from '@/config';

const route = useRoute();
//const selectedRoom = ref<any | null>(null);
const selectedRoom = ref<any | null>(
  JSON.parse(localStorage.getItem("selectedRoom") || "null")
);
const initialRoomId = route.query.roomId as string | undefined;

onMounted(async () => {
  if (initialRoomId) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/chats/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rooms = await res.json();
      const found = rooms.find((r: any) => r._id === initialRoomId);
      if (found) selectedRoom.value = found;
    } catch (err) {
      console.error('Error loading chat room:', err);
    }
  }
});

//const selectRoom = (room: any) => selectedRoom.value = room;
const selectRoom = (room: any) => {
  selectedRoom.value = room;
  localStorage.setItem("selectedRoom", JSON.stringify(room));
};

const onSent = () => {};
</script>

