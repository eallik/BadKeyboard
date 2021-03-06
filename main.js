var startTime;
var badKeyCount = -1;//number of misplaced keys, -1 if game has not started.


// don't use uninitialized variables
var moves;
var keyDown = ''; // TODO: use `null` for special value not ''
var resultHighlights = '';//keys that have been highlighted in any way (green if wrong became right, red if right became wrong).

var letterPatt = /^[A-Z]{1}$/;
var keyboardStartY = 125;//TODO depends on how much space the table takes.
var bumps = '<span class="bump" style="left:215px;top:' + (keyboardStartY + 91) + 'px;">_</span>' +
    '<span class="bump" style="left:395px;top:' + (keyboardStartY + 91) + 'px;">_</span>';

function getChar(e) {
    // TODO: user ternary
    var keyNum;
    if (window.event) {// IE8 and earlier
	keyNum = e.keyCode;
    }
    else if (e.which) {// IE9/Firefox/Chrome/Opera/Safari
	keyNum = e.which;
    }
    return String.fromCharCode(keyNum).toUpperCase();
}
function keyPressed(e) {
    // TODO: only catch events for
    // alphabetic keypresses; everything
    // else, incl alphabetic with a
    // modifier key, should be ignored
    // if (e.altKey || e.ctrlKey || e.metaKey)
    //     return false;

    var keyNow = getChar(e);
    if (letterPatt.test(keyNow)) {
	if (badKeyCount === -1) {
	    scrambleAndStart();
	}
	if (keyDown === '') {
	    clearResultHighlights();
	    keyDown = keyNow;
	    document.getElementById(keyDown).setAttribute('class', 'key_down');
	} else if (keyNow === keyDown) {
	    document.getElementById(keyDown).setAttribute('class', 'key');
	    keyDown = '';
	} else {
	    var keyDownContent = document.getElementById(keyDown).innerHTML;
	    var keyNowContent = document.getElementById(keyNow).innerHTML;
	    highlightMoveResult(keyNow, keyNowContent, keyDownContent);
	    highlightMoveResult(keyDown, keyDownContent, keyNowContent);
	    document.getElementById(keyNow).innerHTML = keyDownContent;
	    document.getElementById(keyDown).innerHTML = keyNowContent;
	    keyDown = '';
	    ++moves;
	}
    }
    return false;
}
function clearResultHighlights() {
    for (i = 0; i < resultHighlights.length; ++i) {
	document
            .getElementById(resultHighlights.charAt(i))
            .setAttribute('class', 'key');
    }
}
function highlightMoveResult(key, content, otherContent) {
    if (otherContent === key) {
	--badKeyCount;
	resultHighlights += key;
	document.getElementById(key).setAttribute('class', 'key_correct');
    } else if (content === key) {
	++badKeyCount;
	resultHighlights += key;
	document.getElementById(key).setAttribute('class', 'key_wrong');
    } else {
	document.getElementById(key).setAttribute('class', 'key');
    }
}
function scrambleAndStart() {//neither scramble type no longer works with an odd number of keys.
    var sel = document.getElementById('scramble_select');
    var scramble_type = sel.options[sel.selectedIndex].text;
    if (scramble_type === 'single') {
	scrambleSingleKeys();
    } else if (scramble_type === 'pair') {
	scrambleKeyPairs();
    }
    badKeyCount = qwertyKeys.length;
    moves = 0;
    startTime = new Date().getTime();
    updateProgress();
}
function scrambleSingleKeys() {
    var leftKeys = qwertyKeys;
    var tmpKeys;
    var key;
    for (i = 0; i < qwertyKeys.length; ++i) {
	//tmpKeys is leftKeys except the correct qwertyKeys key
	tmpKeys = leftKeys.replace(qwertyKeys.charAt(i), '');
	//bad key for qwertyKeys.charAt(i) is selected from among tmpKeys
	key = tmpKeys.charAt(Math.floor(Math.random() * tmpKeys.length));
	//selected key is removed from among leftKeys
	leftKeys = leftKeys.replace(key, '');
	document.getElementById(key).innerHTML = qwertyKeys.charAt(i);
    }
}
function scrambleKeyPairs() {
    var leftKeys = qwertyKeys;
    var key1;
    var key2;
    while (leftKeys.length > 0) {
	key1 = leftKeys.charAt(Math.floor(Math.random() * leftKeys.length));
	leftKeys = leftKeys.replace(key1, '');
	key2 = leftKeys.charAt(Math.floor(Math.random() * leftKeys.length));
	leftKeys = leftKeys.replace(key2, '');
	document.getElementById(key1).innerHTML = key2;
	document.getElementById(key2).innerHTML = key1;
    }
}
function updateProgress() {
    var time = new Date().getTime() - startTime;//seems to work ok even when time passes midnight.
    var sec = Math.floor(time % 60000 / 1000);
    var min = Math.floor((time - sec * 1000) / 60000);
    if (sec < 10) {
	sec = '0' + sec;
    }
    if (badKeyCount === -1) {
	clearResultHighlights();
	document.getElementById('progress').innerHTML = 'Press a letter key on keyboard to start a new game.';
	return;
    } else if (badKeyCount === 0) {
	clearResultHighlights();
	document.getElementById("progress").innerHTML = 'Excellent! Arranging keys took ' + min + ':' + sec + ' and ' + moves +
	    ' moves.<br/>Press a letter key on keyboard to start a new game.';
	badKeyCount = -1;
	return;
    }
    document.getElementById("progress").innerHTML = 'Time: ' + min + ':' + sec + '; misplaced: ' + badKeyCount + "; moves: " + moves + ';';
    setTimeout('updateProgress()', 100);//this supicious looking line just calls the function once, no need to panic. 
}
function createKey(lineNum, lineKeyNum, key) {
    var lineStartX =
        lineNum === 0 ? 20 :
        lineNum === 1 ? 35 :
        5;

    return '<span id="' + key + '" class="key" style="left:' +
	(lineStartX + lineKeyNum * 60) + 'px;top:' + (keyboardStartY + lineNum * 65) +
	'px;">' + key + '</span>';
}

// TODO: get rid of these and replace by KEYBOARDS["qwerty"].allKeys etc
var qwertyKeys = 'QWERTYUIOPASDFGHJKLZXCVBNM';
var dvorakKeys = 'PYFGCRLAOEUIDHTNSQJKXBMWVZ';
var colemakKeys = 'QWFPGJLUYARSTDHNEIOZXCVBKM';

var KEYBOARDS = {
    "qwerty" : { layout: [{numKeys: 10, offset: 0}, {numKeys:  9, offset: 0}, {numKeys: 7, offset: 1}],
                 allKeys: qwertyKeys },
    "dvorak" : { layout: [{numKeys:  7, offset: 3}, {numKeys: 10, offset: 0}, {numKeys: 9, offset: 2}],
                 allKeys: dvorakKeys },
    "colemak": { layout: [{numKeys:  9, offset: 0}, {numKeys: 10, offset: 0}, {numKeys: 7, offset: 1}],
                 allKeys: colemakKeys },
}

function numKeysBeforeRow(rowNum, numKeysOnRow) {
    var ret = 0;
    for (var i = 0; i < rowNum; ++i)
        ret += numKeysOnRow[i];
    return ret;
}

function setKb(kbName) {
    var keyboard = KEYBOARDS[kbName];

    var numKeysOnRow = keyboard.layout.map(function(x) { return x.numKeys; });
    var rowOffsets   = keyboard.layout.map(function(x) { return x.offset ; });
    var allKeys      = keyboard.allKeys;

    var kbrd = '';
    for (var i = 0; i < numKeysOnRow[0]; ++i)
	kbrd += createKey(0, i + rowOffsets[0], allKeys.charAt(i + numKeysBeforeRow(0, numKeysOnRow)));
    for (var i = 0; i < numKeysOnRow[1]; ++i)
	kbrd += createKey(1, i + rowOffsets[1], allKeys.charAt(i + numKeysBeforeRow(1, numKeysOnRow)));
    for (var i = 0; i < numKeysOnRow[2]; ++i)
	kbrd += createKey(2, i + rowOffsets[2], allKeys.charAt(i + numKeysBeforeRow(2, numKeysOnRow)));
    kbrd += bumps;
    document.getElementById('keyboard').innerHTML = kbrd;
}
function setQwerty()  { setKb("qwerty" ); }
function setDvorak()  { setKb("dvorak" ); }
function setColemak() { setKb("colemak"); }

function setKeyboard() {
    keyDown = '';
    var sel = document.getElementById('keyboard_select');
    var kbrdLabel = sel.options[sel.selectedIndex].text;
    var kbrdName = kbrdLabel.toLowerCase();
    setKb(kbrdName);
    badKeyCount = -1;
}
