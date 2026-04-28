<!-- src/components/programas/TarjetaPrograma.vue -->

<template>
  <article class="tarjetaPrograma" :class="clasesTarjeta" :style="estilosTarjeta">
    <header class="tarjetaPrograma__header">
      <div class="tarjetaPrograma__tituloBloque">
        <span class="tarjetaPrograma__tipo" :title="tipoPrograma">
          {{ tipoPrograma }}
        </span>

        <h3 class="tarjetaPrograma__nombre">
          {{ nombrePrograma }}
        </h3>
      </div>

      <span class="tarjetaPrograma__estado" :class="claseEstado">
        <span class="tarjetaPrograma__estadoPunto"></span>
        {{ estadoPrograma }}
      </span>
    </header>

    <p v-if="descripcionPrograma" class="tarjetaPrograma__descripcion">
      {{ descripcionVisible }}
    </p>

    <p v-else class="tarjetaPrograma__descripcion tarjetaPrograma__descripcion--vacia">
      Descripción por capturar.
    </p>

    <section class="tarjetaPrograma__metricas" aria-label="Datos principales del programa">
      <div class="tarjetaPrograma__dato">
        <span class="tarjetaPrograma__datoIcono">
          <WalletCards :size="17" stroke-width="2.2" />
        </span>

        <span class="tarjetaPrograma__datoEtiqueta"> Presupuesto </span>

        <strong class="tarjetaPrograma__datoValor">
          {{ presupuesto }}
        </strong>
      </div>

      <div class="tarjetaPrograma__dato">
        <span class="tarjetaPrograma__datoIcono">
          <UsersRound :size="17" stroke-width="2.2" />
        </span>

        <span class="tarjetaPrograma__datoEtiqueta"> Beneficiarios </span>

        <strong class="tarjetaPrograma__datoValor">
          {{ beneficiarios }}
        </strong>
      </div>

      <div class="tarjetaPrograma__dato">
        <span class="tarjetaPrograma__datoIcono">
          <Activity :size="17" stroke-width="2.2" />
        </span>

        <span class="tarjetaPrograma__datoEtiqueta"> Avance </span>

        <strong class="tarjetaPrograma__datoValor">
          {{ avance }}
        </strong>
      </div>

      <div class="tarjetaPrograma__dato">
        <span class="tarjetaPrograma__datoIcono">
          <MapPin :size="17" stroke-width="2.2" />
        </span>

        <span class="tarjetaPrograma__datoEtiqueta"> Alcaldía </span>

        <strong class="tarjetaPrograma__datoValor" :title="alcaldia">
          {{ alcaldia }}
        </strong>
      </div>
    </section>

    <section class="tarjetaPrograma__fechas" aria-label="Fechas del programa">
      <div class="tarjetaPrograma__fecha">
        <CalendarDays :size="16" stroke-width="2.2" />
        <span>Inicio</span>
        <strong>{{ fechaInicio }}</strong>
      </div>

      <div class="tarjetaPrograma__fecha">
        <CalendarCheck :size="16" stroke-width="2.2" />
        <span>Fin</span>
        <strong>{{ fechaFin }}</strong>
      </div>
    </section>

    <section v-if="mostrarMetas" class="tarjetaPrograma__metas" aria-label="Metas del programa">
      <div v-if="metasAcciones" class="tarjetaPrograma__meta">
        <span>Metas / acciones</span>
        <p>{{ metasAcciones }}</p>
      </div>

      <div v-if="metaBeneficiarios" class="tarjetaPrograma__meta">
        <span>Meta beneficiarios</span>
        <p>{{ metaBeneficiarios }}</p>
      </div>
    </section>

    <footer class="tarjetaPrograma__footer">
      <div class="tarjetaPrograma__observaciones">
        <MessageSquareText :size="16" stroke-width="2.2" />

        <p>
          {{ observaciones }}
        </p>
      </div>
    </footer>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import {
  Activity,
  CalendarCheck,
  CalendarDays,
  MapPin,
  MessageSquareText,
  UsersRound,
  WalletCards,
} from 'lucide-vue-next'

const props = defineProps({
  programa: {
    type: Object,
    required: true,
  },
  color: {
    type: String,
    default: '#9f2241',
  },
  compacto: {
    type: Boolean,
    default: false,
  },
  limiteDescripcion: {
    type: Number,
    default: 230,
  },
  mostrarMetas: {
    type: Boolean,
    default: true,
  },
})

const nombrePrograma = computed(() => {
  return obtenerTexto(props.programa?.nombre, 'Programa sin nombre')
})

const tipoPrograma = computed(() => {
  return obtenerTexto(props.programa?.tipo, 'General')
})

const descripcionPrograma = computed(() => {
  return obtenerTexto(props.programa?.descripcion, '')
})

const descripcionVisible = computed(() => {
  return limitarTexto(descripcionPrograma.value, props.limiteDescripcion)
})

const estadoPrograma = computed(() => {
  return obtenerTexto(props.programa?.estado, 'Sin estado')
})

const claseEstado = computed(() => {
  const estado = normalizarTexto(estadoPrograma.value)

  if (
    estado.includes('concluido') ||
    estado.includes('completo') ||
    estado.includes('finalizado')
  ) {
    return 'tarjetaPrograma__estado--completo'
  }

  if (estado.includes('proceso') || estado.includes('avance') || estado.includes('ejecucion')) {
    return 'tarjetaPrograma__estado--proceso'
  }

  if (
    estado.includes('pendiente') ||
    estado.includes('capturar') ||
    estado.includes('sin estado')
  ) {
    return 'tarjetaPrograma__estado--pendiente'
  }

  if (estado.includes('suspendido') || estado.includes('cancelado')) {
    return 'tarjetaPrograma__estado--alerta'
  }

  return 'tarjetaPrograma__estado--neutral'
})

const presupuesto = computed(() => {
  return formatearPesos(props.programa?.presupuestoAsignado, 'Por capturar')
})

const beneficiarios = computed(() => {
  return formatearEntero(props.programa?.beneficiariosActuales, 'Por capturar')
})

const avance = computed(() => {
  return formatearPorcentaje(props.programa?.avance, 'Pendiente')
})

const alcaldia = computed(() => {
  return obtenerTexto(props.programa?.alcaldia, 'No reportada')
})

const fechaInicio = computed(() => {
  return formatearFecha(props.programa?.fechaInicio, 'No reportada')
})

const fechaFin = computed(() => {
  return formatearFecha(props.programa?.fechaFin, 'No reportada')
})

const metasAcciones = computed(() => {
  return obtenerTexto(props.programa?.metasAcciones, '')
})

const metaBeneficiarios = computed(() => {
  return formatearEntero(props.programa?.metaBeneficiarios, '')
})

const observaciones = computed(() => {
  return obtenerTexto(props.programa?.observaciones, 'Sin observaciones.')
})

const estilosTarjeta = computed(() => {
  return {
    '--tarjeta-programa-color': validarColor(props.color),
  }
})

const clasesTarjeta = computed(() => {
  return {
    'tarjetaPrograma--compacta': props.compacto,
  }
})

function obtenerTexto(valor, valorDefault = 'Por capturar') {
  if (valor === null || valor === undefined) {
    return valorDefault
  }

  const texto = String(valor).trim()

  if (!texto || texto.toUpperCase() === 'NA' || texto.toUpperCase() === 'NULL') {
    return valorDefault
  }

  return texto
}

function normalizarTexto(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function limitarTexto(texto, limite = 230) {
  const valor = String(texto || '').trim()

  if (!valor) {
    return ''
  }

  if (valor.length <= limite) {
    return valor
  }

  return `${valor.slice(0, limite).trim()}...`
}

function formatearEntero(valor, valorDefault = 'Por capturar') {
  const numero = normalizarNumero(valor)

  if (numero === null || numero <= 0) {
    return valorDefault
  }

  return new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: 0,
  }).format(numero)
}

function formatearPesos(valor, valorDefault = 'Por capturar') {
  const numero = normalizarNumero(valor)

  if (numero === null || numero <= 0) {
    return valorDefault
  }

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(numero)
}

function formatearPorcentaje(valor, valorDefault = 'Pendiente') {
  const numero = normalizarNumero(valor)

  if (numero === null) {
    return valorDefault
  }

  return `${new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: 1,
  }).format(numero)}%`
}

function formatearFecha(valor, valorDefault = 'No reportada') {
  if (!valor) {
    return valorDefault
  }

  if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
    return formatearFechaDate(valor)
  }

  const texto = String(valor).trim()

  if (!texto || texto.toUpperCase() === 'NA' || texto.toUpperCase() === 'NULL') {
    return valorDefault
  }

  const fecha = new Date(texto)

  if (Number.isNaN(fecha.getTime())) {
    return texto
  }

  return formatearFechaDate(fecha)
}

function formatearFechaDate(fecha) {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(fecha)
}

function normalizarNumero(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return null
  }

  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : null
  }

  const texto = String(valor).replace(/\$/g, '').replace(/,/g, '').replace(/%/g, '').trim()

  const numero = Number(texto)

  return Number.isFinite(numero) ? numero : null
}

function validarColor(valor) {
  if (/^#[0-9a-fA-F]{6}$/.test(valor || '')) {
    return valor
  }

  return '#9f2241'
}
</script>

<style scoped>
.tarjetaPrograma {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(229, 231, 235, 0.95);
  border-radius: 1.12rem;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.92));
  box-shadow:
    0 16px 36px rgba(31, 41, 55, 0.055),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  padding: 1rem;
  color: #111827;
}

.tarjetaPrograma::before {
  position: absolute;
  inset: 0 0 auto;
  height: 0.24rem;
  content: '';
  background: linear-gradient(
    90deg,
    var(--tarjeta-programa-color),
    color-mix(in srgb, var(--tarjeta-programa-color) 34%, #ffffff)
  );
}

.tarjetaPrograma__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.85rem;
}

.tarjetaPrograma__tituloBloque {
  min-width: 0;
}

.tarjetaPrograma__tipo {
  display: inline-flex;
  max-width: 100%;
  overflow: hidden;
  border-radius: 999px;
  background: color-mix(in srgb, var(--tarjeta-programa-color) 9%, #ffffff);
  color: var(--tarjeta-programa-color);
  padding: 0.32rem 0.55rem;
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.065em;
  line-height: 1;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.tarjetaPrograma__nombre {
  margin: 0.65rem 0 0;
  color: #111827;
  font-size: 1rem;
  font-weight: 950;
  letter-spacing: -0.02em;
  line-height: 1.25;
  text-wrap: balance;
}

.tarjetaPrograma__estado {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  flex: 0 0 auto;
  max-width: 10rem;
  overflow: hidden;
  border-radius: 999px;
  padding: 0.38rem 0.58rem;
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.055em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.tarjetaPrograma__estadoPunto {
  flex: 0 0 auto;
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 999px;
}

.tarjetaPrograma__estado--completo {
  background: rgba(5, 150, 105, 0.1);
  color: #047857;
}

.tarjetaPrograma__estado--completo .tarjetaPrograma__estadoPunto {
  background: #059669;
}

.tarjetaPrograma__estado--proceso {
  background: rgba(13, 148, 136, 0.1);
  color: #0f766e;
}

.tarjetaPrograma__estado--proceso .tarjetaPrograma__estadoPunto {
  background: #0d9488;
}

.tarjetaPrograma__estado--pendiente {
  background: rgba(156, 163, 175, 0.15);
  color: #6b7280;
}

.tarjetaPrograma__estado--pendiente .tarjetaPrograma__estadoPunto {
  background: #9ca3af;
}

.tarjetaPrograma__estado--alerta {
  background: rgba(220, 38, 38, 0.1);
  color: #b91c1c;
}

.tarjetaPrograma__estado--alerta .tarjetaPrograma__estadoPunto {
  background: #dc2626;
}

.tarjetaPrograma__estado--neutral {
  background: color-mix(in srgb, var(--tarjeta-programa-color) 9%, #ffffff);
  color: var(--tarjeta-programa-color);
}

.tarjetaPrograma__estado--neutral .tarjetaPrograma__estadoPunto {
  background: var(--tarjeta-programa-color);
}

.tarjetaPrograma__descripcion {
  display: -webkit-box;
  overflow: hidden;
  margin: 0.85rem 0 0;
  color: #6b7280;
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.tarjetaPrograma__descripcion--vacia {
  color: #9ca3af;
  font-style: italic;
}

.tarjetaPrograma__metricas {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  margin-top: 0.95rem;
}

.tarjetaPrograma__dato {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  column-gap: 0.48rem;
  row-gap: 0.12rem;
  align-items: center;
  border-radius: 0.88rem;
  background: #f9fafb;
  padding: 0.68rem;
}

.tarjetaPrograma__datoIcono {
  display: grid;
  place-items: center;
  grid-row: span 2;
  color: var(--tarjeta-programa-color);
}

.tarjetaPrograma__datoEtiqueta {
  overflow: hidden;
  color: #9ca3af;
  font-size: 0.63rem;
  font-weight: 900;
  letter-spacing: 0.07em;
  line-height: 1.1;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.tarjetaPrograma__datoValor {
  overflow: hidden;
  color: #111827;
  font-size: 0.78rem;
  font-weight: 950;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tarjetaPrograma__fechas {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  margin-top: 0.75rem;
}

.tarjetaPrograma__fecha {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  column-gap: 0.45rem;
  row-gap: 0.1rem;
  align-items: center;
  border: 1px solid rgba(229, 231, 235, 0.95);
  border-radius: 0.85rem;
  background: #ffffff;
  padding: 0.62rem;
}

.tarjetaPrograma__fecha svg {
  grid-row: span 2;
  color: var(--tarjeta-programa-color);
}

.tarjetaPrograma__fecha span {
  color: #9ca3af;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.tarjetaPrograma__fecha strong {
  color: #111827;
  font-size: 0.76rem;
  font-weight: 900;
}

.tarjetaPrograma__metas {
  display: flex;
  flex-direction: column;
  gap: 0.58rem;
  margin-top: 0.85rem;
  border-top: 1px dashed #e5e7eb;
  padding-top: 0.8rem;
}

.tarjetaPrograma__meta span {
  display: block;
  margin-bottom: 0.25rem;
  color: #9ca3af;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.tarjetaPrograma__meta p {
  margin: 0;
  color: #374151;
  font-size: 0.78rem;
  font-weight: 650;
  line-height: 1.45;
}

.tarjetaPrograma__footer {
  margin-top: 0.85rem;
  border-top: 1px dashed #e5e7eb;
  padding-top: 0.8rem;
}

.tarjetaPrograma__observaciones {
  display: flex;
  align-items: flex-start;
  gap: 0.48rem;
  color: #6b7280;
}

.tarjetaPrograma__observaciones svg {
  flex: 0 0 auto;
  margin-top: 0.08rem;
  color: var(--tarjeta-programa-color);
}

.tarjetaPrograma__observaciones p {
  margin: 0;
  font-size: 0.76rem;
  font-style: italic;
  font-weight: 600;
  line-height: 1.45;
}

.tarjetaPrograma--compacta {
  border-radius: 0.95rem;
  padding: 0.9rem;
}

.tarjetaPrograma--compacta .tarjetaPrograma__metricas,
.tarjetaPrograma--compacta .tarjetaPrograma__fechas {
  grid-template-columns: 1fr;
}

@media (prefers-reduced-motion: no-preference) {
  .tarjetaPrograma {
    transition:
      transform 180ms ease,
      border-color 180ms ease,
      box-shadow 180ms ease;
  }

  .tarjetaPrograma:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--tarjeta-programa-color) 28%, #ffffff);
    box-shadow:
      0 20px 44px rgba(31, 41, 55, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }
}

@media (max-width: 620px) {
  .tarjetaPrograma__header {
    flex-direction: column;
  }

  .tarjetaPrograma__estado {
    align-self: flex-start;
  }

  .tarjetaPrograma__metricas,
  .tarjetaPrograma__fechas {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tarjetaPrograma {
    transition: none;
  }

  .tarjetaPrograma:hover {
    transform: none;
  }
}
</style>
