<template>
  <AdminDashboardLayout>
    <div class="p-6 max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Make Announcements</h1>

      <form @submit.prevent="sendAnnouncement" class="space-y-4">
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
          <label class="block text-sm font-medium mb-1">Expires At (optional)</label>
          <input
            v-model="expiresAt"
            type="datetime-local"
            class="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button
          type="submit"
          class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          :disabled="loading"
        >
          {{ loading ? "Sending..." : "Send Announcement" }}
        </button>

        <p v-if="success" class="text-green-600 mt-3">✅ Announcement sent successfully!</p>
        <p v-if="error" class="text-red-600 mt-3">{{ error }}</p>
      </form>
    </div>
  </AdminDashboardLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { API_BASE_URL } from "@/config";
import AdminDashboardLayout from "@/components/AdminDashboardLayout.vue";

const title = ref("");
const message = ref("");
const audience = ref("all");
const expiresAt = ref("");
const loading = ref(false);
const success = ref(false);
const error = ref("");

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
  } catch (err: any) {
    error.value = err.message || "Something went wrong";
  } finally {
    loading.value = false;
  }
};
</script>

