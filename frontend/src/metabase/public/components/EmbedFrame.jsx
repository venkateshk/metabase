import React, { Component, PropTypes } from "react";
import ReactDOM from "react-dom";

import { IFRAMED } from "metabase/lib/dom";

import LogoBadge from "./LogoBadge";

import querystring from "querystring";
import cx from "classnames";

const DEFAULT_OPTIONS = {
    bordered: IFRAMED
}

export default class EmbedFrame extends Component {
    _getOptions() {
        let options = querystring.parse(window.location.hash.replace(/^#/, ""));
        for (var name in options) {
            if (/^(true|false|-?\d+(\.\d+)?)$/.test(options[name])) {
                options[name] = JSON.parse(options[name]);
            }
        }
        return { ...DEFAULT_OPTIONS, ...options };
    }

    render() {
        const { className, children, actionButtons } = this.props;
        let options = this._getOptions();
        const footer = true;

        return (
            <div
                className={cx("flex flex-column bg-white", className, {
                    "scroll-y m1 bordered rounded shadowed": options.bordered
                })}
            >
                <div className="flex-full scroll-y flex" ref={(c) => this._content = c}>
                    {children}
                </div>
                { footer &&
                    <div className="p1 md-p2 lg-p3 bg-white border-top flex-no-shrink flex">
                        <LogoBadge logoClassName="sm-show" />
                        {actionButtons &&
                            <div className="flex-align-right text-grey-3">{actionButtons}</div>
                        }
                    </div>
                }
            </div>
        )
    }
}
