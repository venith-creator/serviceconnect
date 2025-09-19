<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- Header -->
    <header class="px-6 py-4 border-b">
      <h1 class="text-2xl font-bold text-purple-600">Service Provider Onboarding</h1>
      <div class="flex items-center gap-3 mt-2">
        <p class="text-sm text-gray-600">Step {{ step }} of 4</p>
        <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-2 bg-purple-600 transition-all duration-300"
            :style="{ width: progress + '%' }"
          ></div>
        </div>
        <p class="text-sm font-medium text-gray-700">{{ progress }}%</p>
      </div>
    </header>

    <!-- Main -->
    <main class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      <!-- Left: Step content -->
      <section class="md:col-span-2 bg-white border rounded-xl shadow p-6 space-y-4">
        <!-- Step 1 -->
        <div v-if="step === 1">
          <h2 class="flex items-center gap-2 text-xl font-semibold">
            <DocumentIcon class="h-6 w-6 text-purple-600" /> Upload Proof Documents
          </h2>
          <p class="text-gray-600">
            Upload your ID, certificates, and other relevant documents to verify your identity.
          </p>

          <!-- Upload box -->
          <div
            class="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer"
            @click="$refs.docsInput.click()"
          >
            <ArrowUpTrayIcon class="w-10 h-10 mx-auto text-gray-400" />
            <p class="mt-2 text-gray-600">Drag & drop your documents or click to browse</p>
            <button class="mt-3 border px-4 py-2 rounded text-gray-700">Choose Files</button>
            <input
              ref="docsInput"
              type="file"
              multiple
              class="hidden"
              @change="handleDocsUpload"
            />
          </div>

          <!-- Accepted docs -->
          <div class="mt-4 bg-blue-50 p-4 rounded text-sm text-gray-700">
            <p class="font-semibold">Documents we accept:</p>
            <ul class="list-disc list-inside">
              <li>Government-issued ID (Driver's License, National ID)</li>
              <li>Professional certificates or licenses</li>
              <li>Insurance documents (if applicable)</li>
              <li>Trade qualifications</li>
            </ul>
          </div>
        </div>

        <!-- Step 2 -->
        <div v-else-if="step === 2">
          <h2 class="flex items-center gap-2 text-xl font-semibold">
            <WrenchScrewdriverIcon class="h-6 w-6 text-purple-600" /> Select Service Categories
          </h2>
          <p class="text-gray-600">Choose your services. You can select multiple categories.</p>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            <button
              v-for="cat in categories"
              :key="cat"
              @click="toggleCategory(cat)"
              :class="[
                'px-4 py-3 rounded border flex items-center justify-center text-sm font-medium',
                selectedCategories.includes(cat)
                  ? 'bg-purple-100 border-purple-600 text-purple-700'
                  : 'bg-white hover:bg-gray-100'
              ]"
            >
              {{ cat }}
            </button>
          </div>

          <div class="mt-6 bg-blue-50 p-4 rounded">
            <p class="font-semibold">Can’t find your service?</p>
            <div class="flex gap-2 mt-2">
              <input
                v-model="customCategory"
                placeholder="Enter your service here"
                class="flex-1 border rounded px-3 py-2"
              />
              <button
                @click="addCustomCategory"
                class="bg-purple-600 text-white px-4 py-2 rounded"
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        <!-- Step 3 -->
        <div v-else-if="step === 3">
          <h2 class="flex items-center gap-2 text-xl font-semibold">
            <CameraIcon class="h-6 w-6 text-purple-600" /> Add Portfolio
          </h2>
          <p class="text-gray-600">Showcase your work. Upload project photos.</p>

          <div
            class="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer"
            @click="$refs.portfolioInput.click()"
          >
            <CameraIcon class="w-10 h-10 mx-auto text-gray-400" />
            <p class="mt-2 text-gray-600">Upload photos of your work</p>
            <button class="mt-3 border px-4 py-2 rounded text-gray-700">Choose Photos</button>
            <input
              ref="portfolioInput"
              type="file"
              multiple
              class="hidden"
              @change="handlePortfolioUpload"
            />
          </div>

          <div class="mt-4 bg-green-50 p-4 rounded text-sm text-gray-700">
            <p class="font-semibold">Portfolio Tips:</p>
            <ul class="list-disc list-inside">
              <li>Upload high-quality before/after photos</li>
              <li>Showcase diverse projects</li>
            </ul>
          </div>
        </div>

        <!-- Step 4 -->
        <div v-else-if="step === 4">
          <h2 class="flex items-center gap-2 text-xl font-semibold">
            <UserIcon class="h-6 w-6 text-purple-600" /> Profile Setup
          </h2>
          <p class="text-gray-600">Complete your profile with a bio and hourly rate.</p>

          <div class="mt-4 flex flex-col items-center">
            <div class="relative w-24 h-24">
              <img
                :src="profile.photo || defaultAvatar"
                class="w-24 h-24 rounded-full object-cover border"
              />
              <button
                class="absolute bottom-0 right-0 bg-purple-600 text-white p-1 rounded-full"
                @click="$refs.avatarInput.click()"
              >
                <CameraIcon class="w-4 h-4" />
              </button>
              <input ref="avatarInput" type="file" class="hidden" @change="handlePhotoUpload" />
            </div>
            <p class="mt-2 font-medium">{{ userName }}</p>
          </div>

          <textarea
            v-model="profile.bio"
            placeholder="Tell your customers about your experience and specialties..."
            class="w-full border rounded px-3 py-2 mt-4"
          ></textarea>

          <div class="mt-4">
            <label class="font-medium text-gray-700">Hourly Rate ($)</label>
            <input
              v-model="profile.rate"
              type="number"
              class="w-full border rounded px-3 py-2 mt-1"
            />
          </div>

          <div class="mt-6 bg-purple-50 p-4 rounded text-sm">
            <p class="font-semibold">Profile Summary:</p>
            <ul class="list-disc list-inside">
              <li>Categories: {{ selectedCategories.join(", ") || "None" }}</li>
              <li>Documents: {{ form.docs.length }} uploaded</li>
              <li>Portfolio: {{ form.portfolio.length }} photos</li>
            </ul>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between items-center mt-6">
          <button
            v-if="step > 1"
            @click="prevStep"
            class="border px-4 py-2 rounded text-gray-700"
          >
            Previous
          </button>
          <div class="ml-auto flex gap-3">
            <button
              v-if="step < 4"
              @click="nextStep"
              class="bg-purple-600 text-white px-6 py-2 rounded"
            >
              Next Step
            </button>
            <button
              v-else
              @click="submitOnboarding"
              class="bg-purple-600 text-white px-6 py-2 rounded"
            >
              Complete Onboarding & Start Getting Jobs
            </button>
          </div>
        </div>
      </section>

      <!-- Right: Progress Checklist -->
      <aside class="bg-white border rounded-xl shadow p-6 space-y-4">
        <div class="flex items-center gap-2 text-lg font-semibold">
          <WrenchScrewdriverIcon class="w-6 h-6 text-purple-600" /> Almost There!
        </div>
        <p class="text-gray-600 text-sm">
          Complete your profile to start receiving job offers from customers in your area.
        </p>
        <ul class="space-y-2">
          <li v-for="item in checklist" :key="item.key" class="flex items-center gap-2">
            <span
              class="w-5 h-5 flex items-center justify-center rounded-full border"
              :class="step === item.step ? 'bg-purple-600 text-white border-purple-600' : ''"
            >
              <CheckIcon v-if="completedSteps[item.key]" class="w-4 h-4" />
            </span>
            <span>{{ item.label }}</span>
          </li>
        </ul>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  DocumentIcon,
  CameraIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  ArrowUpTrayIcon,
  CheckIcon,
} from "@heroicons/vue/24/outline";
import { useRouter } from "vue-router";
import { API_BASE_URL } from "@/config";

const router = useRouter();

// State
const step = ref(1);
const form = ref({
  docs: [],
  portfolio: [],
});
const selectedCategories = ref([]);
const customCategory = ref("");
const profile = ref({ bio: "", rate: "", photo: null });
const userName = "Your Name"; // ideally fetch from auth store
const defaultAvatar = "/default-avatar.png";

const categories = [
  "Plumber",
  "Electrician",
  "Painter",
  "Builder",
  "Gardener",
  "Driver",
  "Cleaner",
  "Photographer",
  "Carpenter",
];

// Checklist
const checklist = [
  { key: "documents", label: "Documents", step: 1 },
  { key: "categories", label: "Categories", step: 2 },
  { key: "portfolio", label: "Portfolio", step: 3 },
  { key: "profile", label: "Profile", step: 4 },
];
const completedSteps = ref({});

// Progress
const progress = computed(() => (step.value / 4) * 100);

// Handlers
function handleDocsUpload(e) {
  form.value.docs = Array.from(e.target.files);
  completedSteps.value.documents = true;
}
function toggleCategory(cat) {
  if (selectedCategories.value.includes(cat)) {
    selectedCategories.value = selectedCategories.value.filter((c) => c !== cat);
  } else {
    selectedCategories.value.push(cat);
  }
  completedSteps.value.categories = selectedCategories.value.length > 0;
}
function addCustomCategory() {
  if (customCategory.value && !categories.includes(customCategory.value)) {
    selectedCategories.value.push(customCategory.value);
    completedSteps.value.categories = true;
    customCategory.value = "";
  }
}
function handlePortfolioUpload(e) {
  form.value.portfolio = Array.from(e.target.files);
  completedSteps.value.portfolio = form.value.portfolio.length > 0;
}
function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (file) profile.value.photo = URL.createObjectURL(file);
  completedSteps.value.profile = true;
}

// Navigation
function nextStep() {
  if (step.value < 4) step.value++;
}
function prevStep() {
  if (step.value > 1) step.value--;
}

// Submit
async function submitOnboarding() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/provider-profiles`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        services: selectedCategories.value,
        docs: form.value.docs.map((f) => f.name), // replace with actual upload
        portfolio: form.value.portfolio.map((f) => f.name),
        description: profile.value.bio,
        rate: profile.value.rate,
      }),
    });
    if (!res.ok) throw new Error("Onboarding failed");
    router.push("/dashboard/provider");
  } catch (err) {
    alert(err.message);
  }
}
</script>
