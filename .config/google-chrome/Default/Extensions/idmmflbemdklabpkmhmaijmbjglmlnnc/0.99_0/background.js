// background.js

chrome.contextMenus.create({
    "title": "'%s' 고치기",
    "id": "menu1",
    "contexts": ["selection"],
});

// Recieve Message from extension.
chrome.contextMenus.onClicked.addListener(onClickHandler);

function onClickHandler(info, tab) {
    if (info.menuItemId == "menu1") {
        if (info.editable) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {txt:info.selectionText},function(response){
                });
            });
        }
        else alert("Not an editable field! ㅡㅡ");
    }
}


