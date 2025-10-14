<template>
  <ClientDashboardLayout>
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      <h1 class="text-2xl font-bold text-purple-700">Manage Reviews</h1>

      <!-- Leave Review -->
      <div class="bg-white rounded-xl shadow p-6 space-y-4 border border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800">Leave a Review for Provider</h2>

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

      <!-- Past Reviews -->
      <div class="bg-white rounded-xl shadow p-6 space-y-3 border border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800">Your Past Reviews</h2>
        <div v-if="reviews.length">
          <div v-for="rev in reviews" :key="rev._id" class="border-b py-3 space-y-1">
            <p class="text-sm text-gray-600">
              For <strong>{{ rev.reviewee?.name }}</strong> — {{ rev.job?.title }}
            </p>
            <StarRating :rating="rev.rating" />
            <p>{{ rev.comment }}</p>
          </div>
        </div>
        <p v-else class="text-gray-500 text-sm">No reviews yet.</p>
      </div>
    </div>
  </ClientDashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import ClientDashboardLayout from "@/components/ClientDashboardLayout.vue";
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



