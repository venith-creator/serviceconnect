<template>
  <div>
    <!-- Main Contact Section -->
    <main class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <div class="max-w-2xl mx-auto">
          <!-- Header -->
          <div class="text-center mb-16">
            <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Connect With <span class="text-primary">Service Connect</span>
            </h1>
            <p class="text-lg text-gray-600 leading-relaxed">
              Whether you’re a <strong>homeowner</strong> seeking help or a <strong>service provider</strong> ready to offer your skills,
              we’d love to hear from you. Fill out the form below and our team will respond promptly.
            </p>
          </div>

          <!-- Contact Form -->
          <form
            @submit.prevent="submitForm"
            class="space-y-6 mb-16 bg-gray-50 p-8 rounded-2xl shadow-md border border-gray-100"
          >
            <div>
              <label for="name" class="block text-sm font-medium text-gray-900 mb-2">
                Full Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                id="name"
                placeholder="Enter your full name"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                :disabled="submitting"
              />
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-900 mb-2">
                Email Address <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.email"
                type="email"
                id="email"
                placeholder="Enter your email address"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                :disabled="submitting"
              />
            </div>

            <div>
              <label for="whatsapp" class="block text-sm font-medium text-gray-900 mb-2">
                WhatsApp Number <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.whatsapp"
                type="tel"
                id="whatsapp"
                pattern="^\+?[1-9]\d{7,14}$"
                placeholder="Include your country code (e.g. +2348130000000)"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                :disabled="submitting"
              />
            </div>

            <div>
              <label for="message" class="block text-sm font-medium text-gray-900 mb-2">
                Message <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="form.message"
                id="message"
                rows="4"
                placeholder="Tell us how we can assist you — e.g., connect me with a plumber in Lagos"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                required
                :disabled="submitting"
              ></textarea>
            </div>

            <div class="space-y-4">
              <button
                type="submit"
                class="w-full bg-primary hover:bg-purple-600 text-white py-3 text-lg rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                :disabled="submitting"
              >
                <span v-if="!submitting">Send Message</span>
                <span v-else class="flex items-center gap-2">
                  <svg
                    class="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Sending...
                </span>
              </button>
              <p class="text-sm text-gray-500 text-center">
                We’ll reach out soon to connect you with the right professional.
              </p>
            </div>
          </form>

          <!-- Contact Info -->
          <div class="space-y-8 text-center">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-4">Need Help Fast?</h2>
              <p class="text-gray-600 mb-8">
                You can also contact us directly via email or WhatsApp. Our support team is available 7 days a week.
              </p>
            </div>

            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Chat With Us</h3>
                <a href="mailto:support@serviceconnect.uk" class="text-gray-700 hover:text-primary transition-colors">
                  support@serviceconnect.uk
                </a>
              </div>

              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">WhatsApp</h3>
                <a
                  href="https://wa.me/2348130000000"
                  class="text-gray-700 hover:text-primary transition-colors"
                >
                  +44 813 000 0000
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- CTA Section -->
    <section class="py-20 relative overflow-hidden">
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        :style="{ backgroundImage: `url('/section.png')` }"
      />
      <div class="absolute inset-0 bg-purple-700/20" />

      <div class="container mx-auto px-4 text-center relative z-10">
        <div class="max-w-3xl mx-auto space-y-8">
          <h2 class="text-3xl lg:text-4xl font-bold text-white leading-tight">
            Ready to Post Your First Job or Send a Quote?
          </h2>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link
              to="/post-job"
              class="bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Post a Job
            </router-link>
            <router-link
              to="/providers"
              class="border border-white text-white hover:bg-white hover:text-primary bg-transparent px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Explore Providers
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toast-notification'
import { API_BASE_URL } from '@/config'

const toast = useToast()

const form = ref({
  name: '',
  email: '',
  whatsapp: '',
  message: ''
})

const submitting = ref(false)

async function submitForm() {
  if (submitting.value) return
  submitting.value = true

  try {
    const res = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Something went wrong')

    toast.success('Message sent successfully! ✅')
    form.value = { name: '', email: '', whatsapp: '', message: '' }
  } catch (err: any) {
    toast.error('Failed to send message: ' + err.message)
  } finally {
    submitting.value = false
  }
}
</script>
