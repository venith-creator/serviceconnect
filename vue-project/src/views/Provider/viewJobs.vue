<template>
    <div class="p-6 space-y-6">

      <!-- Header -->
      <h1 class="text-2xl font-bold text-purple-600 mb-4">Available Jobs</h1>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3 items-center">
        <input
          v-model="filters.keyword"
          @keyup.enter="applyFilters"
          type="text"
          placeholder="Search by title..."
          class="border rounded-md px-3 py-2 text-sm w-full sm:w-64"
        />

        <select
          v-model="filters.category"
          @change="applyFilters"
          class="border rounded-md px-3 py-2 text-sm w-full sm:w-48"
        >
          <option value="">All Categories</option>
          <option>Plumbing</option>
          <option>Electrician</option>
          <option>painter</option>
          <option>Carpenter</option>
        </select>

        <input
          v-model="filters.location"
          @keyup.enter="applyFilters"
          type="text"
          placeholder="Filter by location..."
          class="border rounded-md px-3 py-2 text-sm w-full sm:w-48"
        />

        <select
          v-model="filters.status"
          @change="applyFilters"
          class="border rounded-md px-3 py-2 text-sm w-full sm:w-48"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button
          @click="findNearbyJobs"
          class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
        >
          Find Jobs Near Me
        </button>
      </div>

      <!-- Job Feed -->
      <div
        v-if="jobs.length"
        class="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto"
      >
        <div
          v-for="job in paginatedJobs"
          :key="job._id"
          class="bg-white rounded-lg shadow p-6 text-left space-y-3 border border-gray-100"
        >
          <div class="flex justify-between items-center">
            <h3 class="font-semibold text-lg text-gray-800">{{ job.title }}</h3>
            <span
              class="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full"
              >{{ job.status || "open" }}</span
            >
          </div>

          <p class="text-gray-600 text-sm line-clamp-3">
            {{ job.description }}
          </p>

          <div class="text-gray-500 text-sm space-y-1">
            <p>
              <i class="fa fa-map-marker"></i>
              {{ job.location?.address || job.city || job.country || "Not specified" }}
            </p>

            <p class="flex items-center justify-between text-sm text-gray-700">
              <span class="flex items-center gap-1">
                <CurrencyPoundIcon class="w-4 h-4 text-green-600" />
                <strong>£{{ job.budget }}</strong>
              </span>

              <span class="flex items-center gap-1 text-gray-500">
                <ClockIcon class="w-4 h-4" />
                {{ formatDate(job.timelineStart) }} → {{ formatDate(job.timelineEnd) }}
              </span>
            </p>
          </div>

          <button
            @click="openProposalModal(job)"
            :disabled="job.status?.toLowerCase() !== 'open' || hasAppliedToJob(job._id) "
            class="transition text-white px-4 py-2 rounded-lg mx-auto block w-full
            disabled:bg-gray-400 disabled:cursor-not-allowed
            bg-purple-600 hover:bg-purple-700 text-white
            disabled:bg-white disabled:border disabled:border-purple-600 disabled:text-purple-600"
          >
           {{
            hasAppliedToJob(job._id)
            ? 'Applied'
            :  getJobButtonText(job) }}
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="jobs.length" class="flex justify-center mt-6 space-x-2">
        <button
          @click="prevPage"
          :disabled="page === 1"
          class="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span class="px-2 py-1 text-gray-600">Page {{ page }}</span>
        <button
          @click="nextPage"
          :disabled="page * perPage >= jobs.length"
          class="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <!-- Empty -->
      <div v-else class="text-center py-10 text-gray-500">
        No jobs available right now.
      </div>

      <!-- Proposal Modal -->
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4">
          <h2 class="text-lg font-semibold text-purple-700">
            Send Quote for: {{ selectedJob?.title }}
          </h2>

          <form @submit.prevent="submitProposal">
            <div class="space-y-3">
              <div>
                <label class="block text-sm text-gray-600">Message</label>
                <textarea
                  v-model="proposalForm.message"
                  rows="3"
                  required
                  class="w-full border rounded-md p-2 text-sm"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm text-gray-600">Proposed Price</label>
                <input
                  v-model="proposalForm.price"
                  type="number"
                  min="0"
                  required
                  class="w-full border rounded-md p-2 text-sm"
                />
              </div>

              <div>
                <label class="block text-sm text-gray-600">Timeline Estimate</label>
                <input
                  v-model="proposalForm.timelineEstimate"
                  type="text"
                  placeholder="e.g. 2 weeks"
                  required
                  class="w-full border rounded-md p-2 text-sm"
                />
              </div>
            </div>

            <div class="flex justify-end mt-4 gap-2">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
              >
                Submit Proposal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
//import ProviderDashboardLayout from "@/components/ProviderDashboardLayout.vue";
import { API_BASE_URL } from "@/config";
import { CurrencyPoundIcon, ClockIcon } from "@heroicons/vue/24/outline";

interface Job {
  _id: string;
  title: string;
  description: string;
  location?: {
    type: string;
    coordinates: number[];
    address: string;
  };
  city?: string;
  country?: string;
  category: string;
  budget: number;
  status: string;
  timelineStart?: string;
  timelineEnd?: string;
}

interface Filters {
  keyword: string;
  category: string;
  location: string;
  status?: string;
}

const jobs = ref<Job[]>([]);
const myProposals = ref<any[]>([]);
const filters = ref<Filters>({ keyword: "", category: "", location: "" , status: ""});
const showModal = ref(false);
const selectedJob = ref<Job | null>(null);
const proposalForm = ref({ message: "", price: "", timelineEstimate: "" });

const page = ref(1);
const perPage = 6;

const hasAppliedToJob = (jobId: string) => {
  return myProposals.value.some((p) => p.job?._id === jobId);
};

const getJobButtonText = (job: Job) => {
  const status = job.status?.toLowerCase();
  if (status === "open") return "Send Quote";
  if (status === "active") return "Already Taken";
  if (status === "cancelled") return "Cancelled";
  if (status === "completed") return "Completed";
  return "Unavailable";
};


// ✅ FRONTEND FILTERING
const filteredJobs = computed(() => {
  return jobs.value.filter((job) => {
    const matchKeyword =
      job.title?.toLowerCase().includes(filters.value.keyword.toLowerCase()) ||
      job.description?.toLowerCase().includes(filters.value.keyword.toLowerCase());

    const matchCategory =
      !filters.value.category || job.category === filters.value.category;

    const matchLocation =
      !filters.value.location ||
      (job.location?.address &&
        job.location.address
          .toLowerCase()
          .includes(filters.value.location.toLowerCase()));

    const matchStatus =
      !filters.value.status ||
      job.status?.toLowerCase() === filters.value.status.toLowerCase();

    return matchKeyword && matchCategory && matchLocation && matchStatus;
  });
});

// Pagination
const paginatedJobs = computed(() => {
  const start = (page.value - 1) * perPage;
  return filteredJobs.value.slice(start, start + perPage);
});

const nextPage = () => {
  if (page.value * perPage < filteredJobs.value.length) page.value++;
};
const prevPage = () => {
  if (page.value > 1) page.value--;
};

// Modal handling
const openProposalModal = (job: Job) => {
  selectedJob.value = job;
  showModal.value = true;
};
const closeModal = () => {
  showModal.value = false;
  proposalForm.value = { message: "", price: "", timelineEstimate: "" };
};

// 📍 Nearby Jobs (still backend)
const findNearbyJobs = async () => {
  try {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const query = new URLSearchParams({
        lat: latitude.toString(),
        lon: longitude.toString(),
        maxDistance: "20000",
      });

      const res = await fetch(`${API_BASE_URL}/jobs?${query.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch nearby jobs");
      jobs.value = await res.json();
      page.value = 1;
    });
  } catch (err: any) {
    alert(err.message || "Could not fetch nearby jobs");
  }
};

const fetchMyProposals = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(`${API_BASE_URL}/proposals/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch proposals");

    const data = await res.json();
    myProposals.value = data;
  } catch (err) {
    console.error("❌ Error fetching proposals:", err);
  }
};


// 📨 Proposal submission
const submitProposal = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in first");

    const res = await fetch(`${API_BASE_URL}/proposals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        jobId: selectedJob.value?._id,
        ...proposalForm.value,
      }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Failed to submit proposal");
    alert("Proposal sent successfully!");
    closeModal();
  } catch (err: any) {
    alert(err.message || "Error submitting proposal");
  }
};

// 🌐 Fetch jobs once on load
const fetchJobs = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs`);
    if (!res.ok) throw new Error("Failed to fetch jobs");
    jobs.value = await res.json();
  } catch (err) {
    console.error("❌ Error fetching jobs:", err);
  }
};

const applyFilters = () => {
  page.value = 1; // optional reset to first page when user filters
};


const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : "N/A");

onMounted(async () => {
  await fetchJobs();
  await fetchMyProposals();
});
</script>
