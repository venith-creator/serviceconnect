<template>
  <div class="flex items-center space-x-0.5">
    <template v-for="i in 5" :key="i">
      <component
        :is="getStarIcon(i)"
        class="w-5 h-5"
        :class="getStarClass(i)"
      />
    </template>
    <span class="ml-1 text-sm text-gray-600">({{ rating.toFixed(1) }})</span>
  </div>
</template>

<script setup lang="ts">
import { StarIcon as FullStar } from "@heroicons/vue/24/solid";
import { StarIcon as EmptyStar } from "@heroicons/vue/24/outline";

interface Props {
  rating: number;
}

const props = defineProps<Props>();

// choose star icon (solid for full, outline for empty)
const getStarIcon = (index: number) => {
  const value = props.rating - (index - 1);
  if (value >= 1) return FullStar;
  if (value > 0 && value < 1) return FullStar; // partial still solid
  return EmptyStar;
};

// choose color intensity
const getStarClass = (index: number) => {
  const value = props.rating - (index - 1);
  if (value >= 1) return "text-yellow-400";
  if (value > 0 && value < 1) return "text-yellow-300";
  return "text-gray-300";
};
</script>
