<template>
  <div class="bg-white">
    <!-- Hero Section -->
    <section class="relative py-20 bg-primary/10">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Safety Tips</h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">Your safety is our top priority. Follow these guidelines for a secure experience.</p>
      </div>
    </section>

    <!-- Safety Tips Content -->
    <section class="py-16 px-4">
      <div class="container mx-auto max-w-4xl">
        <!-- General Safety -->
        <div class="mb-16">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">General Safety Guidelines</h2>
          <div class="space-y-6">
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 class="text-xl font-semibold text-primary mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Verify Service Providers
              </h3>
              <p class="text-gray-600">Always check the service provider's profile, reviews, and ratings before hiring. Look for verified badges and completed background checks.</p>
            </div>

            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 class="text-xl font-semibold text-primary mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure Payments
              </h3>
              <p class="text-gray-600">Use only the ServiceConnect platform for all payments. Never pay service providers directly through cash, wire transfers, or other payment methods outside our platform.</p>
            </div>
          </div>
        </div>

        <!-- For Homeowners -->
        <div class="mb-16">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">For Homeowners</h2>
          <div class="space-y-6">
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 class="text-xl font-semibold text-primary mb-3">Meeting Service Providers</h3>
              <ul class="list-disc pl-5 space-y-2 text-gray-600">
                <li>Always meet in a public place first or have someone with you during the initial meeting</li>
                <li>Share your location with a friend or family member when meeting a service provider</li>
                <li>Trust your instincts - if something feels wrong, cancel the service</li>
              </ul>
            </div>

            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 class="text-xl font-semibold text-primary mb-3">Home Safety</h3>
              <ul class="list-disc pl-5 space-y-2 text-gray-600">
                <li>Secure valuables before service providers arrive</li>
                <li>Be cautious about sharing personal information</li>
                <li>Use the platform's messaging system for all communications</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- For Service Providers -->
        <div class="mb-16">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">For Service Providers</h2>
          <div class="space-y-6">
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 class="text-xl font-semibold text-primary mb-3">Personal Safety</h3>
              <ul class="list-disc pl-5 space-y-2 text-gray-600">
                <li>Inform someone about your work schedule and location</li>
                <li>Trust your instincts - if a situation feels unsafe, leave immediately</li>
                <li>Keep your mobile phone charged and accessible at all times</li>
              </ul>
            </div>

            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 class="text-xl font-semibold text-primary mb-3">Professional Conduct</h3>
              <ul class="list-disc pl-5 space-y-2 text-gray-600">
                <li>Always maintain professional boundaries with clients</li>
                <li>Document the condition of the work area before and after service</li>
                <li>Report any suspicious activity or safety concerns to ServiceConnect immediately</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Emergency Contacts -->
        <div class="bg-red-50 p-6 rounded-lg border border-red-100">
          <h2 class="text-2xl font-bold text-red-700 mb-4">In Case of Emergency</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <h3 class="font-semibold text-red-700 mb-2">Local Emergency Services</h3>
              <p class="text-gray-700 mb-4">Dial <span class="font-bold">911</span> for immediate assistance</p>
              <p class="text-sm text-gray-600">For non-emergency police assistance, contact your local police department.</p>
            </div>
            <div>
              <h3 class="font-semibold text-red-700 mb-2">ServiceConnect Support</h3>
              <p class="text-gray-700 mb-2">24/7 Safety Line: <span class="font-bold">+44 7352 310353</span></p>
              <p class="text-sm text-gray-600">Report safety concerns through our app or website.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Additional Resources -->
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-2xl font-bold text-gray-900 mb-8">Additional Resources</h2>
        <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 class="font-semibold text-lg mb-2">Home Safety Checklist</h3>
            <p class="text-gray-600 text-sm">Download our comprehensive home safety guide for service visits.</p>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="font-semibold text-lg mb-2">Safety Guidelines PDF</h3>
            <p class="text-gray-600 text-sm">Download our complete safety guidelines document.</p>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="font-semibold text-lg mb-2">Report an Issue</h3>
            <p class="text-gray-600 text-sm">Report safety concerns or suspicious activities to our team.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// No script logic needed for this component
</script>

<style scoped>
/* Custom styles can go here */
</style>
