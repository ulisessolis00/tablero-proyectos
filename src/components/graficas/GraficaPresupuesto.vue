<!-- src/components/graficas/GraficaPresupuesto.vue -->

<template>
  <ChartCard
    :titulo="titulo"
    :descripcion-corta="descripcionCorta"
    :descripcion-amplia="descripcionAmplia"
    :valor-principal="presupuestoAsignadoTotalTexto"
    :fuente="fuente"
    :fecha-corte="fechaCorte"
    :color="colorNormalizado"
    :cargando="cargando"
    :vacio="sinDatos"
    :titulo-vacio="tituloVacio"
    :mensaje-vacio="mensajeVacio"
    :tamano="tamano"
    :disposicion="disposicion"
    aria-label-grafica="Gráfica comparativa de presupuesto asignado, ejercido y porcentaje ejercido"
  >
    <template v-if="mostrarControles" #selector>
      <div class="graficaPresupuesto__controles">
        <label class="graficaPresupuesto__campo">
          <span>Orden</span>

          <select v-model="ordenSeleccionado" class="graficaPresupuesto__select">
            <option value="asignado">Asignado</option>

            <option value="ejercido">Ejercido</option>

            <option value="porcentaje">% ejercido</option>

            <option value="alfabetico">Alfabético</option>
          </select>
        </label>

        <label class="graficaPresupuesto__campo">
          <span>Mostrar</span>

          <select v-model.number="topSeleccionado" class="graficaPresupuesto__select">
            <option :value="5">Top 5</option>

            <option :value="10">Top 10</option>

            <option :value="15">Top 15</option>

            <option :value="0">Todas</option>
          </select>
        </label>
      </div>
    </template>

    <template #chart>
      <BaseEChart
        :opciones="opcionesGrafica"
        :loading="cargando"
        :color="colorNormalizado"
        :altura="alturaGrafica"
        descripcion-accesible="Comparativo de presupuesto asignado, presupuesto ejercido y porcentaje ejercido por secretaría."
        @click="emitirClickElemento"
      />
    </template>

    <template v-if="mostrarResumen" #resumenExtra>
      <div class="graficaPresupuesto__resumen">
        <div class="graficaPresupuesto__resumenItem">
          <span>Asignado total</span>
          <strong>{{ presupuestoAsignadoTotalTexto }}</strong>
        </div>

        <div class="graficaPresupuesto__resumenItem">
          <span>Ejercido total</span>
          <strong>{{ presupuestoEjercidoTotalTexto }}</strong>
        </div>

        <div class="graficaPresupuesto__resumenItem">
          <span>% ejercido</span>
          <strong>{{ porcentajeEjercidoTotalTexto }}</strong>
        </div>
      </div>
    </template>
  </ChartCard>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

import BaseEChart from './BaseEChart.vue'
import ChartCard from './ChartCard.vue'

const props = defineProps({
  secretarias: {
    type: Array,
    default: () => [],
  },
  titulo: {
    type: String,
    default: 'Avance presupuestal',
  },
  descripcionCorta: {
    type: String,
    default: 'Presupuesto asignado, ejercido y porcentaje ejercido',
  },
  descripcionAmplia: {
    type: String,
    default:
      'Comparativo presupuestal por secretaría. Permite identificar dependencias con presupuesto capturado, monto ejercido y proporción de avance financiero.',
  },
  fuente: {
    type: String,
    default: 'Plantilla local de secretarías',
  },
  fechaCorte: {
    type: [String, Date],
    default: () => new Date(),
  },
  color: {
    type: String,
    default: '#9b8d4b',
  },
  top: {
    type: Number,
    default: 10,
  },
  orden: {
    type: String,
    default: 'asignado',
    validator: (valor) => {
      return ['asignado', 'ejercido', 'porcentaje', 'alfabetico'].includes(valor)
    },
  },
  incluirSinPresupuesto: {
    type: Boolean,
    default: false,
  },
  mostrarControles: {
    type: Boolean,
    default: true,
  },
  mostrarResumen: {
    type: Boolean,
    default: true,
  },
  cargando: {
    type: Boolean,
    default: false,
  },
  altura: {
    type: [String, Number],
    default: '',
  },
  tamano: {
    type: String,
    default: 'normal',
  },
  disposicion: {
    type: String,
    default: 'vertical',
  },
  tituloVacio: {
    type: String,
    default: 'No hay presupuesto capturado',
  },
  mensajeVacio: {
    type: String,
    default:
      'Cuando existan montos de presupuesto asignado o ejercido, se mostrará el comparativo en esta sección.',
  },
})

const emit = defineEmits(['clickElemento'])

const topSeleccionado = ref(props.top)
const ordenSeleccionado = ref(props.orden)

const colorNormalizado = computed(() => {
  return validarColor(props.color)
})

const datosBase = computed(() => {
  const datos = props.secretarias
    .filter((secretaria) => secretaria && typeof secretaria === 'object')
    .map(crearRegistroPresupuesto)
    .filter((secretaria) => {
      if (props.incluirSinPresupuesto) {
        return true
      }

      return secretaria.presupuestoAsignado > 0 || secretaria.presupuestoEjercido > 0
    })

  return ordenarRegistros(datos)
})

const datosGrafica = computed(() => {
  if (!topSeleccionado.value || topSeleccionado.value <= 0) {
    return datosBase.value
  }

  return datosBase.value.slice(0, topSeleccionado.value)
})

const sinDatos = computed(() => {
  return !props.cargando && datosBase.value.length === 0
})

const presupuestoAsignadoTotal = computed(() => {
  return datosBase.value.reduce((total, secretaria) => {
    return total + secretaria.presupuestoAsignado
  }, 0)
})

const presupuestoEjercidoTotal = computed(() => {
  return datosBase.value.reduce((total, secretaria) => {
    return total + secretaria.presupuestoEjercido
  }, 0)
})

const porcentajeEjercidoTotal = computed(() => {
  return calcularPorcentaje(presupuestoEjercidoTotal.value, presupuestoAsignadoTotal.value)
})

const presupuestoAsignadoTotalTexto = computed(() => {
  return formatearPesosCorto(presupuestoAsignadoTotal.value)
})

const presupuestoEjercidoTotalTexto = computed(() => {
  return formatearPesosCorto(presupuestoEjercidoTotal.value)
})

const porcentajeEjercidoTotalTexto = computed(() => {
  return formatearPorcentaje(porcentajeEjercidoTotal.value)
})

const alturaGrafica = computed(() => {
  if (props.altura) {
    return normalizarMedida(props.altura)
  }

  const totalBarras = Math.max(datosGrafica.value.length, 4)
  const alturaCalculada = Math.min(Math.max(totalBarras * 42 + 105, 300), 760)

  return `${alturaCalculada}px`
})

const opcionesGrafica = computed(() => {
  const categorias = datosGrafica.value.map((secretaria) => secretaria.sigla)

  return {
    grid: {
      left: 12,
      right: 62,
      top: 52,
      bottom: 32,
      containLabel: true,
    },
    legend: {
      type: 'scroll',
      top: 0,
      left: 0,
      icon: 'roundRect',
      itemWidth: 16,
      itemHeight: 8,
      textStyle: {
        color: '#6b7280',
        fontSize: 11,
        fontWeight: 650,
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(156, 163, 175, 0.12)',
        },
      },
      formatter: formatearTooltip,
    },
    xAxis: [
      {
        type: 'value',
        name: 'Presupuesto',
        position: 'bottom',
        axisLabel: {
          formatter: (valor) => {
            return formatearPesosCorto(valor)
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: 'rgba(156, 163, 175, 0.26)',
          },
        },
      },
      {
        type: 'value',
        min: 0,
        max: 100,
        name: '% ejercido',
        position: 'top',
        axisLabel: {
          formatter: '{value}%',
        },
        splitLine: {
          show: false,
        },
      },
    ],
    yAxis: {
      type: 'category',
      inverse: true,
      data: categorias,
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
        fontWeight: 800,
        width: 92,
        overflow: 'truncate',
      },
    },
    series: [
      {
        name: 'Asignado',
        type: 'bar',
        xAxisIndex: 0,
        data: datosGrafica.value.map((secretaria) => {
          return {
            value: secretaria.presupuestoAsignado,
            secretaria,
          }
        }),
        barWidth: 14,
        barMaxWidth: 18,
        itemStyle: {
          color: colorNormalizado.value,
          borderRadius: [0, 7, 7, 0],
        },
        emphasis: {
          focus: 'series',
        },
      },
      {
        name: 'Ejercido',
        type: 'bar',
        xAxisIndex: 0,
        data: datosGrafica.value.map((secretaria) => {
          return {
            value: secretaria.presupuestoEjercido,
            secretaria,
          }
        }),
        barWidth: 14,
        barMaxWidth: 18,
        itemStyle: {
          color: '#0d9488',
          borderRadius: [0, 7, 7, 0],
        },
        emphasis: {
          focus: 'series',
        },
      },
      {
        name: '% ejercido',
        type: 'scatter',
        xAxisIndex: 1,
        symbol: 'diamond',
        symbolSize: 13,
        data: datosGrafica.value.map((secretaria) => {
          return {
            value: secretaria.porcentajeEjercido,
            secretaria,
          }
        }),
        itemStyle: {
          color: '#b45309',
          borderColor: '#ffffff',
          borderWidth: 2,
        },
        label: {
          show: true,
          position: 'right',
          color: '#374151',
          fontSize: 11,
          fontWeight: 850,
          formatter: (params) => {
            return formatearPorcentaje(params.value)
          },
        },
        emphasis: {
          focus: 'series',
          scale: true,
        },
      },
    ],
  }
})

watch(
  () => props.top,
  (valor) => {
    topSeleccionado.value = valor
  },
)

watch(
  () => props.orden,
  (valor) => {
    ordenSeleccionado.value = valor
  },
)

function crearRegistroPresupuesto(secretaria) {
  const programas = Array.isArray(secretaria.programas) ? secretaria.programas : []

  const presupuestoAsignado = programas.reduce((total, programa) => {
    return total + (normalizarNumero(programa.presupuestoAsignado) || 0)
  }, 0)

  const presupuestoEjercido = programas.reduce((total, programa) => {
    return total + (normalizarNumero(programa.presupuestoEjercido) || 0)
  }, 0)

  return {
    id: secretaria.id || secretaria.sigla || secretaria.nombre,
    sigla: secretaria.sigla || secretaria.id || 'N/D',
    nombre: secretaria.nombre || 'Secretaría sin nombre',
    totalProgramas: programas.length,
    presupuestoAsignado,
    presupuestoEjercido,
    porcentajeEjercido: calcularPorcentaje(presupuestoEjercido, presupuestoAsignado),
  }
}

function ordenarRegistros(registros) {
  const lista = [...registros]

  if (ordenSeleccionado.value === 'alfabetico') {
    return lista.sort((a, b) => {
      return a.sigla.localeCompare(b.sigla, 'es')
    })
  }

  if (ordenSeleccionado.value === 'ejercido') {
    return lista.sort((a, b) => {
      return b.presupuestoEjercido - a.presupuestoEjercido
    })
  }

  if (ordenSeleccionado.value === 'porcentaje') {
    return lista.sort((a, b) => {
      return b.porcentajeEjercido - a.porcentajeEjercido
    })
  }

  return lista.sort((a, b) => {
    return b.presupuestoAsignado - a.presupuestoAsignado
  })
}

function emitirClickElemento(params) {
  const secretaria = params?.data?.secretaria

  if (!secretaria) {
    return
  }

  emit('clickElemento', {
    secretaria,
    serie: params.seriesName,
    valor: params.value,
  })
}

function formatearTooltip(params = []) {
  const items = Array.isArray(params) ? params : [params]
  const secretaria = items.find((item) => item?.data?.secretaria)?.data?.secretaria

  if (!secretaria) {
    return ''
  }

  return `
    <div style="min-width:240px;">
      <strong style="display:block;margin-bottom:4px;">${escaparHtml(secretaria.sigla)}</strong>

      <span style="display:block;color:#d1d5db;font-size:11px;line-height:1.35;margin-bottom:8px;">
        ${escaparHtml(secretaria.nombre)}
      </span>

      <div style="display:flex;justify-content:space-between;gap:18px;margin-top:4px;">
        <span>Asignado</span>
        <strong>${formatearPesos(secretaria.presupuestoAsignado)}</strong>
      </div>

      <div style="display:flex;justify-content:space-between;gap:18px;margin-top:4px;">
        <span>Ejercido</span>
        <strong>${formatearPesos(secretaria.presupuestoEjercido)}</strong>
      </div>

      <div style="border-top:1px solid rgba(255,255,255,.16);margin-top:8px;padding-top:6px;display:flex;justify-content:space-between;gap:18px;">
        <span>% ejercido</span>
        <strong>${formatearPorcentaje(secretaria.porcentajeEjercido)}</strong>
      </div>
    </div>
  `
}

function normalizarNumero(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return null
  }

  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : null
  }

  const texto = String(valor).replace(/\$/g, '').replace(/,/g, '').replace(/%/g, '').trim()

  const numero = Number(texto)

  return Number.isFinite(numero) ? numero : null
}

function calcularPorcentaje(valor, total) {
  const numero = Number(valor)
  const totalNumero = Number(total)

  if (!Number.isFinite(numero) || !Number.isFinite(totalNumero) || totalNumero <= 0) {
    return 0
  }

  return (numero / totalNumero) * 100
}

function formatearPesos(valor) {
  const numero = Number(valor)

  if (!Number.isFinite(numero) || numero <= 0) {
    return 'Por capturar'
  }

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(numero)
}

function formatearPesosCorto(valor) {
  const numero = Number(valor)

  if (!Number.isFinite(numero) || numero <= 0) {
    return '$0'
  }

  if (numero >= 1_000_000_000) {
    return `$${(numero / 1_000_000_000).toFixed(1)}B`
  }

  if (numero >= 1_000_000) {
    return `$${Math.round(numero / 1_000_000)}M`
  }

  if (numero >= 1_000) {
    return `$${Math.round(numero / 1_000)}K`
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
    return '0%'
  }

  return `${new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: 1,
  }).format(numero)}%`
}

function normalizarMedida(valor) {
  if (typeof valor === 'number') {
    return `${valor}px`
  }

  return String(valor)
}

function validarColor(valor) {
  if (/^#[0-9a-fA-F]{6}$/.test(valor || '')) {
    return valor
  }

  return '#9b8d4b'
}

function escaparHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
</script>

<style scoped>
.graficaPresupuesto__controles {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.graficaPresupuesto__campo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 850;
}

.graficaPresupuesto__campo span {
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.graficaPresupuesto__select {
  min-height: 2.1rem;
  border: 1px solid rgba(159, 34, 65, 0.12);
  border-radius: 999px;
  background: #ffffff;
  color: #374151;
  padding: 0.35rem 1.9rem 0.35rem 0.75rem;
  font: inherit;
  font-size: 0.76rem;
  font-weight: 800;
  outline: none;
  appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, #6b7280 50%),
    linear-gradient(135deg, #6b7280 50%, transparent 50%);
  background-position:
    calc(100% - 15px) calc(50% + 1px),
    calc(100% - 10px) calc(50% + 1px);
  background-size:
    5px 5px,
    5px 5px;
  background-repeat: no-repeat;
}

.graficaPresupuesto__select:focus {
  border-color: rgba(159, 34, 65, 0.42);
  box-shadow: 0 0 0 4px rgba(159, 34, 65, 0.08);
}

.graficaPresupuesto__resumen {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
  max-width: 760px;
}

.graficaPresupuesto__resumenItem {
  border: 1px solid rgba(159, 34, 65, 0.08);
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.68);
  padding: 0.65rem 0.75rem;
}

.graficaPresupuesto__resumenItem span {
  display: block;
  color: #9ca3af;
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.graficaPresupuesto__resumenItem strong {
  display: block;
  margin-top: 0.18rem;
  color: #374151;
  font-size: 0.82rem;
  font-weight: 900;
  line-height: 1.25;
}

@media (max-width: 820px) {
  .graficaPresupuesto__resumen {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .graficaPresupuesto__controles,
  .graficaPresupuesto__campo {
    width: 100%;
  }

  .graficaPresupuesto__campo {
    justify-content: space-between;
  }

  .graficaPresupuesto__select {
    flex: 1;
  }
}
</style>
