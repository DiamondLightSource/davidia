import h5py
import numpy as np


def decode(value):
    if isinstance(value, (bytes, np.bytes_)):
        return value.decode("utf-8")
    if isinstance(value, np.ndarray):
        return [decode(v) for v in value.tolist()]
    if isinstance(value, np.generic):
        return value.item()
    return value

def iterate_over_group(group):
    for name, obj in group.items():
        if isinstance(obj, h5py.Group):
            yield name, obj
            
def find_default_entry(root):
    if "default" in root.attrs:
        name = decode(root.attrs["default"])
        entry = root[name]

        if isinstance(entry, h5py.Group) and is_nx_class(entry,"NXentry"):
            return [entry]

    return find_groups(root, "NXentry")

def iterate_over_group_recursive(group):
    for name, obj in iterate_over_group(group):
        yield name, obj
        yield from iterate_over_group_recursive(obj)

def iterate_over_datasets_recursive(group):
    for name, obj in group.items():
        if isinstance(obj, h5py.Dataset):
            yield name, obj

        elif isinstance(obj, h5py.Group):
            for child_name, child in iterate_over_datasets_recursive(obj):
                yield f"{name}/{child_name}", child

def decode_attrs(attr_dict:dict):
    attrs = {
                key: decode(value)
                for key, value in attr_dict.items()
            }
    return attrs

def find_default_group(group):
    while "default" in group.attrs:
        name = decode(group.attrs["default"])
        group = group[name]

    return group

def is_nx_class(group,class_name):
    if decode(group.attrs.get("NX_class", ""))==class_name:
        return True
    else:
        return False

def find_groups(group, nx_class_name):
    for _, child in iterate_over_group(group):
        if is_nx_class(child,nx_class_name):
            yield child

def find_groups_recursive(group, nx_class_name):
    for _, child in iterate_over_group_recursive(group):
        if is_nx_class(child,nx_class_name):
            yield child

def find_legacy_signal(nxdata):
    for name, obj in iterate_over_datasets_recursive(nxdata):
        signal = decode(obj.attrs.get("signal", 0))

        if np.any(np.asarray(signal) == 1):
            return obj

    return None