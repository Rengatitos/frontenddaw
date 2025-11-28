<template>
  <q-layout view="lHh Lpr lFf">
    <!-- HEADER/NAVBAR -->
    <NavBar />

    <!-- CONTENIDO DE LA PÁGINA -->
    <q-page-container class="bg-white">
      <router-view />
    </q-page-container>

    <!-- 🔔 PANEL DE NOTIFICACIONES -->
    <q-drawer
      v-model="store.abierta"
      side="right"
      overlay
      behavior="overlay"
      width="350px"
      bordered
      class="bg-grey-1"
    >
      <div class="q-pa-md">
        <q-toolbar class="q-pa-sm items-center">
          <div class="text-h6 text-weight-bold text-primary q-mr-sm">Actividades</div>
          <q-space />
          <q-btn flat round dense icon="close" @click="store.cerrarPanel()" />
        </q-toolbar>

        <q-separator spaced />

        <div v-if="store.notifications.length === 0" class="text-center q-pa-md text-grey-6">
          <q-icon name="check_circle" size="48px" class="q-mb-md text-positive" />
          <div class="text-weight-bold">¡Todas las tareas completadas!</div>
          <div class="text-caption q-mt-sm">No tienes actividades pendientes</div>
        </div>

        <!-- TAREAS PENDIENTES -->
        <div v-if="store.pendientes.length > 0">
          <div class="text-subtitle2 text-weight-bold text-grey-8 q-mb-md">
            Pendientes ({{ store.pendientes.length }})
          </div>

          <div v-for="tarea in store.pendientes" :key="tarea.id" class="q-mb-md">
            <q-card flat bordered class="q-pa-sm bg-white">
              <div class="row items-start q-gutter-sm">
                <div class="col-auto q-pt-xs">
                  <q-checkbox
                    :model-value="tarea.completed"
                    @update:model-value="store.marcarComoCompletada(tarea.id)"
                    color="primary"
                  />
                </div>
                <div class="col">
                  <div class="text-weight-bold text-grey-9">
                    {{ tarea.titulo }}
                  </div>

                  <div class="text-caption text-grey-7 q-mt-xs">
                    {{ tarea.descripcion }}
                  </div>

                  <div class="row items-center justify-between q-mt-sm">
                    <div class="text-caption text-grey-6">
                      <q-icon name="event" size="14px" class="q-mr-xs" />
                      {{ formatDate(tarea.fechaLimite) }}
                    </div>

                    <q-badge
                      v-if="tarea.prioridad"
                      outline
                      :color="getPriorityColor(tarea.prioridad)"
                      align="middle"
                    >
                      {{ tarea.prioridad }}
                    </q-badge>
                  </div>
                </div>
              </div>
            </q-card>
          </div>
        </div>

        <!-- TAREAS COMPLETADAS -->
        <div v-if="store.completadas.length > 0" class="q-mt-lg">
          <q-separator class="q-my-md" />
          <div class="text-subtitle2 text-weight-bold text-grey-8 q-mb-md">
            Completadas ({{ store.completadas.length }})
          </div>

          <div v-for="tarea in store.completadas" :key="tarea.id" class="q-mb-md">
            <q-card flat bordered class="q-pa-sm bg-green-1">
              <div class="row items-start q-gutter-sm">
                <div class="col-auto q-pt-xs">
                  <q-icon name="check_circle" color="positive" size="24px" />
                </div>
                <div class="col">
                  <div class="text-weight-bold text-grey-9 line-through opacity-60">
                    {{ tarea.titulo }}
                  </div>
                  <div class="text-caption text-grey-7 q-mt-xs line-through opacity-60">
                    {{ tarea.descripcion }}
                  </div>
                </div>
              </div>
            </q-card>
          </div>
        </div>
      </div>
    </q-drawer>
  </q-layout>
</template>

<script setup>
import { useNotificationsStore } from 'src/stores/notifications'
import NavBar from 'src/components/NavBar.vue'

const store = useNotificationsStore()

const formatDate = (date) => {
  if (!date) return 'Sin fecha'
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
}

const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'alta':
      return 'red'
    case 'media':
      return 'orange'
    case 'baja':
      return 'green'
    default:
      return 'grey'
  }
}
</script>

<style scoped>
.bg-white {
  background: #f8fafc;
}

.line-through {
  text-decoration: line-through;
}

.opacity-60 {
  opacity: 0.6;
}
</style>
