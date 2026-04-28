<!-- src/components/panorama/FiltrosPanorama.vue -->

<template>
  <section class="filtrosPanorama" :class="clasesFiltros" aria-label="Filtros del panorama general">
    <div class="filtrosPanorama__principal">
      <label class="filtrosPanorama__busqueda">
        <span class="filtrosPanorama__label"> Buscar secretaría </span>

        <span class="filtrosPanorama__inputWrapper">
          <Search
            class="filtrosPanorama__inputIcono"
            :size="18"
            stroke-width="2.2"
            aria-hidden="true"
          />

          <input
            :value="filtros.busqueda"
            class="filtrosPanorama__input"
            type="search"
            placeholder="Ej. Bienestar, Movilidad, SSC..."
            autocomplete="off"
            @input="actualizarFiltro('busqueda', $event.target.value)"
          />
        </span>
      </label>

      <button
        class="filtrosPanorama__toggle"
        type="button"
        :aria-expanded="mostrarAvanzados"
        @click="alternarAvanzados"
      >
        <SlidersHorizontal :size="18" stroke-width="2.3" />
        <span>Filtros</span>
      </button>
    </div>

    <Transition name="filtrosPanoramaAvanzados">
      <div v-show="mostrarAvanzados" class="filtrosPanorama__avanzados">
        <label v-if="mostrarFiltroTipo" class="filtrosPanorama__campo">
          <span class="filtrosPanorama__label"> Tipo de programa </span>

          <select
            :value="filtros.tipoPrograma"
            class="filtrosPanorama__select"
            @change="actualizarFiltro('tipoPrograma', $event.target.value)"
          >
            <option value="">Todos los tipos</option>

            <option v-for="tipo in tiposProgramaNormalizados" :key="tipo" :value="tipo">
              {{ tipo }}
            </option>
          </select>
        </label>

        <label v-if="mostrarFiltroEstado" class="filtrosPanorama__campo">
          <span class="filtrosPanorama__label"> Estado de captura </span>

          <select
            :value="filtros.estadoDato"
            class="filtrosPanorama__select"
            @change="actualizarFiltro('estadoDato', $event.target.value)"
          >
            <option value="">Todos los estados</option>

            <option value="completo">Completo</option>

            <option value="parcial">Parcial</option>

            <option value="pendiente">Pendiente</option>

            <option value="sinDatos">Sin datos</option>
          </select>
        </label>

        <label v-if="mostrarFiltroDisponibilidad" class="filtrosPanorama__campo">
          <span class="filtrosPanorama__label"> Disponibilidad </span>

          <select
            :value="filtros.disponibilidad"
            class="filtrosPanorama__select"
            @change="actualizarFiltro('disponibilidad', $event.target.value)"
          >
            <option value="">Todas las dependencias</option>

            <option value="conDatos">Sólo con datos</option>

            <option value="sinDatos">Sólo sin datos</option>
          </select>
        </label>

        <div class="filtrosPanorama__acciones">
          <div class="filtrosPanorama__resultado" aria-live="polite">
            <span class="filtrosPanorama__resultadoValor">
              {{ totalResultadosFormateado }}
            </span>
            <span class="filtrosPanorama__resultadoTexto">
              {{ textoResultados }}
            </span>
          </div>

          <button
            class="filtrosPanorama__limpiar"
            type="button"
            :disabled="!hayFiltrosActivos"
            @click="limpiarFiltros"
          >
            <X :size="16" stroke-width="2.4" />
            <span>Limpiar</span>
          </button>
        </div>
      </div>
    </Transition>

    <div v-if="hayFiltrosActivos" class="filtrosPanorama__chips" aria-label="Filtros activos">
      <button
        v-if="filtros.busqueda"
        class="filtrosPanorama__chip"
        type="button"
        @click="actualizarFiltro('busqueda', '')"
      >
        <span>Búsqueda: {{ filtros.busqueda }}</span>
        <X :size="14" stroke-width="2.5" />
      </button>

      <button
        v-if="filtros.tipoPrograma"
        class="filtrosPanorama__chip"
        type="button"
        @click="actualizarFiltro('tipoPrograma', '')"
      >
        <span>Tipo: {{ filtros.tipoPrograma }}</span>
        <X :size="14" stroke-width="2.5" />
      </button>

      <button
        v-if="filtros.estadoDato"
        class="filtrosPanorama__chip"
        type="button"
        @click="actualizarFiltro('estadoDato', '')"
      >
        <span>Estado: {{ textoEstadoActivo }}</span>
        <X :size="14" stroke-width="2.5" />
      </button>

      <button
        v-if="filtros.disponibilidad"
        class="filtrosPanorama__chip"
        type="button"
        @click="actualizarFiltro('disponibilidad', '')"
      >
        <span>{{ textoDisponibilidadActiva }}</span>
        <X :size="14" stroke-width="2.5" />
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Search, SlidersHorizontal, X } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  tiposPrograma: {
    type: Array,
    default: () => [],
  },
  totalResultados: {
    type: Number,
    default: 0,
  },
  mostrarFiltroTipo: {
    type: Boolean,
    default: true,
  },
  mostrarFiltroEstado: {
    type: Boolean,
    default: true,
  },
  mostrarFiltroDisponibilidad: {
    type: Boolean,
    default: true,
  },
  abrirFiltros: {
    type: Boolean,
    default: true,
  },
  compacto: {
    type: Boolean,
    default: false,
  },
  variante: {
    type: String,
    default: 'contenida',
    validator: (valor) => {
      return ['contenida', 'simple'].includes(valor)
    },
  },
})

const emit = defineEmits(['update:modelValue', 'limpiar', 'cambiar'])

const mostrarAvanzados = ref(props.abrirFiltros)

const filtros = computed(() => {
  return {
    busqueda: props.modelValue.busqueda || '',
    tipoPrograma: props.modelValue.tipoPrograma || '',
    estadoDato: props.modelValue.estadoDato || '',
    disponibilidad: props.modelValue.disponibilidad || '',
  }
})

const tiposProgramaNormalizados = computed(() => {
  return [
    ...new Set(props.tiposPrograma.map((tipo) => String(tipo || '').trim()).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, 'es'))
})

const hayFiltrosActivos = computed(() => {
  return Boolean(
    filtros.value.busqueda ||
    filtros.value.tipoPrograma ||
    filtros.value.estadoDato ||
    filtros.value.disponibilidad,
  )
})

const totalResultadosFormateado = computed(() => {
  return new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: 0,
  }).format(props.totalResultados || 0)
})

const textoResultados = computed(() => {
  return Number(props.totalResultados) === 1 ? 'resultado' : 'resultados'
})

const textoEstadoActivo = computed(() => {
  const estados = {
    completo: 'Completo',
    parcial: 'Parcial',
    pendiente: 'Pendiente',
    sinDatos: 'Sin datos',
  }

  return estados[filtros.value.estadoDato] || filtros.value.estadoDato
})

const textoDisponibilidadActiva = computed(() => {
  const disponibilidades = {
    conDatos: 'Sólo con datos',
    sinDatos: 'Sólo sin datos',
  }

  return disponibilidades[filtros.value.disponibilidad] || filtros.value.disponibilidad
})

const clasesFiltros = computed(() => {
  return {
    'filtrosPanorama--compacto': props.compacto,
    'filtrosPanorama--simple': props.variante === 'simple',
  }
})

watch(
  () => props.abrirFiltros,
  (valor) => {
    mostrarAvanzados.value = valor
  },
)

function actualizarFiltro(campo, valor) {
  const nuevosFiltros = {
    ...filtros.value,
    [campo]: valor,
  }

  emit('update:modelValue', nuevosFiltros)
  emit('cambiar', nuevosFiltros)
}

function limpiarFiltros() {
  const filtrosLimpios = {
    busqueda: '',
    tipoPrograma: '',
    estadoDato: '',
    disponibilidad: '',
  }

  emit('update:modelValue', filtrosLimpios)
  emit('limpiar', filtrosLimpios)
  emit('cambiar', filtrosLimpios)
}

function alternarAvanzados() {
  mostrarAvanzados.value = !mostrarAvanzados.value
}
</script>

<style scoped>
.filtrosPanorama {
  border: 1px solid rgba(159, 34, 65, 0.1);
  border-radius: 1.35rem;
  background: rgba(255, 255, 255, 0.78);
  box-shadow:
    0 18px 45px rgba(31, 41, 55, 0.055),
    inset 0 1px 0 rgba(255, 255, 255, 0.84);
  backdrop-filter: blur(14px);
  padding: clamp(0.9rem, 2vw, 1.1rem);
}

.filtrosPanorama--simple {
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
  padding: 0;
}

.filtrosPanorama__principal {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.85rem;
  align-items: end;
}

.filtrosPanorama__busqueda,
.filtrosPanorama__campo {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 0.42rem;
}

.filtrosPanorama__label {
  color: #6b7280;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.filtrosPanorama__inputWrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.filtrosPanorama__inputIcono {
  position: absolute;
  left: 0.9rem;
  color: #9ca3af;
  pointer-events: none;
}

.filtrosPanorama__input,
.filtrosPanorama__select {
  width: 100%;
  min-height: 2.8rem;
  border: 1px solid rgba(159, 34, 65, 0.12);
  border-radius: 0.95rem;
  background: rgba(255, 255, 255, 0.92);
  color: #111827;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 650;
  outline: none;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease;
}

.filtrosPanorama__input {
  padding: 0.7rem 0.9rem 0.7rem 2.65rem;
}

.filtrosPanorama__select {
  appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, #6b7280 50%),
    linear-gradient(135deg, #6b7280 50%, transparent 50%);
  background-position:
    calc(100% - 18px) calc(50% + 1px),
    calc(100% - 13px) calc(50% + 1px);
  background-size:
    5px 5px,
    5px 5px;
  background-repeat: no-repeat;
  padding: 0.7rem 2.25rem 0.7rem 0.9rem;
}

.filtrosPanorama__input:focus,
.filtrosPanorama__select:focus {
  border-color: rgba(159, 34, 65, 0.42);
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(159, 34, 65, 0.08);
}

.filtrosPanorama__toggle,
.filtrosPanorama__limpiar,
.filtrosPanorama__chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  font: inherit;
  cursor: pointer;
}

.filtrosPanorama__toggle {
  gap: 0.48rem;
  min-height: 2.8rem;
  border-radius: 0.95rem;
  background: #9f2241;
  box-shadow: 0 12px 24px rgba(159, 34, 65, 0.18);
  color: #ffffff;
  padding: 0.72rem 1rem;
  font-size: 0.82rem;
  font-weight: 900;
}

.filtrosPanorama__avanzados {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
  gap: 0.85rem;
  align-items: end;
  margin-top: 0.95rem;
  border-top: 1px solid rgba(159, 34, 65, 0.09);
  padding-top: 0.95rem;
}

.filtrosPanorama__acciones {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
  min-width: 230px;
}

.filtrosPanorama__resultado {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 2.8rem;
}

.filtrosPanorama__resultadoValor {
  color: #111827;
  font-size: 1.1rem;
  font-weight: 950;
  letter-spacing: -0.04em;
  line-height: 1;
}

.filtrosPanorama__resultadoTexto {
  margin-top: 0.16rem;
  color: #9ca3af;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.filtrosPanorama__limpiar {
  gap: 0.38rem;
  min-height: 2.8rem;
  border-radius: 0.9rem;
  background: #f3f4f6;
  color: #6b7280;
  padding: 0.68rem 0.85rem;
  font-size: 0.78rem;
  font-weight: 900;
  transition:
    background 180ms ease,
    color 180ms ease,
    opacity 180ms ease;
}

.filtrosPanorama__limpiar:hover:not(:disabled) {
  background: rgba(159, 34, 65, 0.08);
  color: #9f2241;
}

.filtrosPanorama__limpiar:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.filtrosPanorama__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 0.85rem;
}

.filtrosPanorama__chip {
  gap: 0.35rem;
  max-width: 100%;
  border-radius: 999px;
  background: rgba(159, 34, 65, 0.09);
  color: #7f1d3a;
  padding: 0.42rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 850;
}

.filtrosPanorama__chip span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filtrosPanoramaAvanzados-enter-active,
.filtrosPanoramaAvanzados-leave-active {
  overflow: hidden;
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.filtrosPanoramaAvanzados-enter-from,
.filtrosPanoramaAvanzados-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.filtrosPanorama--compacto {
  border-radius: 1rem;
  padding: 0.8rem;
}

.filtrosPanorama--compacto .filtrosPanorama__input,
.filtrosPanorama--compacto .filtrosPanorama__select,
.filtrosPanorama--compacto .filtrosPanorama__toggle,
.filtrosPanorama--compacto .filtrosPanorama__limpiar {
  min-height: 2.45rem;
  border-radius: 0.75rem;
}

@media (max-width: 1080px) {
  .filtrosPanorama__avanzados {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filtrosPanorama__acciones {
    grid-column: 1 / -1;
    min-width: 0;
  }
}

@media (max-width: 720px) {
  .filtrosPanorama__principal {
    grid-template-columns: 1fr;
  }

  .filtrosPanorama__toggle {
    width: 100%;
  }

  .filtrosPanorama__avanzados {
    grid-template-columns: 1fr;
  }

  .filtrosPanorama__acciones {
    align-items: stretch;
    flex-direction: column;
  }

  .filtrosPanorama__limpiar {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .filtrosPanoramaAvanzados-enter-active,
  .filtrosPanoramaAvanzados-leave-active,
  .filtrosPanorama__input,
  .filtrosPanorama__select,
  .filtrosPanorama__limpiar {
    transition: none;
  }

  .filtrosPanoramaAvanzados-enter-from,
  .filtrosPanoramaAvanzados-leave-to {
    transform: none;
  }
}
</style>
