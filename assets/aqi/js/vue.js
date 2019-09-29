const app = new Vue({
        el: '#app',
        data: {
                title: "Satelite Tracker",
                observatories: [],
                result: [],
                selected: {
                        satId: "data error",
                        name: "Loading...",
                        start: 0,
                        end: 0,
                },
                years: [],
                selectedYear: 1990,
                months: [],
                selectedMonth: 1,
                maxResults: 150,
                color: `#000000`,
                status: "Loading..."
        },
        methods: {
                plot: function(){
                        this.status = "plotting..."
                        getData();
                        addSearchToFirebase();
                        saveLocalStoredData();
                },
                getYears: function(){
                        let s = parseInt(this.selected.start.substring(0,4), 10);
                        let e = parseInt(this.selected.end.substring(0,4), 10);
                        this.years = [];
                        for(let y = s; y <= e; y++){
                                this.years[y - s] = y;
                        }
                        this.selectedYear = this.years[0];
                },
                getMonths: function(){
                        let s = 1;
                        let e = 12;
                        if(this.selectedYear == this.years[0]){
                                s = parseInt(this.selected.start.substring(5,7), 10);
                        }else if(this.selectedYear == this.years[this.years.length -1 ]){
                                e = parseInt(this.selected.end.substring(5,7), 10);
                        }
                        this.months = [];
                        for(let m = s; m <= e; m++){
                                this.months[m - s] = m;
                        }
                        this.selectedMonth = this.months[0];
                },
                zoomOut: function(){
                        map.setZoom(2);
                        map.setCenter({ lat: 0, lng: 0 })
                },
                clear: function(){
                        removeAllLines();
                }
        }
});
