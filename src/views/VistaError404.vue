<!-- src/views/VistaError404.vue -->

<template>
  <section class="vistaError404">
    <div class="vistaError404__fondo" aria-hidden="true"></div>

    <main class="vistaError404__contenedor">
      <div class="vistaError404__tarjeta">
        <div class="vistaError404__superior">
          <div class="vistaError404__numero" aria-hidden="true">404</div>

          <BaseBadge texto="Ruta inexistente" estado="sinDatos" mostrar-punto />
        </div>

        <BaseErrorState
          tipo="ruta"
          variante="simple"
          titulo="La página no existe"
          :mensaje="mensajePrincipal"
          :mostrar-volver="false"
          :mostrar-reintentar="false"
          class="vistaError404__estado"
        />

        <section class="vistaError404__detalle" aria-label="Detalle de la ruta no encontrada">
          <div class="vistaError404__detalleItem">
            <span>Ruta solicitada</span>
            <strong>{{ rutaActual }}</strong>
          </div>

          <div class="vistaError404__detalleItem">
            <span>Posible causa</span>
            <strong>{{ causaProbable }}</strong>
          </div>
        </section>

        <div class="vistaError404__acciones">
          <BaseButton variante="primario" color="#9f2241" @click="irPanorama">
            <template #icono>
              <Home :size="17" stroke-width="2.4" />
            </template>

            Ir al panorama
          </BaseButton>

          <BaseButton variante="secundario" color="#9f2241" @click="volverAtras">
            <template #icono>
              <ArrowLeft :size="17" stroke-width="2.4" />
            </template>

            Volver atrás
          </BaseButton>

          <BaseButton variante="ghost" color="#9f2241" @click="irVisualizaciones">
            <template #icono>
              <BarChart3 :size="17" stroke-width="2.4" />
            </template>

            Ver visualizaciones
          </BaseButton>
        </div>

        <p class="vistaError404__nota">
          Si llegaste desde un enlace interno del tablero, puede que la ruta haya cambiado o que el
          módulo aún no esté disponible.
        </p>
      </div>
    </main>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, BarChart3, Home } from 'lucide-vue-next'

import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseErrorState from '../components/ui/BaseErrorState.vue'

const route = useRoute()
const router = useRouter()

const rutaActual = computed(() => {
  return route.fullPath || '/'
})

const mensajePrincipal = computed(() => {
  return 'La dirección solicitada no está registrada en el tablero. Revisa la URL o vuelve al panorama general.'
})

const causaProbable = computed(() => {
  if (rutaActual.value.includes('secretarias')) {
    return 'La secretaría solicitada no existe o el identificador está mal escrito.'
  }

  if (rutaActual.value.includes('visualizaciones')) {
    return 'La visualización solicitada no está registrada.'
  }

  if (rutaActual.value.includes('admin')) {
    return 'El módulo administrativo todavía no está disponible en esta ruta.'
  }

  return 'La dirección fue escrita manualmente, cambió o todavía no existe.'
})

function irPanorama() {
  router.push({
    name: 'panorama',
  })
}

function irVisualizaciones() {
  router.push({
    name: 'visualizaciones',
  })
}

function volverAtras() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  irPanorama()
}
</script>

<style scoped>
.vistaError404 {
  position: relative;
  display: grid;
  min-height: 100%;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 14%, rgba(183, 154, 91, 0.12), transparent 18rem),
    radial-gradient(circle at 88% 18%, rgba(159, 34, 65, 0.1), transparent 20rem), #f8f7f4;
  isolation: isolate;
}

.vistaError404__fondo {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(135deg, rgba(159, 34, 65, 0.08), transparent 42%),
    linear-gradient(315deg, rgba(183, 154, 91, 0.08), transparent 46%);
  pointer-events: none;
}

.vistaError404__contenedor {
  display: grid;
  place-items: center;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: clamp(1.15rem, 4vw, 3rem);
}

.vistaError404__tarjeta {
  position: relative;
  width: min(100%, 840px);
  overflow: hidden;
  border: 1px solid rgba(159, 34, 65, 0.12);
  border-radius: 1.65rem;
  background: rgba(255, 255, 255, 0.86);
  box-shadow:
    0 24px 70px rgba(31, 41, 55, 0.09),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  padding: clamp(1.25rem, 3vw, 2rem);
}

.vistaError404__tarjeta::before {
  position: absolute;
  inset: 0 0 auto;
  height: 0.32rem;
  content: '';
  background: linear-gradient(90deg, #9f2241, #b79a5b);
}

.vistaError404__superior {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.vistaError404__numero {
  color: #9f2241;
  font-size: clamp(3.8rem, 12vw, 7.5rem);
  font-weight: 950;
  letter-spacing: -0.09em;
  line-height: 0.85;
  text-shadow: 0 16px 34px rgba(159, 34, 65, 0.14);
}

.vistaError404__estado {
  margin-top: 0.35rem;
}

.vistaError404__detalle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
  margin-top: 1.25rem;
}

.vistaError404__detalleItem {
  min-width: 0;
  border: 1px solid rgba(159, 34, 65, 0.08);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.76);
  padding: 0.85rem 0.95rem;
}

.vistaError404__detalleItem span {
  display: block;
  color: #9ca3af;
  font-size: 0.66rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.vistaError404__detalleItem strong {
  display: block;
  margin-top: 0.25rem;
  overflow-wrap: anywhere;
  color: #1f2937;
  font-size: 0.86rem;
  font-weight: 900;
  line-height: 1.35;
}

.vistaError404__acciones {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.35rem;
}

.vistaError404__nota {
  margin: 1.1rem 0 0;
  border-top: 1px solid rgba(17, 24, 39, 0.08);
  padding-top: 1rem;
  color: #6b7280;
  font-size: 0.84rem;
  font-weight: 600;
  line-height: 1.55;
}

@media (max-width: 760px) {
  .vistaError404__detalle {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .vistaError404__superior {
    align-items: flex-start;
    flex-direction: column;
  }

  .vistaError404__acciones {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
