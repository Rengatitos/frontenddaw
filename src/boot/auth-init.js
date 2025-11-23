import { defineBoot } from '#q-app/wrappers'
import { useAuthStore } from 'src/stores/auth'
import { api } from 'src/boot/axios'

export default defineBoot(async ({ router }) => {
  const auth = useAuthStore()

  // If token is in localStorage, set header and restore basic state
  const token = localStorage.getItem('token')
  const storedUser = localStorage.getItem('user')
  const storedRole = localStorage.getItem('role')

  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    auth.token = token
  }

  if (storedUser) {
    try {
      auth.user = JSON.parse(storedUser)
    } catch {
      auth.user = null
    }
  }

  if (storedRole) {
    auth.role = storedRole
  }

  // If we have a token but no role/user info, try to refresh from API
  if (auth.token && !auth.user) {
    try {
      // Try to get users list and match by email stored in localStorage (if available)
      const maybeEmail = localStorage.getItem('user_email') || auth.user?.correo || auth.user?.email || null
      const listRes = await api.get('Usuario')
      const allUsers = Array.isArray(listRes.data) ? listRes.data : listRes.data.users || listRes.data || []
      if (maybeEmail) {
        const lookup = (maybeEmail || '').toLowerCase()
        const found = allUsers.find(u => ((u.email || u.correo || u.nombre) || '').toString().toLowerCase().includes(lookup))
        if (found) {
          auth.user = found
          localStorage.setItem('user', JSON.stringify(found))
        }
      }
    } catch {
      // ignore
    }
  }

  // If user present but role missing, attempt to resolve via Rol endpoint
  if (auth.user && !auth.role) {
    const rawRole = auth.user?.rol || auth.user?.rol_ref || auth.user?.rolRef || null
    let roleId = null
    if (rawRole && typeof rawRole === 'object') roleId = rawRole._id || rawRole.id || null
    else if (rawRole && typeof rawRole === 'string' && /^[a-fA-F0-9]{24}$/.test(rawRole)) roleId = rawRole

    if (roleId) {
      try {
        const roleRes = await api.get(`Rol/${roleId}`)
        const roleDoc = roleRes.data || roleRes.data?.data || null
        let finalRole = roleDoc?.nombre || roleDoc?.name || roleDoc?.nombreRol || null
        if (finalRole && typeof finalRole === 'string') {
          const low = finalRole.toLowerCase()
          if (low.includes('admin') || low.includes('administrador')) finalRole = 'Administrador'
        }
        auth.role = finalRole
        if (finalRole) localStorage.setItem('role', finalRole)
      } catch {
        // ignore
      }
    }
  }

  // If after init we are on an admin route but not admin, redirect to login
  if (router && router.currentRoute && router.currentRoute.value) {
    const to = router.currentRoute.value
    if (to.matched.some(r => r.meta && r.meta.requiresAdmin)) {
      if (!auth.isLoggedIn || auth.role !== 'Administrador') {
        router.replace('/login')
      }
    }
  }
})
