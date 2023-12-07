/* eslint-disable react-refresh/only-export-components */
/**
 * 2D selections
 *
 * @remark All points are [x,y], all angles in radians
 */

import {
  Box,
  DataToHtml,
  type Size,
  SvgElement,
  useVisCanvasContext,
} from '@h5web/lib';
import { useThree } from '@react-three/fiber';
import { useCallback } from 'react';
import { Vector3 } from 'three';
import DvdAxisBox from '../shapes/DvdAxisBox';
import DvdPolyline from '../shapes/DvdPolyline';
import AxialSelection from './AxialSelection';
import type BaseSelection from './BaseSelection';
import CircularSelection from './CircularSelection';
import CircularSectorialSelection from './CircularSectorialSelection';
import EllipticalSelection from './EllipticalSelection';
import LinearSelection from './LinearSelection';
import PolygonalSelection from './PolygonalSelection';
import RectangularSelection from './RectangularSelection';

import type { Points } from '../MulticlickSelectionTool';

enum SelectionType {
  line = 'line',
  rectangle = 'rectangle',
  polyline = 'polyline',
  polygon = 'polygon',
  circle = 'circle',
  ellipse = 'ellipse',
  sector = 'sector',
  horizontalAxis = 'horizontalAxis',
  verticalAxis = 'verticalAxis',
  unknown = 'unknown',
}

function polar(xy: Vector3): [number, number] {
  const x = xy.x;
  const y = xy.y;
  return [Math.hypot(y, x), Math.atan2(y, x)];
}

function getSelectionType(selection: SelectionBase) {
  if (AxialSelection.isShape(selection)) {
    return selection.dimension === 0
      ? SelectionType.horizontalAxis
      : SelectionType.verticalAxis;
  } else if (RectangularSelection.isShape(selection)) {
    return SelectionType.rectangle;
  } else if (LinearSelection.isShape(selection)) {
    return SelectionType.line;
  } else if (PolygonalSelection.isShape(selection)) {
    return selection.closed ? SelectionType.polygon : SelectionType.polyline;
  } else if (EllipticalSelection.isShape(selection)) {
    return SelectionType.ellipse;
  } else if (CircularSelection.isShape(selection)) {
    return SelectionType.circle;
  } else if (CircularSectorialSelection.isShape(selection)) {
    return SelectionType.sector;
  } else {
    return SelectionType.unknown;
  }
}

function recreateSelection(selection: SelectionBase) {
  if (AxialSelection.isShape(selection)) {
    return AxialSelection.createFromSelection(selection);
  } else if (RectangularSelection.isShape(selection)) {
    return RectangularSelection.createFromSelection(selection);
  } else if (LinearSelection.isShape(selection)) {
    return LinearSelection.createFromSelection(selection);
  } else if (PolygonalSelection.isShape(selection)) {
    return PolygonalSelection.createFromSelection(selection);
  } else if (EllipticalSelection.isShape(selection)) {
    return EllipticalSelection.createFromSelection(selection);
  } else if (CircularSelection.isShape(selection)) {
    return CircularSelection.createFromSelection(selection);
  } else if (CircularSectorialSelection.isShape(selection)) {
    return CircularSectorialSelection.createFromSelection(selection);
  } else {
    return null;
  }
}

function createSelection(
  selectionType: SelectionType,
  axesFlipped: [boolean, boolean],
  points: Vector3[]
) {
  switch (selectionType) {
    case SelectionType.rectangle:
      return RectangularSelection.createFromPoints(axesFlipped, points);
    case SelectionType.sector:
      return CircularSectorialSelection.createFromPoints(points);
    case SelectionType.horizontalAxis:
    case SelectionType.verticalAxis:
      return AxialSelection.createFromPoints(
        points,
        selectionType === SelectionType.horizontalAxis ? 0 : 1
      );
    case SelectionType.circle:
      return CircularSelection.createFromPoints(points);
    case SelectionType.ellipse:
      return CircularSelection.createFromPoints(points);
    case SelectionType.polygon:
      return PolygonalSelection.createFromPoints(true, points);
    case SelectionType.polyline:
      return PolygonalSelection.createFromPoints(false, points);
    case SelectionType.line:
    case SelectionType.unknown:
    default:
      return LinearSelection.createFromPoints(points);
  }
}

function getClicks(selectionType: SelectionType) {
  switch (selectionType) {
    case SelectionType.rectangle:
      return RectangularSelection.clicks();
    case SelectionType.sector:
      return CircularSectorialSelection.clicks();
    case SelectionType.horizontalAxis:
    case SelectionType.verticalAxis:
      return AxialSelection.clicks();
    case SelectionType.circle:
      return CircularSelection.clicks();
    case SelectionType.ellipse:
      return CircularSelection.clicks();
    case SelectionType.polygon:
    case SelectionType.polyline:
      return PolygonalSelection.clicks();
    case SelectionType.line:
    case SelectionType.unknown:
    default:
      return LinearSelection.clicks();
  }
}

type _HandleChangeFunction = (
  i: number,
  position: [number | undefined, number | undefined]
) => SelectionBase;

interface SelectionBase {
  readonly id: string;
  name: string;
  colour?: string;
  alpha: number;
  fixed: boolean;
  start: [number, number];
  asDashed?: boolean;
  getPoints?: () => Vector3[];
  onHandleChange: _HandleChangeFunction;
  toString: () => string;
}

function pointsToSelection(
  selections: SelectionBase[],
  selectionType: SelectionType,
  points: Vector3[],
  alpha: number,
  colour?: string
): BaseSelection {
  console.debug('Points', selectionType, points);
  const s = createSelection(selectionType, [false, false], points);
  s.alpha = alpha;
  if (colour) {
    s.colour = colour;
  }
  const selectionNames = selections.map((s) => s.name);
  let newName: string;
  let counter = -1;
  do {
    counter++;
    newName = `${selectionType}${counter}`;
  } while (selectionNames.includes(newName));
  s.name = newName;

  return s;
}

export type HandleChangeFunction = (
  i: number,
  pos: [number | undefined, number | undefined],
  b?: boolean
) => BaseSelection;

function createShape(
  selectionType: SelectionType,
  points: Vector3[],
  alpha: number,
  size: Size,
  colour: string,
  asDashed?: boolean,
  isFixed?: boolean,
  onHandleChange?: HandleChangeFunction
) {
  const props = {
    fill: colour,
    fillOpacity: alpha,
    stroke: colour,
    strokeWidth: 1,
  };

  switch (selectionType) {
    case SelectionType.rectangle:
    case SelectionType.polygon:
      return (
        <SvgElement>
          <DvdPolyline
            size={size}
            coords={points}
            isClosed={true}
            strokeDasharray={asDashed ? '10, 10' : undefined}
            isFixed={isFixed}
            onHandleChange={onHandleChange}
            {...props}
          />
        </SvgElement>
      );
    case SelectionType.horizontalAxis:
    case SelectionType.verticalAxis:
      return (
        <SvgElement>
          <DvdAxisBox
            size={size}
            coords={points}
            strokeDasharray={asDashed ? '10, 10' : undefined}
            isFixed={isFixed}
            axis={selectionType === SelectionType.horizontalAxis ? 0 : 1}
            onHandleChange={onHandleChange}
            {...props}
          />
        </SvgElement>
      );
    case SelectionType.line:
    case SelectionType.polyline:
      return (
        <SvgElement>
          <DvdPolyline
            size={size}
            coords={points}
            strokeDasharray={asDashed ? '10, 10' : undefined}
            isFixed={isFixed}
            onHandleChange={onHandleChange}
            {...props}
          />
        </SvgElement>
      );
    case SelectionType.ellipse:
    case SelectionType.circle:
    case SelectionType.sector:
    case SelectionType.unknown:
    default:
      return null;
  }
}

function pointsToShape(
  selectionType: SelectionType,
  points: Vector3[],
  axesFlipped: [boolean, boolean],
  alpha: number,
  size: Size,
  colour?: string
) {
  const s = createSelection(selectionType, axesFlipped, points);
  return createShape(
    selectionType,
    s.getPoints(),
    alpha,
    size,
    colour ?? s.colour ?? s.defaultColour,
    undefined,
    true
  );
}

interface SelectionShapeProps {
  key: string;
  size: Size;
  selection: SelectionBase;
  updateSelection: (s: SelectionBase, b?: boolean) => void;
  showHandles: boolean;
}

function SelectionShape(props: SelectionShapeProps) {
  const { size, selection, updateSelection, showHandles } = props;
  const selectionType = getSelectionType(selection);
  const context = useVisCanvasContext();
  const { htmlToData } = context;
  const camera = useThree((state) => state.camera);

  const htmlToDataFunction = useCallback(
    (x: number | undefined, y: number | undefined) => {
      const v = htmlToData(camera, new Vector3(x, y));
      return [v.x, v.y] as [number, number];
    },
    [htmlToData, camera]
  );
  const combinedUpdate = useCallback(
    (s: SelectionBase) => {
      const h = s.onHandleChange.bind(s);
      const f = (
        i: number,
        pos: [number | undefined, number | undefined],
        b = true
      ) => {
        const p = htmlToDataFunction(pos[0], pos[1]);
        console.debug('UH:', i, pos, p);
        const ns = h(i, p);
        updateSelection(ns, b);
        return ns;
      };
      return f as HandleChangeFunction;
    },
    [updateSelection, htmlToDataFunction]
  );
  if (
    selectionType !== SelectionType.unknown &&
    selection.getPoints !== undefined
  ) {
    const pts = selection.getPoints();
    const defColour = (
      'defaultColour' in selection ? selection.defaultColour : '#000000'
    ) as string;
    return (
      <DataToHtml points={pts} key={selection.id}>
        {(...htmlSelection: Vector3[]) =>
          createShape(
            selectionType,
            htmlSelection,
            selection.alpha,
            size,
            selection.colour ?? defColour,
            selection.asDashed,
            selection.fixed || !showHandles,
            combinedUpdate(selection)
          )
        }
      </DataToHtml>
    );
  }
  console.error('Unknown selection type or has no points getter', selection);
  return null;
}

function makeShapes(
  size: Size,
  selections: SelectionBase[],
  update: (s: SelectionBase) => void,
  showHandles: boolean
) {
  return selections.map((s) => (
    <SelectionShape
      key={s.id}
      size={size}
      selection={s}
      updateSelection={update}
      showHandles={showHandles}
    />
  ));
}

function findSelection(selections: SelectionBase[], id: string | null) {
  return selections.find((s) => s.id === id);
}

function getSelectionLabel(
  selection: SelectionBase | null,
  selectionIcons?: {
    line: string;
    rectangle: string;
    polyline: string;
    polygon: string;
    circle: string;
    ellipse: string;
    sector: string;
    horizontalAxis: string;
    verticalAxis: string;
    unknown: string;
  }
): string {
  if (selection !== null) {
    const selectionIcon = selectionIcons
      ? selectionIcons[getSelectionType(selection)]
      : '';
    const selectionLabel = `${selectionIcon} ${selection.name} ${selection.id}`;
    return selectionLabel;
  } else {
    return 'No selection chosen';
  }
}

function getSelectionLabelFromID(
  selections: SelectionBase[],
  id: string | null,
  selectionIcons: {
    line: string;
    rectangle: string;
    polyline: string;
    polygon: string;
    circle: string;
    ellipse: string;
    sector: string;
    horizontalAxis: string;
    verticalAxis: string;
    unknown: string;
  }
): string {
  const selection = findSelection(selections, id) ?? null;
  return getSelectionLabel(selection, selectionIcons);
}

function validateHtml(html: Points, selectionType: SelectionType): boolean {
  return Box.fromPoints(...html).hasMinSize(
    selectionType === SelectionType.horizontalAxis ||
      selectionType === SelectionType.verticalAxis
      ? 0
      : 20
  );
}

export {
  findSelection,
  getClicks,
  getSelectionLabel,
  getSelectionLabelFromID,
  getSelectionType,
  makeShapes,
  pointsToSelection,
  pointsToShape,
  polar,
  recreateSelection,
  SelectionType,
  validateHtml,
};

export type { SelectionBase };
