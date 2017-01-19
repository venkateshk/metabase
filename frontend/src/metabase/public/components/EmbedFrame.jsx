import React, { Component, PropTypes } from "react";
import ReactDOM from "react-dom";

import { IFRAMED } from "metabase/lib/dom";

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
        const { className, children } = this.props;
        let options = this._getOptions();
        return (
            <div
                className={cx("spread bg-white", className, {
                    "scroll-y m1 bordered rounded shadowed": options.bordered
                })}
            >
                {children}
            </div>
        )
    }
}
