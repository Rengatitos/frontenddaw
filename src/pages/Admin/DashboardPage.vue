<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md q-row-gutter-md">
      <div class="col-12 col-md-8">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6" v-for="kpi in kpis" :key="kpi.label">
            <q-card class="q-pa-md bg-white shadow-2 rounded-borders">
              <div class="row items-center">
                <q-avatar square size="48px" class="bg-primary text-white q-mr-md">
                  <q-icon :name="kpi.icon" />
                </q-avatar>
                <div>
                  <div class="text-subtitle2">{{ kpi.label }}</div>
                  <div class="text-h5">{{ kpi.value }}</div>
                </div>
              </div>
            </q-card>
          </div>

          <div class="col-12">
            <q-card class="q-pa-md bg-white shadow-2 rounded-borders">
              <div class="row items-start">
                <div class="col-12 col-md-8">
                  <div class="text-subtitle1 q-mb-sm">Gráfico de actividad</div>
                  <div class="q-mt-md" style="height:220px; background: linear-gradient(180deg, #fff, #f7f7fb); border-radius:8px; display:flex; align-items:center; justify-content:center; color: rgba(0,0,0,0.25)">
                    Placeholder Chart
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="text-subtitle1">Avance del Onboarding</div>
                  <div class="q-mt-md">
                    <div class="text-caption">75% completado</div>
                    <q-linear-progress value="0.75" color="primary" class="q-mt-sm" />
                  </div>
                </div>
              </div>
            </q-card>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="q-pa-md bg-white shadow-2 rounded-borders">
          <div class="text-subtitle1">Tareas Recientes</div>
          <div class="q-mt-md">
            <q-item v-for="task in tasks" :key="task.id" clickable>
              <q-item-section>
                <div class="text-subtitle2">{{ task.title }}</div>
                <div class="text-caption text-grey">{{ task.sub }}</div>
              </q-item-section>
            </q-item>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const kpis = ref([
  { label: 'Nuevos Empleados', value: 12, icon: 'person_add' },
  { label: 'Interacciones Hoy', value: 48, icon: 'forum' },
])

const tasks = ref([
  { id: 1, title: 'Revisar onboarding Carlos', sub: 'Enviar recordatorio' },
  { id: 2, title: 'Aprobar permisos', sub: 'Solicitud de Ana' },
])
</script>

<style scoped>
.rounded-borders { border-radius: 12px; }
</style>
