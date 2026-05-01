// Array para almacenar el historial de evaluaciones
let historial = [];

// Especificaciones técnicas
const especificaciones = {
    // Variables de Voltaje
    bateria: { 
        tipo: 'voltaje', 
        valor: 3.7, 
        unidad: 'V',
        criterio: '≥ 3.7V = Bueno'
    },
    pinCarga: { 
        tipo: 'voltaje', 
        valor: 5.0, 
        unidad: 'V',
        criterio: '≥ 5V = Bueno'
    },
    subplacaCarga: { 
        tipo: 'voltaje', 
        valor: 5.0, 
        unidad: 'V',
        criterio: '≥ 5V = Bueno'
    },
    flexCarga: { 
        tipo: 'voltaje', 
        valor: 5.0, 
        unidad: 'V',
        criterio: '≥ 5V = Bueno'
    },
    circuitoCarga: { 
        tipo: 'voltaje', 
        valor: 4.3, 
        unidad: 'V',
        criterio: '≥ 4.3V = Bueno'
    },
    pulsoEncendido: { 
        tipo: 'voltaje', 
        valor: 3.7, 
        unidad: 'V',
        criterio: '≥ 3.7V = Bueno'
    },
    
    // Variables de Resistencia
    parlantes: { 
        tipo: 'rango', 
        min: 5.0, 
        max: 32.0, 
        unidad: 'Ω',
        criterio: '5-32Ω = Bueno'
    },
    vibrador: { 
        tipo: 'rango', 
        min: 12.0, 
        max: 45.0, 
        unidad: 'Ω',
        criterio: '12-45Ω = Bueno'
    },
    microfonos: { 
        tipo: 'rango', 
        min: 500, 
        max: 1500, 
        unidad: 'Ω',
        criterio: '500-1500Ω = Bueno'
    },
    
    // Variables de Consumo
    consumoOff: { 
        tipo: 'igual', 
        valor: 0.000, 
        unidad: 'A',
        criterio: '== 0.000A = Bueno'
    },
    consumoOn: { 
        tipo: 'igual', 
        valor: 0.200, 
        unidad: 'A',
        criterio: '== 0.200A = Bueno'
    },
    
    // Variables de Botones
    botonEncendido: { 
        tipo: 'texto', 
        valor: 'bzr', 
        unidad: '',
        criterio: '== BZR = Bueno'
    },
    botonVolumenMas: { 
        tipo: 'texto', 
        valor: 'bzr', 
        unidad: '',
        criterio: '== BZR = Bueno'
    },
    botonVolumenMenos: { 
        tipo: 'texto', 
        valor: 'bzr', 
        unidad: '',
        criterio: '== BZR = Bueno'
    }
};

// Función principal para evaluar todos los componentes
function evaluarTodos() {
    // Obtener información del dispositivo
    const marca = document.getElementById('marca').value.trim();
    const modelo = document.getElementById('modelo').value.trim();
    const sintomas = document.getElementById('sintomas').value.trim();
    
    if (!marca || !modelo || !sintomas) {
        alert('Por favor, complete la información del dispositivo (Marca, Modelo y Síntomas)');
        return;
    }
    
    const resultados = {};
    let tieneValores = false;

    // Evaluar cada variable
    for (const [variable, espec] of Object.entries(especificaciones)) {
        const elemento = document.getElementById(variable);
        let valor = elemento.value;
        
        // Convertir a número si es posible
        if (espec.tipo !== 'texto' && valor !== '') {
            valor = parseFloat(valor);
        }
        
        if (valor !== '' && valor !== null) {
            tieneValores = true;
            resultados[variable] = {
                valor: valor,
                resultado: evaluarVariable(valor, espec),
                especificacion: espec
            };
        } else {
            resultados[variable] = {
                valor: null,
                resultado: null,
                especificacion: espec
            };
        }
    }

    if (!tieneValores) {
        alert('Por favor, ingrese al menos un valor técnico para evaluar');
        return;
    }

    // Mostrar resultados
    mostrarResultados(resultados, marca, modelo, sintomas);
    
    // Guardar en historial
    guardarEnHistorial(resultados, marca, modelo, sintomas);
    
    // Habilitar botones
    document.getElementById('exportBtn').disabled = false;
    document.getElementById('clearBtn').disabled = false;
}

// Función para evaluar una variable individual
function evaluarVariable(valor, especificacion) {
    if (valor === null || valor === '') return null;

    switch (especificacion.tipo) {
        case 'voltaje':
            return valor >= especificacion.valor;
        case 'rango':
            return valor >= especificacion.min && valor <= especificacion.max;
        case 'igual':
            if (typeof valor === 'number') {
                return Math.abs(valor - especificacion.valor) < 0.001;
            }
            return valor === especificacion.valor;
        case 'texto':
            return valor.toLowerCase() === especificacion.valor.toLowerCase();
        default:
            return false;
    }
}

// Función para mostrar resultados en la interfaz
function mostrarResultados(resultados, marca, modelo, sintomas) {
    const container = document.getElementById('resultsContainer');
    const resumenGeneral = document.getElementById('resumenGeneral');
    const resultCard = document.getElementById('resultCard');
    const deviceInfoDisplay = document.getElementById('deviceInfoDisplay');
    
    // Mostrar información del dispositivo
    deviceInfoDisplay.innerHTML = `
        <p><strong>📱 Marca:</strong> ${marca}</p>
        <p><strong>🔧 Modelo:</strong> ${modelo}</p>
        <p><strong>📝 Síntomas:</strong> ${sintomas}</p>
    `;
    
    container.innerHTML = '';
    
    let totalVariables = 0;
    let variablesBuenas = 0;
    let variablesConValor = 0;

    for (const [variable, data] of Object.entries(resultados)) {
        if (data.valor !== null && data.valor !== '') {
            variablesConValor++;
            totalVariables++;
            
            const esBueno = data.resultado;
            const estado = esBueno ? 'Bueno' : 'Falla';
            
            if (esBueno) variablesBuenas++;

            const resultItem = document.createElement('div');
            resultItem.className = `result-item ${estado.toLowerCase()}`;
            resultItem.innerHTML = `
                <div class="result-info">
                    <span class="result-variable">${obtenerNombreVariable(variable)}</span>
                    <span class="result-value">${formatearValor(data.valor, data.especificacion.unidad)} | ${data.especificacion.criterio}</span>
                </div>
                <div class="result-status">
                    <span class="boolean-value ${esBueno ? 'boolean-true' : 'boolean-false'}">
                        ${esBueno}
                    </span>
                    <span class="status-badge status-${estado.toLowerCase()}">
                        ${estado}
                    </span>
                </div>
            `;
            container.appendChild(resultItem);
        }
    }

    // Calcular y mostrar resumen general
    let estadoGeneral = '';
    let claseResumen = '';
    
    if (variablesConValor === 0) {
        estadoGeneral = 'Sin datos';
        claseResumen = '';
    } else if (variablesBuenas === variablesConValor) {
        estadoGeneral = '✅ TODOS LOS COMPONENTES OK';
        claseResumen = 'bueno';
    } else if (variablesBuenas === 0) {
        estadoGeneral = '❌ TODOS LOS COMPONENTES FALLAN';
        claseResumen = 'falla';
    } else {
        estadoGeneral = `⚠️ PARCIAL: ${variablesBuenas}/${variablesConValor} OK`;
        claseResumen = 'parcial';
    }

    resumenGeneral.textContent = estadoGeneral;
    resumenGeneral.className = `resumen ${claseResumen}`;
    
    // Mostrar tarjeta de resultados
    resultCard.classList.remove('hidden');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Función para formatear valores para mostrar
function formatearValor(valor, unidad) {
    if (valor === null || valor === '') return '-';
    
    if (typeof valor === 'number') {
        if (unidad === 'A') {
            return valor.toFixed(3) + unidad;
        } else if (unidad === 'V') {
            return valor.toFixed(2) + unidad;
        } else if (unidad === 'Ω') {
            return valor.toFixed(1) + unidad;
        }
    }
    
    return valor + (unidad ? unidad : '');
}

// Función para obtener nombres legibles de las variables
function obtenerNombreVariable(variable) {
    const nombres = {
        bateria: 'Batería',
        pinCarga: 'Pin de Carga',
        subplacaCarga: 'Subplaca de Carga',
        flexCarga: 'Flex de Carga',
        circuitoCarga: 'Circuito de Carga',
        pulsoEncendido: 'Pulso de Encendido',
        parlantes: 'Parlantes',
        vibrador: 'Vibrador',
        microfonos: 'Micrófonos',
        consumoOff: 'Consumo OFF',
        consumoOn: 'Consumo ON',
        botonEncendido: 'Botón Encendido',
        botonVolumenMas: 'Botón Volumen +',
        botonVolumenMenos: 'Botón Volumen -'
    };
    return nombres[variable] || variable;
}

// Función para guardar en el historial
function guardarEnHistorial(resultados, marca, modelo, sintomas) {
    const registro = {
        id: Date.now(),
        fechaHora: new Date().toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }),
        marca: marca,
        modelo: modelo,
        sintomas: sintomas,
        resultados: JSON.parse(JSON.stringify(resultados))
    };
    
    historial.push(registro);
    actualizarTablaHistorial();
}

// Función para actualizar la tabla de historial
function actualizarTablaHistorial() {
    const historyBody = document.getElementById('historyBody');
    const emptyHistory = document.getElementById('emptyHistory');
    
    if (historial.length === 0) {
        historyBody.innerHTML = '';
        emptyHistory.style.display = 'block';
        return;
    }
    
    emptyHistory.style.display = 'none';
    
    // Ordenar historial por fecha (más reciente primero)
    historial.sort((a, b) => b.id - a.id);
    
    historyBody.innerHTML = historial.map(registro => {
        const resultados = registro.resultados;
        let variablesConValor = 0;
        let variablesBuenas = 0;
        
        for (const data of Object.values(resultados)) {
            if (data.valor !== null && data.valor !== '') {
                variablesConValor++;
                if (data.resultado) variablesBuenas++;
            }
        }
        
        let estadoGeneral = '';
        let claseEstado = '';
        
        if (variablesConValor === 0) {
            estadoGeneral = 'Sin datos';
            claseEstado = '';
        } else if (variablesBuenas === variablesConValor) {
            estadoGeneral = 'OK';
            claseEstado = 'cell-estado-bueno';
        } else if (variablesBuenas === 0) {
            estadoGeneral = 'FALLA';
            claseEstado = 'cell-estado-falla';
        } else {
            estadoGeneral = 'PARCIAL';
            claseEstado = 'cell-estado-parcial';
        }
        
        return `
            <tr>
                <td>${registro.fechaHora}</td>
                <td>${registro.marca || '-'}</td>
                <td>${registro.modelo || '-'}</td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${registro.sintomas || '-'}</td>
                ${Object.values(resultados).map(data => {
                    if (data.valor === null || data.valor === '') {
                        return '<td class="cell-sin-dato">-</td>';
                    } else {
                        const clase = data.resultado ? 'cell-bueno' : 'cell-falla';
                        return `<td class="${clase}">${formatearValor(data.valor, data.especificacion.unidad)}</td>`;
                    }
                }).join('')}
                <td class="${claseEstado}">${estadoGeneral}</td>
            </tr>
        `;
    }).join('');
}

// Función para exportar a CSV
function exportarCSV() {
    if (historial.length === 0) {
        alert('No hay datos para exportar. Realice al menos una evaluación.');
        return;
    }
    
    // Crear cabeceras CSV
    let csvContent = 'Fecha/Hora,Marca,Modelo,Síntomas,';
    csvContent += Object.keys(especificaciones).map(variable => 
        `${obtenerNombreVariable(variable)} (Valor),${obtenerNombreVariable(variable)} (Estado)`
    ).join(',');
    csvContent += ',Estado General\n';
    
    // Agregar datos
    const historialOrdenado = [...historial].sort((a, b) => b.id - a.id);
    
    historialOrdenado.forEach(registro => {
        const resultados = registro.resultados;
        let variablesConValor = 0;
        let variablesBuenas = 0;
        
        for (const data of Object.values(resultados)) {
            if (data.valor !== null && data.valor !== '') {
                variablesConValor++;
                if (data.resultado) variablesBuenas++;
            }
        }
        
        let estadoGeneral = '';
        if (variablesConValor === 0) estadoGeneral = 'Sin datos';
        else if (variablesBuenas === variablesConValor) estadoGeneral = 'OK';
        else if (variablesBuenas === 0) estadoGeneral = 'FALLA';
        else estadoGeneral = 'PARCIAL';
        
        // Escapar comillas en los síntomas
        const sintomasEscapados = registro.sintomas ? `"${registro.sintomas.replace(/"/g, '""')}"` : '""';
        
        csvContent += `"${registro.fechaHora}","${registro.marca || ''}","${registro.modelo || ''}",${sintomasEscapados},`;
        csvContent += Object.values(resultados).map(data => {
            if (data.valor === null || data.valor === '') {
                return '" - "," - "';
            } else {
                return `"${formatearValor(data.valor, data.especificacion.unidad)}","${data.resultado ? 'BUENO' : 'FALLA'}"`;
            }
        }).join(',');
        csvContent += `,"${estadoGeneral}"\n`;
    });
    
    // Crear y descargar archivo
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const fechaExportacion = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `evaluacion_tecnica_${fechaExportacion}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

// Función para importar CSV
function importarCSV() {
    document.getElementById('fileInput').click();
}

// Función para procesar la importación de CSV
function procesarImportacionCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const lines = content.split('\n');
            const headers = lines[0].split(',');
            
            // Verificar que el CSV tiene el formato esperado
            if (!headers[0].includes('Fecha/Hora')) {
                alert('El archivo CSV no tiene el formato esperado para esta aplicación');
                return;
            }
            
            const nuevosRegistros = [];
            
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim() === '') continue;
                
                // Parsear CSV respetando comillas
                const values = parseCSVLine(lines[i]);
                if (values.length < 5) continue;
                
                const registro = {
                    id: Date.now() - i,
                    fechaHora: values[0].replace(/"/g, ''),
                    marca: values[1].replace(/"/g, ''),
                    modelo: values[2].replace(/"/g, ''),
                    sintomas: values[3].replace(/"/g, ''),
                    resultados: {}
                };
                
                // Parsear resultados técnicos
                let idx = 4;
                for (const [variable, espec] of Object.entries(especificaciones)) {
                    const valorStr = values[idx++].replace(/"/g, '');
                    const estadoStr = values[idx++].replace(/"/g, '');
                    
                    let valor = null;
                    let resultado = null;
                    
                    if (valorStr && valorStr !== ' - ') {
                        valor = parseFloat(valorStr);
                        resultado = estadoStr === 'BUENO';
                    }
                    
                    registro.resultados[variable] = {
                        valor: valor,
                        resultado: resultado,
                        especificacion: espec
                    };
                }
                
                nuevosRegistros.push(registro);
            }
            
            if (nuevosRegistros.length > 0) {
                historial = [...nuevosRegistros, ...historial];
                actualizarTablaHistorial();
                document.getElementById('exportBtn').disabled = false;
                document.getElementById('clearBtn').disabled = false;
                alert(`Se importaron ${nuevosRegistros.length} registros correctamente`);
            } else {
                alert('No se encontraron registros válidos en el archivo');
            }
        } catch (error) {
            console.error('Error al importar CSV:', error);
            alert('Error al procesar el archivo CSV. Verifique el formato.');
        }
        
        // Limpiar input file
        event.target.value = '';
    };
    
    reader.readAsText(file, 'UTF-8');
}

// Función para parsear líneas CSV respetando comillas
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    
    return result;
}

// Función para limpiar el historial
function limpiarHistorial() {
    if (historial.length === 0) return;
    
    if (confirm('¿Está seguro de que desea limpiar todo el historial de evaluaciones?')) {
        historial = [];
        actualizarTablaHistorial();
        document.getElementById('exportBtn').disabled = true;
        document.getElementById('clearBtn').disabled = true;
    }
}

// Función para limpiar el formulario
function limpiarFormulario() {
    document.getElementById('marca').value = '';
    document.getElementById('modelo').value = '';
    document.getElementById('sintomas').value = '';
    
    Object.keys(especificaciones).forEach(variable => {
        const elemento = document.getElementById(variable);
        if (elemento.type === 'select-one') {
            elemento.value = '';
        } else {
            elemento.value = '';
        }
    });
    document.getElementById('resultCard').classList.add('hidden');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Permitir Enter en cualquier input
    Object.keys(especificaciones).forEach(variable => {
        const elemento = document.getElementById(variable);
        if (elemento.type !== 'select-one') {
            elemento.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    evaluarTodos();
                }
            });
        }
    });
    
    // Inicializar tabla de historial
    actualizarTablaHistorial();
});