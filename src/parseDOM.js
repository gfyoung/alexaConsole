/**
 * Get the table element containing the Alexa skills.
 *
 * @returns {NodeListOf<Element>}
 */
function getSkillTable() {
    return document.getElementsByTagName("tbody");
}

/**
 * Wait until the DOM has fully loaded before parsing it.
 *
 * We have to use this somewhat hacky way of doing it because checking the
 * `readyState` of `document` doesn't consistently produce a DOM that has
 * an available table for extraction.
 */
function idleUntilDOMLoaded() {
    const matches = getSkillTable();

    // Check that there is at least one table
    // available before proceeding.
    if (matches.length === 0) {
        setTimeout(idleUntilDOMLoaded, TIMEOUT);
    } else {
        getSkills();
    }
}

/**
 * Extract the skill name for a row in the Alexa skill table.
 *
 * @param skillColumns - A row in the Alexa skill table.
 * @returns {string} - The skill name.
 */
function getSkillName(skillColumns) {
    const nameColumn = skillColumns.item(0);
    const nameSpan = nameColumn.children.item(0);
    const innerNameSpan = nameSpan.children.item(1);
    const hyperlink = innerNameSpan.children.item(0);
    const innerInnerNameSpan = hyperlink.children.item(0);

    return innerInnerNameSpan.innerText;
}

/**
 * Extract the skill status for a row in the Alexa skill table.
 *
 * Example statuses might be: "Live" or "In Development"
 *
 * @param skillColumns - A row in the Alexa skill table.
 * @returns {string} - The skill status.
 */
function getSkillStatus(skillColumns) {
    const statusColumn = skillColumns.item(skillColumns.length - 2);
    const innerSpan = statusColumn.children.item(0);
    return innerSpan.innerText;
}

/**
 * Generate an id that can be used for uniquely identifying table rows.
 *
 * @param name - The name of the skill.
 * @param status - The status of the skill.
 * @returns {string} - The unique ID for the table entry.
 */
function getIdFromNameAndStatus(name, status) {
    // Sanitize the name and status.
    name = name.replace(":", EMPTY);
    name = name.replace(SPACE, DASH);
    status = status.replace(SPACE, DASH);

    return name.toLowerCase() + DASH + status.toLowerCase();
}

/**
 * Extract the skills from the DOM and store them in local storage.
 */
function getSkills() {
    chrome.storage.sync.get(SKILLS_MAP, function(data) {
        let skillsMap = {};
        skillsMap = data.skillsMap || skillsMap;

        const skillsList = [];
        const skillTable = getSkillTable().item(0);
        const skillElements = skillTable.children;

        // Tag all rows with unique IDs.
        for (let i = 0; i < skillElements.length; i++) {
            const skillElement = skillElements.item(i);
            const skillColumns = skillElement.children;

            const skillName = getSkillName(skillColumns);
            const skillStatus = getSkillStatus(skillColumns);

            skillElement.id = getIdFromNameAndStatus(skillName, skillStatus);

            const displayValue = skillsMap[skillElement.id] || false;
            skillElement.style.display = displayValue ? INVISIBLE : EMPTY;

            skillsMap[skillElement.id] = displayValue;
            console.log(skillName + SPACE + skillStatus);
            skillsList.push({skillName, skillStatus, id: skillElement.id});
        }

        // Store extracted skills in local storage.
        chrome.storage.sync.set({skillsList, skillsMap});

        // Add message listener for when user wants to toggle visibility.
        chrome.runtime.onMessage.addListener(
            function(request, sender) {
                if (sender.tab) {
                    return;
                }

                const {skillName, skillStatus} = request;

                if (skillName === undefined || skillStatus === undefined) {
                    return;
                }

                // We are now (relatively) certain that we have
                // received a message from the extension with a
                // skill name and status fields.
                const elementId = getIdFromNameAndStatus(
                    skillName, skillStatus);
                const element = document.getElementById(elementId);

                // There is no element tagged with that ID.
                if (element === null) {
                    return;
                }

                chrome.storage.sync.get(SKILLS_MAP, function(data) {
                    // Toggle the visibility of the element.
                    const skillsMap = data.skillsMap;
                    const displayValue = !skillsMap[elementId];

                    element.style.display = displayValue ? INVISIBLE : EMPTY;
                    skillsMap[elementId] = displayValue;

                    chrome.storage.sync.set({skillsMap});
                });
            });
    });
}

idleUntilDOMLoaded();
