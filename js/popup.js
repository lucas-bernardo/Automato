var storage = chrome.storage.local;
var EDITION_OPTION = "Save Edition";

//set recording button
storage.get("isRecording", function(result) {
  document.getElementById("recordBtn").checked = result.isRecording;
});

//set Recording Name field
storage.get("recName", function(result) {
	var name = result.recName;
  	document.getElementById("recName").value = name ? name : "";
});

//set Start URL field
storage.get("startURL", function(result) {
	var url = result.startURL;
  document.getElementById("startURL").value = url ? url : "";
});


//var userInterMap = new Map();
storage.get("setInteraction", function(data) {
	var interactions = data.setInteraction;
    if(typeof interactions != 'undefined') {
        var table = document.getElementById("tableRecord");
        var tableBody = table.getElementsByTagName("tbody")[0];
        var userInterMap = JSON.parse(interactions);
        Object.keys(userInterMap).map(function(key, index) {
          updateTableRecord(tableBody, key, userInterMap[key]);
        });
        activateToolbar();
    }
});

//Insert a row to table record
function updateTableRecord(table, key, value) {
	//Add a new row at the bottom of list
  	var row = table.insertRow(-1);
  	//Add all cells to new row
  	var cell0 = row.insertCell(0);
  	var cell1 = row.insertCell(1);
  	var cell2 = row.insertCell(2);
  	var cell3 = row.insertCell(3);

  	cell0.appendChild(createEditableCombo("locator" + key, value[0][0]));//Add combobox to first cell and set default value
	cell0.appendChild(createSelect(key, value[0]));
  	cell1.appendChild(createCombo("action" + key));//Add combobox to second cell and set default value
  	cell2.appendChild(createInput(value[2]));//Add input to third cell and set value if not blank
  	cell3.appendChild(createIcon());//Add delete icon to last cell
}

//Creates a regular combobox
function createEditableCombo(key, value) {
  var newCombo = document.createElement("INPUT");
  newCombo.setAttribute("id", key);
  newCombo.setAttribute('class', 'editableCombo');
  newCombo.setAttribute('type', 'text');
  newCombo.setAttribute("value", value);

  return newCombo;
}

function createSelect(key, array) {
  var select = document.createElement("SELECT");
  select.setAttribute("id", key);
  select.setAttribute('class', 'comboSelect');
  //Create empty option to be filled by user alterations
  var editionOption = document.createElement("OPTION");
  editionOption.innerText = EDITION_OPTION;
  select.appendChild(editionOption);
  //Creating combobox options
  for (i = 0; i < array.length; i++) {
    var option = document.createElement("OPTION");
    option.innerText = array[i];
    select.appendChild(option);
  }
  addOnChangeToSelect(select);
  resetSelectElement(select);

  return select;
}

function addOnChangeToSelect(selectElement) {
    selectElement.addEventListener('change',
    function() {
        var theinput = document.getElementById("locator" + this.id);
        var idx = this.selectedIndex;
        if (idx > 0) {
            var content = this.options[idx].innerHTML;
            theinput.value = content;
        } else {
            this.options[0].innerHTML = theinput.value ? theinput.value : EDITION_OPTION;
        }
        resetSelectElement(selectElement);
    });
}

function resetSelectElement(selectElement) {
    selectElement.selectedIndex = -1;
}

//Creates a regular select element
function createCombo(key) {
  var sElem = document.createElement("SELECT");
  sElem.setAttribute("id", key);
  //Creating combobox options
  var evntsArray = ["click","focus","blur","keyup","keydown","keypressed"]
  for (i = 0; i < evntsArray.length; i++) {
    var option = document.createElement("OPTION");
    option.innerText = evntsArray[i];
    sElem.appendChild(option);
  }

  return sElem;
}

//Creates a regular input
function createInput(value) {
  var newInput = document.createElement("INPUT");;
  newInput.setAttribute("type", "text");
  if (value != null) {
  	newInput.setAttribute("value", value);
  }

  return newInput;
}

//Creates delete icon
function createIcon() {
  var newIcon = document.createElement("i");
  newIcon.setAttribute("class", "material-icons");
  newIcon.innerText = "clear";
  addOnClickToIcon(newIcon);

  return newIcon;
}

function addOnClickToIcon(iTag) {
    iTag.addEventListener('click',
    function() {
        var userInterMapKey = deleteRowAndGetMapKey(this);
        if (userInterMapKey) {
            removeUserInterMapKey(userInterMapKey);
            activateToolbar();
        }
    });
}

//Input .recName updates the recording name on focus out event
document.getElementById("recName").addEventListener("focusout", 
	function () {
		chrome.runtime.sendMessage({type: "recName", val: this.value});
	}
);

//Input .startURL updates the url on focus out event
document.getElementById("startURL").addEventListener("focusout", 
	function () {
		chrome.runtime.sendMessage({type: "startURL", val: this.value});
	}
);

//#playContainer buttons functions
//#playPauseBtn - Starts, pauses or restarts the playback of rows in #tableRecord
document.getElementById("playPauseBtn").onclick = function () {
    var rowCount = getTableRowCount("tableRecord");
    if (rowCount > 0) {
        chrome.runtime.sendMessage({type: "playback", val: true});
    }
};

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
		chrome.runtime.sendMessage({type: "isRecording", val: isChecked});
	}
};

function urlIsEmpty(value) {
	return value.length == 0;
}

//Clear btn functions
document.getElementById("clearBtn").onclick = function () {
 	chrome.runtime.sendMessage({type: "cleanTable"});
    clearTable();
    activateToolbar();
};

function clearTable() {
	var old_tbody = document.getElementById("tableRecord").getElementsByTagName('tbody')[0];
	var new_tbody = document.createElement('tbody');
	old_tbody.parentNode.replaceChild(new_tbody, old_tbody)
}

function deleteRowAndGetMapKey(element) {
    var table = element.parentElement.parentElement.parentElement.parentElement;
    var rIndex = element.parentElement.parentElement.rowIndex;
    var userInterMapKey = getUserInterMapKeyByCellInputListAttr(table.rows[rIndex].cells[0].childNodes[0].attributes);
    table.deleteRow(rIndex);
    return userInterMapKey;
}

function getUserInterMapKeyByCellInputListAttr(cellAttrs) {
	var userInterMapKey = -1;
	Array.prototype.slice.call(cellAttrs).forEach(function(item) {
		if ("list" == item.name)
			userInterMapKey = item.value;
	});

	return userInterMapKey;
}

function removeUserInterMapKey(userInterMapKey) {
    chrome.runtime.sendMessage({type: "removeRow", val: userInterMapKey});
}

//If tableRecord has rows it activates the toolBar
function activateToolbar() {
	var rowCount = getTableRowCount("tableRecord");
	if (rowCount > 0) {
		document.getElementById('playContainer').style.color = 'white';
	} else {
		document.getElementById('playContainer').style.color = '#4c4c4e';
	}
}

//Get table row count by id
function getTableRowCount(tableID) {
    return document.getElementById(tableID).getElementsByTagName("tbody")[0].rows.length
}