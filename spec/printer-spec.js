describe('printer.js', function() {
  var rewire = require("rewire");
  var printer = rewire("../module/printer.js");

  var tmpl = printer.__get__('tmpl');

  it("should print successfully connected", function() {
    var user = {login: 'login'};

    spyOn(console, 'log');

    printer.printSuccessfullyConnected('url', user)

    expect(console.log).toHaveBeenCalledWith('Successfully connected \'login\' to \'url\'.');
  });

  it("should print projects", function() {
    var projects = {projects: []};
    var out = 'output';

    spyOn(tmpl, 'renderFile').andReturn(out);
    spyOn(console, 'log');

    printer.printProjects(projects);

    expect(tmpl.renderFile).toHaveBeenCalledWith('template/projects.tmpl', projects);
    expect(console.log).toHaveBeenCalledWith(out);
  });
});
