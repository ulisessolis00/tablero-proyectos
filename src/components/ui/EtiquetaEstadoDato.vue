<!-- src/components/ui/EtiquetaEstadoDato.vue -->

<template>
  <span
    class="etiquetaEstadoDato"
    :class="clasesEtiqueta"
    :style="estilosEtiqueta"
    :title="textoTooltip"
  >
    <span v-if="mostrarIcono" class="etiquetaEstadoDato__icono" aria-hidden="true">
      <component :is="iconoEstado" :size="tamanoIcono" stroke-width="2.4" />
    </span>

    <span class="etiquetaEstadoDato__texto">
      {{ textoVisible }}
    </span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import {
  AlertTriangle,
  CalendarX,
  CheckCircle2,
  CircleDashed,
  Clock3,
  HelpCircle,
  Info,
  UsersRound,
  WalletCards,
  XCircle,
} from 'lucide-vue-next'

const props = defineProps({
  estado: {
    type: String,
    default: 'pendiente',
  },
  texto: {
    type: String,
    default: '',
  },
  tooltip: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '',
  },
  mostrarIcono: {
    type: Boolean,
    default: true,
  },
  tamanoIcono: {
    type: Number,
    default: 14,
  },
  compacta: {
    type: Boolean,
    default: false,
  },
  variante: {
    type: String,
    default: 'suave',
    validator: (valor) => {
      return ['suave', 'solida', 'lineal'].includes(valor)
    },
  },
})

const CONFIGURACION_ESTADOS = Object.freeze({
  completo: {
    texto: 'Completo',
    color: '#059669',
    icono: CheckCircle2,
  },
  parcial: {
    texto: 'Parcial',
    color: '#b45309',
    icono: Info,
  },
  pendiente: {
    texto: 'Pendiente',
    color: '#9ca3af',
    icono: Clock3,
  },
  sinDatos: {
    texto: 'Sin datos',
    color: '#9ca3af',
    icono: CircleDashed,
  },
  sinPresupuesto: {
    texto: 'Sin presupuesto',
    color: '#b45309',
    icono: WalletCards,
  },
  sinBeneficiarios: {
    texto: 'Sin beneficiarios',
    color: '#0d9488',
    icono: UsersRound,
  },
  sinFechas: {
    texto: 'Sin fechas',
    color: '#7c3aed',
    icono: CalendarX,
  },
  alerta: {
    texto: 'Revisar',
    color: '#d97706',
    icono: AlertTriangle,
  },
  error: {
    texto: 'Error',
    color: '#dc2626',
    icono: XCircle,
  },
  noReportado: {
    texto: 'No reportado',
    color: '#6b7280',
    icono: HelpCircle,
  },
})

const configuracion = computed(() => {
  return CONFIGURACION_ESTADOS[props.estado] || CONFIGURACION_ESTADOS.pendiente
})

const textoVisible = computed(() => {
  return props.texto || configuracion.value.texto
})

const textoTooltip = computed(() => {
  return props.tooltip || textoVisible.value
})

const iconoEstado = computed(() => {
  return configuracion.value.icono
})

const colorEstado = computed(() => {
  return validarColor(props.color) || configuracion.value.color
})

const estilosEtiqueta = computed(() => {
  return {
    '--etiqueta-estado-color': colorEstado.value,
  }
})

const clasesEtiqueta = computed(() => {
  return {
    'etiquetaEstadoDato--compacta': props.compacta,
    'etiquetaEstadoDato--solida': props.variante === 'solida',
    'etiquetaEstadoDato--lineal': props.variante === 'lineal',
  }
})

function validarColor(valor) {
  if (/^#[0-9a-fA-F]{6}$/.test(valor || '')) {
    return valor
  }

  return ''
}
</script>

<style scoped>
.etiquetaEstadoDato {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  max-width: 100%;
  border: 1px solid color-mix(in srgb, var(--etiqueta-estado-color) 18%, #ffffff);
  border-radius: 999px;
  background: color-mix(in srgb, var(--etiqueta-estado-color) 9%, #ffffff);
  color: var(--etiqueta-estado-color);
  padding: 0.36rem 0.62rem;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.055em;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
}

.etiquetaEstadoDato__icono {
  display: inline-grid;
  place-items: center;
  flex: 0 0 auto;
}

.etiquetaEstadoDato__texto {
  overflow: hidden;
  text-overflow: ellipsis;
}

.etiquetaEstadoDato--compacta {
  gap: 0.28rem;
  padding: 0.28rem 0.5rem;
  font-size: 0.62rem;
}

.etiquetaEstadoDato--solida {
  border-color: var(--etiqueta-estado-color);
  background: var(--etiqueta-estado-color);
  color: #ffffff;
}

.etiquetaEstadoDato--lineal {
  background: transparent;
  border-color: color-mix(in srgb, var(--etiqueta-estado-color) 32%, #ffffff);
}

@media (max-width: 520px) {
  .etiquetaEstadoDato {
    max-width: 100%;
  }
}
</style>
