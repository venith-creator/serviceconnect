<template>
  <div class="bg-white">
    <!-- Hero Section -->
    <section
      class="relative h-[80vh] flex items-center justify-center text-center bg-cover bg-center"
      style="background-image: url('/service-hero.jpg');"
    >
      <div class="absolute inset-0 bg-black bg-opacity-50"></div>
      <div class="relative z-10 max-w-2xl mx-auto space-y-6 px-4">
        <h1 class="text-3xl md:text-5xl font-bold text-white">
          Find the right service provider for your needs
        </h1>
        <p class="text-white text-sm md:text-lg">
          Connect with skilled professionals for any task, from home repairs to personal assistance
        </p>
        <!-- Search Box -->
        <div class="bg-white/90 rounded-lg shadow-md flex items-center p-2 mt-6">
          <input
            type="text"
            placeholder="Enter your location"
            class="flex-1 px-4 py-2 rounded-l-lg border border-gray-200 focus:outline-none text-black"
          />
          <button class="bg-primary text-white px-4 py-2 flex items-center gap-2 rounded-lg ml-2">
            <MagnifyingGlassIcon class="w-5 h-5" />
            Search Service Provider
          </button>
        </div>
      </div>
    </section>

    <!-- Popular Categories -->
    <section class="py-16 px-6 text-center">
      <h2 class="text-2xl font-bold text-black">Popular Categories</h2>
      <p class="text-gray-600">Find the service you need</p>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-10 mt-10 max-w-4xl mx-auto">
        <div v-for="cat in categories" :key="cat.name" class="flex flex-col items-center space-y-2">
          <div class="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100">
            <component :is="cat.icon" :class="['w-8 h-8', cat.color]" />
          </div>
          <p class="font-medium">{{ cat.name }}</p>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-16 px-6 bg-white">
      <h2 class="text-2xl font-bold text-center mb-12">How it Works</h2>
      <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <!-- Step -->
        <div v-for="step in steps" :key="step.number" class="text-center md:text-left space-y-3">
          <img :src="step.img" class="w-full h-64 object-cover rounded-md" />
          <div class="flex items-center gap-3 mt-2">
            <div class="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white font-bold">
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
          :key="job.id"
          class="bg-white rounded-lg shadow p-6 text-left space-y-3"
        >
          <div class="flex justify-between items-center">
            <h3 class="font-semibold text-lg" v-html="job.title"></h3>
            <span class="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">Open</span>
          </div>
          <p class="text-gray-600 text-sm">{{ job.desc }}</p>
          <div class="text-gray-500 text-sm space-y-1">
            <p><MapPinIcon class="w-4 h-4 inline" /> {{ job.location }}</p>
            <p>
              £ {{ job.price }}
              <span class="float-right"><ClockIcon class="w-4 h-4 inline" /> {{ job.time }}</span>
            </p>
          </div>
          <button class="bg-primary text-white px-4 py-2 rounded-lg w-fit">Send Quote</button>
        </div>
      </div>

      <div class="mt-6">
        <button class="text-black font-semibold flex items-center gap-2 mx-auto">
          View All
          <span class="bg-primary text-white rounded-full p-1">
            <ChevronRightIcon class="w-4 h-4" />
          </span>
        </button>
      </div>

      <!-- Promo Banners -->
      <div class="grid md:grid-cols-2 gap-6 mt-12 max-w-6xl mx-auto">
        <div
          class="relative h-72 rounded-lg overflow-hidden bg-primary bg-opacity-70 flex items-end p-6 text-left text-white"
        >
          <div>
            <h3 class="font-bold text-xl">Find Trusted Service Providers</h3>
            <p class="text-sm">
              Get quality work done by professionals in your area.<br />
              From repairs to personal services we connect you with the right people for the job.
            </p>
            <button class="mt-4 bg-primary text-white px-4 py-2 rounded-lg">Post Job</button>
          </div>
        </div>

        <div
          class="relative h-72 rounded-lg overflow-hidden bg-yellow-500 bg-opacity-70 flex items-end p-6 text-left text-white"
        >
          <div>
            <p class="text-sm">Are you a professional?</p>
            <h3 class="font-bold text-xl">Get Customers</h3>
            <p class="text-sm">
              Join thousands of service providers earning more through our platform. Grow your
              business with confidence.
            </p>
            <button class="mt-4 bg-yellow-400 text-black px-4 py-2 rounded-lg">
              Join Service Providers
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="py-16 px-6 bg-white text-center">
      <h2 class="text-2xl font-bold text-black">What Our Users Say</h2>
      <p class="text-gray-600">Real experiences from homeowners and professionals</p>

      <!-- Carousel Placeholder -->
      <div class="max-w-2xl mx-auto mt-8">
        <div class="bg-primary/10 rounded-lg p-6 flex items-center gap-4">
          <img src="/user.jpg" class="w-16 h-16 rounded-full object-cover" />
          <div class="text-left">
            <div class="flex text-yellow-400">
              <StarIcon v-for="n in 5" :key="n" class="w-5 h-5" />
            </div>
            <p class="text-gray-600 text-sm mt-2">
              “I found a reliable service provider quickly. Smooth experience from posting my job to
              completion.”
            </p>
            <p class="font-bold text-black mt-2">John Harkinson</p>
            <p class="text-xs text-gray-500">London, Communications</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="py-16 px-6 bg-white text-center">
      <h2 class="text-2xl font-bold text-black">Frequently Asked Questions</h2>

      <div class="max-w-3xl mx-auto mt-8 space-y-4">
        <div
          v-for="faq in faqs"
          :key="faq.q"
          class="border rounded-lg p-4 flex justify-between items-center"
        >
          <p class="font-medium">{{ faq.q }}</p>
          <ChevronDownIcon class="w-5 h-5 text-gray-500" />
        </div>
      </div>

      <p class="mt-6 text-gray-700">Still have questions? Our support team is here to help.</p>
      <button class="mt-4 bg-primary text-white px-6 py-2 rounded-lg">Contact Support</button>
    </section>
  </div>
</template>

<script setup>
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ClockIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  StarIcon,
} from "@heroicons/vue/24/solid";

const categories = [
  { name: "Plumber", icon: "WrenchScrewdriverIcon", color: "text-blue-500" },
  { name: "Electrician", icon: "BoltIcon", color: "text-yellow-500" },
  { name: "Painter", icon: "PaintBrushIcon", color: "text-green-500" },
  { name: "Builder", icon: "BuildingOfficeIcon", color: "text-orange-500" },
  { name: "Gardener", icon: "LeafIcon", color: "text-green-600" },
  { name: "Cleaner", icon: "SparklesIcon", color: "text-purple-500" },
  { name: "Driver", icon: "TruckIcon", color: "text-red-500" },
  { name: "Photographer", icon: "CameraIcon", color: "text-pink-500" },
];

const steps = [
  {
    number: "01",
    title: "Describe your task",
    desc: "Tell us what you need, add photos, set your timeline",
    img: "/step1.jpg",
  },
  {
    number: "02",
    title: "Get quotes from professionals",
    desc: "Receive competitive offers from background-checked professionals",
    img: "/step2.jpg",
  },
  {
    number: "03",
    title: "Hire and pay securely",
    desc: "Choose your provider, complete work, and release payment with escrow protection",
    img: "/step3.jpg",
  },
];

const jobs = [
  {
    id: 1,
    title: "Need a plumber in <br> Solihull",
    desc: "Urgent plumbing repair needed for kitchen sink and bathroom fixtures",
    location: "Solihull Street, London",
    price: "500 - 700",
    time: "3 days",
  },
  {
    id: 2,
    title: "Looking for a <br> Gardener in London",
    desc: "Regular garden maintenance and landscaping services",
    location: "London Street",
    price: "200 - 300",
    time: "5 days",
  },
  {
    id: 3,
    title: "Electrician Needed - <br> Wiring Installation",
    desc: "Complete electrical wiring for the new house construction",
    location: "London",
    price: "700 - 1000",
    time: "2 days",
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
</script>

<style scoped>

</style>
