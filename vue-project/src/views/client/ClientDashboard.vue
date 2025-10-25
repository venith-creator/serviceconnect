<template>
  <ClientDashboardLayout>
    <div class="space-y-8">
      <section>
        <h2 class="text-2xl font-bold text-gray-800">Welcome, {{ clientName }} 👋</h2>
        <p class="text-gray-600">Here’s your account overview.</p>
      </section>

      <!-- Job & Proposal Stats -->
      <section class="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        <!-- Jobs -->
        <DashboardCard icon="FolderOpen" label="Open Jobs" :value="stats.jobStats?.openJobs" color="amber" />
        <DashboardCard icon="Briefcase" label="Active Jobs" :value="stats.jobStats?.activeJobs" color="green" />
        <DashboardCard icon="CheckCircle" label="Completed Jobs" :value="stats.jobStats?.completedJobs" color="purple" />
        <DashboardCard icon="XCircle" label="Cancelled Jobs" :value="stats.jobStats?.cancelledJobs" color="red" />

        <!-- Proposals -->
        <DashboardCard icon="Send" label="Pending Proposals" :value="stats.proposalStats?.pendingProposals" color="blue" />
        <DashboardCard icon="FileCheck" label="Accepted Proposals" :value="stats.proposalStats?.acceptedProposals" color="teal" />
        <DashboardCard icon="FileText" label="Total Proposals" :value="stats.proposalStats?.totalProposals" color="gray" />

        <!-- Finances -->
        <DashboardCard icon="Wallet" label="Total Spent" :value="formatCurrency(stats.totalSpent)" color="yellow" />
      </section>

      <!-- Reviews -->
      <section class="grid md:grid-cols-3 gap-6">
        <DashboardCard icon="Star" label="Avg Rating Received" :value="stats.reviewStats?.averageRating || 0" color="orange" />
        <DashboardCard icon="MessageSquare" label="Reviews Given" :value="stats.reviewStats?.reviewsGiven || 0" color="cyan" />
        <DashboardCard icon="Users" label="Reviews Received" :value="stats.reviewStats?.reviewsReceived || 0" color="pink" />
      </section>
    </div>
  </ClientDashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { API_BASE_URL } from '@/config'
import ClientDashboardLayout from '@/components/ClientDashboardLayout.vue'
import DashboardCard from '@/components/DashboardCard.vue'

const stats = ref<any>({})
const clientName = ref(localStorage.getItem('userName') || 'Client')

const formatCurrency = (amount: number) =>
  `£${(amount || 0).toLocaleString()}`

onMounted(async () => {
  const res = await fetch(`${API_BASE_URL}/client-stats/dashboard`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })
  stats.value = await res.json()
})
</script>
