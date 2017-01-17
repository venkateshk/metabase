/* @flow */
import React, { Component, PropTypes } from "react";

import Icon from "metabase/components/Icon";
import Button from "metabase/components/Button";
import PopoverWithTrigger from "metabase/components/PopoverWithTrigger";
import CopyWidget from "metabase/components/CopyWidget";

type Props = {
    uuid?: string,
    type: string,
    extensions: string[],
    onCreate: () => void,
    onDisable: () => void,
}

type State = {
    confirmDisable: boolean
}

export default class ShareWidget extends Component<*, Props, State> {
    state: State;
    props: Props;

    constructor(props: Props) {
        super(props);
        this.state = {
            confirmDisable: false
        }
    }

    static defaultProps = {
        extensions: []
    }

    render() {
        const { uuid, type, extensions, onCreate, onDisable } = this.props;
        const { confirmDisable } = this.state;

        let links;
        if (uuid) {
            const baseLink = `${document.location.origin}/public/${type}/${uuid}`;
            links = [{
                name: type,
                link: baseLink
            },{
                name: "embed",
                link: `<iframe src="${baseLink}" width="600" height="400" frameborder="0" />`
            }].concat(extensions.map(extension => ({
                name: extension.toUpperCase(),
                link: `${baseLink}.${extension.toLowerCase()}` })
            ));
        }

        return (
            <PopoverWithTrigger
                triggerElement={
                    <Icon name="star" />
                }
                style={{ width: 325 }}
            >
                { confirmDisable ?
                    <div className="p2">
                        <div className="text-bold">Disable these links?</div>
                        <div className="py2">
                            They won't work any more, and can't be restored, but you can create new links.
                        </div>
                        <div>
                            <Button onClick={() => this.setState({ confirmDisable: false })}>Cancel</Button>
                            <Button className="ml1" warning onClick={onDisable}>Disable</Button>
                        </div>
                    </div>
                : uuid ?
                    <div>
                        <div className="p2">
                            { links && links.map(({ name, link }) =>
                                <div className="pt1 pb2">
                                    <div className="text-bold pb1">Public link to {name}</div>
                                    <CopyWidget value={link} />
                                </div>
                            )}
                        </div>
                        <div className="border-top flex flex-column align-center">
                            <div
                                className="text-warning cursor-pointer flex align-center p2"
                                onClick={() => this.setState({ confirmDisable: true })}
                            >
                                <Icon name="close" className="mr1" />
                                Disable links
                            </div>
                        </div>
                    </div>
                :
                    <div className="p2 flex layout-centered">
                        <Button className="text-brand" borderless onClick={onCreate}>
                            Create public link
                        </Button>
                    </div>
                }

            </PopoverWithTrigger>
        );
    }
}
