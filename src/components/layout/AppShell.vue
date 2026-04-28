<!-- src/layouts/AppShell.vue -->

<template>
  <div class="appShell">
    <a class="appShell__skip" href="#contenido-principal"> Saltar al contenido </a>

    <div class="appShell__fondo" aria-hidden="true">
      <span class="appShell__mancha appShell__mancha--guinda"></span>
      <span class="appShell__mancha appShell__mancha--dorado"></span>
      <span class="appShell__linea appShell__linea--uno"></span>
      <span class="appShell__linea appShell__linea--dos"></span>
    </div>

    <header v-if="mostrarHeader || $slots.encabezado" class="appShell__header" role="banner">
      <slot name="encabezado">
        <div class="appShell__headerContenido">
          <div class="appShell__marca">
            <span class="appShell__marcaPunto"></span>

            <div>
              <p class="appShell__marcaSuperior">Ciudad de México</p>
              <p class="appShell__marcaInferior">Tablero de avance de proyectos</p>
            </div>
          </div>
        </div>
      </slot>
    </header>

    <main id="contenido-principal" class="appShell__contenido" tabindex="-1">
      <Transition name="vista" mode="out-in">
        <div class="appShell__vista">
          <slot></slot>
        </div>
      </Transition>
    </main>

    <footer v-if="mostrarFooter" class="appShell__footer" role="contentinfo">
      <div class="appShell__footerContenido">
        <p>© {{ anioActual }} Gobierno de la Ciudad de México</p>

        <p class="appShell__footerTextoSecundario">Administración 2024–2030</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineProps({
  mostrarHeader: {
    type: Boolean,
    default: false,
  },
  mostrarFooter: {
    type: Boolean,
    default: true,
  },
})

const anioActual = computed(() => {
  return new Date().getFullYear()
})
</script>

<style scoped>
.appShell {
  position: relative;
  min-height: 100dvh;
  overflow-x: hidden;
  background:
    radial-gradient(circle at top left, rgba(159, 34, 65, 0.09), transparent 34rem),
    radial-gradient(circle at bottom right, rgba(188, 149, 92, 0.1), transparent 32rem), #f4f5f7;
  color: #1f2937;
}

.appShell__skip {
  position: fixed;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 1000;
  transform: translateY(-160%);
  border-radius: 999px;
  background: #1f2937;
  color: #ffffff;
  padding: 0.65rem 1rem;
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
  transition: transform 180ms ease;
}

.appShell__skip:focus {
  transform: translateY(0);
  outline: 3px solid rgba(188, 149, 92, 0.45);
  outline-offset: 3px;
}

.appShell__fondo {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.appShell__mancha {
  position: absolute;
  border-radius: 999px;
  filter: blur(20px);
  opacity: 0.65;
}

.appShell__mancha--guinda {
  width: 22rem;
  height: 22rem;
  top: -9rem;
  right: -7rem;
  background: rgba(159, 34, 65, 0.13);
}

.appShell__mancha--dorado {
  width: 18rem;
  height: 18rem;
  left: -8rem;
  bottom: 4rem;
  background: rgba(188, 149, 92, 0.12);
}

.appShell__linea {
  position: absolute;
  height: 1px;
  width: 26rem;
  background: linear-gradient(90deg, transparent, rgba(159, 34, 65, 0.18), transparent);
}

.appShell__linea--uno {
  top: 7rem;
  left: -5rem;
  transform: rotate(-18deg);
}

.appShell__linea--dos {
  right: -4rem;
  bottom: 9rem;
  transform: rotate(-18deg);
}

.appShell__header {
  position: relative;
  z-index: 2;
  padding: 1rem clamp(1rem, 4vw, 3rem) 0;
}

.appShell__headerContenido {
  max-width: 1400px;
  margin: 0 auto;
}

.appShell__marca {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid rgba(159, 34, 65, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.74);
  box-shadow: 0 12px 30px rgba(31, 41, 55, 0.05);
  backdrop-filter: blur(14px);
  padding: 0.65rem 1rem;
}

.appShell__marcaPunto {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 999px;
  background: #9f2241;
  box-shadow: 0 0 0 5px rgba(159, 34, 65, 0.1);
}

.appShell__marcaSuperior {
  margin: 0;
  color: #111827;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.appShell__marcaInferior {
  margin: 0.1rem 0 0;
  color: #6b7280;
  font-size: 0.72rem;
  font-weight: 600;
}

.appShell__contenido {
  position: relative;
  z-index: 1;
  min-height: calc(100dvh - 72px);
}

.appShell__contenido:focus {
  outline: none;
}

.appShell__vista {
  min-height: inherit;
}

.appShell__footer {
  position: relative;
  z-index: 2;
  padding: 1.25rem clamp(1rem, 4vw, 3rem);
}

.appShell__footerContenido {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  max-width: 1400px;
  margin: 0 auto;
  border-top: 1px solid rgba(159, 34, 65, 0.12);
  padding-top: 1rem;
  color: #6b7280;
  font-size: 0.78rem;
  font-weight: 600;
}

.appShell__footerContenido p {
  margin: 0;
}

.appShell__footerTextoSecundario {
  color: #9ca3af;
}

.vista-enter-active,
.vista-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.vista-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.vista-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 768px) {
  .appShell__footerContenido {
    align-items: flex-start;
    flex-direction: column;
  }

  .appShell__marca {
    border-radius: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .vista-enter-active,
  .vista-leave-active,
  .appShell__skip {
    transition: none;
  }

  .vista-enter-from,
  .vista-leave-to {
    transform: none;
  }
}
</style>
