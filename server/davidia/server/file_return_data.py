import numpy as np

from .file_find_data import find_v1, find_v2, find_v3
from .file_read_utils import (
    decode,
    find_default_entry,
    find_groups_recursive,
    find_legacy_signal,
)


def find_plottable_data(nexus_file):
    entries = find_default_entry(nexus_file)

    for entry in entries:
        # 1. Prioritise v3 data
        result = find_v3(entry)
        if result is not None:
            return result

        for nxdata in find_groups_recursive(entry, "NXdata"):
            # 2. Check for v2
            result = find_v2(nxdata)
            if result is not None:
                return result

            # 3. Check for v1
            signal = find_legacy_signal(nxdata)
            if signal is not None:
                axes, indices = find_v1(nxdata, signal)
                return nxdata, signal, axes, indices, "v1"

    raise ValueError("Could not find plottable NeXus data")


def read_axes(nxdata, signal, axes, indices_list=None):
    axis_values = []
    axis_labels = []

    for i, axis in enumerate(axes):
        # Determine which signal dimension(s) this axis maps to
        dim_indices = (
            indices_list[i]
            if indices_list is not None and i < len(indices_list) and indices_list[i] is not None
            else [i]
        )

        if axis == "." or not axis or axis not in nxdata:
            # Fallback to 0..N-1 index array along the mapped signal dimension
            dim_size = signal.shape[dim_indices[0]] if dim_indices[0] < signal.ndim else 0
            axis_values.append(np.arange(dim_size))
            axis_labels.append("")
            continue

        dataset = nxdata[axis]
        values = dataset[...]

        units = decode(dataset.attrs.get("units", ""))
        label = f"{axis} ({units})" if units else axis

        axis_values.append(values)
        axis_labels.append(label)

    return axis_values, axis_labels
