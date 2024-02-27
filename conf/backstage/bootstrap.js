var admin_username = process.env.SONARQUBE_ADMIN_USERNAME;
var admin_password = process.env.SONARQUBE_ADMIN_PASSWORD;
var base_url = `http://${process.env.SONARQUBE_HOST}:${process.env.SONARQUBE_PORT}`;

fetch(
  `${base_url}/api/users/change_password?login=${admin_username}&previousPassword=admin&password=${admin_password}`,
  {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' + Buffer.from(`${admin_username}:admin`).toString('base64'),
    },
  },
).then(function (_) {
  fetch(
    `${base_url}/api/projects/create?project=test-project&name=test-project-key&mainBranch=main`,
    {
      method: 'POST',
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(`${admin_username}:${admin_password}`).toString('base64'),
      },
    },
  );
});
