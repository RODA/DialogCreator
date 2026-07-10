"use strict";

const net = require("net");
const path = require("path");
const { spawn } = require("child_process");

const rootDir = path.resolve(__dirname, "..");

function findAvailablePort() {
    return new Promise((resolve, reject) => {
        const server = net.createServer();

        server.on("error", reject);
        server.listen(0, "127.0.0.1", () => {
            const address = server.address();
            const port = typeof address === "object" && address
                ? address.port
                : 0;

            server.close(() => {
                resolve(port);
            });
        });
    });
}

function waitForServer(process, port) {
    return new Promise((resolve, reject) => {
        let output = "";
        let settled = false;

        const cleanup = function() {
            process.stdout.off("data", onOutput);
            process.stderr.off("data", onOutput);
            process.off("exit", onExit);
        };

        const finish = function(error) {
            if (settled) {
                return;
            }

            settled = true;
            cleanup();

            if (error) {
                reject(error);
                return;
            }

            resolve();
        };

        const onOutput = function(chunk) {
            output += chunk.toString();

            if (output.includes(`http://127.0.0.1:${port}`)) {
                finish();
            }
        };

        const onExit = function(code) {
            finish(new Error(`web server exited before it was ready: ${code}\n${output}`));
        };

        process.stdout.on("data", onOutput);
        process.stderr.on("data", onOutput);
        process.on("exit", onExit);
    });
}

async function startRenderedWebServer() {
    const port = await findAvailablePort();
    const child = spawn(process.execPath, [
        path.join(rootDir, "scripts", "serve-web.js"),
        "--no-build",
        "--port",
        String(port)
    ], {
        cwd: rootDir,
        stdio: ["ignore", "pipe", "pipe"]
    });

    await waitForServer(child, port);

    return {
        url: `http://127.0.0.1:${port}`,
        close: async function() {
            if (child.exitCode !== null) {
                return;
            }

            child.kill();
            await new Promise((resolve) => {
                child.once("exit", resolve);
            });
        }
    };
}

module.exports = {
    startRenderedWebServer
};
