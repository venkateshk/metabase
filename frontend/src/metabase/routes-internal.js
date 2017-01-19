import React, { Component } from "react";
import { Route } from "react-router";

import Icon from "metabase/components/Icon.jsx";

const SIZES = [12, 16];

const ListApp = () =>
    <ul>
        <li><a href="/_internal/icons">Icons</a></li>
        <li><a href="/_internal/embed?url=">Embed</a></li>
    </ul>

class IconsApp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            size: 32
        }
    }
    render() {
        let sizes = SIZES.concat(this.state.size)
        return (
            <table className="Table m4" style={{ width: "inherit" }}>
                <thead>
                    <tr>
                        <th>Name</th>
                        {sizes.map((size, index) =>
                            <th>
                                <div>{size}px</div>
                                { index === SIZES.length &&
                                    <input
                                        style={{ width: 60 }}
                                        type="range"
                                        value={this.state.size}
                                        max={64}
                                        onChange={(e) => this.setState({ size: e.target.value })}
                                    />
                                }
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                { Object.keys(require("metabase/icon_paths").ICON_PATHS).map(name =>
                    <tr>
                        <td>{name}</td>
                        {sizes.map(size =>
                            <td><Icon name={name} size={size} /></td>
                        )}
                    </tr>
                )}
                </tbody>
            </table>
        )
    }
}

const EmbedTestApp = ({ location }) =>
    <div className="bg-brand flex-full p4 flex">
        <iframe
            className="flex-full"
            src={location.query.url}
            frameBorder={0}
            allowTransparency
            style={{ backgroundColor: "transparent" }}
        />
    </div>

export default (
    <Route>
        <Route path="list" component={ListApp} />
        <Route path="icons" component={IconsApp} />
        <Route path="embed" component={EmbedTestApp} />
    </Route>
);
