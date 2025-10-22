<template>
  <AdminDashboardLayout>
    <div class="p-6 max-w-7xl mx-auto">
      <h1 class="text-2xl font-bold mb-6 text-gray-800">Manage Reviews</h1>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-3 mb-5">
        <select v-model="selectedRole" @change="fetchReviews" class="border rounded-md px-3 py-2">
          <option value="">All Roles</option>
          <option value="client">Client Reviews (From Clients)</option>
          <option value="provider">Provider Reviews (From Providers)</option>
        </select>

        <input
          v-model="search"
          @input="debounceFetch"
          placeholder="Search reviewer/reviewee..."
          class="border rounded-md px-3 py-2 w-64"
        />
      </div>

      <!-- Reviews Table -->
      <div v-if="reviews.length" class="overflow-x-auto">
        <table class="w-full border rounded-lg bg-white">
          <thead class="bg-gray-100 text-gray-700">
            <tr class="text-left">
              <th class="p-3">Reviewer</th>
              <th class="p-3">Reviewee</th>
              <th class="p-3">Job</th>
              <th class="p-3">From Role</th>
              <th class="p-3">To Role</th>
              <th class="p-3">Rating</th>
              <th class="p-3">Comment</th>
              <th class="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="review in reviews" :key="review._id" class="border-t hover:bg-gray-50">
              <td class="p-3">
                <div>
                  <p class="font-medium text-gray-800">
                    {{ review.reviewer?.name || 'N/A' }}
                  </p>
                  <p class="text-xs text-gray-500">{{ review.reviewer?.email }}</p>
                </div>
              </td>

              <td class="p-3">
                <div>
                  <p class="font-medium text-gray-800">
                    {{ review.revieweeName }}
                  </p>
                  <p class="text-xs text-gray-500">{{ review.revieweeEmail }}</p>
                </div>
              </td>

              <td class="p-3">
                <button
                  @click="viewJob(review.job)"
                  class="text-blue-600 hover:underline"
                >
                  {{ review.job?.title || 'View Job' }}
                </button>
              </td>

              <td class="p-3 capitalize text-gray-700">
                {{ review.reviewerRole }}
              </td>

              <td class="p-3 capitalize text-gray-700">
                {{ review.revieweeRole }}
              </td>

              <td class="p-3 text-yellow-600 font-semibold">
                ⭐ {{ review.rating }}/5
              </td>

              <td class="p-3 max-w-xs truncate">
                <span class="text-gray-700 text-sm">{{ review.comment || '—' }}</span>
              </td>

              <td class="p-3 text-center">
                <button
                  @click="deleteReview(review._id)"
                  class="text-red-600 hover:underline text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="flex justify-end items-center gap-3 mt-4">
          <button
            :disabled="page === 1"
            @click="page-- && fetchReviews()"
            class="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>Page {{ page }} / {{ pages }}</span>
          <button
            :disabled="page === pages"
            @click="page++ && fetchReviews()"
            class="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <div v-else class="text-gray-500 mt-10 text-center">
        No reviews found.
      </div>

      <!-- Job Modal -->
      <div
        v-if="selectedJob"
        class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      >
        <div
          class="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <h2 class="text-2xl font-bold mb-3">{{ selectedJob.title }}</h2>
          <div class="space-y-2 text-sm">
            <p><strong>Status:</strong> {{ selectedJob.status }}</p>
            <p><strong>Category:</strong> {{ selectedJob.category || 'N/A' }}</p>
            <p><strong>Budget:</strong> ${{ selectedJob.budget || 'N/A' }}</p>
            <p><strong>Location:</strong> {{ selectedJob.location?.address || 'N/A' }}</p>
            <div>
              <strong>Description:</strong>
              <p class="mt-1 whitespace-pre-line text-gray-700">
                {{ selectedJob.description || 'No description' }}
              </p>
            </div>
          </div>

          <div class="mt-5 flex justify-end">
            <button
              @click="selectedJob = null"
              class="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminDashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminDashboardLayout from '@/components/AdminDashboardLayout.vue'
import { API_BASE_URL } from '@/config'

const reviews = ref<any[]>([])
const selectedRole = ref('')
const search = ref('')
const page = ref(1)
const pages = ref(1)
const selectedJob = ref<any>(null)
let debounceTimer: any = null

const fetchReviews = async () => {
  try {
    const token = localStorage.getItem('token')
    const params = new URLSearchParams({
      page: page.value.toString(),
      ...(selectedRole.value && { role: selectedRole.value }),
      ...(search.value && { search: search.value }),
    })
    const res = await fetch(`${API_BASE_URL}/reviews/admin/all?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()

    // 🧩 normalize reviewee info
    reviews.value = (data.reviews || []).map((r: any) => ({
      ...r,
      revieweeName:
        r.revieweeProvider?.user?.name ||
        r.revieweeUser?.name ||
        r.reviewee?.name ||
        'N/A',
      revieweeEmail:
        r.revieweeProvider?.user?.email ||
        r.revieweeUser?.email ||
        r.reviewee?.email ||
        'N/A',
    }))
    pages.value = data.pages || 1
  } catch (err) {
    console.error('Error fetching reviews:', err)
  }
}

const deleteReview = async (id: string) => {
  if (!confirm('Are you sure you want to delete this review?')) return
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_BASE_URL}/reviews/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      reviews.value = reviews.value.filter(r => r._id !== id)
      alert('Review deleted successfully!')
    } else {
      alert('Failed to delete review')
    }
  } catch (err) {
    console.error('Error deleting review:', err)
  }
}

const viewJob = async (job: any) => {
  if (job?.description) {
    selectedJob.value = job
    return
  }
  if (!job?._id) return
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE_URL}/jobs/${job._id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.ok) {
    const data = await res.json()
    selectedJob.value = data.job
  }
}

const debounceFetch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchReviews, 400)
}

onMounted(fetchReviews)
</script>
