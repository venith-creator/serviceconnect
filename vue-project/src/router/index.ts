import { createRouter, createWebHistory } from 'vue-router'
import Login from "@/views/Login.vue";
import Signup from "@/views/Signup.vue";
import AdminSignup from '@/views/AdminSignup.vue';
import DashboardSwitch from '@/views/DashboardSwitch.vue';
import HomeView from '@/views/HomeView.vue';
import ProviderStatus from '@/views/ProviderStatus.vue';
import ForgotPassword from '@/views/ForgotPassword.vue';
import ResetPassword from '@/views/ResetPassword.vue';
import ContactView from '@/views/ContactView.vue';

//adminDashboard
import AdminDashboard from "@/views/Admin/AdminDashboard.vue";
import MakeAnnouncements from '@/views/Admin/MakeAnnouncements.vue';
import ManageBlogs from '@/views/Admin/ManageBlogs.vue';
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
import JobProposals from '@/views/client/JobProposals.vue';
import seeProvider from '@/views/client/seeProvider.vue';

//providerDashboard
import ProviderDashboard from "@/views/Provider/ProviderDashboard.vue";
import ManagesProposals from '@/views/Provider/ManagesProposals.vue';
import viewJobs from '@/views/Provider/viewJobs.vue';
import ManagesChats from '@/views/Provider/ManagesChats.vue';
import ManagesReview from '@/views/Provider/ManagesReview.vue';
import SubscriptionManagement from "@/views/SubscriptionManagement.vue";
import AdminJobProposals from '@/views/Admin/AdminJobProposals.vue';
import ProviderPortfolio from '@/views/Provider/ProviderPortfolio.vue';
import JobListing from "@/views/JobListing.vue";
import JobDetails from "@/views/JobDetails.vue";
import ProviderSettings from '@/views/Provider/ProviderSettings.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{ path: "/login", component: Login, meta: { public: true } },
    { path: "/", component: HomeView, meta: { public: true } },
  { path: "/signup", component: Signup, meta: { public: true } },
  { path: "/adminSignup", component: AdminSignup, meta: { public: true} },
  { path: "/dashboard/switch", component: DashboardSwitch },
  { path: "/onboarding/provider", component: () => import('@/views/ProviderOnboarding.vue') },
  { path: "/post-job", component: () => import('@/views/PostJob.vue')},
  { path: "/provider-status", component: ProviderStatus },
  { path: "/forgot-password", component: ForgotPassword, meta: { public: true } },
  { path: "/reset-password/:token", component: ResetPassword, meta: { public: true } },
  { path: "/contact", component: ContactView, meta: { public: true } },
  { path: "/listing", component: JobListing, meta: { public: true } },
  { path: "/listing/:id", component: JobDetails, meta: { public: true } },
  // AdminDashboard routes
    { path: "/dashboard/admin", component: AdminDashboard, name: 'AdminDashboard', meta: { layout: 'admin'} },
    {
      path: '/dashboard/admin/makeAnnouncement',
      name: 'AdminDashboardMakeAnnouncements',
      component: MakeAnnouncements,
      meta: { layout: 'admin' }
    },
    {
      path: '/dashboard/admin/job/:jobId/proposals',
      name: 'AdminDashboardJobProposals',
      component: AdminJobProposals,
      meta: { layout: 'admin' }
    },
    {
      path: '/dashboard/admin/managechats',
      name: 'AdminDashboardManageChats',
      component: ManageBlogs,
      meta: { layout: 'admin' }
    },
    {
      path: '/dashboard/admin/ManageContacts',
      name: 'AdminDashboardManageContacts',
      component: ManageContacts,
      meta: { layout: 'admin' }
    },
    {
      path: '/dashboard/admin/ManageHomeowners',
      name: 'AdminDashboardManageHomeowners',
      component: ManageHomeowners,
      meta: { layout: 'admin' }
    },
    {
      path: '/dashboard/admin/ManageJobs',
      name: 'AdminDashboardManageJobs',
      component: ManageJobs,
      meta: { layout: 'admin' }
    },
    {
      path: '/dashboard/admin/ManagePayments',
      name: 'AdminDashboardManagePayments',
      component: ManagePayments,
      meta: { layout: 'admin' }
    },
    {
      path: '/dashboard/admin/manageproposals',
      name: 'AdminDashboardManageproposals',
      component: ManageProposals,
      meta: { layout: 'admin' }
    },
    {
      path: '/dashboard/admin/ManageProviders',
      name: 'AdminDashboardManageProviders',
      component: ManageProviders,
      meta: { layout: 'admin' }
    },
    {
      path: '/dashboard/admin/ManageReviewss',
      name: 'AdminDashboardManageReviews',
      component: ManageReviews,
      meta: { layout: 'admin' }
    },

    // clientDashboard routes
    { path: "/dashboard/client", component: ClientDashboard, name: 'ClientDashboard', meta: { layout: 'client'} },
    {
      path: '/dashboard/client/Manageschat',
      name: 'ClientDashboardManageschat',
      component: ManagesChat,
      meta: { layout: 'client' }
    },
    {
      path: '/dashboard/client/job/:jobId/proposals',
      name: 'ClientDashboardJobProposals',
      component: JobProposals,
      meta: { layout: 'client' }
    },
    {
        path: '/dashboard/client/seeProvider/:providerId',
        name: 'ClientDashboardSeeProvider',
        component: seeProvider,
        meta: { layout: 'client' },
      },

    {
      path: '/dashboard/client/Managesjobs',
      name: 'ClientDashboardManagesjobs',
      component: ManagesJobs,
      meta: { layout: 'client' }
    },
    {
      path: '/dashboard/client/ManagesReviews',
      name: 'ClientDashboardManagesReviews',
      component: ManagesReviews,
      meta: { layout: 'client' }
    },
    {
      path: '/dashboard/client/ViewProviders',
      name: 'ClientDashboardViewProviders',
      component: ViewProviders,
      meta: { layout: 'client' }
    },
    {
      path: '/dashboard/client/post-job',
      name: 'ClientDashboardPostJob',
      component: () => import('@/views/PostJob.vue'),
      meta: { layout: 'client' }
    },
    // ProviderDashboardRoutes

    { path: "/dashboard/provider", component: ProviderDashboard , name: 'ProviderDashboard', meta: {layout: 'provider'}},
    {
      path: '/dashboard/provider/ManagesReview',
      name: 'ProviderDashboardManagesReview',
      component: ManagesReview,
      meta: { layout: 'provider' }
    },
    {
      path: '/dashboard/provider/viewjobs',
      name: 'ProviderDashboardViewjobs',
      component: viewJobs,
      meta: { layout: 'provider' }
    },
    {
      path: '/dashboard/provider/Manageschats',
      name: 'providerDashboardManageschats',
      component: ManagesChats,
      meta: { layout: 'provider' }
    },
    { path: '/dashboard/provider/ProviderPortfolio',
      name: 'ProviderDashboardProviderPortfolio',
      component: ProviderPortfolio,
      meta: { layout: 'provider' }
    },
    {
      path: '/dashboard/provider/ManagesProposals',
      name: 'ProviderDashboardManagesProposals',
      component: ManagesProposals,
      meta: { layout: 'provider' }
    },
    {
      path: '/dashboard/provider/subscription',
      name: 'SubscriptionManagement',
      component: SubscriptionManagement,
      meta: { layout: 'provider' }
    },
    {
        path: "/dashboard/provider/settings",
        name: "ProviderSettings",
        component: ProviderSettings,
        meta: { layout: 'provider', role: "provider" },
    }

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
  // Store the previous route for onboarding/providers
  if (['/onboarding/provider', '/provider-status'].includes(to.path)) {
    localStorage.setItem('previousRoute', from.fullPath || '/dashboard/switch');
  }

  // Check if onboarding is complete
  const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
  if (to.path === '/onboarding/provider' && onboardingComplete) {
    return next('/provider-status');
  }

  if (to.path === '/provider-status' && !onboardingComplete) {
    return next('/onboarding/provider');
  }

  // Check if the route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login if not authenticated
      return next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    }
  }

  next();
});
export default router
