<template>
  <q-page class="q-pa-lg">
    <!-- Encabezado con bienvenida -->
    <ChatBubble :isUser="false">
      <div class="text-h6">Próximos pasos del onboarding</div>
      <div class="text-caption">
        Completa las siguientes tareas para finalizar tu proceso de incorporación a TCS
      </div>
    </ChatBubble>

    <!-- Contenido principal -->
    <div class="q-mt-lg">
      <!-- Lista principal de Próximos Pasos (solo pendientes, provistas por el endpoint /pendientes/{usuarioRef}) -->

      <!-- Banner de error -->
      <q-banner v-if="errorMessage" dense class="bg-red-1 text-red q-mb-md rounded-borders">
        <q-icon name="error" class="q-mr-sm" />
        {{ errorMessage }}
      </q-banner>

      <!-- Spinner de carga -->
      <div v-if="loading" class="flex justify-center q-my-lg">
        <q-spinner color="primary" size="60px" />
      </div>

      <!-- Lista de actividades -->
      <div v-else class="task-list">
        <!-- Sin actividades -->
        <div v-if="tasks.length === 0" class="text-center text-grey-6 q-pa-lg">
          <q-icon name="inbox" size="48px" class="q-mb-md opacity-50" />
          <div class="text-subtitle1">No hay actividades pendientes</div>
          <div class="text-caption">¡Todas tus tareas están al día!</div>
        </div>

        <!-- Listado de actividades -->
        <div v-for="task in tasks" :key="task.id" class="q-mb-md">
          <q-card flat bordered class="task-card-inner" :class="statusClass(task)">
            <q-card-section class="q-pa-md">
              <div class="row items-start q-gutter-md">
                <!-- Checkbox -->
                <div class="col-auto q-pt-xs">
                  <q-checkbox
                    :model-value="task.estado === 'Completada'"
                    @update:model-value="(val) => onToggle(task, val)"
                    :disable="task.estado === 'Completada'"
                  />
                </div>

                <!-- Contenido de la tarjeta -->
                <div class="col">
                  <!-- Título -->
                  <div class="text-weight-bold task-title">{{ task.title }}</div>

                  <!-- Descripción -->
                  <div class="text-caption text-grey-7 q-mt-xs">{{ task.description }}</div>

                  <!-- Metadatos -->
                  <div class="row items-center q-gutter-sm q-mt-sm flex-wrap">
                    <!-- Tipo/Categoría -->
                    <q-chip dense class="category-chip" size="sm">{{ task.category }}</q-chip>

                    <!-- Prioridad -->
                    <q-badge :color="priorityColor(task.priority)" align="middle">
                      {{ task.priority }}
                    </q-badge>

                    <!-- Estado Vencida -->
                    <div v-if="task.estado === 'Vencida'" class="text-negative text-caption">
                      <q-icon name="event_busy" size="16px" class="q-mr-xs" />
                      Vencida
                    </div>

                    <!-- Fecha de vencimiento -->
                    <div v-if="task.fecha_fin" class="text-grey-6 text-caption">
                      <q-icon name="event" size="16px" class="q-mr-xs" />
                      {{ formatFecha(task.fecha_fin) }}
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import ChatBubble from 'src/components/ChatBubble.vue'
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { esObjectIdValido } from 'src/composables/useUsuario'
import { useActividades } from 'src/composables/useActividades'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()
const { cargarPendientes, marcarEstado } = useActividades()

// Estado reactivo
const tasks = ref([])
const errorMessage = ref('')
const loading = ref(false)

// Propiedades computadas
// Nota: Esta página muestra únicamente actividades pendientes recibidas del endpoint /pendientes/{usuarioRef}

// Use composable obtenerIdUsuarioSeguro() for robust id extraction

/**
 * Determina el color de la prioridad
 * @param {string} prioridad - Nivel de prioridad (Alta, Media, Baja)
 * @returns {string} Color de Quasar
 */
function priorityColor(prioridad) {
  const map = {
    Alta: 'red',
    Media: 'orange',
    Baja: 'grey-7',
  }
  return map[prioridad] || 'grey-7'
}

/**
 * Determina la clase CSS según el estado de la actividad
 * @param {object} task - La actividad
 * @returns {string} Nombre de la clase CSS
 */
function statusClass(task) {
  if (task.estado === 'Completada') return 'task-completed'
  if (task.estado === 'Vencida') return 'task-expired'
  return 'task-pending'
}

/**
 * Formatea una fecha para mostrar
 * @param {string} fecha - ISO 8601 string
 * @returns {string} Fecha formateada (ej: "28 nov 2025")
 */
function formatFecha(fecha) {
  try {
    const date = new Date(fecha)
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  } catch {
    return fecha
  }
}

/**
 * Mapea una actividad de la API al modelo de UI
 * @param {object} actividad - Actividad del backend
 * @returns {object} Actividad mapeada para la UI
 */
function mapActividad(actividad) {
  // Normalizar `estado` para evitar problemas de mayúsculas/minúsculas
  const rawEstado = actividad.estado || actividad.status || ''
  const estadoStr = String(rawEstado || '').trim()
  const estado = estadoStr
    ? estadoStr.charAt(0).toUpperCase() + estadoStr.slice(1).toLowerCase()
    : null

  return {
    id: actividad._id || actividad.id,
    title: actividad.titulo || actividad.title || 'Sin título',
    description: actividad.descripcion || actividad.description || '',
    category: actividad.tipo || actividad.category || 'General',
    priority: actividad.prioridad || actividad.priority || 'Media',
    estado,
    fecha_inicio: actividad.fecha_inicio || null,
    fecha_fin: actividad.fecha_fin || null,
    completed: estado === 'Completada' || actividad.completed === true,
  }
}

/**
 * Carga las actividades del usuario desde la API
 */
async function cargarActividades() {
  loading.value = true
  errorMessage.value = ''

  // Obtener ID del usuario desde localStorage.usuario (fuente de verdad)
  let idUsuario = null
  try {
    const raw = localStorage.getItem('usuario')
    if (raw) {
      const parsed = JSON.parse(raw)
      idUsuario = parsed && (parsed.id || parsed._id || null)
    }
  } catch {
    idUsuario = null
  }

  // Validar formato antes de hacer la petición
  if (!idUsuario || !esObjectIdValido(idUsuario)) {
    const msg = 'ID inválido o no encontrado. Inicie sesión nuevamente.'
    errorMessage.value = msg
    $q.notify({ type: 'negative', message: msg, position: 'top' })
    // redirigir al login
    router.push('/login')
    loading.value = false
    tasks.value = []
    return
  }

  try {
    // Cargar actividades pendientes usando el composable
    const actividades = await cargarPendientes(idUsuario)

    // Guardamos las actividades mapeadas para la UI
    tasks.value = actividades.map(mapActividad)

    // Feedback si no hay actividades pendientes
    if (tasks.value.length === 0) {
      $q.notify({ type: 'info', message: 'No hay actividades pendientes', position: 'top' })
    }
  } catch (err) {
    console.error('Error cargando actividades:', err)

    errorMessage.value = 'No se pudo cargar las actividades. Intente nuevamente.'
    $q.notify({
      type: 'negative',
      message: errorMessage.value,
      position: 'top',
    })

    tasks.value = []
  } finally {
    loading.value = false
  }
}

/**
 * Marca una actividad como completada
 * @param {object} task - La actividad a completar
 */
async function completarActividad(task) {
  errorMessage.value = ''
  let idUsuario = null
  try {
    const raw = localStorage.getItem('usuario')
    if (raw) {
      const parsed = JSON.parse(raw)
      idUsuario = parsed && (parsed.id || parsed._id || null)
    }
  } catch {
    idUsuario = null
  }

  if (!idUsuario || !esObjectIdValido(idUsuario)) {
    const msg = 'ID inválido. Inicie sesión nuevamente.'
    $q.notify({ type: 'negative', message: msg, position: 'top' })
    errorMessage.value = msg
    tasks.value = []
    router.push('/login')
    return
  }

  try {
    // Usar composable para marcar como completada
    const success = await marcarEstado(task.id, idUsuario, 'Completada')

    if (success) {
      // Recargar actividades en esta página
      await cargarActividades()
    }
  } catch (err) {
    console.error('Error completando actividad:', err)
    errorMessage.value = 'No se pudo actualizar la actividad. Intente nuevamente.'
    $q.notify({
      type: 'negative',
      message: errorMessage.value,
      position: 'top',
    })
  }
}

/**
 * Manejador de cambio del checkbox
 * @param {object} task - La actividad
 * @param {boolean} val - Nuevo valor del checkbox
 */
function onToggle(task, val) {
  if (val && task.estado !== 'Completada') {
    completarActividad(task)
  }
}

// Cargar actividades al montar el componente
onMounted(() => {
  cargarActividades()
})
</script>

<style scoped>
/* Contenedor de la lista */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Tarjetas de actividades */
.task-card-inner {
  padding: 0;
  border-radius: 10px;
  background: white;
  transition: all 0.3s ease;
}

.task-card-inner:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.task-title {
  font-size: 1.05rem;
  color: #2c3e50;
}

/* Estado: Completada */
.task-completed {
  background: linear-gradient(90deg, #ffffff, #f8fafc);
  border-left: 6px solid #0d6efd;
  opacity: 0.85;
}

.task-completed .task-title {
  text-decoration: line-through;
  color: #6c757d;
}

/* Estado: Pendiente */
.task-pending {
  background: #ffffff;
  border-left: 6px solid transparent;
}

/* Estado: Vencida */
.task-expired {
  background: #fff7f7;
  border-left: 6px solid #e55353;
}

.task-expired .task-title {
  color: #e55353;
}

/* Chip de categoría */
.category-chip {
  background: rgba(13, 110, 253, 0.08) !important;
  color: #0d6efd !important;
  border: 1px solid rgba(13, 110, 253, 0.15) !important;
  font-size: 0.75rem;
}

/* Banner de error */
.bg-red-1 {
  background-color: #ffe8e8 !important;
  color: #d32f2f !important;
  border-radius: 6px;
}

/* Spinner y mensajes vacíos */
.opacity-50 {
  opacity: 0.5;
}

.rounded-borders {
  border-radius: 6px;
}

/* Responsive */
@media (max-width: 600px) {
  .task-card-inner {
    border-left: 3px solid !important;
  }

  .task-title {
    font-size: 0.95rem;
  }
}
</style>
