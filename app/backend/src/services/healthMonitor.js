const Application = require("../models/Application");

async function probe(url) {
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(2500), redirect: "error" });
        const version = response.headers.get("x-service-version")?.slice(0, 50);
        await response.body?.cancel();
        return { status: response.ok ? "healthy" : "unhealthy", ...(version && { version }) };
    } catch {
        return { status: "unhealthy" };
    }
}

function startHealthMonitor(url) {
    if (!url) return;
    let running = false;

    async function check() {
        if (running) return;
        running = true;
        try {
            if (!(await Application.exists({ monitor: "demo", status: "active" }))) return;
            const result = await probe(url);
            const checkedAt = new Date();
            const deployment = result.status === "healthy" && result.version
                ? { deploymentStatus: "deployed" } : {};
            await Application.updateMany({ monitor: "demo", status: "active" }, {
                $set: { lastCheckedAt: checkedAt, healthStatus: result.status, ...deployment },
                $push: { healthHistory: { $each: [{ checkedAt, ...result }], $slice: -12 } }
            });
        } catch (error) {
            console.error("Health monitor could not save its result:", error.message);
        } finally {
            running = false;
        }
    }

    const timer = setInterval(check, 5000);
    timer.unref();
    void check();
}

module.exports = { startHealthMonitor };
