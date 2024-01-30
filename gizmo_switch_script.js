// ==UserScript==
// @name         @GPTs
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  @PGTs 的自助实现方法
// @author       ElfeXu (公众号：南瓜博士)
// @match        https://chat.openai.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    var nameIdMap = {
        '老师': 'g-SUOFbmGvx',
        '单词故事': 'g-5HkDxo4K2',
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

                    // 检查是否以 @ 开头, 或者 gizmoId 变量不为空
                    if (text.startsWith('@')) {
                        // 读取 @ 后的内容直到空格
                        var name = text.split(' ')[0].substring(1);

                        // 查找 @ 的 name 所对应的 id
                        if (name in nameIdMap) {
                            gizmoId = nameIdMap[name]; // 更新对话的 gizmo
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

})();
