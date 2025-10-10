<template>
  <ClientDashboardLayout>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-purple-600">Manage Jobs</h1>
        <button
          @click="$router.push('/post-job')"
          class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
        >
          + Post New Job
        </button>
      </div>

      <!-- Job List -->
      <div v-if="jobs.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="job in jobs"
          :key="job._id"
          class="border rounded-xl shadow-sm p-5 bg-white hover:shadow-md transition"
        >
          <!-- Title -->
          <h2 class="text-lg font-semibold text-gray-800 mb-2">{{ job.title }}</h2>
          <p class="text-sm text-gray-600 mb-3">{{ job.description.slice(0, 100) }}...</p>

          <!-- Info Grid -->
          <div class="text-sm text-gray-700 space-y-1 mb-4">
            <p><strong>Category:</strong> {{ job.category }}</p>
            <p><strong>Location:</strong> {{ job.location?.address || "N/A" }}</p>
            <p><strong>Budget:</strong> ${{ job.budget }}</p>
            <p><strong>Status:</strong>
              <span
                :class="{
                  'text-green-600': job.status === 'active',
                  'text-yellow-600': job.status === 'pending',
                  'text-gray-500': job.status === 'draft',
                  'text-red-600': job.status === 'cancelled',
                }"
              >
                {{ job.status || 'pending' }}
              </span>
            </p>
            <p><strong>Timeline:</strong> {{ formatDate(job.timelineStart) }} → {{ formatDate(job.timelineEnd) }}</p>
          </div>

          <!-- Attachments -->
          <div v-if="job.attachments?.length" class="mb-4">
            <p class="text-sm font-semibold text-gray-800 mb-1">Attachments:</p>
            <div class="flex flex-wrap gap-2">
              <a
                v-for="(file, i) in job.attachments"
                :key="i"
                :href="file.url"
                target="_blank"
                class="text-xs text-purple-600 hover:underline border border-purple-200 px-2 py-1 rounded"
              >
                View File {{ i + 1 }}
              </a>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex justify-between items-center mt-4">
            <button
              @click="viewProposals(job._id)"
              class="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
            >
              View Proposals
            </button>
            <button
              @click="deleteJob(job._id)"
              class="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <p class="text-gray-600">You haven’t posted any jobs yet.</p>
        <button
          @click="$router.push('/post-job')"
          class="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-lg"
        >
          Post Your First Job
        </button>
      </div>
    </div>
  </ClientDashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import ClientDashboardLayout from "@/components/ClientDashboardLayout.vue";
import { API_BASE_URL } from "@/config";
import { useRouter } from "vue-router";
const router = useRouter();

interface Job {
  _id: string;
  title: string;
  description: string;
  category: string;
  location?: {
    type: string;
    coordinates: number[];
    address: string;
  };
  budget: number;
  status: "open" | "taken" | "active" | "completed" | "cancelled" | "pending" | "draft";
  timelineStart?: string;
  timelineEnd?: string;
  attachments?: { url: string }[];
}
const jobs = ref<Job[]>([]);

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString();
};

const fetchJobs = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/jobs/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch jobs");
    jobs.value = await res.json();
  } catch (err) {
    console.error("❌ Error fetching jobs:", err);
  }
};

const viewProposals = (jobId: string) => {
  // Redirect to a proposals page for that job
  // (You can build /client/job/:id/proposals next)
  router.push(`/dashboard/client/job/${jobId}/proposals`);
};

const deleteJob = async (id: string) => {
  if (!confirm("Are you sure you want to delete this job?")) return;
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete job");
    jobs.value = jobs.value.filter((j) => j._id !== id);
    alert("Job deleted successfully");
  } catch (err: any) {
    console.error("❌ Error deleting job:", err);
    alert(err.message || "An error occured");
  }
};

onMounted(fetchJobs);
</script>
