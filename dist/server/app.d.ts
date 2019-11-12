#!/usr/bin/env node
import * as config from "@varkes/configuration";
declare function init(config: config.Config): Promise<any>;
export { init };
