        const PREFIX = "https://" //prefix on all urls
        const API_KEY = "mQxrMZqhQ85dSpzjq" //API Key of AirVisual API
        const API_KEY_LOC = "7d62a78789a61e" //API Key of LocationQ;
        
        let currentCounry = "";
        let countries = []; //array of all the countries that can be referenced     
        let states = []; //array of all the states that can be referenced given country
        let cities = []; //array of all the cities that cna be referenced given country and state
        
        let lat = 0; //latitude coordinate of the selected city
        let long = 0; //longitude coordinate of the selected city
        
        let airQualityIndexUS = 0; //US air quality index of the selected city
        let airQualityIndexChina = 0; //China air quality index of the selected city
        let measuredTime = "0"; //time the climate data was measured from selected city

        let stage = 0;

        let searchBox = document.querySelector("#search");
        let navCountry = document.querySelector("#navCountry");
        let navState = document.querySelector("#navState");
        let navCity = document.querySelector("#navCity");


        //Storage------------------------------------------

        const STORAGE = "dms7827-";
        
        const countryKey = STORAGE + "country";
        const stateKey = STORAGE + "state";
        const cityKey = STORAGE + "city";
        
        const countryListKey = STORAGE + "countryList";
        const stateListKey = STORAGE + "stateList";
        const cityListKey = STORAGE + "cityList";
    
        const storedCountry = localStorage.getItem(countryKey);
        const storedState = localStorage.getItem(stateKey);
        const storedCity = localStorage.getItem(cityKey);
        
        const storedCountryList = localStorage.getItem(countryListKey)
        const storedStateList = localStorage.getItem(stateListKey)
        const storedCityList = localStorage.getItem(cityListKey)
        
        setStage(0);
        
        window.onload = (e) => {
            hideError();
            setSearch(false);
            
            if(!storedCountry || !storedState || !storedCountry){
            
                getIPData();
            }
            else
            {
                document.querySelector("#countryDisplay").innerHTML = "Country: <span>" + localStorage.getItem(countryKey) + "</span>";
                document.querySelector("#stateDisplay").innerHTML = "State: <span>" + localStorage.getItem(stateKey) + "</span>";
                document.querySelector("#cityDisplay").innerHTML = "City: <span>" + localStorage.getItem(cityKey) + "</span>";
            
                getData();
            }
            
            if(!storedCountryList){
                getCountries(); //start be finding all the avilable countries 
            }else{  
                countries = JSON.parse(storedCountryList);
            }
            
        }
        
        function getIPData(){
            console.log("getting ip data");
            let url = PREFIX + "api.airvisual.com/v2/nearest_city?key=" + API_KEY;
            
            $.ajax({
                dataType: "json", 
                url: url,
                data: null,
                success: jsonIPData,
                error: noData
            });
        }

        function jsonIPData(obj){
            console.log("obj stringified = " + JSON.stringify(obj));
            
            if(!obj.data || obj.data.length == 0){
                return;
            }
            
            let results = obj.data;
            
            document.querySelector("#countryDisplay").innerHTML = "Country: <span>" + results.country +"</span>";
            document.querySelector("#stateDisplay").innerHTML = "State: <span>" + results.state +"</span>";
            document.querySelector("#cityDisplay").innerHTML = "City: <span>" + results.city +"</span>";
            
            saveData(results.country, results.state, results.city);
            
            getData();
        }

        function saveData(country, state, city){
            localStorage.setItem(countryKey, country); 
            localStorage.setItem(stateKey, state); 
            localStorage.setItem(cityKey, city); 
            console.log("saved");
        }

        //------------------------------------------------

        //I know these all look the same. I tried to abstract out 
        //but the API i'm using has different calls for Countries, States, and Cities

        //get_____() functions make the request to the API
        //json_____() functions parse the results into a list
        //display_____() functions display the list of results
        //selected_____() functions called when nav buttons clicked

        //Countries----------------------------------------
        function getCountries(){
           console.log("getting countries");
           let url = PREFIX + "api.airvisual.com/v2/countries?key=" + API_KEY;
           
            $.ajax({
                dataType: "json", 
                url: url,
                data: null,
                success: jsonCountries,
                error: noData
            });
       }
    
        function jsonCountries(obj){
            console.log("obj stringified = " + JSON.stringify(obj));
          
            if(!obj.data || obj.data.length == 0){
                return;
            }
            countries = [];
            let results = obj.data;
            for(let i = 0; i< results.length; i++){
                let result = results[i];                
                countries.push({county: result.country});
            }
            
            localStorage.setItem(countryListKey, JSON.stringify(countries));
            
            displayCountries();
        }
        
        function displayCountries(){
            
            clearSelection();
            let selection = document.querySelector("#selection")
            for(let i = 0; i<countries.length; i++){
                let newItem = document.createElement("li");
                newItem.innerHTML = "<button id = \"countrySelect\" name = \"country\" value = \"" + countries[i].county + "\">" + countries[i].county + "</button>"
                selection.appendChild(newItem);
            }
            
            let buttons = document.querySelectorAll("#countrySelect");
            for(let i = 0; i<buttons.length; i++){
                buttons[i].onclick = selectCountry;
            }
            
            setStage(0);
        }
        
        function selectCountry(obj){
            document.querySelector("#countryDisplay").innerHTML = "Country: <span>" + obj.target.value +"</span>";
            document.querySelector("#stateDisplay").innerHTML = "State: <span></span>";
            document.querySelector("#cityDisplay").innerHTML = "City: <span></span>";
            
            getStates();
        }
        //-------------------------------------------------
        
        //States--------------------------------------------
        function getStates(){
            console.log("getting states");
            
            let selectedCountry = document.querySelector("#countryDisplay span").innerHTML;
            
            let url = PREFIX + "api.airvisual.com/v2/states?country=" + selectedCountry + "&key=" + API_KEY;
                
            $.ajax({
                dataType: "json", 
                url: url,
                data: null,
                success: jsonStates,
                error: noData
            });
        }
        
        function jsonStates(obj){
            console.log("obj stringified = " + JSON.stringify(obj));
          
            if(!obj.data || obj.data.length == 0){
                return;
            }
            states = [];
            let results = obj.data
            for(let i = 0; i<results.length; i++){
                let result = results[i];       
                states.push({state: result.state});
            }
            
            localStorage.setItem(stateListKey, JSON.stringify(states));
            
            displayStates();
        }
        
        function displayStates(){
            clearSelection();
            let selection = document.querySelector("#selection")
            for(let i = 0; i<states.length; i++){
                let newItem = document.createElement("li");
                newItem.innerHTML = "<button id = \"stateSelect\" name = \"state\" value = \"" + states[i].state + "\">" + states[i].state + "</button>"
                selection.appendChild(newItem);
            }
            
            let buttons = document.querySelectorAll("#stateSelect");
            for(let i = 0; i<buttons.length; i++){
                buttons[i].onclick = selectState;
            }
            
            setStage(1);
        }
        
        function selectState(obj){
            document.querySelector("#stateDisplay").innerHTML = "State: <span>" + obj.target.value +"</span>";
            document.querySelector("#cityDisplay").innerHTML = "City: <span></span>";
            
            getCities();
            
        }
        //-------------------------------------------------
        
        //Cities--------------------------------------------
        function getCities(){
            console.log("getting cities");
            cities = [];
            let selectedCountry = document.querySelector("#countryDisplay span").innerHTML;
            let selectedState = document.querySelector("#stateDisplay span").innerHTML;
            
            let url = PREFIX + "api.airvisual.com/v2/cities?state="+ selectedState +"&country="+selectedCountry+"&key=" + API_KEY;
            $.ajax({
                dataType: "json", 
                url: url,
                data: null,
                success: jsonCities,
                error: noData
            });
            
        }
        
        function jsonCities(obj){
            console.log("obj stringified = " + JSON.stringify(obj));
          
            if(!obj.data || obj.data.length == 0){
                return;
            }
            
            let results = obj.data
            for(let i = 0; i<results.length; i++){
                let result = results[i];       
                cities.push({city: result.city});
            }
            
            localStorage.setItem(cityListKey, JSON.stringify(cities));
            
            displayCities();
        }
        
        function displayCities(){
            clearSelection();
            let selection = document.querySelector("#selection")
            for(let i = 0; i<cities.length; i++){
                let newItem = document.createElement("li");
                newItem.innerHTML = "<button id = \"citySelect\" name = \"city\" value = \"" + cities[i].city + "\">" + cities[i].city + "</button>"
                selection.appendChild(newItem);
            }
            
            let buttons = document.querySelectorAll("#citySelect");
            for(let i = 0; i<buttons.length; i++){
                buttons[i].onclick = selectCity;
            }
            
            setStage(2)
        }
        
        function selectCity(obj){
            document.querySelector("#cityDisplay").innerHTML = "City: <span>" + obj.target.value +"</span>";
            
            getData();
            
        }
        //-------------------------------------------------
        
        //Data---------------------------------------------
        function getData(){
            console.log("getting data");
            
            let selectedCountry = document.querySelector("#countryDisplay span").innerHTML;
            let selectedState = document.querySelector("#stateDisplay span").innerHTML;
            let selectedCity = document.querySelector("#cityDisplay span").innerHTML;
            
            let url = PREFIX + "api.airvisual.com/v2/city?city=" + selectedCity + "&state=" + selectedState + "&country=" + selectedCountry + "&key=" + API_KEY;
            
            $.ajax({
                dataType: "json", 
                url: url,
                data: null,
                success: jsonData,
                error: noData
            });
            
            saveData(selectedCountry, selectedState, selectedCity);
        }
        
        function jsonData(obj){
            console.log("obj stringified = " + JSON.stringify(obj));
            
            if(!obj.data || obj.data.length == 0){
                return;
            }
            
            let results = obj.data
            
            long = results.location.coordinates[0];
            lat = results.location.coordinates[1];
            
            measuredTime = results.current.pollution.ts;
            airQualityIndexUS = results.current.pollution.aqius;
            airQualityIndexChina = results.current.pollution.aqicn;

            displayData();
        }
        
        function displayData(){
            document.querySelector("#latitude").innerHTML = "Latitude: <span>" + lat + "</span>";
            document.querySelector("#longitude").innerHTML = "Longitude: <span>" + long + "</span";
            document.querySelector("#qualityUS").innerHTML = "Air Quality Index \(US\) <span>" + airQualityIndexUS + "</span>";
            document.querySelector("#qualityChina").innerHTML = "Air Quality Index \(China\) <span>" + airQualityIndexChina + "</span>";
            document.querySelector("#time").innerHTML = "Measurement Time: <span>" + measuredTime + "</span>";
            
            setStage(3);
            
            getMap();
        }
        //-------------------------------------------------
        
        //General------------------------------------------   
        //clear the list of choices
        function clearSelection(){
            let selection = document.querySelector("#selection");
            selection.innerHTML = "";
            
            let image = document.querySelector("#imageDisplay");
            image.innerHTML = "";
        }
        
        //set nav properties based on state of app
        function setStage(i){
            
            hideError();
            
            if(stage == 0 && i != 1 && i != 0){
                return;
            }
            stage = i;
            setSearch(stage < 3);
            
            console.log("stage: " + i);
            
            switch(i){
                case 0:
                    navCountry.style.backgroundColor = "rgb(191, 217, 242)";
                    navState.style.backgroundColor = "white";
                    navCity.style.backgroundColor = "white";
                    
                    if(navState.classList.contains("active")){
                        navState.classList.remove("active");
                        navState.classList.add("inactive");
                    }
                    
                     if(navCity.classList.contains("active")){
                        navCity.classList.remove("active");
                        navCity.classList.add("inactive");
                    }
                    
                    navCountry.onclick = displayCountries;
                    navState.onclick = null;
                    navCity.onclick = null;
                    
                    break;
                case 1:
                    navCountry.style.backgroundColor = "white";
                    navState.style.backgroundColor = "rgb(191, 217, 242)";
                    navCity.style.backgroundColor = "white";
                    
                    if(navState.classList.contains("inactive")){
                        navState.classList.remove("inactive");
                        navState.classList.add("active");
                    }
                    
                    if(navCity.classList.contains("active")){
                        navCity.classList.remove("active");
                        navCity.classList.add("inactive");
                    }
                    
                    navCountry.onclick = displayCountries;
                    navState.onclick = displayStates;
                    navCity.onclick = null;
                    
                    break;
                case 2:
                    navCountry.style.backgroundColor = "white";
                    navState.style.backgroundColor = "white";
                    navCity.style.backgroundColor = "rgb(191, 217, 242)";    
                    
                    if(navCity.classList.contains("inactive")){
                        navCity.classList.remove("inactive");
                        navCity.classList.add("active");
                    }
                    
                    navCountry.onclick = displayCountries;
                    navState.onclick = displayStates;
                    navCity.onclick = displayCities;
                    
                    break;
                case 3:
                    navCountry.style.backgroundColor = "white";
                    navState.style.backgroundColor = "white";
                    navCity.style.backgroundColor = "white";    
                    
                    navCountry.onclick = displayCountries;
                    navState.onclick = displayStates;
                    navCity.onclick = displayCities;
                    
                    break; 
            }
        }

        //display the error message 
        function noData(){
            document.querySelector("#error").style.display = "inline";
        }
        
        //hide the error message
        function hideError(){
            document.querySelector("#error").style.display = "none";
        }
        //-------------------------------------------------
        
        //Map----------------------------------------------
        
        //api call to get a map
        function getMap(){
            console.log(lat + ", " + long);
            
            let url = PREFIX + "maps.locationiq.com/v2/staticmap?key=" + API_KEY_LOC + "&center=" + lat + "," + long + "&zoom=" + 6 + "&markers=" + lat + "," + long + "|icon:small-red-cutout" 
            
            displayMap(url);
        }
        
        //show the map on screen
        function displayMap(url){
            clearSelection();
            let imgDisplay = document.querySelector("#imageDisplay");
            imgDisplay.innerHTML = "<img src = \"" + url + "\" alt = image outline>";
        }
        //-------------------------------------------------

        //Search-------------------------------------------   
        //search the selection list for an item
        searchBox.onchange = e=>{
            
            let resultFound = false;
            
            let items = document.querySelectorAll("#selection li");
            let buttons = document.querySelectorAll("#selection li button");
            let selection = document.querySelector("#selection")
            clearSelection();
            for(let i = 0; i < items.length; i++ ){
                if(buttons[i].value == e.target.value){
                    selection.appendChild(items[i]);
                    resultFound = true;
                }
            }
            
            if(resultFound){return;}
            noData();
        };

        //set the display state of the searchbox
        function setSearch(bool){
            if(bool){
                document.querySelector("#searchWrapper").style.display = "block";
            }else{
                document.querySelector("#searchWrapper").style.display = "none";
            }
        }
        //-------------------------------------------------