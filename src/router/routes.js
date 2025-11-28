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

  // ChatBot page for onboarding assistant
  {
    path: '/chatbot',
    component: () => import('src/pages/ChatBot.vue'),
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
    path: '/forgot-password',
    component: () => import('src/pages/ForgotPasswordPage.vue'),
  },

  // Admin area wrapped by AdminLayout and protected by a route guard (meta.requiresAdmin)
  {
    path: '/admin',
    component: () => import('src/layouts/AdminLayout.vue'),
    meta: { requiresAdmin: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', component: () => import('src/pages/Admin/DashboardPage.vue') },
      { path: 'interactions', component: () => import('src/pages/Admin/InteractionsPage.vue') },
      { path: 'conversations', component: () => import('src/pages/Admin/ConversationsPage.vue') },
      { path: 'scheduled', component: () => import('src/pages/Admin/ScheduledMessagesPage.vue') },
      { path: 'employees', component: () => import('src/pages/Admin/EmployeesPage.vue') },
      { path: 'settings', component: () => import('src/pages/Admin/SettingsPage.vue') },
    ],
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
