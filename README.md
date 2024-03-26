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
      PAGERDUTY_TOKEN: <INSERT_PAGERDUTY_TOKEN>
      SONARQUBE_HOST: <INSERT_SONARQUBE_HOST>
      SONARQUBE_TOkEN: <INSERT_SONARQUBE_TOKEN>
      DATADOG_HOST: <INSERT_DATADOG_HOST>
      DATADOG_APP_KEY: <INSERT_DATADOG_APP_KEY>
      DATADOG_API_KEY: <INSERT_DATADOG_API_KEY>
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
      PAGERDUTY_TOKEN: <INSERT_PAGERDUTY_TOKEN>
      SONARQUBE_HOST: <INSERT_SONARQUBE_HOST>
      SONARQUBE_TOkEN: <INSERT_SONARQUBE_TOKEN>
      DATADOG_HOST: <INSERT_DATADOG_HOST>
      DATADOG_APP_KEY: <INSERT_DATADOG_APP_KEY>
      DATADOG_API_KEY: <INSERT_DATADOG_API_KEY>
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
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: example-website
  annotations:
    pagerduty.com/service-id: <INSERT_PAGERDUTY_SERVICE_ID>
    sonarqube.org/project-key: <INSERT_SONARQUBE_PROJECT_KEY>
    datadoghq.com/service-id: <INSERT_DATADOG_SERVICE_ID>
spec:
  type: website
  lifecycle: experimental
  owner: guests
  system: examples
  providesApis: [example-grpc-api]
---
```

### 4. Restart your backstage instance

## Configure DataDog Checks

### 1. Setup DataDog Service Definition

1. Go to https://app.datadoghq.com/account/login
2. Sign in
3. Navigate to Service Mgmt > Service Catalog > Setup & Config
4. Click Create New Service Entry
5. Define your new service being sure to select a `Type`
6. Navigate to your new service
7. define a SLO making sure it includes the tag: `service:<YOUR_SERVICE_NAME>` replacing `<YOUR_SERVICE_NAME` with the name of the service your defined in step 5
8. Navigate to Organizational Settings > API Keys, and create a new key if none exists
9. Navigate to Organizational Settings > Application Keys, and create a new key if none exists
10. set the scope of the application key to include the following

- apm_service_catalog_read
- slos_read

### 2. Update docker-compose.yml

Update the following values:

- `<INSERT_DATADOG_HOST>`: this value will depend on the region you created your account in, for eu `https://api.datadoghq.eu`
- `<INSERT_DATADOG_APP_KEY>`: add your app key found under Organizational Settings > Application Keys
- `<INSERT_DATADOG_API_KEY>`: add your api key found under Organizational Settings > API Keys

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
      PAGERDUTY_TOKEN: <INSERT_PAGERDUTY_TOKEN>
      SONARQUBE_HOST: <INSERT_SONARQUBE_HOST>
      SONARQUBE_TOkEN: <INSERT_SONARQUBE_TOKEN>
      DATADOG_HOST: <INSERT_DATADOG_HOST>
      DATADOG_APP_KEY: <INSERT_DATADOG_APP_KEY>
      DATADOG_API_KEY: <INSERT_DATADOG_API_KEY>
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

Update value for `<INSERT_DATADOG_SERVICE_ID>` with the name of the service definition you created from step 1.

```yaml
---
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: example-website
  annotations:
    pagerduty.com/service-id: <INSERT_PAGERDUTY_SERVICE_ID>
    sonarqube.org/project-key: <INSERT_SONARQUBE_PROJECT_KEY>
    datadoghq.com/service-id: <INSERT_DATADOG_SERVICE_ID>
spec:
  type: website
  lifecycle: experimental
  owner: guests
  system: examples
  providesApis: [example-grpc-api]
---
```

### 4. Restart your backstage instance

## Configure SonarQube Checks

### 1. Setup SonarQube Project (SonarCloud)

1. Go to https://sonarcloud.io/login
2. Sign in
3. If you do not have a project, click the `+` icon to add a new one
4. Navigate to My Account > Security
5. Generate a new Token if you do not already have one
6. Navigate to your project and click the information tab
7. Add a tag prefixed with the project key i.e if the project key is `test-key` then a tag will take the value `test-key:test-tag`

### 2. Update docker-compose.yml

Update the following values:

- `<SONARQUBE_HOST>`: Add the host base url for sonarqube
- `<SONARQUBE_TOkEN>`: Add the token you generated in step 1

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
      PAGERDUTY_TOKEN: <INSERT_PAGERDUTY_TOKEN>
      SONARQUBE_HOST: <INSERT_SONARQUBE_HOST>
      SONARQUBE_TOkEN: <INSERT_SONARQUBE_TOKEN>
      DATADOG_HOST: <INSERT_DATADOG_HOST>
      DATADOG_APP_KEY: <INSERT_DATADOG_APP_KEY>
      DATADOG_API_KEY: <INSERT_DATADOG_API_KEY>
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

Update value for `<INSERT_SONARQUBE_PROJECT_KEY>` with the project key for the project created in step 1. This can be found by navigating to My Projects, selecting a project and then clicking to the Information tab.

```yaml
---
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: example-website
  annotations:
    pagerduty.com/service-id: <INSERT_PAGERDUTY_SERVICE_ID>
    sonarqube.org/project-key: <INSERT_SONARQUBE_PROJECT_KEY>
    datadoghq.com/service-id: <INSERT_DATADOG_SERVICE_ID>
spec:
  type: website
  lifecycle: experimental
  owner: guests
  system: examples
  providesApis: [example-grpc-api]
---
```

### 4. Update soundcheck/checks.yaml

Update the value for `<TAG_PREFIXED_WITH_PROJECT_KEY>` with the tag created in step 1.

```yaml
- id: has_project_tags
  rule:
    factRef: sonarqube:default/project-tags
    path: $.tags
    operator: contains
    value: <TAG_PREFIXED_WITH_PROJECT_KEY>
```

### 5. Restart your backstage instance

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
    pagerduty:
      $include: ./soundcheck/pagerduty-fact-collector.yaml
    datadog:
      $include: ./soundcheck/datadog-fact-collector.yaml
    sonarqube:
      $include: ./soundcheck/sonarqube-fact-collector.yaml
```
