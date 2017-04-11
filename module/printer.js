var tmpl = require('./template-engine.js');

exports.printSuccessfullyConnected = function(url, user){
  console.log('Successfully connected \'' + user.login + '\' to \'' + url + '\'.');
}

exports.printProjects = function(projects){
  var out = tmpl.renderFile('template/projects.tmpl', projects);
  console.log(out);
}
