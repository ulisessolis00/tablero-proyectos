<!-- src/components/ui/BaseButton.vue -->

<template>
  <component
    :is="componente"
    class="baseButton"
    :class="clasesBoton"
    :style="estilosBoton"
    v-bind="atributosComponente"
    :aria-label="ariaLabel || undefined"
    :aria-busy="cargando ? 'true' : 'false'"
    :aria-disabled="estaDeshabilitado ? 'true' : undefined"
    @click="manejarClick"
  >
    <span v-if="cargando" class="baseButton__icono baseButton__icono--cargando" aria-hidden="true">
      <LoaderCircle :size="tamanoIconoNormalizado" stroke-width="2.4" />
    </span>

    <span
      v-else-if="$slots.icono && iconoPosicion === 'izquierda'"
      class="baseButton__icono"
      aria-hidden="true"
    >
      <slot name="icono"></slot>
    </span>

    <span v-if="$slots.default" class="baseButton__texto">
      <slot></slot>
    </span>

    <span
      v-if="!cargando && $slots.icono && iconoPosicion === 'derecha'"
      class="baseButton__icono"
      aria-hidden="true"
    >
      <slot name="icono"></slot>
    </span>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { LoaderCircle } from 'lucide-vue-next'

const props = defineProps({
  variante: {
    type: String,
    default: 'primario',
    validator: (valor) => {
      return [
        'primario',
        'secundario',
        'peligro',
        'ghost',
        'volver',
        'detalle',
        'limpiar',
      ].includes(valor)
    },
  },
  tamanio: {
    type: String,
    default: 'medio',
    validator: (valor) => {
      return ['chico', 'medio', 'grande'].includes(valor)
    },
  },
  type: {
    type: String,
    default: 'button',
    validator: (valor) => {
      return ['button', 'submit', 'reset'].includes(valor)
    },
  },
  to: {
    type: [String, Object],
    default: null,
  },
  href: {
    type: String,
    default: '',
  },
  target: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '#9f2241',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  cargando: {
    type: Boolean,
    default: false,
  },
  bloque: {
    type: Boolean,
    default: false,
  },
  iconoPosicion: {
    type: String,
    default: 'izquierda',
    validator: (valor) => {
      return ['izquierda', 'derecha'].includes(valor)
    },
  },
  ariaLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['click'])

const estaDeshabilitado = computed(() => {
  return props.disabled || props.cargando
})

const componente = computed(() => {
  if (props.to) {
    return RouterLink
  }

  if (props.href) {
    return 'a'
  }

  return 'button'
})

const atributosComponente = computed(() => {
  if (props.to) {
    return {
      to: props.to,
      tabindex: estaDeshabilitado.value ? -1 : undefined,
    }
  }

  if (props.href) {
    return {
      href: estaDeshabilitado.value ? undefined : props.href,
      target: props.target || undefined,
      rel: props.target === '_blank' ? 'noopener noreferrer' : undefined,
      tabindex: estaDeshabilitado.value ? -1 : undefined,
    }
  }

  return {
    type: props.type,
    disabled: estaDeshabilitado.value,
  }
})

const estilosBoton = computed(() => {
  return {
    '--base-button-color': validarColor(props.color),
  }
})

const clasesBoton = computed(() => {
  return {
    [`baseButton--${props.variante}`]: true,
    [`baseButton--${props.tamanio}`]: true,
    'baseButton--bloque': props.bloque,
    'baseButton--cargando': props.cargando,
    'baseButton--deshabilitado': estaDeshabilitado.value,
  }
})

const tamanoIconoNormalizado = computed(() => {
  const tamanios = {
    chico: 15,
    medio: 17,
    grande: 19,
  }

  return tamanios[props.tamanio] || tamanios.medio
})

function manejarClick(evento) {
  if (estaDeshabilitado.value) {
    evento.preventDefault()
    evento.stopPropagation()
    return
  }

  emit('click', evento)
}

function validarColor(valor) {
  if (/^#[0-9a-fA-F]{6}$/.test(valor || '')) {
    return valor
  }

  return '#9f2241'
}
</script>

<style scoped>
.baseButton {
  --base-button-texto: #ffffff;
  --base-button-fondo: var(--base-button-color);
  --base-button-borde: var(--base-button-color);
  --base-button-sombra: color-mix(in srgb, var(--base-button-color) 20%, transparent);

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.48rem;
  max-width: 100%;
  border: 1px solid var(--base-button-borde);
  border-radius: 0.9rem;
  background: var(--base-button-fondo);
  box-shadow: 0 12px 24px var(--base-button-sombra);
  color: var(--base-button-texto);
  font: inherit;
  font-weight: 900;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease,
    border-color 180ms ease,
    color 180ms ease,
    opacity 180ms ease;
}

.baseButton:hover {
  transform: translateY(-1px);
  filter: brightness(1.04);
}

.baseButton:active {
  transform: translateY(0);
}

.baseButton:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--base-button-color) 28%, transparent);
  outline-offset: 3px;
}

.baseButton--chico {
  min-height: 2.2rem;
  padding: 0.52rem 0.72rem;
  font-size: 0.74rem;
}

.baseButton--medio {
  min-height: 2.75rem;
  padding: 0.7rem 0.95rem;
  font-size: 0.82rem;
}

.baseButton--grande {
  min-height: 3.15rem;
  padding: 0.85rem 1.15rem;
  font-size: 0.9rem;
}

.baseButton--bloque {
  width: 100%;
}

.baseButton__texto {
  overflow: hidden;
  text-overflow: ellipsis;
}

.baseButton__icono {
  display: inline-grid;
  place-items: center;
  flex: 0 0 auto;
}

.baseButton__icono--cargando {
  animation: baseButtonGirar 850ms linear infinite;
}

.baseButton--primario {
  --base-button-texto: #ffffff;
  --base-button-fondo: var(--base-button-color);
  --base-button-borde: var(--base-button-color);
}

.baseButton--secundario {
  --base-button-texto: var(--base-button-color);
  --base-button-fondo: color-mix(in srgb, var(--base-button-color) 9%, #ffffff);
  --base-button-borde: color-mix(in srgb, var(--base-button-color) 18%, #ffffff);
  --base-button-sombra: rgba(31, 41, 55, 0.04);
}

.baseButton--peligro {
  --base-button-texto: #ffffff;
  --base-button-fondo: #dc2626;
  --base-button-borde: #dc2626;
  --base-button-sombra: rgba(220, 38, 38, 0.18);
}

.baseButton--ghost {
  --base-button-texto: #374151;
  --base-button-fondo: transparent;
  --base-button-borde: transparent;
  --base-button-sombra: transparent;
}

.baseButton--volver {
  --base-button-texto: #374151;
  --base-button-fondo: rgba(255, 255, 255, 0.72);
  --base-button-borde: rgba(159, 34, 65, 0.12);
  --base-button-sombra: rgba(31, 41, 55, 0.05);

  border-radius: 999px;
}

.baseButton--detalle {
  --base-button-texto: #ffffff;
  --base-button-fondo: var(--base-button-color);
  --base-button-borde: var(--base-button-color);
}

.baseButton--limpiar {
  --base-button-texto: #6b7280;
  --base-button-fondo: #f3f4f6;
  --base-button-borde: #f3f4f6;
  --base-button-sombra: transparent;
}

.baseButton--limpiar:hover {
  --base-button-texto: #9f2241;
  --base-button-fondo: rgba(159, 34, 65, 0.08);
  --base-button-borde: rgba(159, 34, 65, 0.08);
}

.baseButton--deshabilitado,
.baseButton--deshabilitado:hover {
  transform: none;
  filter: none;
  opacity: 0.55;
  box-shadow: none;
  cursor: not-allowed;
}

@keyframes baseButtonGirar {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .baseButton,
  .baseButton__icono--cargando {
    transition: none;
    animation: none;
  }

  .baseButton:hover {
    transform: none;
  }
}
</style>
