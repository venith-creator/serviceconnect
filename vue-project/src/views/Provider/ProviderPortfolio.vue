<template>
  <ProviderDashboardLayout>
    <div class="min-h-screen  flex flex-col">
    <main class="flex-1 p-4 sm:p-6 overflow-x-hidden">
    <div class="p-4 sm:p-6 w-full sm:max-w-3xl mx-auto space-y-10 overflow-x-hidden">
      <h1 class="text-2xl sm:text-3xl font-bold text-purple-600">My Portfolio</h1>

      <!-- Alert -->
      <transition name="fade">
        <div
          v-if="alertMsg"
          :class="[
            'p-3 rounded-lg text-center font-medium',
            alertType === 'error'
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700',
          ]"
        >
          {{ alertMsg }}
        </div>
      </transition>
       <!-- Upload Section -->
      <form
        @submit.prevent="uploadPost"
        class="border-2 border-dashed border-purple-400 rounded-xl p-4 sm:p-6 bg-purple-50/30 hover:bg-purple-50 transition space-y-4 w-full overflow-hidden"
      >
        <input
          v-model="title"
          placeholder="Title"
          class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
        />

        <textarea
          v-model="description"
          placeholder="Write a description..."
          class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
        ></textarea>

        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700">
            Upload up to 5 media files
          </label>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            @change="handleFiles"
            class="block text-sm text-gray-700 w-full"
          />

          <div
            v-if="filePreviews.length"
            class="mt-3 flex flex-wrap gap-3 justify-start overflow-hidden"
          >
            <div
              v-for="(src, idx) in filePreviews"
              :key="idx"
              class="relative w-24 h-24 border border-purple-300 rounded-lg overflow-hidden flex-shrink-0"
            >
              <img
                v-if="files[idx] && files[idx].type.startsWith('image')"
                :src="src"
                alt="preview"
                class="object-cover w-full h-full"
              />
              <video
                v-else
                :src="src"
                class="object-cover w-full h-full"
                controls
              ></video>

              <!-- ❌ Remove Button -->
              <button
                @click.prevent="removeFile(idx)"
                class="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 w-full sm:w-auto"
        >
          {{ isLoading ? "Uploading..." : "Post" }}
        </button>
      </form>

      <!-- Feed -->
      <div v-if="posts.length" class="space-y-10">
        <div
          v-for="post in posts"
          :key="post._id"
          class="border-b border-gray-200 pb-6 space-y-3"
        >
          <!-- Header -->
          <div class="flex  items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold">
              <img
                v-if="post.provider?.user?.avatar"
                :src="post.provider.user.avatar"
                alt="Avatar"
                class="w-full h-full rounded-full object-cover"
                @error="post.provider.user.avatar = ''"
              />
              <span v-else>{{ getInitials(getSafeName(post.provider?.user)) }}</span>
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
          <div class="ml-auto relative" v-if="post.provider?.user?._id === userId">
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

            <!-- Dropdown -->
            <div
              v-if="activeMenu === post._id"
              class="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-50 text-sm"
            >
              <button
                @click="confirmDelete(post._id)"
                class="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 rounded-lg"
              >
                Delete Post
              </button>
            </div>
          </div>
          </div>
          <!-- Content -->
          <div>
            <p class="font-semibold text-gray-900 text-base">{{ post.title }}</p>
            <p class="text-gray-700 whitespace-pre-line">{{ post.description }}</p>
          </div>

          <!-- Media -->
          <div
            v-if="post.media.length"
            class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            <template v-for="(mediaItem, idx) in post.media" :key="idx">
              <img
                v-if="mediaItem.type === 'image'"
                :src="mediaItem.url"
                alt="Media"
                class="rounded-xl w-full h-52 object-cover"
              />
              <video
                v-else
                controls
                class="rounded-xl w-full h-52 object-cover"
              >
                <source :src="mediaItem.url" type="video/mp4" />
              </video>
            </template>
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
                <!-- Comment Item -->
                <div class="space-y-1">
                  <!-- Header Row -->
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-xs">
                        <img
                          v-if="comment.author?.avatar"
                          :src="comment.author.avatar"
                          alt="avatar"
                          class="w-full h-full rounded-full object-cover"
                          @error="comment.author.avatar = ''"
                        />
                        <span v-else>{{ getInitials(getSafeName(comment.author)) }}</span>
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

                    <!-- Actions -->
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

                  <!-- Comment Text -->
                  <p class="text-gray-700 text-sm pl-8">{{ comment.text }}</p>
                </div>
                <!-- Replies -->
                <div v-if="comment.replies && comment.replies.length" class="pl-4 space-y-2">
                  <div
                      v-for="reply in comment.replies"
                      :key="reply._id"
                      class="bg-gray-50 border-l-2 border-purple-200 p-2 rounded"
                    >
                    <div class="flex items-start gap-2">
                        <div class="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-[10px]">
                          <img
                            v-if="reply.author?.avatar"
                            :src="reply.author.avatar"
                            alt="avatar"
                            class="w-full h-full rounded-full object-cover"
                            @error="reply.author.avatar = ''"
                          />
                          <span v-else>{{ getInitials(getSafeName(reply.author)) }}</span>
                        </div>
                        <div>
                          <div class="flex items-center gap-1">
                            <span class="font-medium text-gray-800 text-xs">
                              {{ reply.author?.name || "Unknown User" }}
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
                        @click="toggleReplyLike(post._id, comment._id, reply._id!)"
                        class="hover:text-purple-600"
                      >
                        <Heart
                          :size="12"
                          :class="reply.likes?.includes(userId) ? 'fill-current text-purple-600' : ''"
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
                    class="flex-1 min-w-[160px] border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none text-xs "
                  />
                  <button
                    @click="addReply(post._id, comment)"
                    class="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition text-xs w-full sm:w-auto"
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
                  class="flex-1 min-w-[180px] border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                />
                <button
                  @click="addComment(post._id)"
                  class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm w-full sm:w-auto"
                >
                  Send
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <div v-else class="text-center text-gray-500">No portfolio posts yet.</div>
    </div>
    </main>
  </div>
  </ProviderDashboardLayout>
</template>

<script setup lang="ts">
import ProviderDashboardLayout from "@/components/ProviderDashboardLayout.vue";
import { ref, onMounted } from "vue";
import { API_BASE_URL } from "@/config";
import { Heart, MessageCircle, Share2 } from "lucide-vue-next";

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

interface Post {
  _id: string;
  title: string;
  description: string;
  media: Array<{ type: string; url: string }>;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  provider: { _id: string; user: { _id: string; name: string; avatar: string } };
}
const userId:  string = localStorage.getItem("userId") || "";

const posts = ref<Post[]>([]);
const title = ref("");
const description = ref("");
const files = ref<File[]>([]);
const filePreviews = ref<string[]>([]);
const openComments = ref("");
const commentText = ref("");
const token = localStorage.getItem("token");
const isLoading = ref(false);
const alertMsg = ref("");
const alertType = ref<"error" | "success" | "">("");

const showAlert = (msg: string, type: "error" | "success" = "error") => {
  alertMsg.value = msg;
  alertType.value = type;
  setTimeout(() => {
    alertMsg.value = "";
    alertType.value = "";
  }, 4000);
};

const handleFiles = (e: Event) => {
  const selected = Array.from((e.target as HTMLInputElement).files || []);
  if (selected.length + files.value.length > 5) {
    showAlert("You can only upload up to 5 files", "error");
    return;
  }
  const MAX_SIZE_MB = 5
    for (const file of selected) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        showAlert(`"${file.name}" is too large (max ${MAX_SIZE_MB}MB)`, "error")
        return
      }
    }
  files.value.push(...selected);
  filePreviews.value = files.value.map((f) => URL.createObjectURL(f));
};

const getSafeName = (user?: { name?: string; _id?: string }) => {
  if (user?.name?.trim()) return user.name;
  if (user?._id) return `User-${user._id.slice(-4)}`;
  return "Unknown User";
};

const getInitials = (name?: string) => {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
};


const removeFile = (index: number) => {
  files.value.splice(index, 1)
  filePreviews.value.splice(index, 1)
}

const activeMenu = ref<string | null>(null)

const toggleMenu = (postId: string) => {
  activeMenu.value = activeMenu.value === postId ? null : postId
}

const fetchPosts = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/provider/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    posts.value = await res.json();
  } catch (err: any) {
    showAlert(err.message || "Failed to load posts", "error");
  }
};

const uploadPost = async () => {
  if (!title.value.trim() && !files.value.length) {
    showAlert("Please add a title or file");
    return;
  }
  isLoading.value = true;
  try {
    const form = new FormData();
    form.append("title", title.value);
    form.append("description", description.value);
    files.value.forEach((f) => form.append("media", f));
    const res = await fetch(`${API_BASE_URL}/portfolio`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) throw new Error("Upload failed");
    showAlert("Portfolio uploaded successfully", "success");
    title.value = "";
    description.value = "";
    files.value = [];
    filePreviews.value = [];
    await fetchPosts();
  } catch (err: any) {
    showAlert(err.message, "error");
  } finally {
    isLoading.value = false;
  }
};

const toggleLike = async (id: string) => {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/${id}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Like failed");
    await fetchPosts();
  } catch (err: any) {
    showAlert(err.message, "error");
  }
};

const addComment = async (id: string) => {
  if (!commentText.value.trim()) return;
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/${id}/comment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: commentText.value }),
    });
    if (!res.ok) throw new Error("Failed to post comment");
    commentText.value = "";
    await fetchPosts();
  } catch (err: any) {
    showAlert(err.message, "error");
  }
};

const addReply = async (postId: string, comment: Comment) => {
  if (!comment.replyText?.trim()) return;

  try {
    const res = await fetch(
      `${API_BASE_URL}/portfolio/${postId}/comment/${comment._id}/reply`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: comment.replyText }),
      }
    );

    if (!res.ok) throw new Error("Failed to add reply");
    comment.replyText = "";
    comment.replying = false;
    showAlert("Reply added!", "success");
    await fetchPosts();
  } catch (err: any) {
    showAlert(err.message, "error");
  }
};

const toggleCommentLike = async (postId: string, commentId: string) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/portfolio/${postId}/comment/${commentId}/like`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) throw new Error("Failed to like comment");
    await fetchPosts();
  } catch (err: any) {
    showAlert(err.message, "error");
  }
};

const toggleReplyLike = async (
  postId: string,
  commentId: string,
  replyId: string
) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/portfolio/${postId}/comment/${commentId}/reply/${replyId}/like`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) throw new Error("Failed to like reply");
    await fetchPosts();
  } catch (err: any) {
    showAlert(err.message, "error");
  }
};

const toggleComments = (id: string) => {
  openComments.value = openComments.value === id ? "" : id;
};

const isLiked = (post: Post) => {
  const uid = localStorage.getItem("userId");
  return post.likes.includes(uid || "");
};

const sharePost = async (post: Post) => {
  const link = `${window.location.origin}/portfolio/${post._id}`;
  if (navigator.share) {
    try {
      await navigator.share({
        title: post.title,
        text: post.description,
        url: link,
      });
    } catch {}
  } else {
    await navigator.clipboard.writeText(link);
    showAlert("Post link copied!", "success");
  }
};

const confirmDelete = (postId: string) => {
  if (confirm("Are you sure you want to delete this post?")) {
    deletePost(postId);
  }
};

const deletePost = async (postId: string) => {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete post");
    posts.value = posts.value.filter((p) => p._id !== postId);
    showAlert("Post deleted successfully", "success");
  } catch (err: any) {
    showAlert(err.message, "error");
  }
};


onMounted(fetchPosts);
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
@media (max-width: 640px) {
  form {
    padding: 1rem !important;
    border-radius: 0.75rem !important;
  }

  /* Prevent the file preview box from forcing horizontal scroll */
  .flex-wrap {
    flex-wrap: wrap !important;
  }

  .w-24.h-24 {
    width: 5rem !important;
    height: 5rem !important;
  }

  /* Make inputs, textarea, and button stretch nicely */
  input,
  textarea,
  button {
    width: 100% !important;
  }

  /* Just in case something still causes overflow */
  form,
  .space-y-4 {
    overflow-x: hidden !important;
  }
}

</style>
