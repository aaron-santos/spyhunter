function permutations(l) {
    // Empty list has one permutation
    if (l.length === 0) {
        return [
            []
        ];
    }
    var result = [];
    for (var i = 0; i < l.length; i++) {
        // Clone list (kind of)
        var copy = Object.create(l);
        // Cut one element from list
        var head = copy.splice(i, 1);
        // Permute rest of list
        var rest = permutations(copy);
        // Add head to each permutation of rest of list
        for (var j = 0; j < rest.length; j++) {
            var next = head.concat(rest[j]);
            result.push(next);
        }
    }
    return result;
}

function distinctSets(list) {
    var o = {};
    for (var i in list) {
        o[list[i]] = true;
    }
    var result = [];
    for (var j in o) {
        result.push(JSON.parse('[' + j + ']'));
    }
    return result;
}

function isSetPossible(set) {
    var match = false;
    for (var i in this) {
        if (this[i] === true && set [i] === true) {
            match = true;
        }
    }
    return match;
}

function main($, _) {
    console.log('starting...');
    var $namesList = $('#names-list');
    $namesList.sortable();
    $namesList.disableSelection();
    $namesList.bind('sortstop', function(event, ui) {
        $namesList.listview('refresh');
    });
    $('#add').listview();

    // Trigger add name button click on keyboard return in the add name input box.
    $('#add-name').keydown(function( event ) {
      if (event.which === 13) {
        $('#add-name-button').click();
      }
    });

    function storePlayerList() {
      // store updated players list
      if (window.localStorage) {
        var storage = window.localStorage;
        var names = jQuery.map($('#names-list').children(), function(li) {
            return $('a > h3', li).text();
        });
        console.log('storing: ' + names);
	storage.setItem('players', JSON.stringify(names));
      }
    }

    function addPlayer(name) {
      console.log('adding player...');
      console.log('with name=' + name);
      if (name !== '') {
          $('<li>')
              .append(
                  $('<a>')
                  .attr('href', '#')
                  .append(
                      $('<h3>')
                      .text(name)))
              .append(
                  $('<a>')
                  .attr('href', '#')
                  .text(' ')
                  .click(function() {
                      // navigate up to the <li> and remove it from the <ul>
                      $(this).parent().remove();
                      $namesList.listview('refresh');
		      storePlayerList();
                  }))
              .appendTo($('#names-list'));
          $namesList.listview('refresh');
          $('#add-name').val('');
      }
    }

    // Add any persisted players to the config page.
    if (window.localStorage) {
      var storage = window.localStorage;
      var storedPlayers = storage.getItem('players');
      if (storedPlayers !== null) {
        var players = JSON.parse(storedPlayers);
	for (var i in players) {
          var player = players[i];
	  addPlayer(player);
        }
      }
    }

    // Allow adding names
    $('#add-name-button').click(function() {
      var name = $('#add-name').val();
      addPlayer(name);
      storePlayerList();
    });

    // Populate analyze page
    $('#config-next-button').click(function(event) {
        var $tbody = $('#analyze-tbody');
        $tbody.children().remove();
        var names = jQuery.map($('#names-list').children(), function(li) {
            return $('a > h3', li).text();
        });
        console.log(names);

        if (names.length < 4) {
            event.preventDefault();
        }

        function addCheckbox($e, playerIdx, round) {
            var id = playerIdx + '-' + round;
            return $e
                .append(
                    $('<input>')
                    .attr('type', 'checkbox')
                    .attr('id', id)
                    .attr('name', 'checkbox-0')
                    .data('player', playerIdx)
                    .data('round', round))
                .append(
                    $('<label style="display:none">')
                    .attr('for', id));
        }

	function addSlider($e, name) {
          return $e.append(
                     $('<input type="range" class="slider">')
                     .attr('name', 'slider-' + name)
                     .attr('id', 'slider-' + name)
                     .attr('data-highlight', 'true')
                     .attr('data-mini', 'true')
                     .attr('value', '50')
                     .attr('min', '0')
                     .attr('max', '100'))
                   .append(
                     $('<label style="display:none">')
                     .attr('for', 'slider' + name));
        }

        for (var i in names) {
            var name = names[i];
            $('<tr>')
                .append(
                    $('<td>')
                    .text(name))
                .append(
                    addCheckbox($('<td>'), name))
                .append(
                    addCheckbox($('<td>'), name))
                .append(
                    addCheckbox($('<td>'), name))
                .append(
                    addCheckbox($('<td>'), name))
                .append(
                    addCheckbox($('<td>'), name))
                .append(
                    addCheckbox($('<td>'), name))
                .append(
                    addSlider($('<td>'), name))
                .append(
                    $('<td style="padding:0;">')
		      .append($('<div class="progressbar">')))
                .appendTo($tbody);
        }

	$('div.progressbar').progressbar({
		value: 50
	});
        $('input.slider').css('display', 'none');
    });

    function refreshAnalysis() {
      var initialSet;
      var names = jQuery.map($('#names-list').children(), function(li) {
          return $('a > h3', li).text();
      });
      console.log('analyzing with names=' + names);
      switch (names.length) {
          case 4:
              initialSet = [true, true, false, false];
              break;
          case 5:
              initialSet = [true, true, false, false, false];
              break;
          case 6:
              initialSet = [true, true, true, false, false, false];
              break;
          case 7:
              initialSet = [true, true, true, false, false, false, false];
              break;
          case 8:
              initialSet = [true, true, true, false, false, false, false, false];
              break;
          case 9:
              initialSet = [true, true, true, true, false,  false, false, false, false];
              break;
      }

      function count(collection, val) {
        var n = 0;
        _.each(collection, function(e) {
          if (e === val) {
            n++;
          }
        });
        return n;
      }

      var numMinions = count(initialSet, true);

      function multiMap(fn) {
        var args = Array.prototype.slice.call(arguments);
        var colls = _.rest(args);
        var maxIdx = _.min(_.map(colls, function(coll){return coll.length;}));
        var result = [];
        for (var i =0; i < maxIdx; i++) {
          var e = fn.apply(null, _.map(colls, function(coll){return coll[i];}));
          result.push(e);
        }
        return result;
      }
      
      function and() {
        var args = Array.prototype.slice.call(arguments);
        return _.reduce(args, function(memo, e) {return memo && e;}, true);
      } 
      
      function or() {
        var args = Array.prototype.slice.call(arguments);
        return _.reduce(args, function(memo, e) {return memo || e;}, false);
      } 


      console.log(initialSet);
      var applicableSets = distinctSets(permutations(initialSet));
      console.log('initial possibilities');
      console.log(applicableSets);

      var $analyzeTBody = $('#analyze-tbody');
      var merlinResults = $analyzeTBody.children('tr').map(function(idx, e) {
          return $($(e).find('input')[0]).is(':checked');
      });
      var minionResults = $analyzeTBody.children('tr').map(function(idx, e) {
          return $($(e).find('input')[1]).is(':checked');
      });
      var passed1Results = $analyzeTBody.children('tr').map(function(idx, e) {
          return $($(e).find('input')[2]).is(':checked');
      });
      var passed2Results = $analyzeTBody.children('tr').map(function(idx, e) {
          return $($(e).find('input')[3]).is(':checked');
      });
      var failed1Results = $analyzeTBody.children('tr').map(function(idx, e) {
          return $($(e).find('input')[4]).is(':checked');
      });
      var failed2Results = $analyzeTBody.children('tr').map(function(idx, e) {
          return $($(e).find('input')[5]).is(':checked');
      });

      if (_.filter(merlinResults, function(e) {return e === true;}).length === 1) {
          applicableSets = _.filter(applicableSets, function(set) {
            return _.some(_.map(merlinResults, function(e, idx) {
              return e === true && set[idx] === false;
            }));
          });
      }
      else if (_.filter(merlinResults, function(e) {return e === true;}).length === 2) {
          applicableSets = _.filter(applicableSets, function(set) {
            var merlin1 = set[_.indexOf(merlinResults, true)];
            var merlin2 = set[_.lastIndexOf(merlinResults, true)];
            return merlin1 && !merlin2 || merlin2 && !merlin1;
          });
      }
      console.log('possibilities after percival cull');
      console.log(applicableSets);
      if (_.some(minionResults)) {
          applicableSets = _.filter(applicableSets, function(set) {
            return count(multiMap(and, set, minionResults), true) === count(minionResults, true);
          });
      }
      console.log('possibilities after minion cull');
      console.log(applicableSets);
      if (_.contains(failed1Results, true)) {
          applicableSets = _.filter(applicableSets, isSetPossible, failed1Results);
      }
      console.log('possibilities after first cull');
      console.log(applicableSets);
      if (_.contains(failed2Results, true)) {
          applicableSets = _.filter(applicableSets, isSetPossible, failed2Results);
      }
      console.log('possibilities after second cull');
      console.log(applicableSets);

      var initialGoodness = _.map(initialSet, function(e) {return 0;});
      var goodnessVal = parseFloat($('#goodness-val').val());
      // Add goodness to each player on the passed mission.
      if(_.contains(passed1Results, true)) {
        initialGoodness = _.map(initialGoodness, function(e, idx) {
          if (passed1Results[idx] === true) {
            return e + goodnessVal;
          } else {
            return e;
          }
        });
      }

      if(_.contains(passed2Results, true)) {
        initialGoodness = _.map(initialGoodness, function(e, idx) {
          if (passed2Results[idx] === true) {
            return e + goodnessVal;
          } else {
            return e;
          }
        });
      }

      // Refresh probabilities
      var initialProbabilities = _.map(initialSet, function(e) {return 0;});
      var relativeProbabilities = _.reduce(applicableSets, function(memo, set) {
        return _.map(set, function(v, k){
          return v + memo[k];
        });
      }, initialProbabilities);

      var absoluteProbabilities = _.map(relativeProbabilities, function(prob) {
        return prob/applicableSets.length;
      });
      $('div.progressbar').map(function(idx, e) {
        $(e).progressbar({
          value: 100 * absoluteProbabilities[idx]
        });
      });

      function badness(set) {
        var badnessValues = _.map(set, function(e, idx){
          if (set[idx] === true) {
            return Math.max(absoluteProbabilities[idx] - initialGoodness[idx], 0);
          } else {
            return 0;
          }
        });
        return _.reduce(badnessValues, function(memo, num){return memo + num;}, 0);
      }

      // Build results list
      var namedApplicableSets = _.map(applicableSets, function(set) {
        // Extract names of minions only
        var namedSet = _.filter(_.map(set, function(val, idx) {
          if (val === true) {
            return names[idx];
          }
          else {
            return null;
          }
        }), function(e) {return e !== null;});
        // Add the badness value to the rear of the named set
        namedSet.push('Badness:' + badness(set).toFixed(2));
        return namedSet;
      });
      // Sort the sets by the badness value
      namedApplicableSets = _.sortBy(namedApplicableSets, function(set) {
        return _.last(set);
      });

      console.log('named possibilities');
      console.log(namedApplicableSets);

      var $results = $('#results');
      $results.children().remove();
      _.each(namedApplicableSets.reverse(), function(set) {
        $('<li>')
          .html(set.join(', '))
          .appendTo($results);
      });
      $results.listview('refresh');

    }
    // Make analysis checkboxes update results
    $('#analyze-tbody').on('click', 'input', function() {
      refreshAnalysis();
    });

    $('#analyze-page').bind('pageinit', function () {
      $('#goodness-val').on('slidestop', function() {
        refreshAnalysis();
      });
    });
}

define(["jquery", "underscore", "jquery-mobile", "jquery-ui", "jquery-ui-touch-punch"], function($, _) {
  $(function(){main($, _);});
});
