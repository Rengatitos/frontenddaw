<template>
  <q-page class="q-pa-lg">
    <ChatBubble :isUser="false">
      <div class="text-h6">Próximos pasos del onboarding</div>
      <div class="text-caption">
        Completa las siguientes tareas para finalizar tu proceso de incorporación a TCS
      </div>
    </ChatBubble>

    <div class="q-mt-lg">
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
                <q-checkbox v-model="task.completed" @update:model-value="() => toggleTask(task)" />
              </div>

              <div class="col">
                <div class="text-weight-bold task-title">{{ task.title }}</div>
                <div class="text-caption text-grey-7 q-mt-xs">{{ task.description }}</div>

                <div class="row items-center q-gutter-sm q-mt-sm">
                  <q-chip dense class="category-chip" size="sm">{{ task.category }}</q-chip>
                  <q-badge :color="priorityColor(task.priority)" align="middle">{{
                    task.priority
                  }}</q-badge>
                </div>
              </div>
            </div>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import ChatBubble from 'src/components/ChatBubble.vue'
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Datos iniciales de tareas (ejemplo)
const tasks = ref([
  {
    id: 1,
    title: 'Completar documentación de RRHH',
    description:
      'Revisa y firma los documentos de incorporación: contrato laboral, política de confidencialidad y código de conducta.',
    category: 'Documentos',
    priority: 'Alta',
    completed: true,
  },
  {
    id: 2,
    title: 'Configurar credenciales de acceso',
    description:
      'Configura tu correo corporativo, contraseña y acceso a los sistemas internos de TCS.',
    category: 'Sistemas',
    priority: 'Alta',
    completed: true,
  },
  {
    id: 3,
    title: 'Conocer al equipo',
    description:
      'Programa reuniones 1-a-1 con tus compañeros de equipo y stakeholders clave del proyecto.',
    category: 'Equipo',
    priority: 'Media',
    completed: false,
  },
  {
    id: 4,
    title: 'Completar formación de seguridad',
    description:
      'Realiza el curso obligatorio sobre seguridad de la información y protección de datos.',
    category: 'Formación',
    priority: 'Alta',
    completed: false,
  },
  {
    id: 5,
    title: 'Revisar guía de estilo de código',
    description:
      'Familiarízate con las mejores prácticas y estándares de código utilizados en TCS.',
    category: 'Formación',
    priority: 'Baja',
    completed: false,
  },
  {
    id: 6,
    title: 'Asistir a sesión de onboarding grupal',
    description:
      'Únete a la sesión de bienvenida grupal para conocer la cultura organizacional y beneficios.',
    category: 'Equipo',
    priority: 'Media',
    completed: false,
  },
])

const errorMessage = ref('')

const totalCount = computed(() => tasks.value.length)
const completedCount = computed(() => tasks.value.filter((t) => t.completed).length)
const progressPercent = computed(() => Math.round((completedCount.value / totalCount.value) * 100))

function priorityColor(p) {
  if (p === 'Alta') return 'red'
  if (p === 'Media') return 'orange'
  return 'grey-7'
}

function statusClass(task) {
  if (task.completed) return 'task-completed'
  return 'task-pending'
}

// Simular actualización remota con posible error
async function toggleTask(task) {
  errorMessage.value = ''
  const prev = task.completed

  try {
    // Actualizar localmente inmediatamente (v-model already updated it)
    await fakeUpdate(task)
    // Si hubiera una API, la llamada iría aquí
  } catch {
    // Revertir cambios y mostrar error
    task.completed = !prev
    errorMessage.value = 'No se pudo actualizar el progreso. Intente nuevamente.'
    $q.notify({ type: 'negative', message: errorMessage.value })
  }
}

function fakeUpdate() {
  return new Promise((resolve, reject) => {
    // 90% éxito, 10% fallo
    setTimeout(() => {
      if (Math.random() < 0.9) resolve(true)
      else reject(new Error('update failed'))
    }, 300)
  })
}
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
</style>
