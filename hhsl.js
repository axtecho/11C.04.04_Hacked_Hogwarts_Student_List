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
  prefect: false,
  inqSquad: false,
  house: "",
};
let allStudents = [];
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

  prepareObjects(allStudents);
}
function hereWeFilter(reveivedStudents) {
  if (filterValue === "isGryffindor") {
    let filteredStudents = reveivedStudents.filter(isGryffindor);
    return filteredStudents;
  } else if (filterValue === "isSlytherin") {
    let filteredStudents = reveivedStudents.filter(isSlytherin);
    return filteredStudents;
  } else if (filterValue === "isRavenclaw") {
    let filteredStudents = reveivedStudents.filter(isRavenclaw);
    return filteredStudents;
  } else if (filterValue === "isHufflepuff") {
    let filteredStudents = reveivedStudents.filter(isHufflepuff);
    return filteredStudents;
  } else if (filterValue === "isAll" || filterValue === "") {
    let filteredStudents = reveivedStudents.filter(isAll);
    return filteredStudents;
  }
}
function prepareObjects(studentArray) {
  document.querySelector(".list tbody").innerHTML = "";
  let treatedStudents;
  if (!filterValue) {
    treatedStudents = studentArray;
  } else {
    let filteredStudents = hereWeFilter(studentArray);
    treatedStudents = filteredStudents;
  }

  if (SortValue.length <= 0) {
    treatedStudents.forEach(displayStudents);
  } else {
    let newlySortedStudents = sortingStudents(treatedStudents);
    treatedStudents = newlySortedStudents;
    treatedStudents.forEach(displayStudents);
  }
}

function searchFieldInput(input) {
  console.log(input.target.value);
  // write to the list with only those elemnts in the allAnimals array that has properties containing the search frase
  let searchFunc = allStudents.filter(SearchStudents);
  prepareObjects(searchFunc);

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
function sortingStudents(receivedStudents) {
  let direction = 1;

  if (sortDir === "desc") {
    direction = -1;
  } else {
    direction = 1;
  }

  let sortByName = receivedStudents.sort(sortFunction);
  return sortByName;

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
  console.log(filterValue);
  prepareObjects(allStudents);
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
function changePrefectvalue() {}

function displayStudents(student) {
  const template = document.querySelector(".studentTemplate").content;
  const copy = template.cloneNode(true);
  copy.querySelector("[data-field=FirstName]").textContent = student.firstname;
  copy.querySelector("[data-field=Lastname]").textContent = student.lastname;
  copy.querySelector("[data-field=House]").textContent = student.house;
  // inq Squad //
  if (student.inqSquad) {
    copy.querySelector("[data-field=Squad]").textContent = "Yes";
  } else {
    copy.querySelector("[data-field=Squad]").textContent = "No";
  }
  copy
    .querySelector("[data-field=Squad]")
    .addEventListener("click", inqSquadFunc);
  function inqSquadFunc() {
    if (student.inqSquad) {
      console.log("im here");
      student.inqSquad = false;
    } else {
      student.inqSquad = true;
    }
    prepareObjects(allStudents);
  }

  // Prefect

  copy.querySelector("[data-field=Prefect]").dataset.isprefect =
    student.prefect;

  if (student.prefect) {
    copy.querySelector("[data-field=Prefect]").textContent = "Yes";
  } else {
    copy.querySelector("[data-field=Prefect]").textContent = "No";
  }

  copy
    .querySelector("[data-field=Prefect]")
    .addEventListener("click", prefectFunc);

  function prefectFunc() {
    if (student.prefect) {
      student.prefect = false;
    } else {
      tryToMakeAPrefect(student);
    }

    prepareObjects(allStudents);
  }

  function tryToMakeAPrefect(selectedStudent) {
    const prefects = allStudents.filter((student) => student.prefect);
    const numberOfPrefects = prefects.length;
    const others = prefects.filter(
      (student) => student.house === selectedStudent.house
    );
    console.log(others);
    // If there is another of same type
    if (others.length > 1) {
      console.log("there can only be one of each type!");
      removeOther(others);
    } else if (numberOfPrefects >= 2) {
      console.log("there can only be two prefects!");
      removeAorB(prefects[0], prefects[1]);
    } else {
      makePrefect(selectedStudent);
    }
    /*   console.log(`There are ${numberOfPrefects}`); */
    // console.log(`The other prefects of this house is ${others.firstname}`);

    function removeOther(other) {
      // ask the user to ignore or remove `other`
      document.querySelector("#remove_other").classList.remove("hide");
      document
        .querySelector("#remove_other .close")
        .addEventListener("click", closeDialog);
      document
        .querySelector("#remove_other #removeother")
        .addEventListener("click", clickRemoveOther);

      //if ignore do nothing
      function closeDialog() {
        document.querySelector("#remove_other").classList.add("hide");
        document
          .querySelector("#remove_other #removeother")
          .removeEventListener("click", clickRemoveOther);
        document
          .querySelector("#remove_other .close")
          .removeEventListener("click", closeDialog);
      }
      // if remove other:
      function clickRemoveOther() {
        removePrefect(other.shift());
        makePrefect(selectedStudent);
        prepareObjects(allStudents);
        closeDialog();
      }
    }
    function removeAorB(prefectA, prefectB) {
      // Ask the user to ignore or remove A or B

      // if the user ignores - do nothing
      // if removeA
      removePrefect(prefectA);
      makePrefect(selectedStudent);
      //else if - if removeB
      removePrefect(prefectB);
      makePrefect(selectedStudent);
    }
    function removePrefect(givenPrefect) {
      givenPrefect.prefect = false;
    }
    function makePrefect(student) {
      student.prefect = true;
    }
  }

  /* --------------------------------------------------- */
  copy.querySelector("[data-field=Prefect]");
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
