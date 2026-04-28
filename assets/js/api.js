export class MarvelSnapAPI {
    constructor() {
        // ATENCIÓN: Pon aquí tu NUEVA clave, no uses la expuesta
        this.apiKey = '35542a5112msh28ed6acd65f78a4p1410e5jsn54bc7dbfd03b'; 
        this.apiHost = 'marvel-snap-api.p.rapidapi.com';
        
        // Esta es la URL exacta que me pasaste en tu código
        this.baseUrl = 'https://marvel-snap-api.p.rapidapi.com/api/get-all-cards?page=1';
    }

    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Error obteniendo la IP:', error);
            return 'No disponible';
        }
    }

    async getCards() {
        let currentPage = 1;
        let keepFetching = true;
        let uniqueCards = new Map();

        // Función auxiliar para pausar la ejecución (Throttling)
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': this.apiKey,
                'x-rapidapi-host': this.apiHost,
                'Content-Type': 'application/json'
            }
        };

        try {
            while (keepFetching && currentPage <= 5) {
                console.log(`Buscando página ${currentPage}...`);
                
                const response = await fetch(`${this.baseUrl}?page=${currentPage}&limit=100`, options);
                
                // Si el servidor nos devuelve un 429, detenemos el bucle amablemente
                if (response.status === 429) {
                    console.warn(`Rate Limit alcanzado (Error 429) en la página ${currentPage}. Deteniendo descargas.`);
                    break;
                }

                if (!response.ok) break;
                
                const data = await response.json();
                let cardsInPage = this._extractArray(data);

                if (cardsInPage.length === 0) {
                    keepFetching = false; 
                } else {
                    let nuevasCartas = 0;

                    cardsInPage.forEach(card => {
                        const id = card.id || card._id || card.name;
                        if (!uniqueCards.has(id)) {
                            uniqueCards.set(id, card);
                            nuevasCartas++;
                        }
                    });

                    if (nuevasCartas === 0) {
                        keepFetching = false;
                    } else {
                        currentPage++; 
                        
                        // 🔥 AQUI ESTÁ LA MAGIA: Esperamos 1000 milisegundos (1 segundo) antes de pedir la siguiente página
                        if (currentPage <= 5) {
                            console.log("Pausando 1 segundo para evitar el Error 429...");
                            await delay(1000); 
                        }
                    }
                }
            }
            
            const allCards = Array.from(uniqueCards.values());
            console.log(`¡Descarga completa! Total de cartas ÚNICAS reales: ${allCards.length}`);
            return allCards; 

        } catch (error) {
            console.error('Error al conectar con la API:', error);
            return Array.from(uniqueCards.values());
        }
    }
}