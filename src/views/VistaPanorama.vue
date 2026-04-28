<!-- src/views/VistaPanorama.vue -->

<template>
  <section class="vistaPanorama">
    <EncabezadoPanorama :resumen="resumenGlobal" :fecha-actualizacion="fechaActualizacion" />

    <div class="vistaPanorama__contenedor">
      <FilaResumenKpis
        titulo="Resumen general"
        subtitulo="Indicadores principales de integración, programas y carga institucional."
        etiqueta="Panorama"
        :kpis="kpisPanorama"
        :columnas="4"
        :cargando="cargando"
        variante="contenida"
        mostrar-encabezado
      />

      <div class="vistaPanorama__seccion">
        <EncabezadoSeccion
          titulo="Secretarías del Gobierno"
          subtitulo="Selecciona una dependencia para consultar sus programas, métricas y avance reportado."
          etiqueta="Dependencias"
        />
      </div>

      <FiltrosPanorama
        v-model="filtros"
        :tipos-programa="tiposPrograma"
        :total-resultados="secretariasFiltradas.length"
        :abrir-filtros="true"
      />

      <div v-if="mensajeError" class="vistaPanorama__alerta" role="alert">
        <strong>No fue posible cargar la información.</strong>
        <span>{{ mensajeError }}</span>

        <button class="vistaPanorama__alertaBoton" type="button" @click="cargarDatos(true)">
          Reintentar
        </button>
      </div>

      <CuadriculaSecretarias
        :secretarias="secretariasFiltradas"
        :cargando="cargando"
        :columnas="3"
        :cantidad-skeleton="6"
        @seleccionar="seleccionarSecretaria"
        @ver-detalle="irADetalleSecretaria"
      />
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { Building2, Database, Layers3, PercentCircle } from 'lucide-vue-next'

import EncabezadoPanorama from '../components/panorama/EncabezadoPanorama.vue'
import FiltrosPanorama from '../components/panorama/FiltrosPanorama.vue'
import CuadriculaSecretarias from '../components/secretarias/CuadriculaSecretarias.vue'
import FilaResumenKpis from '../components/kpis/FilaResumenKpis.vue'
import EncabezadoSeccion from '../components/ui/EncabezadoSeccion.vue'

import {
  obtenerSecretarias,
  obtenerResumenGlobalSecretarias,
} from '../services/secretarias/servicioSecretarias'

import { crearResumenSecretaria } from '../models/secretarias/modeloDatosSecretarias'

const router = useRouter()

const secretarias = ref([])
const cargando = ref(false)
const mensajeError = ref('')
const fechaActualizacion = ref(new Date())

const resumenGlobal = ref({
  totalSecretarias: 0,
  totalSecretariasActivas: 0,
  totalSecretariasConDatos: 0,
  totalProgramas: 0,
  presupuestoAsignadoTotal: 0,
  porcentajeIntegrado: 0,
})

const filtros = ref({
  busqueda: '',
  tipoPrograma: '',
  estadoDato: '',
  disponibilidad: '',
})

const kpisPanorama = computed(() => {
  return [
    {
      id: 'secretarias',
      titulo: 'Secretarías',
      valor: formatearEntero(resumenGlobal.value.totalSecretarias),
      subtitulo: 'Dependencias registradas',
      color: '#9f2241',
      icono: Building2,
      estado: 'completo',
      mostrarEstado: true,
    },
    {
      id: 'con-datos',
      titulo: 'Con datos',
      valor: formatearEntero(resumenGlobal.value.totalSecretariasConDatos),
      subtitulo: 'Secretarías con información cargada',
      color: '#0D9488',
      icono: Database,
      estado: obtenerEstadoIntegracion(),
      mostrarEstado: true,
    },
    {
      id: 'programas',
      titulo: 'Programas',
      valor: formatearEntero(resumenGlobal.value.totalProgramas),
      subtitulo: 'Programas y acciones reportadas',
      color: '#bc955c',
      icono: Layers3,
      estado: 'neutral',
    },
    {
      id: 'integrado',
      titulo: 'Integrado',
      valor: `${formatearEntero(resumenGlobal.value.porcentajeIntegrado)}%`,
      subtitulo: 'Avance de integración de datos',
      color: '#059669',
      icono: PercentCircle,
      estado: obtenerEstadoIntegracion(),
      mostrarEstado: true,
    },
  ]
})

const tiposPrograma = computed(() => {
  const tipos = secretarias.value.flatMap((secretaria) => {
    return obtenerProgramas(secretaria).map((programa) => programa.tipo)
  })

  return [...new Set(tipos.filter(Boolean))].sort((a, b) => {
    return a.localeCompare(b, 'es')
  })
})

const secretariasFiltradas = computed(() => {
  return secretarias.value.filter((secretaria) => {
    return (
      cumpleBusqueda(secretaria) &&
      cumpleTipoPrograma(secretaria) &&
      cumpleEstadoDato(secretaria) &&
      cumpleDisponibilidad(secretaria)
    )
  })
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
    fechaActualizacion.value = new Date()
  } catch (error) {
    console.error('Error al cargar panorama:', error)
    mensajeError.value = obtenerMensajeError(error)
    secretarias.value = []
  } finally {
    cargando.value = false
  }
}

function seleccionarSecretaria(secretaria) {
  if (!tieneProgramas(secretaria)) {
    return
  }

  irADetalleSecretaria(secretaria)
}

function irADetalleSecretaria(secretaria) {
  if (!secretaria?.id) {
    return
  }

  router.push({
    name: 'detalleSecretaria',
    params: {
      secretariaId: secretaria.id,
    },
  })
}

function cumpleBusqueda(secretaria) {
  const busqueda = normalizarTexto(filtros.value.busqueda)

  if (!busqueda) {
    return true
  }

  const textoSecretaria = normalizarTexto(
    [secretaria.sigla, secretaria.nombre, secretaria.titular].join(' '),
  )

  return textoSecretaria.includes(busqueda)
}

function cumpleTipoPrograma(secretaria) {
  const tipoPrograma = filtros.value.tipoPrograma

  if (!tipoPrograma) {
    return true
  }

  return obtenerProgramas(secretaria).some((programa) => {
    return programa.tipo === tipoPrograma
  })
}

function cumpleEstadoDato(secretaria) {
  const estadoDato = filtros.value.estadoDato

  if (!estadoDato) {
    return true
  }

  const resumenSecretaria = crearResumenSecretaria(secretaria)

  return resumenSecretaria.estadoDato === estadoDato
}

function cumpleDisponibilidad(secretaria) {
  const disponibilidad = filtros.value.disponibilidad

  if (!disponibilidad) {
    return true
  }

  const conDatos = tieneProgramas(secretaria)

  if (disponibilidad === 'conDatos') {
    return conDatos
  }

  if (disponibilidad === 'sinDatos') {
    return !conDatos
  }

  return true
}

function obtenerProgramas(secretaria) {
  return Array.isArray(secretaria?.programas) ? secretaria.programas : []
}

function tieneProgramas(secretaria) {
  return obtenerProgramas(secretaria).length > 0
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

function normalizarTexto(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function obtenerMensajeError(error) {
  if (error?.message) {
    return error.message
  }

  return 'Revisa que el archivo Excel exista en public/data/excel y que las hojas tengan el formato esperado.'
}
</script>

<style scoped>
.vistaPanorama {
  min-height: 100%;
}

.vistaPanorama__contenedor {
  display: flex;
  flex-direction: column;
  gap: clamp(1.15rem, 2.4vw, 1.65rem);
  max-width: 1400px;
  margin: 0 auto;
  padding: clamp(1.15rem, 3vw, 2.5rem);
}

.vistaPanorama__seccion {
  margin-top: 0.4rem;
}

.vistaPanorama__alerta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  border: 1px solid rgba(220, 38, 38, 0.18);
  border-radius: 1.15rem;
  background: rgba(254, 242, 242, 0.86);
  color: #991b1b;
  padding: 0.95rem 1rem;
  box-shadow: 0 14px 35px rgba(127, 29, 29, 0.06);
}

.vistaPanorama__alerta strong {
  flex: 0 0 auto;
  font-size: 0.88rem;
  font-weight: 950;
}

.vistaPanorama__alerta span {
  flex: 1;
  font-size: 0.84rem;
  font-weight: 650;
  line-height: 1.45;
}

.vistaPanorama__alertaBoton {
  flex: 0 0 auto;
  border: 0;
  border-radius: 0.8rem;
  background: #991b1b;
  color: #ffffff;
  padding: 0.62rem 0.85rem;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 900;
  cursor: pointer;
}

.vistaPanorama__alertaBoton:focus-visible {
  outline: 3px solid rgba(153, 27, 27, 0.24);
  outline-offset: 3px;
}

@media (max-width: 820px) {
  .vistaPanorama__alerta {
    align-items: flex-start;
    flex-direction: column;
  }

  .vistaPanorama__alertaBoton {
    width: 100%;
  }
}
</style>
