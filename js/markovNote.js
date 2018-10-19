
// generate markov model for notes
var mmodel = new Array(128);
for (var i = 0; i < mmodel.length; i++) {
  mmodel[i] = new Array(128);
}

var total_num = 0;
var prev_note = -1;


var input_music = new Array();
var input_notes = new Array();
var new_music = new Array();
var new_num = 0;

var threshold = 0.5;


function initialization() {
  for (var i = 0; i < mmodel.length; i++) {
    for (var j = 0; j < mmodel.length; j++) {
      mmodel[i][j] = 0;
    }
  }
}

function probability() {
  for (var i = 0; i < mmodel.length; i++) {
    for (var j = 0; j < mmodel.length; j++) {
      mmodel[i][j] /= total_num;
    }
  }
  new_num = total_num;
}

function start() {
  console.log("start");
  initialization();
  dur_initialization();
}

function destroy() {
  new_num = 0;
  new_music = [];
}

function stop() {
  console.log("stop");
  probability();
  dur_probability(total_num);
  generate_music();
  new_duration = generate_duration();
  console.log(new_music);
  playMusic(new_music, new_duration);
  //destroy();
}

function readNote(e) {
  if (prev_note == -1) {
    prev_note = e;
  }
  else{
    mmodel[prev_note][e] += 1;
    prev_note = e;
  }
  input_music.push(e);
  if (!(e in input_notes)) {
    input_notes.push(e);
  }
  total_num += 1;
}

function generate_music() {
  for (var r = 0; r < new_num; r++) {
    e = Math.random();
    if (new_music.length == 0) {
      if (e < threshold) {
        new_music.push(input_notes[Math.floor(Math.random() * input_notes.length)]);
      }
      else {
        new_music.push(input_music[0]);
      }
    }
    else {
      n = new_music[new_music.length - 1];
      if (e < threshold) {
        new_music.push(input_notes[Math.floor(Math.random() * input_notes.length)]);
      }
      else {
        max = 0;
        max_index = 0;
        for (var i = 0; i < mmodel.length; i++) {
          if (mmodel[n][i] > max) {
            max = mmodel[n][i];
            max_index = i;
          }
        }
        new_music.push(max_index);
      }
    }
  }
}
