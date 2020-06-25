import React from "react";
import Chart from "chart.js";

export default class GpuMemoryInfo extends React.Component {
    constructor(props) {
        super(props);

        this.refClock = React.createRef();
        this.refLoad = React.createRef();
        this.refUsage = React.createRef();
        this.refFan = React.createRef();

        this.dataClock = {
            datasets: [{
                backgroundColor: "#2E93fA",
                data: [props.data.memoryClock[0]]
            }]
        };

        this.optionsClock = {
            scales: {
                x: {
                    display: false,
                    min: 0,
                    max: props.data.memoryClock[1]
                },
                y: {
                    display: false
                }
            },
            legend: {
                display: false
            },
            animation: {
                duration: props.animationDuration
            },
            events: [""],
            maintainAspectRatio: false
        };

        this.dataLoad = {
            datasets: [{
                backgroundColor: "#2E93fA",
                data: [props.data.memoryLoad]
            }]
        };

        this.optionsLoad = {
            scales: {
                x: {
                    display: false,
                    min: 0,
                    max: 100
                },
                y: {
                    display: false
                }
            },
            legend: {
                display: false
            },
            animation: {
                duration: props.animationDuration
            },
            events: [""],
            maintainAspectRatio: false
        };

        this.dataUsage = {
            datasets: [{
                backgroundColor: "#2E93fA",
                data: [props.data.memoryUsage]
            }]
        };

        this.optionsUsage = {
            scales: {
                x: {
                    display: false,
                    min: 0,
                    max: props.data.memoryUnit !== "%" ? props.data.memoryUsage : 100
                },
                y: {
                    display: false
                }
            },
            legend: {
                display: false
            },
            animation: {
                duration: props.animationDuration
            },
            events: [""],
            maintainAspectRatio: false
        };

        this.dataFan = {
            datasets: [{
                backgroundColor: "#2E93fA",
                data: [props.data.fan[0]]
            }]
        };

        this.optionsFan = {
            scales: {
                x: {
                    display: false,
                    min: 0,
                    max: props.data.fan[1]
                },
                y: {
                    display: false
                }
            },
            legend: {
                display: false
            },
            animation: {
                duration: props.animationDuration
            },
            events: [""],
            maintainAspectRatio: false
        };

        this.pollTime = props.pollTime;
        this.maxClock = props.data.memoryClock[1];
        this.maxMemory = props.data.memoryUsage;
        this.maxFan = props.data.fan[1];
    }

    componentDidMount() {
        this.chartClock = new Chart(this.refClock.current, {
            type: "horizontalBar",
            data: this.dataClock,
            options: this.optionsClock
        });

        this.chartLoad = new Chart(this.refLoad.current, {
            type: "horizontalBar",
            data: this.dataLoad,
            options: this.optionsLoad
        });

        this.chartUsage = new Chart(this.refUsage.current, {
            type: "horizontalBar",
            data: this.dataUsage,
            options: this.optionsUsage
        });

        this.chartFan = new Chart(this.refFan.current, {
            type: "horizontalBar",
            data: this.dataFan,
            options: this.optionsFan
        });
    }

    shouldComponentUpdate(props, state) {
        if(this.pollTime >= props.pollTime) {
            return false;
        }

        this.pollTime = props.pollTime;

        this.dataClock.datasets[0].data[0] = props.data.memoryClock[0];
        if(this.maxClock < props.data.coreClock[1]) {
            this.maxClock = props.data.coreClock[1];
            this.chartClock.options.scales.x.max = this.maxClock;
        }
        this.chartClock.update(props.animate ? undefined : "none");

        this.dataLoad.datasets[0].data[0] = props.data.memoryLoad;
        this.chartLoad.update(props.animate ? undefined : "none");

        this.dataUsage.datasets[0].data[0] = props.data.memoryUsage;
        if(this.maxMemory < props.data.memoryUsage) {
            this.maxMemory = props.data.memoryUsage;
            if(props.data.memoryUnit !== "%") {
                this.chartUsage.options.scales.x.max = this.maxMemory;
            } else {
                this.maxMemory = 100;
                this.chartUsage.options.scales.x.max = 100;
            }
        }
        this.chartUsage.update(props.animate ? undefined : "none");

        this.dataFan.datasets[0].data[0] = props.data.fan[0];
        if(this.maxFan < props.data.fan[1]) {
            this.maxFan = props.data.fan[1];
            this.chartFan.options.scales.x.max = this.maxFan;
        }
        this.chartFan.update(props.animate ? undefined : "none");

        return true;
    }

    render() {
        return (
            <>
                <p className="bar-label">Memory Clock<span>{this.props.data.memoryClock[0] + " MHz [" + this.props.data.memoryClock[1] + " MHz]"}</span></p>
                <div className="d-gpuinfo">
                    <canvas ref={this.refClock} />
                </div>
                <p className="bar-label">Memory Load<span>{this.props.data.memoryLoad + "%"}</span></p>
                <div className="d-gpuinfo">
                    <canvas ref={this.refLoad} />
                </div>
                <p className="bar-label">Memory Usage<span>{this.props.data.memoryUsage.toFixed(1) + (this.props.data.memoryUnit === "%" ? "" : " ") + this.props.data.memoryUnit}</span></p>
                <div className="d-gpuinfo">
                    <canvas ref={this.refUsage} />
                </div>
                <p className="bar-label">Fan Speed<span>{this.props.data.fan[0] + " RPM [" + this.props.data.fan[1] + " RPM]"}</span></p>
                <div className="d-cpuinfo">
                    <canvas ref={this.refFan} />
                </div>
            </>
        );
    }
}