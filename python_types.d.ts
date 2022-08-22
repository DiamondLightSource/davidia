// Generated using py-ts-interfaces.
// See https://github.com/cs-cordero/py-ts-interfaces

interface PlotMessage {
}

interface NewLineParams {
    line_id: string;
}

interface AuxLineParams {
    id: string;
    colour: string;
    x: Array<number>;
    y: Array<number>;
}

interface LineData {
    id: number;
    colour: string;
    x: Array<number>;
    y: Array<number>;
}

interface LineDataMessage {
    type: string;
    data: LineData;
}

interface MultiDataMessage {
    type: string;
    data: Array<LineData>;
}
