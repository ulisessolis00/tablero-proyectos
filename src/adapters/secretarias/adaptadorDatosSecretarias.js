// src/adapters/secretarias/adaptadorDatosSecretarias.js

export function adaptarDatosSecretarias(datosFuente, metadataSecretarias = []) {
    const metadataNormalizada = normalizarMetadataSecretarias(metadataSecretarias);

    if (Array.isArray(datosFuente)) {
        return adaptarDesdeJson(datosFuente, metadataNormalizada);
    }

    if (datosFuente && typeof datosFuente === "object") {
        return adaptarDesdeHojasExcel(datosFuente, metadataNormalizada);
    }

    return [];
}

function normalizarMetadataSecretarias(metadataSecretarias) {
    if (Array.isArray(metadataSecretarias)) {
        return metadataSecretarias;
    }

    if (Array.isArray(metadataSecretarias?.metadataSecretarias)) {
        return metadataSecretarias.metadataSecretarias;
    }

    if (Array.isArray(metadataSecretarias?.secretarias)) {
        return metadataSecretarias.secretarias;
    }

    return [];
}


function adaptarDesdeJson(secretarias, metadataSecretarias) {
    return secretarias
        .filter((secretaria) => secretaria && typeof secretaria === "object")
        .map((secretaria, indice) => {
            const metadata = buscarMetadataSecretaria(secretaria, metadataSecretarias);

            return normalizarSecretaria({
                ...metadata,
                ...secretaria,
                programas: Array.isArray(secretaria.programas) ? secretaria.programas : []
            }, indice);
        });
}

function adaptarDesdeHojasExcel(hojasExcel, metadataSecretarias) {
    return Object.entries(hojasExcel)
        .filter(([nombreHoja]) => !esHojaIgnorada(nombreHoja))
        .map(([nombreHoja, filas], indice) => {
            const metadata = buscarMetadataPorHoja(nombreHoja, metadataSecretarias);
            const programas = adaptarProgramasDesdeFilas(filas, nombreHoja);

            return normalizarSecretaria({
                id: metadata.id || crearId(nombreHoja),
                sigla: metadata.sigla || limpiarTexto(nombreHoja, `SEC${indice + 1}`),
                nombre: metadata.nombre || limpiarTexto(nombreHoja, "Secretaría sin nombre"),
                titular: metadata.titular || "Por capturar",
                color: metadata.color || "#9f2241",
                orden: metadata.orden ?? indice + 1,
                programas
            }, indice);
        })
        .sort((a, b) => Number(a.orden || 999) - Number(b.orden || 999));
}

function adaptarProgramasDesdeFilas(filas, nombreHoja) {
    if (!Array.isArray(filas)) {
        return [];
    }

    return filas
        .map((fila, indice) => adaptarPrograma(fila, nombreHoja, indice))
        .filter((programa) => tieneValor(programa.nombre));
}

function adaptarPrograma(fila, nombreHoja, indice) {
    const filaNormalizada = normalizarLlavesObjeto(fila);

    const nombre = obtenerPrimeroConValor(filaNormalizada, [
        "programa",
        "nombre_programa",
        "nombre_del_programa",
        "nombre",
        "proyecto",
        "accion",
        "nombre_accion",
        "programa_social"
    ]);

    const tipo = obtenerPrimeroConValor(filaNormalizada, [
        "tipo",
        "tipo_programa",
        "tipo_clean",
        "clasificacion",
        "clasificacion_programa",
        "categoria"
    ]);

    const descripcion = obtenerPrimeroConValor(filaNormalizada, [
        "descripcion",
        "descripcion_programa",
        "objetivo",
        "objetivo_general",
        "detalle"
    ]);

    const presupuestoAsignado = obtenerPrimeroConValor(filaNormalizada, [
        "presupuesto_asignado",
        "presupuesto",
        "monto_presupuesto",
        "presupuesto_reportado",
        "presupuesto_aprobado"
    ]);

    const presupuestoEjercido = obtenerPrimeroConValor(filaNormalizada, [
        "presupuesto_ejercido",
        "ejercido",
        "monto_ejercido",
        "presupuesto_pagado"
    ]);

    const beneficiariosActuales = obtenerPrimeroConValor(filaNormalizada, [
        "beneficiarios_actuales",
        "beneficiarios",
        "personas_beneficiarias",
        "poblacion_beneficiaria",
        "beneficiarios_reportados"
    ]);

    const metaBeneficiarios = obtenerPrimeroConValor(filaNormalizada, [
        "meta_beneficiarios",
        "meta",
        "poblacion_objetivo",
        "beneficiarios_meta"
    ]);

    const avance = obtenerPrimeroConValor(filaNormalizada, [
        "avance",
        "avance_fisico",
        "porcentaje_avance",
        "avance_reportado",
        "porcentaje"
    ]);

    const fechaInicio = obtenerPrimeroConValor(filaNormalizada, [
        "fecha_inicio",
        "inicio",
        "fecha_de_inicio"
    ]);

    const fechaFin = obtenerPrimeroConValor(filaNormalizada, [
        "fecha_fin",
        "fecha_termino",
        "fin",
        "fecha_de_fin",
        "fecha_conclusion"
    ]);

    const alcaldia = obtenerPrimeroConValor(filaNormalizada, [
        "alcaldia",
        "alcaldias",
        "territorio",
        "cobertura",
        "zona"
    ]);

    const observaciones = obtenerPrimeroConValor(filaNormalizada, [
        "observaciones",
        "comentarios",
        "notas",
        "nota"
    ]);

    return {
        id: crearId(`${nombreHoja}-${nombre || indice + 1}`),
        nombre: limpiarTexto(nombre, ""),
        tipo: limpiarTexto(tipo, "General"),
        descripcion: limpiarTexto(descripcion, "Sin descripción capturada"),
        presupuestoAsignado: normalizarNumero(presupuestoAsignado),
        presupuestoEjercido: normalizarNumero(presupuestoEjercido),
        beneficiariosActuales: normalizarNumero(beneficiariosActuales),
        metaBeneficiarios: normalizarNumero(metaBeneficiarios),
        avance: normalizarNumero(avance),
        fechaInicio: limpiarTexto(fechaInicio, ""),
        fechaFin: limpiarTexto(fechaFin, ""),
        alcaldia: limpiarTexto(alcaldia, ""),
        observaciones: limpiarTexto(observaciones, ""),
        estadoCaptura: obtenerEstadoCapturaPrograma({
            presupuestoAsignado,
            presupuestoEjercido,
            beneficiariosActuales,
            metaBeneficiarios,
            fechaInicio,
            fechaFin,
            avance,
            observaciones
        })
    };
}

function normalizarSecretaria(secretaria, indice) {
    const programas = Array.isArray(secretaria.programas)
        ? secretaria.programas.map((programa, indicePrograma) => {
            return normalizarPrograma(programa, secretaria.sigla || secretaria.nombre, indicePrograma);
        })
        : [];

    return {
        id: limpiarTexto(secretaria.id, crearId(secretaria.sigla || secretaria.nombre || `secretaria-${indice + 1}`)),
        sigla: limpiarTexto(secretaria.sigla, `SEC${indice + 1}`),
        nombre: limpiarTexto(secretaria.nombre, "Secretaría sin nombre"),
        titular: limpiarTexto(secretaria.titular, "Por capturar"),
        color: validarColor(secretaria.color) || "#9f2241",
        estadoCaptura: limpiarTexto(secretaria.estadoCaptura, obtenerEstadoCapturaSecretaria(programas)),
        programas
    };
}

function normalizarClaveSecretaria(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\./g, "")
        .replace(/^secretaria\s+de\s+la\s+/i, "")
        .replace(/^secretaria\s+de\s+las\s+/i, "")
        .replace(/^secretaria\s+de\s+los\s+/i, "")
        .replace(/^secretaria\s+de\s+/i, "")
        .replace(/^secretaria\s+del\s+/i, "")
        .replace(/\s+/g, "");
}

function normalizarPrograma(programa, siglaSecretaria, indicePrograma) {
    const programaSeguro = programa && typeof programa === "object" ? programa : {};

    return {
        id: limpiarTexto(
            programaSeguro.id,
            crearId(`${siglaSecretaria || "programa"}-${programaSeguro.nombre || indicePrograma + 1}`)
        ),
        nombre: limpiarTexto(programaSeguro.nombre, "Programa sin nombre"),
        tipo: limpiarTexto(programaSeguro.tipo || programaSeguro.tipoPrograma || programaSeguro.tipoClean, "General"),
        descripcion: limpiarTexto(programaSeguro.descripcion, "Sin descripción capturada"),
        presupuestoAsignado: normalizarNumero(programaSeguro.presupuestoAsignado),
        presupuestoEjercido: normalizarNumero(programaSeguro.presupuestoEjercido),
        beneficiariosActuales: normalizarNumero(programaSeguro.beneficiariosActuales),
        metaBeneficiarios: normalizarNumero(programaSeguro.metaBeneficiarios),
        avance: normalizarNumero(programaSeguro.avance),
        fechaInicio: limpiarTexto(programaSeguro.fechaInicio, ""),
        fechaFin: limpiarTexto(programaSeguro.fechaFin, ""),
        alcaldia: limpiarTexto(programaSeguro.alcaldia, ""),
        observaciones: limpiarTexto(programaSeguro.observaciones, ""),
        estadoCaptura: limpiarTexto(
            programaSeguro.estadoCaptura,
            obtenerEstadoCapturaPrograma(programaSeguro)
        )
    };
}

function buscarMetadataSecretaria(secretaria, metadataSecretarias) {
    const candidatosSecretaria = [
        secretaria.id,
        secretaria.sigla,
        secretaria.nombre,
        secretaria.hoja,
        ...(Array.isArray(secretaria.aliases) ? secretaria.aliases : [])
    ]
        .map(normalizarClaveSecretaria)
        .filter(Boolean);

    return metadataSecretarias.find((metadata) => {
        const candidatosMetadata = [
            metadata.id,
            metadata.sigla,
            metadata.nombre,
            metadata.hoja,
            ...(Array.isArray(metadata.aliases) ? metadata.aliases : [])
        ]
            .map(normalizarClaveSecretaria)
            .filter(Boolean);

        return candidatosMetadata.some((valorMetadata) => {
            return candidatosSecretaria.includes(valorMetadata);
        });
    }) || {};
}

function buscarMetadataPorHoja(nombreHoja, metadataSecretarias) {
    const hojaNormalizada = normalizarClaveSecretaria(nombreHoja);

    return metadataSecretarias.find((metadata) => {
        const candidatos = [
            metadata.id,
            metadata.sigla,
            metadata.nombre,
            metadata.hoja,
            ...(Array.isArray(metadata.aliases) ? metadata.aliases : [])
        ];

        return candidatos.some((candidato) => {
            return normalizarClaveSecretaria(candidato) === hojaNormalizada;
        });
    }) || {};
}

function esHojaIgnorada(nombreHoja) {
    const hoja = normalizarTexto(nombreHoja);

    return [
        "instrucciones",
        "catalogo",
        "catalogos",
        "diccionario",
        "metadata",
        "metadatos",
        "base",
        "resumen"
    ].includes(hoja);
}

function normalizarLlavesObjeto(objeto) {
    return Object.entries(objeto || {}).reduce((acumulado, [llave, valor]) => {
        acumulado[normalizarLlave(llave)] = valor;
        return acumulado;
    }, {});
}

function normalizarLlave(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^\w]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

function obtenerPrimeroConValor(objeto, llaves) {
    for (const llave of llaves) {
        const valor = objeto[llave];

        if (tieneValor(valor)) {
            return valor;
        }
    }

    return "";
}

function obtenerEstadoCapturaSecretaria(programas) {
    if (!programas.length) {
        return "sinDatos";
    }

    const completos = programas.filter((programa) => programa.estadoCaptura === "completo").length;

    if (completos === programas.length) {
        return "completo";
    }

    if (completos > 0) {
        return "parcial";
    }

    return "pendiente";
}

function obtenerEstadoCapturaPrograma(programa) {
    const tienePresupuesto = tieneNumeroMayorACero(programa.presupuestoAsignado)
        || tieneNumeroMayorACero(programa.presupuestoEjercido)
        || tieneNumeroMayorACero(programa.presupuesto);

    const tieneBeneficiarios = tieneNumeroMayorACero(programa.beneficiariosActuales)
        || tieneNumeroMayorACero(programa.metaBeneficiarios)
        || tieneNumeroMayorACero(programa.beneficiarios);

    const tieneFechas = tieneValor(programa.fechaInicio) && tieneValor(programa.fechaFin);
    const tieneAvance = tieneValor(programa.avance);
    const tieneObservaciones = tieneValor(programa.observaciones);

    const totalCampos = [
        tienePresupuesto,
        tieneBeneficiarios,
        tieneFechas,
        tieneAvance,
        tieneObservaciones
    ].filter(Boolean).length;

    if (totalCampos >= 4) {
        return "completo";
    }

    if (totalCampos > 0) {
        return "parcial";
    }

    return "pendiente";
}

function tieneValor(valor) {
    if (valor === null || valor === undefined) {
        return false;
    }

    const texto = String(valor).trim().toUpperCase();

    return texto !== "" && texto !== "NA" && texto !== "NULL" && texto !== "N/A";
}

function tieneNumeroMayorACero(valor) {
    const numero = normalizarNumero(valor);
    return numero !== null && numero > 0;
}

function normalizarNumero(valor) {
    if (valor === null || valor === undefined || valor === "") {
        return null;
    }

    if (typeof valor === "number") {
        return Number.isFinite(valor) ? valor : null;
    }

    const texto = String(valor)
        .replace(/\$/g, "")
        .replace(/,/g, "")
        .replace(/%/g, "")
        .trim();

    const numero = Number(texto);

    return Number.isFinite(numero) ? numero : null;
}

function limpiarTexto(valor, valorDefault = "") {
    const texto = String(valor ?? "").trim();

    if (!texto || texto.toUpperCase() === "NA" || texto.toUpperCase() === "NULL" || texto.toUpperCase() === "N/A") {
        return valorDefault;
    }

    return texto;
}

function crearId(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function normalizarTexto(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function validarColor(valor) {
    if (/^#[0-9a-fA-F]{6}$/.test(valor || "")) {
        return valor;
    }

    return "";
}