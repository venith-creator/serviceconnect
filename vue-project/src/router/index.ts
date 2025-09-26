import { createRouter, createWebHistory } from 'vue-router'
import Login from "@/views/Login.vue";
import Signup from "@/views/Signup.vue";
import ClientDashboard from "@/views/ClientDashboard.vue";
import ProviderDashboard from "@/views/ProviderDashboard.vue";
import AdminDashboard from "@/views/AdminDashboard.vue";
import AdminSignup from '@/views/AdminSignup.vue';
import DashboardSwitch from '@/views/DashboardSwitch.vue';
import HomeView from '@/views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{ path: "/login", component: Login, meta: { public: true } },
    { path: "/", component: HomeView, meta: { public: true } },
  { path: "/signup", component: Signup, meta: { public: true } },
  { path: "/adminSignup", component: AdminSignup, meta: { public: true} },
  { path: "/dashboard/switch", component: DashboardSwitch },
  { path: "/dashboard/client", component: ClientDashboard },
  { path: "/dashboard/provider", component: ProviderDashboard },
  { path: "/dashboard/admin", component: AdminDashboard },
  { path: "/onboarding/provider", component: () => import('@/views/ProviderOnboarding.vue') },
  { path: "/post-job", component: () => import('@/views/PostJob.vue')}
],
scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition // back/forward button restores position
    }

    if (to.meta.public) {
      return { top: 0 } // public routes → scroll to top
    }

    // for dashboard/admin routes → keep current position
    return {}
  },
}
)

export default router
