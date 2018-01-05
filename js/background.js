
var userInterMap = new Map();
var mapKey = 0;
var oldXpath = null;

chrome.runtime.onMessage.addListener(
	    function(message, sender, sendResponse) {
	        switch(message.type) {
	            case "setInteraction":
                updateUserIntMap(message);
	              break;
              case "isRecording":
                updateIsRecording(message.rec);
                updateStartURL(message.url);
                break;
              case "newURL":
                updateStartURL(message.url);
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
  chrome.storage.local.get("isRecording", function(result) {
    if (result.isRecording == true) {
      var tableRow = [message.xpath,
                  message.eventType,
                  rightVal(message),
                  message.url];

      updateMap(message, tableRow, (oldXpath === null));
      updateInteractions(mapToString());
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

function updateMap(message, tableRow, isOldNull) {
  var isTyping = isUserTyping(message);
  if (!isTyping || mapKey === 0 || (isTyping && isOldNull)) {
    mapKey = mapKey + 1;
  }

  userInterMap.set(mapKey, tableRow);
}

function isUserTyping(message) {
  if ((oldXpath === null || oldXpath == message.xpath[0]) && message.eventType == "keyup" && message.tagName == "INPUT" && !isTabEnter(message.keyCode)) {
    oldXpath = message.xpath[0];
    return true;
  }

  oldXpath = null;
  return false;
}

function isTabEnter(keyCode) {
  if (keyCode == 9 || keyCode == 13) 
    return true;
  return false;
}

function mapToString() {
  let obj = {};
  userInterMap.forEach ((v,k) => { obj[k] = v });
  return JSON.stringify(obj);
}

function updateInteractions(value) {
  // Check that there's some code there.
  if(typeof value == 'undefined') {
    alert('Error: No value specified');
    return;
  }

  chrome.storage.local.get("interactions", function(result) {
    chrome.storage.local.set({interactions: value});
  });
}

function updateIsRecording(value) {
  // Check that there's some valid value there.
  if(typeof value == 'undefined') {
    alert('Error: No value specified');
    return;
  }

  chrome.storage.local.get("isRecording", function(result) {
    chrome.storage.local.set({isRecording: value});
  });
}

function updateStartURL(value) {
  // Check that there's some valid value there.
  if(typeof value == 'undefined') {
    alert('Error: No value specified');
    return;
  }

  chrome.storage.local.get("startURL", function(result) {
    chrome.storage.local.set({startURL: value});
  });
}

function clearMapAndStorage() {
  clearLocalStorage();
  userInterMap = new Map();
  mapKey = 1;
}

function clearLocalStorage() {
    chrome.storage.local.remove(["interactions"], function() {
      var error = chrome.runtime.lastError;
      if (error) {
        console.error(error);
      }
    });
}