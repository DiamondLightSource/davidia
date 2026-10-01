from davidia.plot import (
    scatter,
)
import time
import numpy as np
import h5py
from sklearn.preprocessing import MinMaxScaler
from demos.benchmarking.utilities import make_three_by_three_transform,get_api_table,transform_points

base = "http://172.23.71.100:8000/api/v1"
uid = "6894b49c-81cb-4dad-a86f-45d5a4069f81"


def plot_api_two_dimension(repeats, size, delay,sli):
    totaltime=[]
    timetaken = []
    loadtimes = []
    transformdata = []
    normtime = []
    lenlist = []
    slicetime=[]
    update_periods = []
    processing_times = []
    transfer_sizes=[]
    for update in range(repeats):
        update_start=time.perf_counter()
        totalstart=time.perf_counter()
        start = time.perf_counter()
        y,x,ti,byte = get_api_table(uid)
        transfer_sizes.append(byte)
        loadtime = time.perf_counter() - start
        loadtimes.append(loadtime)
        start = time.perf_counter()
        sx = MinMaxScaler()
        sy = MinMaxScaler()
        x = (sx.fit_transform(x.reshape((-1, 1))).ravel())
        y = (sy.fit_transform(y.reshape((-1, 1))).ravel())
        normtime.append(time.perf_counter() - start)
        x = np.resize(x, size)
        y = np.resize(y, size)
        ti = np.resize(ti, size)
        start = time.perf_counter()
        T = make_three_by_three_transform(
            theta=90,
            tx=1
        )
        x, y = transform_points(x,y,T)
        transformdata.append(time.perf_counter() - start)
        total_points = len(x)
        points_per_update = (total_points // repeats)
        end = min((update + 1) * points_per_update,total_points)
        current_x = x[:end]
        current_y = y[:end]
        current_values = ti[:end]
        colour_scaler = MinMaxScaler()
        point_values = (
            colour_scaler
            .fit_transform(
                current_values.reshape((-1, 1))
            )
            .flatten()
        )
        start=time.perf_counter()
        current_x=current_x[::sli]
        current_y=current_y[::sli]
        point_values=point_values[::sli]
        slicetime.append(time.perf_counter()-start)
        start = time.perf_counter()
        lenlist.append(
            scatter(
                x=current_x,
                y=current_y,
                point_values=point_values,
                domain=(0, 1),
                plot_config={
                    "x_label": "sample_stage-x",
                    "y_label": "sample_stage-y",
                    "x_scale": "linear",
                    "y_scale": "linear",
                    "title": "API scatter",
                },
                plot_id="plot_1",
                line_on=False,
                point_size=8,
                glyph_type="Circle",
                colour="red",
                width=1.5,
                colour_map="Inferno",
            ).content
        )

        timetaken.append(
            time.perf_counter() - start
        )
        totaltime.append(time.perf_counter()-totalstart)
        processing_time = time.perf_counter() - update_start
        processing_times.append(processing_time)
        time.sleep(delay)
        update_period = time.perf_counter() - update_start
        update_periods.append(update_period)
    x = list(range(len(transformdata)))
    
    return {"Median Total Time":np.median(totaltime),
        "Median Plot Time Taken":np.median(timetaken),
        "Mean Plot Time Taken":np.mean(timetaken),
        "Min Plot Time Taken":np.min(timetaken),
        "Max Plot Time Taken":np.max(timetaken),
        "Median Load Time Taken":np.median(loadtimes),
        "Mean Load Time Taken":np.mean(loadtimes),
        "Median Normalisation Time Taken":np.median(normtime),
        "Median Transform Time Taken":np.median(transformdata),
        "Median Slice Time Taken":np.median(slicetime),
        "Median Processing Time": np.median(processing_times),
        "Median Update Period": np.median(update_periods),
        "Median Update Rate": 1 / np.median(update_periods),
        "transfer sizes": np.median(transfer_sizes)},{"api_2d":{"totalTime":totaltime,"plotTime":timetaken,"loadTime":loadtimes,"normTime":normtime,"transformTime":transformdata,"sliceTime":slicetime,"processTime":processing_times,"updatePeriod":update_periods,"transferSize":transfer_sizes}
        }




def plot_nxs_two_dimension(path, dataset, repeats,size,delay,sli):
    timetaken = []
    loadtimes = []
    transformdata=[]
    normtime=[]
    lenlist=[]
    slicetime=[]
    totaltime=[]
    update_periods = []
    processing_times = []
    for update in range(repeats):
        update_start = time.perf_counter()
        totalstart=time.perf_counter()
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
        normtime.append(time.perf_counter() - start)
        start = time.perf_counter()
        T=make_three_by_three_transform(theta=90,
                                        tx=1)
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
        start=time.perf_counter()
        current_x=current_x[::sli]
        current_y=current_y[::sli]
        point_values=point_values[::sli]
        slicetime.append(time.perf_counter()-start)
        start=time.perf_counter()
        lenlist.append(scatter(
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
        ).content)
        timetaken.append(time.perf_counter() - start)
        totaltime.append(time.perf_counter()-totalstart)
        processing_time = time.perf_counter() - update_start
        processing_times.append(processing_time)
        time.sleep(delay)
        update_period = time.perf_counter() - update_start
        update_periods.append(update_period)
    x=list(range(len(transformdata)))
    return {"Median Total Time":np.median(totaltime),
        "Median Plot Time Taken":np.median(timetaken),
        "Mean Plot Time Taken":np.mean(timetaken),
        "Min Plot Time Taken":np.min(timetaken),
        "Max Plot Time Taken":np.max(timetaken),
        "Median Load Time Taken":np.median(loadtimes),
        "Mean Load Time Taken":np.mean(loadtimes),
        "Median Normalisation Time Taken":np.median(normtime),
        "Median Transform Time Taken":np.median(transformdata),
        "Median Slice Time Taken":np.median(slicetime),
        "Median Processing Time": np.median(processing_times),
        "Median Update Period": np.median(update_periods),
        "Median Update Rate": 1 / np.median(update_periods)},{"NXS_2d":{"totalTime":totaltime,"plotTime":timetaken,"loadTime":loadtimes,"normTime":normtime,"transformTime":transformdata,"sliceTime":slicetime,"processTime":processing_times,"updatePeriod":update_periods,}}
    