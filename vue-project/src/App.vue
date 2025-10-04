<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";
const route = useRoute()

const isDashboardRoute = computed(() => {
  return route.meta.layout === 'dashboard'
})
</script>
<template>
  <div class="flex flex-col min-h-screen">

    <!-- Navbar -->
    <Navbar v-if="!isDashboardRoute" />

    <!-- Page Content -->
    <main class="flex-grow">
      <router-view />
    </main>

    <!-- Footer -->
    <Footer v-if="!isDashboardRoute"/>
</div>
</template>

<style scoped>
/* Optional global layout tweaks */
</style>
