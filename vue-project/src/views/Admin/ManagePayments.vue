<template>
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Payment Management</h1>
        <div class="flex space-x-2">
          <select v-model="statusFilter" @change="fetchPayments()" class="px-3 py-2 border rounded-md">
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search payments..."
            class="px-3 py-2 border rounded-md"
            @keyup.enter="fetchPayments()"
          />
          <button
            @click="fetchPayments()"
            class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="text-gray-500 text-sm">Total Revenue</div>
          <div class="text-2xl font-bold">{{ formatCurrency(stats.totalEarnings) }}</div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="text-gray-500 text-sm">Completed Payments</div>
          <div class="text-2xl font-bold">{{ stats.completed }}</div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="text-gray-500 text-sm">Pending Payments</div>
          <div class="text-2xl font-bold">{{ stats.pending }}</div>
        </div>
      </div>

      <!-- Payments Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="loading">
                <td colspan="6" class="px-6 py-4 text-center">
                  <div class="flex justify-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
              <tr v-else-if="payments?.length === 0">
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                  No payments found
                </td>
              </tr>
              <tr v-for="payment in payments" :key="payment._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ payment._id.substring(0, 8) }}...
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ payment.description || 'N/A' }}</div>
                  <div class="text-sm text-gray-500">{{ payment.provider.name || 'Stripe' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ formatCurrency(payment.amount) }}</div>
                  <div class="text-xs text-gray-500">{{ payment.currency.toUpperCase() }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="{
                      'bg-green-100 text-green-800': payment.status === 'completed',
                      'bg-yellow-100 text-yellow-800': payment.status === 'pending',
                      'bg-red-100 text-red-800': payment.status === 'failed',
                      'bg-purple-100 text-purple-800': payment.status === 'refunded',
                      'px-2 py-1 rounded-full text-xs font-medium': true
                    }"
                  >
                    {{ payment.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(payment.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="viewPaymentDetails(payment)"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </button>
<!--                  <button-->
<!--                    v-if="payment.status === 'completed'"-->
<!--                    @click="initiateRefund(payment)"-->
<!--                    class="text-red-600 hover:text-red-900"-->
<!--                  >-->
<!--                    Refund-->
<!--                  </button>-->
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="payments?.length > 0" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="currentPage > 1 ? currentPage-- : null"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              @click="currentPage < totalPages ? currentPage++ : null"
              :disabled="currentPage >= totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span> to
                <span class="font-medium">{{ Math.min(currentPage * pageSize, totalItems) }}</span> of
                <span class="font-medium">{{ totalItems }}</span> results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  @click="currentPage > 1 ? currentPage-- : null"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span class="sr-only">Previous</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="currentPage = page"
                  :class="{
                    'bg-blue-50 border-blue-500 text-blue-600': currentPage === page,
                    'bg-white border-gray-300 text-gray-500 hover:bg-gray-50': currentPage !== page,
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium': true
                  }"
                >
                  {{ page }}
                </button>
                <button
                  @click="currentPage < totalPages ? currentPage++ : null"
                  :disabled="currentPage >= totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span class="sr-only">Next</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Details Modal -->
      <div v-if="selectedPayment" class="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="selectedPayment = null"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Payment Details
                  </h3>
                  <div class="mt-4 grid grid-cols-1 gap-y-4">
                    <div class="border-b pb-2">
                      <dt class="text-sm font-medium text-gray-500">Payment ID</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ selectedPayment._id }}</dd>
                    </div>
                    <div class="border-b pb-2">
                      <dt class="text-sm font-medium text-gray-500">Amount</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ formatCurrency(selectedPayment.amount) }} {{ selectedPayment.currency.toUpperCase() }}</dd>
                    </div>
                    <div class="border-b pb-2">
                      <dt class="text-sm font-medium text-gray-500">Status</dt>
                      <dd class="mt-1">
                        <span
                          :class="{
                            'bg-green-100 text-green-800': selectedPayment.status === 'completed',
                            'bg-yellow-100 text-yellow-800': selectedPayment.status === 'pending',
                            'bg-red-100 text-red-800': selectedPayment.status === 'failed',
                            'bg-purple-100 text-purple-800': selectedPayment.status === 'refunded',
                            'px-2 py-1 rounded-full text-xs font-medium': true
                          }"
                        >
                          {{ selectedPayment.status }}
                        </span>
                      </dd>
                    </div>
                    <div class="border-b pb-2">
                      <dt class="text-sm font-medium text-gray-500">Service</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ selectedPayment.service || 'N/A' }}</dd>
                    </div>
                    <div class="border-b pb-2">
                      <dt class="text-sm font-medium text-gray-500">Provider</dt>
                      <dd class="mt-1 text-sm text-gray-900">
                        {{ selectedPayment.provider.name || 'Stripe' }}
                        ({{ selectedPayment.provider.email || 'N/A' }})
                      </dd>
                    </div>
                    <div class="border-b pb-2">
                      <dt class="text-sm font-medium text-gray-500">Description</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ selectedPayment.description || 'No description available' }}</dd>
                    </div>
                    <div class="border-b pb-2">
                      <dt class="text-sm font-medium text-gray-500">Created At</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ formatDate(selectedPayment.createdAt, true) }}</dd>
                    </div>
                    <div v-if="selectedPayment.updatedAt !== selectedPayment.createdAt">
                      <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ formatDate(selectedPayment.updatedAt, true) }}</dd>
                    </div>
<!--                    <div v-if="selectedPayment.refundedAt">-->
<!--                      <dt class="text-sm font-medium text-gray-500">Refunded At</dt>-->
<!--                      <dd class="mt-1 text-sm text-gray-900">{{ formatDate(selectedPayment.refundedAt, true) }}</dd>-->
<!--                    </div>-->
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                @click="selectedPayment = null"
              >
                Close
              </button>
<!--              <button-->
<!--                v-if="selectedPayment.status === 'completed'"-->
<!--                type="button"-->
<!--                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"-->
<!--                @click="initiateRefund(selectedPayment)"-->
<!--              >-->
<!--                Issue Refund-->
<!--              </button>-->
            </div>
          </div>
        </div>
      </div>

      <!-- Refund Confirmation Modal -->
<!--      <div v-if="showRefundModal" class="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">-->
<!--        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">-->
<!--          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>-->
<!--          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>-->
<!--          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">-->
<!--            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">-->
<!--              <div class="sm:flex sm:items-start">-->
<!--                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">-->
<!--                  <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">-->
<!--                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />-->
<!--                  </svg>-->
<!--                </div>-->
<!--                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">-->
<!--                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">-->
<!--                    Confirm Refund-->
<!--                  </h3>-->
<!--                  <div class="mt-2">-->
<!--                    <p class="text-sm text-gray-500">-->
<!--                      Are you sure you want to issue a refund for this payment?-->
<!--                    </p>-->
<!--                    <div class="mt-4 bg-yellow-50 p-4 rounded-md">-->
<!--                      <div class="flex">-->
<!--                        <div class="flex-shrink-0">-->
<!--                          <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">-->
<!--                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />-->
<!--                          </svg>-->
<!--                        </div>-->
<!--                        <div class="ml-3">-->
<!--                          <h3 class="text-sm font-medium text-yellow-800">-->
<!--                            Refund Amount-->
<!--                          </h3>-->
<!--                          <div class="mt-2 text-sm text-yellow-700">-->
<!--                            <p>-->
<!--                              Full amount: {{ formatCurrency(selectedPayment?.amount ?? 0) }} {{ selectedPayment?.currency.toUpperCase() }}-->
<!--                            </p>-->
<!--                            <div class="mt-2 flex items-center">-->
<!--                              <input-->
<!--                                id="partial-refund"-->
<!--                                type="checkbox"-->
<!--                                v-model="isPartialRefund"-->
<!--                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"-->
<!--                              >-->
<!--                              <label for="partial-refund" class="ml-2 block text-sm text-gray-700">-->
<!--                                Partial refund-->
<!--                              </label>-->
<!--                            </div>-->
<!--                            <div v-if="isPartialRefund" class="mt-2">-->
<!--                              <label for="refund-amount" class="block text-sm font-medium text-gray-700">Amount to refund</label>-->
<!--                              <input-->
<!--                                type="number"-->
<!--                                id="refund-amount"-->
<!--                                v-model.number="refundAmount"-->
<!--                                :max="selectedPayment?.amount"-->
<!--                                min="0.01"-->
<!--                                step="0.01"-->
<!--                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"-->
<!--                              >-->
<!--                              <p class="mt-1 text-xs text-gray-500">-->
<!--                                Enter amount between 0.01 and {{ formatCurrency(selectedPayment?.amount ?? 0) }}-->
<!--                              </p>-->
<!--                            </div>-->
<!--                          </div>-->
<!--                        </div>-->
<!--                      </div>-->
<!--                    </div>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">-->
<!--              <button-->
<!--                type="button"-->
<!--                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"-->
<!--                :disabled="isRefunding || (isPartialRefund && (!refundAmount || refundAmount <= 0 || refundAmount > (selectedPayment?.amount ?? 0)))"-->
<!--                @click="confirmRefund"-->
<!--              >-->
<!--                <span v-if="isRefunding">-->
<!--                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">-->
<!--                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>-->
<!--                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>-->
<!--                  </svg>-->
<!--                  Processing...-->
<!--                </span>-->
<!--                <span v-else>-->
<!--                  Confirm Refund-->
<!--                </span>-->
<!--              </button>-->
<!--              <button-->
<!--                type="button"-->
<!--                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"-->
<!--                @click="cancelRefund"-->
<!--                :disabled="isRefunding"-->
<!--              >-->
<!--                Cancel-->
<!--              </button>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
//import AdminDashboardLayout from '@/components/AdminDashboardLayout.vue';
import subscriptionService, { type Payment } from '@/services/subscriptionService';
import {useToast} from "vue-toast-notification";

const toast = useToast();

// State
const loading = ref(true);
const payments = ref<Payment[]>([]);
const selectedPayment = ref<Payment | null>(null);
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);
const totalPages = ref(1);
const statusFilter = ref('');
const searchQuery = ref('');
const showRefundModal = ref(false);
const isRefunding = ref(false);
const isPartialRefund = ref(false);
const refundAmount = ref(0);

// Stats
const stats = ref({
  totalEarnings: 0,
  pending: 0,
  completed: 0,
});

// Computed
const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
});

// Methods
const fetchPayments = async () => {
  try {
    loading.value = true;
    const response = await subscriptionService.getAllPayments(
      currentPage.value,
      pageSize.value,
      statusFilter.value
    );
    payments.value = response.data;
    totalItems.value = response.pagination.total;
    totalPages.value = response.pagination.totalPages;
  } catch (error) {
    console.error('Error fetching payments:', error);
    toast.error('Failed to load payments');
  } finally {
    loading.value = false;
  }
};

const fetchPaymentStats = async () => {
  try {
    const response = await subscriptionService.getPaymentStats();
    stats.value = response;
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    toast.error('Failed to load payment statistics');
  }
};

const viewPaymentDetails = (payment: Payment) => {
  selectedPayment.value = { ...payment };
};

const initiateRefund = (payment: Payment) => {
  selectedPayment.value = { ...payment };
  refundAmount.value = payment.amount;
  isPartialRefund.value = false;
  showRefundModal.value = true;
};

// const confirmRefund = async () => {
//   if (!selectedPayment.value) return;
//
//   if (isPartialRefund.value && (!refundAmount.value || refundAmount.value <= 0 || refundAmount.value > selectedPayment.value.amount)) {
//     toast.error('Please enter a valid refund amount');
//     return;
//   }
//
//   try {
//     isRefunding.value = true;
//     const amount = isPartialRefund.value ? refundAmount.value : undefined;
//
//     await subscriptionService.refundPayment(selectedPayment.value._id, amount);
//
//     toast.success(`Successfully issued ${isPartialRefund.value ? 'partial' : 'full'} refund`);
//
//     // Refresh the payment and stats
//     await Promise.all([
//       fetchPayments(),
//       fetchPaymentStats()
//     ]);
//
//     // Update the selected payment with the latest data
//     if (selectedPayment.value) {
//       const updatedPayment = payments.value.find(p => p._id === selectedPayment.value?._id);
//       if (updatedPayment) {
//         selectedPayment.value = { ...updatedPayment };
//       }
//     }
//
//     showRefundModal.value = false;
//   } catch (error: any) {
//     console.error('Error processing refund:', error);
//     toast.error(error.response?.data?.message || 'Failed to process refund');
//   } finally {
//     isRefunding.value = false;
//   }
// };
//
// const cancelRefund = () => {
//   showRefundModal.value = false;
//   isPartialRefund.value = false;
//   refundAmount.value = 0;
// };

const formatDate = (dateString: string, includeTime = false) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatCurrency = (amount: number) => {
  if (typeof amount !== 'number') return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Watchers
watch([currentPage, statusFilter], () => {
  fetchPayments();});

// Lifecycle Hooks
onMounted(() => {
  Promise.all([
    fetchPayments(),
    fetchPaymentStats()
  ]);
});
</script>
