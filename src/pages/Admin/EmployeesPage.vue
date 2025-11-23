<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h6">Empleados</div>
      </div>
      <div class="col-auto row items-center q-gutter-sm">
        <q-input dense outlined v-model="search" placeholder="Buscar empleado..." />
        <q-select dense outlined v-model="department" :options="deptOptions" placeholder="Departamento" clearable />
        <q-select dense outlined v-model="statusFilter" :options="statusOptions" placeholder="Estado" clearable />
      </div>
    </div>

    <q-card class="q-pa-md bg-white shadow-2 rounded-borders">
      <q-table :columns="columns" :rows="filteredRows" row-key="id" flat bordered>
        <template v-slot:body-cell-onboarding="props">
          <q-td :props="props">
            <q-chip dense :color="props.row.onboarding === 'Completado' ? 'green' : 'orange'" text-color="white">
              {{ props.row.onboarding }}
            </q-chip>
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'

const search = ref('')
const department = ref(null)
const statusFilter = ref(null)

const deptOptions = ['Ventas','IT','RRHH','Marketing']
const statusOptions = ['Activo','Inactivo']

const columns = [
  { name: 'name', label: 'Nombre', field: 'name' },
  { name: 'email', label: 'Email', field: 'email' },
  { name: 'department', label: 'Departamento', field: 'department' },
  { name: 'onboarding', label: 'Onboarding', field: 'onboarding' },
]

const rows = ref([
  { id: 1, name: 'María López', email: 'maria@example.com', department: 'RRHH', onboarding: 'Completado', status: 'Activo' },
  { id: 2, name: 'Carlos Pérez', email: 'carlos@example.com', department: 'IT', onboarding: 'En Progreso', status: 'Activo' },
  { id: 3, name: 'Ana Gómez', email: 'ana@example.com', department: 'Ventas', onboarding: 'Completado', status: 'Inactivo' },
])

const filteredRows = computed(() => {
  return rows.value.filter(r => {
    if (search.value && !Object.values(r).join(' ').toLowerCase().includes(search.value.toLowerCase())) return false
    if (department.value && r.department !== department.value) return false
    if (statusFilter.value && r.status !== statusFilter.value) return false
    return true
  })
})
</script>

<style scoped>
.rounded-borders { border-radius: 10px; }
</style>
