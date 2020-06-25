import React from "react";

import SettingsCard from "./SettingsCard";
import MemoryChart from "./MemoryChart";
import CpuInfo from "./CpuInfo";
import CpuBar from "./CpuBar";
import CpuLine from "./CpuLine";
import GpuCoreInfo from "./GpuCoreInfo";
import GpuMemoryInfo from "./GpuMemoryInfo";
import GpuPowerInfo from "./GpuPowerInfo";
import GpuGraph from "./GpuGraph";
import OrderModal from "./OrderModal";

import cogoToast from "cogo-toast";

export default class Jonitor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            ready: false,
            data: {},
            animate: true,
            animationDuration: 200,
            cGraphEnabled: Array(10).fill(true),
            cGraphPaused: Array(10).fill(false),
            cGraphHidden: Array(10).fill(false),
            cGraphClass: Array(10).fill(""),
            cGraphOrderClass: Array(10).fill().map((value, index) => "col-lg-6 order-" + (index + 1)),
            popupIndexCPU: -1,
            modalShown: false,
            modalClass: "modal d-none",
            gGraphEnabled: Array(4).fill(true),
            gGraphPaused: Array(4).fill(false),
            gGraphHidden: Array(4).fill(false),
            gGraphClass: Array(4).fill(""),
            popupIndexGPU: -1
        };

        this.maxData = 60;

        this.onChangeAnimate = this.onChangeAnimate.bind(this);
        this.onChangeEnableGraph = this.onChangeEnableGraph.bind(this);
        this.onChangePauseGraph = this.onChangePauseGraph.bind(this);
        this.onChangeHideGraph = this.onChangeHideGraph.bind(this);
        this.onClickMenu = this.onClickMenu.bind(this);
        this.onClickToggles = this.onClickToggles.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.changeOrder = this.changeOrder.bind(this);
    }

    componentDidMount() {
        const url = "ws://" + window.location.host + "/ws";
        const websocket = new WebSocket(url);

        websocket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if(!this.state.ready) {
                this.gpuCount = data.gpus.length;
                this.coreCount = data.cpus[0].cores.length;
                this.threadCount = data.cpus[0].cores[0].threads.length;
                this.totalRam = data.memoryUsed + data.memoryAvailable + " MB";
                this.isIntel = data.cpus[0].name.includes("Intel");

                this.pollTime = data.pollTime;

                this.setState({
                    ready: true,
                    data
                }, () => {
                    const element = document.getElementById("loader");
                    element.className = "fade-out";
                    setTimeout(() => {
                        document.getElementById("root").className = "fade-in";
                        document.getElementById("footer").className = "";
                        element.remove();
                    }, 300);
                });
                console.log(e.data);
            } else {
                if(this.pollTime < data.pollTime) {
                    this.pollTime = data.pollTime;
                    this.setState({ data });
                }
            }
        };

        websocket.onclose = (e) => {
            if(this.state.ready) {
                if(e.code === 4000) {
                    cogoToast.warn("Unable to read data from HWiNFO. Was HWiNFO closed?", {
                        hideAfter: 0,
                        position: "top-right"
                    });
                } else if(e.code === 4001) {
                    cogoToast.info("Connection lost. Jonitor is closed.", {
                        hideAfter: 0,
                        position: "top-right"
                    });
                } else {
                    cogoToast.warn("Connection lost.", {
                        hideAfter: 0,
                        position: "top-right"
                    });
                }
            } else {
                cogoToast.error("Connection error. Refresh the page to connect again.", {
                    hideAfter: 0,
                    position: "top-right"
                });
            }

            console.log("Websocket disconnected.", e.reason);
        };

        document.addEventListener("mousedown", (e) => {
            if(this.state.popupIndexCPU > -1 || this.state.popupIndexGPU > -1) {
                if(!e.target.dataset.menu) {
                    e.stopImmediatePropagation();
                    if(this.state.popupIndexCPU > -1) {
                        this.setState({
                            popupIndexCPU: -1
                        });
                    } else {
                        this.setState({
                            popupIndexGPU: -1
                        });
                    }
                }
            }
        });
    }

    onChangeAnimate() {
        this.setState({
            animate: !this.state.animate
        });
    }

    onChangeEnableGraph(e) {
        const index = parseInt(e.target.dataset.id);
        if(!e.target.dataset.gpu) {
            const arr = [...this.state.cGraphEnabled];
            arr[index] = !arr[index];
            this.setState({
                cGraphEnabled: arr
            });
        } else {
            const arr = [...this.state.gGraphEnabled];
            arr[index] = !arr[index];
            this.setState({
                gGraphEnabled: arr
            });
        }
    }

    onChangePauseGraph(e) {
        const index = parseInt(e.target.dataset.id);
        if(!e.target.dataset.gpu) {
            const arr = [...this.state.cGraphPaused];
            arr[index] = !arr[index];
            this.setState({
                cGraphPaused: arr
            });
        } else {
            const arr = [...this.state.gGraphPaused];
            arr[index] = !arr[index];
            this.setState({
                gGraphPaused: arr
            });
        }
    }

    onChangeHideGraph(e) {
        const index = parseInt(e.target.dataset.id);
        if(!e.target.dataset.gpu) {
            const arr1 = [...this.state.cGraphHidden];
            const arr2 = [...this.state.cGraphClass];
            if(arr1[index]) {
                arr1[index] = false;
                arr2[index] = "";
            } else {
                arr1[index] = true;
                arr2[index] = "d-none";
            }

            this.setState({
                cGraphHidden: arr1,
                cGraphClass: arr2
            });
        } else {
            const arr1 = [...this.state.gGraphHidden];
            const arr2 = [...this.state.gGraphClass];
            if(arr1[index]) {
                arr1[index] = false;
                arr2[index] = "";
            } else {
                arr1[index] = true;
                arr2[index] = "d-none";
            }

            this.setState({
                gGraphHidden: arr1,
                gGraphClass: arr2
            });
        }
    }

    onClickMenu(e) {
        const index = parseInt(e.target.dataset.id);
        if(!e.target.dataset.gpu) {
            this.setState({
                popupIndexCPU: this.state.popupIndexCPU === index ? -1 : index
            });
        } else {
            this.setState({
                popupIndexGPU: this.state.popupIndexGPU === index ? -1 : index
            });
        }
    }

    onClickToggles(e) {
        if(e.target.dataset.id === "0") {
            if(e.target.dataset.type === "true") {
                this.setState({
                    cGraphEnabled: Array(10).fill(true)
                }, () => {
                    cogoToast.success("All CPU graphs have been enabled.", {
                        hideAfter: 3,
                        position: "top-right"
                    });
                });
            } else {
                this.setState({
                    cGraphEnabled: Array(10).fill(false)
                }, () => {
                    cogoToast.success("All CPU graphs have been disabled.", {
                        hideAfter: 3,
                        position: "top-right"
                    });
                });
            }
        } else if(e.target.dataset.id === "1") {
            if(e.target.dataset.type === "true") {
                this.setState({
                    cGraphPaused: Array(10).fill(true)
                }, () => {
                    cogoToast.success("All CPU graphs have been paused.", {
                        hideAfter: 3,
                        position: "top-right"
                    });
                });
            } else {
                this.setState({
                    cGraphPaused: Array(10).fill(false)
                }, () => {
                    cogoToast.success("All CPU graphs have been unpaused.", {
                        hideAfter: 3,
                        position: "top-right"
                    });
                });
            }
        } else {
            if(e.target.dataset.type === "true") {
                this.setState({
                    cGraphHidden: Array(10).fill(false),
                    cGraphClass: Array(10).fill(""),
                }, () => {
                    cogoToast.success("All CPU graphs have been shown.", {
                        hideAfter: 3,
                        position: "top-right"
                    });
                });
            } else {
                this.setState({
                    cGraphHidden: Array(10).fill(true),
                    cGraphClass: Array(10).fill("d-none"),
                }, () => {
                    cogoToast.success("All CPU graphs have been hidden.", {
                        hideAfter: 3,
                        position: "top-right"
                    });
                });
            }
        }
    }

    toggleModal() {
        if(this.state.modalShown) {
            this.setState({
                modalShown: false,
                modalClass: "modal modal-hide"
            }, () => {
                setTimeout(() => {
                    document.body.style = "";
                    this.setState({
                        modalClass: "modal d-none"
                    });
                }, 200);
            });
        } else {
            this.setState({
                modalShown: true,
                modalClass: "modal modal-show"
            }, () => {
                document.body.style = "overflow:hidden;padding-right:" + (window.innerWidth - document.documentElement.clientWidth) + "px";
            });
        }
    }

    changeOrder(arr) {
        this.setState({
            cGraphOrderClass: arr
        });
        this.toggleModal();
    }

    render() {
        if(!this.state.ready) {
            return null;
        }

        let table;
        let chart1;
        let graph1;

        let menuCPU;
        let menuGPU;

        let gpu1;
        let gpu2;

        if(this.isIntel) {
            table = (
                <div className="table-overflow">
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">Core #</th>
                                <th scope="col">Highest Temperature ({"°" + this.state.data.temperatureUnit})</th>
                                <th scope="col">Highest Clock {this.threadCount === 1 ? "" : "(T0 / T1) (MHz)"}</th>
                                <th scope="col">Thermal Throttling</th>
                                <th scope="col">Power Limited</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.data.cpus[0].cores.map(value => {
                                return (
                                    <tr key={value.coreNo}>
                                        <th scope="row">{value.coreNo}</th>
                                        <td>{value.temperature[1]}</td>
                                        <td className="small-space">{this.threadCount === 1 ? value.threads[0].clock[1] : value.threads[0].clock[1] + " / " + value.threads[1].clock[1] }</td>
                                        <td>{this.convert(value.thermalThrottle)}</td>
                                        <td>{this.convert(value.powerThrottle)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            );

            chart1 = <CpuBar type={2} data={this.state.data.cpus[0].cores} unit={this.state.data.temperatureUnit} pollTime={this.state.data.pollTime} animate={this.state.animate} animationDuration={this.state.animationDuration} enabled={this.state.cGraphEnabled[2]} paused={this.state.cGraphPaused[2]} hidden={this.state.cGraphHidden[2]} />;
            graph1 = <CpuLine type={2} data={this.state.data.cpus[0].cores} pollTime={this.state.data.pollTime} unit={this.state.data.temperatureUnit} maxData={this.maxData} animate={this.state.animate} animationDuration={this.state.animationDuration} enabled={this.state.cGraphEnabled[6]} paused={this.state.cGraphPaused[6]} hidden={this.state.cGraphHidden[6]} />;
        } else {
            table = (
                <div className="table-overflow">
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">Core #</th>
                                <th scope="col">Highest Temperature ({"°" + this.state.data.temperatureUnit})</th>
                                <th scope="col">Highest Clock {this.threadCount === 1 ? "" : "(T0 / T1) (MHz)"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.data.cpus[0].cores.map(value => {
                                return (
                                    <tr key={value.coreNo}>
                                        <th scope="row">{value.coreNo}</th>
                                        <td>{value.temperature[1]}</td>
                                        <td className="small-space">{this.threadCount === 1 ? value.threads[0].clock[1] : value.threads[0].clock[1] + " / " + value.threads[1].clock[1] }</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            );
        }

        if(this.state.popupIndexCPU > -1) {
            menuCPU = (
                <div className="dropdown" data-menu>
                    <div className="dropdown-item checkbox">
                        <label data-menu>
                            <input type="checkbox" checked={this.state.cGraphEnabled[this.state.popupIndexCPU]} onChange={this.onChangeEnableGraph} data-menu data-id={this.state.popupIndexCPU} />
                            Enable graph
                        </label>
                    </div>
                    <div className="dropdown-item checkbox">
                        <label data-menu>
                            <input type="checkbox" checked={this.state.cGraphPaused[this.state.popupIndexCPU]} onChange={this.onChangePauseGraph} data-menu data-id={this.state.popupIndexCPU} />
                            Pause graph
                        </label>
                    </div>
                    <div className="dropdown-item checkbox">
                        <label data-menu>
                            <input type="checkbox" checked={this.state.cGraphHidden[this.state.popupIndexCPU]} onChange={this.onChangeHideGraph} data-menu data-id={this.state.popupIndexCPU} />
                            Hide graph
                        </label>
                    </div>
                </div>
            );
        }

        if(this.state.popupIndexGPU > -1) {
            menuGPU = (
                <div className="dropdown" data-menu>
                    <div className="dropdown-item checkbox">
                        <label data-menu>
                            <input type="checkbox" checked={this.state.gGraphEnabled[this.state.popupIndexGPU]} onChange={this.onChangeEnableGraph} data-menu data-id={this.state.popupIndexGPU} data-gpu />
                            Enable graph
                        </label>
                    </div>
                    <div className="dropdown-item checkbox">
                        <label data-menu>
                            <input type="checkbox" checked={this.state.gGraphPaused[this.state.popupIndexGPU]} onChange={this.onChangePauseGraph} data-menu data-id={this.state.popupIndexGPU} data-gpu />
                            Pause graph
                        </label>
                    </div>
                    <div className="dropdown-item checkbox">
                        <label data-menu>
                            <input type="checkbox" checked={this.state.gGraphHidden[this.state.popupIndexGPU]} onChange={this.onChangeHideGraph} data-menu data-id={this.state.popupIndexGPU} data-gpu />
                            Hide graph
                        </label>
                    </div>
                </div>
            );
        }

        if(this.gpuCount > 0) {
            gpu1 = (
                <div className="card">
                    <div className="row margin-fix">
                        <div className="col-12">
                            <p className="title">GPU: {this.state.data.gpus[0].name}</p>
                        </div>
                        <div className="col-lg-4">
                            <GpuCoreInfo data={this.state.data.gpus[0]} unit={this.state.data.temperatureUnit} pollTime={this.state.data.pollTime} animate={this.state.animate} animationDuration={this.state.animationDuration} />
                        </div>
                        <div className="col-lg-4">
                            <GpuMemoryInfo data={this.state.data.gpus[0]} pollTime={this.state.data.pollTime} animate={this.state.animate} animationDuration={this.state.animationDuration} />
                        </div>
                        <div className="col-lg-4">
                            <GpuPowerInfo data={this.state.data.gpus[0]} pollTime={this.state.data.pollTime} animate={this.state.animate} animationDuration={this.state.animationDuration} />
                        </div>
                        <div className="col-lg-6">
                            <div className="title">
                                <p>Clock Speed (Mhz)</p>
                                <button className="btn-menu" onClick={this.onClickMenu} data-menu data-id={0} data-gpu />
                                {this.state.popupIndexGPU === 0 ? menuGPU : undefined}
                            </div>
                            <div className={this.state.gGraphClass[0]}>
                                <GpuGraph type={0} data={this.state.data.gpus[0]} pollTime={this.state.data.pollTime} maxData={this.maxData} animate={this.state.animate} animationDuration={this.state.animationDuration} enabled={this.state.gGraphEnabled[0]} paused={this.state.gGraphPaused[0]} hidden={this.state.gGraphHidden[0]} />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="title">
                                <p>Temperature (°{this.state.data.temperatureUnit})</p>
                                <button className="btn-menu" onClick={this.onClickMenu} data-menu data-id={1} data-gpu />
                                {this.state.popupIndexGPU === 1 ? menuGPU : undefined}
                            </div>
                            <div className={this.state.gGraphClass[1]}>
                                <GpuGraph type={1} data={this.state.data.gpus[0]} pollTime={this.state.data.pollTime} unit={this.state.data.temperatureUnit} maxData={this.maxData} animate={this.state.animate} animationDuration={this.state.animationDuration} enabled={this.state.gGraphEnabled[1]} paused={this.state.gGraphPaused[1]} hidden={this.state.gGraphHidden[1]} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if(this.gpuCount === 2) {
            gpu2 = (
                <div className="card">
                    <div className="row margin-fix">
                        <div className="col-12">
                            <p className="title">GPU: {this.state.data.gpus[1].name}</p>
                        </div>
                        <div className="col-lg-4">
                            <GpuCoreInfo data={this.state.data.gpus[1]} unit={this.state.data.temperatureUnit} pollTime={this.state.data.pollTime} animate={this.state.animate} animationDuration={this.state.animationDuration} />
                        </div>
                        <div className="col-lg-4">
                            <GpuMemoryInfo data={this.state.data.gpus[1]} pollTime={this.state.data.pollTime} animate={this.state.animate} animationDuration={this.state.animationDuration} />
                        </div>
                        <div className="col-lg-4">
                            <GpuPowerInfo data={this.state.data.gpus[1]} pollTime={this.state.data.pollTime} animate={this.state.animate} animationDuration={this.state.animationDuration} />
                        </div>
                        <div className="col-lg-6">
                            <div className="title">
                                <p>Clock Speed (Mhz)</p>
                                <button className="btn-menu" onClick={this.onClickMenu} data-menu data-id={2} data-gpu />
                                {this.state.popupIndexGPU === 2 ? menuGPU : undefined}
                            </div>
                            <div className={this.state.gGraphClass[2]}>
                                <GpuGraph type={0} data={this.state.data.gpus[1]} pollTime={this.state.data.pollTime} maxData={this.maxData} animate={this.state.animate} animationDuration={this.state.animationDuration} enabled={this.state.gGraphEnabled[2]} paused={this.state.gGraphPaused[2]} hidden={this.state.gGraphHidden[2]} />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="title">
                                <p>Temperature (°{this.state.data.temperatureUnit})</p>
                                <button className="btn-menu" onClick={this.onClickMenu} data-menu data-id={3} data-gpu />
                                {this.state.popupIndexGPU === 3 ? menuGPU : undefined}
                            </div>
                            <div className={this.state.gGraphClass[3]}>
                                <GpuGraph type={1} data={this.state.data.gpus[1]} pollTime={this.state.data.pollTime} unit={this.state.data.temperatureUnit} maxData={this.maxData} animate={this.state.animate} animationDuration={this.state.animationDuration} enabled={this.state.gGraphEnabled[3]} paused={this.state.gGraphPaused[3]} hidden={this.state.gGraphHidden[3]} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="container-fluid">
                <OrderModal modalShown={this.state.modalShown} modalClass={this.state.modalClass} toggleModal={this.toggleModal} changeOrder={this.changeOrder} />
                <div className="card">
                    <div className="row margin-fix">
                        <SettingsCard animate={this.state.animate} onChangeAnimate={this.onChangeAnimate} onClickToggles={this.onClickToggles} toggleModal={this.toggleModal} />
                        <div className="col-lg-4">
                            <p className="title">Physical Memory Usage</p>
                            <MemoryChart data={[this.state.data.memoryUsed, this.state.data.memoryAvailable]} pollTime={this.state.data.pollTime} animate={this.state.animate} animationDuration={this.state.animationDuration} />
                        </div>
                        <div className="col-lg-4">
                            <p className="title">Memory Information</p>
                            <p className="info">Total RAM: <strong>{this.totalRam}</strong></p>
                            <p className="info">Memory Clock: <strong>{this.state.data.memoryClock + " MHz"}</strong></p>
                            <p className="info">Memory Clock Ratio: <strong>{this.state.data.memoryClockRatio.toFixed(2) + "x"}</strong></p>
                            <p className="info">Memory Timings: <strong>{this.state.data.memoryTimings}</strong></p>
                            <p className="info">Virtual Memory Commited: <strong>{this.state.data.virtualMemoryCommited + " MB"}</strong></p>
                            <p className="info">Virtual Memory Avilable: <strong>{this.state.data.virtualMemoryAvailable + " MB"}</strong></p>
                        </div>
                    </div>
                </div>
               <div className="card">
                    <div className="row margin-fix">
                        <div className="col-12">
                            <p className="title">CPU</p>
                        </div>
                        <div className="col-lg-4">
                            <p className="info">CPU Name: <strong>{this.state.data.cpus[0].name}</strong></p>
                            <p className="info">Cores/Threads: <strong>{this.coreCount + " cores / " + this.coreCount * this.threadCount + " threads"}</strong></p>
                            <p className="info">Processes: <strong>{this.state.data.processCount}</strong></p>
                            <p className="info">Threads: <strong>{this.state.data.threadCount}</strong></p>
                            <p className="info">Handles: <strong>{this.state.data.handleCount}</strong></p>
                        </div>
                        <div className="col-lg-4">
                            <CpuInfo data={this.state.data.cpus[0]} unit={this.state.data.temperatureUnit} pollTime={this.state.data.pollTime} animate={this.state.animate} animationDuration={this.state.animationDuration} />
                        </div>
                        <div className="col-lg-4">
                            {table}
                        </div>
                        <div className={this.state.cGraphOrderClass[0]}>
                            <div className="title">
                                <p>Usage (%)</p>
                                <button className="btn-menu" onClick={this.onClickMenu} data-menu data-id={0} />
                                {this.state.popupIndexCPU === 0 ? menuCPU : undefined}
                            </div>
                            <div className={this.state.cGraphClass[0]}>
                                <CpuBar type={0} data={this.state.data.cpus[0].cores} threadCount={this.threadCount} pollTime={this.state.data.pollTime} animate={this.state.animate} animationDuration={this.state.animationDuration} enabled={this.state.cGraphEnabled[0]} paused={this.state.cGraphPaused[0]} hidden={this.state.cGraphHidden[0]} />
                            </div>
                        </div>
                        <div className={this.state.cGraphOrderClass[1]}>
                            <div className="title">
                                <p>Clock Speed (MHz)</p>
                                <button className="btn-menu" onClick={this.onClickMenu} data-menu data-id={1} />
                                {this.state.popupIndexCPU === 1 ? menuCPU : undefined}
                            </div>
                            <div className={this.state.cGraphClass[1]}>
                                <CpuBar type={1} data={this.state.data.cpus[0].cores} threadCount={this.threadCount} maxClock={this.state.data.cpus[0].maxClock} pollTime={this.state.data.pollTime} animate={this.state.animate} animationDuration={this.state.animationDuration} enabled={this.state.cGraphEnabled[1]} paused={this.state.cGraphPaused[1]} hidden={this.state.cGraphHidden[1]} />
                            </div>
                        </div>
                        <div className={this.isIntel ? this.state.cGraphOrderClass[2] : "d-none"}>
                            <div className="title">
                                <p>Core Temperature (°{this.state.data.temperatureUnit})</p>
                                <button className="btn-menu" onClick={this.onClickMenu} data-menu data-id={2} />
                                {this.state.popupIndexCPU === 2 ? menuCPU : undefined}
                            </div>
                            <div className={this.state.cGraphClass[2]}>
                                {chart1}
                            </div>
                        </div>
                        <div className={this.state.cGraphOrderClass[3]}>
                            <div className="title">
                                <p>Voltage (V)</p>
                                <button className="btn-menu" onClick={this.onClickMenu} data-menu data-id={3} />
                                {this.state.popupIndexCPU === 3 ? menuCPU : undefined}
                            </div>
                            <div className={this.state.cGraphClass[3]}>
                                <CpuBar type={3} data={this.state.data.cpus[0].cores} maxVoltage={this.state.data.cpus[0].maxVoltage} pollTime={this.state.data.pollTime} animate={this.state.animate} animationDuration={this.state.animationDuration} enabled={this.state.cGraphEnabled[3]} paused={this.state.cGraphPaused[3]} hidden={this.state.cGraphHidden[3]} />
                            </div>
                        </div>
                        <div className={this.state.cGraphOrderClass[4]}>
                            <div className="title">
                                <p>Usage (%)</p>
                                <button className="btn-menu" onClick={this.onClickMenu} data-menu data-id={4} />
                                {this.state.popupIndexCPU === 4 ? menuCPU : undefined}
                            </div>
                            <div className={this.state.cGraphClass[4]}>
                                <CpuLine type={0} data={this.state.data.cpus[0].cores} threadCount={this.threadCount} pollTime={this.state.data.pollTime} maxData={this.maxData} animate={this.state.animate} animationDuration={this.state.animationDuration}  enabled={this.state.cGraphEnabled[4]} paused={this.state.cGraphPaused[4]} hidden={this.state.cGraphHidden[4]} />
                            </div>
                        </div>
                        <div className={this.state.cGraphOrderClass[5]}>
                            <div className="title">
                                <p>Clock Speed (MHz)</p>
                                <button className="btn-menu" onClick={this.onClickMenu} data-menu data-id={5} />
                                {this.state.popupIndexCPU === 5 ? menuCPU : undefined}
                            </div>
                            <div className={this.state.cGraphClass[5]}>
                                <CpuLine type={1} data={this.state.data.cpus[0].cores} threadCount={this.threadCount} pollTime={this.state.data.pollTime} maxClock={this.state.data.cpus[0].maxClock} maxData={this.maxData} animate={this.state.animate} animationDuration={this.state.animationDuration} enabled={this.state.cGraphEnabled[5]} paused={this.state.cGraphPaused[5]} hidden={this.state.cGraphHidden[5]} />
                            </div>
                        </div>
                        <div className={this.isIntel ? this.state.cGraphOrderClass[6] : "d-none"}>
                            <div className="title">
                                <p>Core Temperature (°{this.state.data.temperatureUnit})</p>
                                <button className="btn-menu" onClick={this.onClickMenu} data-menu data-id={6} />
                                {this.state.popupIndexCPU === 6 ? menuCPU : undefined}
                            </div>
                            <div className={this.state.cGraphClass[6]}>
                                {graph1}
                            </div>
                        </div>
                        <div className={this.state.cGraphOrderClass[7]}>
                            <div className="title">
                                <p>Total Usage (%)</p>
                                <button className="btn-menu" onClick={this.onClickMenu} data-menu data-id={7} />
                                {this.state.popupIndexCPU === 7 ? menuCPU : undefined}
                            </div>
                            <div className={this.state.cGraphClass[7]}>
                                <CpuLine type={3} data={this.state.data.cpus[0].usage} pollTime={this.state.data.pollTime} maxData={this.maxData} animate={this.state.animate} animationDuration={this.state.animationDuration} enabled={this.state.cGraphEnabled[7]} paused={this.state.cGraphPaused[7]} hidden={this.state.cGraphHidden[7]} />
                            </div>
                        </div>
                        <div className={this.state.cGraphOrderClass[8]}>
                            <div className="title">
                                <p>Package Temperature (°{this.state.data.temperatureUnit})</p>
                                <button className="btn-menu" onClick={this.onClickMenu} data-menu data-id={8} />
                                {this.state.popupIndexCPU === 8 ? menuCPU : undefined}
                            </div>
                            <div className={this.state.cGraphClass[8]}>
                                <CpuLine type={4} data={this.state.data.cpus[0].temperature[0]} pollTime={this.state.data.pollTime} unit={this.state.data.temperatureUnit} maxData={this.maxData} animate={this.state.animate} animationDuration={this.state.animationDuration} enabled={this.state.cGraphEnabled[8]} paused={this.state.cGraphPaused[8]} hidden={this.state.cGraphHidden[8]} />
                            </div>
                        </div>
                        <div className={this.state.cGraphOrderClass[9]}>
                            <div className="title">
                                <p>Voltage (V)</p>
                                <button className="btn-menu" onClick={this.onClickMenu} data-menu data-id={9} />
                                {this.state.popupIndexCPU === 9 ? menuCPU : undefined}
                            </div>
                            <div className={this.state.cGraphClass[9]}>
                                <CpuLine type={5} data={this.state.data.cpus[0].cores} pollTime={this.state.data.pollTime} maxVoltage={this.state.data.cpus[0].maxVoltage} maxData={this.maxData} animate={this.state.animate} animationDuration={this.state.animationDuration} enabled={this.state.cGraphEnabled[9]} paused={this.state.cGraphPaused[9]} hidden={this.state.cGraphHidden[9]} />
                            </div>
                        </div>
                    </div>
                </div>
                {gpu1}
                {gpu2}
            </div>
        );
    }

    convert(value) {
        return (value[0] === 1 ? "Yes" : "No") + " [" + (value[1] === 1 ? "Yes" : "No") + "]";
    }
}