const TIMEOUT = 1000;
const INVISIBLE = "none";

function getSkillTable() {
    return document.getElementsByTagName("tbody");
}

function idleUntilDOMLoaded() {
    const matches = getSkillTable();

    if (matches.length === 0) {
        setTimeout(idleUntilDOMLoaded, TIMEOUT);
    } else {
        getSkills();
    }
}

function getSkillName(skillColumns) {
    const nameColumn = skillColumns.item(0);
    const nameSpan = nameColumn.children.item(0);
    const innerNameSpan = nameSpan.children.item(1);
    const hyperlink = innerNameSpan.children.item(0);
    const innerInnerNameSpan = hyperlink.children.item(0);

    return innerInnerNameSpan.innerText;
}

function getSkillStatus(skillColumns) {
    const statusColumn = skillColumns.item(skillColumns.length - 2);
    const innerSpan = statusColumn.children.item(0);
    return innerSpan.innerText;
}

function getIdFromNameAndStatus(name, status) {
    name = name.replace(":", "");
    name = name.replace(" ", "-");
    status = status.replace(" ", "-");

    return name.toLowerCase() + "-" + status.toLowerCase();
}

function getSkills() {
    const skillsList = [];
    const skillTable = getSkillTable().item(0);
    const skillElements = skillTable.children;

    for (let i = 0; i < skillElements.length; i++) {
        const skillElement = skillElements.item(i);
        const skillColumns = skillElement.children;

        const skillName = getSkillName(skillColumns);
        const skillStatus = getSkillStatus(skillColumns);

        skillElement.id = getIdFromNameAndStatus(skillName, skillStatus);
        console.log(skillName + " " + skillStatus);
        skillsList.push({skillName, skillStatus});
    }

    chrome.storage.sync.set({skillsList});
    chrome.runtime.onMessage.addListener(
        function(request, sender) {
            if (sender.tab) {
                return;
            }

            const {skillName, skillStatus} = request;

            if (skillName === undefined || skillStatus === undefined) {
                return;
            }

            const elementId = getIdFromNameAndStatus(skillName, skillStatus);
            const element = document.getElementById(elementId);

            if (element === null) {
                return;
            }

            const displayValue = element.style.display;
            element.style.display = displayValue === INVISIBLE ? "" : INVISIBLE;
        });
}

idleUntilDOMLoaded();
