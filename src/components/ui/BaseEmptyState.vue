<!-- src/components/ui/BaseEmptyState.vue -->

<template>
  <section
    class="baseEmptyState"
    :class="clasesEmptyState"
    :style="estilosEmptyState"
    role="status"
    :aria-label="ariaLabel || titulo"
  >
    <div class="baseEmptyState__fondo" aria-hidden="true"></div>

    <div v-if="mostrarIcono" class="baseEmptyState__icono" aria-hidden="true">
      <component :is="iconoVisible" :size="tamanoIcono" stroke-width="2.1" />
    </div>

    <div class="baseEmptyState__contenido">
      <p v-if="etiqueta" class="baseEmptyState__etiqueta">
        {{ etiqueta }}
      </p>

      <component :is="tagTitulo" class="baseEmptyState__titulo">
        {{ titulo }}
      </component>

      <p v-if="mensaje" class="baseEmptyState__mensaje">
        {{ mensaje }}
      </p>
    </div>

    <div v-if="$slots.default" class="baseEmptyState__extra">
      <slot></slot>
    </div>

    <div v-if="mostrarAcciones" class="baseEmptyState__acciones">
      <slot name="acciones">
        <BaseButton
          v-if="textoAccion"
          :variante="varianteBoton"
          :to="to"
          :href="href"
          :color="color"
          @click="emitirAccion"
        >
          {{ textoAccion }}

          <template v-if="mostrarIconoAccion" #icono>
            <ArrowRight :size="16" stroke-width="2.4" />
          </template>
        </BaseButton>
      </slot>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import {
  ArrowRight,
  BarChart3,
  FileQuestion,
  FilterX,
  FolderOpen,
  Inbox,
  SearchX,
  WalletCards,
} from 'lucide-vue-next'

import BaseButton from './BaseButton.vue'

const props = defineProps({
  titulo: {
    type: String,
    default: 'No hay información para mostrar',
  },
  mensaje: {
    type: String,
    default: 'Todavía no hay datos disponibles para esta sección.',
  },
  etiqueta: {
    type: String,
    default: '',
  },
  tipo: {
    type: String,
    default: 'general',
    validator: (valor) => {
      return [
        'general',
        'filtros',
        'busqueda',
        'programas',
        'presupuesto',
        'graficas',
        'archivo',
      ].includes(valor)
    },
  },
  icono: {
    type: [Object, Function, String],
    default: null,
  },
  mostrarIcono: {
    type: Boolean,
    default: true,
  },
  tamanoIcono: {
    type: Number,
    default: 34,
  },
  color: {
    type: String,
    default: '#9f2241',
  },
  variante: {
    type: String,
    default: 'contenida',
    validator: (valor) => {
      return ['contenida', 'simple', 'compacta'].includes(valor)
    },
  },
  alineacion: {
    type: String,
    default: 'centro',
    validator: (valor) => {
      return ['izquierda', 'centro'].includes(valor)
    },
  },
  tagTitulo: {
    type: String,
    default: 'h3',
    validator: (valor) => {
      return ['h2', 'h3', 'h4', 'p'].includes(valor)
    },
  },
  textoAccion: {
    type: String,
    default: '',
  },
  varianteBoton: {
    type: String,
    default: 'secundario',
  },
  mostrarIconoAccion: {
    type: Boolean,
    default: true,
  },
  to: {
    type: [String, Object],
    default: null,
  },
  href: {
    type: String,
    default: '',
  },
  ariaLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['accion'])

const iconosPorTipo = Object.freeze({
  general: Inbox,
  filtros: FilterX,
  busqueda: SearchX,
  programas: FolderOpen,
  presupuesto: WalletCards,
  graficas: BarChart3,
  archivo: FileQuestion,
})

const iconoVisible = computed(() => {
  return props.icono || iconosPorTipo[props.tipo] || Inbox
})

const mostrarAcciones = computed(() => {
  return Boolean(props.textoAccion || props.to || props.href)
})

const estilosEmptyState = computed(() => {
  return {
    '--base-empty-state-color': validarColor(props.color),
  }
})

const clasesEmptyState = computed(() => {
  return {
    'baseEmptyState--simple': props.variante === 'simple',
    'baseEmptyState--compacta': props.variante === 'compacta',
    'baseEmptyState--izquierda': props.alineacion === 'izquierda',
  }
})

function emitirAccion(evento) {
  emit('accion', evento)
}

function validarColor(valor) {
  if (/^#[0-9a-fA-F]{6}$/.test(valor || '')) {
    return valor
  }

  return '#9f2241'
}
</script>

<style scoped>
.baseEmptyState {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 260px;
  overflow: hidden;
  border: 1px dashed color-mix(in srgb, var(--base-empty-state-color) 22%, #ffffff);
  border-radius: 1.35rem;
  background:
    radial-gradient(
      circle at top,
      color-mix(in srgb, var(--base-empty-state-color) 7%, transparent),
      transparent 16rem
    ),
    rgba(255, 255, 255, 0.72);
  box-shadow: 0 18px 45px rgba(31, 41, 55, 0.045);
  padding: clamp(1.35rem, 3vw, 2.25rem);
  text-align: center;
  isolation: isolate;
}

.baseEmptyState__fondo {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(
    135deg,
    transparent,
    color-mix(in srgb, var(--base-empty-state-color) 4%, transparent)
  );
  pointer-events: none;
}

.baseEmptyState__icono {
  display: grid;
  place-items: center;
  width: 4.15rem;
  height: 4.15rem;
  margin-bottom: 1rem;
  border: 1px solid color-mix(in srgb, var(--base-empty-state-color) 14%, #ffffff);
  border-radius: 1.25rem;
  background: color-mix(in srgb, var(--base-empty-state-color) 9%, #ffffff);
  color: var(--base-empty-state-color);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.72),
    0 14px 32px color-mix(in srgb, var(--base-empty-state-color) 8%, transparent);
}

.baseEmptyState__contenido {
  max-width: 620px;
}

.baseEmptyState__etiqueta {
  margin: 0 0 0.42rem;
  color: var(--base-empty-state-color);
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  line-height: 1.2;
  text-transform: uppercase;
}

.baseEmptyState__titulo {
  margin: 0;
  color: #111827;
  font-size: clamp(1rem, 2vw, 1.28rem);
  font-weight: 950;
  letter-spacing: -0.035em;
  line-height: 1.18;
  text-wrap: balance;
}

.baseEmptyState__mensaje {
  margin: 0.55rem auto 0;
  color: #6b7280;
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.55;
  text-wrap: pretty;
}

.baseEmptyState__extra {
  width: 100%;
  max-width: 620px;
  margin-top: 1rem;
}

.baseEmptyState__acciones {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 1.1rem;
}

.baseEmptyState--simple {
  min-height: auto;
  border-color: transparent;
  background: transparent;
  box-shadow: none;
}

.baseEmptyState--compacta {
  min-height: 180px;
  border-radius: 1rem;
  padding: 1.15rem;
}

.baseEmptyState--compacta .baseEmptyState__icono {
  width: 3.35rem;
  height: 3.35rem;
  margin-bottom: 0.75rem;
  border-radius: 1rem;
}

.baseEmptyState--compacta .baseEmptyState__mensaje {
  font-size: 0.82rem;
}

.baseEmptyState--izquierda {
  place-items: start;
  text-align: left;
}

.baseEmptyState--izquierda .baseEmptyState__mensaje {
  margin-left: 0;
}

.baseEmptyState--izquierda .baseEmptyState__acciones {
  justify-content: flex-start;
}

@media (max-width: 620px) {
  .baseEmptyState {
    min-height: 220px;
    border-radius: 1.1rem;
    padding: 1.25rem;
  }

  .baseEmptyState__acciones {
    width: 100%;
  }
}
</style>
