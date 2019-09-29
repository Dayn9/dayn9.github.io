Vue.component('satdisplay', {
    props: ['selected'],
    template: `<div>
    <h2>{{selected.name}}</h2>
    <p>StartTime: <span>{{selected.start}}</span></p>
    <p>EndTime: <span>{{selected.end}}</span></p>
    </div>`
})

class TimeFormatter {
    constructor(start, end, year, month) {
        this.start = start;
        this.end = end;
        this.year = year;
        this.month = month;
    }

    getStartTime(){
        return this.year + "-" + (this.month < 10 ? "0" : "") + this.month + this.start.substring(7,24);
    }

    getEndTime(){
        if(this.year == parseInt(this.end.substring(0,4))){
            return this.end;
        }
        return (this.year + 1) + "-" + (this.month < 10 ? "0" : "") + this.month + this.start.substring(7,24);
    }
}