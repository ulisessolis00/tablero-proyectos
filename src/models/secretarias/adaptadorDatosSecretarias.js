// src/adapters/secretarias/adaptadorDatosSecretarias.js

import {
    crearSecretaria,
    crearPrograma,
    esSecretariaValida,
    esProgramaValido
} from "../../models/secretarias/modeloDatosSecretarias";

const FUENTE_DEFAULT = "local";
const TIPO_PROGRAMA_DEFAULT = "General";

const ALIAS_PROGRAMA = Object.freeze({
    nombre: [
        "nombre",
        "programa",
        "nombre_programa",
        "nombre oficial",
        "nombre oficial del programa",
        "Nombre oficial del programa"
    ],
    tipo: [
        "tipo",
        "clasificacion",
        "clasificación",
        "tipo_programa",
        "tipo de programa"
    ],
    descripcion: [
        "descripcion",
        "descripción",
        "descripcion_programa",
        "descripción del programa"
    ],
    metasAcciones: [
        "metas_acciones",
        "metasAcciones",
        "meta_acciones",
        "metas y acciones",
        "acciones"
    ],
    metaBeneficiarios: [
        "metas_benef",
        "metasBenef",
        "meta_beneficiarios",
        "metaBeneficiarios",
        "meta de beneficiarios"
    ],
    beneficiariosActuales: [
        "benef_actual",
        "beneficiariosActuales",
        "beneficiarios_actuales",
        "beneficiarios",
        "beneficiarios actuales"
    ],
    presupuestoAsignado: [
        "ppto_asignado",
        "presupuestoAsignado",
        "presupuesto_asignado",
        "presupuesto asignado"
    ],
    presupuestoEjercido: [
        "ppto_ejercido",
        "presupuestoEjercido",
        "presupuesto_ejercido",
        "presupuesto ejercido"
    ],
    avance: [
        "avance",
        "porcentaje_avance",
        "porcentaje de avance",
        "avance físico",
        "avance fisico"
    ],
    estado: [
        "estado",
        "estatus",
        "situacion",
        "situación"
    ],
    fechaInicio: [
        "fecha_inicio",
        "fechaInicio",
        "fecha de inicio",
        "inicio"
    ],
    fechaFin: [
        "fecha_fin",
        "fechaFin",
        "fecha de fin",
        "fecha final",
        "fin"
    ],
    alcaldia: [
        "alcaldia",
        "alcaldía",
        "demarcacion",
        "demarcación"
    ],
    observaciones: [
        "obs",
        "observaciones",
        "comentarios",
        "notas"
    ]
});

export function adaptarDatosSecretarias(configuracion = {}) {
    const {
        metadataSecretarias = {},
        datosPorSecretaria = {},
        fuente = FUENTE_DEFAULT,
        actualizadoEn = null
    } = configuracion;

    const secretarias = Object.keys(metadataSecretarias)
        .map((sigla) => {
            return adaptarSecretaria({
                sigla,
                metadata: metadataSecretarias[sigla],
                programasCrudos: datosPorSecretaria[sigla] || [],
                fuente,
                actualizadoEn
            });
        })
        .filter(esSecretariaValida)
        .sort(ordenarSecretarias);

    return secretarias;
}

export function adaptarSecretaria(configuracion = {}) {
    const {
        sigla,
        metadata = {},
        programasCrudos = [],
        fuente = FUENTE_DEFAULT,
        actualizadoEn = null
    } = configuracion;

    const secretariaId = metadata.id || sigla;

    const programas = adaptarProgramas({
        programasCrudos,
        secretariaId,
        fuente,
        actualizadoEn
    });

    return crearSecretaria({
        id: secretariaId,
        sigla,
        nombre: metadata.nombre,
        titular: metadata.titular,
        color: metadata.color,
        orden: metadata.orden,
        activa: metadata.activa,
        fuente,
        actualizadoEn,
        programas
    });
}

export function adaptarProgramas(configuracion = {}) {
    const {
        programasCrudos = [],
        secretariaId = "",
        fuente = FUENTE_DEFAULT,
        actualizadoEn = null
    } = configuracion;

    if (!Array.isArray(programasCrudos)) {
        return [];
    }

    return programasCrudos
        .filter(esFilaProgramaValida)
        .map((programaCrudo, indice) => {
            return adaptarPrograma({
                programaCrudo,
                secretariaId,
                indice,
                fuente,
                actualizadoEn
            });
        })
        .filter(esProgramaValido);
}

export function adaptarPrograma(configuracion = {}) {
    const {
        programaCrudo = {},
        secretariaId = "",
        indice = 0,
        fuente = FUENTE_DEFAULT,
        actualizadoEn = null
    } = configuracion;

    const nombre = obtenerValorPorAlias(programaCrudo, ALIAS_PROGRAMA.nombre);

    return crearPrograma({
        id: crearIdPrograma(secretariaId, nombre, indice),
        secretariaId,
        nombre,
        tipo: obtenerValorPorAlias(programaCrudo, ALIAS_PROGRAMA.tipo) || TIPO_PROGRAMA_DEFAULT,
        descripcion: obtenerValorPorAlias(programaCrudo, ALIAS_PROGRAMA.descripcion),
        metasAcciones: obtenerValorPorAlias(programaCrudo, ALIAS_PROGRAMA.metasAcciones),
        metaBeneficiarios: obtenerValorPorAlias(programaCrudo, ALIAS_PROGRAMA.metaBeneficiarios),
        beneficiariosActuales: obtenerValorPorAlias(programaCrudo, ALIAS_PROGRAMA.beneficiariosActuales),
        presupuestoAsignado: obtenerValorPorAlias(programaCrudo, ALIAS_PROGRAMA.presupuestoAsignado),
        presupuestoEjercido: obtenerValorPorAlias(programaCrudo, ALIAS_PROGRAMA.presupuestoEjercido),
        avance: obtenerValorPorAlias(programaCrudo, ALIAS_PROGRAMA.avance),
        estado: obtenerValorPorAlias(programaCrudo, ALIAS_PROGRAMA.estado),
        fechaInicio: obtenerValorPorAlias(programaCrudo, ALIAS_PROGRAMA.fechaInicio),
        fechaFin: obtenerValorPorAlias(programaCrudo, ALIAS_PROGRAMA.fechaFin),
        alcaldia: obtenerValorPorAlias(programaCrudo, ALIAS_PROGRAMA.alcaldia),
        observaciones: obtenerValorPorAlias(programaCrudo, ALIAS_PROGRAMA.observaciones),
        fuente,
        actualizadoEn,
        raw: programaCrudo
    });
}

export function adaptarDatosDesdeArreglo(configuracion = {}) {
    const {
        secretariasCrudas = [],
        fuente = FUENTE_DEFAULT,
        actualizadoEn = null
    } = configuracion;

    if (!Array.isArray(secretariasCrudas)) {
        return [];
    }

    return secretariasCrudas
        .map((secretariaCruda) => {
            return crearSecretaria({
                id: secretariaCruda.id || secretariaCruda.sigla,
                sigla: secretariaCruda.sigla || secretariaCruda.id,
                nombre: secretariaCruda.nombre,
                titular: secretariaCruda.titular,
                color: secretariaCruda.color,
                orden: secretariaCruda.orden,
                activa: secretariaCruda.activa,
                fuente,
                actualizadoEn,
                programas: adaptarProgramas({
                    programasCrudos: secretariaCruda.programas || [],
                    secretariaId: secretariaCruda.id || secretariaCruda.sigla,
                    fuente,
                    actualizadoEn
                })
            });
        })
        .filter(esSecretariaValida)
        .sort(ordenarSecretarias);
}

export function adaptarDatosDesdeHojas(configuracion = {}) {
    const {
        hojas = {},
        metadataSecretarias = {},
        fuente = FUENTE_DEFAULT,
        actualizadoEn = null
    } = configuracion;

    const datosPorSecretaria = Object.keys(hojas).reduce((acumulado, nombreHoja) => {
        if (esHojaIgnorada(nombreHoja)) {
            return acumulado;
        }

        acumulado[nombreHoja] = normalizarFilasHoja(hojas[nombreHoja]);
        return acumulado;
    }, {});

    return adaptarDatosSecretarias({
        metadataSecretarias,
        datosPorSecretaria,
        fuente,
        actualizadoEn
    });
}

export function normalizarFilasHoja(filas = []) {
    if (!Array.isArray(filas)) {
        return [];
    }

    return filas
        .filter(esFilaProgramaValida)
        .map((fila) => {
            return {
                nombre: obtenerValorPorAlias(fila, ALIAS_PROGRAMA.nombre),
                tipo: obtenerValorPorAlias(fila, ALIAS_PROGRAMA.tipo),
                descripcion: obtenerValorPorAlias(fila, ALIAS_PROGRAMA.descripcion),
                metasAcciones: obtenerValorPorAlias(fila, ALIAS_PROGRAMA.metasAcciones),
                metaBeneficiarios: obtenerValorPorAlias(fila, ALIAS_PROGRAMA.metaBeneficiarios),
                beneficiariosActuales: obtenerValorPorAlias(fila, ALIAS_PROGRAMA.beneficiariosActuales),
                presupuestoAsignado: obtenerValorPorAlias(fila, ALIAS_PROGRAMA.presupuestoAsignado),
                presupuestoEjercido: obtenerValorPorAlias(fila, ALIAS_PROGRAMA.presupuestoEjercido),
                avance: obtenerValorPorAlias(fila, ALIAS_PROGRAMA.avance),
                estado: obtenerValorPorAlias(fila, ALIAS_PROGRAMA.estado),
                fechaInicio: obtenerValorPorAlias(fila, ALIAS_PROGRAMA.fechaInicio),
                fechaFin: obtenerValorPorAlias(fila, ALIAS_PROGRAMA.fechaFin),
                alcaldia: obtenerValorPorAlias(fila, ALIAS_PROGRAMA.alcaldia),
                observaciones: obtenerValorPorAlias(fila, ALIAS_PROGRAMA.observaciones),
                raw: fila
            };
        });
}

function obtenerValorPorAlias(registro = {}, alias = []) {
    if (!registro || typeof registro !== "object") {
        return null;
    }

    const mapaNormalizado = crearMapaCamposNormalizados(registro);

    for (const nombreCampo of alias) {
        const llaveNormalizada = normalizarLlave(nombreCampo);

        if (Object.prototype.hasOwnProperty.call(mapaNormalizado, llaveNormalizada)) {
            return limpiarValor(mapaNormalizado[llaveNormalizada]);
        }
    }

    return null;
}

function crearMapaCamposNormalizados(registro) {
    return Object.keys(registro).reduce((mapa, llave) => {
        mapa[normalizarLlave(llave)] = registro[llave];
        return mapa;
    }, {});
}

function esFilaProgramaValida(fila = {}) {
    if (!fila || typeof fila !== "object") {
        return false;
    }

    const nombre = obtenerValorPorAlias(fila, ALIAS_PROGRAMA.nombre);

    if (!tieneTexto(nombre)) {
        return false;
    }

    const nombreNormalizado = String(nombre).trim().toLowerCase();

    if (nombreNormalizado.startsWith("nombre oficial")) {
        return false;
    }

    if (nombreNormalizado === "na" || nombreNormalizado === "null") {
        return false;
    }

    return true;
}

function esHojaIgnorada(nombreHoja = "") {
    const nombreNormalizado = normalizarLlave(nombreHoja);

    return [
        "instrucciones",
        "indice",
        "índice"
    ].includes(nombreNormalizado);
}

function crearIdPrograma(secretariaId, nombre, indice) {
    const base = `${secretariaId}-${nombre || "programa"}-${indice + 1}`;

    return String(base)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function ordenarSecretarias(secretariaA, secretariaB) {
    const ordenA = secretariaA.orden ?? 999;
    const ordenB = secretariaB.orden ?? 999;

    if (ordenA !== ordenB) {
        return ordenA - ordenB;
    }

    return secretariaA.nombre.localeCompare(secretariaB.nombre, "es");
}

function limpiarValor(valor) {
    if (valor === null || valor === undefined) {
        return null;
    }

    if (typeof valor === "number") {
        return Number.isFinite(valor) ? valor : null;
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

function normalizarLlave(valor) {
    return String(valor)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}