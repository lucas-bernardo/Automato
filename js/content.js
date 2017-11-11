var evnts=["click","focus","blur","keyup","keydown","keypressed"];
// You can also Use mouseup/down, mousemove, resize and scroll
for(var i=0;i<evnts.length;i++){
    window.addEventListener(""+evnts[i]+"", function(e){ myFunction(e); }, false);
}

function myFunction(e) {
    var evt = e || window.event;

    if (evt) {

        if (evt.isPropagationStopped && evt.isPropagationStopped()) {
            return;
        }

        var url = window.location.href;
        var xpath = getXpath(e.srcElement);
        var eventType = evt.type ? evt.type : evt;

        if (xpath) {
          console.log(xpath);
          chrome.runtime.sendMessage({type: "setInteraction", url: url, xpath: xpath, eventType: eventType});          
        }
    }
}

function getXpath(node) {

  if (node == window) {
    return;
  }

  var attrs = node.attributes;
  var i = attrs.length;
  var tagName = node.tagName;
  var map = {};
  var j = 0;
  var val = '';
  var count = 0;

  // no attributes
  if (i == 0) {

    var text = node.innerHTML;
    if ((text.length > 0) && (!text.includes("<")) && (text.indexOf('\'') == -1) && (text.indexOf('"') == -1)) {
      val = "//" + tagName + "[text()='" + text + "']";
      count = getXpathCount(val);

      if (count == 1) {
        return val;
      }

      if (count > 1) {
        val = findXpathWithIndex(val, node);
        return val;
      } else {
        return findXpathWithIndex("//" + node.tagName, node);
      }

    } else {
      return findXpathWithIndex("//" + node.tagName, node);
    }

  } // end if i==0

  var realCount = 0;
  while (j < i) {
    attr = attrs[j];

    if ((attr.name != "style") && (attr.value.indexOf('\'') < 0)) {
      map[attr.name] = attr.value;
      realCount++;
    }

    j++;
  }

  var attrLength = j;

  if (realCount == 0) {// undefined case
    var xp = findXpathWithIndex("//" + node.tagName,node);
    return xp;
  }// end of realCount==0

  // Since Id going to be unique , no need to check further attributes

  if (isNotEmpty(map['id'])) {
    val = "//" + tagName + "[@id='" + map['id'] + "']";
    return val;
  }

  // find which attribute combination gives the xpath count 1

  for ( var attribute in map) {

    if (map.hasOwnProperty(attribute)) {
      val = "//" + tagName + "[@" + attribute + "='" + map[attribute] + "']";

      var text = node.innerHTML;
      if ((text.length > 0) && (!text.includes("<")) && (text.indexOf('\'') == -1) && (text.indexOf('"') == -1)) {
        val = val + "[text()='" + text + "']";
      }

      count = getXpathCount(val);

      if (count == 1) {
        return val;
      }

      if (count > 1) {
        val = findXpathWithIndex(val, node);
        return val;
      } else {
        return "No Unique Identifiers found";
      }
    }
  }
}

function getXpathCount(val) {
  var nodes = document.evaluate(val, document, null, XPathResult.ANY_TYPE, null);
  var results = [], nodex;

  while (nodex = nodes.iterateNext()) {
    results.push(nodex);
  }

  return results.length;
}

function findXpathWithIndex(val, node) {
  var nodes = document.evaluate(val, document, null, XPathResult.ANY_TYPE, null);
  var results = [], nodex;
  var index = 0;

  while (nodex = nodes.iterateNext()) {
    index++;

    if (nodex.isSameNode(node)) {
      return "(" + val + ")[" + index + "]";
    }
  }
}

function isNotEmpty(val) {
  return (val === undefined || val == null || val.length <= 0) ? false : true;
}