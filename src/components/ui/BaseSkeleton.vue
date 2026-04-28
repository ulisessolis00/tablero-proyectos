<!-- src/components/ui/BaseSkeleton.vue -->

<template>
  <div class="baseSkeleton" :class="clasesSkeleton" :style="estilosSkeleton" aria-hidden="true">
    <template v-if="tipo === 'card'">
      <div class="baseSkeleton__header">
        <span class="baseSkeleton__avatar"></span>

        <div class="baseSkeleton__headerTextos">
          <span class="baseSkeleton__linea baseSkeleton__linea--media"></span>
          <span class="baseSkeleton__linea baseSkeleton__linea--corta"></span>
        </div>
      </div>

      <span class="baseSkeleton__linea baseSkeleton__linea--titulo"></span>
      <span class="baseSkeleton__linea baseSkeleton__linea--larga"></span>
      <span class="baseSkeleton__linea baseSkeleton__linea--media"></span>

      <div class="baseSkeleton__grid">
        <span></span>
        <span></span>
      </div>
    </template>

    <template v-else-if="tipo === 'kpi'">
      <div class="baseSkeleton__kpiSuperior">
        <span class="baseSkeleton__icono"></span>
        <span class="baseSkeleton__chip"></span>
      </div>

      <span class="baseSkeleton__linea baseSkeleton__linea--corta"></span>
      <span class="baseSkeleton__linea baseSkeleton__linea--valor"></span>
      <span class="baseSkeleton__linea baseSkeleton__linea--media"></span>
    </template>

    <template v-else-if="tipo === 'hero'">
      <span class="baseSkeleton__chip"></span>
      <span class="baseSkeleton__linea baseSkeleton__linea--heroTitulo"></span>
      <span class="baseSkeleton__linea baseSkeleton__linea--heroSubtitulo"></span>

      <div class="baseSkeleton__heroKpis">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </template>

    <template v-else-if="tipo === 'tabla'">
      <div v-for="fila in filasNormalizadas" :key="fila" class="baseSkeleton__filaTabla">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </template>

    <template v-else-if="tipo === 'lista'">
      <div v-for="item in filasNormalizadas" :key="item" class="baseSkeleton__itemLista">
        <span class="baseSkeleton__avatar"></span>

        <div class="baseSkeleton__itemListaTextos">
          <span class="baseSkeleton__linea baseSkeleton__linea--larga"></span>
          <span class="baseSkeleton__linea baseSkeleton__linea--media"></span>
        </div>
      </div>
    </template>

    <template v-else>
      <span
        v-for="linea in filasNormalizadas"
        :key="linea"
        class="baseSkeleton__linea"
        :class="obtenerClaseLinea(linea)"
      ></span>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tipo: {
    type: String,
    default: 'lineas',
    validator: (valor) => {
      return ['lineas', 'card', 'kpi', 'hero', 'tabla', 'lista'].includes(valor)
    },
  },
  filas: {
    type: Number,
    default: 3,
  },
  ancho: {
    type: String,
    default: '100%',
  },
  alto: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '#9f2241',
  },
  compacto: {
    type: Boolean,
    default: false,
  },
  animado: {
    type: Boolean,
    default: true,
  },
  variante: {
    type: String,
    default: 'claro',
    validator: (valor) => {
      return ['claro', 'glass', 'oscuro'].includes(valor)
    },
  },
})

const filasNormalizadas = computed(() => {
  const total = Number(props.filas)

  if (!Number.isFinite(total) || total < 1) {
    return ['skeleton-1']
  }

  return Array.from({ length: Math.min(total, 12) }, (_, indice) => {
    return `skeleton-${indice + 1}`
  })
})

const estilosSkeleton = computed(() => {
  return {
    '--base-skeleton-color': validarColor(props.color),
    '--base-skeleton-ancho': props.ancho,
    '--base-skeleton-alto': props.alto || 'auto',
  }
})

const clasesSkeleton = computed(() => {
  return {
    [`baseSkeleton--${props.tipo}`]: true,
    [`baseSkeleton--${props.variante}`]: true,
    'baseSkeleton--compacto': props.compacto,
    'baseSkeleton--animado': props.animado,
  }
})

function obtenerClaseLinea(linea) {
  const indice = Number(String(linea).split('-').pop())

  if (indice % 3 === 1) {
    return 'baseSkeleton__linea--larga'
  }

  if (indice % 3 === 2) {
    return 'baseSkeleton__linea--media'
  }

  return 'baseSkeleton__linea--corta'
}

function validarColor(valor) {
  if (/^#[0-9a-fA-F]{6}$/.test(valor || '')) {
    return valor
  }

  return '#9f2241'
}
</script>

<style scoped>
.baseSkeleton {
  width: var(--base-skeleton-ancho);
  height: var(--base-skeleton-alto);
}

.baseSkeleton--card,
.baseSkeleton--kpi,
.baseSkeleton--hero,
.baseSkeleton--tabla,
.baseSkeleton--lista {
  border: 1px solid rgba(159, 34, 65, 0.08);
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 18px 45px rgba(31, 41, 55, 0.055);
  padding: 1rem;
}

.baseSkeleton--glass {
  background: rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(14px);
}

.baseSkeleton--oscuro {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(31, 41, 55, 0.72);
}

.baseSkeleton--compacto {
  border-radius: 1rem;
  padding: 0.8rem;
}

.baseSkeleton__linea,
.baseSkeleton__avatar,
.baseSkeleton__icono,
.baseSkeleton__chip,
.baseSkeleton__grid span,
.baseSkeleton__heroKpis span,
.baseSkeleton__filaTabla span {
  position: relative;
  display: block;
  overflow: hidden;
  background: #e5e7eb;
}

.baseSkeleton--oscuro .baseSkeleton__linea,
.baseSkeleton--oscuro .baseSkeleton__avatar,
.baseSkeleton--oscuro .baseSkeleton__icono,
.baseSkeleton--oscuro .baseSkeleton__chip,
.baseSkeleton--oscuro .baseSkeleton__grid span,
.baseSkeleton--oscuro .baseSkeleton__heroKpis span,
.baseSkeleton--oscuro .baseSkeleton__filaTabla span {
  background: rgba(255, 255, 255, 0.16);
}

.baseSkeleton--animado .baseSkeleton__linea::after,
.baseSkeleton--animado .baseSkeleton__avatar::after,
.baseSkeleton--animado .baseSkeleton__icono::after,
.baseSkeleton--animado .baseSkeleton__chip::after,
.baseSkeleton--animado .baseSkeleton__grid span::after,
.baseSkeleton--animado .baseSkeleton__heroKpis span::after,
.baseSkeleton--animado .baseSkeleton__filaTabla span::after {
  position: absolute;
  inset: 0;
  content: '';
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.72), transparent);
  transform: translateX(-100%);
  animation: baseSkeletonBrillo 1.25s infinite;
}

.baseSkeleton__linea {
  height: 0.78rem;
  margin-top: 0.72rem;
  border-radius: 999px;
}

.baseSkeleton__linea:first-child {
  margin-top: 0;
}

.baseSkeleton__linea--corta {
  width: 38%;
}

.baseSkeleton__linea--media {
  width: 62%;
}

.baseSkeleton__linea--larga {
  width: 86%;
}

.baseSkeleton__linea--titulo {
  width: 78%;
  height: 1.05rem;
  margin-top: 1rem;
}

.baseSkeleton__linea--valor {
  width: 58%;
  height: 2.2rem;
}

.baseSkeleton__linea--heroTitulo {
  width: min(680px, 82%);
  height: clamp(2.4rem, 6vw, 4.4rem);
  margin-top: 1rem;
  border-radius: 1rem;
}

.baseSkeleton__linea--heroSubtitulo {
  width: min(520px, 72%);
  height: 1rem;
}

.baseSkeleton__header,
.baseSkeleton__kpiSuperior,
.baseSkeleton__itemLista {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.baseSkeleton__header {
  margin-bottom: 1rem;
}

.baseSkeleton__headerTextos,
.baseSkeleton__itemListaTextos {
  flex: 1;
  min-width: 0;
}

.baseSkeleton__avatar {
  flex: 0 0 auto;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 999px;
}

.baseSkeleton__icono {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.9rem;
}

.baseSkeleton__chip {
  width: 5.2rem;
  height: 1.55rem;
  border-radius: 999px;
}

.baseSkeleton__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
  margin-top: 1.1rem;
  border-top: 1px solid rgba(229, 231, 235, 0.85);
  padding-top: 1rem;
}

.baseSkeleton__grid span {
  height: 2.3rem;
  border-radius: 0.85rem;
}

.baseSkeleton__kpiSuperior {
  justify-content: space-between;
  margin-bottom: 1rem;
}

.baseSkeleton__heroKpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
  margin-top: 1.5rem;
}

.baseSkeleton__heroKpis span {
  height: 4.3rem;
  border-radius: 1rem;
  background: color-mix(in srgb, var(--base-skeleton-color) 10%, #e5e7eb);
}

.baseSkeleton__filaTabla {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 0.8fr 0.6fr;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(229, 231, 235, 0.8);
}

.baseSkeleton__filaTabla:last-child {
  border-bottom: 0;
}

.baseSkeleton__filaTabla span {
  height: 0.9rem;
  border-radius: 999px;
}

.baseSkeleton__itemLista {
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(229, 231, 235, 0.8);
}

.baseSkeleton__itemLista:last-child {
  border-bottom: 0;
}

@keyframes baseSkeletonBrillo {
  100% {
    transform: translateX(100%);
  }
}

@media (max-width: 760px) {
  .baseSkeleton__heroKpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .baseSkeleton__filaTabla {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .baseSkeleton__heroKpis,
  .baseSkeleton__grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .baseSkeleton--animado .baseSkeleton__linea::after,
  .baseSkeleton--animado .baseSkeleton__avatar::after,
  .baseSkeleton--animado .baseSkeleton__icono::after,
  .baseSkeleton--animado .baseSkeleton__chip::after,
  .baseSkeleton--animado .baseSkeleton__grid span::after,
  .baseSkeleton--animado .baseSkeleton__heroKpis span::after,
  .baseSkeleton--animado .baseSkeleton__filaTabla span::after {
    animation: none;
  }
}
</style>
