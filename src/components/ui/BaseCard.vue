<!-- src/components/ui/BaseCard.vue -->

<template>
  <component
    :is="componente"
    class="baseCard"
    :class="clasesCard"
    :style="estilosCard"
    v-bind="atributosComponente"
    @click="manejarClick"
  >
    <div v-if="mostrarDecoracion" class="baseCard__decoracion" aria-hidden="true"></div>

    <header v-if="$slots.header || titulo || subtitulo || $slots.acciones" class="baseCard__header">
      <div class="baseCard__headerTexto">
        <p v-if="etiqueta" class="baseCard__etiqueta">
          {{ etiqueta }}
        </p>

        <component :is="tagTitulo" v-if="titulo || $slots.titulo" class="baseCard__titulo">
          <slot name="titulo">
            {{ titulo }}
          </slot>
        </component>

        <p v-if="subtitulo" class="baseCard__subtitulo">
          {{ subtitulo }}
        </p>

        <slot name="header"></slot>
      </div>

      <div v-if="$slots.acciones" class="baseCard__acciones">
        <slot name="acciones"></slot>
      </div>
    </header>

    <div v-if="$slots.default" class="baseCard__body">
      <slot></slot>
    </div>

    <footer v-if="$slots.footer" class="baseCard__footer">
      <slot name="footer"></slot>
    </footer>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

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
  tagTitulo: {
    type: String,
    default: 'h3',
    validator: (valor) => {
      return ['h2', 'h3', 'h4', 'p'].includes(valor)
    },
  },
  variante: {
    type: String,
    default: 'default',
    validator: (valor) => {
      return ['default', 'elevada', 'plana', 'glass', 'outline', 'ghost'].includes(valor)
    },
  },
  padding: {
    type: String,
    default: 'normal',
    validator: (valor) => {
      return ['none', 'chico', 'normal', 'grande'].includes(valor)
    },
  },
  radio: {
    type: String,
    default: 'normal',
    validator: (valor) => {
      return ['chico', 'normal', 'grande', 'full'].includes(valor)
    },
  },
  color: {
    type: String,
    default: '#9f2241',
  },
  mostrarDecoracion: {
    type: Boolean,
    default: false,
  },
  hover: {
    type: Boolean,
    default: true,
  },
  clickable: {
    type: Boolean,
    default: false,
  },
  activa: {
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
  ariaLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['click'])

const esInteractiva = computed(() => {
  return Boolean(props.clickable || props.to || props.href)
})

const componente = computed(() => {
  if (props.to) {
    return RouterLink
  }

  if (props.href) {
    return 'a'
  }

  return esInteractiva.value ? 'button' : 'article'
})

const atributosComponente = computed(() => {
  const base = {
    'aria-label': props.ariaLabel || undefined,
    'aria-disabled': props.disabled ? 'true' : undefined,
  }

  if (props.to) {
    return {
      ...base,
      to: props.to,
      tabindex: props.disabled ? -1 : undefined,
    }
  }

  if (props.href) {
    return {
      ...base,
      href: props.disabled ? undefined : props.href,
      target: props.target || undefined,
      rel: props.target === '_blank' ? 'noopener noreferrer' : undefined,
      tabindex: props.disabled ? -1 : undefined,
    }
  }

  if (esInteractiva.value) {
    return {
      ...base,
      type: 'button',
      disabled: props.disabled,
    }
  }

  return base
})

const estilosCard = computed(() => {
  return {
    '--base-card-color': validarColor(props.color),
  }
})

const clasesCard = computed(() => {
  return {
    [`baseCard--${props.variante}`]: true,
    [`baseCard--padding-${props.padding}`]: true,
    [`baseCard--radio-${props.radio}`]: true,
    'baseCard--hover': props.hover,
    'baseCard--clickable': esInteractiva.value,
    'baseCard--activa': props.activa,
    'baseCard--disabled': props.disabled,
    'baseCard--decorada': props.mostrarDecoracion,
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
.baseCard {
  position: relative;
  display: block;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(159, 34, 65, 0.1);
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 18px 45px rgba(31, 41, 55, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.88);
  color: #111827;
  text-align: left;
  text-decoration: none;
  isolation: isolate;
}

.baseCard--clickable {
  border: 1px solid rgba(159, 34, 65, 0.1);
  font: inherit;
  cursor: pointer;
}

.baseCard--disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.baseCard--padding-none {
  padding: 0;
}

.baseCard--padding-chico {
  padding: 0.85rem;
}

.baseCard--padding-normal {
  padding: 1.15rem;
}

.baseCard--padding-grande {
  padding: 1.45rem;
}

.baseCard--radio-chico {
  border-radius: 0.85rem;
}

.baseCard--radio-normal {
  border-radius: 1.2rem;
}

.baseCard--radio-grande {
  border-radius: 1.55rem;
}

.baseCard--radio-full {
  border-radius: 2rem;
}

.baseCard--elevada {
  box-shadow:
    0 24px 56px rgba(31, 41, 55, 0.09),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.baseCard--plana {
  box-shadow: none;
  background: #ffffff;
}

.baseCard--glass {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(14px);
}

.baseCard--outline {
  background: transparent;
  box-shadow: none;
  border-color: rgba(159, 34, 65, 0.16);
}

.baseCard--ghost {
  border-color: transparent;
  background: transparent;
  box-shadow: none;
}

.baseCard--activa {
  border-color: color-mix(in srgb, var(--base-card-color) 34%, #ffffff);
  box-shadow:
    0 22px 50px rgba(31, 41, 55, 0.08),
    0 0 0 4px color-mix(in srgb, var(--base-card-color) 8%, transparent);
}

.baseCard--decorada {
  padding-left: calc(var(--base-card-padding-left, 1.15rem) + 0.3rem);
}

.baseCard__decoracion {
  position: absolute;
  inset: 0 auto 0 0;
  width: 0.38rem;
  background: linear-gradient(
    180deg,
    var(--base-card-color),
    color-mix(in srgb, var(--base-card-color) 42%, #ffffff)
  );
}

.baseCard__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  min-width: 0;
}

.baseCard__headerTexto {
  min-width: 0;
}

.baseCard__etiqueta {
  margin: 0 0 0.35rem;
  color: var(--base-card-color);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  line-height: 1.2;
  text-transform: uppercase;
}

.baseCard__titulo {
  margin: 0;
  color: #111827;
  font-size: 1rem;
  font-weight: 950;
  letter-spacing: -0.025em;
  line-height: 1.2;
  text-wrap: balance;
}

.baseCard__subtitulo {
  margin: 0.42rem 0 0;
  color: #6b7280;
  font-size: 0.84rem;
  font-weight: 600;
  line-height: 1.48;
}

.baseCard__acciones {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 0 auto;
  gap: 0.55rem;
}

.baseCard__body {
  min-width: 0;
}

.baseCard__header + .baseCard__body {
  margin-top: 0.9rem;
}

.baseCard__footer {
  margin-top: 1rem;
  border-top: 1px solid rgba(229, 231, 235, 0.9);
  padding-top: 0.9rem;
}

.baseCard:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--base-card-color) 28%, transparent);
  outline-offset: 4px;
}

@media (prefers-reduced-motion: no-preference) {
  .baseCard--hover {
    transition:
      transform 180ms ease,
      box-shadow 180ms ease,
      border-color 180ms ease,
      background 180ms ease;
  }

  .baseCard--hover:hover:not(.baseCard--disabled) {
    transform: translateY(-3px);
    border-color: color-mix(in srgb, var(--base-card-color) 28%, #ffffff);
    box-shadow:
      0 24px 54px rgba(31, 41, 55, 0.09),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }

  .baseCard--ghost.baseCard--hover:hover:not(.baseCard--disabled) {
    background: rgba(255, 255, 255, 0.62);
  }
}

@media (max-width: 640px) {
  .baseCard__header {
    flex-direction: column;
  }

  .baseCard__acciones {
    justify-content: flex-start;
    width: 100%;
  }

  .baseCard--padding-grande {
    padding: 1.1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .baseCard--hover {
    transition: none;
  }

  .baseCard--hover:hover:not(.baseCard--disabled) {
    transform: none;
  }
}
</style>
