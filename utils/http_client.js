/**
 * HTTP 客户端模块
 * 封装 HTTP 请求功能
 */

var logger = require('./logger');

function HttpClient() { }

/**
 * 发送 POST 请求 (JSON)
 * @param {string} url - 请求 URL
 * @param {Object} data - 请求数据
 * @param {Object} options - 请求选项 (headers, timeout 等)
 * @returns {Object} 响应对象 {success, data, error}
 */
HttpClient.prototype.postJson = function (url, data, options) {
    options = options || {};
    try {
        logger.debug("POST " + url);

        var headers = options.headers || {};
        headers['Content-Type'] = 'application/json';

        var timeout = options.timeout || 60000; // 默认 60 秒超时

        var response = http.postJson(url, data, {
            headers: headers,
            timeout: timeout
        });

        if (response.statusCode >= 200 && response.statusCode < 300) {
            logger.debug("请求成功: " + response.statusCode);
            return {
                success: true,
                data: response.body.json(),
                statusCode: response.statusCode
            };
        } else {
            logger.error("请求失败: " + response.statusCode);
            return {
                success: false,
                error: "HTTP " + response.statusCode,
                statusCode: response.statusCode
            };
        }

    } catch (e) {
        logger.error("HTTP 请求异常: " + e);
        return {
            success: false,
            error: e.toString()
        };
    }
};

/**
 * 发送 GET 请求
 * @param {string} url - 请求 URL
 * @param {Object} options - 请求选项
 * @returns {Object} 响应对象
 */
HttpClient.prototype.get = function (url, options) {
    options = options || {};
    try {
        logger.debug("GET " + url);

        var headers = options.headers || {};
        var timeout = options.timeout || 30000;

        var response = http.get(url, {
            headers: headers,
            timeout: timeout
        });

        if (response.statusCode >= 200 && response.statusCode < 300) {
            logger.debug("请求成功: " + response.statusCode);
            return {
                success: true,
                data: response.body.string(),
                statusCode: response.statusCode
            };
        } else {
            logger.error("请求失败: " + response.statusCode);
            return {
                success: false,
                error: "HTTP " + response.statusCode,
                statusCode: response.statusCode
            };
        }

    } catch (e) {
        logger.error("HTTP 请求异常: " + e);
        return {
            success: false,
            error: e.toString()
        };
    }
};

module.exports = new HttpClient();
