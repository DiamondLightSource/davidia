import numpy as np

from .file_find_data import find_v1, find_v2, find_v3
from .file_read_utils import (
    decode,
    find_entries,
    find_groups_recursive,
    find_legacy_signal,
)


def find_plottable_data(nexus_file):
    entries = find_entries(nexus_file)
    
    for entry in entries:
        # prioritise v3 data...
        result = find_v3(entry)
    
        if result is not None:
                nxdata, signal, version = result
                axes = decode(nxdata.attrs.get("axes", []))
                if isinstance(axes, str):
                    axes = [axes]
                
                return nxdata, signal, axes, version
                
        for nxdata in find_groups_recursive(entry, "NXdata"):

            # ...then check for v2...
            result = find_v2(nxdata)

            if result is not None:
                _, signal, axes, version = result
                return nxdata, signal, axes, version

            # ... then check for v1
            signal = find_legacy_signal(nxdata)

            if signal is not None:
                axes = find_v1(nxdata, signal)
                return nxdata, signal, axes, "v1"

    raise ValueError("Could not find plottable NeXus data")


def read_axes(nxdata, signal, axes):
    axis_values = []
    axis_labels = []

    for i, axis in enumerate(axes):

        if axis == "." or not axis:
            axis_values.append(np.arange(signal.shape[i]))
            axis_labels.append("")
            continue

        dataset = nxdata[axis]

        values = np.asarray(dataset)

        units = decode(dataset.attrs.get("units", ""))
        label = axis

        if units:
            label = f"{label} ({units})"

        axis_values.append(values)
        axis_labels.append(label)

    return axis_values, axis_labels
