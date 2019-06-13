function buildMergeTable() {
    const decomposeTable = new Map([
        [" ", ""],
        ["─", "╴╶"],
        ["│", "╵╷"],
        ["┌", "╶╷"],
        ["┐", "╴╷"],
        ["└", "╵╶"],
        ["┘", "╴╵"],
        ["├", "╵╶╷"],
        ["┤", "╴╵╷"],
        ["┬", "╴╶╷"],
        ["┴", "╴╵╶"],
        ["┼", "╴╵╶╷"],
        ["╱", "╱"],
        ["╲", "╲"],
        ["╳", "╱╲"],
        ["╴", "╴"],
        ["╵", "╵"],
        ["╶", "╶"],
        ["╷", "╷"],
    ]);
    const composeTable = new Map();
    for (const [whole, decomposed] of decomposeTable) {
        composeTable.set(decomposed, whole);
    }
    const characters = Array.from(decomposeTable.keys());
    const realTable = new Map();
    for (const oldCharacter of characters) {
        const components1 = decomposeTable.get(oldCharacter);
        if (components1 !== undefined) {
            const mapping = new Map();
            for (const newCharacter of characters) {
                const components2 = decomposeTable.get(newCharacter);
                if (components2 !== undefined) {
                    const allComponents = Array.from(new Set(components1 + components2));
                    allComponents.sort();
                    const resultCharacter = composeTable.get(allComponents.join(""));
                    if (resultCharacter !== undefined) {
                        mapping.set(newCharacter.charCodeAt(0), resultCharacter.charCodeAt(0));
                    }
                }
            }
            realTable.set(oldCharacter.charCodeAt(0), mapping);
        }
    }
    return realTable;
}
const mergeTable = buildMergeTable();
function mergeCharacter(oldCharacter, newCharacter) {
    const mapping = mergeTable.get(oldCharacter);
    if (mapping !== undefined) {
        const result = mapping.get(newCharacter);
        if (result !== undefined) {
            return result;
        }
    }
    return newCharacter;
}
function splitLines(text) {
    return text.split(/\r\n|\r|\n/);
}
function measureLines(lines) {
    const width = lines.reduce((x, y) => Math.max(x, y.length), 0);
    return { width, height: lines.length };
}
function drawLineInPixel(from, to) {
    // Make sure from is in the left side.
    if (from.x > to.x || (from.x === to.x && from.y > to.y)) {
        const temp = from;
        from = to;
        to = temp;
    }
    const width = to.x - from.x;
    const height = to.y - from.y;
    const length = Math.sqrt(width * width + height * height);
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    if (angle < -Math.PI * 0.375) {
        if (length > 0.5) {
            return "│";
        }
        else {
            return from.y + to.y < 1 ? "╵" : "╷";
        }
    }
    else if (angle < -Math.PI * 0.125) {
        return "╱";
    }
    else if (angle < Math.PI * 0.125) {
        if (length > 0.5) {
            return "─";
        }
        else {
            return from.x + to.x < 1 ? "╴" : "╶";
        }
    }
    else if (angle < Math.PI * 0.375) {
        return "╲";
    }
    else {
        if (length > 0.5) {
            return "│";
        }
        else {
            return from.y + to.y < 1 ? "╵" : "╷";
        }
    }
}
export class AsciiTextDrawingContext {
    constructor() {
        this.lines = [];
    }
    drawLines(...positions) {
        if (positions.length > 1) {
            for (let i = 1; i < positions.length; i++) {
                this.drawLine(positions[i - 1], positions[i]);
            }
        }
    }
    drawRectangle(position, size) {
        this.drawLines(position, { x: position.x + size.width, y: position.y }, { x: position.x + size.width, y: position.y + size.height }, { x: position.x, y: position.y + size.height }, position);
    }
    drawText(text, position) {
        const lines = splitLines(text);
        const size = measureLines(lines);
        const rowStart = Math.ceil(position.y - size.height / 2 - 0.5);
        const columnStart = Math.floor(position.x - size.width / 2 + 0.5);
        for (let row = 0; row < lines.length; row++) {
            const line = lines[row];
            for (let column = 0; column < line.length; column++) {
                this.setCharacter(rowStart + row, columnStart + column, line[column]);
            }
        }
    }
    measureText(text) {
        return measureLines(splitLines(text));
    }
    render() {
        let result = "";
        for (const line of this.lines) {
            for (const character of line) {
                result += String.fromCharCode(character);
            }
            result += "\n";
        }
        return result;
    }
    setCharacter(row, column, character) {
        while (this.lines.length <= row) {
            this.lines.push([]);
        }
        const line = this.lines[row];
        while (line.length <= column) {
            line.push(" ".charCodeAt(0));
        }
        line[column] = mergeCharacter(line[column], character.charCodeAt(0));
    }
    drawLine(from, to) {
        const xLength = to.x - from.x;
        const yLength = to.y - from.y;
        const xDirection = Math.sign(xLength);
        const yDirection = Math.sign(yLength);
        const myCeilX = xLength >= 0 ? Math.ceil : Math.floor;
        const myCeilY = yLength >= 0 ? Math.ceil : Math.floor;
        let x = from.x;
        let y = from.y;
        while (x !== to.x || y !== to.y) {
            const nextXCandidate = Number.isInteger(x) ? x + xDirection : myCeilX(x);
            const nextYCandidate = Number.isInteger(y) ? y + yDirection : myCeilY(y);
            const nextStopXCandidate = (nextXCandidate - from.x) / xLength;
            const nextStopYCandidate = (nextYCandidate - from.y) / yLength;
            let nextX;
            let nextY;
            if (nextStopXCandidate <= nextStopYCandidate) {
                if (nextStopXCandidate < 1.0) {
                    nextX = nextXCandidate;
                    nextY = from.y + yLength * nextStopXCandidate;
                }
                else {
                    nextX = to.x;
                    nextY = to.y;
                }
            }
            else {
                if (nextStopYCandidate < 1.0) {
                    nextX = from.x + xLength * nextStopYCandidate;
                    nextY = nextYCandidate;
                }
                else {
                    nextX = to.x;
                    nextY = to.y;
                }
            }
            const row = Math.floor(Math.min(y, nextY));
            const column = Math.floor(Math.min(x, nextX));
            this.setCharacter(row, column, drawLineInPixel({ x: x - column, y: y - row }, { x: nextX - column, y: nextY - row }));
            x = nextX;
            y = nextY;
        }
    }
}
//# sourceMappingURL=textBackend.js.map