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

    <!-- Floating Chatbot Icon -->
    <div class="floating-chatbot-container" @click="openChatbot" @mouseenter="showChatBubble = true" @mouseleave="showChatBubble = false">
      <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
        <div v-if="showChatBubble" class="chat-bubble">
          Soy tu asistente onboarding, ¡conversa conmigo si tienes dudas!
        </div>
      </transition>
      <div class="chatbot-icon">
        <img
          src="https://i.pinimg.com/736x/7e/4e/eb/7e4eebfd3f66d18b69139a332974d43b.jpg"
          alt="Chatbot"
          class="chatbot-image"
        />
      </div>
    </div>

    <div class="row q-col-gutter-lg justify-center" style="max-width: 1200px; margin: 0 auto">
      <div class="col-12 col-md-7">
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
                    :class="task.completed ? 'text-indigo-8 text-weight-medium' : 'text-grey-9'"
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

      <div class="col-12 col-md-5">
        <div class="text-h6 text-weight-bold text-grey-9 q-mb-sm">Tu Supervisor</div>

        <q-card class="shadow-1 text-center q-pa-lg bg-white" style="border-radius: 12px">
          <div class="column items-center">
            <q-avatar
              size="90px"
              color="indigo-5"
              text-color="white"
              class="text-h4 shadow-2 q-mb-md"
            >
              {{
                supervisorInfo.nombre
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
              }}
            </q-avatar>

            <div class="text-h6 text-weight-bold text-grey-9">{{ supervisorInfo.nombre }}</div>
            <div class="text-subtitle2 text-grey-6 q-mb-lg">{{ supervisorInfo.cargo }}</div>

            <q-card flat bordered class="full-width bg-grey-1 q-pa-sm">
              <q-list dense>
                <q-item class="q-px-none justify-center">
                  <q-icon name="email" color="indigo-5" class="q-mr-sm" size="20px" />
                  <span class="text-grey-8">{{ supervisorInfo.email }}</span>
                </q-item>
                <q-item class="q-px-none justify-center">
                  <q-icon name="phone" color="indigo-5" class="q-mr-sm" size="20px" />
                  <span class="text-grey-8">{{ supervisorInfo.telefono }}</span>
                </q-item>
              </q-list>
            </q-card>
          </div>
        </q-card>
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
import { api } from 'src/boot/axios'

// Fallback admin role id used to fetch admin users when supervisor endpoint is not available
const ROLE_ID_ADMIN_FALLBACK = '6913adbcca79acfd93858d5c'

export default {
  name: 'DashboardPage',
  setup() {
    const notificationsStore = useNotificationsStore()
    const nombreUsuario = ref('Colaborador')
    const supervisorInfo = ref({
      nombre: 'Jefferson Garay',
      cargo: 'Supervisor de Área',
      email: 'jeff@tcs.com',
      telefono: '+51 912 345 678',
    })
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

        // Cargar supervisor si existe
        if (token) {
          try {
            // Try original supervisor endpoint
            const supervisorRes = await api.get('Usuario/supervisor')
            if (supervisorRes.data) {
              supervisorInfo.value = {
                nombre: supervisorRes.data.nombre || supervisorInfo.value.nombre,
                cargo: supervisorRes.data.cargo || supervisorInfo.value.cargo,
                email: supervisorRes.data.correo || supervisorInfo.value.email,
                telefono: supervisorRes.data.telefono || supervisorInfo.value.telefono,
              }
            }
          } catch {
            // If supervisor endpoint doesn't exist, fallback to: if user has supervisorId fetch by id,
            // otherwise fetch admins list via role endpoint and pick the first admin as supervisor
            try {
              const userStorage = localStorage.getItem('user')
              let currentUser = null
              if (userStorage) currentUser = JSON.parse(userStorage)

              if (currentUser && (currentUser.supervisorId || currentUser.supervisor)) {
                const supId = currentUser.supervisorId || currentUser.supervisor
                const supRes = await api.get(`Usuario/${supId}`)
                if (supRes.data) {
                  supervisorInfo.value = {
                    nombre: supRes.data.nombre || supervisorInfo.value.nombre,
                    cargo: supRes.data.cargo || supervisorInfo.value.cargo,
                    email: supRes.data.correo || supervisorInfo.value.email,
                    telefono: supRes.data.telefono || supervisorInfo.value.telefono,
                  }
                }
              } else {
                // fetch admins list by role id
                const adminsRes = await api.get(`Usuario/rol/${ROLE_ID_ADMIN_FALLBACK}`)
                const admins = Array.isArray(adminsRes.data) ? adminsRes.data : adminsRes.data?.data || []
                if (admins.length > 0) {
                  const a = admins[0]
                  supervisorInfo.value = {
                    nombre: a.nombre || supervisorInfo.value.nombre,
                    cargo: a.cargo || supervisorInfo.value.cargo,
                    email: a.correo || supervisorInfo.value.email,
                    telefono: a.telefono || supervisorInfo.value.telefono,
                  }
                }
              }
            } catch (innerErr) {
              console.warn('No se pudo cargar el supervisor (fallback):', innerErr)
            }
          }

          // Cargar tareas del usuario
          try {
            const tasksRes = await api.get('Actividad')
            if (tasksRes.data) {
              const taskList = Array.isArray(tasksRes.data)
                ? tasksRes.data
                : tasksRes.data.data || []
              tasks.value = taskList.map((t) => ({
                id: t.id || t._id || t.id,
                name: t.titulo || t.nombre || t.name,
                status: t.estado || t.status || 'Pendiente',
                completed: typeof t.estado === 'string' && t.estado.toLowerCase().includes('complet'),
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
      // Cargar notificaciones
      notificationsStore.fetchNotifications()
    })

    return {
      nombreUsuario,
      supervisorInfo,
      tasks,
      progressPercentage,
      tasksCompleted,
      totalTasks,
      showChatBubble: ref(false),
      openChatbot() {
        const base = window.location.origin
        const isHash = (import.meta.env.VUE_ROUTER_MODE || '').toLowerCase() !== 'history'
        const path = isHash ? '/#/onboarding-chat?allow=1' : '/onboarding-chat?allow=1'
        const url = `${base}${path}`
        window.open(url, '_blank')
      },
    }
  },
}
</script>

<style scoped>
.font-arial {
  font-family: 'Arial', sans-serif;
}

/* Floating Chatbot Styles */
.floating-chatbot-container {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
  cursor: pointer;
}

.chatbot-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 2px solid #0b3d91;
}

.chatbot-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(11, 61, 145, 0.3);
}

.chatbot-image {
  width: 95%;
  height: 95%;
  border-radius: 50%;
  object-fit: contain;
}

.chat-bubble {
  position: absolute;
  bottom: 90px;
  right: 0;
  background: #0b3d91;
  color: white;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  max-width: 220px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(11, 61, 145, 0.3);
  white-space: normal;
  margin-bottom: 10px;
}

.chat-bubble::after {
  content: '';
  position: absolute;
  bottom: -8px;
  right: 15px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 0 solid transparent;
  border-top: 8px solid #0b3d91;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(10px);
  }
}

.animated {
  animation-duration: 0.3s;
}

.fadeIn {
  animation-name: fadeIn;
}

.fadeOut {
  animation-name: fadeOut;
}
</style>
