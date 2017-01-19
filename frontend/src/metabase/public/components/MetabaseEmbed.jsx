import React, { Component, PropTypes } from "react";

import querystring from "querystring";

export default class MetabaseEmbed extends Component {
    render() {
        let { className, style, url, bordered } = this.props;
        let options = querystring.stringify({ bordered });
        if (options) {
            url += "#" + options;
        }
        return (
            <iframe
                src={url}
                className={className}
                style={{ backgroundColor: "transparent", ...style }}
                frameBorder={0}
                allowTransparency
            />
        );
    }
}
