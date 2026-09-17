from davidia.plot import (
    line,scatter,image
)
import time
import numpy as np
import h5py
import datetime
from sklearn.preprocessing import MinMaxScaler
from scipy.ndimage import rotate
import matplotlib.pyplot as plt
# def plot_one_dimension():
#     data = np.arange(0,1000,1,dtype=int)
#     start=time.perf_counter()
#     line(
#         x=data,
#         y=data,
#         plot_config={
#             "x_label": "x-axis",
#             "y_label": "y-axis",
#             "x_scale": "linear",
#             "y_scale": "linear",
#             "title": "line demo plot",
#         },
#         plot_id=f"plot_{0}",
#         line_on=True,
#         point_size=8,
#         glyph_type="Circle",
#         colour="red",
#         width=1.5,
#     )
    
#     timetaken=time.perf_counter()-start
#     print(f"initial 1d takes {timetaken*1000:.3f} ms")

# def update_one_dimension(repeats):
#     timetaken=[]
#     x=np.arange(1000,dtype=float)
#     y=x
#     for update in range(repeats):
#         new_x=np.arange(len(x),len(x)+100,dtype=float)
#         new_y=new_x 
#         x = np.concatenate([x, new_x])
#         y = np.concatenate([y, new_y])
#         start=time.perf_counter()
#         line(
#                 x=x,
#                 y=y,
#                 plot_config={
#                     "x_label": "x-axis",
#                     "y_label": "y-axis",
#                     "x_scale": "linear",
#                     "y_scale": "linear",
#                     "title": "line demo plot",
#                 },
#                 plot_id="plot_0",
#                 line_on=True,
#                 point_size=8,
#                 glyph_type="Circle",
#                 colour="red",
#                 width=1.5,
#             )
#         timetaken.append(time.perf_counter()-start)
#         time.sleep(0.5)
#     return np.median(timetaken),np.mean(timetaken),np.min(timetaken),np.max(timetaken)

# def plot_two_dimension():
#     data = np.random.random((100, 100))
#     x, y = np.meshgrid(
#     np.arange(data.shape[1]),
#     np.arange(data.shape[0])
# )

#     x = x.ravel()
#     y = y.ravel()
#     point_values = data.ravel()
#     x_label = "x-axis"
#     start=time.perf_counter()
#     scatter(
#         x=x,
#         y=y,
#         point_values=point_values,
#         domain=(0,1),
#         plot_config={
#             "x_label": x_label,
#             "y_label": "y-axis",
#             "x_scale": "linear",
#             "y_scale": "linear",
#             "title": "line demo plot",
#         },
#         plot_id=f"plot_{1}",
#         line_on=False,
#         point_size=8,
#         glyph_type="Circle",
#         colour="red",
#         width=1.5,
#     )
    
#     timetaken=time.perf_counter()-start
#     print(f"initial 2d takes {timetaken*1000:.3f} ms")

# def update_two_dimension(repeats):
#     timetaken=[]
#     for update in range(repeats):
#         data = np.random.random((100, 100))
#         x, y = np.meshgrid(
#             np.arange(data.shape[1]),
#             np.arange(data.shape[0])
#         )
#         x = x.ravel()
#         y = y.ravel()
#         point_values = data.ravel()
#         x_label = "x-axis"
#         start=time.perf_counter()
#         scatter(
#                 x=x,
#                 y=y,
#                 point_values=point_values,
#                 domain=(0,1),
#                 plot_config={
#                     "x_label": x_label,
#                     "y_label": "y-axis",
#                     "x_scale": "linear",
#                     "y_scale": "linear",
#                     "title": "line demo plot",
#                 },colour_map="Reds",
#                 plot_id=f"plot_{1}",
#                 line_on=False,
#                 point_size=8,
#                 glyph_type="Circle",
#                 colour="red",
#                 width=1.5,
#             )
#         timetaken.append(time.perf_counter()-start)
#         time.sleep(0.5)
#     return np.median(timetaken),np.mean(timetaken),np.min(timetaken),np.max(timetaken)



# def plot_heatmap():
#     data = np.random.random((100, 100))
#     start=time.perf_counter()
#     image(
#         values=data,
#         domain=(0,1),colour_map="Greens",
#         plot_config={
#             "x_label": "x-axis",
#             "y_label": "y-axis",
#             "title": "line demo plot",
#         },
#         plot_id=f"plot_{0}",
#     )
    
#     timetaken=time.perf_counter()-start
#     print(f"initial 2d takes {timetaken*1000:.3f} ms")

# def update_heatmap(repeats,copies):
#     timetaken=[]
#     for update in range(repeats):
#         data = np.random.random((copies,copies))
#         start=time.perf_counter()
#         image(
#            matplotlib values=data,
#             domain=(0,1),colour_map="Inferno",
#             plot_config={
#                 "x_label": "x-axis",
#                 "y_label": "y-axis",
#                 "title": "line demo plot",
#             },
#             plot_id=f"plot_{0}",
#         )
#         timetaken.append(time.perf_counter()-start)
#         time.sleep(0.5)
#     return np.median(timetaken),np.mean(timetaken),np.min(timetaken),np.max(timetaken)

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
            data = np.random.random((n, n))
            f.create_dataset(
                f"image_{n}",
                data=data
            )

fig, axes = plt.subplots(5, 3, figsize=(10, 7))


def plot_nxs_one_dimension(path,dataset_path,repeats,size):
    timetaken = []
    loadtimes = []
    transformdata=[]
    for update in range(repeats):
        start = time.perf_counter()
        with h5py.File(path, "r") as f:
            data = f[dataset_path][:]
        loadtime = time.perf_counter() - start
        loadtimes.append(loadtime)
        data = data.ravel()
        x=np.arange(data.size,dtype=float)
        start = time.perf_counter()
        s=MinMaxScaler()
        reshdata = data.reshape(-1, 1)
        normdata = s.fit_transform(reshdata).flatten()
        normtime = time.perf_counter() - start
        start = time.perf_counter()
        T=make_three_by_three_transform(theta=update,tx=update)
        x,normdata=transform_points(x,data,T)
        transformdata.append(time.perf_counter()-start)
        total_points=len(x)
        points_per_update = total_points // repeats
        end = min(
                    (update + 1) * points_per_update,
                    total_points
                )
        current_x = x[:end]
        current_y = normdata[:end]
        start = time.perf_counter()
        line(
            x=current_x,
            y=current_y,
            plot_config={
                "x_label": "x-axis",
                "y_label": "y-axis",
                "x_scale": "linear",
                "y_scale": "linear",
                "title": "file line",
            },
            plot_id="plot_1",
            line_on=True,
            point_size=8,
            glyph_type="Circle",
            colour="red",
            width=1.5,
        )

        timetaken.append(time.perf_counter() - start)

        time.sleep(0.5)
    x=list(range(len(transformdata)))
    match size:
        case 1000:
            ax=axes[0,1]
        case 2000:
            ax=axes[1,1]
        case 4000:
            ax=axes[2,1]
        case 8000:
            ax=axes[3,1]
        case 16000:
            ax=axes[4,1]
    ax.plot(x,transformdata,'bo',label="transform time (ms)")
    ax.plot(x,timetaken,'go',label="plot time (ms)")   
    ax.set_title(f"one-dimension plot {size}")
    # ax.legend(loc="upper left")
    return (
        np.median(timetaken),
        np.mean(timetaken),
        np.min(timetaken),
        np.max(timetaken),
        np.median(loadtimes),
        np.mean(loadtimes),
        np.median(normtime),
        np.median(transformdata)
    )

#make lengthen
def plot_nxs_two_dimension(path, dataset, repeats,size):
    timetaken = []
    loadtimes = []
    transformdata=[]
    for update in range(repeats):

        start = time.perf_counter()

        with h5py.File(path, "r") as f:
            x = f[f"{dataset}/x"][:]
            y = f[f"{dataset}/y"][:]

        loadtime = time.perf_counter() - start
        loadtimes.append(loadtime)
        start = time.perf_counter()
        sx=MinMaxScaler()
        sy=MinMaxScaler()
        x=x.reshape(-1,1)
        y=y.reshape(-1,1)
        x=sx.fit_transform(x).flatten()
        y=sy.fit_transform(y).flatten()
        normtime = time.perf_counter() - start
        start = time.perf_counter()
        T=make_three_by_three_transform(theta=update,tx=update)
        x,y=transform_points(x,y,T)
        point_values = np.sin(x * 10)
        transformdata.append(time.perf_counter()-start)
        start = time.perf_counter()
        total_points=len(x)
        points_per_update = total_points // repeats
        end = min(
            (update + 1) * points_per_update,
            total_points
        )
        current_x = x[:end]
        current_y = y[:end]
        point_values = np.sin(current_x * 10)
        scatter(
            x=current_x,
            y=current_y,
            point_values=point_values,
            domain=(-1, 1),
            plot_config={
                "x_label": "x-axis",
                "y_label": "y-axis",
                "x_scale": "linear",
                "y_scale": "linear",
                "title": "file scatter",
            },
            plot_id="plot_1",
            line_on=True,
            point_size=8,
            glyph_type="Circle",
            colour="red",
            width=1.5,
            colour_map="Inferno",
        )
        timetaken.append(time.perf_counter() - start)
        time.sleep(0.5)
    x=list(range(len(transformdata)))
    match size:
        case 200:
            ax=axes[0,2]
        case 2000:
            ax=axes[1,2]
        case 20000:
            ax=axes[2,2]
        case 40000:
            ax=axes[3,2]
        case 80000:
            ax=axes[4,2]
    ax.plot(x,transformdata,'bo',label="transform time (ms)")
    ax.plot(x,timetaken,'go',label="plot time (ms)")   
    ax.set_title(f"two-dimension plot {size}")
    # ax.legend(loc="upper left")
    return (
        np.median(timetaken),
        np.mean(timetaken),
        np.min(timetaken),
        np.max(timetaken),
        np.median(loadtimes),
        np.mean(loadtimes),
        np.median(normtime),
        np.median(transformdata)
    )


def plot_nxs_heatmap(path, dataset, repeats,size):

    timetaken = []
    loadtimes = []
    transformdata=[]
    for update in range(repeats):

        start = time.perf_counter()

        with h5py.File(path, "r") as f:
            data = f[dataset][:]

        loadtime = time.perf_counter() - start
        loadtimes.append(loadtime)
        start = time.perf_counter()
        s=MinMaxScaler()
        data=s.fit_transform(data)
        normtime = time.perf_counter() - start
        start = time.perf_counter()
        data=rotate(data,angle=update,reshape=True)
        transformdata.append(time.perf_counter()-start)
        start = time.perf_counter()
        image(
            values=data,
            heatmap_scale="linear",
            colour_map="Inferno",
            plot_config={
                "x_label": "x-axis",
                "y_label": "y-axis",
                "title": "file heatmap",
            },
            plot_id="plot_0",
        )
        timetaken.append(time.perf_counter() - start)
        time.sleep(0.5)
    x=list(range(len(transformdata)))

    match size:
        case 100:
            ax=axes[0,0]
        case 200:
            ax=axes[1,0]
        case 500:
            ax=axes[2,0]
        case 750:
            ax=axes[3,0]
        case 1000:
            ax=axes[4,0]
    ax.plot(x,transformdata,'bo',label="transform time (ms)")
    ax.plot(x,timetaken,'go',label="plot time (ms)")   
    ax.set_title(f"heatmap plot {size}")
    # ax.legend(loc="upper left")
    return (
        np.median(timetaken),
        np.mean(timetaken),
        np.min(timetaken),
        np.max(timetaken),
        np.median(loadtimes),
        np.mean(loadtimes),
        np.median(normtime),
        np.median(transformdata)
    )





def runall(repeats):
    x=datetime.datetime.now()
    with open(f"demos/benchmark_output_{repeats}_repeats_{x.strftime('%d')}_{x.strftime('%m')}_{x.strftime('%y')}_{x.strftime('%H')}_{x.strftime('%M')}.txt","a") as j:
        # plot_one_dimension()
        # plot_two_dimension()
        # plot_heatmap()
        # j.write("_________________________________________________________________________________________\n")
        # onemed,onemean,onemin,onemax=update_one_dimension(repeats)
        # twomed,twomean,twomin,twomax=update_two_dimension(repeats)
        # hotmed,hotmean,hotmin,hotmax=update_heatmap(repeats,100) 
        # j.write(f"| growing line      |  median:  {onemed*1000:.3f}ms|  mean:  {onemean*1000:.3f}ms|  min:  {onemin*1000:.3f}ms|  max:  {onemax*1000:.3f}ms|\n")
        # j.write(f"| new 100x100 array |  median:  {twomed*1000:.3f}ms|  mean:  {twomean*1000:.3f}ms|  min:  {twomin*1000:.3f}ms|  max:  {twomax*1000:.3f}ms|\n")
        # j.write(f"| new heatmap       |  median:  {hotmed*1000:.3f}ms|  mean:  {hotmean*1000:.3f}ms|  min:  {hotmin*1000:.3f}ms|  max:  {hotmax*1000:.3f}ms|\n")
        # j.write("+---------------------------------------------------------------------------------------+\n") 
        sizes = [100, 200, 500, 750,1000]
        for size in sizes:
            result = plot_nxs_heatmap(
                "demos/benchmark_data.h5",
                f"image_{size}",
                repeats,size
            )
            j.write("_________________________________________________________________________________________\n")
            j.write(
                f"heatmap {size}x{size}: "
                f"load={result[4]*1000:.3f} ms, "
                f"plot={result[0]*1000:.3f} ms,"
                f"normtime={result[6]*1000:.3f} ms,"
                f"transformtime={result[7]*1000:.3f}\n"
            )
        sizes = [1000, 2000, 4000, 8000, 16000]
        for size in sizes:
            result = plot_nxs_one_dimension(
                "demos/benchmark_data.h5",
                f"line_{size}",
                repeats,size
            )
            j.write("_________________________________________________________________________________________\n")
            j.write(
                f"line {size}: "
                f"load={result[4]*1000:.3f} ms, "
                f"plot={result[0]*1000:.3f} ms,"
                f"normtime={result[6]*1000:.3f} ms,"
                f"transformtime={result[7]*1000:.3f}\n"
            )
        sizes = [200, 2000, 20000, 40000,80000]
        for size in sizes:
            result = plot_nxs_two_dimension(
                "demos/benchmark_data.h5",
                f"scatter_{size}",
                repeats,size
            )
            j.write("_________________________________________________________________________________________\n")
            j.write(
                f"scatter {size}: "
                f"load={result[4]*1000:.3f} ms, "
                f"plot={result[0]*1000:.3f} ms,"
                f"normtime={result[6]*1000:.3f} ms,"
                f"transformtime={result[7]*1000:.3f}\n"
            )
    fig.tight_layout()
    plt.show()  


# create_benchmark_file('demos/benchmark_data.h5')

runall(90)