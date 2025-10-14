<template>
  <div>
    <header
      class="border-b bg-[#F8F4FF]/95 backdrop-blur supports-[backdrop-filter]:bg-[#F8F4FF]/60 sticky top-0 z-50"
    >
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center space-x-2">
          <img
            src="/Service_connect_logo.png"
            alt="Service Connect Logo"
            class="w-6 h-6"
          />
          <router-link to="/" class="font-semibold text-xl text-black">
            Service Connect
          </router-link>
        </div>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center space-x-8">
          <a href="#how" class="text-black hover:text-gray-700 font-medium transition-colors">How it Works</a>
          <a href="#testimonials" class="text-black hover:text-gray-700 font-medium transition-colors">Testimonials</a>
          <a href="#faqs" class="text-black hover:text-gray-700 font-medium transition-colors">FAQs</a>
        </nav>

        <!-- Desktop Buttons -->
        <div class="hidden md:flex items-center space-x-4 relative">
          <router-link
            to="/post-job"
            class="px-4 py-2 rounded-lg text-white transition-colors bg-primary hover:opacity-90"
          >
            Post Job
          </router-link>

         <!-- Signup with dropdown -->
        <div class="relative">
          <!-- Signup button -->
          <router-link
            to="/signup"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-primary hover:opacity-90 transition-colors"
            @click.stop="toggleDropdown"
          >
            Signup
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 9l-7 7-7-7" />
            </svg>
          </router-link>

          <!-- Dropdown -->
          <transition name="fade">
            <div
              v-if="showDropdown"
              class="absolute left-0 mt-2 w-32 bg-white border border-gray-100 rounded-lg shadow-lg overflow-hidden z-50"
            >
              <router-link
                to="/login"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="closeDropdown"
              >
                Login
              </router-link>
            </div>
          </transition>
        </div>

        </div>


        <!-- Mobile Hamburger -->
        <button
          @click="toggleMobileMenu"
          class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors z-50 relative"
          aria-label="Toggle mobile menu"
        >
          <XMarkIcon v-if="isMobileMenuOpen" class="h-6 w-6 text-gray-600" />
          <Bars3Icon v-else class="h-6 w-6 text-gray-600" />
        </button>
      </div>
    </header>

    <!-- Mobile Backdrop -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-40 md:hidden"
      @click="closeMobileMenu"
      aria-hidden="true"
    />

    <!-- Mobile Drawer -->
    <div
      :class="[
        'fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 md:hidden',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="flex flex-col h-full">
        <!-- Drawer Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-100">
          <div class="flex items-center space-x-2">
            <img src="/Service_connect_logo.png" alt="Service Connect Logo" class="w-8 h-8" />
            <span class="font-semibold text-xl text-black">Service Connect</span>
          </div>
          <button
            @click="closeMobileMenu"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close mobile menu"
          >
            <XMarkIcon class="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <!-- Drawer Nav -->
        <div class="flex-1 overflow-y-auto">
          <nav class="p-6 space-y-1">
            <a href="#how" class="block py-3 px-4 rounded-lg text-lg font-medium text-black hover:bg-gray-100" @click="closeMobileMenu">How it Works</a>
            <a href="#testimonials" class="block py-3 px-4 rounded-lg text-lg font-medium text-black hover:bg-gray-100" @click="closeMobileMenu">Testimonials</a>
            <a href="#faqs" class="block py-3 px-4 rounded-lg text-lg font-medium text-black hover:bg-gray-100" @click="closeMobileMenu">FAQs</a>
          </nav>
        </div>

        <!-- Drawer Buttons -->
        <div class="p-6 border-t border-gray-100 space-y-4 flex flex-col">
          <router-link
            to="/post-job"
            class="px-4 py-2 rounded-lg text-white transition-colors bg-primary hover:opacity-90"
            @click="closeMobileMenu"
          >
            Post Job
          </router-link>

          <router-link
            to="/signup"
            class="px-4 py-2 rounded-lg text-white transition-colors bg-primary hover:opacity-90"
            @click="closeMobileMenu"
          >
            Signup
          </router-link>

          <router-link
            to="/login"
            class="px-4 py-2 rounded-lg text-gray-800 border border-gray-300 hover:bg-gray-100 text-center"
            @click="closeMobileMenu"
          >
            Login
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { Bars3Icon, XMarkIcon } from "@heroicons/vue/24/outline";

const isMobileMenuOpen = ref(false);
const showDropdown = ref(false);

const toggleMobileMenu = () => (isMobileMenuOpen.value = !isMobileMenuOpen.value);
const closeMobileMenu = () => (isMobileMenuOpen.value = false);

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};
const closeDropdown = () => {
  showDropdown.value = false;
};

// Close dropdown when clicking outside
const handleClickOutside = (e: MouseEvent) => {
  const dropdown = document.querySelector(".relative.flex.items-center");
  if (dropdown && !dropdown.contains(e.target as Node)) {
    showDropdown.value = false;
  }
};

// ESC to close mobile menu
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    closeMobileMenu();
    closeDropdown();
  }
};

watch(isMobileMenuOpen, (open) => {
  document.body.style.overflow = open ? "hidden" : "unset";
});

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleEscape);
});
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleEscape);
  document.body.style.overflow = "unset";
});
</script>
<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

</style>
