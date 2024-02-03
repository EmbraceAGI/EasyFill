// ==UserScript==
// @name         @GPTs
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  @GPTs 的自助实现方法
// @author       ElfeXu (公众号：南瓜博士)
// @match        https://chat.openai.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 在这个列表里添加你想要用 & 唤起的 gizmo
    // 每条记录一行，都用逗号分隔
    // 记录的 : 前面是唤起词，不需要拘泥于原来的名字，怎么简便怎么来就好
    // ：后面是 gizmo id，可以通过 url 找到 gizmo id
    // 例如 https://chat.openai.com/g/g-SUOFbmGvx-cool-teacher Cool taecher 的 id 是 g-SUOFbmGvx
    // 如下设置后就可以用 &老师 来唤起
    var nameIdMap = {
        '老师': 'g-SUOFbmGvx',
        'KK的心灵鸡汤': 'g-xYjexoNlS',
        '围炉夜话': 'g-CaTmdpE0q',
        '科学1':'g-yNMlScqhw',
        '科学2':'g-piCCxtoOY',
        '科学3':'g-iF6xCbmrX',
        '科学4':'g-fio99RM6V',
    };

    var gizmoId = '';


    // 覆写全局的 fetch 方法
    var originalFetch = window.fetch;
    window.fetch = function(resource, init) {
        // 检查 URL 是否匹配
        if (resource === 'https://chat.openai.com/backend-api/conversation') {
            console.log("原始 Fetch 请求信息:", init);

            // 修改请求的 init 参数
            var modifiedInit = modifyFetchRequest(init);
            console.log("修改后的 Fetch 请求信息:", modifiedInit);

            return originalFetch(resource, modifiedInit);
        } else {
            // 对于其他 URL，正常发送
            return originalFetch(resource, init);
        }
    };

    function modifyFetchRequest(init) {
        if (init && init.body) {
            var data = JSON.parse(init.body);

            // 检查 messages 数组的最后一条内容的 content 字段的 parts[0]
            var messages = data.messages;
            if (messages && messages.length > 0) {
                var lastMessage = messages[messages.length - 1];
                var content = lastMessage.content;
                if (content && content.parts && content.parts.length > 0) {
                    var text = content.parts[0];

                    // 检查是否以 & 开头, 或者 gizmoId 变量不为空
                    if (text.startsWith('&')) {
                        // 读取 & 后的内容直到空格
                        var name = text.split(' ')[0].substring(1);

                        // 查找 & 的 name 所对应的 id
                        if (name in nameIdMap) {
                            gizmoId = nameIdMap[name]; // 更新对话的 gizmo
                        } else {
                            if (name == '&') { // 用 && 还原到无 gizmo 的状态
                                gizmoId = '';
                            }
                        }
                    }

                    if (gizmoId) {
                        // 找到 id，进行修改
                        data.model = 'gpt-4-gizmo';
                        data.conversation_mode = {
                            "kind": "gizmo_interaction",
                            "gizmo_id": gizmoId
                        };
                    }
                }
            }

            // 将修改后的 JSON 对象转换回字符串
            init.body = JSON.stringify(data);
        }

        return init;
    }

    (function(history){
        var pushState = history.pushState;
        var replaceState = history.replaceState;

        history.pushState = function(state, title, url) {
            var oriUrl = window.location.href;
            var newUrl = url ? new URL(url, window.location.origin).href : oriUrl;
            // 执行URL变化后的操作
            onUrlChange(oriUrl, newUrl);
            return pushState.apply(history, arguments);
        };

        history.replaceState = function(state, title, url) {
            var oriUrl = window.location.href;
            var newUrl = url ? new URL(url, window.location.origin).href : oriUrl;
            // 执行URL变化后的操作
            onUrlChange(oriUrl, newUrl);
            return replaceState.apply(history, arguments);
        };

    })(window.history);
    
    // 当URL变化时执行的函数
    function onUrlChange(oriUrl, newUrl) {
        console.log(`URL has changed from ${oriUrl} to ${newUrl}`);
        // 将 oriUrl 与 '/c/' 拼接。如果 oriUrl 最后的有 '/' 要先去掉
        oriUrl = (oriUrl.endsWith('/') ? oriUrl.slice(0, -1) : oriUrl) + '/c/';
        if (newUrl.startsWith(oriUrl)) {
            console.log('New ID generated');
            // 这种情况下不重置 gizmo id
        } else {
            // 其他情况下重置 gizmo id
            console.log('切换对话，重置 gizmo id');
            gizmoId = '';
        }
    }

})();
