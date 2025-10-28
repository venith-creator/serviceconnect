<template>
  <div class="bg-white">
    <!-- Hero Section -->
    <section class="relative py-20 bg-primary/10">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Verification Process</h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">Ensuring trust and safety for all our users</p>
      </div>
    </section>

    <!-- Verification Steps -->
    <section class="py-16 px-4">
      <div class="container mx-auto max-w-4xl">
        <!-- Overview -->
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Why We Verify</h2>
          <p class="text-gray-600 max-w-3xl mx-auto">
            At ServiceConnect, we prioritize the safety and security of our community.
            Our verification process helps ensure that all users are who they claim to be,
            creating a trusted environment for everyone.
          </p>
        </div>

        <!-- Verification Steps -->
        <div class="space-y-12">
          <!-- Step 1 -->
          <div class="flex flex-col md:flex-row items-center gap-8">
            <div class="bg-primary/10 w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-2xl font-bold text-primary">1</div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900 mb-3">Account Registration</h3>
              <div class="prose max-w-none text-gray-600">
                <p>Start by creating your account with a valid email address and phone number. You'll receive a verification code to confirm your contact information.</p>
                <ul class="list-disc pl-5 mt-2 space-y-1">
                  <li>Valid email address</li>
                  <li>Mobile phone number</li>
                  <li>Basic personal information</li>
                </ul>
              </div>
            </div>
          </div>

<!--          &lt;!&ndash; Step 2 &ndash;&gt;-->
<!--          <div class="flex flex-col md:flex-row items-center gap-8">-->
<!--            <div class="bg-primary/10 w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-2xl font-bold text-primary">2</div>-->
<!--            <div>-->
<!--              <h3 class="text-2xl font-bold text-gray-900 mb-3">Identity Verification</h3>-->
<!--              <div class="prose max-w-none text-gray-600">-->
<!--                <p>Verify your identity by submitting a government-issued ID. We use bank-level encryption to keep your information secure.</p>-->
<!--                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">-->
<!--                  <div class="bg-white p-4 rounded-lg border border-gray-100 text-center">-->
<!--                    <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">-->
<!--                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">-->
<!--                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />-->
<!--                      </svg>-->
<!--                    </div>-->
<!--                    <p class="text-sm font-medium">Government ID</p>-->
<!--                    <p class="text-xs text-gray-500">Passport, Driver's License, or National ID</p>-->
<!--                  </div>-->
<!--                  <div class="bg-white p-4 rounded-lg border border-gray-100 text-center">-->
<!--                    <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">-->
<!--                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">-->
<!--                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />-->
<!--                      </svg>-->
<!--                    </div>-->
<!--                    <p class="text-sm font-medium">Phone Verification</p>-->
<!--                    <p class="text-xs text-gray-500">SMS verification code</p>-->
<!--                  </div>-->
<!--                  <div class="bg-white p-4 rounded-lg border border-gray-100 text-center">-->
<!--                    <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">-->
<!--                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">-->
<!--                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />-->
<!--                      </svg>-->
<!--                    </div>-->
<!--                    <p class="text-sm font-medium">Email Verification</p>-->
<!--                    <p class="text-xs text-gray-500">Email confirmation link</p>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->

<!--          &lt;!&ndash; Step 3 - For Service Providers &ndash;&gt;-->
<!--          <div class="flex flex-col md:flex-row items-center gap-8">-->
<!--            <div class="bg-primary/10 w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-2xl font-bold text-primary">3</div>-->
<!--            <div>-->
<!--              <h3 class="text-2xl font-bold text-gray-900 mb-3">Professional Verification (For Service Providers)</h3>-->
<!--              <div class="prose max-w-none text-gray-600">-->
<!--                <p>Service providers must complete additional verification to ensure they meet our professional standards.</p>-->
<!--                <div class="mt-4 space-y-3">-->
<!--                  <div class="flex items-start">-->
<!--                    <svg class="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">-->
<!--                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />-->
<!--                    </svg>-->
<!--                    <span>Professional certifications or licenses</span>-->
<!--                  </div>-->
<!--                  <div class="flex items-start">-->
<!--                    <svg class="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">-->
<!--                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />-->
<!--                    </svg>-->
<!--                    <span>Proof of business registration (if applicable)</span>-->
<!--                  </div>-->
<!--                  <div class="flex items-start">-->
<!--                    <svg class="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">-->
<!--                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />-->
<!--                    </svg>-->
<!--                    <span>Portfolio or examples of previous work</span>-->
<!--                  </div>-->
<!--                  <div class="flex items-start">-->
<!--                    <svg class="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">-->
<!--                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />-->
<!--                    </svg>-->
<!--                    <span>Background check (for certain categories)</span>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->

          <!-- Step 4 -->
          <div class="flex flex-col md:flex-row items-center gap-8">
            <div class="bg-primary/10 w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-2xl font-bold text-primary">2</div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900 mb-3">Review & Approval</h3>
              <div class="prose max-w-none text-gray-600">
                <p>Our team will review your submission. This process typically takes 1-2 business days.</p>
                <div class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div class="flex">
                    <svg class="h-5 w-5 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-blue-700 text-sm">You'll receive an email notification once your verification is complete. The verification badge will appear on your profile.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Verification Benefits -->
        <div class="mt-20 bg-gray-50 p-8 rounded-xl">
          <h2 class="text-2xl font-bold text-center mb-8">Benefits of Being Verified</h2>
          <div class="grid md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-lg shadow-sm">
              <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 class="font-semibold text-lg mb-2">Trust Badge</h3>
              <p class="text-gray-600 text-sm">Display a verification badge on your profile to build trust with potential clients or service providers.</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm">
              <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 class="font-semibold text-lg mb-2">Priority Access</h3>
              <p class="text-gray-600 text-sm">Get priority in search results and recommendations when looking for services or professionals.</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm">
              <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="font-semibold text-lg mb-2">Higher Earning Potential</h3>
              <p class="text-gray-600 text-sm">Verified service providers often receive more job opportunities and can command higher rates.</p>
            </div>
          </div>
        </div>

        <!-- FAQ Section -->
        <div class="mt-20">
          <h2 class="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div class="space-y-4 max-w-3xl mx-auto">
            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <button
                @click="toggleFAQ(1)"
                class="w-full px-6 py-4 text-left font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 focus:outline-none flex justify-between items-center"
              >
                <span>How long does the verification process take?</span>
                <svg :class="{'transform rotate-180': activeFAQ === 1}" class="w-5 h-5 text-gray-500 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div v-show="activeFAQ === 1" class="px-6 py-4 bg-white border-t border-gray-200">
                <p class="text-gray-600">Most verifications are completed within 1-2 business days. However, in some cases where additional documentation is required, it may take up to 5 business days.</p>
              </div>
            </div>

            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <button
                @click="toggleFAQ(2)"
                class="w-full px-6 py-4 text-left font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 focus:outline-none flex justify-between items-center"
              >
                <span>Is my personal information secure?</span>
                <svg :class="{'transform rotate-180': activeFAQ === 2}" class="w-5 h-5 text-gray-500 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div v-show="activeFAQ === 2" class="px-6 py-4 bg-white border-t border-gray-200">
                <p class="text-gray-600">Yes, we take your privacy and security very seriously. All documents are encrypted and stored securely. We only use your information for verification purposes and never share it with third parties without your consent.</p>
              </div>
            </div>

            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <button
                @click="toggleFAQ(3)"
                class="w-full px-6 py-4 text-left font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 focus:outline-none flex justify-between items-center"
              >
                <span>What if my verification is denied?</span>
                <svg :class="{'transform rotate-180': activeFAQ === 3}" class="w-5 h-5 text-gray-500 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div v-show="activeFAQ === 3" class="px-6 py-4 bg-white border-t border-gray-200">
                <p class="text-gray-600">If your verification is denied, we'll provide you with the reason and guidance on how to resolve the issue. You can reapply after addressing the concerns mentioned in our notification.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-primary text-white text-center">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-6">Ready to get verified?</h2>
        <p class="text-xl mb-8 max-w-2xl mx-auto">Join our trusted community of service providers and homeowners today.</p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <router-link
            to="/signup"
            class="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Sign Up Now
          </router-link>
          <router-link
            to="/contact"
            class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
          >
            Contact Support
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const activeFAQ = ref(null);

const toggleFAQ = (index) => {
  activeFAQ.value = activeFAQ.value === index ? null : index;
};
</script>

<style scoped>
/* Custom styles can go here */
</style>
