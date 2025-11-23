const routes = [
  {
    path: '/',
    component: () => import('src/pages/LoginPage.vue'),
  },

  {
    path: '/login',
    component: () => import('src/pages/LoginPage.vue'),
  },

  {
    path: '/dashboard',
    component: () => import('src/pages/DashboardPage.vue'),
  },

  {
    path: '/admindashboard',
    component: () => import('src/pages/AdminDashboardPage.vue'),
  },

  {
    path: '/admin-dashboard',
    component: () => import('src/pages/AdminDashboardPage.vue'),
  },

  {
    path: '/forgot-password',
    component: () => import('src/pages/ForgotPasswordPage.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
