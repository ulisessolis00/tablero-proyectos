<!-- src/components/filtros/SelectorEstadoCaptura.vue -->

<template>
  <div class="selectorEstadoCaptura" :class="clasesSelector" :style="estilosSelector">
    <div class="selectorEstadoCaptura__superior">
      <label class="selectorEstadoCaptura__label" :for="id">
        <ShieldCheck :size="15" stroke-width="2.3" />
        {{ label }}
      </label>

      <button
        v-if="mostrarLimpiar && haySeleccion"
        class="selectorEstadoCaptura__limpiar"
        type="button"
        :disabled="disabled"
        @click="limpiarSeleccion"
      >
        <X :size="14" stroke-width="2.4" />
        Limpiar
      </button>
    </div>

    <div
      class="selectorEstadoCaptura__selectWrapper"
      :class="{ 'selectorEstadoCaptura__selectWrapper--disabled': disabled }"
    >
      <select
        :id="id"
        v-model="valorInterno"
        class="selectorEstadoCaptura__select"
        :disabled="disabled"
        :aria-label="label"
      >
        <option v-if="incluirTodos" value="">{{ textoTodos }}{{ totalRegistrosTexto }}</option>

        <option v-for="estado in opcionesEstados" :key="estado.valor" :value="estado.valor">
          {{ estado.etiqueta }}{{ obtenerConteoTexto(estado.total) }}
        </option>
      </select>

      <ChevronDown
        class="selectorEstadoCaptura__chevron"
        :size="17"
        stroke-width="2.4"
        aria-hidden="true"
      />
    </div>

    <div
      v-if="mostrarChips && opcionesChips.length"
      class="selectorEstadoCaptura__chips"
      aria-label="Estados de captura disponibles"
    >
      <button
        v-for="estado in opcionesChips"
        :key="estado.valor || 'todos'"
        class="selectorEstadoCaptura__chip"
        :class="{ 'selectorEstadoCaptura__chip--activo': estado.valor === valorInterno }"
        :style="{ '--estado-chip-color': estado.color }"
        type="button"
        :disabled="disabled"
        @click="seleccionarEstado(estado.valor)"
      >
        <component
          :is="estado.icono"
          v-if="mostrarIconos && estado.icono"
          :size="14"
          stroke-width="2.4"
          aria-hidden="true"
        />

        <span>{{ estado.etiqueta }}</span>

        <strong v-if="mostrarConteo && estado.total !== null">
          {{ formatearEntero(estado.total) }}
        </strong>
      </button>
    </div>

    <p v-if="mensajeAyuda" class="selectorEstadoCaptura__ayuda">
      {{ mensajeAyuda }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  AlertTriangle,
  CalendarX,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  Clock3,
  HelpCircle,
  Info,
  ShieldCheck,
  UsersRound,
  WalletCards,
  X,
  XCircle,
} from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: 'selector-estado-captura',
  },
  label: {
    type: String,
    default: 'Estado de captura',
  },
  estados: {
    type: Array,
    default: () => [],
  },
  registros: {
    type: Array,
    default: () => [],
  },
  llaveEstado: {
    type: String,
    default: 'estadoCaptura',
  },
  llaveCompletitud: {
    type: String,
    default: 'completitud',
  },
  modo: {
    type: String,
    default: 'estado',
    validator: (valor) => {
      return ['estado', 'completitud', 'automatico'].includes(valor)
    },
  },
  incluirTodos: {
    type: Boolean,
    default: true,
  },
  textoTodos: {
    type: String,
    default: 'Todos los estados',
  },
  mostrarChips: {
    type: Boolean,
    default: true,
  },
  mostrarConteo: {
    type: Boolean,
    default: true,
  },
  mostrarIconos: {
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
    default: 'orden',
    validator: (valor) => {
      return ['orden', 'nombre', 'conteo'].includes(valor)
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

const CONFIGURACION_ESTADOS = Object.freeze({
  completo: {
    valor: 'completo',
    etiqueta: 'Completo',
    color: '#059669',
    icono: CheckCircle2,
    orden: 1,
  },
  parcial: {
    valor: 'parcial',
    etiqueta: 'Parcial',
    color: '#b45309',
    icono: Info,
    orden: 2,
  },
  pendiente: {
    valor: 'pendiente',
    etiqueta: 'Pendiente',
    color: '#9ca3af',
    icono: Clock3,
    orden: 3,
  },
  conDatos: {
    valor: 'conDatos',
    etiqueta: 'Con datos',
    color: '#0d9488',
    icono: CheckCircle2,
    orden: 4,
  },
  sinDatos: {
    valor: 'sinDatos',
    etiqueta: 'Sin datos',
    color: '#6b7280',
    icono: CircleDashed,
    orden: 5,
  },
  sinPresupuesto: {
    valor: 'sinPresupuesto',
    etiqueta: 'Sin presupuesto',
    color: '#b45309',
    icono: WalletCards,
    orden: 6,
  },
  sinBeneficiarios: {
    valor: 'sinBeneficiarios',
    etiqueta: 'Sin beneficiarios',
    color: '#0d9488',
    icono: UsersRound,
    orden: 7,
  },
  sinFechas: {
    valor: 'sinFechas',
    etiqueta: 'Sin fechas',
    color: '#7c3aed',
    icono: CalendarX,
    orden: 8,
  },
  noReportado: {
    valor: 'noReportado',
    etiqueta: 'No reportado',
    color: '#6b7280',
    icono: HelpCircle,
    orden: 9,
  },
  alerta: {
    valor: 'alerta',
    etiqueta: 'Revisar',
    color: '#d97706',
    icono: AlertTriangle,
    orden: 10,
  },
  error: {
    valor: 'error',
    etiqueta: 'Error',
    color: '#dc2626',
    icono: XCircle,
    orden: 11,
  },
})

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
    '--selector-estado-color': colorNormalizado.value,
  }
})

const clasesSelector = computed(() => {
  return {
    'selectorEstadoCaptura--compacto': props.compacto,
  }
})

const estadosBase = computed(() => {
  if (props.estados.length) {
    return props.estados.map(normalizarEstadoManual)
  }

  return [
    CONFIGURACION_ESTADOS.completo,
    CONFIGURACION_ESTADOS.parcial,
    CONFIGURACION_ESTADOS.pendiente,
    CONFIGURACION_ESTADOS.conDatos,
    CONFIGURACION_ESTADOS.sinDatos,
    CONFIGURACION_ESTADOS.sinPresupuesto,
    CONFIGURACION_ESTADOS.sinBeneficiarios,
    CONFIGURACION_ESTADOS.sinFechas,
    CONFIGURACION_ESTADOS.noReportado,
  ]
})

const conteosPorEstado = computed(() => {
  return props.registros.reduce((acumulado, registro) => {
    const estado = obtenerEstadoRegistro(registro)
    const clave = normalizarEstadoClave(estado)

    if (!acumulado.has(clave)) {
      const config = obtenerConfiguracionEstado(clave)

      acumulado.set(clave, {
        ...config,
        total: 0,
      })
    }

    acumulado.get(clave).total += 1

    return acumulado
  }, new Map())
})

const opcionesEstados = computed(() => {
  const mapaEstados = new Map()

  estadosBase.value.forEach((estado) => {
    const clave = normalizarEstadoClave(estado.valor)
    const conteo = conteosPorEstado.value.get(clave)

    mapaEstados.set(clave, {
      ...estado,
      total: conteo?.total ?? null,
    })
  })

  conteosPorEstado.value.forEach((estado, clave) => {
    if (!mapaEstados.has(clave)) {
      mapaEstados.set(clave, estado)
    }
  })

  return ordenarOpciones([...mapaEstados.values()])
})

const opcionesChips = computed(() => {
  if (!props.incluirTodos) {
    return opcionesEstados.value
  }

  return [
    {
      valor: '',
      etiqueta: props.textoTodos,
      color: colorNormalizado.value,
      icono: ShieldCheck,
      total: totalRegistros.value,
      orden: 0,
    },
    ...opcionesEstados.value,
  ]
})

const totalRegistros = computed(() => {
  return props.registros.length
})

const totalRegistrosTexto = computed(() => {
  if (!props.mostrarConteo || !props.registros.length) {
    return ''
  }

  return ` (${formatearEntero(totalRegistros.value)})`
})

const haySeleccion = computed(() => {
  return Boolean(valorInterno.value)
})

function emitirCambio(valor) {
  const valorSeguro = String(valor || '')
  const opcion = obtenerOpcionPorValor(valorSeguro)

  emit('update:modelValue', valorSeguro)

  emit('change', {
    valor: valorSeguro,
    etiqueta: opcion?.etiqueta || props.textoTodos,
    total: opcion?.total ?? totalRegistros.value,
    opcion,
  })
}

function seleccionarEstado(valor) {
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
    opcionesEstados.value.find((estado) => {
      return estado.valor === valor
    }) || null
  )
}

function normalizarEstadoManual(estado) {
  if (typeof estado === 'string' || typeof estado === 'number') {
    const valor = normalizarEstadoClave(estado)
    return obtenerConfiguracionEstado(valor)
  }

  const valor = normalizarEstadoClave(
    estado?.valor ?? estado?.id ?? estado?.estado ?? estado?.nombre ?? estado?.etiqueta,
  )

  const config = obtenerConfiguracionEstado(valor)

  return {
    ...config,
    etiqueta: limpiarTexto(estado?.etiqueta ?? estado?.nombre ?? config.etiqueta, config.etiqueta),
    color: validarColor(estado?.color) || config.color,
    orden: normalizarNumero(estado?.orden, config.orden),
  }
}

function obtenerEstadoRegistro(registro) {
  if (!registro || typeof registro !== 'object') {
    return 'sinDatos'
  }

  const estadoExplicito =
    registro[props.llaveEstado] ??
    registro.estadoCaptura ??
    registro.estadoDato ??
    registro.estadoDatos ??
    registro.estado

  if (tieneValor(estadoExplicito)) {
    return normalizarEstadoClave(estadoExplicito)
  }

  if (props.modo === 'completitud' || props.modo === 'automatico') {
    return obtenerEstadoPorCompletitud(registro)
  }

  return evaluarEstadoAutomatico(registro)
}

function obtenerEstadoPorCompletitud(registro) {
  const completitud = normalizarNumero(
    registro[props.llaveCompletitud] ??
      registro.completitud ??
      registro.porcentajeCompletitud ??
      registro.avanceCaptura,
  )

  if (completitud === null) {
    return evaluarEstadoAutomatico(registro)
  }

  if (completitud >= 95) {
    return 'completo'
  }

  if (completitud > 0) {
    return 'parcial'
  }

  return 'pendiente'
}

function evaluarEstadoAutomatico(registro) {
  const tienePresupuesto =
    tieneNumeroMayorACero(registro.presupuestoAsignado) ||
    tieneNumeroMayorACero(registro.presupuestoEjercido) ||
    tieneNumeroMayorACero(registro.presupuesto)

  const tieneBeneficiarios =
    tieneNumeroMayorACero(registro.beneficiariosActuales) ||
    tieneNumeroMayorACero(registro.metaBeneficiarios) ||
    tieneNumeroMayorACero(registro.beneficiarios)

  const tieneFechas = tieneValor(registro.fechaInicio) && tieneValor(registro.fechaFin)

  if (!tienePresupuesto) {
    return 'sinPresupuesto'
  }

  if (!tieneBeneficiarios) {
    return 'sinBeneficiarios'
  }

  if (!tieneFechas) {
    return 'sinFechas'
  }

  return 'conDatos'
}

function obtenerConfiguracionEstado(valor) {
  const clave = normalizarEstadoClave(valor)

  return (
    CONFIGURACION_ESTADOS[clave] || {
      valor: clave || 'noReportado',
      etiqueta: limpiarTexto(valor, 'No reportado'),
      color: '#6b7280',
      icono: HelpCircle,
      orden: 99,
    }
  )
}

function normalizarEstadoClave(valor) {
  const texto = String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')

  const equivalencias = {
    completo: 'completo',
    completa: 'completo',
    parcial: 'parcial',
    pendiente: 'pendiente',
    'por capturar': 'pendiente',
    'sin datos': 'sinDatos',
    sindatos: 'sinDatos',
    'con datos': 'conDatos',
    condatos: 'conDatos',
    'sin presupuesto': 'sinPresupuesto',
    sinpresupuesto: 'sinPresupuesto',
    'sin beneficiarios': 'sinBeneficiarios',
    sinbeneficiarios: 'sinBeneficiarios',
    'sin fechas': 'sinFechas',
    sinfechas: 'sinFechas',
    'no reportado': 'noReportado',
    noreportado: 'noReportado',
    revisar: 'alerta',
    alerta: 'alerta',
    error: 'error',
  }

  return equivalencias[texto] || texto
}

function ordenarOpciones(opciones) {
  const copia = [...opciones]

  if (props.ordenarPor === 'conteo') {
    return copia.sort((a, b) => {
      return Number(b.total || 0) - Number(a.total || 0)
    })
  }

  if (props.ordenarPor === 'nombre') {
    return copia.sort((a, b) => {
      return a.etiqueta.localeCompare(b.etiqueta, 'es')
    })
  }

  return copia.sort((a, b) => {
    return Number(a.orden || 99) - Number(b.orden || 99)
  })
}

function obtenerConteoTexto(total) {
  if (!props.mostrarConteo || total === null || total === undefined) {
    return ''
  }

  return ` (${formatearEntero(total)})`
}

function tieneValor(valor) {
  if (valor === null || valor === undefined) {
    return false
  }

  const texto = String(valor).trim().toUpperCase()

  return texto !== '' && texto !== 'NA' && texto !== 'NULL'
}

function tieneNumeroMayorACero(valor) {
  const numero = normalizarNumero(valor)
  return numero !== null && numero > 0
}

function normalizarNumero(valor, valorDefault = null) {
  if (valor === null || valor === undefined || valor === '') {
    return valorDefault
  }

  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : valorDefault
  }

  const texto = String(valor).replace(/\$/g, '').replace(/,/g, '').replace(/%/g, '').trim()

  const numero = Number(texto)

  return Number.isFinite(numero) ? numero : valorDefault
}

function limpiarTexto(valor, valorDefault = '') {
  const texto = String(valor ?? '').trim()

  if (!texto || texto.toUpperCase() === 'NA' || texto.toUpperCase() === 'NULL') {
    return valorDefault
  }

  return texto
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

  return ''
}
</script>

<style scoped>
.selectorEstadoCaptura {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  width: 100%;
  min-width: 0;
}

.selectorEstadoCaptura__superior {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.selectorEstadoCaptura__label {
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

.selectorEstadoCaptura__label svg {
  color: var(--selector-estado-color);
}

.selectorEstadoCaptura__limpiar {
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

.selectorEstadoCaptura__limpiar:hover:not(:disabled) {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.selectorEstadoCaptura__limpiar:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.selectorEstadoCaptura__selectWrapper {
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

.selectorEstadoCaptura__selectWrapper:focus-within {
  border-color: color-mix(in srgb, var(--selector-estado-color) 40%, #ffffff);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--selector-estado-color) 9%, transparent);
}

.selectorEstadoCaptura__selectWrapper--disabled {
  opacity: 0.6;
}

.selectorEstadoCaptura__select {
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

.selectorEstadoCaptura__select:disabled {
  cursor: not-allowed;
}

.selectorEstadoCaptura__chevron {
  position: absolute;
  right: 0.85rem;
  color: #9ca3af;
  pointer-events: none;
}

.selectorEstadoCaptura__chips {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.selectorEstadoCaptura__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  max-width: 100%;
  border: 1px solid color-mix(in srgb, var(--estado-chip-color) 18%, #ffffff);
  border-radius: 999px;
  background: color-mix(in srgb, var(--estado-chip-color) 7%, #ffffff);
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

.selectorEstadoCaptura__chip svg {
  color: var(--estado-chip-color);
}

.selectorEstadoCaptura__chip span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selectorEstadoCaptura__chip strong {
  color: inherit;
  font-size: 0.66rem;
  font-weight: 950;
}

.selectorEstadoCaptura__chip:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--estado-chip-color) 28%, #ffffff);
  color: var(--estado-chip-color);
}

.selectorEstadoCaptura__chip--activo {
  border-color: color-mix(in srgb, var(--estado-chip-color) 32%, #ffffff);
  background: color-mix(in srgb, var(--estado-chip-color) 12%, #ffffff);
  color: var(--estado-chip-color);
}

.selectorEstadoCaptura__chip:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.selectorEstadoCaptura__ayuda {
  margin: 0;
  color: #6b7280;
  font-size: 0.76rem;
  font-weight: 650;
  line-height: 1.4;
}

.selectorEstadoCaptura--compacto {
  gap: 0.42rem;
}

.selectorEstadoCaptura--compacto .selectorEstadoCaptura__selectWrapper,
.selectorEstadoCaptura--compacto .selectorEstadoCaptura__select {
  min-height: 2.35rem;
}

.selectorEstadoCaptura--compacto .selectorEstadoCaptura__chips {
  gap: 0.35rem;
}

@media (max-width: 640px) {
  .selectorEstadoCaptura__superior {
    align-items: flex-start;
    flex-direction: column;
  }

  .selectorEstadoCaptura__limpiar {
    align-self: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .selectorEstadoCaptura__selectWrapper,
  .selectorEstadoCaptura__chip {
    transition: none;
  }

  .selectorEstadoCaptura__chip:hover:not(:disabled) {
    transform: none;
  }
}
</style>
