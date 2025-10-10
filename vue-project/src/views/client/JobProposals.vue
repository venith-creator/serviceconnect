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
            <p><strong>Headline:</strong> {{ proposal.provider?.headline }}</p>
            <p><strong>Services:</strong> {{ proposal.provider?.services?.join(', ') }}</p>
          </div>

          <div v-if="proposal.status === 'pending'" class="pt-3">
            <button
              @click="acceptProposal(proposal._id)"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md w-full"
            >
              Accept Proposal
            </button>
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

onMounted(fetchProposals);
</script>
