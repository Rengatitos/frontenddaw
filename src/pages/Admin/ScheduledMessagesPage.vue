<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-lg">
      <h1 class="text-h4 text-weight-bold">Mensajes Programados</h1>
      <q-btn
        label="Programar Nuevo Mensaje"
        color="primary"
        icon="add"
        unelevated
        @click="openNewMessageDialog"
      />
    </div>

    <!-- Tabla de mensajes -->
    <q-table
      :rows="messages"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :loading="loadingMessages"
    >
      <template #body-cell-status="props">
        <q-td :props="props">
          <q-chip
            :label="props.row.status"
            :color="statusColor(props.row.status)"
            text-color="white"
            size="sm"
          />
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props" class="text-center">
          <q-btn
            flat
            dense
            round
            icon="edit"
            color="primary"
            size="sm"
            @click="editMessage(props.row)"
          >
            <q-tooltip>Editar mensaje</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="delete"
            color="negative"
            size="sm"
            @click="confirmDeleteMessage(props.row)"
          >
            <q-tooltip>Eliminar mensaje</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Diálogo para crear/editar -->
    <q-dialog v-model="showFormDialog" @hide="resetForm">
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ formMode === 'create' ? 'Programar Nuevo Mensaje' : 'Editar Mensaje' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showFormDialog = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-none">
          <!-- Nombre del Mensaje -->
          <div class="q-mb-md">
            <label class="text-subtitle2 text-weight-bold">Nombre del Mensaje *</label>
            <q-input
              v-model="form.nombre"
              outlined
              dense
              placeholder="ej: Bienvenida Onboarding"
              :rules="[val => !!val || 'El nombre es obligatorio']"
            />
          </div>

          <!-- Contenido -->
          <div class="q-mb-md">
            <label class="text-subtitle2 text-weight-bold">Contenido del Mensaje *</label>
            <q-input
              v-model="form.contenido"
              outlined
              dense
              type="textarea"
              rows="5"
              placeholder="Escribe el contenido del mensaje..."
              :rules="[val => !!val || 'El contenido es obligatorio']"
            />
          </div>

          <!-- Tipo de Notificación -->
          <div class="q-mb-md">
            <label class="text-subtitle2 text-weight-bold">Tipo de Notificación</label>
            <q-select
              v-model="form.tipo"
              outlined
              dense
              :options="['Notificación', 'Curso', 'Urgente', 'Recordatorio', 'Otro']"
              emit-value
              map-options
            />
          </div>

          <!-- Estado -->
          <div class="q-mb-md">
            <label class="text-subtitle2 text-weight-bold">Estado</label>
            <q-select
              v-model="form.estado"
              outlined
              dense
              :options="['Pendiente', 'En Proceso', 'Completado']"
              emit-value
              map-options
            />
          </div>

          <!-- Fecha y Hora de Envío -->
          <div class="q-mb-md">
            <label class="text-subtitle2 text-weight-bold">Fecha y Hora de Envío *</label>
            <q-input
              v-model="form.fechaEnvio"
              outlined
              dense
              type="datetime-local"
              :min="todayDateTime"
              :rules="[val => !!val || 'La fecha es obligatoria', val => isValidDateTime(val) || 'La fecha no puede ser anterior a hoy']"
            />
            <small class="text-grey">Formato: YYYY-MM-DD HH:mm</small>
          </div>

          <!-- Seleccionar Empleados (muestra los disponibles) -->
          <div class="q-mb-md">
            <label class="text-subtitle2 text-weight-bold">Empleados que recibirán el mensaje</label>
            <div v-if="employeeList.length > 0" class="q-mt-sm">
              <q-chip
                v-for="emp in employeeList"
                :key="emp.id || emp.nombre"
                color="blue-2"
                text-color="primary"
              >
                {{ emp.nombre }} ({{ emp.correo }})
              </q-chip>
            </div>
            <div v-else class="text-grey text-italic">
              No hay empleados disponibles en este rol.
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn label="Cancelar" color="negative" flat @click="showFormDialog = false" />
          <q-btn
            :label="formMode === 'create' ? 'Programar' : 'Actualizar'"
            color="primary"
            unelevated
            :loading="savingMessage"
            @click="saveMessage"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

export default {
  name: 'ScheduledMessagesPage',
  setup() {
    const $q = useQuasar()
    return { $q }
  },
  data() {
    return {
      messages: [],
      employeeList: [],
      loadingMessages: false,
      savingMessage: false,
      showFormDialog: false,
      formMode: 'create', // 'create' or 'edit'
      form: {
        id: null,
        nombre: '',
        contenido: '',
        tipo: 'Notificación',
        fechaEnvio: '',
        estado: 'Pendiente',
        usuarioRef: null,
      },
      columns: [
        { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
        { name: 'contenido', label: 'Contenido', field: 'contenido', align: 'left' },
        { name: 'fechaEnvio', label: 'Fecha y Hora', field: 'fechaEnvio', align: 'left' },
        { name: 'status', label: 'Estado', field: 'estado', align: 'center' },
        { name: 'actions', label: 'Acciones', align: 'center' },
      ],
      // Rol ID para obtener empleados (ajusta según tu backend)
      rolRef: '69226322dc71d9cf2a963c58',
    }
  },
  computed: {
    todayDateTime() {
      const now = new Date()
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
      return now.toISOString().slice(0, 16)
    },
  },
  methods: {
    async loadMessages() {
      this.loadingMessages = true
      try {
        // Cargar actividades de la tabla Actividad como mensajes programados
        const res = await api.get('Actividad')
        this.messages = (res.data || []).map(act => ({
          id: act.id,
          nombre: act.titulo,
          contenido: act.descripcion,
          tipo: act.tipo,
          fechaEnvio: new Date(act.fechaFin).toISOString().slice(0, 16), // Convertir a datetime-local
          estado: act.estado,
          usuarioRef: act.usuarioRef,
        }))
      } catch {
        this.$q.notify({
          type: 'negative',
          message: 'Error al cargar mensajes programados',
          position: 'top',
        })
        this.messages = []
      } finally {
        this.loadingMessages = false
      }
    },

    async loadEmployees() {
      try {
        // Obtener empleados del rol especificado
        const res = await api.get(`Usuario/rol/${this.rolRef}`)
        // Mapear los empleados asegurando que tengan id, nombre y correo
        this.employeeList = (res.data || []).map(emp => {
          // El id puede ser un string o un objeto con partes (timestamp, machine, pid, increment)
          let empId = emp.id || emp._id || null

          if (empId && typeof empId === 'object') {
            // Convertir componentes a hex (24 caracteres) según estructura: timestamp(4 bytes) + machine(3) + pid(2) + increment(3)
            const t = Number(empId.timestamp) || 0
            const m = Number(empId.machine) || 0
            const p = Number(empId.pid) || 0
            const inc = Number(empId.increment) || 0

            const hex = (n, width) => n.toString(16).padStart(width, '0')
            const hexId = hex(t, 8) + hex(m, 6) + hex(p, 4) + hex(inc, 6)
            // validate length
            if (/^[a-fA-F0-9]{24}$/.test(hexId)) {
              empId = hexId
            } else {
              // fallback: try emp._id if exists, else stringify
              empId = emp._id || JSON.stringify(empId)
            }
          }

          return {
            id: empId,
            nombre: emp.nombre,
            correo: emp.correo,
          }
        })
        console.log('Empleados cargados:', this.employeeList)
      } catch {
        this.$q.notify({
          type: 'warning',
          message: 'No se pudieron cargar los empleados',
          position: 'top',
        })
        this.employeeList = []
      }
    },

    statusColor(status) {
      const colors = {
        'Pendiente': 'orange',
        'En Proceso': 'blue',
        'Completado': 'green',
        'Fallido': 'red',
        'Programado': 'cyan',
        'Enviado': 'green',
      }
      return colors[status] || 'grey'
    },

    isValidDateTime(dateTime) {
      if (!dateTime) return false
      const selected = new Date(dateTime)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selected >= today
    },

    openNewMessageDialog() {
      this.formMode = 'create'
      this.resetForm()
      this.showFormDialog = true
    },

    editMessage(row) {
      this.formMode = 'edit'
      this.form = { ...row }
      this.showFormDialog = true
    },

    confirmDeleteMessage(row) {
      this.$q.dialog({
        title: 'Eliminar Mensaje',
        message: '¿Está seguro que desea eliminar este mensaje programado?',
        cancel: 'Cancelar',
        ok: 'Eliminar',
        color: 'negative',
      }).onOk(async () => {
        await this.deleteMessage(row)
      })
    },

    async deleteMessage(row) {
      try {
        // DELETE /api/Actividad/{id}
        await api.delete(`Actividad/${row.id}`)
        
        // Eliminar del array local
        const idx = this.messages.findIndex(m => m.id === row.id)
        if (idx > -1) {
          this.messages.splice(idx, 1)
        }

        this.$q.notify({
          type: 'positive',
          message: 'Mensaje eliminado correctamente',
          position: 'top',
        })
      } catch {
        this.$q.notify({
          type: 'negative',
          message: 'Error al eliminar el mensaje',
          position: 'top',
        })
      }
    },

    async saveMessage() {
      // Validaciones
      if (!this.form.nombre || !this.form.nombre.trim()) {
        this.$q.notify({
          type: 'warning',
          message: 'El nombre del mensaje es obligatorio',
          position: 'top',
        })
        return
      }

      if (!this.form.contenido || !this.form.contenido.trim()) {
        this.$q.notify({
          type: 'warning',
          message: 'El contenido del mensaje es obligatorio',
          position: 'top',
        })
        return
      }

      if (!this.form.fechaEnvio) {
        this.$q.notify({
          type: 'warning',
          message: 'La fecha y hora de envío es obligatoria',
          position: 'top',
        })
        return
      }

      if (!this.isValidDateTime(this.form.fechaEnvio)) {
        this.$q.notify({
          type: 'warning',
          message: 'La fecha de envío no puede ser anterior a hoy',
          position: 'top',
        })
        return
      }

      this.savingMessage = true
      try {
        // Validar que haya un usuarioRef válido (usar el primer empleado si está disponible)
        let usuarioRef = this.form.usuarioRef
        if (!usuarioRef && this.employeeList.length > 0) {
          usuarioRef = this.employeeList[0].id
        }
        
        // Asegurar que usuarioRef sea string y válido
        if (!usuarioRef || typeof usuarioRef !== 'string' || usuarioRef.trim() === '') {
          this.$q.notify({
            type: 'warning',
            message: 'No hay un usuario válido seleccionado para enviar el mensaje',
            position: 'top',
          })
          this.savingMessage = false
          return
        }

        // Convertir fecha del formato datetime-local (YYYY-MM-DDTHH:mm) a ISO string
        const dateObj = new Date(this.form.fechaEnvio + ':00Z')
        const isoDate = dateObj.toISOString()

        const payload = {
          titulo: this.form.nombre.trim(),
          descripcion: this.form.contenido.trim(),
          tipo: (this.form.tipo || 'Notificación').trim(),
          fechaInicio: isoDate,
          fechaFin: isoDate,
          estado: this.form.estado.trim(),
          usuarioRef: usuarioRef.trim(),
        }

        console.log('usuarioRef que se usa:', usuarioRef)
        console.log('Payload que se envía:', payload)

        if (this.formMode === 'create') {
          // POST /api/Actividad
          const res = await api.post('Actividad', payload)
          
          // Agregar a la lista local
          this.messages.push({
            id: res.data.id || res.data.insertedId,
            nombre: this.form.nombre,
            contenido: this.form.contenido,
            tipo: this.form.tipo || 'Notificación',
            fechaEnvio: this.form.fechaEnvio,
            estado: this.form.estado,
            usuarioRef: usuarioRef,
          })

          this.$q.notify({
            type: 'positive',
            message: 'Mensaje programado exitosamente',
            position: 'top',
          })
        } else {
          // PUT /api/Actividad/{id}
          await api.put(`Actividad/${this.form.id}`, payload)

          // Actualizar en la lista local
          const idx = this.messages.findIndex(m => m.id === this.form.id)
          if (idx > -1) {
            this.messages[idx] = {
              ...this.messages[idx],
              nombre: this.form.nombre,
              contenido: this.form.contenido,
              tipo: this.form.tipo || 'Notificación',
              fechaEnvio: this.form.fechaEnvio,
              estado: this.form.estado,
            }
          }

          this.$q.notify({
            type: 'positive',
            message: 'Mensaje actualizado exitosamente',
            position: 'top',
          })
        }

        this.showFormDialog = false
      } catch (error) {
        console.error('Error al guardar mensaje:', error.response?.data)
        console.error('Errores de validación:', error.response?.data?.errors)
        this.$q.notify({
          type: 'negative',
          message: `Error: ${error.response?.data?.mensaje || error.message}`,
          position: 'top',
        })
      } finally {
        this.savingMessage = false
      }
    },

    resetForm() {
      this.form = {
        id: null,
        nombre: '',
        contenido: '',
        tipo: 'Notificación',
        fechaEnvio: '',
        estado: 'Pendiente',
        usuarioRef: null,
      }
    },
  },

  mounted() {
    this.loadMessages()
    this.loadEmployees()
  },
}
</script>

<style scoped>
.text-weight-bold {
  font-weight: 600;
}
</style>
