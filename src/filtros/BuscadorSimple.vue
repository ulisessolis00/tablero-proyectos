<!-- src/components/filtros/BuscadorSimple.vue -->

<template>
  <div class="buscadorSimple" :class="clasesBuscador" :style="estilosBuscador">
    <div class="buscadorSimple__superior">
      <label v-if="mostrarLabel" class="buscadorSimple__label" :for="id">
        <Search :size="15" stroke-width="2.3" />
        {{ label }}
      </label>

      <button
        v-if="mostrarLimpiar && hayBusqueda"
        class="buscadorSimple__limpiar"
        type="button"
        :disabled="disabled"
        @click="limpiarBusqueda"
      >
        <X :size="14" stroke-width="2.4" />
        Limpiar
      </button>
    </div>

    <div
      class="buscadorSimple__inputWrapper"
      :class="{
        'buscadorSimple__inputWrapper--focus': tieneFocus,
        'buscadorSimple__inputWrapper--disabled': disabled,
      }"
    >
      <Search class="buscadorSimple__icono" :size="18" stroke-width="2.3" aria-hidden="true" />

      <input
        :id="id"
        ref="inputBusqueda"
        v-model="valorInterno"
        class="buscadorSimple__input"
        type="search"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxlength || undefined"
        :autocomplete="autocomplete"
        :aria-label="label"
        @focus="manejarFocus"
        @blur="manejarBlur"
        @keydown.enter.prevent="emitirBusquedaInmediata"
        @keydown.esc.prevent="limpiarBusqueda"
      />

      <button
        v-if="hayBusqueda"
        class="buscadorSimple__botonIcono"
        type="button"
        :disabled="disabled"
        aria-label="Limpiar búsqueda"
        @click="limpiarBusqueda"
      >
        <X :size="17" stroke-width="2.4" />
      </button>
    </div>

    <p v-if="mensajeAyuda" class="buscadorSimple__ayuda">
      {{ mensajeAyuda }}
    </p>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { Search, X } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: 'buscador-simple',
  },
  name: {
    type: String,
    default: 'busqueda',
  },
  label: {
    type: String,
    default: 'Buscar',
  },
  placeholder: {
    type: String,
    default: 'Buscar secretaría, programa o proyecto...',
  },
  mensajeAyuda: {
    type: String,
    default: '',
  },
  debounce: {
    type: Number,
    default: 250,
  },
  maxlength: {
    type: Number,
    default: 120,
  },
  autocomplete: {
    type: String,
    default: 'off',
  },
  color: {
    type: String,
    default: '#9f2241',
  },
  compacto: {
    type: Boolean,
    default: false,
  },
  mostrarLabel: {
    type: Boolean,
    default: true,
  },
  mostrarLimpiar: {
    type: Boolean,
    default: true,
  },
  limpiarEspacios: {
    type: Boolean,
    default: true,
  },
  autofocus: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'buscar', 'limpiar', 'focus', 'blur'])

const inputBusqueda = ref(null)
const tieneFocus = ref(false)

let timeoutBusqueda = null

const valorInterno = computed({
  get() {
    return props.modelValue || ''
  },
  set(valor) {
    actualizarBusqueda(valor)
  },
})

const hayBusqueda = computed(() => {
  return limpiarValor(props.modelValue).length > 0
})

const colorNormalizado = computed(() => {
  return validarColor(props.color)
})

const estilosBuscador = computed(() => {
  return {
    '--buscador-simple-color': colorNormalizado.value,
  }
})

const clasesBuscador = computed(() => {
  return {
    'buscadorSimple--compacto': props.compacto,
  }
})

onBeforeUnmount(() => {
  limpiarTimeoutBusqueda()
})

if (props.autofocus) {
  nextTick(() => {
    enfocar()
  })
}

function actualizarBusqueda(valor) {
  const valorSeguro = limpiarValor(valor, false)

  emit('update:modelValue', valorSeguro)

  limpiarTimeoutBusqueda()

  timeoutBusqueda = window.setTimeout(() => {
    emitirBusqueda(valorSeguro)
  }, props.debounce)
}

function emitirBusquedaInmediata() {
  limpiarTimeoutBusqueda()
  emitirBusqueda(props.modelValue)
}

function emitirBusqueda(valor) {
  const valorLimpio = limpiarValor(valor)

  emit('buscar', {
    valor: valorLimpio,
    longitud: valorLimpio.length,
    activo: valorLimpio.length > 0,
  })
}

function limpiarBusqueda() {
  if (props.disabled) {
    return
  }

  limpiarTimeoutBusqueda()

  emit('update:modelValue', '')

  emit('buscar', {
    valor: '',
    longitud: 0,
    activo: false,
  })

  emit('limpiar')

  nextTick(() => {
    enfocar()
  })
}

function limpiarValor(valor, compactar = props.limpiarEspacios) {
  const texto = String(valor ?? '')

  if (!compactar) {
    return texto
  }

  return texto.replace(/\s+/g, ' ').trim()
}

function limpiarTimeoutBusqueda() {
  if (timeoutBusqueda) {
    window.clearTimeout(timeoutBusqueda)
    timeoutBusqueda = null
  }
}

function manejarFocus(evento) {
  tieneFocus.value = true
  emit('focus', evento)
}

function manejarBlur(evento) {
  tieneFocus.value = false
  emit('blur', evento)
}

function enfocar() {
  inputBusqueda.value?.focus()
}

function validarColor(valor) {
  if (/^#[0-9a-fA-F]{6}$/.test(valor || '')) {
    return valor
  }

  return '#9f2241'
}

defineExpose({
  enfocar,
  limpiarBusqueda,
})
</script>

<style scoped>
.buscadorSimple {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  width: 100%;
  min-width: 0;
}

.buscadorSimple__superior {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.buscadorSimple__label {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  color: #374151;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  line-height: 1.2;
  text-transform: uppercase;
}

.buscadorSimple__label svg {
  color: var(--buscador-simple-color);
}

.buscadorSimple__limpiar {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border: 0;
  background: transparent;
  color: #9f2241;
  padding: 0;
  font: inherit;
  font-size: 0.74rem;
  font-weight: 850;
  cursor: pointer;
}

.buscadorSimple__limpiar:hover:not(:disabled) {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.buscadorSimple__limpiar:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.buscadorSimple__inputWrapper {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 2.95rem;
  border: 1px solid rgba(159, 34, 65, 0.12);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.82);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease,
    opacity 180ms ease;
}

.buscadorSimple__inputWrapper--focus {
  border-color: color-mix(in srgb, var(--buscador-simple-color) 40%, #ffffff);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--buscador-simple-color) 9%, transparent);
}

.buscadorSimple__inputWrapper--disabled {
  opacity: 0.6;
}

.buscadorSimple__icono {
  flex: 0 0 auto;
  margin-left: 0.9rem;
  color: #9ca3af;
}

.buscadorSimple__input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: #1f2937;
  padding: 0 0.85rem;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 700;
}

.buscadorSimple__input::placeholder {
  color: #9ca3af;
  font-weight: 600;
}

.buscadorSimple__input:disabled {
  cursor: not-allowed;
}

.buscadorSimple__input::-webkit-search-cancel-button {
  appearance: none;
}

.buscadorSimple__botonIcono {
  display: inline-grid;
  place-items: center;
  flex: 0 0 auto;
  width: 2rem;
  height: 2rem;
  margin-right: 0.5rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  transition:
    background 160ms ease,
    color 160ms ease;
}

.buscadorSimple__botonIcono:hover:not(:disabled) {
  background: color-mix(in srgb, var(--buscador-simple-color) 8%, #ffffff);
  color: var(--buscador-simple-color);
}

.buscadorSimple__botonIcono:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.buscadorSimple__ayuda {
  margin: 0;
  color: #6b7280;
  font-size: 0.76rem;
  font-weight: 650;
  line-height: 1.4;
}

.buscadorSimple--compacto {
  gap: 0.42rem;
}

.buscadorSimple--compacto .buscadorSimple__inputWrapper {
  min-height: 2.4rem;
  border-radius: 0.85rem;
}

.buscadorSimple--compacto .buscadorSimple__input {
  font-size: 0.82rem;
}

@media (max-width: 640px) {
  .buscadorSimple__superior {
    align-items: flex-start;
    flex-direction: column;
  }

  .buscadorSimple__limpiar {
    align-self: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .buscadorSimple__inputWrapper,
  .buscadorSimple__botonIcono {
    transition: none;
  }
}
</style>
