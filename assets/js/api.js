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
        let allCards = [];
        let currentPage = 1;
        let keepFetching = true;

        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': this.apiKey,
                'x-rapidapi-host': this.apiHost,
                'Content-Type': 'application/json'
            }
        };

        try {
            // Bucle para traer varias páginas. 
            // LIMITAMOS a 5 páginas máximo para no agotar tu cuota de RapidAPI.
            while (keepFetching && currentPage <= 5) {
                console.log(`Descargando página ${currentPage}...`);
                
                // Agregamos el número de página actual a la URL
                const response = await fetch(`${this.baseUrl}?page=${currentPage}`, options);
                
                if (!response.ok) {
                    console.error(`Error en la página ${currentPage}`);
                    break; 
                }
                
                const data = await response.json();
                
                // Buscamos el arreglo de cartas dentro de la respuesta de esta página
                let cardsInPage = [];
                if (Array.isArray(data)) cardsInPage = data;
                else if (data.cards) cardsInPage = data.cards;
                else if (data.data) cardsInPage = data.data;

                // Si la página viene vacía, significa que ya no hay más cartas en la base de datos
                if (cardsInPage.length === 0) {
                    keepFetching = false; 
                } else {
                    // Juntamos las cartas de esta página con las que ya teníamos
                    allCards = allCards.concat(cardsInPage);
                    currentPage++; // Pasamos a la siguiente página
                }
            }
            
            console.log(`¡Descarga completa! Total de cartas cargadas: ${allCards.length}`);
            return allCards; 

        } catch (error) {
            console.error('Error al conectar con la API:', error);
            // Si hay un error, devolvemos las cartas que hayamos logrado rescatar
            return allCards.length > 0 ? allCards : null;
        }
    }
}