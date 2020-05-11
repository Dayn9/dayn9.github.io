let dataset;

const w = 600;
const h = 400;   

const margins = {
  top: 20,
  bottom: 60,
  right: 20,
  left: 60
}

//turn Yes/No response into boolean
function parseBool(str){
  if(str == "yes"){return true};
  if(str == "no"){return false};
  return null;
}

function parseStudyTime(int){
  return {
    1: "<2",
    2: "2-5",
    3: "5-10",
    4: ">10"
  }[int];
}

//convert necessary data
function rowConverter(row) {
  return {
    school: row.school, //student's school (binary: 'GP' - Gabriel Pereira or 'MS' - Mousinho da Silveira)
    sex: row.sex, //student's sex (binary: 'F' - female or 'M' - male)
    age: parseInt(row.age), //student's age (numeric: from 15 to 22)
    address: row.address, //student's home address type (binary: 'U' - urban or 'R' - rural)
    family_size: row.famsize, //family size (binary: 'LE3' - less or equal to 3 or 'GT3' - greater than 3)
    parent_Status: row.Pstatus, //parent's cohabitation status (binary: 'T' - living together or 'A' - apart)
    mother_edu: parseInt(row.Medu), // mother's education (numeric: 0 - none, 1 - primary education (4th grade), 2 â€“ 5th to 9th grade, 3 â€“ secondary education or 4 â€“ higher education)
    father_edu: parseInt(row.Fedu), // father's education (numeric: 0 - none, 1 - primary education (4th grade), 2 â€“ 5th to 9th grade, 3 â€“ secondary education or 4 â€“ higher education)
    mother_job: row.Mjob,// mother's job (nominal: 'teacher', 'health' care related, civil 'services' (e.g. administrative or police), 'at_home' or 'other')
    father_job: row.Fjob, //father's job (nominal: 'teacher', 'health' care related, civil 'services' (e.g. administrative or police), 'at_home' or 'other')
    reason: row.reason, //reason to choose this school (nominal: close to 'home', school 'reputation', 'course' preference or 'other')
    guardian: row.guardian, //student's guardian (nominal: 'mother', 'father' or 'other')
    travel_time: parseInt(row.traveltime), //home to school travel time (numeric: 1 - <15 min., 2 - 15 to 30 min., 3 - 30 min. to 1 hour, or 4 - >1 hour)
    study_time: parseStudyTime(parseInt(row.studytime)), //weekly study time (numeric: 1 - <2 hours, 2 - 2 to 5 hours, 3 - 5 to 10 hours, or 4 - >10 hours)
    failures: parseInt(row.failures), //number of past class failures (numeric: n if 1<=n<3, else 4)
    support_school: row.schoolsup, //extra educational support (binary: yes or no)
    support_home: row.famsup, //family educational support (binary: yes or no)
    paid: row.paid, //extra paid classes within the course subject (Math or Portuguese) (binary: yes or no)
    activities: row.activities, //extra-curricular activities (binary: yes or no)
    nursery: row.nursery, //attended nursery school (binary: yes or no)
    higher: row.higher, //wants to take higher education (binary: yes or no)
    internet: row.internet, //Internet access at home (binary: yes or no)
    romantic: row.romantic, //with a romantic relationship (binary: yes or no)
    family_relationship: parseInt(row.famrel), //quality of family relationships (numeric: from 1 - very bad to 5 - excellent)
    free_time: parseInt(row.freetime), //free time after school (numeric: from 1 - very low to 5 - very high)
    friendship: parseInt(row.goout), //going out with friends (numeric: from 1 - very low to 5 - very high)
    alcohol_weekday: parseInt(row.Dalc), //workday alcohol consumption (numeric: from 1 - very low to 5 - very high)
    alcohol_weekend: parseInt(row.Walc), //weekend alcohol consumption (numeric: from 1 - very low to 5 - very high)
    health: parseInt(row.health), //current health status (numeric: from 1 - very bad to 5 - very good)
    absences: parseInt(row.absences), //number of school absences (numeric: from 0 to 93)
    grade_1: parseInt(row.G1), //first period grade (numeric: from 0 to 20)
    grade_2: parseInt(row.G2), //second period grade (numeric: from 0 to 20)
    grade_F: parseInt(row.G3) //final grade (numeric: from 0 to 20)
  }
}

// https://github.com/wbkd/d3-extended
d3.selection.prototype.moveToFront = function() {  
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

//console.log(datalink);

//load in and convert all the csv data
window.onload = function () {
  d3.csv(datalink, rowConverter)
    .then((data) => {

      dataset = data;
      console.log(dataset);

      //Setup and display the first chart
      setupChart1()
      makeChart1(dataset, "Final Grade");

      //setup and display the second chart
      setupChart2()
      makeChart2(dataset, "Final Grade", "School Support");
    });
}