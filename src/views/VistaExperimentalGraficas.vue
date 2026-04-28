<template>
  <main class="vistaExperimentalGraficas">
    <section class="vistaExperimentalGraficas__contenedor">
      <header class="vistaExperimentalGraficas__encabezado">
        <span class="vistaExperimentalGraficas__eyebrow">Propuesta temporal</span>
        <h1>Visualizaciones experimentales</h1>
        <p>
          Muestra temporal de gráficas con datos dummy para exponer propuestas visuales del tablero.
        </p>
      </header>

      <section class="graficaDestacada">
        <article class="graficaDestacada__tarjeta">
          <div class="graficaDestacada__contenido">
            <div class="graficaDestacada__texto">
              <div class="graficaDestacada__tituloFila">
                <span class="graficaDestacada__icono" :style="{ color: '#9a8845' }"> ▣ </span>

                <div>
                  <div class="graficaDestacada__valor">78.4%</div>
                  <h2>Avance promedio de programas</h2>
                  <p>Porcentaje de avance físico promedio reportado por las secretarías</p>
                </div>
              </div>

              <p class="graficaDestacada__descripcion">
                De acuerdo con la integración dummy del tablero, el avance promedio acumulado se
                ubica en 78.4%. La serie muestra una trayectoria al alza durante los últimos meses,
                con una mejora visible frente al referente general.
              </p>
            </div>

            <div class="graficaDestacada__chart">
              <BaseEChart :opciones="opcionLineaDestacada" altura="270px" />
            </div>
          </div>

          <footer class="graficaDestacada__footer">
            <div>
              <span class="graficaDestacada__referencia"></span>
              Referente general
            </div>
            <div>
              Fuente: Datos dummy del tablero
              <br />
              Fecha de corte: 30 de abril de 2026
            </div>
          </footer>
        </article>
      </section>

      <section class="rejillaGraficas">
        <article class="tarjetaIndicador tarjetaIndicador--azul">
          <header class="tarjetaIndicador__header">
            <div class="tarjetaIndicador__tituloBloque">
              <span class="tarjetaIndicador__icono">▣</span>
              <div>
                <div class="tarjetaIndicador__valor">101</div>
                <h3>Programas por secretaría</h3>
                <p>Cantidad de programas registrados</p>
              </div>
            </div>
          </header>

          <BaseEChart :opciones="opcionProgramasPorSecretaria" altura="280px" />

          <footer class="tarjetaIndicador__footer">Fuente: Datos dummy del tablero</footer>
        </article>

        <article class="tarjetaIndicador tarjetaIndicador--morado">
          <header class="tarjetaIndicador__header">
            <div class="tarjetaIndicador__tituloBloque">
              <span class="tarjetaIndicador__icono">▣</span>
              <div>
                <div class="tarjetaIndicador__valor">5</div>
                <h3>Tipos de programa</h3>
                <p>Distribución por secretaría y clasificación</p>
              </div>
            </div>
          </header>

          <BaseEChart :opciones="opcionTiposPrograma" altura="280px" />

          <footer class="tarjetaIndicador__footer">Fuente: Datos dummy del tablero</footer>
        </article>

        <article class="tarjetaIndicador tarjetaIndicador--dorado">
          <header class="tarjetaIndicador__header">
            <div class="tarjetaIndicador__tituloBloque">
              <span class="tarjetaIndicador__icono">▣</span>
              <div>
                <div class="tarjetaIndicador__valor">84%</div>
                <h3>Completitud de captura</h3>
                <p>Matriz por secretaría y campo reportado</p>
              </div>
            </div>
          </header>

          <BaseEChart :opciones="opcionCompletitud" altura="300px" />

          <footer class="tarjetaIndicador__footer">Fuente: Datos dummy del tablero</footer>
        </article>

        <article class="tarjetaIndicador tarjetaIndicador--verde">
          <header class="tarjetaIndicador__header">
            <div class="tarjetaIndicador__tituloBloque">
              <span class="tarjetaIndicador__icono">▣</span>
              <div>
                <div class="tarjetaIndicador__valor">$4.8B</div>
                <h3>Presupuesto comparado</h3>
                <p>Asignado, ejercido y porcentaje ejercido</p>
              </div>
            </div>
          </header>

          <BaseEChart :opciones="opcionPresupuesto" altura="290px" />

          <footer class="tarjetaIndicador__footer">Fuente: Datos dummy del tablero</footer>
        </article>

        <article class="tarjetaIndicador tarjetaIndicador--guinda">
          <header class="tarjetaIndicador__header">
            <div class="tarjetaIndicador__tituloBloque">
              <span class="tarjetaIndicador__icono">▣</span>
              <div>
                <div class="tarjetaIndicador__valor">82%</div>
                <h3>Avance programático</h3>
                <p>Vista tipo bullet por secretaría</p>
              </div>
            </div>
          </header>

          <BaseEChart :opciones="opcionAvanceBullet" altura="300px" />

          <footer class="tarjetaIndicador__footer">Fuente: Datos dummy del tablero</footer>
        </article>

        <article class="tarjetaIndicador tarjetaIndicador--turquesa tarjetaIndicador--ancha">
          <header class="tarjetaIndicador__header">
            <div class="tarjetaIndicador__tituloBloque">
              <span class="tarjetaIndicador__icono">▣</span>
              <div>
                <div class="tarjetaIndicador__valor">Top 8</div>
                <h3>Bar race de programas</h3>
                <p>Evolución mensual de programas con mayor avance</p>
              </div>
            </div>
          </header>

          <BaseEChart :opciones="opcionBarRace" altura="460px" />

          <footer class="tarjetaIndicador__footer">
            Fuente: Datos dummy del tablero · Animación demostrativa
          </footer>
        </article>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import BaseEChart from '../components/graficas/BaseEChart.vue'

const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const serieAvancePrincipal = [61, 63, 65, 66, 68, 69, 70, 72, 74, 76, 77, 78.4]
const serieAvanceReferencia = [58, 59, 60, 61, 61, 62, 63, 64, 65, 66, 67, 68]

const datosProgramasSecretaria = [
  { nombre: 'ADIP', valor: 19 },
  { nombre: 'SSC', valor: 13 },
  { nombre: 'SEBIEN', valor: 12 },
  { nombre: 'SEMUJERES', valor: 11 },
  { nombre: 'SOBSE', valor: 9 },
  { nombre: 'SEDECO', valor: 8 },
  { nombre: 'SEMOVI', valor: 7 },
  { nombre: 'SEDEMA', valor: 6 },
  { nombre: 'CULTURA', valor: 6 },
  { nombre: 'SEDUVI', valor: 5 },
  { nombre: 'SAF', valor: 2 },
  { nombre: 'SECGOB', valor: 3 },
]

const datosTiposPrograma = [
  { secretaria: 'SEBIEN', social: 5, accion: 2, proyecto: 1, servicio: 3, general: 1 },
  { secretaria: 'SSC', social: 0, accion: 2, proyecto: 4, servicio: 5, general: 2 },
  { secretaria: 'SEMUJERES', social: 4, accion: 1, proyecto: 1, servicio: 5, general: 0 },
  { secretaria: 'ADIP', social: 0, accion: 1, proyecto: 7, servicio: 6, general: 5 },
  { secretaria: 'SOBSE', social: 0, accion: 1, proyecto: 6, servicio: 0, general: 2 },
  { secretaria: 'SEMOVI', social: 0, accion: 1, proyecto: 4, servicio: 1, general: 1 },
]

const metricasCompletitud = [
  'Presupuesto',
  'Beneficiarios',
  'Fechas',
  'Alcaldía',
  'Avance',
  'Observaciones',
]
const datosCompletitud = [
  ['SEBIEN', [94, 88, 90, 74, 85, 68]],
  ['SSC', [92, 48, 86, 65, 91, 62]],
  ['SEMUJERES', [86, 92, 83, 58, 88, 64]],
  ['ADIP', [72, 35, 79, 41, 73, 54]],
  ['SOBSE', [96, 20, 94, 89, 82, 78]],
  ['SEMOVI', [84, 18, 91, 95, 77, 56]],
  ['SAF', [90, 0, 65, 14, 58, 33]],
]

const datosPresupuesto = [
  { nombre: 'SEBIEN', asignado: 1200, ejercido: 840 },
  { nombre: 'SSC', asignado: 980, ejercido: 742 },
  { nombre: 'SOBSE', asignado: 1500, ejercido: 1105 },
  { nombre: 'SEMOVI', asignado: 900, ejercido: 576 },
  { nombre: 'SEDECO', asignado: 310, ejercido: 224 },
]

const datosBullet = [
  { nombre: 'SEBIEN', actual: 82, meta: 95 },
  { nombre: 'SSC', actual: 76, meta: 90 },
  { nombre: 'SOBSE', actual: 68, meta: 88 },
  { nombre: 'SEMOVI', actual: 61, meta: 85 },
  { nombre: 'SEMUJERES', actual: 79, meta: 92 },
]

const barRaceSeries = [
  {
    fecha: 'ene 2026',
    valores: [
      ['Mujeres Libres y Seguras', 12],
      ['Conectividad Pública', 10],
      ['Ingreso Ciudadano', 9],
      ['Cablebús Línea 4', 8],
      ['Escuela Segura', 7],
      ['Cosecha de Lluvia', 6],
      ['Barrios Vivos', 5],
      ['Mi Beca', 4],
    ],
  },
  {
    fecha: 'feb 2026',
    valores: [
      ['Mujeres Libres y Seguras', 16],
      ['Conectividad Pública', 13],
      ['Ingreso Ciudadano', 12],
      ['Cablebús Línea 4', 10],
      ['Escuela Segura', 9],
      ['Cosecha de Lluvia', 8],
      ['Barrios Vivos', 6],
      ['Mi Beca', 5],
    ],
  },
  {
    fecha: 'mar 2026',
    valores: [
      ['Mujeres Libres y Seguras', 20],
      ['Conectividad Pública', 21],
      ['Ingreso Ciudadano', 15],
      ['Cablebús Línea 4', 13],
      ['Escuela Segura', 12],
      ['Cosecha de Lluvia', 10],
      ['Barrios Vivos', 8],
      ['Mi Beca', 7],
    ],
  },
  {
    fecha: 'abr 2026',
    valores: [
      ['Mujeres Libres y Seguras', 24],
      ['Conectividad Pública', 27],
      ['Ingreso Ciudadano', 19],
      ['Cablebús Línea 4', 16],
      ['Escuela Segura', 15],
      ['Cosecha de Lluvia', 15],
      ['Barrios Vivos', 10],
      ['Mi Beca', 9],
    ],
  },
  {
    fecha: 'may 2026',
    valores: [
      ['Mujeres Libres y Seguras', 29],
      ['Conectividad Pública', 32],
      ['Ingreso Ciudadano', 23],
      ['Cablebús Línea 4', 19],
      ['Escuela Segura', 18],
      ['Cosecha de Lluvia', 21],
      ['Barrios Vivos', 13],
      ['Mi Beca', 11],
    ],
  },
  {
    fecha: 'jun 2026',
    valores: [
      ['Mujeres Libres y Seguras', 35],
      ['Conectividad Pública', 31],
      ['Ingreso Ciudadano', 27],
      ['Cablebús Línea 4', 24],
      ['Escuela Segura', 22],
      ['Cosecha de Lluvia', 20],
      ['Barrios Vivos', 17],
      ['Mi Beca', 36],
    ],
  },
]

const opcionLineaDestacada = computed(() => {
  return {
    animationDuration: 800,
    grid: {
      top: 18,
      right: 18,
      bottom: 26,
      left: 38,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#d9dee8',
      borderWidth: 1,
      textStyle: {
        color: '#243046',
      },
    },
    legend: {
      show: false,
    },
    xAxis: {
      type: 'category',
      data: meses,
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#d8dce3',
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#7d8797',
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: '#d7dbe2',
        },
      },
    },
    yAxis: {
      type: 'value',
      min: 50,
      max: 85,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#7d8797',
        formatter: '{value}%',
      },
      splitLine: {
        show: false,
      },
    },
    series: [
      {
        name: 'Referente general',
        type: 'line',
        data: serieAvanceReferencia,
        symbol: 'none',
        smooth: true,
        lineStyle: {
          width: 2,
          color: '#c8b66e',
        },
      },
      {
        name: 'Avance promedio',
        type: 'line',
        data: serieAvancePrincipal,
        smooth: true,
        symbolSize: 9,
        itemStyle: {
          color: '#007a8a',
          borderColor: '#007a8a',
        },
        lineStyle: {
          width: 4,
          color: '#9a8845',
        },
        areaStyle: {
          color: 'rgba(154, 136, 69, 0.08)',
        },
      },
    ],
  }
})

const opcionProgramasPorSecretaria = computed(() => {
  const ordenados = [...datosProgramasSecretaria].sort((a, b) => a.valor - b.valor)

  return {
    grid: {
      top: 10,
      right: 18,
      bottom: 12,
      left: 70,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#7d8797' },
      splitLine: {
        lineStyle: {
          color: '#eceff3',
        },
      },
    },
    yAxis: {
      type: 'category',
      data: ordenados.map((item) => item.nombre),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#485466', fontWeight: 600 },
    },
    series: [
      {
        type: 'bar',
        data: ordenados.map((item) => item.valor),
        barWidth: 14,
        itemStyle: {
          color: '#2e5fad',
          borderRadius: [0, 8, 8, 0],
        },
        label: {
          show: true,
          position: 'right',
          color: '#243046',
          fontWeight: 700,
        },
      },
    ],
  }
})

const opcionTiposPrograma = computed(() => {
  return {
    grid: {
      top: 20,
      right: 14,
      bottom: 30,
      left: 42,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: {
      top: 0,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: '#617083',
        fontSize: 11,
      },
    },
    xAxis: {
      type: 'category',
      data: datosTiposPrograma.map((item) => item.secretaria),
      axisLine: {
        lineStyle: { color: '#d8dce3' },
      },
      axisLabel: {
        color: '#6a7485',
        rotate: 0,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#7d8797' },
      splitLine: {
        lineStyle: {
          color: '#eceff3',
        },
      },
    },
    series: [
      {
        name: 'Social',
        type: 'bar',
        stack: 'total',
        data: datosTiposPrograma.map((item) => item.social),
        itemStyle: { color: '#1ca56b' },
      },
      {
        name: 'Acción',
        type: 'bar',
        stack: 'total',
        data: datosTiposPrograma.map((item) => item.accion),
        itemStyle: { color: '#7b4ddb' },
      },
      {
        name: 'Proyecto',
        type: 'bar',
        stack: 'total',
        data: datosTiposPrograma.map((item) => item.proyecto),
        itemStyle: { color: '#d08a21' },
      },
      {
        name: 'Servicio',
        type: 'bar',
        stack: 'total',
        data: datosTiposPrograma.map((item) => item.servicio),
        itemStyle: { color: '#b02b57' },
      },
      {
        name: 'General',
        type: 'bar',
        stack: 'total',
        data: datosTiposPrograma.map((item) => item.general),
        itemStyle: { color: '#18a6b8' },
      },
    ],
  }
})

const opcionCompletitud = computed(() => {
  const datos = []

  datosCompletitud.forEach(([secretaria, valores], fila) => {
    valores.forEach((valor, columna) => {
      datos.push([columna, fila, valor])
    })
  })

  return {
    grid: {
      top: 40,
      right: 18,
      bottom: 26,
      left: 90,
    },
    tooltip: {
      position: 'top',
      formatter(params) {
        return `
          <strong>${datosCompletitud[params.data[1]][0]}</strong><br/>
          ${metricasCompletitud[params.data[0]]}: ${params.data[2]}%
        `
      },
    },
    xAxis: {
      type: 'category',
      data: metricasCompletitud,
      splitArea: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#667386',
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'category',
      data: datosCompletitud.map((item) => item[0]),
      splitArea: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#465365',
        fontWeight: 600,
      },
    },
    visualMap: {
      min: 0,
      max: 100,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: {
        color: ['#f4f5f7', '#ecd9bf', '#bc955c', '#8a6c3a'],
      },
      textStyle: {
        color: '#617083',
      },
    },
    series: [
      {
        name: 'Completitud',
        type: 'heatmap',
        data: datos,
        label: {
          show: true,
          color: '#243046',
          fontWeight: 700,
          formatter(params) {
            return `${params.data[2]}%`
          },
        },
        itemStyle: {
          borderColor: '#ffffff',
          borderWidth: 2,
          borderRadius: 10,
        },
      },
    ],
  }
})

const opcionPresupuesto = computed(() => {
  return {
    grid: {
      top: 26,
      right: 44,
      bottom: 26,
      left: 54,
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      top: 0,
      textStyle: {
        color: '#617083',
      },
    },
    xAxis: {
      type: 'category',
      data: datosPresupuesto.map((item) => item.nombre),
      axisLine: {
        lineStyle: { color: '#d8dce3' },
      },
      axisLabel: {
        color: '#6b7484',
      },
    },
    yAxis: [
      {
        type: 'value',
        name: 'MDP',
        axisLabel: {
          color: '#7d8797',
          formatter: '{value}',
        },
        splitLine: {
          lineStyle: { color: '#eceff3' },
        },
      },
      {
        type: 'value',
        name: '%',
        min: 0,
        max: 100,
        axisLabel: {
          color: '#7d8797',
          formatter: '{value}%',
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: 'Asignado',
        type: 'bar',
        data: datosPresupuesto.map((item) => item.asignado),
        itemStyle: {
          color: '#bc955c',
          borderRadius: [8, 8, 0, 0],
        },
      },
      {
        name: 'Ejercido',
        type: 'bar',
        data: datosPresupuesto.map((item) => item.ejercido),
        itemStyle: {
          color: '#0f9d72',
          borderRadius: [8, 8, 0, 0],
        },
      },
      {
        name: '% ejercido',
        type: 'line',
        yAxisIndex: 1,
        data: datosPresupuesto.map((item) => {
          return Number(((item.ejercido / item.asignado) * 100).toFixed(1))
        }),
        smooth: true,
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#1f4fa3',
        },
        itemStyle: {
          color: '#1f4fa3',
        },
      },
    ],
  }
})

const opcionAvanceBullet = computed(() => {
  return {
    grid: {
      top: 12,
      right: 24,
      bottom: 20,
      left: 88,
    },
    tooltip: {
      trigger: 'item',
      formatter(params) {
        if (params.seriesType === 'scatter') {
          return `${params.name}<br/>Meta: ${params.value[0]}%`
        }

        const indice = params.dataIndex
        return `${datosBullet[indice].nombre}<br/>Avance: ${datosBullet[indice].actual}%`
      },
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        color: '#7d8797',
        formatter: '{value}%',
      },
      splitLine: {
        lineStyle: {
          color: '#eceff3',
        },
      },
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: datosBullet.map((item) => item.nombre),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#485466',
        fontWeight: 600,
      },
    },
    series: [
      {
        type: 'bar',
        data: datosBullet.map(() => 100),
        barWidth: 16,
        silent: true,
        itemStyle: {
          color: '#edf1f5',
          borderRadius: 10,
        },
        z: 1,
      },
      {
        type: 'bar',
        data: datosBullet.map((item) => item.actual),
        barWidth: 16,
        itemStyle: {
          color: '#9f2241',
          borderRadius: 10,
        },
        label: {
          show: true,
          position: 'right',
          color: '#243046',
          fontWeight: 700,
          formatter: '{c}%',
        },
        z: 2,
      },
      {
        name: 'Meta',
        type: 'scatter',
        symbol: 'diamond',
        symbolSize: 16,
        data: datosBullet.map((item, indice) => [item.meta, indice]),
        itemStyle: {
          color: '#bc955c',
        },
        z: 3,
      },
    ],
  }
})

const opcionBarRace = computed(() => {
  return {
    baseOption: {
      timeline: {
        axisType: 'category',
        autoPlay: true,
        playInterval: 1800,
        bottom: 0,
        left: 40,
        right: 40,
        label: {
          color: '#5f6d81',
        },
        lineStyle: {
          color: '#cfd6df',
        },
        checkpointStyle: {
          color: '#9f2241',
          borderColor: '#ffffff',
        },
        controlStyle: {
          color: '#7a8698',
          borderColor: '#cfd6df',
        },
        data: barRaceSeries.map((item) => item.fecha),
      },
      grid: {
        top: 20,
        right: 40,
        bottom: 74,
        left: 200,
      },
      xAxis: {
        type: 'value',
        max: 40,
        axisLabel: {
          color: '#6f7b8a',
        },
        splitLine: {
          lineStyle: {
            color: '#eceff3',
          },
        },
      },
      yAxis: {
        type: 'category',
        inverse: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#334155',
          fontWeight: 600,
          fontSize: 12,
        },
        animationDuration: 300,
        animationDurationUpdate: 300,
      },
      series: [
        {
          realtimeSort: true,
          type: 'bar',
          barBorderRadius: [0, 10, 10, 0],
          label: {
            show: true,
            position: 'right',
            color: '#243046',
            fontWeight: 700,
            valueAnimation: true,
          },
          itemStyle: {
            color(params) {
              const paleta = [
                '#9f2241',
                '#bc955c',
                '#1f4fa3',
                '#0f9d72',
                '#a855f7',
                '#f59e0b',
                '#059669',
                '#0891b2',
              ]
              return paleta[params.dataIndex % paleta.length]
            },
          },
        },
      ],
      animationDuration: 600,
      animationDurationUpdate: 600,
    },
    options: barRaceSeries.map((item) => {
      const ordenados = [...item.valores].sort((a, b) => a[1] - b[1])

      return {
        title: {
          text: item.fecha,
          right: 30,
          top: 12,
          textStyle: {
            color: '#94a3b8',
            fontWeight: 800,
            fontSize: 24,
          },
        },
        yAxis: {
          data: ordenados.map((fila) => fila[0]),
        },
        series: [
          {
            data: ordenados.map((fila) => fila[1]),
          },
        ],
      }
    }),
  }
})
</script>

<style scoped>
.vistaExperimentalGraficas {
  min-height: 100vh;
  background: #f2f4f7;
  padding: 2rem 1.2rem 3rem;
}

.vistaExperimentalGraficas__contenedor {
  width: min(1440px, 100%);
  margin: 0 auto;
}

.vistaExperimentalGraficas__encabezado {
  margin-bottom: 1.5rem;
}

.vistaExperimentalGraficas__eyebrow {
  display: inline-flex;
  margin-bottom: 0.75rem;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  background: rgba(159, 34, 65, 0.1);
  color: #9f2241;
  font-size: 0.82rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.vistaExperimentalGraficas__encabezado h1 {
  margin: 0 0 0.35rem;
  color: #1f2937;
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 800;
}

.vistaExperimentalGraficas__encabezado p {
  margin: 0;
  color: #667085;
  font-size: 1rem;
}

.graficaDestacada {
  margin-bottom: 1rem;
}

.graficaDestacada__tarjeta {
  background: #ffffff;
  border-radius: 1.35rem;
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.08);
  border: 1px solid #e7eaf0;
  overflow: hidden;
}

.graficaDestacada__contenido {
  display: grid;
  grid-template-columns: 1.15fr 0.95fr;
  gap: 1.5rem;
  padding: 1.8rem 1.9rem 1rem;
}

.graficaDestacada__tituloFila {
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
}

.graficaDestacada__icono {
  display: inline-flex;
  width: 2rem;
  min-width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  line-height: 1;
}

.graficaDestacada__valor {
  color: #9a8845;
  font-size: clamp(2.4rem, 4vw, 3.2rem);
  font-weight: 800;
  line-height: 1;
}

.graficaDestacada__texto h2 {
  margin: 0;
  color: #9a8845;
  font-size: 1.25rem;
  font-weight: 800;
}

.graficaDestacada__texto p {
  margin: 0;
  color: #8a7d4a;
}

.graficaDestacada__descripcion {
  margin-top: 1rem !important;
  color: #9a8845 !important;
  font-size: 1rem;
  line-height: 1.45;
  max-width: 44rem;
}

.graficaDestacada__chart {
  min-height: 270px;
}

.graficaDestacada__footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 1.9rem 1.3rem;
  color: #8b97a7;
  font-size: 0.95rem;
}

.graficaDestacada__referencia {
  display: inline-block;
  width: 16px;
  height: 2px;
  margin-right: 0.45rem;
  vertical-align: middle;
  background: #c8b66e;
}

.rejillaGraficas {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.tarjetaIndicador {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #e7eaf0;
  border-radius: 1.2rem;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.07);
  overflow: hidden;
  padding: 0.85rem 0.85rem 0.7rem;
}

.tarjetaIndicador--ancha {
  grid-column: span 3;
}

.tarjetaIndicador__header {
  margin-bottom: 0.35rem;
}

.tarjetaIndicador__tituloBloque {
  display: flex;
  gap: 0.7rem;
  align-items: flex-start;
}

.tarjetaIndicador__icono {
  display: inline-flex;
  width: 1.8rem;
  min-width: 1.8rem;
  height: 1.8rem;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  line-height: 1;
}

.tarjetaIndicador__valor {
  font-size: 1.2rem;
  font-weight: 800;
  line-height: 1.1;
}

.tarjetaIndicador__tituloBloque h3 {
  margin: 0;
  font-size: 1.08rem;
  font-weight: 800;
}

.tarjetaIndicador__tituloBloque p {
  margin: 0;
  font-size: 0.92rem;
}

.tarjetaIndicador__footer {
  margin-top: 0.3rem;
  color: #8b97a7;
  font-size: 0.88rem;
}

.tarjetaIndicador--azul .tarjetaIndicador__icono,
.tarjetaIndicador--azul .tarjetaIndicador__valor,
.tarjetaIndicador--azul .tarjetaIndicador__tituloBloque h3,
.tarjetaIndicador--azul .tarjetaIndicador__tituloBloque p {
  color: #2e5fad;
}

.tarjetaIndicador--morado .tarjetaIndicador__icono,
.tarjetaIndicador--morado .tarjetaIndicador__valor,
.tarjetaIndicador--morado .tarjetaIndicador__tituloBloque h3,
.tarjetaIndicador--morado .tarjetaIndicador__tituloBloque p {
  color: #8b2e62;
}

.tarjetaIndicador--dorado .tarjetaIndicador__icono,
.tarjetaIndicador--dorado .tarjetaIndicador__valor,
.tarjetaIndicador--dorado .tarjetaIndicador__tituloBloque h3,
.tarjetaIndicador--dorado .tarjetaIndicador__tituloBloque p {
  color: #9a8845;
}

.tarjetaIndicador--verde .tarjetaIndicador__icono,
.tarjetaIndicador--verde .tarjetaIndicador__valor,
.tarjetaIndicador--verde .tarjetaIndicador__tituloBloque h3,
.tarjetaIndicador--verde .tarjetaIndicador__tituloBloque p {
  color: #0f8f67;
}

.tarjetaIndicador--guinda .tarjetaIndicador__icono,
.tarjetaIndicador--guinda .tarjetaIndicador__valor,
.tarjetaIndicador--guinda .tarjetaIndicador__tituloBloque h3,
.tarjetaIndicador--guinda .tarjetaIndicador__tituloBloque p {
  color: #9f2241;
}

.tarjetaIndicador--turquesa .tarjetaIndicador__icono,
.tarjetaIndicador--turquesa .tarjetaIndicador__valor,
.tarjetaIndicador--turquesa .tarjetaIndicador__tituloBloque h3,
.tarjetaIndicador--turquesa .tarjetaIndicador__tituloBloque p {
  color: #117b88;
}

@media (max-width: 1100px) {
  .graficaDestacada__contenido {
    grid-template-columns: 1fr;
  }

  .rejillaGraficas {
    grid-template-columns: 1fr 1fr;
  }

  .tarjetaIndicador--ancha {
    grid-column: span 2;
  }
}

@media (max-width: 760px) {
  .vistaExperimentalGraficas {
    padding: 1rem 0.8rem 2rem;
  }

  .rejillaGraficas {
    grid-template-columns: 1fr;
  }

  .tarjetaIndicador--ancha {
    grid-column: span 1;
  }

  .graficaDestacada__footer {
    flex-direction: column;
  }
}
</style>
