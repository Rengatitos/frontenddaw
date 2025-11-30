// AdminReturns: obtiene los datos del asesor/admin ligado a la sala del usuario.
// Lógica: resuelve usuarioId -> lista salas -> match sala_salaID o por correo/nombre -> usuarioRef -> GET Usuario/{adminRef}

import axios from 'axios'

const API_BASE = 'https://backend-daw.onrender.com/api'

function authHeaders(token) {
  const headers = { accept: '*/*' }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

function getUsuarioIdSafe(explicitUsuarioId) {
  const fromStorage = localStorage.getItem('usuarioId')
  if (explicitUsuarioId) {
    const v = typeof explicitUsuarioId === 'object' ? explicitUsuarioId.id || explicitUsuarioId._id || explicitUsuarioId.toString() : explicitUsuarioId
    return String(v)
  }
  if (fromStorage && fromStorage !== 'undefined' && fromStorage !== '[object Object]') {
    return String(fromStorage)
  }
  try {
    const lrRaw = localStorage.getItem('loginResponse')
    if (lrRaw) {
      const lr = JSON.parse(lrRaw)
      const idFromLogin = lr?.usuario?.id || lr?.usuario?._id
      if (idFromLogin) return String(idFromLogin)
    }
  } catch { /* ignore */ }
  return null
}

async function fetchUsuario(usuarioId, token) {
  const url = `${API_BASE}/Usuario/${encodeURIComponent(String(usuarioId))}`
  console.log('[AdminReturns] GET', url)
  const { data } = await axios.get(url, { headers: authHeaders(token) })
  return data
}

async function fetchSalas(token) {
  const url = `${API_BASE}/salas`
  console.log('[AdminReturns] GET', url)
  const { data } = await axios.get(url, { headers: authHeaders(token) })
  return Array.isArray(data) ? data : data?.data || []
}

async function fetchAdminById(id, token) {
  const url = `${API_BASE}/Usuario/${encodeURIComponent(String(id))}`
  console.log('[AdminReturns] GET', url)
  const { data } = await axios.get(url, { headers: authHeaders(token) })
  return data
}

export async function AdminReturns(opts = {}) {
  const usuarioId = getUsuarioIdSafe(opts.usuarioId)
  const token = opts.token
  if (!usuarioId) throw new Error('AdminReturns: usuarioId no disponible')

  // Para matching por correo/nombre necesitamos el usuario
  let usuario = null
  try { usuario = await fetchUsuario(usuarioId, token) } catch { usuario = null }

  const salas = await fetchSalas(token)
  const idEsperado = `sala_${usuarioId}`
  let sala = salas.find((s) => s?.id === idEsperado)

  if (!sala && usuario?.correo) {
    const lc = String(usuario.correo).toLowerCase()
    sala = salas.find((s) => String(s?.correo || '').toLowerCase() === lc)
  }
  if (!sala && usuario?.nombre) {
    const ln = String(usuario.nombre).toLowerCase()
    sala = salas.find((s) => String(s?.nombre || '').toLowerCase() === ln)
  }

  if (!sala) return { admin: null, sala: null }

  const adminRef = sala.usuarioRef
  if (!adminRef) return { admin: null, sala }

  const admin = await fetchAdminById(adminRef, token)
  return {
    admin: admin
      ? {
          id: admin.id || admin._id,
          nombre: admin.nombre,
          correo: admin.correo,
          telefono: admin.telefono,
          rolRef: admin.rolRef,
          nivelOnboarding: admin.nivelOnboarding,
          estado: admin.estado,
        }
      : null,
    sala,
  }
}

export default AdminReturns
