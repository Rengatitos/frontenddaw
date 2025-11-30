// ChatBotReturns: agrega datos clave del backend para el OnboardingBot
// Usa axios para consultar múltiples endpoints y devuelve un objeto consolidado listo para el chat.

import axios from 'axios'

const API_BASE = 'https://backend-daw.onrender.com/api'

// Utilidad segura: obtiene usuarioId desde localStorage o argumento
function getUsuarioIdSafe(explicitUsuarioId) {
  const fromStorage = localStorage.getItem('usuarioId')
  // Try from loginResponse cache
  if (!explicitUsuarioId && !fromStorage) {
    try {
      const lrRaw = localStorage.getItem('loginResponse')
      if (lrRaw) {
        const lr = JSON.parse(lrRaw)
        const idFromLogin = lr?.usuario?.id || lr?.usuario?._id
        if (idFromLogin) return String(idFromLogin)
      }
    } catch {
      // ignore
    }
  }
  if (explicitUsuarioId) {
    const v = typeof explicitUsuarioId === 'object' ? explicitUsuarioId.id || explicitUsuarioId._id || explicitUsuarioId.toString() : explicitUsuarioId
    return String(v)
  }
  if (fromStorage && fromStorage !== 'undefined' && fromStorage !== '[object Object]') {
    return String(fromStorage)
  }
  return null
}

// Encabezados comunes (token opcional)
function authHeaders(token) {
  const headers = { accept: '*/*' }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

// Obtiene el usuario por id
async function fetchUsuario(usuarioId, token) {
  console.log('[ChatBotReturns] fetchUsuario id=', usuarioId)
  const safeId = encodeURIComponent(String(usuarioId))
  const url = `${API_BASE}/Usuario/${safeId}`
  console.log('[ChatBotReturns] GET', url)
  const { data } = await axios.get(url, { headers: authHeaders(token) })
  return data
}

// Obtiene rol por rolRef
async function fetchRol(rolRef, token) {
  console.log('[ChatBotReturns] fetchRol rolRef=', rolRef)
  const url = `${API_BASE}/Rol/${encodeURIComponent(String(rolRef))}`
  console.log('[ChatBotReturns] GET', url)
  const { data } = await axios.get(url, { headers: authHeaders(token) })
  return data
}

// Sala de chat (recordar: usuarioRef en sala es el admin/asesor, renombrar a adminRef)
// Según backend actual: GET /salas devuelve un array; filtrar por id === `sala_${usuarioId}`
async function fetchSala(usuarioId, token, hint = {}) {
  const idEsperado = `sala_${String(usuarioId)}`
  console.log('[ChatBotReturns] fetchSala usuarioId=', usuarioId, 'idEsperado=', idEsperado, 'hint=', { correo: hint?.correo, nombre: hint?.nombre })
  const urlList = `${API_BASE}/salas`
  console.log('[ChatBotReturns] GET', urlList)
  try {
    const { data } = await axios.get(urlList, { headers: authHeaders(token) })
    const list = Array.isArray(data) ? data : data?.data || []
    let found = Array.isArray(list) ? list.find(s => s?.id === idEsperado) : null
    if (!found && hint?.correo) {
      const lc = String(hint.correo).toLowerCase()
      found = list.find(s => String(s?.correo || '').toLowerCase() === lc)
      if (found) console.log('[ChatBotReturns] Sala encontrada por correo:', found.id)
    }
    if (!found && hint?.nombre) {
      const ln = String(hint.nombre).toLowerCase()
      found = list.find(s => String(s?.nombre || '').toLowerCase() === ln)
      if (found) console.log('[ChatBotReturns] Sala encontrada por nombre:', found.id)
    }
    if (found) return found
    console.warn('[ChatBotReturns] Sala no encontrada en listado. Intentando fallback por path /salas/{id}')
  } catch (e) {
    console.warn('[ChatBotReturns] Error listando salas, intento fallback:', e?.message)
  }

  // Fallback: intentar endpoint por id/usuario si existiese en backend
  const urlById = `${API_BASE}/salas/${encodeURIComponent(String(usuarioId))}`
  console.log('[ChatBotReturns] GET (fallback)', urlById)
  try {
    const { data } = await axios.get(urlById, { headers: authHeaders(token) })
    return data
  } catch (e) {
    console.error('[ChatBotReturns] No se pudo obtener la sala por ningún método:', e?.message)
    return null
  }
}

// Catálogo por etapa de onboarding
async function fetchCatalogo(etapa, token) {
  console.log('[ChatBotReturns] fetchCatalogo etapa=', etapa)
  const url = `${API_BASE}/catalogo/${encodeURIComponent(String(etapa))}`
  console.log('[ChatBotReturns] GET', url)
  const { data } = await axios.get(url, {
    headers: authHeaders(token),
  })
  return data
}

// Actividades varias
async function fetchActividadesUsuario(usuarioId, token) {
  console.log('[ChatBotReturns] fetchActividadesUsuario usuarioId=', usuarioId)
  const url = `${API_BASE}/Actividad/usuario/${encodeURIComponent(String(usuarioId))}`
  console.log('[ChatBotReturns] GET', url)
  const { data } = await axios.get(url, {
    headers: authHeaders(token),
  })
  return Array.isArray(data) ? data : []
}

async function fetchActividadesPendientes(usuarioId, token) {
  console.log('[ChatBotReturns] fetchActividadesPendientes usuarioId=', usuarioId)
  const url = `${API_BASE}/Actividad/pendientes/${encodeURIComponent(String(usuarioId))}`
  console.log('[ChatBotReturns] GET', url)
  const { data } = await axios.get(url, {
    headers: authHeaders(token),
  })
  return Array.isArray(data) ? data : []
}

async function fetchActividadesResumen(usuarioId, token) {
  console.log('[ChatBotReturns] fetchActividadesResumen usuarioId=', usuarioId)
  const url = `${API_BASE}/Actividad/resumen/${encodeURIComponent(String(usuarioId))}`
  console.log('[ChatBotReturns] GET', url)
  const { data } = await axios.get(url, {
    headers: authHeaders(token),
  })
  return data
}

// Recursos de la empresa
async function fetchRecursos(token) {
  const url = `${API_BASE}/Recurso`
  console.log('[ChatBotReturns] GET', url)
  const { data } = await axios.get(url, { headers: authHeaders(token) })
  return Array.isArray(data) ? data : []
}

// Dato del asesor/admin por id (adminRef)
async function fetchAdmin(adminRef, token) {
  console.log('[ChatBotReturns] fetchAdmin adminRef=', adminRef)
  const url = `${API_BASE}/Usuario/${encodeURIComponent(String(adminRef))}`
  console.log('[ChatBotReturns] GET', url)
  const { data } = await axios.get(url, { headers: authHeaders(token) })
  return data
}

// Formatea respuesta breve para el bot (máx 2–3 líneas, español)
function composeBotSummary({ usuario, rol, sala, catalogo }) {
  const etapa = sala?.nivelOnboarding?.etapa || usuario?.nivelOnboarding?.etapa || 'Inicial'
  const nombreRol = rol?.nombre || usuario?.rol || 'Empleado'
  const docs = Array.isArray(catalogo?.documentos) ? catalogo.documentos.slice(0, 2).join(', ') : 'Revisa documentos iniciales'
  return `Hola ${usuario?.nombre}, eres ${nombreRol}. Estás en etapa ${etapa}; próximos pasos y documentos: ${docs}.`
}

// API principal solicitada: reúne todo en un solo objeto
// Parámetros:
// - opts.usuarioId (opcional, si no, usa localStorage)
// - opts.token (opcional)
// Retorna: { mensajeBot, usuario, rol, permisos, sala, admin, catalogo, actividades, pendientes, resumen, recursos }
export async function ChatBotReturns(opts = {}) {
  const usuarioId = getUsuarioIdSafe(opts.usuarioId)
  const token = opts.token

  if (!usuarioId || usuarioId === '[object Object]') {
    throw new Error('No se encontró un ID de usuario válido (login requerido).')
  }
  console.log('[ChatBotReturns] usuarioId resuelto =', usuarioId)
  if (token) console.log('[ChatBotReturns] token presente (longitud):', String(token).length)

  // 1. Usuario
  const usuario = await fetchUsuario(usuarioId, token)

  // 2. Rol y permisos
  const rol = usuario?.rolRef ? await fetchRol(usuario.rolRef, token) : null
  const permisos = Array.isArray(rol?.permisos) ? rol.permisos : []

  // 3. Sala y adminRef
  const sala = await fetchSala(usuarioId, token, { correo: usuario?.correo, nombre: usuario?.nombre })
  const adminRef = sala?.usuarioRef || null // renombrar semánticamente a adminRef
  let admin = null
  if (adminRef) {
    admin = await fetchAdmin(adminRef, token)
  }

  // 4. Nivel de onboarding y catálogo
  const etapa = sala?.nivelOnboarding?.etapa || usuario?.nivelOnboarding?.etapa || 'Inicial'
  const catalogo = await fetchCatalogo(etapa, token)

  // 5. Actividades
  const actividades = await fetchActividadesUsuario(usuarioId, token)
  const pendientes = await fetchActividadesPendientes(usuarioId, token)
  let resumen = null
  try {
    resumen = await fetchActividadesResumen(usuarioId, token)
  } catch {
    resumen = null
  }

  // 6. Recursos
  const recursos = await fetchRecursos(token)

  // 7. Mensaje breve del bot
  const mensajeBot = composeBotSummary({ usuario, rol, sala, catalogo })
  console.log('[ChatBotReturns] composeBotSummary =', mensajeBot)

  return {
    mensajeBot,
    usuario: {
      id: usuarioId,
      nombre: usuario?.nombre,
      correo: usuario?.correo,
      telefono: usuario?.telefono,
      rolRef: usuario?.rolRef,
      nivelOnboarding: usuario?.nivelOnboarding || null,
      estado: usuario?.estado,
    },
    rol: rol
      ? {
          id: rol.id,
          nombre: rol.nombre,
          descripcion: rol.descripcion,
        }
      : null,
    permisos,
    sala: sala
      ? {
          id: sala.id,
          adminRef, // importante: renombrado semántico del usuarioRef de la sala
          nombre: sala.nombre,
          correo: sala.correo,
          area: sala.area,
          rolRef: sala.rolRef,
          nivelOnboarding: sala.nivelOnboarding,
          estadoOnboardingIA: sala.estadoOnboardingIA,
          contextoPersistente: sala.contextoPersistente,
          ultimoMensaje: sala.ultimoMensaje,
          ultimaActualizacion: sala.ultimaActualizacion,
        }
      : null,
    admin: admin
      ? {
          nombre: admin.nombre,
          correo: admin.correo,
          telefono: admin.telefono,
          rolRef: admin.rolRef,
          nivelOnboarding: admin.nivelOnboarding,
          estado: admin.estado,
        }
      : null,
    catalogo,
    actividades,
    pendientes,
    resumen,
    recursos,
    apiBase: API_BASE,
  }
}

export default ChatBotReturns
