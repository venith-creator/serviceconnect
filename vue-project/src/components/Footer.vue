<template>
  <footer class="bg-white text-gray-900 py-16">
    <div class="container mx-auto px-4">
      <div class="grid md:grid-cols-4 gap-10 mb-12">
        <!-- Branding / Company Intro -->
        <div class="space-y-5">
          <!-- Logo + Name -->
          <div class="flex items-center space-x-3">
            <img
              src="/medical background.png"
              alt="Service Connect Logo"
              class="w-10 h-10"
            />
            <span class="font-semibold text-xl text-gray-900">Service Connect</span>
          </div>

          <!-- Tagline -->
          <p class="text-gray-700 leading-relaxed">
            UK’s digital marketplace connecting <br />
            homeowners across UK. <br />
            Quality service, trusted providers, secure payment.
          </p>

          <!-- Social Icons -->
            <div class="flex space-x-3">
              <!-- LinkedIn -->
              <a href="#" class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
                <svg class="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136
                  1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85
                  3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337
                  7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063
                  2.063-2.063 1.14 0 2.064.925 2.064 2.063 0
                  1.139-.925 2.065-2.064 2.065zM7.119
                  20.452H3.555V9h3.564v11.452z"/>
                </svg>
              </a>

              <!-- X (Twitter replacement) -->
              <a href="#" class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
                <svg class="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2H21l-6.867 7.85L22 22h-6.586l-5.198-6.76L4.512
                  22H2l7.407-8.463L2 2h6.75l4.713
                  6.184L18.244 2zm-2.09 18h2.207L8.579
                  4h-2.27l9.845 16z"/>
                </svg>
              </a>

              <!-- YouTube -->
              <a href="#" class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
                <svg class="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505
                  3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017
                  3.017 0 00.502 6.186C0 8.07 0 12 0
                  12s0 3.93.502 5.814a3.016 3.016 0 002.122
                  2.136c1.871.505 9.376.505 9.376.505s7.505
                  0 9.377-.505a3.015 3.015 0 002.122-2.136C24
                  15.93 24 12 24 12s0-3.93-.502-5.814zM9.545
                  15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              <!-- Instagram -->
              <a href="#" class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
                <svg class="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.5 2h9A5.5 5.5 0 0122
                  7.5v9A5.5 5.5 0 0116.5 22h-9A5.5
                  5.5 0 012 16.5v-9A5.5 5.5 0
                  017.5 2zm0 2A3.5 3.5 0 004
                  7.5v9A3.5 3.5 0 007.5
                  20h9a3.5 3.5 0 003.5-3.5v-9A3.5
                  3.5 0 0016.5 4h-9zm4.5
                  3a5.5 5.5 0 110 11 5.5
                  5.5 0 010-11zm0 2a3.5 3.5
                  0 100 7 3.5 3.5 0 000-7zm5.25-.75a1.25
                  1.25 0 110 2.5 1.25 1.25 0
                  010-2.5z"/>
                </svg>
              </a>
            </div>


          <!-- Location, Email, Phone -->
          <div class="space-y-3 text-gray-700">
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Solihull, United Kingdom</span>
            </div>
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href="mailto:serviceconnect@gmail.com">serviceconnect@gmail.com</a>
            </div>
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href="tel:+447352310353">+44 7352 310353</a>
            </div>
          </div>
        </div>

        <!-- For Homeowners -->
        <div>
          <h3 class="font-semibold text-gray-900 mb-4">For Homeowners</h3>
          <ul class="space-y-3 text-gray-700">
            <li><router-link to="/signup?role=client" class="hover:text-primary">Post a Job</router-link></li>
            <li><router-link to="/categories" class="hover:text-primary">Browse Categories</router-link></li>
            <li><router-link to="/how-it-works" class="hover:text-primary">How it Works</router-link></li>
            <li><router-link to="/safety" class="hover:text-primary">Safety Tips</router-link></li>
          </ul>
        </div>

        <!-- For Professionals -->
        <div>
          <h3 class="font-semibold text-gray-900 mb-4">For Professionals</h3>
          <ul class="space-y-3 text-gray-700">
            <li><router-link to="/signup?role=provider" class="hover:text-primary">Join as Provider</router-link></li>
            <li><router-link to="/find-work" class="hover:text-primary">Find Work</router-link></li>
            <li><router-link to="/verification" class="hover:text-primary">Verification Process</router-link></li>
          </ul>
        </div>

        <!-- Company -->
        <div>
          <h3 class="font-semibold text-gray-900 mb-4">Company</h3>
          <ul class="space-y-3 text-gray-700">
            <li><router-link to="/about" class="hover:text-primary">About Us</router-link></li>
            <li><router-link to="/contact" class="hover:text-primary">Contact</router-link></li>
            <li><router-link to="/privacy-policy" class="hover:text-primary">Privacy Policy</router-link></li>
            <li><router-link to="/terms" class="hover:text-primary">Terms of Service</router-link></li>
          </ul>
        </div>
      </div>

      <!-- Copyright -->
      <div class="border-t border-gray-200 pt-8 text-center">
        <p class="text-gray-600">© 2025 Service Connect. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts"></script>

<style scoped></style>
