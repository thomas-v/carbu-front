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

let getStationsByDpt = (dpt, postCode) => {
    return new Promise(function (resolve, reject) {
        $.get('https://thomasdev.ovh/api/stationsByDpt/' + dpt + '/' + postCode, resolve);
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

// on alimente le tableau
let feedingArray = (markers) => {
    let markersInfo = markers.getLayers();

    // on clean le tableau
    $("#infos").children().remove();

    for(let i = 0; i < markersInfo.length; i++){
        let infos = markersInfo[i]._popup._content;
        let address = infos.split('<br><br>')[0];

        address = `<a class="list-group-item list-group-item-action stations_infos" id="${i}">${address}</a>`;
        $('#infos').append(address);
    }
}

$( document ).ready(async () => {

    //coordonees
    let latitude = false;
    let longitude = false;
    let postCode = false;

    try{
        const position = await geoloc();
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        let geocode_value = await geocode(latitude, longitude);
        postCode = geocode_value.address.postcode;
        console.log(postCode);
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
    let stations = await getStationsByDpt(dept, postCode);
    stations = JSON.parse(stations);
    
    let markers = await insertStationsMarkers(stations, map);
    
    await feedingArray(markers);

    // Recherche par code postal 
    $("#searchButton").click(async function() {
        //clean des marqueurs 
        markers.clearLayers();

        //recuperation du code postal
        let postCode = $("#cp").val();

        let dpt = getDpt(postCode);
        
        // on recupere la liste des stations services de la ville
        let stations = await getStationsByDpt(dpt, postCode);
        stations = JSON.parse(stations);
        
        markers = await insertStationsMarkers(stations, map);

        //zoom sur la nouvelle zone
        let newCoords = await getStationsByPostCode(postCode);
        newCoords = JSON.parse(newCoords);
        map.panTo(new L.LatLng(newCoords['latitude'], newCoords['longitude']));

        /*console.log(markers.getLayers());
        console.log(markers.getLayers()[0]._popup._content);
        markers.getLayers()[0].openPopup();*/

        await feedingArray(markers);
    });

    $("#infos a").click(function (event) {
        markers.getLayers()[event.target.id].openPopup();
    });
    
});