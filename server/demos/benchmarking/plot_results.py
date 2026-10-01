import matplotlib.pyplot as plt
import numpy as np

def plot_time_breakdown(results,repeats,delay,slice):
    stages = [
        ("Median Load Time Taken", "Load"),
        ("Median Normalisation Time Taken", "Normalisation"),
        ("Median Transform Time Taken", "Transform"),
        ("Median Slice Time Taken", "Slice"),
        ("Median Plot Time Taken", "Plot"),
    ]
    colours = {
        "Load": "#D40EBA",
        "Normalisation": "#F58518",
        "Transform": "#333333",
        "Slice": "#72B7B2",
        "Plot": "#3155D4",
    }
    fig, axes = plt.subplots(
        1,
        3,
        figsize=(18, 7),
        sharey=False
    )
    plot_types = ["1D", "2D", "Heatmap"]
    for ax, plot_type in zip(axes, plot_types):

        subset = [
            r for r in results
            if r["type"] == plot_type
        ]
        sizes = sorted(
            set(r["size"] for r in subset)
        )
        x = np.arange(len(sizes))
        width = 0.36
        for source_offset, source in [
            (-width / 2, "NXS"),
            (width / 2, "API"),
        ]:
            source_results = {
                r["size"]: r
                for r in subset
                if r["source"] == source
            }
            bottom = np.zeros(len(sizes))
            for key, label in stages:
                values = np.array([
                    source_results[size][key] * 1000
                    for size in sizes
                ])
                ax.bar(
                    x + source_offset,
                    values,
                    width=width,
                    bottom=bottom,
                    color=colours[label],
                    edgecolor="white",
                    linewidth=0.5,
                    label=label if source == "API" else None,
                )
                bottom += values
        ax.set_xticks(x)
        ax.set_xticklabels(
            [
                f"{200 * size:,}"
                if plot_type == "Heatmap"
                else f"{size:,}"
                for size in sizes
            ],
            fontsize=9
        )
        ax.set_xlabel(
            "Data size",
            fontsize=10,
            labelpad=8
        )
        ax.set_ylabel(
            "Median time (ms)",
            fontsize=10
        )
        ax.set_title(
            plot_type,
            fontsize=14,
            fontweight="bold",
            pad=15
        )
        ax.set_axisbelow(True)
        ax.yaxis.grid(
            True,
            linestyle="--",
            linewidth=0.7,
            alpha=0.25,
            color="grey"
        )
        ax.xaxis.grid(False)
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)
        ax.spines["left"].set_alpha(0.3)
        ax.spines["bottom"].set_alpha(0.3)

    handles, labels = axes[0].get_legend_handles_labels()
    fig.legend(
        handles,
        labels,
        loc="upper center",
        bbox_to_anchor=(0.5, 0.94),
        ncol=len(stages),
        frameon=False,
        fontsize=10,
        title="Pipeline stage",
        title_fontsize=10
    )
    fig.suptitle(
        "Benchmark time breakdown",
        fontsize=18,
        fontweight="bold",
        y=0.995
    )
    fig.text(
        0.5,
        0.01,
        "Numbers above bars show total median time (ms)\n" \
        "Data sizes show maximum input size (# of datapoints)",
        ha="center",
        fontsize=9,
        color="#666666"
    )
    fig.tight_layout(
        rect=[0, 0.05, 1, 0.88]
    )
    plt.savefig(
        f"demos/benchmarking/outputs/plot_rep_{repeats}_del_{delay}_sli_{slice}.png",
        dpi=300,
        bbox_inches="tight"
    )
    #plt.show()

def plot_processing_time(results,repeats,delay,slice):

    plot_types = ["1D", "2D", "Heatmap"]

    fig, axes = plt.subplots(
        1,
        3,
        figsize=(18, 6)
    )

    for ax, plot_type in zip(axes, plot_types):

        subset = [
            r for r in results
            if r["type"] == plot_type
        ]

        sizes = sorted(
            set(r["size"] for r in subset)
        )

        x = np.arange(len(sizes))
        width = 0.36

        for offset, source, colour in [
            (-width / 2, "NXS", "#F58518"),
            (width / 2, "API", "#3155D4"),
        ]:

            source_results = {
                r["size"]: r
                for r in subset
                if r["source"] == source
            }

            values = np.array([
                source_results[size]["Median Processing Time"] * 1000
                for size in sizes
            ])

            ax.bar(
                x + offset,
                values,
                width=width,
                label=source,
                color=colour
            )

        ax.set_xticks(x)

        ax.set_xticklabels(
            [
                f"{200 * size:,}"
                if plot_type == "Heatmap"
                else f"{size:,}"
                for size in sizes
            ]
        )

        ax.set_xlabel("Data size")
        ax.set_ylabel("Median processing time (ms)")
        ax.set_title(plot_type)

        ax.grid(
            axis="y",
            linestyle="--",
            alpha=0.25
        )

        ax.set_axisbelow(True)

        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)

        ax.legend()

    fig.suptitle(
        "End-to-end processing latency",
        fontsize=18,
        fontweight="bold"
    )

    fig.tight_layout()

    plt.savefig(
        f"demos/benchmarking/outputs/processing_time_rep_{repeats}_del_{delay}_sli_{slice}.png",
        dpi=300,
        bbox_inches="tight"
    )

    #plt.show()
def plot_update_rate(results,repeats,delay,slice):

    plot_types = ["1D", "2D", "Heatmap"]

    fig, axes = plt.subplots(
        1,
        3,
        figsize=(18, 6)
    )

    for ax, plot_type in zip(axes, plot_types):

        subset = [
            r for r in results
            if r["type"] == plot_type
        ]

        sizes = sorted(
            set(r["size"] for r in subset)
        )

        x = np.arange(len(sizes))
        width = 0.36

        for offset, source, colour in [
            (-width / 2, "NXS", "#F58518"),
            (width / 2, "API", "#3155D4"),
        ]:

            source_results = {
                r["size"]: r
                for r in subset
                if r["source"] == source
            }

            values = np.array([
                source_results[size]["Median Update Rate"]
                for size in sizes
            ])

            ax.bar(
                x + offset,
                values,
                width=width,
                label=source,
                color=colour
            )

        ax.set_xticks(x)

        ax.set_xticklabels(
            [
                f"{200 * size:,}"
                if plot_type == "Heatmap"
                else f"{size:,}"
                for size in sizes
            ]
        )

        ax.set_xlabel("Data size")
        ax.set_ylabel("Update rate (Hz)")
        ax.set_title(plot_type)

        ax.grid(
            axis="y",
            linestyle="--",
            alpha=0.25
        )

        ax.set_axisbelow(True)

        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)

        ax.legend()

    fig.suptitle(
        "Achieved update rate",
        fontsize=18,
        fontweight="bold"
    )

    fig.tight_layout()

    plt.savefig(
        f"demos/benchmarking/outputs/update_rate_rep_{repeats}_del_{delay}_sli_{slice}.png",
        dpi=300,
        bbox_inches="tight"
    )

    #plt.show()