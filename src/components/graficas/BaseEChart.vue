<!-- src/components/graficas/BaseEChart.vue -->

<template>
  <div
    class="baseEChart"
    :class="clasesGrafica"
    :style="estilosGrafica"
    role="img"
    :aria-label="ariaLabelFinal"
  >
    <div ref="contenedorGrafica" class="baseEChart__contenedor"></div>

    <p class="baseEChart__accesible" aria-live="polite">
      {{ textoEstadoAccesible }}
    </p>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'

import * as echarts from 'echarts'

const props = defineProps({
  opciones: {
    type: Object,
    default: () => ({}),
  },
  option: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  tema: {
    type: [String, Object],
    default: null,
  },
  renderer: {
    type: String,
    default: 'canvas',
    validator: (valor) => {
      return ['canvas', 'svg'].includes(valor)
    },
  },
  altura: {
    type: [String, Number],
    default: '260px',
  },
  ancho: {
    type: [String, Number],
    default: '100%',
  },
  autoresize: {
    type: Boolean,
    default: true,
  },
  usarTemaBase: {
    type: Boolean,
    default: true,
  },
  usarTooltipBase: {
    type: Boolean,
    default: true,
  },
  accesible: {
    type: Boolean,
    default: true,
  },
  descripcionAccesible: {
    type: String,
    default: '',
  },
  ariaLabel: {
    type: String,
    default: '',
  },
  notMerge: {
    type: Boolean,
    default: false,
  },
  lazyUpdate: {
    type: Boolean,
    default: true,
  },
  silent: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: '#9b8d4b',
  },
})

const emit = defineEmits([
  'ready',
  'click',
  'mouseover',
  'mouseout',
  'finished',
  'datazoom',
  'legendselectchanged',
  'error',
])

const contenedorGrafica = shallowRef(null)
const instanciaGrafica = shallowRef(null)

let observadorResize = null
let resizeFrame = null

const opcionesEntrada = computed(() => {
  return props.option || props.opciones || {}
})

const colorBase = computed(() => {
  return validarColor(props.color)
})

const opcionesFinales = computed(() => {
  const opcionesBase = props.usarTemaBase ? crearOpcionesBase() : {}

  const opcionesCombinadas = combinarOpciones(opcionesBase, opcionesEntrada.value)

  const opcionesConEjes = aplicarEstiloBaseEjes(opcionesCombinadas)
  const opcionesConTooltip = aplicarTooltipBase(opcionesConEjes)
  const opcionesConAccesibilidad = aplicarAccesibilidad(opcionesConTooltip)

  return opcionesConAccesibilidad
})

const estilosGrafica = computed(() => {
  return {
    '--base-echart-width': normalizarMedida(props.ancho),
    '--base-echart-height': normalizarMedida(props.altura),
    '--base-echart-color': colorBase.value,
  }
})

const clasesGrafica = computed(() => {
  return {
    'baseEChart--loading': props.loading,
  }
})

const ariaLabelFinal = computed(() => {
  return props.ariaLabel || props.descripcionAccesible || 'Gráfica estadística'
})

const textoEstadoAccesible = computed(() => {
  return props.loading ? 'Cargando gráfica.' : 'Gráfica cargada.'
})

onMounted(async () => {
  await nextTick()
  iniciarGrafica()
})

onBeforeUnmount(() => {
  destruirGrafica()
})

watch(
  opcionesFinales,
  () => {
    aplicarOpciones()
  },
  {
    deep: true,
  },
)

watch(
  () => props.loading,
  () => {
    actualizarLoading()
  },
)

watch(
  () => [props.tema, props.renderer],
  async () => {
    await reiniciarGrafica()
  },
)

function iniciarGrafica() {
  if (!contenedorGrafica.value) {
    return
  }

  destruirGrafica()

  try {
    instanciaGrafica.value = echarts.init(contenedorGrafica.value, props.tema, {
      renderer: props.renderer,
    })

    registrarEventos()
    aplicarOpciones()
    actualizarLoading()
    iniciarResize()

    emit('ready', instanciaGrafica.value)
  } catch (error) {
    console.error('No fue posible iniciar ECharts:', error)
    emit('error', error)
  }
}

async function reiniciarGrafica() {
  await nextTick()
  iniciarGrafica()
}

function aplicarOpciones() {
  if (!instanciaGrafica.value) {
    return
  }

  try {
    instanciaGrafica.value.setOption(opcionesFinales.value, {
      notMerge: props.notMerge,
      lazyUpdate: props.lazyUpdate,
      silent: props.silent,
    })

    redimensionarGrafica()
  } catch (error) {
    console.error('No fue posible aplicar opciones de ECharts:', error)
    emit('error', error)
  }
}

function actualizarLoading() {
  if (!instanciaGrafica.value) {
    return
  }

  if (props.loading) {
    instanciaGrafica.value.showLoading('default', {
      text: 'Cargando...',
      color: colorBase.value,
      textColor: '#6b7280',
      maskColor: 'rgba(255, 255, 255, 0.72)',
      zlevel: 1,
    })

    return
  }

  instanciaGrafica.value.hideLoading()
}

function registrarEventos() {
  if (!instanciaGrafica.value) {
    return
  }

  instanciaGrafica.value.on('click', (params) => {
    emit('click', params)
  })

  instanciaGrafica.value.on('mouseover', (params) => {
    emit('mouseover', params)
  })

  instanciaGrafica.value.on('mouseout', (params) => {
    emit('mouseout', params)
  })

  instanciaGrafica.value.on('finished', () => {
    emit('finished')
  })

  instanciaGrafica.value.on('datazoom', (params) => {
    emit('datazoom', params)
  })

  instanciaGrafica.value.on('legendselectchanged', (params) => {
    emit('legendselectchanged', params)
  })
}

function iniciarResize() {
  if (!props.autoresize) {
    return
  }

  if ('ResizeObserver' in window && contenedorGrafica.value) {
    observadorResize = new ResizeObserver(() => {
      redimensionarGrafica()
    })

    observadorResize.observe(contenedorGrafica.value)
    return
  }

  window.addEventListener('resize', redimensionarGrafica)
}

function redimensionarGrafica() {
  if (!instanciaGrafica.value) {
    return
  }

  if (resizeFrame) {
    cancelAnimationFrame(resizeFrame)
  }

  resizeFrame = requestAnimationFrame(() => {
    instanciaGrafica.value?.resize()
  })
}

function destruirGrafica() {
  if (observadorResize) {
    observadorResize.disconnect()
    observadorResize = null
  }

  window.removeEventListener('resize', redimensionarGrafica)

  if (resizeFrame) {
    cancelAnimationFrame(resizeFrame)
    resizeFrame = null
  }

  if (instanciaGrafica.value) {
    instanciaGrafica.value.dispose()
    instanciaGrafica.value = null
  }
}

function crearOpcionesBase() {
  return {
    backgroundColor: 'transparent',
    color: [colorBase.value, '#d6bd6f', '#0d9488', '#2563eb', '#e3872f', '#9f3a6d'],
    textStyle: {
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      color: '#374151',
    },
    grid: {
      left: 36,
      right: 18,
      top: 26,
      bottom: 34,
      containLabel: true,
    },
    legend: {
      type: 'scroll',
      top: 0,
      right: 0,
      icon: 'roundRect',
      itemWidth: 16,
      itemHeight: 8,
      textStyle: {
        color: '#6b7280',
        fontSize: 11,
        fontWeight: 600,
      },
    },
  }
}

function aplicarTooltipBase(opciones) {
  if (!props.usarTooltipBase) {
    return opciones
  }

  if (opciones.tooltip) {
    return opciones
  }

  return combinarOpciones(opciones, {
    tooltip: {
      trigger: 'axis',
      confine: true,
      backgroundColor: 'rgba(17, 24, 39, 0.94)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      borderWidth: 1,
      padding: [8, 10],
      textStyle: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 600,
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: 'rgba(107, 114, 128, 0.48)',
          type: 'dashed',
        },
      },
    },
  })
}

function aplicarAccesibilidad(opciones) {
  if (!props.accesible) {
    return opciones
  }

  return combinarOpciones(opciones, {
    aria: {
      enabled: true,
      decal: {
        show: true,
      },
      description: ariaLabelFinal.value,
    },
  })
}

function aplicarEstiloBaseEjes(opciones) {
  let opcionesConEjes = opciones

  if (opciones.xAxis) {
    opcionesConEjes = {
      ...opcionesConEjes,
      xAxis: aplicarEstiloEje(opciones.xAxis, 'x'),
    }
  }

  if (opciones.yAxis) {
    opcionesConEjes = {
      ...opcionesConEjes,
      yAxis: aplicarEstiloEje(opciones.yAxis, 'y'),
    }
  }

  return opcionesConEjes
}

function aplicarEstiloEje(eje, tipo) {
  if (Array.isArray(eje)) {
    return eje.map((item) => aplicarEstiloEjeObjeto(item, tipo))
  }

  return aplicarEstiloEjeObjeto(eje, tipo)
}

function aplicarEstiloEjeObjeto(eje = {}, tipo = 'x') {
  const estiloBase = {
    axisLine: {
      lineStyle: {
        color: '#d1d5db',
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: '#8b909b',
      fontSize: 11,
      fontWeight: 500,
    },
    splitLine: {
      show: tipo === 'y',
      lineStyle: {
        color: 'rgba(156, 163, 175, 0.28)',
        type: 'dashed',
      },
    },
  }

  return combinarOpciones(estiloBase, eje)
}

function combinarOpciones(base, extra) {
  if (extra === null || extra === undefined) {
    return base
  }

  if (Array.isArray(base) || Array.isArray(extra)) {
    return extra
  }

  if (!esObjetoPlano(base) || !esObjetoPlano(extra)) {
    return extra
  }

  const resultado = { ...base }

  Object.keys(extra).forEach((llave) => {
    resultado[llave] = combinarOpciones(base[llave], extra[llave])
  })

  return resultado
}

function esObjetoPlano(valor) {
  return Boolean(
    valor && typeof valor === 'object' && !Array.isArray(valor) && !(valor instanceof Date),
  )
}

function normalizarMedida(valor) {
  if (typeof valor === 'number') {
    return `${valor}px`
  }

  return String(valor || '100%')
}

function validarColor(valor) {
  if (/^#[0-9a-fA-F]{6}$/.test(valor || '')) {
    return valor
  }

  return '#9b8d4b'
}

function obtenerInstancia() {
  return instanciaGrafica.value
}

function resize() {
  redimensionarGrafica()
}

function setOption(opciones, configuracion = {}) {
  if (!instanciaGrafica.value) {
    return
  }

  instanciaGrafica.value.setOption(opciones, configuracion)
}

defineExpose({
  obtenerInstancia,
  resize,
  setOption,
})
</script>

<style scoped>
.baseEChart {
  position: relative;
  width: var(--base-echart-width);
  height: var(--base-echart-height);
  min-height: 180px;
}

.baseEChart__contenedor {
  width: 100%;
  height: 100%;
  min-height: inherit;
}

.baseEChart__accesible {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.baseEChart--loading {
  cursor: progress;
}

@media (max-width: 640px) {
  .baseEChart {
    min-height: 220px;
  }
}
</style>
