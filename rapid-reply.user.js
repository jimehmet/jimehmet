// ==UserScript==
// @name         Rapid Reply
// @namespace    http://tampermonkey.net/
// @version      1
// @description  An assistant for correspondence.
// @author       jimehmet
// @match        *://*/*
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_getValue
// @updateURL    https://github.com/jimehmet/jimehmet/edit/main/rapid-reply.user.js
// ==/UserScript==



// Hello, noble visitor!

// I am jimehmet, the humble developer who crafted this code fortress. If thou hast questions or seek clarifications,
// do not hesitate to send a raven through the realm of communication.

// To chime me in a swift manner, thou may use the following coordinates:
// Carrier Pigeon: @jimehmet
// Electronic Scroll: jimehmet@amazon.pl

// I shall await thine missive with great anticipation.



(function () {
    'use strict';

    // Team-specific templates and team selection
    const teams = {
        "GDN Scoping Team": {
            templates: {
                "GDN node first reply": `Hi,
GDN scoping team looking into this request and will update the subtask for next steps.

Regards,
Your Name`,
                // Add more templates as needed
            }
        },
        // Add more teams as needed
    };

    // Default team selection
    let selectedTeam = "GDN Scoping Team";

    let templates = teams[selectedTeam].templates;

    // Function to load templates dynamically
    function loadTemplates() {
        GM_xmlhttpRequest({
            method: "GET",
            url: "URL_TO_TEMPLATES_JSON_FILE",
            onload: function(response) {
                const data = JSON.parse(response.responseText);
                teams[selectedTeam].templates = data[selectedTeam].templates;
                templates = teams[selectedTeam].templates;
                alert("Templates updated successfully!");
            }
        });
    }

    let copyHistory = GM_getValue('copyHistory', []);

    function copyToClipboard(text, isTemplate = true) {
        const currentTime = new Date().toLocaleTimeString();
        GM_setClipboard(text);
        const copyRecord = {
            content: isTemplate ? `Template: ${text}` : `User Copy: ${text}`,
            time: currentTime,
        };
        copyHistory.push(copyRecord);
        if (copyHistory.length > 25) {
            copyHistory.shift();
        }
        GM_setValue('copyHistory', copyHistory);
    }

    function saveTemplates() {
        GM_setValue('templates', templates);
    }

    function updateTemplateDropdown(dropdown) {
        dropdown.innerHTML = `<option value="">Select Template...</option>`;
        for (const templateName in templates) {
            dropdown.innerHTML += `<option value="${templateName}">${templateName}</option>`;
        }
    }

    function createNotification(message) {
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.top = '50%';
        notification.style.left = '50%';
        notification.style.transform = 'translate(-50%, -50%)';
        notification.style.background = '#fff';
        notification.style.padding = '20px';
        notification.style.border = '1px solid #ccc';
        notification.style.zIndex = '9999';

        const text = document.createElement('p');
        text.textContent = message;

        const okBtn = document.createElement('button');
        okBtn.textContent = 'OK';
        okBtn.addEventListener('click', function () {
            notification.remove();
        });

        notification.appendChild(text);
        notification.appendChild(okBtn);
        document.body.appendChild(notification);
    }

    function editTemplates(menu) {
        menu.remove();
        const editUI = document.createElement('div');
        editUI.style.position = 'fixed';
        editUI.style.top = '50%';
        editUI.style.left = '50%';
        editUI.style.transform = 'translate(-50%, -50%)';
        editUI.style.background = '#fff';
        editUI.style.padding = '20px';
        editUI.style.border = '1px solid #ccc';
        editUI.style.zIndex = '9999';

        const templateSelect = document.createElement('select');
        updateTemplateDropdown(templateSelect);

        const newTemplateOption = document.createElement('option');
        newTemplateOption.value = 'new_template';
        newTemplateOption.textContent = 'New Template';
        templateSelect.appendChild(newTemplateOption);

        const textarea = document.createElement('textarea');
        textarea.style.width = '100%';
        textarea.style.height = '200px';

        const loadTemplateBtn = document.createElement('button');
        loadTemplateBtn.textContent = 'Load Template';
        loadTemplateBtn.addEventListener('click', function () {
            const selectedTemplate = templateSelect.value;
            if (selectedTemplate === 'new_template') {
                textarea.value = '';
            } else if (selectedTemplate) {
                textarea.value = templates[selectedTemplate];
            }
        });

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save Changes';
        saveBtn.addEventListener('click', function () {
            try {
                const editedTemplate = textarea.value;
                const selectedTemplate = templateSelect.value;

                if (selectedTemplate === 'new_template') {
                    const newTemplateName = prompt('Enter a name for the new template:');
                    if (newTemplateName) {
                        templates[newTemplateName] = editedTemplate;
                        alert('will remember that! ');
                    } else {
                        alert('Please enter a name for the new template.');
                        return;
                    }
                } else {
                    templates[selectedTemplate] = editedTemplate;
                    alert('Changes saved successfully!');
                }

                updateTemplateDropdown(templateSelect);
                saveTemplates();
            } catch (error) {
                alert('Error saving changes.');
            }
            editUI.remove();
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete Template';
        deleteBtn.addEventListener('click', function () {
            const selectedTemplate = templateSelect.value;
            if (selectedTemplate && confirm(`Are you sure you want to delete the template "${selectedTemplate}"?`)) {
                delete templates[selectedTemplate];
                updateTemplateDropdown(templateSelect);
                saveTemplates();
                alert(`Template "${selectedTemplate}" deleted successfully!`);
                editUI.remove();
            }
        });

        const backBtn = document.createElement('button');
        backBtn.textContent = 'Back';
        backBtn.addEventListener('click', function () {
            editUI.remove();
        });

        editUI.appendChild(templateSelect);
        editUI.appendChild(document.createElement('br'));
        editUI.appendChild(textarea);
        editUI.appendChild(document.createElement('br'));
        editUI.appendChild(loadTemplateBtn);
        editUI.appendChild(saveBtn);
        editUI.appendChild(deleteBtn);
        editUI.appendChild(backBtn);
        document.body.appendChild(editUI);
    }

    function showCopyHistory(menu) {
        const historyUI = document.createElement('div');
        historyUI.style.position = 'fixed';
        historyUI.style.top = '50%';
        historyUI.style.left = '50%';
        historyUI.style.transform = 'translate(-50%, -50%)';
        historyUI.style.background = '#fff';
        historyUI.style.padding = '20px';
        historyUI.style.border = '1px solid #ccc';
        historyUI.style.zIndex = '9999';

        const historyList = document.createElement('ul');
        historyList.style.listStyleType = 'none';
        historyList.style.padding = '0';

        copyHistory.forEach((record, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${record.content} - ${record.time}`;
            historyList.appendChild(listItem);
        });

        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear History';
        clearBtn.addEventListener('click', function () {
            copyHistory = [];
            GM_setValue('copyHistory', copyHistory);
            historyList.innerHTML = '';
        });

        const backBtn = document.createElement('button');
        backBtn.textContent = 'Back';
        backBtn.addEventListener('click', function () {
            historyUI.remove();
        });

        historyUI.appendChild(historyList);
        historyUI.appendChild(document.createElement('br'));
        historyUI.appendChild(clearBtn);
        historyUI.appendChild(backBtn);
        document.body.appendChild(historyUI);
    }

    function saveChanges(menu) {
        alert('Changes saved successfully!');
        menu.remove();
    }

    function createUI() {
        const templateDropdown = document.createElement('select');
        updateTemplateDropdown(templateDropdown);

        templateDropdown.addEventListener('change', function () {
            const selectedTemplate = templateDropdown.value;
            if (selectedTemplate) {
                const templateMessage = templates[selectedTemplate];
                copyToClipboard(templateMessage);
            }
        });

        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '10px';
        container.style.right = '10px';

        const chatLogo = document.createElement('div');
        chatLogo.style.position = 'relative';
        chatLogo.style.width = '100px';
        chatLogo.style.height = '50px';
        chatLogo.style.background = '#1a1a1a';
        chatLogo.style.cursor = 'move';
        chatLogo.style.textAlign = 'center';
        chatLogo.style.lineHeight = '50px';
        chatLogo.style.color = '#fff';
        chatLogo.style.borderRadius = '8px';
        chatLogo.style.userSelect = 'none';
        chatLogo.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.1)';

        chatLogo.innerHTML = '<strong>Rapid</strong>Reply';

        let isDragging = false;
        let offsetX, offsetY;
        let scriptEnabled = true;
        let templateWindowVisible = false;

        chatLogo.addEventListener('mousedown', function (e) {
            isDragging = true;
            offsetX = e.clientX - container.getBoundingClientRect().left;
            offsetY = e.clientY - container.getBoundingClientRect().top;
        });

        document.addEventListener('mousemove', function (e) {
            if (isDragging) {
                const x = e.clientX - offsetX;
                const y = e.clientY - offsetY;
                container.style.left = x + 'px';
                container.style.top = y + 'px';
            }
        });

        document.addEventListener('mouseup', function () {
            isDragging = false;
        });

        chatLogo.addEventListener('dblclick', function () {
            templateWindowVisible = !templateWindowVisible;
            templateDropdown.style.display = templateWindowVisible ? 'block' : 'none';
        });

        const closeButton = document.createElement('div');
        closeButton.style.position = 'absolute';
        closeButton.style.top = '0';
        closeButton.style.right = '0';
        closeButton.style.padding = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.innerHTML = 'X';
        closeButton.addEventListener('click', function () {
            if (confirm('Are you sure you want to stop the script and remove UI elements?')) {
                scriptEnabled = false;
                saveTemplates();
                container.remove();
            }
        });

        templateDropdown.style.display = 'none';

        container.appendChild(chatLogo);
        container.appendChild(templateDropdown);
        chatLogo.appendChild(closeButton);
        document.body.appendChild(container);

        container.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            const menu = document.createElement('div');
            menu.style.position = 'fixed';
            menu.style.left = e.clientX + 'px';
            menu.style.top = e.clientY + 'px';
            menu.style.background = '#fff';
            menu.style.border = '1px solid #ccc';
            menu.style.padding = '5px';
            menu.style.zIndex = '9999';

            const editTemplatesBtn = document.createElement('button');
            editTemplatesBtn.textContent = 'Edit Templates';
            editTemplatesBtn.addEventListener('click', function () {
                editTemplates(menu);
            });

            const copyHistoryBtn = document.createElement('button');
            copyHistoryBtn.textContent = 'Copy History';
            copyHistoryBtn.addEventListener('click', function () {
                showCopyHistory(menu);
            });

            const exitBtn = document.createElement('button');
            exitBtn.textContent = 'Exit';
            exitBtn.addEventListener('click', function () {
                if (confirm('Are you sure you want to stop the script and remove UI elements?')) {
                    scriptEnabled = false;
                    saveTemplates();
                    container.remove();
                }
            });

            menu.appendChild(editTemplatesBtn);
            menu.appendChild(copyHistoryBtn);
            menu.appendChild(exitBtn);
            document.body.appendChild(menu);

            menu.addEventListener('click', function (e) {
                e.stopPropagation();
            });

            document.addEventListener('click', function () {
                menu.remove();
            });
        });
    }

    document.addEventListener('copy', function (event) {
        const copiedText = window.getSelection().toString();
        if (copiedText) {
            copyToClipboard(copiedText, false);
        }
    });

    createUI();
})();
