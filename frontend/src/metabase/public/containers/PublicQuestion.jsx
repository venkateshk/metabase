/* @flow weak */

import React, { Component, PropTypes } from "react";

import Visualization from "metabase/visualizations/components/Visualization";
import TitleAndDescription from "metabase/components/TitleAndDescription"
import QueryDownloadWidget from "metabase/query_builder/components/QueryDownloadWidget";
import LoadingAndErrorWrapper from "metabase/components/LoadingAndErrorWrapper";
import ExplicitSize from "metabase/components/ExplicitSize";

import LogoBadge from "../components/LogoBadge";
import Parameters from "metabase/dashboard/containers/Parameters";

import { getParameters, applyParameters } from "metabase/meta/Card";

import type { Card } from "metabase/meta/types/Card";
import type { Dataset } from "metabase/meta/types/Dataset";

import { PublicApi } from "metabase/services";
import { IFRAMED } from "metabase/lib/dom";

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
    error:              ?Error,
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
            // FIXME: need to split card/dataset endpoint up
            let { card } = await PublicApi.card({ uuid });

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
            const newResult = await PublicApi.card({
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
        const { params: { uuid }, height, location } = this.props;
        const { card, result, error, parameterValues } = this.state;

        const showTitle = height > 250;

        let parameters = [];
        if (card) {
            // add `value` to parameters
            parameters = getParameters(card).map(p => ({ ...p, value: parameterValues[p.id] }));
        }

        return (
            <div className={cx("spread flex flex-column px0 pb0 sm-px2 sm-pb2", {
                "bordered rounded shadowed bg-white m1": IFRAMED
            })}>
                <div className="flex align-center justify-between py0 sm-py1 md-py2">
                    { card && showTitle &&
                        <TitleAndDescription title={card.name} description={card.description} />
                    }
                    <LogoBadge className="ml-auto mr-auto" />
                    { result &&
                        <QueryDownloadWidget
                            className="m1"
                            uuid={uuid}
                            result={result}
                        />
                    }
                </div>
                { parameters.length > 0 &&
                    <Parameters
                        parameters={parameters}
                        query={location.query}
                        setParameterValue={this.setParameterValue}
                        isQB
                    />
                }
                <LoadingAndErrorWrapper loading={!result} error={error}>
                { () =>
                    <Visualization
                        series={[result]}
                        className="flex-full"
                        onUpdateVisualizationSettings={(settings) =>
                            this.setState({
                                // $FlowFixMe
                                result: updateIn(result, ["card", "visualization_settings"], (s) => ({ ...s, ...settings }))
                            })
                        }
                        gridUnit={12}
                    />
                }
                </LoadingAndErrorWrapper>
            </div>
        )
    }
}
