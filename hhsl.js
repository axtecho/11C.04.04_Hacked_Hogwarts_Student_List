"use strict";

window.addEventListener("load", start);

function start() {
  document
    .querySelector("#menu-btn-svg")
    .addEventListener("click", slideOutMenu);
  document
    .querySelector("#FilterButtonP")
    .addEventListener("click", filterStatus);
  /* [
    document.querySelector("#squad"),
    document.querySelector("#prefect"),
    document.querySelector("#expelled"),
  ].forEach((item) => {
    item.addEventListener("input", changePrefectvalue);
  }); */

  registerButtons();
}

function registerButtons() {
  document.querySelectorAll("[data-action=sort]").forEach((button) => {
    button.addEventListener("click", updateSorting);
  });
}
// Global variables
const studentsProcessed = {
  fullname: "",
  firstname: "",
  middlename: "",
  lastname: "",
  image: "",
  prefect: true,
  inqSquad: false,
  house: "",
};
let allStudents = [];
let currentStudents = [];
let sortStatus = "";
let sortDirection = true;
// Fetching data

const url = "https://petlatkea.dk/2021/hogwarts/students.json";

fetch(url)
  .then((response) => {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response.json();
  })

  .then((data) => {
    handleData(data);
  });

/*  .catch((e) => {
    console.error("An error occured:", e.message);
  }); */
function handleData(students) {
  students.forEach((student) => {
    let studentInfo = cleanUp(student);
    allStudents.push(studentInfo);
  });

  prepareObjects();
}
function prepareObjects() {
  document.querySelector(".list tbody").innerHTML = "";

  if (sortStatus === "") {
    allStudents.forEach(displayStudents);
  } else {
    sortingStudents();
  }
}
function cleanUp(student) {
  /* Remove white spaces .fullname + .house from JSONdata  */
  const studentNameCleaned = student.fullname.trim();
  const studenthouse = student.house.trim();
  // Create object
  const studentsprocessed = Object.create(studentsProcessed);
  /* Find the first name, "if" statements ensures single names are included */
  if (studentNameCleaned.indexOf(" ") >= 0) {
    const firstname = studentNameCleaned.substring(
      studentNameCleaned.indexOf(1),
      studentNameCleaned.indexOf(" ")
    );
    const UpperCase = firstname.charAt(0).toUpperCase();
    studentsprocessed.firstname =
      UpperCase + firstname.substring(1).toLowerCase();
  } else {
    studentsprocessed.firstname = studentNameCleaned;
  }
  /* Last Name */
  if (studentNameCleaned.indexOf("-") >= 0) {
    const beforeHyphen = studentNameCleaned.substring(
      studentNameCleaned.indexOf(" ") + 1
    );
    studentsprocessed.lastname = beforeHyphen;
  } else if (studentNameCleaned.indexOf(" ") >= 0) {
    const lastname = studentNameCleaned.substring(
      studentNameCleaned.lastIndexOf(" ") + 1
    );
    const UpperCase = lastname.charAt(0).toUpperCase();
    studentsprocessed.lastname =
      UpperCase + lastname.substring(1).toLowerCase();
  } else {
    studentsprocessed.lastname = "null";
  }

  /* House */
  const studentHouse = studenthouse.charAt(0).toUpperCase();
  studentsprocessed.house =
    studentHouse + studenthouse.substring(1).toLowerCase();

  // fullname
  studentsprocessed.fullname = `${studentsprocessed["firstname"]} ${studentsprocessed["lastname"]}`;
  return studentsprocessed;
}
function sortingStudents() {
  currentStudents = allStudents;
  let sortByName = currentStudents.sort(sortFunction);

  function sortFunction(a, b) {
    if (a[sortStatus] < b[sortStatus]) {
      return -1;
    } else {
      return 1;
    }
  }
  console.log(currentStudents);
  sortByName.forEach(displayStudents);
}

function updateSorting(event) {
  const sortBy = event.target.dataset.sort;
  if (sortBy === "firstname") {
    sortStatus = "firstname";
    prepareObjects(allStudents);
  } else if (sortBy === "middlename") {
    sortStatus = "middlename";
    prepareObjects(allStudents);
  } else if (sortBy === "lastname") {
    sortStatus = "lastname";
    prepareObjects(allStudents);
  } else if (sortBy === "house") {
    sortStatus = "house";
    prepareObjects(allStudents);
  } else if (sortBy === "prefect") {
    sortStatus = "prefect";
    prepareObjects(allStudents);
  }
}
function displayStudents(allStudents) {
  /*   console.log(allStudents);
   */
  const template = document.querySelector(".studentTemplate").content;
  const copy = template.cloneNode(true);
  copy.querySelector("#firstName").textContent = allStudents.firstname;
  copy.querySelector("#lastName").textContent = allStudents.lastname;
  copy.querySelector("#House").textContent = allStudents.house;
  /*  copy
    .querySelector("#expelled")
    .addEventListener("click", changeExpelledvalue);
  function changeExpelledvalue() {
    const expelledButton = doccment.querySelector("#expelled").checked;
    const modalTextP = expelledButton.parentNode.previousElementSibling;
    if (expelledButton) {
      modalTextP.innerText = "Yes";
    } else {
      modalTextP.innerText = "No";
    }
  } */
  // Adding eventlisteners to each student
  /*  const singleStudent = document.querySelectorAll(".student");
  singleStudent.forEach((student) => {
    student.addEventListener("click", openModal);
  }); */
  const parent = document.querySelector(".list tbody");
  parent.appendChild(copy);
}
// slideout menu
const studentCard = document.querySelector(".student");

function slideOutMenu() {
  /*   console.log("hello");
   */ document
    .querySelector("#slideOutMenu")
    .classList.toggle("additionalWidth");

  document.querySelector(".one").classList.toggle("lineOne");
  document.querySelector(".two").classList.toggle("lineTwo");
  document.querySelector(".three").classList.toggle("lineThree");
}
// Filterlist
function filterStatus() {
  document.querySelector(".extended").classList.toggle("openFilter");
}
function removeFilterBox() {}
// Modal
function removeModal() {
  document.querySelector(".modal").classList.remove("showModal");
}

/* function openModal() {
  const modalFullName = this.innerText;
  const modalSplit = modalFullName.split(`\n`);
  console.log(modalSplit[0]);
  document.querySelector(".modal").classList.add("showModal");
  document.querySelector(".close").addEventListener("click", removeModal);
  document.querySelector(
    ".modalFN"
  ).textContent = `${modalSplit[0]}  ${modalSplit[2]}`;
  document.querySelector(".modalH").textContent = modalSplit[4];
} */
