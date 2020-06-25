import React from "react";
import Chart from "chart.js";

export default class CpuInfo extends React.Component {
    constructor(props) {
        super(props);

        this.refUsage = React.createRef();
        this.refTemperature = React.createRef();
        this.refPower = React.createRef();

        this.dataUsage = {
            datasets: [{
                backgroundColor: "#2E93fA",
                data: [props.data.usage]
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

        this.dataPower = {
            datasets: [{
                backgroundColor: "#2E93fA",
                data: [props.data.power[0]]
            }]
        };

        this.optionsPower = {
            scales: {
                x: {
                    display: false,
                    min: 0,
                    max: props.data.power[1]
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
        this.maxPower = props.data.power[1];
        this.animationDuration = props.animationDuration;
    }

    componentDidMount() {
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

        this.chartPower= new Chart(this.refPower.current, {
            type: "horizontalBar",
            data: this.dataPower,
            options: this.optionsPower
        });
    }

    shouldComponentUpdate(props, state) {
        if(this.pollTime >= props.pollTime) {
            return false;
        }

        this.pollTime = props.pollTime;

        this.dataUsage.datasets[0].data[0] = props.data.usage;
        this.chartUsage.update(props.animate ? undefined : "none");

        this.dataTemperature.datasets[0].data[0] = props.data.temperature[0];
        this.chartTemperature.update(props.animate ? undefined : "none");

        this.dataPower.datasets[0].data[0] = props.data.power[0];
        if(this.maxPower < props.data.power[1]) {
            this.maxPower = props.data.power[1];
            this.optionsPower.scales.x.max = this.maxPower;
        }

        this.chartPower.update(props.animate ? undefined : "none");

        return true;
    }

    render() {
        return (
            <>
                <p className="bar-label">Total Usage<span>{this.props.data.usage + "%"}</span></p>
                <div className="d-cpuinfo">
                    <canvas ref={this.refUsage} />
                </div>
                <p className="bar-label">Temperature<span>{this.props.data.temperature[0] + "°" + this.props.unit + " [" + this.props.data.temperature[1] + "°" + this.props.unit + "]"}</span></p>
                <div className="d-cpuinfo">
                    <canvas ref={this.refTemperature} />
                </div>
                <p className="bar-label">Power<span>{this.props.data.power[0] + " W [" + this.props.data.power[1] + " W]"}</span></p>
                <div className="d-cpuinfo">
                    <canvas ref={this.refPower} />
                </div>
            </>
        );
    }
}