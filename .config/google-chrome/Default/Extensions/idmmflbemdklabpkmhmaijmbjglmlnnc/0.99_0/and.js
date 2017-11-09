// and.js

// Recieve Message from extension.
chrome.runtime.onMessage.addListener(function(request, sender) {
    translate(request.txt);
    });

// Translation functions.

function translate(toFix) {
    var fixed = translato(toFix);
    if (isAlpha(fixed)){
        alert("Your typo is so bad it is not even a valid typo, but we'll try to fix it as much as we can. \n \n Maybe your fingers are too fat?");
    }
    replace2(fixed);
}

function replace2(toReplace) {
    var element = document.activeElement;
    if(element.tagName === "INPUT"){
        element.value = toReplace;//changes text in input element to today's date
    }
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////     LIBRARIES & DRIVERS      //////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Unicode translation from English to Korean was taken from:
// http://www.phpschool.com/gnuboard4/bbs/board.php?bo_table=tipntech&wr_id=55742
// http://thdwlgnsdl10.blog.me/40063114545

// Possible keyboard inputs.

// First components of eumjul
var choSung = "r|R|s|e|E|f|a|q|Q|t|T|d|w|W|c|z|x|v|g"; 

// Middle vowels of eumjul.    
var joongSung = "hk|ho|hl|nj|np|nl|ml|k|o|i|O|j|p|u|P|h|y|n|b|m|l";

//Batchims!
var jongSung = "rt|sw|sg|fr|fa|fq|ft|fx|fv|fg|qt|r|R|s|e|f|a|q|t|T|d|w|c|z|x|v|g|"; 
 
             

// Converted (almost)Unicode values.
var choSungUni = { "r":0,"R":1,"s":2,"e":3,"E":4,"f":5,"a":6,"q":7,"Q":8,"t":9,
                   "T":10,"d":11,"w":12,"W":13,"c":14,"z":15,"x":16,"v":17,
                   "g":18 };
var joongSungUni = { "k":0,"o":1,"i":2,"O":3,"j":4,"p":5,"u":6,"P":7,"h":8,
                     "hk":9,"ho":10,"hl":11,"y":12,"n":13,"nj":14,"np":15,
                     "nl":16,"b":17,"m":18,"ml":19,"l":20 };
var jongSungUni = { "":0,"r":1,"R":2,"rt":3,"s":4,"sw":5,"sg":6,"e":7,"f":8,
                    "fr":9,"fa":10,"fq":11,"ft":12,"fx":13,"fv":14,"fg":15,
                    "a":16,"q":17,"qt":18,"t":19,"T":20,"d":21,"w":22,"c":23,
                    "z":24,"x":25,"v":26,"g":27 }; 

// Create a Regex expression to match the input string.
var jumbledEng = new RegExp("("+choSung+")"+"("+joongSung+")"+"(("+jongSung+")(?=("+choSung+")("+joongSung+"))|("+jongSung+"))","g");
                           // Find chosung.    Find joongsung.   Either we have a batchim followed by ch & j, or we have no batchim.
                
  
// "translaaahto".
function translato(tofix) { 
    correctKoreanString = tofix.replace(jumbledEng,

    // String replacement method learned from http://www.bennadel.com/blog/142-ask-ben-javascript-string-replace-method.htm
    function(all, cho, joong, jong){
        var kor = String.fromCharCode(44032 + choSungUni[cho]*21*28 + joongSungUni[joong]*28 + jongSungUni[jong]);
        return kor; 
    });
    return correctKoreanString;
}

function isAlpha(str) {
  return /^[a-zA-Z() ]+$/.test(str); 
}
