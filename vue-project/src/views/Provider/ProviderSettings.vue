<template>
    <div class="max-w-3xl mx-auto py-10 space-y-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-4">Profile Settings</h1>

      <form @submit.prevent="saveChanges" class="space-y-6">
        <!-- Personal Info -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
          <h2 class="text-lg font-semibold text-gray-700">Basic Info</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-600">City</label>
              <input v-model="form.city" type="text" class="input" />
            </div>
            <div>
              <label class="text-sm text-gray-600">State</label>
              <input v-model="form.state" type="text" class="input" />
            </div>
            <div>
              <label class="text-sm text-gray-600">Country</label>
              <input v-model="form.country" type="text" class="input" />
            </div>
            <div>
              <label class="text-sm text-gray-600">Years of Experience</label>
              <input v-model="form.yearsOfExperience" type="number" class="input" />
            </div>
          </div>
        </div>

        <!-- Professional Info -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
          <h2 class="text-lg font-semibold text-gray-700">Professional Info</h2>

          <div>
            <label class="text-sm text-gray-600">Description / Bio</label>
            <textarea
              v-model="form.description"
              rows="4"
              class="input"
              placeholder="Tell clients about your experience..."
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-600">Languages</label>
              <input v-model="form.languages" type="text" class="input" placeholder="English, Yoruba..." />
            </div>
            <div>
              <label class="text-sm text-gray-600">Availability</label>
              <select v-model="form.availability" class="input">
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Weekends</option>
                <option>On-call</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="cancelChanges"
            class="px-4 py-2 rounded-md text-gray-700 border hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { API_BASE_URL } from "@/config";
//import ProviderDashboardLayout from "@/components/ProviderDashboardLayout.vue";

const token = localStorage.getItem("token");
const loading = ref(false);
const form = ref({
  city: "",
  state: "",
  country: "",
  yearsOfExperience: "",
  description: "",
  languages: "",
  availability: "",
});

onMounted(async () => {
  const res = await fetch(`${API_BASE_URL}/provider-profiles/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) {
    const data = await res.json();
    Object.assign(form.value, data);
  }
});

async function saveChanges() {
  loading.value = true;
  try {
    const fd = new FormData();
    fd.append("data", JSON.stringify(form.value));
    const res = await fetch(`${API_BASE_URL}/provider-profiles`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (res.ok) {
      alert("Profile updated successfully!");
    } else {
      alert("Failed to update profile.");
    }
  } finally {
    loading.value = false;
  }
}

function cancelChanges() {
  window.history.back();
}
</script>

<style scoped>
.input {
  @apply w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring focus:ring-blue-200 focus:outline-none;
}
</style>
