
//set recording button
chrome.storage.local.get("isRecording", function(result) {
  document.getElementById("recordBtn").checked = result.isRecording;
});

//set Start URL field
chrome.storage.local.get("startURL", function(result) {
  document.getElementById("startURL").value = result.startURL;
});


//var userInterMap = new Map();
chrome.storage.local.get("interactions", function(data) {
    if(typeof data.interactions != 'undefined') {
        //document.getElementById("tableRecord").getElementsByTagName('tbody')[0].innerHTML += data.interactions;
        var table = document.getElementById("tableRecord").getElementsByTagName("tbody")[0];
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

  	cell0.appendChild(createCombo(key, value[0][0]));//Add combobox to first cell and set default value
  	cell0.appendChild(createList(key, value[0]));//Add datalist with all found locators
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

//Input startURL updates the url on focus out event
document.getElementById("startURL").addEventListener("focusout", 
	function () {
		chrome.runtime.sendMessage({type: "newURL", url: this.value});
	}
);

//Recording Btn
document.getElementById("recordBtn").onclick = function () {
	var isChecked = document.getElementById("recordBtn").checked;
	var startURL = document.getElementById("startURL").value;

	if (isChecked && urlIsEmpty(startURL)) {
		document.getElementById("recordBtn").checked = false;
		alert("Please, enter Start URL.")
	} else {
		if (isChecked) 
			var newTab = chrome.tabs.create({ url: startURL });
		chrome.runtime.sendMessage({type: "isRecording", rec: isChecked, url: startURL});
	}
};

function urlIsEmpty(value) {
	return value.length == 0;
}

//Clear btn functions
document.getElementById("clearBtn").onclick = function () {
 	chrome.runtime.sendMessage({type: "cleanTable"});
    clearTable();
};

function clearTable() {
	var old_tbody = document.getElementById("tableRecord").getElementsByTagName('tbody')[0];
	var new_tbody = document.createElement('tbody');
	old_tbody.parentNode.replaceChild(new_tbody, old_tbody)
}

//Remove tableRecord row
document.querySelector('#tableRecord').onclick = function(event) {
   deleteRow(event, "tableRecord");
}

//Remove tablePlayback row
document.querySelector('#tablePlayback').onclick = function(event) {
   deleteRow(event, "tablePlayback");
}

function deleteRow(event, tableID) {
   var element = event.srcElement;
   if (element.className != null && element.className == "material-icons") {
   	document.getElementById(tableID).deleteRow(element.parentElement.parentElement.rowIndex);
   }
}