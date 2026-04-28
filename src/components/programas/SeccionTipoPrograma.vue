<!-- src/components/programas/SeccionTipoPrograma.vue -->

<template>
  <section class="seccionTipoPrograma" :style="estilosSeccion">
    <div v-if="gruposPrograma.length > 0" class="seccionTipoPrograma__grupos">
      <article v-for="grupo in gruposPrograma" :key="grupo.tipo" class="seccionTipoPrograma__grupo">
        <header class="seccionTipoPrograma__header">
          <div class="seccionTipoPrograma__tituloBloque">
            <span class="seccionTipoPrograma__barra" aria-hidden="true"></span>

            <div>
              <p class="seccionTipoPrograma__etiqueta">Tipo de programa</p>

              <h2 class="seccionTipoPrograma__titulo">
                {{ grupo.tipo }}
              </h2>
            </div>
          </div>

          <div class="seccionTipoPrograma__contador">
            <Layers3 :size="17" stroke-width="2.3" aria-hidden="true" />
            <span>
              {{ grupo.programas.length }}
              {{ grupo.programas.length === 1 ? 'programa' : 'programas' }}
            </span>
          </div>
        </header>

        <div class="seccionTipoPrograma__grid">
          <slot
            v-for="programa in grupo.programas"
            :key="programa.id"
            name="programa"
            :programa="programa"
            :tipo="grupo.tipo"
          >
            <article class="seccionTipoPrograma__programa">
              <div class="seccionTipoPrograma__programaSuperior">
                <h3>
                  {{ programa.nombre }}
                </h3>

                <span class="seccionTipoPrograma__estado">
                  {{ programa.estado || 'Sin estado' }}
                </span>
              </div>

              <p v-if="programa.descripcion" class="seccionTipoPrograma__descripcion">
                {{ limitarTexto(programa.descripcion, 210) }}
              </p>

              <div class="seccionTipoPrograma__datos">
                <div class="seccionTipoPrograma__dato">
                  <WalletCards :size="16" stroke-width="2.2" />
                  <span>Presupuesto</span>
                  <strong>{{ formatearPesos(programa.presupuestoAsignado) }}</strong>
                </div>

                <div class="seccionTipoPrograma__dato">
                  <UsersRound :size="16" stroke-width="2.2" />
                  <span>Beneficiarios</span>
                  <strong>{{ formatearEntero(programa.beneficiariosActuales) }}</strong>
                </div>

                <div class="seccionTipoPrograma__dato">
                  <Activity :size="16" stroke-width="2.2" />
                  <span>Avance</span>
                  <strong>{{ formatearPorcentaje(programa.avance) }}</strong>
                </div>

                <div class="seccionTipoPrograma__dato">
                  <MapPin :size="16" stroke-width="2.2" />
                  <span>Alcaldía</span>
                  <strong>{{ programa.alcaldia || 'Por capturar' }}</strong>
                </div>
              </div>

              <p v-if="programa.observaciones" class="seccionTipoPrograma__observaciones">
                {{ programa.observaciones }}
              </p>
            </article>
          </slot>
        </div>
      </article>
    </div>

    <div v-else class="seccionTipoPrograma__vacio" role="status">
      <div class="seccionTipoPrograma__vacioIcono" aria-hidden="true">
        <FileWarning :size="24" stroke-width="2.2" />
      </div>

      <p class="seccionTipoPrograma__vacioTitulo">No hay programas registrados</p>

      <p class="seccionTipoPrograma__vacioTexto">
        {{ mensajeVacio }}
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { Activity, FileWarning, Layers3, MapPin, UsersRound, WalletCards } from 'lucide-vue-next'

const props = defineProps({
  programas: {
    type: Array,
    default: () => [],
  },
  color: {
    type: String,
    default: '#9f2241',
  },
  ordenarTipos: {
    type: Boolean,
    default: true,
  },
  ordenarProgramas: {
    type: Boolean,
    default: false,
  },
  mensajeVacio: {
    type: String,
    default: 'Esta secretaría todavía no tiene programas disponibles para mostrar.',
  },
})

const gruposPrograma = computed(() => {
  const grupos = props.programas
    .filter((programa) => programa && typeof programa === 'object')
    .reduce((acumulado, programa) => {
      const tipo = normalizarTipo(programa.tipo)

      if (!acumulado[tipo]) {
        acumulado[tipo] = []
      }

      acumulado[tipo].push(programa)
      return acumulado
    }, {})

  let gruposComoLista = Object.keys(grupos).map((tipo) => {
    return {
      tipo,
      programas: ordenarProgramas(grupos[tipo]),
    }
  })

  if (props.ordenarTipos) {
    gruposComoLista = gruposComoLista.sort((grupoA, grupoB) => {
      return grupoA.tipo.localeCompare(grupoB.tipo, 'es')
    })
  }

  return gruposComoLista
})

const estilosSeccion = computed(() => {
  return {
    '--seccion-tipo-color': validarColor(props.color),
  }
})

function ordenarProgramas(programas) {
  if (!props.ordenarProgramas) {
    return programas
  }

  return [...programas].sort((programaA, programaB) => {
    return String(programaA.nombre || '').localeCompare(String(programaB.nombre || ''), 'es')
  })
}

function normalizarTipo(tipo) {
  const texto = String(tipo || '').trim()

  if (!texto || texto.toUpperCase() === 'NA' || texto.toUpperCase() === 'NULL') {
    return 'General'
  }

  return texto
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
    return 'Por capturar'
  }

  return new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: 0,
  }).format(numero)
}

function formatearPesos(valor) {
  const numero = Number(valor)

  if (!Number.isFinite(numero) || numero <= 0) {
    return 'Por capturar'
  }

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(numero)
}

function formatearPorcentaje(valor) {
  const numero = Number(valor)

  if (!Number.isFinite(numero)) {
    return 'Pendiente'
  }

  return `${new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: 1,
  }).format(numero)}%`
}

function validarColor(valor) {
  if (/^#[0-9a-fA-F]{6}$/.test(valor || '')) {
    return valor
  }

  return '#9f2241'
}
</script>

<style scoped>
.seccionTipoPrograma {
  width: 100%;
}

.seccionTipoPrograma__grupos {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.seccionTipoPrograma__grupo {
  border: 1px solid rgba(159, 34, 65, 0.1);
  border-radius: 1.35rem;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 18px 45px rgba(31, 41, 55, 0.055);
  backdrop-filter: blur(14px);
  padding: clamp(1rem, 2vw, 1.2rem);
}

.seccionTipoPrograma__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.seccionTipoPrograma__tituloBloque {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  min-width: 0;
}

.seccionTipoPrograma__barra {
  flex: 0 0 auto;
  width: 0.32rem;
  height: 2rem;
  border-radius: 999px;
  background: linear-gradient(
    180deg,
    var(--seccion-tipo-color),
    color-mix(in srgb, var(--seccion-tipo-color) 45%, #ffffff)
  );
}

.seccionTipoPrograma__etiqueta {
  margin: 0 0 0.25rem;
  color: var(--seccion-tipo-color);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.seccionTipoPrograma__titulo {
  margin: 0;
  color: #111827;
  font-size: clamp(1.08rem, 2vw, 1.35rem);
  font-weight: 950;
  letter-spacing: -0.035em;
  line-height: 1.05;
}

.seccionTipoPrograma__contador {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  flex: 0 0 auto;
  border-radius: 999px;
  background: color-mix(in srgb, var(--seccion-tipo-color) 9%, #ffffff);
  color: var(--seccion-tipo-color);
  padding: 0.48rem 0.72rem;
  font-size: 0.76rem;
  font-weight: 900;
}

.seccionTipoPrograma__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.95rem;
}

.seccionTipoPrograma__programa {
  border: 1px solid rgba(229, 231, 235, 0.95);
  border-radius: 1.05rem;
  background: #ffffff;
  padding: 1rem;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.seccionTipoPrograma__programa:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--seccion-tipo-color) 26%, #ffffff);
  box-shadow: 0 18px 40px rgba(31, 41, 55, 0.07);
}

.seccionTipoPrograma__programaSuperior {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.85rem;
}

.seccionTipoPrograma__programaSuperior h3 {
  margin: 0;
  color: #111827;
  font-size: 0.96rem;
  font-weight: 900;
  letter-spacing: -0.015em;
  line-height: 1.3;
}

.seccionTipoPrograma__estado {
  flex: 0 0 auto;
  max-width: 9rem;
  overflow: hidden;
  border-radius: 999px;
  background: color-mix(in srgb, var(--seccion-tipo-color) 9%, #ffffff);
  color: var(--seccion-tipo-color);
  padding: 0.35rem 0.55rem;
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.055em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.seccionTipoPrograma__descripcion {
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

.seccionTipoPrograma__datos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  margin-top: 0.95rem;
}

.seccionTipoPrograma__dato {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  column-gap: 0.45rem;
  row-gap: 0.1rem;
  align-items: center;
  border-radius: 0.85rem;
  background: #f9fafb;
  padding: 0.65rem;
}

.seccionTipoPrograma__dato svg {
  grid-row: span 2;
  color: var(--seccion-tipo-color);
}

.seccionTipoPrograma__dato span {
  overflow: hidden;
  color: #9ca3af;
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.07em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.seccionTipoPrograma__dato strong {
  overflow: hidden;
  color: #111827;
  font-size: 0.78rem;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.seccionTipoPrograma__observaciones {
  margin: 0.85rem 0 0;
  border-top: 1px dashed #e5e7eb;
  padding-top: 0.75rem;
  color: #6b7280;
  font-size: 0.76rem;
  font-style: italic;
  font-weight: 600;
  line-height: 1.45;
}

.seccionTipoPrograma__vacio {
  display: grid;
  place-items: center;
  min-height: 250px;
  border: 1px dashed rgba(159, 34, 65, 0.22);
  border-radius: 1.35rem;
  background:
    radial-gradient(circle at top, rgba(159, 34, 65, 0.06), transparent 15rem),
    rgba(255, 255, 255, 0.72);
  padding: 2rem;
  text-align: center;
}

.seccionTipoPrograma__vacioIcono {
  display: grid;
  place-items: center;
  width: 3.15rem;
  height: 3.15rem;
  margin-bottom: 0.85rem;
  border-radius: 1rem;
  background: rgba(159, 34, 65, 0.09);
  color: #9f2241;
}

.seccionTipoPrograma__vacioTitulo {
  margin: 0;
  color: #111827;
  font-size: 1rem;
  font-weight: 950;
}

.seccionTipoPrograma__vacioTexto {
  max-width: 520px;
  margin: 0.4rem auto 0;
  color: #6b7280;
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.5;
}

@media (max-width: 920px) {
  .seccionTipoPrograma__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .seccionTipoPrograma__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .seccionTipoPrograma__contador {
    align-self: flex-start;
  }

  .seccionTipoPrograma__programaSuperior {
    flex-direction: column;
  }

  .seccionTipoPrograma__datos {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .seccionTipoPrograma__programa {
    transition: none;
  }

  .seccionTipoPrograma__programa:hover {
    transform: none;
  }
}
</style>
