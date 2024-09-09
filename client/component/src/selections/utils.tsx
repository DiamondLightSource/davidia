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
import { useCallback, useRef, useState } from 'react';
import { Vector3 } from 'three';
import DvdAxisBox from '../shapes/DvdAxisBox';
import DvdPolyline from '../shapes/DvdPolyline';
import AxialSelection from './AxialSelection';
import CircularSelection from './CircularSelection';
import CircularSectorialSelection from './CircularSectorialSelection';
import EllipticalSelection from './EllipticalSelection';
import LinearSelection from './LinearSelection';
import PolygonalSelection from './PolygonalSelection';
import RectangularSelection from './RectangularSelection';

import type { Points } from '../MulticlickSelectionTool';

/**
 * Supported types of selections
 */
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

/**
 * Function called when drag handles are moved
 */
type HandleChangeFunction = (
  /** Number of drag handle */
  i: number,
  /** Position of handle */
  pos: [number | undefined, number | undefined],
  /** If true, then is dragging */
  d?: boolean
) => SelectionBase;

/**
 * Base for Selection
 */
interface SelectionBase {
  /** identity */
  readonly id: string;
  /** name */
  name: string;
  /** default colour */
  defaultColour: string;
  /** outline colour */
  colour?: string;
  /** opacity [0,1] */
  alpha: number;
  /** if true, not moveable */
  fixed: boolean;
  /** start (or centre) point coordinate */
  start: [number, number];
  /** if true, outline is dashed */
  asDashed?: boolean;
  /** set start */
  setStart: (i: number, v: number) => void;
  /** retrieve points */
  getPoints: () => Vector3[];
  /** callback for drag handle movements */
  onHandleChange: HandleChangeFunction;
  /** string representation */
  toString: () => string;
}

/**
 * Convert to polar coordinate
 * @param xy Cartesian coordinate
 * @returns radius, polar angle
 */
function polar(xy: Vector3): [number, number] {
  const x = xy.x;
  const y = xy.y;
  return [Math.hypot(y, x), Math.atan2(y, x)];
}

/**
 * Get SelectionType
 * @param selection selection
 * @returns SelectionType of given selection
 */
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

/**
 * Clone selection
 * @param selection selection
 * @returns clone of given selection or null
 */
function cloneSelection(selection: SelectionBase) {
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

/**
 * Create selection from points
 * @param selectionType type of selection
 * @param axesFlipped array that specifies whether x and y axes are flipped
 * @param points array of clicked point coordinates
 * @returns selection
 */
function createSelection(
  selectionType: SelectionType,
  axesFlipped: [boolean, boolean],
  points: Vector3[]
): SelectionBase {
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

/**
 * Get (minimum) number of clicks required for given selection type
 * @param selectionType type of selection
 * @returns number of clicks
 */
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

/**
 * Convert point coordinates to a selection
 * @param selections current selections
 * @param selectionType type of selection
 * @param points selection point coordinates
 * @param alpha opacity
 * @param colour outline colour
 * @returns selection
 */
function pointsToSelection(
  selections: SelectionBase[],
  selectionType: SelectionType,
  points: Vector3[],
  alpha: number,
  colour?: string
): SelectionBase {
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

/**
 * Create shape from selection
 * @param selectionType type of selection
 * @param points selection point coordinates
 * @param alpha opacity
 * @param size canvas size
 * @param colour outline colour
 * @param asDashed if true, outline is dashed
 * @param isFixed if true, do not add drag handles
 * @param onHandleChange callback for drag handle changes
 * @returns shape
 */
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

/**
 * Create shape from clicked points
 * @param selectionType type of selection
 * @param points array of clicked point coordinates
 * @param axesFlipped array that specifies whether x and y axes are flipped
 * @param alpha opacity
 * @param size canvas size
 * @param colour outline colour
 * @returns shape
 */
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
  updateSelection: SelectionHandler;
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
        d = true
      ) => {
        const p = htmlToDataFunction(pos[0], pos[1]);
        console.debug('UH:', i, pos, p);
        const ns = h(i, p);
        updateSelection(ns, !d); // if dragging don't broadcast
        return ns;
      };
      return f as HandleChangeFunction;
    },
    [updateSelection, htmlToDataFunction]
  );
  if (selectionType !== SelectionType.unknown) {
    const pts = selection.getPoints();
    return (
      <DataToHtml points={pts} key={selection.id}>
        {(...htmlSelection: Vector3[]) =>
          createShape(
            selectionType,
            htmlSelection,
            selection.alpha,
            size,
            selection.colour ?? selection.defaultColour,
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

/**
 * Make shapes from given selections
 * @param size canvas size
 * @param selections selections
 * @param showHandles if true, show handles
 * @param update callback to update selections
 * @returns shape
 */
function makeShapes(
  size: Size,
  selections: SelectionBase[],
  showHandles: boolean,
  update?: SelectionHandler
) {
  return (
    update &&
    selections.map((s) => (
      <SelectionShape
        key={s.id}
        size={size}
        selection={s}
        updateSelection={update}
        showHandles={showHandles}
      />
    ))
  );
}

/**
 * Get a label for given selection
 * @param selection selection
 * @param selectionIcons map of selection icon characters
 * @returns label
 */
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
  const selection = selections.find((s) => s.id === id) ?? null;
  return getSelectionLabel(selection, selectionIcons);
}

/**
 * Check if clicked points are valid for given selection type
 * @param html clicked point coordinates in HTML space
 * @param selectionType type of selection
 * @returns true if points are valid
 */
function validateHtml(html: Points, selectionType: SelectionType): boolean {
  return Box.fromPoints(...html).hasMinSize(
    selectionType === SelectionType.horizontalAxis ||
      selectionType === SelectionType.verticalAxis
      ? 0
      : 20
  );
}

/**
 * Selection handler
 * @returns ID of changed selection
 */
type SelectionHandler = (
  selection: SelectionBase | null,
  /** if true, update server with selection */
  broadcast?: boolean,
  /** if true, remove selection */
  clear?: boolean
) => string | null;

/**
 * Custom hook to handle selection changes
 * @param initSelections initial selections
 * @returns selections, selections setter, new selection reference, updateSelection, canSelect, enableSelect
 */
function useSelections(initSelections?: SelectionBase[]) {
  const [selections, setSelections] = useState<SelectionBase[]>(
    initSelections ?? []
  );

  const isNewSelection = useRef(false);
  const [canSelect, enableSelect] = useState<boolean>(true);

  const updateSelection: SelectionHandler = useCallback(
    (selection, _broadcast = false, clear = false) => {
      let id: string | null = null;
      if (!selection) {
        if (clear) {
          console.debug('Clearing selections');
          setSelections([]);
        }
      } else {
        id = selection.id;
        if (clear) {
          console.debug('Clearing selection:', id);
          setSelections((prevSelections) =>
            prevSelections.filter((s) => s.id !== id)
          );
        } else {
          setSelections((prevSelections) => {
            const old = prevSelections.findIndex((s) => s.id === id);
            isNewSelection.current = old === -1;
            if (isNewSelection.current) {
              return [...prevSelections, selection];
            }
            const all = [...prevSelections];
            console.debug('Replacing', all[old], 'with', selection);
            all[old] = selection;
            return all;
          });
        }
      }
      return id;
    },
    [setSelections]
  );

  return {
    selections,
    setSelections,
    isNewSelection,
    updateSelection,
    canSelect,
    enableSelect,
  };
}

/**
 * Set fixed and asDashed properties of selection to false.
 * @param {SelectionBase} s - The selection to modify.
 */
function enableSelection(s: SelectionBase) {
  s.fixed = false;
  s.asDashed = false;
}

/**
 * Set fixed and asDashed properties of selection to true.
 * @param {SelectionBase} s - The selection to modify.
 */
function disableSelection(s: SelectionBase) {
  s.fixed = true;
  s.asDashed = true;
}

export {
  getClicks,
  getSelectionLabel,
  getSelectionLabelFromID,
  getSelectionType,
  makeShapes,
  pointsToSelection,
  pointsToShape,
  polar,
  cloneSelection,
  validateHtml,
  useSelections,
  SelectionType,
  enableSelection,
  disableSelection,
};

export type { HandleChangeFunction, SelectionBase, SelectionHandler };
