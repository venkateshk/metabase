import React, { Component, PropTypes } from "react";

import Visualization from "metabase/visualizations/components/Visualization";
import LogoIcon from "metabase/components/LogoIcon"
import TitleAndDescription from "metabase/components/TitleAndDescription"
import QueryDownloadWidget from "metabase/query_builder/components/QueryDownloadWidget";
import LoadingAndErrorWrapper from "metabase/components/LoadingAndErrorWrapper";

import { PublicApi } from "metabase/services";

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
        const { uuid } = this.props.params;
        const { result, error } = this.state;
        return (
            <div className="spread flex flex-column pt2 px4 pb4">
                <div className="flex align-center justify-between">
                    { result &&
                        <TitleAndDescription title={result.card.name} description={result.card.description} />
                    }
                    <a href="http://www.metabase.com/" className="ml-auto mr-auto flex align-center text-brand no-decoration">
                        <LogoIcon size={24} className="mr1" />
                        <span className="text-bold h4">Metabase</span>
                    </a>
                    { result &&
                        <QueryDownloadWidget
                            uuid={uuid}
                            result={result}
                        />
                    }
                </div>
                <LoadingAndErrorWrapper loading={!result} error={error}>
                { () =>
                    <Visualization series={[result]} className="flex-full" />
                }
                </LoadingAndErrorWrapper>
            </div>
        )
    }
}
