
/*----------------------------------------------------- Recorder -----------------------------------------------------*/

var evnts = ["click", "drag", "drop", "resize", "scroll","keyup"];//,"blur","focus"
var oldEvent = [];
var oldXOffset = window.pageXOffset;
var oldYOffset = window.pageYOffset;
// Adding events to be caught
for(var i=0;i<evnts.length;i++){
    window.addEventListener(""+evnts[i]+"", function(e){ getUserAction(e); }, true);
}
//Adding refresh event listener(it is getting refresh and navigate, cus it gets the event of unload current page)
//Maybe store current URL and check if its a refresh or navigation and if wasnt another event
//Check if there is an event when refresh ends
window.onbeforeunload = function(e) {
  var url = window.location.href;
  chrome.runtime.sendMessage({type: "setInteraction", keyCode: "", tagName: "", url: url, xpath: ["Browser"], eventType: "Refresh/Navigate", val: url});
};

function getUserAction(e) {
    var evt = e || window.event;

    if (evt) {

      if (evt.isPropagationStopped && evt.isPropagationStopped()) {
          return;
      }

      var element = e.srcElement;
      if (!element) {
        return;
      }

      var keyCode = (e.keyCode ? e.keyCode : e.which);
      var tagName = element.tagName;
      var url = window.location.href;
      var xpath = getXpath(element);
      var aXpath = getAbsoluteXpath(element);
      var xpathArray = [xpath, aXpath];
      var eventType = evt.type ? evt.type : evt;
      var inputVal = element.value;

      if (eventType == "scroll") {
        var newXOffset = window.pageXOffset;
        var newYOffset = window.pageYOffset;
        if (isScrollValid(newXOffset, newYOffset)) {
          eventType = eventType + " " + getScrollDirection(newXOffset, newYOffset);
          inputVal = isXScroll(newXOffset) ? newXOffset : newYOffset;
          xpathArray = ["HTML/BODY"];
          setOldOffSets(newXOffset, newYOffset);
        } else {
          //In case it detects a scroll but the action occurs on an element
          eventType = null;
        }
      }

      if (xpathArray[0] && eventType) {
        chrome.runtime.sendMessage({type: "setInteraction", keyCode: keyCode, tagName: tagName, url: url, xpath: xpathArray, eventType: eventType, val: inputVal});
      }
    }
}
//get selected text if any, use after mouse up
function getSelectedText() {
    if (window.getSelection) {
        return window.getSelection().toString();
    } else if (document.selection) {
        return document.selection.createRange().text;
    }
    return '';
}

function isScrollValid(newXOffset, newYOffset) {
  return newXOffset != oldXOffset || newYOffset != oldYOffset;
}

function getScrollDirection(newXOffset, newYOffset) {
  if (newXOffset > oldXOffset) {
    return "Right";
  }
  if (newXOffset < oldXOffset) {
    return "Left";
  }
  if (newYOffset > oldYOffset) {
    return "Down";
  }

  return "Up";
}

function isXScroll(newXOffset) {
  return newXOffset != oldXOffset;
}

function setOldOffSets(newXOffset, newYOffset) {
  oldXOffset = newXOffset;
  oldYOffset = newYOffset;
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
  if (attrs == undefined) {
    return;
  }
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

/*----------------------------------------------------- Playback -----------------------------------------------------*/

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    var msgMap = msg.map;
    if (msgMap) {
      var userInterMap = JSON.parse(msgMap);
      Object.keys(userInterMap).map(function(key, index) {
        var value = userInterMap[key];
        generateEvent(getElementByXpath(value[0][0]), value[1], value[2]);
      });
    }
});

//find element by xpath
function getElementByXpath(path) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function generateEvent(element, eventName, value) {
  var options = extend(defaultOptions, arguments[2] || {});
  var oEvent, eventType = null;

  for (var name in eventMatchers) {
      if (eventMatchers[name].test(eventName)) {
          eventType = name;
          break;
      }
  }

  if (!eventType)
      throw new SyntaxError(eventName + ' - Only HTMLEvents and MouseEvents interfaces are supported - ' + eventType);

  oEvent = document.createEvent(eventType);
  switch (eventType) {
    case 'HTMLEvents':
      //if value is not undefined write it on the element 
      if (value) {
        element.value = value;
        oEvent.initEvent("change", false, true);
      } else {
        oEvent.initEvent(eventName, options.bubbles, options.cancelable);
      }
      break;
    case 'MouseEvents':
      oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
      options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
      options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
      break;
    case 'KeyboardEvents':
      fireKey(element,'a');
      break;
  }

  var cancelled = !element.dispatchEvent(oEvent);
  if (cancelled) {
    // A handler called preventDefault.
    console.log("cancelled");
  } else {
    // None of the handlers called preventDefault.
    console.log("not cancelled");
  }

  return element;
}

function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
}

var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll|keydown|keyup|keypress)$/,
    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
}

var defaultOptions = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
}

function fireKey(el,key) {
  var keyCode = key.charCodeAt(0);
  if(document.createEventObject) {
      var eventObj = document.createEventObject();
      eventObj.keyCode = keyCode;
      el.fireEvent("onkeydown", eventObj);
      eventObj.keyCode = keyCode;   
  }else if(document.createEvent)
  {
      var eventObj = document.createEvent("Events");
      eventObj.initEvent("keydown", true, true);
      eventObj.which = keyCode; 
      eventObj.keyCode = keyCode;
      el.dispatchEvent(eventObj);
  }
} 