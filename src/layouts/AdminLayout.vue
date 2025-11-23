<template>
  <q-layout view="lHh Lpr lFf" style="--admin-primary: #30B0C4">
    <!-- QHeader -->
    <q-header elevated class="bg-white q-px-md">
      <div class="row items-center justify-between q-gutter-sm" style="height:64px">
        <div class="text-h6" :style="{ color: 'var(--admin-primary)' }">Administración RRHH</div>
        <div class="row items-center">
          <q-avatar square size="36px" class="q-mr-sm" :style="{ background: 'var(--admin-primary)', color: 'white' }">
            <q-icon name="person" />
          </q-avatar>
          <div class="text-caption q-mr-md">{{ displayName }}</div>
          <q-btn flat round dense icon="logout" label="Cerrar sesión" @click="handleLogout" />
        </div>
      </div>
    </q-header>

    <!-- QDrawer (persistent) -->
    <!-- NOTE: Este Layout debe estar protegido por un route guard de administrador -->
    <q-drawer show-if-above bordered v-model="open" side="left" width="280" content-class="admin-drawer">
      <div class="q-pa-md">
        <div class="text-subtitle2 q-mb-md" :style="{ color: 'var(--admin-primary)' }">Panel Admin</div>
        <q-list>
          <q-item clickable v-ripple to="/admin/dashboard">
            <q-item-section avatar>
              <div class="menu-avatar"><q-icon name="dashboard" /></div>
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
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
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from 'src/stores/auth'

const open = ref(true)
const auth = useAuthStore()

const displayName = computed(() => auth.user?.name || auth.user?.email || 'Usuario')

function handleLogout() {
  auth.logout()
  // redirect to login
  window.location.href = '#/login'
}
</script>

<style scoped>
.q-header { border-bottom: 1px solid rgba(0,0,0,0.05); }
.admin-drawer { background: #ffffff; }
.menu-avatar { width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; background: var(--admin-primary); color: #fff }

</style>
