
var storage = chrome.storage.local;
var userInterMap = new Map();
var mapKey = 0;
var oldXpath = null;
var oldEvntType = null;
var oldTagName = null;

chrome.runtime.onMessage.addListener(
	    function(message, sender, sendResponse) {
	        switch(message.type) {
              case "isRecording":
              case "recName":
              case "startURL":
                updateLocalStorage(message.type, message.val);
                break;
	            case "setInteraction":
                updateUserIntMap(message);
	              break;
              case "cleanTable":
                clearMapAndStorage();
                break;
	            default:
	              console.error("Unrecognised message: ", message);
	        }
          sendResponse();
	    }
);

function updateUserIntMap(message) {
  storage.get("isRecording", function(result) {
    if (result.isRecording == true) {
      var tableRow = [message.xpath,
                  message.eventType,
                  (message.eventType == "keyup") ? rightVal(message) : message.val,
                  message.url];

      updateMap(message, tableRow);
      updateLocalStorage(message.type, mapToString());
    }
  });
}

function rightVal(message) {
  switch(message.keyCode) {
    case 9:
      return "TAB";
    case 13:
      return "ENTER";
    default:
      return message.val;
  }
}

function updateMap(message, tableRow) {
  var isSame = isSameElement(message);
  if (!isSame || mapKey === 0 || (isSame && (oldXpath === null))) {
    mapKey = mapKey + 1;
  }

  userInterMap.set(mapKey, tableRow);
}

function isSameElement(message) {
  if (isNullOrEqual(oldXpath, message.xpath[0]) && isNullOrEqual(oldEvntType, message.eventType) && isNullOrEqual(oldTagName, message.tagName) && !isTabEnter(message.keyCode)) {
    oldXpath = message.xpath[0];
    oldEvntType = message.eventType;
    oldTagName = message.tagName;
    return true;
  }

  oldXpath = null;
  oldEvntType = null;
  oldTagName = null;
  return false;
}

function isNullOrEqual(varOne, varTwo) {
  return varOne == null || varOne == varTwo;
}

function isTabEnter(keyCode) {
  if (9 == keyCode || 13 == keyCode) 
    return true;
  return false;
}

function mapToString() {
  let obj = {};
  userInterMap.forEach ((v,k) => { obj[k] = v });
  return JSON.stringify(obj);
}

function updateLocalStorage(key, value) {
  // Check that there's some valid value there.
  if(typeof value == 'undefined') {
    alert('Error: No value specified');
    return;
  }

  var storeObj= {};
  storeObj[key] = value;
  storage.get(key, function(result) {
    storage.set(storeObj);
  });
}

function clearMapAndStorage() {
  clearLocalStorage();
  userInterMap = new Map();
  mapKey = 0;
}

function clearLocalStorage() {
    storage.remove(["setInteraction"], function() {
      var error = chrome.runtime.lastError;
      if (error) {
        console.error(error);
      }
    });
}