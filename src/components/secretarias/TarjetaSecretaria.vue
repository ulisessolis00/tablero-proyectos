<!-- src/components/secretarias/TarjetaSecretaria.vue -->

<template>
  <article
    class="tarjetaSecretaria"
    :class="clasesTarjeta"
    :style="estilosTarjeta"
    @click="seleccionarSecretaria"
    @keydown.enter="seleccionarSecretaria"
    @keydown.space.prevent="seleccionarSecretaria"
    tabindex="0"
  >
    <div class="tarjetaSecretaria__decoracion" aria-hidden="true"></div>

    <header class="tarjetaSecretaria__superior">
      <div class="tarjetaSecretaria__badges">
        <span class="tarjetaSecretaria__sigla">
          {{ sigla }}
        </span>

        <span v-if="!tieneDatos" class="tarjetaSecretaria__badgeSecundario"> Próximamente </span>
      </div>

      <span class="tarjetaSecretaria__estado" :title="textoEstadoDato">
        <span class="tarjetaSecretaria__estadoPunto"></span>
        {{ textoEstadoDato }}
      </span>
    </header>

    <div class="tarjetaSecretaria__contenido">
      <h3 class="tarjetaSecretaria__nombre">
        {{ nombre }}
      </h3>

      <div class="tarjetaSecretaria__titular">
        <div class="tarjetaSecretaria__avatar" aria-hidden="true">
          <UserRound :size="18" stroke-width="2.2" />
        </div>

        <div class="tarjetaSecretaria__titularTextos">
          <span class="tarjetaSecretaria__titularEtiqueta"> Titular </span>

          <span class="tarjetaSecretaria__titularNombre">
            {{ titular }}
          </span>
        </div>
      </div>

      <div class="tarjetaSecretaria__metricas">
        <div class="tarjetaSecretaria__metrica">
          <span class="tarjetaSecretaria__metricaIcono" aria-hidden="true">
            <Layers3 :size="17" stroke-width="2.2" />
          </span>

          <div>
            <strong class="tarjetaSecretaria__metricaValor">
              {{ totalProgramas }}
            </strong>

            <span class="tarjetaSecretaria__metricaTexto"> Programas </span>
          </div>
        </div>

        <div class="tarjetaSecretaria__metrica">
          <span class="tarjetaSecretaria__metricaIcono" aria-hidden="true">
            <Tags :size="17" stroke-width="2.2" />
          </span>

          <div>
            <strong class="tarjetaSecretaria__metricaValor">
              {{ totalTiposPrograma }}
            </strong>

            <span class="tarjetaSecretaria__metricaTexto"> Clasificación </span>
          </div>
        </div>
      </div>

      <p v-if="descripcionTipos" class="tarjetaSecretaria__tipos">
        {{ descripcionTipos }}
      </p>
    </div>

    <footer class="tarjetaSecretaria__footer">
      <button
        v-if="mostrarBoton"
        class="tarjetaSecretaria__boton"
        type="button"
        :disabled="!tieneDatos"
        @click.stop="verDetalleSecretaria"
      >
        <span>{{ textoBoton }}</span>
        <ArrowRight :size="16" stroke-width="2.4" />
      </button>

      <span v-else class="tarjetaSecretaria__textoFooter">
        {{ textoFooter }}
      </span>
    </footer>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowRight, Layers3, Tags, UserRound } from 'lucide-vue-next'

import {
  crearResumenSecretaria,
  ESTADO_DATO,
} from '../../models/secretarias/modeloDatosSecretarias'

import { metadataSecretarias } from '../../data/catalogos/metadataSecretarias'

const props = defineProps({
  secretaria: {
    type: Object,
    required: true,
  },
  compacta: {
    type: Boolean,
    default: false,
  },
  mostrarBoton: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['seleccionar', 'verDetalle'])

const resumen = computed(() => {
  return crearResumenSecretaria(props.secretaria)
})

const metadataActual = computed(() => {
  return buscarMetadataSecretaria(props.secretaria)
})

const sigla = computed(() => {
  return metadataActual.value?.sigla || props.secretaria.sigla || props.secretaria.id || 'N/D'
})

const nombre = computed(() => {
  return metadataActual.value?.nombre || props.secretaria.nombre || 'Secretaría sin nombre'
})

const titular = computed(() => {
  return metadataActual.value?.titular || props.secretaria.titular || 'Por capturar'
})

const color = computed(() => {
  return validarColor(metadataActual.value?.color || props.secretaria.color)
})

const programas = computed(() => {
  return Array.isArray(props.secretaria.programas) ? props.secretaria.programas : []
})

const tieneDatos = computed(() => {
  return programas.value.length > 0
})

const totalProgramas = computed(() => {
  return formatearEntero(resumen.value.totalProgramas)
})

const totalTiposPrograma = computed(() => {
  return formatearEntero(resumen.value.totalTiposPrograma)
})

const descripcionTipos = computed(() => {
  const tipos = resumen.value.tiposPrograma || []

  if (!tieneDatos.value) {
    return 'La información de esta dependencia se encuentra en preparación.'
  }

  if (tipos.length === 0) {
    return 'Sin clasificación reportada.'
  }

  if (tipos.length <= 2) {
    return tipos.join(' · ')
  }

  return `${tipos.slice(0, 2).join(' · ')} · +${tipos.length - 2} más`
})

const configuracionEstadoDato = computed(() => {
  const estado = tieneDatos.value ? resumen.value.estadoDato : ESTADO_DATO.sinDatos

  const estados = {
    [ESTADO_DATO.completo]: {
      texto: 'Completo',
      color: '#059669',
    },
    [ESTADO_DATO.parcial]: {
      texto: 'Parcial',
      color: '#b45309',
    },
    [ESTADO_DATO.pendiente]: {
      texto: 'Pendiente',
      color: '#9ca3af',
    },
    [ESTADO_DATO.sinDatos]: {
      texto: 'Sin datos',
      color: '#9ca3af',
    },
  }

  return estados[estado] || estados[ESTADO_DATO.pendiente]
})

const textoEstadoDato = computed(() => {
  return configuracionEstadoDato.value.texto
})

const textoBoton = computed(() => {
  return tieneDatos.value ? 'Ver programas' : 'Sin información'
})

const textoFooter = computed(() => {
  return tieneDatos.value ? 'Información disponible' : 'Datos en preparación'
})

const estilosTarjeta = computed(() => {
  return {
    '--tarjeta-secretaria-color': color.value,
    '--tarjeta-secretaria-estado-color': configuracionEstadoDato.value.color,
  }
})

const clasesTarjeta = computed(() => {
  return {
    'tarjetaSecretaria--compacta': props.compacta,
    'tarjetaSecretaria--sinDatos': !tieneDatos.value,
  }
})

function seleccionarSecretaria() {
  emit('seleccionar', props.secretaria)
}

function verDetalleSecretaria() {
  if (!tieneDatos.value) {
    return
  }

  emit('verDetalle', {
    ...props.secretaria,
    id: metadataActual.value?.id || props.secretaria.id,
    sigla: sigla.value,
    nombre: nombre.value,
    titular: titular.value,
    color: color.value,
  })
}

function buscarMetadataSecretaria(secretaria = {}) {
  const listaMetadata = normalizarListaMetadata(metadataSecretarias)

  const candidatosSecretaria = [
    secretaria.id,
    secretaria.sigla,
    secretaria.nombre,
    secretaria.hoja,
    secretaria.hojaFuente,
    secretaria.nombreHoja,
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
.tarjetaSecretaria {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 285px;
  overflow: hidden;
  border: 1px solid rgba(159, 34, 65, 0.1);
  border-radius: 1.35rem;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.86));
  box-shadow:
    0 18px 45px rgba(31, 41, 55, 0.07),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  color: #111827;
  cursor: pointer;
  isolation: isolate;
}

.tarjetaSecretaria::before {
  position: absolute;
  inset: 0;
  z-index: -1;
  content: '';
  background: radial-gradient(
    circle at top right,
    color-mix(in srgb, var(--tarjeta-secretaria-color) 14%, transparent),
    transparent 13rem
  );
  opacity: 0.95;
}

.tarjetaSecretaria:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--tarjeta-secretaria-color) 34%, transparent);
  outline-offset: 4px;
}

.tarjetaSecretaria__decoracion {
  position: absolute;
  inset: 0 auto 0 0;
  width: 0.42rem;
  background: linear-gradient(
    180deg,
    var(--tarjeta-secretaria-color),
    color-mix(in srgb, var(--tarjeta-secretaria-color) 44%, #ffffff)
  );
}

.tarjetaSecretaria__superior {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1.15rem 1.15rem 0;
}

.tarjetaSecretaria__badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.tarjetaSecretaria__sigla {
  display: inline-flex;
  align-items: center;
  min-height: 1.75rem;
  border-radius: 0.62rem;
  background: var(--tarjeta-secretaria-color);
  box-shadow: 0 10px 22px color-mix(in srgb, var(--tarjeta-secretaria-color) 22%, transparent);
  color: #ffffff;
  padding: 0.35rem 0.72rem;
  font-size: 0.72rem;
  font-weight: 950;
  letter-spacing: 0.08em;
  line-height: 1;
  text-transform: uppercase;
}

.tarjetaSecretaria__badgeSecundario {
  display: inline-flex;
  align-items: center;
  min-height: 1.65rem;
  border-radius: 0.55rem;
  background: #f3f4f6;
  color: #9ca3af;
  padding: 0.34rem 0.62rem;
  font-size: 0.66rem;
  font-weight: 850;
  letter-spacing: 0.06em;
  line-height: 1;
  text-transform: uppercase;
}

.tarjetaSecretaria__estado {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  max-width: 8rem;
  border: 1px solid color-mix(in srgb, var(--tarjeta-secretaria-estado-color) 18%, #ffffff);
  border-radius: 999px;
  background: color-mix(in srgb, var(--tarjeta-secretaria-estado-color) 8%, #ffffff);
  color: var(--tarjeta-secretaria-estado-color);
  padding: 0.34rem 0.58rem;
  font-size: 0.66rem;
  font-weight: 900;
  letter-spacing: 0.055em;
  text-transform: uppercase;
  white-space: nowrap;
}

.tarjetaSecretaria__estadoPunto {
  flex: 0 0 auto;
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 999px;
  background: var(--tarjeta-secretaria-estado-color);
  box-shadow: 0 0 0 0.22rem
    color-mix(in srgb, var(--tarjeta-secretaria-estado-color) 14%, transparent);
}

.tarjetaSecretaria__contenido {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 1rem 1.15rem 0.95rem;
}

.tarjetaSecretaria__nombre {
  min-height: 2.6rem;
  margin: 0;
  color: #111827;
  font-size: 1.05rem;
  font-weight: 900;
  letter-spacing: -0.025em;
  line-height: 1.25;
  text-wrap: balance;
}

.tarjetaSecretaria__titular {
  display: flex;
  align-items: center;
  gap: 0.72rem;
  margin-top: 1rem;
}

.tarjetaSecretaria__avatar {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 2.45rem;
  height: 2.45rem;
  border: 2px solid color-mix(in srgb, var(--tarjeta-secretaria-color) 32%, #ffffff);
  border-radius: 999px;
  background: linear-gradient(135deg, #f9fafb, #eef2f7);
  color: color-mix(in srgb, var(--tarjeta-secretaria-color) 72%, #6b7280);
}

.tarjetaSecretaria__titularTextos {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.tarjetaSecretaria__titularEtiqueta {
  color: #9ca3af;
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  line-height: 1.2;
  text-transform: uppercase;
}

.tarjetaSecretaria__titularNombre {
  display: -webkit-box;
  overflow: hidden;
  color: #374151;
  font-size: 0.82rem;
  font-weight: 750;
  line-height: 1.3;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.tarjetaSecretaria__metricas {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
  margin-top: 1.1rem;
  border-top: 1px solid rgba(229, 231, 235, 0.85);
  padding-top: 0.95rem;
}

.tarjetaSecretaria__metrica {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
}

.tarjetaSecretaria__metricaIcono {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 0.72rem;
  background: color-mix(in srgb, var(--tarjeta-secretaria-color) 9%, #ffffff);
  color: var(--tarjeta-secretaria-color);
}

.tarjetaSecretaria__metricaValor {
  display: block;
  color: var(--tarjeta-secretaria-color);
  font-size: 1.2rem;
  font-weight: 950;
  letter-spacing: -0.04em;
  line-height: 1;
}

.tarjetaSecretaria__metricaTexto {
  display: block;
  margin-top: 0.14rem;
  overflow: hidden;
  color: #9ca3af;
  font-size: 0.62rem;
  font-weight: 850;
  letter-spacing: 0.055em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.tarjetaSecretaria__tipos {
  display: -webkit-box;
  overflow: hidden;
  min-height: 2.35rem;
  margin: 0.85rem 0 0;
  color: #6b7280;
  font-size: 0.78rem;
  font-weight: 650;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.tarjetaSecretaria__footer {
  display: flex;
  justify-content: flex-start;
  padding: 0 1.15rem 1.15rem;
}

.tarjetaSecretaria__boton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border: 0;
  border-radius: 0.82rem;
  background: var(--tarjeta-secretaria-color);
  box-shadow: 0 12px 22px color-mix(in srgb, var(--tarjeta-secretaria-color) 18%, transparent);
  color: #ffffff;
  padding: 0.65rem 0.95rem;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 900;
  cursor: pointer;
  transition:
    transform 180ms ease,
    filter 180ms ease,
    opacity 180ms ease;
}

.tarjetaSecretaria__boton:hover:not(:disabled) {
  filter: brightness(1.06);
  transform: translateY(-1px);
}

.tarjetaSecretaria__boton:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--tarjeta-secretaria-color) 32%, transparent);
  outline-offset: 3px;
}

.tarjetaSecretaria__boton:disabled {
  background: #e5e7eb;
  box-shadow: none;
  color: #9ca3af;
  cursor: not-allowed;
}

.tarjetaSecretaria__textoFooter {
  color: #9ca3af;
  font-size: 0.76rem;
  font-weight: 750;
}

.tarjetaSecretaria--sinDatos {
  opacity: 0.78;
}

.tarjetaSecretaria--compacta {
  min-height: 230px;
  border-radius: 1.05rem;
}

.tarjetaSecretaria--compacta .tarjetaSecretaria__superior {
  padding: 0.95rem 0.95rem 0;
}

.tarjetaSecretaria--compacta .tarjetaSecretaria__contenido {
  padding: 0.85rem 0.95rem;
}

.tarjetaSecretaria--compacta .tarjetaSecretaria__footer {
  padding: 0 0.95rem 0.95rem;
}

.tarjetaSecretaria--compacta .tarjetaSecretaria__nombre {
  min-height: auto;
  font-size: 0.96rem;
}

@media (prefers-reduced-motion: no-preference) {
  .tarjetaSecretaria {
    transition:
      transform 180ms ease,
      box-shadow 180ms ease,
      border-color 180ms ease;
  }

  .tarjetaSecretaria:hover {
    transform: translateY(-4px);
    border-color: color-mix(in srgb, var(--tarjeta-secretaria-color) 30%, #ffffff);
    box-shadow:
      0 24px 55px rgba(31, 41, 55, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }
}

@media (max-width: 520px) {
  .tarjetaSecretaria {
    min-height: auto;
  }

  .tarjetaSecretaria__superior {
    flex-direction: column;
  }

  .tarjetaSecretaria__estado {
    align-self: flex-start;
  }
}
</style>
