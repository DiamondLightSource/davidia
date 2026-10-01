import numpy as np
import h5py

import requests

# base = "http://172.23.71.100:8000/api/v1"
# uid = "6894b49c-81cb-4dad-a86f-45d5a4069f81"
base = "http://localhost:8001/api/v1"
uid = "i05-1-62874"

def get_detector_image(frame,size):

    # url = (
    #     f"{base}/array/full/{uid}/primary/"
    #     f"spectroscopy_detector"
    #     f"?slice={frame},0:200,0:{size}"
    # )
    url = (
        f"{base}/array/full/{uid}/entry1/analyser/data"
        f"?slice={frame},0:200,0:{size}"
    )
    r = requests.get(url)
    r.raise_for_status()
    data = np.frombuffer(r.content, dtype="<i4")#np.uint8)

    return data.reshape(200, size),len(r.content)

def get_api_data(uid, name):
    url = (
        f"{base}/array/full/{uid}/primary/"
        f"{name}"
    )
    url = (
        f"{base}/array/full/{uid}/entry1/instrument/analyser/cps"
    )
    r = requests.get(url)
    r.raise_for_status()

    data = np.frombuffer(
        r.content,
        dtype="<f8"
    )

    return data, len(r.content)

# def get_api_table(uid): 
#     a=requests.get(f"{base}/table/full/{uid}/primary/internal")
#     df=pl.read_ipc(io.BytesIO(a.content))
#     return df['sample_stage-y'],df['sample_stage-x'],df['time'],len(a.content)

def get_api_scatter_data(uid):
    angle_url = (
        f"{base}/array/full/{uid}"
        f"/entry1/instrument/analyser/analyser_polar_angle"
    )

    cps_url = (
        f"{base}/array/full/{uid}"
        f"/entry1/instrument/analyser/cps"
    )

    angle_response = requests.get(angle_url)
    angle_response.raise_for_status()

    cps_response = requests.get(cps_url)
    cps_response.raise_for_status()

    angles = np.frombuffer(
        angle_response.content,
        dtype="<f8"
    )

    cps = np.frombuffer(
        cps_response.content,
        dtype="<f8"
    )
    byt=len(angle_response.content)+len(cps_response.content)
    return angles, cps,byt

def make_three_by_three_transform(theta=30, tx=1, ty=1, sx=1, sy=1):
    """_summary_

    Args:
        theta (int, optional): rotation. Defaults to 30.
        tx (int, optional): translate x. Defaults to 1.
        ty (int, optional): translate y. Defaults to 1.
        sx (int, optional): slant x. Defaults to 1.
        sy (int, optional): slant y. Defaults to 1.

    Returns:
        _type_: transformation matrix
    """
    theta = np.radians(theta)

    c = np.cos(theta)
    s = np.sin(theta)

    return np.array([
        [sx * c, -sy * s, tx],
        [sx * s,  sy * c, ty],
        [0,      0,      1],
    ])

def make_four_by_four_matrix(theta=30, tx=1, ty=1,tz=1, sx=1, sy=1,sz=1,sh_xy=0,sh_xz=0,sh_yz=0):
    """_summary_

    Args:
        theta (int, optional): rotation. Defaults to 30.
        tx (int, optional): translate. Defaults to 1.
        ty (int, optional): translate. Defaults to 1.
        tz (int, optional): translate. Defaults to 1.
        sx (int, optional): slant. Defaults to 1.
        sy (int, optional): slant. Defaults to 1.
        sz (int, optional): slant. Defaults to 1.
        sh_xy (int, optional): shear. Defaults to 0.
        sh_xz (int, optional): shear. Defaults to 0.
        sh_yz (int, optional): shear. Defaults to 0.

    Returns:
        _type_: _description_
    """
    theta = np.radians(theta)
    translation_matrix=np.array([
        [1,0,0,tx],
        [0,1,0,ty],
        [0,0,1,tz],
        [0,0,0,1]])
    c = np.cos(theta)
    s = np.sin(theta)
    rotation_matrix=np.array([
        [c,-s,0,0],
        [s,c,0,0],
        [0,0,1,0],
        [0,0,0,1]])
    scale_matrix=np.array([
        [sx,0,0,0],
        [0,sy,0,0],
        [0,0,sz,0],
        [0,0,0,1]])
    slant_matrix=np.array([
        [1,sh_xy,sh_xz,0],
        [0,1,sh_yz,0],
        [0,0,1,0],
        [0,0,0,1]])
    
    return translation_matrix @ rotation_matrix @ scale_matrix @ slant_matrix

def transform_points(x, y, T):
    points = np.vstack([
        x.ravel(),
        y.ravel(),
        np.ones(x.size),
    ])

    transformed = T @ points

    return (
        transformed[0].reshape(x.shape),
        transformed[1].reshape(y.shape),
    )
def create_benchmark_file(path):
    with h5py.File(path, "w") as f:
        for n in [1000, 2000, 4000, 8000, 16000]:
            x = np.arange(n, dtype=np.float64)
            y = np.sin(x * 0.01)

            f.create_dataset(f"line_{n}", data=y)
        for n in [200, 2000, 20000, 40000,80000]:
            x = np.linspace(0, 1, n)
            y = np.sin(x * 10)
            f.create_dataset(
                f"scatter_{n}/x",
                data=x
            )
            f.create_dataset(
                f"scatter_{n}/y",
                data=y
            )
        for n in [100, 200, 500, 750, 1000]:
            data = np.random.random((200, n))
            f.create_dataset(
                f"image_{n}",
                data=data
            )