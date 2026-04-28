<!-- src/components/ui/BaseErrorState.vue -->

<template>
  <section
    class="baseErrorState"
    :class="clasesError"
    :style="estilosError"
    role="alert"
    :aria-label="ariaLabel || tituloVisible"
  >
    <div class="baseErrorState__fondo" aria-hidden="true"></div>

    <div v-if="mostrarIcono" class="baseErrorState__icono" aria-hidden="true">
      <component :is="iconoVisible" :size="tamanoIcono" stroke-width="2.15" />
    </div>

    <div class="baseErrorState__contenido">
      <p v-if="etiquetaVisible" class="baseErrorState__etiqueta">
        {{ etiquetaVisible }}
      </p>

      <component :is="tagTitulo" class="baseErrorState__titulo">
        {{ tituloVisible }}
      </component>

      <p v-if="mensajeVisible" class="baseErrorState__mensaje">
        {{ mensajeVisible }}
      </p>

      <details v-if="mostrarDetalle && detalle" class="baseErrorState__detalle">
        <summary>Ver detalle técnico</summary>

        <pre>{{ detalle }}</pre>
      </details>
    </div>

    <div v-if="mostrarAcciones" class="baseErrorState__acciones">
      <slot name="acciones">
        <BaseButton
          v-if="mostrarReintentar"
          variante="primario"
          :color="colorAccion"
          @click="emitirReintentar"
        >
          Reintentar
        </BaseButton>

        <BaseButton
          v-if="mostrarVolver"
          variante="secundario"
          :color="colorAccion"
          :to="toVolver"
          @click="emitirVolver"
        >
          Volver
        </BaseButton>
      </slot>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import {
  AlertTriangle,
  Ban,
  FileWarning,
  LockKeyhole,
  PlugZap,
  RouteOff,
  ServerCrash,
  ShieldAlert,
  WifiOff,
  XCircle,
} from 'lucide-vue-next'

import BaseButton from './BaseButton.vue'

const props = defineProps({
  tipo: {
    type: String,
    default: 'general',
    validator: (valor) => {
      return [
        'general',
        'datos',
        'archivo',
        'sesion',
        'permisos',
        'ruta',
        'red',
        'servidor',
      ].includes(valor)
    },
  },
  titulo: {
    type: String,
    default: '',
  },
  mensaje: {
    type: String,
    default: '',
  },
  etiqueta: {
    type: String,
    default: '',
  },
  detalle: {
    type: String,
    default: '',
  },
  mostrarDetalle: {
    type: Boolean,
    default: false,
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
    default: '',
  },
  mostrarReintentar: {
    type: Boolean,
    default: false,
  },
  mostrarVolver: {
    type: Boolean,
    default: true,
  },
  toVolver: {
    type: [String, Object],
    default: null,
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
      return ['centro', 'izquierda'].includes(valor)
    },
  },
  tagTitulo: {
    type: String,
    default: 'h2',
    validator: (valor) => {
      return ['h1', 'h2', 'h3', 'h4', 'p'].includes(valor)
    },
  },
  ariaLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['reintentar', 'volver'])

const configuraciones = Object.freeze({
  general: {
    etiqueta: 'Error',
    titulo: 'Algo salió mal',
    mensaje: 'No fue posible completar la operación. Intenta nuevamente.',
    color: '#dc2626',
    icono: AlertTriangle,
  },
  datos: {
    etiqueta: 'Datos no disponibles',
    titulo: 'No se pudo cargar la información',
    mensaje: 'Revisa que el archivo exista y que tenga el formato esperado.',
    color: '#dc2626',
    icono: PlugZap,
  },
  archivo: {
    etiqueta: 'Archivo no leído',
    titulo: 'No se pudo leer el archivo',
    mensaje: 'El archivo puede no existir, estar vacío o tener una estructura distinta.',
    color: '#b45309',
    icono: FileWarning,
  },
  sesion: {
    etiqueta: 'Sesión',
    titulo: 'Tu sesión no está activa',
    mensaje: 'Inicia sesión nuevamente para continuar.',
    color: '#9f2241',
    icono: LockKeyhole,
  },
  permisos: {
    etiqueta: 'Acceso restringido',
    titulo: 'No tienes permisos para ver esta sección',
    mensaje: 'La información solicitada no está disponible para tu usuario.',
    color: '#7c2d12',
    icono: ShieldAlert,
  },
  ruta: {
    etiqueta: 'Ruta no encontrada',
    titulo: 'La página no existe',
    mensaje: 'La dirección solicitada no está disponible o fue movida.',
    color: '#6b7280',
    icono: RouteOff,
  },
  red: {
    etiqueta: 'Conexión',
    titulo: 'No hay conexión con el servicio',
    mensaje: 'Revisa tu conexión o intenta nuevamente en unos momentos.',
    color: '#2563eb',
    icono: WifiOff,
  },
  servidor: {
    etiqueta: 'Servidor',
    titulo: 'El servidor no respondió correctamente',
    mensaje: 'Ocurrió un problema al procesar la solicitud.',
    color: '#dc2626',
    icono: ServerCrash,
  },
})

const configuracion = computed(() => {
  return configuraciones[props.tipo] || configuraciones.general
})

const tituloVisible = computed(() => {
  return props.titulo || configuracion.value.titulo
})

const mensajeVisible = computed(() => {
  return props.mensaje || configuracion.value.mensaje
})

const etiquetaVisible = computed(() => {
  return props.etiqueta || configuracion.value.etiqueta
})

const iconoVisible = computed(() => {
  if (props.icono) {
    return props.icono
  }

  if (props.tipo === 'permisos' && !props.mostrarReintentar) {
    return Ban
  }

  if (props.tipo === 'general' && props.mostrarReintentar) {
    return XCircle
  }

  return configuracion.value.icono
})

const colorAccion = computed(() => {
  return validarColor(props.color) || configuracion.value.color
})

const estilosError = computed(() => {
  return {
    '--base-error-color': colorAccion.value,
  }
})

const clasesError = computed(() => {
  return {
    'baseErrorState--simple': props.variante === 'simple',
    'baseErrorState--compacta': props.variante === 'compacta',
    'baseErrorState--izquierda': props.alineacion === 'izquierda',
  }
})

const mostrarAcciones = computed(() => {
  return props.mostrarReintentar || props.mostrarVolver
})

function emitirReintentar(evento) {
  emit('reintentar', evento)
}

function emitirVolver(evento) {
  emit('volver', evento)
}

function validarColor(valor) {
  if (/^#[0-9a-fA-F]{6}$/.test(valor || '')) {
    return valor
  }

  return ''
}
</script>

<style scoped>
.baseErrorState {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 280px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--base-error-color) 18%, #ffffff);
  border-radius: 1.35rem;
  background:
    radial-gradient(
      circle at top,
      color-mix(in srgb, var(--base-error-color) 8%, transparent),
      transparent 16rem
    ),
    rgba(255, 255, 255, 0.82);
  box-shadow: 0 18px 45px rgba(31, 41, 55, 0.055);
  padding: clamp(1.35rem, 3vw, 2.35rem);
  text-align: center;
  isolation: isolate;
}

.baseErrorState__fondo {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(
    135deg,
    transparent,
    color-mix(in srgb, var(--base-error-color) 5%, transparent)
  );
  pointer-events: none;
}

.baseErrorState__icono {
  display: grid;
  place-items: center;
  width: 4.3rem;
  height: 4.3rem;
  margin-bottom: 1rem;
  border: 1px solid color-mix(in srgb, var(--base-error-color) 16%, #ffffff);
  border-radius: 1.25rem;
  background: color-mix(in srgb, var(--base-error-color) 9%, #ffffff);
  color: var(--base-error-color);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.72),
    0 14px 32px color-mix(in srgb, var(--base-error-color) 10%, transparent);
}

.baseErrorState__contenido {
  max-width: 680px;
}

.baseErrorState__etiqueta {
  margin: 0 0 0.42rem;
  color: var(--base-error-color);
  font-size: 0.72rem;
  font-weight: 950;
  letter-spacing: 0.1em;
  line-height: 1.2;
  text-transform: uppercase;
}

.baseErrorState__titulo {
  margin: 0;
  color: #111827;
  font-size: clamp(1.08rem, 2.2vw, 1.45rem);
  font-weight: 950;
  letter-spacing: -0.035em;
  line-height: 1.15;
  text-wrap: balance;
}

.baseErrorState__mensaje {
  margin: 0.58rem auto 0;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 650;
  line-height: 1.55;
  text-wrap: pretty;
}

.baseErrorState__detalle {
  margin-top: 1rem;
  border: 1px solid rgba(220, 38, 38, 0.12);
  border-radius: 0.95rem;
  background: rgba(254, 242, 242, 0.62);
  padding: 0.75rem;
  color: #7f1d1d;
  text-align: left;
}

.baseErrorState__detalle summary {
  font-size: 0.78rem;
  font-weight: 900;
  cursor: pointer;
}

.baseErrorState__detalle pre {
  overflow: auto;
  max-width: 100%;
  margin: 0.65rem 0 0;
  font-size: 0.74rem;
  line-height: 1.45;
  white-space: pre-wrap;
}

.baseErrorState__acciones {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 1.15rem;
}

.baseErrorState--simple {
  min-height: auto;
  border-color: transparent;
  background: transparent;
  box-shadow: none;
}

.baseErrorState--compacta {
  min-height: 190px;
  border-radius: 1rem;
  padding: 1.15rem;
}

.baseErrorState--compacta .baseErrorState__icono {
  width: 3.35rem;
  height: 3.35rem;
  margin-bottom: 0.75rem;
  border-radius: 1rem;
}

.baseErrorState--compacta .baseErrorState__mensaje {
  font-size: 0.82rem;
}

.baseErrorState--izquierda {
  place-items: start;
  text-align: left;
}

.baseErrorState--izquierda .baseErrorState__mensaje {
  margin-left: 0;
}

.baseErrorState--izquierda .baseErrorState__acciones {
  justify-content: flex-start;
}

@media (max-width: 620px) {
  .baseErrorState {
    min-height: 230px;
    border-radius: 1.1rem;
    padding: 1.25rem;
  }

  .baseErrorState__acciones {
    width: 100%;
  }
}
</style>
