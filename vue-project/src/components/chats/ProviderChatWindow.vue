<template>
  <ClientChatWindow :room="props.room" v-bind="$attrs" />
</template>

<script setup lang="ts">
import ClientChatWindow from './ClientChatWindow.vue';
const props = defineProps<{
  room: any
}>()
</script>
