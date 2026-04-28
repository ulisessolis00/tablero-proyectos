import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "panorama",
    component: () => import("../views/VistaPanorama.vue"),
    meta: {
      titulo: "Panorama Ejecutivo"
    }
  },
  {
    path: "/secretarias/:secretariaId",
    name: "detalleSecretaria",
    component: () => import("../views/VistaDetalleSecretaria.vue"),
    meta: {
      titulo: "Detalle de secretaría"
    }
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/LoginView.vue"),
    meta: {
      titulo: "Iniciar sesión",
      ocultarAppShell: true
    }
  },
  {
    path: "/visualizaciones",
    name: "visualizaciones",
    component: () => import("../views/VistaVisualizaciones.vue"),
    meta: {
      titulo: "Visualizaciones"
    }
  },
  {
    path: "/no-autorizado",
    name: "noAutorizado",
    component: () => import("../views/VistaNoAutorizado.vue"),
    meta: {
      titulo: "No autorizado"
    }
  },
  {
    path: "/:pathMatch(.*)*",
    name: "error404",
    component: () => import("../views/VistaError404.vue"),
    meta: {
      titulo: "Página no encontrada"
    }
  },
  {
    path: '/propuestas/visualizaciones-experimentales',
    name: 'visualizacionesExperimentales',
    component: () => import('../views/VistaExperimentalGraficas.vue'),
    meta: {
      titulo: 'Visualizaciones experimentales'
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.afterEach((to) => {
  document.title = to.meta?.titulo
    ? `${to.meta.titulo} | Tablero de Avances CDMX`
    : "Tablero de Avances CDMX";
});

export default router;