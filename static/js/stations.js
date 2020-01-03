// Geolocalisation
let geoloc = (options) => {
    return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
}

// Initialisation de la carte
let initMap = (latitude, longitude) => {
    let map = L.map('map').setView([latitude, longitude], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        attribution: 'données © <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>',
        minZoom: 1,
        maxZoom: 18
    }).addTo(map);
    return map;
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

let getStationsByPostCode = (postCode) => {
    return new Promise(function (resolve, reject) {
        $.get('https://thomasdev.ovh/api/stations/' + postCode, resolve);
    });
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
    let map = await initMap(latitude, longitude);
    console.log(map);

    // recuperation de la ville
    let postCode = await getCity(latitude, longitude);
    
    // on recupere la liste des stations services de la ville
    let stations = await getStationsByPostCode(postCode);
    stations = JSON.parse(stations);

    console.log(stations);
    
    // on parcourt les stations pour recuperer les coordonnees
    for(let i = 0; i < stations.length; i++){
        let marker = L.marker([stations[i]['latitude'], stations[i]['longitude']]).addTo(map);
        marker.bindPopup("<b>Gazole</b> : " + stations[i]['carburants']['Gazole'] + "<br><b>GPLc</b> : " + stations[i]['carburants']['GPLc']
        + "<br><b>E10</b> : " + stations[i]['carburants']['E10'] + "<br><b>SP98</b> : " + stations[i]['carburants']['SP98']);
    }

    //L.marker([latitude, longitude]).addTo(map);

});