import { useEffect, useState } from "react";
import axios from "axios";

function App() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:5000/api/applications"
                );

                setApplications(response.data.data);
            } catch (error) {
                console.error(error);
                setError("Failed to load applications");
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    if (loading) {
        return <h1>Loading...</h1>;
    }

    if (error) {
        return <h1>{error}</h1>;
    }

    return (
        <div>
            <h1>CloudForge Dashboard</h1>

            {applications.map((application) => (
                <div key={application._id}>
                    <h2>{application.name}</h2>

                    <p>Version: {application.version}</p>
                    <p>Environment: {application.environment}</p>
                    <p>Status: {application.status}</p>
                    <p>
                        Deployment: {application.deploymentStatus}
                    </p>
                    <p>
                        Health: {application.healthStatus}
                    </p>
                </div>
            ))}
        </div>
    );
}

export default App;