/**
 * 本地存储封装
 * 使用 AutoJS6 的 storages 模块进行持久化存储
 */

var STORAGE_NAME = "autoglm_config";

function Storage() {
    this.storage = storages.create(STORAGE_NAME);
}

/**
 * 获取配置值
 * @param {string} key - 配置键
 * @param {*} defaultValue - 默认值
 * @returns {*} 配置值
 */
Storage.prototype.get = function (key, defaultValue) {
    if (defaultValue === undefined) defaultValue = null;
    return this.storage.get(key) || defaultValue;
};

/**
 * 设置配置值
 * @param {string} key - 配置键
 * @param {*} value - 配置值
 */
Storage.prototype.set = function (key, value) {
    this.storage.put(key, value);
};

/**
 * 删除配置
 * @param {string} key - 配置键
 */
Storage.prototype.remove = function (key) {
    this.storage.remove(key);
};

/**
 * 清空所有配置
 */
Storage.prototype.clear = function () {
    this.storage.clear();
};

/**
 * 获取模型配置
 */
Storage.prototype.getModelConfig = function () {
    return {
        baseUrl: this.get("model_base_url", "https://open.bigmodel.cn/api/paas/v4"),
        modelName: this.get("model_name", "autoglm-phone"),
        apiKey: this.get("api_key", "EMPTY"),
        lang: this.get("lang", "cn")
    };
};

/**
 * 保存模型配置
 */
Storage.prototype.setModelConfig = function (config) {
    this.set("model_base_url", config.baseUrl);
    this.set("model_name", config.modelName);
    this.set("api_key", config.apiKey);
    this.set("lang", config.lang);
};

/**
 * 获取 Agent 配置
 */
Storage.prototype.getAgentConfig = function () {
    return {
        maxSteps: this.get("max_steps", 100),
        verbose: this.get("verbose", true)
    };
};

/**
 * 保存 Agent 配置
 */
Storage.prototype.setAgentConfig = function (config) {
    this.set("max_steps", config.maxSteps);
    this.set("verbose", config.verbose);
};

module.exports = new Storage();
