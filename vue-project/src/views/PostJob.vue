<template>
  <div class="min-h-screen bg-white p-6 space-y-6">

  <!-- Guest Note -->
      <div class="border rounded-xl bg-yellow-50 p-4 ">
        <h3 class="font-semibold text-yellow-700">Important for Guests</h3>
        <p class="text-sm text-yellow-800 mt-1">
          If you’re posting as a guest, please enter your correct email and phone number.
          This ensures that when you sign up later as a homeowner, you can track your posted jobs as long as you enter the email and phone number you inputed here.
        </p>
      </div>
  <div class="min-h-screen bg-white p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

    <!-- Page Title -->
    <h1 class="md:col-span-3 text-2xl font-bold text-purple-600 text-center mb-4">
      Post a new job
    </h1>

    <!-- Success Banner -->
    <div
      v-if="successMessage"
      class="md:col-span-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center"
    >
      ✅ {{ successMessage }}
    </div>

    <!-- Left: Form -->
    <section class="md:col-span-2 border rounded-xl shadow p-6 space-y-6">
      <!-- Job Details -->
      <div class="space-y-4">
        <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <ClipboardDocumentCheckIcon class="w-5 h-5 text-purple-600" />
          Job Details
        </h2>


        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Job Title</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="Plumber"
            class="mt-1 w-full border rounded px-3 py-2 focus:ring focus:ring-purple-200"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            v-model="form.description"
            placeholder="Describe your job in detail..."
            class="mt-1 w-full border rounded px-3 py-2 focus:ring focus:ring-purple-200 h-28"
          />
        </div>

        <!-- Grid Inputs -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Category -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Category</label>
            <select
              v-model="form.category"
              class="mt-1 w-full border rounded px-3 py-2 bg-white"
            >
              <option value="">Select category</option>
              <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
              <option value="other">Other</option>
            </select>
            <input
              v-if="form.category === 'other'"
              v-model="customCategory"
              type="text"
              placeholder="Enter custom category"
              class="mt-2 w-full border rounded px-3 py-2"
            />
          </div>

          <!-- Location -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Location</label>
             <div class="relative mt-1">
              <MapPinIcon class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              v-model="form.location"
              type="text"
              placeholder="Enter your address"
              class="mt-1 w-full border rounded px-3 py-2 pl-10"
            />
             </div>
          </div>

          <!-- Budget -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Budget (£)</label>
            <input
              v-model="form.budget"
              type="number"
              placeholder="e.g. 700"
              class="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          <!-- Timeline -->
          <div>
            <label class="block text-sm font-medium text-gray-700 ">Timeline</label>
            <div class="flex flex-col sm:flex-row gap-2">
              <input
                v-model="form.timelineStart"
                type="date"
                class="mt-1 w-full border rounded px-3 py-2"
              />
              <span class="self-center">to</span>
              <input
                v-model="form.timelineEnd"
                type="date"
                class="mt-1 w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="your@email.com"
              class="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Phone</label>
            <input
              v-model="form.phone"
              type="text"
              placeholder="+44 7484..."
              class="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <!-- Upload -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Upload images (optional)</label>
          <div
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer"
            @click="$refs.fileInput.click()"
          >
            <ArrowUpTrayIcon class="w-10 h-10 mx-auto text-gray-400" />
            <p class="mt-2 text-gray-600">Drag & drop or click to browse</p>
            <button class="mt-3 border px-4 py-2 rounded text-gray-700">Choose Files</button>
            <input
              ref="fileInput"
              type="file"
              multiple
              class="hidden"
              @change="handleFiles"
            />
          </div>
          <ul class="mt-3 space-y-2">
            <li v-for="(f, i) in attachments" :key="i" class="text-sm text-gray-600 flex justify-between">
              {{ f.name }}
              <button class="text-red-500" @click="removeFile(i)">✕</button>
            </li>
          </ul>
        </div>

        <!-- Submit -->
        <button
          @click="submitJob"
          class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700"
          :disabled="submitting"
        >
            <span v-if="submitting">Submitting...</span>
            <span v-else>Post Job</span>
        </button>
      </div>

    </section>

    <!-- Right: Tips -->
    <aside class="space-y-6">
      <div class="border rounded-xl bg-purple-50 p-4">
        <h3 class="font-semibold flex items-center gap-2 text-gray-800">
          <LightBulbIcon class="w-5 h-5 text-purple-600" />
          Tips for better results
        </h3>
        <ul class="mt-2 text-sm text-gray-700 space-y-1">
          <li>• Describe clearly what needs to be done</li>
          <li>• Include specific requirements and materials needed</li>
          <li>• Upload photos to help providers understand</li>
          <li>• Set a realistic budget and timeline</li>
          <li>• Be responsive to provider questions</li>
        </ul>
      </div>

      <div class="border rounded-xl p-4">
        <h3 class="font-semibold flex items-center gap-2 text-gray-800 mb-2">
          <MapPinIcon class="w-5 h-5 text-purple-600" />
          Location Preview
        </h3>
        <div class="bg-purple-100 h-32 flex items-center justify-center rounded overflow-hidden ">
          <iframe
              v-if="form.location"
              class="w-full h-32 rounded"
              :src="`https://www.google.com/maps?q=${encodeURIComponent(form.location)}&output=embed`"
              allowfullscreen
            ></iframe>
          <span v-else class="text-gray-500">Enter location to see map</span>
        </div>
      </div>

    </aside>
  </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { API_BASE_URL } from "@/config";
import {
  ArrowUpTrayIcon,
  ClipboardDocumentCheckIcon,
  LightBulbIcon,
  MapPinIcon,
} from "@heroicons/vue/24/outline";

const form = ref({
  title: "",
  description: "",
  category: "",
  location: "",
  budget: "",
  timelineStart: "",
  timelineEnd: "",
  email: "",
  phone: "",
});

const categories = ["Plumbing", "Electrical", "Cleaning", "Painting", "Carpentry"];
const customCategory = ref("");
const attachments = ref([]);
const submitting = ref(false);
const successMessage = ref("");

// Handle files
const handleFiles = (e) => {
  attachments.value = Array.from(e.target.files);
};
const removeFile = (i) => {
  attachments.value.splice(i, 1);
};

// Submit job with fetch
const submitJob = async () => {
  try {
    submitting.value = true;
    successMessage.value = "";
    const fd = new FormData();

    Object.entries(form.value).forEach(([k, v]) => {
      if (k === "category" && v === "other") {
        fd.append("category", customCategory.value || "Other");
      } else {
        fd.append(k, v);
      }
    });

    attachments.value.forEach((f) => fd.append("attachments", f));

    const res = await fetch(`${API_BASE_URL}/jobs`, {
      method: "POST",
      body: fd,
    });

    // Try to parse JSON only if response is JSON
    let data;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = { message: await res.text() }; // fallback (HTML error page, etc.)
    }

    if (!res.ok) {
      throw new Error(data.error || data.message || "Failed to post job");
    }


    successMessage.value = "Job posted successfully!";
    console.log("Created job:", data);

    Object.keys(form.value).forEach((key) => (form.value[key] = ""));
    attachments.value = [];
    customCategory.value = "";

    setTimeout(() => (successMessage.value = ""), 5000);
  } catch (err) {
    console.error("❌ Error posting job:", err);
    alert(err.message || "Error posting job");
  } finally {
    submitting.value = false; // stop loading
  }
};

</script>
