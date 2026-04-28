<!-- src/components/ui/BaseBadge.vue -->

<template>
  <component
    :is="componente"
    class="baseBadge"
    :class="clasesBadge"
    :style="estilosBadge"
    v-bind="atributosComponente"
    @click="manejarClick"
  >
    <span v-if="mostrarPunto" class="baseBadge__punto" aria-hidden="true"></span>

    <span v-if="$slots.icono" class="baseBadge__icono" aria-hidden="true">
      <slot name="icono"></slot>
    </span>

    <span class="baseBadge__texto">
      <slot>
        {{ texto }}
      </slot>
    </span>

    <span v-if="$slots.final" class="baseBadge__final" aria-hidden="true">
      <slot name="final"></slot>
    </span>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  texto: {
    type: [String, Number],
    default: '',
  },
  color: {
    type: String,
    default: '#9f2241',
  },
  variante: {
    type: String,
    default: 'suave',
    validator: (valor) => {
      return ['suave', 'solida', 'lineal', 'neutra', 'ghost'].includes(valor)
    },
  },
  tamanio: {
    type: String,
    default: 'medio',
    validator: (valor) => {
      return ['chico', 'medio', 'grande'].includes(valor)
    },
  },
  forma: {
    type: String,
    default: 'pill',
    validator: (valor) => {
      return ['pill', 'rounded', 'square'].includes(valor)
    },
  },
  estado: {
    type: String,
    default: '',
    validator: (valor) => {
      return [
        '',
        'completo',
        'parcial',
        'pendiente',
        'sinDatos',
        'conDatos',
        'alerta',
        'error',
        'info',
      ].includes(valor)
    },
  },
  mostrarPunto: {
    type: Boolean,
    default: false,
  },
  uppercase: {
    type: Boolean,
    default: true,
  },
  clickable: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
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
  title: {
    type: String,
    default: '',
  },
  ariaLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['click'])

const configuracionEstado = computed(() => {
  const estados = {
    completo: {
      color: '#059669',
      texto: 'Completo',
    },
    parcial: {
      color: '#b45309',
      texto: 'Parcial',
    },
    pendiente: {
      color: '#9ca3af',
      texto: 'Pendiente',
    },
    sinDatos: {
      color: '#6b7280',
      texto: 'Sin datos',
    },
    conDatos: {
      color: '#0d9488',
      texto: 'Con datos',
    },
    alerta: {
      color: '#d97706',
      texto: 'Revisar',
    },
    error: {
      color: '#dc2626',
      texto: 'Error',
    },
    info: {
      color: '#2563eb',
      texto: 'Info',
    },
  }

  return estados[props.estado] || null
})

const texto = computed(() => {
  if (props.texto !== '' && props.texto !== null && props.texto !== undefined) {
    return String(props.texto)
  }

  if (configuracionEstado.value?.texto) {
    return configuracionEstado.value.texto
  }

  return ''
})

const colorBadge = computed(() => {
  if (configuracionEstado.value?.color) {
    return configuracionEstado.value.color
  }

  return validarColor(props.color)
})

const esInteractivo = computed(() => {
  return Boolean(props.clickable || props.to || props.href)
})

const componente = computed(() => {
  if (props.to) {
    return RouterLink
  }

  if (props.href) {
    return 'a'
  }

  return esInteractivo.value ? 'button' : 'span'
})

const atributosComponente = computed(() => {
  const atributosBase = {
    title: props.title || texto.value || undefined,
    'aria-label': props.ariaLabel || undefined,
    'aria-disabled': props.disabled ? 'true' : undefined,
  }

  if (props.to) {
    return {
      ...atributosBase,
      to: props.to,
      tabindex: props.disabled ? -1 : undefined,
    }
  }

  if (props.href) {
    return {
      ...atributosBase,
      href: props.disabled ? undefined : props.href,
      target: props.target || undefined,
      rel: props.target === '_blank' ? 'noopener noreferrer' : undefined,
      tabindex: props.disabled ? -1 : undefined,
    }
  }

  if (esInteractivo.value) {
    return {
      ...atributosBase,
      type: 'button',
      disabled: props.disabled,
    }
  }

  return atributosBase
})

const estilosBadge = computed(() => {
  return {
    '--base-badge-color': colorBadge.value,
  }
})

const clasesBadge = computed(() => {
  return {
    [`baseBadge--${props.variante}`]: true,
    [`baseBadge--${props.tamanio}`]: true,
    [`baseBadge--${props.forma}`]: true,
    'baseBadge--uppercase': props.uppercase,
    'baseBadge--clickable': esInteractivo.value,
    'baseBadge--disabled': props.disabled,
  }
})

function manejarClick(evento) {
  if (props.disabled) {
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
.baseBadge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  border: 1px solid transparent;
  font: inherit;
  font-weight: 900;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  vertical-align: middle;
}

.baseBadge__texto {
  overflow: hidden;
  text-overflow: ellipsis;
}

.baseBadge__icono,
.baseBadge__final {
  display: inline-grid;
  place-items: center;
  flex: 0 0 auto;
}

.baseBadge__punto {
  flex: 0 0 auto;
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 999px;
  background: currentColor;
  box-shadow: 0 0 0 0.22rem color-mix(in srgb, currentColor 13%, transparent);
}

/* Tamaños */
.baseBadge--chico {
  gap: 0.28rem;
  min-height: 1.45rem;
  padding: 0.28rem 0.48rem;
  font-size: 0.62rem;
  letter-spacing: 0.055em;
}

.baseBadge--medio {
  gap: 0.34rem;
  min-height: 1.75rem;
  padding: 0.36rem 0.62rem;
  font-size: 0.68rem;
  letter-spacing: 0.06em;
}

.baseBadge--grande {
  gap: 0.42rem;
  min-height: 2.05rem;
  padding: 0.45rem 0.78rem;
  font-size: 0.74rem;
  letter-spacing: 0.065em;
}

/* Formas */
.baseBadge--pill {
  border-radius: 999px;
}

.baseBadge--rounded {
  border-radius: 0.62rem;
}

.baseBadge--square {
  border-radius: 0.28rem;
}

/* Variantes */
.baseBadge--suave {
  border-color: color-mix(in srgb, var(--base-badge-color) 18%, #ffffff);
  background: color-mix(in srgb, var(--base-badge-color) 9%, #ffffff);
  color: var(--base-badge-color);
}

.baseBadge--solida {
  border-color: var(--base-badge-color);
  background: var(--base-badge-color);
  color: #ffffff;
}

.baseBadge--lineal {
  border-color: color-mix(in srgb, var(--base-badge-color) 34%, #ffffff);
  background: transparent;
  color: var(--base-badge-color);
}

.baseBadge--neutra {
  border-color: #e5e7eb;
  background: #f3f4f6;
  color: #6b7280;
}

.baseBadge--ghost {
  border-color: transparent;
  background: transparent;
  color: var(--base-badge-color);
}

.baseBadge--uppercase {
  text-transform: uppercase;
}

.baseBadge--clickable {
  cursor: pointer;
  user-select: none;
  transition:
    transform 160ms ease,
    filter 160ms ease,
    background 160ms ease,
    border-color 160ms ease;
}

.baseBadge--clickable:hover {
  transform: translateY(-1px);
  filter: brightness(1.04);
}

.baseBadge--clickable:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--base-badge-color) 24%, transparent);
  outline-offset: 3px;
}

.baseBadge--disabled,
.baseBadge--disabled:hover {
  transform: none;
  filter: none;
  opacity: 0.55;
  cursor: not-allowed;
}

@media (prefers-reduced-motion: reduce) {
  .baseBadge--clickable {
    transition: none;
  }

  .baseBadge--clickable:hover {
    transform: none;
  }
}
</style>
