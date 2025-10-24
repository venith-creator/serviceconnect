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
          <router-link
            to="/"
            :class="[
              'font-medium transition-colors',
              isActive('/')
                ? 'text-primary'
                : 'text-black hover:text-gray-700'
            ]"
          >
            How it Works
          </router-link>
          <router-link
            to="/listing"
            :class="[
              'font-medium transition-colors',
              isActive('/listing')
                ? 'text-primary'
                : 'text-black hover:text-gray-700'
            ]"
          >
            Job Listing
          </router-link>
          <router-link
            to="/contact"
            :class="[
              'font-medium transition-colors',
              isActive('/contact')
                ? 'text-primary'
                : 'text-black hover:text-gray-700'
            ]"
          >
            Contact Us
          </router-link>
        </nav>

        <!-- Desktop Buttons -->
        <div class="hidden md:flex items-center space-x-4 relative">
          <router-link
            to="/post-job"
            class="px-4 py-2 rounded-lg text-white transition-colors bg-primary hover:opacity-90"
          >
            Post Job
          </router-link>

          <div v-if="!isLoggedIn" class="flex items-center space-x-2">
            <div>
              <!-- Signup button -->
              <router-link
                to="/signup"
                class="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-primary hover:opacity-90 transition-colors"
              >
                Signup
              </router-link>

            </div>
            <div>
              <!-- Login button -->
              <router-link
                to="/login"
                class="border border-primary flex items-center gap-2 px-4 py-2 rounded-lg text-primary bg-white hover:opacity-90 transition-colors"
              >
                Login
              </router-link>
            </div>
          </div>
          <div v-else>
            <div class="relative">
              <button
                @click="toggleDropdown"
                class="flex items-center justify-center w-10 h-10 rounded-full border border-primary bg-white text-primary font-medium hover:opacity-90 transition-colors"
                aria-haspopup="true"
                :aria-expanded="isDropdownOpen"
              >
                {{ userInitials }}
              </button>
              <div
                v-show="isDropdownOpen"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu"
              >
                <router-link
                  to="/dashboard/switch"
                  @click="closeDropdown"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Profile
                </router-link>
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  role="menuitem"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>


        <!-- Mobile Hamburger -->
        <button
          @click="toggleMobileMenu"
          class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors z-50 relative"
          aria-label="Toggle mobile menu"
        >
          <XMarkIcon v-if="isMobileMenuOpen" class="h-6 w-6 text-gray-600"/>
          <Bars3Icon v-else class="h-6 w-6 text-gray-600"/>
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
            <img src="/Service_connect_logo.png" alt="Service Connect Logo" class="w-8 h-8"/>
            <span class="font-semibold text-xl text-black">Service Connect</span>
          </div>
          <button
            @click="closeMobileMenu"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close mobile menu"
          >
            <XMarkIcon class="h-6 w-6 text-gray-600"/>
          </button>
        </div>

        <!-- Drawer Nav -->
        <div class="flex-1 overflow-y-auto">
          <nav class="p-6 space-y-1">
            <a href="#how"
               class="block py-3 px-4 rounded-lg text-lg font-medium text-black hover:bg-gray-100"
               @click="closeMobileMenu">How it Works</a>
            <a href="#testimonials"
               class="block py-3 px-4 rounded-lg text-lg font-medium text-black hover:bg-gray-100"
               @click="closeMobileMenu">Testimonials</a>
            <a href="#faqs"
               class="block py-3 px-4 rounded-lg text-lg font-medium text-black hover:bg-gray-100"
               @click="closeMobileMenu">FAQs</a>
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
import {ref, onMounted, onUnmounted, watch, computed} from "vue";
import {useRoute, useRouter} from 'vue-router';
import {Bars3Icon, XMarkIcon} from "@heroicons/vue/24/outline";

const route = useRoute();
const router = useRouter();
const isMobileMenuOpen = ref(false);
const showDropdown = ref(false);
const isDropdownOpen = ref(false);

const isLoggedIn = computed(() => {
  return localStorage.getItem('token') !== null;
});

const userInitials = computed(() => {
  const userInfoStr = localStorage.getItem('user');
  if (!userInfoStr) return "U";
  const name = JSON.parse(userInfoStr).name;
  if (!name) return "U";

  const nameParts = name.trim().split(/\s+/);
  if (nameParts.length === 0) return "U";

  let initials = nameParts[0].charAt(0).toUpperCase();

  if (nameParts.length > 1) {
    initials += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
  }

  return initials;
});

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('name');
  showDropdown.value = false;
  isDropdownOpen.value = false;
  router.push('/login');
};

// Check if a nav item is active based on current route
const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(path);
};

const toggleMobileMenu = () => (isMobileMenuOpen.value = !isMobileMenuOpen.value);
const closeMobileMenu = () => (isMobileMenuOpen.value = false);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};
const closeDropdown = () => {
  isDropdownOpen.value = false;
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
