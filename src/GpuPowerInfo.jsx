import React from "react";
import Chart from "chart.js";

export default class GpuPowerInfo extends React.Component {
    constructor(props) {
        super(props);

        this.refPower = React.createRef();
        this.refVoltage = React.createRef();

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

        this.dataVoltage = {
            datasets: [{
                backgroundColor: "#2E93fA",
                data: [props.data.voltage[0]]
            }]
        };

        this.optionsVoltage = {
            scales: {
                x: {
                    display: false,
                    min: 0,
                    max: props.data.voltage[1]
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
        this.maxVoltage = props.data.voltage[1];
    }

    componentDidMount() {
        this.chartPower = new Chart(this.refPower.current, {
            type: "horizontalBar",
            data: this.dataPower,
            options: this.optionsPower
        });

        this.chartVoltage = new Chart(this.refVoltage.current, {
            type: "horizontalBar",
            data: this.dataVoltage,
            options: this.optionsVoltage
        });
    }

    shouldComponentUpdate(props, state) {
        if(this.pollTime >= props.pollTime) {
            return false;
        }

        this.pollTime = props.pollTime;

        this.dataPower.datasets[0].data[0] = props.data.power[0];
        if(this.maxPower < props.data.power[1]) {
            this.maxPower = props.data.power[1];
            this.chartPower.options.scales.x.max = this.maxPower;
        }
        this.chartPower.update(props.animate ? undefined : "none");

        this.dataVoltage.datasets[0].data[0] = props.data.voltage[0];
        if(this.maxVoltage < props.data.voltage[1]) {
            this.maxVoltage = props.data.voltage[1];
            this.chartVoltage.options.scales.x.max = this.maxVoltage;
        }
        this.chartVoltage.update(props.animate ? undefined : "none");

        return true;
    }

    render() {
        return (
            <>
                <p className="bar-label">Power<span>{this.props.data.power[0] + " W [" + this.props.data.power[1] + " W]"}</span></p>
                <div className="d-gpuinfo">
                    <canvas ref={this.refPower} />
                </div>
                <p className="bar-label">Voltage<span>{this.props.data.voltage[0] + " V [" + this.props.data.voltage[1] + " V]"}</span></p>
                <div className="d-gpuinfo">
                    <canvas ref={this.refVoltage} />
                </div>
                <p className="bar-label d-gpulimit">Power Limited<span>{this.convert(this.props.data.powerLimit)}</span></p>
                <p className="bar-label">Thermal Limited<span>{this.convert(this.props.data.thermalLimit)}</span></p>
            </>
        );
    }

    convert(value) {
        return (value[0] === 1 ? "Yes" : "No") + " [" + (value[1] === 1 ? "Yes" : "No") + "]";
    }
}