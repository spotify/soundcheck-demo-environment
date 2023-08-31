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
[Contact sales](https://backstage.spotify.com/contact-us/pricing/)

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

## Running locally
To run this repo just run the following command from the root folder:

```bash
make start
```
