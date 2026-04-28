<!-- src/components/layout/FooterInstitucional.vue -->

<template>
  <footer
    class="footerInstitucional"
    :class="clasesFooter"
    :style="estilosFooter"
    role="contentinfo"
  >
    <div class="footerInstitucional__fondo" aria-hidden="true"></div>

    <div class="footerInstitucional__contenido">
      <div class="footerInstitucional__marca">
        <img
          v-if="mostrarLogo && rutaLogo"
          class="footerInstitucional__logo"
          :src="rutaLogo"
          alt="Gobierno de la Ciudad de México"
          loading="lazy"
        />

        <div v-else class="footerInstitucional__emblema" aria-hidden="true">CDMX</div>

        <div class="footerInstitucional__textos">
          <p class="footerInstitucional__titulo">
            {{ titulo }}
          </p>

          <p class="footerInstitucional__subtitulo">
            {{ subtitulo }}
          </p>
        </div>
      </div>

      <div class="footerInstitucional__detalle">
        <p>© {{ anioActual }} {{ institucion }}</p>

        <p>
          {{ administracion }}
        </p>

        <p v-if="mostrarFechaActualizacion">Actualizado: {{ fechaActualizacionFormateada }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  titulo: {
    type: String,
    default: 'Ciudad de México',
  },
  subtitulo: {
    type: String,
    default: 'Tablero de avance de proyectos',
  },
  institucion: {
    type: String,
    default: 'Gobierno de la Ciudad de México',
  },
  administracion: {
    type: String,
    default: 'Administración 2024–2030',
  },
  fechaActualizacion: {
    type: [String, Date],
    default: null,
  },
  mostrarFechaActualizacion: {
    type: Boolean,
    default: true,
  },
  rutaLogo: {
    type: String,
    default: '/img/cdmx_logo.png',
  },
  mostrarLogo: {
    type: Boolean,
    default: true,
  },
  variante: {
    type: String,
    default: 'guinda',
    validator: (valor) => {
      return ['guinda', 'neutro', 'oscuro'].includes(valor)
    },
  },
  color: {
    type: String,
    default: '#9f2241',
  },
})

const anioActual = computed(() => {
  return new Date().getFullYear()
})

const fechaActualizacionFormateada = computed(() => {
  const fechaBase = props.fechaActualizacion || new Date()
  const fecha = fechaBase instanceof Date ? fechaBase : new Date(fechaBase)

  if (Number.isNaN(fecha.getTime())) {
    return 'pendiente'
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(fecha)
})

const estilosFooter = computed(() => {
  return {
    '--footer-institucional-color': validarColor(props.color),
  }
})

const clasesFooter = computed(() => {
  return {
    'footerInstitucional--guinda': props.variante === 'guinda',
    'footerInstitucional--neutro': props.variante === 'neutro',
    'footerInstitucional--oscuro': props.variante === 'oscuro',
  }
})

function validarColor(valor) {
  if (/^#[0-9a-fA-F]{6}$/.test(valor || '')) {
    return valor
  }

  return '#9f2241'
}
</script>

<style scoped>
.footerInstitucional {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.footerInstitucional__fondo {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}

.footerInstitucional__contenido {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.15rem clamp(1rem, 4vw, 3rem);
}

.footerInstitucional__marca {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
}

.footerInstitucional__logo {
  width: auto;
  max-width: 150px;
  max-height: 42px;
  object-fit: contain;
}

.footerInstitucional__emblema {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 3rem;
  height: 3rem;
  border-radius: 0.95rem;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 950;
  letter-spacing: 0.08em;
}

.footerInstitucional__textos {
  min-width: 0;
}

.footerInstitucional__titulo {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 950;
  letter-spacing: 0.08em;
  line-height: 1.2;
  text-transform: uppercase;
}

.footerInstitucional__subtitulo {
  margin: 0.18rem 0 0;
  font-size: 0.74rem;
  font-weight: 650;
  line-height: 1.35;
}

.footerInstitucional__detalle {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  gap: 0.18rem;
  text-align: right;
}

.footerInstitucional__detalle p {
  margin: 0;
  font-size: 0.74rem;
  font-weight: 650;
  line-height: 1.35;
}

/* Variante guinda */
.footerInstitucional--guinda {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--footer-institucional-color) 88%, #2b0b18),
    color-mix(in srgb, var(--footer-institucional-color) 68%, #5f1730)
  );
  color: #ffffff;
}

.footerInstitucional--guinda .footerInstitucional__fondo {
  background:
    radial-gradient(circle at 12% 20%, rgba(255, 255, 255, 0.12), transparent 16rem),
    radial-gradient(circle at 88% 20%, rgba(188, 149, 92, 0.18), transparent 18rem);
}

.footerInstitucional--guinda .footerInstitucional__subtitulo,
.footerInstitucional--guinda .footerInstitucional__detalle {
  color: rgba(255, 255, 255, 0.74);
}

/* Variante neutra */
.footerInstitucional--neutro {
  border-top: 1px solid rgba(159, 34, 65, 0.12);
  background: rgba(255, 255, 255, 0.72);
  color: #111827;
  backdrop-filter: blur(14px);
}

.footerInstitucional--neutro .footerInstitucional__emblema {
  background: rgba(159, 34, 65, 0.1);
  color: var(--footer-institucional-color);
}

.footerInstitucional--neutro .footerInstitucional__subtitulo,
.footerInstitucional--neutro .footerInstitucional__detalle {
  color: #6b7280;
}

/* Variante oscura */
.footerInstitucional--oscuro {
  background: #111827;
  color: #ffffff;
}

.footerInstitucional--oscuro .footerInstitucional__fondo {
  background:
    radial-gradient(circle at 20% 0%, rgba(159, 34, 65, 0.28), transparent 16rem),
    radial-gradient(circle at 86% 0%, rgba(188, 149, 92, 0.18), transparent 18rem);
}

.footerInstitucional--oscuro .footerInstitucional__subtitulo,
.footerInstitucional--oscuro .footerInstitucional__detalle {
  color: rgba(255, 255, 255, 0.68);
}

@media (max-width: 760px) {
  .footerInstitucional__contenido {
    align-items: flex-start;
    flex-direction: column;
  }

  .footerInstitucional__detalle {
    align-items: flex-start;
    text-align: left;
  }

  .footerInstitucional__logo {
    max-width: 132px;
  }
}
</style>
