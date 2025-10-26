<template>
  <ClientDashboardLayout>
    <div class="min-h-screen flex flex-col">
      <main class="flex-1 p-4 sm:p-6 overflow-x-hidden">
        <div class="p-4 sm:p-6 w-full sm:max-w-3xl mx-auto space-y-10 overflow-x-hidden">
          <h1 class="text-4xl sm:text-3xl font-semibold text-purple-600">
             Service Providers Blog
          </h1>

          <!-- Feed -->
          <div v-if="posts.length" class="space-y-10">
            <div
              v-for="post in posts"
              :key="post._id"
              class="border-b border-gray-200 pb-6 space-y-3"
            >
            <!-- Header -->
            <div class="flex items-center justify-between">
                <!-- Profile info -->
              <div class="flex items-center space-x-3">
                <!-- Avatar with initials fallback -->
                <div class="w-10 h-10 rounded-full flex items-center justify-center bg-purple-200 text-purple-700 font-semibold text-sm overflow-hidden">
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
                  <p class="font-semibold text-gray-800">
                    {{ post.provider?.user?.name }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ new Date(post.createdAt).toLocaleString() }}
                  </p>
                </div>
                </div>

                <!-- Three-dot menu -->
              <div class="ml-auto relative">
                <button
                  @click="toggleMenu(post._id)"
                  class="p-1 rounded-full hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zm0 6a.75.75 0 110-1.5.75.75 0 010 1.5zm0 6a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                  </svg>
                </button>

                <div
                  v-if="activeMenu === post._id"
                  class="absolute right-0 mt-2 bg-gray-100 border border-gray-200 rounded-lg shadow-lg z-50 text-sm"
                >
                  <button
                    @click="goToProvider(post.provider._id)"
                    class="block w-full px-4 py-2 text-left text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-t-lg"
                  >
                    View Service Provider
                  </button>
                </div>
              </div>
              </div>

              <!-- Content -->
              <div>
                <p class="font-semibold text-gray-900 text-base">
                  {{ post.title }}
                </p>
                <p class="text-gray-700 whitespace-pre-line">
                  {{ post.description }}
                </p>
              </div>

             <!-- Media Carousel -->
                <div
                  v-if="post.media.length"
                  class="mt-3 relative"
                >
                  <div
                    class="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
                  >
                    <div
                      v-for="(mediaItem, idx) in post.media"
                      :key="idx"
                      class="flex-shrink-0 snap-center w-full sm:w-1/2"
                    >
                      <img
                        v-if="mediaItem.type === 'image'"
                        :src="mediaItem.url"
                        alt="Media"
                        class="rounded-xl w-full h-52 object-cover cursor-pointer"
                        @click="openPreview(post.media, idx)"
                      />
                      <video
                        v-else
                        controls
                        class="rounded-xl w-full h-52 object-cover"
                      >
                        <source :src="mediaItem.url" type="video/mp4" />
                      </video>
                    </div>
                  </div>

                  <!-- Optional arrows (desktop only) -->
                  <button
                    class="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 bg-white bg-opacity-40 p-2 rounded-full shadow hover:bg-opacity-100"
                    @click="scrollCarousel($event, 'left')"
                  >
                    ‹
                  </button>
                  <button
                    class="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 bg-white bg-opacity-40 p-2 rounded-full shadow hover:bg-opacity-100"
                    @click="scrollCarousel($event, 'right')"
                  >
                    ›
                  </button>
                </div>


              <!-- Actions -->
              <div class="flex items-center gap-5 mt-3 text-sm">
                <button
                  @click="toggleLike(post._id)"
                  class="flex items-center space-x-1 text-purple-600 hover:text-purple-800"
                >
                  <Heart
                    :size="18"
                    :class="isLiked(post) ? 'fill-current text-purple-600' : ''"
                  />
                  <span>{{ post.likes.length }}</span>
                </button>

                <button
                  @click="toggleComments(post._id)"
                  class="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                >
                  <MessageCircle :size="18" />
                  <span>{{ post.comments.length }}</span>
                </button>

                <button
                  @click="sharePost(post)"
                  class="flex items-center space-x-1 text-gray-600 hover:text-purple-700"
                >
                  <Share2 :size="18" />
                  <span>Share</span>
                </button>
              </div>

              <!-- Comments -->
              <transition name="fade">
                <div
                  v-if="openComments === post._id"
                  class="mt-3 space-y-4 border-t pt-3"
                >
                  <div
                    v-for="comment in post.comments"
                    :key="comment._id"
                    class="text-sm bg-gray-100 rounded-lg p-3 text-gray-800 space-y-2"
                  >
                    <div class="space-y-1">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <div class="w-6 h-6 rounded-full flex items-center justify-center bg-purple-100 text-purple-700 text-[10px] font-semibold overflow-hidden">
                              <img
                                v-if="comment.author?.avatar"
                                :src="comment.author.avatar"
                                alt="avatar"
                                class="w-full h-full object-cover"
                                 @error="comment.author.avatar = ''"
                              />
                              <span v-else>
                                {{ getInitials(getSafeName(comment.author)) }}
                              </span>
                            </div>
                          <span class="font-semibold text-gray-800 text-sm">
                            {{ comment.author?.name || "Unknown User" }}
                          </span>
                          <span
                            v-if="comment.author?._id === post.provider?.user?._id"
                            class="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"
                          >
                            Author
                          </span>
                        </div>

                        <div class="flex items-center space-x-3 text-gray-500 text-xs">
                          <button
                            @click="toggleCommentLike(post._id, comment._id)"
                            class="flex items-center space-x-1 hover:text-purple-600"
                          >
                            <Heart
                              :size="14"
                              :class="comment.likes?.includes(userId)? 'fill-current text-purple-600' : ''"
                            />
                            <span>{{ comment.likes?.length || 0 }}</span>
                          </button>
                          <button
                            @click="comment.replying = !comment.replying"
                            class="hover:text-purple-600"
                          >
                            Reply
                          </button>
                        </div>
                      </div>

                      <p class="text-gray-700 text-sm pl-8">{{ comment.text }}</p>
                    </div>

                    <!-- Replies -->
                    <div v-if="comment.replies?.length" class="pl-4 space-y-2">
                      <div
                        v-for="reply in comment.replies"
                        :key="reply._id"
                        class="bg-gray-50 border-l-2 border-purple-200 p-2 rounded"
                      >
                        <div class="flex items-start gap-2">
                          <div class="w-6 h-6 rounded-full flex items-center justify-center bg-purple-100 text-purple-700 text-[10px] font-semibold overflow-hidden">
                          <img
                            v-if="reply.author?.avatar"
                            :src="reply.author.avatar"
                            alt="avatar"
                            class="w-full h-full object-cover"
                            @error="reply.author.avatar = ''"
                          />
                           <span v-else>
                            {{ getInitials(getSafeName(reply.author)) }}
                          </span>
                          </div>
                          <div>
                            <div class="flex items-center gap-1">
                              <span class="font-medium text-gray-800 text-xs">
                                {{ reply.author?.name || "Unknown" }}
                              </span>
                              <span
                                v-if="reply.author?._id === post.provider?.user?._id"
                                class="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"
                              >
                                Author
                              </span>
                            </div>
                            <p class="text-gray-700 text-xs">{{ reply.text }}</p>
                          </div>
                        </div>

                        <div class="flex items-center space-x-3 text-gray-500 text-xs mt-1">
                          <button
                            @click="toggleReplyLike(post._id, comment._id, reply._id)"
                            class="hover:text-purple-600"
                          >
                            <Heart
                              :size="12"
                              :class="reply.likes?.includes(userId)? 'fill-current text-purple-600' : ''"
                            />
                            <span>{{ reply.likes?.length || 0 }}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Reply Input -->
                    <div v-if="comment.replying" class="flex items-center space-x-2 mt-2">
                      <input
                        v-model="comment.replyText"
                        placeholder="Reply..."
                        class="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none text-xs"
                      />
                      <button
                        @click="addReply(post._id, comment)"
                        class="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition text-xs"
                      >
                        Send
                      </button>
                    </div>
                  </div>

                  <!-- New Comment -->
                  <div class="flex items-center space-x-2">
                    <input
                      v-model="commentText"
                      placeholder="Add a comment..."
                      class="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                    />
                    <button
                      @click="addComment(post._id)"
                      class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <div v-else class="text-center text-gray-500">No provider posts found.</div>
        </div>
      </main>
    </div>
    <!-- Media Preview Modal -->
    <div
      v-if="previewMedia"
      class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      @click.self="previewMedia = null"
    >
      <div class="relative max-w-3xl w-full mx-4">
        <button
          class="absolute -top-10 right-0 text-white text-xl hover:text-gray-300"
          @click="previewMedia = null"
        >
          ✕
        </button>

        <!-- Prev Button -->
        <button
          v-if="previewIndex > 0"
          class="absolute left-2 sm:left-5 text-white text-4xl font-bold bg-black bg-opacity-30 hover:bg-opacity-60 p-2 rounded-full z-50"
          @click.stop="showPrevMedia"
        >
          ‹
        </button>

        <!-- Media Content -->
        <div class="max-w-full max-h-[80vh] flex items-center justify-center">
        <img
          v-if="previewMedia.type === 'image'"
          :src="previewMedia.url"
          class="rounded-lg w-full max-h-[80vh] object-contain"
        />
        <video
          v-else
          controls
          autoplay
          class="rounded-lg w-full max-h-[80vh] object-contain"
        >
          <source :src="previewMedia.url" type="video/mp4" />
        </video>
      </div>

      <!-- Next Button -->
        <button
          v-if="previewIndex < previewMediaList.length - 1"
          class="absolute right-2 sm:right-5 text-white text-4xl font-bold bg-black bg-opacity-30 hover:bg-opacity-60 p-2 rounded-full z-50"
          @click.stop="showNextMedia"
        >
          ›
        </button>
      </div>
    </div>
  </ClientDashboardLayout>
</template>

<script setup lang="ts">
import ClientDashboardLayout from "@/components/ClientDashboardLayout.vue";
import { ref, onMounted } from "vue";
import { API_BASE_URL } from "@/config";
import { Heart, MessageCircle, Share2 } from "lucide-vue-next";
import { useRouter } from "vue-router";

interface post {
  _id: string;
  title: string;
  description: string;
  media: Array<{ type: string; url: string }>;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  provider: { _id: string; user: { _id: string; name: string; avatar: string } };
}

interface Reply {
  _id: string;
  text: string;
  author?: {
    _id: string;
    name?: string;
    avatar?: string;
  };
  likes?: string[];
}

interface Comment {
  _id: string;
  text: string;
  likes?: string[];
  replies?: Reply[];
  replying?: boolean;
  replyText?: string;
  author?: {
    _id: string;
    name?: string;
    avatar?: string;
  };
}

const scrollCarousel = (e: MouseEvent, direction: string) => {
  const carousel = (e.currentTarget as HTMLElement).parentElement?.querySelector(
    ".overflow-x-auto"
  ) as HTMLElement;
  if (carousel) {
    const scrollAmount = carousel.clientWidth * 0.9;
    carousel.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }
};

// --- helper: initials fallback ---
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


const router = useRouter();
const posts = ref<post[]>([]);
const openComments = ref("");
const commentText = ref("");
const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId") || "";

const activeMenu = ref<string | null>(null);

const toggleMenu = (id: string) => {
  activeMenu.value = activeMenu.value === id ? null : id;
};

const fetchFeed = async () => {
  const res = await fetch(`${API_BASE_URL}/portfolio`);
  const data = await res.json();
  console.log("🪵 FEED DATA:", data);
  posts.value = data;
};

onMounted(fetchFeed);

const goToProvider = (id : string) => {
  router.push(`/dashboard/client/seeProvider/${id}`);
};

const toggleLike = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/portfolio/${id}/like`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) await fetchFeed();
};

const toggleCommentLike = async (postId: string, commentId: string) => {
  await fetch(`${API_BASE_URL}/portfolio/${postId}/comment/${commentId}/like`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  await fetchFeed();
};

const toggleReplyLike = async (postId: string, commentId: string, replyId: string) => {
  await fetch(`${API_BASE_URL}/portfolio/${postId}/comment/${commentId}/reply/${replyId}/like`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  await fetchFeed();
};
const previewMedia = ref<{ type: string; url: string } | null>(null)
const previewMediaList = ref<{ type: string; url: string }[]>([])
const previewIndex = ref(0)

// Open modal with full list of media for this post
const openPreview = (mediaList: { type: string; url: string }[], index: number) => {
  previewMediaList.value = mediaList
  previewIndex.value = index
  previewMedia.value = mediaList[index]
}

// Move to next/previous media
const showNextMedia = () => {
  if (previewIndex.value < previewMediaList.value.length - 1) {
    previewIndex.value++
    previewMedia.value = previewMediaList.value[previewIndex.value]
  }
}

const showPrevMedia = () => {
  if (previewIndex.value > 0) {
    previewIndex.value--
    previewMedia.value = previewMediaList.value[previewIndex.value]
  }
}

const addComment = async (id: string) => {
  if (!commentText.value.trim()) return;
  await fetch(`${API_BASE_URL}/portfolio/${id}/comment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: commentText.value }),
  });
  commentText.value = "";
  await fetchFeed();
};

const addReply = async (postId: string, comment: any) => {
  if (!comment.replyText?.trim()) return;
  await fetch(`${API_BASE_URL}/portfolio/${postId}/comment/${comment._id}/reply`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: comment.replyText }),
  });
  comment.replyText = "";
  comment.replying = false;
  await fetchFeed();
};

const toggleComments = (id: string) => {
  openComments.value = openComments.value === id ? "" : id;
};

const isLiked = (post: any) => post.likes.includes(userId);

const sharePost = async (post: any) => {
  const link = `${window.location.origin}/portfolio/${post._id}`;
  if (navigator.share) {
    await navigator.share({ title: post.title, text: post.description, url: link });
  } else {
    await navigator.clipboard.writeText(link);
    alert("Post link copied!");
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
