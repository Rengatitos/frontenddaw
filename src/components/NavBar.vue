<template>
  <q-header elevated class="bg-white text-dark shadow-2">
    <q-toolbar class="q-px-md" style="height: 64px">
      <!-- Logo con link al dashboard -->
      <router-link
        to="/dashboard"
        class="row items-center q-gutter-sm"
        style="text-decoration: none"
      >
        <q-avatar square size="42px" class="bg-primary text-white">T</q-avatar>
        <div class="text-weight-bold text-dark">TCS Onboarding</div>
      </router-link>

      <div v-if="!hideMenu" class="q-ml-md">
        <q-btn flat dense label="Agente IA" to="/agente-ia" class="nav-btn" />
        <q-btn flat dense label="Chatbot Onboarding" to="/onboarding-chat" class="nav-btn" />
        <q-btn flat dense label="Próximos Pasos" to="/next-steps" class="nav-btn" />
        <q-btn flat dense label="Enlaces Útiles" to="/useful-links" class="nav-btn" />
      </div>

      <q-space />

      <!-- 🔔 Botón de Notificaciones -->
      <q-btn flat dense round icon="notifications" @click="store.togglePanel()">
        <q-badge v-if="store.totalPendientes > 0" color="red" floating>
          {{ store.totalPendientes }}
        </q-badge>
      </q-btn>

      <!-- Avatar del usuario con menú dropdown -->
      <q-btn flat dense round class="q-ml-sm">
        <q-avatar class="bg-primary text-white text-weight-bold">{{ userInitials }}</q-avatar>
        <q-menu anchor="bottom right" self="top right">
          <q-list style="min-width: 220px">
            <q-item-label header class="text-weight-bold">{{ userName }}</q-item-label>
            <q-item v-ripple clickable to="/dashboard">
              <q-item-section avatar>
                <q-icon name="dashboard" />
              </q-item-section>
              <q-item-section>Mi Dashboard</q-item-section>
            </q-item>
            <q-separator />
            <q-item v-ripple clickable @click="openSettings">
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>
              <q-item-section>Configuración</q-item-section>
            </q-item>
            <q-item v-ripple clickable @click="openHelp">
              <q-item-section avatar>
                <q-icon name="help" />
              </q-item-section>
              <q-item-section>Ayuda</q-item-section>
            </q-item>
            <q-separator />
            <q-item v-ripple clickable @click="logout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>Cerrar Sesión</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-toolbar>
  </q-header>
</template>

<script setup>
import { useNotificationsStore } from 'src/stores/notifications'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { ref, onMounted, computed } from 'vue'

const store = useNotificationsStore()
const router = useRouter()
const $q = useQuasar()
const userName = ref('Usuario')
const userInitials = computed(() => {
  return userName.value
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 1)
})

defineProps({
  hideMenu: {
    type: Boolean,
    default: false,
  },
})

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      if (user.nombre) {
        userName.value = user.nombre
      }
    } catch (e) {
      console.error('Error parsing user:', e)
    }
  }
})

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  $q.notify({
    type: 'positive',
    message: 'Sesión cerrada correctamente',
  })
  router.push('/login')
}

function openSettings() {
  router.push('/settings')
}

function openHelp() {
  router.push('/help')
}
</script>

<style scoped>
.nav-btn {
  margin-left: 6px;
  color: rgba(16, 24, 40, 0.75);
  transition: all 0.3s ease;
}
.nav-btn:hover {
  color: #0d6efd;
}
.nav-btn.router-link-active {
  color: #0d6efd;
  font-weight: 600;
}
</style>
