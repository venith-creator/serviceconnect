<template>
  <ClientDashboardLayout>
    <div class="max-w-5xl mx-auto p-6 space-y-8">

      <!-- Provider Header -->
      <div v-if="provider?.user" class="bg-white p-6 rounded-xl shadow-md">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <img
            :src="provider.user?.avatar || '/default-avatar.png'"
            class="w-24 h-24 rounded-full object-cover shadow"
          />
          <div class="flex-1 text-center sm:text-left">
            <h2 class="text-2xl font-semibold text-purple-700">
              {{ provider.user.name }}
            </h2>
            <p class="text-gray-600 mt-1">{{ provider.description || 'No description available.' }}</p>

            <!-- Rating -->
            <div class="flex justify-center sm:justify-start items-center mt-2 text-yellow-500">
              <span v-for="star in 5" :key="star">
                <i class="fa" :class="star <= Math.round(provider.ratingAvg) ? 'fa-star' : 'fa-star-o'"></i>
              </span>
              <span class="text-sm text-gray-600 ml-2">
                {{ provider.ratingAvg?.toFixed(1) || 0 }} / 5
              </span>
            </div>

            <!-- Experience + Location -->
            <div class="mt-3 text-gray-600 text-sm">
              <p><strong>Experience:</strong> {{ provider.yearsOfExperience || 0 }} years</p>
              <p><strong>Location:</strong> {{ provider.city }}, {{ provider.state }}, {{ provider.country }}</p>
            </div>

            <!-- Services -->
            <div v-if="provider.services?.length" class="mt-4">
              <h4 class="font-semibold text-gray-700">Services Offered:</h4>
              <ul class="mt-1 text-sm text-gray-600 list-disc list-inside">
                <li v-for="(s, i) in provider.services" :key="i">
                  {{ s.category }} — £{{ s.rate }}/hr
                </li>
              </ul>
            </div>

            <!-- Chat Button -->
            <button
              @click="startChat"
              class="mt-5 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg transition"
            >
              <i class="fa fa-comments mr-2"></i> Chat with {{ provider.user.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Reviews -->
      <div class="bg-white p-6 rounded-xl shadow-md">
        <h3 v-if="provider?.user" class="text-xl font-semibold mb-5 text-gray-700">
          Reviews for {{ provider.user.name }}
        </h3>

        <div v-if="reviews.length" class="space-y-5">
          <div
            v-for="review in reviews"
            :key="review._id"
            class="border border-gray-100 p-4 rounded-lg hover:shadow transition"
          >
            <div class="flex items-start gap-4">
              <img
                :src="review.reviewer?.avatar || '/default-avatar.png'"
                class="w-12 h-12 rounded-full object-cover"
              />
              <div class="flex-1">
                <div class="flex justify-between items-center">
                  <p class="font-medium text-gray-800">{{ review.reviewer?.name }}</p>
                  <div class="flex text-yellow-500 text-sm">
                    <i
                      v-for="n in 5"
                      :key="n"
                      class="fa"
                      :class="n <= review.rating ? 'fa-star' : 'fa-star-o'"
                    ></i>
                  </div>
                </div>
                <p v-if="review.job?.title" class="text-xs text-gray-500 mt-1">
                  For job: <span class="font-medium">{{ review.job.title }}</span>
                </p>
                <p class="mt-2 text-gray-700 text-sm">{{ review.comment }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-gray-500 italic text-center py-5">
          No reviews yet for this provider.
        </div>
      </div>
    </div>
  </ClientDashboardLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import ClientDashboardLayout from "@/components/ClientDashboardLayout.vue";
import { API_BASE_URL } from "@/config";

const route = useRoute();
const router = useRouter();
const provider = ref(null);
const reviews = ref([]);

const fetchProvider = async () => {
  const res = await fetch(`${API_BASE_URL}/provider-profiles/${route.params.providerId}`);
  const data = await res.json();
  provider.value = data.profile;
  reviews.value = data.profile?.reviews || [];
};

const startChat = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/chats/room/client-provider`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ providerId: provider.value._id }),
    });

    if (!res.ok) throw new Error("Failed to start chat");
    const room = await res.json();

    router.push({
      path: "/dashboard/client/Manageschat",
      query: { roomId: room._id },
    });
  } catch (err) {
    console.error("startChat error:", err);
    alert("Could not start chat. Please try again.");
  }
};

onMounted(fetchProvider);
</script>

<style scoped>
.fa-star {
  color: #fbbf24;
}
</style>
