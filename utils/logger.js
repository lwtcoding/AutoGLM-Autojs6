/**
 * 日志工具模块
 * 提供统一的日志输出接口
 */

function Logger() {
    this.logLevel = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3
    };
    this.currentLevel = this.logLevel.INFO;
    this.logCallback = null;
}

/**
 * 设置日志级别
 * @param {string} level - DEBUG, INFO, WARN, ERROR
 */
Logger.prototype.setLevel = function (level) {
    if (this.logLevel[level] !== undefined) {
        this.currentLevel = this.logLevel[level];
    }
};

/**
 * 设置日志回调函数 (用于 UI 显示)
 * @param {Function} callback - 回调函数
 */
Logger.prototype.setCallback = function (callback) {
    this.logCallback = callback;
};

/**
 * 格式化日志消息
 * @param {string} level - 日志级别
 * @param {string} message - 消息内容
 * @returns {string} 格式化后的消息
 */
Logger.prototype.format = function (level, message) {
    var timestamp = new Date().toLocaleTimeString();
    return "[" + timestamp + "] [" + level + "] " + message;
};

/**
 * 输出日志
 * @param {number} level - 日志级别
 * @param {string} levelName - 级别名称
 * @param {string} message - 消息内容
 */
Logger.prototype.log = function (level, levelName, message) {
    if (level < this.currentLevel) {
        return;
    }

    var formatted = this.format(levelName, message);

    // 控制台输出
    console.log(formatted);

    // 回调输出 (用于 UI)
    if (this.logCallback) {
        try {
            this.logCallback(formatted);
        } catch (e) {
            console.error("日志回调失败: " + e);
        }
    }
};

Logger.prototype.debug = function (message) {
    this.log(this.logLevel.DEBUG, "DEBUG", message);
};

Logger.prototype.info = function (message) {
    this.log(this.logLevel.INFO, "INFO", message);
};

Logger.prototype.warn = function (message) {
    this.log(this.logLevel.WARN, "WARN", message);
};

Logger.prototype.error = function (message) {
    this.log(this.logLevel.ERROR, "ERROR", message);
};

module.exports = new Logger();
