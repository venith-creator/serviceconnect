<template>
  <ClientDashboardLayout>
    <div class="space-y-6">
      <section>
        <h2 class="text-2xl font-bold text-gray-800">Welcome Back, Client 👋</h2>
        <p class="text-gray-600">Here’s your account overview.</p>
      </section>

      <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-sm text-gray-500 mb-2">Active Jobs</h3>
          <p class="text-3xl font-bold text-green-600">5</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-sm text-gray-500 mb-2">Pending Proposals</h3>
          <p class="text-3xl font-bold text-blue-600">9</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-sm text-gray-500 mb-2">Total Spent</h3>
          <p class="text-3xl font-bold text-yellow-600">£120,000</p>
        </div>
      </section>
    </div>
  </ClientDashboardLayout>
</template>

<script setup lang="ts">
import ClientDashboardLayout from '@/components/ClientDashboardLayout.vue'
</script>

