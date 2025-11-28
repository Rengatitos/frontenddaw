// Helpers para manejar y validar _id de usuarios (MongoDB ObjectId - 24 hex chars)
export function isValidObjectId(id) {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)
}

// Alias con nombre solicitado por el cliente
export function esObjectIdValido(id) {
  return isValidObjectId(id)
}

export function extractIdFromString(s) {
  if (!s || typeof s !== 'string') return null
  // Buscar la primera coincidencia de 24 hex chars
  const m = s.match(/([a-fA-F0-9]{24})/)
  return m ? m[1] : null
}

export function normalizeIdFromObject(obj) {
  if (!obj) return null
  // Si ya es string, intentar extraer id
  if (typeof obj === 'string') return extractIdFromString(obj) || obj

  // Si tiene $oid (mongodb json), usarlo
  if (obj.$oid && typeof obj.$oid === 'string') return obj.$oid

  // Si tiene toHexString (drivers), llamarla
  if (typeof obj.toHexString === 'function') {
    try {
      const hex = obj.toHexString()
      if (typeof hex === 'string' && /^[a-fA-F0-9]{24}$/.test(hex)) return hex
    } catch {
      // ignore
    }
  }

  // Intenta toString() y extraer
  if (typeof obj.toString === 'function') {
    const s = obj.toString()
    const extracted = extractIdFromString(s)
    if (extracted) return extracted
  }

  // Como última opción, stringify y buscar pattern
  try {
    const json = JSON.stringify(obj)
    return extractIdFromString(json)
  } catch {
    return null
  }
}

/**
 * Intentar obtener un id de usuario válido (24 hex) desde localStorage o un objeto JSON
 * Retorna string 24-char o null
 */
export function obtenerIdUsuarioSeguro() {
  try {
    // 0) Prefer explicit stored `usuario` object if present (ensures we don't pick role ids)
    const rawUsuario = localStorage.getItem('usuario')
    if (rawUsuario) {
      try {
        const parsed = JSON.parse(rawUsuario)
        const candidates = [parsed.id, parsed._id, parsed.usuarioId, parsed.userId]
        for (const c of candidates) {
          const norm = normalizeIdFromObject(c)
          if (norm && isValidObjectId(norm)) return norm
        }
      } catch {
        // ignore parse errors and continue to legacy checks
      }
    }

    // 1) Revisar clave directa 'idUsuario'
    const raw = localStorage.getItem('idUsuario')
    if (raw) {
      const candidate = String(raw).trim()
      if (isValidObjectId(candidate)) return candidate
      // si contiene basura, extraer
      const extracted = extractIdFromString(candidate)
      if (extracted && isValidObjectId(extracted)) return extracted
    }

    // 2) Probar claves comunes que pueden contener el usuario serializado
    const possibleKeys = ['user', 'usuario', 'auth_user', 'auth']
    for (const key of possibleKeys) {
      const v = localStorage.getItem(key)
      if (!v) continue
      // si es string JSON
      try {
        const parsed = JSON.parse(v)
        // propiedades comunes
        const candidates = [parsed._id, parsed.id, parsed.usuarioId, parsed.userId]
        for (const c of candidates) {
          const norm = normalizeIdFromObject(c)
          if (norm && isValidObjectId(norm)) return norm
        }
        // si no, intentar extraer del stringify
        const extracted = extractIdFromString(JSON.stringify(parsed))
        if (extracted && isValidObjectId(extracted)) return extracted
      } catch {
        // si no es JSON, intentar extraer directamente
        const extracted = extractIdFromString(v)
        if (extracted && isValidObjectId(extracted)) return extracted
      }
    }

    // 3) Como fallback, inspeccionar todas entradas de localStorage y buscar pattern
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k) continue
      const val = localStorage.getItem(k)
      if (!val) continue
      const extracted = extractIdFromString(val)
      if (extracted && isValidObjectId(extracted)) return extracted
    }
  } catch {
    // cualquier error, no romper la app
    /* noop */
  }

  return null
}

export default {
  isValidObjectId,
  esObjectIdValido,
  extractIdFromString,
  normalizeIdFromObject,
  obtenerIdUsuarioSeguro,
}
