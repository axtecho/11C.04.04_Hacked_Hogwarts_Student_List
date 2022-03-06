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

  document.querySelectorAll(".extended li").forEach((item) => {
    item.addEventListener("click", updateFiltering);
  });
  document.querySelector("#search").addEventListener("input", searchFieldInput);
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
let SortValue = "";
let sortDir = "";
let filterValue = "";
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
  console.log(currentStudents);

  if (filterValue === "isGryffindor") {
    let filteredStudents = allStudents.filter(isGryffindor);
    currentStudents = filteredStudents;
  } else if (filterValue === "isSlytherin") {
    let filteredStudents = allStudents.filter(isSlytherin);
    currentStudents = filteredStudents;
  } else if (filterValue === "isRavenclaw") {
    let filteredStudents = allStudents.filter(isRavenclaw);
    currentStudents = filteredStudents;
  } else if (filterValue === "isHufflepuff") {
    let filteredStudents = allStudents.filter(isHufflepuff);
    currentStudents = filteredStudents;
  } else if (filterValue === "isAll") {
    let filteredStudents = allStudents.filter(isAll);
    currentStudents = filteredStudents;
  }

  if (SortValue.length <= 0) {
    if (currentStudents.length <= 0) {
      allStudents.forEach(displayStudents);
    } else {
      currentStudents.forEach(displayStudents);
    }
  } else {
    sortingStudents();
  }
}
function searchFieldInput(input) {
  console.log(input.target.value);
  // write to the list with only those elemnts in the allAnimals array that has properties containing the search frase
  if (!filterValue) {
    let searchedStudents = allStudents.filter(SearchStudents);
    currentStudents = searchedStudents;
    prepareObjects();
  } else {
    let searchedStudents = currentStudents.filter(SearchStudents);
    currentStudents = searchedStudents;
    console.log("here we are");
    prepareObjects();
  }

  function SearchStudents(student) {
    // comparing in uppercase so that m is the same as M
    return (
      student.firstname
        .toUpperCase()
        .includes(input.target.value.toUpperCase()) ||
      student.lastname.toUpperCase().includes(input.target.value.toUpperCase())
    );
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
  let direction = 1;

  if (sortDir === "desc") {
    direction = -1;
  } else {
    direction = 1;
  }

  if (currentStudents.length <= 0) {
    console.log("howdy");

    let sortByName = allStudents.sort(sortFunction);
    sortByName.forEach(displayStudents);
  } else {
    let sortByName = currentStudents.sort(sortFunction);
    sortByName.forEach(displayStudents);
  }

  function sortFunction(a, b) {
    if (a[SortValue] < b[SortValue]) {
      return 1 * direction;
    } else {
      return -1 * direction;
    }
  }
}
function updateFiltering(event) {
  const rawFilterValue = event.target.innerHTML;
  const modFilterValue = rawFilterValue.substring(
    rawFilterValue.indexOf(" ") + 1
  );
  filterValue = `is${modFilterValue}`;
  prepareObjects();
}
function updateSorting(event) {
  const sortBy = event.target.dataset.sort;
  sortDir = event.target.dataset.sortDirection;
  const SortinnerText = event.target.innerText;
  const newSortValue = SortinnerText.charAt(0).toLowerCase();
  SortValue = newSortValue + SortinnerText.substring(1);

  if (sortDir === "asc") {
    sortDir = event.target.dataset.sortDirection = "desc";
  } else {
    sortDir = event.target.dataset.sortDirection = "asc";
  }
  prepareObjects(allStudents);
}
function isGryffindor(student) {
  if (student.house === "Gryffindor") {
    return true;
  } else {
    return false;
  }
}
function isSlytherin(student) {
  if (student.house === "Slytherin") {
    return true;
  } else {
    return false;
  }
}
function isRavenclaw(student) {
  if (student.house === "Ravenclaw") {
    return true;
  } else {
    return false;
  }
}
function isHufflepuff(student) {
  if (student.house === "Hufflepuff") {
    return true;
  } else {
    return false;
  }
}
function isAll() {
  return true;
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
