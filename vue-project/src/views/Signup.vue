<template>
  <div class="flex min-h-screen bg-secondary/20">
    <!-- Hero Section -->
    <div class="hidden md:flex flex-1 items-start justify-center pt-48 p-10">
      <div class="flex flex-col items-center text-center max-w-sm -mt-12">
        <!-- Fixed size image -->
        <img
          :src="role === 'provider' ? '/worker1.png' : '/homeowner1.png'"
          alt="Signup illustration"
          class="w-[400px] h-[300px] object-cover rounded-md shadow-lg shadow-gray-400/50"
        />

        <!-- Heading -->
        <h2 class="text-2xl font-bold mt-6 text-black">
          {{ role === 'provider' ? 'Build your success' : 'Get things done' }}
        </h2>

        <!-- Paragraph -->
        <p class="text-sm text-black-700 mt-2">
          {{ role === 'provider'
            ? 'Show your skills, grow your business. Start connecting with clients today! Join thousands of professionals earning more by connecting with customers who need your skills.'
            : 'Find the right service provider in minutes, it\'s free and easy! Connect with trusted providers in your area, post jobs, get quotes, and hire with confidence.'
          }}
        </p>
      </div>
    </div>

    <!-- Signup Form -->
    <div class="relative z-10 min-h-screen flex items-center justify-center p-4 md:pl-12 py-12 flex-1">
      <div class="w-full max-w-md bg-white rounded-xl shadow p-8 space-y-6">
        <h2 class="text-2xl font-bold text-center">Join Service Connect</h2>
        <p class="text-center text-gray-600">Create your account to get started</p>

        <!-- Role Selection -->
        <div class="grid grid-cols-2 bg-secondary/40 rounded-lg p-1">
          <button
            @click="role = 'homeowner'"
            :class="[
              'flex items-center justify-center gap-2 py-2 rounded-lg transition',
              role === 'homeowner' ? 'bg-white shadow font-semibold' : 'text-gray-600'
            ]"
          >
            <HomeIcon class="w-5 h-5" />
            Homeowner
          </button>
          <button
            @click="role = 'provider'"
            :class="[
              'flex items-center justify-center gap-2 py-2 rounded-lg transition',
              role === 'provider' ? 'bg-white shadow font-semibold' : 'text-gray-600'
            ]"
          >
            <WrenchScrewdriverIcon class="w-5 h-5" />
            Service Provider
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSignup" class="space-y-4">
          <label class="block font-medium mb-1">Full name</label>
          <input v-model="name" type="text" placeholder="Enter your full name" required class="w-full p-2 border rounded" />
          <label class="block font-medium mb-1">Phone Number</label>
          <input v-model="phone" type="tel" placeholder="+44 234 123 11" required class="w-full p-2 border rounded" />
          <label class="block font-medium mb-1">Email Address</label>
          <input v-model="email" type="email" placeholder="Enter your email" required class="w-full p-2 border rounded" />
          <label class="block font-medium mb-1">Password</label>
          <input v-model="password" type="password" placeholder="Password" required class="w-full p-2 border rounded" />
          <label class="block font-medium mb-1">confirm Password</label>
          <input v-model="confirmPassword" type="password" placeholder="Confirm Password" required class="w-full p-2 border rounded" />



          <!-- Profile Picture -->
          <div>
            <label class="block font-medium mb-1">Profile Picture *</label>
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50">
                <img
                  v-if="avatarUrl"
                  :src="avatarUrl"
                  alt="Avatar preview"
                  class="w-full h-full object-cover"
                />
                <CameraIcon v-else class="w-6 h-6 text-gray-400" />
              </div>
              <div class="flex-1">
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  @change="handleAvatar"
                  class="hidden"
                />
                <label
                  for="avatar"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <CameraIcon class="w-4 h-4 mr-2" />
                  Choose Photo
                </label>
                <p class="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                <!-- field-specific error -->
                <p v-if="error === 'Profile picture is required'" class="text-red-500 text-xs mt-1">
                  {{ error }}
                </p>
              </div>
            </div>
          </div>


          <!-- Privacy -->
          <div class="flex items-center gap-2 bg-secondary/30 text-gray-600 text-xs p-2 rounded">
            <ShieldCheckIcon class="w-4 h-4 text-primary" />
            <span>Your data is safe with us. We never share your personal info.</span>
          </div>

          <div class="flex items-start">
            <input id="terms" v-model="acceptTerms" type="checkbox" required
              class="mt-1 rounded border-gray-300 text-primary focus:ring-primary" />
            <label for="terms" class="ml-2 text-xs text-gray-600">
              I agree to the
              <router-link to="/terms" class="text-primary">Terms of Service</router-link>
              and
              <router-link to="/privacy" class="text-primary">Privacy Policy</router-link> *
            </label>
          </div>


          <!-- Social signup -->
          <div class="space-y-2">
            <p class="text-center text-xs text-gray-400">or sign up with</p>
            <div class="flex justify-center gap-4">
              <button class="w-12 h-12 border border-pink-500 rounded-full flex items-center justify-center">
                <img src="/google.jpg" alt="Google" class="w-6 h-6" />
              </button>
              <button class="w-12 h-12 border border-pink-500 rounded-full flex items-center justify-center">
                <img src="/apple.png" alt="Apple" class="w-6 h-6" />
              </button>
              <button class="w-12 h-12 border border-pink-500 rounded-full flex items-center justify-center">
                <img src="/facebook.png" alt="Facebook" class="w-6 h-6" />
              </button>
            </div>
          </div>

          <!-- Submit -->
          <button type="submit" class="w-full bg-primary text-white py-2 rounded-lg font-semibold">
            Create Account
          </button>
        </form>

        <!-- Footer -->
        <p class="text-center text-sm text-gray-600">
          Already have an account?
          <router-link to="/login" class="text-primary font-semibold">Login</router-link>
        </p>

        <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { HomeIcon, WrenchScrewdriverIcon, ShieldCheckIcon, CameraIcon } from "@heroicons/vue/24/solid";
import { API_BASE_URL } from "@/config";

const router = useRouter();
const role = ref("homeowner");

const name = ref("");
const phone = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const error = ref("");

// Provider services

const acceptTerms = ref(false);
const avatarUrl = ref(null);
const avatarFile = ref(null);

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

  if (!avatarFile.value) {
    error.value = "Profile picture is required";
    return;
  }

  if (!acceptTerms.value) {
      error.value = "You must accept the Terms and Privacy Policy";
      return;
    }

  const formData = new FormData();
  formData.append("name", name.value);
  formData.append("phone", phone.value);
  formData.append("email", email.value);
  formData.append("password", password.value);
  let finalRole = role.value;
  if (finalRole === "homeowner") finalRole = "client";
  formData.append("role", finalRole);


  formData.append("avatar", avatarFile.value);

  try {
    const res = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Signup failed");

    router.push("/login");
  } catch (err) {
    error.value = err.message;
  }
};
</script>
