<!-- src/views/LoginView.vue -->

<template>
  <main class="loginView">
    <section class="loginView__panelFormulario">
      <div class="loginView__contenido">
        <header class="loginView__encabezadoMarca">
          <div class="loginView__marca">
            <div class="loginView__marcaIcono" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div class="loginView__marcaTexto">
              <p class="loginView__marcaTitulo">Ciudad de México</p>

              <p class="loginView__marcaSubtitulo">Tablero de avances de proyectos</p>
            </div>
          </div>
        </header>

        <section class="loginView__bloqueBienvenida">
          <p class="loginView__eyebrow">Acceso institucional</p>

          <h1 class="loginView__titulo">Iniciar sesión</h1>

          <p class="loginView__subtitulo">
            Ingresa con tu cuenta autorizada para consultar y administrar la información del
            tablero.
          </p>
        </section>

        <FormularioLogin
          :cargando="enviando"
          :error-general="mensajeError"
          :mensaje-info="mensajeInfo"
          :intentos-fallidos="intentosFallidos"
          :max-intentos="5"
          :bloqueado="bloqueado"
          texto-bloqueo="Por seguridad, el acceso se bloqueó temporalmente. Intenta más tarde."
          @submit="manejarLogin"
          @recuperar-contrasena="manejarRecuperarContrasena"
          @cambiar-formulario="limpiarMensajes"
        />

        <footer class="loginView__pie">
          <div class="loginView__pieItem">
            <ShieldCheck :size="16" stroke-width="2" />
            <span>Acceso por rol</span>
          </div>

          <div class="loginView__pieItem">
            <Clock3 :size="16" stroke-width="2" />
            <span>Sesión de 6 horas</span>
          </div>

          <div class="loginView__pieItem">
            <LockKeyhole :size="16" stroke-width="2" />
            <span>Autenticación segura</span>
          </div>
        </footer>
      </div>
    </section>

    <aside class="loginView__panelVisual">
      <div class="loginView__visualOverlay"></div>
      <div class="loginView__visualGlow"></div>

      <div class="loginView__visualContenido">
        <div class="loginView__mensajeVisual">
          <p class="loginView__mensajeVisualEyebrow">Gobierno de la Ciudad de México</p>

          <h2 class="loginView__mensajeVisualTitulo">
            Seguimiento claro, seguro y centralizado de programas y proyectos
          </h2>

          <p class="loginView__mensajeVisualTexto">
            Consulta avances, calidad de captura, presupuesto y métricas ejecutivas desde un entorno
            diseñado para diferentes perfiles de usuario.
          </p>
        </div>
      </div>
    </aside>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Clock3, LockKeyhole, ShieldCheck } from 'lucide-vue-next'

import FormularioLogin from '../components/auth/FormularioLogin.vue'

const router = useRouter()

const modoDemo = true

const enviando = ref(false)
const mensajeError = ref('')
const mensajeInfo = ref('')
const intentosFallidos = ref(0)
const bloqueado = ref(false)

async function manejarLogin(credenciales) {
  limpiarMensajes()
  enviando.value = true

  try {
    await simularEspera(900)

    if (modoDemo) {
      mensajeInfo.value = 'Acceso validado correctamente.'

      await simularEspera(450)

      router.push({
        name: 'panorama',
      })

      return
    }

    /*
      Más adelante aquí irá la integración real:

      await servicioSesion.iniciarSesion({
        correo: credenciales.correo,
        contrasena: credenciales.contrasena,
        recordarSesion: credenciales.recordarSesion
      });

      router.push({ name: "panorama" });
    */
  } catch (error) {
    console.error('Error al iniciar sesión:', error)

    intentosFallidos.value += 1

    if (intentosFallidos.value >= 5) {
      bloqueado.value = true
    }

    mensajeError.value = 'Usuario o contraseña incorrectos.'
  } finally {
    enviando.value = false
  }
}

function manejarRecuperarContrasena() {
  mensajeError.value = ''
  mensajeInfo.value = 'La recuperación de contraseña se conectará más adelante con la API.'
}

function limpiarMensajes() {
  mensajeError.value = ''
  mensajeInfo.value = ''
}

function simularEspera(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
</script>

<style scoped>
:global(body) {
  background: #f8f7f4;
}

.loginView {
  --login-guinda: #9f2241;
  --login-guinda-oscuro: #7f1d35;
  --login-dorado: #b79a5b;
  --login-texto: #1f2937;
  --login-texto-suave: #6b7280;
  --login-fondo: #f8f7f4;

  display: grid;
  grid-template-columns: minmax(420px, 520px) 1fr;
  min-height: 100vh;
  background: var(--login-fondo);
}

.loginView__panelFormulario {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background:
    radial-gradient(circle at top left, rgba(183, 154, 91, 0.08), transparent 18rem),
    linear-gradient(180deg, rgba(255, 255, 255, 0.7), rgba(248, 247, 244, 0.96));
}

.loginView__contenido {
  width: 100%;
  max-width: 420px;
}

.loginView__encabezadoMarca {
  margin-bottom: 2rem;
}

.loginView__marca {
  display: inline-flex;
  align-items: center;
  gap: 0.95rem;
}

.loginView__marcaIcono {
  display: grid;
  grid-template-columns: repeat(2, 0.72rem);
  gap: 0.2rem;
  padding: 0.35rem;
  border-radius: 0.9rem;
  background: rgba(159, 34, 65, 0.08);
}

.loginView__marcaIcono span {
  width: 0.72rem;
  height: 0.72rem;
  border-radius: 0.14rem;
  background: linear-gradient(135deg, var(--login-guinda), #b35b72);
}

.loginView__marcaTexto {
  display: flex;
  flex-direction: column;
}

.loginView__marcaTitulo {
  margin: 0;
  color: var(--login-texto);
  font-size: 1.15rem;
  font-weight: 950;
  letter-spacing: -0.03em;
  line-height: 1.05;
}

.loginView__marcaSubtitulo {
  margin: 0.2rem 0 0;
  color: var(--login-texto-suave);
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.2;
}

.loginView__bloqueBienvenida {
  margin-bottom: 1.8rem;
}

.loginView__eyebrow {
  display: inline-flex;
  margin: 0 0 0.8rem;
  border: 1px solid rgba(159, 34, 65, 0.14);
  border-radius: 999px;
  background: rgba(159, 34, 65, 0.06);
  padding: 0.38rem 0.72rem;
  color: var(--login-guinda);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.loginView__titulo {
  margin: 0;
  color: var(--login-texto);
  font-size: clamp(2.2rem, 4vw, 3rem);
  font-weight: 950;
  letter-spacing: -0.06em;
  line-height: 0.95;
}

.loginView__subtitulo {
  margin: 0.9rem 0 0;
  color: var(--login-texto-suave);
  font-size: 0.96rem;
  font-weight: 500;
  line-height: 1.6;
}

.loginView__pie {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem 1rem;
  margin-top: 1.5rem;
  padding-top: 1.2rem;
  border-top: 1px solid rgba(17, 24, 39, 0.08);
}

.loginView__pieItem {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: #6b7280;
  font-size: 0.78rem;
  font-weight: 700;
}

.loginView__panelVisual {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(78, 23, 43, 0.18), rgba(78, 23, 43, 0.38)),
    url('/img/login-cdmx.jpg');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.loginView__visualOverlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(79, 19, 39, 0.72) 0%,
    rgba(111, 31, 56, 0.5) 28%,
    rgba(183, 154, 91, 0.24) 100%
  );
}

.loginView__visualGlow {
  position: absolute;
  inset: auto -10% 8% auto;
  width: 22rem;
  height: 22rem;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(183, 154, 91, 0.24), transparent 70%);
  filter: blur(18px);
  pointer-events: none;
}

.loginView__visualContenido {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 1.2rem;
  height: 100%;
  padding: 2.4rem;
  color: #ffffff;
}

.loginView__badgeVisual {
  display: inline-flex;
  align-self: flex-start;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(14px);
  padding: 0.45rem 0.85rem;
  color: rgba(255, 255, 255, 0.94);
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.loginView__mensajeVisual {
  max-width: 620px;
}

.loginView__mensajeVisualEyebrow {
  margin: 0 0 0.65rem;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.loginView__mensajeVisualTitulo {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 950;
  letter-spacing: -0.06em;
  line-height: 0.96;
  text-wrap: balance;
}

.loginView__mensajeVisualTexto {
  max-width: 55ch;
  margin: 0.9rem 0 0;
  color: rgba(255, 255, 255, 0.84);
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.6;
}

.loginView__tarjetasVisuales {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
}

.loginView__tarjetaVisual {
  min-width: 220px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 1.15rem;
  background: rgba(255, 255, 255, 0.11);
  backdrop-filter: blur(14px);
  padding: 0.95rem 1rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.loginView__tarjetaVisualLabel {
  display: block;
  margin-bottom: 0.2rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.loginView__tarjetaVisual strong {
  font-size: 0.95rem;
  font-weight: 850;
  line-height: 1.4;
}

@media (max-width: 1120px) {
  .loginView {
    grid-template-columns: 1fr;
  }

  .loginView__panelVisual {
    min-height: 360px;
  }

  .loginView__visualContenido {
    justify-content: flex-end;
  }
}

@media (max-width: 640px) {
  .loginView__panelFormulario {
    padding: 1.1rem;
  }

  .loginView__contenido {
    max-width: 100%;
  }

  .loginView__visualContenido {
    padding: 1.25rem;
  }

  .loginView__mensajeVisualTitulo {
    font-size: 2rem;
  }

  .loginView__mensajeVisualTexto {
    font-size: 0.92rem;
  }

  .loginView__tarjetasVisuales {
    flex-direction: column;
  }
}
</style>
