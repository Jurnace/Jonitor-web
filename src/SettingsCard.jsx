import React from "react";

export default class SettingsCard extends React.Component {
    shouldComponentUpdate(props, state) {
        return this.props.animate !== props.animate;
    }

    render() {
        return (
            <div className="col-lg-4">
                <p className="title">Settings</p>
                <div className="settings checkbox">
                    <input type="checkbox" id="animate" checked={this.props.animate} onChange={this.props.onChangeAnimate} />
                    <label htmlFor="animate">Enable animation</label>
                </div>
                <div className="settings btn-group">
                    <button onClick={this.props.onClickToggles} data-id={0} data-type={true}>Enable CPU graphs</button>
                    <button onClick={this.props.onClickToggles} data-id={0} data-type={false}>Disable CPU graphs</button>
                </div>
                <div className="settings btn-group">
                    <button onClick={this.props.onClickToggles} data-id={1} data-type={true}>Pause CPU graphs</button>
                    <button onClick={this.props.onClickToggles} data-id={1} data-type={false}>Unpause CPU graphs</button>
                </div>
                <div className="settings btn-group">
                    <button onClick={this.props.onClickToggles} data-id={2} data-type={true}>Show CPU graphs</button>
                    <button onClick={this.props.onClickToggles} data-id={2} data-type={false}>Hide CPU graphs</button>
                </div>
                <div className="settings">
                    <button className="btn-order" onClick={this.props.toggleModal}>Change order of CPU graphs</button>
                </div>
            </div>
        );
    }
}