var evnts = ["click","focus","blur","keyup"];
var oldEvent = [];
var inputVal;
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

        var element = e.srcElement;
        if (!element) {
          return;
        }

        var url = window.location.href;
        var xpath = getXpath(element);
        var aXpath = getAbsoluteXpath(element);
        var eventType = evt.type ? evt.type : evt;

        if (xpath && eventType) {
          if (!userIsTyping(element, url, xpath, aXpath, eventType)) {
            chrome.runtime.sendMessage({type: "setInteraction", url: url, xpath: [xpath, aXpath], eventType: eventType, val: inputVal});
          }
        }
    }
}

function userIsTyping(element, url, xpath, aXpath, eventType) {//Talvex não passar todos esses vars
  if ((oldEvent.length <= 0 || oldEvent[0] == element) && element.tagName == "INPUT") {
    oldEvent[0] = element;
    oldEvent[1] = url;
    oldEvent[2] = xpath;
    oldEvent[3] = aXpath;
    oldEvent[4] = eventType;
    oldEvent[5] = element.value;
    return true;
  } else if (oldEvent.length > 0) {
    alert("2- " + oldEvent[1]);
    chrome.runtime.sendMessage({type: "setInteraction", url: oldEvent[1], xpath: [oldEvent[2], oldEvent[3]], eventType: oldEvent[4], val: oldEvent[5]});
    oldEvent = [];
    return userIsTyping(element);
  }

  return false;
}

function getAbsoluteXpath(node, bits) {
  // uses cardinality.  Will not work if any nodes are added/moved/removed in the DOM.  Fine for static stuff.
  bits = bits ? bits : [];
  var c = 0;
  var b = node.nodeName;
  var p = node.parentNode;

  if (p) {
    var els = p.getElementsByTagName(b);
    if (els.length >  1) {
      while (els[c] !== node) c++;
      b += "[" + (c+1) + "]";
    }
    bits.push(b);
    return getAbsoluteXpath(p, bits);
  }
  
  //bits.push(b);  // this is #document.  Probably dont need it.
  return bits.reverse().join("/");
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