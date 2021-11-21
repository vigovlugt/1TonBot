export function performanceColor(percentage) {
    percentage += 0.5;

    if (percentage < 0.45) {
        return "#ff4e50";
    } else if (percentage < 0.485) {
        return "#fcb1b2";
    } else if (percentage < 0.515) {
        return "#18181b";
    } else if (percentage < 0.53) {
        return "#7ea4f4";
    } else if (percentage < 0.55) {
        return "#3273fa";
    }

    return "#ff9b00";
}
