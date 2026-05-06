import path from "path";
import { fileURLToPath } from "url";
import json from "@rollup/plugin-json";
import { babel } from "@rollup/plugin-babel";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolveFile = function (filepath) {
    return path.join(__dirname, filepath);
};

const plugins = [
    json(),
    babel({
        extensions: [".js", ".ts"],
        babelHelpers: "bundled",
        presets: [
            [
                "@babel/preset-env",
                {
                    targets: {
                        browsers: ["last 2 versions", "> 1%", "not ie <= 11"],
                    },
                },
            ],
        ],
    }),
];

export default [
    {
        plugins,
        input: resolveFile("../src/WebEyeSDK.js"),
        output: {
            file: resolveFile("../dist/monitor.js"),
            format: "iife",
            name: 'monitor',
            sourcemap: true,
            exports: 'auto'
        },
    },
    {
        plugins,
        input: resolveFile("../src/WebEyeSDK.js"),
        output: {
            file: resolveFile("../dist/monitor.esm.js"),
            format: "esm",
            name: 'monitor',
            sourcemap: true,
        },
    },
    {
        plugins,
        input: resolveFile("../src/WebEyeSDK.js"),
        output: {
            file: resolveFile("../dist/monitor.cjs.js"),
            format: "cjs",
            name: 'monitor',
            sourcemap: true,
        },
    }
]