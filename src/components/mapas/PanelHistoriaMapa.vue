<!-- src/components/mapas/PanelHistoriaMapa.vue -->

<template>
  <aside
    class="panelHistoriaMapa"
    :class="clasesPanel"
    :style="estilosPanel"
    aria-label="Historia narrativa del mapa"
  >
    <header v-if="mostrarEncabezado" class="panelHistoriaMapa__encabezado">
      <BaseBadge :texto="etiqueta" :color="color" variante="lineal" />

      <h2>{{ titulo }}</h2>

      <p v-if="subtitulo">
        {{ subtitulo }}
      </p>
    </header>

    <div class="panelHistoriaMapa__lista">
      <article
        v-for="capitulo in capitulosNormalizados"
        :key="capitulo.id"
        :ref="(elemento) => registrarReferenciaCapitulo(capitulo.id, elemento)"
        class="panelHistoriaMapa__capitulo"
        :class="{ 'panelHistoriaMapa__capitulo--activo': capitulo.id === idActivo }"
        :data-capitulo-id="capitulo.id"
        :aria-current="capitulo.id === idActivo ? 'step' : undefined"
      >
        <div class="panelHistoriaMapa__capituloSuperior">
          <BaseBadge :texto="capitulo.etiqueta" :color="capitulo.color" variante="lineal" />

          <span v-if="capitulo.id === idActivo" class="panelHistoriaMapa__indicadorActivo">
            Activo
          </span>
        </div>

        <h3>{{ capitulo.titulo }}</h3>

        <p>{{ capitulo.descripcion }}</p>

        <div v-if="mostrarMetricas && capitulo.metricas.length" class="panelHistoriaMapa__metricas">
          <div
            v-for="metrica in capitulo.metricas"
            :key="`${capitulo.id}-${metrica.etiqueta}`"
            class="panelHistoriaMapa__metrica"
          >
            <span>{{ metrica.etiqueta }}</span>
            <strong>{{ metrica.valor }}</strong>
          </div>
        </div>

        <div class="panelHistoriaMapa__acciones">
          <BaseButton
            v-if="mostrarBotonMapa"
            variante="ghost"
            :color="capitulo.color"
            tamanio="chico"
            @click="manejarClickVerMapa(capitulo)"
          >
            <template #icono>
              <MapPinned :size="16" stroke-width="2.3" />
            </template>

            {{ textoBotonMapa }}
          </BaseButton>

          <slot name="acciones" :capitulo="capitulo" :activo="capitulo.id === idActivo"></slot>
        </div>
      </article>
    </div>
  </aside>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { MapPinned } from 'lucide-vue-next'

import BaseBadge from '../ui/BaseBadge.vue'
import BaseButton from '../ui/BaseButton.vue'

const props = defineProps({
  capitulos: {
    type: Array,
    default: () => [],
  },
  capituloActivoId: {
    type: [String, Number],
    default: '',
  },
  titulo: {
    type: String,
    default: 'Historia territorial',
  },
  subtitulo: {
    type: String,
    default: 'Recorre los capítulos para actualizar el mapa.',
  },
  etiqueta: {
    type: String,
    default: 'Scrollytelling',
  },
  color: {
    type: String,
    default: '#9f2241',
  },
  mostrarEncabezado: {
    type: Boolean,
    default: false,
  },
  mostrarMetricas: {
    type: Boolean,
    default: true,
  },
  mostrarBotonMapa: {
    type: Boolean,
    default: true,
  },
  textoBotonMapa: {
    type: String,
    default: 'Ver en mapa',
  },
  activarPorScroll: {
    type: Boolean,
    default: true,
  },
  compacto: {
    type: Boolean,
    default: false,
  },
  rootMargin: {
    type: String,
    default: '-20% 0px -35% 0px',
  },
})

const emit = defineEmits(['update:capituloActivoId', 'activarCapitulo', 'clickVerMapa'])

const referenciasCapitulos = new Map()
const capituloActivoIdLocal = ref('')

let observadorCapitulos = null
let ignorarScrollTemporal = false
let timeoutIgnorarScroll = null

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
        color: validarColor(capitulo.color),
        metricas: normalizarMetricas(capitulo.metricas),
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

const estilosPanel = computed(() => {
  return {
    '--panel-historia-color': validarColor(props.color),
  }
})

const clasesPanel = computed(() => {
  return {
    'panelHistoriaMapa--compacto': props.compacto,
  }
})

onMounted(async () => {
  await prepararObservadorCapitulos()
})

onBeforeUnmount(() => {
  destruirObservadorCapitulos()
  limpiarTimeoutScroll()
})

watch(
  () => props.capitulos,
  async () => {
    await prepararObservadorCapitulos()
  },
  {
    deep: true,
  },
)

watch(
  () => props.activarPorScroll,
  async () => {
    await prepararObservadorCapitulos()
  },
)

function registrarReferenciaCapitulo(id, elemento) {
  if (!elemento) {
    referenciasCapitulos.delete(id)
    return
  }

  referenciasCapitulos.set(id, elemento)
}

async function prepararObservadorCapitulos() {
  destruirObservadorCapitulos()

  if (!props.activarPorScroll) {
    return
  }

  await nextTick()

  if (!('IntersectionObserver' in window)) {
    return
  }

  observadorCapitulos = new IntersectionObserver(manejarInterseccionCapitulos, {
    root: null,
    threshold: [0.35, 0.55, 0.75],
    rootMargin: props.rootMargin,
  })

  referenciasCapitulos.forEach((elemento, id) => {
    elemento.dataset.capituloId = id
    observadorCapitulos.observe(elemento)
  })
}

function manejarInterseccionCapitulos(entradas) {
  if (ignorarScrollTemporal) {
    return
  }

  const entradaVisible = entradas
    .filter((entrada) => entrada.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

  if (!entradaVisible) {
    return
  }

  const idCapitulo = entradaVisible.target.dataset.capituloId

  if (!idCapitulo || idCapitulo === idActivo.value) {
    return
  }

  activarCapitulo(idCapitulo, 'scroll')
}

function manejarClickVerMapa(capitulo) {
  activarCapitulo(capitulo.id, 'boton')
  emit('clickVerMapa', capitulo)
}

function activarCapitulo(idCapitulo, origen = 'manual') {
  const capitulo = capitulosNormalizados.value.find((item) => {
    return item.id === String(idCapitulo)
  })

  if (!capitulo) {
    return
  }

  capituloActivoIdLocal.value = capitulo.id

  emit('update:capituloActivoId', capitulo.id)
  emit('activarCapitulo', {
    capitulo,
    origen,
  })
}

function scrollACapitulo(idCapitulo) {
  const id = String(idCapitulo || '')
  const elemento = referenciasCapitulos.get(id)

  if (!elemento) {
    return
  }

  activarCapitulo(id, 'scrollExterno')
  bloquearScrollTemporal()

  elemento.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  })
}

function bloquearScrollTemporal() {
  ignorarScrollTemporal = true
  limpiarTimeoutScroll()

  timeoutIgnorarScroll = window.setTimeout(() => {
    ignorarScrollTemporal = false
  }, 900)
}

function limpiarTimeoutScroll() {
  if (timeoutIgnorarScroll) {
    window.clearTimeout(timeoutIgnorarScroll)
    timeoutIgnorarScroll = null
  }
}

function destruirObservadorCapitulos() {
  if (observadorCapitulos) {
    observadorCapitulos.disconnect()
    observadorCapitulos = null
  }
}

function normalizarMetricas(metricas) {
  if (!Array.isArray(metricas)) {
    return []
  }

  return metricas
    .filter((metrica) => metrica && typeof metrica === 'object')
    .map((metrica) => {
      return {
        etiqueta: limpiarTexto(metrica.etiqueta, 'Métrica'),
        valor: limpiarTexto(metrica.valor, 'N/D'),
      }
    })
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

defineExpose({
  scrollACapitulo,
})
</script>

<style scoped>
.panelHistoriaMapa {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.panelHistoriaMapa__encabezado {
  border: 1px solid rgba(159, 34, 65, 0.1);
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 18px 45px rgba(31, 41, 55, 0.045);
  padding: 1rem;
}

.panelHistoriaMapa__encabezado h2 {
  margin: 0.75rem 0 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 950;
  letter-spacing: -0.035em;
  line-height: 1.15;
}

.panelHistoriaMapa__encabezado p {
  margin: 0.45rem 0 0;
  color: #6b7280;
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.5;
}

.panelHistoriaMapa__lista {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panelHistoriaMapa__capitulo {
  border: 1px solid rgba(159, 34, 65, 0.1);
  border-radius: 1.35rem;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 18px 45px rgba(31, 41, 55, 0.05);
  padding: 1.1rem;
  opacity: 0.68;
  transition:
    opacity 180ms ease,
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.panelHistoriaMapa__capitulo--activo {
  opacity: 1;
  transform: translateY(-2px);
  border-color: rgba(159, 34, 65, 0.24);
  box-shadow: 0 24px 56px rgba(31, 41, 55, 0.08);
}

.panelHistoriaMapa__capituloSuperior {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.panelHistoriaMapa__indicadorActivo {
  display: inline-flex;
  border-radius: 999px;
  background: rgba(13, 148, 136, 0.1);
  color: #0d9488;
  padding: 0.3rem 0.55rem;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.panelHistoriaMapa__capitulo h3 {
  margin: 0.8rem 0 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 950;
  letter-spacing: -0.035em;
  line-height: 1.18;
}

.panelHistoriaMapa__capitulo p {
  margin: 0.6rem 0 0;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.55;
}

.panelHistoriaMapa__metricas {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.55rem;
  margin: 0.9rem 0;
}

.panelHistoriaMapa__metrica {
  border-radius: 0.85rem;
  background: #f9fafb;
  padding: 0.58rem;
}

.panelHistoriaMapa__metrica span {
  display: block;
  color: #9ca3af;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.panelHistoriaMapa__metrica strong {
  display: block;
  margin-top: 0.18rem;
  color: #1f2937;
  font-size: 0.84rem;
  font-weight: 950;
}

.panelHistoriaMapa__acciones {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 0.9rem;
}

.panelHistoriaMapa--compacto .panelHistoriaMapa__capitulo {
  border-radius: 1rem;
  padding: 0.9rem;
}

.panelHistoriaMapa--compacto .panelHistoriaMapa__capitulo h3 {
  font-size: 1.05rem;
}

@media (max-width: 640px) {
  .panelHistoriaMapa__metricas {
    grid-template-columns: 1fr;
  }

  .panelHistoriaMapa__capituloSuperior {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .panelHistoriaMapa__capitulo {
    transition: none;
  }

  .panelHistoriaMapa__capitulo--activo {
    transform: none;
  }
}
</style>
