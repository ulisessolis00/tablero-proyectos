<!-- src/components/secretarias/HeroSecretaria.vue -->

<template>
  <header class="heroSecretaria" :style="estilosHero">
    <div class="heroSecretaria__fondo" aria-hidden="true"></div>

    <div class="heroSecretaria__contenido">
      <button
        v-if="mostrarBotonRegresar"
        class="heroSecretaria__volver"
        type="button"
        @click="emitirRegresar"
      >
        <ArrowLeft :size="18" stroke-width="2.4" />
        <span>{{ textoRegresar }}</span>
      </button>

      <nav
        v-if="mostrarBreadcrumb"
        class="heroSecretaria__breadcrumb"
        aria-label="Ruta de navegación"
      >
        <button class="heroSecretaria__breadcrumbBoton" type="button" @click="emitirRegresar">
          Panorama
        </button>

        <ChevronRight :size="15" stroke-width="2.4" aria-hidden="true" />

        <span>{{ sigla }}</span>
      </nav>

      <div class="heroSecretaria__grid">
        <div class="heroSecretaria__principal">
          <div class="heroSecretaria__badges">
            <span class="heroSecretaria__sigla">
              {{ sigla }}
            </span>

            <span class="heroSecretaria__estado">
              <span class="heroSecretaria__estadoPunto"></span>
              {{ textoEstadoDato }}
            </span>
          </div>

          <h1 class="heroSecretaria__titulo">
            {{ nombre }}
          </h1>

          <p class="heroSecretaria__titular">
            <UserRound :size="18" stroke-width="2.2" aria-hidden="true" />
            <span>Titular: {{ titular }}</span>
          </p>
        </div>

        <aside v-if="mostrarFicha" class="heroSecretaria__ficha" aria-label="Resumen de captura">
          <div class="heroSecretaria__fichaItem">
            <span>Programas</span>
            <strong>{{ totalProgramas }}</strong>
          </div>

          <div class="heroSecretaria__fichaItem">
            <span>Clasificación</span>
            <strong>{{ totalTiposPrograma }}</strong>
          </div>

          <div class="heroSecretaria__fichaItem">
            <span>Completitud</span>
            <strong>{{ porcentajeCompletitud }}</strong>
          </div>
        </aside>
      </div>

      <slot name="inferior"></slot>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowLeft, ChevronRight, UserRound } from 'lucide-vue-next'

import {
  crearResumenSecretaria,
  ESTADO_DATO,
} from '../../models/secretarias/modeloDatosSecretarias'

const props = defineProps({
  secretaria: {
    type: Object,
    required: true,
  },
  textoRegresar: {
    type: String,
    default: 'Volver al panorama',
  },
  mostrarBotonRegresar: {
    type: Boolean,
    default: true,
  },
  mostrarBreadcrumb: {
    type: Boolean,
    default: true,
  },
  mostrarFicha: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['regresar'])

const resumen = computed(() => {
  return crearResumenSecretaria(props.secretaria || {})
})

const sigla = computed(() => {
  return props.secretaria?.sigla || props.secretaria?.id || 'N/D'
})

const nombre = computed(() => {
  return props.secretaria?.nombre || 'Secretaría sin nombre'
})

const titular = computed(() => {
  return props.secretaria?.titular || 'Titular pendiente'
})

const color = computed(() => {
  return validarColor(props.secretaria?.color)
})

const totalProgramas = computed(() => {
  return formatearEntero(resumen.value.totalProgramas)
})

const totalTiposPrograma = computed(() => {
  return formatearEntero(resumen.value.totalTiposPrograma)
})

const porcentajeCompletitud = computed(() => {
  return `${formatearEntero(resumen.value.completitud)}%`
})

const configuracionEstadoDato = computed(() => {
  const estados = {
    [ESTADO_DATO.completo]: {
      texto: 'Captura completa',
      color: '#67e8a5',
    },
    [ESTADO_DATO.parcial]: {
      texto: 'Captura parcial',
      color: '#facc15',
    },
    [ESTADO_DATO.pendiente]: {
      texto: 'Captura pendiente',
      color: '#d1d5db',
    },
    [ESTADO_DATO.sinDatos]: {
      texto: 'Sin datos',
      color: '#d1d5db',
    },
  }

  return estados[resumen.value.estadoDato] || estados[ESTADO_DATO.pendiente]
})

const textoEstadoDato = computed(() => {
  return configuracionEstadoDato.value.texto
})

const estilosHero = computed(() => {
  return {
    '--hero-secretaria-color': color.value,
    '--hero-secretaria-estado-color': configuracionEstadoDato.value.color,
  }
})

function emitirRegresar() {
  emit('regresar')
}

function formatearEntero(valor) {
  const numero = Number(valor)

  if (!Number.isFinite(numero)) {
    return '0'
  }

  return new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: 0,
  }).format(numero)
}

function validarColor(valor) {
  if (/^#[0-9a-fA-F]{6}$/.test(valor || '')) {
    return valor
  }

  return '#9f2241'
}
</script>

<style scoped>
.heroSecretaria {
  position: relative;
  overflow: hidden;
  color: #ffffff;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--hero-secretaria-color) 72%, #3b0f22),
    color-mix(in srgb, var(--hero-secretaria-color) 54%, #9f2241)
  );
  isolation: isolate;
}

.heroSecretaria__fondo {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(circle at 18% 14%, rgba(255, 255, 255, 0.18), transparent 18rem),
    radial-gradient(circle at 82% 12%, rgba(188, 149, 92, 0.26), transparent 22rem),
    linear-gradient(180deg, transparent, rgba(39, 9, 24, 0.26));
  pointer-events: none;
}

.heroSecretaria__contenido {
  max-width: 1400px;
  margin: 0 auto;
  padding: clamp(1.25rem, 3vw, 2.5rem);
}

.heroSecretaria__volver {
  display: inline-flex;
  align-items: center;
  gap: 0.48rem;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.13);
  color: #ffffff;
  padding: 0.6rem 0.92rem;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 850;
  cursor: pointer;
  backdrop-filter: blur(12px);
  transition:
    background 180ms ease,
    transform 180ms ease;
}

.heroSecretaria__volver:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.heroSecretaria__volver:focus-visible,
.heroSecretaria__breadcrumbBoton:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.28);
  outline-offset: 3px;
}

.heroSecretaria__breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 1rem;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.78rem;
  font-weight: 750;
}

.heroSecretaria__breadcrumbBoton {
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.86);
  padding: 0;
  font: inherit;
  font-weight: 850;
  cursor: pointer;
}

.heroSecretaria__breadcrumbBoton:hover {
  color: #ffffff;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.heroSecretaria__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(230px, 330px);
  gap: clamp(1.5rem, 4vw, 2.5rem);
  align-items: end;
  margin-top: clamp(1.25rem, 3vw, 2.2rem);
}

.heroSecretaria__principal {
  min-width: 0;
}

.heroSecretaria__badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 0.9rem;
}

.heroSecretaria__sigla,
.heroSecretaria__estado {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 950;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.heroSecretaria__sigla {
  background: rgba(255, 255, 255, 0.96);
  color: var(--hero-secretaria-color);
  box-shadow: 0 14px 28px rgba(24, 8, 16, 0.14);
  padding: 0.43rem 0.82rem;
}

.heroSecretaria__estado {
  gap: 0.45rem;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.13);
  color: rgba(255, 255, 255, 0.92);
  padding: 0.43rem 0.78rem;
  backdrop-filter: blur(12px);
}

.heroSecretaria__estadoPunto {
  width: 0.46rem;
  height: 0.46rem;
  border-radius: 999px;
  background: var(--hero-secretaria-estado-color);
  box-shadow: 0 0 0 0.25rem color-mix(in srgb, var(--hero-secretaria-estado-color) 16%, transparent);
}

.heroSecretaria__titulo {
  max-width: 960px;
  margin: 0;
  font-size: clamp(2rem, 5vw, 4.15rem);
  font-weight: 950;
  letter-spacing: -0.06em;
  line-height: 0.96;
  text-wrap: balance;
  text-shadow: 0 12px 28px rgba(30, 8, 18, 0.18);
}

.heroSecretaria__titular {
  display: flex;
  align-items: center;
  gap: 0.52rem;
  max-width: 820px;
  margin: 1rem 0 0;
  color: rgba(255, 255, 255, 0.86);
  font-size: 0.95rem;
  font-weight: 650;
  line-height: 1.45;
}

.heroSecretaria__ficha {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 1.2rem;
  background: rgba(255, 255, 255, 0.13);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 16px 38px rgba(25, 8, 17, 0.12);
  backdrop-filter: blur(14px);
  padding: 1rem;
}

.heroSecretaria__fichaItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  padding-bottom: 0.7rem;
}

.heroSecretaria__fichaItem:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.heroSecretaria__fichaItem span {
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.heroSecretaria__fichaItem strong {
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 950;
  letter-spacing: -0.04em;
}

@media (max-width: 900px) {
  .heroSecretaria__grid {
    grid-template-columns: 1fr;
  }

  .heroSecretaria__ficha {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .heroSecretaria__fichaItem {
    align-items: flex-start;
    flex-direction: column;
    border-right: 1px solid rgba(255, 255, 255, 0.12);
    border-bottom: 0;
    padding-right: 0.7rem;
    padding-bottom: 0;
  }

  .heroSecretaria__fichaItem:last-child {
    border-right: 0;
    padding-right: 0;
  }
}

@media (max-width: 640px) {
  .heroSecretaria__contenido {
    padding: 1.15rem;
  }

  .heroSecretaria__volver {
    justify-content: center;
    width: 100%;
  }

  .heroSecretaria__breadcrumb {
    display: none;
  }

  .heroSecretaria__titular {
    align-items: flex-start;
  }

  .heroSecretaria__ficha {
    grid-template-columns: 1fr;
  }

  .heroSecretaria__fichaItem {
    align-items: center;
    flex-direction: row;
    border-right: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    padding-right: 0;
    padding-bottom: 0.7rem;
  }

  .heroSecretaria__fichaItem:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .heroSecretaria__volver {
    transition: none;
  }

  .heroSecretaria__volver:hover {
    transform: none;
  }
}
</style>
