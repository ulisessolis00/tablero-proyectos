<!-- src/views/VistaVisualizaciones.vue -->

<template>
  <section class="vistaVisualizaciones">
    <header class="vistaVisualizaciones__hero">
      <div class="vistaVisualizaciones__heroFondo" aria-hidden="true"></div>

      <div class="vistaVisualizaciones__heroContenido">
        <BaseButton variante="volver" color="#9f2241" @click="volverPanorama">
          <template #icono>
            <ArrowLeft :size="17" stroke-width="2.4" />
          </template>

          Volver al panorama
        </BaseButton>

        <div class="vistaVisualizaciones__heroTexto">
          <p class="vistaVisualizaciones__etiqueta">Visualizaciones</p>

          <h1 class="vistaVisualizaciones__titulo">Panel de análisis general</h1>

          <p class="vistaVisualizaciones__subtitulo">
            Gráficas ejecutivas para revisar programas, tipos de intervención, avance, presupuesto y
            calidad de captura de las secretarías.
          </p>
        </div>
      </div>
    </header>

    <main class="vistaVisualizaciones__contenido">
      <BaseErrorState
        v-if="mensajeError"
        tipo="datos"
        titulo="No se pudieron cargar las visualizaciones"
        :mensaje="mensajeError"
        mostrar-reintentar
        :to-volver="{ name: 'panorama' }"
        @reintentar="cargarDatos(true)"
      />

      <template v-else>
        <FilaResumenKpis
          titulo="Resumen de visualizaciones"
          subtitulo="Indicadores generales usados como contexto para las gráficas del tablero."
          etiqueta="Lectura ejecutiva"
          :kpis="kpisVisualizaciones"
          :columnas="4"
          :cargando="cargando"
          variante="contenida"
          mostrar-encabezado
        />

        <section class="vistaVisualizaciones__seccion">
          <EncabezadoSeccion
            titulo="Calidad de captura"
            subtitulo="Antes de analizar avances o presupuesto, conviene revisar qué tan completa está la información reportada."
            etiqueta="Datos"
          />

          <GraficaCompletitudDatos
            :secretarias="secretarias"
            :cargando="cargando"
            :fecha-corte="fechaCorte"
            color="#9b8d4b"
            tamano="destacado"
            @click-celda="manejarClickCompletitud"
          />
        </section>

        <section class="vistaVisualizaciones__grid">
          <GraficaProgramasPorSecretaria
            :secretarias="secretarias"
            :cargando="cargando"
            :fecha-corte="fechaCorte"
            color="#9b8d4b"
            @click-barra="irADetalleDesdeGrafica"
          />

          <GraficaTiposPrograma
            :secretarias="secretarias"
            :cargando="cargando"
            :fecha-corte="fechaCorte"
            color="#9b8d4b"
            @click-barra="manejarClickTipoPrograma"
          />
        </section>

        <section class="vistaVisualizaciones__grid">
          <GraficaAvanceProgramas
            :secretarias="secretarias"
            :cargando="cargando"
            :fecha-corte="fechaCorte"
            color="#9b8d4b"
            @click-avance="manejarClickAvance"
          />

          <GraficaPresupuesto
            :secretarias="secretarias"
            :cargando="cargando"
            :fecha-corte="fechaCorte"
            color="#9b8d4b"
            @click-elemento="manejarClickPresupuesto"
          />
        </section>
      </template>
    </main>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { ArrowLeft, BarChart3, ClipboardCheck, Database, Layers3 } from 'lucide-vue-next'

import BaseButton from '../components/ui/BaseButton.vue'
import BaseErrorState from '../components/ui/BaseErrorState.vue'
import EncabezadoSeccion from '../components/ui/EncabezadoSeccion.vue'
import FilaResumenKpis from '../components/kpis/FilaResumenKpis.vue'

import GraficaCompletitudDatos from '../components/graficas/GraficaCompletitudDatos.vue'
import GraficaProgramasPorSecretaria from '../components/graficas/GraficaProgramasPorSecretaria.vue'
import GraficaTiposPrograma from '../components/graficas/GraficaTiposPrograma.vue'
import GraficaAvanceProgramas from '../components/graficas/GraficaAvanceProgramas.vue'
import GraficaPresupuesto from '../components/graficas/GraficaPresupuesto.vue'

import {
  obtenerResumenGlobalSecretarias,
  obtenerSecretarias,
} from '../services/secretarias/servicioSecretarias'

const router = useRouter()

const cargando = ref(false)
const mensajeError = ref('')
const secretarias = ref([])
const fechaCorte = ref(new Date())

const resumenGlobal = ref({
  totalSecretarias: 0,
  totalSecretariasConDatos: 0,
  totalProgramas: 0,
  porcentajeIntegrado: 0,
})

const kpisVisualizaciones = computed(() => {
  return [
    {
      id: 'secretarias',
      titulo: 'Secretarías',
      valor: formatearEntero(resumenGlobal.value.totalSecretarias),
      subtitulo: 'Dependencias consideradas',
      color: '#9f2241',
      icono: Database,
      estado: 'neutral',
    },
    {
      id: 'programas',
      titulo: 'Programas',
      valor: formatearEntero(resumenGlobal.value.totalProgramas),
      subtitulo: 'Programas y acciones reportadas',
      color: '#9b8d4b',
      icono: Layers3,
      estado: 'neutral',
    },
    {
      id: 'con-datos',
      titulo: 'Con datos',
      valor: formatearEntero(resumenGlobal.value.totalSecretariasConDatos),
      subtitulo: 'Secretarías con captura',
      color: '#0d9488',
      icono: ClipboardCheck,
      estado: obtenerEstadoIntegracion(),
      mostrarEstado: true,
    },
    {
      id: 'graficas',
      titulo: 'Gráficas',
      valor: '5',
      subtitulo: 'Visualizaciones generales',
      color: '#b45309',
      icono: BarChart3,
      estado: 'completo',
      mostrarEstado: true,
    },
  ]
})

onMounted(() => {
  cargarDatos()
})

async function cargarDatos(forzarRecarga = false) {
  cargando.value = true
  mensajeError.value = ''

  try {
    const [secretariasCargadas, resumenCargado] = await Promise.all([
      obtenerSecretarias({ forzarRecarga }),
      obtenerResumenGlobalSecretarias({ forzarRecarga }),
    ])

    secretarias.value = secretariasCargadas
    resumenGlobal.value = resumenCargado
    fechaCorte.value = new Date()
  } catch (error) {
    console.error('Error al cargar visualizaciones:', error)
    mensajeError.value = obtenerMensajeError(error)
    secretarias.value = []
  } finally {
    cargando.value = false
  }
}

function volverPanorama() {
  router.push({
    name: 'panorama',
  })
}

function irADetalleDesdeGrafica(secretaria) {
  const secretariaId = secretaria?.id || secretaria?.sigla

  if (!secretariaId) {
    return
  }

  router.push({
    name: 'detalleSecretaria',
    params: {
      secretariaId,
    },
  })
}

function manejarClickCompletitud(payload) {
  irADetalleDesdeGrafica(payload.secretaria)
}

function manejarClickTipoPrograma(payload) {
  irADetalleDesdeGrafica(payload.secretaria)
}

function manejarClickAvance(payload) {
  irADetalleDesdeGrafica(payload.secretaria)
}

function manejarClickPresupuesto(payload) {
  irADetalleDesdeGrafica(payload.secretaria)
}

function obtenerEstadoIntegracion() {
  const porcentaje = Number(resumenGlobal.value.porcentajeIntegrado)

  if (!Number.isFinite(porcentaje)) {
    return 'pendiente'
  }

  if (porcentaje >= 95) {
    return 'completo'
  }

  if (porcentaje >= 50) {
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

function obtenerMensajeError(error) {
  if (error?.message) {
    return error.message
  }

  return 'Revisa que el archivo de datos exista y que las hojas tengan el formato esperado.'
}
</script>

<style scoped>
.vistaVisualizaciones {
  min-height: 100%;
}

.vistaVisualizaciones__hero {
  position: relative;
  overflow: hidden;
  color: #ffffff;
  background: linear-gradient(135deg, #5f1730, #9f2241 56%, #b35b72);
  isolation: isolate;
}

.vistaVisualizaciones__heroFondo {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(circle at 16% 16%, rgba(255, 255, 255, 0.16), transparent 18rem),
    radial-gradient(circle at 82% 10%, rgba(188, 149, 92, 0.24), transparent 20rem),
    linear-gradient(180deg, transparent, rgba(48, 11, 28, 0.28));
  pointer-events: none;
}

.vistaVisualizaciones__heroContenido {
  display: flex;
  flex-direction: column;
  gap: clamp(1.25rem, 3vw, 2.2rem);
  max-width: 1400px;
  margin: 0 auto;
  padding: clamp(1.25rem, 3vw, 2.5rem);
}

.vistaVisualizaciones__heroTexto {
  max-width: 860px;
}

.vistaVisualizaciones__etiqueta {
  display: inline-flex;
  margin: 0 0 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.13);
  padding: 0.42rem 0.78rem;
  color: rgba(255, 255, 255, 0.84);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.vistaVisualizaciones__titulo {
  margin: 0;
  font-size: clamp(2.1rem, 5vw, 4.2rem);
  font-weight: 950;
  letter-spacing: -0.06em;
  line-height: 0.96;
  text-wrap: balance;
}

.vistaVisualizaciones__subtitulo {
  max-width: 760px;
  margin: 1rem 0 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: clamp(0.95rem, 1.5vw, 1.08rem);
  font-weight: 500;
  line-height: 1.55;
}

.vistaVisualizaciones__contenido {
  display: flex;
  flex-direction: column;
  gap: clamp(1.25rem, 2.5vw, 1.8rem);
  max-width: 1400px;
  margin: 0 auto;
  padding: clamp(1.15rem, 3vw, 2.5rem);
}

.vistaVisualizaciones__seccion {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vistaVisualizaciones__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1rem, 2vw, 1.25rem);
  align-items: stretch;
}

@media (max-width: 1120px) {
  .vistaVisualizaciones__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .vistaVisualizaciones__heroContenido,
  .vistaVisualizaciones__contenido {
    padding: 1.1rem;
  }
}
</style>
