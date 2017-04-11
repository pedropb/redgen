var program = require('commander');
var actions = require('./module/actions.js');
var package = require('./package.json');

program
    .version(package.version);

program
    .command('connect <url> <apiKey>')
    .description('Connect to server using API key for authentication.')
    .action(actions.handleConnect);

program
    .command('projects')
    .description('Display projects.')
    .action(actions.handleProjects);

program
    .command('import <file_path> <model>')
    .description('Import the model file into redgen for usage.')
    .option('-f, --force', 'Overwrite the model if it exists.')
    .option('-e, --encoding', 'Sets the file encoding (default: utf8).')
    .action(actions.handleImportModel);

program
    .command('remove <model>')
    .description('Remove the model from redgen.')
    .action(actions.handleRemoveModel);

program
    .command('list')
    .description('List all models available in redgen.')
    .action(actions.handleListModels);

program
    .command('create-issues <project> <model>')
    .description('Generate a set of subtasks using a predefined model. You can set the options to override the model globals')
    .option('-P, --priority <priority>', 'Create with priority.')
    .option('-p, --parent <parentIssueId>', 'Create with parent task id.')
    .option('-e, --estimated <estimatedHours>', 'Create with estimated hours.')
    .option('-a, --assignee <userId>', 'Create with assignee.')
    .option('-s, --status <status>', 'Create with status.')
    .option('-t, --tracker <tracker>', 'Create with tracker.')
    .option('-d, --description <description>', 'Create with description.')
    .option('-k, --key_values <key>=<value>', 'Create replacing variables on the template.',
        function(val, memo) {
            key_value = val.split("=");
            memo.push({ key: key_value[0], value: key_value[1] });
            return memo;
        }, [])
    .action(actions.handleCreateIssues).on('--help', function() {
        console.log('  Usage example:');
        console.log('    $ redmine generate-issues 15 sample --parent 371');
        console.log('        This command would create 3 subtaks for issue 371 at project 15 using model "sample".');
        console.log();
        console.log('    model "sample":');
        console.log('    {');
        console.log('      // all properties are optional');
        console.log('      // available properties are:');
        console.log('      //       assignee, description, estimated, parent, priority, status, subject and tracker');
        console.log('      "globals": {');
        console.log('        "priority": "Normal,');
        console.log('        "estimate"": 1,');
        console.log('        "assignee": 15,');
        console.log('        "status": "New",');
        console.log('        "tracker": "Task"');
        console.log('      },');
        console.log('      "issues": [{');
        console.log('        "subject": "Peer review",');
        console.log('        "description": "Follow instructions on wiki and review the last commit on designated branch."');
        console.log('      },{');
        console.log('        "subject": "Run tests",');
        console.log('        "description": "Follow instructions on wiki and run tests on designated branch."');
        console.log('      },{');
        console.log('        "subject": "Notify developers",');
        console.log('        "description": "If errors were detected, create issues for developers, following the wiki template."');
        console.log('      }]');
        console.log('    }');
        console.log('');
        console.log('  Template variable replacement example:');
        console.log('    $ redmine generate-issues 15 sample -k wiki_page="Quem é que sobe"');
        console.log('        This command would use the "sample" template, while replacing any occurences of {{wiki_page}} with the value "Quem é que sobe".');
    });

program
    .parse(process.argv);

if (!program.args.length) program.help();