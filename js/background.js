var listId = 0;
chrome.runtime.onMessage.addListener(
	    function(message, sender, sendResponse) {
	        switch(message.type) {
	            case "setInteraction":
                  listId = listId + 1;
                  var tableRow = "<tr><td>10</td>"
                    + "<td><input class=\"editableCombo\" type=text list=" + listId + "><datalist id=" + listId + "><select><option>" + message.xpath + "</select></datalist></td>"
                    + "<td><input class=\"editableCombo\" type=text list=" + listId + "><datalist id=" + listId + "><select><option>" + message.eventType + "</select></datalist></td>"
                    + "<td><input type=text value=\"" + message.url + "\"></td>"
                    + "<td><i class=\"material-icons\">clear</i></td>"
                    + "</tr>";
                  updateInteractions(tableRow);
	                break;
	            default:
	                console.error("Unrecognised message: ", message);
	        }
	    }
);

function updateInteractions(newInteraction) {
  // Check that there's some code there.
  if (!newInteraction) {
    alert('Error: No value specified');
    return;
  }

  chrome.storage.local.get(["interactions"], function(result) {
    var interactions = "";
    if (typeof result.interactions == 'undefined') {
      interactions = newInteraction;
    } else {
      interactions = result.interactions + newInteraction;
    }

    chrome.storage.local.set({interactions: interactions});
  });
}