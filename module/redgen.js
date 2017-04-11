
var nconf = require('nconf');
var resolver = require('./resolver.js');
var fs = require('fs');
var pth = require('path');

nconf.file(__dirname + '/../config.json');

var throwWhenNotConnected = function() {
    if (!nconf.get('serverUrl') || !nconf.get('apiKey'))
        throw 'Not connected.'
}

exports.connect = function(serverUrl, apiKey) {
    var response = get('/users/current.json', serverUrl, apiKey);

    var user;
    try {
        user = JSON.parse(response.getBody('utf8'));
        if (user.user)
            user = user.user;
        else
            throw 'Invalid result';
    } catch (err) { throw 'Connection to \'' + serverUrl + '\' failed.' };

    nconf.set('serverUrl', serverUrl);
    nconf.set('apiKey', apiKey);
    nconf.save();

    return user;
}

exports.getProjects = function() {
    throwWhenNotConnected();

    var response = get('/projects.json');
    try {
        return JSON.parse(response.getBody('utf8'));
    } catch (err) { throw 'Could not load projects.' }
}

exports.importModel = function(filePath, model, options) {
    try {
        var modelPath = pth.join(__dirname, '..', 'issues-models', model + '.json');

        if (fs.existsSync(modelPath) && !options.force)
            throw 'Model exists. Remove it first or use --force.'

        var encoding = "utf8";
        if (options.encoding) encoding = options.encoding;

        var modelData = fs.readFileSync(filePath, encoding);
        var fd = fs.openSync(modelPath, "wx");
        fs.writeSync(fd, modelData, 0, encoding);
        return true;
    } catch (err) { throw 'Could not import model:\n' + err }
}

exports.removeModel = function(model) {
    try {
        var modelPath = pth.join(__dirname, '..', 'issues-models', model + '.json');
        if (!fs.existsSync(modelPath))
            throw 'Model not found.'

        fs.unlinkSync(modelPath);
        return true;
    } catch (err) { throw 'Could not remove model:\n' + err }
}

exports.listModels = function() {
    try {
        var issuesModelPath = pth.join(__dirname, '..', 'issues-models');
        var models = fs.readdirSync(issuesModelPath);
        var result = [];
        for (var m in models)
            result.push(models[m].replace('.json', ''));

        return result;

    } catch (err) { throw 'Could not list models:\n' + err }
}

var parseModel = function(model, variables) {
    try {
        // loading model JSON
        var filePath = pth.join(__dirname, '..', 'issues-models', model + '.json');
        var fileContent = fs.readFileSync(filePath, 'utf8');

        // pre-processing the template using RegExp for variables replacing

        for (var i in variables) {
            // escaping RegExp
            var key = variables[i].key.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

            // escaping JSON
            var value = variables[i].value
                .replace(/[\\]/g, '\\\\')
                .replace(/[\"]/g, '\\\"')
                .replace(/[\/]/g, '\\/')
                .replace(/[\b]/g, '\\b')
                .replace(/[\f]/g, '\\f')
                .replace(/[\n]/g, '\\n')
                .replace(/[\r]/g, '\\r')
                .replace(/[\t]/g, '\\t');

            // replacing variable values in the template
            fileContent = fileContent.replace(new RegExp("{{" + key + "}}", "gi"), value);
        }

        // check if there are more variables in the template 
        // that weren't provided
        var missingVars = fileContent.match(/{{\w+}}/gi);
        if (missingVars && missingVars.length > 0) {
            throw 'Expected values for: ' + Array.from(new Set(missingVars)).join(', ');
        }

        var modelObject = JSON.parse(fileContent);

        // model pre-validation
        if (!modelObject)
            throw 'Invalid JSON';

        if (modelObject.issues instanceof Array == false)
            throw 'Expected property `issues` (Array) on model';

        if (modelObject.issues.length == 0)
            throw 'Expected property `issues` (Array) containing at least 1 element on model';

        if (typeof(modelObject.issues[0]) != "object")
            throw 'Invalid property `issues` (Array<' + typeof(modelObject.issues[0]) + '>) on model. Expected Array<object>.';

        if (typeof(modelObject.globals) != "object")
            throw 'Invalid property `globals` (' + typeof(modelObject.globals) + ') on model. Expected object.';

        // parsing globals
        for (var p in modelObject.globals) {
            for (var i in modelObject.issues) {
                modelObject.issues[i][p] = modelObject.globals[p];
            }
        }

        // model post-validation
        for (var i in modelObject.issues) {
            if (typeof(modelObject.issues[i].subject) != "string" || modelObject.issues[i].subject.length == 0)
                throw 'Expected property `subject` in all issues'
        }


        return modelObject.issues;
    } catch (err) { throw 'Could not parse the model:\n' + err }
}


//TODO: rollback in case of error (delete issues that were created)
exports.createIssues = function(project, model, options) {
    throwWhenNotConnected();

    var successIds = []

    try {
        // processing the model,  replacing variables defined by the option -k
        var issuesModel = parseModel(model, options.key_values);
        for (var i in issuesModel) {

            // translating issuesModel properties to redmine API
            var issue = { issue: { 'project_id': project, 'subject': issuesModel[i].subject } };

            // setting model properties
            if (issuesModel[i].priority)
                issue.issue.priority_id = getStatusIdByName(issuesModel[i].priority);
            if (issuesModel[i].assignee)
                issue.issue.assigned_to_id = issuesModel[i].assignee;
            if (issuesModel[i].parent)
                issue.issue.parent_issue_id = issuesModel[i].parent;
            if (issuesModel[i].estimated)
                issue.issue.estimated_hours = issuesModel[i].estimated;
            if (issuesModel[i].status)
                issue.issue.status_id = getStatusIdByName(issuesModel[i].status);
            if (issuesModel[i].tracker)
                issue.issue.tracker_id = getTrackerIdByName(issuesModel[i].tracker);
            if (issuesModel[i].description)
                issue.issue.description = issuesModel[i].description;

            // overriding issuesModel options with command line options
            if (options.priority)
                issue.issue.priority_id = getStatusIdByName(options.priority);
            if (options.assignee)
                issue.issue.assigned_to_id = options.assignee;
            if (options.parent && typeof options.parent == 'string')
                issue.issue.parent_issue_id = options.parent;
            if (options.estimated)
                issue.issue.estimated_hours = options.estimated;
            if (options.status)
                issue.issue.status_id = getStatusIdByName(options.status);
            if (options.tracker)
                issue.issue.tracker_id = getTrackerIdByName(options.tracker);
            if (options.description && typeof options.description == 'string')
                issue.issue.description = options.description;
            if (options.subject)
                issue.issue.subject = options.subject;

            // creating issues
            var response = post('/issues.json', issue);
            if (response.statusCode == 404) {
                throw 'Server responded with statuscode 404.\n' +
                    'This is most likely the case when the specified project does not exist.\n' +
                    'Does project \'' + project + '\' exist?';
            } else if (response.statusCode != 201) {
                throw 'Server responded with statuscode ' + response.statusCode + '\n' +
                    'Model with error:\n' + JSON.stringify(issuesModel[i]);
            }

            var issue = JSON.parse(response.getBody('utf8'));
            successIds.push(issue.issue.id);
        }

        if (successIds.length != issuesModel.length) {
            throw 'Some issues could not be created';
        }

        return successIds;
    } catch (err) {
        if (successIds.length > 0) {
            throw 'Could not create all issues. Issues created: ' + successIds.join(', ') + '. Error:\n' + err
        } else {
            throw 'Could not create any issue:\n' + err
        }
    }
}