<template>
  <div class="q-pa-lg suggested-questions">
    <div class="text-subtitle2 text-grey-7 q-mb-sm">💡 Sugerencias:</div>

    <div class="row q-col-gutter-sm">
      <div class="col-6 col-md-3" v-for="q in questions" :key="q">
        <q-btn
          flat
          unelevated
          rounded
          class="suggestion-btn"
          :label="q"
          @click="emitSelect(q)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['select'])
const emitSelect = (q) => emit('select', q)

// Preguntas creadas según el onboarding cultural y operativo de una empresa estilo TCS.
const questions = [
  '¿Cómo puedo adaptarme más rápido a la empresa?',
  '¿Cómo funciona el día a día aquí?',
  '¿Cómo es el proceso de onboarding?',
  'Resumen del Manual del Colaborador',
  'Resumen de la Cultura y Valores',
  'Resumen del Código de Ética',
  'Resumen de Políticas de Seguridad TI',
  'Resumen de la Guía del Primer Mes',
  '¿Qué herramientas utilizamos en TCS?',
  '¿A quién puedo pedir ayuda?',
  'Ver intranet',
  'Ver todo'
]
</script>

<style scoped>
.suggested-questions {
  max-width: 1000px;
  margin: 0 auto;
}
.suggestion-btn {
  width: 100%;
  text-align: left;
  padding-left: 0.9rem;
  border: 1px solid rgba(16, 24, 40, 0.04);
  transition: 0.2s;
}
.suggestion-btn:hover {
  box-shadow: 0 6px 18px rgba(16, 24, 40, 0.06);
  transform: translateY(-1px);
}
</style>
