export default function isIFrame() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}