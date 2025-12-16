/**
 * 设备控制模块
 * 使用 AutoJS6 的无障碍服务进行设备操作
 */

var TIMING_CONFIG = require('../config/timing');
var APP_PACKAGES = require('../config/apps');
var logger = require('../utils/logger');

var DeviceControl = {};

/**
 * 点击指定坐标
 * @param {number} x - X 坐标
 * @param {number} y - Y 坐标
 * @param {number} delay - 延迟时间(秒)
 */
DeviceControl.tap = function (x, y, delay) {
    if (delay === null || delay === undefined) {
        delay = TIMING_CONFIG.device.default_tap_delay;
    }

    try {
        logger.debug("点击: (" + x + ", " + y + ")");
        click(x, y);
        sleep(delay * 1000);
        return true;
    } catch (e) {
        logger.error("点击失败: " + e);
        return false;
    }
};

/**
 * 双击指定坐标
 * @param {number} x - X 坐标
 * @param {number} y - Y 坐标
 * @param {number} delay - 延迟时间(秒)
 */
DeviceControl.doubleTap = function (x, y, delay) {
    if (delay === null || delay === undefined) {
        delay = TIMING_CONFIG.device.default_double_tap_delay;
    }

    try {
        logger.debug("双击: (" + x + ", " + y + ")");
        click(x, y);
        sleep(TIMING_CONFIG.device.double_tap_interval * 1000);
        click(x, y);
        sleep(delay * 1000);
        return true;
    } catch (e) {
        logger.error("双击失败: " + e);
        return false;
    }
};

/**
 * 长按指定坐标
 * @param {number} x - X 坐标
 * @param {number} y - Y 坐标
 * @param {number} durationMs - 长按时长(毫秒)
 * @param {number} delay - 延迟时间(秒)
 */
DeviceControl.longPress = function (x, y, durationMs, delay) {
    if (durationMs === undefined) durationMs = 3000;
    if (delay === null || delay === undefined) {
        delay = TIMING_CONFIG.device.default_long_press_delay;
    }

    try {
        logger.debug("长按: (" + x + ", " + y + "), 时长: " + durationMs + "ms");
        press(x, y, durationMs);
        sleep(delay * 1000);
        return true;
    } catch (e) {
        logger.error("长按失败: " + e);
        return false;
    }
};

/**
 * 滑动操作
 * @param {number} x1 - 起点 X
 * @param {number} y1 - 起点 Y
 * @param {number} x2 - 终点 X
 * @param {number} y2 - 终点 Y
 * @param {number} durationMs - 滑动时长(毫秒)
 * @param {number} delay - 延迟时间(秒)
 */
DeviceControl.swipe = function (x1, y1, x2, y2, durationMs, delay) {
    if (delay === null || delay === undefined) {
        delay = TIMING_CONFIG.device.default_swipe_delay;
    }

    if (durationMs === null || durationMs === undefined) {
        // 根据距离计算时长
        var distSq = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
        durationMs = Math.floor(distSq / 1000);
        durationMs = Math.max(1000, Math.min(durationMs, 2000)); // 限制在 1000-2000ms
    }

    try {
        logger.debug("滑动: (" + x1 + ", " + y1 + ") -> (" + x2 + ", " + y2 + "), 时长: " + durationMs + "ms");
        swipe(x1, y1, x2, y2, durationMs);
        sleep(delay * 1000);
        return true;
    } catch (e) {
        logger.error("滑动失败: " + e);
        return false;
    }
};

/**
 * 按返回键
 * @param {number} delay - 延迟时间(秒)
 */
DeviceControl.pressBack = function (delay) {
    if (delay === null || delay === undefined) {
        delay = TIMING_CONFIG.device.default_back_delay;
    }

    try {
        logger.debug("按返回键");
        back();
        sleep(delay * 1000);
        return true;
    } catch (e) {
        logger.error("返回键失败: " + e);
        return false;
    }
};

/**
 * 按主页键
 * @param {number} delay - 延迟时间(秒)
 */
DeviceControl.pressHome = function (delay) {
    if (delay === null || delay === undefined) {
        delay = TIMING_CONFIG.device.default_home_delay;
    }

    try {
        logger.debug("按主页键");
        home();
        sleep(delay * 1000);
        return true;
    } catch (e) {
        logger.error("主页键失败: " + e);
        return false;
    }
};

/**
 * 启动应用
 * @param {string} appName - 应用名称或包名
 * @param {number} delay - 延迟时间(秒)
 */
DeviceControl.launchApp = function (appName, delay) {
    if (delay === null || delay === undefined) {
        delay = TIMING_CONFIG.device.default_launch_delay;
    }

    try {
        // 检查是否是应用名称,需要转换为包名
        var packageName = appName;
        if (APP_PACKAGES[appName]) {
            packageName = APP_PACKAGES[appName];
        }

        logger.info("启动应用: " + appName + " (" + packageName + ")");

        var success = app.launch(packageName);

        if (success) {
            sleep(delay * 1000);
            return true;
        } else {
            logger.error("应用启动失败: " + appName);
            return false;
        }
    } catch (e) {
        logger.error("启动应用异常: " + e);
        return false;
    }
};

/**
 * 等待指定时间
 * @param {number} seconds - 等待秒数
 */
DeviceControl.wait = function (seconds) {
    logger.debug("等待 " + seconds + " 秒");
    sleep(seconds * 1000);
};

module.exports = DeviceControl;
