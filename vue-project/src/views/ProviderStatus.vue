<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <div class="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
      <template v-if="loading">
        <p class="text-gray-500">Loading status...</p>
      </template>

      <template v-else>

        <!-- Suspended -->
        <div v-if="status === 'suspended'">
          <h2 class="text-2xl font-bold text-red-600">Account Suspended</h2>
          <p class="mt-3 text-gray-700">
            Your provider account has been suspended. Please contact our support team for assistance.
          </p>
          <button
            @click="contactSupport"
            class="mt-4 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Contact Support
          </button>
        </div>

        <!-- Pending -->
        <div v-if="status === 'pending'">
          <h2 class="text-2xl font-bold text-yellow-600">Waiting for admin review</h2>
          <p class="mt-3 text-gray-700">
            Your profile is under review. You will be notified once it's approved.
          </p>
          <button
            @click="goBack"
            class="mt-6 px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
          >
            ← Go Back
          </button>
        </div>

        <!-- Approved -->
        <div v-else-if="status === 'approved'">
          <h2 class="text-2xl font-bold text-green-600">Congratulations!</h2>
          <p class="mt-3 text-gray-700">Your profile has been approved.</p>
          <button
            @click="goToDashboard"
            class="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Go to Dashboard
          </button>
        </div>

        <!-- Rejected -->
        <div v-else-if="status === 'rejected'">
          <h2 class="text-2xl font-bold text-red-600">Profile Rejected</h2>
          <p class="mt-3 text-gray-700">Reason: {{ rejectionReason || 'No reason provided' }}</p>
          <button
            @click="retryOnboarding"
            class="mt-4 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry Onboarding
          </button>
          <button
            @click="goBack"
            class="mt-6 px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
          >
            ← Go Back
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { API_BASE_URL } from '@/config';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const status = ref('');
const rejectionReason = ref('');
const loading = ref(true);
const router = useRouter();

/*function goBack() {
  const prev = localStorage.getItem('previousRoute') || '/';
  if (prev) {
  router.push(prev);
  } else {
    router.push('/dashboard/switch');
  }
}*/

function goBack() {
  const prev = localStorage.getItem("previousRoute");

  if (!prev || prev.includes("/onboarding/provider") || prev === "/provider-status") {
    router.push("/dashboard/switch");
  } else {
    router.push(prev);
  }
}


const fetchStatus = async () => {
  loading.value = true;
  try {
    const res = await fetch(`${API_BASE_URL}/provider-profiles/provider-status`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!res.ok) {
      const errData = await res.json();
      if (errData.suspended) {
        status.value = "suspended"; // 👈 show suspended section instead of redirect
        return;
      }
      throw new Error(errData.message || "Failed to fetch status");
    }
    const data = await res.json();
    status.value = data.status;
    rejectionReason.value = data.rejectionReason || '';

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userData._id || userData.id;

    if (data.status === 'approved' && userId) {
      localStorage.setItem(`providerApproved_${userId}`, 'true');
    }
  } catch (err) {
    console.error(err);
    status.value = 'pending';
  } finally {
    loading.value = false;
  }
};

const goToDashboard = () => router.push('/dashboard/provider');
const retryOnboarding = () => {
  localStorage.removeItem('onboardingComplete');
  router.push('/onboarding/provider');
};


onMounted(fetchStatus);
</script>
