<template>
  <div class="bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4">
    <component :is="iconComponent" :class="`w-8 h-8 text-${color}-600`" />
    <div>
      <h3 class="text-sm text-gray-500">{{ label }}</h3>
      <p class="text-2xl font-bold text-gray-800">{{ value }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Icons from 'lucide-vue-next'
import { computed, type Component } from 'vue'

const props = defineProps({
  icon: String,
  label: String,
  value: [String, Number],
  color: { type: String, default: 'gray' },
})

const iconComponent = computed<Component>(() => {
  const iconName = props.icon as keyof typeof Icons
  return Icons[iconName] || Icons.HelpCircle
})
</script>

