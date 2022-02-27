let list: any[] = [2, 6, 2 * (5 + 2), [5, 7]];

if (true) {
    list[1 + 2] = 56 + [5, 1][0] * 5;
    list[2] = () => {
        return 2 + "05";
    };
}

/(["'])(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\])*?\1:?|\b(true|false|null|undefined)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[:=+\-*/<>]+|[()\[\]{}]+|[,;.]+/g;

let text = "hello hi :)";
text = text.replace(/hi/g, (match) => {
    return "goodbye";
});
