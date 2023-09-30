// ==UserScript==
// @name         EasyFill
// @namespace    http://easyfill.tool.by.elfe/
// @version      0.1
// @description  Add buttons
// @author       ElfeXu and GPT4
// @match        https://chat.openai.com/*
// @grant        none
// ==/UserScript==

// 请在 ==/UserScript== 之后，但在 (function() { 之前插入以下代码：

const style = `
    .settings-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .settings-content {
        background-color: #183D3D;
        color: #183D3D;
        padding: 20px;
        width: 50%;
        height: 80%;
        overflow-y: auto;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .settings-textarea {
        width: 100%;
        height: calc(100% - 60px); /* 为了留出一些空间给提交按钮 */
        resize: vertical;
        background-color: #93B1A6;
        color: #191717;
        padding: 10px; /* 添加一些内边距 */
        border-radius: 5px; /* 添加一些圆角 */
    }

    .settings-submit {
        background-color: #5C8374;
        color: #183D3D;
        padding: 10px 15px; /* 内边距 */
        border: none; /* 无边框 */
        border-radius: 5px; /* 圆角 */
        cursor: pointer; /* 当鼠标移上去显示手势 */
    }

    .settings-submit:hover {
        background-color: #93B1A6;
    }

`;


// 添加此样式到页面上
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = style;
document.head.appendChild(styleSheet);
const SETTINGS_BUTTON_ID = "custom-settings-button";

const setting_usage_text = `使用说明
🪄🪄🪄🪄🪄🪄🪄🪄
填充
每个按钮对应一个预设好的 prompt  ，{__PLACE_HOLDER__} 里的内容会被你鼠标选中的文字替代掉。
🪄🪄🪄🪄🪄🪄🪄🪄
🚀 直接发送
带有🚀符号的按钮，点击后会替换 {__PLACE_HOLDER__} 内容并直接发送。`;
const setting_new_setting_text = `新设置名称
🪄🪄🪄🪄🪄🪄🪄🪄
按钮名称
这里写你的 prompt  ，{__PLACE_HOLDER__} 里的内容会被你鼠标选中的文字替代掉。
🪄🪄🪄🪄🪄🪄🪄🪄
🚀 直接发送的按钮
带有🚀符号的按钮，点击后会替换 {__PLACE_HOLDER__} 内容并直接发送。`;


(function() {
    'use strict';

    let menus = []
    let setting_texts = JSON.parse(localStorage.getItem('setting_texts')) || [setting_usage_text];
    let setting_current_index = localStorage.getItem('setting_current_index') || 0;
    let current_setting_text = setting_texts[setting_current_index];

    function parseSettingsText(settingsText) {
        menus.length = 0; // Clear the existing array
        const settingLines = settingsText.split("\n").slice(1); // Start from the second line
        const buttonData = settingLines.join("\n").split("🪄🪄🪄🪄🪄🪄🪄🪄");
        buttonData.forEach(data => {
            const lines = data.trim().split("\n");
            if (lines.length >= 2) {
                const name = lines[0];
                const dispatchFlag = name.includes("🚀");
                const content = lines.slice(1).join("\n");
                menus.push([name, content, dispatchFlag]);
            }
        });
    }
    parseSettingsText(current_setting_text);

    function clearCustomButtons(target) {
        const existingButtons = target.querySelectorAll('.custom-button');
        existingButtons.forEach(function(button) {
            button.parentNode.parentNode.remove();
        });
    }


    function showSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'settings-modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'settings-content';

        const textarea = document.createElement('textarea');
        textarea.className = 'settings-textarea';
        textarea.value = current_setting_text;

        const submitButton = document.createElement('button');
        submitButton.className = 'settings-submit';
        submitButton.textContent = 'Apply Settings';

        const settingsDropdown = document.createElement('select');
        setting_texts.forEach((text, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.text = text.split('\n')[0]; // Assuming the first line is a title or identifier
            settingsDropdown.appendChild(option);
        });
        settingsDropdown.selectedIndex = setting_current_index;
        settingsDropdown.addEventListener('change', (e) => {
            const selectedIndex = e.target.value;
            textarea.value = setting_texts[selectedIndex];
        });
        const newSettingButton = document.createElement('button');
        newSettingButton.textContent = 'Add New Setting';
        newSettingButton.className = 'settings-submit';
        newSettingButton.addEventListener('click', () => {
            textarea.value = setting_new_setting_text;
            setting_texts.push(textarea.value);
            const option = document.createElement('option');
            option.value = setting_texts.length - 1;
            option.text = setting_new_setting_text.split('\n')[0];
            settingsDropdown.appendChild(option);
            settingsDropdown.value = setting_texts.length - 1;

        });
        modalContent.appendChild(settingsDropdown);
        modalContent.appendChild(newSettingButton);


        modalContent.appendChild(textarea);
        modalContent.appendChild(submitButton);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Hide the modal when clicking outside the content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        submitButton.addEventListener('click', () => {
            const selectedSettingIndex = settingsDropdown.value;
            setting_texts[selectedSettingIndex] = textarea.value;
            localStorage.setItem('setting_texts', JSON.stringify(setting_texts));
            localStorage.setItem('setting_current_index', selectedSettingIndex);
            current_setting_text = textarea.value;
            if (current_setting_text) {
                parseSettingsText(current_setting_text);
                const targetElement = document.querySelector(".h-full.flex.ml-1.md\\:w-full.md\\:m-auto.md\\:mb-4.gap-0.md\\:gap-2.justify-center");
                clearCustomButtons(targetElement);
                addSettingsButton(targetElement);
                addCustomButtons(targetElement);
            }
            modal.remove();
        });
    }

    function addSettingsButton(targetElement) {
        var settingsButtonHtml = '<div class="flex items-center md:items-end"><div data-projection-id="1" style="opacity: 1;">';
        settingsButtonHtml += '<button class="btn relative btn-neutral -z-0 whitespace-nowrap border-0 md:border custom-button" id="' + SETTINGS_BUTTON_ID + '">设置</button>';
        settingsButtonHtml += '</div></div>';


        let settingsButtonContainer = document.createElement('div');
        settingsButtonContainer.innerHTML = settingsButtonHtml;
        let settingsButton = settingsButtonContainer.firstChild;
        targetElement.appendChild(settingsButton);

        settingsButton.querySelector('.custom-button').addEventListener('click', function() {
            showSettingsModal();
        });
    }

    function addCustomButtons(targetElement) {
        menus.forEach(function([buttonText, content, dispatchEventFlag]) {
            let buttonHtml = '<div class="flex items-center md:items-end"><div data-projection-id="1" style="opacity: 1;">';
            buttonHtml += '<button class="btn relative btn-neutral -z-0 whitespace-nowrap border-0 md:border custom-button">' + buttonText + '</button>';
            buttonHtml += '</div></div>';

            let buttonContainer = document.createElement('div');
            buttonContainer.innerHTML = buttonHtml;
            let newButton = buttonContainer.firstChild;
            targetElement.appendChild(newButton);

            newButton.querySelector('.custom-button').addEventListener('click', function() {
                let selectedText = window.getSelection().toString();
                let resultText = content.replace('{__PLACE_HOLDER__}', selectedText);
                const inputElement = document.getElementById('prompt-textarea');
                inputElement.value = resultText;
                if (dispatchEventFlag) {
                    inputElement.dispatchEvent(new Event('input', { 'bubbles': true }));
                }
                inputElement.focus();
                inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
            });
        });
    }

    setInterval(function() {
        const targetElement = document.querySelector(".h-full.flex.ml-1.md\\:w-full.md\\:m-auto.md\\:mb-4.gap-0.md\\:gap-2.justify-center");
        const existingSettingsButton = document.getElementById(SETTINGS_BUTTON_ID);
        if (!existingSettingsButton) {
            clearCustomButtons(targetElement);
            addSettingsButton(targetElement);
            addCustomButtons(targetElement);
        }
    }, 1000);
})();
