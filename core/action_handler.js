/**
 * 动作处理器
 * 解析并执行 AI 模型返回的动作
 */

var deviceControl = require('../accessibility/device_control');
var textInput = require('../accessibility/text_input');
var logger = require('../utils/logger');

function ActionHandler() {
    var self = this;
    this.actionHandlers = {
        // 基础操作
        'Launch': function (a, w, h) { return self.handleLaunch(a, w, h); },
        'Tap': function (a, w, h) { return self.handleTap(a, w, h); },
        'Type': function (a, w, h) { return self.handleType(a, w, h); },
        'Type_Name': function (a, w, h) { return self.handleType(a, w, h); },
        'Swipe': function (a, w, h) { return self.handleSwipe(a, w, h); },
        'Back': function (a, w, h) { return self.handleBack(a, w, h); },
        'Home': function (a, w, h) { return self.handleHome(a, w, h); },
        'Double Tap': function (a, w, h) { return self.handleDoubleTap(a, w, h); },
        'Long Press': function (a, w, h) { return self.handleLongPress(a, w, h); },
        'Wait': function (a, w, h) { return self.handleWait(a, w, h); },
        // 特殊操作
        'Take_over': function (a, w, h) { return self.handleTakeover(a, w, h); },
        'Note': function (a, w, h) { return self.handleNote(a, w, h); },
        'Call_API': function (a, w, h) { return self.handleCallAPI(a, w, h); },
        'Interact': function (a, w, h) { return self.handleInteract(a, w, h); }
    };
}

/**
 * 执行动作
 * @param {Object} action - 动作对象
 * @param {number} screenWidth - 屏幕宽度
 * @param {number} screenHeight - 屏幕高度
 * @returns {Object} {success, shouldFinish, message}
 */
ActionHandler.prototype.execute = function (action, screenWidth, screenHeight) {
    try {
        // 处理 finish 动作
        if (action._metadata === 'finish') {
            return {
                success: true,
                shouldFinish: true,
                message: action.message || "任务完成"
            };
        }

        // 处理 do 动作
        if (action._metadata === 'do') {
            var actionName = action.action;

            logger.info("执行动作: " + actionName);

            // 获取处理函数
            var handler = this.actionHandlers[actionName];

            if (!handler) {
                logger.error("未知动作: " + actionName);
                return {
                    success: false,
                    shouldFinish: false,
                    message: "未知动作: " + actionName
                };
            }

            // 执行动作
            return handler(action, screenWidth, screenHeight);
        }

        // 未知的 _metadata
        logger.error("未知动作类型: " + action._metadata);
        return {
            success: false,
            shouldFinish: true,
            message: "未知动作类型: " + action._metadata
        };

    } catch (e) {
        logger.error("动作执行失败: " + e);
        return {
            success: false,
            shouldFinish: false,
            message: "动作执行失败: " + e
        };
    }
};

/**
 * 转换相对坐标 (0-1000) 到绝对像素坐标
 * @param {Array} element - [x, y] 相对坐标
 * @param {number} screenWidth - 屏幕宽度
 * @param {number} screenHeight - 屏幕高度
 * @returns {Array} [x, y] 绝对坐标
 */
ActionHandler.prototype.convertCoordinates = function (element, screenWidth, screenHeight) {
    var relX = element[0];
    var relY = element[1];

    var absX = Math.floor((relX / 1000) * screenWidth);
    var absY = Math.floor((relY / 1000) * screenHeight);

    return [absX, absY];
};

/**
 * 处理启动应用
 */
ActionHandler.prototype.handleLaunch = function (action, width, height) {
    var appName = action.app;

    if (!appName) {
        return {
            success: false,
            shouldFinish: false,
            message: "缺少 app 参数"
        };
    }

    var success = deviceControl.launchApp(appName);

    return {
        success: success,
        shouldFinish: false,
        message: success ? "已启动 " + appName : "启动 " + appName + " 失败"
    };
};

/**
 * 处理点击
 */
ActionHandler.prototype.handleTap = function (action, width, height) {
    var element = action.element;

    if (!element || element.length !== 2) {
        return {
            success: false,
            shouldFinish: false,
            message: "缺少或无效的 element 参数"
        };
    }

    var coords = this.convertCoordinates(element, width, height);
    var x = coords[0];
    var y = coords[1];
    var success = deviceControl.tap(x, y);

    return {
        success: success,
        shouldFinish: false,
        message: success ? "已点击 (" + x + ", " + y + ")" : "点击失败"
    };
};

/**
 * 处理双击
 */
ActionHandler.prototype.handleDoubleTap = function (action, width, height) {
    var element = action.element;

    if (!element || element.length !== 2) {
        return {
            success: false,
            shouldFinish: false,
            message: "缺少或无效的 element 参数"
        };
    }

    var coords = this.convertCoordinates(element, width, height);
    var x = coords[0];
    var y = coords[1];
    var success = deviceControl.doubleTap(x, y);

    return {
        success: success,
        shouldFinish: false,
        message: success ? "已双击 (" + x + ", " + y + ")" : "双击失败"
    };
};

/**
 * 处理长按
 */
ActionHandler.prototype.handleLongPress = function (action, width, height) {
    var element = action.element;
    var durationMs = action.duration_ms || 3000;

    if (!element || element.length !== 2) {
        return {
            success: false,
            shouldFinish: false,
            message: "缺少或无效的 element 参数"
        };
    }

    var coords = this.convertCoordinates(element, width, height);
    var x = coords[0];
    var y = coords[1];
    var success = deviceControl.longPress(x, y, durationMs);

    return {
        success: success,
        shouldFinish: false,
        message: success ? "已长按 (" + x + ", " + y + ")" : "长按失败"
    };
};

/**
 * 处理文本输入
 */
ActionHandler.prototype.handleType = function (action, width, height) {
    var text = action.text;

    if (!text) {
        return {
            success: false,
            shouldFinish: false,
            message: "缺少 text 参数"
        };
    }

    var success = textInput.typeText(text);

    return {
        success: success,
        shouldFinish: false,
        message: success ? "已输入: " + text : "输入失败"
    };
};

/**
 * 处理滑动
 */
ActionHandler.prototype.handleSwipe = function (action, width, height) {
    var start = action.start;
    var end = action.end;
    var durationMs = action.duration_ms || null;

    if (!start || start.length !== 2 || !end || end.length !== 2) {
        return {
            success: false,
            shouldFinish: false,
            message: "缺少或无效的 start/end 参数"
        };
    }

    var coords1 = this.convertCoordinates(start, width, height);
    var coords2 = this.convertCoordinates(end, width, height);
    var x1 = coords1[0], y1 = coords1[1];
    var x2 = coords2[0], y2 = coords2[1];

    var success = deviceControl.swipe(x1, y1, x2, y2, durationMs);

    return {
        success: success,
        shouldFinish: false,
        message: success ? "已滑动 (" + x1 + "," + y1 + ") -> (" + x2 + "," + y2 + ")" : "滑动失败"
    };
};

/**
 * 处理返回键
 */
ActionHandler.prototype.handleBack = function (action, width, height) {
    var success = deviceControl.pressBack();

    return {
        success: success,
        shouldFinish: false,
        message: success ? "已按返回键" : "返回键失败"
    };
};

/**
 * 处理主页键
 */
ActionHandler.prototype.handleHome = function (action, width, height) {
    var success = deviceControl.pressHome();

    return {
        success: success,
        shouldFinish: false,
        message: success ? "已按主页键" : "主页键失败"
    };
};

/**
 * 处理等待
 */
ActionHandler.prototype.handleWait = function (action, width, height) {
    var durationStr = action.duration || "2 seconds";
    var seconds = 2;

    // 解析 duration 字符串 (例如 "3 seconds")
    try {
        var match = durationStr.match(/(\d+\.?\d*)/);
        if (match) {
            seconds = parseFloat(match[1]);
        }
    } catch (e) {
        logger.warn("无法解析 duration: " + durationStr + ", 使用默认值 2 秒");
    }

    deviceControl.wait(seconds);

    return {
        success: true,
        shouldFinish: false,
        message: "已等待 " + seconds + " 秒"
    };
};

/**
 * 处理接管请求 (登录、验证码等)
 */
ActionHandler.prototype.handleTakeover = function (action, width, height) {
    var message = action.message || "需要用户介入";

    logger.warn("接管请求: " + message);
    ui.run(function () {
        toast("需要用户操作: " + message);
    });

    return {
        success: true,
        shouldFinish: false,
        message: "等待用户操作: " + message
    };
};

/**
 * 处理记录操作 (记录页面内容)
 */
ActionHandler.prototype.handleNote = function (action, width, height) {
    var message = action.message || "True";

    logger.info("记录页面内容: " + message);

    return {
        success: true,
        shouldFinish: false,
        message: "已记录页面内容"
    };
};

/**
 * 处理API调用 (总结、评论等)
 */
ActionHandler.prototype.handleCallAPI = function (action, width, height) {
    var instruction = action.instruction || "";

    logger.info("API调用: " + instruction);

    return {
        success: true,
        shouldFinish: false,
        message: "API调用: " + instruction
    };
};

/**
 * 处理交互请求 (需要用户选择)
 */
ActionHandler.prototype.handleInteract = function (action, width, height) {
    logger.warn("需要用户交互选择");

    ui.run(function () {
        toast("有多个选项，需要用户选择");
    });

    return {
        success: true,
        shouldFinish: false,
        message: "需要用户交互选择"
    };
};

/**
 * 解析动作字符串
 * 参考 Python 版本的 parse_action 函数
 * @param {string} response - 模型返回的 action 字符串
 * @returns {Object} 动作对象
 */
function parseAction(response) {
    try {
        response = response.trim();

        // 处理 do() 格式: do(action="Tap", element=[x,y])
        if (response.indexOf('do(') === 0) {
            // 提取 do() 内部的参数
            var innerContent = response.substring(3, response.length - 1);

            // 解析关键字参数
            var action = { _metadata: 'do' };
            var params = parseKeywordArguments(innerContent);

            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    action[key] = params[key];
                }
            }

            return action;
        }

        // 处理 finish() 格式: finish(message="xxx")
        else if (response.indexOf('finish(') === 0) {
            // 提取 message 参数
            var messageMatch = response.match(/finish\(message=["'](.*)["']\)/);
            var message = "任务完成";

            if (messageMatch && messageMatch[1]) {
                message = messageMatch[1];
            } else {
                // 尝试更简单的提取
                var simpleMatch = response.replace('finish(message=', '').replace(/["']/g, '');
                if (simpleMatch && simpleMatch.length > 0 && simpleMatch !== response) {
                    message = simpleMatch.substring(0, simpleMatch.length - 1);
                }
            }

            return {
                _metadata: 'finish',
                message: message
            };
        }

        // 无法识别的格式
        else {
            logger.error("无法解析动作格式: " + response);
            return {
                _metadata: 'finish',
                message: response
            };
        }

    } catch (e) {
        logger.error("解析动作失败: " + e);
        return {
            _metadata: 'finish',
            message: response
        };
    }
}

/**
 * 解析关键字参数 (key=value 格式)
 * @param {string} argsStr - 参数字符串
 * @returns {Object} 解析后的参数对象
 */
function parseKeywordArguments(argsStr) {
    var result = {};

    if (!argsStr || argsStr.trim().length === 0) {
        return result;
    }

    // 使用更智能的分割方式,处理嵌套的数组和字符串
    var params = smartSplit(argsStr, ',');

    for (var i = 0; i < params.length; i++) {
        var param = params[i].trim();

        // 找到第一个 = 号
        var eqIndex = param.indexOf('=');
        if (eqIndex === -1) continue;

        var key = param.substring(0, eqIndex).trim();
        var value = param.substring(eqIndex + 1).trim();

        // 解析值
        result[key] = parseValue(value);
    }

    return result;
}

/**
 * 智能分割字符串,考虑引号和括号
 * @param {string} str - 要分割的字符串
 * @param {string} delimiter - 分隔符
 * @returns {Array} 分割后的数组
 */
function smartSplit(str, delimiter) {
    var result = [];
    var current = '';
    var inQuotes = false;
    var inBrackets = 0;
    var quoteChar = '';

    for (var i = 0; i < str.length; i++) {
        var char = str[i];

        // 处理引号
        if ((char === '"' || char === "'") && (i === 0 || str[i - 1] !== '\\')) {
            if (!inQuotes) {
                inQuotes = true;
                quoteChar = char;
            } else if (char === quoteChar) {
                inQuotes = false;
                quoteChar = '';
            }
            current += char;
        }
        // 处理括号
        else if (char === '[' && !inQuotes) {
            inBrackets++;
            current += char;
        }
        else if (char === ']' && !inQuotes) {
            inBrackets--;
            current += char;
        }
        // 处理分隔符
        else if (char === delimiter && !inQuotes && inBrackets === 0) {
            if (current.trim().length > 0) {
                result.push(current.trim());
            }
            current = '';
        }
        // 普通字符
        else {
            current += char;
        }
    }

    // 添加最后一个参数
    if (current.trim().length > 0) {
        result.push(current.trim());
    }

    return result;
}

/**
 * 解析值 (字符串、数字、数组等)
 * @param {string} valueStr - 值字符串
 * @returns {*} 解析后的值
 */
function parseValue(valueStr) {
    valueStr = valueStr.trim();

    // 空值
    if (valueStr.length === 0) {
        return '';
    }

    // 字符串 (带引号)
    if ((valueStr[0] === '"' && valueStr[valueStr.length - 1] === '"') ||
        (valueStr[0] === "'" && valueStr[valueStr.length - 1] === "'")) {
        return valueStr.substring(1, valueStr.length - 1);
    }

    // 数组
    if (valueStr[0] === '[' && valueStr[valueStr.length - 1] === ']') {
        try {
            return JSON.parse(valueStr);
        } catch (e) {
            logger.warn("无法解析数组: " + valueStr);
            return valueStr;
        }
    }

    // 数字
    if (!isNaN(valueStr) && valueStr.length > 0) {
        return Number(valueStr);
    }

    // 布尔值
    if (valueStr === 'true' || valueStr === 'True') {
        return true;
    }
    if (valueStr === 'false' || valueStr === 'False') {
        return false;
    }

    // 默认返回字符串
    return valueStr;
}

module.exports = ActionHandler;
module.exports.parseAction = parseAction;
