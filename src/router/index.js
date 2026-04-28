// src/router/index.js

import { createRouter, createWebHistory } from "vue-router";
import { registrarGuardiasRuta } from "./guardiasRuta";

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
      titulo: "Detalle de Secretaría",

      // Por ahora los datos son públicos, entonces lo dejamos libre.
      requiereAutenticacion: false,
      validarSecretaria: false,

      // Cuando quieras protegerlo:
      // requiereAutenticacion: true,
      // validarSecretaria: true,
      parametroSecretaria: "secretariaId"
    }
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/LoginView.vue"),
    meta: {
      titulo: "Iniciar sesión",
      soloInvitados: true
    }
  },
  {
    path: "/no-autorizado",
    name: "noAutorizado",
    component: () => import("../views/VistaNoAutorizado.vue"),
    meta: {
      titulo: "Acceso no autorizado"
    }
  },
  {
    path: "/:pathMatch(.*)*",
    name: "noEncontrado",
    component: () => import("../views/VistaError404.vue"),
    meta: {
      titulo: "Página no encontrada"
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

registrarGuardiasRuta(router);

export default router;