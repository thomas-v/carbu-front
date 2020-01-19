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
let getDpt = async (latitude, longitude) => {
    let geocode_value = await geocode(latitude, longitude);
    return geocode_value.address.postcode.substr(0,2);
}

let getStationsByDpt = (dpt) => {
    return new Promise(function (resolve, reject) {
        $.get('https://thomasdev.ovh/api/stations/' + dpt, resolve);
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

    // recuperation de la ville
    let postCode = await getDpt(latitude, longitude);
    
    // on recupere la liste des stations services de la ville
    let stations = await getStationsByDpt(postCode);
    stations = JSON.parse(stations);
    
    // on parcourt les stations pour recuperer les coordonnees
    for(let i = 0; i < stations.length; i++){
        let carb_list = '';
        for(const carburant in stations[i]['carburants']){
            carb_list = carb_list + `<b>${carburant}</b>: ${stations[i]['carburants'][carburant]} <br>`;
        }
        let marker = L.marker([stations[i]['latitude'], stations[i]['longitude']]).addTo(map);
        marker.bindPopup(carb_list);
    }

    //L.marker([latitude, longitude]).addTo(map);

});