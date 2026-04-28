<!-- src/components/auth/WrapperVistaProtegida.vue -->

<template>
  <section class="wrapperVistaProtegida">
    <slot
      v-if="mostrarContenido"
      :usuario="usuarioActual"
      :estado="estadoAcceso"
      :recargar="validarAcceso"
    ></slot>

    <div v-else-if="cargando" class="wrapperVistaProtegida__estado">
      <slot name="cargando">
        <BaseSkeleton :tipo="tipoSkeleton" :filas="filasSkeleton" :color="color" />
      </slot>
    </div>

    <div v-else-if="hayError" class="wrapperVistaProtegida__estado">
      <slot name="error" :error="mensajeError" :recargar="validarAcceso">
        <BaseErrorState
          tipo="sesion"
          titulo="No se pudo validar tu sesión"
          :mensaje="mensajeError"
          mostrar-reintentar
          :mostrar-volver="mostrarBotonVolver"
          :to-volver="rutaVolver"
          @reintentar="validarAcceso"
        />
      </slot>
    </div>

    <div v-else-if="sesionRequerida" class="wrapperVistaProtegida__estado">
      <slot name="sinSesion" :ir-login="irLogin">
        <BaseErrorState
          tipo="sesion"
          titulo="Tu sesión no está activa"
          mensaje="Inicia sesión para consultar esta sección del tablero."
          :mostrar-reintentar="false"
          :mostrar-volver="true"
          :to-volver="rutaLogin"
          @volver="irLogin"
        />
      </slot>
    </div>

    <div v-else-if="accesoDenegado" class="wrapperVistaProtegida__estado">
      <slot name="denegado" :usuario="usuarioActual" :ir-volver="irVolver">
        <BaseErrorState
          tipo="permisos"
          titulo="No tienes permisos para ver esta sección"
          :mensaje="mensajeAccesoDenegado"
          :mostrar-reintentar="false"
          :mostrar-volver="true"
          :to-volver="rutaVolver"
          @volver="irVolver"
        />
      </slot>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import BaseErrorState from '../ui/BaseErrorState.vue'
import BaseSkeleton from '../ui/BaseSkeleton.vue'

import { obtenerUsuarioActual } from '../../services/sesion/servicioSesion'

const props = defineProps({
  requiereAutenticacion: {
    type: Boolean,
    default: true,
  },
  rolesPermitidos: {
    type: Array,
    default: () => [],
  },
  secretariaId: {
    type: [String, Number],
    default: '',
  },
  validarSecretaria: {
    type: Boolean,
    default: false,
  },
  permitirSinSesion: {
    type: Boolean,
    default: false,
  },
  usuario: {
    type: Object,
    default: null,
  },
  cargarAlMontar: {
    type: Boolean,
    default: true,
  },
  rutaLogin: {
    type: [String, Object],
    default: () => ({
      name: 'login',
    }),
  },
  rutaVolver: {
    type: [String, Object],
    default: () => ({
      name: 'panorama',
    }),
  },
  redireccionarSinSesion: {
    type: Boolean,
    default: false,
  },
  redireccionarSinPermiso: {
    type: Boolean,
    default: false,
  },
  mensajeAccesoDenegado: {
    type: String,
    default: 'La información solicitada no está disponible para tu usuario.',
  },
  tipoSkeleton: {
    type: String,
    default: 'hero',
  },
  filasSkeleton: {
    type: Number,
    default: 4,
  },
  color: {
    type: String,
    default: '#9f2241',
  },
  mostrarBotonVolver: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['validado', 'sinSesion', 'denegado', 'error'])

const router = useRouter()

const cargando = ref(false)
const usuarioActual = ref(null)
const mensajeError = ref('')

const hayError = computed(() => {
  return Boolean(mensajeError.value)
})

const usuarioAutenticado = computed(() => {
  return Boolean(usuarioActual.value?.autenticado)
})

const sesionRequerida = computed(() => {
  if (!props.requiereAutenticacion) {
    return false
  }

  if (props.permitirSinSesion) {
    return false
  }

  return !usuarioAutenticado.value
})

const accesoDenegado = computed(() => {
  if (sesionRequerida.value || hayError.value || cargando.value) {
    return false
  }

  return !tienePermisosUsuario(usuarioActual.value)
})

const mostrarContenido = computed(() => {
  if (cargando.value || hayError.value || sesionRequerida.value || accesoDenegado.value) {
    return false
  }

  return true
})

const estadoAcceso = computed(() => {
  if (cargando.value) {
    return 'cargando'
  }

  if (hayError.value) {
    return 'error'
  }

  if (sesionRequerida.value) {
    return 'sinSesion'
  }

  if (accesoDenegado.value) {
    return 'denegado'
  }

  return 'permitido'
})

onMounted(() => {
  if (props.cargarAlMontar) {
    validarAcceso()
  }
})

watch(
  () => [
    props.secretariaId,
    props.requiereAutenticacion,
    props.validarSecretaria,
    JSON.stringify(props.rolesPermitidos),
  ],
  () => {
    if (props.cargarAlMontar) {
      validarAcceso()
    }
  },
)

async function validarAcceso() {
  cargando.value = true
  mensajeError.value = ''

  try {
    usuarioActual.value = props.usuario || (await obtenerUsuarioActual())

    if (sesionRequerida.value) {
      emit('sinSesion')

      if (props.redireccionarSinSesion) {
        irLogin()
      }

      return
    }

    if (accesoDenegado.value) {
      emit('denegado', usuarioActual.value)

      if (props.redireccionarSinPermiso) {
        irVolver()
      }

      return
    }

    emit('validado', usuarioActual.value)
  } catch (error) {
    console.error('Error al validar vista protegida:', error)

    mensajeError.value = error?.message || 'Ocurrió un error al validar tu sesión.'
    emit('error', error)
  } finally {
    cargando.value = false
  }
}

function tienePermisosUsuario(usuario) {
  if (!props.requiereAutenticacion && !usuario?.autenticado) {
    return true
  }

  if (!usuario?.autenticado) {
    return false
  }

  if (esUsuarioPrincipal(usuario)) {
    return true
  }

  if (!cumpleRol(usuario)) {
    return false
  }

  if (!cumpleSecretaria(usuario)) {
    return false
  }

  return true
}

function esUsuarioPrincipal(usuario) {
  const rol = normalizarTexto(usuario?.rol || usuario?.tipoUsuario || usuario?.tipo)

  return ['principal', 'admin', 'administrador', 'superusuario', 'superuser'].includes(rol)
}

function cumpleRol(usuario) {
  if (!props.rolesPermitidos.length) {
    return true
  }

  const rolUsuario = normalizarTexto(usuario?.rol || usuario?.tipoUsuario || usuario?.tipo)

  return props.rolesPermitidos.map((rol) => normalizarTexto(rol)).includes(rolUsuario)
}

function cumpleSecretaria(usuario) {
  if (!props.validarSecretaria) {
    return true
  }

  const secretariaSolicitada = normalizarTexto(props.secretariaId)

  if (!secretariaSolicitada) {
    return true
  }

  const secretariasUsuario = obtenerSecretariasUsuario(usuario)

  return secretariasUsuario.includes(secretariaSolicitada)
}

function obtenerSecretariasUsuario(usuario) {
  const posiblesValores = [
    usuario?.secretariaId,
    usuario?.idSecretaria,
    usuario?.secretaria,
    usuario?.siglaSecretaria,
  ]

  const listaBase = posiblesValores
    .filter((valor) => valor !== null && valor !== undefined && valor !== '')
    .map((valor) => normalizarTexto(valor))

  if (Array.isArray(usuario?.secretariasPermitidas)) {
    const secretariasPermitidas = usuario.secretariasPermitidas.map((valor) => {
      return normalizarTexto(valor)
    })

    return [...new Set([...listaBase, ...secretariasPermitidas])]
  }

  return [...new Set(listaBase)]
}

function irLogin() {
  router.push(props.rutaLogin)
}

function irVolver() {
  router.push(props.rutaVolver)
}

function normalizarTexto(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}
</script>

<style scoped>
.wrapperVistaProtegida {
  width: 100%;
  min-width: 0;
}

.wrapperVistaProtegida__estado {
  width: 100%;
  min-height: 340px;
}
</style>
