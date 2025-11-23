import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'src/boot/axios'

// MongoDB role id for the Administrator role (from DB)
export const ADMIN_ROLE_ID = '6913adbcca79acfd93858d5c'

// If there is a token stored, ensure api has Authorization header set on startup
const _token = localStorage.getItem('token')
if (_token) {
  api.defaults.headers.common.Authorization = `Bearer ${_token}`
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    role: localStorage.getItem('role') || null,
    roleId: localStorage.getItem('roleId') || null,
    isAdmin: (localStorage.getItem('roleId') === ADMIN_ROLE_ID) || (localStorage.getItem('role') === 'Administrador') || false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
  },

  actions: {
    async login(credentials) {
      // Try multiple login endpoints/payload shapes to be compatible with backend variants.
      try {
        // keep a copy of credentials to try various shapes
        const tryBodies = [
          // common: { email, password }
          { email: credentials.email, password: credentials.password },
          // backend variant: { correo, password }
          { correo: credentials.email || credentials.correo, password: credentials.password },
          // pass through whatever the caller provided
          credentials,
        ]

        let resp = null
        // attempt endpoints in order (include lowercase 'usuario' variants used by backend)
        const endpoints = [
          'usuario/login',
          'Usuario/login',
          'auth/login',
          'Usuario',
          'usuario',
        ]

        for (const body of tryBodies) {
          for (const ep of endpoints) {
            try {
              resp = await api.post(ep, body)
              if (resp && resp.status >= 200 && resp.status < 300) break
            } catch {
              // ignore and try next
            }
          }
          if (resp) break
        }

        if (!resp) {
          return { ok: false, error: new Error('Login failed on all endpoints') }
        }

        // Response may contain token and optional user. Support different shapes.
        const data = resp.data || {}
        // look for token in common places
        const token = data.token || data.accessToken || data?.data?.token
        this.token = token || null

        // set auth header if token found
        if (this.token) {
          api.defaults.headers.common.Authorization = `Bearer ${this.token}`
          localStorage.setItem('token', this.token)
        }

        // determine user object: resp.data.user || resp.data.usuario || call Usuario list endpoint to find by email
        let user = data.user || data.usuario || data.data || null

        if (!user) {
          // try to fetch user list and find by email/correo
          try {
            const listRes = await api.get('Usuario')
            const allUsers = Array.isArray(listRes.data) ? listRes.data : listRes.data.users || listRes.data || []
            const lookupEmail = (credentials.email || credentials.correo || '').toLowerCase()
            user = allUsers.find(u => (u.email || u.correo || u.nombre || '').toString().toLowerCase().includes(lookupEmail)) || null
          } catch {
            // ignore — user may be returned by login endpoint
          }
        }

        this.user = user

        // Prefer explicit nested role: user.role.name
        let finalRole = null
        // Keep the role id available; prefer user.role._id if present
        let finalRoleId = null
        if (user && user.role && typeof user.role === 'object') {
          finalRoleId = user.role._id || user.role.id || null
          if (user.role.name) {
            finalRole = user.role.name
          }
        } else {
          // fallback: extract role from other common fields (could be string, object or ObjectId reference)
          let rawRole = user?.rol || user?.rol_ref || user?.rolRef || localStorage.getItem('role') || null

          // If rawRole is an object with _id, use its id
          let roleId = null
          if (rawRole && typeof rawRole === 'object') {
            roleId = rawRole._id || rawRole.id || null
          } else if (rawRole && typeof rawRole === 'string') {
            // if it's a 24-char hex string, treat as ObjectId
            const maybeId = rawRole.trim()
            if (/^[a-fA-F0-9]{24}$/.test(maybeId)) {
              roleId = maybeId
            }
          }

          // If we have a roleId, fetch role document to get the name
          if (roleId) {
            try {
              const roleRes = await api.get(`Rol/${roleId}`)
              const roleDoc = roleRes.data || roleRes.data?.data || null
              finalRole = roleDoc?.nombre || roleDoc?.name || roleDoc?.nombreRol || null
            } catch {
              // ignore fetch error
              finalRole = null
            }
          }

          // If finalRole still not set, and rawRole is a string, use it
          if (!finalRole && rawRole && typeof rawRole === 'string') {
            finalRole = rawRole
          }
        }

        // Normalize to exact 'Administrador' when appropriate
        if (finalRole && typeof finalRole === 'string') {
          const low = finalRole.toLowerCase()
          if (low.includes('admin') || low.includes('administrador')) {
            finalRole = 'Administrador'
          }
        }

        // Save resolved values
        this.role = finalRole
        // Ensure user.role._id is present if we fetched a role doc earlier
        if (!finalRoleId && user && user.role && typeof user.role === 'object') {
          finalRoleId = user.role._id || user.role.id || null
        }

        this.roleId = finalRoleId
        if (this.roleId) {
          localStorage.setItem('roleId', this.roleId)
        } else {
          localStorage.removeItem('roleId')
        }
        // Also expose a convenience boolean
        this.isAdmin = (finalRoleId === ADMIN_ROLE_ID) || (finalRole === 'Administrador')
        if (this.isAdmin) {
          localStorage.setItem('role', 'Administrador')
        }

        // persist user/role if present
        if (this.user) localStorage.setItem('user', JSON.stringify(this.user))
        if (this.role) localStorage.setItem('role', this.role)

        return { ok: true }
      } catch (err) {
        return { ok: false, error: err }
      }
    },

    logout() {
      this.token = null
      this.user = null
      this.role = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
      delete api.defaults.headers.common.Authorization
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
