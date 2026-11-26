import { useEffect, useState } from "react";
import "./App.css";

const initialForm = { name: "", version: "1.0.0", environment: "development", monitor: "demo" };
const labels = { healthy: "Healthy", unhealthy: "Unhealthy", unknown: "Never checked" };

async function api(path = "", options) {
    const response = await fetch(`/api/applications${path}`, options);
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success) throw new Error(result.message || "The application registry is unavailable.");
    return result.data;
}

function time(value) {
    return value ? new Date(value).toLocaleString() : "—";
}

function Health({ value }) {
    return <span className={`status ${value || "unknown"}`}>{labels[value] || labels.unknown}</span>;
}

function App() {
    const [applications, setApplications] = useState([]);
    const [selected, setSelected] = useState("");
    const [detail, setDetail] = useState(null);
    const [detailError, setDetailError] = useState("");
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        let active = true;
        let timer;
        async function load() {
            try {
                const data = await api();
                if (active) {
                    setApplications(data);
                    setError("");
                }
            } catch (failure) {
                if (active) setError(failure.message);
            } finally {
                if (active) {
                    setLoading(false);
                    timer = setTimeout(load, 5000);
                }
            }
        }
        void load();
        return () => { active = false; clearTimeout(timer); };
    }, [refresh]);

    useEffect(() => {
        if (!selected) return;
        let active = true;
        let timer;
        async function load() {
            try {
                const data = await api(`/${selected}`);
                if (active) {
                    setDetail(data);
                    setDetailError("");
                }
            } catch (failure) {
                if (active) setDetailError(failure.message);
            } finally {
                if (active) timer = setTimeout(load, 5000);
            }
        }
        void load();
        return () => { active = false; clearTimeout(timer); };
    }, [selected]);

    async function register(event) {
        event.preventDefault();
        setSaving(true);
        setFormError("");
        try {
            const created = await api("", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            setApplications((items) => [created, ...items.filter((item) => item._id !== created._id)]);
            setDetail(created);
            setDetailError("");
            setSelected(created._id);
            setForm(initialForm);
            setRefresh((value) => value + 1);
        } catch (failure) {
            setFormError(failure.message);
        } finally {
            setSaving(false);
        }
    }

    const healthy = applications.filter((item) => item.healthStatus === "healthy").length;
    const unhealthy = applications.filter((item) => item.healthStatus === "unhealthy").length;
    const history = detail?.healthHistory || [];
    const observed = history.at(-1)?.version;
    function update(event) {
        setForm({ ...form, [event.target.name]: event.target.value });
    }

    return (
        <main>
            <header>
                <p className="brand">CloudForge</p>
                <h1>Application registry</h1>
                <p className="muted">Register services and track their health across environments.</p>
            </header>
            <dl className="metrics">
                <div><dt>Registered</dt><dd>{applications.length}</dd></div>
                <div><dt>Healthy</dt><dd>{healthy}</dd></div>
                <div><dt>Unhealthy</dt><dd>{unhealthy}</dd></div>
            </dl>
            <div className="layout">
                <section className="panel" aria-labelledby="apps">
                    <h2 id="apps">Applications</h2>
                    {loading && <p role="status">Loading applications…</p>}
                    {error && <p role="alert" className="error">{error} <button type="button" onClick={() => setRefresh((value) => value + 1)}>Retry</button></p>}
                    {!loading && !error && !applications.length && <p className="muted">No applications yet. Register the bundled demo service to see live health checks.</p>}
                    {!!applications.length && <ul className="registry">{applications.map((item) => (
                        <li key={item._id}>
                            <button type="button" aria-pressed={selected === item._id} onClick={() => {
                                if (selected !== item._id) {
                                    setDetail(null);
                                    setDetailError("");
                                    setSelected(item._id);
                                }
                            }}>
                                <span><strong>{item.name}</strong><small>{item.environment} · v{item.version}</small></span>
                                <Health value={item.healthStatus} />
                            </button>
                        </li>
                    ))}</ul>}
                </section>
                <section className="panel" aria-labelledby="register">
                    <h2 id="register">Register application</h2>
                    <form onSubmit={register}>
                        <label>Name<input name="name" value={form.name} onChange={update} placeholder="Demo service" maxLength={100} required /></label>
                        <label>Version<input name="version" value={form.version} onChange={update} maxLength={50} required /></label>
                        <label>Environment<select name="environment" value={form.environment} onChange={update}><option value="development">Development</option><option value="staging">Staging</option><option value="production">Production</option></select></label>
                        <label>Health check<select name="monitor" value={form.monitor} onChange={update}><option value="demo">Bundled demo service</option><option value="none">Disabled</option></select></label>
                        {formError && <p className="error" role="alert">{formError}</p>}
                        <button className="primary" disabled={saving}>{saving ? "Registering…" : "Register application"}</button>
                    </form>
                </section>
            </div>
            {selected && <section className="panel details" aria-labelledby="details">
                <h2 id="details">{detail ? detail.name : "Application details"}</h2>
                {detailError && <p className="error" role="alert">{detailError}</p>}
                {!detail && !detailError && <p role="status">Loading application details…</p>}
                {detail && <>
                    <dl className="facts">
                        <div><dt>Health</dt><dd><Health value={detail.healthStatus} /></dd></div>
                        <div><dt>Last check</dt><dd>{time(detail.lastCheckedAt)}</dd></div>
                        <div><dt>Registered version</dt><dd>{detail.version}</dd></div>
                        <div><dt>Observed version</dt><dd>{observed || "—"}</dd></div>
                        <div><dt>Deployment</dt><dd>{detail.deploymentStatus}</dd></div>
                    </dl>
                    <h3>Recent checks</h3>
                    {history.length ? <ol className="history">{[...history].reverse().map((entry) => (
                        <li key={entry.checkedAt}><Health value={entry.status} /><span>{time(entry.checkedAt)}</span>{entry.version && <span>v{entry.version}</span>}</li>
                    ))}</ol> : <p className="muted">{detail.monitor === "demo" ? "Waiting for the first health check." : "Health checks are disabled for this application."}</p>}
                </>}
            </section>}
        </main>
    );
}

export default App;
