import matplotlib.pyplot as plt
import numpy as np



STAGES = [
    ("Median Load Time Taken", "Load"),
    ("Median Normalisation Time Taken", "Normalisation"),
    ("Median Transform Time Taken", "Transform"),
    ("Median Slice Time Taken", "Slice"),
    ("Median Combine Time Taken", "Combine"),
    ("Median Plot Time Taken", "Plot"),
    ("Median Request Time Taken","Request"),
    ("Median Byte to Array Time Taken","Convert")
]

STAGE_COLOURS = {
    "Load": "#D40EBA",
    "Normalisation": "#F58518",
    "Transform": "#333333",
    "Slice": "#72B7B2",
    "Combine": "#F22222",
    "Plot": "#3155D4",
    "Request": "#F44444",
    "Convert": "#FF8888"
}

SOURCE_COLOURS = {
    "NXS": "#F58518",
    "API": "#3155D4",
}

heatmap_types = [
        "Heatmap",
        "Sum Heatmap",
    ]

plot_types = [
        "EDC",
        "MDC",
        "Heatmap",
    ]

def plot_time_breakdown(results, repeats, delay, slice):


    fig, axes = plt.subplots(
        1,
        3,
        figsize=(20, 7),
        sharey=False
    )

    for ax, plot_type in zip(axes[:2], plot_types[:2]):

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

            for key, label in STAGES:

                # EDC/MDC do not have Combine
                values = np.array([
                    source_results[size].get(key, 0) * 1000
                    for size in sizes
                ])

                if np.all(values == 0):
                    continue

                ax.bar(
                    x + source_offset,
                    values,
                    width=width,
                    bottom=bottom,
                    color=STAGE_COLOURS[label],
                    edgecolor="white",
                    linewidth=0.5,
                )

                bottom += values

        ax.set_xticks(x)

        ax.set_xticklabels(
            [f"{size:,}" for size in sizes],
            fontsize=9
        )
    ax = axes[2]


    sizes = sorted(
        set(
            r["size"]
            for r in results
            if r["type"] in heatmap_types
        )
    )

    x = np.arange(len(sizes))

    # Six bars:
    #
    # Original NXS
    # Original API
    # Sum NXS
    # Sum API
    # Mean NXS
    # Mean API
    #
    width = 0.12

    combinations = [
        ("Heatmap", "NXS", -2.5 * width),
        ("Heatmap", "API", -1.5 * width),
        ("Sum Heatmap", "NXS", -0.5 * width),
        ("Sum Heatmap", "API",  0.5 * width),
    ]

    for heatmap_type, source, offset in combinations:

        source_results = {
            r["size"]: r
            for r in results
            if (
                r["type"] == heatmap_type
                and r["source"] == source
            )
        }

        bottom = np.zeros(len(sizes))

        for key, label in STAGES:
            values = np.array([
                source_results[size].get(key, 0) * 1000
                for size in sizes
            ], dtype=float)

            values = np.nan_to_num(values, nan=0.0)
            if np.all(values == 0):
                continue

            ax.bar(
                x + offset,
                values,
                width=width,
                bottom=bottom,
                color=STAGE_COLOURS[label],
                edgecolor="white",
                linewidth=0.5,
            )

            bottom += values

    ax.set_xticks(x)

    ax.set_xticklabels(
        [
            f"{200 * size:,}"
            for size in sizes
        ],
        fontsize=9
    )

    for ax, plot_type in zip(axes, plot_types):

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

    legend_handles = [
        plt.Rectangle(
            (0, 0),
            1,
            1,
            facecolor=STAGE_COLOURS[label],
            edgecolor="white"
        )
        for _, label in STAGES
    ]

    legend_labels = [
        label
        for _, label in STAGES
    ]

    fig.legend(
        legend_handles,
        legend_labels,
        loc="upper center",
        bbox_to_anchor=(0.5, 0.94),
        ncol=len(STAGES),
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
        "Heatmap data sizes show maximum input size (# of datapoints)",
        ha="center",
        fontsize=9,
        color="#666666"
    )

    fig.tight_layout(
        rect=[0, 0.05, 1, 0.88]
    )

    plt.savefig(
        f"demos/benchmarking/outputs/"
        f"plot_rep_{repeats}_del_{delay}_sli_{slice}.png",
        dpi=300,
        bbox_inches="tight"
    )

    plt.close(fig)

def plot_processing_time(results, repeats, delay, slice):


    fig, axes = plt.subplots(
        1,
        3,
        figsize=(20, 6)
    )

    for ax, plot_type in zip(axes, plot_types):

        if plot_type in ["EDC", "MDC"]:

            subset = [
                r for r in results
                if r["type"] == plot_type
            ]

            sizes = sorted(
                set(r["size"] for r in subset)
            )

            x = np.arange(len(sizes))
            width = 0.36

            for offset, source in [
                (-width / 2, "NXS"),
                (width / 2, "API"),
            ]:

                source_results = {
                    r["size"]: r
                    for r in subset
                    if r["source"] == source
                }

                values = np.array([
                    source_results[size][
                        "Median Processing Time"
                    ] * 1000
                    for size in sizes
                ])

                ax.bar(
                    x + offset,
                    values,
                    width=width,
                    label=source,
                    color=SOURCE_COLOURS[source]
                )

        else:

            subset = [
                r for r in results
                if r["type"] in heatmap_types
            ]

            sizes = sorted(
                set(r["size"] for r in subset)
            )

            x = np.arange(len(sizes))

            width = 0.12

            combinations = [
                ("Heatmap", "NXS", -2.5 * width),
                ("Heatmap", "API", -1.5 * width),
                ("Sum Heatmap", "NXS", -0.5 * width),
                ("Sum Heatmap", "API",  0.5 * width),
            ]

            for heatmap_type, source, offset in combinations:

                source_results = {
                    r["size"]: r
                    for r in results
                    if (
                        r["type"] == heatmap_type
                        and r["source"] == source
                    )
                }

                values = np.array([
                    source_results[size][
                        "Median Processing Time"
                    ] * 1000
                    for size in sizes
                ])

                operation = {
                    "Heatmap": "Original",
                    "Sum Heatmap": "Sum",
                }[heatmap_type]

                ax.bar(
                    x + offset,
                    values,
                    width=width,
                    label=f"{operation} {source}",
                    color=SOURCE_COLOURS[source]
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
        ax.set_title(
            plot_type,
            fontweight="bold"
        )

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
        f"demos/benchmarking/outputs/"
        f"processing_time_rep_{repeats}_del_{delay}_sli_{slice}.png",
        dpi=300,
        bbox_inches="tight"
    )

    plt.close(fig)


def plot_update_rate(results, repeats, delay, slice):

    fig, axes = plt.subplots(
        1,
        3,
        figsize=(20, 6)
    )

    for ax, plot_type in zip(axes, plot_types):

        if plot_type in ["EDC", "MDC"]:

            subset = [
                r for r in results
                if r["type"] == plot_type
            ]

            sizes = sorted(
                set(r["size"] for r in subset)
            )

            x = np.arange(len(sizes))
            width = 0.36

            for offset, source in [
                (-width / 2, "NXS"),
                (width / 2, "API"),
            ]:

                source_results = {
                    r["size"]: r
                    for r in subset
                    if r["source"] == source
                }

                values = np.array([
                    source_results[size][
                        "Median Update Rate"
                    ]
                    for size in sizes
                ])

                ax.bar(
                    x + offset,
                    values,
                    width=width,
                    label=source,
                    color=SOURCE_COLOURS[source]
                )

        else:


            subset = [
                r for r in results
                if r["type"] in heatmap_types
            ]

            sizes = sorted(
                set(r["size"] for r in subset)
            )

            x = np.arange(len(sizes))
            width = 0.12

            combinations = [
                ("Heatmap", "NXS", -2.5 * width),
                ("Heatmap", "API", -1.5 * width),
                ("Sum Heatmap", "NXS", -0.5 * width),
                ("Sum Heatmap", "API",  0.5 * width),
            ]

            for heatmap_type, source, offset in combinations:

                source_results = {
                    r["size"]: r
                    for r in results
                    if (
                        r["type"] == heatmap_type
                        and r["source"] == source
                    )
                }

                values = np.array([
                    source_results[size][
                        "Median Update Rate"
                    ]
                    for size in sizes
                ])

                operation = {
                    "Heatmap": "Original",
                    "Sum Heatmap": "Sum",
                }[heatmap_type]

                ax.bar(
                    x + offset,
                    values,
                    width=width,
                    label=f"{operation} {source}",
                    color=SOURCE_COLOURS[source]
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
        ax.set_title(
            plot_type,
            fontweight="bold"
        )

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
        f"demos/benchmarking/outputs/"
        f"update_rate_rep_{repeats}_del_{delay}_sli_{slice}.png",
        dpi=300,
        bbox_inches="tight"
    )

    plt.close(fig)