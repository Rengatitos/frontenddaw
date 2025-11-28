// src/services/historialChatCacheService.js

const CACHE_PREFIX = 'chat_historial_cache_'

function getKey (usuarioRef) {
  return `${CACHE_PREFIX}${usuarioRef}`
}

// Obtener historial completo del usuario desde cache
function getHistorial (usuarioRef) {
  try {
    const key = getKey(usuarioRef)
    const data = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(data) ? data : []
  } catch (err) {
    console.error('[HistorialCache] Error al leer historial:', err)
    return []
  }
}

// Sobrescribir historial completo
function setHistorial (usuarioRef, interacciones) {
  try {
    const key = getKey(usuarioRef)
    localStorage.setItem(key, JSON.stringify(interacciones))
    return true
  } catch (err) {
    console.error('[HistorialCache] Error al guardar historial:', err)
    return false
  }
}

// Agregar nuevas interacciones al final y devolver la lista actualizada
function addToHistorial (usuarioRef, nuevasInteracciones) {
  const historialActual = getHistorial(usuarioRef)
  const actualizado = [...historialActual, ...nuevasInteracciones]
  setHistorial(usuarioRef, actualizado)
  return actualizado
}

// Limpiar historial de un usuario
function clearHistorial (usuarioRef) {
  try {
    const key = getKey(usuarioRef)
    localStorage.removeItem(key)
    return true
  } catch (err) {
    console.error('[HistorialCache] Error al limpiar historial:', err)
    return false
  }
}

export default {
  getHistorial,
  setHistorial,
  addToHistorial,
  clearHistorial
}
