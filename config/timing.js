/**
 * 时间延迟配置
 * 控制各种操作后的等待时间 (单位: 秒)
 */

var TIMING_CONFIG = {
    device: {
        // 基础操作延迟
        default_tap_delay: 0.5,
        default_double_tap_delay: 0.5,
        double_tap_interval: 0.15,
        default_long_press_delay: 0.5,
        default_swipe_delay: 0.5,
        default_back_delay: 0.5,
        default_home_delay: 0.5,
        default_launch_delay: 2.0,

        // 输入操作延迟
        default_type_delay: 0.3,
        default_clear_delay: 0.3,

        // 截图延迟
        screenshot_timeout: 10
    },

    agent: {
        // Agent 循环延迟
        step_delay: 0.5,
        max_wait_time: 30
    }
};

module.exports = TIMING_CONFIG;
