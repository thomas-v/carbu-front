// Geolocalisation
let geoloc = (options) => {
    return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
}

// Initialisation de la carte
let initMap = (latitude, longitude) => {
    let macarte = L.map('map').setView([latitude, longitude], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        attribution: 'données © <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>',
        minZoom: 1,
        maxZoom: 18
    }).addTo(macarte);
}

let geocode = (latitude, longitude) => {
    return new Promise(function (resolve, reject) {
        $.get('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat='+ latitude +'&lon='+ longitude, resolve);
    });
}

// Recuperation du code postal de la geoloc actuelle
let getCity = async (latitude, longitude) => {
    let geocode_value = await geocode(latitude, longitude);
    return geocode_value.address.postcode;
}

$( document ).ready(async () => {

    //coordonees
    let latitude = false;
    let longitude = false;

    try{
        const position = await geoloc();
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
    }
    catch (err) {
        latitude = 48.852969;
        longitude = 2.349903;
        console.warn(err);
    }

    // affichage de la carte
    await initMap(latitude, longitude);

    // recuperation de la ville
    let city = await getCity(latitude, longitude);
    console.log(city);
});