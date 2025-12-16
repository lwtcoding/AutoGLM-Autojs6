/**
 * 模型客户端
 * 调用 OpenAI 兼容的 API 进行 AI 推理
 */

var httpClient = require('../utils/http_client');
var logger = require('../utils/logger');

function ModelClient(config) {
    this.baseUrl = config.baseUrl || "https://open.bigmodel.cn/api/paas/v4";
    this.modelName = config.modelName || "autoglm-phone";
    this.apiKey = config.apiKey || "EMPTY";
    this.maxTokens = config.maxTokens || 3000;
    this.temperature = config.temperature || 0.0;
    this.topP = config.topP || 0.85;
    this.frequencyPenalty = config.frequencyPenalty || 0.2;
}

/**
 * 发送请求到模型
 * @param {Array} messages - 消息列表
 * @returns {Object} 模型响应 {thinking, action, rawContent}
 */
ModelClient.prototype.request = function (messages) {
    try {
        logger.info("正在请求模型...");

        var url = this.baseUrl + "/chat/completions";

        var requestData = {
            model: this.modelName,
            messages: messages,
            max_tokens: this.maxTokens,
            temperature: this.temperature,
            top_p: this.topP,
            frequency_penalty: this.frequencyPenalty,
            stream: false
        };

        var response = httpClient.postJson(url, requestData, {
            headers: {
                'Authorization': "Bearer " + this.apiKey,
                'Content-Type': 'application/json'
            },
            timeout: 120000 // 120 秒超时
        });

        if (!response.success) {
            throw new Error("API 请求失败: " + response.error);
        }

        var data = response.data;

        if (!data.choices || data.choices.length === 0) {
            throw new Error("API 返回空响应");
        }

        var content = data.choices[0].message.content;
        logger.debug("模型响应: " + content.substring(0, 100) + "...");

        // 解析响应
        var parsed = this.parseResponse(content);

        return {
            thinking: parsed.thinking,
            action: parsed.action,
            rawContent: content
        };

    } catch (e) {
        logger.error("模型请求失败: " + e);
        throw e;
    }
};

/**
 * 解析模型响应
 * @param {string} content - 原始响应内容
 * @returns {Object} {thinking, action}
 */
ModelClient.prototype.parseResponse = function (content) {
    try {
        // 规则1: 如果包含 'finish(message=', 之前是 thinking, 之后是 action
        if (content.indexOf('finish(message=') !== -1) {
            var finishIndex = content.indexOf('finish(message=');
            return {
                thinking: content.substring(0, finishIndex).trim(),
                action: content.substring(finishIndex).trim()
            };
        }

        // 规则2: 如果包含 <think> 和 <answer> 标签
        var thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
        var answerMatch = content.match(/<answer>([\s\S]*?)<\/answer>/);

        if (thinkMatch && answerMatch) {
            return {
                thinking: thinkMatch[1].trim(),
                action: answerMatch[1].trim()
            };
        }

        // 规则3: 如果包含 'do(' 或 'finish(', 之前是 thinking
        var doIndex = content.indexOf('do(');
        var finishIndex2 = content.indexOf('finish(');

        if (doIndex !== -1) {
            return {
                thinking: content.substring(0, doIndex).trim(),
                action: content.substring(doIndex).trim()
            };
        }

        if (finishIndex2 !== -1) {
            return {
                thinking: content.substring(0, finishIndex2).trim(),
                action: content.substring(finishIndex2).trim()
            };
        }

        // 规则4: 默认情况,整个内容作为 action
        return {
            thinking: "",
            action: content.trim()
        };

    } catch (e) {
        logger.error("解析响应失败: " + e);
        return {
            thinking: "",
            action: content
        };
    }
};

module.exports = ModelClient;
