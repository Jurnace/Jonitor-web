import React from "react";
import Chart from "chart.js";

export default class GpuCoreInfo extends React.Component {
    constructor(props) {
        super(props);

        this.refClock = React.createRef();
        this.refLoad = React.createRef();
        this.refUsage = React.createRef();
        this.refTemperature = React.createRef();

        this.dataClock = {
            datasets: [{
                backgroundColor: "#2E93fA",
                data: [props.data.coreClock[0]]
            }]
        };

        this.optionsClock = {
            scales: {
                x: {
                    display: false,
                    min: 0,
                    max: props.data.coreClock[1]
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
                data: [props.data.coreLoad]
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
                data: [props.data.coreUsage]
            }]
        };

        this.optionsUsage = {
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

        this.dataTemperature = {
            datasets: [{
                backgroundColor: "#2E93fA",
                data: [props.data.temperature[0]]
            }]
        };

        this.optionsTemperature = {
            scales: {
                x: {
                    display: false,
                    min: props.unit === "C" ? 0 : 32,
                    max: props.unit === "C" ? 100 : 212
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
        this.maxClock = props.data.coreClock[1];
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

        this.chartTemperature = new Chart(this.refTemperature.current, {
            type: "horizontalBar",
            data: this.dataTemperature,
            options: this.optionsTemperature
        });
    }

    shouldComponentUpdate(props, state) {
        if(this.pollTime >= props.pollTime) {
            return false;
        }

        this.pollTime = props.pollTime;

        this.dataClock.datasets[0].data[0] = props.data.coreClock[0];
        if(this.maxClock < props.data.coreClock[1]) {
            this.maxClock = props.data.coreClock[1];
            this.chartClock.options.scales.x.max = this.maxClock;
        }
        this.chartClock.update(props.animate ? undefined : "none");

        this.dataLoad.datasets[0].data[0] = props.data.coreLoad;
        this.chartLoad.update(props.animate ? undefined : "none");

        this.dataUsage.datasets[0].data[0] = props.data.coreUsage;
        this.chartUsage.update(props.animate ? undefined : "none");

        this.dataTemperature.datasets[0].data[0] = props.data.temperature[0];
        this.chartTemperature.update(props.animate ? undefined : "none");

        return true;
    }

    render() {
        return (
            <>
                <p className="bar-label">Clock Speed<span>{this.props.data.coreClock[0] + " MHz [" + this.props.data.coreClock[1] + " MHz]"}</span></p>
                <div className="d-gpuinfo">
                    <canvas ref={this.refClock} />
                </div>
                <p className="bar-label">Load<span>{this.props.data.coreLoad + "%"}</span></p>
                <div className="d-gpuinfo">
                    <canvas ref={this.refLoad} />
                </div>
                <p className="bar-label">D3D Usage<span>{this.props.data.coreUsage + "%"}</span></p>
                <div className="d-gpuinfo">
                    <canvas ref={this.refUsage} />
                </div>
                <p className="bar-label">Temperature<span>{this.props.data.temperature[0] + "°" + this.props.unit + " [" + this.props.data.temperature[1] + "°" + this.props.unit + "]"}</span></p>
                <div className="d-cpuinfo">
                    <canvas ref={this.refTemperature} />
                </div>
            </>
        );
    }
}