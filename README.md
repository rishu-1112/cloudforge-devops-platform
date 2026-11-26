# CloudForge

CloudForge is an application registry with a React dashboard, an Express API, and MongoDB. Its bundled service demonstrates how a dashboard reports deployment versions, outages, and recovery.

## Start the demo

With Docker and Compose installed, run:

```sh
docker compose up --build --detach --wait
```

Open <http://localhost:8090>. Register an application named **Demo service**, leave the version at **1.0.0**, and select **Bundled demo service** as its health check. Open its details to see its registered and observed versions, last check, and up to 12 recent results.

Stop the demo service and watch the registry mark it unhealthy. Restart it and watch health recover. The backend checks every five seconds and the dashboard refreshes every five seconds.

```sh
docker compose stop demo
docker compose start demo
```

MongoDB data persists in a Compose volume. Run `docker compose down` when you are done. Change `CLOUDFORGE_PORT` before starting if 8090 is occupied.

## Verify and deploy

GitHub Actions brings up the Compose stack, registers the service through the API, and checks that stopping and restarting it produces the expected health transitions. Successful builds on `main` publish frontend and backend images to GitHub Container Registry, tagged by commit SHA.

To deploy a tested revision on a Docker host, check out that revision, authenticate to GHCR if required, and replace `COMMIT_SHA` with the full commit SHA:

```sh
export BACKEND_IMAGE=ghcr.io/rishu-1112/cloudforge-devops-platform/backend:COMMIT_SHA
export FRONTEND_IMAGE=ghcr.io/rishu-1112/cloudforge-devops-platform/frontend:COMMIT_SHA
docker compose pull
docker compose up --no-build --detach --wait
```

Keep the registry on localhost or behind an authenticated gateway when sharing it. The demo allows registration without sign-in. Health checks target the bundled service configured by the operator.
