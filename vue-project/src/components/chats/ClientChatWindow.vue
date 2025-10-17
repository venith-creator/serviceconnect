<template>
  <div class="flex flex-col h-full bg-gray-100">
    <!-- Header -->
    <div class="border-b p-3 bg-white shadow-sm flex items-center justify-between">
      <div>
        <div class="font-semibold text-gray-800">{{ roomTitle }}</div>
        <div class="text-xs text-gray-500">
          {{ props.room?.job?.title || props.room?.systemName || '' }}
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div ref="scrollEl" class="flex-1 overflow-auto p-4 flex flex-col gap-3">
      <div v-if="loadingMessages" class="text-center text-sm text-gray-500">
        Loading messages...
      </div>

      <div v-if="!messages.length && !loadingMessages" class="text-center text-gray-500 mt-6">
        No messages yet. Start the conversation!
      </div>

      <div
      v-for="m in messages"
      :key="m._id"
      class="flex w-full"
      :class="m.type === 'announcement' ? 'justify-center' : (isMe(m) ? 'justify-end' : 'justify-start')"
    >
      <!-- 📢 Announcement -->
      <div
        v-if="m.type === 'announcement'"
        class="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-xl px-4 py-3 text-sm shadow-sm flex items-center gap-2 max-w-[80%]"
      >
        <i class="pi pi-megaphone text-yellow-600"></i>
        <span class="whitespace-pre-wrap">{{ m.text }}</span>
      </div>

      <!-- 💬 Normal Message -->
      <div
        v-else
        :class="bubbleClasses(m)"
        class="relative flex flex-col px-4 py-2 text-sm shadow-sm break-words"
        role="article"
        aria-label="chat-message"
      >
        <div class="whitespace-pre-wrap">{{ m.text }}</div>

        <div
          :class="timestampClasses(m)"
          class="text-[11px] mt-1"
        >
          {{ formatDate(m.createdAt) }}
        </div>

        <div
          v-if="isMe(m)"
          class="absolute right-0 bottom-0 translate-x-1 translate-y-[2px] w-0 h-0 border-t-[8px] border-t-transparent border-l-[8px] border-l-purple-600 border-b-[8px] border-b-transparent"
        ></div>

        <div
          v-else
          class="absolute left-0 bottom-0 -translate-x-1 translate-y-[2px] w-0 h-0 border-t-[8px] border-t-transparent border-r-[8px] border-r-white border-b-[8px] border-b-transparent"
        ></div>
      </div>
    </div>

    </div>

    <!-- Input -->
    <form @submit.prevent="sendMessage" class="p-3 bg-white border-t flex gap-2 items-center">
      <textarea
        v-model="text"
        placeholder="Write a message..."
        rows="1"
        @input="autoResize"
        class="flex-1 border rounded-2xl px-4 py-2 resize-none overflow-hidden focus:ring-2 focus:ring-purple-500 focus:outline-none"
      ></textarea>
      <button
        class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition"
        type="submit"
      >
        Send
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed, onUnmounted } from 'vue';
import { API_BASE_URL } from '@/config';
import { connectSocket, getSocket } from '@/utils/socketClient';

const props = defineProps<{ room: any }>();
const emit = defineEmits<{ (e: 'sent'): void }>();

const roomTitle = computed(() => {
  if (!props.room) return '';
  const { job, systemName, participants } = props.room;
  const me = localStorage.getItem('userId') || '';
  if (systemName) return systemName.replace('system_', '').toUpperCase();
  const other = participants?.find((p: any) => p._id !== me);
  return other?.name || job?.title || 'Chat';
});

const messages = ref<any[]>([]);
const loadingMessages = ref(false);
const text = ref('');
const scrollEl = ref<HTMLElement | null>(null);
const myId = String(localStorage.getItem('userId') || '');
const token = localStorage.getItem('token') || '';

/** Fetch messages */
const fetchMessages = async (roomId: string) => {
  if (!roomId) { messages.value = []; return; }
  loadingMessages.value = true;
  try {
    const res = await fetch(`${API_BASE_URL}/chats/room/${roomId}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch messages');
    const data = await res.json();
    messages.value = data || [];
    await nextTick();
    scrollToBottom();
  } catch (err) {
    console.error('fetchMessages:', err);
  } finally {
    loadingMessages.value = false;
  }
};

/** Send message: IMPORTANT: do NOT push locally; rely on socket event to append canonical saved message */
const sendMessage = async () => {
  if (!props.room || !props.room._id) return alert('Select a chat');
  if (!text.value.trim()) return;
  try {
    const body = { text: text.value.trim() };
    await fetch(`${API_BASE_URL}/chats/room/${props.room._id}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    text.value = '';
    emit('sent');
    // socket listener will append the saved message
  } catch (err: any) {
    console.error('sendMessage:', err);
    alert(err.message || 'Error sending message');
  }
};
const autoResize = (e: Event) => {
  const el = e.target as HTMLTextAreaElement;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
};

const formatDate = (d?: string) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

const scrollToBottom = () => {
  if (!scrollEl.value) return;
  nextTick(() => {
    scrollEl.value!.scrollTop = scrollEl.value!.scrollHeight;
  });
};

/** Helpers for classes */
const isMe = (m: any) => {
  const sid = m?.sender?._id || m?.sender || '';
  return String(sid).toLowerCase() === String(myId).toLowerCase();
};

const bubbleClasses = (m: any) => {

  return [
    'max-w-[70%] rounded-2xl',
    isMe(m)
      ? 'bg-purple-600 text-white rounded-br-none ml-auto'
      : 'bg-white text-gray-900 rounded-bl-none mr-auto'
  ].join(' ');
};
const timestampClasses = (m: any) => {
  return isMe(m) ? 'text-purple-200 self-end' : 'text-gray-400 self-start';
};

/** Socket wiring: dedupe on _id to avoid double pushes */
let s: any = null;
const onIncomingMessage = (m: any) => {
  console.log('incoming:', {
    sender: m.sender?._id || m.sender,
    myId
  });
  if (!props.room) return;
  const rid = String(m.chatRoom || m.chatRoom?._id || m.chatRoom);
  if (rid !== String(props.room._id)) return;

  // dedupe by _id
  if (!messages.value.find((x: any) => String(x._id) === String(m._id))) {
    messages.value.push(m);
    nextTick(scrollToBottom);
  }
};
watch(messages, async () => {
  await nextTick();
  scrollToBottom();
});

watch(() => props.room, async (room) => {
  // clean up previous listeners before changing room
  const socket = getSocket();
  socket?.off('message:new', onIncomingMessage);
  if (!room) {
    messages.value = [];
    return;
  }

  await fetchMessages(room._id);

  if (token) {
    connectSocket(token);
    s = getSocket();

    // debug helper to see all events (optional)
    // s.onAny((evt: string, ...args: any[]) => console.debug('socket event', evt, args));

    // ensure we join room AFTER socket is connected
    if (s.connected) {
      s.emit('joinRoom', { roomId: room._id });
    } else {
      s.on('connect', () => s.emit('joinRoom', { roomId: room._id }));
    }

    // attach listener (off first to be safe)
    s.off('message:new', onIncomingMessage);
    s.on('message:new', onIncomingMessage);

    // announcements too
    s.off('announcement:new');
    s.on('announcement:new', (m: any) => {
      const myRole = localStorage.getItem("role") || "client";
      const target = m.audience || m.target || "all";

      // 🎯 Show only relevant announcements
      if (target !== "all" && target !== myRole) return;

      // ✅ Avoid duplicates
      if (!messages.value.find((x: any) => String(x._id) === String(m._id))) {
        messages.value.push(m);
        nextTick(scrollToBottom);
      }
    });
  }
}, { immediate: true });

onUnmounted(() => {
  const socket = getSocket();
  socket?.off('message:new', onIncomingMessage);
  socket?.off('announcement:new');
  if (props.room && socket?.connected) {
    socket.emit('leaveRoom', { roomId: props.room._id });
  }
});
</script>

<style scoped>
/* bubble defaults */
.max-w-\[70\%\] { max-width: 70%; } /* fallback for browsers if Tailwind not generating the utility */

/* optional small style tweaks */
</style>
