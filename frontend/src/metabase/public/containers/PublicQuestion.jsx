import React, { Component, PropTypes } from "react";

import Visualization from "metabase/visualizations/components/Visualization";
import TitleAndDescription from "metabase/components/TitleAndDescription"
import QueryDownloadWidget from "metabase/query_builder/components/QueryDownloadWidget";
import LoadingAndErrorWrapper from "metabase/components/LoadingAndErrorWrapper";
import ExplicitSize from "metabase/components/ExplicitSize";

import LogoBadge from "../components/LogoBadge";

import { PublicApi } from "metabase/services";
import { updateIn } from "icepick";

@ExplicitSize
export default class PublicQuestion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            result: null,
            error: null
        }
    }
    async componentWillMount() {
        try {
            let result = await PublicApi.card({ uuid: this.props.params.uuid });
            this.setState({ result });
        } catch (error) {
            this.setState({ error });
        }
    }
    render() {
        const { params: { uuid }, height } = this.props;
        const { result, error } = this.state;

        const showTitle = height > 250;

        return (
            <div className="spread flex flex-column px0 pb0 sm-px2 sm-pb2">
                <div className="flex align-center justify-between py0 sm-py1 md-py2">
                    { result && showTitle &&
                        <TitleAndDescription title={result.card.name} description={result.card.description} />
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
                <LoadingAndErrorWrapper loading={!result} error={error}>
                { () =>
                    <Visualization
                        series={[result]}
                        className="flex-full"
                        onUpdateVisualizationSettings={(settings) =>
                            this.setState({
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
