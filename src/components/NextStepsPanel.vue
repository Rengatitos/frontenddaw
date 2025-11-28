<template>
  <div class="nextsteps-root">
    <div class="proximos-header row items-start">
      <div class="col">
        <div class="text-h5 text-weight-bold">Próximos pasos del onboarding</div>
        <div class="text-caption">
          Completa las siguientes tareas para finalizar tu proceso de incorporación a TCS
        </div>
      </div>

      <div class="col-auto text-right">
        <q-circular-progress
          :value="progressPercent"
          size="80"
          :thickness="0.2"
          color="primary"
          class="q-mb-sm"
        >
          <div class="text-h6 q-pa-xs">{{ progressPercent }}%</div>
        </q-circular-progress>
        <div class="text-caption">{{ completedCount }} de {{ totalCount }} tareas completadas</div>
      </div>
    </div>

    <q-separator spaced />

    <q-banner v-if="errorMessage" dense class="bg-red-1 text-red">{{ errorMessage }}</q-banner>

    <div class="task-list q-mt-md">
      <div class="tasks-scroll">
        <div v-for="task in tasks" :key="task.id" class="task-card">
          <q-card flat bordered class="task-card-inner" :class="statusClass(task)">
            <div class="row items-center no-wrap">
              <div class="col-auto">
                <q-checkbox v-model="task.completed" @update:model-value="() => toggleTask(task)" />
              </div>

              <div class="col">
                <div class="row items-center justify-between">
                  <div>
                    <div class="text-weight-bold task-title">{{ task.title }}</div>
                    <div class="text-caption text-grey-7">{{ task.description }}</div>
                  </div>

                  <div class="row items-center q-gutter-sm">
                    <q-chip dense class="category-chip">{{ task.category }}</q-chip>
                    <q-badge :color="priorityColor(task.priority)" align="middle">{{
                      task.priority
                    }}</q-badge>
                  </div>
                </div>
              </div>
            </div>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// sample tasks (same as previous)
const tasks = ref([
  {
    id: 1,
    title: 'Completar documentación de RRHH',
    description: 'Revisa y firma los documentos...',
    category: 'Documentos',
    priority: 'Alta',
    completed: true,
  },
  {
    id: 2,
    title: 'Configurar credenciales de acceso',
    description: 'Configura tu correo corporativo...',
    category: 'Sistemas',
    priority: 'Alta',
    completed: true,
  },
  {
    id: 3,
    title: 'Conocer al equipo',
    description: 'Programa reuniones 1-a-1...',
    category: 'Equipo',
    priority: 'Media',
    completed: false,
  },
  {
    id: 4,
    title: 'Completar formación de seguridad',
    description: 'Realiza el curso obligatorio...',
    category: 'Formación',
    priority: 'Alta',
    completed: false,
  },
  {
    id: 5,
    title: 'Revisar guía de estilo de código',
    description: 'Familiarízate con las mejores prácticas...',
    category: 'Formación',
    priority: 'Baja',
    completed: false,
  },
  {
    id: 6,
    title: 'Asistir a sesión de onboarding grupal',
    description: 'Únete a la sesión de bienvenida grupal...',
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
  return task.completed ? 'task-completed' : 'task-pending'
}

async function toggleTask(task) {
  errorMessage.value = ''
  const prev = task.completed
  try {
    await fakeUpdate()
  } catch {
    task.completed = !prev
    errorMessage.value = 'No se pudo actualizar el progreso. Intente nuevamente.'
    $q.notify({ type: 'negative', message: errorMessage.value })
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
</script>

<style scoped>
.proximos-header {
  margin-bottom: 8px;
}
.task-list {
  margin-top: 12px;
}
.tasks-scroll {
  max-height: calc(70vh);
  overflow-y: auto;
  padding-right: 8px;
}
.task-card {
  margin-bottom: 12px;
}
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
  margin-bottom: 12px;
}
</style>
