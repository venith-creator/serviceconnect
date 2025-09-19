<template>
  <div class="flex min-h-screen items-center justify-center bg-secondary/20 px-4">
    <!-- Card -->
    <div class="w-full max-w-md bg-white rounded-xl shadow p-8 space-y-6">
      <!-- Heading -->
      <div class="text-center space-y-1">
        <h2 class="text-2xl font-bold">Welcome Back</h2>
        <p class="text-gray-600 text-sm">Login to continue with Service Connect</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="Enter your email"
            class="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="Enter your password"
            class="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <!-- Forgot Password -->
        <div class="flex justify-end">
          <router-link to="/forgot-password" class="text-xs text-primary hover:underline">
            Forgot password?
          </router-link>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          class="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90 transition"
        >
          Login
        </button>
      </form>

      <!-- Divider -->
      <div class="flex items-center gap-2">
        <hr class="flex-grow border-gray-200" />
        <span class="text-xs text-gray-400">or continue with</span>
        <hr class="flex-grow border-gray-200" />
      </div>

      <!-- Social login -->
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

      <!-- Error -->
      <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>

      <!-- Footer -->
      <p class="text-center text-sm text-gray-600">
        Don’t have an account?
        <router-link to="/signup" class="text-primary font-semibold">Sign up</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { API_BASE_URL } from "@/config";

const email = ref("");
const password = ref("");
const error = ref("");
const router = useRouter();

const handleLogin = async () => {
  error.value = "";

  try {
    const res = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value, password: password.value })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    // Save token + user role
    // ✅ Save token + user
localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify({
  id: data._id,
  name: data.name,
  email: data.email,
  roles: data.roles,
  providerOnboarding: data.providerOnboarding
}));

// ✅ Redirect logic
if (data.roles.includes("admin")) {
  router.push("/dashboard/admin");
} else {
  // Clients + Providers always pass through switch
  router.push("/dashboard/switch");
}


  } catch (err) {
    error.value = err.message;
  }
};
</script>
