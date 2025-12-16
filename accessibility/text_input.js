/**
 * 文本输入模块
 * 使用多种方式实现文本输入功能
 */

var TIMING_CONFIG = require('../config/timing');
var logger = require('../utils/logger');

var TextInput = {};

/**
 * 输入文本
 * @param {string} text - 要输入的文本
 * @param {number} delay - 延迟时间(秒)
 * @returns {boolean} 是否成功
 */
TextInput.typeText = function (text, delay) {
    if (delay === null || delay === undefined) {
        delay = TIMING_CONFIG.device.default_type_delay;
    }

    try {
        logger.debug("输入文本: " + text);

        // 方法1: 尝试使用 setText (最快)
        if (TextInput.setTextDirect(text)) {
            sleep(delay * 1000);
            return true;
        }

        // 方法2: 尝试使用剪贴板粘贴
        if (TextInput.setTextViaClipboard(text)) {
            sleep(delay * 1000);
            return true;
        }

        // 方法3: 使用 input 函数 (最慢但最可靠)
        if (TextInput.setTextViaInput(text)) {
            sleep(delay * 1000);
            return true;
        }

        logger.error("所有输入方法均失败");
        return false;

    } catch (e) {
        logger.error("输入文本失败: " + e);
        return false;
    }
};

/**
 * 方法1: 直接设置文本 (使用无障碍服务)
 * @param {string} text - 文本内容
 * @returns {boolean} 是否成功
 */
TextInput.setTextDirect = function (text) {
    try {
        // 查找当前焦点的输入框
        var inputNode = className("EditText").findOne(1000);

        if (inputNode) {
            inputNode.setText(text);
            logger.debug("使用 setText 输入成功");
            return true;
        }

        return false;
    } catch (e) {
        logger.debug("setText 失败: " + e);
        return false;
    }
};

/**
 * 方法2: 通过剪贴板粘贴
 * @param {string} text - 文本内容
 * @returns {boolean} 是否成功
 */
TextInput.setTextViaClipboard = function (text) {
    try {
        // 保存当前剪贴板内容
        var oldClip = getClip();

        // 设置剪贴板
        setClip(text);

        // 查找输入框并长按触发粘贴
        var inputNode = className("EditText").findOne(1000);

        if (inputNode) {
            var bounds = inputNode.bounds();
            var x = bounds.centerX();
            var y = bounds.centerY();

            // 长按输入框
            press(x, y, 500);
            sleep(500);

            // 尝试点击"粘贴"按钮
            var pasteBtn = textMatches(/(粘贴|Paste)/).findOne(1000);
            if (pasteBtn) {
                pasteBtn.click();
                sleep(300);

                // 恢复剪贴板
                if (oldClip) {
                    setClip(oldClip);
                }

                logger.debug("使用剪贴板输入成功");
                return true;
            }
        }

        // 恢复剪贴板
        if (oldClip) {
            setClip(oldClip);
        }

        return false;
    } catch (e) {
        logger.debug("剪贴板方法失败: " + e);
        return false;
    }
};

/**
 * 方法3: 使用 input 函数 (模拟键盘输入)
 * @param {string} text - 文本内容
 * @returns {boolean} 是否成功
 */
TextInput.setTextViaInput = function (text) {
    try {
        // 先点击输入框获取焦点
        var inputNode = className("EditText").findOne(1000);

        if (inputNode) {
            inputNode.click();
            sleep(300);

            // 使用 input 函数输入
            input(text);
            logger.debug("使用 input 输入成功");
            return true;
        }

        return false;
    } catch (e) {
        logger.debug("input 方法失败: " + e);
        return false;
    }
};

/**
 * 清空文本
 * @param {number} delay - 延迟时间(秒)
 * @returns {boolean} 是否成功
 */
TextInput.clearText = function (delay) {
    if (delay === null || delay === undefined) {
        delay = TIMING_CONFIG.device.default_clear_delay;
    }

    try {
        logger.debug("清空文本");

        // 查找输入框
        var inputNode = className("EditText").findOne(1000);

        if (inputNode) {
            inputNode.setText("");
            sleep(delay * 1000);
            return true;
        }

        logger.error("未找到输入框");
        return false;

    } catch (e) {
        logger.error("清空文本失败: " + e);
        return false;
    }
};

module.exports = TextInput;
