<template>
  <div class="flex min-h-screen bg-secondary/20">
    <!-- Hero Section -->
    <div class="hidden md:flex flex-1 items-start justify-center pt-48 p-10">
      <div class="flex flex-col items-center text-center max-w-sm -mt-12">
        <img src="/admin.jpg" alt="Admin illustration"
             class="w-[400px] h-[300px] object-cover rounded-md shadow-lg shadow-gray-400/50" />
        <h2 class="text-2xl font-bold mt-6 text-black">Admin Registration</h2>
        <p class="text-sm text-black-700 mt-2">
          Register as an admin with the secret code provided to you by the system owner.
        </p>
      </div>
    </div>

    <!-- Signup Form -->
    <div class="relative z-10 min-h-screen flex items-center justify-center p-4 md:pl-12 py-12 flex-1">
      <div class="w-full max-w-md bg-white rounded-xl shadow p-8 space-y-6">
        <h2 class="text-2xl font-bold text-center">Admin Signup</h2>
        <p class="text-center text-gray-600">Restricted to authorized admins only</p>

        <form @submit.prevent="handleSignup" class="space-y-4">
          <label class="block font-medium mb-1">Full name</label>
          <input v-model="name" type="text" placeholder="Enter your full name" required class="w-full p-2 border rounded" />

          <label class="block font-medium mb-1">Phone Number</label>
          <input v-model="phone" type="tel" placeholder="+44 234 123 11" required class="w-full p-2 border rounded" />

          <label class="block font-medium mb-1">Email Address</label>
          <input v-model="email" type="email" placeholder="Enter your email" required class="w-full p-2 border rounded" />

          <label class="block font-medium mb-1">Password</label>
          <input v-model="password" type="password" placeholder="Password" required class="w-full p-2 border rounded" />

          <label class="block font-medium mb-1">Confirm Password</label>
          <input v-model="confirmPassword" type="password" placeholder="Confirm Password" required class="w-full p-2 border rounded" />

          <!-- Secret Code -->
          <label class="block font-medium mb-1">Secret Code</label>
          <input v-model="secretCode" type="password" placeholder="Enter admin secret code" required class="w-full p-2 border rounded" />

          <!-- Profile Picture -->
          <div>
            <label class="block font-medium mb-1">Profile Picture *</label>
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50">
                <img v-if="avatarUrl" :src="avatarUrl" alt="Avatar preview" class="w-full h-full object-cover" />
                <CameraIcon v-else class="w-6 h-6 text-gray-400" />
              </div>
              <div class="flex-1">
                <input id="avatar" type="file" accept="image/*" required @change="handleAvatar" class="hidden" />
                <label for="avatar" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                  <CameraIcon class="w-4 h-4 mr-2" />
                  Choose Photo
                </label>
                <p class="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>

          <button type="submit" class="w-full bg-primary text-white py-2 rounded-lg font-semibold">
            Create Admin Account
          </button>
        </form>

        <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
        <p class="text-center text-sm text-gray-600">
          Already an admin?
          <router-link to="/login" class="text-primary font-semibold">Login</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { CameraIcon } from "@heroicons/vue/24/solid";
import { API_BASE_URL } from "@/config";

const router = useRouter();
const name = ref("");
const phone = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const secretCode = ref("");
const avatarUrl = ref(null);
const avatarFile = ref(null);
const error = ref("");

function handleAvatar(e) {
  const file = e.target.files?.[0];
  if (file) {
    avatarFile.value = file;
    avatarUrl.value = URL.createObjectURL(file);
  }
}

const handleSignup = async () => {
  error.value = "";
  if (password.value !== confirmPassword.value) {
    error.value = "Passwords do not match";
    return;
  }

  const formData = new FormData();
  formData.append("name", name.value);
  formData.append("phone", phone.value);
  formData.append("email", email.value);
  formData.append("password", password.value);
  formData.append("role", "admin");
  formData.append("secretCode", secretCode.value.trim());
  formData.append("avatar", avatarFile.value);

  try {
    const res = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Signup failed");
    router.push("/login");
  } catch (err) {
    error.value = err.message;
  }
};
</script>
