import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Route guard using Pinia auth store.
  Router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta && record.meta.requiresAdmin)) {
      // lazy-import the auth store to avoid circular issues
      try {
        const { useAuthStore, ADMIN_ROLE_ID } = require('src/stores/auth')
        const auth = useAuthStore()
        // Require admin by MongoDB role id when available, fallback to role name
        const isAdminById = !!(auth.user && auth.user.role && (auth.user.role._id === ADMIN_ROLE_ID))
        const isAdminByStore = auth.role === 'Administrador' || auth.isAdmin === true
        const isAdmin = isAdminById || isAdminByStore || (localStorage.getItem('role') === 'Administrador')
        if (!auth.isLoggedIn || !isAdmin) {
          return next({ path: '/login' })
        }
      } catch {
        // fallback to localStorage if store isn't ready
        const isAdmin = localStorage.getItem('role') === 'Administrador' || localStorage.getItem('userRole') === 'Administrador'
        if (!isAdmin) {
          return next({ path: '/login' })
        }
      }
    }
    next()
  })

  return Router
})
