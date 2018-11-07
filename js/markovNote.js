
// generate markov model for notes
// three octaves 3*12 from [c3, c6)
// c3: 48  c6: 84

var octave = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var octavelist = [];

var mmodel = [];

for (var i = 0; i < 5; i++) {
  for (var j = 0; j < octave.length; j++) {
    octavelist.push(octave[j]+(i+2).toString());
  }
}


var total_num = 0;
var prev_note = -1;

var input_music = new Array(); // store the number of midi note
var input_notes = new Array(); // store the number of midi note



function initialization() {
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
      temp.count = 0;
      obj.transition.push(temp);
    }
    mmodel.push(obj);
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
  console.log(mmodel);
  console.log("stop");
  r = obtainData(input_music, input_dur);
  score_note = r[0];
  score_dur = r[1];
  console.log("input");
  console.log(r);
  r = episode(score_note, score_dur);
  new_music = r[0];
  new_duration = r[1];
  playMusic(new_music, new_duration);

}

function readNote(e) {
  if (e < WebMidi.noteNameToNumber("C7") && e >= WebMidi.noteNameToNumber("C2")) { // check if the note is between c3-c6
    if (prev_note == -1) {
      prev_note = e;
    }
    else{
      for (x = 0; x < mmodel.length; x++) {
        if (mmodel[x].index == prev_note) {
          note_index = x;
          break;
        }
      }
      //console.log(prev, note_index);
      for (y = 0; y < mmodel[note_index].transition.length; y++) {
        if (mmodel[note_index].transition[y].index == e) {
          trans_index = y;
          break;
        }
      }
      p = mmodel[note_index].transition[trans_index].probability;
      c = mmodel[note_index].transition[trans_index].count;
      mmodel[note_index].transition[trans_index].probability = (p*c + 1)/(c+1);
      mmodel[note_index].transition[trans_index].count += 1;
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
