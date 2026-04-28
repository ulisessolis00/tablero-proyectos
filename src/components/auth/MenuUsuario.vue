<!-- src/components/auth/MenuUsuario.vue -->

<template>
  <div ref="menuRef" class="menuUsuario" :class="clasesMenu" :style="estilosMenu">
    <button
      class="menuUsuario__trigger"
      type="button"
      :disabled="disabled || cargando"
      :aria-expanded="menuAbierto ? 'true' : 'false'"
      aria-haspopup="menu"
      @click="alternarMenu"
      @keydown.esc="cerrarMenu"
    >
      <span class="menuUsuario__avatar" aria-hidden="true">
        {{ inicialesUsuario }}
      </span>

      <span class="menuUsuario__texto">
        <strong>{{ nombreVisible }}</strong>
        <small>{{ rolVisible }}</small>
      </span>

      <ChevronDown
        class="menuUsuario__chevron"
        :class="{ 'menuUsuario__chevron--abierto': menuAbierto }"
        :size="16"
        stroke-width="2.4"
        aria-hidden="true"
      />
    </button>

    <Transition name="menuUsuarioFade">
      <section
        v-if="menuAbierto"
        class="menuUsuario__dropdown"
        role="menu"
        aria-label="Menú de usuario"
      >
        <header class="menuUsuario__header">
          <div class="menuUsuario__avatar menuUsuario__avatar--grande">
            {{ inicialesUsuario }}
          </div>

          <div class="menuUsuario__datos">
            <strong>{{ nombreVisible }}</strong>
            <span v-if="correoVisible">{{ correoVisible }}</span>
          </div>
        </header>

        <div class="menuUsuario__badges">
          <BaseBadge :texto="rolVisible" :color="colorNormalizado" variante="suave" mostrar-punto />

          <BaseBadge
            v-if="secretariaVisible"
            :texto="secretariaVisible"
            color="#b79a5b"
            variante="lineal"
          />
        </div>

        <div class="menuUsuario__detalle">
          <div class="menuUsuario__detalleItem">
            <ShieldCheck :size="16" stroke-width="2.2" />
            <div>
              <span>Rol</span>
              <strong>{{ rolVisible }}</strong>
            </div>
          </div>

          <div v-if="secretariaVisible" class="menuUsuario__detalleItem">
            <Building2 :size="16" stroke-width="2.2" />
            <div>
              <span>Secretaría asignada</span>
              <strong>{{ secretariaVisible }}</strong>
            </div>
          </div>

          <div v-if="tiempoSesionVisible" class="menuUsuario__detalleItem">
            <Clock3 :size="16" stroke-width="2.2" />
            <div>
              <span>Sesión</span>
              <strong>{{ tiempoSesionVisible }}</strong>
            </div>
          </div>
        </div>

        <div class="menuUsuario__acciones">
          <button
            v-if="mostrarPerfil"
            class="menuUsuario__accion"
            type="button"
            role="menuitem"
            @click="emitirAbrirPerfil"
          >
            <UserRound :size="16" stroke-width="2.3" />
            Ver perfil
          </button>

          <button
            class="menuUsuario__accion menuUsuario__accion--salir"
            type="button"
            role="menuitem"
            :disabled="cerrandoSesion"
            @click="emitirCerrarSesion"
          >
            <LoaderCircle
              v-if="cerrandoSesion"
              class="menuUsuario__spinner"
              :size="16"
              stroke-width="2.4"
            />

            <LogOut v-else :size="16" stroke-width="2.3" />

            {{ cerrandoSesion ? 'Cerrando sesión...' : 'Cerrar sesión' }}
          </button>
        </div>
      </section>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  Building2,
  ChevronDown,
  Clock3,
  LoaderCircle,
  LogOut,
  ShieldCheck,
  UserRound,
} from 'lucide-vue-next'

import BaseBadge from '../ui/BaseBadge.vue'

const props = defineProps({
  usuario: {
    type: Object,
    default: null,
  },
  cargando: {
    type: Boolean,
    default: false,
  },
  cerrandoSesion: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  compacto: {
    type: Boolean,
    default: false,
  },
  mostrarPerfil: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: '#9f2241',
  },
})

const emit = defineEmits(['cerrarSesion', 'abrirPerfil'])

const menuRef = ref(null)
const menuAbierto = ref(false)

const colorNormalizado = computed(() => {
  return validarColor(props.color)
})

const estilosMenu = computed(() => {
  return {
    '--menu-usuario-color': colorNormalizado.value,
  }
})

const clasesMenu = computed(() => {
  return {
    'menuUsuario--compacto': props.compacto,
    'menuUsuario--abierto': menuAbierto.value,
  }
})

const nombreVisible = computed(() => {
  return limpiarTexto(
    props.usuario?.nombre ??
      props.usuario?.nombreCompleto ??
      props.usuario?.username ??
      props.usuario?.correo,
    'Usuario',
  )
})

const correoVisible = computed(() => {
  return limpiarTexto(props.usuario?.correo ?? props.usuario?.email, '')
})

const rolVisible = computed(() => {
  const rol = limpiarTexto(
    props.usuario?.rol ?? props.usuario?.tipoUsuario ?? props.usuario?.tipo,
    'Sin rol',
  )

  const roles = {
    principal: 'Usuario principal',
    admin: 'Administrador',
    administrador: 'Administrador',
    secretaria: 'Usuario de secretaría',
    captura: 'Captura',
    lectura: 'Lectura',
  }

  return roles[normalizarTexto(rol)] || rol
})

const secretariaVisible = computed(() => {
  return limpiarTexto(
    props.usuario?.secretariaNombre ??
      props.usuario?.nombreSecretaria ??
      props.usuario?.secretaria ??
      props.usuario?.siglaSecretaria,
    '',
  )
})

const inicialesUsuario = computed(() => {
  const nombre = nombreVisible.value

  const partes = nombre.split(' ').filter(Boolean).slice(0, 2)

  if (!partes.length) {
    return 'U'
  }

  return partes
    .map((parte) => parte.charAt(0))
    .join('')
    .toUpperCase()
})

const tiempoSesionVisible = computed(() => {
  const expiraEn =
    props.usuario?.expiraEn ?? props.usuario?.sesionExpiraEn ?? props.usuario?.expiresAt

  if (!expiraEn) {
    return ''
  }

  return `Activa hasta ${formatearHora(expiraEn)}`
})

onMounted(() => {
  document.addEventListener('click', manejarClickExterno)
  document.addEventListener('keydown', manejarTecla)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', manejarClickExterno)
  document.removeEventListener('keydown', manejarTecla)
})

function alternarMenu() {
  if (props.disabled || props.cargando) {
    return
  }

  menuAbierto.value = !menuAbierto.value
}

function cerrarMenu() {
  menuAbierto.value = false
}

function manejarClickExterno(evento) {
  if (!menuAbierto.value) {
    return
  }

  if (!menuRef.value?.contains(evento.target)) {
    cerrarMenu()
  }
}

function manejarTecla(evento) {
  if (evento.key === 'Escape') {
    cerrarMenu()
  }
}

function emitirAbrirPerfil() {
  cerrarMenu()
  emit('abrirPerfil')
}

function emitirCerrarSesion() {
  emit('cerrarSesion')
}

function limpiarTexto(valor, valorDefault = '') {
  const texto = String(valor ?? '').trim()

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

function formatearHora(valor) {
  const fecha = new Date(valor)

  if (Number.isNaN(fecha.getTime())) {
    return String(valor)
  }

  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha)
}

function validarColor(valor) {
  if (/^#[0-9a-fA-F]{6}$/.test(valor || '')) {
    return valor
  }

  return '#9f2241'
}
</script>

<style scoped>
.menuUsuario {
  position: relative;
  display: inline-flex;
  min-width: 0;
}

.menuUsuario__trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  max-width: 280px;
  min-height: 2.85rem;
  border: 1px solid rgba(159, 34, 65, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: #1f2937;
  padding: 0.35rem 0.55rem 0.35rem 0.38rem;
  font: inherit;
  cursor: pointer;
  box-shadow:
    0 12px 28px rgba(31, 41, 55, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.82);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease,
    transform 180ms ease;
}

.menuUsuario__trigger:hover:not(:disabled),
.menuUsuario--abierto .menuUsuario__trigger {
  border-color: color-mix(in srgb, var(--menu-usuario-color) 28%, #ffffff);
  background: rgba(255, 255, 255, 0.96);
  box-shadow:
    0 16px 34px rgba(31, 41, 55, 0.08),
    0 0 0 4px color-mix(in srgb, var(--menu-usuario-color) 8%, transparent);
}

.menuUsuario__trigger:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.menuUsuario__avatar {
  display: inline-grid;
  place-items: center;
  flex: 0 0 auto;
  width: 2.15rem;
  height: 2.15rem;
  border-radius: 999px;
  background: linear-gradient(
    135deg,
    var(--menu-usuario-color),
    color-mix(in srgb, var(--menu-usuario-color) 72%, #b79a5b)
  );
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 950;
  letter-spacing: -0.03em;
}

.menuUsuario__avatar--grande {
  width: 3rem;
  height: 3rem;
  font-size: 1rem;
}

.menuUsuario__texto {
  display: flex;
  flex-direction: column;
  min-width: 0;
  text-align: left;
}

.menuUsuario__texto strong {
  overflow: hidden;
  color: #1f2937;
  font-size: 0.82rem;
  font-weight: 900;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menuUsuario__texto small {
  overflow: hidden;
  margin-top: 0.15rem;
  color: #6b7280;
  font-size: 0.68rem;
  font-weight: 750;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menuUsuario__chevron {
  flex: 0 0 auto;
  color: #9ca3af;
  transition: transform 180ms ease;
}

.menuUsuario__chevron--abierto {
  transform: rotate(180deg);
}

.menuUsuario__dropdown {
  position: absolute;
  top: calc(100% + 0.7rem);
  right: 0;
  z-index: 60;
  width: min(340px, calc(100vw - 2rem));
  border: 1px solid rgba(159, 34, 65, 0.12);
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.96);
  box-shadow:
    0 24px 70px rgba(31, 41, 55, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  padding: 0.9rem;
}

.menuUsuario__header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
}

.menuUsuario__datos {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.menuUsuario__datos strong {
  overflow: hidden;
  color: #1f2937;
  font-size: 0.95rem;
  font-weight: 950;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menuUsuario__datos span {
  overflow: hidden;
  margin-top: 0.18rem;
  color: #6b7280;
  font-size: 0.78rem;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menuUsuario__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.9rem;
}

.menuUsuario__detalle {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin-top: 0.9rem;
  border-top: 1px solid rgba(17, 24, 39, 0.08);
  padding-top: 0.85rem;
}

.menuUsuario__detalleItem {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  color: #6b7280;
}

.menuUsuario__detalleItem svg {
  flex: 0 0 auto;
  margin-top: 0.1rem;
  color: var(--menu-usuario-color);
}

.menuUsuario__detalleItem div {
  min-width: 0;
}

.menuUsuario__detalleItem span {
  display: block;
  color: #9ca3af;
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.menuUsuario__detalleItem strong {
  display: block;
  margin-top: 0.12rem;
  overflow-wrap: anywhere;
  color: #374151;
  font-size: 0.8rem;
  font-weight: 850;
  line-height: 1.35;
}

.menuUsuario__acciones {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.9rem;
  border-top: 1px solid rgba(17, 24, 39, 0.08);
  padding-top: 0.75rem;
}

.menuUsuario__accion {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  min-height: 2.35rem;
  border: 0;
  border-radius: 0.85rem;
  background: transparent;
  color: #374151;
  padding: 0.55rem 0.65rem;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 850;
  text-align: left;
  cursor: pointer;
  transition:
    background 160ms ease,
    color 160ms ease;
}

.menuUsuario__accion:hover:not(:disabled) {
  background: rgba(159, 34, 65, 0.07);
  color: var(--menu-usuario-color);
}

.menuUsuario__accion--salir {
  color: #b91c1c;
}

.menuUsuario__accion--salir:hover:not(:disabled) {
  background: rgba(254, 242, 242, 0.96);
  color: #991b1b;
}

.menuUsuario__accion:disabled {
  cursor: wait;
  opacity: 0.62;
}

.menuUsuario__spinner {
  animation: menuUsuarioGirar 0.85s linear infinite;
}

.menuUsuario--compacto .menuUsuario__texto {
  display: none;
}

.menuUsuario--compacto .menuUsuario__trigger {
  padding-right: 0.45rem;
}

.menuUsuarioFade-enter-active,
.menuUsuarioFade-leave-active {
  transition:
    opacity 140ms ease,
    transform 140ms ease;
}

.menuUsuarioFade-enter-from,
.menuUsuarioFade-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

@keyframes menuUsuarioGirar {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .menuUsuario__texto {
    display: none;
  }

  .menuUsuario__dropdown {
    right: -0.25rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .menuUsuario__trigger,
  .menuUsuario__chevron,
  .menuUsuario__accion,
  .menuUsuarioFade-enter-active,
  .menuUsuarioFade-leave-active {
    transition: none;
  }

  .menuUsuario__spinner {
    animation: none;
  }
}
</style>
