import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'src/boot/axios'
import { getRoleFromToken, isTokenExpired, parseJwt } from 'src/utils/jwt'

// MongoDB role id for the Administrator role (from DB)
export const ADMIN_ROLE_ID = '6913adbcca79acfd93858d5c'

// Normalize role values coming from different sources (token claim may be array/string/object)
function normalizeRole(raw) {
  if (!raw) return null
  if (Array.isArray(raw)) {
    // prefer any admin-like value
    const admin = raw.find(r => typeof r === 'string' && /admin/i.test(r))
    if (admin) return 'Administrador'
    const user = raw.find(r => typeof r === 'string' && /(usuario|user)/i.test(r))
    if (user) return 'Usuario'
    const first = raw.find(r => typeof r === 'string')
    return first || null
  }
  if (raw && typeof raw === 'object') {
    const name = raw.nombre || raw.name || raw.rol || raw.role || null
    return normalizeRole(name)
  }
  if (typeof raw === 'string') {
    const low = raw.toLowerCase().trim()
    if (low.includes('admin') || low.includes('administrador') || low === 'admin') return 'Administrador'
    if (low.includes('usuario') || low.includes('user') || low === 'user') return 'Usuario'
    return raw
  }
  return null
}

// Map role IDs to role names (based on your backend constants)
const ROLE_ID_ADMIN = '6913adbcca79acfd93858d5c'
const ROLE_ID_USER = '692284a99875b23f82fb7023'

function getRoleNameFromId(roleId) {
  if (!roleId) return null
  if (roleId === ROLE_ID_ADMIN) return 'Administrador'
  if (roleId === ROLE_ID_USER) return 'Usuario'
  return null
}


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
    roleName: (state) => state.role,
    isAdminGetter: (state) => state.isAdmin,
  },

  actions: {
    async hydrate() {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        // if expired, logout
        if (isTokenExpired(token)) {
          this.logout()
          return
        }

        this.token = token
        api.defaults.headers.common.Authorization = `Bearer ${token}`

        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          try {
            this.user = JSON.parse(storedUser)
          } catch {
            this.user = null
          }
        }

        // prefer persisted role, otherwise decode from token
        const roleRaw = localStorage.getItem('role') || getRoleFromToken(token)
        const roleNorm = normalizeRole(roleRaw)
        this.role = roleNorm

        // set isAdmin convenience flag
        this.isAdmin = (this.role === 'Administrador') || (this.roleId === ADMIN_ROLE_ID)
        if (this.role) localStorage.setItem('role', this.role)
      } catch {
        // ignore hydration errors
      }
    },

    // Try to ensure we have a current user object by calling common endpoints
    async ensureUserFromApi() {
      if (this.user) return
      if (!this.token) return

      // try to get email from token to lookup
      let emailFromToken = null
      try {
        const payload = parseJwt(this.token)
        emailFromToken = payload?.email || payload?.correo || payload?.upn || payload?.sub || null
      } catch { void 0 }

      const tryEndpoints = ['Usuario/me', 'usuario/me', 'auth/me', 'Usuario', 'usuario']
      for (const ep of tryEndpoints) {
        try {
          const res = await api.get(ep)
          if (res && res.status >= 200 && res.status < 300) {
            const data = res.data
            // If endpoint returned a user object directly
            if (data && (data.email || data.correo || data.nombre || data._id)) {
              this.user = data
              localStorage.setItem('user', JSON.stringify(this.user))
              return
            }

            // If endpoint returned a list, try to find by email
            const list = Array.isArray(data) ? data : data.users || data.data || null
            if (Array.isArray(list) && list.length > 0) {
              if (emailFromToken) {
                const found = list.find(u => ((u.email || u.correo || u.nombre) || '').toString().toLowerCase().includes((emailFromToken || '').toString().toLowerCase()))
                if (found) {
                  this.user = found
                  localStorage.setItem('user', JSON.stringify(this.user))
                  return
                }
              } else {
                // fallback: first item
                this.user = list[0]
                localStorage.setItem('user', JSON.stringify(this.user))
                return
              }
            }
          }
        } catch {
          // ignore and try next
        }
      }
      // If we still don't have a user, try role-based lists to find the user by email
      try {
        if (!this.user && emailFromToken) {
          // check admin list first
          try {
            const adminRes = await api.get(`Usuario/rol/${ROLE_ID_ADMIN}`)
            const admins = Array.isArray(adminRes.data) ? adminRes.data : adminRes.data?.data || []
            const foundAdmin = admins.find(u => ((u.correo || u.email || u.nombre) || '').toString().toLowerCase().includes((emailFromToken || '').toString().toLowerCase()))
            if (foundAdmin) {
              this.user = foundAdmin
              this.roleId = ROLE_ID_ADMIN
              this.role = getRoleNameFromId(this.roleId)
              localStorage.setItem('user', JSON.stringify(this.user))
              localStorage.setItem('roleId', this.roleId)
              localStorage.setItem('role', this.role)
              return
            }
          } catch { void 0 }

          // then check user list
          try {
            const userRes = await api.get(`Usuario/rol/${ROLE_ID_USER}`)
            const users = Array.isArray(userRes.data) ? userRes.data : userRes.data?.data || []
            const foundUser = users.find(u => ((u.correo || u.email || u.nombre) || '').toString().toLowerCase().includes((emailFromToken || '').toString().toLowerCase()))
            if (foundUser) {
              this.user = foundUser
              this.roleId = ROLE_ID_USER
              this.role = getRoleNameFromId(this.roleId)
              localStorage.setItem('user', JSON.stringify(this.user))
              localStorage.setItem('roleId', this.roleId)
              localStorage.setItem('role', this.role)
              return
            }
          } catch { void 0 }
        }
      } catch { void 0 }
    },
    async login(credentials) {
      // Validate incoming credentials early to avoid useless network calls
      const incomingEmail = credentials?.email || credentials?.correo || credentials?.username || null
      const incomingPassword = credentials?.password || credentials?.pass || null
      if (!incomingEmail || !incomingEmail.toString().trim()) {
        return { ok: false, error: new Error('El correo o email es requerido') }
      }
      if (!incomingPassword || !incomingPassword.toString().trim()) {
        return { ok: false, error: new Error('La contraseña es requerida') }
      }

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
        // attempt endpoints in order (include lowercase 'usuario' variants used by backend
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

        // If still no user, try role-based endpoints to find by email and determine roleId
        if (!user && (credentials.email || credentials.correo)) {
          const lookupEmail = (credentials.email || credentials.correo).toString().toLowerCase()
          try {
            const adminRes = await api.get(`Usuario/rol/${ROLE_ID_ADMIN}`)
            const admins = Array.isArray(adminRes.data) ? adminRes.data : adminRes.data?.data || []
            const foundAdmin = admins.find(u => ((u.correo || u.email || u.nombre) || '').toString().toLowerCase().includes(lookupEmail))
            if (foundAdmin) {
              user = foundAdmin
              this.roleId = ROLE_ID_ADMIN
              this.role = getRoleNameFromId(this.roleId)
            }
          } catch { void 0 }

          if (!user) {
            try {
              const userRes = await api.get(`Usuario/rol/${ROLE_ID_USER}`)
              const users = Array.isArray(userRes.data) ? userRes.data : userRes.data?.data || []
              const foundUser = users.find(u => ((u.correo || u.email || u.nombre) || '').toString().toLowerCase().includes(lookupEmail))
              if (foundUser) {
                user = foundUser
                this.roleId = ROLE_ID_USER
                this.role = getRoleNameFromId(this.roleId)
              }
            } catch { void 0 }
          }
        }

        this.user = user

        // Extract role: first try by ID mapping, then by name
        let finalRole = null
        let finalRoleId = null

        // Strategy 1: Check user.rol (or user.Rol) - backend may return either ROLE ID or ROLE NAME
        const userRoleField = user?.rol || user?.Rol || user?.rolRef || user?.RolRef || null
        if (userRoleField) {
          if (typeof userRoleField === 'string' && /^[0-9a-fA-F]{24}$/.test(userRoleField)) {
            // it's an id
            finalRoleId = userRoleField
            const roleById = getRoleNameFromId(userRoleField)
            if (roleById) finalRole = roleById
          } else if (typeof userRoleField === 'string') {
            // likely a role NAME like 'Administrador' or 'Usuario'
            const norm = userRoleField.toString().toLowerCase()
            if (norm.includes('admin')) {
              finalRole = 'Administrador'
              finalRoleId = ROLE_ID_ADMIN
            } else if (norm.includes('usuario') || norm.includes('user')) {
              finalRole = 'Usuario'
              finalRoleId = ROLE_ID_USER
            } else {
              finalRole = normalizeRole(userRoleField)
            }
          }
        }

        // Strategy 2: If user has nested role object
        if (!finalRole && user?.role && typeof user.role === 'object') {
          finalRoleId = user.role._id || user.role.id || null
          if (user.role.name) {
            finalRole = normalizeRole(user.role.name)
          }
        }

        // If user exists but no roleId provided, try to determine roleId by checking role-lists by email
        if (!finalRoleId) {
          // derive an email to lookup: prefer user object, then token, then credentials
          let lookupEmail = (user?.correo || user?.email || user?.nombre) || null
          if (!lookupEmail && this.token) {
            try {
              const payload = parseJwt(this.token)
              lookupEmail = payload?.email || payload?.correo || payload?.upn || payload?.sub || null
            } catch { void 0 }
          }

          if (lookupEmail) {
            const lookupLower = lookupEmail.toString().toLowerCase()
            try {
              const adminRes = await api.get(`Usuario/rol/${ROLE_ID_ADMIN}`)
              const admins = Array.isArray(adminRes.data) ? adminRes.data : adminRes.data?.data || []
              const foundAdmin = admins.find(u => ((u.correo || u.email || u.nombre) || '').toString().toLowerCase().includes(lookupLower))
              if (foundAdmin) {
                finalRoleId = ROLE_ID_ADMIN
                finalRole = getRoleNameFromId(finalRoleId)
                if (!user) user = foundAdmin
              }
            } catch { void 0 }

            if (!finalRoleId) {
              try {
                const userRes = await api.get(`Usuario/rol/${ROLE_ID_USER}`)
                const users = Array.isArray(userRes.data) ? userRes.data : userRes.data?.data || []
                const foundUser = users.find(u => ((u.correo || u.email || u.nombre) || '').toString().toLowerCase().includes(lookupLower))
                if (foundUser) {
                  finalRoleId = ROLE_ID_USER
                  finalRole = getRoleNameFromId(finalRoleId)
                  if (!user) user = foundUser
                }
              } catch { void 0 }
            }
          }
        }

        // Save resolved values (normalize arrays/objects/strings)
        this.role = normalizeRole(finalRole)
        // If role still not determined, try to decode from token
        if (!this.role && this.token) {
          const tokenRole = getRoleFromToken(this.token)
          if (tokenRole) {
            this.role = normalizeRole(tokenRole)
          }
        }
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
        // Also expose a convenience boolean - check by ID first, then by name
        this.isAdmin = (this.roleId === ROLE_ID_ADMIN) || (this.role === 'Administrador')
        if (this.isAdmin) {
          localStorage.setItem('role', 'Administrador')
        }

        // persist user/role if present
        if (this.user) localStorage.setItem('user', JSON.stringify(this.user))
        if (this.role) localStorage.setItem('role', this.role)

        // Persist roleId if present
        if (this.roleId) localStorage.setItem('roleId', this.roleId)

        return { ok: true }
      } catch (err) {
        return { ok: false, error: err }
      }
    },

    can(allowed) {
      if (!allowed) return true
      const role = this.role || localStorage.getItem('role')
      const list = Array.isArray(allowed) ? allowed : [allowed]
      return list.includes(role)
    },

    logout() {
      this.token = null
      this.user = null
      this.role = null
      this.roleId = null
      this.isAdmin = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
      localStorage.removeItem('roleId')
      delete api.defaults.headers.common.Authorization
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
