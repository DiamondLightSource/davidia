import h5py
import numpy as np

from .file_read_utils import decode, find_groups, iterate_over_datasets, nx_class


def find_v3(entry:h5py.Group):
    if "default" in entry.attrs:
        name = decode(entry.attrs["default"])
        nxdata = entry[name]

        if isinstance(nxdata, h5py.Group) and nx_class(nxdata) == "NXdata":
            if "signal" in nxdata.attrs:
                signal = decode(nxdata.attrs["signal"])
                if signal in nxdata:
                    return nxdata, nxdata[signal], "v3"

    for nxdata in find_groups(entry, "NXdata"):
        if "signal" in nxdata.attrs:
            signal = decode(nxdata.attrs["signal"])

            if signal in nxdata:
                return nxdata, nxdata[signal], "v3"

    return None

def parse_axes(value):
    value = decode(value)

    if isinstance(value, str):
        return value.replace(",", ":").split(":")

    if isinstance(value, list):
        return value

    return []


def find_v2(nxdata:h5py.Group):
    for name, obj in nxdata.items():
        if not isinstance(obj, h5py.Dataset):
            continue

        if decode(obj.attrs.get("signal", 0)) == 1:
            axes = parse_axes(obj.attrs.get("axes", []))
            return nxdata, obj, axes, "v2"

    return None


def find_v1(nxdata:h5py.Group, signal):
    rank = signal.ndim
    axes = ["."] * rank

    for name, obj in iterate_over_datasets(nxdata):
        axis = decode(obj.attrs.get("axis", 0))
        primary = decode(obj.attrs.get("primary", 0))

        if not axis or not np.any(np.asarray(primary) == 1):
            continue

        axis = int(axis)

        if 1 <= axis <= rank:
            axes[axis - 1] = name

    return axes

