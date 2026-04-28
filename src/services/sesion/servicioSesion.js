// src/services/sesion/servicioSesion.js

import {
    ROL_USUARIO,
    crearUsuarioSesion,
    puedeVerSecretaria
} from "../../models/secretarias/modeloDatosSecretarias";

const DURACION_SESION_MS = 6 * 60 * 60 * 1000;
const STORAGE_KEY_MOCK = "tablero_cdmx_sesion_mock";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const USAR_AUTH_MOCK = import.meta.env.VITE_AUTH_MOCK === "true";

let usuarioCache = null;

export async function iniciarSesion(credenciales = {}) {
    if (USAR_AUTH_MOCK) {
        return iniciarSesionMock(credenciales);
    }

    const respuesta = await peticionSesion("/api/auth/login/", {
        method: "POST",
        body: JSON.stringify({
            correo: credenciales.correo,
            password: credenciales.password
        })
    });

    usuarioCache = crearUsuarioSesion({
        ...respuesta.usuario,
        autenticado: true
    });

    return usuarioCache;
}

export async function cerrarSesion() {
    if (USAR_AUTH_MOCK) {
        limpiarSesionMock();
        usuarioCache = null;
        return true;
    }

    try {
        await peticionSesion("/api/auth/logout/", {
            method: "POST"
        });
    } finally {
        usuarioCache = null;
    }

    return true;
}

export async function obtenerUsuarioActual(opciones = {}) {
    const { forzarRecarga = false } = opciones;

    if (usuarioCache && !forzarRecarga) {
        return usuarioCache;
    }

    if (USAR_AUTH_MOCK) {
        usuarioCache = obtenerUsuarioMockActual();
        return usuarioCache;
    }

    try {
        const respuesta = await peticionSesion("/api/auth/me/", {
            method: "GET"
        });

        usuarioCache = crearUsuarioSesion({
            ...respuesta.usuario,
            autenticado: true
        });

        return usuarioCache;
    } catch (error) {
        usuarioCache = crearUsuarioSesion({
            rol: ROL_USUARIO.publico,
            autenticado: false
        });

        return usuarioCache;
    }
}

export async function estaAutenticado() {
    const usuario = await obtenerUsuarioActual();
    return usuario.autenticado === true;
}

export async function obtenerRolUsuario() {
    const usuario = await obtenerUsuarioActual();
    return usuario.rol;
}

export async function usuarioPuedeVerSecretaria(secretaria) {
    const usuario = await obtenerUsuarioActual();
    return puedeVerSecretaria(usuario, secretaria);
}

export async function filtrarSecretariasPermitidas(secretarias = []) {
    const usuario = await obtenerUsuarioActual();

    if (usuario.rol === ROL_USUARIO.principal) {
        return secretarias;
    }

    return secretarias.filter((secretaria) => {
        return puedeVerSecretaria(usuario, secretaria);
    });
}

export function limpiarCacheSesion() {
    usuarioCache = null;
}

export function obtenerConfiguracionSesion() {
    return {
        apiBaseUrl: API_BASE_URL,
        usarAuthMock: USAR_AUTH_MOCK,
        duracionSesionMs: DURACION_SESION_MS
    };
}

async function peticionSesion(ruta, opciones = {}) {
    const metodo = opciones.method || "GET";
    const headers = crearHeadersSesion(metodo, opciones.headers);

    const respuesta = await fetch(`${API_BASE_URL}${ruta}`, {
        ...opciones,
        method: metodo,
        headers,
        credentials: "include"
    });

    const contenido = await leerRespuestaJson(respuesta);

    if (!respuesta.ok) {
        const mensaje = contenido?.mensaje || contenido?.detail || "No fue posible procesar la solicitud.";
        throw new Error(mensaje);
    }

    return contenido;
}

function crearHeadersSesion(metodo, headersExtra = {}) {
    const headers = {
        Accept: "application/json",
        ...headersExtra
    };

    if (metodo !== "GET") {
        headers["Content-Type"] = "application/json";

        const csrfToken = obtenerCookie("csrftoken");

        if (csrfToken) {
            headers["X-CSRFToken"] = csrfToken;
        }
    }

    return headers;
}

async function leerRespuestaJson(respuesta) {
    const texto = await respuesta.text();

    if (!texto) {
        return {};
    }

    try {
        return JSON.parse(texto);
    } catch {
        return {};
    }
}

function obtenerCookie(nombre) {
    const cookies = document.cookie ? document.cookie.split(";") : [];

    const cookie = cookies.find((item) => {
        return item.trim().startsWith(`${nombre}=`);
    });

    if (!cookie) {
        return "";
    }

    return decodeURIComponent(cookie.split("=")[1]);
}

/* =============================================================================
   MODO MOCK TEMPORAL
   Sirve sólo para desarrollar la UI sin Django.
   No usar como seguridad real.
============================================================================= */

function iniciarSesionMock(credenciales = {}) {
    const correo = String(credenciales.correo || "").trim().toLowerCase();

    if (!correo) {
        throw new Error("Ingresa un correo para iniciar sesión.");
    }

    const usuario = crearUsuarioSesion({
        id: correo,
        nombre: obtenerNombreMock(correo),
        rol: obtenerRolMock(correo),
        secretariaId: obtenerSecretariaMock(correo),
        secretariasPermitidas: obtenerSecretariasPermitidasMock(correo),
        autenticado: true,
        expiraEn: new Date(Date.now() + DURACION_SESION_MS).toISOString()
    });

    sessionStorage.setItem(
        STORAGE_KEY_MOCK,
        JSON.stringify({
            usuario,
            creadoEn: new Date().toISOString(),
            expiraEn: usuario.expiraEn
        })
    );

    usuarioCache = usuario;

    return usuario;
}

function obtenerUsuarioMockActual() {
    const sesion = leerSesionMock();

    if (!sesion) {
        return crearUsuarioSesion({
            rol: ROL_USUARIO.publico,
            autenticado: false
        });
    }

    if (sesionExpirada(sesion)) {
        limpiarSesionMock();

        return crearUsuarioSesion({
            rol: ROL_USUARIO.publico,
            autenticado: false
        });
    }

    return crearUsuarioSesion({
        ...sesion.usuario,
        autenticado: true
    });
}

function leerSesionMock() {
    const valor = sessionStorage.getItem(STORAGE_KEY_MOCK);

    if (!valor) {
        return null;
    }

    try {
        return JSON.parse(valor);
    } catch {
        limpiarSesionMock();
        return null;
    }
}

function sesionExpirada(sesion) {
    if (!sesion?.expiraEn) {
        return true;
    }

    return new Date(sesion.expiraEn).getTime() <= Date.now();
}

function limpiarSesionMock() {
    sessionStorage.removeItem(STORAGE_KEY_MOCK);
}

function obtenerRolMock(correo) {
    if (correo.includes("admin") || correo.includes("principal")) {
        return ROL_USUARIO.principal;
    }

    return ROL_USUARIO.secretaria;
}

function obtenerSecretariaMock(correo) {
    const mapaCorreos = {
        "sebien": "SEBIEN",
        "ssc": "SSC",
        "semovi": "SEMOVI",
        "sobse": "SOBSE",
        "sedesa": "SEDESA",
        "adip": "ADIP"
    };

    const llave = Object.keys(mapaCorreos).find((valor) => {
        return correo.includes(valor);
    });

    return mapaCorreos[llave] || "SEBIEN";
}

function obtenerSecretariasPermitidasMock(correo) {
    const rol = obtenerRolMock(correo);

    if (rol === ROL_USUARIO.principal) {
        return [];
    }

    return [obtenerSecretariaMock(correo)];
}

function obtenerNombreMock(correo) {
    const nombreBase = correo.split("@")[0] || "usuario";

    return nombreBase
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (letra) => letra.toUpperCase());
}