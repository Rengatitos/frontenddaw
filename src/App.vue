<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useNotificationsStore } from 'src/stores/notifications'
import { isValidObjectId, normalizeIdFromObject } from 'src/composables/useUsuario'

const notificationsStore = useNotificationsStore()

onMounted(() => {
  // Cargar notificaciones al iniciar la app
  notificationsStore.fetchNotifications()
  // Limpieza segura: si existe `usuario` en localStorage, asegurar que `idUsuario` coincide.
  try {
    const raw = localStorage.getItem('usuario')
    if (raw) {
      const usuario = JSON.parse(raw)
      const storedId = localStorage.getItem('idUsuario')
      const candidate = usuario && (usuario.id || usuario._id || usuario.usuarioId || null)
      const norm = normalizeIdFromObject(candidate)
      if (norm && isValidObjectId(norm)) {
        // Si hay idUsuario y difiere, sincronizar y eliminar legacy claves conflictivas
        if (storedId && storedId !== String(norm)) {
          // replace legacy id with the correct one
          localStorage.setItem('idUsuario', String(norm))
          // remove other old keys that might cause confusion
          localStorage.removeItem('usuarioRef')
        } else if (!storedId) {
          localStorage.setItem('idUsuario', String(norm))
        }
      }
    }
  } catch {
    /* noop */
  }
})
</script>
