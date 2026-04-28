// src/services/datos/servicioExcel.js

import * as XLSX from "xlsx";
import { obtenerArrayBufferLocal } from "./servicioArchivosLocales";

export async function leerExcelLocal(rutaArchivo, opciones = {}) {
    const buffer = await obtenerArrayBufferLocal(rutaArchivo);

    const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: true,
        dense: false
    });

    if (opciones.nombreHoja) {
        return leerHojaExcel(workbook, opciones.nombreHoja, opciones);
    }

    return leerTodasLasHojasExcel(workbook, opciones);
}

export function leerHojaExcel(workbook, nombreHoja, opciones = {}) {
    const hoja = workbook.Sheets[nombreHoja];

    if (!hoja) {
        throw new Error(`No existe la hoja "${nombreHoja}" en el archivo Excel.`);
    }

    return XLSX.utils.sheet_to_json(hoja, {
        defval: "",
        raw: false,
        ...opciones.sheetToJson
    });
}

export function leerTodasLasHojasExcel(workbook, opciones = {}) {
    return workbook.SheetNames.reduce((acumulado, nombreHoja) => {
        acumulado[nombreHoja] = leerHojaExcel(workbook, nombreHoja, opciones);
        return acumulado;
    }, {});
}

export function obtenerNombresHojasExcel(workbook) {
    return workbook?.SheetNames || [];
}