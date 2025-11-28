<template>
  <div class="bg-grey-2 q-pa-md font-arial" style="min-height: 100vh">
    <div class="text-center q-mb-xl q-mt-md">
      <div class="row justify-center q-mb-sm">
        <q-avatar size="70px" color="indigo-6" text-color="white" class="shadow-3">
          <q-icon name="waving_hand" size="40px" />
        </q-avatar>
      </div>

      <div class="text-h5 text-weight-bold text-grey-9">
        ¡Bienvenido a TCS, {{ nombreUsuario }}!
      </div>

      <div class="text-subtitle1 text-grey-7">Estamos emocionados de tenerte en nuestro equipo</div>
    </div>

    <div class="row q-col-gutter-lg justify-center" style="max-width: 1200px; margin: 0 auto">
      <div class="col-12 col-md-12">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-h6 text-weight-bold text-grey-9">Tu Progreso</div>
          <q-avatar
            color="indigo-6"
            text-color="white"
            size="45px"
            font-size="14px"
            class="text-weight-bold shadow-1"
          >
            {{ Math.round(progressPercentage * 100) }}%
          </q-avatar>
        </div>

        <q-card class="shadow-1" style="border-radius: 12px">
          <q-card-section>
            <div class="q-mb-md">
              <q-linear-progress
                :value="progressPercentage"
                size="12px"
                color="indigo-6"
                track-color="grey-3"
                rounded
                class="q-mb-xs"
              />
              <div class="text-grey-7 text-caption text-weight-medium">
                {{ tasksCompleted }} de {{ totalTasks }} tareas completadas
              </div>
            </div>

            <q-list separator>
              <q-item v-for="task in completedTasks" :key="task.id" class="q-py-md">
                <q-item-section avatar style="min-width: 40px">
                  <!-- Checkbox que permite desmarcar/completar y dispara la actualización en backend -->
                  <q-checkbox
                    :model-value="task.completed"
                    @update:model-value="(val) => onToggleProgress(task, val)"
                    dense
                    size="24px"
                    color="indigo-6"
                  />
                </q-item-section>

                <q-item-section>
                  <q-item-label
                    :class="
                      task.completed
                        ? 'text-indigo-8 text-weight-medium line-through'
                        : 'text-grey-9'
                    "
                  >
                    {{ task.name }}
                  </q-item-label>

                  <q-item-label
                    caption
                    v-if="task.status === 'Vencida' && !task.completed"
                    class="text-red-5 row items-center q-gutter-x-xs q-mt-xs"
                  >
                    <q-icon name="event_busy" size="14px" />
                    <span class="text-weight-medium">Vencida</span>
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-icon name="chevron_right" color="grey-5" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="q-mt-xl q-mb-lg" style="max-width: 1200px; margin: 0 auto">
      <div
        class="bg-indigo-1 q-pa-lg row items-center shadow-1"
        style="border-radius: 16px; border: 1px solid #c7caff"
      >
        <div class="col-12 col-md-auto q-mr-md flex flex-center q-mb-md q-mb-md-none">
          <div class="bg-white q-pa-md shadow-2" style="border-radius: 12px">
            <q-icon name="smart_toy" color="indigo-8" size="40px" />
          </div>
        </div>

        <div class="col-12 col-md">
          <div class="text-h6 text-weight-bold text-indigo-9">¿Tienes preguntas?</div>
          <div class="text-body2 text-grey-8 q-mt-xs" style="max-width: 600px">
            Nuestro asistente virtual está disponible 24/7 para ayudarte con cualquier duda sobre tu
            proceso de incorporación, políticas de la empresa y beneficios.
          </div>
        </div>

        <div class="col-12 col-md-auto q-mt-md q-mt-md-none q-gutter-md">
          <q-btn
            unelevated
            color="grey-3"
            text-color="grey-8"
            label="Volver"
            icon="arrow_back"
            class="q-px-lg q-py-md text-weight-bold"
            no-caps
            style="border-radius: 8px"
            to="/dashboard"
          />
          <q-btn
            unelevated
            color="indigo-6"
            text-color="white"
            label="Hablar con el Asistente"
            icon-right="arrow_forward"
            class="q-px-lg q-py-md text-weight-bold"
            no-caps
            style="border-radius: 8px"
            to="/onboarding-ia"
          />
        </div>
      </div>
    </div>

    <footer class="text-center text-grey-5 q-py-lg text-caption">
      Si necesitas ayuda inmediata, contacta a tu supervisor o al equipo de Recursos Humanos
    </footer>
  </div>
</template>

<script>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { Notify } from 'quasar'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from 'src/stores/notifications'
import { api } from 'src/boot/axios'
import { isValidObjectId } from 'src/composables/useUsuario'

export default {
  name: 'ProgressPage',
  setup() {
    const notificationsStore = useNotificationsStore()
    const nombreUsuario = ref('Colaborador')
    const tasks = ref([]) // todas las actividades del usuario (desde /Actividad/usuario/{usuarioRef})

    // Computeds para mantener aislada la vista de "Tu Progreso"
    const totalTasks = computed(() => tasks.value.length)
    const completedTasks = computed(() =>
      tasks.value.filter((t) => (t.estado || t.status) === 'Completada' || t.completed === true),
    )
    const tasksCompleted = computed(() => completedTasks.value.length)
    const progressPercentage = computed(() =>
      totalTasks.value > 0 ? tasksCompleted.value / totalTasks.value : 0,
    )

    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token')
        // Preferir objeto `usuario` si existe
        try {
          const rawUsuario = localStorage.getItem('usuario')
          if (rawUsuario) {
            const usuarioObj = JSON.parse(rawUsuario)
            if (usuarioObj && (usuarioObj.nombre || usuarioObj.name)) {
              nombreUsuario.value = usuarioObj.nombre || usuarioObj.name
            }
          } else {
            const userStorage = localStorage.getItem('user')
            if (userStorage) {
              const user = JSON.parse(userStorage)
              if (user && user.nombre) nombreUsuario.value = user.nombre
            }
          }
        } catch {
          // ignore parse errors
        }

        if (token) {
          try {
            // Preferir id real desde localStorage.usuario
            const rawUsuario = localStorage.getItem('usuario')
            if (!rawUsuario) {
              Notify.create({
                type: 'negative',
                message: 'Sesión inválida. Inicie sesión nuevamente.',
              })
              const router = useRouter()
              router.push('/login')
              return
            }

            const parsedUsuario = JSON.parse(rawUsuario)
            const usuarioRef = parsedUsuario && (parsedUsuario.id || parsedUsuario._id)
            if (!usuarioRef || !isValidObjectId(usuarioRef)) {
              Notify.create({ type: 'negative', message: 'ID inválido. Inicie sesión nuevamente.' })
              const router = useRouter()
              router.push('/login')
              return
            }

            // Obtener todas las actividades del usuario y delegar el filtrado a la UI de progreso
            const tasksRes = await api.get(`Actividad/usuario/${usuarioRef}`)
            const taskList = Array.isArray(tasksRes.data)
              ? tasksRes.data
              : Array.isArray(tasksRes.data?.value)
                ? tasksRes.data.value
                : Array.isArray(tasksRes.data?.data)
                  ? tasksRes.data.data
                  : []

            // Guardar las actividades tal cual (manteniendo campo estado)
            tasks.value = taskList.map((t) => {
              const raw = t.estado || t.status || ''
              const s = String(raw || '').trim()
              const estado = s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : null
              return {
                id: t._id || t.id,
                name: t.titulo || t.nombre || t.name || 'Sin título',
                estado,
                status: estado,
                completed: estado === 'Completada' || t.completed === true,
                fecha_fin: t.fecha_fin || null,
              }
            })
          } catch (err) {
            console.warn('No se pudieron cargar las tareas:', err)
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }

    // Escuchar evento global enviado cuando se completa una actividad en otra vista
    function onActividadCompletada() {
      loadUserData()
    }

    // Handler para togglear completion desde esta pantalla
    async function onToggleProgress(task, shouldBeCompleted) {
      try {
        // Obtener id real desde localStorage.usuario
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
          const router = useRouter()
          router.push('/login')
          return
        }

        if (shouldBeCompleted) {
          // Marcar como completada (endpoint existente)
          await api.patch(`Actividad/${task.id}/completar/${usuarioRef}`)
          Notify.create({ type: 'positive', message: 'Actividad marcada como completada.' })
          // Notificar a otras vistas
          window.dispatchEvent(new CustomEvent('actividad-completada', { detail: { id: task.id } }))
        } else {
          // Intentar marcar como pendiente: primero PATCH genérico, si falla intentar endpoint 'descompletar'
          try {
            await api.patch(`Actividad/${task.id}`, { estado: 'Pendiente', usuarioRef })
          } catch (err) {
            if (err.response?.status === 404) {
              // Intentar endpoint alternativo
              await api.patch(`Actividad/${task.id}/descompletar/${usuarioRef}`)
            } else {
              throw err
            }
          }

          Notify.create({ type: 'positive', message: 'Actividad marcada como pendiente.' })
          // Notificar a otras vistas que una actividad cambió (para que Próximos Pasos la reciba)
          window.dispatchEvent(
            new CustomEvent('actividad-actualizada', { detail: { id: task.id } }),
          )
        }

        // Refrescar datos locales para recalcular la barra
        await loadUserData()
      } catch (err) {
        console.error('Error actualizando actividad desde Progreso:', err)
        Notify.create({
          type: 'negative',
          message: 'No se pudo actualizar la actividad. Intente nuevamente.',
        })
      }
    }

    onMounted(() => {
      loadUserData()
      notificationsStore.fetchNotifications()
      window.addEventListener('actividad-completada', onActividadCompletada)
    })

    onUnmounted(() => {
      window.removeEventListener('actividad-completada', onActividadCompletada)
    })

    return {
      nombreUsuario,
      tasks,
      progressPercentage,
      tasksCompleted,
      totalTasks,
      completedTasks,
      onToggleProgress,
    }
  },
}
</script>

<style scoped>
.font-arial {
  font-family: 'Arial', sans-serif;
}

.line-through {
  text-decoration: line-through;
  opacity: 0.6;
}
</style>
