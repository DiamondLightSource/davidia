import json
import math

from demos.benchmarking.heatmap_plots import (
    plot_api_heatmap,
    plot_api_integration,
    plot_nxs_heatmap,
    plot_nxs_integration,
)
from demos.benchmarking.one_d_plots import (
    plot_api_one_dimension,
    plot_nxs_one_dimension,
)
from demos.benchmarking.plot_results import (
    plot_processing_time,
    plot_time_breakdown,
    plot_update_rate,
)

# base = "http://172.23.71.100:8000/api/v1"
# uid = "6894b49c-81cb-4dad-a86f-45d5a4069f81"
base = "http://localhost:8001/api/v1"
uid = "i05-1-62874"
def runall(repeats=30, delay=0.5, sli=1):
    results = []
    maxsize=int(math.ceil(992/sli))
    sizes = [maxsize]
    for size in sizes:
        result,raw_heat = plot_nxs_heatmap(
            "demos/i05-1-62874.nxs",
            "entry1/analyser/data",
            repeats, delay, sli)
        results.append({
            "type": "Heatmap",
            "source": "NXS",
            "size": size,
            **result})
    sizes = [maxsize]
    for size in sizes:
        result,raw_nxs_sum_heat = plot_nxs_integration(
            "demos/i05-1-62874.nxs",
            "entry1/analyser/data",repeats, delay, sli)
        results.append({
            "type": "Sum Heatmap",
            "source": "NXS",
            "size": size,
            **result})
    sizes = [1000, 2000, 4000, 8000, 16000]
    for size in sizes:
        result,raw_EDC_1d = plot_nxs_one_dimension(
            "demos/i05-1-62874.nxs",
            "/entry1/instrument/analyser/data",
            repeats, size,delay, sli,"EDC")
        results.append({
            "type": "EDC",
            "source": "NXS",
            "size": size,
            **result})
        sizes = [1000, 2000, 4000, 8000, 16000]
    for size in sizes:
        result,raw_MDC_1d = plot_nxs_one_dimension(
            "demos/i05-1-62874.nxs",
            "/entry1/instrument/analyser/data",
            repeats, size, delay, sli,"MDC")
        results.append({
            "type": "MDC",
            "source": "NXS",
            "size": size,
            **result})
    sizes = [maxsize]
    for size in sizes:
        result,raw_api_heat = plot_api_heatmap(
            repeats, delay, sli)
        results.append({
            "type": "Heatmap",
            "source": "API",
            "size": size,
            **result})
    
    sizes = [maxsize]
    for size in sizes:
        result,raw_api_sum_heat = plot_api_integration(
            repeats, delay, sli,)
        results.append({
            "type": "Sum Heatmap",
            "source": "API",
            "size": size,
            **result})
    sizes = [1000, 2000, 4000, 8000, 16000]
    for size in sizes:
        result,raw_api_1d_EDC = plot_api_one_dimension(
            repeats, size, delay, sli,"EDC")
        results.append({
            "type": "EDC",
            "source": "API",
            "size": size,
            **result})
    for size in sizes:
        result,raw_api_1d_MDC = plot_api_one_dimension(
            repeats, size, delay, sli,"MDC")
        results.append({
            "type": "MDC",
            "source": "API",
            "size": size,
            **result})
    rawdicts={"repeats":repeats,"delay":delay,"slice":sli,"raw":[raw_heat,raw_nxs_sum_heat,raw_EDC_1d,raw_MDC_1d,raw_api_heat,raw_api_sum_heat,raw_api_1d_MDC,raw_api_1d_EDC]}
    with open(f"/scratch/wxd83739/analysis/davidia/server/demos/benchmarking/outputs/benchmark_raw_{repeats}_{delay}_{sli}.txt","w") as f:
        json.dump(rawdicts, f, indent=2)
    return results,repeats,delay,sli
plot_nxs_heatmap(
            "demos/i05-1-62874.nxs",
            "entry1/analyser/data",
            30, 0, 1)

# create_benchmark_file("/scratch/wxd83739/analysis/davidia/server/demos/benchmark_data.h5")
# attempts=[
#     (30,0,1,),
#     (30,0.1,1),
#     (30,0.25,1),
#     (30,0.5,1,),
#     (30,1,1,),
#     (30,0.5,2,),
#     (30,0.5,4,),
#     (30,0.5,8,),
#     (30,0.5,16,),
#     ]

# for run in attempts:
#     x,re,de,sl=(runall(run[0],run[1],run[2]))

#     plot_update_rate(x,re,de,sl)
#     plot_processing_time(x,re,de,sl)
#     plot_time_breakdown(x,re,de,sl)

