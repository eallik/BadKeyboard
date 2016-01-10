var startTime;
var badKeyCount = -1;//number of misplaced keys, -1 if game has not started.


// don't use uninitialized variables
var moves;
var keyDown = null;
var resultHighlights = '';//keys that have been highlighted in any way (green if wrong became right, red if right became wrong).

var letterPatt = /^[A-Z]{1}$/;
var qwertyKeys = 'QWERTYUIOPASDFGHJKLZXCVBNM';
var dvorakKeys = 'PYFGCRLAOEUIDHTNSQJKXBMWVZ';
var colemakKeys = 'QWFPGJLUYARSTDHNEIOZXCVBKM';
var keyboardStartY = 125;//TODO depends on how much space the table takes.
var bumps = '<span class="bump" style="left:215px;top:' + (keyboardStartY + 91) + 'px;">_</span>' +
    '<span class="bump" style="left:395px;top:' + (keyboardStartY + 91) + 'px;">_</span>';

function getChar(e) {
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
    var keyNow = getChar(e);
    if (letterPatt.test(keyNow)) {
	if (badKeyCount === -1) {
	    scrambleAndStart();
	}
	if (keyDown === null) {
	    clearResultHighlights();
	    keyDown = keyNow;
	    document.getElementById(keyDown).setAttribute('class', 'key_down');
	} else if (keyNow === keyDown) {
	    document.getElementById(keyDown).setAttribute('class', 'key');
	    keyDown = null;
	} else {
	    var keyDownContent = document.getElementById(keyDown).innerHTML;
	    var keyNowContent = document.getElementById(keyNow).innerHTML;
	    highlightMoveResult(keyNow, keyNowContent, keyDownContent);
	    highlightMoveResult(keyDown, keyDownContent, keyNowContent);
	    document.getElementById(keyNow).innerHTML = keyDownContent;
	    document.getElementById(keyDown).innerHTML = keyNowContent;
	    keyDown = null;
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
function setQwerty() {
    var kbrd = '';
    for (var i = 0; i < 10; ++i) {
	kbrd += createKey(0, i, qwertyKeys.charAt(i));
    }
    for (var i = 0; i < 9; ++i) {
	kbrd += createKey(1, i, qwertyKeys.charAt(i + 10));
    }
    for (var i = 0; i < 7; ++i) {
	kbrd += createKey(2, i + 1, qwertyKeys.charAt(i + 19));
    }
    kbrd += bumps;
    document.getElementById('keyboard').innerHTML = kbrd;
}
function setDvorak() {
    var kbrd = '';
    for (var i = 0; i < 7; ++i) {
	kbrd += createKey(0,  i + 3, dvorakKeys.charAt(i));
    }
    for (var i = 0; i < 10; ++i) {
	kbrd += createKey(1, i, dvorakKeys.charAt(i + 7));
    }
    for (var i = 0; i < 9; ++i) {
	kbrd += createKey(2, i + 2, dvorakKeys.charAt(i + 17));
    }
    kbrd += bumps;
    document.getElementById('keyboard').innerHTML = kbrd;
}
function setColemak() {
    var kbrd = '';
    for (var i = 0; i < 9; ++i) {
	kbrd += createKey(0, i, colemakKeys.charAt(i));
    }
    for (var i = 0; i < 10; ++i) {
	kbrd += createKey(1, i, colemakKeys.charAt(i + 9));
    }
    for (var i = 0; i < 7; ++i) {
	kbrd += createKey(2, i + 1, colemakKeys.charAt(i + 19));
    }
    kbrd += bumps;
    document.getElementById('keyboard').innerHTML = kbrd;
}
function setKeyboard() {
    keyDown = '';
    var sel = document.getElementById('keyboard_select');
    var kbrd = sel.options[sel.selectedIndex].text;
    if (kbrd === "QWERTY") {
	setQwerty();
    } else if (kbrd === "Dvorak") {
	setDvorak();
    } else if (kbrd === "Colemak") {
	setColemak();
    }
    badKeyCount = -1;
}
