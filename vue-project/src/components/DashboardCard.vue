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
import { computed } from 'vue'

const props = defineProps<{
  icon?: string
  label?: string
  value?: string | number
  color?: string
}>()

// ✅ Tell TypeScript that we’re only dealing with valid Vue components
const iconComponent = computed(() => {
  const iconName = props.icon as keyof typeof Icons
  const Icon = Icons[iconName]
  // Only return if it's a valid Vue component (function)
  if (typeof Icon === 'function') {
    return Icon as any
  }
  return Icons.HelpCircle as any
})
</script>
