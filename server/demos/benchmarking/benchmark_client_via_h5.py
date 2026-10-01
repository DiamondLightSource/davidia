import json
from demos.benchmarking.plot_results import plot_time_breakdown,plot_processing_time,plot_update_rate
from demos.benchmarking.one_d_plots import plot_api_one_dimension,plot_nxs_one_dimension
from demos.benchmarking.two_d_plots import plot_api_two_dimension,plot_nxs_two_dimension
from demos.benchmarking.heatmap_plots import plot_api_heatmap,plot_nxs_heatmap

# base = "http://172.23.71.100:8000/api/v1"
# uid = "6894b49c-81cb-4dad-a86f-45d5a4069f81"
base = "http://localhost:8001/api/v1"
uid = "i05-1-62874"
def runall(repeats=30, delay=0.5, sli=1):
    results = []
    sizes = [100, 200, 500, 750, 992]
    for size in sizes:
        result,raw_heat = plot_nxs_heatmap(
            "demos/i05-1-62874.nxs",
            "entry1/analyser/data",
            repeats, size, delay, sli)
        results.append({
            "type": "Heatmap",
            "source": "NXS",
            "size": size,
            **result})
    sizes = [1000, 2000, 4000, 8000, 16000]
    for size in sizes:
        result,raw_1d = plot_nxs_one_dimension(
            "demos/i05-1-62874.nxs",
            "/entry1/instrument/analyser/cps",
            repeats, size, delay, sli)
        results.append({
            "type": "1D",
            "source": "NXS",
            "size": size,
            **result})
    sizes = [200, 2000, 20000, 40000, 80000]
    for size in sizes:
        result,raw_2d = plot_nxs_two_dimension(
            "demos/i05-1-62874.nxs",
            "/entry1/instrument/analyser",
            repeats, size, delay, sli)
        results.append({
            "type": "2D",
            "source": "NXS",
            "size": size,
            **result})
    sizes = [100, 200, 500, 750, 992]
    for size in sizes:
        result,raw_api_heat = plot_api_heatmap(
            repeats, size, delay, sli)
        results.append({
            "type": "Heatmap",
            "source": "API",
            "size": size,
            **result})
    sizes = [200, 2000, 20000, 40000, 80000]
    for size in sizes:
        result,raw_api_2d = plot_api_two_dimension(
            repeats, size, delay, sli)
        results.append({
            "type": "2D",
            "source": "API",
            "size": size,
            **result})
    sizes = [1000, 2000, 4000, 8000, 16000]
    for size in sizes:
        result,raw_api_1d = plot_api_one_dimension(
            repeats, size, delay, sli)
        results.append({
            "type": "1D",
            "source": "API",
            "size": size,
            **result})
    rawdicts={"repeats":repeats,"delay":delay,"slice":sli,"raw":[raw_1d,raw_2d,raw_heat,raw_api_1d,raw_api_2d,raw_api_heat]}
    with open(f"/scratch/wxd83739/analysis/davidia/server/demos/benchmarking/outputs/benchmark_raw_{repeats}_{delay}_{sli}.txt","w") as f:
        json.dump(rawdicts, f, indent=2)
    return results,repeats,delay,sli


# create_benchmark_file("/scratch/wxd83739/analysis/davidia/server/demos/benchmark_data.h5")
attempts=[(30,1,1,),(30,0.5,1,),(30,0.25,1),(30,0.1,1),(30,0,1,),(30,0.5,2,),(30,0.5,4,),(30,0.5,8,),(30,0.5,16,),]

for run in attempts:
    x,re,de,sl=(runall(run[0],run[1],run[2]))

    plot_update_rate(x,re,de,sl)
    plot_processing_time(x,re,de,sl)
    plot_time_breakdown(x,re,de,sl)
# runall(200,0,1)