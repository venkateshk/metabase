/* @flow */

import React from "react";
import LogoIcon from "metabase/components/LogoIcon";

import cx from "classnames";

type Props = {
    className?: string
}

const LogoBadge = ({ className }: Props) =>
    <a href="http://www.metabase.com/" className={cx(className, "flex align-center text-brand no-decoration")}>
        <LogoIcon size={24} className="mr1" />
        <span className="text-bold h4">Metabase</span>
    </a>

export default LogoBadge;
