<template>
  <q-page class="q-pa-md">
    <q-card class="q-pa-md bg-white shadow-2 rounded-borders">
      <div class="text-h6 q-mb-md">Ajustes</div>

      <div class="q-gutter-md">
        <div class="q-mb-md">
          <div class="text-subtitle2">Ajustes del Chatbot</div>
          <q-input v-model="botName" label="Nombre del Bot" />
          <q-select v-model="language" :options="['Español','Inglés']" label="Idioma" class="q-mt-sm" />
          <q-toggle v-model="autoReply" label="Respuestas automáticas" class="q-mt-sm" />
        </div>

        <div class="q-mb-md">
          <div class="text-subtitle2">Notificaciones</div>
          <q-toggle v-model="emailNotifications" label="Email" />
          <q-toggle v-model="smsNotifications" label="SMS" />
        </div>

        <div>
          <q-btn color="primary" label="Guardar cambios" @click="save" />
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const botName = ref('Asistente RRHH')
const language = ref('Español')
const autoReply = ref(true)
const emailNotifications = ref(true)
const smsNotifications = ref(false)

function save() {
  // placeholder: persist settings via API
  console.log('Saved', { botName: botName.value, language: language.value })
}
</script>

<style scoped>
.rounded-borders { border-radius: 10px; }
</style>
