<template>
  <ProviderDashboardLayout>

    <div class="p-6 space-y-6">
      <!-- Error Alert -->
      <div v-if="error" class="rounded-md bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
          </div>
          <div class="ml-auto pl-3">
            <div class="-mx-1.5 -my-1.5">
              <button @click="error = null" class="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100">
                <span class="sr-only">Dismiss</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <template v-else>
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Service Management</h1>
            <p class="text-gray-600">View and manage your services and billing</p>
          </div>
          <button
              @click="showAddService = true"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Add Service
          </button>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <!-- Services Tab -->
        <div v-if="activeTab === 'services'" class="space-y-6">
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold text-gray-800">My Services</h2>
              <div class="relative">
                <button
                    @click="showServiceFilter = !showServiceFilter"
                    class="flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <span>Filter by status</span>
                  <svg class="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                <div v-if="showServiceFilter" class="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10">
                  <div class="p-2 space-y-1">
                    <label class="flex items-center px-3 py-1 rounded hover:bg-gray-100 cursor-pointer">
                      <input v-model="serviceFilter" type="radio" value="all"
                             class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                      <span class="ml-2 text-sm text-gray-700">All Services</span>
                    </label>
                    <label class="flex items-center px-3 py-1 rounded hover:bg-gray-100 cursor-pointer">
                      <input v-model="serviceFilter" type="radio" value="trial"
                             class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                      <span class="ml-2 text-sm text-gray-700">Trial</span>
                    </label>
                    <label class="flex items-center px-3 py-1 rounded hover:bg-gray-100 cursor-pointer">
                      <input v-model="serviceFilter" type="radio" value="active"
                             class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                      <span class="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                    <label class="flex items-center px-3 py-1 rounded hover:bg-gray-100 cursor-pointer">
                      <input v-model="serviceFilter" type="radio" value="suspended"
                             class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                      <span class="ml-2 text-sm text-gray-700">Suspended</span>
                    </label>
                    <label class="flex items-center px-3 py-1 rounded hover:bg-gray-100 cursor-pointer">
                      <input v-model="serviceFilter" type="radio" value="expired"
                             class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                      <span class="ml-2 text-sm text-gray-700">Expired</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="filteredServices.length > 0" class="space-y-4">
              <div v-for="(service, index) in filteredServices" :key="service._id"
                   class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <div class="flex items-start justify-between">
                      <h3 class="font-medium text-gray-900">{{ service.category || 'Uncategorized Service' }}</h3>
                      <div class="flex items-center space-x-2">
                        <span class="text-sm font-medium text-gray-900">
                          £ {{index === 0 ? 20 : 10}}
                        </span>
                        <button
                            v-if="service.requiresPayment"
                            @click="activateService(service, index === 0 ? 20 : 10)"
                            :disabled="processingPayment"
                            class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span v-if="processingPayment" class="flex items-center">
                            <svg class="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg"
                                 fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                      stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </span>
                          <span v-else>
                            Activate Service
                          </span>
                        </button>
                      </div>
                    </div>

                    <div class="mt-1 flex flex-wrap gap-2">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            :class="getStatusClass(service.status)">
                        {{ service.status }}
                      </span>
                      <span v-if="service.requiresPayment"
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Payment Required
                      </span>
<!--                      <span v-if="!service.approved"-->
<!--                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">-->
<!--                        Pending Approval-->
<!--                      </span>-->
                    </div>

                    <div class="mt-2 text-sm text-gray-600 space-y-1">
                      <p v-if="service.availability" class="flex items-center">
                        <svg class="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {{ service.availability }}
                      </p>
                      <p v-if="service.trialEndsAt" class="flex items-center text-sm text-gray-600">
                        <svg class="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        Trial ends: {{ formatDate(service.trialEndsAt) }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <div class="text-sm text-gray-500">
                    <p v-if="service.trialEndsAt" class="flex items-center">
                      <span v-if="new Date(service.trialEndsAt) > new Date()">
                        Trial ends: {{ formatDate(service.trialEndsAt) }}
                      </span>
                      <span v-else class="text-red-600">
                        Trial ended on {{ formatDate(service.trialEndsAt) }}
                      </span>
                    </p>
                  </div>

<!--                  <div class="flex space-x-2">-->
<!--                    <button-->
<!--                        @click="confirmServiceAction(service, 'delete')"-->
<!--                        class="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 border border-red-200 rounded-md hover:bg-red-50 transition-colors"-->
<!--                    >-->
<!--                      Remove-->
<!--                    </button>-->
<!--                  </div>-->
                </div>
              </div>
            </div>

            <div v-else class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No services found</h3>
              <p class="mt-1 text-sm text-gray-500">You don't have any services matching your filter.</p>
              <div class="mt-6">
                <button
                    @click="showAddService = true"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  Add Service
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Billing History Tab -->
        <div v-else-if="activeTab === 'billing'" class="space-y-6">
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold text-gray-800">Billing History</h2>
            </div>

            <div v-if="billingHistory.length > 0" class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                <tr>
                  <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date
                  </th>
                  <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description
                  </th>
                  <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount
                  </th>
                  <th scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status
                  </th>
                  <th scope="col" class="relative px-6 py-3"><span class="sr-only">Receipt</span></th>
                </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="item in billingHistory" :key="item._id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(item.createdAt) }}
                    {{ formatDate(item.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ item.description }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatCurrency(item.amount) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                      <span
                          :class="[
                          'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                          item.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        ]"
                      >
                        {{ item.status }}
                      </span>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No billing history</h3>
              <p class="mt-1 text-sm text-gray-500">Your billing history will appear here.</p>
            </div>
          </div>
        </div>

      </template>
    </div>
  </ProviderDashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'vue-toast-notification';
import ProviderDashboardLayout from '@/components/ProviderDashboardLayout.vue';
import { useAuthStore } from "@/stores/auth.ts";
import SubscriptionService, {type IService, type Payment} from "@/services/subscriptionService.ts";
import {API_BASE_URL} from "@/config.ts";

interface BillingRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: string;
}

type ServiceStatus = 'all' | 'active' | 'trial' | 'suspended' | 'expired';
type ConfirmAction = 'delete';

interface ConfirmDialog {
  title: string;
  message: string;
  confirmText: string;
  action: ConfirmAction | null;
  data: string | null;
}

// State
const activeTab = ref<'services' | 'billing'>('services');
const processingPayment = ref(false);
const isLoading = ref(true);
const error = ref<string | null>(null);

// Service State
const services = ref<IService[]>([]);
const billingHistory = ref<Payment[]>([]);

// UI State
const showAddService = ref(false);
const showServiceFilter = ref(false);
const serviceFilter = ref<ServiceStatus>('all');
const showConfirmDialog = ref(false);

const confirmDialog = ref<ConfirmDialog>({
  title: '',
  message: '',
  confirmText: 'Confirm',
  action: null,
  data: null
});

// Auth
const auth = useAuthStore();
const toast = useToast();

// Tabs
const tabs = [
  { id: 'services' as const, name: 'My Services' },
  { id: 'billing' as const, name: 'Billing History' },
];

// Computed
const filteredServices = computed<IService[]>(() => {
  if (serviceFilter.value === 'all') return services.value;
  return services.value.filter(service => service.status === serviceFilter.value);
});

// Fetch data
const fetchData = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    // Fetch services
    services.value = await SubscriptionService.getProviderServices();
  } catch (err: any) {
    console.error('Error fetching data:', err);
    error.value = err.message || 'Failed to load data';
    if (error.value) toast.error(error.value);
  } finally {
    isLoading.value = false;
  }
};

// Fetch payment history
const fetchPaymentHistory = async () => {
  try {
    billingHistory.value = await SubscriptionService.getPayments();
  } catch (err) {
    console.error('Error fetching payment history:', err);
  }
};


// Activate service (one-time payment)
const activateService = async (service: IService, amount: number ) => {
  if (!service?._id) {
    toast.error('Invalid service selected.');
    return;
  }

  try {
    processingPayment.value = true;
    error.value = null;

    const { url } = await SubscriptionService.createPaymentIntent(
      amount,
      'gbp',
      {
        serviceId: service._id,
        providerId: auth.user?._id
      }
    );

    window.location.href = url;

  } catch (err: any) {
    console.error('Error activating service:', err);
    error.value = err.message || 'Failed to activate service.';
    if (error.value) toast.error(error.value);
  } finally {
    processingPayment.value = false;
  }
};


const getStatusClass = (status: string): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'trial':
      return 'bg-blue-100 text-blue-800';
    case 'suspended':
      return 'bg-yellow-100 text-yellow-800';
    case 'expired':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const confirmServiceAction = (service: IService, action: ConfirmAction): void => {
  confirmDialog.value = {
    title: 'Delete Service',
    message: `Are you sure you want to remove "${service.category}"? This action cannot be undone.`,
    confirmText: 'Delete',
    action,
    data: service._id
  };

  showConfirmDialog.value = true;
};

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (err) {
    console.error('Error formatting date:', err);
    return 'Invalid date';
  }
};

const formatCurrency = (amount: number): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  } catch (err) {
    console.error('Error formatting currency:', err);
    return `${amount.toFixed(2)}`;
  }
};

const downloadInvoice = async (invoiceId: string): Promise<void> => {
  // Implementation for downloading invoice
  console.log('Downloading invoice:', invoiceId);
};

const downloadAllInvoices = async (): Promise<void> => {
  // Implementation for downloading all invoices
  console.log('Downloading all invoices');
};

const checkPaymentStatus = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const paymentSuccess = urlParams.get('payment_success');
  const sessionId = urlParams.get('session_id');

  if (paymentSuccess && sessionId) {
    try {
      // Verify payment was successful
      const response = await fetch(`${API_BASE_URL}/payments/session/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.session.payment_status === 'paid') {
          toast.success('Service activated successfully!');
          await fetchData(); // Refresh services

          // Clean URL
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  }
};


// Lifecycle
onMounted(() => {
  fetchData();
  checkPaymentStatus();
  fetchPaymentHistory();
});
</script>
