Package.describe({
  name: 'panter:postch',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Post CH oauth workflow',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.use('oauth2', ['client', 'server']);
  api.use('oauth', ['client', 'server']);
  api.use('http', ['server']);
  api.use('underscore', 'client');
  api.use('templating', 'client');
  api.use('random', 'client');
  api.use('service-configuration', ['client', 'server']);

  api.export('Postch');

  api.addFiles(
    ['postch_configure.html', 'postch_configure.js'],
    'client');

  api.addFiles('postch_server.js', 'server');
  api.addFiles('postch_client.js', 'client');
});
