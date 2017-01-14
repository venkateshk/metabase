/* @flow weak */

import React, { Component, PropTypes } from "react";

import { Route } from 'react-router';

import PublicQuestion from "metabase/public/containers/PublicQuestion.jsx";
import PublicDashboard from "metabase/public/containers/PublicDashboard.jsx";

export const getRoutes = (store) =>
    <Route path="public">
        <Route path="question/:uuid" component={PublicQuestion} />
        <Route path="dashboard/:uuid" component={PublicDashboard} />
    </Route>
