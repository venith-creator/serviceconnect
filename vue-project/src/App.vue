<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";
import AdminDashboardLayout from "@/components/AdminDashboardLayout.vue";
import ClientDashboardLayout from "@/components/ClientDashboardLayout.vue";
import ProviderDashboardLayout from "@/components/ProviderDashboardLayout.vue";
const route = useRoute()

const layout = computed(() => {
  switch (route.meta.layout) {
    case 'admin':
      return AdminDashboardLayout
    case 'client':
      return ClientDashboardLayout
    case 'provider':
      return ProviderDashboardLayout
    default:
      return null // means use default layout (Navbar + Footer)
  }
})

/*const isDashboardRoute = computed(() => {
  return route.meta.layout === 'dashboard'
})*/
</script>
<template>
  <!-- If route has a dashboard layout -->
  <component v-if="layout" :is="layout">
    <router-view />
  </component>

  <!-- Else use public layout -->
  <div v-else class="flex flex-col min-h-screen">
    <Navbar />
    <main class="flex-grow">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<style scoped>
/* Optional global layout tweaks */
</style>
