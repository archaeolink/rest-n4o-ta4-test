// event functions and button onclick functions

function thesaurusInputFile() {
    event.preventDefault();
    // reset former outputs, if there are any
    resetOutput();
    // display loading popup until every following function is finished
    document.getElementById("loadingDiv").style.display = "block";
    const inputFile = document.getElementById('fileInput');
    const file = inputFile.files[0];
    let reader = new FileReader();
    reader.onload = function(e) {
      result = e.target.result;
      readData(result, "file")
    };
    reader.readAsText(file);
}

async function thesaurusInputUrl() {
    event.preventDefault();
    // reset former outputs, if there are any
    resetOutput();
    // display loading popup until every following function is finished
    document.getElementById("loadingDiv").style.display = "block";
    const inputURL = document.getElementById('textInput').value;
    const response = await fetch(inputURL, {
        headers: { "content-type": "text/csv;charset=UTF-8" },
    });
    const text = await response.text();
    readData(text, "url")
}

function saveUserName() {
  event.preventDefault();
  let userNameText = document.getElementById("userNameText").value;
  if (userNameText == "") {
    alert("Bitte geben Sie einen Benutzernamen ein!");
    return;
  }
  document.getElementById("userName").innerHTML = userNameText;
  document.getElementById("userNameText").value = "";
  document.getElementById("commentButton").innerText = `Kommentieren als ${userNameText}`;
}

function closeConceptModal() {
  event.preventDefault();
  let modal = document.getElementById("myModal");
  modal.style.display = "none";
}

function closeConceptSchemeModal() {
  event.preventDefault();
  let modal = document.getElementById("conceptSchemeModal");
  modal.style.display = "none";
  //let form = document.getElementById("conceptSchemeForm");
  // reset value of all input elements in form, currently deactivated
  //form.reset();
}

function collectThesaurusData(idObject, topPosition) {
  event.preventDefault();
  // make modal visible
  let dateInput = document.getElementById("createdInput");
  // reset readonly attribute of dateInput
  dateInput.removeAttribute("readonly");
  // fill dateInput with current date
  let currentDate = new Date()
  // add timezone offset to get local time
  currentDate.setMinutes(currentDate.getMinutes() - currentDate.getTimezoneOffset());
  // get current date in format yyyy-mm-dd
  let dateString = currentDate.toISOString().slice(0, 10);
  dateInput.value = dateString;
  // set readonly attribute of dateInput again
  dateInput.setAttribute("readonly", "readonly");
  let modal = document.getElementById("conceptSchemeModal");
  modal.style.display = "block";
  let conceptSchemeFormButton = document.getElementById("conceptSchemeFormButton");
  conceptSchemeFormButton.onclick = function() {generateThesaurus(idObject, topPosition)};
}

function setCommentURL() {
  event.preventDefault();
  // read and return value of global variable commentURL
  commentURL = document.getElementById('commentURLInput').value;
  return commentURL;
}

async function readCommentaryFiles() {
  folderGraphText = await readFromPod("https://restaurierungsvokabular.solidweb.org/annotations/", "text/turtle");
  folderGraph = $rdf.graph();
  // define LDP namespace
  LDP = $rdf.Namespace("http://www.w3.org/ns/ldp#");
  $rdf.parse(folderGraphText, folderGraph, "https://restaurierungsvokabular.solidweb.org/annotations/", "text/turtle");
  // get values of all ldp:contains in n0: as a list
  let folderList = folderGraph.each($rdf.sym("https://restaurierungsvokabular.solidweb.org/annotations/"), LDP("contains"));
  // iterate over all values of ldp:contains
  let annotationURLS = [];
  let annotationMapper = {};

  for (let x of folderList) {
    // get the URL of the file
    let fileURL = x.value;
    // check if file ends with .ttl
    if (fileURL.endsWith(".ttl")) {
      // add URL to list of annotationURLS
      annotationURLS.push(fileURL);
    }
    if (fileURL.endsWith("annotationMappings.json")) {
      let jsonString = await readFromPod(fileURL, "application/json");
      annotationMapper = JSON.parse(jsonString);
    }
  }
  let commentURLSelector = document.getElementById("commentURLInput");
  // add option tag to commentURLSelector for each URL in annotationURLS with value = URL and innerHTML = annotationMapper[URL]
  for (let x of annotationURLS) {
    let option = document.createElement("option");
    option.value = x;
    option.innerHTML = annotationMapper[x];
    commentURLSelector.appendChild(option);
  }
}

async function createCommentURL() {
  thesaurusName = document.getElementById('createCommentURLInput').value;
  let commentURL = "https://restaurierungsvokabular.solidweb.org/annotations/" + thesaurusName + ".ttl";
  writeToPod("", commentURL, "text/turtle");
  /*
  let commentMapper = "https://restaurierungsvokabular.solidweb.org/annotations/annotationMappings.json";
  let commentMapperGraphText = await readFromPod(commentMapper, "application/json");
  let commentMapperGraph = JSON.parse(commentMapperGraphText);
  commentMapperGraph[commentURL] = thesaurusName;
  let commentMapperGraphString = JSON.stringify(commentMapperGraph);
  await writeToPod(commentMapper, commentMapperGraphString, "application/json");
  */
  



}

// global variables and event listeners
let commentURL = "";

const thesaurusFileInputForm = document.getElementById('fileForm');
thesaurusFileInputForm.addEventListener('submit', thesaurusInputFile);

const thesaurusUrlInputForm = document.getElementById('textForm');
thesaurusUrlInputForm.addEventListener('submit', thesaurusInputUrl);

const commentForm = document.getElementById("commentForm");
commentForm.addEventListener("submit", updatePod);

const commentURLForm = document.getElementById("commentURLForm");
commentURLForm.addEventListener("submit", setCommentURL);

const createCommentURLForm = document.getElementById("createCommentURLForm");
createCommentURLForm.addEventListener("submit", createCommentURL);

readCommentaryFiles();


