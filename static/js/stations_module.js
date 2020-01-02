// Page stations

// coordonnees par default
let latitude = 48.852969;
let longitude = 2.349903;

var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

function success(pos) {
    console.log(pos);
    var crd = pos.coords;

    console.log('Votre position actuelle est :');
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude : ${crd.longitude}`);
    console.log(`La précision est de ${crd.accuracy} mètres.`);

    initMap(crd.latitude, crd.longitude);
}

function error(err) {
    console.warn(`ERREUR (${err.code}): ${err.message}`);
    initMap(latitude, longitude);
}

// geolocalisation
navigator.geolocation.getCurrentPosition(success, error, options);

// Fonction d'initialisation de la carte
function initMap(lat, lon) {
    // Créer l'objet "macarte" et l'insèrer dans l'élément HTML qui a l'ID "map"
    let macarte = L.map('map').setView([lat, lon], 14);
    // Leaflet ne récupère pas les cartes (tiles) sur un serveur par défaut. Nous devons lui préciser où nous souhaitons les récupérer. Ici, openstreetmap.fr
    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        // Il est toujours bien de laisser le lien vers la source des données
        attribution: 'données © <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>',
        minZoom: 1,
        maxZoom: 18
    }).addTo(macarte);
}