<!-- src/components/graficas/ChartCard.vue -->

<template>
  <BaseCard
    class="chartCard"
    :class="clasesChartCard"
    variante="default"
    padding="none"
    radio="grande"
    :color="colorNormalizado"
    :hover="hover"
  >
    <div class="chartCard__contenedor">
      <div v-if="mostrarBarraSuperior" class="chartCard__barraSuperior">
        <div v-if="$slots.selector" class="chartCard__selector">
          <slot name="selector"></slot>
        </div>

        <div v-if="$slots.acciones" class="chartCard__acciones">
          <slot name="acciones"></slot>
        </div>
      </div>

      <div class="chartCard__contenido">
        <section class="chartCard__panelInfo">
          <div class="chartCard__encabezadoInfo">
            <div v-if="mostrarIcono" class="chartCard__marca">
              <div class="chartCard__icono">
                <component
                  :is="iconoVisible"
                  :size="tamanoIcono"
                  stroke-width="2.2"
                  aria-hidden="true"
                />
              </div>

              <span
                v-if="mostrarLineaMarca"
                class="chartCard__lineaMarca"
                aria-hidden="true"
              ></span>
            </div>

            <div class="chartCard__bloqueTitulo">
              <div v-if="tieneValorPrincipal" class="chartCard__resumenSuperior">
                <p class="chartCard__valorPrincipal">
                  {{ valorPrincipalVisible }}
                </p>

                <div class="chartCard__textosTitulo">
                  <h3 class="chartCard__titulo">
                    {{ titulo }}
                  </h3>

                  <p v-if="descripcionCorta" class="chartCard__descripcionCorta">
                    {{ descripcionCorta }}
                  </p>
                </div>
              </div>

              <template v-else>
                <h3 class="chartCard__titulo">
                  {{ titulo }}
                </h3>

                <p v-if="descripcionCorta" class="chartCard__descripcionCorta">
                  {{ descripcionCorta }}
                </p>
              </template>
            </div>
          </div>

          <p v-if="descripcionAmplia" class="chartCard__descripcionAmplia">
            {{ descripcionAmplia }}
          </p>

          <div v-if="$slots.resumenExtra" class="chartCard__resumenExtra">
            <slot name="resumenExtra"></slot>
          </div>
        </section>

        <section class="chartCard__panelGrafica" :aria-label="ariaLabelGrafica">
          <BaseSkeleton
            v-if="cargando"
            tipo="lineas"
            :filas="4"
            :color="colorNormalizado"
            class="chartCard__skeleton"
          />

          <BaseEmptyState
            v-else-if="vacio"
            :titulo="tituloVacio"
            :mensaje="mensajeVacio"
            tipo="graficas"
            variante="simple"
            :color="colorNormalizado"
            class="chartCard__empty"
          />

          <div v-else class="chartCard__graficaSlot">
            <slot name="chart">
              <BaseEmptyState
                titulo="No se ha definido una gráfica"
                mensaje="Conecta este contenedor a un componente ECharts usando el slot chart."
                tipo="graficas"
                variante="simple"
                :color="colorNormalizado"
              />
            </slot>
          </div>
        </section>
      </div>

      <footer v-if="mostrarFooter" class="chartCard__footer">
        <div class="chartCard__meta">
          <p v-if="fuenteVisible" class="chartCard__fuente">
            <span>Fuente:</span> {{ fuenteVisible }}
          </p>

          <p v-if="fechaCorteVisible" class="chartCard__fecha">
            <span>Fecha de corte:</span> {{ fechaCorteVisible }}
          </p>

          <p v-if="nota" class="chartCard__nota">
            {{ nota }}
          </p>
        </div>

        <div v-if="$slots.footerExtra" class="chartCard__footerExtra">
          <slot name="footerExtra"></slot>
        </div>
      </footer>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed, useSlots } from 'vue'
import { ChartNoAxesCombined } from 'lucide-vue-next'

import BaseCard from '../ui/BaseCard.vue'
import BaseEmptyState from '../ui/BaseEmptyState.vue'
import BaseSkeleton from '../ui/BaseSkeleton.vue'

const props = defineProps({
  titulo: {
    type: String,
    required: true,
  },
  descripcionCorta: {
    type: String,
    default: '',
  },
  descripcionAmplia: {
    type: String,
    default: '',
  },
  valorPrincipal: {
    type: [String, Number],
    default: '',
  },
  unidad: {
    type: String,
    default: '',
  },
  fuente: {
    type: String,
    default: '',
  },
  fechaCorte: {
    type: [String, Date],
    default: '',
  },
  nota: {
    type: String,
    default: '',
  },
  icono: {
    type: [Object, Function, String],
    default: null,
  },
  color: {
    type: String,
    default: '#9b8d4b',
  },
  vacio: {
    type: Boolean,
    default: false,
  },
  cargando: {
    type: Boolean,
    default: false,
  },
  tituloVacio: {
    type: String,
    default: 'No hay datos disponibles',
  },
  mensajeVacio: {
    type: String,
    default: 'La gráfica no cuenta con información suficiente para mostrarse.',
  },
  disposicion: {
    type: String,
    default: 'horizontal',
    validator: (valor) => {
      return ['horizontal', 'vertical'].includes(valor)
    },
  },
  tamano: {
    type: String,
    default: 'normal',
    validator: (valor) => {
      return ['normal', 'compacto', 'destacado'].includes(valor)
    },
  },
  hover: {
    type: Boolean,
    default: true,
  },
  mostrarIcono: {
    type: Boolean,
    default: true,
  },
  mostrarLineaMarca: {
    type: Boolean,
    default: true,
  },
  mostrarBarraSuperior: {
    type: Boolean,
    default: true,
  },
  tamanoIcono: {
    type: Number,
    default: 24,
  },
  ariaLabelGrafica: {
    type: String,
    default: 'Gráfica estadística',
  },
})

const slots = useSlots()

const iconoVisible = computed(() => {
  return props.icono || ChartNoAxesCombined
})

const colorNormalizado = computed(() => {
  return validarColor(props.color)
})

const tieneValorPrincipal = computed(() => {
  return String(props.valorPrincipal ?? '').trim() !== ''
})

const valorPrincipalVisible = computed(() => {
  const valor = String(props.valorPrincipal ?? '').trim()
  const unidad = String(props.unidad ?? '').trim()

  if (!valor) {
    return ''
  }

  return unidad ? `${valor}${unidad}` : valor
})

const fuenteVisible = computed(() => {
  return limpiarTexto(props.fuente)
})

const fechaCorteVisible = computed(() => {
  if (!props.fechaCorte) {
    return ''
  }

  if (props.fechaCorte instanceof Date) {
    if (Number.isNaN(props.fechaCorte.getTime())) {
      return ''
    }

    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(props.fechaCorte)
  }

  const texto = limpiarTexto(props.fechaCorte)

  if (!texto) {
    return ''
  }

  const fecha = new Date(texto)

  if (Number.isNaN(fecha.getTime())) {
    return texto
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(fecha)
})

const mostrarFooter = computed(() => {
  return Boolean(
    fuenteVisible.value || fechaCorteVisible.value || limpiarTexto(props.nota) || slots.footerExtra,
  )
})

const clasesChartCard = computed(() => {
  return {
    [`chartCard--${props.disposicion}`]: true,
    [`chartCard--${props.tamano}`]: true,
  }
})

function limpiarTexto(valor) {
  if (valor === null || valor === undefined) {
    return ''
  }

  const texto = String(valor).trim()

  if (!texto || texto.toUpperCase() === 'NA' || texto.toUpperCase() === 'NULL') {
    return ''
  }

  return texto
}

function validarColor(valor) {
  if (/^#[0-9a-fA-F]{6}$/.test(valor || '')) {
    return valor
  }

  return '#9b8d4b'
}
</script>

<style scoped>
.chartCard {
  --chart-card-color: v-bind(colorNormalizado);
}

.chartCard__contenedor {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 1.15rem 1.2rem 1rem;
}

.chartCard__barraSuperior {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.9rem;
  margin-bottom: 0.7rem;
}

.chartCard__selector,
.chartCard__acciones {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}

.chartCard__contenido {
  display: grid;
  gap: 1.15rem;
}

.chartCard--horizontal .chartCard__contenido {
  grid-template-columns: minmax(280px, 1.02fr) minmax(300px, 1fr);
  align-items: stretch;
}

.chartCard--vertical .chartCard__contenido {
  grid-template-columns: 1fr;
}

.chartCard__panelInfo {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-width: 0;
}

.chartCard__encabezadoInfo {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  min-width: 0;
}

.chartCard__marca {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  flex: 0 0 auto;
}

.chartCard__icono {
  display: grid;
  place-items: center;
  width: 2.3rem;
  height: 2.3rem;
  border-radius: 0.45rem;
  background: color-mix(in srgb, var(--chart-card-color) 12%, #ffffff);
  color: var(--chart-card-color);
}

.chartCard__lineaMarca {
  width: 0.16rem;
  height: 2.35rem;
  border-radius: 999px;
  background: var(--chart-card-color);
  opacity: 0.9;
}

.chartCard__bloqueTitulo {
  min-width: 0;
}

.chartCard__resumenSuperior {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.chartCard__valorPrincipal {
  margin: 0;
  color: var(--chart-card-color);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 950;
  letter-spacing: -0.06em;
  line-height: 0.92;
}

.chartCard__textosTitulo {
  min-width: 0;
}

.chartCard__titulo {
  margin: 0;
  color: var(--chart-card-color);
  font-size: clamp(1.05rem, 2vw, 1.65rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.08;
  text-wrap: balance;
}

.chartCard__descripcionCorta {
  margin: 0.12rem 0 0;
  color: color-mix(in srgb, var(--chart-card-color) 85%, #6b7280);
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.35;
}

.chartCard__descripcionAmplia {
  max-width: 58ch;
  margin: 1rem 0 0;
  color: color-mix(in srgb, var(--chart-card-color) 84%, #4b5563);
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.42;
}

.chartCard__resumenExtra {
  margin-top: 0.9rem;
}

.chartCard__panelGrafica {
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  min-width: 0;
  min-height: 220px;
}

.chartCard__graficaSlot,
.chartCard__skeleton,
.chartCard__empty {
  width: 100%;
  min-height: 100%;
}

.chartCard__graficaSlot {
  display: flex;
  align-items: stretch;
}

.chartCard__footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.95rem;
  padding-top: 0.8rem;
}

.chartCard__meta {
  display: flex;
  flex-direction: column;
  gap: 0.14rem;
  min-width: 0;
}

.chartCard__fuente,
.chartCard__fecha,
.chartCard__nota {
  margin: 0;
  color: #7b8190;
  font-size: 0.78rem;
  font-weight: 500;
  line-height: 1.28;
}

.chartCard__fuente span,
.chartCard__fecha span {
  color: color-mix(in srgb, var(--chart-card-color) 80%, #6b7280);
  font-weight: 700;
}

.chartCard__footerExtra {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex: 0 0 auto;
}

/* tamaños */
.chartCard--compacto .chartCard__contenedor {
  padding: 0.95rem 1rem 0.9rem;
}

.chartCard--compacto .chartCard__panelGrafica {
  min-height: 170px;
}

.chartCard--compacto .chartCard__valorPrincipal {
  font-size: clamp(1.8rem, 3vw, 2.4rem);
}

.chartCard--compacto .chartCard__titulo {
  font-size: 1.18rem;
}

.chartCard--compacto .chartCard__descripcionAmplia {
  font-size: 0.86rem;
}

.chartCard--destacado .chartCard__contenedor {
  padding: 1.35rem 1.4rem 1.1rem;
}

.chartCard--destacado .chartCard__panelGrafica {
  min-height: 260px;
}

.chartCard--destacado .chartCard__valorPrincipal {
  font-size: clamp(2.4rem, 4.8vw, 3.7rem);
}

.chartCard--destacado .chartCard__titulo {
  font-size: clamp(1.2rem, 2.3vw, 2rem);
}

@media (max-width: 980px) {
  .chartCard--horizontal .chartCard__contenido {
    grid-template-columns: 1fr;
  }

  .chartCard__panelGrafica {
    min-height: 210px;
  }
}

@media (max-width: 640px) {
  .chartCard__contenedor {
    padding: 1rem;
  }

  .chartCard__barraSuperior,
  .chartCard__footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .chartCard__encabezadoInfo {
    gap: 0.75rem;
  }

  .chartCard__resumenSuperior {
    flex-direction: column;
    gap: 0.35rem;
  }

  .chartCard__valorPrincipal {
    font-size: 2rem;
  }

  .chartCard__panelGrafica {
    min-height: 190px;
  }
}
</style>
