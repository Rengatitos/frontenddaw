<template>
  <q-layout view="lHh Lpr lFf">
    <NavBar />

    <q-page-container>
      <q-page class="q-pt-sm q-px-lg">

        <!-- Mensaje inicial del agente -->
        <ChatBubble :isUser="false">
          <div class="text-h6">AGENTE • Onboarding</div>
          <div class="text-grey text-caption">
            Asistente general para empleados
          </div>
          <br />
          Hola, soy tu Agente guía. 
          Puedo ayudarte con dudas sobre cultura, procesos internos, herramientas y funcionamiento del día a día.
          <br />
          <div class="text-caption text-grey-7 q-mt-sm">
            Para una experiencia más completa, puedes usar el 
            <b>Chatbot Onboarding</b> desde tu Dashboard de empleado.
          </div>
        </ChatBubble>

        <!-- Preguntas sugeridas (funcional) -->
        <SuggestedQuestions class="q-mt-md" @select="addUserMessage" />

        <!-- Mensajes dinámicos -->
        <div v-for="(msg, i) in messages" :key="i">
          <ChatBubble :isUser="msg.user">
            <div>{{ msg.text }}</div>

            <div
              v-if="msg.note"
              class="text-caption text-grey-6 q-mt-xs"
              style="font-size: 11px"
            >
              {{ msg.note }}
            </div>
          </ChatBubble>
        </div>

      </q-page>

      <ChatInput @send="addUserMessage" />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import NavBar from 'src/components/NavBar.vue'
import ChatBubble from 'src/components/ChatBubble.vue'
import SuggestedQuestions from 'src/components/SuggestedQuestions.vue'
import ChatInput from 'src/components/ChatInput.vue'

const messages = ref([])

/*
  Respuestas tipo TCS:
  Cultura de aprendizaje continuo, excelencia, procesos globales, documentación,
  herramientas como Jira/Confluence/Teams, onboarding estructurado,
  valores: integridad, adaptabilidad, colaboración, delivery de calidad.
*/

const predefinedAnswers = [

  // Adaptación cultural
  {
    keywords: ['adaptarme', 'integrarme', 'adaptación', 'adaptar'],
    answer:
      'Para adaptarte más rápido, te recomendamos tres pilares: (1) familiarizarte con la cultura de aprendizaje continuo, (2) comunicarte activamente con tu equipo y supervisor, y (3) participar en las sesiones de inducción y en los grupos de práctica. La colaboración es un valor clave dentro de empresas estilo TCS.'
  },

  // Día a día
  {
    keywords: ['día a día', 'rutina', 'trabajo diario', 'funciona el día'],
    answer:
      'El día a día se organiza mayormente en reuniones cortas, seguimiento de tareas en herramientas como Jira o Teams, comunicación activa con tu squad y revisiones periódicas con tu supervisor. La filosofía es trabajar por entregables, no por horas.'
  },

  // Onboarding general
  {
    keywords: ['onboarding', 'inducción', 'primeros pasos'],
    answer:
      'El proceso de onboarding consta de 5 etapas: (1) bienvenida corporativa, (2) subida de documentos, (3) asignación de supervisor y squad, (4) capacitación inicial y (5) primera entrega o participación en un proyecto. Todo está diseñado para que aprendas rápido y entiendas cómo se trabaja aquí.'
  },

  // Documento: Manual del Colaborador
  {
    keywords: ['manual del colaborador', 'manual colaborador'],
    answer:
      'MANUAL DEL COLABORADOR — Resumen:\n• Presenta la cultura corporativa, normas básicas, canales de ayuda, políticas internas y principios de comportamiento.\n• En empresas estilo TCS se enfatiza la integridad, la calidad del trabajo, la innovación, la colaboración global y el aprendizaje continuo.'
  },

  // Documento: Cultura y Valores
  {
    keywords: ['cultura', 'valores'],
    answer:
      'CULTURA Y VALORES — Resumen:\n• Integridad y ética profesional.\n• Aprendizaje continuo y mejora constante.\n• Enfoque en el cliente y excelencia en entregables.\n• Trabajo colaborativo entre equipos globales.\n• Innovación como parte del ADN.'
  },

  // Código de Ética
  {
    keywords: ['código de ética', 'ética'],
    answer:
      'CÓDIGO DE ÉTICA — Resumen:\n• Confidencialidad y protección de datos.\n• Relación profesional con clientes y colegas.\n• Responsabilidad en el uso de recursos corporativos.\n• Cumplimiento legal y respeto interpersonal.'
  },

  // Políticas TI
  {
    keywords: ['seguridad ti', 'políticas ti', 'seguridad'],
    answer:
      'POLÍTICAS DE SEGURIDAD TI — Resumen:\n• Uso responsable de equipos, accesos y contraseñas.\n• Prohibición de compartir credenciales.\n• Validación de identidad en accesos remotos.\n• Manejo seguro de información de clientes.\n• Prácticas obligatorias: MFA, clasificaciones de datos y reportes de incidentes.'
  },

  // Guía del Primer Mes
  {
    keywords: ['primer mes', 'primeros 30', 'primeros días'],
    answer:
      'GUÍA DEL PRIMER MES — Resumen:\nSemana 1: Inducción, acceso a herramientas y reuniones con tu supervisor.\nSemana 2: Capacitación técnica y cultural.\nSemana 3: Participación en tareas reales del proyecto.\nSemana 4: Primeras contribuciones evaluadas y retroalimentación inicial.'
  },

  // Herramientas
  {
    keywords: ['herramientas', 'software', 'plataformas'],
    answer:
      'Las herramientas más utilizadas incluyen: Microsoft Teams, Jira, Confluence, SAP SuccessFactors, Outlook, Git, y plataformas internas de capacitación. Tu supervisor te indicará cuáles usarás según tu rol.'
  },

  // Ayuda
  {
    keywords: ['ayuda', 'soporte', 'duda', 'supervisor'],
    answer:
      'Puedes pedir ayuda a tu supervisor, al área de People/HR, a tu “buddy” asignado o al equipo de soporte TI. La política interna fomenta que ninguna duda se quede sin resolver.'
  },

  //Fallback
  {
    keywords: ['intranet', 'todo'],
    answer:
      'Puedes acceder a la intranet desde tu Dashboard para revisar documentos, políticas, calendario, cursos y tu información laboral.'
  }
]

function findPredefinedAnswer(text) {
  const t = text.toLowerCase()

  for (const item of predefinedAnswers) {
    if (item.keywords.some(k => t.includes(k))) {
      return item.answer
    }
  }
  return null
}

function addUserMessage(text) {
  messages.value.push({ text, user: true })

  const match = findPredefinedAnswer(text)

  if (match) {
    messages.value.push({
      text: match,
      user: false,
      note: 'Para una experiencia más completa, usa el Chatbot Onboarding desde tu Dashboard.'
    })
  } else {
    messages.value.push({
      text:
        'Gracias por tu consulta. Estoy procesando tu pregunta basada en nuestra documentación interna.',
      user: false,
      note:
        'Recuerda: el Chatbot Onboarding del Dashboard puede guiarte paso a paso.'
    })
  }
}
</script>
