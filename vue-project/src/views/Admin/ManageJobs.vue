<template>
  <AdminDashboardLayout>
    <div class="p-6 space-y-8">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-purple-700">Manage All Jobs</h1>
      </div>

      <!-- Jobs Grid -->
      <div v-if="jobs.length" class="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="job in jobs"
          :key="job._id"
          class="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between"
        >
          <div>
            <!-- Title + Status -->
            <div class="flex justify-between items-center mb-2">
              <h2 class="text-lg font-semibold text-gray-900">{{ job.title }}</h2>
              <span
                class="text-xs font-medium px-3 py-1 rounded-full"
                :class="{
                  'bg-green-100 text-green-700': job.status === 'completed' || job.status === 'active',
                  'bg-yellow-100 text-yellow-700': job.status === 'open' || job.status === 'taken',
                  'bg-red-100 text-red-700': job.status === 'cancelled',
                  'bg-gray-100 text-gray-700': !job.status
                }"
              >
                {{ job.status }}
              </span>
            </div>

            <p class="text-gray-600 text-sm mb-4 line-clamp-3">
              {{ job.description }}
            </p>

            <div class="text-sm text-gray-700 space-y-1">
              <p><strong>Client:</strong> {{ job.client?.name || 'N/A' }}</p>
              <p><strong>Provider:</strong> {{ job.assignedProvider?.user?.name || 'Unassigned' }}</p>
              <p><strong>Category:</strong> {{ job.category || 'N/A' }}</p>
              <p><strong>Location:</strong> {{ job.location?.address || 'N/A' }}</p>
              <p><strong>Budget:</strong> ${{ job.budget || 0 }}</p>
              <p>
                <strong>Timeline:</strong>
                {{ formatDate(job.timelineStart) }} →
                {{ formatDate(job.timelineEnd) }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-between items-center mt-5">
            <button
              @click="viewProposals(job._id)"
              class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition transform hover:-translate-y-0.5"
            >
              View Proposals
            </button>
            <div class="flex gap-2">
              <button
                @click="forceComplete(job._id)"
                class="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-xs font-semibold shadow-sm transition"
              >
                Force Complete
              </button>
              <button
                @click="cancelJob(job._id)"
                class="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-xs font-semibold shadow-sm transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <p class="text-gray-600 text-lg">No jobs found.</p>
      </div>
    </div>
  </AdminDashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import AdminDashboardLayout from "@/components/AdminDashboardLayout.vue";
import { API_BASE_URL } from "@/config";
import { useRouter } from "vue-router";

const jobs = ref<any[]>([]);
const router = useRouter();

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString();
};

const fetchJobs = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/jobs/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch jobs");
    jobs.value = await res.json();
  } catch (err) {
    console.error("❌ Error fetching admin jobs:", err);
  }
};

const viewProposals = (jobId: string) => {
  router.push(`/dashboard/admin/job/${jobId}/proposals`);
};

const forceComplete = async (id: string) => {
  if (!confirm("Mark this job as completed?")) return;
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/jobs/${id}/force-complete`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to force complete");
    alert("✅ Job marked as completed");
    fetchJobs();
  } catch (err) {
    console.error("Error:", err);
  }
};

const cancelJob = async (id: string) => {
  if (!confirm("Cancel this job?")) return;
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/jobs/${id}/cancel`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to cancel");
    alert("🚫 Job cancelled");
    fetchJobs();
  } catch (err) {
    console.error("Error:", err);
  }
};

onMounted(fetchJobs);
</script>

<style scoped>
.line-clamp-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>

