import React from "react";
import Chart from "chart.js";

export default class GpuGraph extends React.Component {
    constructor(props) {
        super(props);

        this.ref = React.createRef();

        this.update = this.update.bind(this);

        let min = 0;
        let max = 100;

        const sets = [];

        if(props.type === 0) {
            this.maxClock = Math.max(props.data.coreClock[1], props.data.memoryClock[1]);
            if(this.maxClock === 0) {
                this.maxClock = 50;
            }

            max = this.maxClock;
            sets.push({
                fill: false,
                backgroundColor: "#2E93fA",
                borderColor: "#2E93fA",
                label: "GPU Clock",
                data: []
            }, {
                fill: false,
                backgroundColor: "#66DA26",
                borderColor: "#66DA26",
                label: "Memory Clock",
                data: []
            });
        } else if(props.type === 1) {
            if(props.unit === "F") {
                min = 32;
                max = 212;
            }
            sets.push({
                fill: false,
                backgroundColor: "#2E93fA",
                borderColor: "#2E93fA",
                label: "Temperature",
                data: []
            });
        }

        this.data = {
            datasets: sets,
            labels: []
        };

        this.options = {
            scales: {
                x: {
                    type: "time",
                    ticks: {
                        maxTicksLimit: 5
                    },
                    time: {
                        tooltipFormat: "HH:mm:ss"
                    },
                    display: false
                },
                y: {
                    min,
                    max,
                    ticks: {
                        maxTicksLimit: 11,
                        stepSize: max / 10,
                        callback: function(value) {
                            if(props.type === 0) {
                                return value.toFixed(1);
                            }
                            return value;
                        }
                    },
                    beginAtZero: props.type === 0
                }
            },
            tooltips: {
                mode: "index",
                intersect: false
            },
            hover: {
                mode: "nearest",
                intersect: true
            },
            elements: {
                line: {
                    tension: 0,
                    borderWidth: 1.5
                },
                point: {
                    radius: 1
                }
            },
            parsing: false,
            spanGaps: true,
            legend: {
                position: "bottom",
                labels: {
                    usePointStyle: true
                },
                display: true
            },
            animation: {
                duration: props.animationDuration
            },
            events: ["mousemove", "mouseout", "touchstart"],
            maintainAspectRatio: false
        };

        this.update(props);

        this.pollTime = props.pollTime;
        this.maxData = props.maxData;
        this.animate = props.animate;
        this.animationSpeed = props.animationSpeed;
    }

    componentDidMount() {
        this.chart = new Chart(this.ref.current, {
            type: "line",
            data: this.data,
            options: this.options
        });
    }

    shouldComponentUpdate(props, state) {
        if(!props.enabled) {
            return false;
        }

        if(this.pollTime >= props.pollTime) {
            return false;
        }

        this.pollTime = props.pollTime;

        this.update(props);

        if(!props.paused && !props.hidden) {
            this.chart.update(props.animate ? undefined : "none");
        }

        return false;
    }

    update(props) {
        const pollTime = props.pollTime * 1000;
        let arr;

        if(props.type === 0) {
            arr = this.data.datasets[0].data;
            if(arr.length > this.maxData) {
                arr.shift();
            }

            arr.push({
                x: pollTime,
                y: props.data.coreClock[0]
            });

            arr = this.data.datasets[1].data;
            if(arr.length > this.maxData) {
                arr.shift();
            }

            arr.push({
                x: pollTime,
                y: props.data.memoryClock[0]
            });

            const max = Math.max(props.data.coreClock[1], props.data.memoryClock[1]);
            if(this.maxClock < max) {
                this.maxClock = max;
                this.chart.options.scales.y.max = this.maxClock;
                this.chart.options.scales.y.ticks.stepSize = this.maxClock / 10;
            }
        } else if(props.type === 1) {
            arr = this.data.datasets[0].data;
            if(arr.length > this.maxData) {
                arr.shift();
            }

            arr.push({
                x: pollTime,
                y: props.data.temperature[0]
            });
        }
    }

    render() {
        return (
            <div className="d-gpugraph">
                <canvas ref={this.ref} />
            </div>
        );
    }
}