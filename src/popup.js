const LINE_THROUGH = "line-through";

/**
 * Create an <li> element for display in the popup.
 *
 * @param listElement - Configuration for the new list element. Includes
 *                      a skill name and a skill status.
 * @returns {HTMLElement} - The newly created list element.
 */
function createListElement(listElement) {
    // Create the node with the associated text.
    const node = document.createElement("li");
    const textNode = document.createTextNode(listElement.skillName +
        " (" + listElement.skillStatus + ")");

    // Add event listener to toggle the visibility of the table row
    // in the Alexa developer console DOM. Also toggles line through
    // decoration of the list element in the popup.
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

    // Extract skills from local storage and append to list.
    for (let i = 0; i < skillList.length; i++) {
        skillListTag.appendChild(createListElement(skillList[i]));
    }
});
