// Array para almacenar el historial de evaluaciones
let historial = [];

// Especificaciones técnicas CORREGIDAS
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
    auricular: { 
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
        max: 2000, 
        unidad: 'Ω',
        criterio: '500-2000Ω = Bueno'
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
    },
    botonAsistente: { 
        tipo: 'texto', 
        valor: 'bzr', 
        unidad: '',
        criterio: '== BZR = Bueno'
    },
};

// Función principal para evaluar todos los componentes
function evaluarTodos() {
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
        alert('Por favor, ingrese al menos un valor para evaluar');
        return;
    }

    // Mostrar resultados
    mostrarResultados(resultados);
    
    // Guardar en historial
    guardarEnHistorial(resultados);
    
    // Habilitar botones
    document.getElementById('exportBtn').disabled = false;
    document.getElementById('clearBtn').disabled = false;
}

// Función para evaluar una variable individual
function evaluarVariable(valor, especificacion) {
    if (valor === null || valor === '') return null;

    switch (especificacion.tipo) {
        case 'voltaje':
            // valor >= referencia = Bueno (INCLUYE BATERÍA)
            return valor >= especificacion.valor;
            
        case 'rango':
            // min <= valor <= max = Bueno
            return valor >= especificacion.min && valor <= especificacion.max;
            
        case 'igual':
            // valor == referencia = Bueno (con tolerancia para números)
            if (typeof valor === 'number') {
                return Math.abs(valor - especificacion.valor) < 0.001;
            }
            return valor === especificacion.valor;
            
        case 'texto':
            // valor == referencia = Bueno
            return valor.toLowerCase() === especificacion.valor.toLowerCase();
            
        default:
            return false;
    }
}

// Función para mostrar resultados en la interfaz
function mostrarResultados(resultados) {
    const container = document.getElementById('resultsContainer');
    const resumenGeneral = document.getElementById('resumenGeneral');
    const resultCard = document.getElementById('resultCard');
    
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
        // Formatear números con decimales apropiados
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
        auricular: 'Auricular',
        vibrador: 'Vibrador',
        microfonos: 'Micrófonos',
        consumoOff: 'Consumo OFF',
        consumoOn: 'Consumo ON',
        botonEncendido: 'Botón Encendido',
        botonVolumenMas: 'Botón Volumen +',
        botonVolumenMenos: 'Botón Volumen -',
        botonAsistente: 'Botón Asistente'
    };
    return nombres[variable] || variable;
}

// Función para guardar en el historial
function guardarEnHistorial(resultados) {
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
        resultados: JSON.parse(JSON.stringify(resultados)) // Deep copy
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
        
        // Calcular estado general
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
    let csvContent = 'Fecha/Hora,';
    csvContent += Object.keys(especificaciones).map(variable => 
        `${obtenerNombreVariable(variable)} (Valor),${obtenerNombreVariable(variable)} (Estado)`
    ).join(',');
    csvContent += ',Estado General\n';
    
    // Agregar datos (ordenados por fecha, más reciente primero)
    const historialOrdenado = [...historial].sort((a, b) => b.id - a.id);
    
    historialOrdenado.forEach(registro => {
        const resultados = registro.resultados;
        let variablesConValor = 0;
        let variablesBuenas = 0;
        
        // Calcular estado general
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
        
        csvContent += `"${registro.fechaHora}",`;
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
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const fechaExportacion = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `evaluacion_tecnica_completa_${fechaExportacion}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Liberar URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
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

// Ejemplos de prueba para la batería
function probarBateria() {
    console.log('=== Pruebas de Batería (≥ 3.7V = Bueno) ===');
    const pruebas = [
        { valor: 4.0, esperado: true },
        { valor: 3.7, esperado: true },
        { valor: 3.5, esperado: false },
        { valor: 3.0, esperado: false }
    ];
    
    pruebas.forEach(prueba => {
        const resultado = prueba.valor >= 3.7;
        console.log(`${prueba.valor}V -> ${resultado} (${resultado === prueba.esperado ? '✓' : '✗'})`);
    });
}

// Descomentar para probar la lógica de la batería
// probarBateria();
