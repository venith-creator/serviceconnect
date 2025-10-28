<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Manage Blogs</h1>

    <!-- Loading State -->
    <div v-if="loading" class="text-gray-500">Loading posts...</div>

    <!-- Empty State -->
    <div v-else-if="!posts.length" class="text-gray-400 text-center">
      No provider posts found.
    </div>

    <!-- Posts Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="post in paginatedPosts"
        :key="post._id"
        class="bg-white rounded-xl shadow-md overflow-hidden flex flex-col"
      >
        <!-- Media Preview (clickable) -->
        <div
          v-if="post.media?.length"
          class="relative cursor-pointer"
          @click="openPreview(post.media, 0)"
        >
          <img
            v-if="post.media[0].type === 'image'"
            :src="post.media[0].url"
            alt="Post Media"
            class="w-full h-48 object-cover"
          />
          <video
            v-else
            :src="post.media[0].url"
            class="w-full h-48 object-cover"
            muted
            autoplay
            loop
          ></video>
        </div>

        <!-- Post Info -->
        <div class="p-4 flex-grow flex flex-col justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-800 mb-1">
              {{ post.title }}
            </h2>
            <p class="text-sm text-gray-600 mb-3 line-clamp-3">
              {{ post.description }}
            </p>
          </div>

          <!-- Provider Info -->
          <div class="flex items-center gap-2 mt-3">
            <!-- Avatar with initials fallback -->
            <div
              class="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-semibold text-xs overflow-hidden"
            >
              <img
                v-if="post.provider?.user?.avatar"
                :src="post.provider.user.avatar"
                alt="Avatar"
                class="w-full h-full object-cover"
                @error="post.provider.user.avatar = ''"
              />
              <span v-else>
                {{ getInitials(getSafeName(post.provider?.user)) }}
              </span>
            </div>

            <div>
              <p class="text-sm font-medium text-gray-700">
                {{ getSafeName(post.provider?.user) }}
              </p>
              <p class="text-xs text-gray-500">
                {{ post.provider?.city || '—' }}, {{ post.provider?.state || '' }}
              </p>
              <p class="text-xs text-gray-500">
                Posted on {{ new Date(post.createdAt).toLocaleString() }}
              </p>
            </div>
          </div>

          <!-- Stats -->
          <div class="flex items-center justify-between mt-4 text-gray-600 text-sm">
            <div class="flex items-center gap-3">
              <span class="flex items-center gap-1">
                <Heart class="w-4 h-4 text-rose-500" />
                {{ post.likes?.length || 0 }}
              </span>
              <span class="flex items-center gap-1">
                <MessageCircle class="w-4 h-4 text-blue-500" />
                {{ post.comments?.length || 0 }}
              </span>
            </div>

            <button
              @click="viewComments(post)"
              class="text-xs text-blue-600 hover:underline"
            >
              View Comments
            </button>
          </div>

          <!-- Delete -->
          <button
            @click="deletePost(post._id)"
            class="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg w-full font-medium transition"
          >
            Delete Post
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
      <div
        v-if="totalPages > 1"
        class="flex justify-center items-center mt-8 gap-2"
      >
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          Prev
        </button>

        <span class="text-gray-700 font-medium">
          Page {{ currentPage }} of {{ totalPages }}
        </span>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>


    <!-- 🖼️ Media Preview Modal -->
    <div
      v-if="previewMediaList.length"
      class="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50"
    >
      <div class="relative max-w-3xl w-full p-4 flex flex-col items-center">
        <!-- Close (Cancel) Button -->
        <button
          class="absolute top-4 right-4 text-white text-2xl font-bold hover:text-red-400 transition"
          @click="closePreview"
        >
          ✕
        </button>

        <!-- Media Display -->
        <div class="relative w-full flex items-center justify-center">
          <!-- Prev Button -->
          <button
            v-if="previewIndex > 0"
            @click="showPrevMedia"
            class="absolute left-2 bg-white/40 hover:bg-white text-black p-2 rounded-full"
          >
            ‹
          </button>

          <!-- Media -->
          <img
            v-if="previewMedia && previewMedia.type === 'image'"
            :src="previewMedia.url"
            class="max-h-[80vh] object-contain rounded-lg shadow-lg"
          />
          <video
            v-else-if="previewMedia && previewMedia.type === 'video'"
            :src="previewMedia.url"
            controls
            class="max-h-[80vh] rounded-lg shadow-lg"
          ></video>

          <!-- Next Button -->
          <button
            v-if="previewIndex < previewMediaList.length - 1"
            @click="showNextMedia"
            class="absolute right-2 bg-white/40 hover:bg-white text-black p-2 rounded-full"
          >
            ›
          </button>
        </div>

        <!-- Media counter -->
        <div class="flex justify-between items-center mt-4 w-full max-w-sm">
          <p class="text-gray-200 text-sm">
            {{ previewIndex + 1 }} / {{ previewMediaList.length }}
          </p>

          <!-- Cancel button (secondary clear button) -->
          <button
            class="bg-white/20 text-white px-4 py-1 rounded-md hover:bg-white/40 transition"
            @click="closePreview"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>

    <!-- 💬 Comments Modal -->
    <div
      v-if="activePost"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
        <h2 class="text-lg font-semibold mb-4">
          Comments for: {{ activePost.title }}
        </h2>

        <div v-if="!activePost.comments?.length" class="text-gray-400 text-sm">
          No comments yet.
        </div>

        <div v-else class="space-y-3 max-h-80 overflow-y-auto">
          <div
            v-for="c in activePost.comments"
            :key="c._id"
            class="border-b border-gray-200 pb-2"
          >
            <div class="flex items-center gap-2">
              <div
                class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden"
              >
                <img
                  v-if="c.author?.avatar"
                  :src="c.author.avatar"
                  alt="avatar"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-xs font-semibold text-gray-700">
                  {{ getInitials(getSafeName(c.author)) }}
                </span>
              </div>

              <div>
                <p class="text-sm font-medium">
                  {{ getSafeName(c.author) }}
                </p>
                <p class="text-xs text-gray-600">{{ c.text }}</p>
              </div>
            </div>
          </div>
        </div>

        <button
          @click="activePost = null"
          class="absolute top-2 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { API_BASE_URL } from "@/config";
import { Heart, MessageCircle } from "lucide-vue-next";

const getInitials = (name?: string) => {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const getSafeName = (user?: { name?: string; _id?: string }) => {
  if (user?.name?.trim()) return user.name;
  if (user?._id) return `User-${user._id.slice(-4)}`;
  return "Unknown User";
};

const posts = ref<any[]>([]);
// Pagination
const currentPage = ref(1);
const pageSize = 9; // how many posts per page
const totalPages = computed(() =>
  Math.ceil(posts.value.length / pageSize)
);
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return posts.value.slice(start, start + pageSize);
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};
const loading = ref(true);
const activePost = ref<any | null>(null);
const previewMediaList = ref<{ type: string; url: string }[]>([]);
const previewIndex = ref(0);
const previewMedia = ref<{ type: string; url: string } | null>(null);

const fetchPosts = async () => {
  try {
    loading.value = true;
    const res = await fetch(`${API_BASE_URL}/portfolio`);
    posts.value = await res.json();
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
  } finally {
    loading.value = false;
  }
};

const deletePost = async (id: string) => {
  if (!confirm("Are you sure you want to delete this post?")) return;
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/portfolio/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      posts.value = posts.value.filter((p) => p._id !== id);
      alert("Post deleted successfully.");
    } else {
      const data = await res.json();
      alert(data.message || "Failed to delete post.");
    }
  } catch (error) {
    console.error("❌ Error deleting post:", error);
  }
};

const viewComments = (post: any) => {
  activePost.value = post;
};

// 🖼️ Image/video preview logic
const openPreview = (mediaList: { type: string; url: string }[], index: number) => {
  previewMediaList.value = mediaList;
  previewIndex.value = index;
  previewMedia.value = mediaList[index];
};

const showNextMedia = () => {
  if (previewIndex.value < previewMediaList.value.length - 1) {
    previewIndex.value++;
    previewMedia.value = previewMediaList.value[previewIndex.value];
  }
};

const showPrevMedia = () => {
  if (previewIndex.value > 0) {
    previewIndex.value--;
    previewMedia.value = previewMediaList.value[previewIndex.value];
  }
};

const closePreview = () => {
  previewMediaList.value = [];
  previewMedia.value = null;
  previewIndex.value = 0;
};

onMounted(fetchPosts);
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
