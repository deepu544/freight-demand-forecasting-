let data = [];
let chart = null;

// FILE UPLOAD
document.getElementById("fileInput").addEventListener("change", function(e){
    let file = e.target.files[0];

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {

            data = results.data.map(d => ({
                date: d["Date"],
                source: d["Source_City"],
                destination: d["Destination_City"],
                route: d["Route"],
                demand: parseFloat(d["Demand_Tons"])
            })).filter(d => d.source && d.destination && !isNaN(d.demand));

            console.log("Processed Data:", data);

            loadCities();
            loadRoutes();
            showChart(data);
        }
    });
});


// LOAD ALL CITIES
function loadCities(){
    let sourceDrop = document.getElementById("sourceFilter");
    let destDrop = document.getElementById("destFilter");

    sourceDrop.innerHTML = '<option value="">Select Source City</option>';
    destDrop.innerHTML = '<option value="">Select Destination City</option>';

    let sources = [...new Set(data.map(d => d.source))];
    let destinations = [...new Set(data.map(d => d.destination))];

    sources.forEach(s => {
        let opt = document.createElement("option");
        opt.value = s;
        opt.text = s;
        sourceDrop.appendChild(opt);
    });

    destinations.forEach(d => {
        let opt = document.createElement("option");
        opt.value = d;
        opt.text = d;
        destDrop.appendChild(opt);
    });
}


// LOAD ROUTES
function loadRoutes(){
    let routeDrop = document.getElementById("routeFilter");

    routeDrop.innerHTML = '<option value="">Select Route</option>';

    let routes = [...new Set(data.map(d => d.route))];

    routes.forEach(r => {
        let opt = document.createElement("option");
        opt.value = r;
        opt.text = r;
        routeDrop.appendChild(opt);
    });
}


// UPDATE DESTINATION BASED ON SOURCE
function updateDestinations(){
    let source = document.getElementById("sourceFilter").value;

    let destDrop = document.getElementById("destFilter");
    destDrop.innerHTML = '<option value="">Select Destination City</option>';

    let filtered = source ? data.filter(d => d.source === source) : data;

    let destinations = [...new Set(filtered.map(d => d.destination))];

    destinations.forEach(d => {
        let opt = document.createElement("option");
        opt.value = d;
        opt.text = d;
        destDrop.appendChild(opt);
    });
}


// UPDATE ROUTES BASED ON SOURCE + DEST
function updateRoutes(){
    let source = document.getElementById("sourceFilter").value;
    let dest = document.getElementById("destFilter").value;

    let routeDrop = document.getElementById("routeFilter");
    routeDrop.innerHTML = '<option value="">Select Route</option>';

    let filtered = data.filter(d => {
        return (!source || d.source === source) &&
               (!dest || d.destination === dest);
    });

    let routes = [...new Set(filtered.map(d => d.route))];

    routes.forEach(r => {
        let opt = document.createElement("option");
        opt.value = r;
        opt.text = r;
        routeDrop.appendChild(opt);
    });
}


// FILTER EVENTS
document.getElementById("sourceFilter").addEventListener("change", function(){
    updateDestinations();
    updateRoutes();
    applyFilters();
});

document.getElementById("destFilter").addEventListener("change", function(){
    updateRoutes();
    applyFilters();
});

document.getElementById("routeFilter").addEventListener("change", applyFilters);


// APPLY FILTERS
function applyFilters(){
    let route = document.getElementById("routeFilter").value;
    let source = document.getElementById("sourceFilter").value;
    let dest = document.getElementById("destFilter").value;

    let filtered = data.filter(d => {
        return (!route || d.route === route) &&
               (!source || d.source === source) &&
               (!dest || d.destination === dest);
    });

    console.log("Filtered Data:", filtered);

    showChart(filtered);
}


// SHOW CHART
function showChart(d){

    if(chart){
        chart.destroy();
    }

    if(d.length === 0){
        alert("No data for selected filters");
        return;
    }

    let labels = d.map(x => x.date);
    let values = d.map(x => x.demand);

    chart = new Chart(document.getElementById("chart"), {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Demand (Tons)",
                data: values,
                borderWidth: 2
            }]
        }
    });
}