
// generate markov model for notes
// three octaves 3*12 from [c3, c6)
// c3: 48  c6: 84

var octave = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var octavelist = [];

var mmodel = [];

for (var i = 0; i < 3; i++) {
  for (var j = 0; j < octave.length; j++) {
    octavelist.push(octave[j]+(i+3).toString());
  }
}

for (var i = 0; i < octavelist.length; i++) {
  var obj = {};
  obj.note = octavelist[i];
  obj.index = WebMidi.noteNameToNumber(obj.note);
  obj.transition = [];
  for (var j = 0; j < octavelist.length; j++) {
    var temp = {};
    temp.note = octavelist[j];
    temp.index = WebMidi.noteNameToNumber(temp.note);
    temp.probability = 0;
    obj.transition.push(temp);
  }
  mmodel.push(obj);
}
console.log(mmodel);

var total_num = 0;
var prev_note = -1;


var input_music = new Array(); // store the number of midi note
var input_notes = new Array(); // store the number of midi note
var new_music = new Array();
var new_num = 0;

var threshold = 0.5;


function initialization() {
  for (var i = 0; i < mmodel.length; i++) {
    for (var j = 0; j < octavelist.length; j++) {
      mmodel[i].transition[j].probability = 0;
    }
  }
}

function probability() {
  for (var i = 0; i < mmodel.length; i++) {
    for (var j = 0; j < mmodel[i].length; j++) {
      mmodel[i].transition[j].probability /= total_num;
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
  obtainData(new_music, new_duration);
  //destroy();
}

function readNote(e) {
  if (e < 84 && e >= 48) { // check if the note is between c3-c6
    if (prev_note == -1) {
      prev_note = e;
    }
    else{
      let note_index = mmodel.findIndex(t => {
        return t.index = prev_note; // return the index of mmodel
      });
      let trans_index = mmodel[note_index].transition.findIndex( r => {
        return r.index = e; // return the index of transition
      });
      mmodel[note_index].transition[trans_index].probability += 1;
      prev_note = e;
    }
    input_music.push(e);
    if (!(e in input_notes)) {
      input_notes.push(e);
    }
    total_num += 1;
  }
  else {
    console.log("invalid input");
  }
}

function generate_music() {
  for (var r = 0; r < new_num; r++) {
    e = Math.random();
    if (new_music.length == 0) {
      // generate the first note whether with the first note of input or any notes from octavelist.
      if (e < threshold) {
        new_music.push(octavelist[Math.floor(Math.random() * octavelist.length)]);
      }
      else {
        new_music.push(input_music[0]);
      }
    }
    else {
      n = new_music[new_music.length - 1];
      let note_index = mmodel.findIndex(t => {
        return t.index = n;
      });
      if (e < threshold) {
        new_music.push(octavelist[Math.floor(Math.random() * octavelist.length)]);
      }
      else {
        max = 0;
        max_index = 0;
        for (var i = 0; i < mmodel[note_index].transition.length; i++) {
          if (mmodel[note_index].transition[i].probability > max) {
            max = mmodel[note_index].transition[i].probability;
            max_index = mmodel[note_index].transition[i].index;
          }
        }
        new_music.push(max_index);
      }
    }
  }
}
