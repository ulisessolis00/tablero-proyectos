<!-- src/components/secretarias/PanelMetricasSecretaria.vue -->

<template>
  <section class="panelMetricasSecretaria">
    <FilaResumenKpis
      :titulo="titulo"
      :subtitulo="subtitulo"
      :etiqueta="etiqueta"
      :kpis="kpisSecretaria"
      :columnas="columnas"
      :compacto="compacto"
      :cargando="cargando"
      :variante="variante"
      :mostrar-encabezado="mostrarEncabezado"
      aria-label="Métricas ejecutivas de la secretaría"
    >
      <template v-if="$slots.acciones" #acciones>
        <slot name="acciones"></slot>
      </template>
    </FilaResumenKpis>

    <p v-if="mostrarNota && notaFuente" class="panelMetricasSecretaria__nota">
      {{ notaFuente }}
    </p>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { Activity, AlertTriangle, ClipboardList, UsersRound, WalletCards } from 'lucide-vue-next'

import FilaResumenKpis from '../kpis/FilaResumenKpis.vue'

import {
  CAMPOS_COMPLETITUD_PROGRAMA,
  crearResumenSecretaria,
} from '../../models/secretarias/modeloDatosSecretarias'

const props = defineProps({
  secretaria: {
    type: Object,
    required: true,
  },
  titulo: {
    type: String,
    default: 'Panel de Métricas Ejecutivas',
  },
  subtitulo: {
    type: String,
    default: 'Resumen de programas, presupuesto, beneficiarios y avance reportado.',
  },
  etiqueta: {
    type: String,
    default: 'Detalle',
  },
  columnas: {
    type: Number,
    default: 5,
  },
  compacto: {
    type: Boolean,
    default: false,
  },
  cargando: {
    type: Boolean,
    default: false,
  },
  mostrarEncabezado: {
    type: Boolean,
    default: true,
  },
  mostrarNota: {
    type: Boolean,
    default: true,
  },
  variante: {
    type: String,
    default: 'contenida',
  },
})

const resumen = computed(() => {
  return crearResumenSecretaria(props.secretaria || {})
})

const programas = computed(() => {
  return Array.isArray(props.secretaria?.programas) ? props.secretaria.programas : []
})

const colorSecretaria = computed(() => {
  return validarColor(props.secretaria?.color)
})

const totalProgramasIncompletos = computed(() => {
  return programas.value.filter(esProgramaIncompleto).length
})

const porcentajeProgramasConBeneficiarios = computed(() => {
  return calcularPorcentaje(resumen.value.programasConBeneficiarios, resumen.value.totalProgramas)
})

const kpisSecretaria = computed(() => {
  return [
    {
      id: 'programas-registrados',
      titulo: 'Programas registrados',
      valor: formatearEntero(resumen.value.totalProgramas),
      subtitulo: 'Programas y acciones reportadas',
      color: colorSecretaria.value,
      icono: ClipboardList,
      estado: resumen.value.totalProgramas > 0 ? 'completo' : 'pendiente',
      mostrarEstado: true,
    },
    {
      id: 'presupuesto-reportado',
      titulo: 'Presupuesto reportado',
      valor: formatearPesosCorto(resumen.value.presupuestoAsignadoTotal),
      subtitulo: 'Presupuesto asignado capturado',
      color: '#b45309',
      icono: WalletCards,
      estado: resumen.value.presupuestoAsignadoTotal > 0 ? 'parcial' : 'pendiente',
      mostrarEstado: true,
    },
    {
      id: 'programas-beneficiarios',
      titulo: 'Con beneficiarios',
      valor: formatearEntero(resumen.value.programasConBeneficiarios),
      subtitulo: `${formatearPorcentaje(porcentajeProgramasConBeneficiarios.value)} de programas`,
      color: '#0D9488',
      icono: UsersRound,
      estado: obtenerEstadoCobertura(porcentajeProgramasConBeneficiarios.value),
      mostrarEstado: true,
    },
    {
      id: 'avance-promedio',
      titulo: 'Avance promedio',
      valor: formatearPorcentaje(resumen.value.avancePromedio),
      subtitulo: 'Promedio de avance reportado',
      color: '#059669',
      icono: Activity,
      estado: obtenerEstadoAvance(resumen.value.avancePromedio),
      mostrarEstado: true,
    },
    {
      id: 'informacion-incompleta',
      titulo: 'Información incompleta',
      valor: formatearEntero(totalProgramasIncompletos.value),
      subtitulo: 'Programas con campos pendientes',
      color: '#dc2626',
      icono: AlertTriangle,
      estado: totalProgramasIncompletos.value > 0 ? 'alerta' : 'completo',
      mostrarEstado: true,
      textoEstadoPersonalizado: totalProgramasIncompletos.value > 0 ? 'Revisar' : 'Sin pendientes',
    },
  ]
})

const notaFuente = computed(() => {
  const archivo = props.secretaria?.archivoFuente || props.secretaria?.fuente?.archivo
  const hoja = props.secretaria?.hojaFuente || props.secretaria?.fuente?.hoja

  if (!archivo && !hoja) {
    return ''
  }

  const nombreArchivo = archivo ? archivo.split('/').pop() : 'archivo local'

  if (hoja) {
    return `Fuente: ${nombreArchivo}, hoja ${hoja}.`
  }

  return `Fuente: ${nombreArchivo}.`
})

function esProgramaIncompleto(programa = {}) {
  return CAMPOS_COMPLETITUD_PROGRAMA.some((campo) => {
    return !tieneValor(programa[campo])
  })
}

function tieneValor(valor) {
  if (valor === null || valor === undefined) {
    return false
  }

  if (typeof valor === 'number') {
    return Number.isFinite(valor)
  }

  if (typeof valor === 'string') {
    const texto = valor.trim().toUpperCase()
    return texto !== '' && texto !== 'NA' && texto !== 'NULL'
  }

  return true
}

function calcularPorcentaje(valor, total) {
  const numero = Number(valor)
  const totalNumero = Number(total)

  if (!Number.isFinite(numero) || !Number.isFinite(totalNumero) || totalNumero <= 0) {
    return 0
  }

  return (numero / totalNumero) * 100
}

function obtenerEstadoCobertura(porcentaje) {
  const numero = Number(porcentaje)

  if (!Number.isFinite(numero) || numero <= 0) {
    return 'pendiente'
  }

  if (numero >= 95) {
    return 'completo'
  }

  return 'parcial'
}

function obtenerEstadoAvance(avance) {
  const numero = Number(avance)

  if (!Number.isFinite(numero)) {
    return 'pendiente'
  }

  if (numero >= 95) {
    return 'completo'
  }

  if (numero >= 50) {
    return 'parcial'
  }

  return 'pendiente'
}

function formatearEntero(valor) {
  const numero = Number(valor)

  if (!Number.isFinite(numero)) {
    return '0'
  }

  return new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: 0,
  }).format(numero)
}

function formatearPesosCorto(valor) {
  const numero = Number(valor)

  if (!Number.isFinite(numero) || numero <= 0) {
    return 'Pendiente'
  }

  if (numero >= 1_000_000_000) {
    return `$${(numero / 1_000_000_000).toFixed(1)}B`
  }

  if (numero >= 1_000_000) {
    return `$${Math.round(numero / 1_000_000)}M`
  }

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(numero)
}

function formatearPorcentaje(valor) {
  const numero = Number(valor)

  if (!Number.isFinite(numero)) {
    return 'Pendiente'
  }

  return `${new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: 1,
  }).format(numero)}%`
}

function validarColor(valor) {
  if (/^#[0-9a-fA-F]{6}$/.test(valor || '')) {
    return valor
  }

  return '#9f2241'
}
</script>

<style scoped>
.panelMetricasSecretaria {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  width: 100%;
}

.panelMetricasSecretaria__nota {
  margin: 0;
  color: #6b7280;
  font-size: 0.78rem;
  font-weight: 650;
  line-height: 1.45;
}

@media (max-width: 640px) {
  .panelMetricasSecretaria__nota {
    font-size: 0.74rem;
  }
}
</style>
