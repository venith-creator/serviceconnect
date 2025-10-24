<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Back button -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <button
        @click="$router.go(-1)"
        class="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon class="h-5 w-5 mr-2" />
        Back to Jobs
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error loading job details</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ error }}</p>
            </div>
            <div class="mt-4">
              <button
                @click="fetchJobDetails"
                class="bg-red-100 text-red-800 px-3 py-2 rounded text-sm font-medium hover:bg-red-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Job Details -->
    <div v-else-if="job" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <!-- Header -->
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ job.title }}</h1>
              <div class="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div class="mt-2 flex items-center text-sm text-gray-500">
                  <MapPinIcon class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  {{ job.location?.address || 'Location not specified' }}
                </div>
                <div v-if="job.category" class="mt-2 flex items-center text-sm text-gray-500">
                  <TagIcon class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  {{ job.category }}
                </div>
                <div v-if="job.timelineStart" class="mt-2 flex items-center text-sm text-gray-500">
                  <CalendarIcon class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  Posted {{ formatTimeAgo(job.createdAt) }}
                </div>
              </div>
            </div>
            <div class="mt-4 sm:mt-0">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  job.status === 'open' ? 'bg-green-100 text-green-800' :
                  job.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                  job.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                  job.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                ]"
              >
                {{ job.status || 'open' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Job Content -->
        <div class="px-4 py-5 sm:p-6">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Main Content -->
            <div class="lg:col-span-2">
              <div class="prose max-w-none">
                <h3 class="text-lg font-medium text-gray-900">Job Description</h3>
                <div class="mt-4 text-gray-600 whitespace-pre-line">{{ job.description }}</div>
              </div>

              <!-- Timeline -->
              <div class="mt-8">
                <h3 class="text-lg font-medium text-gray-900">Timeline</h3>
                <div class="mt-4">
                  <div class="flex items-center">
                    <CalendarIcon class="h-5 w-5 text-gray-400 mr-2" />
                    <span class="text-gray-700">
                      <span v-if="job.timelineStart">{{ formatDate(job.timelineStart) }}</span>
                      <span v-if="job.timelineEnd"> to {{ formatDate(job.timelineEnd) }}</span>
                      <span v-else-if="!job.timelineStart">Flexible</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Attachments -->
              <div v-if="job.attachments?.length" class="mt-8">
                <h3 class="text-lg font-medium text-gray-900">Attachments</h3>
                <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div
                    v-for="(attachment, index) in job.attachments"
                    :key="index"
                    @click="viewAttachment(attachment)"
                    class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary cursor-pointer"
                  >
                    <div class="flex-shrink-0">
                      <DocumentIcon class="h-10 w-10 text-gray-400" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <span class="absolute inset-0" aria-hidden="true" />
                      <p class="text-sm font-medium text-gray-900 truncate">
                        {{ attachment.name || 'Attachment ' + (index + 1) }}
                      </p>
                      <p class="text-sm text-gray-500 truncate">
                        {{ formatFileSize(attachment.size) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="lg:col-span-1">
              <div class="bg-gray-50 p-6 rounded-lg">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Job Details</h3>

                <div class="space-y-4">
                  <div v-if="job.budget">
                    <h4 class="text-sm font-medium text-gray-500">Budget</h4>
                    <p class="mt-1 text-lg font-medium text-gray-900">£{{ job.budget.toLocaleString() }}</p>
                  </div>

                  <div v-if="job.skillsRequired?.length">
                    <h4 class="text-sm font-medium text-gray-500">Skills Required</h4>
                    <div class="mt-2 flex flex-wrap gap-2">
                      <span
                        v-for="(skill, index) in job.skillsRequired"
                        :key="index"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                      >
                        {{ skill }}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 class="text-sm font-medium text-gray-500">Posted</h4>
                    <p class="mt-1 text-sm text-gray-900">{{ formatDate(job.createdAt) }}</p>
                  </div>

                  <div v-if="job.updatedAt">
                    <h4 class="text-sm font-medium text-gray-500">Last Updated</h4>
                    <p class="mt-1 text-sm text-gray-900">{{ formatDate(job.updatedAt) }}</p>
                  </div>
                </div>

                <div class="mt-6">
                  <button
                    @click="applyForJob"
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Apply for this Job
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeftIcon,
  MapPinIcon,
  TagIcon,
  CalendarIcon,
  DocumentIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';
import {API_BASE_URL} from "@/config.js";

const route = useRoute();
const router = useRouter();
const jobId = route.params.id;

const job = ref(null);
const isLoading = ref(true);
const error = ref(null);

// Fetch job details
const fetchJobDetails = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const url = `${API_BASE_URL}/jobs/${jobId}/all`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch job details: ${response.statusText}`);
    }

    job.value = await response.json();

  } catch (err) {
    console.error('Error fetching job details:', err);
    error.value = err.response?.data?.message || 'Failed to load job details. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Format time ago
const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `${interval} years ago`;
  if (interval === 1) return '1 year ago';

  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `${interval} months ago`;
  if (interval === 1) return '1 month ago';

  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} days ago`;
  if (interval === 1) return '1 day ago';

  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval} hours ago`;
  if (interval === 1) return '1 hour ago';

  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval} minutes ago`;
  if (interval === 1) return '1 minute ago';

  return 'just now';
};

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// View attachment
const viewAttachment = (attachment) => {
  if (attachment.url) {
    window.open(attachment.url, '_blank');
  }
};

// Apply for job
const applyForJob = () => {
  // Implement job application logic
  alert('Job application functionality will be implemented here');
};

// Initialize component
onMounted(() => {
  fetchJobDetails();
});
</script>

<style scoped>
.prose {
  max-width: 100%;
}
</style>
