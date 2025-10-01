<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Provider Approvals</h1>
    <table class="min-w-full border">
      <thead>
        <tr class="bg-gray-100">
          <th class="p-2 border">Name</th>
          <th class="p-2 border">Status</th>
          <th class="p-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in providers" :key="p._id">
          <td class="p-2 border">{{ p.user.name }}</td>
          <td class="p-2 border">{{ p.status }}</td>
          <td class="p-2 border space-x-2">
            <button
              v-if="p.status === 'pending'"
              @click="approve(p._id)"
              class="px-3 py-1 bg-green-600 text-white rounded"
            >Approve</button>
            <button
              v-if="p.status === 'pending'"
              @click="reject(p._id)"
              class="px-3 py-1 bg-red-600 text-white rounded"
            >Reject</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { API_BASE_URL } from '@/config';
import { ref, onMounted } from 'vue';

const providers = ref([]);

const fetchProviders = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/provider-profiles`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await res.json();
    providers.value = data.profiles;
  } catch (err) {
    console.error(err);
  }
};

const approve = async (id) => {
  await fetch(`${API_BASE_URL}/provider-profiles/${id}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  fetchProviders();
};

const reject = async (id) => {
  const reason = prompt('Enter rejection reason:');
  if (!reason) return;
  await fetch(`${API_BASE_URL}/provider-profiles/${id}/reject`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ reason }),
  });
  fetchProviders();
};

onMounted(fetchProviders);
</script>
