<template>
  <div
    v-if="open"
    class="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
  >
    <div class="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 space-y-5">
      <div class="text-center space-y-1">
        <h2 class="text-xl font-bold">Switch Dashboard</h2>
        <p class="text-gray-600 text-sm">Choose how you want to continue</p>
      </div>

      <div class="grid gap-3">
        <!-- Client Option -->
        <button
          v-if="roles.includes('client')"
          @click="goToDashboard('client')"
          class="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition"
        >
          <HomeIcon class="w-5 h-5 text-green-600" />
          <span class="font-medium">Continue as Client</span>
        </button>
        <button
          v-else
          @click="addRole('client')"
          class="flex items-center gap-3 p-3 border border-dashed rounded-lg hover:bg-gray-50 transition"
        >
          <HomeIcon class="w-5 h-5 text-gray-400" />
          <span class="font-medium">Become a Client</span>
        </button>

        <!-- Provider Option -->
        <button
          v-if="roles.includes('provider')"
          @click="goToDashboard('provider')"
          class="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition"
        >
          <WrenchScrewdriverIcon class="w-5 h-5 text-blue-600" />
          <span class="font-medium">Continue as Provider</span>
        </button>
        <button
          v-else
          @click="addRole('provider')"
          class="flex items-center gap-3 p-3 border border-dashed rounded-lg hover:bg-gray-50 transition"
        >
          <WrenchScrewdriverIcon class="w-5 h-5 text-gray-400" />
          <span class="font-medium">Become a Provider</span>
        </button>
      </div>

      <button
        @click="$emit('close')"
        class="w-full py-2 text-gray-600 hover:text-gray-900 font-medium mt-2"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { HomeIcon, WrenchScrewdriverIcon } from '@heroicons/vue/24/solid'
import { API_BASE_URL } from '@/config'

defineProps({ open: Boolean })
defineEmits(['close'])

const roles = ref([])
const router = useRouter()

onMounted(() => {
  const userData = JSON.parse(localStorage.getItem('user') || '{}')
  roles.value = Array.isArray(userData.roles)
    ? userData.roles
    : [userData.roles].filter(Boolean)
})

/*function goToDashboard(role) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (role === 'client') {
    router.push('/dashboard/client')
  } else if (role === 'provider') {
    if (!user.providerOnboarding) router.push('/onboarding/provider')
    else router.push('/dashboard/provider')
  }
}*/

async function goToDashboard(role) {
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData._id || userData.id;

  if (role === "client") {
    router.push("/dashboard/client");
    return;
  }

  if (role === "provider") {
    const token = localStorage.getItem("token");
    const onboardingComplete = localStorage.getItem("onboardingComplete") === "true";
    const suspended = localStorage.getItem("providerSuspended") === "true";
    const providerApproved = userId && (localStorage.getItem(`providerApproved_${userId}`) === "true");

    if (suspended) {
      alert("Your provider account has been suspended. Please contact support via the Contact page.");
      router.push("/contact");
      return;
    }

    if (providerApproved) {
      router.push("/dashboard/provider");
      return;
    }
    // If onboarding hasn't started
    if (!userData.providerOnboarding || !onboardingComplete) {
      router.push("/onboarding/provider");
      return;
    }

    // If onboarding is complete, check current provider status
    try {
      const res = await fetch(`${API_BASE_URL}/provider-profiles/provider-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
          const errData = await res.json();
          if (errData.suspended) {
            alert(errData.message || "Your provider account has been suspended.");
            router.push("/contact");
            return;
          }
          throw new Error(errData.message || "Failed to fetch status");
        }

      const data = await res.json();

      if (userId) {
        if (data.status === "suspended" || data.suspended) {
            alert("Your provider account has been suspended. Please contact us through our Contact page.");
            router.push("/contact");
            return;
          }
      if (data.status === "approved") {
        localStorage.setItem(`providerApproved_${userId}`, "true");
        router.push("/dashboard/provider");
      } else {
        localStorage.removeItem(`providerApproved_${userId}`);
        router.push("/provider-status");
      }
      } else {
        router.push("/provider-status");
      }
    } catch (err) {
      console.error("Error fetching provider status:", err);
      router.push("/provider-status");
    }
  }
}


async function addRole(role) {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_BASE_URL}/users/add-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newRole: role }),
    })
    const updatedUser = await res.json()
    localStorage.setItem('user', JSON.stringify(updatedUser))
    roles.value = updatedUser.roles
    goToDashboard(role)
  } catch (err) {
    console.error('Error adding role:', err)
  }
}
</script>
