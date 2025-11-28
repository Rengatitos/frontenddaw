<template>
  <q-layout view="lHh Lpr lFf" style="--admin-primary: #30b0c4">
    <q-header elevated class="bg-white q-px-md">
      <div class="row items-center justify-between q-gutter-sm" style="height: 64px">
        <div class="text-h6" :style="{ color: 'var(--admin-primary)' }">Administración RRHH</div>
        <div class="row items-center">
          <q-avatar
            square
            size="36px"
            class="q-mr-sm"
            :style="{ background: 'var(--admin-primary)', color: 'white' }"
          >
            <q-icon name="person" />
          </q-avatar>
          <div class="text-caption q-mr-md">{{ displayName }}</div>
          <q-btn flat round dense icon="logout" label="Cerrar sesión" @click="handleLogout" />
        </div>
      </div>
    </q-header>

    <q-drawer
      show-if-above
      bordered
      v-model="open"
      side="left"
      width="280"
      content-class="admin-drawer"
    >
      <div class="q-pa-md">
        <div class="text-subtitle2 q-mb-md" :style="{ color: 'var(--admin-primary)' }">
          Panel Admin
        </div>
        <q-list>
          <q-item clickable v-ripple to="/admin/dashboard">
            <q-item-section avatar>
              <div class="menu-avatar"><q-icon name="dashboard" /></div>
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="modalUsuarios = true">
            <q-item-section avatar>
              <div class="menu-avatar"><q-icon name="manage_accounts" /></div>
            </q-item-section>
            <q-item-section>Administrar Usuarios</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/admin/interactions">
            <q-item-section avatar>
              <div class="menu-avatar"><q-icon name="history" /></div>
            </q-item-section>
            <q-item-section>Interacciones</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/admin/conversations">
            <q-item-section avatar>
              <div class="menu-avatar"><q-icon name="chat" /></div>
            </q-item-section>
            <q-item-section>Conversaciones</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/admin/scheduled">
            <q-item-section avatar>
              <div class="menu-avatar"><q-icon name="schedule" /></div>
            </q-item-section>
            <q-item-section>Mensajes Programados</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/admin/employees">
            <q-item-section avatar>
              <div class="menu-avatar"><q-icon name="people" /></div>
            </q-item-section>
            <q-item-section>Empleados</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/admin/settings">
            <q-item-section avatar>
              <div class="menu-avatar"><q-icon name="settings" /></div>
            </q-item-section>
            <q-item-section>Configuración</q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-drawer>

    <q-page-container class="bg-grey-2">
      <router-view />
    </q-page-container>

    <q-dialog v-model="modalUsuarios">
      <q-card style="width: 700px; max-width: 90vw">
        <q-card-section
          class="row items-center q-pb-none"
          :style="{ color: 'var(--admin-primary)' }"
        >
          <div class="text-h6">Gestión de Usuarios</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup text-color="grey" />
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-sm q-mb-md items-center">
            <div class="col-12 col-sm-5">
              <q-input outlined dense v-model="nuevoUsuario.nombre" label="Nombre" />
            </div>
            <div class="col-12 col-sm-5">
              <q-input outlined dense v-model="nuevoUsuario.email" label="Correo" type="email" />
            </div>
            <div class="col-12 col-sm-2">
              <q-btn
                label="Agregar"
                icon="add"
                class="full-width"
                unelevated
                dense
                padding="8px"
                style="background-color: #30b0c4; color: white"
                @click="agregarUsuario"
                :disable="!nuevoUsuario.nombre || !nuevoUsuario.email"
              />
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="text-subtitle2 q-mb-sm text-grey-8">Usuarios Registrados</div>
          <q-list bordered separator class="rounded-borders">
            <q-item v-for="(user, index) in listaUsuarios" :key="index">
              <q-item-section avatar>
                <q-avatar size="sm" style="background-color: #30b0c4; color: white">
                  {{ user.nombre.charAt(0).toUpperCase() }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ user.nombre }}</q-item-label>
                <q-item-label caption>{{ user.email }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click="eliminarUsuario(index)"
                />
              </q-item-section>
            </q-item>

            <q-item v-if="listaUsuarios.length === 0">
              <q-item-section class="text-center text-grey"
                >No hay usuarios registrados.</q-item-section
              >
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'

// --- SETUP GENERAL ---
const open = ref(true)
const auth = useAuthStore()
const $q = useQuasar()

const displayName = computed(() => auth.user?.name || auth.user?.email || 'Usuario')

function handleLogout() {
  auth.logout()
  window.location.href = '#/login'
}

// --- LÓGICA DE USUARIOS ---
const modalUsuarios = ref(false)

// Lista simulada inicial
const listaUsuarios = ref([
  { nombre: 'Admin Principal', email: 'admin@rrhh.com' },
  { nombre: 'Operador 1', email: 'operador@rrhh.com' },
])

// Objeto reactivo para el formulario
const nuevoUsuario = reactive({ nombre: '', email: '' })

// Función Agregar
function agregarUsuario() {
  if (nuevoUsuario.nombre && nuevoUsuario.email) {
    listaUsuarios.value.push({ ...nuevoUsuario })

    // Resetear campos
    nuevoUsuario.nombre = ''
    nuevoUsuario.email = ''

    $q.notify({ type: 'positive', message: 'Usuario agregado exitosamente' })
  }
}

// Función Eliminar corregida (sin depender del plugin Dialog)
function eliminarUsuario(index) {
  // Usamos confirm() nativo de Javascript para asegurar que funcione
  if (confirm('¿Estás seguro de que deseas eliminar a este usuario?')) {
    listaUsuarios.value.splice(index, 1)

    $q.notify({
      type: 'negative',
      message: 'Usuario eliminado',
      position: 'top',
    })
  }
}
</script>

<style scoped>
.q-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.admin-drawer {
  background: #ffffff;
}
.menu-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--admin-primary);
  color: #fff;
}
.rounded-borders {
  border-radius: 8px;
}
</style>
