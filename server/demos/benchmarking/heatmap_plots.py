from davidia.plot import (
    image
)
import time
import numpy as np
import h5py
from sklearn.preprocessing import MinMaxScaler
from scipy.ndimage import rotate

from demos.benchmarking.utilities import get_detector_image
base = "http://172.23.71.100:8000/api/v1"
uid = "6894b49c-81cb-4dad-a86f-45d5a4069f81"


def plot_nxs_heatmap(path, dataset, repeats, size, delay, sli):
    totaltime = []
    lenlist = []
    timetaken = []
    loadtimes = []
    transformdata = []
    normtime = []
    slicetime = []
    update_periods = []
    processing_times = []

    with h5py.File(path, "r") as f:
        data = f[dataset]

        n_frames = data.shape[0]

        for update in range(repeats):
            update_start = time.perf_counter()
            totalstart = time.perf_counter()
            frame = update % n_frames
            start = time.perf_counter()
            frame_data = data[frame, :200, :size]
            loadtime = time.perf_counter() - start
            loadtimes.append(loadtime)
            start = time.perf_counter()
            s = MinMaxScaler()
            frame_data = s.fit_transform(frame_data)
            normtime.append(time.perf_counter() - start)
            start = time.perf_counter()
            frame_data = rotate(
                frame_data,
                angle=90,
                reshape=True
            )
            transformdata.append(time.perf_counter() - start)
            start = time.perf_counter()
            frame_data = frame_data[::sli, ::sli]
            slicetime.append(time.perf_counter() - start)
            start = time.perf_counter()
            response = image(
                values=frame_data,
                heatmap_scale="linear",
                colour_map="Inferno",
                plot_config={
                    "x_label": "x-axis",
                    "y_label": "y-axis",
                    "title": f"NXS heatmap - frame {frame}",
                },
                plot_id="plot_0",
            )
            lenlist.append(response.content)
            timetaken.append(time.perf_counter() - start)
            totaltime.append(time.perf_counter() - totalstart)
            processing_time = (time.perf_counter() - update_start)
            processing_times.append(processing_time)
            time.sleep(delay)
            update_period = (time.perf_counter() - update_start)
            update_periods.append(update_period)

    return {
        "Median Total Time": np.median(totaltime),
        "Median Plot Time Taken": np.median(timetaken),
        "Mean Plot Time Taken": np.mean(timetaken),
        "Min Plot Time Taken": np.min(timetaken),
        "Max Plot Time Taken": np.max(timetaken),
        "Median Load Time Taken": np.median(loadtimes),
        "Mean Load Time Taken": np.mean(loadtimes),
        "Median Normalisation Time Taken": np.median(normtime),
        "Median Transform Time Taken": np.median(transformdata),
        "Median Slice Time Taken": np.median(slicetime),
        "Median Processing Time": np.median(processing_times),
        "Median Update Period": np.median(update_periods),
        "Median Update Rate": 1 / np.median(update_periods),
    }, {
        "NXS_heat": {
            "totalTime": totaltime,
            "plotTime": timetaken,
            "loadTime": loadtimes,
            "normTime": normtime,
            "transformTime": transformdata,
            "sliceTime": slicetime,
            "processTime": processing_times,
            "updatePeriod": update_periods,
        }
    }


def plot_api_heatmap(repeats, size, delay,sli):
    totaltime=[]
    lenlist = []
    timetaken = []
    loadtimes = []
    transformdata = []
    normtime = []
    slicetime=[]
    n_frames = 25
    update_periods = []
    processing_times = []
    transfer_sizes=[]
    for update in range(repeats):
        update_start=time.perf_counter()    
        totalstart= time.perf_counter()
        frame = update % n_frames
        start = time.perf_counter()
        data,byte = get_detector_image(frame,size)
        transfer_sizes.append(byte)
        loadtime = time.perf_counter() - start
        loadtimes.append(loadtime)
        start = time.perf_counter()
        s = MinMaxScaler()
        data = s.fit_transform(data)
        normtime.append(
            time.perf_counter() - start
        )
        start = time.perf_counter()
        data=rotate(data,angle=90,reshape=True)
        transformdata.append(
            time.perf_counter() - start
        )
        start=time.perf_counter()
        data=data[::sli,::sli]
        slicetime.append(time.perf_counter()-start)
        start=time.perf_counter()
        response = image(
            values=data,
            heatmap_scale="linear",
            colour_map="Inferno",
            plot_config={
                "x_label": "x-axis",
                "y_label": "y-axis",
                "title": f"API heatmap - frame {frame}",
            },
            plot_id="plot_0",
        )
        lenlist.append(response.content)
        timetaken.append(
            time.perf_counter() - start
        )
        totaltime.append(time.perf_counter()-totalstart)
        processing_time = time.perf_counter() - update_start
        processing_times.append(processing_time)
        time.sleep(delay)
        update_period = time.perf_counter() - update_start
        update_periods.append(update_period)
    return {"Median Total Time":np.median(totaltime),
        "Median Plot Time Taken": np.median(timetaken),
        "Mean Plot Time Taken": np.mean(timetaken),
        "Min Plot Time Taken": np.min(timetaken),
        "Max Plot Time Taken": np.max(timetaken),
        "Median Load Time Taken": np.median(loadtimes),
        "Mean Load Time Taken": np.mean(loadtimes),
        "Median Normalisation Time Taken": np.median(normtime),
        "Median Transform Time Taken": np.median(transformdata),
        "Median Slice Time Taken":np.median(slicetime),
        "Median Processing Time": np.median(processing_times),
        "Median Update Period": np.median(update_periods),
        "Median Update Rate": 1 / np.median(update_periods)},{"api_heat":{"totalTime":totaltime,"plotTime":timetaken,"loadTime":loadtimes,"normTime":normtime,"transformTime":transformdata,"sliceTime":slicetime,"processTime":processing_times,"transferSize":transfer_sizes,"updatePeriod":update_periods,}
        }
