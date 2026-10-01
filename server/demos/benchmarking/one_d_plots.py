from davidia.plot import (
    line,
)
import time
import numpy as np
import h5py
from sklearn.preprocessing import MinMaxScaler


from demos.benchmarking.utilities import make_three_by_three_transform,get_api_data,transform_points
# base = "http://172.23.71.100:8000/api/v1"
# uid = "6894b49c-81cb-4dad-a86f-45d5a4069f81"
base = "http://localhost:8001/api/v1"
uid = "i05-1-62874"


def plot_nxs_one_dimension(path,dataset_path,repeats,size,delay,sli):
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
            data = f[dataset_path][:]
        loadtime = time.perf_counter() - start
        loadtimes.append(loadtime)
        data = data.ravel()

        old_x = np.linspace(
            0,
            1,
            len(data)
        )

        new_x = np.linspace(
            0,
            1,
            size
        )

        data = np.interp(
            new_x,
            old_x,
            data
        )

        x = np.arange(
            size,
            dtype=float
        )

        x=np.arange(data.size,dtype=float)
        start = time.perf_counter()
        s=MinMaxScaler()
        reshdata = data.reshape(-1, 1)
        normdata = s.fit_transform(reshdata).flatten()
        normtime.append(time.perf_counter() - start)
        start = time.perf_counter()
        T=make_three_by_three_transform(theta=90,
                                        tx=1)
        x,normdata=transform_points(x,normdata,T)
        transformdata.append(time.perf_counter()-start)
        total_points=len(x)
        points_per_update = total_points // repeats
        end = min(
                    (update + 1) * points_per_update,
                    total_points
                )
        current_x = x[:end]
        current_y = normdata[:end]
        start=time.perf_counter()
        current_x=current_x[::sli]
        current_y=current_y[::sli]
        slicetime.append(time.perf_counter()-start)
        start = time.perf_counter()

        lenlist.append(line(
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
        "Median Update Rate": 1 / np.median(update_periods)},{"NXS_1d":{"totalTime":totaltime,"plotTime":timetaken,"loadTime":loadtimes,"normTime":normtime,"transformTime":transformdata,"sliceTime":slicetime,"processTime":processing_times,"updatePeriod":update_periods,}}
    

def plot_api_one_dimension(repeats, size,delay,sli):
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
        data,byte = get_api_data(
            uid,
            "cps"
        )
        transfer_sizes.append(byte)
        loadtime = time.perf_counter() - start
        loadtimes.append(loadtime)
        data = data.ravel()

        old_x = np.linspace(
            0,
            1,
            len(data)
        )

        new_x = np.linspace(
            0,
            1,
            size
        )

        data = np.interp(
            new_x,
            old_x,
            data
        )

        x = np.arange(
            size,
            dtype=float
        )

        start = time.perf_counter()
        s = MinMaxScaler()
        reshdata = data.reshape(-1, 1)
        normdata = (
            s.fit_transform(reshdata)
            .flatten()
        )
        normtime.append(
            time.perf_counter() - start
        )
        start = time.perf_counter()
        T = make_three_by_three_transform(
            theta=90,
            tx=1
        )
        x, normdata = transform_points(
            x,
            normdata,
            T
        )
        transformdata.append(
            time.perf_counter() - start
        )
        total_points = len(x)
        points_per_update = (
            total_points // repeats
        )
        end = min(
            (update + 1) * points_per_update,
            total_points
        )
        current_x = x[:end]
        current_y = normdata[:end]
        start = time.perf_counter()
        current_x=current_x[::sli]
        current_y=current_y[::sli]
        slicetime.append(time.perf_counter()-start)
        start=time.perf_counter()
        lenlist.append(
            line(
                x=current_x,
                y=current_y,
                plot_config={
                    "x_label": "Scan point",
                    "y_label": "Green total",
                    "x_scale": "linear",
                    "y_scale": "linear",
                    "title": "API line",
                },
                plot_id="plot_1",
                line_on=True,
                point_size=8,
                glyph_type="Circle",
                colour="red",
                width=1.5,
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
        "transfer sizes": np.median(transfer_sizes)},{"api_1d":{"totalTime":totaltime,"plotTime":timetaken,"loadTime":loadtimes,"normTime":normtime,"transformTime":transformdata,"sliceTime":slicetime,"processTime":processing_times,"updatePeriod":update_periods,"transferSize":transfer_sizes}
        }