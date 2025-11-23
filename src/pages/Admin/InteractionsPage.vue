<template>
  <q-page class="q-pa-md">
    <q-card class="q-pa-md bg-white shadow-2 rounded-borders">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">Interacciones</div>
        <q-input dense outlined v-model="filter" placeholder="Buscar..." debounce="300" append="search" />
      </div>

      <q-table
        :columns="columns"
        :rows="filteredRows"
        row-key="id"
        flat
        bordered
      >
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-chip :color="props.row.status === 'Completado' ? 'green' : 'amber'" dense>
              {{ props.row.status }}
            </q-chip>
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'

const filter = ref('')

const columns = [
  { name: 'employee', label: 'Empleado', field: 'employee', align: 'left' },
  { name: 'type', label: 'Tipo de Interacción', field: 'type' },
  { name: 'date', label: 'Fecha', field: 'date' },
  { name: 'status', label: 'Estado', field: 'status' },
]

const rows = ref([
  { id: 1, employee: 'María López', type: 'Onboarding', date: '2025-11-20', status: 'En Progreso' },
  { id: 2, employee: 'Carlos Pérez', type: 'Soporte', date: '2025-11-19', status: 'Completado' },
  { id: 3, employee: 'Ana Gómez', type: 'Feedback', date: '2025-11-18', status: 'Completado' },
])

const filteredRows = computed(() => {
  if (!filter.value) return rows.value
  const q = filter.value.toLowerCase()
  return rows.value.filter(r => Object.values(r).join(' ').toLowerCase().includes(q))
})
</script>

<style scoped>
.rounded-borders { border-radius: 10px; }
</style>
