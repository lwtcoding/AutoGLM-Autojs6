/**
 * 主界面
 * 任务输入和执行控制
 */

"ui";

var PhoneAgent = require(files.cwd() + '/core/agent');
var storage = require(files.cwd() + '/config/storage');
var logger = require(files.cwd() + '/utils/logger');
var screenCapture = require(files.cwd() + '/accessibility/screen_capture');

// UI 布局
ui.layout(
    <vertical>
        <appbar>
            <toolbar id="toolbar" title="AutoGLM Phone Agent" />
        </appbar>

        <ScrollView>
            <vertical padding="16">

                {/* 任务输入 */}
                <card w="*" h="auto" margin="8 16" cardCornerRadius="8dp" cardElevation="4dp">
                    <vertical padding="16">
                        <text text="输入任务" textSize="18sp" textStyle="bold" />
                        <input id="task_input"
                            hint="例如: 打开微信并发送消息给张三"
                            minLines="3"
                            gravity="top" />
                        <horizontal marginTop="8">
                            <button id="run_btn" text="执行任务" layout_weight="1" style="Widget.AppCompat.Button.Colored" />
                            <button id="stop_btn" text="停止" layout_weight="1" marginLeft="8" enabled="false" />
                        </horizontal>
                    </vertical>
                </card>

                {/* 状态显示 */}
                <card w="*" h="auto" margin="8 16" cardCornerRadius="8dp" cardElevation="4dp">
                    <vertical padding="16">
                        <text text="执行状态" textSize="18sp" textStyle="bold" />
                        <text id="status_text" text="就绪" textColor="#4CAF50" textSize="16sp" marginTop="8" />
                        <text id="step_text" text="步数: 0/100" textSize="14sp" marginTop="4" />
                        <ProgressBar id="progress"
                            style="@style/Widget.AppCompat.ProgressBar.Horizontal"
                            w="*"
                            marginTop="8" />
                    </vertical>
                </card>

                {/* 日志输出 */}
                <card w="*" h="auto" margin="8 16" cardCornerRadius="8dp" cardElevation="4dp">
                    <vertical padding="16">
                        <horizontal>
                            <text text="执行日志" textSize="18sp" textStyle="bold" w="*" />
                            <button id="clear_log_btn" text="清空" w="auto" style="Widget.AppCompat.Button.Borderless" />
                        </horizontal>
                        <ScrollView id="log_scroll" h="200dp" marginTop="8" scrollbars="vertical">
                            <vertical w="*" padding="4">
                                <text id="log_text" textSize="12sp" textColor="#333333" w="*" />
                            </vertical>
                        </ScrollView>
                    </vertical>
                </card>

                {/* 设置按钮 */}
                <button id="settings_btn"
                    text="设置"
                    w="*"
                    margin="16 8"
                    style="Widget.AppCompat.Button.Borderless.Colored" />

            </vertical>
        </ScrollView>
    </vertical>
);

// 全局变量
var agent = null;
var isRunning = false;

// 日志回调
logger.setCallback(function (message) {
    ui.run(function () {
        var currentLog = ui.log_text.text();
        var newLog = currentLog + message + "\n";
        // 限制日志长度
        var lines = newLog.split("\n");
        if (lines.length > 100) {
            ui.log_text.setText(lines.slice(-100).join("\n"));
        } else {
            ui.log_text.setText(newLog);
        }

        // 自动滚动到底部
        setTimeout(function () {
            ui.run(function () {
                try {
                    ui.log_scroll.fullScroll(android.widget.ScrollView.FOCUS_DOWN);
                } catch (e) {
                    // 忽略滚动错误
                }
            });
        }, 50);
    });
});

// 更新状态
function updateStatus(status, color) {
    if (color === undefined) color = "#4CAF50";
    ui.run(function () {
        ui.status_text.setText(status);
        ui.status_text.setTextColor(colors.parseColor(color));
    });
}

// 更新步数
function updateStep(current, max) {
    ui.run(function () {
        ui.step_text.setText("步数: " + current + "/" + max);
        ui.progress.setProgress((current / max) * 100);
    });
}

// 执行任务
function runTask() {
    var task = ui.task_input.text().trim();

    if (!task) {
        toast("请输入任务");
        return;
    }

    // 检查无障碍权限
    if (!auto.service) {
        toast("请先开启无障碍服务");
        app.startActivity({
            action: "android.settings.ACCESSIBILITY_SETTINGS"
        });
        return;
    }

    // 请求截图权限
    if (!screenCapture.requestPermission()) {
        toast("请授予截图权限");
        return;
    }

    try {
        isRunning = true;
        ui.run(function () {
            ui.run_btn.setEnabled(false);
            ui.stop_btn.setEnabled(true);
            ui.task_input.setEnabled(false);
        });

        updateStatus("正在执行...", "#FF9800");
        logger.info("==================================================");
        logger.info("任务: " + task);
        logger.info("==================================================");

        // 加载配置
        var modelConfig = storage.getModelConfig();
        var agentConfig = storage.getAgentConfig();

        // 创建 Agent
        agent = new PhoneAgent(modelConfig, agentConfig);

        // 执行任务
        var result = agent.run(task, function (stepResult) {
            // 步骤回调
            updateStep(stepResult.stepCount, agentConfig.maxSteps);

            if (stepResult.thinking) {
                logger.info("💭 " + stepResult.thinking);
            }

            if (stepResult.message) {
                logger.info("📝 " + stepResult.message);
            }
        });

        updateStatus("完成", "#4CAF50");
        logger.info("==================================================");
        logger.info("✅ " + result);
        logger.info("==================================================");
        ui.run(function () {
            toast(result);
        });

    } catch (e) {
        updateStatus("失败", "#F44336");
        logger.error("任务执行失败: " + e);
        ui.run(function () {
            toast("任务执行失败: " + e);
        });
    } finally {
        isRunning = false;
        ui.run(function () {
            ui.run_btn.setEnabled(true);
            ui.stop_btn.setEnabled(false);
            ui.task_input.setEnabled(true);
        });
    }
}

// 停止任务
function stopTask() {
    if (agent && isRunning) {
        agent.stop();
        updateStatus("已停止", "#F44336");
        logger.info("用户停止任务");
    }
}

// 清空日志
function clearLog() {
    ui.run(function () {
        ui.log_text.setText("");
    });
}

// 打开设置
function openSettings() {
    engines.execScriptFile("ui/settings.js");
}

// 事件监听
ui.run_btn.on("click", function () {
    threads.start(runTask);
    // runTask()
});

ui.stop_btn.on("click", function () {
    stopTask();
});

ui.clear_log_btn.on("click", function () {
    clearLog();
});

ui.settings_btn.on("click", function () {
    openSettings();
});

// 初始化
updateStatus("就绪", "#4CAF50");
updateStep(0, 100);
logger.info("AutoGLM Phone Agent 已启动");
logger.info("请输入任务并点击执行");
