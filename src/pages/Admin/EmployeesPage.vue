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
        <q-select dense outlined v-model="roleFilter" :options="roleOptions" option-label="label" option-value="value" placeholder="Filtrar por rol" clearable />
        <q-btn v-permission="'Administrador'" color="primary" label="CREAR EMPLEADO" @click="openCreate" />
      </div>
    </div>

    <q-card class="q-pa-md bg-white shadow-2 rounded-borders">
        <q-table
        :columns="columns"
        :rows="filteredRows"
        row-key="id"
        flat
        bordered
        v-model:pagination="pagination"
        :rows-per-page-options="[5,10,20]"
      >
        <template v-slot:body-cell-onboarding="props">
          <q-td :props="props" class="text-center">
            <div class="row items-center justify-center">
              <q-chip dense :color="props.row.onboarding === 'Completado' ? 'green' : 'orange'" text-color="white">
                {{ props.row.onboarding || 'En Progreso' }}
              </q-chip>
              <div v-if="props.row.onboardingPct !== null" class="q-ml-sm text-caption">{{ props.row.onboardingPct }}%</div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn dense flat icon="edit" v-permission="'Administrador'" @click="editRow(props.row)" />
            <q-btn dense flat icon="delete" v-permission="'Administrador'" color="negative" @click="deleteRow(props.row)" />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Create / Edit Dialog -->
    <q-dialog v-model="dialogOpen" persistent>
      <q-card style="min-width: 450px">
        <q-card-section>
          <div class="text-h6">{{ editing ? 'Editar empleado' : 'Crear empleado' }}</div>
        </q-card-section>

        <q-card-section>
          <q-form ref="formRef" class="q-gutter-sm">
            <q-input v-model="form.nombre" label="Nombre completo" dense :rules="[requiredRule]" />
            <q-input v-model="form.correo" label="Correo electrónico" dense type="email" :rules="[emailRule]" class="q-mt-sm" />
            <q-select v-model="form.rolRef" :options="roleOptions" option-label="label" option-value="value" label="Rol" dense class="q-mt-sm" />
            <q-select
              v-model="form.nivelOnboardingEstado"
              :options="onboardingOptions"
              label="Estado de onboarding"
              dense
              class="q-mt-sm"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup @click="closeDialog" />
          <q-btn label="Guardar" color="primary" @click="submitForm" :loading="saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Confirm Delete Dialog -->
    <q-dialog v-model="confirmDeleteOpen" persistent>
      <q-card style="min-width: 480px">
        <q-card-section>
          <div class="text-h6">Confirmar eliminación</div>
        </q-card-section>
        <q-card-section>
          <div class="q-mb-md">¿Estás seguro que deseas eliminar a <strong>{{ (rowToDelete && (rowToDelete.nombre || (rowToDelete.raw && (rowToDelete.raw.nombre || rowToDelete.raw.name)))) || '' }}</strong> ? Esta acción no se puede deshacer.</div>
          <div class="bg-orange-1 q-pa-md rounded-borders q-mb-md">
            <div class="text-subtitle2 q-mb-sm text-weight-bold">⚠️ Ingresa el ID del empleado para confirmar</div>
            <div class="text-caption text-grey-8 q-mb-md">Por seguridad, debes ingresar manualmente el ID de 24 caracteres del empleado que deseas eliminar.</div>
            <q-input 
              dense 
              outlined
              v-model="overrideDeleteId" 
              label="ID del empleado (requerido)"
              placeholder="Ej: 6929c79d5f3e2eddd9796d93"
              :rules="[v => !!v || 'El ID es requerido', v => /^[0-9a-fA-F]{24}$/.test(v) || 'El ID debe tener 24 caracteres hexadecimales']"
              hint="Puedes encontrar el ID en la columna 'ID (debug)' de la tabla"
            />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup @click="() => { confirmDeleteOpen = false; overrideDeleteId = '' }" />
          <q-btn 
            label="Confirmar eliminación" 
            color="negative" 
            @click="performDelete"
            :disable="!overrideDeleteId || !/^[0-9a-fA-F]{24}$/.test(overrideDeleteId)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { api } from 'src/boot/axios'

const $q = useQuasar()

const search = ref('')
const department = ref(null)
const statusFilter = ref(null)
const roleFilter = ref(null)

const deptOptions = ['Ventas', 'IT', 'RRHH', 'Marketing']
const statusOptions = ['Activo', 'Inactivo']
const onboardingOptions = ['En Progreso', 'Completado', 'Inicial']
// Role constants (IDs provided by backend)
const ROLE_ID_ADMIN = '6913adbcca79acfd93858d5c'
const ROLE_ID_EMPLOYEE = '692284a99875b23f82fb7023'
const roleOptions = [
  { label: 'Empleado', value: ROLE_ID_EMPLOYEE },
  { label: 'Administrador', value: ROLE_ID_ADMIN },
]

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', sortable: true },
  { name: 'correo', label: 'Email', field: 'correo', sortable: true },
  { name: 'onboarding', label: 'Estado onboarding', field: 'onboarding', sortable: true },
  { name: 'uid', label: 'ID (debug)', field: 'uid', sortable: false },
  { name: 'actions', label: 'Acciones', field: 'actions' },
]

const rows = ref([])
const pagination = ref({ page: 1, rowsPerPage: 5, rowsNumber: 0 })

const dialogOpen = ref(false)
const editing = ref(false)
const saving = ref(false)
const formRef = ref(null)
const confirmDeleteOpen = ref(false)
const rowToDelete = ref(null)
const overrideDeleteId = ref('')

const form = ref({ id: null, nombre: '', correo: '', nivelOnboardingEstado: 'En Progreso', telefono: '', rolRef: ROLE_ID_EMPLOYEE })
const auth = useAuthStore()

// Convert MongoDB ObjectId object to hex string
function objectIdToHex(id) {
  if (!id || typeof id !== 'object') return null
  if (typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) return id
  
  // If it has these MongoDB ObjectId properties, convert to hex
  if (id.timestamp !== undefined && id.machine !== undefined && id.pid !== undefined && id.increment !== undefined) {
    try {
      const timestamp = (id.timestamp >>> 0).toString(16).padStart(8, '0')
      const machine = (id.machine >>> 0).toString(16).padStart(6, '0')
      const pid = (id.pid >>> 0).toString(16).padStart(4, '0')
      const increment = (id.increment >>> 0).toString(16).padStart(6, '0')
      const hex = timestamp + machine + pid + increment
      if (/^[0-9a-fA-F]{24}$/.test(hex)) return hex
    } catch (e) {
      console.warn('Error converting ObjectId to hex:', e)
    }
  }
  return null
}

// Find hex id but avoid returning role ids (rolRef). Prefer keys that indicate an id.
function findUserHexId(obj) {
  if (!obj || typeof obj !== 'object') return null

  // direct common id fields
  if (typeof obj._id === 'string' && /^[0-9a-fA-F]{24}$/.test(obj._id)) return obj._id
  if (typeof obj.id === 'string' && /^[0-9a-fA-F]{24}$/.test(obj.id)) return obj.id
  
  // Try to convert MongoDB ObjectId object to hex
  if (obj._id && typeof obj._id === 'object') {
    const hexId = objectIdToHex(obj._id)
    if (hexId) return hexId
  }
  if (obj.id && typeof obj.id === 'object') {
    const hexId = objectIdToHex(obj.id)
    if (hexId) return hexId
  }

  // look for nested properties whose key contains 'id' (prefer these)
  for (const key of Object.keys(obj)) {
    const v = obj[key]
    if (/id$/i.test(key) && typeof v === 'string' && /^[0-9a-fA-F]{24}$/.test(v)) return v
    if (/id$/i.test(key) && typeof v === 'object') {
      // try to convert MongoDB ObjectId
      const hexId = objectIdToHex(v)
      if (hexId) return hexId
      // recurse into id-like nested object
      const nested = findUserHexId(v)
      if (nested) return nested
    }
  }

  // As last resort, search other nested objects but skip rolRef/rol keys to avoid returning role id
  for (const key of Object.keys(obj)) {
    if (/rol/i.test(key)) continue
    const v = obj[key]
    if (typeof v === 'object') {
      const nested = findUserHexId(v)
      if (nested) return nested
    }
  }

  return null
}

// Search recursively for any 24-char hex string inside an object/array
function extractHexFromAny(value) {
  if (typeof value === 'string') {
    if (/^[0-9a-fA-F]{24}$/.test(value)) return value
    return null
  }
  if (Array.isArray(value)) {
    for (const v of value) {
      const found = extractHexFromAny(v)
      if (found) return found
    }
    return null
  }
  if (value && typeof value === 'object') {
    // Try to convert MongoDB ObjectId first
    const hexId = objectIdToHex(value)
    if (hexId) return hexId
    
    for (const k of Object.keys(value)) {
      try {
        const found = extractHexFromAny(value[k])
        if (found) return found
      } catch {
        // ignore
      }
    }
  }
  return null
}

function extractHexExcludingRoles(value) {
  const found = extractHexFromAny(value)
  if (!found) return null
  if (found === ROLE_ID_ADMIN || found === ROLE_ID_EMPLOYEE) {
    // try to find another hex occurrence inside the value (scan all strings)
    if (Array.isArray(value)) {
      for (const v of value) {
        const f = extractHexExcludingRoles(v)
        if (f) return f
      }
    } else if (value && typeof value === 'object') {
      for (const k of Object.keys(value)) {
        if (/rol/i.test(k)) continue
        const f = extractHexExcludingRoles(value[k])
        if (f && f !== ROLE_ID_ADMIN && f !== ROLE_ID_EMPLOYEE) return f
      }
    }
    return null
  }
  return found
}

function mapUserToRow(u, idx) {
  // attempt to obtain stable id - mejor lógica para obtener el ID hexadecimal
  let id = null
  
  // 1. Si u._id es un string hex válido, úsalo
  if (u._id && typeof u._id === 'string' && /^[0-9a-fA-F]{24}$/.test(u._id)) {
    id = u._id
  }
  
  // 2. Si u._id es un ObjectId, conviértelo
  if (!id && u._id && typeof u._id === 'object') {
    id = objectIdToHex(u._id)
  }
  
  // 3. Si u.id es un string hex válido, úsalo
  if (!id && u.id && typeof u.id === 'string' && /^[0-9a-fA-F]{24}$/.test(u.id)) {
    id = u.id
  }
  
  // 4. Si u.id es un ObjectId, conviértelo
  if (!id && u.id && typeof u.id === 'object') {
    id = objectIdToHex(u.id)
  }
  
  // 5. Intenta extraer hex del objeto
  if (!id) {
    id = extractHexExcludingRoles(u.id) || extractHexExcludingRoles(u)
  }
  
  // 6. Como último recurso, usa correo o índice (pero estos no son válidos para backend)
  if (!id) {
    id = u.correo || String(idx)
  }
  
  return {
    id,
    nombre: u.nombre || u.name || '',
    correo: u.correo || u.email || '',
    department: u.area || u.department || '',
    onboarding: u.nivelOnboarding?.estado || u.nivelOnboarding?.etapa || 'En Progreso',
    onboardingPct: u.nivelOnboarding?.porcentaje ?? null,
    raw: u,
    uid: getResolvedId(u),
  }
}

function getResolvedId(u) {
  if (!u) return ''
  
  // 1. Si u._id es string hex válido
  if (u._id && typeof u._id === 'string' && /^[0-9a-fA-F]{24}$/.test(u._id)) {
    return u._id
  }
  
  // 2. Convierte ObjectId de u._id
  if (u._id && typeof u._id === 'object') {
    const hexId = objectIdToHex(u._id)
    if (hexId) return hexId
  }
  
  // 3. Si u.id es string hex válido
  if (u.id && typeof u.id === 'string' && /^[0-9a-fA-F]{24}$/.test(u.id)) {
    return u.id
  }
  
  // 4. Convierte ObjectId de u.id
  if (u.id && typeof u.id === 'object') {
    const hexId = objectIdToHex(u.id)
    if (hexId) return hexId
  }
  
  // 5. Intenta extraer
  const extracted = extractHexExcludingRoles(u)
  if (extracted) return extracted
  
  return ''
}

async function loadEmployees() {
  try {
    let res
    if (roleFilter.value) {
      res = await api.get(`Usuario/rol/${roleFilter.value}`)
    } else {
      // By default show only employees (exclude administrators)
      res = await api.get(`Usuario/rol/${ROLE_ID_EMPLOYEE}`)
    }
    const data = Array.isArray(res.data) ? res.data : res.data?.data || []
    rows.value = data.map((u, i) => mapUserToRow(u, i))
    pagination.value.rowsNumber = rows.value.length
  } catch (err) {
    console.error('Error cargando empleados:', err)
    $q.notify({ type: 'negative', message: 'No se pudo cargar la lista de empleados' })
  }
}

// Filtering: search by nombre or correo, filter by department/status/role
const filteredRows = computed(() => {
  const q = (search.value || '').toString().toLowerCase().trim()
  return rows.value.filter(r => {
    if (department.value && (r.department || '').toString().toLowerCase() !== (department.value || '').toString().toLowerCase()) return false
    if (statusFilter.value && (r.raw?.estado || r.raw?.status || '').toString().toLowerCase() !== (statusFilter.value || '').toString().toLowerCase()) return false
    if (roleFilter.value && (r.raw?.rolRef || r.raw?.rol || '').toString() !== roleFilter.value) return false
    if (!q) return true
    return ((r.nombre || '') + ' ' + (r.correo || '')).toLowerCase().includes(q)
  })
})

// Keep pagination rowsNumber in sync with filtered rows
watch(filteredRows, (val) => {
  pagination.value.rowsNumber = Array.isArray(val) ? val.length : 0
})

function openCreate() {
  editing.value = false
  form.value = { id: null, nombre: '', correo: '', nivelOnboardingEstado: 'En Progreso', telefono: '', rolRef: ROLE_ID_EMPLOYEE }
  // reset validation
  if (formRef.value && typeof formRef.value.resetValidation === 'function') formRef.value.resetValidation()
  dialogOpen.value = true
}

function closeDialog() {
  dialogOpen.value = false
}

function editRow(row) {
  editing.value = true
  const u = row.raw || {}
  
  // Intenta obtener el ID de múltiples fuentes
  let resolvedId = null
  
  // Primero intenta desde row.id (que es el id resuelto en mapUserToRow)
  if (row.id && typeof row.id === 'string' && /^[0-9a-fA-F]{24}$/.test(row.id)) {
    resolvedId = row.id
  }
  
  // Luego intenta desde u._id
  if (!resolvedId && u._id && typeof u._id === 'string' && /^[0-9a-fA-F]{24}$/.test(u._id)) {
    resolvedId = u._id
  }
  
  // Intenta convertir ObjectId
  if (!resolvedId && u._id && typeof u._id === 'object') {
    resolvedId = objectIdToHex(u._id)
  }
  
  // Intenta desde u.id como string
  if (!resolvedId && u.id && typeof u.id === 'string' && /^[0-9a-fA-F]{24}$/.test(u.id)) {
    resolvedId = u.id
  }
  
  // Intenta convertir u.id si es un ObjectId
  if (!resolvedId && u.id && typeof u.id === 'object') {
    resolvedId = objectIdToHex(u.id)
  }
  
  // Último recurso: busca dentro del objeto completo
  if (!resolvedId) {
    resolvedId = findUserHexId(u) || extractHexExcludingRoles(u) || null
  }
  
  // Normalize rolRef: backend expects a string id, but some responses include an object
  let resolvedRolRef = u.rolRef || ROLE_ID_EMPLOYEE
  if (resolvedRolRef && typeof resolvedRolRef === 'object') {
    resolvedRolRef = resolvedRolRef._id || resolvedRolRef.id || resolvedRolRef.value || String(resolvedRolRef)
  }
  
  form.value = {
    id: resolvedId,
    nombre: u.nombre || u.name || '',
    correo: u.correo || u.email || '',
    nivelOnboardingEstado: u.nivelOnboarding?.estado || u.nivelOnboarding?.etapa || 'En Progreso',
    telefono: u.telefono || '',
    rolRef: resolvedRolRef || ROLE_ID_EMPLOYEE,
  }
  
  console.debug('editRow: resolved id:', resolvedId, 'from row:', row)
  dialogOpen.value = true
}

// Validation rules for the form
const requiredRule = (v) => !!v || 'Campo requerido'
const emailRule = (v) => {
  if (!v) return 'Correo requerido'
  const re = /\S+@\S+\.\S+/
  return re.test(v) || 'Correo inválido'
}

watch(roleFilter, () => {
  loadEmployees()
})

async function submitForm() {
  saving.value = true
  try {
    // Prevent non-admins from creating/updating users (backend enforces roles)
    if (!auth.isAdmin) {
      $q.notify({ type: 'negative', message: 'Acción no permitida: se requiere rol Administrador' })
      return
    }
    // Validate form before submit
    if (formRef.value && typeof formRef.value.validate === 'function') {
      const ok = await formRef.value.validate()
      if (!ok) {
        $q.notify({ type: 'negative', message: 'Corrige los campos del formulario' })
        saving.value = false
        return
      }
    }

    // Ensure rolRef is a string (the backend expects a string id)
    let rolRefValue = form.value.rolRef || ROLE_ID_EMPLOYEE
    if (rolRefValue && typeof rolRefValue === 'object') {
      rolRefValue = rolRefValue._id || rolRefValue.id || rolRefValue.value || String(rolRefValue)
    }

    const payload = {
      nombre: form.value.nombre,
      correo: form.value.correo,
      password: form.value.telefono ? 'Temp1234' : 'Temp1234', // backend requires password
      telefono: form.value.telefono,
      rolRef: rolRefValue,
    }

    if (editing.value) {
      // EDITAR: actualizar usuario existente
      let idToUpdate = form.value.id
      
      console.debug('submitForm editing: idToUpdate before validation:', idToUpdate, 'type:', typeof idToUpdate)
      
      // Si el ID no es válido, intenta obtenerlo del correo
      if (!idToUpdate || !(typeof idToUpdate === 'string' && /^[0-9a-fA-F]{24}$/.test(idToUpdate))) {
        console.warn('ID no es válido, intentando resolver por correo...')
        try {
          const listRes = await api.get(`Usuario/rol/${ROLE_ID_EMPLOYEE}`)
          const users = Array.isArray(listRes.data) ? listRes.data : listRes.data?.data || []
          const found = users.find(u => ((u.correo || u.email) || '').toString().toLowerCase() === (form.value.correo || '').toString().toLowerCase())
          if (found) {
            // Intenta obtener el ID del usuario encontrado
            idToUpdate = found._id || (typeof found.id === 'string' ? found.id : null) || getResolvedId(found)
            console.debug('submitForm: found user by correo, idToUpdate:', idToUpdate)
          }
        } catch (err) {
          console.warn('Error al intentar resolver ID por correo:', err)
        }
      }
      
      // Validar que tenemos un ID válido
      if (!idToUpdate || !(typeof idToUpdate === 'string' && /^[0-9a-fA-F]{24}$/.test(idToUpdate))) {
        console.error('submitForm: No se pudo obtener el ID válido. idToUpdate:', idToUpdate, 'form:', form.value)
        $q.notify({ type: 'negative', message: 'Error: No se pudo obtener un ID válido para editar. Verifica la consola.' })
        saving.value = false
        return
      }

      console.debug('PUT Usuario/${idToUpdate}:', idToUpdate, 'payload:', payload)
      try {
        await api.put(`Usuario/${idToUpdate}`, payload)
        $q.notify({ type: 'positive', message: 'Empleado actualizado correctamente' })
      } catch (err) {
        console.error('Error al actualizar empleado:', err)
        if (err?.response) {
          const r = err.response
          const msg = r.data?.message || r.data?.title || ''
          $q.notify({ type: 'negative', message: `Error al actualizar: ${r.status} ${msg}` })
        } else {
          $q.notify({ type: 'negative', message: 'Error al actualizar empleado' })
        }
        saving.value = false
        return
      }
    } else {
      // CREAR: nuevo usuario
      console.debug('Crear empleado - payload:', payload)
      try {
        await api.post('Usuario', { ...payload, password: 'Temp1234' })
        $q.notify({ type: 'positive', message: 'Empleado creado correctamente' })
      } catch (postErr) {
        // If backend returns validation errors, show them and attempt a conservative minimal payload
        if (postErr?.response) {
          const res = postErr.response
          console.error('Response data:', res.data)
          // Try to build a friendly message from validation errors if present
          const errors = res.data?.errors
          if (errors && typeof errors === 'object') {
            const msgs = Object.entries(errors).flatMap(([, v]) => (Array.isArray(v) ? v : [v])).join(' - ')
            $q.notify({ type: 'negative', message: `Error al guardar empleado: ${res.status} ${msgs}` })
          } else {
            $q.notify({ type: 'negative', message: `Error al guardar empleado: ${res.status}` })
          }

          // Attempt a minimal payload as a fallback (some backends reject nested objects)
          const minimal = {
            nombre: form.value.nombre,
            correo: form.value.correo,
            password: 'Temp1234',
            rolRef: form.value.rolRef || ROLE_ID_EMPLOYEE,
            telefono: form.value.telefono || '',
          }
          console.debug('Intentando fallback minimal payload:', minimal)
          try {
            await api.post('Usuario', minimal)
            $q.notify({ type: 'positive', message: 'Empleado creado (fallback)' })
          } catch (fallbackErr) {
            console.error('Fallback error:', fallbackErr)
            if (fallbackErr?.response) {
              const r2 = fallbackErr.response
              const errs2 = r2.data?.errors
              const msgs2 = errs2 && typeof errs2 === 'object' ? Object.entries(errs2).flatMap(([, v]) => (Array.isArray(v) ? v : [v])).join(' - ') : r2.data?.title || ''
              $q.notify({ type: 'negative', message: `Error al guardar empleado (fallback): ${r2.status} ${msgs2}` })
            } else {
              $q.notify({ type: 'negative', message: 'Error al guardar empleado (fallback)' })
            }
            saving.value = false
            return
          }
        } else {
          // Network error or other
          console.error('Error posting empleado:', postErr)
          $q.notify({ type: 'negative', message: 'Error al guardar empleado' })
          saving.value = false
          return
        }
      }
    }

    dialogOpen.value = false
    await loadEmployees()
  } catch (err) {
    // Provide more detail to help debugging backend 400 responses
    console.error('Error guardando empleado:', err)
    if (err?.response) {
      console.error('Response data:', err.response.data)
      $q.notify({ type: 'negative', message: `Error al guardar empleado: ${err.response.status} ${err.response.data?.message || ''}` })
    } else {
      $q.notify({ type: 'negative', message: 'Error al guardar empleado' })
    }
  } finally {
    saving.value = false
  }
}

function deleteRow(row) {
  // Prevent non-admins from deleting users
  if (!auth.isAdmin) {
    $q.notify({ type: 'negative', message: 'Acción no permitida: se requiere rol Administrador' })
    return
  }

  rowToDelete.value = row
  confirmDeleteOpen.value = true
}

async function performDelete() {
  const row = rowToDelete.value
  if (!row) return
  
  // Require user to provide ID manually
  const userProvidedId = overrideDeleteId.value && overrideDeleteId.value.toString().trim()
  
  if (!userProvidedId || !/^[0-9a-fA-F]{24}$/.test(userProvidedId)) {
    $q.notify({ type: 'negative', message: 'Debes ingresar un ID válido de 24 caracteres hexadecimales' })
    return
  }
  
  confirmDeleteOpen.value = false
  
  try {
    console.debug('performDelete: using user-provided id:', userProvidedId)
    await api.delete(`Usuario/${userProvidedId}`)
    $q.notify({ type: 'positive', message: 'Empleado eliminado correctamente' })
    overrideDeleteId.value = ''
    rowToDelete.value = null
    await loadEmployees()
  } catch (err) {
    console.error('Error eliminando empleado:', err)
    // Show more detailed error message if available
    if (err?.response) {
      const r = err.response
      const msg = r.data?.message || r.data?.title || JSON.stringify(r.data) || ''
      $q.notify({ type: 'negative', message: `No se pudo eliminar: ${r.status} ${msg}` })
    } else {
      $q.notify({ type: 'negative', message: 'No se pudo eliminar' })
    }
    rowToDelete.value = null
  }
}

onMounted(() => {
  loadEmployees()
})
</script>

<style scoped>
.rounded-borders { border-radius: 10px; }
</style>
