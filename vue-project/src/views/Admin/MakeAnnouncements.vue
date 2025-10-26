<template>
    <div class="p-6 max-w-7xl mx-auto">
      <!-- Two-column layout -->
      <div class="grid md:grid-cols-2 gap-8 items-start">
        <!-- Left: Make Announcement -->
        <div class="space-y-6 sticky top-6">
          <h1 class="text-2xl font-bold mb-4 text-purple-700">
            Make Announcements
          </h1>

          <form
            @submit.prevent="sendAnnouncement"
            class="space-y-4 bg-white shadow-md p-6 rounded-2xl"
          >
            <div>
              <label class="block text-sm font-medium mb-1">Title</label>
              <input
                v-model="title"
                type="text"
                class="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Message</label>
              <textarea
                v-model="message"
                rows="4"
                class="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                required
              ></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Audience</label>
                <select
                  v-model="audience"
                  class="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All</option>
                  <option value="clients">Clients</option>
                  <option value="providers">Providers</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1"
                  >Expires At (optional)</label
                >
                <input
                  v-model="expiresAt"
                  type="datetime-local"
                  class="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition w-full"
              :disabled="loading"
            >
              {{ loading ? "Sending..." : "Send Announcement" }}
            </button>

            <p v-if="success" class="text-green-600 mt-3">
              ✅ Announcement sent successfully!
            </p>
            <p v-if="error" class="text-red-600 mt-3">{{ error }}</p>
          </form>
        </div>

        <!-- Right: Recent Announcements -->
        <div class="h-[75vh] overflow-y-auto pr-2">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">
            Recent Announcements
          </h2>

          <!-- Announcements List -->
          <div v-if="paginatedAnnouncements.length" class="space-y-4">
            <div
              v-for="a in paginatedAnnouncements"
              :key="a._id"
              class="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition"
            >
              <div class="flex justify-between items-start">
                <h3 class="text-lg font-bold text-purple-700">{{ a.title }}</h3>
                <span
                  class="text-xs px-3 py-1 rounded-full"
                  :class="{
                    'bg-purple-100 text-purple-700': a.audience === 'all',
                    'bg-blue-100 text-blue-700': a.audience === 'clients',
                    'bg-green-100 text-green-700': a.audience === 'providers'
                  }"
                >
                  {{ a.audience }}
                </span>
              </div>

              <p class="mt-2 text-gray-700 whitespace-pre-line">
                {{ a.message }}
              </p>

              <div class="text-xs text-gray-500 mt-3 flex justify-between">
                <span>By: {{ a.createdBy?.name || "Admin" }}</span>
                <span>
                  {{ new Date(a.createdAt).toLocaleString() }}<br />
                  <span v-if="a.expiresAt">
                    Expires: {{ new Date(a.expiresAt).toLocaleString() }}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <p v-else class="text-center text-gray-500 mt-6">
            No announcements yet.
          </p>

          <!-- Pagination -->
          <div
            v-if="totalPages > 1"
            class="flex justify-center items-center gap-3 mt-6"
          >
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="px-3 py-1 border rounded-lg text-sm"
            >
              Prev
            </button>
            <span class="text-sm text-gray-600">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 border rounded-lg text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { API_BASE_URL } from "@/config";
//import AdminDashboardLayout from "@/components/AdminDashboardLayout.vue";

interface a {
  _id: string;
  title: string;
  message: string;
  audience: string;
  expiresAt?: string;
  createdAt: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
}

const title = ref("");
const message = ref("");
const audience = ref("all");
const expiresAt = ref("");
const loading = ref(false);
const success = ref(false);
const error = ref("");
const announcements = ref<a[]>([]);

// ✅ Pagination states
const currentPage = ref(1);
const perPage = 5;

const totalPages = computed(() =>
  Math.ceil(announcements.value.length / perPage)
);

const paginatedAnnouncements = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return announcements.value.slice(start, start + perPage);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const fetchAnnouncements = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/announcement`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch announcements");
    announcements.value = await res.json();
  } catch (err: any) {
    console.error("fetchAnnouncements:", err.message);
  }
};

const sendAnnouncement = async () => {
  loading.value = true;
  success.value = false;
  error.value = "";

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/announcement`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: title.value,
        message: message.value,
        audience: audience.value,
        expiresAt: expiresAt.value || null,
      }),
    });

    if (!res.ok) throw new Error("Failed to send announcement");

    success.value = true;
    title.value = message.value = expiresAt.value = "";
    await fetchAnnouncements(); // refresh list immediately
  } catch (err: any) {
    error.value = err.message || "Something went wrong";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchAnnouncements);
</script>
