// src/models/secretarias/modeloDatosSecretarias.js

const COLOR_DEFAULT = "#9f2241";
const TIPO_PROGRAMA_DEFAULT = "General";
const ORDEN_DEFAULT = 999;
const FUENTE_DEFAULT = "local";

export const ROL_USUARIO = Object.freeze({
    principal: "principal",
    secretaria: "secretaria",
    publico: "publico"
});

export const FUENTE_DATO = Object.freeze({
    local: "local",
    excelLocal: "excelLocal",
    jsonGenerado: "jsonGenerado",
    driveExportado: "driveExportado"
});

export const ESTADO_DATO = Object.freeze({
    completo: "completo",
    parcial: "parcial",
    pendiente: "pendiente",
    sinDatos: "sinDatos"
});

export const ESTADO_PROGRAMA = Object.freeze({
    sinEstado: "Sin estado",
    pendiente: "Pendiente",
    enProceso: "En proceso",
    concluido: "Concluido",
    suspendido: "Suspendido"
});

export const CAMPOS_COMPLETITUD_PROGRAMA = Object.freeze([
    "nombre",
    "tipo",
    "descripcion",
    "presupuestoAsignado",
    "presupuestoEjercido",
    "beneficiariosActuales",
    "avance",
    "fechaInicio",
    "fechaFin",
    "alcaldia"
]);

export function crearSecretaria(datos = {}) {
    const sigla = normalizarSigla(datos.sigla || datos.id);
    const id = normalizarId(datos.id || sigla);
    const fuente = crearFuenteDatos(datos.fuente);
    const programas = normalizarProgramas(datos.programas, id, fuente);

    return {
        id,
        sigla,
        nombre: normalizarTexto(datos.nombre, "Secretaría sin nombre"),
        titular: normalizarTexto(datos.titular, "Titular pendiente"),
        color: normalizarColor(datos.color),
        orden: normalizarNumero(datos.orden) ?? ORDEN_DEFAULT,
        activa: datos.activa !== false,
        fuente,
        fuentes: normalizarFuentes(datos.fuentes, fuente),
        archivoFuente: normalizarTexto(datos.archivoFuente || fuente.archivo),
        hojaFuente: normalizarTexto(datos.hojaFuente || fuente.hoja),
        actualizadoEn: normalizarFecha(datos.actualizadoEn),
        permisos: crearPermisosSecretaria(datos.permisos),
        programas
    };
}

export function crearPrograma(datos = {}) {
    const secretariaId = normalizarId(datos.secretariaId);
    const nombre = normalizarTexto(datos.nombre, "Programa sin nombre");
    const fuente = crearFuenteDatos(datos.fuente);

    return {
        id: normalizarId(datos.id || `${secretariaId}-${nombre}`),
        secretariaId,
        nombre,
        tipo: normalizarTexto(datos.tipo, TIPO_PROGRAMA_DEFAULT),
        descripcion: normalizarTexto(datos.descripcion),
        metasAcciones: normalizarTexto(datos.metasAcciones),
        metaBeneficiarios: normalizarNumero(datos.metaBeneficiarios),
        beneficiariosActuales: normalizarNumero(datos.beneficiariosActuales),
        presupuestoAsignado: normalizarNumero(datos.presupuestoAsignado),
        presupuestoEjercido: normalizarNumero(datos.presupuestoEjercido),
        avance: normalizarPorcentaje(datos.avance),
        estado: normalizarTexto(datos.estado, ESTADO_PROGRAMA.sinEstado),
        fechaInicio: normalizarFecha(datos.fechaInicio),
        fechaFin: normalizarFecha(datos.fechaFin),
        alcaldia: normalizarTexto(datos.alcaldia),
        observaciones: normalizarTexto(datos.observaciones),
        fuente,
        archivoFuente: normalizarTexto(datos.archivoFuente || fuente.archivo),
        hojaFuente: normalizarTexto(datos.hojaFuente || fuente.hoja),
        actualizadoEn: normalizarFecha(datos.actualizadoEn),
        raw: datos.raw ?? null
    };
}

export function crearFuenteDatos(datos = {}) {
    if (typeof datos === "string") {
        return {
            tipo: normalizarTexto(datos, FUENTE_DEFAULT),
            archivo: "",
            hoja: "",
            rango: "",
            filaInicio: null
        };
    }

    return {
        tipo: normalizarTexto(datos.tipo, FUENTE_DEFAULT),
        archivo: normalizarTexto(datos.archivo),
        hoja: normalizarTexto(datos.hoja),
        rango: normalizarTexto(datos.rango),
        filaInicio: normalizarNumero(datos.filaInicio)
    };
}

export function crearPermisosSecretaria(datos = {}) {
    return {
        rolesPermitidos: normalizarLista(datos.rolesPermitidos, [
            ROL_USUARIO.principal,
            ROL_USUARIO.secretaria
        ]),
        usuariosPermitidos: normalizarLista(datos.usuariosPermitidos),
        secretariasPermitidas: normalizarLista(datos.secretariasPermitidas)
    };
}

export function crearUsuarioSesion(datos = {}) {
    return {
        id: normalizarTexto(datos.id),
        nombre: normalizarTexto(datos.nombre, "Usuario"),
        rol: normalizarTexto(datos.rol, ROL_USUARIO.publico),
        secretariaId: normalizarId(datos.secretariaId),
        secretariasPermitidas: normalizarLista(datos.secretariasPermitidas).map(normalizarId),
        autenticado: datos.autenticado === true,
        expiraEn: normalizarFechaHora(datos.expiraEn)
    };
}

export function crearResumenSecretaria(secretaria = {}) {
    const programas = Array.isArray(secretaria.programas) ? secretaria.programas : [];

    const totalProgramas = programas.length;
    const tiposPrograma = obtenerTiposPrograma(programas);
    const presupuestoAsignadoTotal = sumarCampo(programas, "presupuestoAsignado");
    const presupuestoEjercidoTotal = sumarCampo(programas, "presupuestoEjercido");
    const programasConPresupuesto = contarConNumeroMayorACero(programas, "presupuestoAsignado");
    const programasConBeneficiarios = contarConNumeroMayorACero(programas, "beneficiariosActuales");
    const avancePromedio = calcularPromedioCampo(programas, "avance");
    const completitud = calcularCompletitudProgramas(programas);

    return {
        secretariaId: secretaria.id || "",
        totalProgramas,
        totalTiposPrograma: tiposPrograma.length,
        tiposPrograma,
        presupuestoAsignadoTotal,
        presupuestoEjercidoTotal,
        programasConPresupuesto,
        programasConBeneficiarios,
        avancePromedio,
        completitud,
        estadoDato: obtenerEstadoDato(completitud),
        archivoFuente: secretaria.archivoFuente || "",
        hojaFuente: secretaria.hojaFuente || ""
    };
}

export function crearResumenGlobal(secretarias = []) {
    const listaSecretarias = Array.isArray(secretarias) ? secretarias : [];

    const secretariasActivas = listaSecretarias.filter((secretaria) => secretaria.activa !== false);
    const secretariasConDatos = secretariasActivas.filter(tieneProgramas);
    const totalProgramas = secretariasActivas.reduce(sumarProgramasSecretaria, 0);
    const presupuestoAsignadoTotal = secretariasActivas.reduce((total, secretaria) => {
        return total + crearResumenSecretaria(secretaria).presupuestoAsignadoTotal;
    }, 0);

    return {
        totalSecretarias: listaSecretarias.length,
        totalSecretariasActivas: secretariasActivas.length,
        totalSecretariasConDatos: secretariasConDatos.length,
        totalProgramas,
        presupuestoAsignadoTotal,
        porcentajeIntegrado: calcularPorcentaje(
            secretariasConDatos.length,
            secretariasActivas.length
        )
    };
}

export function filtrarSecretariasPorUsuario(secretarias = [], usuario = {}) {
    const usuarioNormalizado = crearUsuarioSesion(usuario);

    if (usuarioNormalizado.rol === ROL_USUARIO.principal) {
        return secretarias;
    }

    return secretarias.filter((secretaria) => {
        return puedeVerSecretaria(usuarioNormalizado, secretaria);
    });
}

export function puedeVerSecretaria(usuario = {}, secretaria = {}) {
    const usuarioNormalizado = crearUsuarioSesion(usuario);
    const secretariaId = normalizarId(secretaria.id);

    if (!usuarioNormalizado.autenticado) {
        return false;
    }

    if (usuarioNormalizado.rol === ROL_USUARIO.principal) {
        return true;
    }

    if (usuarioNormalizado.rol !== ROL_USUARIO.secretaria) {
        return false;
    }

    if (usuarioNormalizado.secretariaId === secretariaId) {
        return true;
    }

    return usuarioNormalizado.secretariasPermitidas.includes(secretariaId);
}

export function tieneProgramas(secretaria = {}) {
    return Array.isArray(secretaria.programas) && secretaria.programas.length > 0;
}

export function esSecretariaValida(secretaria = {}) {
    return Boolean(
        tieneValor(secretaria.id) &&
        tieneValor(secretaria.sigla) &&
        tieneValor(secretaria.nombre)
    );
}

export function esProgramaValido(programa = {}) {
    return Boolean(
        tieneValor(programa.id) &&
        tieneValor(programa.secretariaId) &&
        tieneValor(programa.nombre)
    );
}

function normalizarProgramas(programas, secretariaId, fuenteSecretaria) {
    if (!Array.isArray(programas)) {
        return [];
    }

    return programas.map((programa) => {
        return crearPrograma({
            ...programa,
            secretariaId: programa.secretariaId || secretariaId,
            fuente: programa.fuente || fuenteSecretaria,
            archivoFuente: programa.archivoFuente || fuenteSecretaria.archivo,
            hojaFuente: programa.hojaFuente || fuenteSecretaria.hoja
        });
    });
}

function normalizarFuentes(fuentes, fuenteDefault) {
    if (!Array.isArray(fuentes) || fuentes.length === 0) {
        return [fuenteDefault];
    }

    return fuentes.map(crearFuenteDatos);
}

function obtenerTiposPrograma(programas) {
    const tipos = programas
        .map((programa) => normalizarTexto(programa.tipo, TIPO_PROGRAMA_DEFAULT))
        .filter(tieneValor);

    return [...new Set(tipos)];
}

function sumarProgramasSecretaria(total, secretaria) {
    const programas = Array.isArray(secretaria.programas) ? secretaria.programas : [];
    return total + programas.length;
}

function sumarCampo(registros, campo) {
    return registros.reduce((total, registro) => {
        const valor = normalizarNumero(registro[campo]);
        return total + (valor ?? 0);
    }, 0);
}

function contarConNumeroMayorACero(registros, campo) {
    return registros.filter((registro) => {
        const valor = normalizarNumero(registro[campo]);
        return valor !== null && valor > 0;
    }).length;
}

function calcularPromedioCampo(registros, campo) {
    const valores = registros
        .map((registro) => normalizarNumero(registro[campo]))
        .filter((valor) => valor !== null);

    if (valores.length === 0) {
        return null;
    }

    const total = valores.reduce((acumulado, valor) => acumulado + valor, 0);

    return redondear(total / valores.length, 2);
}

function calcularCompletitudProgramas(programas) {
    if (!Array.isArray(programas) || programas.length === 0) {
        return 0;
    }

    const totalCampos = programas.length * CAMPOS_COMPLETITUD_PROGRAMA.length;
    const camposConDato = programas.reduce(contarCamposCompletosPrograma, 0);

    return calcularPorcentaje(camposConDato, totalCampos);
}

function contarCamposCompletosPrograma(total, programa) {
    const camposCompletos = CAMPOS_COMPLETITUD_PROGRAMA.filter((campo) => {
        return tieneValor(programa[campo]);
    });

    return total + camposCompletos.length;
}

function obtenerEstadoDato(completitud) {
    if (completitud === 0) {
        return ESTADO_DATO.sinDatos;
    }

    if (completitud < 60) {
        return ESTADO_DATO.pendiente;
    }

    if (completitud < 95) {
        return ESTADO_DATO.parcial;
    }

    return ESTADO_DATO.completo;
}

function calcularPorcentaje(valor, total) {
    if (!total || total <= 0) {
        return 0;
    }

    return redondear((valor / total) * 100, 2);
}

function redondear(valor, decimales = 2) {
    const factor = 10 ** decimales;
    return Math.round(valor * factor) / factor;
}

function normalizarTexto(valor, valorDefault = "") {
    if (valor === null || valor === undefined) {
        return valorDefault;
    }

    const texto = String(valor).trim();

    if (!texto || texto.toUpperCase() === "NA" || texto.toUpperCase() === "NULL") {
        return valorDefault;
    }

    return texto;
}

function normalizarSigla(valor) {
    const sigla = normalizarTexto(valor, "SIN_SIGLA");
    return sigla.toUpperCase();
}

function normalizarId(valor) {
    const texto = normalizarTexto(valor, "");

    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
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

function normalizarPorcentaje(valor) {
    const numero = normalizarNumero(valor);

    if (numero === null) {
        return null;
    }

    if (numero < 0) {
        return 0;
    }

    if (numero > 100) {
        return 100;
    }

    return numero;
}

function normalizarFecha(valor) {
    if (!valor) {
        return null;
    }

    if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
        return valor.toISOString().slice(0, 10);
    }

    if (typeof valor === "number" && valor > 25000) {
        return convertirFechaExcel(valor);
    }

    return normalizarTexto(valor, null);
}

function normalizarFechaHora(valor) {
    if (!valor) {
        return null;
    }

    if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
        return valor.toISOString();
    }

    return normalizarTexto(valor, null);
}

function convertirFechaExcel(serialExcel) {
    const fechaBase = new Date(Date.UTC(1899, 11, 30));
    const fecha = new Date(fechaBase.getTime() + serialExcel * 86400000);

    if (Number.isNaN(fecha.getTime())) {
        return null;
    }

    return fecha.toISOString().slice(0, 10);
}

function normalizarColor(valor) {
    const color = normalizarTexto(valor, COLOR_DEFAULT);

    if (/^#[0-9a-fA-F]{6}$/.test(color)) {
        return color;
    }

    return COLOR_DEFAULT;
}

function normalizarLista(valor, valorDefault = []) {
    if (!valor) {
        return valorDefault;
    }

    if (Array.isArray(valor)) {
        return valor
            .map((item) => normalizarTexto(item))
            .filter(tieneValor);
    }

    return [normalizarTexto(valor)].filter(tieneValor);
}

function tieneValor(valor) {
    if (valor === null || valor === undefined) {
        return false;
    }

    if (typeof valor === "number") {
        return Number.isFinite(valor);
    }

    if (typeof valor === "string") {
        const texto = valor.trim().toUpperCase();
        return texto !== "" && texto !== "NA" && texto !== "NULL";
    }

    return true;
}