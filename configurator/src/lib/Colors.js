const GAMMA = 2.4;

function srgbToLinear1(c) {
    var v = 0.0;
    if (c < 0.04045) {
        if (c >= 0.0) v = c * (1.0 / 12.92);
    } else {
        v = Math.pow((c + 0.055) * (1.0 / 1.055), GAMMA);
    }
    return v;
}

function srgbToLinear(c, out) {
    var col = out || new Array(c.length);

    if (c.length > 2 && c.length < 5) {
        col[0] = srgbToLinear1(c[0]);
        col[1] = srgbToLinear1(c[1]);
        col[2] = srgbToLinear1(c[2]);
        if (col.length > 3 && c.length > 3) col[3] = c[3];
    } else {
        throw new Error('Invalid color. Expected 3 or 4 components, but got ' + c.length);
    }
    return col;
}

function hexToRgb(hexColor) {
    var m = hexColor.match(/^#([0-9a-f]{6})$/i);
    if (m) {
        return [
            parseInt(m[1].substr(0, 2), 16) / 255,
            parseInt(m[1].substr(2, 2), 16) / 255,
            parseInt(m[1].substr(4, 2), 16) / 255
        ];
    } else {
        throw new Error('Invalid color: ' + hexColor);
    }
}

export {
    srgbToLinear,
    hexToRgb
};
