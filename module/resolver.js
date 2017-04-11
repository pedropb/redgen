var redgen = require('./redgen.js');

//cache
var statuses;
var trackers;
var priorities;
var users;

var getStatusNameById = function(id){
  statuses = statuses || redgen.getStatuses().issue_statuses;
  for(var i = 0; i < statuses.length; i++){
    if(id == statuses[i].id)
      return statuses[i].name;
  }

  throw '\''+ id +'\' is no valid status id.';
}

var getTrackerNameById = function(id){
  trackers = trackers || redgen.getTrackers().trackers;
  for(var i = 0; i < trackers.length; i++){
    if(id == trackers[i].id)
      return trackers[i].name;
  }

  throw '\''+ id +'\' is no valid tracker id.';
}

var getPriorityNameById = function(id){
  priorities = priorities || redgen.getPriorities().issue_priorities;
  for(var i = 0; i < priorities.length; i++){
    if(id == priorities[i].id)
      return priorities[i].name;
  }

  throw '\''+ id +'\' is no valid priority id.';
}

var getAssigneeNameById = function(id){
  users = users || redgen.getUsers().users;
  for(var i = 0; i < users.length; i++){
    if(id == users[i].id)
      return users[i].firstname + ' ' + users[i].lastname;
  }

  throw '\''+ id +'\' is no valid assignee id.';
}
