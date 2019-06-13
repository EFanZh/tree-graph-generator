export class Position {
    constructor(public x: number, public y: number) {
    }
}

export class Size {
    constructor(public width: number, public height: number) {
    }
}

export class Child {
    constructor(public label: string | null, public tree: Tree) {
    }
}

export class Tree {
    constructor(public name: string, public children: Child[]) {
    }
}

export interface IDrawingContext {
    drawLines(...positions: Position[]): void;
    drawRectangle(position: Position, size: Size): void;
    drawText(text: string, position: Position): void;
    measureText(text: string): Size;
}
