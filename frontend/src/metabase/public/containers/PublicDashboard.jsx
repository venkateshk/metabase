/* @flow */

import React, { Component, PropTypes } from "react";

import DashboardApp from "metabase/dashboard/containers/DashboardApp.jsx";

export default class PublicDashboard extends Component {
    render() {
        const { params } = this.props;
        return (
            <div>
                <DashboardApp
                    {...this.props}
                    isEditable={false}
                    params={{ ...params, dashboardId: params.uuid }}
                />
            </div>
        );
    }
}
