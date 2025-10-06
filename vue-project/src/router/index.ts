import { createRouter, createWebHistory } from 'vue-router'
import Login from "@/views/Login.vue";
import Signup from "@/views/Signup.vue";
import AdminSignup from '@/views/AdminSignup.vue';
import DashboardSwitch from '@/views/DashboardSwitch.vue';
import HomeView from '@/views/HomeView.vue';
import ProviderStatus from '@/views/ProviderStatus.vue';

//adminDashboard
import AdminDashboard from "@/views/Admin/AdminDashboard.vue";
import MakeAnnouncements from '@/views/Admin/MakeAnnouncements.vue';
import ManageChats from '@/views/Admin/ManageChats.vue';
import ManageContacts from '@/views/Admin/ManageContacts.vue';
import ManageHomeowners from '@/views/Admin/ManageHomeowners.vue';
import ManageJobs from '@/views/Admin/ManageJobs.vue';
import ManageProviders from '@/views/Admin/ManageProviders.vue';
import ManageReviews from '@/views/Admin/ManageReviews.vue';
import ManagePayments from '@/views/Admin/ManagePayments.vue';
import ManageProposals from '@/views/Admin/ManageProposals.vue';

//clientDashboard
import ClientDashboard from "@/views/client/ClientDashboard.vue";
import ManagesChat from '@/views/client/ManagesChat.vue';
import ManagesJobs from '@/views/client/ManagesJobs.vue';
import ViewProviders from '@/views/client/ViewProviders.vue';
import ManagesReviews from '@/views/client/ManagesReviews.vue';

//providerDashboard
import ProviderDashboard from "@/views/Provider/ProviderDashboard.vue";
import ManagesProposals from '@/views/Provider/ManagesProposals.vue';
import viewJobs from '@/views/Provider/viewJobs.vue';
import ManagesChats from '@/views/Provider/ManagesChats.vue';
import ManagesReview from '@/views/Provider/ManagesReview.vue';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{ path: "/login", component: Login, meta: { public: true } },
    { path: "/", component: HomeView, meta: { public: true } },
  { path: "/signup", component: Signup, meta: { public: true } },
  { path: "/adminSignup", component: AdminSignup, meta: { public: true} },
  { path: "/dashboard/switch", component: DashboardSwitch },
  { path: "/onboarding/provider", component: () => import('@/views/ProviderOnboarding.vue') },
  { path: "/post-job", component: () => import('@/views/PostJob.vue')},
  { path: "/provider-status", component: ProviderStatus},

  // AdminDashboard routes
    { path: "/dashboard/admin", component: AdminDashboard, name: 'AdminDashboard', meta: { layout: 'dashboard'} },
    {
      path: '/dashboard/admin/makeAnnouncement',
      name: 'AdminDashboardMakeAnnouncements',
      component: MakeAnnouncements,
      meta: { layout: 'dashboard' }
    },
    {
      path: '/dashboard/admin/managechats',
      name: 'AdminDashboardManageChats',
      component: ManageChats,
      meta: { layout: 'dashboard' }
    },
    {
      path: '/dashboard/admin/ManageContacts',
      name: 'AdminDashboardManageContacts',
      component: ManageContacts,
      meta: { layout: 'dashboard' }
    },
    {
      path: '/dashboard/admin/ManageHomeowners',
      name: 'AdminDashboardManageHomeowners',
      component: ManageHomeowners,
      meta: { layout: 'dashboard' }
    },
    {
      path: '/dashboard/admin/ManageJobs',
      name: 'AdminDashboardManageJobs',
      component: ManageJobs,
      meta: { layout: 'dashboard' }
    },
    {
      path: '/dashboard/admin/ManagePayments',
      name: 'AdminDashboardManagePayments',
      component: ManagePayments,
      meta: { layout: 'dashboard' }
    },
    {
      path: '/dashboard/admin/manageproposals',
      name: 'AdminDashboardManageproposals',
      component: ManageProposals,
      meta: { layout: 'dashboard' }
    },
    {
      path: '/dashboard/admin/ManageProviders',
      name: 'AdminDashboardManageProviders',
      component: ManageProviders,
      meta: { layout: 'dashboard' }
    },
    {
      path: '/dashboard/admin/ManageReviewss',
      name: 'AdminDashboardManageReviews',
      component: ManageReviews,
      meta: { layout: 'dashboard' }
    },

    // clientDashboard routes
    { path: "/dashboard/client", component: ClientDashboard, name: 'ClientDashboard', meta: { layout: 'dashboard'} },
    {
      path: '/dashboard/client/Manageschat',
      name: 'ClientDashboardManageschat',
      component: ManagesChat,
      meta: { layout: 'dashboard' }
    },
    {
      path: '/dashboard/client/Managesjobs',
      name: 'ClientDashboardManagesjobs',
      component: ManagesJobs,
      meta: { layout: 'dashboard' }
    },
    {
      path: '/dashboard/client/ManagesReviews',
      name: 'ClientDashboardManagesReviews',
      component: ManagesReviews,
      meta: { layout: 'dashboard' }
    },
    {
      path: '/dashboard/client/ViewProviders',
      name: 'ClientDashboardViewProviders',
      component: ViewProviders,
      meta: { layout: 'dashboard' }
    },
    // ProviderDashboardRoutes

    { path: "/dashboard/provider", component: ProviderDashboard , name: 'ProviderDashboard', meta: {layout: 'dashboard'}},
    {
      path: '/dashboard/provider/ManagesReview',
      name: 'ProviderDashboardManagesReview',
      component: ManagesReview,
      meta: { layout: 'dashboard' }
    },
    {
      path: '/dashboard/provider/viewjobs',
      name: 'ProviderDashboardViewjobs',
      component: viewJobs,
      meta: { layout: 'dashboard' }
    },
    {
      path: '/dashboard/provider/Manageschats',
      name: 'providerDashboardManageschats',
      component: ManagesChats,
      meta: { layout: 'dashboard' }
    },
    {
      path: '/dashboard/provider/ManagesProposals',
      name: 'ProviderDashboardManagesProposals',
      component: ManagesProposals,
      meta: { layout: 'dashboard' }
    },
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
router.beforeEach((to, from, next) => {
  if (['/onboarding/provider', '/provider-status'].includes(to.path)) {
    localStorage.setItem('previousRoute', from.fullPath || '/dashboard/switch');
  }

  const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
  if (to.path === '/onboarding/provider' && onboardingComplete) {
    return next('/provider-status');
  }

  if (to.path === '/provider-status' && !onboardingComplete) {
    return next('/onboarding/provider');
  }
  next();
});
export default router
