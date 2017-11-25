
var userInterMap = new Map();
var mapKey = 1;

chrome.runtime.onMessage.addListener(
	    function(message, sender, sendResponse) {
	        switch(message.type) {
	            case "setInteraction":
                  updateUserIntMap(message);
	              break;
              case "isRecording":
                updateIsRecording(message.rec);
	            default:
	              console.error("Unrecognised message: ", message);
	        }
          sendResponse();
	    }
);

function updateUserIntMap(message) {
  chrome.storage.local.get("isRecording", function(result) {
    if (result.isRecording == true) {
      var tableRow = [[message.xpath, message.xpath].join("&&"),
                  message.eventType,
                  message.url];
      userInterMap.set(mapKey, tableRow);
      mapKey++;
      updateInteractions(mapToString());
    }
  });
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