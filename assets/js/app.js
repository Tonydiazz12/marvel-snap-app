import { MarvelSnapAPI } from './api.js';
import { UI } from './ui.js';

// Instanciar objetos
const api = new MarvelSnapAPI();
const ui = new UI();

// Variable global para almacenar las cartas y evitar llamadas redundantes
let globalCardsData = null;

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Obtener y mostrar la IP
    const ip = await api.getClientIP();
    ui.displayIP(ip);

    // 2. Cargar cartas de la API
    const cardsData = await api.getCards();
    
    if (cardsData) {
        globalCardsData = cardsData;
        ui.populateSelect(cardsData);
    } else {
        ui.showError('No se pudieron cargar las cartas. Verifica tu API Key o conexión.');
        document.getElementById('card-select').innerHTML = '<option>Error de carga</option>';
    }
});

// Evento: Selección de carta
document.getElementById('card-select').addEventListener('change', (e) => {
    const selectedId = e.target.value;
    if (selectedId && globalCardsData) {
        ui.renderCardDetails(selectedId, globalCardsData);
    } else {
        document.getElementById('results-container').innerHTML = ''; // Limpiar si no hay selección
    }
});