const LINE_THROUGH = "line-through";

function createListElement(listElement) {
    const node = document.createElement("li");
    const textNode = document.createTextNode(listElement.skillName +
        " (" + listElement.skillStatus + ")");

    node.appendChild(textNode);
    node.addEventListener("click", function() {
        const textDecoration = this.style.textDecoration;
        this.style.textDecoration = textDecoration === LINE_THROUGH ?
            "" : LINE_THROUGH;

        console.log("Clicked: ", this.innerText);
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                skillName: listElement.skillName,
                skillStatus: listElement.skillStatus
            });
        });
    });

    return node;
}

chrome.storage.sync.get("skillsList", function(data) {
    const skillList = data.skillsList;
    const skillListTag = document.getElementById("skillList");

    for (let i = 0; i < skillList.length; i++) {
        skillListTag.appendChild(createListElement(skillList[i]));
    }
});
