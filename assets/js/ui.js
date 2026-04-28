export class UI {
    constructor() {
        this.ipElement = document.getElementById('client-ip');
        this.selectElement = document.getElementById('card-select');
        this.resultsContainer = document.getElementById('results-container');
    }

    displayIP(ip) {
        this.ipElement.classList.remove('spinner-border', 'spinner-border-sm');
        this.ipElement.textContent = ip;
    }

    showError(message) {
        this.resultsContainer.innerHTML = `
            <div class="alert alert-danger text-center w-100" role="alert">
                ${message}
            </div>
        `;
    }

    // Nuevo método: Busca dinámicamente dónde escondió la API el Array de cartas
    _extractArray(data) {
        if (Array.isArray(data)) return data;

        if (typeof data === 'object' && data !== null) {
            // Busca la primera propiedad que sea un array (ej. data.items, data.data)
            for (let key in data) {
                if (Array.isArray(data[key])) return data[key];
            }
            // Si está más profundo (ej. data.body.cards)
            for (let key in data) {
                if (typeof data[key] === 'object') {
                    for (let subKey in data[key]) {
                        if (Array.isArray(data[key][subKey])) return data[key][subKey];
                    }
                }
            }
        }
        return []; // Si no encuentra nada, devuelve un array vacío para evitar que se rompa
    }

    populateSelect(cardsData) {
        this.selectElement.innerHTML = '<option value="" selected>Elige una carta...</option>';

        // Usamos nuestro extractor inteligente
        const cardList = this._extractArray(cardsData);

        if (cardList.length === 0) {
            console.error("Estructura de API no reconocida:", cardsData);
            this.selectElement.innerHTML = '<option>Error leyendo los datos</option>';
            return;
        }

        cardList.forEach(card => {
            const option = document.createElement('option');
            // Usamos un fallback en caso de que la API use "_id" o no tenga ID
            option.value = card.id || card._id || card.name;
            option.textContent = card.name || 'Carta sin nombre';
            this.selectElement.appendChild(option);
        });

        this.selectElement.disabled = false;
    }

    renderCardDetails(cardId, cardsData) {
        const cardList = this._extractArray(cardsData);

        // Buscar la carta seleccionada
        const card = cardList.find(c =>
            (c.id && c.id.toString() === cardId.toString()) ||
            (c._id && c._id.toString() === cardId.toString()) ||
            (c.name === cardId)
        );

        if (!card) return;

        // Imprimimos la carta en consola para que veas qué campos reales tiene
        console.log("Datos exactos de la carta seleccionada:", card);

        // Agregamos más posibles nombres de propiedades que usan las APIs de Marvel Snap
        const imageUrl =
            card.Image ||
            card.imageUrl ||
            card.image ||
            card.art ||
            card.image_url ||
            card.thumbnail ||
            'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';
        const description = card.description || card.ability || 'Sin descripción disponible.';
        const cost = card.cost !== undefined ? card.cost : '?';
        const power = card.power !== undefined ? card.power : '?';

        // Imagen de respaldo por si el link de la API está roto (Hotlink protection)
        const fallbackImage = 'https://via.placeholder.com/200x300/343a40/17a2b8?text=Imagen+No+Disponible';

        this.resultsContainer.innerHTML = `
            <div class="col-md-8 mx-auto mt-2">
                <div class="card glass-effect text-white border-0 p-2">
                    <div class="row g-0">
                        <div class="col-md-5 p-3 text-center d-flex align-items-center justify-content-center">
                            <img 
                                src="${imageUrl}" 
                                onerror="this.onerror=null;this.src='${fallbackImage}';" 
                                class="img-fluid card-img-top" 
                                alt="${card.name}"
                            >
                        </div>
                        <div class="col-md-7">
                            <div class="card-body d-flex flex-column h-100 justify-content-center">
                                <h2 class="card-title text-info fw-bold mb-3">${card.name}</h2>
                                <p class="card-text fs-5 text-white-50">${description}</p>
                                
                                <div class="d-flex gap-3 mt-4">
                                    <span class="badge bg-primary stat-badge">Coste: ${cost}</span>
                                    <span class="badge bg-danger stat-badge">Poder: ${power}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}