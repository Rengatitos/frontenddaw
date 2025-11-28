import { defineStore } from 'pinia'
import axios from 'axios'

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
        const token = localStorage.getItem('token')

        // Obtener tareas del usuario
        const response = await axios.get('https://backend-daw.onrender.com/api/Tarea', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // Mapear tareas como notificaciones
        const data = Array.isArray(response.data) ? response.data : response.data.data || []
        this.notifications = data.map((tarea) => ({
          id: tarea._id || tarea.id,
          titulo: tarea.nombre || tarea.name || 'Sin título',
          descripcion: tarea.descripcion || tarea.description || 'Tarea pendiente',
          fechaLimite: tarea.fechaLimite || tarea.dueDate || '',
          estado: (tarea.estado || tarea.status) === 'Completada' ? 'completada' : 'pendiente',
          completed: (tarea.estado || tarea.status) === 'Completada' || tarea.completed === true,
          leida: false,
          prioridad: tarea.prioridad || tarea.priority || 'media',
        }))
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
