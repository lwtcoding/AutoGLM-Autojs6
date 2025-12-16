/**
 * Phone Agent 核心
 * 任务编排和执行控制
 */

var ModelClient = require('./model_client');
var MessageBuilder = require('./message_builder');
var ActionHandler = require('./action_handler');
var screenCapture = require('../accessibility/screen_capture');
var appDetector = require('../accessibility/app_detector');
var SYSTEM_PROMPTS = require('../config/system_prompt');
var logger = require('../utils/logger');

function PhoneAgent(modelConfig, agentConfig) {
    // 模型配置
    this.modelClient = new ModelClient(modelConfig);

    // Agent 配置
    this.maxSteps = agentConfig.maxSteps || 100;
    this.verbose = agentConfig.verbose !== false;
    this.lang = agentConfig.lang || 'cn';
    this.systemPrompt = SYSTEM_PROMPTS[this.lang];

    // 动作处理器
    this.actionHandler = new ActionHandler();

    // 上下文和状态
    this.context = [];
    this.stepCount = 0;
    this.isRunning = false;
}

/**
 * 运行任务
 * @param {string} task - 任务描述
 * @param {Function} onStep - 步骤回调 (可选)
 * @returns {string} 最终消息
 */
PhoneAgent.prototype.run = function (task, onStep) {
    try {
        this.isRunning = true;
        this.context = [];
        this.stepCount = 0;

        logger.info("开始任务: " + task);

        // 第一步 (带用户任务)
        var result = this.executeStep(task, true);

        if (onStep) {
            onStep(result);
        }

        if (result.finished) {
            return result.message || "任务完成";
        }

        // 继续执行直到完成或达到最大步数
        while (this.stepCount < this.maxSteps && this.isRunning) {
            result = this.executeStep(null, false);

            if (onStep) {
                onStep(result);
            }

            if (result.finished) {
                return result.message || "任务完成";
            }
        }

        if (!this.isRunning) {
            return "任务已取消";
        }

        return "达到最大步数限制";

    } catch (e) {
        logger.error("任务执行失败: " + e);
        return "任务失败: " + e;
    } finally {
        this.isRunning = false;
    }
};

/**
 * 执行单步
 * @param {string} userPrompt - 用户提示 (仅第一步)
 * @param {boolean} isFirst - 是否第一步
 * @returns {Object} {success, finished, action, thinking, message}
 */
PhoneAgent.prototype.executeStep = function (userPrompt, isFirst) {
    try {
        this.stepCount++;
        logger.info("执行第 " + this.stepCount + " 步");

        // 1. 获取屏幕截图
        var screenshot = screenCapture.captureScreen();

        if (!screenshot) {
            throw new Error("截图失败");
        }

        // 2. 检测当前应用
        var currentApp = appDetector.getCurrentApp();
        logger.debug("当前应用: " + currentApp);

        // 3. 构建消息
        if (isFirst) {
            // 添加系统消息
            this.context.push(MessageBuilder.createSystemMessage(this.systemPrompt));

            // 添加用户消息 (带任务和截图)
            var screenInfo = MessageBuilder.buildScreenInfo(currentApp);
            var textContent = userPrompt + "\n\n** Screen Info **\n\n" + screenInfo;

            this.context.push(
                MessageBuilder.createUserMessage(textContent, screenshot.base64Data)
            );
        } else {
            // 添加屏幕信息
            var screenInfo = MessageBuilder.buildScreenInfo(currentApp);
            var textContent = "** Screen Info **\n\n" + screenInfo;

            this.context.push(
                MessageBuilder.createUserMessage(textContent, screenshot.base64Data)
            );
        }

        // 4. 请求模型
        logger.info("💭 正在思考...");
        var response = this.modelClient.request(this.context);

        if (this.verbose) {
            logger.info("思考: " + response.thinking);
            logger.info("动作: " + response.action);
        }

        // 5. 解析动作
        var action = ActionHandler.parseAction(response.action);

        // 6. 移除图片节省空间
        this.context[this.context.length - 1] = MessageBuilder.removeImagesFromMessage(
            this.context[this.context.length - 1]
        );

        // 7. 执行动作
        var actionResult = this.actionHandler.execute(
            action,
            screenshot.width,
            screenshot.height
        );

        // 8. 添加助手响应到上下文
        this.context.push(
            MessageBuilder.createAssistantMessage(
                "<think>" + response.thinking + "</think><answer>" + response.action + "</answer>"
            )
        );

        // 9. 检查是否完成
        var finished = actionResult.shouldFinish;

        if (finished && this.verbose) {
            logger.info("✅ 任务完成: " + actionResult.message);
        } else {
            sleep(1200);
            logger.info("休息一会: 1200ms");
        }

        return {
            success: actionResult.success,
            finished: finished,
            action: action,
            thinking: response.thinking,
            message: actionResult.message,
            stepCount: this.stepCount
        };

    } catch (e) {
        logger.error("步骤执行失败: " + e);
        return {
            success: false,
            finished: true,
            action: null,
            thinking: "",
            message: "执行失败: " + e,
            stepCount: this.stepCount
        };
    }
};

/**
 * 停止任务
 */
PhoneAgent.prototype.stop = function () {
    logger.info("停止任务");
    this.isRunning = false;
};

/**
 * 重置状态
 */
PhoneAgent.prototype.reset = function () {
    this.context = [];
    this.stepCount = 0;
    this.isRunning = false;
};

/**
 * 获取上下文
 */
PhoneAgent.prototype.getContext = function () {
    return this.context.slice(); // 返回副本
};

/**
 * 获取步数
 */
PhoneAgent.prototype.getStepCount = function () {
    return this.stepCount;
};

module.exports = PhoneAgent;
