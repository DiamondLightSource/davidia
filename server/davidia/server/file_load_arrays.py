import logging

import h5py
import numpy as np

from .file_return_data import find_plottable_data, read_axes


def read_plot_data(path):
    logger = logging.getLogger("main")
    with h5py.File(path, "r") as nexus_file:

        nxdata, signal, axes,indices, version = find_plottable_data(nexus_file)

        data=np.empty(signal.shape,dtype=signal.dtype)
        logger.info(f"You are using {version} data.")
        if signal.chunks:
            for slice in signal.iter_chunks():
                signal.read_direct(data, source_sel=slice, dest_sel=slice)
        else:
            signal.read_direct(data) # maybe not load in everything at once? unsure of alternatives

        axis_values, axis_labels = read_axes(
            nxdata,
            signal,
            axes
        )

        return data, axis_labels,indices, axis_values
