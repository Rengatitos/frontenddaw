<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h6">Historial de Conversaciones</div>
      </div>
      <div class="col-auto row items-center q-gutter-sm">
        <q-input dense outlined v-model="search" placeholder="Buscar en conversaciones..." clearable />
        <q-select dense outlined v-model="contextFilter" :options="contextOptions" placeholder="Filtrar por contexto" clearable />
        <q-btn color="primary" label="Refrescar" @click="loadInteractions" icon="refresh" />
      </div>
    </div>

    <q-card class="q-pa-md bg-white shadow-2 rounded-borders">
      <div class="row">
        <div class="col-12">
          <q-table
            :columns="columns"
            :rows="filteredRows"
            row-key="id"
            flat
            bordered
            v-model:pagination="pagination"
            :rows-per-page-options="[5,10,20]"
            :loading="loading"
            wrap-cells
          >
            <template v-slot:body-cell-fechaHora="props">
              <q-td :props="props" class="text-no-wrap">
                <div class="text-subtitle2">{{ formatDate(props.row.fechaHora) }}</div>
                <div class="text-caption text-grey-7">{{ formatTime(props.row.fechaHora) }}</div>
              </q-td>
            </template>

            <template v-slot:body-cell-mensajeUsuario="props">
              <q-td :props="props" class="text-break">
                <div class="text-subtitle2">{{ props.row.mensajeUsuario || '-' }}</div>
              </q-td>
            </template>

            <template v-slot:body-cell-respuestaChatbot="props">
              <q-td :props="props" class="text-break">
                <div class="text-subtitle2" style="white-space: pre-wrap; word-break: break-word;">{{ props.row.respuestaChatbot || '-' }}</div>
              </q-td>
            </template>

            <template v-slot:body-cell-acciones="props">
              <q-td :props="props" class="text-no-wrap">
                <q-btn dense flat icon="expand" color="primary" @click="openDetailModal(props.row)" title="Ver detalle completo" />
              </q-td>
            </template>
          </q-table>
        </div>
      </div>
    </q-card>

    <!-- Detail Modal -->
    <q-dialog v-model="detailOpen" maximized>
      <q-card>
        <q-card-section class="row items-center" style="background: #0b3d91; color: white;">
          <div class="col">
            <div class="text-h6">Detalle de Conversación</div>
            <div class="text-caption">{{ formatDate(selectedInteraction?.fechaHora) }} - {{ formatTime(selectedInteraction?.fechaHora) }}</div>
          </div>
          <q-btn icon="close" flat round dense v-close-popup class="text-white" />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="row q-gutter-lg">
            <!-- Info Column -->
            <div class="col-12 col-md-2">
              <q-card flat bordered>
                <q-card-section class="bg-grey-1">
                  <div class="text-subtitle2 text-weight-bold q-mb-md">Información</div>
                  <div class="q-mb-md">
                    <div class="text-caption text-grey-7">Contexto</div>
                    <q-chip dense :color="contextoColor(selectedInteraction?.contexto)" text-color="white" size="sm">
                      {{ selectedInteraction?.contexto || 'General' }}
                    </q-chip>
                  </div>
                  <div class="q-mb-md">
                    <div class="text-caption text-grey-7">Fecha y Hora</div>
                    <div class="text-subtitle2">{{ formatDate(selectedInteraction?.fechaHora) }}</div>
                    <div class="text-caption">{{ formatTime(selectedInteraction?.fechaHora) }}</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Conversation Column -->
            <div class="col-12 col-md-10">
              <q-card flat bordered>
                <q-card-section class="bg-grey-1">
                  <div class="text-subtitle2 text-weight-bold">Conversación</div>
                </q-card-section>

                <q-card-section class="q-pa-lg">
                  <!-- User Message -->
                  <div class="q-mb-lg">
                    <div class="text-caption text-weight-bold text-primary q-mb-sm">💬 Mensaje del Usuario</div>
                    <div class="bg-blue-1 q-pa-md rounded-borders" style="border-left: 4px solid #0b3d91;">
                      <div style="white-space: pre-wrap; word-break: break-word;">
                        {{ selectedInteraction?.mensajeUsuario || '-' }}
                      </div>
                    </div>
                  </div>

                  <!-- Bot Response -->
                  <div class="q-mb-lg">
                    <div class="text-caption text-weight-bold text-secondary q-mb-sm">🤖 Respuesta del Chatbot</div>
                    <div class="bg-grey-2 q-pa-md rounded-borders" style="border-left: 4px solid #666;">
                      <div style="white-space: pre-wrap; word-break: break-word;">
                        {{ selectedInteraction?.respuestaChatbot || '-' }}
                      </div>
                    </div>
                  </div>

                  <!-- Corrected Response (if exists) -->
                  <div v-if="selectedInteraction?.respuestaCorregida" class="q-mb-lg">
                    <div class="text-caption text-weight-bold text-orange q-mb-sm">✏️ Respuesta Corregida</div>
                    <div class="bg-orange-1 q-pa-md rounded-borders" style="border-left: 4px solid #ff9800;">
                      <div style="white-space: pre-wrap; word-break: break-word;">
                        {{ selectedInteraction?.respuestaCorregida }}
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-1">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar()

const search = ref('')
const contextFilter = ref(null)
const contextOptions = ['Onboarding', 'General', 'Soporte', 'Consulta']

const columns = [
  { name: 'fechaHora', label: 'Fecha y Hora', field: 'fechaHora', sortable: true, align: 'left' },
  { name: 'mensajeUsuario', label: 'Mensaje del Usuario', field: 'mensajeUsuario', sortable: false, align: 'left' },
  { name: 'respuestaChatbot', label: 'Respuesta del Chatbot', field: 'respuestaChatbot', sortable: false, align: 'left' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]

const rows = ref([])
const pagination = ref({ page: 1, rowsPerPage: 5, rowsNumber: 0 })
const loading = ref(false)

const detailOpen = ref(false)
const selectedInteraction = ref(null)

// Build user map for name/email lookup
const userMap = ref({})

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function contextoColor(contexto) {
  const colorMap = {
    'Onboarding': '#4CAF50',
    'General': '#2196F3',
    'Soporte': '#FF9800',
    'Consulta': '#9C27B0',
  }
  return colorMap[contexto] || '#666'
}

function openDetailModal(interaction) {
  selectedInteraction.value = interaction
  detailOpen.value = true
}

// Load all users to build map of usuarioRef -> nombre/correo
async function loadUsers() {
  try {
    const res = await api.get('Usuario')
    const users = Array.isArray(res.data) ? res.data : res.data?.data || []
    users.forEach(u => {
      userMap.value[u._id || u.id] = {
        nombre: u.nombre || u.name || 'Desconocido',
        correo: u.correo || u.email || '',
      }
    })
  } catch (err) {
    console.error('Error loading users:', err)
  }
}

// Load interactions and enrich with user data
async function loadInteractions() {
  loading.value = true
  try {
    const res = await api.get('InteraccionChat')
    const data = Array.isArray(res.data) ? res.data : res.data?.data || []
    
    // Map interactions
    rows.value = data.map(interaction => ({
      ...interaction,
    }))
    
    pagination.value.rowsNumber = rows.value.length
  } catch (err) {
    console.error('Error loading interactions:', err)
    $q.notify({ type: 'negative', message: 'No se pudo cargar las interacciones' })
  } finally {
    loading.value = false
  }
}

// Filter by search and context
const filteredRows = computed(() => {
  const q = (search.value || '').toString().toLowerCase().trim()
  return rows.value.filter(r => {
    if (contextFilter.value && r.contexto !== contextFilter.value) return false
    if (!q) return true
    const searchable = (
      (r.mensajeUsuario || '') +
      ' ' +
      (r.respuestaChatbot || '')
    ).toLowerCase()
    return searchable.includes(q)
  })
})

// Keep pagination in sync
watch(filteredRows, (val) => {
  pagination.value.rowsNumber = Array.isArray(val) ? val.length : 0
})

onMounted(async () => {
  await loadUsers()
  await loadInteractions()
})
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}

.text-break {
  word-break: break-word;
  white-space: normal;
}

.text-no-wrap {
  white-space: nowrap;
}
</style>

<style scoped>
.rounded-borders { border-radius: 10px; }
</style>
