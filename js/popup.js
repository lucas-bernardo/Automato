var userInterMap = new Map();
chrome.storage.local.get("interactions", function(data) {
    if(typeof data.interactions != 'undefined') {
        //document.getElementById("tableRecord").getElementsByTagName('tbody')[0].innerHTML += data.interactions;
        var table = document.getElementById("tableRecord");
        var ar = data.interactions.split("(?<=\\G\\d+,\\d+,\\d+),");
        alert(ar[0]);
        
        for (var [key, value] of userInterMap.entries()) {
          alert(key + ' = ' + value);
          updateTable(table, key, value);
        }
    }
});

chrome.extension.getBackgroundPage().doMethod(function(userInterMap) {
  var table = document.getElementById("tableRecord");
  for (var [key, value] of userInterMap.entries()) {
    console.log(key + ' = ' + value);
    updateTable(table, key, value);
  }
});

function updateTable(table, key, value) {
  var row = table.insertRow(-1);
  key++;
  row.insertCell(0).innerHTML = createCombo(key) + createList(key, value[0]);
  key++;
  row.insertCell(1).innerHTML = createCombo(key) + createList(key, value[1]);
  row.insertCell(2).innerHTML = createInput(value[2]);
  row.insertCell(3).innerHTML = createIcon();
}

function createCombo(key) {
  var newCombo = document.createElement("input");
  newCombo.setAttribute('class', 'editableCombo');
  newCombo.setAttribute('type', 'text');
  newCombo.setAttribute('list', key);
}

function createList(key, array) {
  var dataList = document.createElement("datalist");
  dataList.setAttribute('id', key);
  //Creating combobox options
  for (i = 0; i < array.length; i++) {
    var option = document.createElement("option");
    option.setAttribute('value', array[i]);
    dataList.appendChild(option);
  }
}

function createInput(url) {
  var newInput = document.createElement("input");
  newInput.setAttribute('type', 'text');
  newInput.setAttribute('value', url);
}

function createIcon() {
  var newIcon = document.createElement("i");
  newIcon.setAttribute('class', 'material-icons');
  newIcon.setAttribute('value', 'clear');
}

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