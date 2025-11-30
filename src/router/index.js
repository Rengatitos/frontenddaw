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

  // Route guard using Pinia auth store. Supports `meta.requiresAdmin` and `meta.roles` (array)
  Router.beforeEach((to, from, next) => {
    // Restrict direct access to onboarding chat unless opened from another window or with explicit allow flag
    if (to.path === '/onboarding-chat') {
      const hasOpener = typeof window !== 'undefined' && window.opener
      const allowed = to.query && (to.query.allow === '1' || to.query.from === 'dashboard')
      if (!hasOpener && !allowed) {
        return next({ path: '/forbidden' })
      }
    }
    // gather required roles from matched routes (if any)
    const requiredRoles = to.matched.reduce((acc, r) => {
      if (r.meta && r.meta.roles) {
        const arr = Array.isArray(r.meta.roles) ? r.meta.roles : [r.meta.roles]
        return acc.concat(arr)
      }
      return acc
    }, [])

    const requiresAdmin = to.matched.some(record => record.meta && record.meta.requiresAdmin)

    // If no role-based restrictions, continue
    if (!requiresAdmin && requiredRoles.length === 0) {
      return next()
    }

    // lazy-import the auth store to avoid circular issues
    try {
      const { useAuthStore, ADMIN_ROLE_ID } = require('src/stores/auth')
      const auth = useAuthStore()

      // Must be logged in for role-protected routes
      if (!auth.isLoggedIn) {
        return next({ path: '/login', query: { redirect: to.fullPath } })
      }

      // prefer roleId checks when available
      const roleName = auth.role || localStorage.getItem('role')
      const roleId = auth.roleId || auth.user?.rol || auth.user?.rolRef || auth.user?.role?._id || localStorage.getItem('roleId')

      if (requiresAdmin) {
        const isAdminById = roleId === ADMIN_ROLE_ID
        const isAdminByName = roleName === 'Administrador' || auth.isAdmin === true
        const isAdmin = isAdminById || isAdminByName
        if (!isAdmin) return next({ path: '/forbidden' })
      }

      if (requiredRoles.length > 0) {
        // support route meta roles as either role NAMES or role IDs
        const ok = requiredRoles.some((r) => {
          const candidate = String(r || '')
          const isIdLike = /^[0-9a-fA-F]{24}$/.test(candidate)
          if (isIdLike) {
            return roleId && roleId === candidate
          }
          return roleName && roleName === candidate
        })
        if (!ok) return next({ path: '/forbidden' })
      }

      return next()
    } catch {
      // fallback: use localStorage minimal check
      const role = localStorage.getItem('role')
      if (requiresAdmin && role !== 'Administrador') {
        return next({ path: '/login' })
      }
      if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
        return next({ path: '/forbidden' })
      }
      return next()
    }
  })

  return Router
})
