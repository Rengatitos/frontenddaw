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
              <q-item v-for="task in tasks" :key="task.id" class="q-py-md">
                <q-item-section avatar style="min-width: 40px">
                  <q-icon
                    :name="task.completed ? 'check_circle' : 'radio_button_unchecked'"
                    :color="task.completed ? 'indigo-6' : 'grey-4'"
                    size="26px"
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
import { ref, onMounted } from 'vue'
import { useNotificationsStore } from 'src/stores/notifications'
import axios from 'axios'

export default {
  name: 'ProgressPage',
  setup() {
    const notificationsStore = useNotificationsStore()
    const nombreUsuario = ref('Colaborador')
    const progressPercentage = ref(0.33)
    const tasksCompleted = ref(0)
    const totalTasks = ref(6)

    const tasks = ref([
      { id: 1, name: 'Completar perfil personal', status: 'Vencida', completed: true },
      { id: 2, name: 'Revisar manual del empleado', status: 'Vencida', completed: true },
      { id: 3, name: 'Configurar accesos de sistema', status: 'Vencida', completed: false },
      { id: 4, name: 'Firmar documentos digitales', status: 'Vencida', completed: false },
      { id: 5, name: 'Completar capacitación inicial', status: 'Vencida', completed: false },
      { id: 6, name: 'Conocer al equipo', status: 'Vencida', completed: false },
    ])

    const loadUserData = async () => {
      try {
        const userStorage = localStorage.getItem('user')
        const token = localStorage.getItem('token')

        if (userStorage) {
          const user = JSON.parse(userStorage)
          if (user.nombre) {
            nombreUsuario.value = user.nombre
          }
        }

        if (token) {
          try {
            const tasksRes = await axios.get('https://backend-daw.onrender.com/api/Tarea', {
              headers: { Authorization: `Bearer ${token}` },
            })
            if (tasksRes.data) {
              const taskList = Array.isArray(tasksRes.data)
                ? tasksRes.data
                : tasksRes.data.data || []
              tasks.value = taskList.map((t) => ({
                id: t._id || t.id,
                name: t.nombre || t.name,
                status: t.estado || t.status || 'Pendiente',
                completed: (t.estado || t.status) === 'Completada' || t.completed === true,
              }))
              tasksCompleted.value = tasks.value.filter((t) => t.completed).length
              totalTasks.value = tasks.value.length
              progressPercentage.value =
                totalTasks.value > 0 ? tasksCompleted.value / totalTasks.value : 0
            }
          } catch (err) {
            console.warn('No se pudieron cargar las tareas:', err)
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }

    onMounted(() => {
      loadUserData()
      notificationsStore.fetchNotifications()
    })

    return {
      nombreUsuario,
      tasks,
      progressPercentage,
      tasksCompleted,
      totalTasks,
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
