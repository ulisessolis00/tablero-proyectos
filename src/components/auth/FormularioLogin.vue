<!-- src/components/auth/FormularioLogin.vue -->

<template>
  <form class="formularioLogin" novalidate @submit.prevent="manejarSubmit">
    <div class="formularioLogin__campo">
      <label class="formularioLogin__label" for="correo-login">
        Usuario o correo electrónico
      </label>

      <div
        class="formularioLogin__inputWrapper"
        :class="{
          'formularioLogin__inputWrapper--error': errores.correo,
          'formularioLogin__inputWrapper--disabled': formularioDeshabilitado,
        }"
      >
        <Mail class="formularioLogin__inputIcono" :size="18" stroke-width="2" aria-hidden="true" />

        <input
          id="correo-login"
          ref="inputCorreo"
          v-model.trim="formulario.correo"
          class="formularioLogin__input"
          type="text"
          name="correo"
          autocomplete="username"
          placeholder="usuario@cdmx.gob.mx"
          :disabled="formularioDeshabilitado"
          :aria-invalid="Boolean(errores.correo)"
          :aria-describedby="errores.correo ? 'error-correo-login' : undefined"
          @input="limpiarErrorCampo('correo')"
        />
      </div>

      <p v-if="errores.correo" id="error-correo-login" class="formularioLogin__error">
        {{ errores.correo }}
      </p>
    </div>

    <CampoPassword
      id="contrasena-login"
      v-model="formulario.contrasena"
      label="Contraseña"
      placeholder="Ingresa tu contraseña"
      autocomplete="current-password"
      :error="errores.contrasena"
      :disabled="formularioDeshabilitado"
      required
      @update:model-value="limpiarErrorCampo('contrasena')"
    />

    <div class="formularioLogin__filaOpciones">
      <label class="formularioLogin__checkLabel">
        <input
          v-model="formulario.recordarSesion"
          class="formularioLogin__checkbox"
          type="checkbox"
          :disabled="formularioDeshabilitado"
        />

        <span>Mantener sesión en este equipo</span>
      </label>

      <button
        class="formularioLogin__link"
        type="button"
        :disabled="formularioDeshabilitado"
        @click="emitirRecuperarContrasena"
      >
        ¿Olvidaste tu contraseña?
      </button>
    </div>

    <div
      v-if="mostrarAvisoIntentos"
      class="formularioLogin__intentos"
      :class="{ 'formularioLogin__intentos--alerta': intentosRestantes <= 1 }"
      role="status"
    >
      <ShieldAlert :size="17" stroke-width="2.2" aria-hidden="true" />

      <span>{{ textoIntentos }}</span>
    </div>

    <div
      v-if="estaBloqueado"
      class="formularioLogin__alerta formularioLogin__alerta--bloqueo"
      role="alert"
    >
      <Ban :size="18" stroke-width="2.2" aria-hidden="true" />

      <span>{{ textoBloqueoVisible }}</span>
    </div>

    <div
      v-else-if="errorGeneral"
      class="formularioLogin__alerta formularioLogin__alerta--error"
      role="alert"
    >
      <AlertCircle :size="18" stroke-width="2.2" aria-hidden="true" />

      <span>{{ errorGeneral }}</span>
    </div>

    <div
      v-if="mensajeInfo"
      class="formularioLogin__alerta formularioLogin__alerta--info"
      role="status"
    >
      <ShieldCheck :size="18" stroke-width="2.2" aria-hidden="true" />

      <span>{{ mensajeInfo }}</span>
    </div>

    <button class="formularioLogin__botonSubmit" type="submit" :disabled="formularioDeshabilitado">
      <LoaderCircle
        v-if="cargando"
        class="formularioLogin__spinner"
        :size="18"
        stroke-width="2.4"
        aria-hidden="true"
      />

      <LogIn v-else :size="18" stroke-width="2.4" aria-hidden="true" />

      <span>{{ textoBotonVisible }}</span>
    </button>
  </form>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import {
  AlertCircle,
  Ban,
  LoaderCircle,
  LogIn,
  Mail,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-vue-next'

import CampoPassword from './CampoPassword.vue'

const props = defineProps({
  cargando: {
    type: Boolean,
    default: false,
  },
  errorGeneral: {
    type: String,
    default: '',
  },
  mensajeInfo: {
    type: String,
    default: '',
  },
  intentosFallidos: {
    type: Number,
    default: 0,
  },
  maxIntentos: {
    type: Number,
    default: 5,
  },
  bloqueado: {
    type: Boolean,
    default: false,
  },
  textoBloqueo: {
    type: String,
    default: '',
  },
  textoBoton: {
    type: String,
    default: 'Iniciar sesión',
  },
  textoBotonCargando: {
    type: String,
    default: 'Validando acceso...',
  },
  validarDominioCdmx: {
    type: Boolean,
    default: false,
  },
  dominioPermitido: {
    type: String,
    default: 'cdmx.gob.mx',
  },
})

const emit = defineEmits(['submit', 'recuperarContrasena', 'cambiarFormulario'])

const inputCorreo = ref(null)

const formulario = reactive({
  correo: '',
  contrasena: '',
  recordarSesion: true,
})

const errores = reactive({
  correo: '',
  contrasena: '',
})

const estaBloqueado = computed(() => {
  return props.bloqueado || props.intentosFallidos >= props.maxIntentos
})

const formularioDeshabilitado = computed(() => {
  return props.cargando || estaBloqueado.value
})

const intentosRestantes = computed(() => {
  return Math.max(props.maxIntentos - props.intentosFallidos, 0)
})

const mostrarAvisoIntentos = computed(() => {
  return props.intentosFallidos > 0 && !estaBloqueado.value
})

const textoIntentos = computed(() => {
  if (intentosRestantes.value === 1) {
    return 'Te queda 1 intento antes del bloqueo temporal.'
  }

  return `Te quedan ${intentosRestantes.value} intentos antes del bloqueo temporal.`
})

const textoBloqueoVisible = computed(() => {
  return (
    props.textoBloqueo ||
    'Por seguridad, el acceso se bloqueó temporalmente después de varios intentos fallidos.'
  )
})

const textoBotonVisible = computed(() => {
  if (props.cargando) {
    return props.textoBotonCargando
  }

  if (estaBloqueado.value) {
    return 'Acceso bloqueado'
  }

  return props.textoBoton
})

function manejarSubmit() {
  limpiarErrores()

  if (formularioDeshabilitado.value) {
    return
  }

  const esValido = validarFormulario()

  if (!esValido) {
    return
  }

  emit('submit', {
    correo: formulario.correo,
    contrasena: formulario.contrasena,
    recordarSesion: formulario.recordarSesion,
  })
}

function validarFormulario() {
  let valido = true

  if (!formulario.correo) {
    errores.correo = 'Ingresa tu usuario o correo electrónico.'
    valido = false
  } else if (pareceCorreo(formulario.correo) && !esCorreoValido(formulario.correo)) {
    errores.correo = 'Ingresa un correo electrónico válido.'
    valido = false
  } else if (
    props.validarDominioCdmx &&
    pareceCorreo(formulario.correo) &&
    !esDominioPermitido(formulario.correo)
  ) {
    errores.correo = `Usa una cuenta con dominio ${props.dominioPermitido}.`
    valido = false
  }

  if (!formulario.contrasena) {
    errores.contrasena = 'Ingresa tu contraseña.'
    valido = false
  } else if (formulario.contrasena.length < 8) {
    errores.contrasena = 'La contraseña debe tener al menos 8 caracteres.'
    valido = false
  }

  return valido
}

function limpiarErrorCampo(campo) {
  errores[campo] = ''

  emit('cambiarFormulario', {
    correo: formulario.correo,
    contrasena: formulario.contrasena,
    recordarSesion: formulario.recordarSesion,
  })
}

function limpiarErrores() {
  errores.correo = ''
  errores.contrasena = ''
}

function limpiarFormulario() {
  formulario.correo = ''
  formulario.contrasena = ''
  formulario.recordarSesion = true
  limpiarErrores()
}

function enfocarCorreo() {
  inputCorreo.value?.focus()
}

function emitirRecuperarContrasena() {
  emit('recuperarContrasena')
}

function pareceCorreo(valor) {
  return String(valor || '').includes('@')
}

function esCorreoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(correo).toLowerCase())
}

function esDominioPermitido(correo) {
  const dominio = String(props.dominioPermitido || '').toLowerCase()
  return String(correo || '')
    .toLowerCase()
    .endsWith(`@${dominio}`)
}

defineExpose({
  limpiarFormulario,
  limpiarErrores,
  enfocarCorreo,
})
</script>

<style scoped>
.formularioLogin {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.formularioLogin__campo {
  display: flex;
  flex-direction: column;
  gap: 0.42rem;
}

.formularioLogin__label {
  color: #1f2937;
  font-size: 0.86rem;
  font-weight: 800;
  line-height: 1.2;
}

.formularioLogin__inputWrapper {
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

.formularioLogin__inputWrapper:focus-within {
  border-color: rgba(159, 34, 65, 0.36);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 0 0 4px rgba(159, 34, 65, 0.08);
}

.formularioLogin__inputWrapper--error {
  border-color: rgba(220, 38, 38, 0.4);
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.07);
}

.formularioLogin__inputWrapper--disabled {
  opacity: 0.72;
}

.formularioLogin__inputIcono {
  flex: 0 0 auto;
  margin-left: 1rem;
  color: #9ca3af;
}

.formularioLogin__input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  padding: 0 1rem 0 0.7rem;
  color: #1f2937;
  font: inherit;
  font-size: 0.96rem;
  font-weight: 600;
}

.formularioLogin__input::placeholder {
  color: #9ca3af;
}

.formularioLogin__input:disabled {
  cursor: not-allowed;
}

.formularioLogin__error {
  margin: 0;
  color: #b91c1c;
  font-size: 0.77rem;
  font-weight: 750;
  line-height: 1.35;
}

.formularioLogin__filaOpciones {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.15rem;
}

.formularioLogin__checkLabel {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: #1f2937;
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
}

.formularioLogin__checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: #9f2241;
  cursor: pointer;
}

.formularioLogin__checkbox:disabled {
  cursor: not-allowed;
}

.formularioLogin__link {
  border: 0;
  background: transparent;
  color: #9f2241;
  padding: 0;
  font: inherit;
  font-size: 0.83rem;
  font-weight: 800;
  cursor: pointer;
}

.formularioLogin__link:hover:not(:disabled) {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.formularioLogin__link:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.formularioLogin__intentos,
.formularioLogin__alerta {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  border-radius: 1rem;
  padding: 0.88rem 1rem;
  font-size: 0.84rem;
  font-weight: 650;
  line-height: 1.5;
}

.formularioLogin__intentos {
  border: 1px solid rgba(183, 154, 91, 0.2);
  background: rgba(255, 251, 235, 0.96);
  color: #7c5a17;
}

.formularioLogin__intentos--alerta {
  border-color: rgba(220, 38, 38, 0.16);
  background: rgba(254, 242, 242, 0.92);
  color: #991b1b;
}

.formularioLogin__alerta--error {
  border: 1px solid rgba(220, 38, 38, 0.16);
  background: rgba(254, 242, 242, 0.92);
  color: #991b1b;
}

.formularioLogin__alerta--bloqueo {
  border: 1px solid rgba(127, 29, 53, 0.18);
  background: rgba(159, 34, 65, 0.08);
  color: #7f1d35;
}

.formularioLogin__alerta--info {
  border: 1px solid rgba(183, 154, 91, 0.18);
  background: rgba(255, 251, 235, 0.96);
  color: #7c5a17;
}

.formularioLogin__botonSubmit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  min-height: 3.45rem;
  border: 0;
  border-radius: 1rem;
  background: linear-gradient(135deg, #9f2241, #b3395a);
  color: #ffffff;
  font: inherit;
  font-size: 0.95rem;
  font-weight: 900;
  letter-spacing: -0.01em;
  cursor: pointer;
  box-shadow:
    0 14px 28px rgba(159, 34, 65, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease,
    opacity 180ms ease;
}

.formularioLogin__botonSubmit:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.02);
  box-shadow:
    0 18px 32px rgba(159, 34, 65, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.formularioLogin__botonSubmit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.formularioLogin__spinner {
  animation: girar 0.9s linear infinite;
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .formularioLogin__filaOpciones {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .formularioLogin__inputWrapper,
  .formularioLogin__botonSubmit {
    transition: none;
  }

  .formularioLogin__botonSubmit:hover:not(:disabled) {
    transform: none;
  }

  .formularioLogin__spinner {
    animation: none;
  }
}
</style>
