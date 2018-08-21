/**
 * https://gist.github.com/Manc/9409355
 * Convert a URL or just the query part of a URL to an
 * object with all keys and values.
 * Usage examples:
 *   // Get "GET" parameters from current request as object:
 *   var parameters = parseQueryString(window.location.search);
 */
export default function parseQueryString(query) {
    var obj = {},
        qPos = query.indexOf('?'),
        tokens = query.substr(qPos + 1).split('&'),
        i = tokens.length - 1;
    if (qPos !== -1 || query.indexOf('=') !== -1) {
        for (; i >= 0; i--) {
            var s = tokens[i].split('=');
            obj[unescape(s[0])] = s.hasOwnProperty(1) ? unescape(s[1]) : null;
        }
    }
    return obj;
}
