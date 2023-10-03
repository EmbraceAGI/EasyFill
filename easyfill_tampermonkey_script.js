// ==UserScript==
// @name         EasyFill
// @namespace    http://easyfill.tool.elfe/
// @version      0.4
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
📖📖📖📖📖📖📖📖
<strong>(.*?)<\/strong>
可以设置多个直接点击项，每一项用不同的正则匹配即可。让 GPT 输出不同格式的内容，定义成不同的后续行动。
{__PLACE_HOLDER__}
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

    #contextMenu {
        display: none;
        position: absolute;
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
    
    #menuContainer div.menu-item {
        display: flex;
        align-items: center;
        width: auto;
        max-width: calc(200px + 40px + 5px); /* 左侧按钮最大宽度 + 右侧按钮宽度 + 间隔 */
        border-bottom: 1px solid #f0f0f0;
        padding: 5px 0;
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
        background-color: #f1f1f1;
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
    
    #menuContainer button.menu-button img {
        height: 20px;
        width: 20px;
        margin-right: 10px;
    }
    
    #menuContainer button.left-part {
        flex-grow: 1;
        flex-shrink: 0;
        flex-basis: auto;
        max-width: 200px;
        text-align: left;
    }
    
    #menuContainer button.right-part {
        flex-grow: 0;
        flex-shrink: 0;
        width: 30px;
        text-align: right;
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

const styleElement = document.createElement('style');
styleElement.innerHTML = style;
document.head.appendChild(styleElement);


////////////////////////// Easy Fill functions //////////////////////////
let setting_texts = JSON.parse(localStorage.getItem(LSID_SETTING_TEXTS)) || default_setting_texts;
let setting_current_index = localStorage.getItem(LSID_SETTING_CURRENT_INDEX) || 0;
let current_setting_text = setting_texts[setting_current_index];

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

// 创建单个菜单项
function createMenuItem(label, action1, action2) {
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
            contextMenu.style.display = 'none';
        };
    }
    menuItem.appendChild(leftPart);

    if (action2 != null) {
        const rightPart = document.createElement('button')
        rightPart.classList.add('menu-button', 'right-part');
        rightPart.innerHTML = '≋';

        rightPart.onclick = () => {
            action2();
            contextMenu.style.display = 'none';
        };
        menuItem.appendChild(rightPart);
    }
    
    return menuItem;
}

function hideContextMenu() {
    contextMenu.style.display = 'none';
}
function showContextMenu(event) {
    contextMenu.style.left = `${event.clientX}px`;
    contextMenu.style.top = `${event.clientY}px`;
    contextMenu.style.display = 'block';
}

////////////////////////// Easy Click functions //////////////////////////

let isUpdating = false;
let rerunTimeout;
let intervalID;
let shouldContinue = true;

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


function replace_text(original) {
    clicks.forEach(([regExpression, template]) => {
        original = original.replace(regExpression, (match, p1) => {
            // 使用模板替换找到的匹配项
            let replaced = template.replace(/{__PLACE_HOLDER__}/g, p1);
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
    if (isUpdating) {
        return;
    }

    const hidden_characters = "\u200B\u200B\u200B\u200B\u200B\u200B";

    let innerHTML = element.innerHTML;

    if (innerHTML.startsWith(hidden_characters)) {
        return; // 不重复处理
    }

    // 处理[[ ]] 符号
    const bracketRegex = /\[\[(.*?)\]\]/g;
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

// 这个部分是用来检测GPT是否在更新的
function checkUpdateStatus() {
    if (!shouldContinue) return;
    console.log('[Debug] 运行 checkUpdateStatus');
    const allButtons = document.querySelectorAll('button');
    const stopGeneratingElement = Array.from(allButtons).find(el => el.textContent.includes("Stop generating"));
    if (!stopGeneratingElement && isUpdating) { // 内容更新完成
        console.log('内容更新完成，准备添加链接');
        isUpdating = false; // 更新状态设置为false

        if (rerunTimeout) {
            clearTimeout(rerunTimeout); // 清除延时
            console.log('[Debug] 清除之前的延时');
        }
        // 设置延时，等待2秒
        rerunTimeout = setTimeout(() => {
            processAllElements();
            stopListening();
        }, 300);
    }
}

function startListening() {
    isUpdating = true;
    shouldContinue = true;
    intervalID = setInterval(checkUpdateStatus, 1000);
    console.log('监听已开启');
}

function stopListening() {
    shouldContinue = false;
    clearInterval(intervalID);
    console.log('监听已停止');
}

////////////////////////// Settings functions //////////////////////////


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

    const buttonsContainer = document.createElement('div');
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

    buttonsContainer.appendChild(newSettingButton);
    buttonsContainer.appendChild(deleteSettingButton);
    modalContent.appendChild(settingsDropdown);
    modalContent.appendChild(buttonsContainer); 
    modalContent.appendChild(textarea);
    modalContent.appendChild(submitButton);
    modalContent.appendChild(cancelButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

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

    cancelButton.addEventListener('click', () => {
        modal.remove();
    });
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

    modalContent.appendChild(labelText);
    modalContent.appendChild(settingsDropdown); 
    modalContent.appendChild(inputField);
    modalContent.appendChild(labelInstruction);
    modalContent.appendChild(textarea);
    modalContent.appendChild(submitButton);
    modalContent.appendChild(cancelButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

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

    cancelButton.addEventListener('click', () => {
        modal.remove();
    });
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

function updateMenuItems() {
    parseSettingsText(current_setting_text);

    menuContainer.innerHTML = '';
    menus.forEach(menu => {
        menuContainer.appendChild(
            createMenuItem(menu[0], 
                async function() {
                    await sendToGPT(menu[1], window.getSelection().toString().trim(), true);
                },
                async function() {
                    await sendToGPT(menu[1], window.getSelection().toString().trim(), false);
                },
        ));
    });
    menuContainer.appendChild(createMenuItem('设置', function() {showSettingsModal();}, null));
    menuContainer.appendChild(createMenuItem('添加为模版', function() {showAddTemplateModal(window.getSelection().toString().trim());}, null));
}

////////////////////////// Main //////////////////////////

// 创建上下文菜单
const contextMenu = document.createElement('div');
const menuContainer = document.createElement('div');
contextMenu.id = 'contextMenu'; 
menuContainer.id = 'menuContainer';
contextMenu.appendChild(menuContainer);
document.body.appendChild(contextMenu);

updateMenuItems();

document.addEventListener('mouseup', function(event) {
    const selectedText = window.getSelection().toString();
    if (selectedText.length == 0) {
        hideContextMenu();
    } else {
        showContextMenu(event);
    }
});

document.addEventListener('dblclick', function(event) {
    showContextMenu(event);
});

const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.name.includes('https://chat.openai.com/backend-api/conversation')) {
            startListening();
        }
    }
});
observer.observe({ entryTypes: ['resource'] });

