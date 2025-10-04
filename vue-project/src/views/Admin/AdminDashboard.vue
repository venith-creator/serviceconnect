<!-- src/views/Admin/AdminDashboard.vue -->
<template>
  <AdminDashboardLayout>
    <div class="space-y-6">
      <section>
        <h2 class="text-2xl font-bold text-gray-800">Welcome Back, Admin 👋</h2>
        <p class="text-gray-600">Here’s a quick overview of system stats.</p>
      </section>

      <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-sm text-gray-500 mb-2">Total Providers</h3>
          <p class="text-3xl font-bold text-purple-600">128</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-sm text-gray-500 mb-2">Jobs Completed</h3>
          <p class="text-3xl font-bold text-green-600">452</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-sm text-gray-500 mb-2">Pending Payments</h3>
          <p class="text-3xl font-bold text-yellow-600">₦34,000</p>
        </div>
      </section>
    </div>
  </AdminDashboardLayout>
</template>

<script setup lang="ts">
import AdminDashboardLayout from '@/components/AdminDashboardLayout.vue'
</script>
