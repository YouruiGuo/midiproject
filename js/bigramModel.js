var notes = new Array();
var bigram_model = [];
function numberToNoteName(e) {
  // midi number 24 -> C1
  num = (e-24)%12;
  return octave[num];
}

function bigramInitialization() {
  console.log(input_music);
  re = obtainData(input_music, input_dur); //get the score of input music
  inputNotesScore = re[0];
  inputDurScore = re[1];

  for (var i = 0; i < octave.length; i++) {
    for (var j = 0; j < octave.length; j++) {
      var obj = {};
      obj.firstnote = octave[i];
      obj.secondnote = octave[j];
      obj.transition = [];
      for (var k = 0; k < octave.length; k++) {
        var temp = {};
        temp.note = octave[k];
        temp.probability = 0;
        temp.count = 0;
        obj.transition.push(temp);
      }
      bigram_model.push(obj);
    }
  }
  //console.log(input_music);
  updateBigram(1);
  monteCarlo(inputNotesScore, inputDurScore);
  //console.log(r[0]);
}

function monteCarlo(inputNotesScore, inputDurScore) {
  var numep = 10000;
  for (var i = 0; i < numep; i++) {
    r = generate_Ep();
    s = obtainData(r[0], r[1]);
    score_note = s[0];
    score_dur = s[1];
    diff = Math.abs(inputNotesScore, score_note);
    if (diff < 0.1) {
      ret = 1;
    }
    else {
      ret = 0;
    }
    updateBigram(ret);
  }
  r = generate_Ep();
  console.log(bigram_model);
  console.log(r[0]);
  playMusic(r[0], r[1]);
}

function updateBigram(score) {
  var prev1 = -1;
  var prev2 = -1;
  for (var i = 0; i < input_music.length; i++) {
    var inote = numberToNoteName(input_music[i]);
    //console.log(inote);
    var index = -1;
    if (i < 2) {
      prev1 = numberToNoteName(input_music[0]);
      prev2 = numberToNoteName(input_music[1]);
    }
    else{
      for (var j = 0; j < bigram_model.length; j++) {
        if (bigram_model[j].firstnote == prev1 && bigram_model[j].secondnote == prev2) {
          index = j;
          break;
        }
      }
      for (var k = 0; k < octave.length; k++) {
        if (octave[k] == numberToNoteName(input_music[i])) {
          c = bigram_model[index].transition[k].count;
          p = bigram_model[index].transition[k].probability;
          bigram_model[index].transition[k].probability = (p*c + score)/(c+1);
          bigram_model[index].transition[k].count += 1;
          prev1 = prev2;
          prev2 = numberToNoteName(input_music[i]);
          break;
        }
      }
    }

  }
  //console.log(bigram_model);
}

function generate_Ep() {
  var threshold = 0.1;
  result = generate_duration();
  newnum = result[0];
  newdur = result[1];
  //console.log(newnum, newdur);
  var new_ep = [];
  for (var x = 1; x < newnum; x++) {
    if (new_ep.length == 0) {
      //console.log(octave[Math.floor(Math.random()*octave.length)] + "4");
      new_ep.push(WebMidi.noteNameToNumber(octave[Math.floor(Math.random()*octave.length)] + "4"));
      new_ep.push(WebMidi.noteNameToNumber(octave[Math.floor(Math.random()*octave.length)] + "4"));
    }
    else {
      e = Math.random();
      if (e < threshold) {
        new_ep.push(WebMidi.noteNameToNumber(octave[Math.floor(Math.random()*octave.length)] + "4"));
      }
      else {
        prev1 = numberToNoteName(new_ep[new_ep.length-2]);
        prev2 = numberToNoteName(new_ep[new_ep.length-1]);
        for (var j = 0; j < bigram_model.length; j++) {
          if (bigram_model[j].firstnote == prev1 && bigram_model[j].secondnote == prev2) {
            index = j;
            break;
          }
        }

        max = 0;
        maxindex = 0;
        for (var i = 0; i < octave.length; i++) {
          if (bigram_model[index].transition[i].probability > max) {
            max = bigram_model[index].transition[i].probability;
            maxindex = i;
          }
        }
        if (max == 0) {
          new_ep.push(WebMidi.noteNameToNumber(octave[Math.floor(Math.random()*octave.length)] + "4"));
        }
        else {
          new_ep.push(WebMidi.noteNameToNumber(octave[maxindex]+"4"));
        }
      }
    }
  }
  //console.log(new_ep);
  return [new_ep, newdur];
}
