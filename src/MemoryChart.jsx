import React from "react";
import Chart from "chart.js";

import { format, differenceInSeconds, differenceInMinutes, differenceInHours, differenceInDays, differenceInMonths, differenceInYears, startOfSecond } from "date-fns";

Chart._adapters._date.override({
	formats: function() {
		return {
            datetime: "MMM d, yyyy, h:mm:ss aaaa",
            millisecond: "h:mm:ss.SSS aaaa",
            second: "h:mm:ss aaaa",
            minute: "h:mm aaaa",
            hour: "ha",
            day: "MMM d",
            week: "PP",
            month: "MMM yyyy",
            quarter: "qqq - yyyy",
            year: "yyyy"
        };
	},

	parse: function(value, format) {
		return value;
	},

	format: function(time, fmt) {
		return format(time, fmt, this.options);
	},

	add: function(time, amount, unit) {
        switch(unit) {
            case "millisecond":
                return time + amount;
            case "second":
                return time + amount * 1000;
            default:
                console.log("missed add()", unit);
                return time;
        }
	},

	diff: function(max, min, unit) {
        switch(unit) {
            case "millisecond":
                return max - min;
            case "second":
                return differenceInSeconds(max, min);
            case "minute":
                return differenceInMinutes(max, min);
            case "hour":
                return differenceInHours(max, min);
            case "day":
                return differenceInDays(max, min);
            case "month":
                return differenceInMonths(max, min);
            case "year":
                return differenceInYears(max, min);
            default:
                console.log("missed diff()", unit);
                return 0;
        }
	},

	startOf: function(time, unit, weekday) {
        switch(unit) {
            case "millisecond":
                return time;
            case "second":
                return startOfSecond(time);
            default:
                console.log("missed startOf()", unit);
                return time;
        }
    }
});

export default class MemoryChart extends React.Component {
    constructor(props) {
        super(props);

        this.ref = React.createRef();

        this.data = {
            datasets: [{
                backgroundColor: ["#2E93fA", "#66DA26"],
                data: props.data
            }],
            labels: [props.data[0] + " MB Used", props.data[1] + " MB Available"]
        };

        this.options = {
            cutoutPercentage: 80,
            legend: {
                position: "bottom",
                labels: {
                    fontColor: "#1f1f1f",
                    usePointStyle: true
                }
            },
            animation: {
                duration: props.animationDuration
            },
            parsing: false,
            events: [""],
            maintainAspectRatio: false
        };

        this.totalRam = props.data[0] + props.data[1];
        this.pollTime = props.pollTime;
        this.animationDuration = props.animationDuration;
    }

    componentDidMount() {
        const used = "Used";
        const totalRam = this.totalRam / 100;

        this.chart = new Chart(this.ref.current, {
            type: "doughnut",
            data: this.data,
            options: this.options,
            plugins: [{
                cache: {
                    percentage: "",
                    textX1: 0,
                    textY1: 0,
                    textX2: 0,
                    textY2: 0
                },
                afterDatasetsUpdate: function(chart) {
                    const width = chart.width;
                    const height = chart.height;
                    const ctx = chart.ctx;
                    const centerY = height / 2 - chart.legend.height / 2;

                    ctx.save();
                    ctx.font = "1.5rem Inter";
                    ctx.fillStyle = "#000000";
                    ctx.textBaseline = "middle";

                    this.cache.percentage = (chart.data.datasets[0].data[0] / totalRam).toFixed(1) + "%";
                    this.cache.textX1 = (width - ctx.measureText(this.cache.percentage).width) / 2;

                    ctx.font = "0.8rem Inter";
                    ctx.fillStyle = "#666666";

                    this.cache.textX2 = (width - ctx.measureText(used).width) / 2;

                    this.cache.textY1 = centerY - 5;
                    this.cache.textY2 = centerY + 20;

                    ctx.restore();
                },
                afterDatasetsDraw: function(chart) {
                    const ctx = chart.ctx;

                    ctx.save();

                    ctx.font = "1.5rem Inter";
                    ctx.fillStyle = "#000000";
                    ctx.textBaseline = "middle";

                    ctx.fillText(this.cache.percentage, this.cache.textX1, this.cache.textY1);

                    ctx.font = "0.8rem Inter";
                    ctx.fillStyle = "#666666";

                    ctx.fillText(used, this.cache.textX2, this.cache.textY2);

                    ctx.restore();
                }
            }]
        });
    }

    shouldComponentUpdate(props, state) {
        if(this.pollTime >= props.pollTime) {
            return false;
        }

        this.pollTime = props.pollTime;

        this.data.datasets[0].data = props.data;
        this.data.labels[0] = props.data[0] + " MB Used";
        this.data.labels[1] = props.data[1] + " MB Available";

        this.chart.update(props.animate ? undefined : "none");

        return false;
    }

    render() {
        return (
            <div className="d-memory">
                <canvas ref={this.ref} />
            </div>
        );
    }
}