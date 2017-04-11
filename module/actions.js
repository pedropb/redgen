var redgen = require('../module/redgen.js');
var printer = require('../module/printer.js');

exports.handleConnect = function(url, apiKey){
  try{
    var user = redmine.connect(url, apiKey);
    printer.printSuccessfullyConnected(url, user);
  } catch(err){console.error(err)}
}

exports.handleProjects = function(){
  try{
    var projects = redmine.getProjects();
    printer.printProjects(projects);
  } catch(err){console.error(err)}
}

exports.handleImportModel = function (file_path, model, options){
  try {
    redmine.importModel(file_path, model, options);

    console.log('Model successfully imported: ' + model);
  } catch(err){console.error(err)}
}

exports.handleRemoveModel = function (model){
  try {
    redmine.removeModel(model);
    console.log('Model successfully removed: ' + model);
  } catch(err){console.error(err)}
}

exports.handleListModels = function (){
  try {
    var models = redmine.listModels();
    console.log(models.join("\n"));
  } catch(err){console.error(err)}
}

exports.handleCreateIssues = function(project, model, options){
  try{
    var issues = redmine.generateIssues(project, model, options);
    console.log('Successfully generated issues ' + issues.join(', '));
  } catch(err){console.error(err)}
}