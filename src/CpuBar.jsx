import React from "react";
import Chart from "chart.js";

export default class CpuBar extends React.Component {
    constructor(props) {
        super(props);

        this.ref = React.createRef();

        this.update = this.update.bind(this);

        let min = 0;
        let max = 100;
        let label = "Thread 0";

        if(props.type === 0) {
            this.barCount = this.props.threadCount;
            this.unit = "%";
            this.startX1Offset = 140;
            this.startX2Offset = 65;

            if(this.barCount === 1) {
                label = "Usage";
            }
        } else if(props.type === 1) {
            this.barCount = this.props.threadCount;
            this.unit = " MHz";
            this.startX1Offset = 200;
            this.startX2Offset = 95;
            this.maxClock = Math.ceil(props.maxClock);
            max = this.maxClock;

            if(this.barCount === 1) {
                label = "Clock Speed";
            }
        } else if(props.type === 2) {
            this.barCount = 1;
            this.unit = "°" + props.unit;
            this.startX1Offset = 0;
            this.startX2Offset = 65;

            if(props.unit === "F") {
                min = 32;
                max = 212;
            }

            label = "Temperature";
        } else if(props.type === 3) {
            this.barCount = 1;
            this.unit = " V";
            this.startX1Offset = 0;
            this.startX2Offset = 70;
            this.maxVoltage = Math.ceil(props.maxVoltage * 10) / 10;
            max = this.maxVoltage;

            label = "Voltage";
        }

        const sets = [];

        sets.push({
            label,
            backgroundColor: "#2E93fA",
            barPercentage: 1,
            categoryPercentage: this.barCount === 1 ? 0.5 : 0.85,
            data: []
        });

        if(this.barCount > 1) {
            sets.push({
                label: "Thread 1",
                backgroundColor: "#66DA26",
                barPercentage: 1,
                categoryPercentage: this.barCount === 1 ? 0.5 : 0.85,
                data: []
            });
        }

        this.data = {
            datasets: sets,
            labels: props.data.map((value, index) => "Core " + index)
        };

        this.options = {
            scales: {
                x: {
                    gridLines: {
                        display: false
                    }
                },
                y: {
                    min,
                    max,
                    ticks: {
                        maxTicksLimit: 11,
                        stepSize: max / 10,
                        callback: function(value) {
                            if(props.type === 1 || props.type === 3) {
                                return value.toFixed(1);
                            }
                            return value;
                        }
                    }
                },
            },
            legend: {
                position: "bottom",
                labels: {
                    usePointStyle: true
                }
            },
            animation: {
                duration: props.animationDuration
            },
            events: ["mousemove", "mouseout", "touchstart"],
            maintainAspectRatio: false
        };

        this.update(props);

        this.pollTime = props.pollTime;
        this.animationDuration = props.animationDuration;
    }

    componentDidMount() {
        const barCount = this.barCount;
        const unit = this.unit;
        const startX1Offset = this.startX1Offset;
        const startX2Offset = this.startX2Offset;

        this.chart = new Chart(this.ref.current, {
            type: "bar",
            data: this.data,
            options: this.options,
            plugins: [{
                cache: {
                    length: this.props.data.length,
                    texts: Array.from({ length: this.props.data.length * (barCount + 1) }, () => ({ text: "", x: 0, y: 0 })),
                    cores: this.props.data.map((value, index) => "Core " + index),
                    textsLength: this.props.data.length * (barCount + 1),
                    rectX: 0,
                    rectY: 0,
                    rectEndX: 0,
                    rectEndY: 0
                },
                afterDatasetsUpdate: function(chart) {
                    const noColumns = Math.ceil(this.cache.length / 8);

                    let currentX1 = chart.width - startX1Offset * noColumns;
                    let currentX2 = barCount === 1 ? chart.width - startX2Offset * noColumns : currentX1 + startX2Offset;
                    let currentY = 18;

                    const rectX = barCount === 1 ? currentX2 - 10 : currentX1 - 10;
                    const rectY = currentY - 15;
                    let rectEndX = 1;
                    let rectEndY = 0;

                    let iteration = 0;

                    for(let i = 0; i < this.cache.length; i++) {
                        if(iteration === 8) {
                            iteration = 0;
                            if(barCount === 1) {
                                currentX2 += startX2Offset;
                            } else {
                                currentX1 += startX1Offset;
                                currentX2 = currentX1 + startX2Offset;
                            }

                            rectEndY = currentY + 19;
                            currentY = 18;
                            rectEndX++;
                        } else {
                            iteration++;
                        }

                        if(barCount === 1) {
                            let obj = this.cache.texts[i * 2];
                            obj.text = this.cache.cores[i];
                            obj.x = currentX2;
                            obj.y = currentY;

                            currentY += 14;

                            obj = this.cache.texts[i * 2 + 1];
                            obj.text = chart.data.datasets[0].data[i] + unit;
                            obj.x = currentX2;
                            obj.y = currentY;
                        } else {
                            let obj = this.cache.texts[i * 3];
                            obj.text = this.cache.cores[i];
                            obj.x = currentX1;
                            obj.y = currentY;

                            currentY += 14;

                            obj = this.cache.texts[i * 3 + 1];
                            obj.text = chart.data.datasets[0].data[i] + unit;
                            obj.x = currentX1;
                            obj.y = currentY;

                            obj = this.cache.texts[i * 3 + 2];
                            obj.text = chart.data.datasets[1].data[i] + unit;
                            obj.x = currentX2;
                            obj.y = currentY;
                        }
                        currentY += 19;
                    }

                    if(rectEndY === 0) {
                        rectEndY = currentY;
                    }

                    rectEndY = rectEndY - rectY - 4;

                    if(barCount === 1) {
                        rectEndX = (startX2Offset * rectEndX) - 10;
                    } else {
                        rectEndX = (startX1Offset * rectEndX) - 10;
                    }

                    this.cache.rectX = rectX;
                    this.cache.rectY = rectY;
                    this.cache.rectEndX = rectEndX;
                    this.cache.rectEndY = rectEndY;
                },
                afterDatasetsDraw: function(chart) {
                    const ctx = chart.ctx;
                    ctx.save();

                    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
                    ctx.fillRect(this.cache.rectX, this.cache.rectY, this.cache.rectEndX, this.cache.rectEndY);

                    ctx.font = "0.75rem Inter";
                    ctx.fillStyle = "#000000";


                    for(let i = 0; i < this.cache.textsLength; i++) {
                        const obj = this.cache.texts[i];
                        ctx.fillText(obj.text, obj.x, obj.y);
                    }

                    ctx.restore();
                }
            }]
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
        for(let i = 0; i < props.data.length; i++) {
            if(props.type === 0) {
                this.data.datasets[0].data[i] = props.data[i].threads[0].usage;
                if(props.threadCount > 1) {
                    this.data.datasets[1].data[i] = props.data[i].threads[1].usage;
                }
            } else if(props.type === 1) {
                this.data.datasets[0].data[i] = props.data[i].threads[0].clock[0];
                if(props.threadCount > 1) {
                    this.data.datasets[1].data[i] = props.data[i].threads[1].clock[0];
                }

                if(this.maxClock < props.maxClock) {
                    this.maxClock = Math.ceil(props.maxClock);
                    this.chart.options.scales.y.max = this.maxClock;
                    this.chart.options.scales.y.ticks.stepSize = this.maxClock / 10;
                }
            } else if(props.type === 2) {
                this.data.datasets[0].data[i] = props.data[i].temperature[0];
            } else if(props.type === 3) {
                this.data.datasets[0].data[i] = props.data[i].voltage;

                if(this.maxVoltage < props.maxVoltage) {
                    this.maxVoltage = Math.ceil(props.maxVoltage * 10) / 10;
                    this.chart.options.scales.y.max = this.maxVoltage;
                    this.chart.options.scales.y.ticks.stepSize = this.maxVoltage / 10;
                }
            }
        }
    }

    render() {
        return (
            <div className="d-cpuchart">
                <canvas ref={this.ref} />
            </div>
        );
    }
}