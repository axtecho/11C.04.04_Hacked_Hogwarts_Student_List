"use strict";

window.addEventListener("load", start);

function start() {
  document
    .querySelector("#menu-btn-svg")
    .addEventListener("click", slideOutMenu);
  document
    .querySelector("#FilterButtonP")
    .addEventListener("click", filterStatus);
  registerButtons();
  loadJSON();
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
  house: "",
  bloodstatus: "",
  prefect: false,
  inqSquad: false,
  expelled: false,
  imgURL: "",
};
let allStudents = [];
let expelledStudents = [];
let familiesObj = {
  half: [],
  pure: [],
};
const settings = {
  filterBy: "*",
  sortBy: "name",
  sortDir: "asc",
  hacked: false,
  firstNamelastName: true,
};

let SortValue = "";
let sortDir = "asc";
let filterValue = "";

async function loadJSON() {
  const response = await fetch(
    "https://petlatkea.dk/2021/hogwarts/students.json"
  );
  const jsonData = await response.json();

  const famResponse = await fetch(
    "https://petlatkea.dk/2021/hogwarts/families.json"
  );
  const famData = await famResponse.json();

  await makeFamObj(famData);
  handleData(jsonData);
}

function handleData(students) {
  console.log(students);
  students.forEach((student) => {
    let studentInfo = cleanUp(student);

    allStudents.push(studentInfo);
  });
  console.log(allStudents);
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
  } else if (filterValue === "isExpelled") {
    prepareExpelled(expelledStudents);
  }
}
/* itNotExpelled; */

async function makeFamObj(famData) {
  famData.half.forEach((name) => {
    familiesObj.half.push(name);
  });
  famData.pure.forEach((name) => {
    familiesObj.pure.push(name);
  });
}

function getBloodStatus(student) {
  const halfBloodArr = familiesObj.half;
  const pureBloodArr = familiesObj.pure;
  const lastname = student.lastname;

  if (isNameListed(halfBloodArr, lastname)) {
    return "half";
  } else if (isNameListed(pureBloodArr, lastname)) {
    return "full";
  } else {
    return "muggle";
  }

  function isNameListed(arr, name) {
    return arr.includes(name);
  }
}

function prepareObjects(studentArray) {
  document.querySelector(".list tbody").innerHTML = "";
  let treatedStudents;
  if (!filterValue) {
    treatedStudents = studentArray;
    updateAbout(treatedStudents);
  } else {
    let filteredStudents = hereWeFilter(studentArray);
    treatedStudents = filteredStudents;
    updateAbout(treatedStudents);
  }

  if (SortValue.length <= 0) {
    treatedStudents.forEach(displayStudents);
  } else {
    let newlySortedStudents = sortingStudents(treatedStudents);
    treatedStudents = newlySortedStudents;
    treatedStudents.forEach(displayStudents);
    updateAbout(treatedStudents);
  }
}

function updateAbout(studentArr) {
  const studentsOnDisplay = allStudents.length;
  let gryffendorCount = allStudents.filter((e) => e.house === "Gryffindor");
  let hufflepuffCount = allStudents.filter((e) => e.house === "Hufflepuff");
  let slytherinCount = allStudents.filter((e) => e.house === "Slytherin");
  let ravenclawCount = allStudents.filter((e) => e.house === "Ravenclaw");

  document.querySelector("#student_total").textContent =
    allStudents.length + expelledStudents.length;
  document.querySelector("#student_display").textContent = studentsOnDisplay;
  document.querySelector("#student_expelled").textContent =
    expelledStudents.length;
  document.querySelector("#hufflepuff_count").textContent =
    hufflepuffCount.length;
  document.querySelector("#slytherin_count").textContent =
    slytherinCount.length;
  document.querySelector("#gryffindor_count").textContent =
    gryffendorCount.length;
  document.querySelector("#ravenclaw_count").textContent =
    ravenclawCount.length;
}

function searchFieldInput(input) {
  // write to the list with only those elemnts in the allAnimals array that has properties containing the search frase
  if (filterValue === "isExpelled") {
    let searchFunc = expelledStudents.filter(SearchStudents);
    prepareExpelled(searchFunc);

    function SearchStudents(student) {
      // comparing in uppercase so that m is the same as M
      return (
        student.firstname
          .toUpperCase()
          .includes(input.target.value.toUpperCase()) ||
        student.lastname
          .toUpperCase()
          .includes(input.target.value.toUpperCase())
      );
    }
  } else {
    let searchFunc = allStudents.filter(SearchStudents);
    prepareObjects(searchFunc);

    function SearchStudents(student) {
      // comparing in uppercase so that m is the same as M
      return (
        student.firstname
          .toUpperCase()
          .includes(input.target.value.toUpperCase()) ||
        student.lastname
          .toUpperCase()
          .includes(input.target.value.toUpperCase())
      );
    }
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
    studentsprocessed.lastname = "";
  }

  // House
  const studentHouse = studenthouse.charAt(0).toUpperCase();
  studentsprocessed.house =
    studentHouse + studenthouse.substring(1).toLowerCase();

  // fullname
  studentsprocessed.fullname = `${studentsprocessed["firstname"]} ${studentsprocessed["lastname"]}`;

  // bloodstatus
  studentsprocessed.bloodstatus = getBloodStatus(student);
  // IMG
  if (!studentsprocessed.lastname) {
    studentsprocessed.imgURL = `404.png`;
  } else if (studentsprocessed.lastname === "Patil") {
    studentsprocessed.imgURL = `${studentsprocessed.lastname.toLowerCase()}_${studentsprocessed.firstname.toLowerCase()}.png`;
  } else if (studentsprocessed.lastname.indexOf(`-`) >= 0) {
    const hyphenatedLasname = studentsprocessed.lastname.substring(
      studentsprocessed.lastname.indexOf("-") + 1
    );
    studentsprocessed.imgURL = `${hyphenatedLasname.toLowerCase()}_${studentsprocessed.firstname[0].toLowerCase()}.png`;
  } else if (studentsprocessed.lastname) {
    studentsprocessed.imgURL = `${studentsprocessed.lastname.toLowerCase()}_${studentsprocessed.firstname[0].toLowerCase()}.png`;
  }

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
  filterValue = event.target.className;
  if (filterValue === "isExpelled") {
    prepareExpelled(expelledStudents);
  } else {
    prepareObjects(allStudents);
  }
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
function isExpelled(student) {
  if (student.expelled) {
    return true;
  } else {
    return false;
  }
}
function isAll() {
  return true;
}

function changePrefectvalue() {}

function closeModal(event) {
  const parentElement = event.target.parentElement.parentElement;
  parentElement.classList.add("hide");
}
function closeModalFromCheckbox(event) {
  const checkboxParent =
    event.target.parentElement.parentElement.parentElement.parentElement
      .parentElement;
  checkboxParent.classList.add("hide");
}
function expandStudent(event) {
  const element = event.target.childNodes[17];
  element.style.display = "inline";
  if ((element.style.display = "inline")) {
    event.target.addEventListener("mouseleave", () => {
      element.style.display = "";
    });
  }
}
function upTheOpacity(event) {
  const parentStudent = event.target.parentElement;

  parentStudent.style.backgroundColor =
    `rgba(` + 255 + `,` + 255 + `,` + 255 + `,` + 0.9 + `)`;
  parentStudent.style.color = "#111";
  if (
    (parentStudent.style.backgroundColor =
      `rgba(` + 255 + `,` + 255 + `,` + 255 + `,` + 0.9 + `)`)
  ) {
    event.target.addEventListener("mouseleave", () => {
      parentStudent.style.backgroundColor =
        `rgba(` + 255 + `,` + 255 + `,` + 255 + `,` + 0.4 + `)`;
      parentStudent.style.color = "white";
    });
  }
}
/* function prepareObjects(studentArray) {
  document.querySelector(".list tbody").innerHTML = "";
  let treatedStudents;
  if (!filterValue) {
    treatedStudents = studentArray;
    updateAbout(treatedStudents);
  } else {
    let filteredStudents = hereWeFilter(studentArray);
    treatedStudents = filteredStudents;
    updateAbout(treatedStudents);
  }

  if (SortValue.length <= 0) {
    treatedStudents.forEach(displayStudents);
  } else {
    let newlySortedStudents = sortingStudents(treatedStudents);
    treatedStudents = newlySortedStudents;
    treatedStudents.forEach(displayStudents);
    updateAbout(treatedStudents);
  }
} */

function prepareExpelled(studentArray) {
  document.querySelector(".list tbody").innerHTML = "";
  if (SortValue.length <= 0) {
    studentArray.forEach(displayExpelledStudents);
  } else {
    let newlySortedStudents = sortingStudents(studentArray);
    let treatedStudents = newlySortedStudents;
    treatedStudents.forEach(displayExpelledStudents);
  }
}
function displayExpelledStudents(student) {
  const template = document.querySelector(".expelled_student_template").content;
  const copy = template.cloneNode(true);
  copy.querySelector("[data-field=FirstName]").textContent = student.firstname;
  copy.querySelector("[data-field=Lastname]").textContent = student.lastname;
  copy.querySelector("[data-field=House]").textContent = student.house;
  copy.querySelector("#Photo img").src = `assets/images/${student.imgURL}`;

  if (getBloodStatus(student) === "half") {
    copy.querySelector("[data-field=Bloodstatus]").textContent = "Half-Blood";
  } else if (getBloodStatus(student) === "full") {
    copy.querySelector("[data-field=Bloodstatus]").textContent = "Full-Blood";
  } else {
    copy.querySelector("[data-field=Bloodstatus]").textContent = "Muggle";
  }
  const parent = document.querySelector(".list tbody");
  parent.appendChild(copy);
}
function displayStudents(student) {
  const template = document.querySelector(".studentTemplate").content;
  const copy = template.cloneNode(true);
  copy.querySelector("[data-field=FirstName]").textContent = student.firstname;
  copy.querySelector("[data-field=Lastname]").textContent = student.lastname;
  copy.querySelector("[data-field=House]").textContent = student.house;
  // student modal
  const singlecard = document.querySelectorAll(".student");
  singlecard.forEach((card) => {
    card.addEventListener("mouseenter", expandStudent);
  });

  const readMoreContainer = document.querySelectorAll("[data-field=Read_more]");
  readMoreContainer.forEach((contain) => {
    contain.addEventListener("mouseenter", upTheOpacity);
    /* contain.addEventListener("click", openModal); */
  });
  const closeModals = document.querySelectorAll("#student_dialog .close");
  closeModals.forEach((modal) => {
    modal.addEventListener("click", closeModal);
  });

  // inq Squad //
  copy.querySelector("[data-field=Squad]").dataset.issquad = student.inqSquad;
  if (student.inqSquad) {
    copy.querySelector("[data-field=Squad]").textContent = "Yes";
  } else {
    copy.querySelector("[data-field=Squad]").textContent = "No";
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
  // student modal
  copy
    .querySelector("[data-field=Read_more]")
    .addEventListener("click", openModal);
  function openModal(event) {
    const template = document.querySelector("#dialog_template").content;
    const copy = template.cloneNode(true);

    copy.querySelector("#student_dialog").classList.remove("hide");
    copy.querySelector("#modal_first_name").textContent = student.firstname;
    copy.querySelector("#modal_last_name").textContent = student.lastname;
    copy.querySelector("#modalIMG").src = `assets/images/${student.imgURL}`;
    copy.querySelector("#modal_house").textContent = student.house;
    if (student.prefect) {
      copy.querySelector("#modal_prefect").textContent = "Yes";
    } else {
      copy.querySelector("#modal_prefect").textContent = "No";
    }
    if (student.inqSquad) {
      copy.querySelector("#modal_squad").textContent = "Yes";
    } else {
      copy.querySelector("#modal_squad").textContent = "No";
    }
    if (student.bloodstatus === "full") {
      copy.querySelector("#modal_blood").textContent = "Full-blood";
    } else if (student.bloodstatus === "half") {
      copy.querySelector("#modal_blood").textContent = "Half-blood";
    } else {
      copy.querySelector("#modal_blood").textContent = "Muggle";
    }

    if (student.expelled) {
      copy.querySelector("#expel").checked = true;
    }
    copy.querySelector(".close").addEventListener("click", closeModal);
    copy.querySelector("#expel").addEventListener("click", expelEm);
    copy
      .querySelector(".modal_expel")
      .addEventListener("click", closeModalFromCheckbox);

    const parent = document.querySelector(".divbody");
    parent.appendChild(copy);
  }

  function expelEm() {
    student.expelled = true;
    document.querySelector("#expel").checked = true;
    const studentIndex = allStudents.indexOf(student);
    const newExpelledStudent = allStudents.splice(studentIndex, 1);
    const objectsOnly = newExpelledStudent.shift();
    expelledStudents.push(objectsOnly);
    prepareObjects(allStudents);
    updateAbout(allStudents);
  }
  function closeThisModal() {
    document.querySelector("#wstudent_dialog").classList.add("hide");
  }
  //Squad
  copy
    .querySelector("[data-field=Squad]")
    .addEventListener("click", inqSquadFunc);

  function prefectFunc() {
    if (student.prefect) {
      student.prefect = false;
    } else {
      tryToMakeAPrefect(student);
    }

    prepareObjects(allStudents);
  }
  //BLOOD
  if (getBloodStatus(student) === "half") {
    copy.querySelector("[data-field=Bloodstatus]").textContent = "Half-Blood";
  } else if (getBloodStatus(student) === "full") {
    copy.querySelector("[data-field=Bloodstatus]").textContent = "Full-Blood";
  } else {
    copy.querySelector("[data-field=Bloodstatus]").textContent = "Muggle";
  }

  function tryToMakeAPrefect(selectedStudent) {
    const prefects = allStudents.filter((student) => student.prefect);
    const numberOfPrefects = prefects.length;
    const others = prefects.filter(
      (student) => student.house === selectedStudent.house
    );
    // If there is another of same type
    if (others.length > 1) {
      removeOther(others);
    } else {
      makePrefect(selectedStudent);
    }

    function removeOther(other) {
      // ask the user to ignore or remove `other`
      document.querySelector("#removefirst #first_prefect").textContent =
        other[0].fullname;
      document.querySelector("#removeother #second_prefect").textContent =
        other[1].fullname;

      document.querySelector("#remove_other").classList.remove("hide");
      document
        .querySelector("#remove_other .close")
        .addEventListener("click", closeDialog);
      [
        document.querySelector("#removefirst"),
        document.querySelector("#removeother"),
      ].forEach((button) => {
        button.addEventListener("click", clickRemoveOther);
      });

      function closeDialog() {
        document.querySelector("#remove_other").classList.add("hide");
        document
          .querySelector("#remove_other #removefirst")
          .removeEventListener("click", clickRemoveOther);
        document
          .querySelector("#remove_other #removeother")
          .removeEventListener("click", clickRemoveOther);
        document
          .querySelector("#remove_other .close")
          .removeEventListener("click", closeDialog);
      }
      // if remove other:
      function clickRemoveOther() {
        const whichToRemove = this.id;

        if (whichToRemove === "removefirst") {
          removePrefect(other[0]);
        } else if (whichToRemove === "removeother") {
          removePrefect(other[1]);
        }
        makePrefect(selectedStudent);
        prepareObjects(allStudents);
        closeDialog();
      }
    }

    function removePrefect(givenPrefect) {
      givenPrefect.prefect = false;
    }

    function makePrefect(student) {
      student.prefect = true;
    }
  }

  function inqSquadFunc() {
    if (student.inqSquad) {
      student.inqSquad = false;
      prepareObjects(allStudents);
    } else {
      tryToAddToSquad(student);
    }
    prepareObjects(allStudents);
  }

  //IMAGE
  copy.querySelector("#Photo img").src = `assets/images/${student.imgURL}`;
  /* --------------------------------------------------- */
  copy.querySelector("[data-field=Prefect]");
  //  const checked = document.querySelector(".modal_expel input").checked;

  const parent = document.querySelector(".list tbody");
  parent.appendChild(copy);
}
// slideout menu
const studentCard = document.querySelector(".student");

function slideOutMenu() {
  document.querySelector("#slideOutMenu").classList.toggle("additionalWidth");

  document.querySelector(".one").classList.toggle("lineOne");
  document.querySelector(".two").classList.toggle("lineTwo");
  document.querySelector(".three").classList.toggle("lineThree");
}
// Filterlist
function filterStatus() {
  document.querySelector(".extended").classList.toggle("openFilter");
  document.querySelector("#background").classList.toggle("blur");
  document.querySelector(".list").classList.toggle("blur");
  document.querySelector("aside").classList.toggle("blur");
}

// Modal
function removeModal() {
  document.querySelector(".modal").classList.remove("showModal");
}

function tryToAddToSquad(selectedStudent) {
  const bloodResult = getBloodStatus(selectedStudent);

  if (bloodResult === "full" || selectedStudent.house === "Slytherin") {
    addToSquad(selectedStudent);
  } else {
    document.querySelector("#squad_dialog").classList.remove("hide");
    racistDialog();
  }

  function racistDialog() {
    document
      .querySelector("#squad_dialog #wellsorry")
      .addEventListener("click", closeDialog);
    document
      .querySelector(".closebutton")
      .addEventListener("click", closeDialog);
  }

  function closeDialog() {
    document.querySelector("#squad_dialog").classList.add("hide");
    document
      .querySelector("#squad_dialog #wellsorry")
      .removeEventListener("click", closeDialog);
    document
      .querySelector(".closebutton")
      .removeEventListener("click", closeDialog);
  }

  function addToSquad(selectedStudent) {
    selectedStudent.inqSquad = true;

    prepareObjects(allStudents);
  }
}
