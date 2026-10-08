import math
import time

import h5py
import numpy as np
from sklearn.preprocessing import MinMaxScaler

from davidia.plot import (
    line,
)
from demos.benchmarking.utilities import (
    find_regions,
    get_detector_image,
    make_three_by_three_transform,
    transform_points,
)

# base = "http://172.23.71.100:8000/api/v1"
# uid = "6894b49c-81cb-4dad-a86f-45d5a4069f81"
base = "http://localhost:8001/api/v1"
uid = "i05-1-62874"


# def plot_nxs_one_dimension(path,dataset_path,repeats,size,delay,sli):
#     timetaken = []
#     loadtimes = []
#     transformdata=[]
#     normtime=[]
#     lenlist=[]
#     slicetime=[]
#     totaltime=[]
#     update_periods = []
#     processing_times = []
#     for update in range(repeats):
#         update_start = time.perf_counter()
#         totalstart=time.perf_counter()
#         start = time.perf_counter()
#         with h5py.File(path, "r") as f:
#             data = f[dataset_path][::sli]
#         loadtime = time.perf_counter() - start
#         loadtimes.append(loadtime)
#         data = data.ravel()

#         old_x = np.linspace(
#             0,
#             1,
#             len(data)
#         )

#         new_x = np.linspace(
#             0,
#             1,
#             size
#         )

#         data = np.interp(
#             new_x,
#             old_x,
#             data
#         )

#         x = np.arange(
#             size,
#             dtype=float
#         )

#         x=np.arange(data.size,dtype=float)
#         start = time.perf_counter()
#         s=MinMaxScaler()
#         reshdata = data.reshape(-1, 1)
#         normdata = s.fit_transform(reshdata).flatten()
#         normtime.append(time.perf_counter() - start)
#         start = time.perf_counter()
#         T=make_three_by_three_transform(theta=90,
#                                         tx=1)
#         x,normdata=transform_points(x,normdata,T)
#         transformdata.append(time.perf_counter()-start)
#         total_points=len(x)
#         points_per_update = total_points // repeats
#         end = min(
#                     (update + 1) * points_per_update,
#                     total_points
#                 )
#         current_x = x[:end]
#         current_y = normdata[:end]
#         start=time.perf_counter()
#         # current_x=current_x[::sli]
#         # current_y=current_y[::sli]
#         slicetime.append(time.perf_counter()-start)
#         start = time.perf_counter()

#         lenlist.append(line(
#             x=current_x,
#             y=current_y,
#             plot_config={
#                 "x_label": "x-axis",
#                 "y_label": "y-axis",
#                 "x_scale": "linear",
#                 "y_scale": "linear",
#                 "title": "file line",
#             },
#             plot_id="plot_1",
#             line_on=True,
#             point_size=8,
#             glyph_type="Circle",
#             colour="red",
#             width=1.5,
#         ).content)

#         timetaken.append(time.perf_counter() - start)
#         totaltime.append(time.perf_counter()-totalstart)
#         processing_time = time.perf_counter() - update_start
#         processing_times.append(processing_time)

#         time.sleep(delay)
#         update_period = time.perf_counter() - update_start
#         update_periods.append(update_period)
#     x=list(range(len(transformdata)))
#     return {"Median Total Time":np.median(totaltime),
#         "Median Plot Time Taken":np.median(timetaken),
#         "Mean Plot Time Taken":np.mean(timetaken),
#         "Min Plot Time Taken":np.min(timetaken),
#         "Max Plot Time Taken":np.max(timetaken),
#         "Median Load Time Taken":np.median(loadtimes),
#         "Mean Load Time Taken":np.mean(loadtimes),
#         "Median Normalisation Time Taken":np.median(normtime),
#         "Median Transform Time Taken":np.median(transformdata),
#         "Median Slice Time Taken":np.median(slicetime),
#         "Median Processing Time": np.median(processing_times),
#         "Median Update Period": np.median(update_periods),
#         "Median Update Rate": 1 / np.median(update_periods)},{"NXS_1d":{"totalTime":totaltime,"plotTime":timetaken,"loadTime":loadtimes,"normTime":normtime,"transformTime":transformdata,"sliceTime":slicetime,"processTime":processing_times,"updatePeriod":update_periods,}}


#make linked 1d plot
#Updating plot state with <class 'davidia.models.messages.SelectionsMessage'>
#plot_id='plot_0' update=True set_selections=[RectangularSelection(
# id='0cea266c', name='rectangle1', colour='#ddcc77', alpha=0.3, 
# fixed=False, start=(3.5374713830835858, 18.125383506638176), 
# angle=0.0, lengths=(6.179693068963282, 6.076698184480559))]


# Updated selections for plot_0: [RectangularSelection(id='8220f102', 
# name='rectangle0', colour='#ddcc77', alpha=0.3, fixed=False, 
# start=(92.21559761464016, 498.4783905039691), angle=0.0, 
# lengths=(503.8314265587587, 368.365578302631)), 
# AxialSelection(id='29fb4b3e', name='verticalAxis0', 
# colour='#882255', alpha=0.3, fixed=False, start=(0.0, 75.66084694904366), 
# length=54.070122972907825, dimension=1), AxialSelection(id='9a2924cd', 
# name='verticalAxis1', colour='#882255', alpha=0.3, fixed=False, 
# start=(0.0, 57.26420747601288), length=21.43608425553152, dimension=1), 
# AxialSelection(id='5a2ef6f1', name='verticalAxis2', colour='#882255',
# alpha=0.3, fixed=False, start=(0.0, 104.61555777181383), length=1.2797662242108316, 
# dimension=1), RectangularSelection(id='0cea266c', name='rectangle1', colour='#ddcc77', 
# alpha=0.3, fixed=False, start=(3.5374713830835858, 18.125383506638176), angle=0.0, 
# lengths=(6.179693068963282, 6.076698184480559))]
#on set selections trigger....
def plot_linked_nxs_one_dimension(path, dataset_path,sli,curve_type="EDC",):
    with h5py.File(path, "r") as f:
        data=f[dataset_path]
        frame = data[30, ::sli, ::sli]
        angles = f["/entry1/analyser/angles"][::sli]
        energies = f["/entry1/instrument/analyser/energies"][::sli]
        regionlayout=find_regions()
        for selection in (regionlayout):
            if 'verticalAxis0' in selection.values():
                print("verticalAxis0 found")
                axis0=regionlayout[0]
                energy_start=math.ceil(axis0['start'][1])
                energy_range=math.ceil(axis0['length'])
                energy_end=math.ceil(axis0['length']+energy_start)
            
            if 'horizontalAxis0' in selection.values():
                print("verticalAxis0 found")
                axis1=regionlayout[1]
                angle_start=math.ceil(axis1['start'][1])
                angle_range=math.ceil(axis1['length'])
                angle_end=math.ceil(axis1['length']+angle_start)
        start=time.perf_counter()
        if curve_type == "EDC":
            # Select angle range
            data_1d = frame[
                angle_start:angle_end,
                :
            ].sum(axis=0)

            x_axis = energies

            x_label = "Energy"
            y_label = "Intensity"

        elif curve_type == "MDC":
            # Select energy range

            data_1d = frame[
                :,
                energy_start:energy_end
            ].sum(axis=1)

            x_axis = angles
            x_label = "Angle"
            y_label = "Intensity"
        reshdata=data_1d.reshape(-1, 1)
        timetoplot=time.perf_counter()-start
        line(
                x=x_axis,
                y=reshdata,
                plot_config={
                    "x_label": x_label,
                    "y_label": y_label,
                    "x_scale": "linear",
                    "y_scale": "linear",
                    "title": f"{curve_type}",
                },
                plot_id="plot_1",
                line_on=True,
                point_size=8,
                glyph_type="Circle",
                colour="red",
                width=1.5,
            ).content
        print(f"We took {timetoplot*1000:.3f}ms to plot this.")

# plot_linked_nxs_one_dimension( "demos/i05-1-62874.nxs",
#             "entry1/analyser/data",1,"MDC")


def plot_nxs_one_dimension(path, dataset_path, repeats, size, delay, sli,curve_type="EDC",angle_range=None,energy_range=None):
    timetaken = []
    loadtimes = []
    transformdata = []
    normtime = []
    lenlist = []
    slicetime = []
    totaltime = []
    update_periods = []
    processing_times = []
    open_file=[]
    for update in range(repeats):
        update_start = time.perf_counter()
        totalstart = time.perf_counter()
        loadstart = time.perf_counter()
        start=time.perf_counter()
        with h5py.File(path, "r") as f:
            data=f[dataset_path]
            op=time.perf_counter()-start
            open_file.append(op)
            open_file.append(time.perf_counter()-start)
            frame = data[update % data.shape[0], ::sli, ::sli]
            angles = f["/entry1/analyser/angles"][::sli]
            energies = f["/entry1/instrument/analyser/energies"][::sli]
            if curve_type == "EDC":
                # Select angle range
                if angle_range is None:
                    angle_start = 0
                    angle_end = len(angles)
                else:
                    angle_start, angle_end = angle_range

                data_1d = frame[
                    angle_start:angle_end,
                    :
                ].sum(axis=0)

                x_axis = energies

                x_label = "Energy"
                y_label = "Intensity"

            elif curve_type == "MDC":
                # Select energy range
                if energy_range is None:
                    energy_start = 0
                    energy_end = len(energies)
                else:
                    energy_start, energy_end = energy_range

                data_1d = frame[
                    :,
                    energy_start:energy_end
                ].sum(axis=1)

                x_axis = angles
                x_label = "Angle"
                y_label = "Intensity"
            loadtime = time.perf_counter() - (loadstart+op)
            loadtimes.append(loadtime)
            start = time.perf_counter()
            slicetime.append(
                time.perf_counter() - start
            )
            start = time.perf_counter()
            old_x = np.linspace(
                0,
                1,
                len(data_1d)
            )
            new_x = np.linspace(
                0,
                1,
                size
            )
            data_1d = np.interp(
                new_x,
                old_x,
                data_1d
            )
            x_axis = np.interp(
                new_x,
                old_x,
                x_axis
            )
            start = time.perf_counter()

            s = MinMaxScaler()
            reshdata=data_1d.reshape(-1, 1)
                    
            normdata = s.fit_transform(
            reshdata).flatten()

            normtime.append(
                time.perf_counter() - start
            )

            start = time.perf_counter()

            T = make_three_by_three_transform(
                theta=0,
                tx=1
            )

            x_axis, normdata = transform_points(
                x_axis,
                normdata,
                T
            )

            transformdata.append(
                time.perf_counter() - start
            )

            start = time.perf_counter()
            lenlist.append(
                line(
                    x=x_axis,
                    y=normdata,
                    plot_config={
                        "x_label": x_label,
                        "y_label": y_label,
                        "x_scale": "linear",
                        "y_scale": "linear",
                        "title": f"{curve_type}",
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
            totaltime.append(
                time.perf_counter() - totalstart
            )

            processing_time = (
                time.perf_counter() - update_start
            )

            processing_times.append(processing_time)

            time.sleep(delay)

            update_period = (
                time.perf_counter() - update_start
            )

            update_periods.append(update_period)

    return {"Median Open File Time":np.median(open_file),
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
        "NXS_1d": {"openFile":open_file,
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

def plot_api_one_dimension(repeats, size,delay,sli,curve_type="EDC",angle_range=None,energy_range=None):
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
    request_times=[]
    post_convert_times=[]
    for update in range(repeats):
        update_start=time.perf_counter()
        totalstart=time.perf_counter()
        loadstart = time.perf_counter()
        frame = update % 146
        data,byte,request_time,post_convert_time = get_detector_image(
            frame,
            sli
        )
        transfer_sizes.append(byte)
        request_times.append(request_time)
        post_convert_times.append(post_convert_time)
        angles = np.linspace(
            0,
            1,
            750
        )[::sli]

        energies = np.linspace(
            57.5,
            61.5,
            992
        )[::sli]
        start = time.perf_counter()
        if curve_type == "EDC":

            if angle_range is None:
                angle_start = 0
                angle_end = len(angles)
            else:
                angle_start, angle_end = angle_range

            data_1d = data[
                angle_start:angle_end,
                :
            ].sum(axis=0)

            x_axis = energies

            x_label = "Energy"
            y_label = "Intensity"


        elif curve_type == "MDC":

            if energy_range is None:
                energy_start = 0
                energy_end = len(energies)
            else:
                energy_start, energy_end = energy_range

            data_1d = data[
                :,
                energy_start:energy_end
            ].sum(axis=1)

            x_axis = angles

            x_label = "Angle"
            y_label = "Intensity"
        loadtime = time.perf_counter() - loadstart
        loadtimes.append(loadtime)
        slicetime.append(time.perf_counter()-start)
        old_x = np.linspace(
            0,
            1,
            len(data_1d)
        )

        new_x = np.linspace(
            0,
            1,
            size
        )

        data_1d = np.interp(
            new_x,
            old_x,
            data_1d
        )

        x_axis = np.interp(
            new_x,
            old_x,
            x_axis
        )


        start = time.perf_counter()
        s = MinMaxScaler()
        reshdata = data_1d.reshape(-1, 1)
        normdata = (
            s.fit_transform(reshdata)
            .flatten()
        )
        normtime.append(
            time.perf_counter() - start
        )
        start = time.perf_counter()
        T = make_three_by_three_transform(
            theta=0,
            tx=1
        )
        x_axis, normdata = transform_points(
                                   x_axis,
                                   normdata,
                                   T
                               )
        transformdata.append(
            time.perf_counter() - start
        )
        start=time.perf_counter()
        lenlist.append(
            line(
                x=x_axis,
                y=normdata,
                plot_config={
                    "x_label": x_label,
                    "y_label": y_label,
                    "x_scale": "linear",
                    "y_scale": "linear",
                    "title": curve_type,
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
   
    return {"Median Request Time":np.median(request_times),
        "Median Byte to Array Time Taken":np.median(post_convert_times),
        "Median Total Time":np.median(totaltime),
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
        "transfer sizes": np.median(transfer_sizes)},{"api_1d":{"convertTime":post_convert_times,"requestTime":request_times,"totalTime":totaltime,"plotTime":timetaken,"loadTime":loadtimes,"normTime":normtime,"transformTime":transformdata,"sliceTime":slicetime,"processTime":processing_times,"updatePeriod":update_periods,"transferSize":transfer_sizes}
        }