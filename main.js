/**
 * AutoGLM Phone Agent - 主入口
 * AI 驱动的手机自动化助手 (基于无障碍服务)
 */

"ui";

var logger = require('./utils/logger');

// 检查无障碍服务
function checkAccessibilityService() {
    if (!auto.service) {
        dialogs.build({
            title: "需要无障碍服务",
            content: "AutoGLM 需要无障碍服务权限才能自动化操作手机。\n\n请在设置中开启本应用的无障碍服务。",
            positive: "去设置",
            negative: "退出"
        }).on("positive", function () {
            app.startActivity({
                action: "android.settings.ACCESSIBILITY_SETTINGS"
            });
            toast("请找到 AutoJS6 并开启无障碍服务");
        }).on("negative", function () {
            ui.finish();
        }).show();

        return false;
    }
    return true;
}

// 显示欢迎对话框
function showWelcomeDialog() {
    dialogs.build({
        title: "欢迎使用 AutoGLM",
        content: "AutoGLM Phone Agent 是一个 AI 驱动的手机自动化助手。\n\n" +
            "使用前请确保:\n" +
            "1. 已开启无障碍服务\n" +
            "2. 已配置模型 API 地址\n" +
            "3. 已授予截图权限\n\n" +
            "首次使用请先进入设置配置 API。",
        positive: "开始使用",
        neutral: "设置"
    }).on("positive", function () {
        // 启动主界面
        engines.execScriptFile("ui/main_ui.js");
        ui.finish();
    }).on("neutral", function () {
        // 打开设置
        engines.execScriptFile("ui/settings.js");
        ui.finish();
    }).show();
}

// 简单的启动界面
ui.layout(
    <vertical gravity="center">
        <img src="@drawable/ic_android_black_48dp" w="80dp" h="80dp" tint="#4CAF50" />
        <text text="AutoGLM Phone Agent" textSize="24sp" textStyle="bold" marginTop="16dp" gravity="center" />
        <text text="AI 驱动的手机自动化" textSize="14sp" textColor="#666666" marginTop="8dp" gravity="center" />
        <button id="start_btn" text="开始" w="200dp" marginTop="32dp" style="Widget.AppCompat.Button.Colored" />
    </vertical>
);

// 启动按钮
ui.start_btn.on("click", function () {
    if (checkAccessibilityService()) {
        showWelcomeDialog();
    }
});

// 自动检查
setTimeout(function () {
    if (!auto.service) {
        toast("请先开启无障碍服务");
    }
}, 1000);
