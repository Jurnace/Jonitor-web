import React from "react";
import Chart from "chart.js";

export default class CpuLine extends React.Component {
    constructor(props) {
        super(props);

        this.ref = React.createRef();

        this.update = this.update.bind(this);

        let min = 0;
        let max = 100;

        const colors = ["#2E93fA", "#66DA26", "#546E7A", "#E91E63", "#FF9800", "#FFD800", "#A1CAF1", "#C2B280", "#E68FAC", "#F99379", "#604E97", "#B3446C", "#DCD300", "#882D17", "#E25822", "#8DB600"];

        const sets = [];

        let double = false;
        let label;

        if(props.type === 0) {
            double = props.threadCount > 1;
        } else if(props.type === 1) {
            double = props.threadCount > 1;
            this.maxClock = Math.ceil(props.maxClock);
            max = this.maxClock;
        } else if(props.type === 2) {
            if(props.unit === "F") {
                min = 32;
                max = 212;
            }
        } else if(props.type === 3) {
            label = "Usage";
        } else if(props.type === 4) {
            label = "Temperature";
            if(props.unit === "F") {
                min = 32;
                max = 212;
            }
        } else if(props.type === 5) {
            this.maxVoltage = Math.ceil(props.maxVoltage * 10) / 10;
            max = this.maxVoltage;
        }

        if(props.type === 0 || props.type === 1 || props.type === 2 || props.type === 5) {
            for(let i = 0; i < props.data.length; i++) {
                if(!double) {
                    sets.push({
                        fill: false,
                        backgroundColor: colors[this.getColor(i)],
                        borderColor: colors[this.getColor(i)],
                        label: "Core " + i,
                        data: []
                    });
                } else {
                    sets.push({
                        fill: false,
                        backgroundColor: colors[this.getColor(i * 2)],
                        borderColor: colors[this.getColor(i * 2)],
                        label: "Core " + i + " Thread 0",
                        data: []
                    }, {
                        fill: false,
                        backgroundColor: colors[this.getColor(i * 2 + 1)],
                        borderColor: colors[this.getColor(i * 2 + 1)],
                        label: "Core " + i + " Thread 1",
                        data: []
                    });
                }
            }
        } else {
            sets.push({
                fill: false,
                backgroundColor: colors[0],
                borderColor: colors[0],
                label,
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
                        maxTicksLimit: 5,
                        source: "labels",
                        maxRotation: 0,
						sampleSize: 1
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
                            if(props.type === 1 || props.type === 5) {
                                return value.toFixed(1);
                            }
                            return value;
                        }
                    }
                }
            },
            tooltips: {
                mode: "index",
                intersect: false
            },
            hover: {
                axis: "x",
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

    getColor(i) {
        if(i < 16) {
            return i;
        }

        return i - 16 * Math.ceil(i / 16);
    }

    update(props) {
        const pollTime = props.pollTime * 1000;
        let arr;
        if(props.type === 0) {
            for(let i = 0; i < props.data.length; i++) {
                if(props.threadCount === 1) {
                    arr = this.data.datasets[i].data;
                    if(arr.length > this.maxData) {
                        arr.shift();
                    }

                    arr.push({
                        x: pollTime,
                        y: props.data[i].threads[0].usage
                    });
                } else {
                    arr = this.data.datasets[i * 2].data;
                    if(arr.length > this.maxData) {
                        arr.shift();
                    }

                    arr.push({
                        x: pollTime,
                        y: props.data[i].threads[0].usage
                    });

                    arr = this.data.datasets[i * 2 + 1].data;
                    if(arr.length > this.maxData) {
                        arr.shift();
                    }

                    arr.push({
                        x: pollTime,
                        y: props.data[i].threads[1].usage
                    });
                }
            }
        } else if(props.type === 1) {
            for(let i = 0; i < props.data.length; i++) {
                if(props.threadCount === 1) {
                    arr = this.data.datasets[i].data;
                    if(arr.length > this.maxData) {
                        arr.shift();
                    }

                    arr.push({
                        x: pollTime,
                        y: props.data[i].threads[0].clock[0]
                    });
                } else {
                    arr = this.data.datasets[i * 2].data;
                    if(arr.length > this.maxData) {
                        arr.shift();
                    }

                    arr.push({
                        x: pollTime,
                        y: props.data[i].threads[0].clock[0]
                    });

                    arr = this.data.datasets[i * 2 + 1].data;
                    if(arr.length > this.maxData) {
                        arr.shift();
                    }

                    arr.push({
                        x: pollTime,
                        y: props.data[i].threads[1].clock[0]
                    });
                }
            }

            if(this.maxClock < props.maxClock) {
                this.maxClock = Math.ceil(props.maxClock);
                this.chart.options.scales.y.max = this.maxClock;
                this.chart.options.scales.y.ticks.stepSize = this.maxClock / 10;
            }
        } else if(props.type === 2) {
            for(let i = 0; i < props.data.length; i++) {
                arr = this.data.datasets[i].data;
                if(arr.length > this.maxData) {
                    arr.shift();
                }

                arr.push({
                    x: pollTime,
                    y: props.data[i].temperature[0]
                });
            }
        } else if(props.type === 3 || props.type === 4) {
            arr = this.data.datasets[0].data;
            if(arr.length > this.maxData) {
                arr.shift();
            }

            arr.push({
                x: pollTime,
                y: props.data
            });
        } else if(props.type === 5) {
            for(let i = 0; i < props.data.length; i++) {
                arr = this.data.datasets[i].data;
                if(arr.length > this.maxData) {
                    arr.shift();
                }

                arr.push({
                    x: pollTime,
                    y: props.data[i].voltage
                });
            }

            if(this.maxVoltage < props.maxVoltage) {
                this.maxVoltage = Math.ceil(props.maxVoltage * 10) / 10;
                this.chart.options.scales.y.max = this.maxVoltage;
                this.chart.options.scales.y.ticks.stepSize = this.maxVoltage / 10;
            }
        }
    }

    render() {
        return (
            <div className="d-cpugraph">
                <canvas ref={this.ref} />
            </div>
        );
    }
}