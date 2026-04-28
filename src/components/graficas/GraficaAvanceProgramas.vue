<!-- src/components/graficas/GraficaAvanceProgramas.vue -->

<template>
  <ChartCard
    :titulo="titulo"
    :descripcion-corta="descripcionCorta"
    :descripcion-amplia="descripcionAmplia"
    :valor-principal="avancePromedioGeneralTexto"
    unidad="%"
    :fuente="fuente"
    :fecha-corte="fechaCorte"
    :color="colorNormalizado"
    :cargando="cargando"
    :vacio="sinDatos"
    :titulo-vacio="tituloVacio"
    :mensaje-vacio="mensajeVacio"
    :tamano="tamano"
    :disposicion="disposicion"
    aria-label-grafica="Bullet chart de avance promedio reportado por secretaría"
  >
    <template v-if="mostrarControles" #selector>
      <div class="graficaAvanceProgramas__controles">
        <label class="graficaAvanceProgramas__campo">
          <span>Orden</span>

          <select v-model="ordenSeleccionado" class="graficaAvanceProgramas__select">
            <option value="menorMayor">Menor a mayor</option>

            <option value="mayorMenor">Mayor a menor</option>

            <option value="alfabetico">Alfabético</option>
          </select>
        </label>

        <label class="graficaAvanceProgramas__campo">
          <span>Mostrar</span>

          <select v-model.number="topSeleccionado" class="graficaAvanceProgramas__select">
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
        descripcion-accesible="Bullet chart con avance promedio reportado por secretaría."
        @click="emitirClickAvance"
      />
    </template>

    <template v-if="mostrarResumen" #resumenExtra>
      <div class="graficaAvanceProgramas__resumen">
        <div class="graficaAvanceProgramas__resumenItem">
          <span>Con avance capturado</span>
          <strong>{{ programasConAvanceTexto }}</strong>
        </div>

        <div class="graficaAvanceProgramas__resumenItem">
          <span>Avance alto</span>
          <strong>{{ avanceAltoTexto }}</strong>
        </div>

        <div class="graficaAvanceProgramas__resumenItem">
          <span>Requiere revisión</span>
          <strong>{{ avanceBajoTexto }}</strong>
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
    default: 'Avance reportado por secretaría',
  },
  descripcionCorta: {
    type: String,
    default: 'Bullet chart de avance físico promedio',
  },
  descripcionAmplia: {
    type: String,
    default:
      'Permite comparar el avance promedio reportado por cada secretaría y ubicar dependencias con avance alto, medio o pendiente de revisión.',
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
    default: 'menorMayor',
    validator: (valor) => {
      return ['menorMayor', 'mayorMenor', 'alfabetico'].includes(valor)
    },
  },
  incluirSinAvance: {
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
    default: 'No hay avances capturados',
  },
  mensajeVacio: {
    type: String,
    default:
      'Cuando existan porcentajes de avance en los programas, se mostrará el bullet chart por secretaría.',
  },
})

const emit = defineEmits(['clickAvance'])

const topSeleccionado = ref(props.top)
const ordenSeleccionado = ref(props.orden)

const colorNormalizado = computed(() => {
  return validarColor(props.color)
})

const datosBase = computed(() => {
  const datos = props.secretarias
    .filter((secretaria) => secretaria && typeof secretaria === 'object')
    .map(crearRegistroAvance)
    .filter((secretaria) => {
      if (props.incluirSinAvance) {
        return true
      }

      return secretaria.programasConAvance > 0
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

const avancePromedioGeneral = computed(() => {
  const avances = datosBase.value
    .map((secretaria) => secretaria.avancePromedio)
    .filter((avance) => Number.isFinite(avance))

  if (!avances.length) {
    return 0
  }

  const total = avances.reduce((acumulado, avance) => {
    return acumulado + avance
  }, 0)

  return total / avances.length
})

const avancePromedioGeneralTexto = computed(() => {
  return formatearDecimal(avancePromedioGeneral.value)
})

const programasConAvance = computed(() => {
  return datosBase.value.reduce((total, secretaria) => {
    return total + secretaria.programasConAvance
  }, 0)
})

const programasTotales = computed(() => {
  return datosBase.value.reduce((total, secretaria) => {
    return total + secretaria.totalProgramas
  }, 0)
})

const programasConAvanceTexto = computed(() => {
  return `${formatearEntero(programasConAvance.value)} de ${formatearEntero(programasTotales.value)}`
})

const avanceAlto = computed(() => {
  return datosBase.value.filter((secretaria) => secretaria.avancePromedio >= 80).length
})

const avanceBajo = computed(() => {
  return datosBase.value.filter((secretaria) => secretaria.avancePromedio < 50).length
})

const avanceAltoTexto = computed(() => {
  return `${formatearEntero(avanceAlto.value)} secretarías`
})

const avanceBajoTexto = computed(() => {
  return `${formatearEntero(avanceBajo.value)} secretarías`
})

const alturaGrafica = computed(() => {
  if (props.altura) {
    return normalizarMedida(props.altura)
  }

  const totalFilas = Math.max(datosGrafica.value.length, 4)
  const alturaCalculada = Math.min(Math.max(totalFilas * 38 + 100, 280), 720)

  return `${alturaCalculada}px`
})

const opcionesGrafica = computed(() => {
  const categorias = datosGrafica.value.map((secretaria) => secretaria.sigla)

  return {
    grid: {
      left: 12,
      right: 56,
      top: 36,
      bottom: 34,
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
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%',
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
        fontWeight: 800,
        width: 92,
        overflow: 'truncate',
      },
    },
    series: [
      {
        name: 'Meta',
        type: 'bar',
        silent: true,
        barWidth: 18,
        barGap: '-100%',
        data: datosGrafica.value.map((secretaria) => {
          return {
            value: 100,
            secretaria,
          }
        }),
        itemStyle: {
          color: '#eef0f3',
          borderRadius: [0, 10, 10, 0],
        },
        emphasis: {
          disabled: true,
        },
        z: 1,
      },
      {
        name: 'Avance promedio',
        type: 'bar',
        barWidth: 18,
        data: datosGrafica.value.map((secretaria) => {
          return {
            value: secretaria.avancePromedio,
            secretaria,
            itemStyle: {
              color: obtenerColorAvance(secretaria.avancePromedio),
            },
          }
        }),
        itemStyle: {
          borderRadius: [0, 10, 10, 0],
        },
        label: {
          show: true,
          position: 'right',
          color: '#374151',
          fontSize: 11,
          fontWeight: 850,
          formatter: (params) => {
            return `${formatearDecimal(params.value)}%`
          },
        },
        markLine: {
          symbol: 'none',
          silent: true,
          lineStyle: {
            color: '#b45309',
            type: 'dashed',
            width: 1.5,
          },
          label: {
            color: '#b45309',
            fontSize: 10,
            fontWeight: 800,
            formatter: '80%',
          },
          data: [
            {
              xAxis: 80,
            },
          ],
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 12,
            shadowColor: 'rgba(31, 41, 55, 0.18)',
          },
        },
        z: 2,
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

function crearRegistroAvance(secretaria) {
  const programas = Array.isArray(secretaria.programas) ? secretaria.programas : []

  const avances = programas
    .map((programa) => normalizarNumero(programa.avance))
    .filter((avance) => avance !== null)

  const avancePromedio = avances.length
    ? avances.reduce((total, avance) => total + avance, 0) / avances.length
    : 0

  return {
    id: secretaria.id || secretaria.sigla || secretaria.nombre,
    sigla: secretaria.sigla || secretaria.id || 'N/D',
    nombre: secretaria.nombre || 'Secretaría sin nombre',
    totalProgramas: programas.length,
    programasConAvance: avances.length,
    programasSinAvance: programas.length - avances.length,
    avancePromedio: limitarRango(avancePromedio, 0, 100),
  }
}

function ordenarRegistros(registros) {
  const lista = [...registros]

  if (ordenSeleccionado.value === 'alfabetico') {
    return lista.sort((a, b) => {
      return a.sigla.localeCompare(b.sigla, 'es')
    })
  }

  if (ordenSeleccionado.value === 'mayorMenor') {
    return lista.sort((a, b) => {
      return b.avancePromedio - a.avancePromedio
    })
  }

  return lista.sort((a, b) => {
    return a.avancePromedio - b.avancePromedio
  })
}

function emitirClickAvance(params) {
  const secretaria = params?.data?.secretaria

  if (!secretaria) {
    return
  }

  emit('clickAvance', {
    secretaria,
    avance: params.value,
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
        <span>Avance promedio</span>
        <strong>${formatearDecimal(secretaria.avancePromedio)}%</strong>
      </div>

      <div style="display:flex;justify-content:space-between;gap:18px;margin-top:4px;">
        <span>Con avance</span>
        <strong>${formatearEntero(secretaria.programasConAvance)}</strong>
      </div>

      <div style="display:flex;justify-content:space-between;gap:18px;margin-top:4px;">
        <span>Sin avance</span>
        <strong>${formatearEntero(secretaria.programasSinAvance)}</strong>
      </div>
    </div>
  `
}

function obtenerColorAvance(avance) {
  const numero = Number(avance)

  if (!Number.isFinite(numero)) {
    return '#9ca3af'
  }

  if (numero >= 80) {
    return '#0d9488'
  }

  if (numero >= 50) {
    return colorNormalizado.value
  }

  return '#b45309'
}

function normalizarNumero(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return null
  }

  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? limitarRango(valor, 0, 100) : null
  }

  const texto = String(valor).replace(/%/g, '').replace(/,/g, '').trim()

  const numero = Number(texto)

  return Number.isFinite(numero) ? limitarRango(numero, 0, 100) : null
}

function limitarRango(valor, minimo, maximo) {
  return Math.min(Math.max(Number(valor), minimo), maximo)
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
.graficaAvanceProgramas__controles {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.graficaAvanceProgramas__campo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 850;
}

.graficaAvanceProgramas__campo span {
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.graficaAvanceProgramas__select {
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

.graficaAvanceProgramas__select:focus {
  border-color: rgba(159, 34, 65, 0.42);
  box-shadow: 0 0 0 4px rgba(159, 34, 65, 0.08);
}

.graficaAvanceProgramas__resumen {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
  max-width: 760px;
}

.graficaAvanceProgramas__resumenItem {
  border: 1px solid rgba(159, 34, 65, 0.08);
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.68);
  padding: 0.65rem 0.75rem;
}

.graficaAvanceProgramas__resumenItem span {
  display: block;
  color: #9ca3af;
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.graficaAvanceProgramas__resumenItem strong {
  display: block;
  margin-top: 0.18rem;
  color: #374151;
  font-size: 0.82rem;
  font-weight: 900;
  line-height: 1.25;
}

@media (max-width: 820px) {
  .graficaAvanceProgramas__resumen {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .graficaAvanceProgramas__controles,
  .graficaAvanceProgramas__campo {
    width: 100%;
  }

  .graficaAvanceProgramas__campo {
    justify-content: space-between;
  }

  .graficaAvanceProgramas__select {
    flex: 1;
  }
}
</style>
