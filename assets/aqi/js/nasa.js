const APIKEY = "qrWL5i54WiZdxSZju5asfUvvLnnfC3ZP8iufQxFW"
const SEARCH0 = "https://api.nasa.gov/planetary/apod?api_key="
const sscUrl = "https://sscweb.sci.gsfc.nasa.gov/WS/sscr/2"

let earthRadiusKm = 6378;

const rPart1 = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><DataRequest xmlns="http://sscweb.gsfc.nasa.gov/schema"><TimeInterval><Start>';
const rPart2 = '</Start><End>'
const rPart3 = '</End></TimeInterval><BFieldModel><InternalBFieldModel>IGRF-10</InternalBFieldModel><ExternalBFieldModel xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="Tsyganenko89cBFieldModel"><KeyParameterValues>KP3_3_3</KeyParameterValues></ExternalBFieldModel><TraceStopAltitude>100</TraceStopAltitude></BFieldModel><Satellites><Id>';
const rPart4 = '</Id><ResolutionFactor>10</ResolutionFactor></Satellites><OutputOptions><AllLocationFilters>true</AllLocationFilters><CoordinateOptions><CoordinateSystem>Geo</CoordinateSystem><Component>X</Component></CoordinateOptions><CoordinateOptions><CoordinateSystem>Geo</CoordinateSystem><Component>Y</Component></CoordinateOptions><CoordinateOptions><CoordinateSystem>Geo</CoordinateSystem><Component>Z</Component></CoordinateOptions><MinMaxPoints>2</MinMaxPoints></OutputOptions></DataRequest>';

let satellites = []; //list of all the available satelites

let tFormat;

function getData(){

    //set up the time formatter
    tFormat = new TimeFormatter(app.selected.start, app.selected.end, app.selectedYear, app.selectedMonth);

    //construct the request message
    let request = rPart1 + tFormat.getStartTime() + 
                  rPart2 + tFormat.getEndTime() + 
                  rPart3 + app.selected.satId +
                  rPart4; 

    //make the request
    //XML used because it was easier to follow through the NASA documentation
    $.ajax({
        type: 'POST',
        url: sscUrl + '/locations',
        data: request,
        dataType: 'xml',
        contentType: 'application/xml',
        processData: false,
        success: dataLoaded,
        error: dataError
    });
}  

//called when the data from positions request is loaded
//copied and modified from: https://sscweb.sci.gsfc.nasa.gov/WebServices/REST/#Get_Locations_POST
function dataLoaded(myresult){
    app.result = [];

    $('Data', myresult).each(function() {

        let satId = $(this).find('Id').text();
        //let satName = sats[satId].Name;

        let coordSystem = $(this).find('CoordinateSystem').text();

        let time = $(this).find('Time').map(function() {
            return $(this).text();
        }).get();
        let x = $(this).find('X').map(function() {
            return $(this).text();
        }).get();
        let y = $(this).find('Y').map(function() {
            return $(this).text();
        }).get();
        let z = $(this).find('Z').map(function() {
            return $(this).text();
        }).get();

        app.result.push({
            satId: satId,
            //satName: satName,
            coordSystem: coordSystem,
            time: time,
            x: x,
            y: y,
            z: z 
        });
    });

    if(!app.result[0]){
        app.status = "failed to find data";
        return;
    }

    let max = app.result[0].x.length > app.maxResults ? app.maxResults : app.result[0].x.length;
    newPath();
    for(let i = 0; i < max; i++){
        addMarker(getLatitude(app.result[0].z[i] / earthRadiusKm), getLongitude(app.result[0].x[i] / earthRadiusKm, app.result[0].y[i]/earthRadiusKm), "Satelite at time: " + app.result[0].time[i])
    }
    //draw out the path of the satellite
    drawLine();
}

//error
function dataError(e){
    app.status = "error reading in data. try selecting a different date range";
}

//get the satelite information
function displayObservatories(observatories){
    let data = observatories.Observatory[1]
    for(let i = 0; i < data.length; i++){
        app.observatories.push({
            satId: data[i].Id,
            name: data[i].Name,
            start: data[i].StartTime[1].substring(0, 23) + "Z",
            end: data[i].EndTime[1].substring(0,23) + "Z"
        });

        if(data[i].Id == storedSearchID){
            app.selected = app.observatories[i];
        }
    }

    if(!storedSearchID){app.selected = app.observatories[0]}
    app.getYears();
    app.getMonths();
    app.status = "ready to plot";
}

//converts geo coordinates to latitude
function getLatitude(z){
    z *= Math.PI / 180; //convert to radians
    return (Math.acos(z) * 180 / Math.PI) - 90; //do the math and convert back to degrees
}

//converts geo coordinates to longitude
function getLongitude(x,y){
    return Math.atan2(y, x) * 180 / Math.PI;
}

$(document).ready(function() {
    $.get(sscUrl + '/observatories', displayObservatories, 'json');
});