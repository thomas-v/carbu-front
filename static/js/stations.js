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

// Recuperation d'un département d'un code postal
let getDpt = (postCode) => {
    return postCode.substr(0,2);
}

// Recuperation du département de la geoloc actuelle
let getDptByCoords = async (latitude, longitude) => {
    let geocode_value = await geocode(latitude, longitude);
    return await getDpt(geocode_value.address.postcode);
}

let getStationsByDpt = (dpt) => {
    return new Promise(function (resolve, reject) {
        $.get('https://thomasdev.ovh/api/stationsByDpt/' + dpt, resolve);
    });
}

let getStationsByPostCode = (postCode) => {
    return new Promise(function (resolve, reject) {
        $.get('https://thomasdev.ovh/api/stationsByPostCode/' + postCode, resolve);
    });
}

// Insertion des marqueurs des stations + infos des carburants
let insertStationsMarkers = (stations, map) => {

    let layerGroup = L.layerGroup().addTo(map);

    // on parcourt les stations pour recuperer les coordonnees
    for(let i = 0; i < stations.length; i++){
        let carb_list = `${stations[i]['adresse']} <br> ${stations[i]['cp']} ${stations[i]['ville']} <br><br>`;
        for(const carburant in stations[i]['carburants']){
            carb_list = carb_list + `<b>${carburant}</b>: ${stations[i]['carburants'][carburant]} € <br>`;
        }
        let marker = L.marker([stations[i]['latitude'], stations[i]['longitude']]).addTo(layerGroup);
        marker.bindPopup(carb_list);
    }

    return layerGroup;
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
    let dept = await getDptByCoords(latitude, longitude);
    
    // on recupere la liste des stations services de la ville
    let stations = await getStationsByDpt(dept);
    stations = JSON.parse(stations);
    
    let markers = await insertStationsMarkers(stations, map);
    
    // Recherche par code postal 
    $("#searchButton").click(async function() {
        //clean des marqueurs 
        markers.clearLayers();

        //recuperation du code postal
        let postCode = $("#cp").val();

        let dpt = getDpt(postCode);
        console.log(dept);
        
        // on recupere la liste des stations services de la ville
        let stations = await getStationsByDpt(dpt);
        stations = JSON.parse(stations);
        
        markers = await insertStationsMarkers(stations, map);

        //zoom sur la nouvelle zone
        let newCoords = await getStationsByPostCode(postCode);
        newCoords = JSON.parse(newCoords);
        console.log(newCoords);

        map.panTo(new L.LatLng(newCoords['latitude'], newCoords['longitude']));
    });
});