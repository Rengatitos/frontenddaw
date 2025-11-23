<template>
  <div class="bg-grey-2 q-pa-md font-arial" style="min-height: 100vh">
    <div class="text-center q-mb-xl q-mt-md">
      <div class="row justify-center q-mb-sm">
        <q-avatar size="70px" color="indigo-6" text-color="white" class="shadow-3">
          <q-icon name="waving_hand" size="40px" />
        </q-avatar>
      </div>

      <div class="text-h5 text-weight-bold text-grey-9">
        ¡Bienvenido a TCS, {{ nombreUsuario }}!
      </div>

      <div class="text-subtitle1 text-grey-7">Estamos emocionados de tenerte en nuestro equipo</div>
    </div>

    <div class="row q-col-gutter-lg justify-center" style="max-width: 1200px; margin: 0 auto">
      <div class="col-12 col-md-7">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-h6 text-weight-bold text-grey-9">Tu Progreso</div>
          <q-avatar
            color="indigo-6"
            text-color="white"
            size="45px"
            font-size="14px"
            class="text-weight-bold shadow-1"
          >
            33%
          </q-avatar>
        </div>

        <q-card class="shadow-1" style="border-radius: 12px">
          <q-card-section>
            <div class="q-mb-md">
              <q-linear-progress
                :value="0.33"
                size="12px"
                color="indigo-6"
                track-color="grey-3"
                rounded
                class="q-mb-xs"
              />
              <div class="text-grey-7 text-caption text-weight-medium">
                2 de 6 tareas completadas
              </div>
            </div>

            <q-list separator>
              <q-item v-for="task in tasks" :key="task.id" class="q-py-md">
                <q-item-section avatar style="min-width: 40px">
                  <q-icon
                    :name="task.completed ? 'check_circle' : 'radio_button_unchecked'"
                    :color="task.completed ? 'indigo-6' : 'grey-4'"
                    size="26px"
                  />
                </q-item-section>

                <q-item-section>
                  <q-item-label
                    :class="task.completed ? 'text-indigo-8 text-weight-medium' : 'text-grey-9'"
                  >
                    {{ task.name }}
                  </q-item-label>

                  <q-item-label
                    caption
                    v-if="task.status === 'Vencida' && !task.completed"
                    class="text-red-5 row items-center q-gutter-x-xs q-mt-xs"
                  >
                    <q-icon name="event_busy" size="14px" />
                    <span class="text-weight-medium">Vencida</span>
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-icon name="chevron_right" color="grey-5" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-5">
        <div class="text-h6 text-weight-bold text-grey-9 q-mb-sm">Tu Supervisor</div>

        <q-card class="shadow-1 text-center q-pa-lg bg-white" style="border-radius: 12px">
          <div class="column items-center">
            <q-avatar
              size="90px"
              color="indigo-5"
              text-color="white"
              class="text-h4 shadow-2 q-mb-md"
            >
              CP
            </q-avatar>

            <div class="text-h6 text-weight-bold text-grey-9">Carlos García Pérez</div>
            <div class="text-subtitle2 text-grey-6 q-mb-lg">Reclutador de Recursos Humanos</div>

            <q-card flat bordered class="full-width bg-grey-1 q-pa-sm">
              <q-list dense>
                <q-item class="q-px-none justify-center">
                  <q-icon name="email" color="indigo-5" class="q-mr-sm" size="20px" />
                  <span class="text-grey-8">carlos.garcia@tcs.com</span>
                </q-item>
                <q-item class="q-px-none justify-center">
                  <q-icon name="phone" color="indigo-5" class="q-mr-sm" size="20px" />
                  <span class="text-grey-8">+51 912 345 678</span>
                </q-item>
              </q-list>
            </q-card>
          </div>
        </q-card>
      </div>
    </div>

    <div class="q-mt-xl q-mb-lg" style="max-width: 1200px; margin: 0 auto">
      <div
        class="bg-indigo-1 q-pa-lg row items-center shadow-1"
        style="border-radius: 16px; border: 1px solid #c7caff"
      >
        <div class="col-12 col-md-auto q-mr-md flex flex-center q-mb-md q-mb-md-none">
          <div class="bg-white q-pa-md shadow-2" style="border-radius: 12px">
            <q-icon name="smart_toy" color="indigo-8" size="40px" />
          </div>
        </div>

        <div class="col-12 col-md">
          <div class="text-h6 text-weight-bold text-indigo-9">¿Tienes preguntas?</div>
          <div class="text-body2 text-grey-8 q-mt-xs" style="max-width: 600px">
            Nuestro asistente virtual está disponible 24/7 para ayudarte con cualquier duda sobre tu
            proceso de incorporación, políticas de la empresa y beneficios.
          </div>
        </div>

        <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
          <q-btn
            unelevated
            color="indigo-6"
            text-color="white"
            label="Hablar con el Asistente"
            icon-right="arrow_forward"
            class="q-px-lg q-py-md text-weight-bold"
            no-caps
            style="border-radius: 8px"
          />
        </div>
      </div>
    </div>

    <footer class="text-center text-grey-5 q-py-lg text-caption">
      Si necesitas ayuda inmediata, contacta a tu supervisor o al equipo de Recursos Humanos
    </footer>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'DashboardPage',
  setup() {
    // 1. Variable reactiva para el nombre
    const nombreUsuario = ref('Colaborador')

    // 2. Lista de tareas (movida a setup)
    const tasks = ref([
      { id: 1, name: 'Completar perfil personal', status: 'Vencida', completed: true },
      { id: 2, name: 'Revisar manual del empleado', status: 'Vencida', completed: true },
      { id: 3, name: 'Configurar accesos de sistema', status: 'Vencida', completed: false },
      { id: 4, name: 'Firmar documentos digitales', status: 'Vencida', completed: false },
      { id: 5, name: 'Completar capacitación inicial', status: 'Vencida', completed: false },
      { id: 6, name: 'Conocer al equipo', status: 'Vencida', completed: false },
    ])

    // 3. Lógica al cargar la página
    onMounted(() => {
      // Recuperamos el usuario guardado en el Login
      const userStorage = localStorage.getItem('user')

      if (userStorage) {
        try {
          const user = JSON.parse(userStorage)
          // Si existe el nombre, lo asignamos
          if (user.nombre) {
            nombreUsuario.value = user.nombre
          }
        } catch (error) {
          console.error('Error al leer datos del usuario:', error)
        }
      }
    })

    return {
      nombreUsuario,
      tasks,
    }
  },
}
</script>

<style scoped>
.font-arial {
  font-family: 'Arial', sans-serif;
}
</style>
