// Generated using py-ts-interfaces.
// See https://github.com/cs-cordero/py-ts-interfaces

interface PlotMessage {
    type: number;
    params: any;
}

interface NewLineParams {
    plot_id: string;
    line_id: string;
}

interface LineParams {
    plot_id: string;
    id: string;
    colour: string;
    x: Array<number>;
    y: Array<number>;
}

interface LineData {
    id: string;
    colour: string;
    x: Array<number>;
    y: Array<number>;
}

interface LineDataMessage {
    type: string;
    plot_id: string;
    data: LineData;
}

interface MultiDataMessage {
    type: string;
    plot_id: string;
    data: Array<LineData>;
}

interface ClearPlotsMessage {
    type: string;
}
