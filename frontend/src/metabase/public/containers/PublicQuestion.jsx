/* @flow weak */

import React, { Component, PropTypes } from "react";

import Visualization from "metabase/visualizations/components/Visualization";
import QueryDownloadWidget from "metabase/query_builder/components/QueryDownloadWidget";
import LoadingAndErrorWrapper from "metabase/components/LoadingAndErrorWrapper";
import ExplicitSize from "metabase/components/ExplicitSize";

import EmbedFrame from "../components/EmbedFrame";
import PublicNotFound from "../components/PublicNotFound";
import Parameters from "metabase/dashboard/containers/Parameters";

import { getParameters, applyParameters } from "metabase/meta/Card";

import type { Card } from "metabase/meta/types/Card";
import type { Dataset } from "metabase/meta/types/Dataset";

import { PublicApi } from "metabase/services";

import { updateIn } from "icepick";
import cx from "classnames";

type Props = {
    params:     { uuid: string },
    location:   { query: { [key:string]: string }},
    width:      number,
    height:     number
}

type State = {
    card:               ?Card,
    result:             ?Dataset,
    error:              ?any,
    parameterValues:    {[key:string]: string}
}

@ExplicitSize
export default class PublicQuestion extends Component<*, Props, State> {
    props: Props;
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            card: null,
            result: null,
            error: null,
            parameterValues: {}
        }
    }

    async componentWillMount() {
        const { params: { uuid }, location: { query }} = this.props;
        try {
            let card = await PublicApi.card({ uuid });

            let parameters = getParameters(card);
            let parameterValues = {};
            for (let parameter of parameters) {
                parameterValues[parameter.id] = query[parameter.slug];
            }

            this.setState({ card, parameterValues }, this.run);
        } catch (error) {
            console.error(error);
            this.setState({ error });
        }
    }

    setParameterValue = (id, value) => {
        this.setState({
            parameterValues: {
                ...this.state.parameterValues,
                [id]: value
            }
        }, this.run);
    }

    run = async () => {
        const { params: { uuid } } = this.props;
        const { card, parameterValues } = this.state;

        if (!card) {
            return;
        }

        const parameters = getParameters(card);
        const datasetQuery = applyParameters(card, parameters, parameterValues);

        try {
            const newResult = await PublicApi.cardQuery({
                uuid,
                parameters: JSON.stringify(datasetQuery.parameters)
            });

            this.setState({ result: newResult });
        } catch (error) {
            console.error(error);
            this.setState({ error });
        }
    }

    render() {
        const { params: { uuid }, location } = this.props;
        const { card, result, error, parameterValues } = this.state;

        if (error && error.status === 404) {
            return <PublicNotFound />
        }

        let parameters = [];
        if (card) {
            // add `value` to parameters
            parameters = getParameters(card).map(p => ({ ...p, value: parameterValues[p.id] }));
        }

        const actionButtons = result && (
            <QueryDownloadWidget
                className="m1 text-grey-4-hover"
                uuid={uuid}
                result={result}
            />
        )

        return (
            <EmbedFrame className={cx("flex flex-column")} actionButtons={actionButtons}>
                <LoadingAndErrorWrapper loading={!result} error={error}>
                { () =>
                    <Visualization
                        isDashboard
                        series={[{ card: card, data: result && result.data }]}
                        className="flex-full"
                        onUpdateVisualizationSettings={(settings) =>
                            this.setState({
                                // $FlowFixMe
                                result: updateIn(result, ["card", "visualization_settings"], (s) => ({ ...s, ...settings }))
                            })
                        }
                        gridUnit={12}
                        actionButtons={parameters.length > 0 &&
                            <Parameters
                                parameters={parameters}
                                query={location.query}
                                setParameterValue={this.setParameterValue}
                                isQB
                            />}
                        linkToCard={false}
                    />
                }
                </LoadingAndErrorWrapper>
            </EmbedFrame>
        )
    }
}
