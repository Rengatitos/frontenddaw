<template>
  <q-layout view="lHh Lpr lFf" style="--admin-primary: #30b0c4">
    <!-- QHeader -->
    <q-header elevated class="bg-white q-px-md">
      <div class="row items-center justify-between q-gutter-sm" style="height:64px">
        <div class="text-h6" :style="{ color: '#0b3d91' }">Administración RRHH</div>
        <div class="row items-center">
          <!-- Clickable avatar opens profile dialog -->
          <q-avatar
            square
            size="40px"
            class="q-mr-sm"
            :style="{ background: '#0b3d91', color: 'white', cursor: 'pointer' }"
            v-ripple
            @click="profileOpen = true"
          >
            <q-icon name="person" />
          </q-avatar>
          <div class="text-caption q-mr-md">{{ displayName }}</div>
          <q-btn flat round dense icon="logout" label="Cerrar sesión" @click="handleLogout" :style="{ color: '#0b3d91' }" />
        </div>
      </div>
    </q-header>

    <!-- QDrawer (persistent) -->
    <!-- NOTE: Este Layout debe estar protegido por un route guard de administrador -->
    <q-drawer
      show-if-above
      bordered
      v-model="open"
      side="left"
      :width="280"
      content-class="admin-drawer"
    >
      <div class="q-pa-md">
        <div class="text-subtitle2 q-mb-md" :style="{ color: '#0b3d91' }">Panel Administrador</div>
        <q-list>
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
    <!-- Profile Dialog -->
    <q-dialog v-model="profileOpen">
      <q-card style="min-width: 380px; max-width: 480px;">
        <q-card-section class="row items-center q-gutter-sm" style="background:#0b3d91; color: white; border-top-left-radius:6px; border-top-right-radius:6px;">
          <q-avatar size="56px" style="background: #0b3d91; color: white; border: 2px solid rgba(255,255,255,0.08);">
            <div style="font-weight:600">{{ initials }}</div>
          </q-avatar>
          <div class="column q-ml-md">
            <div style="font-weight:700">{{ profileName }}</div>
            <div class="text-caption">Administrador</div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="q-mb-sm"><strong>Correo</strong></div>
          <div class="text-subtitle2 q-mb-md">{{ profileEmail || '-' }}</div>

          <div class="q-mb-sm"><strong>Teléfono</strong></div>
          <div class="text-subtitle2">{{ profilePhone || '-' }}</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup @click="profileOpen = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const open = ref(true)
const auth = useAuthStore()
const router = useRouter()
const $q = useQuasar()

const displayName = computed(() => auth.user?.name || auth.user?.nombre || auth.user?.email || 'Usuario')

function handleLogout() {
  // Clear auth and redirect using router for proper SPA navigation
  try {
    auth.logout()
    $q.notify({ type: 'positive', message: 'Sesión cerrada. Redirigiendo al login.' })
    router.push({ path: '/login' })
  } catch (e) {
    console.error('Logout error:', e)
    $q.notify({ type: 'negative', message: 'Error cerrando sesión' })
    // fallback to hash change if router push fails
    window.location.href = '#/login'
  }
}

// Profile dialog state and computed fields
const profileOpen = ref(false)
const profileName = computed(() => auth.user?.nombre || auth.user?.name || auth.user?.email || '')
const profileEmail = computed(() => auth.user?.correo || auth.user?.email || '')
const profilePhone = computed(() => auth.user?.telefono || auth.user?.phone || '')
const initials = computed(() => {
  const n = profileName.value || profileEmail.value || ''
  const parts = n.toString().trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return ''
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
})
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
</style>
