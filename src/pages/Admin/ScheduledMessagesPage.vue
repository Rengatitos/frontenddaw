<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">Mensajes Programados</div>
      <q-btn color="primary" label="Programar Nuevo Mensaje" @click="openNew" />
    </div>

    <q-card class="q-pa-md bg-white shadow-2 rounded-borders">
      <q-table :columns="columns" :rows="rows" row-key="id" flat bordered>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn dense flat icon="edit" @click="edit(props.row)" />
            <q-btn dense flat icon="delete" color="negative" @click="remove(props.row)" />
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const columns = [
  { name: 'name', label: 'Nombre del Mensaje', field: 'name' },
  { name: 'date', label: 'Fecha de Envío', field: 'date' },
  { name: 'recipient', label: 'Destinatario', field: 'recipient' },
  { name: 'status', label: 'Estado', field: 'status' },
  { name: 'actions', label: 'Acciones', field: 'actions' },
]

const rows = ref([
  { id: 1, name: 'Recordatorio Onboarding', date: '2025-11-25', recipient: 'Nuevos Empleados', status: 'Programado' },
  { id: 2, name: 'Encuesta de satisfacción', date: '2025-12-01', recipient: 'Todos', status: 'Programado' },
])

function openNew() { /* placeholder - open modal */ }
function edit(row) { console.log('edit scheduled message', row) }
function remove(row) { rows.value = rows.value.filter(r => r.id !== row.id) }
</script>

<style scoped>
.rounded-borders { border-radius: 10px; }
</style>
