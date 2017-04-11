describe('resolver.js', function() {
  var rewire = require("rewire");
  var resolver = rewire("../module/resolver.js");

  var redgen = resolver.__get__('redgen');

  it("should throw for invalid status id", function() {
    var getStatusNameById = resolver.__get__('getStatusNameById');
    resolver.__set__('statuses', {issue_statuses: []});

    expect(getStatusNameById.bind(this, 1)).toThrow('\'1\' is no valid status id.');
  });

  it("should throw for invalid tracker id", function() {
    var getTrackerNameById = resolver.__get__('getTrackerNameById');
    resolver.__set__('trackers', {trackers: []});

    expect(getTrackerNameById.bind(this, 1)).toThrow('\'1\' is no valid tracker id.');
  });

  it("should throw for invalid priority id", function() {
    var getPriorityNameById = resolver.__get__('getPriorityNameById');
    resolver.__set__('priorities', {issue_priorities: []});

    expect(getPriorityNameById.bind(this, 1)).toThrow('\'1\' is no valid priority id.');
  });

  it("should throw for invalid assignee id", function() {
    var getAssigneeNameById = resolver.__get__('getAssigneeNameById');
    resolver.__set__('users', {users: []});

    expect(getAssigneeNameById.bind(this, 1)).toThrow('\'1\' is no valid assignee id.');
  });

});
