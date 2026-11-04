import h5py
import numpy as np

from .file_return_data import find_plottable_data, read_axes


def read_path(path):
    with h5py.File(path, "r") as nexus_file:

        nxdata, signal, axes, version = find_plottable_data(nexus_file)
        print(f"You are using {version} data.")
        data = np.asarray(signal)

        axis_values, axis_labels = read_axes(
            nxdata,
            signal,
            axes
        )

        return data, axis_labels, axis_values
