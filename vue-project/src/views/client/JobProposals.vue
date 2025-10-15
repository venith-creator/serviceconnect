<template>
  <ClientDashboardLayout>
    <div class="p-6 max-w-6xl mx-auto space-y-6">
      <h1 class="text-2xl font-bold text-purple-600">
        Proposals for: {{ jobTitle }}
      </h1>

      <!-- Proposals List -->
      <div
        v-if="proposals.length"
        class="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="proposal in proposals"
          :key="proposal._id"
          class="bg-white border rounded-xl shadow-sm p-5 space-y-3 hover:shadow-md transition"
        >
          <div class="flex justify-between items-center">
            <h3 class="font-semibold text-lg text-gray-800">
              {{ proposal.provider?.user?.name }}
            </h3>
            <span
              class="text-xs font-medium px-2 py-1 rounded-full"
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
          </div>

          <p class="text-gray-600 text-sm italic">
            "{{ proposal.message }}"
          </p>

          <div class="text-sm text-gray-700 space-y-1">
            <p><strong>Price:</strong> ${{ proposal.price }}</p>
            <p><strong>Timeline:</strong> {{ proposal.timelineEstimate }}</p>
          </div>

          <div class="pt-2 border-t text-sm text-gray-500">
            <p><strong>Headline:</strong>
              {{ typeof proposal.provider?.headline === 'object'
                  ? proposal.provider?.headline?.title || 'N/A'
                  : proposal.provider?.headline || 'N/A' }}
            </p>
            <p><strong>Services:</strong>
              <span v-if="Array.isArray(proposal.provider?.services)">
                {{ proposal.provider.services.map((s: any) => s.category || s).join(', ') }}
              </span>
              <span v-else>
                {{ proposal.provider?.services || 'N/A' }}
              </span>
            </p>
          </div>

         <div class="pt-3">
          <!-- Accept button for pending -->
          <button
            v-if="proposal.status === 'pending'"
            @click="acceptProposal(proposal._id)"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md w-full"
          >
            Accept Proposal
          </button>

          <!-- For accepted jobs -->
        <div v-else-if="proposal.status === 'accepted'" class="space-y-2">
          <button
            @click="goToChat(proposal)"
            class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md w-full"
          >
            💬 Chat with Provider
          </button>

          <button
            @click="markJobCompleted(proposal.job._id)"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md w-full"
          >
            ✅ Mark as Completed
          </button>
        </div>
        <!-- For completed jobs -->
        <div v-else-if="proposal.status === 'completed'" class="space-y-2">
          <p class="text-blue-600 font-semibold text-center">✅ Job Completed</p>

          <button
            @click="leaveReview(proposal)"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full"
          >
            ⭐ Leave a Review
          </button>
        </div>
        </div>

        </div>
      </div>

      <div v-else class="text-gray-500 text-center py-12">
        No proposals yet for this job.
      </div>
    </div>
  </ClientDashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import ClientDashboardLayout from "@/components/ClientDashboardLayout.vue";
import { API_BASE_URL } from "@/config";
import { useRouter } from "vue-router";
const router = useRouter();

const route = useRoute();
const jobId = route.params.jobId as string;
const proposals = ref<any[]>([]);
const jobTitle = ref("");

const fetchProposals = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/proposals/job/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch proposals");
    const data = await res.json();
    proposals.value = data;

    // extract title from first proposal if exists
    jobTitle.value = data[0]?.job?.title || "Job";
  } catch (err) {
    console.error("❌ Error fetching proposals:", err);
  }
};

const acceptProposal = async (proposalId: string) => {
  if (!confirm("Accept this proposal and assign provider?")) return;

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/proposals/${proposalId}/accept`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to accept proposal");
    alert("Proposal accepted successfully!");

    await fetchProposals();
  } catch (err: any) {
    alert(err.message || "Error accepting proposal");
  }
};
const goToChat = async (proposal: any) => {
  try {
    const token = localStorage.getItem("token");

    // Extract participant IDs safely
    const clientId =
      proposal.job?.client?._id ||
      proposal.job?.client ||
      null;

    const providerId =
      proposal.provider?.user?._id ||
      proposal.provider?.user ||
      proposal.provider?._id ||
      null;

    console.log("🔍 goToChat participants:", { clientId, providerId });

    if (!clientId || !providerId) {
      alert("Unable to open chat — missing participant information.");
      console.error("❌ Missing IDs:", { clientId, providerId });
      return;
    }

    const body = { participants: [clientId, providerId], jobId: proposal.job._id };

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
      name: "ClientDashboardManageschat",
      query: { roomId: room._id },
    });
  } catch (err: any) {
    console.error("❌ Chat error:", err);
    alert(err.message || "Error opening chat");
  }
};
const markJobCompleted = async (jobId: string) => {
  if (!confirm("Are you sure you want to mark this job as completed?")) return;

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/complete`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to mark job as completed");

    alert("✅ Job marked as completed!");
    await fetchProposals(); // refresh proposals
  } catch (err: any) {
    console.error("❌ Error completing job:", err);
    alert(err.message || "Error marking job completed");
  }
};
const leaveReview = (proposal: any) => {
  const jobId = proposal.job?._id;
  const providerId =
    proposal.provider?.user?._id ||
    proposal.provider?.user ||
    proposal.provider?._id;

  if (!jobId || !providerId) {
    alert("Missing job or provider information.");
    return;
  }

  router.push({
    name: "ClientDashboardManagesReviews",
    query: { jobId, providerId },
  });
};


onMounted(fetchProposals);
</script>
