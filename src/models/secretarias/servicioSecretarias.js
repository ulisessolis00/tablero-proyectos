// src/services/secretarias/servicioSecretarias.js

import * as XLSX from "xlsx";
import { metadataSecretarias } from "../../data/catalogos/metadataSecretarias";
import { adaptarDatosSecretarias } from "../../adapters/secretarias/adaptadorDatosSecretarias";
import {
    crearResumenGlobal,
    crearResumenSecretaria
} from "../../models/secretarias/modeloDatosSecretarias";

const RUTA_EXCEL_DEFAULT = "/data/excel/Plantilla_Tablero_CDMX_2024-2030.xlsx";
const FILAS_INICIALES_A_IGNORAR = 4;

const HOJAS_IGNORADAS = Object.freeze([
    "instrucciones",
    "indice",
    "índice"
]);

let cacheSecretarias = null;
let promesaCargaSecretarias = null;

export async function obtenerSecretarias(opciones = {}) {
    const { forzarRecarga = false } = opciones;

    if (cacheSecretarias && !forzarRecarga) {
        return cacheSecretarias;
    }

    if (promesaCargaSecretarias && !forzarRecarga) {
        return promesaCargaSecretarias;
    }

    promesaCargaSecretarias = cargarSecretariasDesdeExcel(opciones);

    try {
        cacheSecretarias = await promesaCargaSecretarias;
        return cacheSecretarias;
    } finally {
        promesaCargaSecretarias = null;
    }
}

export async function obtenerSecretariaPorId(secretariaId, opciones = {}) {
    const secretarias = await obtenerSecretarias(opciones);
    const idBuscado = normalizarIdBusqueda(secretariaId);

    return secretarias.find((secretaria) => {
        return (
            normalizarIdBusqueda(secretaria.id) === idBuscado ||
            normalizarIdBusqueda(secretaria.sigla) === idBuscado
        );
    }) || null;
}

export async function obtenerProgramasPorSecretaria(secretariaId, opciones = {}) {
    const secretaria = await obtenerSecretariaPorId(secretariaId, opciones);

    if (!secretaria) {
        return [];
    }

    return secretaria.programas || [];
}

export async function obtenerResumenGlobalSecretarias(opciones = {}) {
    const secretarias = await obtenerSecretarias(opciones);
    return crearResumenGlobal(secretarias);
}

export async function obtenerResumenSecretaria(secretariaId, opciones = {}) {
    const secretaria = await obtenerSecretariaPorId(secretariaId, opciones);

    if (!secretaria) {
        return null;
    }

    return crearResumenSecretaria(secretaria);
}

export function limpiarCacheSecretarias() {
    cacheSecretarias = null;
    promesaCargaSecretarias = null;
}

async function cargarSecretariasDesdeExcel(opciones = {}) {
    const {
        rutaExcel = RUTA_EXCEL_DEFAULT,
        metadata = metadataSecretarias
    } = opciones;

    try {
        const libro = await leerLibroExcel(rutaExcel);
        const datosPorSecretaria = extraerDatosPorSecretaria(libro, rutaExcel);

        return adaptarDatosSecretarias({
            metadataSecretarias: metadata,
            datosPorSecretaria,
            fuente: {
                tipo: "excelLocal",
                archivo: rutaExcel,
                hoja: "",
                filaInicio: FILAS_INICIALES_A_IGNORAR + 1
            },
            actualizadoEn: new Date().toISOString()
        });
    } catch (error) {
        console.error("No fue posible cargar el Excel de secretarías:", error);
        return [];
    }
}

async function leerLibroExcel(rutaExcel) {
    const respuesta = await fetch(rutaExcel, {
        method: "GET",
        cache: "no-cache"
    });

    if (!respuesta.ok) {
        throw new Error(`No se pudo leer el archivo Excel: ${respuesta.status}`);
    }

    const buffer = await respuesta.arrayBuffer();

    return XLSX.read(buffer, {
        type: "array",
        cellDates: true
    });
}

function extraerDatosPorSecretaria(libro, rutaExcel) {
    return libro.SheetNames.reduce((acumulado, nombreHoja) => {
        if (esHojaIgnorada(nombreHoja)) {
            return acumulado;
        }

        const hoja = libro.Sheets[nombreHoja];
        const filas = XLSX.utils.sheet_to_json(hoja, {
            header: 1,
            defval: null,
            blankrows: false,
            raw: false
        });

        const programas = normalizarFilasExcel({
            filas,
            nombreHoja,
            rutaExcel
        });

        if (programas.length > 0) {
            acumulado[nombreHoja] = programas;
        }

        return acumulado;
    }, {});
}

function normalizarFilasExcel(configuracion = {}) {
    const {
        filas = [],
        nombreHoja = "",
        rutaExcel = ""
    } = configuracion;

    return filas
        .slice(FILAS_INICIALES_A_IGNORAR)
        .map((fila, indice) => normalizarFilaExcel({
            fila,
            indice,
            nombreHoja,
            rutaExcel
        }))
        .filter(esProgramaCrudoValido);
}

function normalizarFilaExcel(configuracion = {}) {
    const {
        fila = [],
        indice = 0,
        nombreHoja = "",
        rutaExcel = ""
    } = configuracion;

    return {
        nombre: limpiarValor(fila[0]),
        tipo: limpiarValor(fila[1]),
        descripcion: limpiarValor(fila[2]),
        metasAcciones: limpiarValor(fila[3]),
        metaBeneficiarios: limpiarValor(fila[4]),
        beneficiariosActuales: limpiarValor(fila[5]),
        presupuestoAsignado: limpiarValor(fila[6]),
        presupuestoEjercido: limpiarValor(fila[7]),
        avance: limpiarValor(fila[8]),
        estado: limpiarValor(fila[9]),
        fechaInicio: limpiarValor(fila[10]),
        fechaFin: limpiarValor(fila[11]),
        alcaldia: limpiarValor(fila[12]),
        observaciones: limpiarValor(fila[13]),
        archivoFuente: rutaExcel,
        hojaFuente: nombreHoja,
        filaFuente: indice + FILAS_INICIALES_A_IGNORAR + 1,
        raw: fila
    };
}

function esProgramaCrudoValido(programa = {}) {
    if (!programa || typeof programa !== "object") {
        return false;
    }

    if (!tieneTexto(programa.nombre)) {
        return false;
    }

    const nombreNormalizado = programa.nombre.trim().toLowerCase();

    if (nombreNormalizado.startsWith("nombre oficial")) {
        return false;
    }

    if (nombreNormalizado === "na" || nombreNormalizado === "null") {
        return false;
    }

    return true;
}

function esHojaIgnorada(nombreHoja = "") {
    const nombreNormalizado = normalizarTexto(nombreHoja);

    return HOJAS_IGNORADAS.includes(nombreNormalizado);
}

function limpiarValor(valor) {
    if (valor === null || valor === undefined) {
        return null;
    }

    if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
        return valor.toISOString().slice(0, 10);
    }

    const texto = String(valor).trim();

    if (!texto || texto.toUpperCase() === "NA" || texto.toUpperCase() === "NULL") {
        return null;
    }

    return texto;
}

function tieneTexto(valor) {
    return typeof valor === "string" && valor.trim().length > 0;
}

function normalizarTexto(valor) {
    return String(valor)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function normalizarIdBusqueda(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}