
var userInterMap = new Map();
var mapKey = 0;

chrome.runtime.onMessage.addListener(
	    function(message, sender, sendResponse) {
	        switch(message.type) {
	            case "setInteraction":
                updateUserIntMap(message);
                  //listId = listId + 1;
                  //var tableRow = "<tr><td><input class=\"editableCombo\" type=text list=" + listId + "><datalist id=" + listId + "><select><option>" + message.xpath + "</select></datalist></td>"
                   // + "<td><input class=\"editableCombo\" type=text list=" + listId + "><datalist id=" + listId + "><select><option>" + message.eventType + "</select></datalist></td>"
                   // + "<td><input type=text value=\"" + message.url + "\"></td>"
                  //  + "<td><i class=\"material-icons\">clear</i></td>"
                 //   + "</tr>";

    
                 updateInteractions(mapToString());
	                break;
	            default:
	                console.error("Unrecognised message: ", message);
	        }
          sendResponse();
	    }
);

function updateUserIntMap(message) {
  var locatorArray = [message.xpath];
  var actionArray = [message.eventType];
  var tableRow = [locatorArray, actionArray, message.url];
  userInterMap.set(mapKey, tableRow);
  mapKey = mapKey + 2;
}

function mapToString() {
  let obj = {};
  userInterMap.forEach ((v,k) => { obj[k] = v });
  return JSON.stringify(obj);
}

function updateInteractions(newInteraction) {
  // Check that there's some code there.
  if (!newInteraction) {
    alert('Error: No value specified');
    return;
  }

  chrome.storage.local.get(["interactions"], function(result) {
    chrome.storage.local.set({interactions: newInteraction});
  });
}