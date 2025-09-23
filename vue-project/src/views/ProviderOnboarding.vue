<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- Header -->
    <header class="px-6 py-4 border-b text-center">
      <h1 class="text-2xl font-bold text-purple-600">Service Provider Onboarding</h1>
      <div class="flex items-center gap-3 mt-2 justify-center max-w-lg mx-auto">
        <p class="text-sm text-gray-600">Step {{ step }} of 4</p>
        <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-sm">
          <div
            class="h-2 bg-purple-600 transition-all duration-300"
            :style="{ width: progress + '%' }"
          ></div>
        </div>
        <p class="text-sm font-medium text-gray-700">{{ progress }}%</p>
      </div>
    </header>

    <main v-if="onboardingStatus" class="flex-1 flex items-center justify-center p-6">
      <div class="max-w-lg text-center p-8 border rounded-xl shadow bg-white">
        <h2 v-if="onboardingStatus === 'success'" class="text-2xl font-bold text-green-600">
          Onboarding Completed 🎉
        </h2>
        <h2 v-else-if="onboardingStatus === 'incomplete'" class="text-2xl font-bold text-red-600">
          Onboarding Incomplete
        </h2>
        <p class="mt-4 text-gray-700">
          <span v-if="onboardingStatus === 'success'">
            You completed your onboarding process, congratulations! <br />
            Please wait 24–48hrs for approval by our admins.
          </span>
          <span v-else>
            Please complete your onboarding process so as to get your provider profile approved.
            Service Connect would like to have you.
          </span>
        </p>
      </div>
    </main>

    <!-- Main -->
    <main class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      <!-- Left: Step content -->
      <section class="md:col-span-2 bg-white border rounded-xl shadow p-6 space-y-4">
        <!-- Step 1 -->
        <div v-if="step === 1">
          <div class="text-center">
          <DocumentIcon class="h-10 w-10 text-purple-600 mx-auto" />
          <h2 class="mt-3 text-xl font-semibold">
            Upload Proof Documents
          </h2>
          <p class="text-gray-600 mt-1">
            Upload your ID, certificates, and other relevant documents to verify your identity.
          </p>
          </div>

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

          <ul class="mt-4 grid grid-cols-2 gap-3">
            <li
              v-for="(doc, i) in form.docs"
              :key="i"
              class="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 relative"
            >
              <DocumentIcon class="w-8 h-8 text-purple-500" />
              <div class="flex-1">
                <p class="text-sm text-gray-700 truncate">{{ doc.name }}</p>
                <p class="text-xs text-gray-400">Preview only</p>
              </div>
              <button
                class="absolute top-1 right-1 text-red-500 hover:text-red-700"
                @click="removeDoc(i)"
              >
                ✕
              </button>
            </li>
          </ul>


          <div v-if="!form.docs.length" class="mt-2 text-sm text-gray-500">
            No documents uploaded yet.
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
        <div v-else-if="step === 2" >
          <div class="text-center">
          <WrenchScrewdriverIcon class="h-10 w-10 text-purple-600 mx-auto" />
          <h2 class="mt-3 text-xl font-semibold">
            Select Service Categories
          </h2>
          <p class="text-gray-600 mt-1">Choose your services. You can select multiple categories.</p>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            <button
              v-for="cat in categories"
              :key="cat.name"
              @click="toggleCategory(cat.name)"
              :class="[
                'px-4 py-3 rounded border flex items-center justify-center text-sm font-medium',
                selectedCategories.includes(cat.name)
                  ? 'bg-purple-100 border-purple-600 text-purple-700'
                  : 'bg-white hover:bg-gray-100'
              ]"
            >
            <div class="text-center relative">
             <component :is="cat.icon" class="w-6 h-6 mb-1 text-gray-600 mx-auto mt-1" />
          {{ cat.name }}
          </div>
              <CheckIcon
              v-if="selectedCategories.includes(cat.name)"
              class="w-4 h-4 absolute top-2  right-2 text-purple-600"
            />
            </button>
          </div>

          <!-- Selected services list -->
          <div v-if="selectedCategories.length" class="mt-4 bg-green-50 p-3 rounded text-sm">
            <p class="font-semibold">Selected Services:</p>
            <ul class="space-y-2 mt-2">
            <li
              v-for="(s, i) in selectedCategories"
              :key="i"
              class="flex items-center justify-between bg-green-100 px-3 py-1 rounded"
            >
              <span class="text-gray-800">{{ s }}</span>
              <button
                class="text-red-600 hover:text-red-800 text-sm"
                @click="removeCategory(i)"
              >
                ✕
              </button>
            </li>
          </ul>

          </div>
          <div v-else class="mt-2 text-sm text-gray-500">
            No services selected yet.
          </div>

          <div class="mt-6 bg-blue-50 p-4 rounded">
            <div class="text-center">
            <p class="font-semibold">Can’t find your service?</p>
            <p class="text-gray-500"> Tell us what you do and we will help you get started</p>
            </div>
            <div class="flex gap-2 mt-2 relative">
              <input
                v-model="customCategory"
                placeholder="Enter your service here"
                class="flex-1 border rounded px-3 py-2"
              />
              <button
                @click="addCustomCategory"
                class="bg-purple-600 text-white px-4 py-2 rounded flex right-0 absolute"
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        <!-- Step 3 -->
        <div v-else-if="step === 3" >
          <div class="text-center">
          <CameraIcon class="h-10 w-10 text-purple-600 mx-auto" />
          <h2 class="mt-3 text-xl font-semibold">
             Add Portfolio
          </h2>
          <p class="text-gray-600 mt-1">Showcase your work. Upload project photos.</p>
          </div>
          <div
            class="mt-4 border-2 bord*er-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer"
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

          <div class="grid grid-cols-3 gap-3 mt-4">
            <div v-for="(img, i) in form.portfolio" :key="i" class="relative group">
              <img :src="img.url || img.preview" class="w-full h-24 object-cover rounded cursor-pointer"
                  @click="preview(img.url || img.preview)" />
              <input
                v-model="img.caption"
                placeholder="Add caption"
                class="mt-1 text-xs border rounded px-2 py-1 w-full"
              />
              <button
                class="absolute top-1 right-1 bg-red-600 text-white text-xs p-1 rounded"
                @click="removePortfolio(i)"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Preview modal -->
          <div v-if="showPreview" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div class="relative">
              <img :src="showPreview" class="max-h-[80vh] rounded shadow" />
              <button class="absolute top-2 right-2 text-white bg-red-600 p-2 rounded" @click="showPreview=null">✕</button>
            </div>
          </div>
          <div v-if="!form.portfolio.length" class="mt-2 text-sm text-gray-500">
            No portfolio photos uploaded yet.
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
        <div v-else-if="step === 4" >
          <div class="text-center">
          <UserIcon class="h-10 w-10 text-purple-600 mx-auto" />
          <h2 class="mt-3 text-xl font-semibold">
             Profile Setup
          </h2>
          <p class="text-gray-600 mt-1">Complete your profile with a bio and hourly rate.</p>
          </div>

          <div class="mt-4 flex flex-col items-center">
            <div class="relative w-24 h-24">
              <img
                :src="profile.photo?.preview || defaultAvatar"
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
          </div>

          <div class="mt-4">
            <label class="font-medium text-gray-700">Full Name</label>
            <input v-model="profile.name" class="w-full border rounded px-3 py-2 mt-1" />
          </div>
          <div class="mt-4">
            <label class="font-medium text-gray-700">Professional Bio</label>
          <textarea
            v-model="profile.bio"
            placeholder="Tell your customers about your experience and specialties..."
            rows="4"
            class="w-full border rounded px-3 py-2 mt-4"></textarea>
        </div>

          <div class="mt-4">
            <label class="font-medium text-gray-700">Hourly Rate ($)</label>
            <input
              v-model.number="profile.rate"
              type="number"
              min="1"
              class="w-full border rounded px-3 py-2 mt-1"
            />
          </div>
          <p class="text-gray-600 mt-1">This is your base rate, you can adjust pricing for specific jobs.</p>
          <div class="mt-4">
            <label class="font-medium text-gray-700">Service Radius (km)</label>
            <input v-model="profile.serviceRadiusKm" type="number" min="1" class="w-full border rounded px-3 py-2 mt-1" />
          </div>

          <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input v-model="profile.city" placeholder="City" class="border rounded px-3 py-2" />
            <input v-model="profile.state" placeholder="State" class="border rounded px-3 py-2" />
            <input v-model="profile.country" placeholder="Country" class="border rounded px-3 py-2" />
          </div>

          <div class="mt-4">
            <label class="font-medium text-gray-700">Years of Experience</label>
            <input v-model="profile.yearsOfExperience" type="number" min="0" class="w-full border rounded px-3 py-2 mt-1" />
          </div>

          <div class="mt-4">
            <label class="font-medium text-gray-700">Languages</label>
            <input v-model="profile.languages" placeholder="e.g. English, French" class="w-full border rounded px-3 py-2 mt-1" />
          </div>

          <div class="mt-4">
            <label class="font-medium text-gray-700">Availability</label>
            <input v-model="profile.availability" placeholder="e.g. Weekdays, Weekends" class="w-full border rounded px-3 py-2 mt-1" />
          </div>

          <div class="mt-4">
            <label class="font-medium text-gray-700">Payment Options</label>
            <input v-model="profile.paymentOptions" placeholder="e.g. Cash, Card, Transfer" class="w-full border rounded px-3 py-2 mt-1" />
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
              :disabled="submitting"
            >
            <span v-if="submitting">Submitting...</span>
            <span v-else>
              Complete Onboarding & Start Getting Jobs</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Right: Progress Checklist -->
      <aside class="bg-white border rounded-xl shadow p-6 space-y-4">
        <div class="text-center">
        <WrenchScrewdriverIcon class="w-16 h-16 text-purple-600 bg-blue-50 rounded-full mx-auto p-4" />
        <div class=" text-lg font-semibold ">
           Almost There!
        </div>
        <p class="text-gray-600 text-sm">
          Complete your profile to start receiving job offers from customers in your area.
        </p>
      </div>
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
  CheckIcon, BoltIcon, PaintBrushIcon, BuildingOfficeIcon,
  SunIcon, TruckIcon, SparklesIcon, WrenchIcon
} from "@heroicons/vue/24/outline";
import { useRouter } from "vue-router";
import { API_BASE_URL } from "@/config";

const router = useRouter();

// State
const submitting = ref(false);
const onboardingStatus = ref(null);
const showPreview = ref(null);
const step = ref(1);
const form = ref({
  docs: [],
  portfolio: [],
});
const selectedCategories = ref([]);
const customCategory = ref("");
const profile = ref({ name: "", bio: "", rate: "", photo: null, serviceRadiusKm: "",
  city: "",
  state: "",
  country: "",
  yearsOfExperience: "",
  languages: "",
  availability: "",
  paymentOptions: ""}); // ideally fetch from auth store
const defaultAvatar = "/default-avatar.png";

const categories = [
  { name: "Plumber", icon: WrenchScrewdriverIcon },
  { name: "Electrician", icon: BoltIcon },
  { name: "Painter", icon: PaintBrushIcon },
  { name: "Builder", icon: BuildingOfficeIcon },
  { name: "Gardener", icon: SunIcon },
  { name: "Driver", icon: TruckIcon },
  { name: "Cleaner", icon: SparklesIcon },
  { name: "Photographer", icon: CameraIcon },
  { name: "Carpenter", icon: WrenchIcon },
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
async function handleDocsUpload(e) {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  // show chosen names immediately
  form.value.docs.push(...files.map(f => ({
    name: f.name,
    preview: URL.createObjectURL(f), // optional: link to open locally
    file: f // keep raw file in case you want re-upload later
  })));

  completedSteps.value.documents = form.value.docs.length > 0;
}
function removeDoc(i) {
  form.value.docs.splice(i, 1);
  completedSteps.value.documents = form.value.docs.length > 0;
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
function removeCategory(i) {
  selectedCategories.value.splice(i, 1);
  completedSteps.value.categories = selectedCategories.value.length > 0;
}
async function handlePortfolioUpload(e) {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  // preview immediately
  form.value.portfolio.push(...files.map(f => ({
    caption: "",
    preview: URL.createObjectURL(f),
    file: f
  })));

  completedSteps.value.portfolio = form.value.portfolio.length > 0;
}

function removePortfolio(i) {
  form.value.portfolio.splice(i, 1);
  completedSteps.value.portfolio = form.value.portfolio.length > 0;
}
function preview(url) {
  showPreview.value = url;
}
async function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  profile.value.photo = {
    file,
    preview: URL.createObjectURL(file),
  };
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
  submitting.value = true;
  try {

    const fd = new FormData();

    // Append docs
    form.value.docs.forEach((d) => {
      fd.append("docs", d.file);
    });

    // Append portfolio
    form.value.portfolio.forEach((p, i) => {
      fd.append("portfolio", p.file);
      fd.append(`portfolioCaptions[${i}]`, p.caption);
    });

    // Append avatar
    if (profile.value.photo?.file) {
      fd.append("avatar", profile.value.photo.file);
    }

    // Append JSON fields
    const payload = {
      services: selectedCategories.value.map((c) => ({ category: c })),
      description: profile.value.bio,
      rate: profile.value.rate,
      serviceRadiusKm: profile.value.serviceRadiusKm,
      city: profile.value.city,
      state: profile.value.state,
      country: profile.value.country,
      yearsOfExperience: profile.value.yearsOfExperience,
      languages: profile.value.languages,
      availability: profile.value.availability,
      paymentOptions: profile.value.paymentOptions,
      insurance: profile.value.insurance || false,
      badges: profile.value.badges || []
    };
    fd.append("data", JSON.stringify(payload));
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/provider-profiles`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: fd,
    });
    if (!res.ok) throw new Error("Onboarding failed");
    if (!form.value.docs.length || !selectedCategories.value.length || !form.value.portfolio.length || !profile.value.bio || !profile.value.rate) {
      onboardingStatus.value = "incomplete";
    } else {
      onboardingStatus.value ="success"
    }

    router.push("/dashboard/provider")

  } catch (err) {
    onboardingStatus.value = "incomplete";
    alert(err.message);
  } finally {
    submitting.value = false;
  }
}
</script>
