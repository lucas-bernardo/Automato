
//set recording button
chrome.storage.local.get("isRecording", function(result) {
  document.getElementById("recordBtn").checked = result.isRecording;
});

//var userInterMap = new Map();
chrome.storage.local.get("interactions", function(data) {
    if(typeof data.interactions != 'undefined') {
        //document.getElementById("tableRecord").getElementsByTagName('tbody')[0].innerHTML += data.interactions;
        var table = document.getElementById("tableRecord");
        //var ar = data.interactions.split("(?<=\\G\\]d+,\\]d+,\\]d+),");
        var userInterMap = JSON.parse(data.interactions);
        Object.keys(userInterMap).map(function(key, index) {
          //alert(key + ' = ' + userInterMap[key]);
          updateTableRecord(table, key, userInterMap[key]);
        });
    }
});

//var evnts = ["click","focus","blur","keyup","keydown","keypressed"];
var evntsDataList = createEvntsDataList();
function createEvntsDataList() {
	return createList(0, ["click","focus","blur","keyup","keydown","keypressed"]);
}

//Insert a row to table record
function updateTableRecord(table, key, value) {
	//Add a new row at the bottom of list
  	var row = table.insertRow(-1);
  	//Add all cells to new row
  	var cell0 = row.insertCell(0);
  	var cell1 = row.insertCell(1);
  	var cell2 = row.insertCell(2);
  	var cell3 = row.insertCell(3);

  	//Create array with found locators
  	var locatorsArray = value[0].split("&&");
  	
  	cell0.appendChild(createCombo(key, locatorsArray[0]));//Add combobox to first cell and set default value
  	cell0.appendChild(createList(key, locatorsArray));//Add datalist with all found locators
  	cell1.appendChild(createCombo(0, value[1]));//Add combobox to second cell and set default value
  	cell1.appendChild(evntsDataList);//Add datalist with all possible actions
  	cell2.appendChild(createInput(value[2]));//Add input to third cell and set value if not blank
  	cell3.appendChild(createIcon());//Add delete icon to last cell
}

//Creates a regular combobox
function createCombo(key, value) {
  var newCombo = document.createElement("INPUT");
  newCombo.setAttribute('class', 'editableCombo');
  newCombo.setAttribute('type', 'text');
  newCombo.setAttribute('list', key);
  if (value) {
  	newCombo.setAttribute('value', value);
  }

  return newCombo;
}

//Creates a regular datalist to be append in a combobox
function createList(key, array) {
  var dataList = document.createElement("DATALIST");
  dataList.setAttribute("id", key);
  //Creating combobox options
  for (i = 0; i < array.length; i++) {
    var option = document.createElement("OPTION");
    option.innerText = array[i];
    dataList.appendChild(option);
  }

  return dataList;
}

//Creates a regular input
function createInput(value) {
  var newInput = document.createElement("INPUT");;
  newInput.setAttribute("type", "text");
  if (value) {
  	newInput.setAttribute("value", value);
  }

  return newInput;
}

//Creates delete icon
function createIcon() {
  var newIcon = document.createElement("i");
  newIcon.setAttribute("class", "material-icons");
  newIcon.innerText = "clear";

  return newIcon;
}

//Recording Btn
document.getElementById("recordBtn").onclick = function () {
 	chrome.runtime.sendMessage({type: "isRecording", rec: document.getElementById("recordBtn").checked});
};

//Clear btn functions
document.getElementById("clearBtn").onclick = function () {
 	clearLocalStorage();
    clearTable();
};

function clearLocalStorage() {
    chrome.storage.local.clear(function() {
      var error = chrome.runtime.lastError;
      if (error) {
        console.error(error);
      }
    });
}

function clearTable() {
	var old_tbody = document.getElementById("tableRecord").getElementsByTagName('tbody')[0];
	var new_tbody = document.createElement('tbody');
	old_tbody.parentNode.replaceChild(new_tbody, old_tbody)
}