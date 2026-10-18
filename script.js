// Referencias al DOM basadas en las partes del boceto
const contenedorRespuestas = document.getElementById('respuestas');
const contenedorOpciones = document.getElementById('opciones');
const contenedorChat = document.getElementById('chat');

// Estado interno para recordar las elecciones del usuario
let arbolDecision = {};
let eleccionesUsuario = {
    nombre: '',
    tacticaElegida: '',
    recordoMadrid: ''
};

// Cargar el árbol de decisión desde el archivo JSON externo
fetch('arbol_decision.json')
    .then(response => {
        if (!response.ok) throw new Error('Error al cargar el JSON');
        return response.json();
    })
    .then(data => {
        arbolDecision = data;
        // Iniciar la conversación en el nodo inicial
        irANodo('inicio');
    })
    .catch(error => {
        console.error(error);
        mostrarMensajeBot('Abrí el proyecto con Live Server o un servidor local para que pueda leer arbol_decision.json', 'error');
    });

// Función para renderizar un nodo del árbol
function irANodo(nodoId) {
    const nodo = arbolDecision[nodoId];

    if (!nodo) {
        console.error(`El nodo "${nodoId}" no existe en arbol_decision.json`);
        return;
    }

    // Reemplazar variables dinámicas guardadas en el texto si existen
    let textoFormateado = nodo.texto
        .replace('{nombre}', eleccionesUsuario.nombre || 'campeón')
        .replace('{tactica}', eleccionesUsuario.tacticaElegida)
        .replace('{madrid}', eleccionesUsuario.recordoMadrid);

    // Mostrar la respuesta del bot
    mostrarMensajeBot(textoFormateado, 'bot');

    // Limpiar panel de opciones anterior
    contenedorOpciones.innerHTML = '';

    // Si el nodo requiere entrada por input de texto
    if (nodo.requiereInput) {
        mostrarCampoEntrada(nodo);
    } else if (nodo.opciones && nodo.opciones.length > 0) {
        // Renderizar botones de opciones
        nodo.opciones.forEach(opcion => {
            const boton = document.createElement('button');
            boton.className = 'btn-opcion';
            boton.textContent = opcion.texto;
            boton.addEventListener('click', () => {
                mostrarMensajeBot(opcion.texto, 'usuario');
                
                // Guardar elecciones según la opción seleccionada
                if (opcion.guardarTactica) eleccionesUsuario.tacticaElegida = opcion.guardarTactica;
                if (opcion.guardarMadrid) eleccionesUsuario.recordoMadrid = opcion.guardarMadrid;

                irANodo(opcion.siguiente);
            });
            contenedorOpciones.appendChild(boton);
        });
    }
}

// Muestra las burbujas dentro del área "respuestas"
function mostrarMensajeBot(texto, tipo) {
    const div = document.createElement('div');
    div.className = `mensaje ${tipo}`;
    div.textContent = texto;
    contenedorRespuestas.appendChild(div);
    
    // Auto-scroll al final de la zona de chat
    contenedorChat.scrollTop = contenedorChat.scrollHeight;
}

// Genera un campo de texto validado cuando se requiere un dato específico
function mostrarCampoEntrada(nodo) {
    const form = document.createElement('form');
    form.className = 'form-input';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'input-dato';
    input.placeholder = nodo.placeholder || 'Escribí acá...';

    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.className = 'btn-enviar';
    btn.textContent = 'Enviar';

    form.appendChild(input);
    form.appendChild(btn);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const valor = input.value.trim();

        // Validación según el tipo requerido
        if (nodo.tipoValidacion === 'nombre') {
            const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
            if (!valor || !soloLetras.test(valor)) {
                alert('Por favor, ingresá un nombre válido (solo letras y sin números).');
                return;
            }
            eleccionesUsuario.nombre = valor;
        }

        mostrarMensajeBot(valor, 'usuario');
        irANodo(nodo.siguiente);
    });

    contenedorOpciones.appendChild(form);
    input.focus();
}
