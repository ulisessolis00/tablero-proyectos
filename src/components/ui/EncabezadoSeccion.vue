<!-- src/components/ui/EncabezadoSeccion.vue -->

<template>
  <header class="encabezadoSeccion" :class="clasesEncabezado" :style="estilosEncabezado">
    <div class="encabezadoSeccion__contenido">
      <div v-if="mostrarBarra" class="encabezadoSeccion__barra" aria-hidden="true"></div>

      <div class="encabezadoSeccion__textos">
        <p v-if="etiqueta" class="encabezadoSeccion__etiqueta">
          {{ etiqueta }}
        </p>

        <component :is="tagTitulo" class="encabezadoSeccion__titulo">
          <slot name="titulo">
            {{ titulo }}
          </slot>
        </component>

        <p v-if="subtitulo" class="encabezadoSeccion__subtitulo">
          {{ subtitulo }}
        </p>
      </div>
    </div>

    <div v-if="$slots.acciones" class="encabezadoSeccion__acciones">
      <slot name="acciones"></slot>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  titulo: {
    type: String,
    default: '',
  },
  subtitulo: {
    type: String,
    default: '',
  },
  etiqueta: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '#9f2241',
  },
  tagTitulo: {
    type: String,
    default: 'h2',
    validator: (valor) => {
      return ['h1', 'h2', 'h3', 'h4'].includes(valor)
    },
  },
  mostrarBarra: {
    type: Boolean,
    default: true,
  },
  compacto: {
    type: Boolean,
    default: false,
  },
  alineacion: {
    type: String,
    default: 'izquierda',
    validator: (valor) => {
      return ['izquierda', 'centro', 'derecha'].includes(valor)
    },
  },
  variante: {
    type: String,
    default: 'normal',
    validator: (valor) => {
      return ['normal', 'contenida', 'minimal'].includes(valor)
    },
  },
})

const estilosEncabezado = computed(() => {
  return {
    '--encabezado-seccion-color': validarColor(props.color),
  }
})

const clasesEncabezado = computed(() => {
  return {
    'encabezadoSeccion--compacto': props.compacto,
    'encabezadoSeccion--centrado': props.alineacion === 'centro',
    'encabezadoSeccion--derecha': props.alineacion === 'derecha',
    'encabezadoSeccion--contenida': props.variante === 'contenida',
    'encabezadoSeccion--minimal': props.variante === 'minimal',
  }
})

function validarColor(color) {
  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    return color
  }

  return '#9f2241'
}
</script>

<style scoped>
.encabezadoSeccion {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}

.encabezadoSeccion--contenida {
  border: 1px solid rgba(159, 34, 65, 0.1);
  border-radius: 1.35rem;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 18px 45px rgba(31, 41, 55, 0.055);
  backdrop-filter: blur(14px);
  padding: 1rem 1.15rem;
}

.encabezadoSeccion--minimal {
  gap: 0.65rem;
}

.encabezadoSeccion__contenido {
  display: flex;
  align-items: flex-start;
  gap: 0.78rem;
  min-width: 0;
}

.encabezadoSeccion__barra {
  flex: 0 0 auto;
  width: 0.34rem;
  height: 2.1rem;
  margin-top: 0.14rem;
  border-radius: 999px;
  background: linear-gradient(
    180deg,
    var(--encabezado-seccion-color),
    color-mix(in srgb, var(--encabezado-seccion-color) 46%, #ffffff)
  );
  box-shadow: 0 0 0 0.32rem color-mix(in srgb, var(--encabezado-seccion-color) 8%, transparent);
}

.encabezadoSeccion__textos {
  min-width: 0;
}

.encabezadoSeccion__etiqueta {
  margin: 0 0 0.32rem;
  color: var(--encabezado-seccion-color);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.11em;
  line-height: 1.2;
  text-transform: uppercase;
}

.encabezadoSeccion__titulo {
  margin: 0;
  color: #111827;
  font-size: clamp(1.25rem, 2.4vw, 1.65rem);
  font-weight: 950;
  letter-spacing: -0.045em;
  line-height: 1.05;
  text-wrap: balance;
}

.encabezadoSeccion__subtitulo {
  max-width: 760px;
  margin: 0.45rem 0 0;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.5;
}

.encabezadoSeccion__acciones {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 0 auto;
  gap: 0.65rem;
}

.encabezadoSeccion--compacto .encabezadoSeccion__barra {
  height: 1.65rem;
}

.encabezadoSeccion--compacto .encabezadoSeccion__titulo {
  font-size: clamp(1.05rem, 2vw, 1.32rem);
}

.encabezadoSeccion--compacto .encabezadoSeccion__subtitulo {
  margin-top: 0.3rem;
  font-size: 0.82rem;
}

.encabezadoSeccion--centrado {
  align-items: center;
  flex-direction: column;
  text-align: center;
}

.encabezadoSeccion--centrado .encabezadoSeccion__contenido {
  align-items: center;
  flex-direction: column;
}

.encabezadoSeccion--centrado .encabezadoSeccion__barra {
  width: 3rem;
  height: 0.28rem;
  margin-top: 0;
}

.encabezadoSeccion--centrado .encabezadoSeccion__acciones {
  justify-content: center;
}

.encabezadoSeccion--derecha {
  text-align: right;
}

.encabezadoSeccion--derecha .encabezadoSeccion__contenido {
  flex-direction: row-reverse;
}

.encabezadoSeccion--derecha .encabezadoSeccion__acciones {
  justify-content: flex-start;
}

.encabezadoSeccion--minimal .encabezadoSeccion__barra {
  box-shadow: none;
}

@media (max-width: 720px) {
  .encabezadoSeccion {
    align-items: flex-start;
    flex-direction: column;
  }

  .encabezadoSeccion__acciones {
    justify-content: flex-start;
    width: 100%;
  }

  .encabezadoSeccion--derecha {
    text-align: left;
  }

  .encabezadoSeccion--derecha .encabezadoSeccion__contenido {
    flex-direction: row;
  }
}
</style>
