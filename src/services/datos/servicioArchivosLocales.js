// src/services/datos/servicioArchivosLocales.js

const baseDatos = import.meta.env.VITE_DATA_BASE_URL || "/data";

export async function obtenerJsonLocal(rutaArchivo) {
    const url = construirUrlLocal(rutaArchivo);

    const respuesta = await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json"
        },
        cache: "no-store"
    });

    if (!respuesta.ok) {
        throw new Error(`No fue posible cargar el archivo JSON: ${url}`);
    }

    return respuesta.json();
}

export async function obtenerTextoLocal(rutaArchivo) {
    const url = construirUrlLocal(rutaArchivo);

    const respuesta = await fetch(url, {
        method: "GET",
        headers: {
            Accept: "text/plain"
        },
        cache: "no-store"
    });

    if (!respuesta.ok) {
        throw new Error(`No fue posible cargar el archivo de texto: ${url}`);
    }

    return respuesta.text();
}

export async function obtenerArrayBufferLocal(rutaArchivo) {
    const url = construirUrlLocal(rutaArchivo);

    const respuesta = await fetch(url, {
        method: "GET",
        cache: "no-store"
    });

    if (!respuesta.ok) {
        throw new Error(`No fue posible cargar el archivo local: ${url}`);
    }

    return respuesta.arrayBuffer();
}

export function construirUrlLocal(rutaArchivo) {
    const ruta = String(rutaArchivo || "").trim();

    if (!ruta) {
        throw new Error("La ruta del archivo local es obligatoria.");
    }

    if (ruta.startsWith("http://") || ruta.startsWith("https://") || ruta.startsWith("/")) {
        return ruta;
    }

    return `${baseDatos}/${ruta}`.replace(/\/{2,}/g, "/");
}