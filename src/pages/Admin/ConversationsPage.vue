<template>
  <q-page class="q-pa-md" style="height: calc(100vh - 100px)">
    <q-card class="full-height bg-white shadow-2 rounded-borders">
      <div class="row no-wrap full-height">
        <div style="width:300px" class="border-right q-pa-sm">
          <div class="text-subtitle1 q-mb-sm">Conversaciones</div>
          <q-list>
            <q-item v-for="conv in conversations" :key="conv.id" clickable @click="select(conv)">
              <q-item-section>
                <q-item-label>{{ conv.name }}</q-item-label>
                <q-item-label caption>{{ conv.last }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <div class="col q-pa-md d-flex flex-column">
          <div class="text-subtitle1">{{ active.name || 'Selecciona una conversación' }}</div>
          <div class="q-mt-md scroll" style="flex:1; overflow:auto">
            <div v-for="msg in active.messages || []" :key="msg.id" class="q-mb-sm">
              <q-chip dense :color="msg.from === 'admin' ? 'primary' : 'grey-3'" text-color="white">
                {{ msg.from }}
              </q-chip>
              <div class="q-mt-xs">{{ msg.text }}</div>
            </div>
          </div>

          <div class="q-mt-sm">
            <q-input v-model="newMessage" placeholder="Escribe un mensaje..." @keyup.enter="send" rounded>
              <template v-slot:append>
                <q-btn color="primary" label="Enviar" @click="send" />
              </template>
            </q-input>
          </div>
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const conversations = ref([
  { id: 1, name: 'María López', last: '¿Cómo va el onboarding?', messages: [{ id: 1, from: 'user', text: 'Hola' }, { id: 2, from: 'admin', text: 'Hola, te ayudo' }] },
  { id: 2, name: 'Carlos Pérez', last: 'Gracias', messages: [{ id: 1, from: 'user', text: 'Gracias por la ayuda' }] },
])

const active = ref(conversations.value[0])
const newMessage = ref('')

function select(conv) { active.value = conv }
function send() {
  if (!newMessage.value || !active.value) return
  active.value.messages.push({ id: Date.now(), from: 'admin', text: newMessage.value })
  newMessage.value = ''
}
</script>

<style scoped>
.full-height { height: 100%; }
.rounded-borders { border-radius: 10px; }
.border-right { border-right: 1px solid rgba(0,0,0,0.06); }
</style>
