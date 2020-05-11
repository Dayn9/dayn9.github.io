
//Grade buttons
let G1_button = document.getElementById("G1");
let G2_button = document.getElementById("G2");
let GF_button = document.getElementById("GF");

//Binary Option Buttons
let B1_button = document.getElementById("B1");
let B2_button = document.getElementById("B2");
let B3_button = document.getElementById("B3");
let B4_button = document.getElementById("B4");
let B5_button = document.getElementById("B5");
let B6_button = document.getElementById("B6");
let B7_button = document.getElementById("B7");

let gradeType = G1_button.innerHTML;
let optionType = B1_button.innerHTML;

function G_buttonClick(){
  makeChart1(dataset, gradeType);
  makeChart2(dataset, gradeType, optionType);
}

//Set up Grade Type listeners
G1_button.addEventListener("click", function(){
  gradeType = G1_button.innerHTML;
  G_buttonClick();
});
G2_button.addEventListener("click", function(){
  gradeType = G2_button.innerHTML;
  G_buttonClick();
});
GF_button.addEventListener("click", function(){
  gradeType = GF_button.innerHTML;
  G_buttonClick();
});

//set up Binary Choice listeners 
B1_button.addEventListener("click", function(){
  optionType = B1_button.innerHTML;
  makeChart2(dataset, gradeType, optionType);
});
B2_button.addEventListener("click", function(){
  optionType = B2_button.innerHTML;
  makeChart2(dataset, gradeType, optionType);
});
B3_button.addEventListener("click", function(){
  optionType = B3_button.innerHTML;
  makeChart2(dataset, gradeType, optionType);
});
B4_button.addEventListener("click", function(){
  optionType = B4_button.innerHTML;
  makeChart2(dataset, gradeType, optionType);
});
B5_button.addEventListener("click", function(){
  optionType = B5_button.innerHTML;
  makeChart2(dataset, gradeType, optionType);
});
B6_button.addEventListener("click", function(){
  optionType = B6_button.innerHTML;
  makeChart2(dataset, gradeType, optionType);
});
B7_button.addEventListener("click", function(){
  optionType = B7_button.innerHTML;
  makeChart2(dataset, gradeType, optionType);
});