
chrome.storage.local.get("interactions", function(data) {
    if(typeof data.interactions != 'undefined') {
        document.getElementById("tableRecord").getElementsByTagName('tbody')[0].innerHTML += data.interactions;
    }
});

document.getElementById("clearAll").onclick = function () {
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