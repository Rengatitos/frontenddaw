<template>
  <q-page class="q-pa-lg">
    <ChatBubble :isUser="false">
      <div class="text-h6">Próximos pasos del onboarding</div>
      <div class="text-caption">
        Completa las siguientes tareas para finalizar tu proceso de incorporación a TCS
      </div>
    </ChatBubble>

    <div class="q-mt-lg">
      <div v-if="loading" class="text-center q-my-md">
        <q-spinner-dots color="primary" size="40px" />
      </div>

      <div v-else>
        <div v-if="tasks.length === 0" class="text-center text-grey-7 q-my-md">
          No tienes tareas pendientes por el momento.
        </div>

        <div v-else>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6 text-weight-bold">Tu Progreso</div>
            <q-circular-progress :value="progressPercent" size="80" thickness="12" color="primary">
              <div class="text-h6 q-pa-xs">{{ progressPercent }}%</div>
            </q-circular-progress>
          </div>

          <div class="text-caption text-grey-6 q-mb-md">
            {{ completedCount }} de {{ totalCount }} tareas completadas
          </div>

          <q-banner v-if="errorMessage" dense class="bg-red-1 text-red q-mb-md">
            {{ errorMessage }}
          </q-banner>

          <div class="task-list">
            <div v-for="task in tasks" :key="task.id" class="q-mb-md">
              <q-card flat bordered class="task-card-inner" :class="statusClass(task)">
                <div class="row items-center no-wrap q-gutter-md">
                  <div class="col-auto">
                    <q-checkbox
                      v-model="task.completed"
                      @update:model-value="() => toggleTask(task)"
                    />
                  </div>

                  <div class="col">
                    <div class="text-weight-bold task-title">{{ task.title }}</div>
                    <div class="text-caption text-grey-7 q-mt-xs">{{ task.description }}</div>

                    <div class="row items-center q-gutter-sm q-mt-sm">
                      <q-chip dense class="category-chip" size="sm">{{ task.category }}</q-chip>
                      <q-badge :color="priorityColor(task.priority)" align="middle">
                        {{ task.priority }}
                      </q-badge>
                    </div>
                  </div>
                </div>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="q-mt-lg">
      <div class="text-h6 text-weight-bold q-mb-md">Próximas Actividades</div>

      <div v-if="loadingActividades" class="text-center q-my-md">
        <q-spinner-dots color="primary" size="40px" />
      </div>

      <div v-else>
        <div v-if="!actividades.length" class="text-center text-grey-7 q-my-md">
          No tienes próximas actividades asignadas.
        </div>

        <div v-else>
          <ul class="q-list">
            <li
              v-for="actividad in actividades"
              :key="actividad.id"
              class="q-pa-md q-mb-sm bg-grey-1 rounded task-card-inner"
              style="list-style: none"
            >
              <div class="text-h6">{{ actividad.titulo }}</div>
              <div class="text-caption text-grey-7 q-mt-xs">
                {{ actividad.descripcion }}
              </div>
              <div class="row items-center q-gutter-sm q-mt-sm wrap">
                <div class="text-caption text-weight-bold text-primary">
                  Estado: {{ actividad.estado }}
                </div>
                <q-separator vertical class="q-mx-sm" />
                <div class="text-caption">
                  Inicio: {{ new Date(actividad.fechaInicio).toLocaleDateString() }}
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import ChatBubble from 'src/components/ChatBubble.vue'
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const tasks = ref([])
const actividades = ref([])
const errorMessage = ref('')
const loading = ref(true)
const loadingActividades = ref(true)
const auth = useAuthStore()

// Computadas
const totalCount = computed(() => tasks.value.length)
const completedCount = computed(() => tasks.value.filter((t) => t.completed).length)
const progressPercent = computed(() =>
  totalCount.value > 0 ? Math.round((completedCount.value / totalCount.value) * 100) : 0,
)

// Helpers visuales
function priorityColor(p) {
  if (p === 'Alta') return 'red'
  if (p === 'Media') return 'orange'
  return 'grey-7'
}

function statusClass(task) {
  if (task.completed) return 'task-completed'
  return 'task-pending'
}

// ------------------------------------------------------------------
// FUNCIÓN SEGURA PARA OBTENER EL ID
// ------------------------------------------------------------------
function getUsuarioId() {
  // 1. Prioridad: LocalStorage (donde el Login lo guardó limpio)
  const storedId = localStorage.getItem('usuarioId')
  if (storedId && storedId !== 'undefined' && storedId !== '[object Object]') {
    return storedId
  }

  // 2. Fallback: Store
  if (auth.user?.id && typeof auth.user.id === 'string') {
    return auth.user.id
  }

  return null
}
// ------------------------------------------------------------------

async function fetchPendingTasks() {
  loading.value = true
  try {
    const usuarioId = getUsuarioId()

    if (!usuarioId) {
      // Solo mostramos error si realmente esperábamos estar logueados
      console.warn('No se encontró ID de usuario válido')
      errorMessage.value = 'Sesión no válida. Por favor recarga o inicia sesión.'
      loading.value = false
      return
    }

    console.log('ID usado para Tasks:', usuarioId)

    const response = await axios.get(
      `https://backend-daw.onrender.com/api/Actividad/pendientes/${usuarioId}`,
    )

    const data = Array.isArray(response.data) ? response.data : []

    tasks.value = data.map((task) => ({
      id: task.id,
      title: task.titulo,
      description: task.descripcion,
      category: task.categoria || 'General',
      priority: task.prioridad || 'Media',
      completed: task.estado !== 'Pendiente',
    }))
  } catch (error) {
    console.error('Error tasks:', error)
    if (error.response?.status === 404) {
      // 404 significa que no tiene tareas, no es un error grave
      tasks.value = []
    } else {
      errorMessage.value = 'No se pudieron cargar las tareas.'
    }
  } finally {
    loading.value = false
  }
}

async function fetchActividades() {
  loadingActividades.value = true
  try {
    const usuarioId = getUsuarioId()
    if (!usuarioId) {
      loadingActividades.value = false
      return
    }

    const response = await axios.get(
      `https://backend-daw.onrender.com/api/Actividad/usuario/${usuarioId}`,
    )

    if (response.data && Array.isArray(response.data)) {
      actividades.value = response.data
    } else {
      actividades.value = []
    }
  } catch (error) {
    console.error('Error actividades:', error)
  } finally {
    loadingActividades.value = false
  }
}

onMounted(() => {
  fetchPendingTasks()
  fetchActividades()
})

function toggleTask(task) {
  errorMessage.value = ''
  const prev = task.completed

  // Optimistic UI
  try {
    fakeUpdate(task).catch(() => {
      task.completed = prev
      $q.notify({ type: 'negative', message: 'No se pudo actualizar el estado' })
    })
  } catch {
    task.completed = prev
  }
}

function fakeUpdate() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.9) resolve(true)
      else reject(new Error('update failed'))
    }, 300)
  })
}

// Helper para abrir el chatbot en una nueva ventana con bandera de acceso
function openChatbot() {
  const base = window.location.origin
  // Usamos modo hash si aplica; Quasar setea history/hash vía router
  const isHash = (import.meta.env.VUE_ROUTER_MODE || '').toLowerCase() !== 'history'
  const path = isHash ? '/#/onboarding-chat?allow=1' : '/onboarding-chat?allow=1'
  const url = `${base}${path}`
  window.open(url, '_blank')
}

// Exponer para uso en template si se requiere (script setup)
defineExpose({ openChatbot })
</script>

<style scoped>
.task-card-inner {
  padding: 14px;
  border-radius: 10px;
  background: white;
}
.task-title {
  font-size: 1.05rem;
}
.task-completed {
  opacity: 0.9;
  background: linear-gradient(90deg, #ffffff, #f8fafc);
  border-left: 6px solid #0d6efd;
}
.task-pending {
  background: #ffffff;
  border-left: 6px solid transparent;
}
.category-chip {
  background: rgba(13, 110, 253, 0.06);
  color: #0d6efd;
  border: 1px solid rgba(13, 110, 253, 0.12);
}
.q-banner.bg-red-1 {
  border-radius: 6px;
}
ul.q-list {
  padding: 0;
}
</style>
