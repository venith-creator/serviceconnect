<template>
  <AdminDashboardLayout>
    <div class="p-6 max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-purple-700">
          Proposals for: {{ jobTitle }}
        </h1>

        <button
          @click="goBack"
          class="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition"
        >
          ← Back to Jobs
        </button>
      </div>

      <!-- Proposals -->
      <div v-if="proposals.length" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="proposal in proposals"
          :key="proposal._id"
          class="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition p-5 space-y-4"
        >
          <!-- Header -->
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
                'bg-gray-100 text-gray-600': proposal.status === 'withdrawn'
              }"
            >
              {{ proposal.status }}
            </span>
          </div>

          <!-- Proposal Details -->
          <p class="text-gray-600 text-sm italic line-clamp-3">
            "{{ proposal.message }}"
          </p>

          <div class="text-sm text-gray-700 space-y-1">
            <p><strong>Price:</strong> ${{ proposal.price || 0 }}</p>
            <p><strong>Timeline:</strong> {{ proposal.timelineEstimate || "N/A" }}</p>
          </div>

          <div class="pt-2 border-t text-sm text-gray-500">
            <p><strong>Headline:</strong> {{ proposal.provider?.headline || "N/A" }}</p>
            <p>
              <strong>Services:</strong>
              {{
                proposal.provider?.services?.length
                  ? proposal.provider.services.map((s: any) => s.category || s).join(', ')
                  : 'N/A'
              }}
            </p>

          </div>

          <!-- Admin View Button -->
          <button
            @click="openDetails(proposal)"
            class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md w-full text-sm mt-3"
          >
            View Full Details
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <p class="text-gray-500 text-lg">No proposals found for this job.</p>
      </div>

      <!-- Modal -->
      <div
        v-if="selectedProposal"
        class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      >
        <div class="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 space-y-4 relative">
          <button
            @click="selectedProposal = null"
            class="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
          >
            ×
          </button>

          <h2 class="text-xl font-semibold text-purple-700">
            Proposal by {{ selectedProposal.provider?.user?.name }}
          </h2>

          <div class="text-sm text-gray-700 space-y-2">
            <p><strong>Status:</strong> {{ selectedProposal.status }}</p>
            <p><strong>Price:</strong> ${{ selectedProposal.price }}</p>
            <p><strong>Timeline:</strong> {{ selectedProposal.timelineEstimate }}</p>
            <p><strong>Message:</strong> {{ selectedProposal.message }}</p>

            <!-- ✅ Fixed headline and services here -->
            <p><strong>Headline:</strong>
              {{ typeof selectedProposal.provider?.headline === 'object'
                  ? selectedProposal.provider?.headline?.title || 'N/A'
                  : selectedProposal.provider?.headline || 'N/A' }}
            </p>

            <div v-if="selectedProposal.provider?.services?.length" class="mt-2 space-y-1">
              <div
                v-for="(srv, i) in selectedProposal.provider.services"
                :key="i"
                class="flex justify-between text-sm text-gray-600"
              >
                <span>{{ srv.category || 'N/A' }}</span>
                <span>{{ srv.rate ? `$${srv.rate}` : 'N/A' }} • {{ srv.availability || '-' }}</span>
              </div>
            </div>
            <p>
              <strong>Client:</strong>
              {{ selectedProposal.job?.client?.name }} ({{ selectedProposal.job?.client?.email }})
            </p>
          </div>
        </div>
      </div>
    </div>
  </AdminDashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AdminDashboardLayout from "@/components/AdminDashboardLayout.vue";
import { API_BASE_URL } from "@/config";

const proposals = ref<any[]>([]);
const jobTitle = ref("Loading...");
const selectedProposal = ref<any | null>(null);

const route = useRoute();
const router = useRouter();
const jobId = route.params.jobId as string;

const fetchProposals = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/proposals/job/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch proposals");

    const data = await res.json();
    proposals.value = data;
    jobTitle.value = data[0]?.job?.title || "Job";
  } catch (err) {
    console.error("❌ Error fetching proposals:", err);
  }
};

const openDetails = (proposal: any) => {
  selectedProposal.value = proposal;
};

const goBack = () => {
  router.push("/dashboard/admin/ManageJobs");
};

onMounted(fetchProposals);
</script>

<style scoped>
.line-clamp-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
