<!-- src/views/VistaMapaNarrativo.vue -->

<template>
  <section class="vistaMapaNarrativo">
    <header class="vistaMapaNarrativo__hero">
      <div class="vistaMapaNarrativo__heroFondo" aria-hidden="true"></div>

      <div class="vistaMapaNarrativo__heroContenido">
        <BaseButton variante="volver" color="#9f2241" @click="volverPanorama">
          Volver al panorama
        </BaseButton>

        <div class="vistaMapaNarrativo__heroTexto">
          <BaseBadge texto="Mapa narrativo" color="#b79a5b" variante="solida" />

          <h1 class="vistaMapaNarrativo__titulo">Recorrido territorial de proyectos</h1>

          <p class="vistaMapaNarrativo__subtitulo">
            Vista experimental para contar avances por capítulos, mover el mapa de forma guiada y
            destacar puntos relevantes sin usar ventanas HTML inyectadas ni llaves sensibles en el
            cliente.
          </p>
        </div>
      </div>
    </header>

    <main class="vistaMapaNarrativo__contenido">
      <aside class="vistaMapaNarrativo__narrativa">
        <article
          v-for="capitulo in capitulos"
          :key="capitulo.id"
          :ref="(elemento) => registrarReferenciaCapitulo(capitulo.id, elemento)"
          class="vistaMapaNarrativo__capitulo"
          :class="{ 'vistaMapaNarrativo__capitulo--activo': capitulo.id === capituloActivoId }"
        >
          <BaseBadge :texto="capitulo.etiqueta" :color="capitulo.color" variante="lineal" />

          <h2>{{ capitulo.titulo }}</h2>

          <p>{{ capitulo.descripcion }}</p>

          <div class="vistaMapaNarrativo__metricas">
            <div
              v-for="metrica in capitulo.metricas"
              :key="metrica.etiqueta"
              class="vistaMapaNarrativo__metrica"
            >
              <span>{{ metrica.etiqueta }}</span>
              <strong>{{ metrica.valor }}</strong>
            </div>
          </div>

          <BaseButton
            variante="ghost"
            :color="capitulo.color"
            tamanio="chico"
            @click="activarCapitulo(capitulo.id, false)"
          >
            Ver en mapa
          </BaseButton>
        </article>
      </aside>

      <MapaNarrativo
        v-model:capitulo-activo-id="capituloActivoId"
        :capitulos="capitulos"
        altura="560px"
        class="vistaMapaNarrativo__mapaPanel"
        @click-capitulo="manejarClickCapituloMapa"
      />
    </main>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import MapaNarrativo from '../components/mapas/MapaNarrativo.vue'

const router = useRouter()

const capituloActivoId = ref('centro-historico')

const referenciasCapitulos = new Map()

let observadorCapitulos = null

const capitulos = Object.freeze([
  {
    id: 'centro-historico',
    etiqueta: 'Centro',
    titulo: 'Centro Histórico',
    descripcion:
      'Concentración de proyectos de alto tránsito, recuperación de espacios públicos y mejora de servicios urbanos.',
    descripcionCorta: 'Proyectos urbanos y espacios públicos en zona central.',
    coordenadas: [-99.1332, 19.4326],
    zoom: 13.2,
    pitch: 42,
    bearing: -12,
    color: '#9f2241',
    metricas: [
      { etiqueta: 'Programas', valor: '12' },
      { etiqueta: 'Avance', valor: '78%' },
      { etiqueta: 'Prioridad', valor: 'Alta' },
    ],
  },
  {
    id: 'iztapalapa',
    etiqueta: 'Oriente',
    titulo: 'Iztapalapa',
    descripcion:
      'Zona con proyectos sociales, infraestructura comunitaria y acciones territoriales con alta cobertura poblacional.',
    descripcionCorta: 'Cobertura social e infraestructura comunitaria.',
    coordenadas: [-99.092, 19.3574],
    zoom: 12.1,
    pitch: 38,
    bearing: 8,
    color: '#b79a5b',
    metricas: [
      { etiqueta: 'Programas', valor: '18' },
      { etiqueta: 'Avance', valor: '64%' },
      { etiqueta: 'Prioridad', valor: 'Media' },
    ],
  },
  {
    id: 'coyoacan',
    etiqueta: 'Sur',
    titulo: 'Coyoacán',
    descripcion:
      'Seguimiento a proyectos de cultura, movilidad barrial, servicios urbanos y atención territorial.',
    descripcionCorta: 'Cultura, movilidad barrial y servicios urbanos.',
    coordenadas: [-99.1617, 19.3467],
    zoom: 12.7,
    pitch: 36,
    bearing: -8,
    color: '#0d9488',
    metricas: [
      { etiqueta: 'Programas', valor: '9' },
      { etiqueta: 'Avance', valor: '83%' },
      { etiqueta: 'Prioridad', valor: 'Media' },
    ],
  },
  {
    id: 'xochimilco',
    etiqueta: 'Suelo de conservación',
    titulo: 'Xochimilco',
    descripcion:
      'Capítulo orientado a proyectos ambientales, conservación, servicios territoriales y atención a comunidades.',
    descripcionCorta: 'Conservación, ambiente y servicios territoriales.',
    coordenadas: [-99.1058, 19.2572],
    zoom: 11.8,
    pitch: 32,
    bearing: 14,
    color: '#6b8e4e',
    metricas: [
      { etiqueta: 'Programas', valor: '7' },
      { etiqueta: 'Avance', valor: '58%' },
      { etiqueta: 'Prioridad', valor: 'Alta' },
    ],
  },
])

onMounted(() => {
  prepararObservadorCapitulos()
})

onBeforeUnmount(() => {
  destruirObservadorCapitulos()
})

function registrarReferenciaCapitulo(id, elemento) {
  if (!elemento) {
    referenciasCapitulos.delete(id)
    return
  }

  referenciasCapitulos.set(id, elemento)
}

function prepararObservadorCapitulos() {
  destruirObservadorCapitulos()

  observadorCapitulos = new IntersectionObserver(
    (entradas) => {
      const entradaVisible = entradas
        .filter((entrada) => entrada.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

      if (!entradaVisible) {
        return
      }

      const idCapitulo = entradaVisible.target.dataset.capituloId

      if (idCapitulo) {
        activarCapitulo(idCapitulo, false)
      }
    },
    {
      root: null,
      threshold: [0.35, 0.55, 0.75],
      rootMargin: '-20% 0px -35% 0px',
    },
  )

  requestAnimationFrame(() => {
    referenciasCapitulos.forEach((elemento, id) => {
      elemento.dataset.capituloId = id
      observadorCapitulos.observe(elemento)
    })
  })
}

function activarCapitulo(idCapitulo, moverScroll = false) {
  const existeCapitulo = capitulos.some((capitulo) => {
    return capitulo.id === idCapitulo
  })

  if (!existeCapitulo) {
    return
  }

  capituloActivoId.value = idCapitulo

  if (moverScroll) {
    moverScrollACapitulo(idCapitulo)
  }
}

function manejarClickCapituloMapa(capitulo) {
  if (!capitulo?.id) {
    return
  }

  moverScrollACapitulo(capitulo.id)
}

function moverScrollACapitulo(idCapitulo) {
  referenciasCapitulos.get(idCapitulo)?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  })
}

function destruirObservadorCapitulos() {
  if (observadorCapitulos) {
    observadorCapitulos.disconnect()
    observadorCapitulos = null
  }
}

function volverPanorama() {
  router.push({
    name: 'panorama',
  })
}
</script>

<style scoped>
.vistaMapaNarrativo {
  min-height: 100%;
  background: #f8f7f4;
}

.vistaMapaNarrativo__hero {
  position: relative;
  overflow: hidden;
  color: #ffffff;
  background: linear-gradient(135deg, #5f1730, #9f2241 56%, #b35b72);
  isolation: isolate;
}

.vistaMapaNarrativo__heroFondo {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(circle at 16% 16%, rgba(255, 255, 255, 0.16), transparent 18rem),
    radial-gradient(circle at 82% 10%, rgba(183, 154, 91, 0.24), transparent 20rem),
    linear-gradient(180deg, transparent, rgba(48, 11, 28, 0.28));
}

.vistaMapaNarrativo__heroContenido {
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  max-width: 1440px;
  margin: 0 auto;
  padding: clamp(1.25rem, 3vw, 2.5rem);
}

.vistaMapaNarrativo__heroTexto {
  max-width: 880px;
}

.vistaMapaNarrativo__titulo {
  margin: 0.9rem 0 0;
  font-size: clamp(2.1rem, 5vw, 4.1rem);
  font-weight: 950;
  letter-spacing: -0.06em;
  line-height: 0.96;
}

.vistaMapaNarrativo__subtitulo {
  max-width: 760px;
  margin: 1rem 0 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.55;
}

.vistaMapaNarrativo__contenido {
  display: grid;
  grid-template-columns: minmax(320px, 440px) minmax(0, 1fr);
  gap: clamp(1rem, 2vw, 1.35rem);
  max-width: 1440px;
  margin: 0 auto;
  padding: clamp(1.15rem, 3vw, 2.5rem);
}

.vistaMapaNarrativo__narrativa {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vistaMapaNarrativo__capitulo {
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

.vistaMapaNarrativo__capitulo--activo {
  opacity: 1;
  transform: translateY(-2px);
  border-color: rgba(159, 34, 65, 0.24);
  box-shadow: 0 24px 56px rgba(31, 41, 55, 0.08);
}

.vistaMapaNarrativo__capitulo h2 {
  margin: 0.8rem 0 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 950;
  letter-spacing: -0.035em;
}

.vistaMapaNarrativo__capitulo p {
  margin: 0.6rem 0 0;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.55;
}

.vistaMapaNarrativo__metricas {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.55rem;
  margin: 0.9rem 0;
}

.vistaMapaNarrativo__metrica {
  border-radius: 0.85rem;
  background: #f9fafb;
  padding: 0.58rem;
}

.vistaMapaNarrativo__metrica span {
  display: block;
  color: #9ca3af;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.vistaMapaNarrativo__metrica strong {
  display: block;
  margin-top: 0.18rem;
  color: #1f2937;
  font-size: 0.84rem;
  font-weight: 950;
}

.vistaMapaNarrativo__mapaPanel {
  position: sticky;
  top: 1rem;
  align-self: start;
  min-height: calc(100vh - 2rem);
}

@media (max-width: 1080px) {
  .vistaMapaNarrativo__contenido {
    grid-template-columns: 1fr;
  }

  .vistaMapaNarrativo__mapaPanel {
    position: relative;
    top: 0;
    min-height: 640px;
  }
}

@media (max-width: 640px) {
  .vistaMapaNarrativo__heroContenido,
  .vistaMapaNarrativo__contenido {
    padding: 1.1rem;
  }

  .vistaMapaNarrativo__metricas {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .vistaMapaNarrativo__capitulo {
    transition: none;
  }
}
</style>
