<!-- src/components/graficas/GraficaProgramasPorSecretaria.vue -->

<template>
  <ChartCard
    :titulo="titulo"
    :descripcion-corta="descripcionCorta"
    :descripcion-amplia="descripcionAmplia"
    :valor-principal="totalProgramas"
    :fuente="fuente"
    :fecha-corte="fechaCorte"
    :color="colorNormalizado"
    :cargando="cargando"
    :vacio="sinDatos"
    :titulo-vacio="tituloVacio"
    :mensaje-vacio="mensajeVacio"
    :tamano="tamano"
    :disposicion="disposicion"
    aria-label-grafica="Gráfica de barras horizontales con programas por secretaría"
  >
    <template v-if="mostrarSelectorTop" #selector>
      <label class="graficaProgramasPorSecretaria__selector">
        <span>Mostrar</span>

        <select v-model.number="topSeleccionado" class="graficaProgramasPorSecretaria__select">
          <option :value="5">Top 5</option>

          <option :value="10">Top 10</option>

          <option :value="15">Top 15</option>

          <option :value="0">Todas</option>
        </select>
      </label>
    </template>

    <template #chart>
      <BaseEChart
        :opciones="opcionesGrafica"
        :loading="cargando"
        :color="colorNormalizado"
        :altura="alturaGrafica"
        descripcion-accesible="Comparativo de cantidad de programas registrados por secretaría."
        @click="emitirClickBarra"
      />
    </template>

    <template v-if="mostrarResumen" #resumenExtra>
      <div class="graficaProgramasPorSecretaria__resumen">
        <div class="graficaProgramasPorSecretaria__resumenItem">
          <span>Mayor registro</span>
          <strong>{{ secretariaMayorTexto }}</strong>
        </div>

        <div class="graficaProgramasPorSecretaria__resumenItem">
          <span>Promedio</span>
          <strong>{{ promedioProgramasTexto }}</strong>
        </div>
      </div>
    </template>
  </ChartCard>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Layers3 } from 'lucide-vue-next'

import BaseEChart from './BaseEChart.vue'
import ChartCard from './ChartCard.vue'

const props = defineProps({
  secretarias: {
    type: Array,
    default: () => [],
  },
  titulo: {
    type: String,
    default: 'Programas por secretaría',
  },
  descripcionCorta: {
    type: String,
    default: 'Cantidad de programas y acciones reportadas',
  },
  descripcionAmplia: {
    type: String,
    default:
      'Comparativo de programas registrados por cada dependencia. Permite ubicar rápidamente dónde se concentra la mayor carga de información.',
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
  mostrarSelectorTop: {
    type: Boolean,
    default: true,
  },
  mostrarResumen: {
    type: Boolean,
    default: true,
  },
  incluirSinDatos: {
    type: Boolean,
    default: false,
  },
  usarColoresSecretaria: {
    type: Boolean,
    default: false,
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
    default: 'No hay programas registrados',
  },
  mensajeVacio: {
    type: String,
    default:
      'Cuando existan programas capturados por secretaría, se mostrará el comparativo en esta sección.',
  },
})

const emit = defineEmits(['clickBarra'])

const topSeleccionado = ref(props.top)

const colorNormalizado = computed(() => {
  return validarColor(props.color)
})

const datosBase = computed(() => {
  return props.secretarias
    .filter((secretaria) => secretaria && typeof secretaria === 'object')
    .map((secretaria) => {
      const programas = Array.isArray(secretaria.programas) ? secretaria.programas : []

      return {
        id: secretaria.id || secretaria.sigla || secretaria.nombre,
        sigla: secretaria.sigla || secretaria.id || 'N/D',
        nombre: secretaria.nombre || 'Secretaría sin nombre',
        color: validarColor(secretaria.color || props.color),
        totalProgramas: programas.length,
      }
    })
    .filter((secretaria) => {
      if (props.incluirSinDatos) {
        return true
      }

      return secretaria.totalProgramas > 0
    })
    .sort((secretariaA, secretariaB) => {
      return secretariaB.totalProgramas - secretariaA.totalProgramas
    })
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

const totalProgramas = computed(() => {
  const total = datosBase.value.reduce((acumulado, secretaria) => {
    return acumulado + secretaria.totalProgramas
  }, 0)

  return formatearEntero(total)
})

const secretariaMayor = computed(() => {
  return datosBase.value[0] || null
})

const secretariaMayorTexto = computed(() => {
  if (!secretariaMayor.value) {
    return 'Sin datos'
  }

  return `${secretariaMayor.value.sigla}: ${formatearEntero(secretariaMayor.value.totalProgramas)}`
})

const promedioProgramasTexto = computed(() => {
  if (datosBase.value.length === 0) {
    return '0'
  }

  const total = datosBase.value.reduce((acumulado, secretaria) => {
    return acumulado + secretaria.totalProgramas
  }, 0)

  const promedio = total / datosBase.value.length

  return formatearDecimal(promedio)
})

const alturaGrafica = computed(() => {
  if (props.altura) {
    return normalizarMedida(props.altura)
  }

  const totalBarras = Math.max(datosGrafica.value.length, 4)
  const alturaCalculada = Math.min(Math.max(totalBarras * 34 + 70, 230), 620)

  return `${alturaCalculada}px`
})

const opcionesGrafica = computed(() => {
  const categorias = datosGrafica.value.map((secretaria) => secretaria.sigla)
  const valores = datosGrafica.value.map((secretaria) => {
    return {
      value: secretaria.totalProgramas,
      secretaria,
      itemStyle: {
        color: props.usarColoresSecretaria ? secretaria.color : colorNormalizado.value,
      },
    }
  })

  return {
    grid: {
      left: 12,
      right: 42,
      top: 16,
      bottom: 22,
      containLabel: true,
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
    xAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: {
        formatter: (valor) => {
          return formatearEntero(valor)
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
    yAxis: {
      type: 'category',
      inverse: true,
      data: categorias,
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
        fontWeight: 700,
        width: 92,
        overflow: 'truncate',
      },
    },
    series: [
      {
        name: 'Programas',
        type: 'bar',
        data: valores,
        barWidth: 18,
        barMaxWidth: 24,
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 12,
            shadowColor: 'rgba(31, 41, 55, 0.18)',
          },
        },
        label: {
          show: true,
          position: 'right',
          color: '#374151',
          fontSize: 11,
          fontWeight: 800,
          formatter: (params) => {
            return formatearEntero(params.value)
          },
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

function emitirClickBarra(params) {
  const secretaria = params?.data?.secretaria

  if (!secretaria) {
    return
  }

  emit('clickBarra', secretaria)
}

function formatearTooltip(params = []) {
  const item = Array.isArray(params) ? params[0] : params
  const secretaria = item?.data?.secretaria

  if (!secretaria) {
    return ''
  }

  const programasTexto =
    secretaria.totalProgramas === 1 ? 'programa registrado' : 'programas registrados'

  return `
    <div style="min-width: 180px;">
      <strong style="display:block;margin-bottom:4px;">${escaparHtml(secretaria.sigla)}</strong>
      <span style="display:block;color:#d1d5db;font-size:11px;line-height:1.35;margin-bottom:6px;">
        ${escaparHtml(secretaria.nombre)}
      </span>
      <span style="display:block;">
        ${formatearEntero(secretaria.totalProgramas)} ${programasTexto}
      </span>
    </div>
  `
}

function escaparHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
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

function formatearDecimal(valor) {
  const numero = Number(valor)

  if (!Number.isFinite(numero)) {
    return '0'
  }

  return new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: 1,
  }).format(numero)
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
</script>

<style scoped>
.graficaProgramasPorSecretaria__selector {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 850;
}

.graficaProgramasPorSecretaria__selector span {
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.graficaProgramasPorSecretaria__select {
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

.graficaProgramasPorSecretaria__select:focus {
  border-color: rgba(159, 34, 65, 0.42);
  box-shadow: 0 0 0 4px rgba(159, 34, 65, 0.08);
}

.graficaProgramasPorSecretaria__resumen {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  max-width: 520px;
}

.graficaProgramasPorSecretaria__resumenItem {
  border: 1px solid rgba(159, 34, 65, 0.08);
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.68);
  padding: 0.65rem 0.75rem;
}

.graficaProgramasPorSecretaria__resumenItem span {
  display: block;
  color: #9ca3af;
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.graficaProgramasPorSecretaria__resumenItem strong {
  display: block;
  margin-top: 0.18rem;
  color: #374151;
  font-size: 0.82rem;
  font-weight: 900;
  line-height: 1.25;
}

@media (max-width: 640px) {
  .graficaProgramasPorSecretaria__selector {
    width: 100%;
    justify-content: space-between;
  }

  .graficaProgramasPorSecretaria__select {
    flex: 1;
  }

  .graficaProgramasPorSecretaria__resumen {
    grid-template-columns: 1fr;
  }
}
</style>
