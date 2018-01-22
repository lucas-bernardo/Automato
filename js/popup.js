var storage = chrome.storage.local;

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
        activateToolbar(table);
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

  return newIcon;
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
    activateToolbar(document.getElementById("tableRecord"));
};

function clearTable() {
	var old_tbody = document.getElementById("tableRecord").getElementsByTagName('tbody')[0];
	var new_tbody = document.createElement('tbody');
	old_tbody.parentNode.replaceChild(new_tbody, old_tbody)
}

//Remove tableRecord row
document.querySelector('#tableRecord').onclick = function(event) {
   	var userInterMapKey = deleteRowAndGetMapKey(event, this);
   	removeUserInterMapKey(userInterMapKey);
   	activateToolbar(this);
}

function removeUserInterMapKey(userInterMapKey) {
	chrome.runtime.sendMessage({type: "removeRow", val: userInterMapKey});
}

//Remove tablePlayback row
document.querySelector('#tablePlayback').onclick = function(event) {
   deleteRowAndGetMapKey(event, this);
}

function deleteRowAndGetMapKey(event, table) {
   var element = event.srcElement;
   if ("material-icons" == element.className) {
   	var rIndex = element.parentElement.parentElement.rowIndex;
   	var userInterMapKey = getUserInterMapKeyByCellInputListAttr(table.rows[rIndex].cells[0].childNodes[0].attributes);
   	table.deleteRow(rIndex);
   	return userInterMapKey;
   }
}

function getUserInterMapKeyByCellInputListAttr(cellAttrs) {
	var userInterMapKey = -1;
	Array.prototype.slice.call(cellAttrs).forEach(function(item) {
		if ("list" == item.name)
			userInterMapKey = item.value;
	});

	return userInterMapKey;
}

//If tableRecord has rows it activates the toolBar
function activateToolbar(table) {
	var rowCount = table.getElementsByTagName("tbody")[0].rows.length
	if (rowCount > 0) {
		document.getElementById('playContainer').style.color = 'white';
	} else {
		document.getElementById('playContainer').style.color = '#4c4c4e';
	}
}