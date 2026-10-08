import math
import time

import h5py
import numpy as np
from scipy.ndimage import rotate
from sklearn.preprocessing import MinMaxScaler

from davidia.plot import image
from demos.benchmarking.utilities import get_detector_chunk, get_detector_image,get_detector_int

# base = "http://172.23.71.100:8000/api/v1"
# uid = "6894b49c-81cb-4dad-a86f-45d5a4069f81"
base = "http://localhost:8001/api/v1"
uid = "i05-1-62874"


def plot_nxs_heatmap(path, dataset, repeats, delay, sli):
    totaltime = []
    lenlist = []
    timetaken = []
    loadtimes = []
    transformdata = []
    normtime = []
    slicetime = []
    update_periods = []
    processing_times = []
    open_file=[]
    for update in range(repeats):
        update_start = time.perf_counter()
        totalstart = time.perf_counter()
        loadstart = time.perf_counter()
        start=time.perf_counter()
        with h5py.File(path, "r") as f:
            data = f[dataset]
            op=time.perf_counter()-start
            open_file.append(op)
            n_frames = data.shape[0]
            frame = update % n_frames
            frame_data = data[frame, ::sli,::sli]
            loadtime = time.perf_counter() - (loadstart+op)
            loadtimes.append(loadtime)
            # LAG HERE
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

    return {"Median Open Time":np.median(open_file),
        "Median Total Time": np.median(totaltime),
        "Median Plot Time Taken": np.median(timetaken),
        "Mean Plot Time Taken": np.mean(timetaken),
        "Min Plot Time Taken": np.min(timetaken),
        "Max Plot Time Taken": np.max(timetaken),
        "Median Load Time Taken": np.median(loadtimes),
        "Mean Load Time Taken": np.mean(loadtimes),
        "Median Normalisation Time Taken": np.median(normtime),
        "Median Transform Time Taken": np.median(transformdata),
        # "Median Slice Time Taken": np.median(slicetime),
        "Median Processing Time": np.median(processing_times),
        "Median Update Period": np.median(update_periods),
        "Median Update Rate": 1 / np.median(update_periods),
        "Median Byte to Array Time Taken":0,
        "Median Request Time Taken":0,
    }, {
        "NXS_heat": {
        "openTime":open_file,
            "totalTime": totaltime,
            "plotTime": timetaken,
            "loadTime": loadtimes,
            "normTime": normtime,
            "transformTime": transformdata,
            # "sliceTime": slicetime,
            "processTime": processing_times,
            "updatePeriod": update_periods,
        }
    }


def plot_api_heatmap(repeats, delay,sli):
    totaltime=[]
    lenlist = []
    timetaken = []
    loadtimes = []
    transformdata = []
    normtime = []
    slicetime=[]
    n_frames = 146
    update_periods = []
    processing_times = []
    transfer_sizes=[]
    post_convert_times=[]
    request_times=[]
    combine_times=[]
    smallloadtimes=[]
    for update in range(repeats):
        update_start=time.perf_counter()    
        totalstart= time.perf_counter()
        frame = update % n_frames
        loadstart = time.perf_counter()
        data,byte,request_time,post_convert_time = get_detector_image(frame,sli)
        loadtime = time.perf_counter() - (loadstart+request_time+post_convert_time)
        loadtimes.append(loadtime)
        transfer_sizes.append(byte)
        post_convert_times.append(post_convert_time)
        request_times.append(request_time)
        start = time.perf_counter()
        # LAG HERE
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

        "Median Byte to Array Time Taken":np.median(post_convert_times),
        "Median Request Time Taken":np.median(request_times),

        "Median Normalisation Time Taken": np.median(normtime),
        "Median Transform Time Taken": np.median(transformdata),
        # "Median Slice Time Taken":np.median(slicetime),
        "Median Processing Time": np.median(processing_times),
        "Median Update Period": np.median(update_periods),
        "Median Update Rate": 1 / np.median(update_periods)},{"API_heat":{"totalTime":totaltime,"plotTime":timetaken,"loadTime":loadtimes,"normTime":normtime,"transformTime":transformdata,
                                                                        #   "sliceTime":slicetime,
                                                                          "processTime":processing_times,"transferSize":transfer_sizes,"updatePeriod":update_periods,"requestTimes":request_times,"converTimes":post_convert_times,
        }}

# slice on Z (energies axis 2), meanwhile original plot slices in 0th axis (polar energy)
# taking 2nd plot (regular heatmap by polar energy) -> taking a slice by angle (Y, 1st, 750)
# integrate then create 1d plot
def plot_nxs_integration(path, dataset, repeats, delay, sli):    
    totaltime = []
    lenlist = []
    timetaken = []
    loadtimes = []
    transformdata = []
    slicetime = []
    normtime=[]
    update_periods = []
    processing_times = []
    open_file=[]
    for update in range(repeats):
        update_start = time.perf_counter()
        totalstart = time.perf_counter()
        loadstart = time.perf_counter()
        start=time.perf_counter()
        with h5py.File(path, "r") as f:
            data=f[dataset]
            op=time.perf_counter()-start
            open_file.append(op)
            n_frames = data.shape[1]
            frame = update % n_frames
            frame_data = data[::sli, ::sli,300+10*frame] # add extra times here
            loadtime = time.perf_counter() - (loadstart+op)
            loadtimes.append(loadtime)
            # LAG HERE
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
    "Median Open Time":np.median(open_file),
    "Median Total Time": np.median(totaltime),
    "Median Plot Time Taken": np.median(timetaken),
    "Mean Plot Time Taken": np.mean(timetaken),
    "Min Plot Time Taken": np.min(timetaken),
    "Max Plot Time Taken": np.max(timetaken),
    "Median Load Time Taken": np.median(loadtimes),
    "Mean Load Time Taken": np.mean(loadtimes),
    # "Median Slice Time Taken": np.median(slicetime),
    "Median Processing Time": np.median(processing_times),
    "Median Normalisation Time Taken": np.median(normtime),
    "Median Update Period": np.median(update_periods),
    "Median Update Rate": 1 / np.median(update_periods),
    "Median Transform Time Taken": np.median(transformdata),
    "Median Byte to Array Time Taken":0,
    "Median Request Time Taken":0,

}, {
    "NXS_int": {
        "openTime":open_file,
        "totalTime": totaltime,
        "plotTime": timetaken,
        "loadTime": loadtimes,
        # "sliceTime": slicetime,
        "processTime": processing_times,
        "updatePeriod": update_periods,
    }
}


def plot_api_integration(repeats, delay,sli):
    totaltime=[]
    lenlist = []
    timetaken = []
    loadtimes = []
    transformdata = []
    normtime = []
    update_periods = []
    processing_times = []
    transfer_sizes=[]
    request_times=[]
    post_convert_times=[]
    # concattimes=[]
    for update in range(repeats):
        update_start=time.perf_counter()    
        totalstart= time.perf_counter()
        loadstart = time.perf_counter()
        # chunks=[]
        
        # for start_frame in range(0, 146, 30):

        #     end_frame = min(
        #     start_frame + 30,
        #     146
        # )
        #     start = time.perf_counter()
        #     chunk,byte = get_detector_chunk(start_frame,end_frame,sli)
        #     transfer_sizes.append(byte)
        #     smallloadtime = time.perf_counter() - start
        #     smallloadtimes.append(smallloadtime)
        #     chunks.append(chunk)

        n_frames = 750
        frame = update % n_frames
        data,byte,request_time,post_convert_time=get_detector_int(300+10*frame,sli)
        loadtime = time.perf_counter() - (loadstart+request_time+post_convert_time)
        loadtimes.append(loadtime)
        transfer_sizes.append(byte)
        post_convert_times.append(post_convert_time)
        request_times.append(request_time)
        # start = time.perf_counter()
        # data = np.concatenate(
        #                 chunks,
        #                 axis=0
        #             )
        # concattime=time.perf_counter()-start
        # concattimes.append(concattime)
        # LAG HERE
        start = time.perf_counter()
        s = MinMaxScaler()
        frame_data = s.fit_transform(data)
        normtime.append(
            time.perf_counter() - start
        )
        start = time.perf_counter()
        frame_data=rotate(frame_data,angle=90,reshape=True)
        transformdata.append(
            time.perf_counter() - start
        )
        start=time.perf_counter()
        response = image(
            values=frame_data,
            heatmap_scale="linear",
            colour_map="Inferno",
            plot_config={
                "x_label": "x-axis",
                "y_label": "y-axis",
                "title": "API heatmap - stack",
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


        "Median Byte to Array Time Taken":np.median(post_convert_times),
        "Median Request Time Taken":np.median(request_times),

        "Median Normalisation Time Taken": np.median(normtime),
        "Median Transform Time Taken": np.median(transformdata),
        "Median Processing Time": np.median(processing_times),
        "Median Update Period": np.median(update_periods),
        "Median Update Rate": 1 / np.median(update_periods)},{"API_int":{"totalTime":totaltime,"plotTime":timetaken,"loadTime":loadtimes,"normTime":normtime,"transformTime":transformdata,"processTime":processing_times,"transferSize":transfer_sizes,"updatePeriod":update_periods,"requestTimes":request_times,"converTimes":post_convert_times,
        }}