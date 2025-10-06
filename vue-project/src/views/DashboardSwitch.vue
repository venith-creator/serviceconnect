<template>
  <div class="flex min-h-screen items-center justify-center bg-secondary/20 px-4">
    <!-- Card -->
    <div class="w-full max-w-md bg-white rounded-xl shadow p-8 space-y-6">
      <!-- Heading -->
      <div class="text-center space-y-1">
        <h2 class="text-2xl font-bold">Choose Your Dashboard</h2>
        <p class="text-gray-600 text-sm">Select how you want to continue or add a new role</p>
      </div>

      <!-- Options -->
      <div class="grid gap-4">
        <!-- Client -->
        <button
          v-if="roles.includes('client')"
          @click="goToDashboard('client')"
          class="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition"
        >
          <HomeIcon class="w-6 h-6 text-primary" />
          <span class="font-medium">Continue as Client</span>
        </button>
        <button
          v-else
          @click="addRole('client')"
          class="w-full flex items-center gap-3 p-3 border border-dashed rounded-lg hover:bg-gray-50 transition"
        >
          <HomeIcon class="w-6 h-6 text-gray-400" />
          <span class="font-medium">Become a Client</span>
        </button>

        <!-- Provider -->
        <button
          v-if="roles.includes('provider')"
          @click="goToDashboard('provider')"
          class="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition"
        >
          <WrenchScrewdriverIcon class="w-6 h-6 text-primary" />
          <span class="font-medium">Continue as Provider</span>
        </button>
        <button
          v-else
          @click="addRole('provider')"
          class="w-full flex items-center gap-3 p-3 border border-dashed rounded-lg hover:bg-gray-50 transition"
        >
          <WrenchScrewdriverIcon class="w-6 h-6 text-gray-400" />
          <span class="font-medium">Become a Provider</span>
        </button>
      </div>

      <!-- Logout -->
      <p class="text-center text-sm text-gray-600 pt-2">
        <button @click="logout" class="text-red-500 font-semibold hover:underline">
          Logout
        </button>
      </p>
    </div>
  </div>
</template>

<script setup>
import { API_BASE_URL } from "@/config";
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { HomeIcon, WrenchScrewdriverIcon } from "@heroicons/vue/24/solid";

const roles = ref([]);
const router = useRouter();

onMounted(() => {
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  roles.value = Array.isArray(userData.roles) ? userData.roles : [userData.roles].filter(Boolean);
});

function goToDashboard(role) {
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  if (role === "client") {
    router.push("/dashboard/client");
  } else if (role === "provider") {
    if (!userData.providerOnboarding || !onboardingComplete) {
      router.push("/onboarding/provider");
    } else {
      router.push("/provider-status");
    }
  }
}

async function addRole(role) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/users/add-role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newRole: role }),
    });

    if (!res.ok) throw new Error(`Failed to add role: ${res.statusText}`);

    const updatedUser = await res.json();
    localStorage.setItem("user", JSON.stringify(updatedUser));
    roles.value = updatedUser.roles;

    if (role === "provider") router.push("/onboarding/provider");
    else router.push("/dashboard/client");
  } catch (error) {
    console.error("Error adding role:", error);
  }
}

function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  router.push("/login");
}
</script>
