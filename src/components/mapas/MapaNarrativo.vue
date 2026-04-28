<!-- src/components/mapas/MapaNarrativo.vue -->

<template>
  <section class="mapaNarrativo" :style="estilosMapa">
    <header v-if="mostrarHeader" class="mapaNarrativo__header">
      <div>
        <p>Capítulo activo</p>
        <h2>{{ capituloActivo.titulo }}</h2>
      </div>

      <BaseBadge
        :texto="capituloActivo.etiqueta"
        :color="capituloActivo.color"
        variante="suave"
        mostrar-punto
      />
    </header>

    <div class="mapaNarrativo__wrapper">
      <BaseSkeleton
        v-if="cargandoMapa"
        tipo="hero"
        :color="colorActivo"
        class="mapaNarrativo__skeleton"
      />

      <BaseErrorState
        v-else-if="mensajeError"
        tipo="datos"
        titulo="No se pudo cargar el mapa"
        :mensaje="mensajeError"
        mostrar-reintentar
        :mostrar-volver="false"
        class="mapaNarrativo__error"
        @reintentar="inicializarMapa"
      />

      <div
        ref="contenedorMapa"
        class="mapaNarrativo__mapa"
        :class="{ 'mapaNarrativo__mapa--oculto': cargandoMapa || mensajeError }"
        aria-label="Mapa narrativo de proyectos"
      ></div>

      <div
        v-if="mostrarPanelDato && !cargandoMapa && !mensajeError"
        class="mapaNarrativo__panelDato"
      >
        <span>{{ capituloActivo.etiqueta }}</span>
        <strong>{{ capituloActivo.titulo }}</strong>
        <p>{{ capituloActivo.descripcionCorta || capituloActivo.descripcion }}</p>
      </div>
    </div>

    <footer v-if="mostrarFooter" class="mapaNarrativo__footer">
      <p>
        {{ textoFuente }}
      </p>
    </footer>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'

import BaseBadge from '../ui/BaseBadge.vue'
import BaseErrorState from '../ui/BaseErrorState.vue'
import BaseSkeleton from '../ui/BaseSkeleton.vue'

const props = defineProps({
  capitulos: {
    type: Array,
    default: () => [],
  },
  capituloActivoId: {
    type: [String, Number],
    default: '',
  },
  altura: {
    type: [String, Number],
    default: '560px',
  },
  tileUrl: {
    type: String,
    default: '',
  },
  attribution: {
    type: String,
    default: '© OpenStreetMap contributors',
  },
  mostrarHeader: {
    type: Boolean,
    default: true,
  },
  mostrarFooter: {
    type: Boolean,
    default: true,
  },
  mostrarPanelDato: {
    type: Boolean,
    default: true,
  },
  mostrarControlNavegacion: {
    type: Boolean,
    default: true,
  },
  duracionVuelo: {
    type: Number,
    default: 1200,
  },
  zoomDefault: {
    type: Number,
    default: 11.5,
  },
  pitchDefault: {
    type: Number,
    default: 32,
  },
  bearingDefault: {
    type: Number,
    default: 0,
  },
  centroDefault: {
    type: Array,
    default: () => [-99.1332, 19.4326],
  },
  textoFuente: {
    type: String,
    default:
      'Fuente cartográfica: OpenStreetMap. La URL de teselas puede configurarse con VITE_MAP_TILE_URL.',
  },
})

const emit = defineEmits(['update:capituloActivoId', 'clickCapitulo', 'mapaListo', 'error'])

const contenedorMapa = ref(null)
const mapa = shallowRef(null)
const maplibre = shallowRef(null)

const cargandoMapa = ref(true)
const mensajeError = ref('')
const mapaCargado = ref(false)
const capituloActivoIdLocal = ref('')

let observadorResize = null

const capitulosNormalizados = computed(() => {
  return props.capitulos
    .filter((capitulo) => capitulo && typeof capitulo === 'object')
    .map((capitulo, indice) => {
      return {
        id: String(capitulo.id || `capitulo-${indice + 1}`),
        etiqueta: limpiarTexto(capitulo.etiqueta, `Capítulo ${indice + 1}`),
        titulo: limpiarTexto(capitulo.titulo, 'Capítulo sin título'),
        descripcion: limpiarTexto(capitulo.descripcion, 'Sin descripción.'),
        descripcionCorta: limpiarTexto(capitulo.descripcionCorta, ''),
        coordenadas: normalizarCoordenadas(capitulo.coordenadas),
        zoom: normalizarNumero(capitulo.zoom, props.zoomDefault),
        pitch: normalizarNumero(capitulo.pitch, props.pitchDefault),
        bearing: normalizarNumero(capitulo.bearing, props.bearingDefault),
        color: validarColor(capitulo.color),
      }
    })
})

const idActivo = computed(() => {
  return String(
    props.capituloActivoId ||
      capituloActivoIdLocal.value ||
      capitulosNormalizados.value[0]?.id ||
      '',
  )
})

const capituloActivo = computed(() => {
  return (
    capitulosNormalizados.value.find((capitulo) => {
      return capitulo.id === idActivo.value
    }) ||
    capitulosNormalizados.value[0] ||
    crearCapituloVacio()
  )
})

const colorActivo = computed(() => {
  return validarColor(capituloActivo.value.color)
})

const estilosMapa = computed(() => {
  return {
    '--mapa-narrativo-altura': normalizarMedida(props.altura),
    '--mapa-narrativo-color': colorActivo.value,
  }
})

const geojsonCapitulos = computed(() => {
  return {
    type: 'FeatureCollection',
    features: capitulosNormalizados.value.map((capitulo) => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: capitulo.coordenadas,
        },
        properties: {
          id: capitulo.id,
          etiqueta: capitulo.etiqueta,
          titulo: capitulo.titulo,
          color: capitulo.color,
          activo: capitulo.id === idActivo.value,
        },
      }
    }),
  }
})

onMounted(async () => {
  await inicializarMapa()
})

onBeforeUnmount(() => {
  destruirMapa()
})

watch(idActivo, () => {
  moverMapaACapitulo(capituloActivo.value)
  actualizarDatosMapa()
})

watch(
  capitulosNormalizados,
  () => {
    actualizarDatosMapa()

    if (!idActivo.value && capitulosNormalizados.value[0]) {
      definirCapituloActivo(capitulosNormalizados.value[0].id)
    }
  },
  {
    deep: true,
  },
)

async function inicializarMapa() {
  cargandoMapa.value = true
  mensajeError.value = ''
  mapaCargado.value = false

  try {
    await nextTick()

    if (!contenedorMapa.value) {
      throw new Error('No se encontró el contenedor del mapa.')
    }

    if (!capitulosNormalizados.value.length) {
      throw new Error('No hay capítulos disponibles para mostrar en el mapa.')
    }

    const modulo = await import('maplibre-gl')
    maplibre.value = modulo.default || modulo

    destruirMapa()

    mapa.value = new maplibre.value.Map({
      container: contenedorMapa.value,
      style: crearEstiloMapa(),
      center: capituloActivo.value.coordenadas,
      zoom: capituloActivo.value.zoom,
      pitch: capituloActivo.value.pitch,
      bearing: capituloActivo.value.bearing,
      attributionControl: true,
    })

    if (props.mostrarControlNavegacion) {
      mapa.value.addControl(
        new maplibre.value.NavigationControl({
          visualizePitch: true,
        }),
        'top-right',
      )
    }

    mapa.value.on('load', configurarCapasMapa)
    mapa.value.on('error', manejarErrorMapa)

    prepararResize()
  } catch (error) {
    manejarError(error)
  } finally {
    cargandoMapa.value = false
  }
}

function crearEstiloMapa() {
  const tileUrl =
    props.tileUrl ||
    import.meta.env.VITE_MAP_TILE_URL ||
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

  return {
    version: 8,
    sources: {
      mapaBase: {
        type: 'raster',
        tiles: [tileUrl],
        tileSize: 256,
        attribution: props.attribution,
      },
    },
    layers: [
      {
        id: 'mapa-base',
        type: 'raster',
        source: 'mapaBase',
      },
    ],
  }
}

function configurarCapasMapa() {
  if (!mapa.value) {
    return
  }

  mapaCargado.value = true

  if (!mapa.value.getSource('capitulos')) {
    mapa.value.addSource('capitulos', {
      type: 'geojson',
      data: geojsonCapitulos.value,
    })
  }

  agregarCapaHalo()
  agregarCapaPuntos()
  registrarEventosMapa()

  actualizarDatosMapa()
  emit('mapaListo', mapa.value)
}

function agregarCapaHalo() {
  if (mapa.value.getLayer('capitulos-halo')) {
    return
  }

  mapa.value.addLayer({
    id: 'capitulos-halo',
    type: 'circle',
    source: 'capitulos',
    paint: {
      'circle-radius': ['case', ['boolean', ['get', 'activo'], false], 25, 16],
      'circle-color': ['get', 'color'],
      'circle-opacity': ['case', ['boolean', ['get', 'activo'], false], 0.22, 0.11],
    },
  })
}

function agregarCapaPuntos() {
  if (mapa.value.getLayer('capitulos-punto')) {
    return
  }

  mapa.value.addLayer({
    id: 'capitulos-punto',
    type: 'circle',
    source: 'capitulos',
    paint: {
      'circle-radius': ['case', ['boolean', ['get', 'activo'], false], 9, 7],
      'circle-color': ['get', 'color'],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 3,
    },
  })
}

function registrarEventosMapa() {
  mapa.value.on('click', 'capitulos-punto', manejarClickPunto)

  mapa.value.on('mouseenter', 'capitulos-punto', () => {
    if (mapa.value) {
      mapa.value.getCanvas().style.cursor = 'pointer'
    }
  })

  mapa.value.on('mouseleave', 'capitulos-punto', () => {
    if (mapa.value) {
      mapa.value.getCanvas().style.cursor = ''
    }
  })
}

function manejarClickPunto(evento) {
  const feature = evento?.features?.[0]

  if (!feature?.properties?.id) {
    return
  }

  const capituloId = String(feature.properties.id)
  const capitulo = capitulosNormalizados.value.find((item) => item.id === capituloId)

  if (!capitulo) {
    return
  }

  definirCapituloActivo(capitulo.id)

  emit('clickCapitulo', capitulo)
}

function definirCapituloActivo(capituloId) {
  capituloActivoIdLocal.value = String(capituloId)
  emit('update:capituloActivoId', String(capituloId))
}

function moverMapaACapitulo(capitulo) {
  if (!mapa.value || !mapaCargado.value || !capitulo?.coordenadas) {
    return
  }

  mapa.value.flyTo({
    center: capitulo.coordenadas,
    zoom: capitulo.zoom,
    pitch: capitulo.pitch,
    bearing: capitulo.bearing,
    duration: props.duracionVuelo,
    essential: true,
  })
}

function actualizarDatosMapa() {
  const source = mapa.value?.getSource('capitulos')

  if (!source) {
    return
  }

  source.setData(geojsonCapitulos.value)
}

function prepararResize() {
  if (!contenedorMapa.value || !('ResizeObserver' in window)) {
    window.addEventListener('resize', redimensionarMapa)
    return
  }

  observadorResize = new ResizeObserver(() => {
    redimensionarMapa()
  })

  observadorResize.observe(contenedorMapa.value)
}

function redimensionarMapa() {
  requestAnimationFrame(() => {
    mapa.value?.resize()
  })
}

function manejarErrorMapa(error) {
  console.error('Error interno de MapLibre:', error)
  manejarError(new Error('El mapa encontró un problema al cargar la capa base.'))
}

function manejarError(error) {
  console.error('Error en MapaNarrativo:', error)
  mensajeError.value = error?.message || 'No fue posible cargar el mapa narrativo.'
  emit('error', error)
}

function destruirMapa() {
  if (observadorResize) {
    observadorResize.disconnect()
    observadorResize = null
  }

  window.removeEventListener('resize', redimensionarMapa)

  if (mapa.value) {
    mapa.value.remove()
    mapa.value = null
  }

  mapaCargado.value = false
}

function crearCapituloVacio() {
  return {
    id: 'sin-capitulo',
    etiqueta: 'Sin capítulo',
    titulo: 'Sin capítulo activo',
    descripcion: 'No hay información disponible.',
    descripcionCorta: 'No hay información disponible.',
    coordenadas: props.centroDefault,
    zoom: props.zoomDefault,
    pitch: props.pitchDefault,
    bearing: props.bearingDefault,
    color: '#9f2241',
  }
}

function normalizarCoordenadas(valor) {
  if (!Array.isArray(valor) || valor.length < 2) {
    return props.centroDefault
  }

  const longitud = Number(valor[0])
  const latitud = Number(valor[1])

  if (!Number.isFinite(longitud) || !Number.isFinite(latitud)) {
    return props.centroDefault
  }

  return [longitud, latitud]
}

function normalizarNumero(valor, valorDefault) {
  const numero = Number(valor)

  if (!Number.isFinite(numero)) {
    return valorDefault
  }

  return numero
}

function normalizarMedida(valor) {
  if (typeof valor === 'number') {
    return `${valor}px`
  }

  return String(valor || '560px')
}

function limpiarTexto(valor, valorDefault = '') {
  const texto = String(valor || '').trim()

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

function resize() {
  redimensionarMapa()
}

function obtenerInstanciaMapa() {
  return mapa.value
}

defineExpose({
  resize,
  obtenerInstanciaMapa,
})
</script>

<style scoped>
.mapaNarrativo {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  border: 1px solid rgba(159, 34, 65, 0.12);
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 24px 60px rgba(31, 41, 55, 0.08);
  overflow: hidden;
}

.mapaNarrativo__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1rem 0.85rem;
}

.mapaNarrativo__header p {
  margin: 0;
  color: #9ca3af;
  font-size: 0.66rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.mapaNarrativo__header h2 {
  margin: 0.25rem 0 0;
  color: #1f2937;
  font-size: 1.05rem;
  font-weight: 950;
  letter-spacing: -0.025em;
}

.mapaNarrativo__wrapper {
  position: relative;
  min-height: var(--mapa-narrativo-altura);
  flex: 1;
  overflow: hidden;
}

.mapaNarrativo__mapa,
.mapaNarrativo__skeleton,
.mapaNarrativo__error {
  position: absolute;
  inset: 0;
}

.mapaNarrativo__mapa {
  width: 100%;
  height: 100%;
}

.mapaNarrativo__mapa--oculto {
  opacity: 0;
  pointer-events: none;
}

.mapaNarrativo__panelDato {
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  max-width: min(360px, calc(100% - 2rem));
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 1.1rem;
  background: rgba(31, 41, 55, 0.78);
  color: #ffffff;
  backdrop-filter: blur(14px);
  padding: 0.9rem 1rem;
  pointer-events: none;
}

.mapaNarrativo__panelDato span {
  display: block;
  color: rgba(255, 255, 255, 0.66);
  font-size: 0.66rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.mapaNarrativo__panelDato strong {
  display: block;
  margin-top: 0.18rem;
  font-size: 1rem;
  font-weight: 950;
}

.mapaNarrativo__panelDato p {
  margin: 0.4rem 0 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.45;
}

.mapaNarrativo__footer {
  border-top: 1px solid rgba(17, 24, 39, 0.08);
  padding: 0.75rem 1rem;
}

.mapaNarrativo__footer p {
  margin: 0;
  color: #6b7280;
  font-size: 0.76rem;
  font-weight: 600;
  line-height: 1.45;
}

:deep(.maplibregl-ctrl-group) {
  border: 1px solid rgba(159, 34, 65, 0.12);
  border-radius: 0.85rem;
  overflow: hidden;
  box-shadow: 0 14px 30px rgba(31, 41, 55, 0.12);
}

:deep(.maplibregl-ctrl-group button) {
  width: 2.2rem;
  height: 2.2rem;
}

:deep(.maplibregl-ctrl-attrib) {
  color: #6b7280;
  font-size: 0.68rem;
}

@media (max-width: 640px) {
  .mapaNarrativo__header {
    flex-direction: column;
  }

  .mapaNarrativo__wrapper {
    min-height: 460px;
  }
}
</style>
