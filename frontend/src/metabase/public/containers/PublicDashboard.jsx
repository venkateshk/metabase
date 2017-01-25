/* @flow */

import React, { Component, PropTypes } from "react";

import DashboardApp from "metabase/dashboard/containers/DashboardApp.jsx";

import EmbedFrame from "../components/EmbedFrame";

export default class PublicDashboard extends Component {
    render() {
        const { params } = this.props;
        return (
            <EmbedFrame>
                <DashboardApp
                    {...this.props}
                    className={"spread"}
                    isEditable={false}
                    params={{ ...params, dashboardId: params.uuid }}
                    linkToCard={false}
                />
            </EmbedFrame>
        );
    }
}
