import { useAuthStore } from 'src/stores/auth'

export default {
  mounted(el, binding) {
    const value = binding.value
    const store = useAuthStore()
    const role = store.role || localStorage.getItem('role') || null
    const roleId = store.roleId || localStorage.getItem('roleId') || null

    // Support passing either role NAMES or role ID strings in the directive
    const values = Array.isArray(value) ? value : [value]
    const allowed = values.some(v => {
      if (!v) return false
      const s = String(v)
      // detect an id-like value (24 hex chars)
      if (/^[0-9a-fA-F]{24}$/.test(s)) {
        return roleId && roleId === s
      }
      return role && role === s
    })
    if (!allowed) {
      el.style.display = 'none'
    }
  },
}
