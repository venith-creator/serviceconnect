<template>
    <div class="space-y-8">
      <!-- Header -->
      <section>
        <h2 class="text-2xl font-bold text-gray-800">
          Welcome, {{ providerName }} 👋
        </h2>
        <p class="text-gray-600">Here’s your performance overview.</p>
      </section>

      <div class="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm">
          <template v-if="provider.avatar && provider.avatar.trim() !== ''">
            <img
              :src="provider.avatar"
              alt="avatar"
              class="w-14 h-14 rounded-full object-cover"
              @error="provider.avatar = ''"
            />
          </template>

          <template v-else>
            <div
              class="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-gray-700"
            >
              {{ getInitials(provider.name) }}
            </div>
          </template>

          <div>
            <h3 class="font-semibold text-gray-800">{{ provider.name }}</h3>
            <p class="text-sm text-gray-500">{{ provider.email }}</p>
            <p class="text-yellow-500 font-semibold text-sm">
              ★ {{ provider.ratingAvg }} ({{ provider.ratingCount }} reviews)
            </p>
          </div>
        </div>

      <!-- Jobs & Proposals -->
      <section class="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        <!-- Jobs -->
        <DashboardCard
          icon="Briefcase"
          label="Active Jobs"
          :value="stats.jobs?.active || 0"
          color="green"
        />
        <DashboardCard
          icon="CheckCircle"
          label="Completed Jobs"
          :value="stats.jobs?.completed || 0"
          color="purple"
        />
        <DashboardCard
          icon="ListChecks"
          label="Total Jobs"
          :value="stats.jobs?.total || 0"
          color="gray"
        />

        <!-- Proposals -->
        <DashboardCard
          icon="Send"
          label="Proposals Sent"
          :value="stats.proposals?.total || 0"
          color="blue"
        />
        <DashboardCard
          icon="FileCheck"
          label="Accepted Proposals"
          :value="stats.proposals?.accepted || 0"
          color="teal"
        />
        <DashboardCard
          icon="FileX"
          label="Rejected Proposals"
          :value="stats.proposals?.rejected || 0"
          color="red"
        />
        <DashboardCard
          icon="Undo2"
          label="Withdrawn Proposals"
          :value="stats.proposals?.withdrawn || 0"
          color="amber"
        />
      </section>

      <!-- Ratings & Reviews -->
      <section class="grid md:grid-cols-3 gap-6">
        <DashboardCard
          icon="Star"
          label="Average Rating"
          :value="stats.reviews?.avgRating || 0"
          color="yellow"
        />
        <DashboardCard
          icon="MessageSquare"
          label="Total Reviews"
          :value="stats.reviews?.total || 0"
          color="orange"
        />
        <DashboardCard
          icon="User"
          label="Rating Count"
          :value="provider.ratingCount || 0"
          color="pink"
        />
      </section>

      <!-- Portfolio Stats -->
      <section class="grid md:grid-cols-3 gap-6">
        <DashboardCard
          icon="Image"
          label="Total Posts"
          :value="stats.posts?.total || 0"
          color="indigo"
        />
        <DashboardCard
          icon="Heart"
          label="Total Likes"
          :value="stats.posts?.likes || 0"
          color="rose"
        />
        <DashboardCard
          icon="MessageCircle"
          label="Total Comments"
          :value="stats.posts?.comments || 0"
          color="sky"
        />
      </section>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
//import ProviderDashboardLayout from "@/components/ProviderDashboardLayout.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import { API_BASE_URL } from "@/config";

const stats = ref<any>({});
const provider = ref<any>({});
const providerName = ref("Provider");

const getInitials = (name: any) => {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const resolveProviderId = async (token: string): Promise<string | null> => {
  //  Check for stored userId (auth user)
  const userId = localStorage.getItem("userId");
  if (userId) return userId;

  //  Check if providerProfileId exists and fetch real user id from it
  const providerProfileId = localStorage.getItem("providerProfileId");
  if (providerProfileId) {
    try {
      const res = await fetch(`${API_BASE_URL}/provider-profiles/${providerProfileId}`);
      const data = await res.json();
      return data.profile?.user?._id || null;
    } catch (err) {
      console.error("⚠️ Failed to resolve user from profile:", err);
    }
  }

  // 3️⃣ Fallback: fetch from /auth/me if exists
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const me = await res.json();
    return me._id || null;
  } catch (err) {
    console.error("⚠️ Could not fetch /auth/me:", err);
  }

  return null;
};

onMounted(async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  // ✅ Get the real provider user ID
  const providerId = await resolveProviderId(token);
  if (!providerId) {
    console.error("❌ Could not determine provider ID");
    return;
  }

  // ✅ Fetch dashboard data
  const res = await fetch(`${API_BASE_URL}/provider/dashboard/${providerId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    console.error("❌ Failed to load dashboard");
    return;
  }

  const data = await res.json();
  provider.value = data.provider;
  stats.value = data.stats;
  providerName.value = data.provider?.name || "Provider";
});
</script>
