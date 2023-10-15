// ==UserScript==
// @name         EasyFill
// @namespace    http://easyfill.tool.elfe/
// @version      0.9
// @description  超级方便的 GPT 对话助手，通过划选或点击，把内容填充到预置 prompt 模版直接发送。支持多个功能组设置。
// @author       Elfe & ttmouse & GPT
// @match        https://chat.openai.com/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAAAAABWESUoAAABX2lDQ1BJQ0MgUHJvZmlsZQAAeJxtkLFLAmEYxh/NEI6LFCIaghyiycLOgla1qMDh0ARrO8/rDPT8uLuQtoJaQ6ihtrClsakWh9amgqAhotr6AyIXk+v9vEqtvo+X58fD+768PIBXVBgr+gCUDNtMLcZD2dW1kP8VArwYQBCColosJstJasG39r7GPTxc7yb5ruB+9rop1dM7lef4WOD86G9/zxPymqWSflBJKjNtwBMhlis247xNPGTSUcSHnHWXzzjnXK63e1ZSCeJb4oBaUPLEL8ThXJevd3GpuKl+3cCvFzUjkyYdphrFPBaQpB9CBhJmMU21RBn9PzPTnkmgDIYtmNiAjgJsmo6Rw1CERrwMAyqmECaWEKGK8qx/Z9jxyjVg7h3oq3a83DFwuQeMPHS88RNgcBe4uGGKqfwk62n4rPWo5LIYB/qfHOdtAvAfAK2q4zRrjtM6pf2PwJXxCXhkY9XHGXyzAAAAVmVYSWZNTQAqAAAACAABh2kABAAAAAEAAAAaAAAAAAADkoYABwAAABIAAABEoAIABAAAAAEAAAEgoAMABAAAAAEAAAEgAAAAAEFTQ0lJAAAAU2NyZWVuc2hvdPDFp1oAAABUSURBVHic3VFBDgAgCMLW/79M1wiX1TFuAhOcwK/gPLTKnRhYGFRH38u2gQAQMxOmK6MjTU4LUHpkJWWLlAw/oi65RhQlPeHpWduMO/sZ1l84+QUG1/URFizO5xoAAAAASUVORK5CYII=
// @grant        none
// ==/UserScript==

// Copyright (c) 2023 ElfeXu (Xu Yanfei)
// Licensed under the MIT License.

const setting_usage_text = `使用说明
通过 🪄 分隔按钮
📖 之后的是直接在原文替代成链接的内容
🪄🪄🪄🪄🪄🪄🪄🪄
功能一
这里是预设的 prompt  ，{__PLACE_HOLDER__} 里的内容会被你鼠标选中的文字替代掉。
🪄🪄🪄🪄🪄🪄🪄🪄
功能二
点击菜单文字可以直接发送，点击右边会把 prompt 填充到输入框，可以编辑后再发送。
🪄🪄🪄🪄🪄🪄🪄🪄
CLICK 示范
通过要求 GPT 以特定格式生成内容，可以将内容转化成链接，点击即直接发送。例如
请给我五个和有水关的英文单词，用两个方括号 [[]] 来标记。
再用列表的方式给出三个和水有关的节日，节日名称写在 💦  💦 之间
📖📖📖📖📖📖📖📖
\[\[(.*?)\]\]
请帮我解释一下{__PLACE_HOLDER__}这个词的意思
📖📖📖📖📖📖📖📖
💦(.*?)💦
请帮我详细介绍一下{__PLACE_HOLDER__}。
`

const setting_new_setting_text = `新功能组名称
这里可以填写功能组使用说明
通过 🪄 分隔按钮
🪄🪄🪄🪄🪄🪄🪄🪄
第一行是按钮名称
第二行开始是prompt。{__PLACE_HOLDER__} 里的内容会被你鼠标选中的文字替代掉。
🪄🪄🪄🪄🪄🪄🪄🪄
第二个功能
第二个prompt
prompt多长都没关系
各种奇怪字符也都可以用
只根据连续八个🪄来分隔功能
📖📖📖📖📖📖📖📖
\[\[(.*?)\]\]
在按钮之后可以用八个📖分隔，带上点击直接发送的内容。
第一行是正则匹配，后面是模版。匹配到的内容会替代掉{__PLACE_HOLDER__}中的内容然后被直接发送。
`;


const default_setting_texts = [
    `英语练习
先点启动，再贴大段文章，然后需要干啥就选中了文字点啥功能
🪄🪄🪄🪄🪄🪄🪄🪄
启动
你是我的英语老师，我需要你陪我练习英语，准备托福考试。
请**用英语和我对话**，涉及英语例句、题目和话题探讨时请用托福水平的书面英语，但在我明确提出需要时切换到中文。
为了让我的学习更愉悦，请用轻松的语气，并添加一些 emoji。
接下来我会给你一篇英文文章，请记住文章，然后我会向你请求帮助。
如果你理解了，请说 Let's begin！
🪄🪄🪄🪄🪄🪄🪄🪄
英译中
请帮我把下面这段话翻译直译成中文，不要遗漏任何信息。
然后请判断文字是否符合中文表达习惯，如果不太符合，请重新意译，在遵循愿意的前提下让内容更通俗易懂。
输出格式应该是

直译：直译的内容
---
（如果有必要的话）意译：意译的内容


待翻译的内容：
'''
{__PLACE_HOLDER__}
'''
🪄🪄🪄🪄🪄🪄🪄🪄
中译英
请帮我用最地道的方式帮我把下面这段话翻译成英文。

待翻译的内容：
'''
{__PLACE_HOLDER__}
'''
🪄🪄🪄🪄🪄🪄🪄🪄
学单词
'''
{__PLACE_HOLDER__}
'''

请帮我学习这个单词
1. 请给出单词的音标、词性、中文意思、英文意思
2. 如果我们前面的讨论中出现过这个单词，请结合它的上下文，重点讲解在上下文中单词的意思和用法
3. 请给出更多例句
4. 如果有容易混淆的单词，请给出对比
🪄🪄🪄🪄🪄🪄🪄🪄
深入解释
我不太理解这段文字的具体含义，能否结合上下文，给我一个更深入的中文解释？
解释时请着重讲解其中有难度的字词句。
如果有可能，请为我提供背景知识以及你的观点。
'''
{__PLACE_HOLDER__}
'''
🪄🪄🪄🪄🪄🪄🪄🪄
封闭题
请对下面这段文字，按照托福阅读理解的难度，用英文为我出三道有标准答案的问答题。
请等待我回答后，再告诉我标准答案，并加以解释。
'''
{__PLACE_HOLDER__}
'''
🪄🪄🪄🪄🪄🪄🪄🪄
开放题
请对下面这段文字，按照托福口语和作文的难度，用英文为我出一道开放题，我们来进行探讨。
'''
{__PLACE_HOLDER__}
'''

`,
setting_usage_text
];

const LSID_SETTING_TEXTS = 'setting_texts_v0.4';
const LSID_SETTING_CURRENT_INDEX = 'setting_current_index_v0.4';
const LSID_MENU_MODE = 'setting_menu_mode'
const LSID_CONTEXT_MENU_PINNED = 'context_menu_pinned';

////////////////////////// CSS //////////////////////////
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
        background-color: #f0f1ee;
        color: #535e5e;
        padding: 20px;
        width: 50%;
        height: 80%;
        overflow-y: auto;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        padding: 20px;
        gap: 10px;
    }

    .buttonsContainer {
        display: flex;
        justify-content: space-between;
        align-items: center;  /* 确保子元素在垂直方向上居中 */
        width: 100%;
    }

    .settings-dropdown {
        outline: none;
        border: 0px;
    }

    .settings-input {
        width: 100%;
        padding: 8px 20px;
        background-color: #fff;
        color: #000;
        border: 0;
        border-radius: 5px;
    }

    .settings-textarea {
        width: 100%;
        height: calc(100% - 60px);
        resize: vertical;
        background-color: #fff;
        color: #000;
        border-radius: 0.75em;
        border: 0px;
        padding: 18px 18px;
        box-shadow: rgba(0, 0, 0, 0.05) 0px 0px 0px 0.5px, rgba(0, 0, 0, 0.024) 0px 0px 5px, rgba(0, 0, 0, 0.05) 0px 1px 2px;
    }

    .settings-button {
        background-color: #469c7b;
        color: #fff;
        padding: 8px 18px;
        border: none;
        border-radius: 30px;
        cursor: pointer;
        margin: 0 5px;
    }

    .settings-button:hover {
        background-color: #93B1A6;
    }

    .settings-button:disabled {
        background-color: #B4B4B3;  /* 灰色背景 */
        color: #808080;            /* 深灰色文字 */
        cursor: not-allowed;       /* 禁用的光标样式 */
    }

    .setting-confirm {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #f0f1ee;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        display: none;
        flex-direction: column;
        gap: 10px;
        padding: 20px;
        z-index: 2000;
    }

    .confirm-content {
        color: #535e5e;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    #contextMenu {
        display: none;
        position: absolute;
    }

    .pinned-menu {
        position: fixed;
        right: 10px;
        top: 50%;
        transform: translateY(-50%); /* 这将使元素垂直居中，无论其高度是多少 */
    }

    #menuContainer {
        width: auto;
        display: inline-block;
        background-color: #fff;
        color: #000;
        border-radius: 0.55em;
        padding: 5px;
        box-shadow: rgba(0, 0, 0, 0.25) 0px 0px 0px 0.5px, rgba(0, 0, 0, 0.1) 0px 2px 5px, rgba(0, 0, 0, 0.05) 0px 3px 3px;
        border-bottom: 1px solid #f0f0f0;
    }

    #menuContainer div {
        display: flex;
        align-items: center;
        width: auto;
        padding: 2px 0;
        margin: 0px;
    }

    #menuContainer div.menu-title {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 5px 0;
        font-weight: bold;
        cursor: pointer;
    }

    #menuContainer div.menu-separator {
        width: 100%;
        height: 1px;
        background-color: #f0f0f0;
        margin: 2px 0;
        padding: 0px 10px;
    }

    #menuContainer div.menu-item {
        display: flex;
        align-items: center;
        width: auto;
        max-width: 200px;
        min-width: 120px;
        padding: 0 0;
        margin: 0 5px;
    }

    #menuContainer button.menu-button {
        border: none;
        background: none;
        padding: 5px 10px;
        margin: 0;
        white-space: nowrap;
        border-radius: 5px;
        transition: background-color 0.3s ease;
    }

    #menuContainer button.menu-button:hover {
        background-color: #469c7b5c;
    }

    #menuContainer button.menu-button:disabled {
        height: 1px;
        color: #c6c6c600;
        padding: 0;
        border-bottom: 1px solid #dddddd8c;
    }

    #menuContainer button.menu-button:disabled:hover {
        background: none;
    }

    #menuContainer button.left-part {
        flex-grow: 1;
        flex-shrink: 0;
        flex-basis: auto;
        max-width: 160px;
        text-align: left;
        overflow: hidden;       /* 这会确保内容被裁剪 */
        white-space: nowrap;    /* 防止文本换行 */
        text-overflow: ellipsis;/* 超出的文本将显示为... */
    }

    #menuContainer button.right-part {
        flex-grow: 0;
        flex-shrink: 0;
        width: 40px;
        text-align: right;
    }

    #menuContainer button.icon {
        width: 24px;
        height: 24px;
    }

    #groupSelectList {
        border: 0px;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        display: flex;
        flex-direction: column;
        z-index: 1000;
        background-color: #fff;
        color: #000;
    }

    #groupSelectList div {
        padding: 5px;
        cursor: pointer;
        transition: background-color 0.2s;
        background-color: #fff;
        color: #000;
        padding: 5px 20px;
    }

    #groupSelectList div:hover {
        background-color: #469c7b5c;
    }

    /* 使链接看起来更像链接 */
    .custom-link {
        text-decoration: underline;
        cursor: pointer;  /* 当鼠标放上去时变成手的样子 */
        position: relative;  /* 为了定位 tooltip */
    }

    /* 提示（tooltip）样式 */
    .custom-link:hover::after {
        content: attr(data-text);  /* 显示 data-text 的内容 */
        position: absolute;
        bottom: 100%;  /* 出现在链接的上方 */
        left: 0;  /* 与链接的左边界对齐 */
        width: max-content;  /* 根据内容设置宽度 */
        max-width: 300px;  /* 设置最大宽度 */
        white-space: normal;  /* 允许文本换行 */
        line-height: 18px;
        max-height: 120px;
        overflow: hidden;
        background-color: #333;  /* 背景色 */
        color: white;  /* 文字颜色 */
        padding: 5px 10px;  /* 内边距 */
        border-radius: 4px;  /* 边框圆角 */
        font-size: 12px;  /* 文字大小 */
        z-index: 10;  /* 保证 tooltip 出现在其他元素的上方 */
    }

    /* 添加一个小三角形在 tooltip 的下方 */
    .custom-link:hover::before {
        content: '';
        position: absolute;
        bottom: -5px;  /* 出现在 tooltip 的正下方 */
        left: calc(50% + 5px);  /* 让小三角形出现在链接的中央 */
        width: 10px;  /* 宽度 */
        height: 10px;  /* 高度 */
        background-color: #333;  /* 与 tooltip 的背景色相同 */
        z-index: 9;  /* 出现在 tooltip 下方 */
    }
`;

const svgEditBeforeSend = "M896 128.426667H128c-47.146667 0-85.333333 38.186667-85.333333 85.333333V384h85.333333V212.906667h768v598.613333H128V640H42.666667v171.093333c0 47.146667 38.186667 84.48 85.333333 84.48h768c47.146667 0 85.333333-37.546667 85.333333-84.48v-597.333333c0-47.146667-38.186667-85.333333-85.333333-85.333333zM469.333333 682.666667l170.666667-170.666667-170.666667-170.666667v128H42.666667v85.333334h426.666666v128z";

const styleElement = document.createElement('style');
styleElement.innerHTML = style;
document.head.appendChild(styleElement);


////////////////////////// Send Prompt functions //////////////////////////
let setting_texts = JSON.parse(localStorage.getItem(LSID_SETTING_TEXTS)) || default_setting_texts;
let setting_current_index = localStorage.getItem(LSID_SETTING_CURRENT_INDEX) || 0;
let current_setting_text = setting_texts[setting_current_index];
let menu_mode = localStorage.getItem(LSID_MENU_MODE) || ''; // 后续还可以支持更多自定义模式。目前 '' 代表默认模式，即点击鼠标直接出菜单；非 '' （'shift'）代表需要同时按住 shift 键才会出菜单
let isMenuPinned = localStorage.getItem(LSID_CONTEXT_MENU_PINNED) || false;

function replace_all_textarea(text) {
    // 查找所有匹配按钮文本 "Save & Submit" 的 div
    let buttons = Array.from(document.querySelectorAll('div.flex.w-full.gap-2.items-center.justify-center'));

    buttons.forEach(button => {
        // 检查按钮文本是否为 "Save & Submit"
        if (button.textContent.trim() === 'Save & Submit') {
            // 向上查找其祖先元素，直到找到一个拥有 `flex flex-grow flex-col gap-3 max-w-full` 这个 class 的 div
            let parentDiv = button.closest('.flex.flex-grow.flex-col.gap-3.max-w-full');

            if (parentDiv) {
                // 在这个祖先 div 内，查找 `textarea` 元素
                let textarea = parentDiv.querySelector('textarea');

                if (textarea) {
                    // 替换这个 `textarea` 的内容为 "TEMPLATE_TEXT"
                    textarea.value = text;

                    const inputEvent = new Event('input', { 'bubbles': true });
                    textarea.dispatchEvent(inputEvent);
                }
            }
        }
    });
}

async function sendToGPT(template, selectedText, sendDirectly) {
    let placeholderPosition = template.indexOf('{__PLACE_HOLDER__}');
    let finalText = template.replace('{__PLACE_HOLDER__}', selectedText);

    if (!sendDirectly) {
        replace_all_textarea(finalText);
    }

    const inputElement = document.getElementById('prompt-textarea');
    inputElement.value = finalText;

    const inputEvent = new Event('input', { 'bubbles': true });
    inputElement.dispatchEvent(inputEvent);
    await new Promise(resolve => setTimeout(resolve, 50));


    if (sendDirectly) {
        const sendButton = document.querySelector('[data-testid="send-button"]');
        if (sendButton) {
            sendButton.click();
        }
        inputElement.focus();
    } else {
        inputElement.focus();
        // 设置光标位置
        let cursorPosition;
        if (placeholderPosition !== -1) {
            // 将光标放在替换文本的结束位置
            if (selectedText) {
                cursorPosition = placeholderPosition + selectedText.length;
            } else {
                cursorPosition = placeholderPosition;
            }
        } else {
            cursorPosition = inputElement.value.length; // 光标放在文本末尾
        }
        inputElement.setSelectionRange(cursorPosition, cursorPosition);
    }
}

////////////////////////// Context Menu functions //////////////////////////

// 创建上下文菜单
const contextMenu = document.createElement('div');
const menuContainer = document.createElement('div');
let isGroupSelectListShown = false;

function menuMode() {
    return menu_mode;
}

function menuModeText() {
    if (menuMode() == '') {
        return '快捷模式'
    } else {
        return 'Shift模式'
    }
}

function switchMode() {
    if (menuMode() == '') {
        menu_mode = 'shift';
    } else {
        menu_mode = '';
    }
    localStorage.setItem(LSID_MENU_MODE, menu_mode);
}

function createPathElement(svgPathData) {
    // 创建一个`path`元素并设置SVG路径数据
    const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathElement.setAttribute("d", svgPathData);
    pathElement.setAttribute("fill", "#5D5D5D");
    return pathElement;
}

function createPinButton() {
    const pinButton = document.createElement('button');
    pinButton.innerHTML = '📌'; // 使用pin emoji作为按钮的内容
    pinButton.style.position = 'absolute';
    pinButton.style.right = '5px';
    pinButton.style.top = '5px';
    if (isMenuPinned) {
        pinButton.innerHTML = '🔓';
        menuContainer.classList.add('pinned-menu');
    } 

    pinButton.onclick = function() {
        isMenuPinned = !isMenuPinned;
        localStorage.setItem(LSID_CONTEXT_MENU_PINNED, isMenuPinned);
        pinButton.innerHTML = isMenuPinned ? '🔓' : '📌';

        if (isMenuPinned) {
            menuContainer.classList.add('pinned-menu');
        } else {
            menuContainer.classList.remove('pinned-menu');
        }
    };
    return pinButton;
}


function createMenuTitle() {
    const menuTitle = document.createElement('div');
    menuTitle.classList.add('menu-title');
    menuTitle.innerHTML = setting_current_index;
    menuTitle.innerHTML = setting_texts[setting_current_index].split('\n')[0];
    menuTitle.addEventListener('mouseup', function(e) {
        e.stopPropagation();  // 阻止事件冒泡

        let dropdown = document.getElementById('groupSelectList');
        if (dropdown) {
            dropdown.remove(); // 如果下拉列表已经存在，那么移除它
            isGroupSelectListShown = false;
        } else {
            createGroupSelectList();
            isGroupSelectListShown = true;
        }
    });
    return menuTitle;
}

function createMenuSeparator() {
    const separator = document.createElement('div');
    separator.classList.add('menu-separator');
    return separator;
}

// 创建单个菜单项
function createMenuItem(label, icon, action1, action2) {
    const menuItem = document.createElement('div');
    menuItem.classList.add('menu-item');

    const leftPart = document.createElement('button');
    leftPart.classList.add('menu-button', 'left-part');
    leftPart.innerHTML = label;

    if (action1 == null) {
        leftPart.disabled = true;
    } else {
        leftPart.onclick = () => {
            action1();
            hideContextMenu();
        };
    }
    menuItem.appendChild(leftPart);

    if (action2 != null) {
        const rightPart = document.createElement('button')
        rightPart.classList.add('menu-button', 'right-part');

        if (icon != null) {
            // 创建一个SVG元素并设置属性
            const rightIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            rightIcon.setAttribute("viewBox", "0 0 1024 1024");  // 这个属性需要保留在这里
            rightIcon.classList.add("icon");
            rightIcon.appendChild(createPathElement(icon));
            rightPart.appendChild(rightIcon);
        } else {
            rightPart.innerHTML = '≋';
        }

        rightPart.onclick = () => {
            action2();
            hideContextMenu();
        };
        menuItem.appendChild(rightPart);
    }

    return menuItem;
}

function hideContextMenu() {
    if (isMenuPinned || isGroupSelectListShown) {
        return;
    }

    contextMenu.style.display = 'none';
}

function showContextMenu(event) {
    const margin  = 20;
    const width = contextMenu.offsetWidth + margin;
    const height = contextMenu.offsetHeight + margin;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (event) {
        // 如果菜单超出了右侧窗口边缘
        if (event.clientX + width > windowWidth) {
            contextMenu.style.left = `${windowWidth - width}px`;
        } else {
            contextMenu.style.left = `${event.clientX}px`;
        }

        // 如果菜单超出了底部窗口边缘
        if (event.clientY + height > windowHeight) {
            contextMenu.style.top = `${windowHeight - height}px`;
        } else {
            contextMenu.style.top = `${event.clientY}px`;
        }
    }

    contextMenu.style.display = 'block';
}

function updateMenuItems() {
    parseSettingsText(current_setting_text);

    menuContainer.innerHTML = '';
    menuContainer.appendChild(createPinButton());
    menuContainer.appendChild(createMenuTitle());
    menuContainer.appendChild(createMenuSeparator());

    menus.forEach((menu, index) => {
        menuContainer.appendChild(
            createMenuItem(
                menu[0],
                svgEditBeforeSend,
                async function() {
                    await sendToGPT(menu[1], window.getSelection().toString().trim(), true);
                },
                async function() {
                    await sendToGPT(menu[1], window.getSelection().toString().trim(), false);
                },
        ));
    });

    menuContainer.appendChild(createMenuSeparator());
    menuContainer.appendChild(createMenuItem('设置', null, function() {showSettingsModal();}, null));
    menuContainer.appendChild(createMenuItem('添加为模版', null, function() {showAddTemplateModal(window.getSelection().toString().trim());}, null));
}

function isMenuVisible() {
    return contextMenu.style.display == 'block';
}

function shouldResponseForContextMenu(event) {
    if (isMenuPinned) {
        if (!isMenuVisible())  {
            // Should not be here. Just to make sure pin is removed if menu is not visible.
            isMenuPinned = false;
        }
        return false;
    }

    // 查找 settings-modal，如果 settings-modal 存在，就不响应右键菜单
    const settingsModal = document.querySelector('.settings-modal');
    if (settingsModal) {
        return false;
    }

    if (menuMode() != '' && !event.shiftKey) {
        return false;
    }

    return true;
}

function initContextMenu() {
    contextMenu.id = 'contextMenu';
    menuContainer.id = 'menuContainer';
    contextMenu.appendChild(menuContainer);
    document.body.appendChild(contextMenu);

    updateMenuItems();

    document.addEventListener('mouseup', function(event) {
        if (!shouldResponseForContextMenu(event)) {
            return;
        }
        const selectedText = window.getSelection().toString();
        if (selectedText.length == 0) {
            hideContextMenu();
        } else {
            showContextMenu(event);
        }
    });

    document.addEventListener('dblclick', function(event) {
        if (!shouldResponseForContextMenu(event)) {
            return;
        }
        showContextMenu(event);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            hideContextMenu();
        }
    });

    if(isMenuPinned) {
        showContextMenu(null);
    }
}

////////////////////////// Menu Click&choose //////////////////////////

// setting_texts.forEach((text, index) => {
//     const option = document.createElement('option');
//     option.value = index;
//     option.text = text.split('\n')[0]; // Assuming the first line is a title or identifier
//     settingsDropdown.appendChild(option);
// });
// settingsDropdown.selectedIndex = setting_current_index;
// settingsDropdown.addEventListener('change', (e) => {
//     const selectedIndex = e.target.value;
//     textarea.value = setting_texts[selectedIndex];
//     if (setting_texts.length <= 1) {
//         deleteSettingButton.disabled = true;
//     } else {
//         deleteSettingButton.disabled = false;
//     }
// });


function createGroupSelectList() {
    const dropdown = document.createElement('div');
    dropdown.id = 'groupSelectList';
    dropdown.style.maxHeight = '500px';
    dropdown.style.overflowY = 'auto';
    dropdown.style.position = 'fixed';  // 使用固定定位

    setting_texts.forEach((text, index) => {
        const item = document.createElement('div');
        item.innerText = text.split('\n')[0]; // Assuming the first line is a title or identifier
        item.addEventListener('click', function() {
            setting_current_index = index;
            current_setting_text = setting_texts[setting_current_index];
            updateMenuItems();
            dropdown.remove(); // 选择后，移除下拉列表
            isGroupSelectListShown = false;
            showContextMenu(null);
        });
        dropdown.appendChild(item);
    });

    const rect = menuContainer.getBoundingClientRect();

    // 先将dropdown添加到文档中，但将其设置为不可见
    dropdown.style.visibility = 'hidden';
    document.body.appendChild(dropdown);

    // 现在我们可以获取其实际尺寸了
    const dropdownRect = dropdown.getBoundingClientRect();
    dropdown.style.top = rect.top + 'px';
    dropdown.style.left = (rect.left - dropdownRect.width) + 'px';

    // 然后再将其设置为可见
    dropdown.style.visibility = 'visible';
    isGroupSelectListShown = true;
}


////////////////////////// Easy Click functions //////////////////////////

let intervalID;

// 点击事件处理器
async function clickHandler(event) {
    //event.preventDefault();
    console.log('执行 clickHandler'); // 执行点击事件处理器
    const inputElement = document.getElementById('prompt-textarea'); // 获取输入框
    console.log('[Debug] 获取输入框元素');
    inputElement.value = this.getAttribute("data-text"); // 将链接文本添加到输入框
    console.log('[Debug] 设置输入框值');
    const inputEvent = new Event('input', { 'bubbles': true }); // 创建input事件
    console.log('[Debug] 创建 input 事件');
    inputElement.dispatchEvent(inputEvent); // 触发input事件
    console.log('[Debug] 触发 input 事件');

    await new Promise(resolve => setTimeout(resolve, 50));
    console.log('[Debug] 50ms 延时完成');

    const sendButton = document.querySelector('[data-testid="send-button"]');
    console.log('[Debug] 获取发送按钮');
    if (sendButton) {
        console.log('点击发送按钮');
        sendButton.click();
        console.log('[Debug] 开启监听');
    }

}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&apos;");
}

function replace_text(original) {
    clicks.forEach(([regExpression, template]) => {
        original = original.replace(regExpression, (match, p1) => {
            // 使用模板替换找到的匹配项
            let replaced = template.replace(/{__PLACE_HOLDER__}/g, p1);
            replaced = escapeHtml(replaced);
            if (template.includes('{__PLACE_HOLDER__}')) {
                return `<a class="custom-link" data-text="${replaced}">${p1}</a>`;
            } else {
                return `<a class="custom-link" data-text="${replaced}">${regExpression.source}</a>`;
            }
        });
    });
    return original;
}

// 处理元素
function processElement(element) {
    const hidden_characters = "\u200B\u200B\u200B\u200B\u200B\u200B";

    let innerHTML = element.innerHTML;

    if (innerHTML.startsWith(hidden_characters)) {
        return; // 不重复处理
    }

    innerHTML = replace_text(innerHTML);

    // 替换了 innerHTML 后，原本网页中 Copy code 之类的事件监听就失效了。
    // 为了尽可能让两个功能共存，这里仅对文字有改动的重新赋值。
    if (innerHTML != element.innerHTML) {
        element.innerHTML = hidden_characters + innerHTML; // 添加隐藏字符，避免重复处理
    }

    // 给新生成的链接添加事件监听
    const customLinks = element.querySelectorAll('.custom-link');
    customLinks.forEach(link => {
        link.addEventListener('click', clickHandler);
    });
}

function processAllElements() {
    // 先找到父级对象
    const parentElements = document.querySelectorAll('.flex.flex-grow.flex-col.gap-3.max-w-full');
    parentElements.forEach(parent => {
        // 在父级对象下面找特定的子元素
        const chatRecordElements = parent.querySelectorAll('div.markdown.prose.w-full.break-words,li');
        chatRecordElements.forEach(processElement);
    });
}

let rerunTimeout;
// 这个部分是用来检测GPT是否在更新的
function checkUpdateStatus() {
    if (rerunTimeout) {
        clearTimeout(rerunTimeout); // 清除延时
        console.log('[Debug] 清除之前的延时');
    }
    // 设置延时，等待0.5秒
    rerunTimeout = setTimeout(processAllElements, 500);
}

////////////////////////// Settings functions //////////////////////////

function closeModal(settingConfirm) {
    settingConfirm.style.display = 'flex';
}

function createConfirmModal(modal) {
    const settingConfirm = document.createElement('div');
    settingConfirm.className = 'setting-confirm';
    const confirmContent = document.createElement('div');
    confirmContent.className = 'confirm-content';
    const confirmText = document.createElement('p');
    confirmText.textContent = '确定放弃修改？';
    const confirmYes = document.createElement('button');
    confirmYes.className = 'settings-button';
    confirmYes.textContent = '确定';
    const confirmNo = document.createElement('button');
    confirmNo.className = 'settings-button';
    confirmNo.textContent = '取消';
    confirmYes.onclick = function() {
        modal.remove();
        settingConfirm.style.display = 'none'; // Hide the confirm box
    }

    confirmNo.onclick = function() {
        settingConfirm.style.display = 'none'; // Hide the confirm box
    }

    confirmContent.appendChild(confirmText);
    confirmContent.appendChild(confirmYes);
    confirmContent.appendChild(confirmNo);
    settingConfirm.appendChild(confirmContent);
    return settingConfirm;
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
    submitButton.className = 'settings-button';
    submitButton.textContent = '保存设置';

    const cancelButton = document.createElement('button');
    cancelButton.className = 'settings-button';
    cancelButton.textContent = '取消修改';

    const settingsDropdown = document.createElement('select');
    settingsDropdown.className = 'settings-dropdown';
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
        if (setting_texts.length <= 1) {
            deleteSettingButton.disabled = true;
        } else {
            deleteSettingButton.disabled = false;
        }
    });

    const newSettingButton = document.createElement('button');
    newSettingButton.textContent = '添加新功能组';
    newSettingButton.className = 'settings-button';
    newSettingButton.addEventListener('click', () => {
        textarea.value = setting_new_setting_text;
        setting_texts.push(textarea.value);
        const option = document.createElement('option');
        option.value = setting_texts.length - 1;
        option.text = setting_new_setting_text.split('\n')[0];
        settingsDropdown.appendChild(option);
        settingsDropdown.value = setting_texts.length - 1;
        deleteSettingButton.disabled = false;
    });
    const deleteSettingButton = document.createElement('button');
    deleteSettingButton.textContent = '删除当前功能组';
    deleteSettingButton.className = 'settings-button';
    deleteSettingButton.addEventListener('click', () => {
        // 如果只剩一个设置，则不进行删除操作
        if (setting_texts.length <= 1) {
            return;
        }

        let toDelete = settingsDropdown.selectedIndex;

        // 从 setting_texts 数组中删除设置
        setting_texts.splice(toDelete, 1);

        // 从 settingsDropdown 中删除对应的选项
        settingsDropdown.remove(toDelete);

        // 如果删除的是第0项或列表中的最后一项，则默认选择第0项
        if (toDelete === 0 || toDelete === setting_texts.length) {
            settingsDropdown.selectedIndex = 0;
            setting_current_index = 0;
        } else {
            // 否则选择之前的项
            settingsDropdown.selectedIndex = toDelete - 1;
            setting_current_index = toDelete - 1;
        }

        // 更新文本区的值为当前选中的设置
        textarea.value = setting_texts[setting_current_index];

        // 保存到 localStorage
        localStorage.setItem(LSID_SETTING_TEXTS, JSON.stringify(setting_texts));
        localStorage.setItem(LSID_SETTING_CURRENT_INDEX, setting_current_index);

        deleteSettingButton.disabled = setting_texts.length <= 1;
    });

    // 检查是否只剩一个设置，如果是，则禁用删除按钮
    if (setting_texts.length <= 1) {
        deleteSettingButton.disabled = true;
    }

    const modeSettingButton = document.createElement('button');
    modeSettingButton.textContent = menuModeText();
    modeSettingButton.className = 'settings-button';
    modeSettingButton.addEventListener('click', () => {
        switchMode();
        modeSettingButton.textContent = menuModeText();
    });

    submitButton.addEventListener('click', () => {
        const selectedSettingIndex = settingsDropdown.selectedIndex;
        if (typeof setting_texts[selectedSettingIndex] === 'undefined') {
            console.error("Trying to save a setting that doesn't exist.");
            return;
        }

        setting_texts[selectedSettingIndex] = textarea.value;
        localStorage.setItem(LSID_SETTING_TEXTS, JSON.stringify(setting_texts));
        localStorage.setItem(LSID_SETTING_CURRENT_INDEX, selectedSettingIndex.toString());
        current_setting_text = textarea.value;
        setting_current_index = selectedSettingIndex;
        if (current_setting_text) {
            updateMenuItems();
            processAllElements();
        }
        modal.remove();
    });

    const settingConfirm = createConfirmModal(modal);
    cancelButton.addEventListener('click', () => {
        closeModal(settingConfirm, modal);
    });

    const buttonsLeft = document.createElement('span');
    const buttonsRight = document.createElement('span');
    buttonsLeft.appendChild(newSettingButton);
    buttonsLeft.appendChild(deleteSettingButton);
    buttonsRight.appendChild(modeSettingButton);

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'buttonsContainer';
    buttonsContainer.appendChild(buttonsLeft);
    buttonsContainer.appendChild(buttonsRight);

    modalContent.appendChild(settingsDropdown);
    modalContent.appendChild(buttonsContainer);
    modalContent.appendChild(textarea);
    modalContent.appendChild(submitButton);
    modalContent.appendChild(cancelButton);
    modal.appendChild(modalContent);
    modal.appendChild(settingConfirm);
    document.body.appendChild(modal);
}

function showAddTemplateModal(selectText) {
    let choosedIndex = setting_current_index;

    const modal = document.createElement('div');
    modal.className = 'settings-modal';

    const labelText = document.createElement('p');
    labelText.textContent = '将内容添加到选定功能组';

    const modalContent = document.createElement('div');
    modalContent.className = 'settings-content';

    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.placeholder = '这里填写会出现在菜单上的功能名称';
    inputField.className = 'settings-input';

    const labelInstruction = document.createElement('p');
    labelInstruction.textContent = '下方是 prompt 模版，使用 {__PLACE_HOLDER__} 作为占位符。'

    const textarea = document.createElement('textarea');
    textarea.className = 'settings-textarea';
    textarea.value = selectText;

    const submitButton = document.createElement('button');
    submitButton.className = 'settings-button';
    submitButton.textContent = '添加到选定功能组';
    submitButton.disabled = true;

    function updateSubmitButton() {
        if (inputField.value.trim() == '' || textarea.value.trim() == '') {
            submitButton.disabled = true;
        } else {
            submitButton.disabled = false;
        }
    }
    inputField.addEventListener('input', updateSubmitButton);
    textarea.addEventListener('input', updateSubmitButton);

    const cancelButton = document.createElement('button');
    cancelButton.className = 'settings-button';
    cancelButton.textContent = '取消';

    const settingsDropdown = document.createElement('select');
    settingsDropdown.className = 'settings-dropdown';
    setting_texts.forEach((text, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.text = text.split('\n')[0]; // Assuming the first line is a title or identifier
        settingsDropdown.appendChild(option);
    });
    settingsDropdown.selectedIndex = choosedIndex;
    settingsDropdown.addEventListener('change', (e) => {
        choosedIndex = e.target.value;
    });

    submitButton.addEventListener('click', () => {
        choosedIndex = settingsDropdown.selectedIndex;
        if (typeof setting_texts[choosedIndex] === 'undefined') {
            console.error("Trying to save a setting that doesn't exist.");
            return;
        }

        let original = setting_texts[choosedIndex];
        let toAdd = '\n🪄🪄🪄🪄🪄🪄🪄🪄\n' + inputField.value + '\n' + textarea.value + '\n';
        // 找到 original 中第一个 📖📖📖📖📖📖📖📖 的位置，在此之前插入 textarea.value
        // 如果没有找到，则在末尾插入
        let index = original.indexOf('📖📖📖📖📖📖📖📖');
        if (index >= 0) {
            setting_texts[choosedIndex] = original.slice(0, index) + toAdd + original.slice(index);
        } else {
            setting_texts[choosedIndex] = original + toAdd;
        }

        localStorage.setItem(LSID_SETTING_TEXTS, JSON.stringify(setting_texts));
        current_setting_text = setting_texts[setting_current_index];
        if (current_setting_text) {
            updateMenuItems();
            processAllElements();
        }
        modal.remove();
    });

    const settingConfirm = createConfirmModal(modal);

    cancelButton.addEventListener('click', () => {
        closeModal(settingConfirm, modal);
    });

    modalContent.appendChild(labelText);
    modalContent.appendChild(settingsDropdown);
    modalContent.appendChild(inputField);
    modalContent.appendChild(labelInstruction);
    modalContent.appendChild(textarea);
    modalContent.appendChild(submitButton);
    modalContent.appendChild(cancelButton);
    modal.appendChild(modalContent);
    modal.appendChild(settingConfirm);
    document.body.appendChild(modal);
}

let menus = [];
let clicks = []

function parseMenus(settingsText) {
    const buttonData = settingsText.split("🪄🪄🪄🪄🪄🪄🪄🪄").slice(1);
    buttonData.forEach(data => {
        const lines = data.trim().split("\n");
        if (lines.length >= 2) {
            const name = lines[0];
            const content = lines.slice(1).join("\n");
            menus.push([name, content]);
        }
    });
}

function parseClicks(settingText) {
    // 根据 📖📖📖📖📖📖📖📖 分割设置文件，并移除首尾的空值
    const configArray = settingText.split('📖📖📖📖📖📖📖📖').filter(Boolean);

    let templates = []

    // 遍历每个设置
    configArray.forEach(config => {
        // 按行分割配置
        const lines = config.trim().split('\n');
        // 第一行是政策表达式
        const regExpression = new RegExp(lines[0], 'g');
        // 后续行组成替换模板
        const template = lines.slice(1).join('\n');
        templates.push(template);

        // 逐一检查 templates 中是否有能够匹配 regExpression 的模板
        // 如果有，新的内容需要添加在该 templates 前面，以避免被之前的模板匹配
        let index = clicks.findIndex(c => c[1].match(regExpression));
        if (index >=0) {
            // 如果有匹配的模板，则将新的[regExpression, template] 插入到该模板前面
            clicks.splice(index, 0, [regExpression, template]);

        } else {
            // 如果没有匹配的模板，则将新的[regExpression, template] 添加到数组末尾
            clicks.push([regExpression, template]);
        }
    });

    console.log(clicks);
}


function parseSettingsText(settingsText) {
    menus.length = 0; // Clear the existing array
    clicks.length = 0; // Clear the existing array

    let splitted = settingsText.split("📖📖📖📖📖📖📖📖")
    if (splitted.length < 2) {
        parseMenus(settingsText);
    } else {
        parseMenus(splitted[0]);
        parseClicks(splitted.slice(1).join("📖📖📖📖📖📖📖📖"));
    }
}

////////////////////////// Main //////////////////////////

initContextMenu();
const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.name.includes('https://chat.openai.com/backend-api/conversation')) {
            checkUpdateStatus();
        }
    }
});
observer.observe({ entryTypes: ['resource'] });

