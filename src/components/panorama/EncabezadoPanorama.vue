<!-- src/components/panorama/EncabezadoPanorama.vue -->

<template>
  <section class="encabezadoPanorama">
    <div class="encabezadoPanorama__fondo" aria-hidden="true"></div>
    <div class="encabezadoPanorama__brillo" aria-hidden="true"></div>

    <img
      v-if="mostrarAjolote"
      class="encabezadoPanorama__ajolote"
      :src="rutaAjolote"
      alt=""
      loading="eager"
      aria-hidden="true"
    />

    <div class="encabezadoPanorama__contenido">
      <div class="encabezadoPanorama__superior">
        <div class="encabezadoPanorama__marca">
          <div class="encabezadoPanorama__logoContenedor">
            <img
              v-if="rutaLogo"
              class="encabezadoPanorama__logo"
              :src="rutaLogo"
              alt="Gobierno de la Ciudad de México"
            />

            <span v-else class="encabezadoPanorama__logoTexto" aria-hidden="true"> CDMX </span>
          </div>

          <div class="encabezadoPanorama__marcaTextos">
            <p class="encabezadoPanorama__marcaTitulo">
              {{ marcaTitulo }}
            </p>

            <p class="encabezadoPanorama__marcaSubtitulo">
              {{ marcaSubtitulo }}
            </p>
          </div>
        </div>

        <div class="encabezadoPanorama__estado">
          <span class="encabezadoPanorama__estadoPunto"></span>
          <span>{{ textoActualizacion }}</span>
        </div>
      </div>

      <div class="encabezadoPanorama__cuerpo">
        <div class="encabezadoPanorama__texto">
          <p class="encabezadoPanorama__etiqueta">
            {{ etiqueta }}
          </p>

          <h1 class="encabezadoPanorama__titulo">
            {{ titulo }}
          </h1>

          <p class="encabezadoPanorama__subtitulo">
            {{ subtitulo }}
          </p>
        </div>
      </div>

      <div class="encabezadoPanorama__kpis" aria-label="Indicadores generales">
        <article v-for="kpi in kpisVisibles" :key="kpi.id" class="encabezadoPanorama__kpi">
          <div class="encabezadoPanorama__kpiIcono">
            <component :is="kpi.icono" :size="20" stroke-width="2.2" />
          </div>

          <div class="encabezadoPanorama__kpiTexto">
            <strong class="encabezadoPanorama__kpiValor">
              {{ kpi.valor }}
            </strong>

            <span class="encabezadoPanorama__kpiTitulo">
              {{ kpi.titulo }}
            </span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { Building2, Database, Layers3, PercentCircle } from 'lucide-vue-next'

const props = defineProps({
  titulo: {
    type: String,
    default: 'Panorama Ejecutivo',
  },
  subtitulo: {
    type: String,
    default: 'Programas y acciones de la Administración 2024–2030',
  },
  etiqueta: {
    type: String,
    default: 'Tablero de avance de proyectos',
  },
  marcaTitulo: {
    type: String,
    default: 'Ciudad de México',
  },
  marcaSubtitulo: {
    type: String,
    default: 'Capital de la Transformación',
  },
  fechaActualizacion: {
    type: [String, Date],
    default: () => new Date(),
  },
  rutaAjolote: {
    type: String,
    default: '/img/ajolote.png',
  },
  rutaLogo: {
    type: String,
    default: '/img/cdmx_logo.png',
  },
  rutaFondo: {
    type: String,
    default: '/img/rojo_header.png',
  },
  mostrarAjolote: {
    type: Boolean,
    default: true,
  },
  resumen: {
    type: Object,
    default: () => ({
      totalSecretarias: 0,
      totalSecretariasConDatos: 0,
      totalProgramas: 0,
      porcentajeIntegrado: 0,
    }),
  },
})

const textoActualizacion = computed(() => {
  return `Actualizado: ${formatearFecha(props.fechaActualizacion)}`
})

const kpisVisibles = computed(() => {
  return [
    {
      id: 'secretarias',
      titulo: 'Secretarías',
      valor: formatearEntero(props.resumen.totalSecretarias),
      icono: Building2,
    },
    {
      id: 'con-datos',
      titulo: 'Con datos',
      valor: formatearEntero(props.resumen.totalSecretariasConDatos),
      icono: Database,
    },
    {
      id: 'programas',
      titulo: 'Programas',
      valor: formatearEntero(props.resumen.totalProgramas),
      icono: Layers3,
    },
    {
      id: 'integrado',
      titulo: 'Integrado',
      valor: `${formatearEntero(props.resumen.porcentajeIntegrado)}%`,
      icono: PercentCircle,
    },
  ]
})

function formatearEntero(valor) {
  const numero = Number(valor)

  if (!Number.isFinite(numero)) {
    return '0'
  }

  return new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: 0,
  }).format(numero)
}

function formatearFecha(valor) {
  const fecha = valor instanceof Date ? valor : new Date(valor)

  if (Number.isNaN(fecha.getTime())) {
    return 'fecha pendiente'
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(fecha)
}
</script>

<style scoped>
.encabezadoPanorama {
  position: relative;
  min-height: 330px;
  overflow: hidden;
  isolation: isolate;
  color: #ffffff;
  background:
    linear-gradient(
      135deg,
      rgba(96, 20, 48, 0.94),
      rgba(130, 35, 71, 0.86) 48%,
      rgba(159, 34, 65, 0.78)
    ),
    v-bind("'url(' + props.rutaFondo + ')'");
  background-size: cover;
  background-position: center top;
  box-shadow: 0 24px 60px rgba(94, 24, 52, 0.2);
}

.encabezadoPanorama::after {
  position: absolute;
  inset: auto 0 0;
  z-index: 1;
  height: 42%;
  content: '';
  background: linear-gradient(180deg, transparent, rgba(48, 11, 28, 0.3));
  pointer-events: none;
}

.encabezadoPanorama__fondo {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(circle at 16% 22%, rgba(255, 255, 255, 0.16), transparent 18rem),
    radial-gradient(circle at 80% 12%, rgba(188, 149, 92, 0.28), transparent 20rem);
  pointer-events: none;
}

.encabezadoPanorama__brillo {
  position: absolute;
  top: -18rem;
  right: 9rem;
  z-index: 0;
  width: 34rem;
  height: 34rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.09);
  filter: blur(12px);
  pointer-events: none;
}

.encabezadoPanorama__ajolote {
  position: absolute;
  right: clamp(1rem, 5vw, 4rem);
  bottom: -0.4rem;
  z-index: 2;
  width: min(28vw, 320px);
  min-width: 220px;
  max-height: 94%;
  object-fit: contain;
  filter: drop-shadow(0 18px 30px rgba(0, 0, 0, 0.32));
  pointer-events: none;
  user-select: none;
}

.encabezadoPanorama__contenido {
  position: relative;
  z-index: 3;
  max-width: 1400px;
  margin: 0 auto;
  padding: clamp(1.5rem, 4vw, 3rem);
}

.encabezadoPanorama__superior {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: clamp(1.5rem, 3vw, 2.25rem);
}

.encabezadoPanorama__marca {
  display: inline-flex;
  align-items: center;
  gap: 0.9rem;
}

.encabezadoPanorama__logoContenedor {
  display: grid;
  place-items: center;
  width: 4.15rem;
  height: 4.15rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 1.1rem;
  background: rgba(255, 255, 255, 0.14);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
}

.encabezadoPanorama__logo {
  max-width: 82%;
  max-height: 72%;
  object-fit: contain;
}

.encabezadoPanorama__logoTexto {
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.encabezadoPanorama__marcaTextos {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.encabezadoPanorama__marcaTitulo {
  margin: 0;
  font-size: clamp(0.95rem, 1.4vw, 1.12rem);
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.encabezadoPanorama__marcaSubtitulo {
  margin: 0;
  color: rgba(255, 255, 255, 0.74);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.encabezadoPanorama__estado {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.13);
  backdrop-filter: blur(10px);
  padding: 0.55rem 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.encabezadoPanorama__estadoPunto {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  background: #67e8a5;
  box-shadow: 0 0 0 0.28rem rgba(103, 232, 165, 0.16);
}

.encabezadoPanorama__cuerpo {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 0.36fr);
  gap: 2rem;
}

.encabezadoPanorama__texto {
  max-width: 760px;
}

.encabezadoPanorama__etiqueta {
  display: inline-flex;
  margin: 0 0 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.11);
  padding: 0.38rem 0.72rem;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.encabezadoPanorama__titulo {
  max-width: 720px;
  margin: 0;
  font-size: clamp(2.15rem, 5.2vw, 4.4rem);
  font-weight: 950;
  line-height: 0.94;
  letter-spacing: -0.055em;
  text-transform: uppercase;
  text-wrap: balance;
  text-shadow: 0 8px 22px rgba(42, 9, 25, 0.24);
}

.encabezadoPanorama__subtitulo {
  max-width: 680px;
  margin: 1rem 0 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: clamp(0.92rem, 1.5vw, 1.05rem);
  font-weight: 500;
  line-height: 1.55;
}

.encabezadoPanorama__kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
  max-width: 820px;
  margin-top: clamp(1.75rem, 4vw, 2.5rem);
  padding-top: 1.1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
}

.encabezadoPanorama__kpi {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.105);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 14px 34px rgba(62, 14, 35, 0.14);
  backdrop-filter: blur(12px);
  padding: 0.85rem;
}

.encabezadoPanorama__kpiIcono {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 2.55rem;
  height: 2.55rem;
  border-radius: 0.8rem;
  background: rgba(255, 255, 255, 0.13);
  color: #f7d8a8;
}

.encabezadoPanorama__kpiTexto {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.encabezadoPanorama__kpiValor {
  color: #ffffff;
  font-size: clamp(1.25rem, 2.4vw, 1.75rem);
  font-weight: 950;
  line-height: 1;
}

.encabezadoPanorama__kpiTitulo {
  margin-top: 0.22rem;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

@media (max-width: 980px) {
  .encabezadoPanorama__ajolote {
    opacity: 0.34;
    right: -1rem;
  }

  .encabezadoPanorama__cuerpo {
    grid-template-columns: 1fr;
  }

  .encabezadoPanorama__kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: none;
  }
}

@media (max-width: 720px) {
  .encabezadoPanorama {
    min-height: auto;
  }

  .encabezadoPanorama__contenido {
    padding: 1.25rem;
  }

  .encabezadoPanorama__superior {
    align-items: flex-start;
    flex-direction: column;
  }

  .encabezadoPanorama__estado {
    white-space: normal;
  }

  .encabezadoPanorama__ajolote {
    display: none;
  }

  .encabezadoPanorama__logoContenedor {
    width: 3.4rem;
    height: 3.4rem;
    border-radius: 0.9rem;
  }

  .encabezadoPanorama__marcaSubtitulo {
    font-size: 0.66rem;
  }

  .encabezadoPanorama__kpis {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .encabezadoPanorama__kpi {
    transition:
      transform 180ms ease,
      background 180ms ease,
      border-color 180ms ease;
  }

  .encabezadoPanorama__kpi:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.24);
    background: rgba(255, 255, 255, 0.14);
  }
}
</style>
