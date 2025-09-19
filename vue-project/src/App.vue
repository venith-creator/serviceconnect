<script setup lang="ts">
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";
</script>
<template>
  <div class="flex flex-col min-h-screen">

    <!-- Navbar -->
    <Navbar />

    <!-- Page Content -->
    <main class="flex-grow">
      <router-view />
    </main>

    <!-- Footer -->
    <Footer />
</div>
</template>

<style scoped>
/* Optional global layout tweaks */
</style>
