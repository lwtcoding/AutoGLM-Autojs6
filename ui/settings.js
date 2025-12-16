/**
 * 设置界面
 * 配置模型 API 和 Agent 参数
 */

"ui";

var storage = require(files.cwd() + '/config/storage');
var logger = require(files.cwd() + '/utils/logger');

// UI 布局
ui.layout(
    <vertical>
        <appbar>
            <toolbar id="toolbar" title="设置" />
        </appbar>

        <ScrollView>
            <vertical padding="16">

                {/* 模型配置 */}
                <card w="*" h="auto" margin="8 16" cardCornerRadius="8dp" cardElevation="4dp">
                    <vertical padding="16">
                        <text text="模型配置" textSize="18sp" textStyle="bold" marginBottom="8" />

                        <text text="API 地址:" textSize="14sp" marginTop="8" />
                        <input id="base_url" hint="https://open.bigmodel.cn/api/paas/v4" singleLine="true" />

                        <text text="模型名称:" textSize="14sp" marginTop="8" />
                        <input id="model_name" hint="autoglm-phone" singleLine="true" />

                        <text text="API Key:" textSize="14sp" marginTop="8" />
                        <input id="api_key" hint="EMPTY" inputType="textPassword" singleLine="true" />

                        <text text="语言:" textSize="14sp" marginTop="8" />
                        <spinner id="lang_spinner" entries="中文|English" />
                    </vertical>
                </card>

                {/* Agent 配置 */}
                <card w="*" h="auto" margin="8 16" cardCornerRadius="8dp" cardElevation="4dp">
                    <vertical padding="16">
                        <text text="Agent 配置" textSize="18sp" textStyle="bold" marginBottom="8" />

                        <text text="最大步数:" textSize="14sp" marginTop="8" />
                        <input id="max_steps" hint="100" inputType="number" singleLine="true" />

                        <text text="详细日志:" textSize="14sp" marginTop="8" />
                        <Switch id="verbose_switch" checked="true" />
                    </vertical>
                </card>

                {/* 按钮 */}
                <horizontal margin="16">
                    <button id="save_btn" text="保存设置" w="*" style="Widget.AppCompat.Button.Colored" />
                    <button id="cancel_btn" text="取消" w="*" marginLeft="8" />
                </horizontal>

            </vertical>
        </ScrollView>
    </vertical>
);

// 加载配置
function loadConfig() {
    var modelConfig = storage.getModelConfig();
    var agentConfig = storage.getAgentConfig();

    ui.base_url.setText(modelConfig.baseUrl);
    ui.model_name.setText(modelConfig.modelName);
    ui.api_key.setText(modelConfig.apiKey);
    ui.lang_spinner.setSelection(modelConfig.lang === 'cn' ? 0 : 1);

    ui.max_steps.setText(agentConfig.maxSteps.toString());
    ui.verbose_switch.setChecked(agentConfig.verbose);
}

// 保存配置
function saveConfig() {
    var modelConfig = {
        baseUrl: ui.base_url.text(),
        modelName: ui.model_name.text(),
        apiKey: ui.api_key.text(),
        lang: ui.lang_spinner.getSelectedItemPosition() === 0 ? 'cn' : 'en'
    };

    var agentConfig = {
        maxSteps: parseInt(ui.max_steps.text()) || 100,
        verbose: ui.verbose_switch.isChecked()
    };

    storage.setModelConfig(modelConfig);
    storage.setAgentConfig(agentConfig);

    toast("设置已保存");
    logger.info("配置已保存");
}

// 初始化
loadConfig();

// 事件监听
ui.save_btn.on("click", function () {
    saveConfig();
    ui.finish();
});

ui.cancel_btn.on("click", function () {
    ui.finish();
});

ui.toolbar.on("click", function () {
    ui.finish();
});
