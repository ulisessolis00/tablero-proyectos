<!-- src/components/secretarias/CuadriculaSecretarias.vue -->

<template>
  <section
    class="cuadriculaSecretarias"
    :class="clasesCuadricula"
    :style="estilosCuadricula"
    :aria-label="ariaLabel"
  >
    <div v-if="cargando" class="cuadriculaSecretarias__grid" aria-live="polite">
      <article
        v-for="item in skeletons"
        :key="item"
        class="cuadriculaSecretarias__skeleton"
        aria-hidden="true"
      >
        <div class="cuadriculaSecretarias__skeletonSuperior">
          <span class="cuadriculaSecretarias__skeletonBadge"></span>
          <span class="cuadriculaSecretarias__skeletonMini"></span>
        </div>

        <div
          class="cuadriculaSecretarias__skeletonLinea cuadriculaSecretarias__skeletonLinea--titulo"
        ></div>
        <div
          class="cuadriculaSecretarias__skeletonLinea cuadriculaSecretarias__skeletonLinea--media"
        ></div>

        <div class="cuadriculaSecretarias__skeletonPersona">
          <span class="cuadriculaSecretarias__skeletonAvatar"></span>

          <div class="cuadriculaSecretarias__skeletonPersonaTextos">
            <span
              class="cuadriculaSecretarias__skeletonLinea cuadriculaSecretarias__skeletonLinea--corta"
            ></span>
            <span
              class="cuadriculaSecretarias__skeletonLinea cuadriculaSecretarias__skeletonLinea--media"
            ></span>
          </div>
        </div>

        <div class="cuadriculaSecretarias__skeletonMetricas">
          <span></span>
          <span></span>
        </div>
      </article>
    </div>

    <div v-else-if="secretariasNormalizadas.length > 0" class="cuadriculaSecretarias__grid">
      <TarjetaSecretaria
        v-for="secretaria in secretariasNormalizadas"
        :key="secretaria.id"
        :secretaria="secretaria"
        :compacta="compacta"
        :mostrar-boton="mostrarBoton"
        @seleccionar="emitirSeleccion"
        @ver-detalle="emitirVerDetalle"
      />
    </div>

    <div v-else class="cuadriculaSecretarias__vacio" role="status">
      <div class="cuadriculaSecretarias__vacioIcono" aria-hidden="true">✦</div>

      <p class="cuadriculaSecretarias__vacioTitulo">
        {{ tituloVacio }}
      </p>

      <p class="cuadriculaSecretarias__vacioTexto">
        {{ mensajeVacio }}
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import TarjetaSecretaria from './TarjetaSecretaria.vue'

const props = defineProps({
  secretarias: {
    type: Array,
    default: () => [],
  },
  cargando: {
    type: Boolean,
    default: false,
  },
  columnas: {
    type: Number,
    default: 3,
  },
  compacta: {
    type: Boolean,
    default: false,
  },
  mostrarBoton: {
    type: Boolean,
    default: true,
  },
  cantidadSkeleton: {
    type: Number,
    default: 6,
  },
  tituloVacio: {
    type: String,
    default: 'No hay secretarías para mostrar',
  },
  mensajeVacio: {
    type: String,
    default: 'No se encontraron dependencias con los filtros o permisos actuales.',
  },
  ariaLabel: {
    type: String,
    default: 'Listado de secretarías',
  },
  variante: {
    type: String,
    default: 'normal',
    validator: (valor) => {
      return ['normal', 'contenida'].includes(valor)
    },
  },
})

const emit = defineEmits(['seleccionar', 'verDetalle'])

const secretariasNormalizadas = computed(() => {
  return props.secretarias
    .filter((secretaria) => secretaria && typeof secretaria === 'object')
    .map((secretaria) => {
      return {
        ...secretaria,
        id: secretaria.id || secretaria.sigla || secretaria.nombre,
        sigla: secretaria.sigla || secretaria.id || 'N/D',
        nombre: secretaria.nombre || 'Secretaría sin nombre',
        titular: secretaria.titular || 'Titular pendiente',
        programas: Array.isArray(secretaria.programas) ? secretaria.programas : [],
      }
    })
})

const columnasNormalizadas = computed(() => {
  const columnas = Number(props.columnas)

  if (!Number.isFinite(columnas)) {
    return 3
  }

  if (columnas < 1) {
    return 1
  }

  if (columnas > 4) {
    return 4
  }

  return Math.round(columnas)
})

const skeletons = computed(() => {
  const total = Math.max(1, Math.min(props.cantidadSkeleton, 12))

  return Array.from({ length: total }, (_, indice) => {
    return `secretaria-skeleton-${indice + 1}`
  })
})

const estilosCuadricula = computed(() => {
  return {
    '--cuadricula-secretarias-columnas': columnasNormalizadas.value,
  }
})

const clasesCuadricula = computed(() => {
  return {
    'cuadriculaSecretarias--compacta': props.compacta,
    'cuadriculaSecretarias--contenida': props.variante === 'contenida',
  }
})

function emitirSeleccion(secretaria) {
  emit('seleccionar', secretaria)
}

function emitirVerDetalle(secretaria) {
  emit('verDetalle', secretaria)
}
</script>

<style scoped>
.cuadriculaSecretarias {
  width: 100%;
}

.cuadriculaSecretarias--contenida {
  border: 1px solid rgba(159, 34, 65, 0.1);
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 18px 45px rgba(31, 41, 55, 0.055);
  backdrop-filter: blur(14px);
  padding: clamp(1rem, 2vw, 1.25rem);
}

.cuadriculaSecretarias__grid {
  display: grid;
  grid-template-columns: repeat(var(--cuadricula-secretarias-columnas), minmax(0, 1fr));
  gap: clamp(1rem, 2vw, 1.25rem);
}

.cuadriculaSecretarias__vacio {
  display: grid;
  place-items: center;
  min-height: 260px;
  border: 1px dashed rgba(159, 34, 65, 0.22);
  border-radius: 1.35rem;
  background:
    radial-gradient(circle at top, rgba(159, 34, 65, 0.06), transparent 15rem),
    rgba(255, 255, 255, 0.72);
  padding: 2rem;
  text-align: center;
}

.cuadriculaSecretarias__vacioIcono {
  display: grid;
  place-items: center;
  width: 3.15rem;
  height: 3.15rem;
  margin-bottom: 0.85rem;
  border-radius: 1rem;
  background: rgba(159, 34, 65, 0.09);
  color: #9f2241;
  font-size: 1.4rem;
  font-weight: 900;
}

.cuadriculaSecretarias__vacioTitulo {
  margin: 0;
  color: #111827;
  font-size: 1rem;
  font-weight: 950;
  letter-spacing: -0.02em;
}

.cuadriculaSecretarias__vacioTexto {
  max-width: 520px;
  margin: 0.4rem auto 0;
  color: #6b7280;
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.5;
}

.cuadriculaSecretarias__skeleton {
  min-height: 255px;
  overflow: hidden;
  border: 1px solid rgba(159, 34, 65, 0.08);
  border-radius: 1.35rem;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 18px 45px rgba(31, 41, 55, 0.055);
  padding: 1.2rem;
}

.cuadriculaSecretarias__skeletonSuperior {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.cuadriculaSecretarias__skeletonBadge,
.cuadriculaSecretarias__skeletonMini,
.cuadriculaSecretarias__skeletonLinea,
.cuadriculaSecretarias__skeletonAvatar,
.cuadriculaSecretarias__skeletonMetricas span {
  position: relative;
  overflow: hidden;
  border-radius: 999px;
  background: #e5e7eb;
}

.cuadriculaSecretarias__skeletonBadge::after,
.cuadriculaSecretarias__skeletonMini::after,
.cuadriculaSecretarias__skeletonLinea::after,
.cuadriculaSecretarias__skeletonAvatar::after,
.cuadriculaSecretarias__skeletonMetricas span::after {
  position: absolute;
  inset: 0;
  content: '';
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.72), transparent);
  transform: translateX(-100%);
  animation: skeletonBrillo 1.25s infinite;
}

.cuadriculaSecretarias__skeletonBadge {
  width: 4.4rem;
  height: 1.5rem;
  border-radius: 0.55rem;
}

.cuadriculaSecretarias__skeletonMini {
  width: 5rem;
  height: 1.3rem;
  border-radius: 0.5rem;
}

.cuadriculaSecretarias__skeletonLinea {
  display: block;
  height: 0.78rem;
  margin-top: 0.7rem;
}

.cuadriculaSecretarias__skeletonLinea--titulo {
  width: 88%;
  height: 1rem;
}

.cuadriculaSecretarias__skeletonLinea--media {
  width: 62%;
}

.cuadriculaSecretarias__skeletonLinea--corta {
  width: 42%;
}

.cuadriculaSecretarias__skeletonPersona {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.2rem;
}

.cuadriculaSecretarias__skeletonAvatar {
  flex: 0 0 auto;
  width: 2.35rem;
  height: 2.35rem;
}

.cuadriculaSecretarias__skeletonPersonaTextos {
  flex: 1;
}

.cuadriculaSecretarias__skeletonMetricas {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
  margin-top: 1.3rem;
  border-top: 1px solid rgba(229, 231, 235, 0.9);
  padding-top: 1rem;
}

.cuadriculaSecretarias__skeletonMetricas span {
  height: 2.2rem;
  border-radius: 0.8rem;
}

@keyframes skeletonBrillo {
  100% {
    transform: translateX(100%);
  }
}

@media (max-width: 1180px) {
  .cuadriculaSecretarias__grid {
    grid-template-columns: repeat(min(var(--cuadricula-secretarias-columnas), 2), minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .cuadriculaSecretarias__grid {
    grid-template-columns: 1fr;
  }

  .cuadriculaSecretarias--contenida {
    border-radius: 1.1rem;
    padding: 0.85rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cuadriculaSecretarias__skeletonBadge::after,
  .cuadriculaSecretarias__skeletonMini::after,
  .cuadriculaSecretarias__skeletonLinea::after,
  .cuadriculaSecretarias__skeletonAvatar::after,
  .cuadriculaSecretarias__skeletonMetricas span::after {
    animation: none;
  }
}
</style>
