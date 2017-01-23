/* @flow */

import React, { Component, PropTypes } from "react";

import Icon from "metabase/components/Icon";
import Link from "metabase/components/Link";
import ExternalLink from "metabase/components/ExternalLink";
import LoadingAndErrorWrapper from "metabase/components/LoadingAndErrorWrapper";

import { CardApi, DashboardApi } from "metabase/services";
import Urls from "metabase/lib/urls";

type Props = {
};

type State = {
};

export default class PublicLinksListing extends Component<*, Props, State> {
    props: Props;
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            list: null
        };
    }

    componentWillMount() {
        this.load();
    }

    async load() {
        try {
            const list = await this.props.load();
            this.setState({ list });
        } catch (error) {
            this.setState({ error });
        }
    }

    async revoke(item) {
        try {
            await this.props.revoke(item);
            this.load();
        } catch (error) {
            alert(error)
        }
    }

    render() {
        const { getUrl, getPublicUrl } = this.props;
        const { list, error } = this.state;
        return (
            <LoadingAndErrorWrapper loading={!list} error={error}>
            { () =>
                <table className="ContentTable">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Public Link</th>
                            <th>Revoke Link</th>
                        </tr>
                    </thead>
                    <tbody>
                        { this.state.list.map(item =>
                            <tr>
                                <td>
                                    <Link to={getUrl(item)}>
                                        {item.name}
                                    </Link>
                                </td>
                                <td>
                                    <ExternalLink href={getPublicUrl(item)}>
                                        {getPublicUrl(item)}
                                    </ExternalLink>
                                </td>
                                <td className="flex layout-centered">
                                    <Icon
                                        name="close"
                                        className="text-grey-2 text-grey-4-hover cursor-pointer"
                                        onClick={() => this.revoke(item)}
                                    />
                                </td>
                            </tr>
                        ) }
                    </tbody>
                </table>
            }
            </LoadingAndErrorWrapper>
        );
    }
}

export const PublicLinksDashboardListing = () =>
    <PublicLinksListing
        load={DashboardApi.listPublic}
        revoke={DashboardApi.deletePublicLink}
        getUrl={({ id }) => Urls.dashboard(id)}
        getPublicUrl={({ public_uuid }) => window.location.origin + Urls.publicDashboard(public_uuid)}
    />;

export const PublicLinksQuestionListing = () =>
    <PublicLinksListing
        load={CardApi.listPublic}
        revoke={CardApi.deletePublicLink}
        getUrl={({ id }) => Urls.card(id)}
        getPublicUrl={({ public_uuid }) => window.location.origin + Urls.publicCard(public_uuid)}
    />;
