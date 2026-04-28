<!-- src/components/kpis/FilaResumenKpis.vue -->

<template>
  <section class="filaResumenKpis" :class="clasesFila" :style="estilosFila" :aria-label="ariaLabel">
    <header v-if="mostrarEncabezado" class="filaResumenKpis__encabezado">
      <div class="filaResumenKpis__encabezadoTextos">
        <span v-if="etiqueta" class="filaResumenKpis__etiqueta">
          {{ etiqueta }}
        </span>

        <h2>{{ titulo }}</h2>

        <p v-if="subtitulo">
          {{ subtitulo }}
        </p>
      </div>

      <div v-if="$slots.acciones" class="filaResumenKpis__acciones">
        <slot name="acciones"></slot>
      </div>
    </header>

    <div v-if="cargando" class="filaResumenKpis__grid" aria-live="polite">
      <article
        v-for="item in skeletons"
        :key="item"
        class="filaResumenKpis__skeleton"
        aria-hidden="true"
      >
        <div class="filaResumenKpis__skeletonIcono"></div>
        <div class="filaResumenKpis__skeletonLinea filaResumenKpis__skeletonLinea--corta"></div>
        <div class="filaResumenKpis__skeletonLinea filaResumenKpis__skeletonLinea--larga"></div>
        <div class="filaResumenKpis__skeletonLinea filaResumenKpis__skeletonLinea--media"></div>
      </article>
    </div>

    <div v-else-if="kpisNormalizados.length > 0" class="filaResumenKpis__grid">
      <TarjetaKpi
        v-for="kpi in kpisNormalizados"
        :key="kpi.id"
        :titulo="kpi.titulo"
        :valor="kpi.valor"
        :subtitulo="kpi.subtitulo"
        :color="kpi.color"
        :icono="kpi.icono"
        :estado="kpi.estado"
        :mostrar-estado="kpi.mostrarEstado"
        :texto-estado-personalizado="kpi.textoEstadoPersonalizado"
        :compacto="compacto"
      />
    </div>

    <div v-else class="filaResumenKpis__vacio" role="status">
      <p class="filaResumenKpis__vacioTitulo">Sin indicadores disponibles</p>

      <p class="filaResumenKpis__vacioTexto">
        {{ mensajeVacio }}
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import TarjetaKpi from './TarjetaKpi.vue'

const props = defineProps({
  titulo: {
    type: String,
    default: '',
  },
  subtitulo: {
    type: String,
    default: '',
  },
  etiqueta: {
    type: String,
    default: '',
  },
  kpis: {
    type: Array,
    default: () => [],
  },
  columnas: {
    type: Number,
    default: 4,
  },
  compacto: {
    type: Boolean,
    default: false,
  },
  cargando: {
    type: Boolean,
    default: false,
  },
  cantidadSkeleton: {
    type: Number,
    default: 4,
  },
  mensajeVacio: {
    type: String,
    default: 'Todavía no hay información suficiente para mostrar estos indicadores.',
  },
  mostrarEncabezado: {
    type: Boolean,
    default: false,
  },
  variante: {
    type: String,
    default: 'normal',
    validator: (valor) => {
      return ['normal', 'contenida', 'transparente'].includes(valor)
    },
  },
  ariaLabel: {
    type: String,
    default: 'Resumen de indicadores',
  },
})

const kpisNormalizados = computed(() => {
  return props.kpis
    .filter((kpi) => kpi && typeof kpi === 'object')
    .map((kpi, indice) => {
      return {
        id: kpi.id || `kpi-${indice}`,
        titulo: kpi.titulo || 'Indicador',
        valor: kpi.valor ?? '—',
        subtitulo: kpi.subtitulo || '',
        color: kpi.color || '#9f2241',
        icono: kpi.icono || null,
        estado: kpi.estado || 'neutral',
        mostrarEstado: kpi.mostrarEstado === true,
        textoEstadoPersonalizado: kpi.textoEstadoPersonalizado || '',
      }
    })
})

const columnasNormalizadas = computed(() => {
  const columnas = Number(props.columnas)

  if (!Number.isFinite(columnas)) {
    return 4
  }

  if (columnas < 1) {
    return 1
  }

  if (columnas > 6) {
    return 6
  }

  return Math.round(columnas)
})

const skeletons = computed(() => {
  const total = Math.max(1, Math.min(props.cantidadSkeleton, 6))

  return Array.from({ length: total }, (_, indice) => {
    return `skeleton-${indice + 1}`
  })
})

const estilosFila = computed(() => {
  return {
    '--fila-kpis-columnas': columnasNormalizadas.value,
  }
})

const clasesFila = computed(() => {
  return {
    'filaResumenKpis--compacta': props.compacto,
    'filaResumenKpis--contenida': props.variante === 'contenida',
    'filaResumenKpis--transparente': props.variante === 'transparente',
  }
})
</script>

<style scoped>
.filaResumenKpis {
  width: 100%;
}

.filaResumenKpis--contenida {
  border: 1px solid rgba(159, 34, 65, 0.1);
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 18px 45px rgba(31, 41, 55, 0.06);
  backdrop-filter: blur(14px);
  padding: clamp(1rem, 2.4vw, 1.35rem);
}

.filaResumenKpis--transparente {
  background: transparent;
  box-shadow: none;
  padding: 0;
}

.filaResumenKpis__encabezado {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.filaResumenKpis__etiqueta {
  margin: 0 0 0.35rem;
  color: #9f2241;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.filaResumenKpis__titulo {
  margin: 0;
  color: #111827;
  font-size: clamp(1.15rem, 2.2vw, 1.55rem);
  font-weight: 950;
  letter-spacing: -0.035em;
  line-height: 1.05;
}

.filaResumenKpis__subtitulo {
  max-width: 760px;
  margin: 0.45rem 0 0;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.5;
}

.filaResumenKpis__grid {
  display: grid;
  grid-template-columns: repeat(var(--fila-kpis-columnas), minmax(0, 1fr));
  gap: clamp(0.85rem, 1.8vw, 1rem);
}

.filaResumenKpis__vacio {
  border: 1px dashed rgba(159, 34, 65, 0.2);
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.62);
  padding: 1.25rem;
  text-align: center;
}

.filaResumenKpis__vacioTitulo {
  margin: 0;
  color: #111827;
  font-size: 0.95rem;
  font-weight: 900;
}

.filaResumenKpis__vacioTexto {
  max-width: 520px;
  margin: 0.35rem auto 0;
  color: #6b7280;
  font-size: 0.86rem;
  font-weight: 600;
  line-height: 1.45;
}

.filaResumenKpis__skeleton {
  min-height: 150px;
  border: 1px solid rgba(159, 34, 65, 0.08);
  border-radius: 1.35rem;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 18px 45px rgba(31, 41, 55, 0.05);
  padding: 1.15rem;
}

.filaResumenKpis__skeletonIcono,
.filaResumenKpis__skeletonLinea {
  position: relative;
  overflow: hidden;
  border-radius: 999px;
  background: #e5e7eb;
}

.filaResumenKpis__skeletonIcono::after,
.filaResumenKpis__skeletonLinea::after {
  position: absolute;
  inset: 0;
  content: '';
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.72), transparent);
  transform: translateX(-100%);
  animation: skeletonBrillo 1.2s infinite;
}

.filaResumenKpis__skeletonIcono {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 1rem;
  margin-bottom: 1.1rem;
}

.filaResumenKpis__skeletonLinea {
  height: 0.7rem;
  margin-top: 0.75rem;
}

.filaResumenKpis__skeletonLinea--corta {
  width: 42%;
}

.filaResumenKpis__skeletonLinea--larga {
  width: 68%;
  height: 1.65rem;
}

.filaResumenKpis__skeletonLinea--media {
  width: 56%;
}

.filaResumenKpis--compacta .filaResumenKpis__skeleton {
  min-height: 118px;
  border-radius: 1rem;
}

.filaResumenKpis__encabezado {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.filaResumenKpis__encabezadoTextos {
  min-width: 0;
}

.filaResumenKpis__acciones {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 0 auto;
}

@media (max-width: 720px) {
  .filaResumenKpis__encabezado {
    flex-direction: column;
  }

  .filaResumenKpis__acciones {
    width: 100%;
    justify-content: flex-start;
  }
}

@keyframes skeletonBrillo {
  100% {
    transform: translateX(100%);
  }
}

@media (max-width: 1180px) {
  .filaResumenKpis__grid {
    grid-template-columns: repeat(min(var(--fila-kpis-columnas), 3), minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .filaResumenKpis__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filaResumenKpis__encabezado {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 620px) {
  .filaResumenKpis__grid {
    grid-template-columns: 1fr;
  }

  .filaResumenKpis--contenida {
    border-radius: 1.1rem;
    padding: 0.9rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .filaResumenKpis__skeletonIcono::after,
  .filaResumenKpis__skeletonLinea::after {
    animation: none;
  }
}
</style>
