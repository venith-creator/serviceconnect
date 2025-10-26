<template>
    <div class="space-y-8">
      <!-- Header -->
      <section>
        <h2 class="text-2xl font-bold text-gray-800">
          Welcome back, Admin 👋
        </h2>
        <p class="text-gray-600">
          Here’s a system-wide performance overview.
        </p>
      </section>

      <!-- Admin Profile (avatar/name fallback) -->
      <div class="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm">
        <template v-if="admin.avatar && admin.avatar.trim() !== ''">
          <img
            :src="admin.avatar"
            alt="avatar"
            class="w-14 h-14 rounded-full object-cover"
            @error="admin.avatar = ''"
          />
        </template>

        <template v-else>
          <div
            class="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-gray-700"
          >
            {{ getInitials(admin.name) }}
          </div>
        </template>

        <div>
          <h3 class="font-semibold text-gray-800">{{ admin.name }}</h3>
          <p class="text-sm text-gray-500">{{ admin.email }}</p>
          <p class="text-sm text-purple-600 font-semibold">
            System Administrator
          </p>
        </div>
      </div>

      <!-- Provider Stats -->
      <section class="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        <DashboardCard
          icon="Users"
          label="Total Providers"
          :value="stats.providers?.total || 0"
          color="purple"
        />
        <DashboardCard
          icon="CheckCircle"
          label="Approved Providers"
          :value="stats.providers?.approved || 0"
          color="green"
        />
        <DashboardCard
          icon="Clock"
          label="Pending Providers"
          :value="stats.providers?.pending || 0"
          color="amber"
        />
        <DashboardCard
          icon="XCircle"
          label="Rejected Providers"
          :value="stats.providers?.rejected || 0"
          color="red"
        />
        <DashboardCard
          icon="Slash"
          label="Suspended Providers"
          :value="stats.providers?.suspended || 0"
          color="gray"
        />
        <DashboardCard
          icon="BadgeDollarSign"
          label="Trial Providers"
          :value="stats.providers?.trial || 0"
          color="sky"
        />
        <DashboardCard
          icon="CreditCard"
          label="Active Paid Providers"
          :value="stats.providers?.activePaid || 0"
          color="teal"
        />
      </section>

      <!-- Service Stats -->
      <section class="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        <DashboardCard
          icon="Briefcase"
          label="Total Services"
          :value="stats.services?.total || 0"
          color="purple"
        />
        <DashboardCard
          icon="CheckCircle2"
          label="Approved Services"
          :value="stats.services?.approved || 0"
          color="green"
        />
        <DashboardCard
          icon="Clock4"
          label="Pending Services"
          :value="stats.services?.pending || 0"
          color="amber"
        />
        <DashboardCard
          icon="X"
          label="Rejected Services"
          :value="stats.services?.rejected || 0"
          color="red"
        />
        <DashboardCard
          icon="Sparkles"
          label="Trial Services"
          :value="stats.services?.trial || 0"
          color="sky"
        />
        <DashboardCard
          icon="DollarSign"
          label="Active Paid Services"
          :value="stats.services?.active || 0"
          color="teal"
        />
      </section>

      <!-- Job Stats -->
      <section class="grid md:grid-cols-3 gap-6">
        <DashboardCard
          icon="ListChecks"
          label="Total Jobs"
          :value="stats.jobs?.total || 0"
          color="gray"
        />
        <DashboardCard
          icon="PlayCircle"
          label="Active Jobs"
          :value="stats.jobs?.active || 0"
          color="blue"
        />
        <DashboardCard
          icon="CheckCircle"
          label="Completed Jobs"
          :value="stats.jobs?.completed || 0"
          color="green"
        />
      </section>

      <!-- General Platform Stats -->
      <section class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          icon="Send"
          label="Total Proposals"
          :value="stats.proposals || 0"
          color="indigo"
        />
        <DashboardCard
          icon="MessageSquare"
          label="Total Reviews"
          :value="stats.reviews || 0"
          color="orange"
        />
      </section>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
//import AdminDashboardLayout from "@/components/AdminDashboardLayout.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import { API_BASE_URL } from "@/config";

const stats = ref<any>({});
const admin = ref<any>({
  name: "Admin",
  email: "admin@system.com",
  avatar: "",
});

// --- helper: initials fallback ---
const getInitials = (name: string) => {
  if (!name) return "AD";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

// --- Fetch dashboard stats ---
onMounted(async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to load admin dashboard");

    const data = await res.json();
    stats.value = data.summary;
  } catch (err) {
    console.error("❌ Dashboard error:", err);
  }
});
</script>
