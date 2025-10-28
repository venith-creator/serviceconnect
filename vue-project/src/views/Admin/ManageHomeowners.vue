<template>
    <div class="p-6 space-y-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 class="text-3xl font-bold text-purple-700">Manage Homeowners</h1>

        <!-- Filters -->
        <div class="flex flex-wrap gap-3">
          <input
            v-model="search"
            type="text"
            placeholder="Search by name or email..."
            class="border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
          />
          <select
            v-model="filterRating"
            class="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
          >
            <option value="">All Ratings</option>
            <option v-for="r in [5, 4, 3, 2, 1]" :key="r" :value="r">
              {{ r }} Stars & Up
            </option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="text-gray-500 animate-pulse">Loading homeowners...</div>

      <div v-else class="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        <table class="min-w-full text-sm text-gray-700">
          <thead class="bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 uppercase text-xs">
            <tr>
              <th class="px-6 py-3 text-left font-semibold">Name</th>
              <th class="px-6 py-3 text-left font-semibold">Email</th>
              <th class="px-6 py-3 text-left font-semibold">Jobs Posted</th>
              <th class="px-6 py-3 text-left font-semibold">Avg Rating</th>
              <th class="px-6 py-3 text-left font-semibold">Reviews</th>
              <th class="px-6 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="homeowner in paginatedHomeowners" :key="homeowner._id">
              <tr
                class="border-t hover:bg-purple-50 transition-colors duration-200"
              >
                <td class="px-6 py-3 flex items-center gap-3">
                  <div
                    class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-purple-700 font-semibold text-sm overflow-hidden"
                  >
                    <img
                      v-if="homeowner.avatar"
                      :src="homeowner.avatar"
                      alt="Avatar"
                      class="w-full h-full object-cover"
                      @error="homeowner.avatar = ''"
                    />
                    <span v-else>{{ getInitials(getSafeName(homeowner)) }}</span>
                  </div>
                  <div>
                    <span class="font-medium block">{{ homeowner.name }}</span>
                    <span
                      v-if="homeowner.isBanned"
                      class="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-md"
                      >Suspended</span
                    >
                  </div>
                </td>
                <td class="px-6 py-3">{{ homeowner.email }}</td>
                <td class="px-6 py-3">{{ homeowner.jobsCount }}</td>
                <td class="px-6 py-3 text-yellow-600 font-semibold">
                  ⭐ {{ homeowner.avgRating }}
                </td>
                <td class="px-6 py-3">
                  <button
                    @click="toggleReviews(homeowner._id)"
                    class="text-purple-600 hover:text-purple-800 font-medium"
                  >
                    {{ expandedId === homeowner._id ? "Hide" : "View" }}
                  </button>
                </td>
                <td class="px-6 py-3">
                <button
                  @click="toggleBan(homeowner)"
                  class="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                  :class="homeowner.isBanned
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'"
                >
                  {{ homeowner.isBanned ? 'Reactivate' : 'Suspend' }}
                </button>
              </td>
              </tr>

              <!-- Expanded reviews -->
              <transition name="fade">
                <tr
                  v-if="expandedId === homeowner._id"
                  class="bg-purple-50/50 border-t"
                >
                  <td colspan="5" class="px-8 py-4">
                    <div v-if="homeowner.reviews.length" class="space-y-3">
                      <div
                        v-for="r in homeowner.reviews"
                        :key="r._id"
                        class="border border-purple-100 rounded-lg p-3 bg-white shadow-sm"
                      >
                        <div class="flex justify-between">
                          <p class="font-semibold text-purple-700">
                            {{ r.reviewer.name }}
                          </p>
                          <p class="text-yellow-500 font-semibold">⭐ {{ r.rating }}</p>
                        </div>
                        <p class="text-sm text-gray-700">
                          <em>{{ r.job.title }}</em>
                        </p>
                        <p class="text-gray-600 mt-1 text-sm">{{ r.comment }}</p>
                      </div>
                    </div>
                    <div v-else class="text-gray-500 italic">No reviews yet</div>
                  </td>
                </tr>
              </transition>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex justify-end items-center gap-3">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 border rounded-lg text-sm hover:bg-purple-50 disabled:opacity-50"
        >
          Prev
        </button>
        <span class="text-sm text-gray-600"
          >Page {{ currentPage }} of {{ totalPages }}</span
        >
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 border rounded-lg text-sm hover:bg-purple-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
//import AdminDashboardLayout from "@/components/AdminDashboardLayout.vue";
import { API_BASE_URL } from "@/config";

const homeowners = ref([]);
const loading = ref(true);
const expandedId = ref(null);
const search = ref("");
const filterRating = ref("");
const currentPage = ref(1);
const perPage = 6;

// --- helper: initials fallback ---
const getInitials = (name) => {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const getSafeName = (user) => {
  if (user?.name?.trim()) return user.name;
  if (user?._id) return `User-${user._id.slice(-4)}`;
  return "Unknown User";
};

const toggleReviews = (id) => {
  expandedId.value = expandedId.value === id ? null : id;
};

const toggleBan = async (homeowner) => {
  try {
    const newStatus = !homeowner.isBanned;
    let reason = "";

    if (newStatus) {
      reason = prompt("Enter reason for suspension:", "Violation of terms") || "No reason specified";
    }

    const res = await fetch(`${API_BASE_URL}/admin/users/${homeowner._id}/ban`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ ban: newStatus, reason }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    alert(data.message);
    await fetchHomeowners(); // 👈 refresh data to sync from DB
  } catch (err) {
    console.error("Ban toggle error:", err);
    alert("Failed to update user status");
  }
};

const fetchHomeowners = async () => {
  loading.value = true;
  try {
    const res = await fetch(`${API_BASE_URL}/admin/homeowners`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    homeowners.value = data;
  } catch (err) {
    console.error("❌ Error fetching homeowners:", err);
  } finally {
    loading.value = false;
  }
};

const filteredHomeowners = computed(() => {
  return homeowners.value.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(search.value.toLowerCase()) ||
      h.email.toLowerCase().includes(search.value.toLowerCase());
    const matchesRating = filterRating.value
      ? h.avgRating >= filterRating.value
      : true;
    return matchesSearch && matchesRating;
  });
});

const totalPages = computed(() =>
  Math.ceil(filteredHomeowners.value.length / perPage)
);

const paginatedHomeowners = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return filteredHomeowners.value.slice(start, start + perPage);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

onMounted(async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/homeowners`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch homeowners");
    console.log("📸 Homeowners data:", data);
    homeowners.value = data;
  } catch (err) {
    console.error("❌ Error fetching homeowners:", err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
