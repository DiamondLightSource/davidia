import logging

import h5py
import numpy as np

from .file_read_utils import (
    decode,
    find_groups,
    is_nx_class,
    iterate_over_datasets_recursive,
)


def _extract_v3_nxdata(nxdata: h5py.Group):
    if not isinstance(nxdata, h5py.Group) or not is_nx_class(nxdata, "NXdata"):
        return None

    signal_name = decode(nxdata.attrs.get("signal", ""))
    if not signal_name or signal_name not in nxdata:
        return None

    signal = nxdata[signal_name]
    axes = parse_axes(nxdata.attrs.get("axes", []))

    # If @axes is omitted entirely, default to "." for each signal dimension
    if not axes:
        axes = ["."] * signal.ndim

    indices_list = []
    for i, axis in enumerate(axes):
        if axis == "." or not axis:
            indices_list.append([i] if i < signal.ndim else None)
            continue

        raw_indices = nxdata.attrs.get(f"{axis}_indices", None)
        if raw_indices is not None:
            indices = [int(idx) for idx in np.atleast_1d(raw_indices)]
        else:
            indices = [i] if i < signal.ndim else None

        indices_list.append(indices)

    return nxdata, signal, axes, indices_list, "v3"
def find_v3(entry: h5py.Group):
    logger = logging.getLogger("main")

    if "default" in entry.attrs:
        name = decode(entry.attrs["default"])
        if name in entry:
            result = _extract_v3_nxdata(entry[name])
            if result is not None:
                return result
        logger.warning(f"Default NXdata target '{name}' is invalid or missing signal.")

    for nxdata in find_groups(entry, "NXdata"):
        result = _extract_v3_nxdata(nxdata)
        if result is not None:
            return result

    return None


def parse_axes(value):
    value = decode(value)

    if isinstance(value, str):
        return [v.strip() for v in value.split(",") if v.strip()]

    if isinstance(value, np.ndarray):
        return [decode(v) for v in value.tolist()]

    if isinstance(value, list):
        return [decode(v) for v in value]

    return []



def find_v2(nxdata: h5py.Group):
    for name, obj in nxdata.items():
        if not isinstance(obj, h5py.Dataset):
            continue

        raw_signal = decode(obj.attrs.get("signal", 0))
        # Converts scalar, list, or ndarray to an int array and checks if any element == 1
        try:
            is_signal = np.any(np.asarray(raw_signal, dtype=int) == 1)
        except (ValueError, TypeError):
            is_signal = False

        if is_signal:
            axes = parse_axes(obj.attrs.get("axes", []))
            indices = [[i] for i in range(len(axes))]
            return nxdata, obj, axes, indices, "v2"
    return None


def find_v1(nxdata: h5py.Group, signal):
    rank = signal.ndim
    axes = ["."] * rank
    indices = [[i] for i in range(rank)]

    for name, obj in iterate_over_datasets_recursive(nxdata):
        axis = decode(obj.attrs.get("axis", 0))
        primary = decode(obj.attrs.get("primary", 0))

        if not axis or not np.any(np.asarray(primary) == 1):
            continue

        axis = int(axis)
        if 1 <= axis <= rank:
            axes[axis - 1] = name

    return axes, indices