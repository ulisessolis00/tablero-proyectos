<!-- src/components/filtros/SelectorTipoPrograma.vue -->

<template>
  <div class="selectorTipoPrograma" :class="clasesSelector" :style="estilosSelector">
    <div class="selectorTipoPrograma__superior">
      <label class="selectorTipoPrograma__label" :for="id">
        <Filter :size="15" stroke-width="2.3" />
        {{ label }}
      </label>

      <button
        v-if="mostrarLimpiar && haySeleccion"
        class="selectorTipoPrograma__limpiar"
        type="button"
        :disabled="disabled"
        @click="limpiarSeleccion"
      >
        <X :size="14" stroke-width="2.4" />
        Limpiar
      </button>
    </div>

    <div
      class="selectorTipoPrograma__selectWrapper"
      :class="{ 'selectorTipoPrograma__selectWrapper--disabled': disabled }"
    >
      <select
        :id="id"
        v-model="valorInterno"
        class="selectorTipoPrograma__select"
        :disabled="disabled"
        :aria-label="label"
      >
        <option v-if="incluirTodos" value="">{{ textoTodos }}{{ totalProgramasTexto }}</option>

        <option v-for="tipo in opcionesTipos" :key="tipo.valor" :value="tipo.valor">
          {{ tipo.etiqueta }}{{ obtenerConteoTexto(tipo.total) }}
        </option>
      </select>

      <ChevronDown
        class="selectorTipoPrograma__chevron"
        :size="17"
        stroke-width="2.4"
        aria-hidden="true"
      />
    </div>

    <div
      v-if="mostrarChips && opcionesChips.length"
      class="selectorTipoPrograma__chips"
      aria-label="Tipos de programa disponibles"
    >
      <button
        v-for="tipo in opcionesChips"
        :key="tipo.valor || 'todos'"
        class="selectorTipoPrograma__chip"
        :class="{ 'selectorTipoPrograma__chip--activo': tipo.valor === valorInterno }"
        type="button"
        :disabled="disabled"
        @click="seleccionarTipo(tipo.valor)"
      >
        <span>{{ tipo.etiqueta }}</span>

        <strong v-if="mostrarConteo && tipo.total !== null">
          {{ tipo.total }}
        </strong>
      </button>
    </div>

    <p v-if="mensajeAyuda" class="selectorTipoPrograma__ayuda">
      {{ mensajeAyuda }}
    </p>

    <p v-if="sinOpciones" class="selectorTipoPrograma__vacio">
      No hay tipos de programa disponibles.
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ChevronDown, Filter, X } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: 'selector-tipo-programa',
  },
  label: {
    type: String,
    default: 'Tipo de programa',
  },
  tipos: {
    type: Array,
    default: () => [],
  },
  programas: {
    type: Array,
    default: () => [],
  },
  llaveTipo: {
    type: String,
    default: 'tipo',
  },
  incluirTodos: {
    type: Boolean,
    default: true,
  },
  textoTodos: {
    type: String,
    default: 'Todos los tipos',
  },
  mostrarChips: {
    type: Boolean,
    default: true,
  },
  mostrarConteo: {
    type: Boolean,
    default: true,
  },
  mostrarLimpiar: {
    type: Boolean,
    default: true,
  },
  mensajeAyuda: {
    type: String,
    default: '',
  },
  ordenarPor: {
    type: String,
    default: 'nombre',
    validator: (valor) => {
      return ['nombre', 'conteo'].includes(valor)
    },
  },
  color: {
    type: String,
    default: '#9f2241',
  },
  compacto: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'change', 'limpiar'])

const valorInterno = computed({
  get() {
    return props.modelValue || ''
  },
  set(valor) {
    emitirCambio(valor)
  },
})

const colorNormalizado = computed(() => {
  return validarColor(props.color)
})

const estilosSelector = computed(() => {
  return {
    '--selector-tipo-color': colorNormalizado.value,
  }
})

const clasesSelector = computed(() => {
  return {
    'selectorTipoPrograma--compacto': props.compacto,
  }
})

const conteosPorTipo = computed(() => {
  return props.programas.reduce((acumulado, programa) => {
    const tipo = obtenerTipoPrograma(programa)
    const clave = crearClave(tipo)

    if (!acumulado.has(clave)) {
      acumulado.set(clave, {
        valor: tipo,
        etiqueta: tipo,
        total: 0,
      })
    }

    acumulado.get(clave).total += 1

    return acumulado
  }, new Map())
})

const opcionesTipos = computed(() => {
  const mapaTipos = new Map()

  props.tipos.forEach((tipo) => {
    const opcion = normalizarTipoManual(tipo)
    const clave = crearClave(opcion.valor)
    const conteo = conteosPorTipo.value.get(clave)

    mapaTipos.set(clave, {
      valor: opcion.valor,
      etiqueta: opcion.etiqueta,
      total: opcion.total ?? conteo?.total ?? null,
    })
  })

  conteosPorTipo.value.forEach((tipo, clave) => {
    if (!mapaTipos.has(clave)) {
      mapaTipos.set(clave, tipo)
    }
  })

  return ordenarOpciones([...mapaTipos.values()])
})

const opcionesChips = computed(() => {
  const opciones = [...opcionesTipos.value]

  if (!props.incluirTodos) {
    return opciones
  }

  return [
    {
      valor: '',
      etiqueta: props.textoTodos,
      total: totalProgramas.value,
    },
    ...opciones,
  ]
})

const totalProgramas = computed(() => {
  return props.programas.length
})

const totalProgramasTexto = computed(() => {
  if (!props.mostrarConteo || !props.programas.length) {
    return ''
  }

  return ` (${formatearEntero(totalProgramas.value)})`
})

const haySeleccion = computed(() => {
  return Boolean(valorInterno.value)
})

const sinOpciones = computed(() => {
  return opcionesTipos.value.length === 0 && !props.disabled
})

function emitirCambio(valor) {
  const valorSeguro = String(valor || '')
  const opcion = obtenerOpcionPorValor(valorSeguro)

  emit('update:modelValue', valorSeguro)

  emit('change', {
    valor: valorSeguro,
    etiqueta: opcion?.etiqueta || props.textoTodos,
    total: opcion?.total ?? totalProgramas.value,
    opcion,
  })
}

function seleccionarTipo(valor) {
  if (props.disabled) {
    return
  }

  emitirCambio(valor)
}

function limpiarSeleccion() {
  if (props.disabled) {
    return
  }

  emitirCambio('')
  emit('limpiar')
}

function obtenerOpcionPorValor(valor) {
  if (!valor) {
    return null
  }

  return (
    opcionesTipos.value.find((tipo) => {
      return tipo.valor === valor
    }) || null
  )
}

function normalizarTipoManual(tipo) {
  if (typeof tipo === 'string' || typeof tipo === 'number') {
    const texto = limpiarTexto(tipo, 'General')

    return {
      valor: texto,
      etiqueta: texto,
      total: null,
    }
  }

  const valor = limpiarTexto(
    tipo?.valor ?? tipo?.id ?? tipo?.tipo ?? tipo?.nombre ?? tipo?.etiqueta,
    'General',
  )

  return {
    valor,
    etiqueta: limpiarTexto(tipo?.etiqueta ?? tipo?.nombre ?? valor, valor),
    total: normalizarConteo(tipo?.total ?? tipo?.conteo ?? tipo?.cantidad),
  }
}

function obtenerTipoPrograma(programa) {
  const valor =
    programa?.[props.llaveTipo] ??
    programa?.tipo ??
    programa?.tipoPrograma ??
    programa?.tipoClean ??
    programa?.tipo_clean

  return limpiarTexto(valor, 'General')
}

function limpiarTexto(valor, valorDefault = '') {
  const texto = String(valor ?? '').trim()

  if (!texto || texto.toUpperCase() === 'NA' || texto.toUpperCase() === 'NULL') {
    return valorDefault
  }

  return texto
}

function crearClave(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function ordenarOpciones(opciones) {
  const copia = [...opciones]

  if (props.ordenarPor === 'conteo') {
    return copia.sort((a, b) => {
      return Number(b.total || 0) - Number(a.total || 0)
    })
  }

  return copia.sort((a, b) => {
    return a.etiqueta.localeCompare(b.etiqueta, 'es')
  })
}

function obtenerConteoTexto(total) {
  if (!props.mostrarConteo || total === null || total === undefined) {
    return ''
  }

  return ` (${formatearEntero(total)})`
}

function normalizarConteo(valor) {
  const numero = Number(valor)

  if (!Number.isFinite(numero)) {
    return null
  }

  return numero
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

function validarColor(valor) {
  if (/^#[0-9a-fA-F]{6}$/.test(valor || '')) {
    return valor
  }

  return '#9f2241'
}
</script>

<style scoped>
.selectorTipoPrograma {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  width: 100%;
  min-width: 0;
}

.selectorTipoPrograma__superior {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.selectorTipoPrograma__label {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  color: #374151;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  line-height: 1.2;
  text-transform: uppercase;
}

.selectorTipoPrograma__label svg {
  color: var(--selector-tipo-color);
}

.selectorTipoPrograma__limpiar {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border: 0;
  background: transparent;
  color: #9f2241;
  padding: 0;
  font: inherit;
  font-size: 0.74rem;
  font-weight: 850;
  cursor: pointer;
}

.selectorTipoPrograma__limpiar:hover:not(:disabled) {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.selectorTipoPrograma__limpiar:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.selectorTipoPrograma__selectWrapper {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 2.75rem;
  border: 1px solid rgba(159, 34, 65, 0.12);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.82);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease,
    opacity 180ms ease;
}

.selectorTipoPrograma__selectWrapper:focus-within {
  border-color: color-mix(in srgb, var(--selector-tipo-color) 40%, #ffffff);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--selector-tipo-color) 9%, transparent);
}

.selectorTipoPrograma__selectWrapper--disabled {
  opacity: 0.6;
}

.selectorTipoPrograma__select {
  width: 100%;
  min-height: 2.75rem;
  border: 0;
  outline: none;
  background: transparent;
  color: #1f2937;
  padding: 0 2.5rem 0 0.85rem;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 750;
  appearance: none;
  cursor: pointer;
}

.selectorTipoPrograma__select:disabled {
  cursor: not-allowed;
}

.selectorTipoPrograma__chevron {
  position: absolute;
  right: 0.85rem;
  color: #9ca3af;
  pointer-events: none;
}

.selectorTipoPrograma__chips {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.selectorTipoPrograma__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  max-width: 100%;
  border: 1px solid rgba(159, 34, 65, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.75);
  color: #6b7280;
  padding: 0.34rem 0.58rem;
  font: inherit;
  font-size: 0.68rem;
  font-weight: 850;
  line-height: 1;
  cursor: pointer;
  transition:
    transform 160ms ease,
    background 160ms ease,
    border-color 160ms ease,
    color 160ms ease;
}

.selectorTipoPrograma__chip span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selectorTipoPrograma__chip strong {
  color: inherit;
  font-size: 0.66rem;
  font-weight: 950;
}

.selectorTipoPrograma__chip:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--selector-tipo-color) 24%, #ffffff);
  color: var(--selector-tipo-color);
}

.selectorTipoPrograma__chip--activo {
  border-color: color-mix(in srgb, var(--selector-tipo-color) 28%, #ffffff);
  background: color-mix(in srgb, var(--selector-tipo-color) 10%, #ffffff);
  color: var(--selector-tipo-color);
}

.selectorTipoPrograma__chip:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.selectorTipoPrograma__ayuda,
.selectorTipoPrograma__vacio {
  margin: 0;
  font-size: 0.76rem;
  font-weight: 650;
  line-height: 1.4;
}

.selectorTipoPrograma__ayuda {
  color: #6b7280;
}

.selectorTipoPrograma__vacio {
  color: #b45309;
}

.selectorTipoPrograma--compacto {
  gap: 0.42rem;
}

.selectorTipoPrograma--compacto .selectorTipoPrograma__selectWrapper,
.selectorTipoPrograma--compacto .selectorTipoPrograma__select {
  min-height: 2.35rem;
}

.selectorTipoPrograma--compacto .selectorTipoPrograma__chips {
  gap: 0.35rem;
}

@media (max-width: 640px) {
  .selectorTipoPrograma__superior {
    align-items: flex-start;
    flex-direction: column;
  }

  .selectorTipoPrograma__limpiar {
    align-self: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .selectorTipoPrograma__selectWrapper,
  .selectorTipoPrograma__chip {
    transition: none;
  }

  .selectorTipoPrograma__chip:hover:not(:disabled) {
    transform: none;
  }
}
</style>
