# [Backstage](https://backstage.io)

## Getting started with this Repo

### 1. Obtain a GH Access Token

Create your Personal Access Token by opening the [GitHub token creation page](https://github.com/settings/tokens/new). Use a name to identify this token and put it in the notes field. Choose a number of days for expiration. If you have a hard time picking a number, we suggest to go for 7 days, it's a lucky number.

![Screenshot of the Backstage Entity registration screen, asking for a URL to a yaml file in a repo](https://backstage-spotify-com.spotifycdn.com/_next/static/media/pat-1.4b167751.png)

Set the scope to your likings. For this tutorial, selecting repo and workflow is required as Software Templates in this guide configures a GitHub actions workflow for the newly created project.

![Screenshot of the Backstage Entity registration screen, asking for a URL to a yaml file in a repo](https://github.com/joecombopiano/soundcheck-demo-environment/assets/4485262/b15d942d-e616-4a65-9058-dc75e50df375)

Click `Generate Token`. If successfull, your token will appear on a new page. Don't forget to copy the Personal Access Token and keep it in a safe place.

> Backstage can also use GitHub Apps instead of a personal access token. This is slightly harder to set up, but it does allow higher rate limits for the GitHub API. You can find these instructions [in the documentation](https://backstage.io/docs/integrations/github/github-apps#docsNav).

### 2. Obtain a Spotify Bundle for Backstage Demo License Key

[Contact sales](https://backstage.spotify.com/contact-us/pricing/) to obtain a demo license key. This will only be valid for **2 weeks**.

### 3. Update the `docker-compose.yaml` with the new configuration values

Update values for `<INSERT_GITHUB_TOKEN>` AND `<INSERT_LICENSE_KEY>` with the respective values from steps 1 and 2.

```
version: '3'
services:
  backstage:
    image: backstage
    environment:
      POSTGRES_HOST: db
      POSTGRES_USER: postgres
      # Add your token here
      GITHUB_TOKEN: <INSERT_GITHUB_TOKEN>
      SPOTIFY_PLUGIN_LICENSE: <INSERT_LICENSE_KEY>
      PAGERDUTY_TOKEN: <INSERT_PAGERDUTY_USER_TOKEN>
    ports:
      - '7007:7007'
    volumes:
      - ./soundcheck:/app/soundcheck
      - ./examples/:/app/examples
  db:
    image: postgres
    restart: always
    environment:
      POSTGRES_HOST_AUTH_METHOD: trust
```

## 4. Run it!

To run this repo just run the following command from the root folder:

```bash
make start
```

This will give you a backstage instance with Soundcheck installed and some sample tracks/checks in place. Import a service of your own to the product catalog and then go to the component view to see it in action.

The backstage demo environment will be running at `http://localhost:7007`

## SonarQube Checks

The docker-compose file will stand up a local SonarQube server and bootstrap it with a test project with the following properties:

```
project name: test-project
project key: test-project-key
```

The local SonarQube server can be accessed on `localhost:9000` by using the username `admin` and password `admin123` to login.

SoundCheck checks have been configured to run against the `example website` entity which has been configured with the SonarQube annotation with a value that matches the SonarQube project key.

## Configure PagerDuty Checks

### 1. Setup pager duty service

1. Go to https://www.pagerduty.com/
2. Sign in
3. Navigate to My Profile > User Settings
4. Create an API User Token (if you dont already have one)
5. Navigate to Services
6. Create a new service
7. Navigate to your service and copy the service id from the url

```
url will look simlar to below
https://www.pagerduty.com/service-directory/ABC1DE2
service id is the last part of the url > ABC1DE2
```

### 2. Update docker-compose.yml

Update value for `<INSERT_PAGERDUTY_USER_TOKEN>` with the API User Token value from step 1.

```yaml
version: '3'
services:
  backstage:
    image: backstage
    environment:
      POSTGRES_HOST: db
      POSTGRES_USER: postgres
      # Add your token here
      GITHUB_TOKEN: <INSERT_GITHUB_TOKEN>
      SPOTIFY_PLUGIN_LICENSE: <INSERT_LICENSE_KEY>
      PAGERDUTY_TOKEN: <INSERT_PAGERDUTY_USER_TOKEN>
    ports:
      - '7007:7007'
    volumes:
      - ./soundcheck:/app/soundcheck
      - ./examples/:/app/examples
  db:
    image: postgres
    restart: always
    environment:
      POSTGRES_HOST_AUTH_METHOD: trust
```

### 3. Update examples/entities.yaml

Update value for `<INSERT_PAGERDUTY_SERVICE_ID>` with the service id value from step 1.

```yaml
---
# https://backstage.io/docs/features/software-catalog/descriptor-format#kind-component
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: example-website
  annotations:
    pagerduty.com/service-id: <INSERT_PAGERDUTY_SERVICE_ID>
spec:
  type: website
  lifecycle: experimental
  owner: guests
  system: examples
  providesApis: [example-grpc-api]
---
```

### 4. Restart your backstage instance

## Adding Github Authentication (optional)

If you want to create your own Soundcheck tracks using the No-code UI, you'll need to update this demo to include github authenication. You can skip this step if you are just going to use the yaml version.

### 1. Go to [https://github.com/settings/applications/new](https://github.com/settings/applications/new) to create your OAuth App.

- `Homepage URL` should point to Backstage's
  frontend, in our demo it would be `http://localhost:7007`
- `Authorization callback URL` should point to the auth backend, `http://localhost:7007/api/auth/github/handler/frame`

![image](https://github.com/joecombopiano/soundcheck-demo-environment/assets/4485262/6ec2f8e5-16c2-4f17-8122-ad86edb2bb8f)

Generate a new `Client Secret` and take a note of the `Client ID` and the `Client Secret`.

### 2.Add the credentials to the configuration

Open `app-config.yaml` add the below configuration and replace the values with the `Client ID` and the `Client Secret` from GitHub.

```yaml
auth:
  # see https://backstage.io/docs/auth/ to learn about auth providers
  environment: development
  providers:
    github:
      development:
        clientId: YOUR CLIENT ID
        clientSecret: YOUR CLIENT SECRET
```

### 3. Add GH authentication to the Backstage UI

Go to `App.tsx` and uncomment the block comments labeled `Uncomment for auth`

### 4. Restart your backstage instance

## Where the Soundcheck logic lives

The YAML configured Soundcheck logic lives within the `app-config.yaml` file here. This is a good starting point to be able to reference each of the defined files that soundcheck uses.

```
soundcheck:
  programs:
    $include: ./soundcheck/tracks.yaml
  checks:
    $include: ./soundcheck/checks.yaml
  collectors:
    github:
      $include: ./soundcheck/github-fact-collector.yaml
    scm:
      $include: ./soundcheck/scm-fact-collector.yaml
    branch:
      $include: ./soundcheck/branch-fact-collector.yaml
```
