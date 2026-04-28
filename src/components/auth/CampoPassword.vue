<!-- src/components/auth/CampoPassword.vue -->

<template>
  <div class="campoPassword">
    <label class="campoPassword__label" :for="id">
      {{ label }}

      <span v-if="required" class="campoPassword__required" aria-hidden="true"> * </span>
    </label>

    <div class="campoPassword__inputWrapper" :class="clasesInput">
      <LockKeyhole class="campoPassword__icono" :size="18" stroke-width="2" aria-hidden="true" />

      <input
        :id="id"
        ref="inputPassword"
        class="campoPassword__input"
        :type="mostrarPassword ? 'text' : 'password'"
        :name="name"
        :value="modelValue"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength || undefined"
        :minlength="minlength || undefined"
        :aria-invalid="Boolean(errorVisible)"
        :aria-describedby="ariaDescribedby"
        @input="actualizarValor"
        @blur="emitirBlur"
        @focus="emitirFocus"
        @keydown="detectarBloqMayus"
        @keyup="detectarBloqMayus"
      />

      <button
        class="campoPassword__toggle"
        type="button"
        :disabled="disabled || readonly"
        :aria-label="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
        :aria-pressed="mostrarPassword ? 'true' : 'false'"
        @click="alternarVisibilidad"
      >
        <EyeOff v-if="mostrarPassword" :size="18" stroke-width="2" aria-hidden="true" />

        <Eye v-else :size="18" stroke-width="2" aria-hidden="true" />
      </button>
    </div>

    <p v-if="errorVisible" :id="idError" class="campoPassword__error">
      {{ errorVisible }}
    </p>

    <p
      v-else-if="mostrarAvisoBloqMayus && bloqMayusActivo"
      :id="idBloqMayus"
      class="campoPassword__aviso"
    >
      <TriangleAlert :size="15" stroke-width="2.2" aria-hidden="true" />
      <span>Bloq Mayús está activado.</span>
    </p>

    <div
      v-if="mostrarFortaleza && modelValue"
      class="campoPassword__fortaleza"
      :aria-label="`Fortaleza de contraseña: ${textoFortaleza}`"
    >
      <div class="campoPassword__barraFortaleza">
        <span
          v-for="segmento in 4"
          :key="segmento"
          :class="{ 'campoPassword__segmento--activo': segmento <= nivelFortaleza }"
        ></span>
      </div>

      <p class="campoPassword__textoFortaleza">
        {{ textoFortaleza }}
      </p>
    </div>

    <ul v-if="mostrarReglas" class="campoPassword__reglas">
      <li
        v-for="regla in reglasPassword"
        :key="regla.id"
        :class="{ 'campoPassword__regla--cumplida': regla.cumplida }"
      >
        <CheckCircle2 v-if="regla.cumplida" :size="14" stroke-width="2.3" aria-hidden="true" />

        <Circle v-else :size="14" stroke-width="2.3" aria-hidden="true" />

        <span>{{ regla.texto }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { CheckCircle2, Circle, Eye, EyeOff, LockKeyhole, TriangleAlert } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: 'password',
  },
  name: {
    type: String,
    default: 'password',
  },
  label: {
    type: String,
    default: 'Contraseña',
  },
  placeholder: {
    type: String,
    default: 'Ingresa tu contraseña',
  },
  autocomplete: {
    type: String,
    default: 'current-password',
    validator: (valor) => {
      return ['current-password', 'new-password', 'one-time-code', 'off'].includes(valor)
    },
  },
  error: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  minlength: {
    type: Number,
    default: 8,
  },
  maxlength: {
    type: Number,
    default: 128,
  },
  validarLocal: {
    type: Boolean,
    default: false,
  },
  mostrarFortaleza: {
    type: Boolean,
    default: false,
  },
  mostrarReglas: {
    type: Boolean,
    default: false,
  },
  mostrarAvisoBloqMayus: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'validar', 'alternarVisibilidad'])

const inputPassword = ref(null)
const mostrarPassword = ref(false)
const bloqMayusActivo = ref(false)
const fueTocado = ref(false)

const idError = computed(() => {
  return `${props.id}-error`
})

const idBloqMayus = computed(() => {
  return `${props.id}-bloq-mayus`
})

const errorLocal = computed(() => {
  if (!props.validarLocal || !fueTocado.value) {
    return ''
  }

  if (props.required && !props.modelValue) {
    return 'Ingresa tu contraseña.'
  }

  if (props.modelValue && props.modelValue.length < props.minlength) {
    return `La contraseña debe tener al menos ${props.minlength} caracteres.`
  }

  return ''
})

const errorVisible = computed(() => {
  return props.error || errorLocal.value
})

const ariaDescribedby = computed(() => {
  const ids = []

  if (errorVisible.value) {
    ids.push(idError.value)
  }

  if (props.mostrarAvisoBloqMayus && bloqMayusActivo.value) {
    ids.push(idBloqMayus.value)
  }

  return ids.length ? ids.join(' ') : undefined
})

const clasesInput = computed(() => {
  return {
    'campoPassword__inputWrapper--error': Boolean(errorVisible.value),
    'campoPassword__inputWrapper--disabled': props.disabled,
    'campoPassword__inputWrapper--readonly': props.readonly,
  }
})

const reglasPassword = computed(() => {
  const valor = props.modelValue || ''

  return [
    {
      id: 'longitud',
      texto: `Mínimo ${props.minlength} caracteres`,
      cumplida: valor.length >= props.minlength,
    },
    {
      id: 'mayuscula',
      texto: 'Al menos una mayúscula',
      cumplida: /[A-ZÁÉÍÓÚÑ]/.test(valor),
    },
    {
      id: 'minuscula',
      texto: 'Al menos una minúscula',
      cumplida: /[a-záéíóúñ]/.test(valor),
    },
    {
      id: 'numero',
      texto: 'Al menos un número',
      cumplida: /\d/.test(valor),
    },
  ]
})

const nivelFortaleza = computed(() => {
  if (!props.modelValue) {
    return 0
  }

  return reglasPassword.value.filter((regla) => regla.cumplida).length
})

const textoFortaleza = computed(() => {
  const textos = {
    0: 'Sin evaluar',
    1: 'Débil',
    2: 'Aceptable',
    3: 'Buena',
    4: 'Fuerte',
  }

  return textos[nivelFortaleza.value] || 'Sin evaluar'
})

function actualizarValor(evento) {
  const valor = evento.target.value

  emit('update:modelValue', valor)

  emit('validar', {
    valor,
    esValido: !errorLocal.value,
    nivelFortaleza: nivelFortaleza.value,
  })
}

function emitirBlur(evento) {
  fueTocado.value = true
  emit('blur', evento)
}

function emitirFocus(evento) {
  emit('focus', evento)
}

function alternarVisibilidad() {
  mostrarPassword.value = !mostrarPassword.value

  emit('alternarVisibilidad', mostrarPassword.value)

  requestAnimationFrame(() => {
    inputPassword.value?.focus()
  })
}

function detectarBloqMayus(evento) {
  if (typeof evento.getModifierState !== 'function') {
    return
  }

  bloqMayusActivo.value = evento.getModifierState('CapsLock')
}

function enfocar() {
  inputPassword.value?.focus()
}

function limpiarEstadoVisual() {
  mostrarPassword.value = false
  bloqMayusActivo.value = false
  fueTocado.value = false
}

defineExpose({
  enfocar,
  limpiarEstadoVisual,
})
</script>

<style scoped>
.campoPassword {
  display: flex;
  flex-direction: column;
  gap: 0.42rem;
}

.campoPassword__label {
  color: #1f2937;
  font-size: 0.86rem;
  font-weight: 800;
  line-height: 1.2;
}

.campoPassword__required {
  color: #9f2241;
}

.campoPassword__inputWrapper {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 3.4rem;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.82);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease,
    opacity 180ms ease;
}

.campoPassword__inputWrapper:focus-within {
  border-color: rgba(159, 34, 65, 0.36);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 0 0 4px rgba(159, 34, 65, 0.08);
}

.campoPassword__inputWrapper--error {
  border-color: rgba(220, 38, 38, 0.4);
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.07);
}

.campoPassword__inputWrapper--disabled,
.campoPassword__inputWrapper--readonly {
  opacity: 0.72;
}

.campoPassword__icono {
  flex: 0 0 auto;
  margin-left: 1rem;
  color: #9ca3af;
}

.campoPassword__input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  padding: 0 3rem 0 0.7rem;
  color: #1f2937;
  font: inherit;
  font-size: 0.96rem;
  font-weight: 600;
}

.campoPassword__input::placeholder {
  color: #9ca3af;
}

.campoPassword__input:disabled,
.campoPassword__input:read-only {
  cursor: not-allowed;
}

.campoPassword__toggle {
  position: absolute;
  right: 0.7rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.2rem;
  height: 2.2rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition:
    background 180ms ease,
    color 180ms ease;
}

.campoPassword__toggle:hover:not(:disabled) {
  background: rgba(159, 34, 65, 0.06);
  color: #9f2241;
}

.campoPassword__toggle:focus-visible {
  outline: 3px solid rgba(159, 34, 65, 0.18);
  outline-offset: 2px;
}

.campoPassword__toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.campoPassword__error,
.campoPassword__aviso {
  margin: 0;
  font-size: 0.77rem;
  font-weight: 750;
  line-height: 1.35;
}

.campoPassword__error {
  color: #b91c1c;
}

.campoPassword__aviso {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #9a6a13;
}

.campoPassword__fortaleza {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  margin-top: 0.2rem;
}

.campoPassword__barraFortaleza {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.28rem;
  flex: 1;
}

.campoPassword__barraFortaleza span {
  height: 0.34rem;
  border-radius: 999px;
  background: #e5e7eb;
}

.campoPassword__barraFortaleza .campoPassword__segmento--activo {
  background: #9f2241;
}

.campoPassword__textoFortaleza {
  margin: 0;
  color: #6b7280;
  font-size: 0.72rem;
  font-weight: 800;
}

.campoPassword__reglas {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.4rem 0.75rem;
  margin: 0.25rem 0 0;
  padding: 0;
  list-style: none;
}

.campoPassword__reglas li {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #9ca3af;
  font-size: 0.72rem;
  font-weight: 650;
  line-height: 1.35;
}

.campoPassword__regla--cumplida {
  color: #0d9488;
}

@media (max-width: 520px) {
  .campoPassword__reglas {
    grid-template-columns: 1fr;
  }

  .campoPassword__fortaleza {
    align-items: flex-start;
    flex-direction: column;
  }

  .campoPassword__barraFortaleza {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .campoPassword__inputWrapper,
  .campoPassword__toggle {
    transition: none;
  }
}
</style>
