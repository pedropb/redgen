describe('actions.js', function() {
  var rewire = require("rewire");
  var actions = rewire("../module/actions.js");

  var redgen = actions.__get__('redgen');
  var printer = actions.__get__('printer');
  var filter = actions.__get__('filter');

  it("should handle connect", function() {
    var user = {user: 'name'};

    spyOn(redgen, 'connect').andReturn(user);
    spyOn(printer, 'printSuccessfullyConnected');

    actions.handleConnect('url', 'apiKey');

    expect(redgen.connect).toHaveBeenCalledWith('url', 'apiKey');
    expect(printer.printSuccessfullyConnected).toHaveBeenCalledWith('url', user);
  });

  it("should handle connect and catch error", function() {
    spyOn(redgen, 'connect').andThrow('error');
    spyOn(console, 'error');

    actions.handleConnect();

    expect(console.error).toHaveBeenCalledWith('error');
  });

  it("should handle projects", function() {
    var projects = {projects: []};

    spyOn(redgen, 'getProjects').andReturn(projects);
    spyOn(printer, 'printProjects');

    actions.handleProjects();

    expect(redgen.getProjects).toHaveBeenCalled();
    expect(printer.printProjects).toHaveBeenCalledWith(projects);
  });

  it("should handle projects and catch error", function() {
    spyOn(redgen, 'getProjects').andThrow('error');
    spyOn(console, 'error');

    actions.handleProjects();

    expect(console.error).toHaveBeenCalledWith('error');
  });

  it("should handle import model", function() {
    var options = {options: []}; 

    spyOn(redgen, 'importModel').andReturn();
    spyOn(console, 'log');

    actions.handleImportModel("sample.json", "sample", options);

    expect(redgen.importModel).toHaveBeenCalledWith("sample.json", "sample", options);
    expect(console.log).toHaveBeenCalledWith('Model successfully imported: sample');
  });

  it("should handle import model and catch error", function() {
    spyOn(redgen, 'importModel').andThrow('error');
    spyOn(console, 'error');

    actions.handleImportModel();

    expect(console.error).toHaveBeenCalledWith('error');
  });

  it("should handle remove model", function() {
    spyOn(redgen, 'removeModel').andReturn();
    spyOn(console, 'log');

    actions.handleRemoveModel("sample");

    expect(redgen.removeModel).toHaveBeenCalledWith("sample");
    expect(console.log).toHaveBeenCalledWith('Model successfully removed: sample');
  });

  it("should handle remove model and catch error", function() {
    spyOn(redgen, 'removeModel').andThrow('error');
    spyOn(console, 'error');

    actions.handleRemoveModel();

    expect(console.error).toHaveBeenCalledWith('error');
  });

  it("should handle list models", function() {
    spyOn(redgen, 'listModels').andReturn(["sample"]);
    spyOn(console, 'log');

    actions.handleListModels();

    expect(redgen.listModels).toHaveBeenCalledWith();
    expect(console.log).toHaveBeenCalledWith('sample');
  });

  it("should handle list models and catch error", function() {
    spyOn(redgen, 'listModels').andThrow('error');
    spyOn(console, 'error');

    actions.handleListModels();

    expect(console.error).toHaveBeenCalledWith('error');
  });

  it("should handle create issues", function() {
    var options = {options:[]};
    var result = [1,2,3];

    spyOn(redgen, 'createIssues').andReturn(result);
    spyOn(console, 'log');

    actions.handleCreateIssues("project", "model", options);

    expect(redgen.createIssues).toHaveBeenCalledWith("project", "model", options);
    expect(console.log).toHaveBeenCalledWith('Successfully generated issues ' + result.join(", "));
  });

  it("should handle create issues and catch error", function() {
    spyOn(redgen, 'createIssues').andThrow('error');
    spyOn(console, 'error');

    actions.handleCreaateIssues();

    expect(console.error).toHaveBeenCalledWith('error');
  });

});
