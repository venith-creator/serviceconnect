<template>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <h1 class="text-2xl font-bold text-purple-600 mb-4">My Proposals</h1>

      <!-- Loading State -->
      <div v-if="loading" class="text-gray-500 text-center py-10">
        Loading your proposals...
      </div>

      <!-- No proposals -->
      <div v-else-if="!proposals.length" class="text-gray-500 text-center py-10">
        You haven’t sent any proposals yet.
      </div>

      <!-- Proposals Table -->
      <div v-else class="overflow-x-auto bg-white rounded-lg shadow border border-gray-100">
        <table class="min-w-full text-left text-sm text-gray-700">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="py-3 px-4">Job Title</th>
              <th class="py-3 px-4">Price (£)</th>
              <th class="py-3 px-4">Timeline</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="proposal in proposals"
              :key="proposal._id"
              class="border-b hover:bg-gray-50"
            >
              <td class="py-3 px-4 font-medium text-gray-800">
                {{ proposal.job?.title || "Unknown Job" }}
              </td>
              <td class="py-3 px-4">£{{ proposal.price }}</td>
              <td class="py-3 px-4">{{ proposal.timelineEstimate }}</td>
              <td class="py-3 px-4">
                <span
                  class="px-3 py-1 rounded-full text-xs font-semibold"
                  :class="{
                    'bg-yellow-100 text-yellow-700': proposal.status === 'pending',
                    'bg-green-100 text-green-700': proposal.status === 'accepted',
                    'bg-red-100 text-red-700': proposal.status === 'rejected',
                    'bg-gray-100 text-gray-600': proposal.status === 'withdrawn',
                    'bg-blue-100 text-blue-700': proposal.status === 'completed'
                  }"
                >
                  {{ proposal.status }}
                </span>
              </td>
              <td class="py-3 px-4 text-right space-x-2">
                <button
                  v-if="proposal.status === 'pending'"
                  @click="withdrawProposal(proposal._id)"
                  class="text-red-600 hover:underline"
                >
                  Withdraw
                </button>
                <button
                  v-else-if="proposal.status === 'accepted'"
                  @click="goToChat(proposal)"
                  class="text-purple-600 hover:underline"
                >
                  Open Chat
                </button>
                <button
                v-else-if="proposal.status === 'completed'"
                 @click="leaveReview(proposal)"
                class="text-blue-600 hover:underline"
              >
                Leave a Review
              </button>

              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
//import ProviderDashboardLayout from "@/components/ProviderDashboardLayout.vue";
import { API_BASE_URL } from "@/config";
import { useRouter } from "vue-router";

const router = useRouter();
const proposals = ref<any[]>([]);
const loading = ref(true);

// ✅ Fetch proposals from backend
const fetchProposals = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first.");
      return;
    }

    const res = await fetch(`${API_BASE_URL}/proposals/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch proposals");

    proposals.value = await res.json();
  } catch (err: any) {
    console.error("❌ Error fetching proposals:", err);
    alert(err.message || "Error fetching proposals");
  } finally {
    loading.value = false;
  }
};

// ✅ Withdraw a proposal
const withdrawProposal = async (id: string) => {
  if (!confirm("Are you sure you want to withdraw this proposal?")) return;

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/proposals/${id}/withdraw`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to withdraw proposal");

    await res.json();
    alert("Proposal withdrawn successfully");
    proposals.value = proposals.value.map((p) =>
      p._id === id ? { ...p, status: "withdrawn" } : p
    );
  } catch (err: any) {
    console.error("❌ Error withdrawing proposal:", err);
    alert(err.message || "Error withdrawing proposal");
  }
};

const goToChat = async (proposal: any) => {
  try {
    const clientId =
      proposal.job?.client?._id ||
      proposal.job?.client ||
      proposal.job?.createdBy?._id ||
      proposal.job?.createdBy ||
      null;

    const providerId =
      proposal.provider?.user?._id ||
      proposal.provider?.user ||
      proposal.provider?._id ||
      null;

    console.log("🔍 goToChat participants:", { clientId, providerId });

    if (!clientId || !providerId) {
      alert("Unable to open chat — missing participant information.");
      console.error("❌ Missing participant IDs:", { clientId, providerId });
      return;
    }

    const body = { participants: [clientId, providerId], jobId: proposal.job._id };

    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/chats/room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error("Failed to create or get chat room");
    const room = await res.json();

    router.push({
      name: "providerDashboardManageschats",
      query: { roomId: room._id },
    });
  } catch (err: any) {
    console.error("❌ Chat error:", err);
    alert(err.message || "Error opening chat");
  }
};
const leaveReview = (proposal: any) => {
  const jobId = proposal.job?._id;
  const clientId =
    proposal.job?.client?._id || proposal.job?.client || null;

  if (!jobId || !clientId) {
    alert("Missing job or client info.");
    return;
  }

  router.push({
    name: "ProviderDashboardManagesReview",
    query: { jobId, clientId },
  });
};


onMounted(fetchProposals);
</script>
