<!-- src/components/kpis/TarjetaKpi.vue -->

<template>
  <article
    class="tarjetaKpi"
    :class="clasesTarjeta"
    :style="estilosTarjeta"
    :aria-label="ariaLabel"
  >
    <div class="tarjetaKpi__decoracion" aria-hidden="true"></div>

    <div class="tarjetaKpi__contenido">
      <div class="tarjetaKpi__superior">
        <div v-if="icono" class="tarjetaKpi__icono" aria-hidden="true">
          <component :is="icono" :size="tamanoIcono" stroke-width="2.2" />
        </div>

        <span v-if="mostrarEstado" class="tarjetaKpi__estado">
          <span class="tarjetaKpi__estadoPunto"></span>
          {{ textoEstado }}
        </span>
      </div>

      <div class="tarjetaKpi__cuerpo">
        <p class="tarjetaKpi__titulo">
          {{ titulo }}
        </p>

        <strong class="tarjetaKpi__valor">
          {{ valor }}
        </strong>

        <p v-if="subtitulo" class="tarjetaKpi__subtitulo">
          {{ subtitulo }}
        </p>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  titulo: {
    type: String,
    required: true,
  },
  valor: {
    type: [String, Number],
    required: true,
  },
  subtitulo: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '#9f2241',
  },
  icono: {
    type: [Object, Function, String],
    default: null,
  },
  estado: {
    type: String,
    default: 'neutral',
    validator: (valor) => {
      return ['neutral', 'completo', 'parcial', 'pendiente', 'alerta', 'error'].includes(valor)
    },
  },
  mostrarEstado: {
    type: Boolean,
    default: false,
  },
  textoEstadoPersonalizado: {
    type: String,
    default: '',
  },
  tamanoIcono: {
    type: Number,
    default: 22,
  },
  compacto: {
    type: Boolean,
    default: false,
  },
})

const configuracionEstado = computed(() => {
  const estados = {
    neutral: {
      texto: 'Disponible',
      color: '#6b7280',
    },
    completo: {
      texto: 'Completo',
      color: '#059669',
    },
    parcial: {
      texto: 'Parcial',
      color: '#b45309',
    },
    pendiente: {
      texto: 'Pendiente',
      color: '#9ca3af',
    },
    alerta: {
      texto: 'Revisar',
      color: '#d97706',
    },
    error: {
      texto: 'Error',
      color: '#dc2626',
    },
  }

  return estados[props.estado] || estados.neutral
})

const textoEstado = computed(() => {
  return props.textoEstadoPersonalizado || configuracionEstado.value.texto
})

const estilosTarjeta = computed(() => {
  return {
    '--tarjeta-kpi-color': validarColor(props.color),
    '--tarjeta-kpi-estado-color': configuracionEstado.value.color,
  }
})

const clasesTarjeta = computed(() => {
  return {
    'tarjetaKpi--compacta': props.compacto,
    [`tarjetaKpi--${props.estado}`]: true,
  }
})

const ariaLabel = computed(() => {
  const partes = [
    props.titulo,
    String(props.valor),
    props.subtitulo,
    props.mostrarEstado ? textoEstado.value : '',
  ].filter(Boolean)

  return partes.join('. ')
})

function validarColor(color) {
  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    return color
  }

  return '#9f2241'
}
</script>

<style scoped>
.tarjetaKpi {
  position: relative;
  min-height: 150px;
  overflow: hidden;
  border: 1px solid rgba(159, 34, 65, 0.1);
  border-radius: 1.35rem;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.84));
  box-shadow:
    0 18px 45px rgba(31, 41, 55, 0.07),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  color: #111827;
  isolation: isolate;
}

.tarjetaKpi::before {
  position: absolute;
  inset: 0;
  z-index: -1;
  content: '';
  background: radial-gradient(
    circle at top right,
    color-mix(in srgb, var(--tarjeta-kpi-color) 18%, transparent),
    transparent 13rem
  );
  opacity: 0.95;
}

.tarjetaKpi__decoracion {
  position: absolute;
  top: 0;
  left: 0;
  width: 0.42rem;
  height: 100%;
  background: linear-gradient(
    180deg,
    var(--tarjeta-kpi-color),
    color-mix(in srgb, var(--tarjeta-kpi-color) 48%, #ffffff)
  );
}

.tarjetaKpi__contenido {
  display: flex;
  flex-direction: column;
  min-height: inherit;
  padding: 1.15rem 1.2rem 1.1rem 1.35rem;
}

.tarjetaKpi__superior {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 2.8rem;
  margin-bottom: 0.6rem;
}

.tarjetaKpi__icono {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid color-mix(in srgb, var(--tarjeta-kpi-color) 18%, #ffffff);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--tarjeta-kpi-color) 10%, #ffffff);
  color: var(--tarjeta-kpi-color);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75);
}

.tarjetaKpi__estado {
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  max-width: 9rem;
  border: 1px solid color-mix(in srgb, var(--tarjeta-kpi-estado-color) 18%, #ffffff);
  border-radius: 999px;
  background: color-mix(in srgb, var(--tarjeta-kpi-estado-color) 9%, #ffffff);
  padding: 0.32rem 0.58rem;
  color: var(--tarjeta-kpi-estado-color);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.045em;
  text-transform: uppercase;
  white-space: nowrap;
}

.tarjetaKpi__estadoPunto {
  flex: 0 0 auto;
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 999px;
  background: var(--tarjeta-kpi-estado-color);
  box-shadow: 0 0 0 0.22rem color-mix(in srgb, var(--tarjeta-kpi-estado-color) 14%, transparent);
}

.tarjetaKpi__cuerpo {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-end;
  min-width: 0;
}

.tarjetaKpi__titulo {
  margin: 0 0 0.4rem;
  color: #6b7280;
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.09em;
  line-height: 1.25;
  text-transform: uppercase;
}

.tarjetaKpi__valor {
  display: block;
  color: #111827;
  font-size: clamp(2rem, 4vw, 3.05rem);
  font-weight: 950;
  letter-spacing: -0.06em;
  line-height: 0.95;
}

.tarjetaKpi__subtitulo {
  margin: 0.62rem 0 0;
  color: #6b7280;
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.45;
}

.tarjetaKpi--compacta {
  min-height: 118px;
  border-radius: 1rem;
}

.tarjetaKpi--compacta .tarjetaKpi__contenido {
  padding: 0.95rem 1rem 0.95rem 1.15rem;
}

.tarjetaKpi--compacta .tarjetaKpi__superior {
  min-height: 2.25rem;
  margin-bottom: 0.35rem;
}

.tarjetaKpi--compacta .tarjetaKpi__icono {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.75rem;
}

.tarjetaKpi--compacta .tarjetaKpi__valor {
  font-size: clamp(1.65rem, 3vw, 2.35rem);
}

@media (prefers-reduced-motion: no-preference) {
  .tarjetaKpi {
    transition:
      transform 180ms ease,
      box-shadow 180ms ease,
      border-color 180ms ease;
  }

  .tarjetaKpi:hover {
    transform: translateY(-3px);
    border-color: color-mix(in srgb, var(--tarjeta-kpi-color) 28%, #ffffff);
    box-shadow:
      0 22px 52px rgba(31, 41, 55, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }
}

@media (max-width: 640px) {
  .tarjetaKpi {
    min-height: 132px;
  }

  .tarjetaKpi__contenido {
    padding: 1rem 1rem 1rem 1.15rem;
  }

  .tarjetaKpi__estado {
    max-width: 8rem;
  }
}
</style>
