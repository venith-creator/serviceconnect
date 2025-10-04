<template>
  <ProviderDashboardLayout>
    <div class="space-y-6">
      <section>
        <h2 class="text-2xl font-bold text-gray-800">Welcome Back, Provider 👋</h2>
        <p class="text-gray-600">Here’s your activity summary.</p>
      </section>

      <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-sm text-gray-500 mb-2">Active Jobs</h3>
          <p class="text-3xl font-bold text-blue-600">8</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-sm text-gray-500 mb-2">Proposals Sent</h3>
          <p class="text-3xl font-bold text-purple-600">24</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-sm text-gray-500 mb-2">Rating</h3>
          <p class="text-3xl font-bold text-yellow-500">4.8★</p>
        </div>
      </section>
    </div>
  </ProviderDashboardLayout>
</template>

<script setup lang="ts">
import ProviderDashboardLayout from '@/components/ProviderDashboardLayout.vue'
</script>

