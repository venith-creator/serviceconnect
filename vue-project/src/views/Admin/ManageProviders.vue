<template>
    <div class="p-6 space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-800">Manage Providers</h1>
      </div>

      <!-- Tabs -->
      <div class="flex gap-3 border-b pb-2">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          :class="[
            'px-4 py-2 rounded-t-lg font-medium transition-all',
            activeTab === tab.value
              ? 'bg-green-100 text-green-700 border-b-2 border-green-600'
              : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          {{ tab.label }}
          <span
            v-if="tab.value === 'services' && pendingServicesCount > 0"
            class="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full"
          >
            {{ pendingServicesCount }}
          </span>
        </button>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center p-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        <span class="ml-3 text-gray-700">Loading...</span>
      </div>

      <!-- Services Table (shown only when Services tab is active) -->
      <div v-if="!isLoading && activeTab === 'services'"
           class="bg-white shadow-sm rounded-lg overflow-hidden">
        <div class="p-4 border-b">
          <h2 class="text-lg font-semibold text-gray-800">Pending Services
            ({{ pendingServices.length }})</h2>
          <p class="text-sm text-gray-500 mt-1">Services awaiting admin approval</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th class="p-3">Service</th>
              <th class="p-3">Provider</th>
              <th class="p-3">Rate</th>
              <th class="p-3">Status</th>
              <th class="p-3 text-right">Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-if="pendingServices.length === 0">
              <td colspan="6" class="p-6 text-center text-sm text-gray-500">No pending services
                found
              </td>
            </tr>
            <tr
              v-for="(service, index) in pendingServices"
              :key="index"
              class="border-b hover:bg-gray-50"
            >
              <td class="p-3">
                <div class="font-medium text-gray-900">{{ service.category }}</div>
                <div class="text-sm text-gray-500">{{ service.radiusKm }} km radius</div>
              </td>
              <td class="p-3">
                <div class="font-medium text-gray-900">{{ service.providerName }}</div>
                <div class="text-sm text-gray-500">{{ service.provider?.email || 'N/A' }}</div>
              </td>
              <td class="p-3">
                <div class="text-gray-900">£{{ service.rate }}/hr</div>
              </td>
              <td class="p-3">
                  <span
                    class="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                    Pending
                  </span>
              </td>
              <td class="p-3 text-right space-x-2">
                <button
                  @click="approveService(service.providerId, service._id)"
                  class="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  Approve
                </button>
                <button
                  @click="handleRejectService(service.providerId, service._id, 'service')"
                  class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Reject
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Providers Table (shown for all other tabs) -->
      <div v-else-if="!isLoading && activeTab !== 'services'"
           class="bg-white shadow-sm rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th class="p-3">Name</th>
              <th class="p-3">Status</th>
              <th class="p-3">Experience</th>
              <th class="p-3">Location</th>
              <th class="p-3">Rating</th>
              <th class="p-3">Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr
              v-for="provider in filteredProviders"
              :key="provider._id"
              class="border-b hover:bg-gray-50"
            >
              <td class="p-3 font-medium">{{ provider.user?.name || 'N/A' }}</td>
              <td class="p-3 capitalize">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-semibold',
                      provider.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : provider.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : provider.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : provider.status === 'suspended'
                        ? 'bg-gray-200 text-gray-700'
                        : ''
                    ]"
                  >
                    {{ provider.status }}
                  </span>
              </td>
              <td class="p-3">{{ provider.yearsOfExperience || '-' }}</td>
              <td class="p-3">{{ provider.city }}, {{ provider.state }}</td>
              <td class="p-3">{{ provider.ratingAvg?.toFixed(1) || '0.0' }}</td>
              <td class="p-3 text-right relative">
                <!-- Three dots icon -->
                <button
                  @click="toggleMenu(provider._id)"
                  class="p-2 rounded-full hover:bg-gray-100"
                >
                  ⋮
                </button>
                <!-- Dropdown menu -->
                <div
                  v-if="openMenuId === provider._id"
                  class="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
                >
                  <ul class="text-sm text-gray-700">
                <li
                    v-if="provider.status === 'pending'"
                    @click="approveProvider(provider._id)"
                    class="px-4 py-2 hover:bg-green-50 cursor-pointer"
                  >
                   Approve
                  </li>
                <li
                  v-if="provider.status === 'pending'"
                  @click="openRejectModal(provider._id)"
                  class="px-4 py-2 hover:bg-red-50 cursor-pointer"
                >
                 Reject
                </li>
                 <li
                    v-if="provider.status === 'approved' && !provider.suspended"
                    @click="suspendProvider(provider._id)"
                    class="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    Suspend
                  </li>
                <li
                  v-if="provider.suspended"
                  @click="approveProvider(provider._id)"
                  class="px-4 py-2 hover:bg-green-50 cursor-pointer"
                >
                  Re-activate
                  </li>
                <button
                  @click="deleteProvider(provider._id)"
                  class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Delete
                </button>
               <li
                  @click="viewProvider(provider._id)"
                  class="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                >
                   View
                </li>
                  </ul>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredProviders.length === 0" class="p-6 text-center text-gray-500">
          No providers found.
        </div>
      </div>

      <!-- Rest of your modals remain the same -->
      <!-- Reject Modal -->
      <div
        v-if="showRejectModal"
        class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      >
        <div class="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 class="text-lg font-semibold mb-3">Reject {{currentRejectMode === 'service' ? 'Service' : 'Provider'}}</h2>
          <textarea
            v-model="rejectReason"
            placeholder="Enter rejection reason..."
            class="w-full border rounded p-2 text-sm"
            rows="4"
          ></textarea>
          <div class="mt-4 flex justify-end space-x-2">
            <button
              @click="showRejectModal = false"
              class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              @click="confirmReject"
              class="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      <!-- View Provider Modal -->
      <div
        v-if="showProviderModal"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      >
        <div
          class="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto border border-gray-200">
          <h2 class="text-2xl font-semibold mb-4 text-gray-800">Provider Details</h2>

          <div v-if="selectedProvider">
            <!-- Profile Header -->
            <div class="flex items-center gap-4 mb-5 border-b pb-3">
              <img
                :src="selectedProvider.avatar?.url || selectedProvider.avatar || '/default-avatar.png'"
                alt="Avatar"
                class="w-20 h-20 rounded-full object-cover border shadow-sm"
              />
              <div>
                <h3 class="text-lg font-bold">{{ selectedProvider.user?.name || 'Unknown' }}</h3>
                <p class="text-gray-500 text-sm">{{ selectedProvider.user?.email }}</p>
                <p class="text-gray-700 text-sm mt-1">
                  <strong>Status:</strong> <span class="capitalize">{{
                    selectedProvider.status
                  }}</span>
                </p>
              </div>
            </div>

            <!-- Basic Info -->
            <div class="grid grid-cols-2 gap-3 text-sm text-gray-700">
              <p><strong>City:</strong> {{ selectedProvider.city || '-' }}</p>
              <p><strong>State:</strong> {{ selectedProvider.state || '-' }}</p>
              <p><strong>Experience:</strong> {{ selectedProvider.yearsOfExperience || 'N/A' }} yrs
              </p>
              <p><strong>Rate:</strong>
                {{ selectedProvider.rate ? `$£{selectedProvider.rate}/hr` : 'N/A' }}</p>
              <p><strong>Languages:</strong> {{ selectedProvider.languages || '-' }}</p>
              <p><strong>Availability:</strong> {{ selectedProvider.availability || '-' }}</p>
            </div>

            <p class="mt-3 text-gray-700">
              <strong>Bio:</strong><br/>
              <span class="text-gray-600">{{
                  selectedProvider.description || 'No bio provided.'
                }}</span>
            </p>

            <!-- Documents -->
            <div class="mt-6">
              <h3 class="font-semibold mb-2 text-gray-800">Documents</h3>
              <div v-if="selectedProvider.docs?.length" class="space-y-1">
                <a
                  v-for="(doc, i) in selectedProvider.docs"
                  :key="i"
                  :href="doc.url"
                  target="_blank"
                  class="text-green-600 underline hover:text-green-700 flex items-center gap-2"
                >
                  📄 {{ doc.originalname || `Document ${i + 1}` }}
                </a>
              </div>
              <p v-else class="text-gray-400 text-sm">No documents uploaded.</p>
            </div>

            <!-- Reviews Section -->
            <div class="mt-6">
              <h3 class="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                <span>Client Reviews ({{ providerReviews.length }})</span>
              </h3>

              <div v-if="providerReviews.length">
                <div
                  v-for="(review, i) in providerReviews"
                  :key="i"
                  class="border-b py-3"
                >
                  <div class="flex justify-between items-center">
                    <p class="text-sm font-medium text-gray-800">
                      ⭐ {{ review.rating.toFixed(1) }} / 5
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ new Date(review.createdAt).toLocaleDateString() }}
                    </p>
                  </div>

                  <p class="text-gray-700 text-sm mt-1">{{ review.comment }}</p>

                  <p class="text-xs text-gray-500 mt-1">
                    <strong>Client:</strong> {{ review.reviewer?.name || "Anonymous" }}<br/>
                    <strong>Job:</strong> {{ review.job?.title || "N/A" }}
                  </p>
                </div>
              </div>

              <div v-else class="text-gray-500 text-sm">
                No reviews yet.
              </div>
            </div>

            <!-- Portfolio -->
            <div class="mt-6">
              <h3 class="font-semibold mb-2 text-gray-800">Portfolio</h3>
              <div
                v-if="selectedProvider.portfolio?.length"
                class="grid grid-cols-2 md:grid-cols-3 gap-3"
              >
                <div
                  v-for="(item, i) in selectedProvider.portfolio"
                  :key="i"
                  class="border rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition"
                >
                  <img
                    :src="item.url"
                    alt="Portfolio item"
                    class="w-full h-32 object-cover"
                  />
                  <p class="text-sm text-gray-600 p-2">{{ item.caption || 'No caption' }}</p>
                </div>
              </div>
              <p v-else class="text-gray-400 text-sm">No portfolio uploaded.</p>
            </div>

            <!-- Services -->
            <div v-if="selectedProvider.services?.length" class="mt-6">
              <h3 class="font-semibold mb-2 text-gray-800">Services Offered</h3>
              <ul class="divide-y divide-gray-200">
                <li
                  v-for="(srv, i) in selectedProvider.services"
                  :key="i"
                  class="py-2 flex justify-between items-center"
                >
                  <span>{{ srv.category }}</span>
                  <span class="text-gray-500 text-sm">
                    {{ srv.rate ? `$£{srv.rate}` : 'N/A' }} • {{ srv.availability || 'N/A' }}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Buttons -->
          <div class="mt-6 flex justify-end gap-2">
            <button
              @click="showProviderModal = false"
              class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
            <button
              v-if="selectedProvider.status === 'pending'"
              @click="approveProvider(selectedProvider._id)"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Approve
            </button>
            <button
              v-if="selectedProvider.status === 'pending'"
              @click="openRejectModal(selectedProvider._id)"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
//import AdminDashboardLayout from '@/components/AdminDashboardLayout.vue'
import {API_BASE_URL} from '@/config'

const tabs = [
  {label: 'All', value: 'all'},
  {label: 'Pending', value: 'pending'},
  {label: 'Approved', value: 'approved'},
  {label: 'Suspended', value: 'suspended'},
  {label: 'Rejected', value: 'rejected'},
  {label: 'Services', value: 'services'},
]

const isLoading = ref(false)
const isServiceActionLoading = ref(false) // Separate loading state for service actions

const activeTab = ref('all')
const providers = ref<any[]>([])
const showRejectModal = ref(false)
const rejectReason = ref('')
const selectedId = ref('')
const currentRejectMode = ref('provider');
const serviceToBeRejected = ref({
  providerId: '',
  serviceId: '',
})

const showProviderModal = ref(false)
const selectedProvider = ref<any>(null)
const pendingServicesCount = ref(0)
const openMenuId = ref<string | null>(null);
const toggleMenu = (id: string) => {
  openMenuId.value = openMenuId.value === id ? null : id;
};
onMounted(async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/provider-profiles?status=pending`, {
    headers: {Authorization: `Bearer ${token}`},
  });
  const data = await res.json();
  providers.value = data.profiles || [];
});

const fetchProviders = async () => {
  try {
    isLoading.value = true;
    const res = await fetch(`${API_BASE_URL}/provider-profiles?page=1&limit=100`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      console.error("Failed to fetch providers:", err?.message || res.statusText);
      return;
    }

    const data = await res.json();

    // adapt depending on backend response shape
    providers.value = Array.isArray(data)
      ? data
      : data.profiles || data.data || [];

    // Calculate pending services count
    updatePendingServicesCount();

    console.log("Fetched providers:", providers.value);
  } catch (err) {
    console.error("Error fetching providers:", err);
  } finally {
    isLoading.value = false;
  }
};

const handleRejectService = (
  providerId: string,
  serviceId: string,
  rejectMode: string
) => {
  currentRejectMode.value = rejectMode;
  if (rejectMode === 'service') {
    serviceToBeRejected.value = {
      providerId,
      serviceId,
    }
  }
  showRejectModal.value = true;
}

// Helper function to update pending services count
const updatePendingServicesCount = () => {
  pendingServicesCount.value = providers.value.reduce((count, provider) => {
    const pendingServices = provider.services?.filter((s: any) => !s.approved) || [];
    return count + pendingServices.length;
  }, 0);
};

const pendingServices = computed(() => {
  const allServices: any[] = [];
  providers.value.forEach(provider => {
    if (provider.services?.length) {
      provider.services.forEach((service: any) => {
        if (!service.approved) {
          allServices.push({
            ...service,
            providerName: provider.user?.name || 'N/A',
            providerId: provider._id,
            providerStatus: provider.status,
            provider: provider
          });
        }
      });
    }
  });
  return allServices;
});

const filteredProviders = computed(() => {
  if (activeTab.value === 'all') return providers.value;
  if (activeTab.value === 'services') return []; // Return empty for services tab as we'll show a different view
  if (activeTab.value === 'suspended') return providers.value.filter(p => p.suspended);
  return providers.value.filter(p => p.status === activeTab.value);
});

const approveProvider = async (id: string) => {
  try {
    const res = await fetch(`${API_BASE_URL}/provider-profiles/${id}/approve`, {
      method: 'PATCH',
      headers: {Authorization: `Bearer ${localStorage.getItem('token')}`},
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      console.error("Approve failed:", err);
      alert(err?.message || "Approve failed");
      return;
    }

    alert("Provider approved successfully");
    showProviderModal.value = false;
    await fetchProviders();
  } catch (err) {
    console.error("Approve error:", err);
  }
};

const suspendProvider = async (id: string) => {
  await fetch(`${API_BASE_URL}/provider-profiles/${id}/suspend`, {
    method: 'PATCH',
    headers: {Authorization: `Bearer ${localStorage.getItem('token')}`},
  })
  await fetchProviders()
}

const deleteProvider = async (id: string) => {
  if (!confirm('Are you sure you want to delete this provider?')) return
  await fetch(`${API_BASE_URL}/provider-profiles/${id}`, {
    method: 'DELETE',
    headers: {Authorization: `Bearer ${localStorage.getItem('token')}`},
  })
  await fetchProviders()
}

const openRejectModal = (id: string) => {
  selectedId.value = id
  showRejectModal.value = true
}

const confirmReject = async () => {
  try {
    if (currentRejectMode.value === 'service') {
      await rejectService(serviceToBeRejected.value.providerId, serviceToBeRejected.value.serviceId)
      return
    }
    const res = await fetch(`${API_BASE_URL}/provider-profiles/${selectedId.value}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({reason: rejectReason.value}),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      alert(err?.message || "Reject failed");
      return;
    }

    alert("Provider rejected successfully");
    showRejectModal.value = false;
    rejectReason.value = "";
    await fetchProviders();
  } catch (err) {
    console.error("Reject error:", err);
  }
};

const viewProvider = async (id: string) => {
  try {
    const [profileRes, reviewsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/provider-profiles/${id}`, {
        headers: {Authorization: `Bearer ${localStorage.getItem("token")}`},
      }),
      fetch(`${API_BASE_URL}/reviews/provider/${id}`, {
        headers: {Authorization: `Bearer ${localStorage.getItem("token")}`},
      }),
    ])

    const profileData = await profileRes.json()
    const reviewsData = await reviewsRes.json()

    selectedProvider.value = {
      ...profileData.profile,
      reviews: reviewsData, // attach provider-only reviews
    }

    showProviderModal.value = true
  } catch (err) {
    console.error("Error fetching provider:", err)
  }
}

const approveService = async (providerId: string, serviceId: string) => {
  try {
    isServiceActionLoading.value = true;

    const res = await fetch(
      `${API_BASE_URL}/provider-profiles/${providerId}/services/${serviceId}/approve`,
      {
        method: 'PATCH',
        headers: {Authorization: `Bearer ${localStorage.getItem('token')}`},
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      alert(err?.message || "Approve failed");
      return;
    }

    alert("Service approved successfully");

    removeServiceFromUI(providerId, serviceId);

  } catch (err) {
    console.error("Approve error:", err);
    // If optimistic update fails, fall back to full refresh
    await fetchProviders();
  } finally {
    isServiceActionLoading.value = false;
  }
}

const rejectService = async (providerId: string, serviceId: string) => {
  try {
    isServiceActionLoading.value = true;

    const res = await fetch(
      `${API_BASE_URL}/provider-profiles/${providerId}/services/${serviceId}/reject`, // Fixed: changed from 'approve' to 'reject'
      {
        method: 'PATCH',
        body: JSON.stringify({reason: rejectReason.value}),
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      alert(err?.message || "Reject failed");
      return;
    }

    alert("Service rejected successfully");

    removeServiceFromUI(providerId, serviceId);
    showRejectModal.value = false;

  } catch (err) {
    console.error("Reject error:", err);
    // If optimistic update fails, fall back to full refresh
    await fetchProviders();
  } finally {
    isServiceActionLoading.value = false;
  }
}

// Helper function to remove service from UI without full refresh
const removeServiceFromUI = (providerId: string, serviceId: string) => {
  // Find the provider
  const providerIndex = providers.value.findIndex(p => p._id === providerId);
  if (providerIndex !== -1) {
    const provider = providers.value[providerIndex];

    // Remove the service from the provider's services array
    if (provider.services) {
      const serviceIndex = provider.services.findIndex((s: any) => s._id === serviceId);
      if (serviceIndex !== -1) {
        provider.services.splice(serviceIndex, 1);

        // Update the providers array to trigger reactivity
        providers.value = [...providers.value];

        // Update pending services count
        updatePendingServicesCount();
      }
    }
  }
}

const providerReviews = computed(() => {
  if (!selectedProvider.value?.reviews) return []
  // Only show reviews where the revieweeRole is "provider"
  return selectedProvider.value.reviews.filter(
    (r: any) => r.revieweeRole === "provider"
  )
})
window.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (!target.closest("td")) openMenuId.value = null;
});
onMounted(fetchProviders)
</script>
