<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900">Available Jobs</h1>
        <p class="mt-2 text-sm text-gray-600">Find and apply for jobs in your area</p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Search and Filter -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Search Input -->
          <div class="flex-1">
            <label for="search" class="sr-only">Search jobs</label>
            <div class="relative">
              <input
                type="text"
                id="search"
                v-model="searchQuery"
                @input="handleSearch"
                placeholder="Search jobs by title or description..."
                class="w-full border border-gray-300 rounded-md py-2 pl-4 pr-10 focus:ring-primary focus:border-primary"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <!-- Category Filter -->
          <div class="w-full md:w-64">
            <label for="category" class="sr-only">Category</label>
            <select
              id="category"
              v-model="filters.category"
              @change="applyFilters"
              class="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:ring-primary focus:border-primary"
            >
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>

          <!-- Location Filter -->
          <div class="w-full md:w-64">
            <label for="location" class="sr-only">Location</label>
            <input
              type="text"
              id="location"
              v-model="filters.location"
              @input="debouncedApplyFilters"
              placeholder="Enter location..."
              class="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:ring-primary focus:border-primary"
            />
          </div>

          <!-- Use My Location Button -->
          <div class="w-full md:w-auto">
            <button
              @click="useCurrentLocation"
              :disabled="isGettingLocation"
              class="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              <span v-if="isGettingLocation">Getting Location...</span>
              <span v-else>📍 Use My Location</span>
            </button>
          </div>
        </div>

        <!-- Status and Active Filters -->
        <div class="mt-4 flex items-center flex-wrap gap-2">
          <!-- Always show Open status -->
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            Status: Open
          </span>

          <!-- Other active filters -->
          <template v-if="hasActiveFilters">
            <span
              v-for="(value, key) in activeFilters"
              :key="key"
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary text-white"
            >
              {{ getFilterLabel(key, value) }}
              <button @click="removeFilter(key)" class="ml-1 hover:bg-primary-dark rounded-full">
                &times;
              </button>
            </span>
            <button
              @click="clearAllFilters"
              class="text-xs text-gray-600 hover:text-gray-800 underline"
            >
              Clear filters
            </button>
          </template>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span class="ml-3 text-gray-700">Loading jobs...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error loading jobs</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ error }}</p>
            </div>
            <div class="mt-4">
              <button
                @click="fetchJobs"
                class="bg-red-100 text-red-800 px-3 py-2 rounded text-sm font-medium hover:bg-red-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Jobs State -->
      <div v-else-if="filteredJobs.length === 0" class="text-center py-12">
        <BriefcaseIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ hasActiveFilters ? 'Try changing your filters' : 'No jobs available at the moment' }}
        </p>
        <div v-if="hasActiveFilters" class="mt-6">
          <button
            @click="clearAllFilters"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Job Listings -->
      <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" class="divide-y divide-gray-200">
          <li
            v-for="job in paginatedJobs"
            :key="job._id"
            class="hover:bg-gray-50 transition-colors duration-150"
          >
            <div class="px-4 py-6 sm:px-6">
              <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div class="flex-1">
                  <div class="flex items-center">
                    <h3 class="text-lg font-semibold text-gray-900">{{ job.title }}</h3>
                    <span
                      :class="[
                        'ml-3 px-2 py-1 text-xs font-medium rounded-full',
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

                  <div class="mt-2">
                    <p class="text-sm text-gray-600 line-clamp-2">{{ job.description }}</p>
                  </div>

                  <div class="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                    <div class="flex items-center">
                      <MapPinIcon class="h-4 w-4 text-gray-400 mr-1.5" />
                      <span>{{ job.location?.address || 'Location not specified' }}</span>
                    </div>

                    <div v-if="job.budget" class="flex items-center">
                      <CurrencyPoundIcon class="h-4 w-4 text-gray-400 mr-1.5" />
                      <span>Budget: £{{ job.budget.toLocaleString() }}</span>
                    </div>

                    <div v-if="job.timelineStart" class="flex items-center">
                      <CalendarIcon class="h-4 w-4 text-gray-400 mr-1.5" />
                      <span>{{ formatDate(job.timelineStart) }}</span>
                      <span v-if="job.timelineEnd"> - {{ formatDate(job.timelineEnd) }}</span>
                    </div>

                    <div v-if="job.category" class="flex items-center">
                      <TagIcon class="h-4 w-4 text-gray-400 mr-1.5" />
                      <span class="capitalize">{{ job.category }}</span>
                    </div>
                  </div>
                </div>

                <div class="mt-4 sm:mt-0 sm:ml-4 flex items-start">
                  <div class="flex flex-col space-y-2">
<!--                    <button-->
<!--                      @click="viewJobDetails(job._id)"-->
<!--                      class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"-->
<!--                    >-->
<!--                      View Details-->
<!--                    </button>-->
                    <button
                      v-if="job.attachments?.length"
                      @click="viewAttachments(job.attachments)"
                      class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      View Attachments ({{ job.attachments.length }})
                    </button>
                  </div>
                </div>
              </div>

              <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <div class="flex items-center space-x-2">
                  <span class="text-xs text-gray-500">
                    Posted {{ formatTimeAgo(job.createdAt) }}
                  </span>
                  <span v-if="job.city || job.state" class="text-xs text-gray-400">•</span>
                  <span v-if="job.city" class="text-xs text-gray-500">
                    {{ job.city }}
                  </span>
                  <span v-if="job.state" class="text-xs text-gray-500">
                    {{ job.state }}
                  </span>
                </div>

                <div v-if="job.assignedProvider" class="flex items-center">
                  <span class="text-xs text-gray-500 mr-2">Assigned to:</span>
                  <div class="flex-shrink-0 h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserIcon class="h-3 w-3 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Pagination -->
      <div v-if="!isLoading && filteredJobs.length > 0" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            @click="currentPage++"
            :disabled="currentPage >= totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> to
              <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, filteredJobs.length) }}</span> of
              <span class="font-medium">{{ filteredJobs.length }}</span> results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                :class="[
                  'relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium',
                  currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                ]"
              >
                <span class="sr-only">Previous</span>
                <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                v-for="page in totalPages"
                :key="page"
                @click="currentPage = page"
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  currentPage === page
                    ? 'z-10 bg-primary border-primary text-white'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
              <button
                @click="currentPage++"
                :disabled="currentPage >= totalPages"
                :class="[
                  'relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium',
                  currentPage >= totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                ]"
              >
                <span class="sr-only">Next</span>
                <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
// import { useRouter } from 'vue-router';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  CalendarIcon,
  TagIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CurrencyPoundIcon,
  ExclamationTriangleIcon,
  BriefcaseIcon
} from '@heroicons/vue/24/outline';
import { API_BASE_URL } from '@/config';

// const router = useRouter();

// Reactive data
const jobs = ref([]);
const isLoading = ref(false);
const error = ref(null);
const isGettingLocation = ref(false);

// Filters
const searchQuery = ref('');
const filters = ref({
  category: '',
  location: '',
  status: 'open',
  lat: '',
  lon: ''
});

// Pagination
const currentPage = ref(1);
const itemsPerPage = 10;

// Categories extracted from jobs data
const categories = computed(() => {
  if (!jobs.value || jobs.value.length === 0) return [];

  // Get unique categories from jobs
  const uniqueCategories = new Set(
    jobs.value
      .map(job => job.category)
      .filter(Boolean) // Remove any undefined/null categories
      .map(cat => cat)
  );

  // Convert Set back to array and sort alphabetically
  return Array.from(uniqueCategories).sort();
});

// Fetch jobs with filters
const fetchJobs = async () => {
  console.log(filters.value.category);
  try {
    isLoading.value = true;
    error.value = null;

    const queryParams = new URLSearchParams();

    // Always filter by open status by default
    queryParams.append('status', 'open');

    // Add other filters to query params
    if (searchQuery.value) queryParams.append('keyword', searchQuery.value);
    if (filters.value.category) queryParams.append('category', filters.value.category);
    if (filters.value.location) queryParams.append('location', filters.value.location);
    if (filters.value.lat) queryParams.append('lat', filters.value.lat);
    if (filters.value.lon) queryParams.append('lon', filters.value.lon);

    const url = `${API_BASE_URL}/jobs?${queryParams.toString()}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.statusText}`);
    }

    const data = await response.json();
    const jobsData = Array.isArray(data) ? data : (data.jobs || []);
    // Ensure we have at least the 'other' category if no jobs are found
    if (jobsData.length === 0) {
      jobsData.push({ category: 'other' });
    }
    jobs.value = jobsData;

    // Generate categories dynamically from jobs data
    const categoriesSet = new Set(jobsData.map(job => job.category.toLowerCase()));
    categories.value = Array.from(categoriesSet).sort();

  } catch (err) {
    console.error('Error fetching jobs:', err);
    error.value = err.message || 'Failed to load jobs. Please try again later.';
  } finally {
    isLoading.value = false;
  }
};

// Use current location
const useCurrentLocation = () => {
  if (!navigator.geolocation) {
    error.value = 'Geolocation is not supported by your browser';
    return;
  }

  isGettingLocation.value = true;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      filters.value.lat = position.coords.latitude;
      filters.value.lon = position.coords.longitude;
      applyFilters();
      isGettingLocation.value = false;
    },
    (err) => {
      error.value = 'Unable to retrieve your location';
      isGettingLocation.value = false;
      console.error('Geolocation error:', err);
    }
  );
};

// Debounced search
let searchTimeout;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 500);
};

// Debounced filter application
let filterTimeout;
const debouncedApplyFilters = () => {
  clearTimeout(filterTimeout);
  filterTimeout = setTimeout(() => {
    applyFilters();
  }, 300);
};

// Apply filters and fetch jobs
const applyFilters = () => {
  currentPage.value = 1;
  fetchJobs();
};

// Clear specific filter
const removeFilter = (filterKey) => {
  if (filterKey === 'lat' || filterKey === 'lon') {
    filters.value.lat = '';
    filters.value.lon = '';
  } else {
    filters.value[filterKey] = '';
  }
  applyFilters();
};

// Clear all filters
const clearAllFilters = () => {
  searchQuery.value = '';
  filters.value = {
    category: '',
    location: '',
    status: 'open',
    lat: '',
    lon: ''
  };
  applyFilters();
};

// Computed properties
const filteredJobs = computed(() => {
  return jobs.value.filter(job => {
    // Client-side filtering for status if needed
    if (filters.value.status && job.status !== filters.value.status) {
      return false;
    }
    return true;
  });
});

const paginatedJobs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredJobs.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredJobs.value.length / itemsPerPage);
});

const hasActiveFilters = computed(() => {
  return searchQuery.value ||
         filters.value.category ||
         filters.value.location ||
         filters.value.lat ||
         filters.value.lon;
});

// Get active filters (excluding status)
const activeFilters = computed(() => {
  const active = {};
  if (searchQuery.value) active.search = searchQuery.value;
  if (filters.value.category) active.category = filters.value.category;
  if (filters.value.location) active.location = filters.value.location;
  if (filters.value.lat) active.nearby = 'Nearby';
  return active;
});

// Helper methods
const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return interval === 1 ? `${interval} ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }

  return 'just now';
};

const getFilterLabel = (key, value) => {
  const labels = {
    search: `Search: ${value}`,
    category: `Category: ${value}`,
    location: `Location: ${value}`,
    status: `Status: ${value}`,
    nearby: 'Nearby Jobs'
  };
  return labels[key] || `${key}: ${value}`;
};

// const viewJobDetails = (jobId) => {
//   router.push(`/jobs/${jobId}`);
// };

const viewAttachments = (attachments) => {
  // Open attachments in new window/modal
  attachments.forEach(attachment => {
    window.open(attachment.url, '_blank');
  });
};

// Watch for page changes
watch(currentPage, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Initial load
onMounted(() => {
  fetchJobs();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
