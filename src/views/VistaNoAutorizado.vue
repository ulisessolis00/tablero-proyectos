<!-- src/views/VistaNoAutorizado.vue -->

<template>
  <section class="vistaNoAutorizado">
    <div class="vistaNoAutorizado__fondo" aria-hidden="true"></div>

    <main class="vistaNoAutorizado__contenedor">
      <div class="vistaNoAutorizado__tarjeta">
        <div class="vistaNoAutorizado__marca">
          <div class="vistaNoAutorizado__icono">
            <ShieldAlert :size="34" stroke-width="2.1" />
          </div>

          <BaseBadge texto="Acceso restringido" estado="alerta" mostrar-punto />
        </div>

        <BaseErrorState
          tipo="permisos"
          variante="simple"
          :titulo="titulo"
          :mensaje="mensaje"
          :mostrar-volver="false"
          :mostrar-reintentar="false"
          class="vistaNoAutorizado__estado"
        />

        <section class="vistaNoAutorizado__detalle" aria-label="Detalle del acceso denegado">
          <div class="vistaNoAutorizado__detalleItem">
            <span>Motivo</span>
            <strong>{{ textoMotivo }}</strong>
          </div>

          <div class="vistaNoAutorizado__detalleItem">
            <span>Ruta solicitada</span>
            <strong>{{ rutaSolicitadaVisible }}</strong>
          </div>

          <div class="vistaNoAutorizado__detalleItem">
            <span>Qué hacer</span>
            <strong>{{ sugerencia }}</strong>
          </div>
        </section>

        <div class="vistaNoAutorizado__acciones">
          <BaseButton variante="primario" color="#9f2241" @click="irPanorama">
            <template #icono>
              <Home :size="17" stroke-width="2.4" />
            </template>

            Ir al panorama
          </BaseButton>

          <BaseButton variante="secundario" color="#9f2241" @click="irLogin">
            <template #icono>
              <LogIn :size="17" stroke-width="2.4" />
            </template>

            Cambiar usuario
          </BaseButton>

          <BaseButton
            v-if="rutaOrigenSegura"
            variante="ghost"
            color="#9f2241"
            @click="volverRutaAnterior"
          >
            Volver a la ruta anterior
          </BaseButton>
        </div>

        <p class="vistaNoAutorizado__nota">
          Si consideras que deberías tener acceso, solicita la revisión de permisos con la persona
          administradora del tablero.
        </p>
      </div>
    </main>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Home, LogIn, ShieldAlert } from 'lucide-vue-next'

import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseErrorState from '../components/ui/BaseErrorState.vue'

const route = useRoute()
const router = useRouter()

const motivo = computed(() => {
  return String(route.query.motivo || 'general')
})

const rutaOrigenSegura = computed(() => {
  return normalizarRutaLocal(route.query.desde)
})

const rutaSolicitadaVisible = computed(() => {
  return rutaOrigenSegura.value || 'No especificada'
})

const titulo = computed(() => {
  const titulos = {
    secretaria: 'No tienes permisos para ver esta secretaría',
    rol: 'Tu rol no permite entrar a esta sección',
    sesion: 'Tu sesión no permite acceder a esta vista',
    general: 'No tienes permisos para ver esta sección',
  }

  return titulos[motivo.value] || titulos.general
})

const mensaje = computed(() => {
  const mensajes = {
    secretaria:
      'Tu usuario está asociado a otra secretaría o no tiene autorización para consultar esta dependencia.',
    rol: 'Esta sección está disponible sólo para perfiles autorizados, como usuarios principales o administradores.',
    sesion: 'Tu sesión está activa, pero no cuenta con los permisos necesarios para esta ruta.',
    general: 'La ruta existe, pero tu usuario no tiene autorización para consultar su contenido.',
  }

  return mensajes[motivo.value] || mensajes.general
})

const textoMotivo = computed(() => {
  const motivos = {
    secretaria: 'Restricción por secretaría',
    rol: 'Restricción por rol',
    sesion: 'Restricción de sesión',
    general: 'Permisos insuficientes',
  }

  return motivos[motivo.value] || motivos.general
})

const sugerencia = computed(() => {
  if (motivo.value === 'secretaria') {
    return 'Regresa al panorama o cambia de usuario.'
  }

  if (motivo.value === 'rol') {
    return 'Solicita revisión de rol.'
  }

  return 'Vuelve al panorama o inicia sesión con otra cuenta.'
})

function irPanorama() {
  router.push({
    name: 'panorama',
  })
}

function irLogin() {
  router.push({
    name: 'login',
  })
}

function volverRutaAnterior() {
  if (!rutaOrigenSegura.value) {
    irPanorama()
    return
  }

  router.push(rutaOrigenSegura.value)
}

function normalizarRutaLocal(valor) {
  const ruta = String(valor || '').trim()

  if (!ruta) {
    return ''
  }

  if (!ruta.startsWith('/')) {
    return ''
  }

  if (ruta.startsWith('//')) {
    return ''
  }

  if (ruta.startsWith('/no-autorizado')) {
    return ''
  }

  return ruta
}
</script>

<style scoped>
.vistaNoAutorizado {
  position: relative;
  display: grid;
  min-height: 100%;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 12%, rgba(183, 154, 91, 0.12), transparent 18rem),
    radial-gradient(circle at 88% 18%, rgba(159, 34, 65, 0.1), transparent 20rem), #f8f7f4;
  isolation: isolate;
}

.vistaNoAutorizado__fondo {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(135deg, rgba(159, 34, 65, 0.08), transparent 42%),
    linear-gradient(315deg, rgba(183, 154, 91, 0.08), transparent 46%);
  pointer-events: none;
}

.vistaNoAutorizado__contenedor {
  display: grid;
  place-items: center;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: clamp(1.15rem, 4vw, 3rem);
}

.vistaNoAutorizado__tarjeta {
  width: min(100%, 840px);
  border: 1px solid rgba(159, 34, 65, 0.12);
  border-radius: 1.65rem;
  background: rgba(255, 255, 255, 0.86);
  box-shadow:
    0 24px 70px rgba(31, 41, 55, 0.09),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  padding: clamp(1.25rem, 3vw, 2rem);
}

.vistaNoAutorizado__marca {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.vistaNoAutorizado__icono {
  display: grid;
  place-items: center;
  width: 4rem;
  height: 4rem;
  border-radius: 1.25rem;
  background: linear-gradient(135deg, rgba(159, 34, 65, 0.12), rgba(183, 154, 91, 0.12));
  color: #9f2241;
}

.vistaNoAutorizado__estado {
  margin-top: 0.35rem;
}

.vistaNoAutorizado__detalle {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
  margin-top: 1.25rem;
}

.vistaNoAutorizado__detalleItem {
  border: 1px solid rgba(159, 34, 65, 0.08);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.76);
  padding: 0.85rem 0.95rem;
}

.vistaNoAutorizado__detalleItem span {
  display: block;
  color: #9ca3af;
  font-size: 0.66rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.vistaNoAutorizado__detalleItem strong {
  display: block;
  margin-top: 0.25rem;
  overflow-wrap: anywhere;
  color: #1f2937;
  font-size: 0.86rem;
  font-weight: 900;
  line-height: 1.35;
}

.vistaNoAutorizado__acciones {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.35rem;
}

.vistaNoAutorizado__nota {
  margin: 1.1rem 0 0;
  border-top: 1px solid rgba(17, 24, 39, 0.08);
  padding-top: 1rem;
  color: #6b7280;
  font-size: 0.84rem;
  font-weight: 600;
  line-height: 1.55;
}

@media (max-width: 820px) {
  .vistaNoAutorizado__detalle {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .vistaNoAutorizado__marca {
    align-items: flex-start;
    flex-direction: column;
  }

  .vistaNoAutorizado__acciones {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
