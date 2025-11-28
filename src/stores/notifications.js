import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { isValidObjectId } from 'src/composables/useUsuario'
import { Notify } from 'quasar'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    abierta: false,
    loading: false,
  }),

  getters: {
    pendientes: (state) => state.notifications.filter((n) => !n.completed),
    completadas: (state) => state.notifications.filter((n) => n.completed),
    totalPendientes: (state) => state.notifications.filter((n) => !n.completed).length,
  },

  actions: {
    async fetchNotifications() {
      this.loading = true
      try {
        // const auth = useAuthStore()  // not required for id extraction; usamos obtenerIdUsuarioSeguro

        // Obtener id del usuario desde localStorage.usuario (fuente de verdad)
        let usuarioRef = null
        try {
          const raw = localStorage.getItem('usuario')
          if (raw) {
            const parsed = JSON.parse(raw)
            usuarioRef = parsed && (parsed.id || parsed._id || null)
          }
        } catch {
          usuarioRef = null
        }
        if (!usuarioRef || !isValidObjectId(usuarioRef)) {
          Notify.create({ type: 'negative', message: 'ID inválido. Inicie sesión nuevamente.' })
          window.location.href = '/login'
          this.notifications = []
          return
        }

        // Obtener actividades del usuario usando el endpoint correcto `actividad`
        const resp = await api.get(`Actividad/usuario/${usuarioRef}`)
        const data = Array.isArray(resp.data)
          ? resp.data
          : Array.isArray(resp.data?.value)
            ? resp.data.value
            : Array.isArray(resp.data?.data)
              ? resp.data.data
              : []

        this.notifications = data.map((tarea) => {
          const raw = tarea.estado || tarea.status || ''
          const s = String(raw || '').trim()
          const estadoNorm = s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''
          const estadoLower = estadoNorm.toLowerCase()
          return {
            id: tarea._id || tarea.id,
            titulo: tarea.titulo || tarea.nombre || tarea.name || 'Sin título',
            descripcion: tarea.descripcion || tarea.description || 'Tarea pendiente',
            fechaLimite: tarea.fecha_fin || tarea.fechaLimite || tarea.dueDate || '',
            estado:
              estadoLower === 'completada'
                ? 'completada'
                : tarea.fecha_fin && new Date(tarea.fecha_fin) < new Date()
                  ? 'vencida'
                  : 'pendiente',
            completed: estadoLower === 'completada' || tarea.completed === true,
            leida: false,
            prioridad: tarea.prioridad || tarea.priority || 'media',
          }
        })
      } catch (error) {
        console.error('Error fetching tasks as notifications:', error)
        // Usar tareas vacías si hay error
        this.notifications = []
      } finally {
        this.loading = false
      }
    },

    abrirPanel() {
      this.abierta = true
    },
    togglePanel() {
      this.abierta = !this.abierta
    },
    cerrarPanel() {
      this.abierta = false
    },
    marcarComoLeida(id) {
      const n = this.notifications.find((n) => n.id === id)
      if (n) n.leida = true
    },
    marcarComoCompletada(id) {
      const n = this.notifications.find((n) => n.id === id)
      if (n) {
        n.completed = true
        n.estado = 'completada'
      }
    },
  },
})
