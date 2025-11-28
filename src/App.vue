<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useNotificationsStore } from 'src/stores/notifications'

const notificationsStore = useNotificationsStore()

onMounted(() => {
  // Cargar notificaciones al iniciar la app
  notificationsStore.fetchNotifications()
})
</script>
