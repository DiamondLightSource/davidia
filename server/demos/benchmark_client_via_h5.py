from davidia.plot import (
    line,scatter,image
)
import time
import numpy as np
import h5py
import json

def plot_one_dimension():
    data = np.arange(0,1000,1,dtype=int)
    start=time.perf_counter()
    line(
        x=data,
        y=data,
        plot_config={
            "x_label": "x-axis",
            "y_label": "y-axis",
            "x_scale": "linear",
            "y_scale": "linear",
            "title": "line demo plot",
        },
        plot_id=f"plot_{0}",
        line_on=True,
        point_size=8,
        glyph_type="Circle",
        colour="red",
        width=1.5,
    )
    
    timetaken=time.perf_counter()-start
    print(f"initial 1d takes {timetaken*1000:.3f} ms")

def update_one_dimension(repeats):
    timetaken=[]
    x=np.arange(1000,dtype=float)
    y=x
    for update in range(repeats):
        new_x=np.arange(len(x),len(x)+100,dtype=float)
        new_y=new_x 
        x = np.concatenate([x, new_x])
        y = np.concatenate([y, new_y])
        start=time.perf_counter()
        line(
                x=x,
                y=y,
                plot_config={
                    "x_label": "x-axis",
                    "y_label": "y-axis",
                    "x_scale": "linear",
                    "y_scale": "linear",
                    "title": "line demo plot",
                },
                plot_id="plot_0",
                line_on=True,
                point_size=8,
                glyph_type="Circle",
                colour="red",
                width=1.5,
            )
        timetaken.append(time.perf_counter()-start)
        time.sleep(0.5)
    return np.median(timetaken),np.mean(timetaken),np.min(timetaken),np.max(timetaken)

def plot_two_dimension():
    data = np.random.random((100, 100))
    x, y = np.meshgrid(
    np.arange(data.shape[1]),
    np.arange(data.shape[0])
)

    x = x.ravel()
    y = y.ravel()
    point_values = data.ravel()
    x_label = "x-axis"
    start=time.perf_counter()
    scatter(
        x=x,
        y=y,
        point_values=point_values,
        domain=(0,1),
        plot_config={
            "x_label": x_label,
            "y_label": "y-axis",
            "x_scale": "linear",
            "y_scale": "linear",
            "title": "line demo plot",
        },
        plot_id=f"plot_{1}",
        line_on=False,
        point_size=8,
        glyph_type="Circle",
        colour="red",
        width=1.5,
    )
    
    timetaken=time.perf_counter()-start
    print(f"initial 2d takes {timetaken*1000:.3f} ms")

def update_two_dimension(repeats):
    timetaken=[]
    for update in range(repeats):
        data = np.random.random((100, 100))
        x, y = np.meshgrid(
            np.arange(data.shape[1]),
            np.arange(data.shape[0])
        )
        x = x.ravel()
        y = y.ravel()
        point_values = data.ravel()
        x_label = "x-axis"
        start=time.perf_counter()
        scatter(
                x=x,
                y=y,
                point_values=point_values,
                domain=(0,1),
                plot_config={
                    "x_label": x_label,
                    "y_label": "y-axis",
                    "x_scale": "linear",
                    "y_scale": "linear",
                    "title": "line demo plot",
                },colour_map="Reds",
                plot_id=f"plot_{1}",
                line_on=False,
                point_size=8,
                glyph_type="Circle",
                colour="red",
                width=1.5,
            )
        timetaken.append(time.perf_counter()-start)
        time.sleep(0.5)
    return np.median(timetaken),np.mean(timetaken),np.min(timetaken),np.max(timetaken)



def plot_heatmap():
    data = np.random.random((100, 100))
    start=time.perf_counter()
    image(
        values=data,
        domain=(0,1),colour_map="Greens",
        plot_config={
            "x_label": "x-axis",
            "y_label": "y-axis",
            "title": "line demo plot",
        },
        plot_id=f"plot_{0}",
    )
    
    timetaken=time.perf_counter()-start
    print(f"initial 2d takes {timetaken*1000:.3f} ms")

def update_heatmap(repeats,copies):
    timetaken=[]
    for update in range(repeats):
        data = np.random.random((copies,copies))
        start=time.perf_counter()
        image(
            values=data,
            domain=(0,1),colour_map="Inferno",
            plot_config={
                "x_label": "x-axis",
                "y_label": "y-axis",
                "title": "line demo plot",
            },
            plot_id=f"plot_{0}",
        )
        timetaken.append(time.perf_counter()-start)
        time.sleep(0.5)
    return np.median(timetaken),np.mean(timetaken),np.min(timetaken),np.max(timetaken)



def plot_nxs_one_dimension(path,dataset_path,repeats):
    timetaken = []
    loadtimes = []
    for update in range(repeats):
        start = time.perf_counter()
        with h5py.File(path, "r") as f:
            data = f[dataset_path][:]
        loadtime = time.perf_counter() - start
        loadtimes.append(loadtime)
        data = data.ravel()
        x=np.arange(data.size,dtype=float)
        start = time.perf_counter()

        line(
            x=x,
            y=data,
            plot_config={
                "x_label": "x-axis",
                "y_label": "y-axis",
                "x_scale": "linear",
                "y_scale": "linear",
                "title": "file line",
            },
            plot_id="plot_0",
            line_on=True,
            point_size=8,
            glyph_type="Circle",
            colour="red",
            width=1.5,
        )

        timetaken.append(time.perf_counter() - start)

        time.sleep(0.5)

    return (
        np.median(timetaken),
        np.mean(timetaken),
        np.min(timetaken),
        np.max(timetaken),
        np.median(loadtimes),
        np.mean(loadtimes),
    )


def plot_nxs_two_dimension(path, dataset, repeats):
    timetaken = []
    loadtimes = []
    for update in range(repeats):

        start = time.perf_counter()

        with h5py.File(path, "r") as f:
            x = f[f"{dataset}/x"][:]
            y = f[f"{dataset}/y"][:]

        loadtime = time.perf_counter() - start
        loadtimes.append(loadtime)
        point_values = np.sin(x * 10)
        start = time.perf_counter()
        scatter(
            x=x,
            y=y,
            point_values=point_values,
            domain=(-1, 1),
            plot_config={
                "x_label": "x-axis",
                "y_label": "y-axis",
                "x_scale": "linear",
                "y_scale": "linear",
                "title": "file scatter",
            },
            plot_id="plot_0",
            line_on=True,
            point_size=8,
            glyph_type="Circle",
            colour="red",
            width=1.5,
            colour_map="Inferno",
        )
        timetaken.append(time.perf_counter() - start)
        time.sleep(0.5)

    return (
        np.median(timetaken),
        np.mean(timetaken),
        np.min(timetaken),
        np.max(timetaken),
        np.median(loadtimes),
        np.mean(loadtimes),
    )


def plot_nxs_heatmap(path, dataset, repeats):

    timetaken = []
    loadtimes = []

    for update in range(repeats):

        start = time.perf_counter()

        with h5py.File(path, "r") as f:
            data = f[dataset][:]

        loadtime = time.perf_counter() - start
        loadtimes.append(loadtime)

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

    return (
        np.median(timetaken),
        np.mean(timetaken),
        np.min(timetaken),
        np.max(timetaken),
        np.median(loadtimes),
        np.mean(loadtimes),
    )


def create_benchmark_file(path):
    with h5py.File(path, "w") as f:
        for n in [1000, 2000, 4000, 8000, 16000]:
            x = np.arange(n, dtype=np.float64)
            y = np.sin(x * 0.01)

            f.create_dataset(f"line_{n}", data=y)
        for n in [200, 2000, 20000, 80000]:
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
        for n in [100, 200, 500, 1000]:
            data = np.random.random((n, n))
            f.create_dataset(
                f"image_{n}",
                data=data
            )


# show table for the results
def runall(repeats):
    with open("demos/benchmark_output.txt","a") as j:
        plot_one_dimension()
        plot_two_dimension()
        plot_heatmap()
        j.write("_________________________________________________________________________________________\n")
        onemed,onemean,onemin,onemax=update_one_dimension(repeats)
        twomed,twomean,twomin,twomax=update_two_dimension(repeats)
        hotmed,hotmean,hotmin,hotmax=update_heatmap(repeats,100) 
        j.write(f"| growing line      |  median:  {onemed*1000:.3f}ms|  mean:  {onemean*1000:.3f}ms|  min:  {onemin*1000:.3f}ms|  max:  {onemax*1000:.3f}ms|\n")
        j.write(f"| new 100x100 array |  median:  {twomed*1000:.3f}ms|  mean:  {twomean*1000:.3f}ms|  min:  {twomin*1000:.3f}ms|  max:  {twomax*1000:.3f}ms|\n")
        j.write(f"| new heatmap       |  median:  {hotmed*1000:.3f}ms|  mean:  {hotmean*1000:.3f}ms|  min:  {hotmin*1000:.3f}ms|  max:  {hotmax*1000:.3f}ms|\n")
        j.write("+---------------------------------------------------------------------------------------+\n") 
        sizes = [100, 200, 500, 1000]
        for size in sizes:
            result = plot_nxs_heatmap(
                "demos/benchmark_data.h5",
                f"image_{size}",
                repeats
            )
            j.write("_________________________________________________________________________________________\n")
            j.write(
                f"heatmap {size}x{size}: "
                f"load={result[4]*1000:.3f} ms, "
                f"plot={result[0]*1000:.3f} ms\n"
            )
        sizes = [1000, 2000, 4000, 8000, 16000]
        for size in sizes:
            result = plot_nxs_one_dimension(
                "demos/benchmark_data.h5",
                f"line_{size}",
                repeats,
            )
            j.write("_________________________________________________________________________________________\n")
            j.write(
                f"line {size}: "
                f"load={result[4]*1000:.3f} ms, "
                f"plot={result[0]*1000:.3f} ms\n"
            )
        sizes = [200, 2000, 20000, 80000]
        for size in sizes:
            result = plot_nxs_two_dimension(
                "demos/benchmark_data.h5",
                f"scatter_{size}",
                repeats
            )
            j.write("_________________________________________________________________________________________\n")
            j.write(
                f"scatter {size}: "
                f"load={result[4]*1000:.3f} ms, "
                f"plot={result[0]*1000:.3f} ms\n"
            )
    
