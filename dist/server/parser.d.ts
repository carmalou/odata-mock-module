#!/usr/bin/env node
import { ParsedModels } from "./types";
declare function parseEdmx(path: string, dataSourceName: string): Promise<ParsedModels>;
export { parseEdmx };
