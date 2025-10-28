<template>
  <div class="bg-white">
    <!-- Hero Section -->
    <section
      class="relative min-h-screen flex items-center justify-center text-center bg-cover bg-center"
      style="background-image: url('/service-her.jpg');"
    >
      <div class="absolute inset-0 bg-black bg-opacity-50"></div>
      <div class="relative z-10 max-w-2xl mx-auto space-y-6 px-4">
        <h1 class="text-3xl md:text-2xl font-bold text-white">
          Find the right service provider for your needs
        </h1>
        <p class="text-white text-sm md:text-sm">
          Connect with skilled professionals for any task, from home repairs to personal assistance
        </p>
        <!-- Search Box -->
        <div
          class="border border-gray-200 rounded-lg shadow-md flex items-center p-7 mt-6 bg-transparent">
          <input
            type="text"
            placeholder="Enter your location"
            v-model="searchQuery"
            class="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none text-black"
          />
          <router-link
            :to="{ path: '/listing', query: { location: searchQuery } }"
            class="bg-primary text-white px-4 py-2 flex items-center gap-2 rounded-lg ml-2"
          >
            <MagnifyingGlassIcon class="w-5 h-5"/>
            Search for jobs
          </router-link>
        </div>
      </div>
    </section>

    <!--    &lt;!&ndash; Popular Categories &ndash;&gt;-->
    <!--    <section class="py-16 px-6 text-center">-->
    <!--      <h2 class="text-2xl font-bold text-black">Popular Categories</h2>-->
    <!--      <p class="text-gray-600">Find the service you need</p>-->

    <!--      <div class="grid grid-cols-2 sm:grid-cols-4 gap-10 mt-10 max-w-4xl mx-auto">-->
    <!--        <div v-for="cat in categories" :key="cat.name" class="flex flex-col items-center space-y-2">-->
    <!--          <div class="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100">-->
    <!--            <component :is="cat.icon" :class="['w-8 h-8', cat.color]" />-->
    <!--          </div>-->
    <!--          <p class="font-medium">{{ cat.name }}</p>-->
    <!--        </div>-->
    <!--      </div>-->
    <!--    </section>-->

    <!-- How It Works -->
    <section class="py-16 px-6 bg-white">
      <h2 class="text-2xl font-bold text-center mb-12">How it Works</h2>
      <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <!-- Step -->
        <div v-for="step in steps" :key="step.number" class="text-center md:text-left space-y-3">
          <img :src="step.img" class="w-full h-64 object-cover rounded-md"/>
          <div class="flex items-center gap-3 mt-2">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white font-bold">
              {{ step.number }}
            </div>
            <h3 class="font-semibold text-lg">{{ step.title }}</h3>
          </div>
          <p class="text-gray-600 text-sm">{{ step.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Featured Job Posts -->
    <section class="bg-primary/10 py-16 px-6 text-center">
      <h2 class="text-2xl font-bold text-black">Featured Job Posts</h2>
      <p class="text-gray-600 mb-8">Recent opportunities from homeowners in your area</p>

      <div class="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div
          v-for="job in jobs"
          :key="job._id"
          class="flex flex-col bg-white rounded-lg shadow overflow-hidden h-full"
        >
          <div class="p-6 flex-1 flex flex-col">
            <div class="flex justify-between items-start mb-3">
              <h3 class="font-semibold text-lg text-left" v-html="toTitleCase(job.title)"></h3>
              <span class="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full whitespace-nowrap ml-2">Open</span>
            </div>
            <p class="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
              {{ job.description || 'No description provided' }}
            </p>
            <div class="text-gray-500 text-sm space-y-2 mt-auto">
              <div class="flex items-center">
                <MapPinIcon class="h-4 w-4 text-gray-400 mr-1.5 flex-shrink-0"/>
                <span class="truncate">{{ job.location?.address || 'Location not specified' }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="font-medium">£{{ job.budget?.toLocaleString() || 'Negotiable' }}</span>
                <div class="flex items-center text-gray-400">
                  <ClockIcon class="h-4 w-4 mr-1"/>
                  <span class="text-xs">{{ new Date(job.createdAt).toDateString() }}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            @click="viewJobDetails(job._id)"
            class="bg-primary hover:bg-primary/90 text-white px-4 py-3 text-sm font-medium w-full text-center transition-colors"
          >
            View Details
          </button>
        </div>
      </div>

      <div class="mt-6" v-if="jobs.length">
        <button @click="viewAllJobs" class="text-black font-semibold flex items-center gap-2 mx-auto">
          View All
          <span class="bg-primary text-white rounded-full p-1">
            <ChevronRightIcon class="w-4 h-4"/>
          </span>
        </button>
      </div>

      <!-- Promo Banners -->
      <div class="grid md:grid-cols-2 gap-10 mt-10 max-w-6xl mx-auto">
        <div
          class="relative h-96 rounded-lg overflow-hidden bg-cover bg-center flex items-end p-8 text-left text-white"
          style="background-image: url('/content1.png');"
        >
          <div class="absolute inset-0 bg-primary/60"></div>
          <div class="relative z-10 w-full">
            <h3 class="font-bold text-xl">Find Trusted Service Providers</h3>
            <p class="text-sm mt-2">
              Get quality work done by professionals in your area.<br/>
              From repairs to personal services we connect you with the right people for the job.
            </p>
            <router-link
              to="/post-job"
              class="mt-6 block bg-primary text-white px-6 py-3 rounded-lg w-full text-center hover:bg-purple-600 transition-colors"
            >
              Post Job
            </router-link>

          </div>
        </div>

        <div
          class="relative h-96 rounded-lg overflow-hidden bg-cover bg-center flex items-end p-8 text-left text-white"
          style="background-image: url('/content2.png');"
        >
          <div class="absolute inset-0 bg-yellow-500/60"></div>
          <div class="relative z-10 w-full">
            <p class="text-sm">Are you a professional?</p>
            <h3 class="font-bold text-xl">Get Customers</h3>
            <p class="text-sm mt-2">
              Join thousands of service providers earning more through our platform.
            </p>
            <router-link
              to="/signup"
              class="mt-6 block bg-yellow-400 text-black px-6 py-3 rounded-lg w-full text-center hover:bg-yellow-300 transition-colors"
            >
              Join Service Providers
            </router-link>
          </div>
        </div>
      </div>

    </section>

    <!-- Testimonials -->
    <section class="py-16 px-6 bg-white text-center">
      <h2 class="text-2xl font-bold text-black">What Our Users Say</h2>
      <p class="text-gray-600">Real experiences from homeowners and professionals</p>

      <div class="max-w-2xl mx-auto mt-8 relative">
        <!-- Active Slide with Transition -->
        <transition name="fade" mode="out-in">
          <div
            v-if="testimonials[activeTestimonial]"
            :key="activeTestimonial"
            class="bg-primary/10 rounded-lg p-6 flex items-center gap-4"
          >
            <img :src="testimonials[activeTestimonial].img"
                 class="w-16 h-16 rounded-full object-cover"/>
            <div class="text-left">
              <div class="flex text-yellow-400">
                <StarIcon v-for="n in 5" :key="n" class="w-5 h-5"/>
              </div>
              <p class="text-gray-600 text-sm mt-2">“ {{ testimonials[activeTestimonial].text }}
                ”</p>
              <p class="font-bold text-black mt-2">{{ testimonials[activeTestimonial].name }}</p>
              <p class="text-xs text-gray-500">{{ testimonials[activeTestimonial].location }}</p>
            </div>
          </div>
        </transition>

        <!-- Navigation Arrows -->
        <button
          @click="prevTestimonial"
          class="absolute top-1/2 -left-8 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-300"
        >
          ‹
        </button>
        <button
          @click="nextTestimonial"
          class="absolute top-1/2 -right-8 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-300"
        >
          ›
        </button>

        <!-- Dots -->
        <div class="flex justify-center mt-4 space-x-2">
          <span
            v-for="(t, index) in testimonials"
            :key="index"
            @click="activeTestimonial = index"
            :class="[
              'w-3 h-3 rounded-full cursor-pointer',
              activeTestimonial === index ? 'bg-primary' : 'bg-gray-300'
            ]"
          ></span>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="py-16 px-6 bg-white text-center">
      <h2 class="text-2xl font-bold text-black">Frequently Asked Questions</h2>

      <div class="max-w-3xl mx-auto mt-8 space-y-4">
        <div
          v-for="(faq, index) in faqs"
          :key="faq.q"
          class="border rounded-lg p-4 text-left"
        >
          <div
            class="flex justify-between items-center cursor-pointer"
            @click="toggleFAQ(index)"
          >
            <p class="font-medium">{{ faq.q }}</p>
            <ChevronDownIcon
              class="w-5 h-5 text-gray-500 transition-transform"
              :class="{ 'rotate-180': activeFAQ === index }"
            />
          </div>
          <p
            v-show="activeFAQ === index"
            class="mt-2 text-gray-600 text-sm transition-all"
          >
            {{ faq.a }}
          </p>
        </div>
      </div>

      <p class="mt-6 text-gray-700">Still have questions? Our support team is here to help.</p>
      <router-link
        to="/contact"
        class="mt-4 inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
      >
        Contact Support →
      </router-link>
    </section>
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted} from "vue";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ClockIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  StarIcon,
  // WrenchScrewdriverIcon,
  // BoltIcon,
  // PaintBrushIcon,
  // BuildingOfficeIcon,
  // SunIcon,
  // SparklesIcon,
  // TruckIcon,
  // CameraIcon
} from "@heroicons/vue/24/solid";
import {useRouter} from "vue-router";
import {API_BASE_URL} from "@/config.js";

const router = useRouter();
const searchQuery = ref("");
// const categories = [
//   {name: "Plumber", icon: WrenchScrewdriverIcon, color: "text-blue-500"},
//   {name: "Electrician", icon: BoltIcon, color: "text-yellow-500"},
//   {name: "Painter", icon: PaintBrushIcon, color: "text-green-500"},
//   {name: "Builder", icon: BuildingOfficeIcon, color: "text-orange-500"},
//   {name: "Gardener", icon: SunIcon, color: "text-green-600"},
//   {name: "Cleaner", icon: SparklesIcon, color: "text-purple-500"},
//   {name: "Driver", icon: TruckIcon, color: "text-red-500"},
//   {name: "Photographer", icon: CameraIcon, color: "text-pink-500"},
// ];

const steps = [
  {
    number: "01",
    title: "Describe your task",
    desc: "Tell us what you need, add photos, set your timeline",
    img: "/sep1.jpg",
  },
  {
    number: "02",
    title: "Get quotes from professionals",
    desc: "Receive competitive offers from background-checked professionals",
    img: "/sep2.jpg",
  },
  {
    number: "03",
    title: "Hire and pay securely",
    desc: "Choose your provider, complete work, and release payment with escrow protection",
    img: "/sep3.jpg",
  },
];

const jobs = ref([]);

const testimonials = [
  {
    img: "/user.jpg",
    text: "I found a reliable service provider quickly. Smooth experience from posting my job to completion.",
    name: "John Harkinson",
    location: "London, Communications",
  },
  {
    img: "/user1.jpg",
    text: "Service provider content makes complete sense.",
    name: "Hasel Mary",
    location: "Helinsky, Technology",
  },
  {
    img: "/user2.jpg",
    text: "Amazing platform for finding professionals.",
    name: "Rodri Veron",
    location: "Spain, Telemarketing",
  },
];

const faqs = [
  {
    q: "What is Service Connect?",
    a: "Service Connect is an online platform that connects homeowners and businesses with skilled service providers.",
  },
  {
    q: "How does Service Connect work?",
    a: "You can post jobs, get quotes, and hire providers easily.",
  },
  {
    q: "Do I need to create an account to post a job?",
    a: "Yes, so you can follow up about your posted job.",
  },
  {
    q: "How do I choose the right service provider?",
    a: "We provide verified professionals with reviews to help you choose.",
  },
  {
    q: "Are service providers verified?",
    a: "Yes, they go through an onboarding process before verification.",
  },
];

const viewAllJobs = () => {
  router.push('/listing');
}

const activeFAQ = ref(null);

const toggleFAQ = (index) => {
  activeFAQ.value = activeFAQ.value === index ? null : index;
};
const activeTestimonial = ref(0);

const nextTestimonial = () => {
  activeTestimonial.value =
    (activeTestimonial.value + 1) % testimonials.length;
};
const prevTestimonial = () => {
  activeTestimonial.value =
    (activeTestimonial.value - 1 + testimonials.length) % testimonials.length;
};

const fetchJobs = async () => {
  try {
    const queryParams = new URLSearchParams();

    queryParams.append('status', 'open');
    queryParams.append('limit', 6);

    const url = `${API_BASE_URL}/jobs?${queryParams.toString()}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.statusText}`);
    }

    const data = await response.json();
    const jobsData = Array.isArray(data) ? data : (data.jobs || []);
    if (jobsData.length === 0) {
      jobsData.push({category: 'other'});
    }
    jobs.value = jobsData;
  } catch (err) {
    console.error('Error fetching jobs:', err);
  } finally {
  }
};

const viewJobDetails = async (jobId) => {
  await router.push(`/listing/${jobId}`)
}

const toTitleCase = (str) => {
  return str.replace(/\b\w/g, (match) => match.toUpperCase());
}

let interval;
onMounted(() => {
  interval = setInterval(nextTestimonial, 5000);
  fetchJobs();
});
onUnmounted(() => {
  clearInterval(interval);
});
</script>
