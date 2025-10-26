<template>
  <div class="relative">
    <!-- Avatar Button -->
    <div @click="toggleDropdown" class="cursor-pointer">
      <div class="w-8 h-8 rounded-full overflow-hidden border border-gray-300">
        <img
          v-if="profile?.avatar"
          :src="profile.avatar"
          alt="Avatar"
          class="w-full h-full object-cover"
        />
        <User v-else class="w-5 h-5 text-gray-600 mx-auto my-1.5" />
      </div>
    </div>

    <!-- Dropdown -->
    <transition name="fade">
      <div
        v-if="isOpen"
        class="absolute right-0 mt-3 w-56 bg-white rounded-lg shadow-xl border border-gray-100 z-50"
      >
        <div class="p-3 border-b border-gray-100">
          <p class="text-sm font-medium text-gray-900">
            {{ profile?.user?.name || "Provider" }}
          </p>
          <p class="text-xs text-gray-500 truncate">{{ profile?.user?.email }}</p>
        </div>

        <div class="divide-y divide-gray-100">
          <button
              @click="goToSettings"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Settings
          </button>
          <button
            @click="openAvatarModal"
            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Change Profile Photo
          </button>

          <button
            @click="logout"
            class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>
    </transition>

    <!-- Avatar Modal -->
    <transition name="fade">
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg shadow-xl w-96 p-6 space-y-4">
          <h2 class="text-lg font-semibold text-gray-800">
            Update Profile Photo
          </h2>

          <div class="flex flex-col items-center">
            <div class="w-24 h-24 rounded-full overflow-hidden border border-gray-200 mb-3">
              <img
                v-if="preview"
                :src="preview"
                alt="Preview"
                class="w-full h-full object-cover"
              />
              <img
                v-else-if="profile?.avatar"
                :src="profile.avatar"
                class="w-full h-full object-cover"
              />
              <User v-else class="w-10 h-10 text-gray-400 mx-auto my-6" />
            </div>
            <input
              type="file"
              @change="handleFileChange"
              accept="image/*"
              class="text-sm"
            />
          </div>

          <div class="flex justify-end space-x-3 pt-3 border-t border-gray-100">
            <button
              @click="closeModal"
              class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              @click="saveAvatar"
              :disabled="!selectedFile"
              class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { User } from "lucide-vue-next"
import { API_BASE_URL } from "@/config"
import { useRouter } from "vue-router";
const router = useRouter();

const isOpen = ref(false)
const showModal = ref(false)
const selectedFile = ref<File | null>(null)
const preview = ref<string | null>(null)
const profile = ref<any>(null)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}
const goToSettings = () => {
  closeDropdown();
  router.push("/dashboard/provider/settings");
};

const closeDropdown = () => {
  isOpen.value = false
}

const openAvatarModal = () => {
  closeDropdown()
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedFile.value = null
  preview.value = null
}

const handleFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    selectedFile.value = file
    preview.value = URL.createObjectURL(file)
  }
}

const saveAvatar = async () => {
  if (!selectedFile.value) return
  const token = localStorage.getItem("token")
  const fd = new FormData()
  fd.append("avatar", selectedFile.value)
  fd.append("data", JSON.stringify({}))

  const res = await fetch(`${API_BASE_URL}/provider-profiles`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  })

  if (res.ok) {
    const updated = await res.json()
    profile.value = updated
    alert("Profile photo updated successfully!")
    closeModal()
  } else {
    alert("Failed to update avatar.")
  }
}

const logout = () => {
  localStorage.clear()
  window.location.href = "/login"
}

onMounted(async () => {
  const token = localStorage.getItem("token")
  const res = await fetch(`${API_BASE_URL}/provider-profiles/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.ok) {
    const data = await res.json()
    profile.value = data
  }
})

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement
  if (!target.closest(".relative")) isOpen.value = false
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
