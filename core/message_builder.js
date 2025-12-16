/**
 * 消息构建器
 * 用于构建 OpenAI 格式的对话消息
 */

var logger = require('../utils/logger');

var MessageBuilder = {};

/**
 * 创建系统消息
 * @param {string} content - 系统提示词
 * @returns {Object} 消息对象
 */
MessageBuilder.createSystemMessage = function (content) {
    return {
        role: "system",
        content: content
    };
};

/**
 * 创建用户消息 (支持图片)
 * @param {string} text - 文本内容
 * @param {string} imageBase64 - Base64 编码的图片 (可选)
 * @returns {Object} 消息对象
 */
MessageBuilder.createUserMessage = function (text, imageBase64) {
    if (imageBase64) {
        // 包含图片的消息
        return {
            role: "user",
            content: [
                {
                    type: "text",
                    text: text
                },
                {
                    type: "image_url",
                    image_url: {
                        url: "data:image/png;base64," + imageBase64
                    }
                }
            ]
        };
    } else {
        // 纯文本消息
        return {
            role: "user",
            content: text
        };
    }
};

/**
 * 创建助手消息
 * @param {string} content - 助手回复内容
 * @returns {Object} 消息对象
 */
MessageBuilder.createAssistantMessage = function (content) {
    return {
        role: "assistant",
        content: content
    };
};

/**
 * 从消息中移除图片 (节省上下文空间)
 * @param {Object} message - 消息对象
 * @returns {Object} 移除图片后的消息
 */
MessageBuilder.removeImagesFromMessage = function (message) {
    if (message.role !== "user") {
        return message;
    }

    // 如果 content 是数组,过滤掉图片
    if (Array.isArray(message.content)) {
        var textContent = message.content.filter(function (item) {
            return item.type === "text";
        });

        if (textContent.length > 0) {
            return {
                role: "user",
                content: textContent[0].text
            };
        }
    }

    return message;
};

/**
 * 构建屏幕信息字符串
 * @param {string} currentApp - 当前应用名称
 * @param {Object} extraInfo - 额外信息
 * @returns {string} JSON 格式的屏幕信息
 */
MessageBuilder.buildScreenInfo = function (currentApp, extraInfo) {
    extraInfo = extraInfo || {};
    var screenInfo = {
        current_app: currentApp
    };

    // 合并额外信息
    for (var key in extraInfo) {
        if (extraInfo.hasOwnProperty(key)) {
            screenInfo[key] = extraInfo[key];
        }
    }

    return JSON.stringify(screenInfo, null, 2);
};

module.exports = MessageBuilder;
