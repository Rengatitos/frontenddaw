import { ref, computed } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

/**
 * Composable para manejar actividades del usuario
 */
export function useActividades() {
  const $q = useQuasar()

  const completadas = ref([])
  const pendientes = ref([])
  const totalActividades = ref(0)
  const loading = ref(false)
  const error = ref(null)

  // 🚫 Previene loops o llamadas simultáneas
  let bloqueado = false

  /**
   * Obtener todas las actividades
   */
  async function obtenerActividadesUsuario(usuarioRef) {
    if (!usuarioRef || bloqueado) return []
    bloqueado = true
    loading.value = true
    error.value = null

    try {
      const res = await api.get(`Actividad/usuario/${usuarioRef}`)
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.value)
          ? res.data.value
          : Array.isArray(res.data?.data)
            ? res.data.data
            : []

      totalActividades.value = data.length
      completadas.value = data.filter((a) => {
        const estado = (a.estado || a.status || '').toLowerCase()
        return estado === 'completada' || a.completed === true
      })

      return data
    } catch (err) {
      error.value = `Error al cargar actividades: ${err.message}`
      console.error(err)
      $q.notify({ type: 'negative', message: 'No se pudieron cargar las actividades' })
      return []
    } finally {
      loading.value = false
      bloqueado = false
    }
  }

  /**
   * Obtener tareas pendientes
   */
  async function obtenerPendientes(usuarioRef) {
    if (!usuarioRef) return []
    loading.value = true
    error.value = null

    try {
      const res = await api.get(`Actividad/pendientes/${usuarioRef}`)
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.value)
          ? res.data.value
          : Array.isArray(res.data?.data)
            ? res.data.data
            : []

      pendientes.value = data
      return data
    } catch (err) {
      error.value = `Error al cargar actividades pendientes: ${err.message}`
      console.error(err)
      $q.notify({ type: 'negative', message: 'No se pudieron cargar las actividades pendientes' })
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Alias
   */
  async function cargarPendientes(usuarioRef) {
    return await obtenerPendientes(usuarioRef)
  }

  /**
   * Actualizar estado actividad
   */
  async function marcarEstado(actividadId, usuarioRef, estado) {
    if (!actividadId || !usuarioRef) return false

    loading.value = true
    try {
      const est = String(estado || '').toLowerCase()

      if (est === 'completada') {
        await api.patch(`Actividad/${actividadId}/completar/${usuarioRef}`)
      } else if (est === 'pendiente') {
        try {
          await api.patch(`Actividad/${actividadId}`, { estado: 'Pendiente', usuarioRef })
        } catch (err) {
          if (err.response?.status === 404) {
            await api.patch(`Actividad/${actividadId}/descompletar/${usuarioRef}`)
          } else {
            throw err
          }
        }
      } else {
        await api.patch(`Actividad/${actividadId}`, { estado, usuarioRef })
      }

      // 🔥 Refrescar solo localmente, sin disparar eventos globales
      await Promise.all([obtenerActividadesUsuario(usuarioRef), obtenerPendientes(usuarioRef)])

      return true
    } catch (err) {
      console.error(err)
      $q.notify({
        type: 'negative',
        message: 'No se pudo actualizar la actividad',
      })
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Computed para porcentaje
   */
  const porcentajeProgreso = computed(() => {
    return totalActividades.value === 0
      ? 0
      : Math.round((completadas.value.length / totalActividades.value) * 100)
  })

  return {
    completadas,
    pendientes,
    totalActividades,
    loading,
    error,

    obtenerActividadesUsuario,
    obtenerPendientes,
    cargarPendientes,
    marcarEstado,
    cargarTodas: obtenerActividadesUsuario,

    porcentajeProgreso,
  }
}
