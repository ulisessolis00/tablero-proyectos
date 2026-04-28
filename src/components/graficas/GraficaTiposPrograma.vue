<!-- src/components/graficas/GraficaTiposPrograma.vue -->

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
    aria-label-grafica="Gráfica de tipos de programa por secretaría"
  >
    <template v-if="mostrarControles" #selector>
      <div class="graficaTiposPrograma__controles">
        <label class="graficaTiposPrograma__campo">
          <span>Vista</span>

          <select v-model="modoSeleccionado" class="graficaTiposPrograma__select">
            <option value="apilada">Apilada</option>

            <option value="agrupada">Agrupada</option>
          </select>
        </label>

        <label class="graficaTiposPrograma__campo">
          <span>Mostrar</span>

          <select v-model.number="topSeleccionado" class="graficaTiposPrograma__select">
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
        descripcion-accesible="Comparativo de tipos de programa por secretaría."
        @click="emitirClickBarra"
      />
    </template>

    <template v-if="mostrarResumen" #resumenExtra>
      <div class="graficaTiposPrograma__resumen">
        <div class="graficaTiposPrograma__resumenItem">
          <span>Tipo dominante</span>
          <strong>{{ tipoDominanteTexto }}</strong>
        </div>

        <div class="graficaTiposPrograma__resumenItem">
          <span>Tipos detectados</span>
          <strong>{{ totalTiposTexto }}</strong>
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
    default: 'Tipos de programa por secretaría',
  },
  descripcionCorta: {
    type: String,
    default: 'Distribución por clasificación',
  },
  descripcionAmplia: {
    type: String,
    default:
      'Comparativo de programas agrupados por tipo para identificar qué dependencias concentran más programas sociales, acciones, proyectos o servicios.',
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
  modo: {
    type: String,
    default: 'apilada',
    validator: (valor) => {
      return ['apilada', 'agrupada'].includes(valor)
    },
  },
  top: {
    type: Number,
    default: 10,
  },
  mostrarControles: {
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
    default: 'No hay tipos de programa disponibles',
  },
  mensajeVacio: {
    type: String,
    default:
      'Cuando existan programas clasificados por tipo, se mostrará el comparativo en esta sección.',
  },
})

const emit = defineEmits(['clickBarra'])

const modoSeleccionado = ref(props.modo)
const topSeleccionado = ref(props.top)

const paletaTipos = Object.freeze([
  '#9b8d4b',
  '#9f3a6d',
  '#0d9488',
  '#2563eb',
  '#e3872f',
  '#6b5fa8',
  '#b45309',
  '#059669',
])

const colorNormalizado = computed(() => {
  return validarColor(props.color)
})

const datosBase = computed(() => {
  return props.secretarias
    .filter((secretaria) => secretaria && typeof secretaria === 'object')
    .map((secretaria) => {
      const programas = obtenerProgramas(secretaria)
      const tipos = contarTipos(programas)
      const totalProgramas = programas.length

      return {
        id: secretaria.id || secretaria.sigla || secretaria.nombre,
        sigla: secretaria.sigla || secretaria.id || 'N/D',
        nombre: secretaria.nombre || 'Secretaría sin nombre',
        totalProgramas,
        tipos,
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

const tiposPrograma = computed(() => {
  const tipos = new Set()

  datosGrafica.value.forEach((secretaria) => {
    Object.keys(secretaria.tipos).forEach((tipo) => {
      tipos.add(tipo)
    })
  })

  return [...tipos].sort((a, b) => {
    return a.localeCompare(b, 'es')
  })
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

const totalTiposTexto = computed(() => {
  const tipos = new Set()

  datosBase.value.forEach((secretaria) => {
    Object.keys(secretaria.tipos).forEach((tipo) => {
      tipos.add(tipo)
    })
  })

  return formatearEntero(tipos.size)
})

const tipoDominanteTexto = computed(() => {
  const conteo = datosBase.value.reduce((acumulado, secretaria) => {
    Object.entries(secretaria.tipos).forEach(([tipo, total]) => {
      acumulado[tipo] = (acumulado[tipo] || 0) + total
    })

    return acumulado
  }, {})

  const tipoMayor = Object.entries(conteo).sort((tipoA, tipoB) => tipoB[1] - tipoA[1])[0]

  if (!tipoMayor) {
    return 'Sin datos'
  }

  return `${tipoMayor[0]} (${formatearEntero(tipoMayor[1])})`
})

const alturaGrafica = computed(() => {
  if (props.altura) {
    return normalizarMedida(props.altura)
  }

  const totalBarras = Math.max(datosGrafica.value.length, 4)
  const alturaCalculada = Math.min(Math.max(totalBarras * 38 + 90, 260), 680)

  return `${alturaCalculada}px`
})

const opcionesGrafica = computed(() => {
  const categorias = datosGrafica.value.map((secretaria) => secretaria.sigla)

  return {
    grid: {
      left: 12,
      right: 42,
      top: 42,
      bottom: 28,
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
    series: crearSeries(),
  }
})

watch(
  () => props.modo,
  (valor) => {
    modoSeleccionado.value = valor
  },
)

watch(
  () => props.top,
  (valor) => {
    topSeleccionado.value = valor
  },
)

function crearSeries() {
  return tiposPrograma.value.map((tipo, indice) => {
    return {
      name: tipo,
      type: 'bar',
      stack: modoSeleccionado.value === 'apilada' ? 'total' : undefined,
      barWidth: modoSeleccionado.value === 'apilada' ? 20 : undefined,
      barMaxWidth: 26,
      data: datosGrafica.value.map((secretaria) => {
        return {
          value: secretaria.tipos[tipo] || 0,
          secretaria,
          tipo,
        }
      }),
      itemStyle: {
        color: paletaTipos[indice % paletaTipos.length],
        borderRadius: modoSeleccionado.value === 'apilada' ? 0 : [0, 7, 7, 0],
      },
      emphasis: {
        focus: 'series',
      },
      label: {
        show: modoSeleccionado.value === 'apilada',
        position: 'inside',
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 850,
        formatter: (params) => {
          return params.value > 0 ? formatearEntero(params.value) : ''
        },
      },
    }
  })
}

function emitirClickBarra(params) {
  const secretaria = params?.data?.secretaria
  const tipo = params?.data?.tipo

  if (!secretaria) {
    return
  }

  emit('clickBarra', {
    secretaria,
    tipo,
  })
}

function obtenerProgramas(secretaria) {
  return Array.isArray(secretaria.programas) ? secretaria.programas : []
}

function contarTipos(programas) {
  return programas.reduce((acumulado, programa) => {
    const tipo = normalizarTipo(programa.tipo)

    acumulado[tipo] = (acumulado[tipo] || 0) + 1

    return acumulado
  }, {})
}

function normalizarTipo(tipo) {
  const texto = String(tipo || '').trim()

  if (!texto || texto.toUpperCase() === 'NA' || texto.toUpperCase() === 'NULL') {
    return 'General'
  }

  return texto
}

function formatearTooltip(params = []) {
  const items = Array.isArray(params) ? params : [params]

  const secretaria = items.find((item) => item?.data?.secretaria)?.data?.secretaria

  if (!secretaria) {
    return ''
  }

  const filas = items
    .filter((item) => Number(item.value) > 0)
    .map((item) => {
      return `
        <div style="display:flex;justify-content:space-between;gap:18px;margin-top:4px;">
          <span>
            <span style="display:inline-block;width:8px;height:8px;border-radius:999px;background:${item.color};margin-right:6px;"></span>
            ${escaparHtml(item.seriesName)}
          </span>
          <strong>${formatearEntero(item.value)}</strong>
        </div>
      `
    })
    .join('')

  return `
    <div style="min-width:220px;">
      <strong style="display:block;margin-bottom:4px;">${escaparHtml(secretaria.sigla)}</strong>
      <span style="display:block;color:#d1d5db;font-size:11px;line-height:1.35;margin-bottom:8px;">
        ${escaparHtml(secretaria.nombre)}
      </span>
      ${filas || '<span>Sin datos</span>'}
      <div style="border-top:1px solid rgba(255,255,255,.16);margin-top:8px;padding-top:6px;display:flex;justify-content:space-between;gap:18px;">
        <span>Total</span>
        <strong>${formatearEntero(secretaria.totalProgramas)}</strong>
      </div>
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
.graficaTiposPrograma__controles {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.graficaTiposPrograma__campo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 850;
}

.graficaTiposPrograma__campo span {
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.graficaTiposPrograma__select {
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

.graficaTiposPrograma__select:focus {
  border-color: rgba(159, 34, 65, 0.42);
  box-shadow: 0 0 0 4px rgba(159, 34, 65, 0.08);
}

.graficaTiposPrograma__resumen {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  max-width: 560px;
}

.graficaTiposPrograma__resumenItem {
  border: 1px solid rgba(159, 34, 65, 0.08);
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.68);
  padding: 0.65rem 0.75rem;
}

.graficaTiposPrograma__resumenItem span {
  display: block;
  color: #9ca3af;
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.graficaTiposPrograma__resumenItem strong {
  display: block;
  margin-top: 0.18rem;
  color: #374151;
  font-size: 0.82rem;
  font-weight: 900;
  line-height: 1.25;
}

@media (max-width: 640px) {
  .graficaTiposPrograma__controles,
  .graficaTiposPrograma__campo {
    width: 100%;
  }

  .graficaTiposPrograma__campo {
    justify-content: space-between;
  }

  .graficaTiposPrograma__select {
    flex: 1;
  }

  .graficaTiposPrograma__resumen {
    grid-template-columns: 1fr;
  }
}
</style>
