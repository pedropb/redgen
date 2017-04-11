describe('redgen.js', function() {
  var rewire = require("rewire");
  var redgen = rewire("../module/redgen.js");

  it("should throw when not connected", function() {
    var nconf = redgen.__get__('nconf');
    spyOn(nconf, 'get').andReturn(null);

    var throwWhenNotConnected = redgen.__get__('throwWhenNotConnected');

    expect(throwWhenNotConnected).toThrow('Not connected.');
  });

  it("should get data from path", function() {
    var get = redgen.__get__('get');

    var request = function(){return 'data'};
    redgen.__set__('request', request);

    var actual = get('/path', 'url', 'apiKey');
    var expected = 'data';

    expect(actual).toEqual(expected);
  });

  it("should put data to path", function() {
    var put = redgen.__get__('put');

    var request = function(){return 'data'};
    redgen.__set__('request', request);

    var actual = put('/path', {data: 'data'});
    var expected = 'data';

    expect(actual).toEqual(expected);
  });

  it("should post data to path", function() {
    var post = redgen.__get__('post');

    var request = function(){return 'data'};
    redgen.__set__('request', request);

    var actual = post('/path', {data: 'data'});
    var expected = 'data';

    expect(actual).toEqual(expected);
  });

  it("should connect", function() {
    var user = {user: {}};
    var response = { getBody : function(){return JSON.stringify(user)}};
    redgen.__set__('get', function(){return response;});

    var nconf = redgen.__get__('nconf');
    spyOn(nconf, 'save');

    var actual = redgen.connect('url', 'apiKey');
    var expected = user.user;

    expect(actual).toEqual(expected);
    expect(nconf.save).toHaveBeenCalled();
  });

  it("should throw on invalid result", function() {
    var user = {invalid: {}};
    var response = { getBody : function(){return JSON.stringify(user)}};
    redgen.__set__('get', function(){return response;});

    expect(redgen.connect).toThrow();
  });

  it("should get projects", function() {
    var projects = {projects: []};
    var response = { getBody : function(){return JSON.stringify(projects)}};
    redgen.__set__('get', function(){return response;});

    var actual = redgen.getProjects();
    var expected = projects;

    expect(actual).toEqual(expected);
  });

  it("should list models", function() {
    var expected = "sample";
    var fs = redgen.__get__('fs');
    var pth = redgen.__get__('pth');
    spyOn(pth, 'join').andReturn("");
    spyOn(fs, 'readdirSync').andReturn([expected + ".json"]);
    
    var actual = redgen.listModels();

    expect(actual).toEqual([expected]);
  });

  it("should list models and return error", function() {
    var pth = redgen.__get__('pth');
    spyOn(pth, 'join').andReturn("/some/path");

    var fs = redgen.__get__('fs');
    spyOn(fs, 'readdirSync').andCallFake(function() {
      throw 'Folder issues-models not found.'
    });
    
    expect(redgen.listModels).toThrow('Could not list models:\nFolder issues-models not found.');
  });

  it("should import model", function() {
    var pth = redgen.__get__('pth');
    spyOn(pth, 'join').andReturn("/some/path");

    var fs = redgen.__get__('fs');
    spyOn(fs, 'existsSync').andReturn(false);
    spyOn(fs, 'readFileSync').andReturn();
    spyOn(fs, 'openSync').andReturn();
    spyOn(fs, 'writeSync').andReturn();
    
    var actual = redgen.importModel("", "", {encoding: "iso-8859-1"});

    expect(actual).toEqual(true);
  });

  it("should import model with force", function() {
    var pth = redgen.__get__('pth');
    spyOn(pth, 'join').andReturn("/some/path");

    var fs = redgen.__get__('fs');
    spyOn(fs, 'existsSync').andReturn(true);
    spyOn(fs, 'readFileSync').andReturn();
    spyOn(fs, 'openSync').andReturn();
    spyOn(fs, 'writeSync').andReturn();
    
    var actual = redgen.importModel("", "", {force: true});

    expect(actual).toEqual(true);
  });

  it("should import model and return error", function() {
    var pth = redgen.__get__('pth');
    spyOn(pth, 'join').andReturn("/some/path");

    var fs = redgen.__get__('fs');
    spyOn(fs, 'existsSync').andReturn(true);
    spyOn(fs, 'readFileSync').andReturn();
    spyOn(fs, 'openSync').andReturn();
    spyOn(fs, 'writeSync').andReturn();

    expect(function() {redgen.importModel("", "", {});}).toThrow("Could not import model:\nModel exists. Remove it first or use --force.");
  });

  it("should remove model", function() {
    var pth = redgen.__get__('pth');
    spyOn(pth, 'join').andReturn("/some/path");

    var fs = redgen.__get__('fs');
    spyOn(fs, 'existsSync').andReturn(true);
    spyOn(fs, 'unlinkSync').andReturn();
    
    var actual = redgen.removeModel("");

    expect(actual).toEqual(true);
  });

  it("should remove model and return error", function() {
    var pth = redgen.__get__('pth');
    spyOn(pth, 'join').andReturn("/some/path");

    var fs = redgen.__get__('fs');
    spyOn(fs, 'existsSync').andReturn(false);
    spyOn(fs, 'unlinkSync').andReturn();

    expect(redgen.removeModel).toThrow("Could not remove model:\nModel not found.");
  });

  it("should parse model", function() {
    var pth = redgen.__get__('pth');
    spyOn(pth, 'join').andReturn("/some/path");

    var fs = redgen.__get__('fs');
    spyOn(fs, 'readFileSync').andReturn("");

    spyOn(JSON, 'parse').andReturn({
      globals: {
        assignee: 1
      },
      issues: [{
        subject: "Test",
        description: "Test"
      },{
        subject: "Test",
        description: "Test"
      }] 
    });
    
    var actual = redgen.parseModel("");

    expect(actual).toEqual([{
      assignee: 1,
      subject: "Test",
      description: "Test"
    },{
      assignee: 1,
      subject: "Test",
      description: "Test"
    }]);
  });

  it("should parse model and return error Invalid JSON", function() {
    var pth = redgen.__get__('pth');
    spyOn(pth, 'join').andReturn("/some/path");

    var fs = redgen.__get__('fs');
    spyOn(fs, 'readFileSync').andReturn("");

    spyOn(JSON, 'parse').andReturn(null);

    expect(redgen.parseModel).toThrow('Could not parse the model:\nInvalid JSON');
  });

  it("should parse model and return error Expected property issues on model", function() {
    var pth = redgen.__get__('pth');
    spyOn(pth, 'join').andReturn("/some/path");

    var fs = redgen.__get__('fs');
    spyOn(fs, 'readFileSync').andReturn("");

    spyOn(JSON, 'parse').andReturn({
      globals: {
        assignee: 1
      } 
    });

    expect(redgen.parseModel).toThrow('Could not parse the model:\nExpected property `issues` (Array) on model');
  });

  it("should parse model and return error Expected property issues containing at least 1 item", function() {
    var pth = redgen.__get__('pth');
    spyOn(pth, 'join').andReturn("/some/path");

    var fs = redgen.__get__('fs');
    spyOn(fs, 'readFileSync').andReturn("");

    spyOn(JSON, 'parse').andReturn({
      globals: {
        assignee: 1
      },
      issues: []
    });

    expect(redgen.parseModel).toThrow('Could not parse the model:\nExpected property `issues` (Array) containing at least 1 element on model');
  });

  it("should parse model and return error Expected property issues of type Array<object>", function() {
    var pth = redgen.__get__('pth');
    spyOn(pth, 'join').andReturn("/some/path");

    var fs = redgen.__get__('fs');
    spyOn(fs, 'readFileSync').andReturn("");

    spyOn(JSON, 'parse').andReturn({
      globals: {
        assignee: 1
      },
      issues: ['error']
    });

    expect(redgen.parseModel).toThrow('Could not parse the model:\nInvalid property `issues` (Array<string>) on model. Expected Array<object>.');
  });

  it("should parse model and return error Expected property globals of type object", function() {
    var pth = redgen.__get__('pth');
    spyOn(pth, 'join').andReturn("/some/path");

    var fs = redgen.__get__('fs');
    spyOn(fs, 'readFileSync').andReturn("");

    spyOn(JSON, 'parse').andReturn({
      globals: '',
      issues: [{}]
    });

    expect(redgen.parseModel).toThrow('Could not parse the model:\nInvalid property `globals` (string) on model. Expected object.');
  });

  it("should parse model and return error Expected property subject in all issues", function() {
    var pth = redgen.__get__('pth');
    spyOn(pth, 'join').andReturn("/some/path");

    var fs = redgen.__get__('fs');
    spyOn(fs, 'readFileSync').andReturn("");

    spyOn(JSON, 'parse').andReturn({
      globals: {},
      issues: [{}]
    });

    expect(redgen.parseModel).toThrow('Could not parse the model:\nExpected property `subject` in all issues');
  });

  it("should create issues", function() {
    var issue = {issue:{id:1}};
    var post = jasmine.createSpy('post');
    post.andReturn({statusCode:201,
                    getBody: function(){return JSON.stringify(issue)}});
    redgen.__set__('post', post);

    var options = {
      priority: 'High', status: 'New', tracker: 'Bug',
      assignee: 1, description: 'Description',
      parent: '1', estimated: 1, subject: 'Subject'
    };
    var model = {
      globals: {
        priority: 'High', status: 'New', tracker: 'Bug',
        assignee: 1, description: 'Description',
        parent: 1, estimated: 1, subject: 'Subject'
      },
      issues: [{
        priority: 'High', status: 'New', tracker: 'Bug',
        assignee: 1, description: 'Description',
        parent: 1, estimated: 1, subject: 'Subject'
      }]
    }

    spyOn(redgen, 'getPriorityIdByName').andReturn(1);
    spyOn(redgen, 'getStatusIdByName').andReturn(1);
    spyOn(redgen, 'getTrackerIdByName').andReturn(1);
    spyOn(redgen, 'parseModel').andReturn(model.issues);

    var actual = redgen.createIssues('project', 'model', options);
    var expected = [issue.issue.id];

    expect(actual).toEqual(expected);
  });

  it("should create issues and return error 404", function() {
    var post = jasmine.createSpy('post');
    post.andReturn({statusCode:404});
    redgen.__set__('post', post);

    spyOn(redgen, 'parseModel').andReturn([{subject: ""}]);

    expect(redgen.createIssues.bind(this, "project", "model", {})).toThrow('Could not create any issue:\nServer responded with statuscode 404.\nThis is most likely the case when the specified project does not exist.\nDoes project \'project\' exist?');
  });

  it("should create issues and return error 500", function() {
    var post = jasmine.createSpy('post');
    post.andReturn({statusCode:500});
    redgen.__set__('post', post);

    issue = {subject: ""};
    spyOn(redgen, 'parseModel').andReturn([issue]);

    expect(redgen.createIssues.bind(this, "project", "model", {})).toThrow('Could not create any issue:\nServer responded with statuscode 500\nModel with error:\n' + JSON.stringify(issue));
  });

  it("should create issues and return error 404 with created issues", function() {
    var post = jasmine.createSpy('post');
    var first = true;
    post.andCallFake(function() {
      if (first) {
        first = false;
        return {
          statusCode: 201,
          getBody: function(){return JSON.stringify({issue:{id: 1}})}
        };
      }
      else
        return {statusCode:404};
    });
    redgen.__set__('post', post);

    issue = {subject: ""};
    spyOn(redgen, 'parseModel').andReturn([issue,issue]);

    expect(redgen.generateIssues.bind(this, "project", "model", {})).toThrow('Could not generate all issues. Issues created: 1. Error:\nServer responded with statuscode 404.\nThis is most likely the case when the specified project does not exist.\nDoes project \'project\' exist?');
  });

  describe('throws (on error in response)', function(){
    var redgen = rewire("../module/redgen.js")

    //before all
    var response = { getBody : function(){return undefined;}};
    redgen.__set__('get', function(){return response;});
    redgen.__set__('throwWhenNotConnected', function(){});

    it('could not connect', function(){
      expect(redgen.connect.bind(this, 'server'))
        .toThrow('Connection to \'server\' failed.');
    });

    it('could not load projects', function(){
      expect(redgen.getProjects).toThrow('Could not load projects.');
    });
  });
});
