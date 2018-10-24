// bigram model for generating music.
// the same usage of function as markovNote.js.


// generate bigram model for notes
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
  for (var j = 0; j < octavelist.length; j++) {
    var obj = {};
    obj.firstnote = octavelist[i];
    obj.firstindex = WebMidi.noteNameToNumber(obj.firstnote);
    obj.secondnote = octavelist[j];
    obj.secondindex = WebMidi.noteNameToNumber(obj.secondnote);
    obj.transition = [];
    for (var k = 0; k < octavelist.length; k++) {
      var temp = {};
      temp.note = octavelist[k];
      temp.index = WebMidi.noteNameToNumber(temp.note);
      temp.probability = 0;
      obj.transition.push(temp);
    }
    mmodel.push(obj);
  }

}

var total_num = 0;
var prev_note1 = -1;
var prev_note2 = -1;

var input_music = new Array(); // store the number of midi note
var input_notes = new Array(); // store the number of midi note
var new_music = new Array();
var new_num = 0;

var threshold = 0.1;

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
  input_dur, new_duration = generate_duration();
  //console.log(new_music);
  playMusic(new_music, new_duration);
  obtainData(input_music, new_music, input_dur, new_duration);
  //destroy();
}

function readNote(e) {
  if (e < 84 && e >= 48) { // check if the note is between c3-c6
    if ((prev_note1 != -1) && (prev_note2 == -1)) {
      prev_note2 = e;
    }
    if ((prev_note1 == -1) && (prev_note2 == -1)) {
      prev_note1 = e;
    }
    else{
      let note_index = mmodel.findIndex(t => {
        return ((t.firstindex == prev_note1) && (t.secondindex == prev_note2)); // return the index of mmodel
      });
      let trans_index = mmodel[note_index].transition.findIndex( r => {
        return r.index = e; // return the index of transition
      });
      mmodel[note_index].transition[trans_index].probability += 1;
      prev_note1 = prev_note2;
      prev_note2 = e;
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
    if (new_music.length < 2) {
      // generate the first two notes whether with the first two notes of input
      // or any notes from octavelist.
      if (e < threshold) {
        new_music.push(WebMidi.noteNameToNumber(octavelist[Math.floor(Math.random() * octavelist.length)]));
      }
      else {
        new_music.push(input_music[new_music.length]);
      }
    }
    else {
      n1 = new_music[new_music.length - 2];
      n2 = new_music[new_music.length - 1];
      let note_index = mmodel.findIndex(t => {
        return ((t.firstindex == n1) && (t.secondindex == n2));
      });
      if (e < threshold) {
        new_music.push(WebMidi.noteNameToNumber(octavelist[Math.floor(Math.random() * octavelist.length)]));
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
        if (max == 0) { // if all prob are 0, randomly choose one from octavelist.
          new_music.push(WebMidi.noteNameToNumber(octavelist[Math.floor(Math.random() * octavelist.length)]));
        }
        else{
          new_music.push(max_index);
        }
      }
    }
  }
}
