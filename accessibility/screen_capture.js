/**
 * 截图功能模块
 * 使用 AutoJS6 的 images 模块进行屏幕截图
 */

var logger = require('../utils/logger');

function ScreenCapture() {
    this.captureEnabled = false;
}

/**
 * 请求截图权限
 * @returns {boolean} 是否成功获取权限
 */
ScreenCapture.prototype.requestPermission = function () {
    if (this.captureEnabled) {
        return true;
    }

    try {
        logger.info("正在请求截图权限...");

        // 请求截图权限,会弹出系统对话框
        if (images.requestScreenCapture()) {
            this.captureEnabled = true;
            logger.info("截图权限已授予");
            return true;
        } else {
            logger.error("截图权限被拒绝");
            toast("请授予截图权限以使用自动化功能");
            return false;
        }
    } catch (e) {
        logger.error("请求截图权限失败: " + e);
        return false;
    }
};

/**
 * 捕获屏幕截图
 * @returns {Object|null} 包含 base64Data, width, height 的对象,失败返回 null
 */
ScreenCapture.prototype.captureScreen = function () {
    try {
        // 确保有截图权限
        if (!this.captureEnabled && !this.requestPermission()) {
            return this.createFallbackScreenshot();
        }

        // 捕获屏幕
        var img = images.captureScreen();

        if (!img) {
            logger.error("截图失败: 返回 null");
            return this.createFallbackScreenshot();
        }

        // 转换为 Base64
        var base64Data = images.toBase64(img, "png", 80); // 80% 质量压缩
        var width = img.getWidth();
        var height = img.getHeight();

        // 释放图片资源
        img.recycle();

        logger.debug("截图成功: " + width + "x" + height);

        return {
            base64Data: base64Data,
            width: width,
            height: height,
            isSensitive: false
        };

    } catch (e) {
        logger.error("截图异常: " + e);
        return this.createFallbackScreenshot();
    }
};

/**
 * 创建黑屏占位图
 * @param {boolean} isSensitive - 是否因敏感屏幕失败
 * @returns {Object} 占位截图对象
 */
ScreenCapture.prototype.createFallbackScreenshot = function (isSensitive) {
    if (isSensitive === undefined) isSensitive = false;

    var defaultWidth = 1080;
    var defaultHeight = 2400;

    try {
        // 创建黑色图片
        var blackImg = images.createImage(defaultWidth, defaultHeight);
        var canvas = new Canvas(blackImg);
        var paint = new Paint();
        paint.setColor(colors.BLACK);
        canvas.drawRect(0, 0, defaultWidth, defaultHeight, paint);

        var base64Data = images.toBase64(blackImg, "png");
        blackImg.recycle();

        logger.warn("使用黑屏占位图");

        return {
            base64Data: base64Data,
            width: defaultWidth,
            height: defaultHeight,
            isSensitive: isSensitive
        };
    } catch (e) {
        logger.error("创建占位图失败: " + e);
        // 返回最小化的占位数据
        return {
            base64Data: "",
            width: defaultWidth,
            height: defaultHeight,
            isSensitive: isSensitive
        };
    }
};

/**
 * 释放资源
 */
ScreenCapture.prototype.release = function () {
    this.captureEnabled = false;
    logger.info("截图资源已释放");
};

module.exports = new ScreenCapture();
