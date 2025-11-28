import userService from './userService'
import actividadesService from './actividadesService'
import recursosService from './recursosService'
import catalogoService from './catalogoOnboardingService'
import chatService from './chatService'

/**
 * Context Builder
 * Builds a textual "super-context" for Ollama by aggregating multiple endpoints.
 */
const build = async (usuarioRef) => {
  // Fetch everything in parallel, but continue if some fail
  const results = await Promise.allSettled([
    userService.getUser(usuarioRef),
    actividadesService.getActividadesByUsuario(usuarioRef),
    recursosService.getRecursos(),
    catalogoService.getCatalogo(),
    chatService.getSala ? chatService.getSala(usuarioRef) : Promise.resolve(null),
    chatService.getHistorialReducido ? chatService.getHistorialReducido(usuarioRef) : Promise.resolve({ data: [] }),
  ])

  const [userRes, actividadesRes, recursosRes, catalogoRes, salaRes, historialRes] = results

  const user = userRes.status === 'fulfilled' ? userRes.value : null
  const actividades = actividadesRes.status === 'fulfilled' ? actividadesRes.value : []
  const recursos = recursosRes.status === 'fulfilled' ? recursosRes.value : []
  const catalogo = catalogoRes.status === 'fulfilled' ? catalogoRes.value : null
  const sala = salaRes.status === 'fulfilled' ? salaRes.value : null
  const historial = historialRes.status === 'fulfilled' ? historialRes.value : { data: [] }

  // normalize shapes
  const u = (user && (user.data || user)) || {}
  const rol = (u.rol || u.role || (u.role_ref ? { _id: u.role_ref } : null))

  // detect role name if available
  let rolNombre = ''
  if (rol) {
    rolNombre = rol.nombre || rol.name || ''
  }

  const isEmpleadoOnboarding = typeof rolNombre === 'string' && /onboard|onboarding|emplead/i.test(rolNombre)

  const lines = []
  lines.push('=== USUARIO ===')
  lines.push(`Nombre: ${u.nombre || u.name || 'N/A'}`)
  lines.push(`Correo: ${u.correo || u.email || 'N/A'}`)
  lines.push(`Rol: ${rolNombre || 'N/A'}`)
  lines.push(`Área: ${u.area || 'N/A'}`)
  lines.push(`Teléfono: ${u.telefono || u.phone || 'N/A'}`)
  lines.push('')

  lines.push('=== SUPERVISOR ===')
  const sup = u.supervisor || (sala && (sala.supervisor || sala.supervisor)) || null
  lines.push(sup ? (sup.nombre || sup.name || 'No asignado') : 'No asignado')
  lines.push('')

  lines.push('=== NIVEL DE ONBOARDING ===')
  const nivel = u.nivel_onboarding || u.nivelOnboarding || (sala && sala.nivelOnboarding) || {}
  lines.push(`Etapa: ${nivel.etapa || nivel.stage || 'N/A'}`)
  lines.push(`Porcentaje: ${(nivel.porcentaje != null) ? nivel.porcentaje : 'N/A'}`)
  lines.push('')

  lines.push('=== DOCUMENTOS REQUERIDOS ===')
  const docs = (catalogo && (catalogo.documentos || catalogo.data?.documentos || catalogo.items)) || (sala && sala.documentosRequeridos) || []
  if (Array.isArray(docs) && docs.length) {
    docs.forEach(d => lines.push(`- ${typeof d === 'string' ? d : (d.nombre || d.name || JSON.stringify(d))}`))
  } else {
    lines.push('No hay documentos listados')
  }
  lines.push('')

  lines.push('=== ACTIVIDADES ASIGNADAS ===')
  const acts = (actividades && (actividades.data || actividades)) || []
  if (Array.isArray(acts) && acts.length) {
    acts.forEach(a => lines.push(`- ${a.titulo || a.title || a.name || 'Actividad'} (${a.estado || a.status || 'N/A'})`))
  } else {
    lines.push('No hay actividades asignadas')
  }
  lines.push('')

  lines.push('=== RECURSOS DISPONIBLES ===')
  const recs = (recursos && (recursos.data || recursos)) || []
  if (Array.isArray(recs) && recs.length) {
    recs.forEach(r => lines.push(`- ${r.titulo || r.title || r.nombre || 'Recurso'}: ${r.descripcion || r.description || r.tipo || r.type || ''}`))
  } else {
    lines.push('No hay recursos disponibles')
  }
  lines.push('')

  lines.push('=== HISTORIAL RECIENTE ===')
  const histItems = (historial && (historial.data || historial)) || []
  if (Array.isArray(histItems) && histItems.length) {
    histItems.slice(-10).forEach(h => lines.push(`- ${h.user || h.origen || h.usuario || 'usuario'}: ${h.texto || h.text || h.mensaje || ''}`))
  } else {
    lines.push('No hay historial reciente')
  }
  lines.push('')

  lines.push('=== CONTEXTO PERSISTENTE (de la sala) ===')
  const contextoPersistente = (sala && (sala.contextoPersistente || sala.data?.contextoPersistente)) || u.contextoPersistente || 'N/A'
  lines.push(contextoPersistente)

  // Add a note about role detection
  lines.push('')
  lines.push(`EmpleadoOnboardingDetected: ${isEmpleadoOnboarding ? 'yes' : 'no'}`)

  return lines.join('\n')
}

const buildDetailed = async (usuarioRef) => {
  const results = await Promise.allSettled([
    userService.getUser(usuarioRef),
    actividadesService.getActividadesByUsuario(usuarioRef),
    recursosService.getRecursos(),
    catalogoService.getCatalogo(),
    chatService.getSala ? chatService.getSala(usuarioRef) : Promise.resolve(null),
    chatService.getHistorialReducido ? chatService.getHistorialReducido(usuarioRef) : Promise.resolve({ data: [] }),
  ])

  const [userRes, actividadesRes, recursosRes, catalogoRes, salaRes, historialRes] = results

  // Prepare a structured object with raw and normalized data
  const detailed = {
    raw: {
      user: userRes,
      actividades: actividadesRes,
      recursos: recursosRes,
      catalogo: catalogoRes,
      sala: salaRes,
      historial: historialRes,
    },
    normalized: {
      user: userRes.status === 'fulfilled' ? (userRes.value?.data || userRes.value) : null,
      actividades: actividadesRes.status === 'fulfilled' ? (actividadesRes.value?.data || actividadesRes.value) : [],
      recursos: recursosRes.status === 'fulfilled' ? (recursosRes.value?.data || recursosRes.value) : [],
      catalogo: catalogoRes.status === 'fulfilled' ? (catalogoRes.value?.data || catalogoRes.value) : null,
      sala: salaRes.status === 'fulfilled' ? (salaRes.value?.data || salaRes.value) : null,
      historial: historialRes.status === 'fulfilled' ? (historialRes.value?.data || historialRes.value) : [],
    },
  }

  // Log to console for debugging
  console.groupCollapsed(`[ContextBuilder] Debug for usuarioRef=${usuarioRef}`)
  console.log('raw results:', detailed.raw)
  console.log('normalized:', detailed.normalized)
  console.groupEnd()

  return detailed
}

export default { build, buildDetailed }
/*

Este archivo será el cerebro que construye el "super-contexto" que Ollama necesita.

Este servicio:

Usa los endpoints existentes:

salas

actividades

catalogo_onboarding

recursos

usuarios

roles

InteraccionChat (si necesitas historial reducido)

Fusiona todo para producir un contexto completo.


*/