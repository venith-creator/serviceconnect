<template>
    <div class="p-6 max-w-7xl mx-auto">
      <h1 class="text-2xl font-bold text-purple-700 mb-6">Manage Reviews</h1>

      <!-- Two-column layout -->
      <div class="grid md:grid-cols-2 gap-8 items-start">
        <!-- Left: Leave Review -->
        <div class="space-y-6 sticky top-6">
          <div class="bg-white rounded-xl shadow p-6 space-y-4 border border-gray-100">
            <h2 class="text-lg font-semibold text-gray-800">
              Leave a Review for Provider
            </h2>

            <div class="space-y-3">
              <!-- Hidden fields -->
              <input type="hidden" v-model="jobId" />
              <input type="hidden" v-model="providerId" />

              <!-- Visible inputs -->
              <select v-model="rating" class="border rounded-md p-2 w-full">
                <option disabled value="">Select rating</option>
                <option v-for="n in 5" :key="n" :value="n">{{ n }} star</option>
              </select>

              <textarea
                v-model="comment"
                placeholder="Write your review..."
                class="border rounded-md p-2 w-full h-24"
              ></textarea>

              <button
                @click="submitReview"
                class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md w-full md:w-auto"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Past Reviews -->
        <div class="bg-white rounded-xl shadow p-6 space-y-3 border border-gray-100 h-[75vh] overflow-y-auto pr-2">
          <h2 class="text-lg font-semibold text-gray-800">Your Past Reviews</h2>

          <div v-if="reviews.length">
            <div
              v-for="rev in reviews"
              :key="rev._id"
              class="border-b py-4 space-y-2 text-sm"
            >
              <div class="flex justify-between items-center">
                <p>
                  <span class="font-semibold text-gray-800">
                    {{ rev.revieweeRole === 'provider' ? 'Provider:' : 'Client:' }}
                  </span>
                  <span>
                    {{ rev.revieweeProvider?.user?.name || rev.revieweeUser?.name || rev.reviewee?.name || 'Unknown' }}
                  </span>
                </p>
                <span class="text-gray-500 text-xs italic">
                  You were the {{ rev.reviewerRole }}
                </span>
              </div>

              <p class="text-gray-600">
                <strong>Job:</strong> {{ rev.job?.title || 'N/A' }}
              </p>

              <StarRating :rating="rev.rating" />
              <p>{{ rev.comment }}</p>
              <p class="text-xs text-gray-400">
                {{ new Date(rev.createdAt).toLocaleDateString() }}
              </p>
            </div>
          </div>
          <p v-else class="text-gray-500 text-sm">No reviews yet.</p>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
//import ClientDashboardLayout from "@/components/ClientDashboardLayout.vue";
import { API_BASE_URL } from "@/config";
import { useRoute } from "vue-router";
import StarRating from "@/components/StarRating.vue";

const route = useRoute();

const jobId = ref("");
const providerId = ref("");
const rating = ref("");
const comment = ref("");
const reviews = ref<any[]>([]);

const submitReview = async () => {
  if (!rating.value || !comment.value) {
    alert("Please add a rating and comment.");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        jobId: jobId.value,
        providerId: providerId.value,
        rating: rating.value,
        comment: comment.value,
      }),
    });
    if (!res.ok) throw new Error("Failed to submit review");
    alert("Review submitted!");
    rating.value = "";
    comment.value = "";
    await loadReviews();
  } catch (err) {
    console.error(err);
  }
};

const loadReviews = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/reviews/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  reviews.value = await res.json();
};

onMounted(() => {
  if (route.query.jobId) jobId.value = route.query.jobId as string;
  if (route.query.providerId) providerId.value = route.query.providerId as string;
});
onMounted(loadReviews);
</script>

