"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");
const { spawnSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const webDir = path.join(rootDir, "docs", "live");
const args = process.argv.slice(2);

const shouldBuild = !args.includes("--no-build");
const replacePort = args.includes("--replace-port");

function readPort() {
    const envPort = Number(process.env.PORT || "");
    if (Number.isInteger(envPort) && envPort > 0) {
        return envPort;
    }

    const portIndex = args.findIndex((arg) => arg === "--port" || arg === "-p");
    if (portIndex >= 0 && args[portIndex + 1]) {
        const port = Number(args[portIndex + 1]);
        if (Number.isInteger(port) && port > 0) {
            return port;
        }
    }

    const inline = args.find((arg) => arg.startsWith("--port="));
    if (inline) {
        const port = Number(inline.slice("--port=".length));
        if (Number.isInteger(port) && port > 0) {
            return port;
        }
    }

    return 5175;
}

function npmInvocation(scriptName) {
    const npmExecPath = String(process.env.npm_execpath || "").trim();

    if (npmExecPath) {
        return {
            command: process.execPath,
            args: [npmExecPath, "run", scriptName]
        };
    }

    return {
        command: process.platform === "win32" ? "npm.cmd" : "npm",
        args: ["run", scriptName]
    };
}

function runBuild() {
    const invocation = npmInvocation("build:web");
    const result = spawnSync(invocation.command, invocation.args, {
        cwd: rootDir,
        stdio: "inherit",
        shell: process.platform === "win32" && invocation.command.endsWith(".cmd")
    });

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        process.exit(result.status || 1);
    }
}

function contentType(filePath) {
    switch (path.extname(filePath).toLowerCase()) {
        case ".html":
            return "text/html; charset=utf-8";
        case ".js":
            return "text/javascript; charset=utf-8";
        case ".css":
            return "text/css; charset=utf-8";
        case ".json":
            return "application/json; charset=utf-8";
        case ".svg":
            return "image/svg+xml";
        case ".png":
            return "image/png";
        case ".ico":
            return "image/x-icon";
        case ".woff2":
            return "font/woff2";
        default:
            return "application/octet-stream";
    }
}

function sendResponse(response, status, body, headers = {}) {
    response.writeHead(status, headers);
    response.end(body);
}

function serveFile(request, response) {
    const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
    const rawPath = decodeURIComponent(requestUrl.pathname);
    const relativePath = rawPath === "/"
        ? "index.html"
        : rawPath.replace(/^\/+/, "");
    const filePath = path.resolve(webDir, relativePath);

    if (!filePath.startsWith(webDir + path.sep) && filePath !== webDir) {
        sendResponse(response, 403, "Forbidden\n", { "Content-Type": "text/plain; charset=utf-8" });
        return;
    }

    fs.readFile(filePath, (error, data) => {
        if (error) {
            sendResponse(response, 404, "Not found\n", { "Content-Type": "text/plain; charset=utf-8" });
            return;
        }

        sendResponse(response, 200, data, { "Content-Type": contentType(filePath) });
    });
}

function listen(port) {
    const server = http.createServer(serveFile);

    server.on("error", (error) => {
        if (error.code === "EADDRINUSE" && replacePort) {
            listen(port + 1);
            return;
        }

        throw error;
    });

    server.listen(port, "127.0.0.1", () => {
        const url = `http://127.0.0.1:${port}`;
        console.log(`DialogCreator web server running at ${url}`);
        console.log("Press Ctrl+C to stop.");
    });
}

if (shouldBuild) {
    runBuild();
}

if (!fs.existsSync(path.join(webDir, "index.html"))) {
    throw new Error("DialogCreator web build was not found. Run npm run build:web first.");
}

listen(readPort());
