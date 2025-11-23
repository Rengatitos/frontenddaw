<template>
  <q-layout view="lHh Lpr lff" class="bg-grey-1">
    <q-drawer v-model="drawerOpen" show-if-above :width="280" class="bg-black text-white">
      <div class="column full-height no-wrap">
        <div class="q-pa-md q-mb-md">
          <div class="text-h4 text-weight-bold">TCS</div>
          <div class="text-caption text-grey-5">Panel de RRHH</div>
        </div>

        <q-list padding>
          <q-item
            clickable
            v-ripple
            active-class="text-white bg-grey-9"
            :active="activeItem === 'Dashboard'"
            @click="activeItem = 'Dashboard'"
          >
            <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar><q-icon name="people_outline" /></q-item-section>
            <q-item-section>Interacciones</q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar><q-icon name="chat" /></q-item-section>
            <q-item-section>Conversaciones Chatbot</q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar><q-icon name="schedule_send" /></q-item-section>
            <q-item-section>Mensajes programados</q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar><q-icon name="badge" /></q-item-section>
            <q-item-section>Empleados</q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar><q-icon name="settings" /></q-item-section>
            <q-item-section>Configuración</q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar><q-icon name="bar_chart" /></q-item-section>
            <q-item-section>Análisis</q-item-section>
          </q-item>
        </q-list>

        <q-space />

        <div class="q-pa-md">
          <q-item class="q-mb-sm">
            <q-item-section avatar>
              <q-avatar size="40px">
                <img src="https://cdn.quasar.dev/img/boy-avatar.png" alt="Admin" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ adminName }}</q-item-label>
              <q-item-label caption class="text-grey-5">{{ adminEmail }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-btn
            outline
            color="grey-5"
            icon="logout"
            label="Cerrar sesión"
            class="full-width"
            no-caps
            @click="handleLogout"
          />
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <q-page class="q-pa-lg">
        <div class="q-mb-lg">
          <div class="text-h5 text-grey-9 text-weight-bold">Dashboard de RRHH</div>
          <div class="text-subtitle1 text-grey-7">Gestiona el onboarding de tus empleados</div>
        </div>

        <div class="row q-col-gutter-md q-mb-xl">
          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="q-pa-sm">
              <q-card-section>
                <div class="row items-center justify-between no-wrap">
                  <q-icon
                    name="groups"
                    size="32px"
                    class="bg-indigo-1 text-indigo rounded-borders q-pa-xs"
                  />
                  <span class="text-green-6 text-weight-bold text-caption">+12%</span>
                </div>
                <div class="q-mt-md text-grey-7 text-caption">Empleados Activos</div>
                <div class="text-h4 text-weight-bold">142</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="q-pa-sm">
              <q-card-section>
                <div class="row items-center justify-between no-wrap">
                  <q-icon
                    name="chat_bubble_outline"
                    size="32px"
                    class="bg-green-1 text-green rounded-borders q-pa-xs"
                  />
                  <span class="text-green-6 text-weight-bold text-caption">+8%</span>
                </div>
                <div class="q-mt-md text-grey-7 text-caption">Interacciones Hoy</div>
                <div class="text-h4 text-weight-bold">387</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="q-pa-sm">
              <q-card-section>
                <div class="row items-center justify-between no-wrap">
                  <q-icon
                    name="check_circle_outline"
                    size="32px"
                    class="bg-purple-1 text-purple rounded-borders q-pa-xs"
                  />
                  <span class="text-green-6 text-weight-bold text-caption">+5%</span>
                </div>
                <div class="q-mt-md text-grey-7 text-caption">Onboarding Completado</div>
                <div class="text-h4 text-weight-bold">89%</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="q-pa-sm">
              <q-card-section>
                <div class="row items-center justify-between no-wrap">
                  <q-icon
                    name="trending_up"
                    size="32px"
                    class="bg-orange-1 text-orange rounded-borders q-pa-xs"
                  />
                  <span class="text-green-6 text-weight-bold text-caption">-2 días</span>
                </div>
                <div class="q-mt-md text-grey-7 text-caption">Tiempo Promedio</div>
                <div class="text-h4 text-weight-bold">12 días</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="row items-center justify-between q-mb-md">
          <q-input
            dense
            outlined
            v-model="filter"
            placeholder="Buscar empleado..."
            class="bg-white"
            style="width: 300px"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-btn color="indigo" icon="add" label="Nuevo mensaje proactivo" no-caps />
        </div>

        <q-card flat bordered>
          <q-table
            flat
            :rows="employees"
            :columns="columns"
            row-key="id"
            :filter="filter"
            hide-pagination
            class="text-grey-8"
          >
            <template v-slot:body-cell-name="props">
              <q-td :props="props">
                <div class="row items-center">
                  <q-avatar size="32px" class="q-mr-sm">
                    <img :src="`https://i.pravatar.cc/150?u=${props.row.id}`" />
                  </q-avatar>
                  <span class="text-weight-medium">{{ props.row.name }}</span>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-onboardingStatus="props">
              <q-td :props="props">
                <q-badge
                  outline
                  class="q-pa-xs"
                  :color="getStatusColor(props.row.onboardingStatus).color"
                  :label="props.row.onboardingStatus"
                  :class="getStatusColor(props.row.onboardingStatus).textClass"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-progress="props">
              <q-td :props="props" style="min-width: 150px">
                <div class="row items-center no-wrap">
                  <q-linear-progress
                    :value="props.row.progress / 100"
                    class="q-mr-sm"
                    rounded
                    size="6px"
                    color="indigo"
                    track-color="grey-3"
                  />
                  <span class="text-caption text-grey-7">{{ props.row.progress }}%</span>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props" class="text-right">
                <q-btn flat round dense icon="more_vert" color="grey-7" />
              </q-td>
            </template>
          </q-table>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, onMounted } from 'vue' // Importamos onMounted
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

export default {
  name: 'AdminDashboardPage',
  setup() {
    const router = useRouter()
    const $q = useQuasar()

    const drawerOpen = ref(true)
    const filter = ref('')
    const activeItem = ref('Dashboard')

    // VARIABLES REACTIVAS PARA EL ADMIN
    const adminName = ref('Admin RRHH')
    const adminEmail = ref('admin@tcs.com')

    // LÓGICA AL CARGAR LA PÁGINA
    onMounted(() => {
      // Recuperamos el objeto 'user' que guardamos en el Login
      const userStorage = localStorage.getItem('user')

      if (userStorage) {
        try {
          const user = JSON.parse(userStorage)

          // Asignamos nombre y correo si existen
          if (user.nombre) adminName.value = user.nombre
          if (user.correo) adminEmail.value = user.correo
        } catch (error) {
          console.error('Error al leer datos del admin:', error)
        }
      }
    })

    // FUNCIÓN PARA CERRAR SESIÓN ACTUALIZADA
    const handleLogout = () => {
      // 1. Limpiar datos (Coherente con lo que guardamos en Login)
      localStorage.removeItem('token')
      localStorage.removeItem('user') // Borramos el objeto user completo

      // 2. Notificación
      $q.notify({
        color: 'blue-grey-6',
        textColor: 'white',
        icon: 'logout',
        message: 'Sesión cerrada correctamente',
        position: 'top',
        timeout: 1000,
      })

      // 3. Redirección
      router.push('/login')
    }

    const columns = [
      { name: 'name', align: 'left', label: 'Empleado', field: 'name', sortable: true },
      {
        name: 'lastInteraction',
        align: 'left',
        label: 'Última interacción',
        field: 'lastInteraction',
        sortable: true,
      },
      {
        name: 'onboardingStatus',
        align: 'left',
        label: 'Estado del onboarding',
        field: 'onboardingStatus',
        sortable: true,
      },
      { name: 'progress', align: 'left', label: 'Progreso', field: 'progress', sortable: true },
      {
        name: 'messagesSent',
        align: 'center',
        label: 'Mensajes enviados',
        field: 'messagesSent',
        sortable: true,
      },
      { name: 'actions', align: 'right', label: 'Acciones' },
    ]

    const employees = [
      {
        id: 1,
        name: 'Carlos Rodríguez',
        lastInteraction: 'Hace 2 horas',
        onboardingStatus: 'En progreso',
        progress: 65,
        messagesSent: 24,
      },
      {
        id: 2,
        name: 'Ana Martínez',
        lastInteraction: 'Hace 1 día',
        onboardingStatus: 'Completado',
        progress: 100,
        messagesSent: 38,
      },
      {
        id: 3,
        name: 'Luis Fernández',
        lastInteraction: 'Hace 3 horas',
        onboardingStatus: 'En progreso',
        progress: 45,
        messagesSent: 15,
      },
      {
        id: 4,
        name: 'Elena García',
        lastInteraction: 'Hace 5 días',
        onboardingStatus: 'Pendiente',
        progress: 20,
        messagesSent: 8,
      },
      {
        id: 5,
        name: 'Miguel Torres',
        lastInteraction: 'Hace 1 hora',
        onboardingStatus: 'En progreso',
        progress: 80,
        messagesSent: 31,
      },
    ]

    const getStatusColor = (status) => {
      switch (status) {
        case 'Completado':
          return { color: 'green', textClass: 'text-green-9 bg-green-1' }
        case 'En progreso':
          return { color: 'indigo', textClass: 'text-indigo-9 bg-indigo-1' }
        case 'Pendiente':
          return { color: 'orange', textClass: 'text-orange-9 bg-orange-1' }
        default:
          return { color: 'grey', textClass: 'text-grey-9 bg-grey-2' }
      }
    }

    return {
      drawerOpen,
      filter,
      activeItem,
      columns,
      employees,
      getStatusColor,
      handleLogout,
      adminName, // Retornamos variables
      adminEmail,
    }
  },
}
</script>

<style scoped>
.q-table__card {
  box-shadow: none;
}
</style>
