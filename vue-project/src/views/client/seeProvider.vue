<template>
  <ClientDashboardLayout>
    <div class="max-w-5xl mx-auto p-6 space-y-8">

      <!-- Provider Header -->
      <div v-if="provider?.user" class="bg-white p-6 rounded-xl shadow-md">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div class="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-2xl overflow-hidden shadow">
              <img
                v-if="provider.user?.avatar"
                :src="provider.user.avatar"
                alt="avatar"
                class="w-full h-full object-cover rounded-full"
                @error="provider.user.avatar = ''"
              />
              <span v-else>{{ getInitials(getSafeName(provider.user)) }}</span>
            </div>
          <div class="flex-1 text-center sm:text-left">
            <h2 class="text-2xl font-semibold text-purple-700">
              {{ provider.user.name }}
            </h2>
            <p class="text-gray-600 mt-1">{{ provider.description || 'No description available.' }}</p>

            <!-- Rating -->
            <div class="flex justify-center sm:justify-start items-center mt-2 text-yellow-500">
              <span v-for="star in 5" :key="star">
                <i class="fa" :class="star <= Math.round(provider.ratingAvg) ? 'fa-star' : 'fa-star-o'"></i>
              </span>
              <span class="text-sm text-gray-600 ml-2">
                {{ provider.ratingAvg?.toFixed(1) || 0 }} / 5
              </span>
            </div>

            <!-- Experience + Location -->
            <div class="mt-3 text-gray-600 text-sm">
              <p><strong>Experience:</strong> {{ provider.yearsOfExperience || 0 }} years</p>
              <p><strong>Location:</strong> {{ provider.city }}, {{ provider.state }}, {{ provider.country }}</p>
            </div>

            <!-- Services -->
            <div v-if="provider.services?.length" class="mt-4">
              <h4 class="font-semibold text-gray-700">Services Offered:</h4>
              <ul class="mt-1 text-sm text-gray-600 list-disc list-inside">
                <li v-for="(s, i) in provider.services" :key="i">
                  {{ s.category }} — £{{ s.rate }}/hr
                </li>
              </ul>
            </div>

            <!-- Chat Button -->
            <button
              @click="startChat"
              class="mt-5 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg transition"
            >
              <i class="fa fa-comments mr-2"></i> Chat with {{ provider.user.name }}
            </button>
          </div>
        </div>
      </div>
      <!-- Completed / Past Jobs -->
        <div v-if="provider?.pastJobs?.length" class="bg-white p-6 rounded-xl shadow-md">
          <h3 class="text-xl font-semibold mb-5 text-gray-700">
            Completed Jobs by {{ provider.user.name }}
          </h3>

          <div class="space-y-5">
            <div
              v-for="job in provider.pastJobs"
              :key="job._id"
              class="border border-gray-100 p-4 rounded-lg hover:shadow transition"
            >
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-semibold text-gray-800">{{ job.title }}</p>
                  <p class="text-sm text-gray-600 mt-1">{{ job.description || 'No description provided.' }}</p>
                  <p class="text-xs text-gray-500 mt-2">
                    <strong>Status:</strong> {{ job.status }} <br />
                    <strong>Budget:</strong> £{{ job.budget || 0 }}
                  </p>
                  <p class="text-xs text-gray-500 mt-2">
                    <strong>Client:</strong> {{ job.client?.name || 'Unknown' }}
                  </p>
                </div>
                <div class="text-right text-xs text-gray-400">
                  <p>Started: {{ new Date(job.createdAt).toLocaleDateString() }}</p>
                  <p v-if="job.completedAt">Completed: {{ new Date(job.completedAt).toLocaleDateString() }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="bg-white p-6 rounded-xl shadow-md text-gray-500 italic">
          No completed jobs yet.
        </div>

      <!-- Previous Posts -->
        <div v-if="posts.length" class="bg-white p-6 rounded-xl shadow-md">
          <h3 class="text-xl font-semibold mb-5 text-gray-700">
            Previous Posts by {{ provider.user.name }}
          </h3>

          <div class="space-y-8">
            <div
              v-for="post in posts"
              :key="post._id"
              class="border-b border-gray-100 p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition bg-white"
            >
              <!-- Post header -->
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center text-purple-700 font-semibold">
                    <img
                      v-if="post.provider?.user?.avatar"
                      :src="post.provider.user.avatar"
                      alt="avatar"
                      class="w-full h-full object-cover"
                      @error="post.provider.user.avatar = ''"
                    />
                    <span v-else>{{ getInitials(getSafeName(post.provider?.user)) }}</span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-800">
                      {{ post.provider?.user?.name }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ new Date(post.createdAt).toLocaleString() }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Post content -->
              <p class="font-semibold text-gray-900">{{ post.title }}</p>
              <p class="text-gray-700 text-sm mt-1 whitespace-pre-line">
                {{ post.description }}
              </p>

              <!-- Media preview -->
              <div v-if="post.media?.length" class="mt-3 flex gap-3 overflow-x-auto">
                <!-- Images -->
                <img
                  v-for="(image, idx) in post.media.filter(m => m.type === 'image')"
                  :key="`img-${idx}`"
                  :src="image.url"
                  @click="openImage(image.url)"
                  alt="post media"
                  class="rounded-lg w-40 h-40 object-cover flex-shrink-0"
                />

                <!-- Videos -->
                <video
                  v-for="(video, idx) in post.media.filter(m => m.type === 'video')"
                  :key="`vid-${idx}`"
                  controls
                  class="rounded-lg w-40 h-40 object-cover flex-shrink-0"
                >
                  <source :src="video.url" type="video/mp4" />
                </video>
              </div>
              <!-- Action row -->
              <div class="flex items-center gap-6 mt-3 text-sm text-gray-600">
                <button
                  @click="togglePostLike(post._id)"
                  class="flex items-center gap-1 cursor-pointer"
                  title="Like post"
                >
                  <Heart
                    :size="16"
                    :class="post.likes?.includes(userId) ? 'fill-current text-red-500' : 'text-gray-500'"
                  />
                  <span>{{ post.likes?.length || 0 }}</span>
                </button>
                <div
                class="flex items-center gap-1 cursor-pointer"
                role="button"
                tabindex="0"
                @click="toggleComments(post._id)"
                @keydown.enter="toggleComments(post._id)"
                aria-label="Toggle comments"
                title="View comments"
              >
                <MessageCircle class="w-4 h-4 text-blue-500" />
                <span>{{ post.comments?.length || 0 }}</span>
              </div>
              </div>

              <!-- Comments -->
              <transition name="fade">
                <div v-if="openComments === post._id" class="mt-3 space-y-4 border-t pt-3">
                  <div
                    v-for="comment in post.comments"
                    :key="comment._id"
                    class="text-sm bg-gray-100 rounded-lg p-3 text-gray-800 space-y-2"
                  >
                    <!-- Comment header -->
                    <div class="space-y-1">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <div
                            class="w-6 h-6 rounded-full flex items-center justify-center bg-purple-100 text-purple-700 text-[10px] font-semibold overflow-hidden"
                          >
                            <img
                              v-if="comment.author?.avatar"
                              :src="comment.author.avatar"
                              alt="avatar"
                              class="w-full h-full object-cover"
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

                        <div class="flex items-center space-x-3 text-gray-500 text-xs">
                          <button
                            @click="toggleCommentLike(post._id, comment._id)"
                            class="flex items-center space-x-1 hover:text-purple-600"
                          >
                            <Heart
                              :size="14"
                              :class="comment.likes?.includes(userId) ? 'fill-current text-purple-600' : ''"
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
                          <div
                            class="w-6 h-6 rounded-full flex items-center justify-center bg-purple-100 text-purple-700 text-[10px] font-semibold overflow-hidden"
                          >
                            <img
                              v-if="reply.author?.avatar"
                              :src="reply.author.avatar"
                              alt="avatar"
                              class="w-full h-full object-cover"
                              @error="reply.author.avatar = ''"
                            />
                            <span v-else>{{ getInitials(getSafeName(reply.author)) }}</span>
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
                      v-model="post.commentText"
                      placeholder="Add a comment..."
                      class="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                    />
                    <button
                      @click="addComment(post._id, post)"
                      class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <div v-else class="bg-white p-6 rounded-xl shadow-md text-gray-500 italic">
          No previous posts by this provider.
        </div>

      <!-- Reviews -->
      <div class="bg-white p-6 rounded-xl shadow-md">
        <h3 v-if="provider?.user" class="text-xl font-semibold mb-5 text-gray-700">
          Reviews for {{ provider.user.name }}
        </h3>

        <div v-if="reviews.length" class="space-y-5">
          <div
            v-for="review in reviews"
            :key="review._id"
            class="border border-gray-100 p-4 rounded-lg hover:shadow transition"
          >
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-base overflow-hidden">
                <img
                  v-if="review.reviewer?.avatar"
                  :src="review.reviewer.avatar"
                  alt="avatar"
                  class="w-full h-full object-cover rounded-full"
                  @error="review.reviewer.avatar = ''"
                />
                <span v-else>{{ getInitials(getSafeName(review.reviewer)) }}</span>
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-center">
                  <p class="font-medium text-gray-800">{{ review.reviewer?.name }}</p>
                  <div class="flex text-yellow-500 text-sm">
                    <i
                      v-for="n in 5"
                      :key="n"
                      class="fa"
                      :class="n <= review.rating ? 'fa-star' : 'fa-star-o'"
                    ></i>
                  </div>
                </div>
                <p v-if="review.job?.title" class="text-xs text-gray-500 mt-1">
                  For job: <span class="font-medium">{{ review.job.title }}</span>
                </p>
                <p class="mt-2 text-gray-700 text-sm">{{ review.comment }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-gray-500 italic text-center py-5">
          No reviews yet for this provider.
        </div>
      </div>
    </div>
    <!-- Image Modal -->
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
        @click.self="closeModal"
      >
        <div class="relative max-w-3xl w-full mx-4">
          <button
            @click="closeModal"
            class="absolute -top-10 right-0 bg-white rounded-full p-2 shadow"
          >
            ✕
          </button>
          <img
            :src="selectedImage"
            class="w-full h-auto rounded-lg object-contain"
            alt="Preview"
          />
        </div>
      </div>
  </ClientDashboardLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import ClientDashboardLayout from "@/components/ClientDashboardLayout.vue";
import { API_BASE_URL } from "@/config";
import { Heart, MessageCircle } from "lucide-vue-next";

const userId = localStorage.getItem("userId");
const route = useRoute();
const router = useRouter();
const provider = ref(null);
const reviews = ref([]);
const posts = ref([]);

const openComments = ref(null);

const showModal = ref(false);
const selectedImage = ref("");

const openImage = (url) => {
  selectedImage.value = url;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedImage.value = "";
};

const getSafeName = (user) => {
  if (user?.name?.trim()) return user.name;
  if (user?._id) return `User-${user._id.slice(-4)}`;
  return "Unknown User";
};

const toggleComments = (postId) => {
  openComments.value = openComments.value === postId ? null : postId;
};

const getInitials = (name) => {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
};


const fetchProvider = async () => {
  const res = await fetch(`${API_BASE_URL}/provider-profiles/${route.params.providerId}`);
  const data = await res.json();
  provider.value = data.profile;
  reviews.value = data.profile?.reviews || [];
};

const fetchProviderPosts = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/provider/${route.params.providerId}`);
    if (!res.ok) throw new Error("Failed to fetch provider posts");
    const data = await res.json();
    posts.value = data;
  } catch (err) {
    console.error("Error fetching provider posts:", err);
  }
};
const togglePostLike = async (postId) => {
  if (!localStorage.getItem("token")) return alert("Please log in to like a post");

  await fetch(`${API_BASE_URL}/portfolio/${postId}/like`, {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  await fetchProviderPosts();
};

const addComment = async (postId, post) => {
  if (!post.commentText?.trim()) return;
  const token = localStorage.getItem("token");

  await fetch(`${API_BASE_URL}/portfolio/${postId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text: post.commentText }),
  });

  post.commentText = "";
  await fetchProviderPosts();
};

const addReply = async (postId, comment) => {
  if (!comment.replyText?.trim()) return;
  const token = localStorage.getItem("token");

  await fetch(`${API_BASE_URL}/portfolio/${postId}/comment/${comment._id}/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text: comment.replyText }),
  });

  comment.replyText = "";
  comment.replying = false;
  await fetchProviderPosts();
};

const toggleCommentLike = async (postId, commentId) => {
  const token = localStorage.getItem("token");

  await fetch(`${API_BASE_URL}/portfolio/${postId}/comment/${commentId}/like`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  await fetchProviderPosts();
};

const toggleReplyLike = async (postId, commentId, replyId) => {
  const token = localStorage.getItem("token");

  await fetch(`${API_BASE_URL}/portfolio/${postId}/comment/${commentId}/reply/${replyId}/like`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  await fetchProviderPosts();
};

const startChat = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/chats/room/client-provider`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ providerId: provider.value?.user?._id }),
    });

    if (!res.ok) throw new Error("Failed to start chat");
    const room = await res.json();

    router.push({
      path: "/dashboard/client/Manageschat",
      query: { roomId: room._id },
    });
  } catch (err) {
    console.error("startChat error:", err);
    alert("Could not start chat. Please try again.");
  }
};

onMounted(() => {
  fetchProvider();
  fetchProviderPosts();
});
</script>

<style scoped>
.fa-star {
  color: #fbbf24;
}
</style>
