import React from "react";

export default class OrderModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: Array.from(Array(10).keys()),
            selectedOld: Array.from(Array(10).keys()),
            btnDisabled: false
        };

        this.updateOnce = false;
        this.graphList = ["Usage (Bar)", "Clock Speed (Bar)", "Core Temperature (Bar)", "Voltage (Bar)", "Usage (Line)", "Clock Speed (Line)", "Core Temperature (Line)", "Total Usage (Line)", "Package Temperature (Line)", "Voltage (Line)"];
        this.onClickButton = this.onClickButton.bind(this);
        this.onChangeSelect = this.onChangeSelect.bind(this);
    }

    onClickButton(e) {
        if(e.currentTarget.dataset.id === "0") {
            const arr = this.state.selected.map((value, index) => "col-lg-6 order-" + (index + 1));
            this.updateOnce = true;
            this.setState({
                selected: Array.from(Array(10).keys()),
                selectedOld: Array.from(Array(10).keys())
            });
            this.props.changeOrder(arr);
        } else if(e.currentTarget.dataset.id === "1") {
            this.updateOnce = true;
            this.props.toggleModal();
            this.setState({
                selected: [...this.state.selectedOld],
                btnDisabled: false
            });
        } else {
            const arr = this.state.selected.map(value => "col-lg-6 order-" + (value + 1));
            this.updateOnce = true;
            this.setState({
                selectedOld: [...this.state.selected]
            });
            this.props.changeOrder(arr);
        }
    }

    onChangeSelect(e) {
        const arr = [...this.state.selected];
        arr[parseInt(e.target.dataset.id)] = parseInt(e.target.value);

        this.setState({
            selected: arr,
            btnDisabled: (new Set(arr)).size !== this.graphList.length
        });
    }

    shouldComponentUpdate(props, state) {
        if(this.updateOnce) {
            if(props.modalClass === "modal d-none") {
                this.updateOnce = false;
            }
            return true;
        }

        return props.modalShown;
    }

    render() {
        const options = this.graphList.map((value, index) => {
            return <option value={index} key={index}>{value}</option>;
        });

        const selects = this.graphList.map((value, index) => {
            return (
                <div className="col-lg-6 order-item" key={index}>
                    <select value={this.state.selected[index]} onChange={this.onChangeSelect} data-id={index}>
                        {options}
                    </select>
                </div>
            );
        });

        return (
            <div className={this.props.modalClass}>
                <div>
                    <div className="row">
                        {selects}
                    </div>
                    <div className="btn-modal">
                        <button onClick={this.onClickButton} title="Reset to default" data-id={0} />
                        <button onClick={this.onClickButton} title="Discard changes" data-id={1} />
                        <button onClick={this.onClickButton} title="Apply changes" data-id={2} disabled={this.state.btnDisabled} />
                    </div>
                </div>
            </div>
        );
    }
}