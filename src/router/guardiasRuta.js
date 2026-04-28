// src/router/guardiasRuta.js

import {
    obtenerUsuarioActual
} from "../services/sesion/servicioSesion";

import {
    ROL_USUARIO,
    puedeVerSecretaria
} from "../models/secretarias/modeloDatosSecretarias";

const RUTA_INICIO = "/";
const RUTA_LOGIN = "/login";
const RUTA_NO_AUTORIZADO = "/no-autorizado";

const TITULO_DEFAULT = "Tablero CDMX";

export function registrarGuardiasRuta(router) {
    router.beforeEach(async (to) => {
        try {
            const usuario = await obtenerUsuarioActual();

            if (esRutaSoloInvitados(to) && usuario.autenticado) {
                return crearRedireccionInicio();
            }

            if (!requiereAutenticacion(to)) {
                actualizarTituloDocumento(to);
                return true;
            }

            if (!usuario.autenticado) {
                return crearRedireccionLogin(to);
            }

            if (!cumpleRolRequerido(to, usuario)) {
                return crearRedireccionNoAutorizado("rol");
            }

            if (!cumplePermisoSecretaria(to, usuario)) {
                return crearRedireccionNoAutorizado("secretaria");
            }

            actualizarTituloDocumento(to);
            return true;
        } catch (error) {
            console.error("Error al validar guardia de ruta:", error);

            if (requiereAutenticacion(to)) {
                return crearRedireccionLogin(to, "sesion");
            }

            actualizarTituloDocumento(to);
            return true;
        }
    });

    router.afterEach((to) => {
        actualizarTituloDocumento(to);
    });
}

export function requiereAutenticacion(ruta) {
    return ruta.meta?.requiereAutenticacion === true;
}

export function esRutaSoloInvitados(ruta) {
    return ruta.meta?.soloInvitados === true;
}

export function cumpleRolRequerido(ruta, usuario) {
    if (ruta.meta?.requierePrincipal === true) {
        return usuario.rol === ROL_USUARIO.principal;
    }

    if (ruta.meta?.requiereSecretaria === true) {
        return usuario.rol === ROL_USUARIO.secretaria || usuario.rol === ROL_USUARIO.principal;
    }

    return true;
}

export function cumplePermisoSecretaria(ruta, usuario) {
    if (ruta.meta?.validarSecretaria !== true) {
        return true;
    }

    const secretariaId = obtenerSecretariaIdDesdeRuta(ruta);

    if (!secretariaId) {
        return false;
    }

    return puedeVerSecretaria(usuario, {
        id: secretariaId,
        sigla: secretariaId,
        nombre: secretariaId
    });
}

export function obtenerSecretariaIdDesdeRuta(ruta) {
    const nombreParametro = ruta.meta?.parametroSecretaria || "secretariaId";

    return (
        ruta.params?.[nombreParametro] ||
        ruta.params?.id ||
        ruta.query?.secretariaId ||
        ""
    );
}

function crearRedireccionLogin(ruta, motivo = "") {
    const query = {
        redirect: ruta.fullPath
    };

    if (motivo) {
        query.motivo = motivo;
    }

    return {
        path: RUTA_LOGIN,
        query
    };
}

function crearRedireccionInicio() {
    return {
        path: RUTA_INICIO
    };
}

function crearRedireccionNoAutorizado(motivo = "") {
    return {
        path: RUTA_NO_AUTORIZADO,
        query: motivo ? { motivo } : {}
    };
}

function actualizarTituloDocumento(ruta) {
    const tituloRuta = ruta.meta?.titulo;

    if (!tituloRuta) {
        document.title = TITULO_DEFAULT;
        return;
    }

    document.title = `${tituloRuta} | ${TITULO_DEFAULT}`;
}