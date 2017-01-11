import React, { Component, PropTypes } from "react";

export default class PublicDashboard extends Component {
    render() {
        return (
            <div>{this.props.uuid}</div>
        );
    }
}
