<template>
  <div class="max-w-6xl mx-auto p-6">
    <h2 class="text-2xl font-semibold text-gray-800 mb-6 text-center">
      Service Providers
    </h2>

    <!-- 🔍 Filters -->
    <div
      class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm"
    >
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by service category or name..."
        class="w-full sm:w-2/3 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
      />

      <select
        v-model="minRating"
        class="w-full sm:w-1/3 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        <option value="0">All Ratings</option>
        <option value="3">3★ and above</option>
        <option value="4">4★ and above</option>
        <option value="4.5">4.5★ and above</option>
      </select>
    </div>

    <!-- Provider Cards -->
    <div
      v-if="filteredProviders.length"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="p in filteredProviders"
        :key="p._id"
        class="bg-white rounded-xl shadow-md p-5 flex flex-col items-center text-center hover:shadow-lg transition"
      >
        <div class="flex flex-col items-center flex-grow">
          <div
            class="w-20 h-20 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-xl shadow"
          >
            <img
              v-if="p.user?.avatar"
              :src="p.user.avatar"
              alt="avatar"
              class="w-full h-full object-cover"
              @error="p.user.avatar = ''"
            />
            <span v-else>{{ getInitials(p.user?.name) }}</span>
          </div>

          <h3 class="mt-3 text-lg font-semibold text-gray-800">
            {{ p.user?.name || "Unknown" }}
          </h3>

          <div class="flex justify-center items-center mt-1 text-yellow-500">
            <i
              v-for="star in 5"
              :key="star"
              class="fa"
              :class="star <= Math.round(p.ratingAvg) ? 'fa-star' : 'fa-star-o'"
            ></i>
            <span class="text-sm text-gray-600 ml-2">
              {{ p.ratingAvg?.toFixed(1) || 0 }}
            </span>
          </div>

          <p class="mt-2 text-sm text-gray-500">
            {{ p.city }}, {{ p.state }}
          </p>

          <div v-if="p.services?.length" class="mt-3 text-sm text-gray-700">
            <strong>Services:</strong>
            <ul class="list-disc list-inside">
              <li v-for="(s, i) in p.services.slice(0, 2)" :key="i">
                {{ s.category }}
              </li>
            </ul>
            <p
              v-if="p.services.length > 2"
              class="text-gray-400 text-xs mt-1"
            >
              +{{ p.services.length - 2 }} more
            </p>
          </div>
        </div>

        <button
          @click="goToProvider(p._id)"
          class="mt-5 bg-purple-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg w-full font-medium transition self-end"
        >
          More about service provider
        </button>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="text-center text-gray-500 italic mt-10">
      No providers found.
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center mt-8 gap-3">
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50"
      >
        Prev
      </button>
      <span class="text-gray-700 font-medium">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { API_BASE_URL } from "@/config";

interface Provider {
  _id: string;
  user: { name: string; avatar?: string };
  ratingAvg: number;
  city: string;
  state: string;
  services: Array<{ category: string }>;
}

const providers = ref<Provider[]>([]);
const currentPage = ref(1);
const totalPages = ref(1);
const router = useRouter();

const searchQuery = ref("");
const minRating = ref(0);

const getInitials = (name?: string) => {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
};

const fetchProviders = async (page = 1) => {
  const res = await fetch(
    `${API_BASE_URL}/provider-profiles/active?page=${page}&limit=6`
  );
  const data = await res.json();
  providers.value = data.providers;
  currentPage.value = data.currentPage;
  totalPages.value = data.totalPages;
};

// ✅ Computed filtered list
const filteredProviders = computed(() => {
  return providers.value.filter((p) => {
    const matchesSearch =
      p.user?.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.services.some((s) =>
        s.category.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    const meetsRating = p.ratingAvg >= minRating.value;
    return matchesSearch && meetsRating;
  });
});

const goToProvider = (id: string) => {
  router.push(`/dashboard/client/seeProvider/${id}`);
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    fetchProviders(currentPage.value + 1);
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    fetchProviders(currentPage.value - 1);
  }
};

onMounted(() => fetchProviders());
</script>

<style scoped>
.fa-star {
  color: #fbbf24;
}
</style>

