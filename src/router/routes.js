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
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/DashboardPage.vue'),
      },
    ],
  },

  {
    path: '/admindashboard',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/AdminDashboardPage.vue'),
      },
    ],
  },

  {
    path: '/admin-dashboard',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/AdminDashboardPage.vue'),
      },
    ],
  },

  {
    path: '/forgot-password',
    component: () => import('src/pages/ForgotPasswordPage.vue'),
  },

  {
    path: '/agente-ia',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/AgenteIAPage.vue'),
      },
    ],
  },

  {
    path: '/onboarding-chat',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/OnboardingChatPage.vue'),
      },
    ],
  },

  {
    path: '/progress',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/ProgressPage.vue'),
      },
    ],
  },

  {
    path: '/onboarding-ia',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/OnboardingIAPage.vue'),
      },
    ],
  },

  {
    path: '/mi-supervisor',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/MiSupervisorPage.vue'),
      },
    ],
  },

  {
    path: '/useful-links',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/UsefulLinksPage.vue'),
      },
    ],
  },

  {
    path: '/next-steps',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/NextStepsPage.vue'),
      },
    ],
  },

  {
    path: '/settings',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/SettingsPage.vue'),
      },
    ],
  },

  {
    path: '/help',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/HelpPage.vue'),
      },
    ],
  },

  // Error 404
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
