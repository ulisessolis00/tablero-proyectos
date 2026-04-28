<template>
  <section class="vistaDetalleSecretaria">
    <div v-if="cargando" class="vistaDetalleSecretaria__estado">
      <div class="vistaDetalleSecretaria__spinner"></div>
      <p>Cargando información de la secretaría...</p>
    </div>

    <div
      v-else-if="mensajeError"
      class="vistaDetalleSecretaria__estado vistaDetalleSecretaria__estado--error"
      role="alert"
    >
      <h1>No se pudo cargar la secretaría</h1>
      <p>{{ mensajeError }}</p>

      <button class="vistaDetalleSecretaria__boton" type="button" @click="volverPanorama">
        Volver al panorama
      </button>
    </div>

    <div
      v-else-if="!secretaria"
      class="vistaDetalleSecretaria__estado vistaDetalleSecretaria__estado--error"
      role="alert"
    >
      <h1>Secretaría no encontrada</h1>
      <p>No encontramos información para la secretaría solicitada.</p>

      <button class="vistaDetalleSecretaria__boton" type="button" @click="volverPanorama">
        Volver al panorama
      </button>
    </div>

    <template v-else>
      <header class="vistaDetalleSecretaria__hero" :style="estilosSecretaria">
        <div class="vistaDetalleSecretaria__heroFondo" aria-hidden="true"></div>

        <div class="vistaDetalleSecretaria__heroContenido">
          <button class="vistaDetalleSecretaria__volver" type="button" @click="volverPanorama">
            <ArrowLeft :size="18" stroke-width="2.4" />
            <span>Volver al panorama</span>
          </button>

          <div class="vistaDetalleSecretaria__heroGrid">
            <div>
              <div class="vistaDetalleSecretaria__badges">
                <span class="vistaDetalleSecretaria__sigla">
                  {{ secretaria.sigla || secretaria.id || 'N/D' }}
                </span>

                <span class="vistaDetalleSecretaria__estadoDato">
                  <span></span>
                  {{ textoEstadoDato }}
                </span>
              </div>

              <h1 class="vistaDetalleSecretaria__titulo">
                {{ secretaria.nombre || 'Secretaría sin nombre' }}
              </h1>

              <p class="vistaDetalleSecretaria__titular">
                <UserRound :size="18" stroke-width="2.2" />
                <span> Titular: {{ secretaria.titular || 'Por capturar' }} </span>
              </p>
            </div>

            <div class="vistaDetalleSecretaria__fuente">
              <span>Fuente</span>
              <strong>{{ nombreFuente }}</strong>

              <small v-if="secretaria.hojaFuente"> Hoja: {{ secretaria.hojaFuente }} </small>
            </div>
          </div>
        </div>
      </header>

      <main class="vistaDetalleSecretaria__contenido">
        <FilaResumenKpis
          titulo="Panel de Métricas Ejecutivas"
          subtitulo="Resumen de programas, presupuesto, beneficiarios y avance reportado."
          etiqueta="Detalle"
          :kpis="kpisSecretaria"
          :columnas="4"
          variante="contenida"
          mostrar-encabezado
        />

        <section class="vistaDetalleSecretaria__seccion">
          <EncabezadoSeccion
            titulo="Programas registrados"
            subtitulo="Listado agrupado por tipo de programa o acción reportada."
            :color="secretaria.color || '#9f2241'"
            etiqueta="Catálogo"
          />

          <div v-if="programasAgrupados.length" class="vistaDetalleSecretaria__grupos">
            <article
              v-for="grupo in programasAgrupados"
              :key="grupo.tipo"
              class="vistaDetalleSecretaria__grupo"
            >
              <header class="vistaDetalleSecretaria__grupoHeader">
                <div>
                  <h2>{{ grupo.tipo }}</h2>
                  <p>
                    {{ grupo.programas.length }}
                    {{ grupo.programas.length === 1 ? 'programa' : 'programas' }}
                  </p>
                </div>

                <span class="vistaDetalleSecretaria__grupoLinea"></span>
              </header>

              <div class="vistaDetalleSecretaria__programas">
                <article
                  v-for="programa in grupo.programas"
                  :key="programa.id || programa.nombre"
                  class="vistaDetalleSecretaria__programa"
                >
                  <div class="vistaDetalleSecretaria__programaSuperior">
                    <h3>{{ programa.nombre || 'Programa sin nombre' }}</h3>

                    <span class="vistaDetalleSecretaria__programaEstado">
                      {{ programa.estado || programa.estadoCaptura || 'Sin estado' }}
                    </span>
                  </div>

                  <p
                    v-if="programa.descripcion"
                    class="vistaDetalleSecretaria__programaDescripcion"
                  >
                    {{ limitarTexto(programa.descripcion, 230) }}
                  </p>

                  <div class="vistaDetalleSecretaria__programaDatos">
                    <div class="vistaDetalleSecretaria__dato">
                      <WalletCards :size="17" stroke-width="2.2" />
                      <span>Presupuesto</span>
                      <strong>{{ formatearPesos(programa.presupuestoAsignado) }}</strong>
                    </div>

                    <div class="vistaDetalleSecretaria__dato">
                      <UsersRound :size="17" stroke-width="2.2" />
                      <span>Beneficiarios</span>
                      <strong>{{ formatearEntero(programa.beneficiariosActuales) }}</strong>
                    </div>

                    <div class="vistaDetalleSecretaria__dato">
                      <Activity :size="17" stroke-width="2.2" />
                      <span>Avance</span>
                      <strong>{{ formatearPorcentaje(programa.avance) }}</strong>
                    </div>

                    <div class="vistaDetalleSecretaria__dato">
                      <MapPin :size="17" stroke-width="2.2" />
                      <span>Alcaldía</span>
                      <strong>{{ programa.alcaldia || 'Por capturar' }}</strong>
                    </div>
                  </div>

                  <div v-if="programa.observaciones" class="vistaDetalleSecretaria__observaciones">
                    {{ programa.observaciones }}
                  </div>
                </article>
              </div>
            </article>
          </div>

          <div v-else class="vistaDetalleSecretaria__estado">
            <p>Esta secretaría aún no tiene programas registrados.</p>
          </div>
        </section>
      </main>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  Activity,
  ArrowLeft,
  ClipboardList,
  MapPin,
  PercentCircle,
  Tags,
  UserRound,
  UsersRound,
  WalletCards,
} from 'lucide-vue-next'

import FilaResumenKpis from '../components/kpis/FilaResumenKpis.vue'
import EncabezadoSeccion from '../components/ui/EncabezadoSeccion.vue'

import { obtenerSecretariaPorId } from '../services/secretarias/servicioSecretarias'
import { obtenerUsuarioActual } from '../services/sesion/servicioSesion'
import { metadataSecretarias } from '../data/catalogos/metadataSecretarias'

import {
  crearResumenSecretaria,
  puedeVerSecretaria,
  ESTADO_DATO,
} from '../models/secretarias/modeloDatosSecretarias'

const route = useRoute()
const router = useRouter()

const secretaria = ref(null)
const cargando = ref(false)
const mensajeError = ref('')

const secretariaId = computed(() => {
  return String(route.params.secretariaId || '').trim()
})

const secretariaSegura = computed(() => {
  if (!secretaria.value) {
    return null
  }

  return enriquecerSecretariaConMetadata(secretaria.value)
})

const resumenSecretaria = computed(() => {
  if (!secretariaSegura.value) {
    return crearResumenSecretaria({
      programas: [],
    })
  }

  return crearResumenSecretaria(secretariaSegura.value)
})

const estilosSecretaria = computed(() => {
  return {
    '--detalle-secretaria-color': validarColor(secretariaSegura.value?.color),
  }
})

const textoEstadoDato = computed(() => {
  const estados = {
    [ESTADO_DATO.completo]: 'Completo',
    [ESTADO_DATO.parcial]: 'Parcial',
    [ESTADO_DATO.pendiente]: 'Pendiente',
    [ESTADO_DATO.sinDatos]: 'Sin datos',
  }

  return estados[resumenSecretaria.value.estadoDato] || 'Pendiente'
})

const nombreFuente = computed(() => {
  const archivo =
    secretariaSegura.value?.archivoFuente ||
    secretariaSegura.value?.fuente?.archivo ||
    obtenerArchivoFuenteDesdeProgramas()

  if (!archivo) {
    return 'Excel local'
  }

  return String(archivo).split('/').pop()
})

const kpisSecretaria = computed(() => {
  const colorSecretaria = validarColor(secretariaSegura.value?.color)

  return [
    {
      id: 'programas',
      titulo: 'Programas',
      valor: formatearEntero(resumenSecretaria.value.totalProgramas),
      subtitulo: 'Programas registrados',
      color: colorSecretaria,
      icono: ClipboardList,
      estado: resumenSecretaria.value.totalProgramas > 0 ? 'completo' : 'pendiente',
      mostrarEstado: true,
    },
    {
      id: 'tipos',
      titulo: 'Clasificación',
      valor: formatearEntero(resumenSecretaria.value.totalTiposPrograma),
      subtitulo: 'Tipos de programa',
      color: '#bc955c',
      icono: Tags,
      estado: resumenSecretaria.value.totalTiposPrograma > 0 ? 'completo' : 'pendiente',
      mostrarEstado: true,
    },
    {
      id: 'presupuesto',
      titulo: 'Presupuesto',
      valor: formatearPesosCorto(resumenSecretaria.value.presupuestoAsignadoTotal),
      subtitulo: 'Presupuesto asignado',
      color: '#b45309',
      icono: WalletCards,
      estado: resumenSecretaria.value.presupuestoAsignadoTotal > 0 ? 'parcial' : 'pendiente',
      mostrarEstado: true,
    },
    {
      id: 'avance',
      titulo: 'Avance',
      valor: formatearPorcentaje(resumenSecretaria.value.avancePromedio),
      subtitulo: 'Avance promedio reportado',
      color: '#059669',
      icono: PercentCircle,
      estado: obtenerEstadoAvance(resumenSecretaria.value.avancePromedio),
      mostrarEstado: true,
    },
  ]
})

const programasAgrupados = computed(() => {
  const programas = Array.isArray(secretariaSegura.value?.programas)
    ? secretariaSegura.value.programas
    : []

  const grupos = programas.reduce((acumulado, programa) => {
    const tipo = limpiarTexto(programa.tipo, 'General')

    if (!acumulado[tipo]) {
      acumulado[tipo] = []
    }

    acumulado[tipo].push(programa)

    return acumulado
  }, {})

  return Object.keys(grupos)
    .sort((a, b) => a.localeCompare(b, 'es'))
    .map((tipo) => {
      return {
        tipo,
        programas: grupos[tipo],
      }
    })
})

onMounted(() => {
  cargarSecretaria()
})

watch(
  () => route.params.secretariaId,
  () => {
    cargarSecretaria()
  },
)

async function cargarSecretaria() {
  cargando.value = true
  mensajeError.value = ''
  secretaria.value = null

  try {
    if (!secretariaId.value) {
      mensajeError.value = 'No se recibió el identificador de la secretaría.'
      return
    }

    const secretariaEncontrada = await obtenerSecretariaPorId(secretariaId.value, {
      forzarRecarga: false,
    })

    if (!secretariaEncontrada) {
      mensajeError.value = 'No se encontró la secretaría solicitada.'
      return
    }

    const secretariaConMetadata = enriquecerSecretariaConMetadata(secretariaEncontrada)
    const tienePermiso = await validarPermisoVista(secretariaConMetadata)

    if (!tienePermiso) {
      router.replace({
        name: 'noAutorizado',
        query: {
          motivo: 'secretaria',
          desde: route.fullPath,
        },
      })

      return
    }

    secretaria.value = secretariaConMetadata
  } catch (error) {
    console.error('Error al cargar detalle de secretaría:', error)
    mensajeError.value = error?.message || 'Ocurrió un error al cargar la información.'
  } finally {
    cargando.value = false
  }
}

async function validarPermisoVista(secretariaEncontrada) {
  try {
    const usuario = await obtenerUsuarioActual()

    if (!usuario?.autenticado) {
      return true
    }

    return puedeVerSecretaria(usuario, secretariaEncontrada)
  } catch (error) {
    console.warn(
      'No fue posible validar la sesión. Se permite acceso temporal en modo local:',
      error,
    )
    return true
  }
}

function volverPanorama() {
  router.push({
    name: 'panorama',
  })
}

function enriquecerSecretariaConMetadata(secretariaBase = {}) {
  const metadata = buscarMetadataSecretaria(secretariaBase)

  return {
    ...secretariaBase,
    id: metadata?.id || secretariaBase.id || normalizarIdBusqueda(secretariaBase.sigla),
    sigla: metadata?.sigla || secretariaBase.sigla || secretariaBase.id || 'N/D',
    nombre:
      metadata?.nombre || secretariaBase.nombre || secretariaBase.sigla || 'Secretaría sin nombre',
    titular: metadata?.titular || secretariaBase.titular || 'Por capturar',
    color: metadata?.color || secretariaBase.color || '#9f2241',
    orden: metadata?.orden ?? secretariaBase.orden ?? 999,
  }
}

function buscarMetadataSecretaria(secretariaBase = {}) {
  const listaMetadata = normalizarListaMetadata(metadataSecretarias)

  const candidatosSecretaria = [
    secretariaBase.id,
    secretariaBase.sigla,
    secretariaBase.nombre,
    secretariaBase.hoja,
    secretariaBase.hojaFuente,
    secretariaBase.nombreHoja,
  ]
    .map(normalizarClaveSecretaria)
    .filter(Boolean)

  return (
    listaMetadata.find((metadata) => {
      const candidatosMetadata = [
        metadata.id,
        metadata.sigla,
        metadata.nombre,
        metadata.hoja,
        ...(Array.isArray(metadata.aliases) ? metadata.aliases : []),
      ]
        .map(normalizarClaveSecretaria)
        .filter(Boolean)

      return candidatosMetadata.some((candidato) => {
        return candidatosSecretaria.includes(candidato)
      })
    }) || null
  )
}

function normalizarListaMetadata(metadata) {
  if (Array.isArray(metadata)) {
    return metadata
  }

  if (metadata && typeof metadata === 'object') {
    return Object.entries(metadata).map(([siglaMetadata, valores]) => {
      return {
        sigla: siglaMetadata,
        ...valores,
      }
    })
  }

  return []
}

function normalizarClaveSecretaria(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\./g, '')
    .replace(/secretaria/g, '')
    .replace(/agencia/g, '')
    .replace(/de/g, '')
    .replace(/del/g, '')
    .replace(/la/g, '')
    .replace(/las/g, '')
    .replace(/los/g, '')
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
}

function obtenerArchivoFuenteDesdeProgramas() {
  const programas = Array.isArray(secretariaSegura.value?.programas)
    ? secretariaSegura.value.programas
    : []

  return programas.find((programa) => programa?.archivoFuente)?.archivoFuente || ''
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

function limitarTexto(texto, limite = 220) {
  const valor = String(texto || '').trim()

  if (valor.length <= limite) {
    return valor
  }

  return `${valor.slice(0, limite).trim()}...`
}

function formatearEntero(valor) {
  const numero = Number(valor)

  if (!Number.isFinite(numero) || numero <= 0) {
    return '0'
  }

  return new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: 0,
  }).format(numero)
}

function formatearPesos(valor) {
  const numero = normalizarNumero(valor)

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
  const numero = normalizarNumero(valor)

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
  const numero = normalizarNumero(valor)

  if (!Number.isFinite(numero)) {
    return 'Pendiente'
  }

  return `${new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: 1,
  }).format(numero)}%`
}

function normalizarNumero(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return NaN
  }

  if (typeof valor === 'number') {
    return valor
  }

  const texto = String(valor).replace(/\$/g, '').replace(/,/g, '').replace(/%/g, '').trim()

  const numero = Number(texto)

  return Number.isFinite(numero) ? numero : NaN
}

function limpiarTexto(valor, valorDefault = '') {
  const texto = String(valor ?? '').trim()

  if (!texto || texto.toUpperCase() === 'NA' || texto.toUpperCase() === 'NULL') {
    return valorDefault
  }

  return texto
}

function validarColor(valor) {
  if (/^#[0-9a-fA-F]{6}$/.test(valor || '')) {
    return valor
  }

  return '#9f2241'
}

function normalizarIdBusqueda(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
</script>

<style scoped>
.vistaDetalleSecretaria {
  min-height: 100%;
}

.vistaDetalleSecretaria__hero {
  position: relative;
  overflow: hidden;
  color: #ffffff;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--detalle-secretaria-color) 72%, #401225),
    color-mix(in srgb, var(--detalle-secretaria-color) 54%, #9f2241)
  );
  isolation: isolate;
}

.vistaDetalleSecretaria__heroFondo {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(circle at 18% 15%, rgba(255, 255, 255, 0.16), transparent 18rem),
    radial-gradient(circle at 82% 12%, rgba(188, 149, 92, 0.24), transparent 20rem);
  pointer-events: none;
}

.vistaDetalleSecretaria__heroContenido {
  max-width: 1400px;
  margin: 0 auto;
  padding: clamp(1.25rem, 3vw, 2.5rem);
}

.vistaDetalleSecretaria__volver {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.13);
  color: #ffffff;
  padding: 0.58rem 0.9rem;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 850;
  cursor: pointer;
  backdrop-filter: blur(12px);
}

.vistaDetalleSecretaria__heroGrid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 2rem;
  align-items: end;
  margin-top: clamp(1.35rem, 3vw, 2.25rem);
}

.vistaDetalleSecretaria__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
  margin-bottom: 0.9rem;
}

.vistaDetalleSecretaria__sigla,
.vistaDetalleSecretaria__estadoDato {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 950;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.vistaDetalleSecretaria__sigla {
  background: rgba(255, 255, 255, 0.95);
  color: var(--detalle-secretaria-color);
  padding: 0.42rem 0.8rem;
}

.vistaDetalleSecretaria__estadoDato {
  gap: 0.42rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.13);
  color: rgba(255, 255, 255, 0.9);
  padding: 0.42rem 0.75rem;
}

.vistaDetalleSecretaria__estadoDato span {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 999px;
  background: #67e8a5;
  box-shadow: 0 0 0 0.24rem rgba(103, 232, 165, 0.14);
}

.vistaDetalleSecretaria__titulo {
  max-width: 980px;
  margin: 0;
  font-size: clamp(2rem, 5vw, 4.2rem);
  font-weight: 950;
  letter-spacing: -0.06em;
  line-height: 0.96;
  text-wrap: balance;
}

.vistaDetalleSecretaria__titular {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 800px;
  margin: 1rem 0 0;
  color: rgba(255, 255, 255, 0.86);
  font-size: 0.95rem;
  font-weight: 650;
}

.vistaDetalleSecretaria__fuente {
  display: flex;
  flex-direction: column;
  min-width: 245px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 1.15rem;
  background: rgba(255, 255, 255, 0.13);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(14px);
  padding: 1rem;
}

.vistaDetalleSecretaria__fuente span {
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.vistaDetalleSecretaria__fuente strong {
  margin-top: 0.25rem;
  overflow-wrap: anywhere;
  color: #ffffff;
  font-size: 0.86rem;
  font-weight: 900;
}

.vistaDetalleSecretaria__fuente small {
  margin-top: 0.35rem;
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.75rem;
  font-weight: 650;
}

.vistaDetalleSecretaria__contenido {
  display: flex;
  flex-direction: column;
  gap: clamp(1.25rem, 2.5vw, 1.75rem);
  max-width: 1400px;
  margin: 0 auto;
  padding: clamp(1.15rem, 3vw, 2.5rem);
}

.vistaDetalleSecretaria__seccion {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vistaDetalleSecretaria__grupos {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.vistaDetalleSecretaria__grupo {
  border: 1px solid rgba(159, 34, 65, 0.1);
  border-radius: 1.35rem;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 18px 45px rgba(31, 41, 55, 0.055);
  backdrop-filter: blur(14px);
  padding: clamp(1rem, 2vw, 1.2rem);
}

.vistaDetalleSecretaria__grupoHeader {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.vistaDetalleSecretaria__grupoHeader h2 {
  margin: 0;
  color: #111827;
  font-size: 1.08rem;
  font-weight: 950;
  letter-spacing: -0.025em;
}

.vistaDetalleSecretaria__grupoHeader p {
  margin: 0.25rem 0 0;
  color: #6b7280;
  font-size: 0.78rem;
  font-weight: 800;
}

.vistaDetalleSecretaria__grupoLinea {
  flex: 1;
  height: 1px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--detalle-secretaria-color) 32%, transparent),
    transparent
  );
}

.vistaDetalleSecretaria__programas {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.95rem;
}

.vistaDetalleSecretaria__programa {
  border: 1px solid rgba(229, 231, 235, 0.95);
  border-radius: 1.05rem;
  background: #ffffff;
  padding: 1rem;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.vistaDetalleSecretaria__programa:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--detalle-secretaria-color) 26%, #ffffff);
  box-shadow: 0 18px 40px rgba(31, 41, 55, 0.07);
}

.vistaDetalleSecretaria__programaSuperior {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.85rem;
}

.vistaDetalleSecretaria__programaSuperior h3 {
  margin: 0;
  color: #111827;
  font-size: 0.96rem;
  font-weight: 900;
  letter-spacing: -0.015em;
  line-height: 1.3;
}

.vistaDetalleSecretaria__programaEstado {
  flex: 0 0 auto;
  max-width: 9rem;
  overflow: hidden;
  border-radius: 999px;
  background: color-mix(in srgb, var(--detalle-secretaria-color) 9%, #ffffff);
  color: var(--detalle-secretaria-color);
  padding: 0.35rem 0.55rem;
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.055em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.vistaDetalleSecretaria__programaDescripcion {
  display: -webkit-box;
  overflow: hidden;
  margin: 0.75rem 0 0;
  color: #6b7280;
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.vistaDetalleSecretaria__programaDatos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  margin-top: 0.95rem;
}

.vistaDetalleSecretaria__dato {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  column-gap: 0.45rem;
  row-gap: 0.1rem;
  align-items: center;
  border-radius: 0.85rem;
  background: #f9fafb;
  padding: 0.65rem;
}

.vistaDetalleSecretaria__dato svg {
  grid-row: span 2;
  color: var(--detalle-secretaria-color);
}

.vistaDetalleSecretaria__dato span {
  overflow: hidden;
  color: #9ca3af;
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.07em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.vistaDetalleSecretaria__dato strong {
  overflow: hidden;
  color: #111827;
  font-size: 0.78rem;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vistaDetalleSecretaria__observaciones {
  margin-top: 0.85rem;
  border-top: 1px dashed #e5e7eb;
  padding-top: 0.75rem;
  color: #6b7280;
  font-size: 0.76rem;
  font-style: italic;
  font-weight: 600;
  line-height: 1.45;
}

.vistaDetalleSecretaria__estado {
  display: grid;
  place-items: center;
  min-height: 55vh;
  padding: 2rem;
  text-align: center;
}

.vistaDetalleSecretaria__estado p {
  max-width: 520px;
  margin: 0.75rem auto 0;
  color: #6b7280;
  font-weight: 650;
}

.vistaDetalleSecretaria__estado--error h1 {
  margin: 0;
  color: #111827;
  font-size: 1.4rem;
  font-weight: 950;
}

.vistaDetalleSecretaria__spinner {
  width: 2.6rem;
  height: 2.6rem;
  border: 4px solid rgba(159, 34, 65, 0.16);
  border-top-color: #9f2241;
  border-radius: 999px;
  animation: girar 850ms linear infinite;
}

.vistaDetalleSecretaria__boton {
  margin-top: 1rem;
  border: 0;
  border-radius: 0.9rem;
  background: #9f2241;
  color: #ffffff;
  padding: 0.72rem 1rem;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 900;
  cursor: pointer;
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 980px) {
  .vistaDetalleSecretaria__heroGrid {
    grid-template-columns: 1fr;
  }

  .vistaDetalleSecretaria__fuente {
    min-width: 0;
  }

  .vistaDetalleSecretaria__programas {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .vistaDetalleSecretaria__programaSuperior {
    flex-direction: column;
  }

  .vistaDetalleSecretaria__programaDatos {
    grid-template-columns: 1fr;
  }

  .vistaDetalleSecretaria__volver {
    width: 100%;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .vistaDetalleSecretaria__spinner {
    animation: none;
  }

  .vistaDetalleSecretaria__programa {
    transition: none;
  }

  .vistaDetalleSecretaria__programa:hover {
    transform: none;
  }
}
</style>
