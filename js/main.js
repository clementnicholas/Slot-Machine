(function(){

  var symbols = ['coffee', 'espresso', 'tea'];
  var result = [];
  var counter = 0;

// DEFINE A FUNCTION THAT RETURNS AN ARRAY OF PARAMETERS TO APPLY TO EACH WHEEL'S SPIN.
// SHOULD RETURN A RANDOM OUTCOME 
// SHOULD RETURN AN OUTCOME TYPE
// SHOULD RETURN A RANDOM ROTATION CORRESPONDING TO OUTCOME
// SHOULD RETURN A RANDOM NUMBER OF DEGREES TO ACT AS A REBOUND POINT FOR THE WHEEL
  function generateSpinParams() {
    var spinParams = [];
    var wheel;
    for (var i = 0; i < 3; i++) {
      wheel = {};
      wheel['endpoint'] =  Math.floor(Math.random() * 12) + 1;
      wheel['endpoint_type'] = symbols[wheel['endpoint'] % 3];
      wheel['rotation'] = (wheel['endpoint'] * 30) + (2880);
      wheel['rebound'] = wheel['rotation'] + (Math.random() * 15);
      spinParams.push(wheel);
    }
    return spinParams;
  }

// DEFINE TWO FUNCTIONS THAT RETURN THE KEYFRAME RULES YOU WILL USE FOR YOUR CSS ANIMATIONS
// WILL USE THE SPIN PARAMS AS PARAMS WHEN CALLING THE FUNCTIONS  
  function generateWebkitKeyframeRules(name, params) {
    return "@-webkit-keyframes " + name + "{ " +
      "0% { -webkit-transform: rotateX(0deg); } " +
      "98% { -webkit-transform: rotateX(" + params['rebound'] + "deg); } " +
      "100% { -webkit-transform: rotateX(" + params['rotation'] + "deg); } } "
  }

  function generateDefaultKeyframeRules(name, params) {
    return "@keyframes " + name + "{ " +
      "0% { transform: rotateX(0deg); } " +
      "98% { transform: rotateX(" + params['rebound'] + "deg); } " +
      "100% { transform: rotateX(" + params['rotation'] + "deg); } }";
  }

// DEFINE A FUNCTION THAT REMOVES KEYFRAME RULES FROM THE MAIN STYLESHEET
// NEED THIS FOR RESETTING THE ANIMATION
  function deleteKeyframeRules() {
    var ss = document.styleSheets[2];    
    var rules = ss.rules;
    var keyframesRules = [];
    var deleted = 0;

    // IF IT'S A KEYFRAME RULE, PUSH IT TO AN ARRAY
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].type === 7) {
        keyframesRules.push(i);
      }
    }    
    // FOR EVERY KEYFRAME RULE INDEX, DELETE THE RULE AT THAT INDEX
    // FOR EVERY RULE YOU DELETE, ACCOUNT FOR RULE INDEXES MOVING DOWN WITH A DELETED COUNTER
      // I.E. IF YOU DELETE A RULE AT INDEX 4, THE RULE AT INDEX 5 BECOMES THE RULE AT INDEX 4.
    keyframesRules.forEach(function(i) {
      ss.deleteRule(i - deleted);
      deleted++;
    });
  }

// CHECK TO SEE IF THEY SHOULD TRY AGAIN OR IF THEY WON.
// RETURN WHAT THEY WON IF THEY WON
// OTHERWISE RETURN WHAT THEY ARE... BOO-YAH!
  function checkResult(result) {
    if (result[0] === result[1] && result[0] === result[2]) {
      return result[0];
    } else {
      return "loser";
    }
  }

// REPLACE EACH REEL'S ANIMATION WITH A DIFFERENT ANIMATION NAME TO RESTART THE ANIMATION
  function replaceAnimationNames(wheelOneAnimationName, wheelTwoAnimationName, wheelThreeAnimationName) {
    $('#reel-1').css('animation-name', wheelOneAnimationName);
    $('#reel-2').css('animation-name', wheelTwoAnimationName);
    $('#reel-3').css('animation-name', wheelThreeAnimationName);
    $('#reel-1').css('-webkit-animation-name', wheelOneAnimationName);
    $('#reel-2').css('-webkit-animation-name', wheelTwoAnimationName);
    $('#reel-3').css('-webkit-animation-name', wheelThreeAnimationName);
  }

// INSERT THE KEYFRAME RULES INTO THE STYLESHEET
  function insertKeyframeRules(wheelOneAnimationName, wheelTwoAnimationName, wheelThreeAnimationName, spinParams, stylesheet) {
    stylesheet.insertRule(generateWebkitKeyframeRules(wheelOneAnimationName, spinParams[0]), 0);
    stylesheet.insertRule(generateWebkitKeyframeRules(wheelTwoAnimationName, spinParams[1]), 0);
    stylesheet.insertRule(generateWebkitKeyframeRules(wheelThreeAnimationName, spinParams[2]), 0);
    stylesheet.insertRule(generateDefaultKeyframeRules(wheelOneAnimationName, spinParams[0]), 0);
    stylesheet.insertRule(generateDefaultKeyframeRules(wheelTwoAnimationName, spinParams[1]), 0);
    stylesheet.insertRule(generateDefaultKeyframeRules(wheelThreeAnimationName, spinParams[2]), 0);
  }

// WHEN AN ANIMATION ENDS, LIGHT UP THE LIGHTS WITH THE COLOR OF THAT REELS RESULT
  function lightResultLight(elementNum) {
    var resultIndex = elementNum - 1;
    $('#reel-' + elementNum).off('webkitAnimationEnd animationend').on('webkitAnimationEnd animationend', function() {
      $('#light-' + elementNum).addClass(result[resultIndex]).addClass('lit').css('opacity', '1');
    });
  }

// DISPLAY THE OUTCOME IN THE RESULT DIV
  // HEADLINE SHOULD BE THE RESULT
  // THEN INDICATE WHAT THEY WON IF THEY WON
  // THEN CALL TO ACTION
  // IF THEY WON, THE DIV BACKGROUND COLOR SHOULD MATCH THE ITEM BACKGROUND COLOR IN THE REEL
  function populateResultDiv(outcome) {
      if (outcome === 'loser') {
        $('#result-div h3').text('SORRY!');
        $('#result-div h5').text('NO CAFFEINE FOR YOU!');
        $('#result-div p').text('Click the Cup to Try Again');
      } else if (outcome === 'espresso') {
        $('#result-div').addClass('lit ' + outcome);
        $('#result-div h3').text('WINNER!');
        $('#result-div h5').text('YOU WON AN ' + outcome.toUpperCase() + '!');
        $('#result-div p').text('Take your Prize and Enjoy your Day');
      } else {
        $('#result-div').addClass('lit ' + outcome);
        $('#result-div h3').text('WINNER!');
        $('#result-div h5').text('YOU WON A ' + outcome.toUpperCase() + '!');
        $('#result-div p').text('Take your Prize and Enjoy your Day');
      }
  }

  document.getElementById('arm-handle').addEventListener('mousedown', function(e) {
    // ONCE CLICKED, DISABLE POINTER EVENTS TO AVOID DOUBLE CLICKS
    document.getElementById('arm-handle').style.pointerEvents = 'none';
    e.preventDefault();

    // INCREMENT COUNTER FOR ANIMATION NAMES
    counter++;
    
    // RESET THE LIGHTS, REELS, RESULT DIV, DISPENSER DIV, RESULT ARRAY, AND KEYFRAME RULES
    $('.reel').removeClass('spinning');
    $('.light').removeClass('espresso tea coffee lit');
    $('#result-div').removeClass('espresso tea coffee lit').addClass('hidden');
    $('#arm-liquid').css({ 'width': '0' , 'left' : '130px' });
    $('#spout-liquid').css('height', '0');
    $('#inner-cup').attr('fill', 'none');
    result = [];
    deleteKeyframeRules();

    // GET THE SPIN PARAMS, STYLESHEET, AND NEW ANIMATION NAMES
    var spinParams = generateSpinParams();
    var ss = document.styleSheets[2];
    var wheelOneAnimationName = 'wheelOneSpin' + counter;
    var wheelTwoAnimationName = 'wheelTwoSpin' + counter;
    var wheelThreeAnimationName = 'wheelThreeSpin' + counter;

    insertKeyframeRules(wheelOneAnimationName, wheelTwoAnimationName, wheelThreeAnimationName, spinParams, ss);
    replaceAnimationNames(wheelOneAnimationName, wheelTwoAnimationName, wheelThreeAnimationName);

    // START ANIMATION
    $('.reel').addClass('spinning');

    // PUSH RESULTS TO RESULT ARRAY
    spinParams.forEach(function(spin) {
      result.push(spin['endpoint_type']);
    });

    lightResultLight(1);
    lightResultLight(2);
    lightResultLight(3);

    // WHEN ANIMATION ENDS, POPULATE AND SHOW THE RESULT DIV
    $('#reel-3').on('webkitAnimationEnd animationend', function() {
      $('#result-div').removeClass('hidden');

      var outcome = checkResult(result);
      populateResultDiv(outcome);

      // IF THEY WON, FILL UP THE CUP!
      if (outcome !== 'loser') {
        $('#arm-liquid').animate({ width: '120px', left: '0px' }, '2000');
        setTimeout(function() { 
          $('#spout-liquid').animate({ height: '75px' }, 1000); 
        }, 250);
        setTimeout(function() {
          $('#animate-coffee')[0].beginElement();
          $('#fill-cup')[0].beginElement();
          $('#inner-cup').attr('fill', 'url(#lg)');
        }, 1250);
      }

      // ENABLE CLICK EVENTS TO PLAY AGAIN
      document.getElementById('arm-handle').style.pointerEvents = 'auto';
    });

  });

})();