<template>
  <ClientDashboardLayout>
    <ClientChatPage :initialRoomId="initialRoomId"/>
  </ClientDashboardLayout>
</template>
<script setup lang="ts">
import ClientChatPage from '@/components/chats/ClientChatPage.vue'
import ClientDashboardLayout from '@/components/ClientDashboardLayout.vue'
import { useRoute } from 'vue-router';
const route = useRoute();
const initialRoomId = (route.query.roomId as string) || '';
</script>
