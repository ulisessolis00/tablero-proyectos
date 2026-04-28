<!-- src/components/graficas/GraficaCompletitudDatos.vue -->

<template>
  <ChartCard
    :titulo="titulo"
    :descripcion-corta="descripcionCorta"
    :descripcion-amplia="descripcionAmplia"
    :valor-principal="promedioGeneralTexto"
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
    aria-label-grafica="Matriz de completitud de datos por secretaría"
  >
    <template v-if="mostrarControles" #selector>
      <div class="graficaCompletitudDatos__controles">
        <label class="graficaCompletitudDatos__campo">
          <span>Orden</span>

          <select v-model="ordenSeleccionado" class="graficaCompletitudDatos__select">
            <option value="menorMayor">Menor a mayor</option>

            <option value="mayorMenor">Mayor a menor</option>

            <option value="alfabetico">Alfabético</option>
          </select>
        </label>

        <label class="graficaCompletitudDatos__campo">
          <span>Mostrar</span>

          <select v-model.number="topSeleccionado" class="graficaCompletitudDatos__select">
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
        descripcion-accesible="Heatmap de completitud de captura por secretaría y campo de información."
        @click="emitirClickCelda"
      />
    </template>

    <template v-if="mostrarResumen" #resumenExtra>
      <div class="graficaCompletitudDatos__resumen">
        <div class="graficaCompletitudDatos__resumenItem">
          <span>Campo más completo</span>
          <strong>{{ campoMasCompletoTexto }}</strong>
        </div>

        <div class="graficaCompletitudDatos__resumenItem">
          <span>Campo con más pendientes</span>
          <strong>{{ campoMasPendienteTexto }}</strong>
        </div>

        <div class="graficaCompletitudDatos__resumenItem">
          <span>Celdas críticas</span>
          <strong>{{ celdasCriticasTexto }}</strong>
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
    default: 'Completitud de captura',
  },
  descripcionCorta: {
    type: String,
    default: 'Matriz de campos capturados por secretaría',
  },
  descripcionAmplia: {
    type: String,
    default:
      'Permite identificar rápidamente qué dependencias tienen datos completos y cuáles requieren revisión en presupuesto, beneficiarios, fechas, alcaldía, avance u observaciones.',
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
  umbralCritico: {
    type: Number,
    default: 50,
  },
  mostrarControles: {
    type: Boolean,
    default: true,
  },
  mostrarResumen: {
    type: Boolean,
    default: true,
  },
  incluirSinProgramas: {
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
    default: 'No hay datos de completitud',
  },
  mensajeVacio: {
    type: String,
    default:
      'Cuando existan programas capturados, se mostrará la matriz de completitud por secretaría.',
  },
})

const emit = defineEmits(['clickCelda'])

const topSeleccionado = ref(props.top)
const ordenSeleccionado = ref(props.orden)

const camposEvaluados = Object.freeze([
  {
    id: 'presupuesto',
    etiqueta: 'Presupuesto',
    descripcion: 'Presupuesto asignado o ejercido capturado',
    evaluar: (programa) => {
      return (
        tieneNumeroMayorACero(programa.presupuestoAsignado) ||
        tieneNumeroMayorACero(programa.presupuestoEjercido)
      )
    },
  },
  {
    id: 'beneficiarios',
    etiqueta: 'Beneficiarios',
    descripcion: 'Beneficiarios actuales o meta de beneficiarios capturada',
    evaluar: (programa) => {
      return (
        tieneNumeroMayorACero(programa.beneficiariosActuales) ||
        tieneNumeroMayorACero(programa.metaBeneficiarios)
      )
    },
  },
  {
    id: 'fechas',
    etiqueta: 'Fechas',
    descripcion: 'Fecha de inicio y fecha de fin capturadas',
    evaluar: (programa) => {
      return tieneValor(programa.fechaInicio) && tieneValor(programa.fechaFin)
    },
  },
  {
    id: 'alcaldia',
    etiqueta: 'Alcaldía',
    descripcion: 'Alcaldía o cobertura territorial capturada',
    evaluar: (programa) => {
      return tieneValor(programa.alcaldia)
    },
  },
  {
    id: 'avance',
    etiqueta: 'Avance',
    descripcion: 'Porcentaje de avance capturado',
    evaluar: (programa) => {
      return tieneNumero(programa.avance)
    },
  },
  {
    id: 'observaciones',
    etiqueta: 'Observaciones',
    descripcion: 'Observaciones o notas capturadas',
    evaluar: (programa) => {
      return tieneValor(programa.observaciones)
    },
  },
])

const colorNormalizado = computed(() => {
  return validarColor(props.color)
})

const datosSecretarias = computed(() => {
  const datos = props.secretarias
    .filter((secretaria) => secretaria && typeof secretaria === 'object')
    .map(crearRegistroSecretaria)
    .filter((secretaria) => {
      if (props.incluirSinProgramas) {
        return true
      }

      return secretaria.totalProgramas > 0
    })

  return ordenarSecretarias(datos)
})

const datosVisibles = computed(() => {
  if (!topSeleccionado.value || topSeleccionado.value <= 0) {
    return datosSecretarias.value
  }

  return datosSecretarias.value.slice(0, topSeleccionado.value)
})

const sinDatos = computed(() => {
  return !props.cargando && datosSecretarias.value.length === 0
})

const promedioGeneral = computed(() => {
  const valores = datosSecretarias.value.flatMap((secretaria) => {
    return secretaria.campos.map((campo) => campo.porcentaje)
  })

  if (valores.length === 0) {
    return 0
  }

  const total = valores.reduce((acumulado, valor) => acumulado + valor, 0)

  return total / valores.length
})

const promedioGeneralTexto = computed(() => {
  return formatearDecimal(promedioGeneral.value)
})

const resumenCampos = computed(() => {
  return camposEvaluados.map((campo) => {
    const valores = datosSecretarias.value.map((secretaria) => {
      return secretaria.camposPorId[campo.id]?.porcentaje || 0
    })

    const promedio = calcularPromedio(valores)

    return {
      ...campo,
      promedio,
    }
  })
})

const campoMasCompleto = computed(() => {
  return [...resumenCampos.value].sort((a, b) => b.promedio - a.promedio)[0] || null
})

const campoMasPendiente = computed(() => {
  return [...resumenCampos.value].sort((a, b) => a.promedio - b.promedio)[0] || null
})

const campoMasCompletoTexto = computed(() => {
  if (!campoMasCompleto.value) {
    return 'Sin datos'
  }

  return `${campoMasCompleto.value.etiqueta}: ${formatearDecimal(campoMasCompleto.value.promedio)}%`
})

const campoMasPendienteTexto = computed(() => {
  if (!campoMasPendiente.value) {
    return 'Sin datos'
  }

  return `${campoMasPendiente.value.etiqueta}: ${formatearDecimal(campoMasPendiente.value.promedio)}%`
})

const celdasCriticas = computed(() => {
  return datosSecretarias.value.reduce((total, secretaria) => {
    const criticasSecretaria = secretaria.campos.filter((campo) => {
      return campo.porcentaje < props.umbralCritico
    }).length

    return total + criticasSecretaria
  }, 0)
})

const celdasCriticasTexto = computed(() => {
  return formatearEntero(celdasCriticas.value)
})

const alturaGrafica = computed(() => {
  if (props.altura) {
    return normalizarMedida(props.altura)
  }

  const totalFilas = Math.max(datosVisibles.value.length, 4)
  const alturaCalculada = Math.min(Math.max(totalFilas * 34 + 120, 280), 720)

  return `${alturaCalculada}px`
})

const opcionesGrafica = computed(() => {
  const ejeX = camposEvaluados.map((campo) => campo.etiqueta)
  const ejeY = datosVisibles.value.map((secretaria) => secretaria.sigla)

  const data = []

  datosVisibles.value.forEach((secretaria, indiceSecretaria) => {
    camposEvaluados.forEach((campo, indiceCampo) => {
      const valorCampo = secretaria.camposPorId[campo.id]?.porcentaje || 0

      data.push({
        value: [indiceCampo, indiceSecretaria, redondear(valorCampo, 1)],
        secretaria,
        campo,
      })
    })
  })

  return {
    grid: {
      left: 12,
      right: 18,
      top: 34,
      bottom: 70,
      containLabel: true,
    },
    tooltip: {
      trigger: 'item',
      formatter: formatearTooltip,
    },
    xAxis: {
      type: 'category',
      data: ejeX,
      position: 'top',
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
        fontWeight: 750,
        interval: 0,
        rotate: ejeX.length > 5 ? 18 : 0,
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(255,255,255,0.72)', 'rgba(249,250,251,0.8)'],
        },
      },
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: ejeY,
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
        fontWeight: 800,
        width: 92,
        overflow: 'truncate',
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(255,255,255,0.72)', 'rgba(249,250,251,0.8)'],
        },
      },
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: false,
      orient: 'horizontal',
      left: 'center',
      bottom: 12,
      itemWidth: 14,
      itemHeight: 110,
      text: ['Completo', 'Pendiente'],
      textStyle: {
        color: '#6b7280',
        fontSize: 11,
        fontWeight: 650,
      },
      inRange: {
        color: ['#f3f4f6', '#f2d6a6', '#d6bd6f', colorNormalizado.value, '#0d9488'],
      },
    },
    series: [
      {
        name: 'Completitud',
        type: 'heatmap',
        data,
        label: {
          show: true,
          color: '#111827',
          fontSize: 10,
          fontWeight: 850,
          formatter: (params) => {
            return `${formatearDecimal(params.value[2])}%`
          },
        },
        itemStyle: {
          borderColor: '#ffffff',
          borderWidth: 2,
          borderRadius: 6,
        },
        emphasis: {
          itemStyle: {
            borderColor: '#111827',
            borderWidth: 1,
            shadowBlur: 8,
            shadowColor: 'rgba(31, 41, 55, 0.18)',
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

watch(
  () => props.orden,
  (valor) => {
    ordenSeleccionado.value = valor
  },
)

function crearRegistroSecretaria(secretaria) {
  const programas = obtenerProgramas(secretaria)
  const campos = camposEvaluados.map((campo) => {
    return crearRegistroCampo(campo, programas)
  })

  const camposPorId = campos.reduce((acumulado, campo) => {
    acumulado[campo.id] = campo
    return acumulado
  }, {})

  return {
    id: secretaria.id || secretaria.sigla || secretaria.nombre,
    sigla: secretaria.sigla || secretaria.id || 'N/D',
    nombre: secretaria.nombre || 'Secretaría sin nombre',
    totalProgramas: programas.length,
    promedioCompletitud: calcularPromedio(campos.map((campo) => campo.porcentaje)),
    campos,
    camposPorId,
  }
}

function crearRegistroCampo(campo, programas) {
  if (!programas.length) {
    return {
      id: campo.id,
      etiqueta: campo.etiqueta,
      descripcion: campo.descripcion,
      completos: 0,
      total: 0,
      porcentaje: 0,
    }
  }

  const completos = programas.filter((programa) => {
    return campo.evaluar(programa)
  }).length

  return {
    id: campo.id,
    etiqueta: campo.etiqueta,
    descripcion: campo.descripcion,
    completos,
    total: programas.length,
    porcentaje: (completos / programas.length) * 100,
  }
}

function ordenarSecretarias(secretarias) {
  const lista = [...secretarias]

  if (ordenSeleccionado.value === 'alfabetico') {
    return lista.sort((a, b) => {
      return a.sigla.localeCompare(b.sigla, 'es')
    })
  }

  if (ordenSeleccionado.value === 'mayorMenor') {
    return lista.sort((a, b) => {
      return b.promedioCompletitud - a.promedioCompletitud
    })
  }

  return lista.sort((a, b) => {
    return a.promedioCompletitud - b.promedioCompletitud
  })
}

function obtenerProgramas(secretaria) {
  return Array.isArray(secretaria.programas) ? secretaria.programas : []
}

function emitirClickCelda(params) {
  const secretaria = params?.data?.secretaria
  const campo = params?.data?.campo
  const valor = params?.value?.[2]

  if (!secretaria || !campo) {
    return
  }

  emit('clickCelda', {
    secretaria,
    campo,
    porcentaje: valor,
  })
}

function formatearTooltip(params = {}) {
  const secretaria = params?.data?.secretaria
  const campo = params?.data?.campo
  const valor = params?.value?.[2]

  if (!secretaria || !campo) {
    return ''
  }

  const registroCampo = secretaria.camposPorId[campo.id]

  return `
    <div style="min-width:230px;">
      <strong style="display:block;margin-bottom:4px;">${escaparHtml(secretaria.sigla)}</strong>
      <span style="display:block;color:#d1d5db;font-size:11px;line-height:1.35;margin-bottom:8px;">
        ${escaparHtml(secretaria.nombre)}
      </span>

      <div style="display:flex;justify-content:space-between;gap:18px;margin-bottom:5px;">
        <span>${escaparHtml(campo.etiqueta)}</span>
        <strong>${formatearDecimal(valor)}%</strong>
      </div>

      <span style="display:block;color:#d1d5db;font-size:11px;line-height:1.35;margin-bottom:8px;">
        ${escaparHtml(campo.descripcion)}
      </span>

      <div style="border-top:1px solid rgba(255,255,255,.16);padding-top:6px;display:flex;justify-content:space-between;gap:18px;">
        <span>Capturados</span>
        <strong>${formatearEntero(registroCampo.completos)} de ${formatearEntero(registroCampo.total)}</strong>
      </div>
    </div>
  `
}

function tieneValor(valor) {
  if (valor === null || valor === undefined) {
    return false
  }

  if (typeof valor === 'number') {
    return Number.isFinite(valor)
  }

  const texto = String(valor).trim().toUpperCase()

  return texto !== '' && texto !== 'NA' && texto !== 'NULL'
}

function tieneNumero(valor) {
  return normalizarNumero(valor) !== null
}

function tieneNumeroMayorACero(valor) {
  const numero = normalizarNumero(valor)
  return numero !== null && numero > 0
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

function calcularPromedio(valores) {
  const validos = valores.filter((valor) => {
    return Number.isFinite(Number(valor))
  })

  if (!validos.length) {
    return 0
  }

  const total = validos.reduce((acumulado, valor) => {
    return acumulado + Number(valor)
  }, 0)

  return total / validos.length
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

function redondear(valor, decimales = 1) {
  const factor = 10 ** decimales
  return Math.round(Number(valor || 0) * factor) / factor
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
.graficaCompletitudDatos__controles {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.graficaCompletitudDatos__campo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 850;
}

.graficaCompletitudDatos__campo span {
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.graficaCompletitudDatos__select {
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

.graficaCompletitudDatos__select:focus {
  border-color: rgba(159, 34, 65, 0.42);
  box-shadow: 0 0 0 4px rgba(159, 34, 65, 0.08);
}

.graficaCompletitudDatos__resumen {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
  max-width: 760px;
}

.graficaCompletitudDatos__resumenItem {
  border: 1px solid rgba(159, 34, 65, 0.08);
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.68);
  padding: 0.65rem 0.75rem;
}

.graficaCompletitudDatos__resumenItem span {
  display: block;
  color: #9ca3af;
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.graficaCompletitudDatos__resumenItem strong {
  display: block;
  margin-top: 0.18rem;
  color: #374151;
  font-size: 0.82rem;
  font-weight: 900;
  line-height: 1.25;
}

@media (max-width: 820px) {
  .graficaCompletitudDatos__resumen {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .graficaCompletitudDatos__controles,
  .graficaCompletitudDatos__campo {
    width: 100%;
  }

  .graficaCompletitudDatos__campo {
    justify-content: space-between;
  }

  .graficaCompletitudDatos__select {
    flex: 1;
  }
}
</style>
