// bigram model for generating music.
// the same usage of function as markovNote.js.


// generate bigram model for notes
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
var prev_note1 = -1;
var prev_note2 = -1;

var input_music = new Array(); // store the number of midi note
var input_notes = new Array(); // store the number of midi note
var new_num = 0;

function writeToFile() {
  model = {mmodel: mmodel};
  var json = JSON.stringify(model);
  var fs = require('fs');
  fs.writeFile('bigramNote.json', json, 'utf8', callback);
}

function loadData() {
  var fs = require('fs');
  fs.readFile('bigramNote.json', 'utf8', function readFileCallback(err, data){
    if (err){
      initialization();
      console.log(err);
    } else {
      model = JSON.parse(data); //now it an object
      mmodel = model.mmodel;
    }
  });
}

function initialization() {

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
        temp.count = 0;
        obj.transition.push(temp);
      }
      mmodel.push(obj);
    }
  }

  for (var i = 0; i < mmodel.length; i++) {
    for (var j = 0; j < octavelist.length; j++) {
      mmodel[i].transition[j].probability = 0;
    }
  }

}


function start() {
  console.log("start");
  //loadData();
  initialization();
  dur_initialization();
}

function stop() {
  console.log("stop");
  //probability();
  //dur_probability(total_num);

  r = obtainData(input_music, input_dur);
  score_note = r[0];
  score_dur = r[1];
  console.log("input");
  console.log(r);
  r = episode(score_note, score_dur);
  new_music = r[0];
  new_duration = r[1];
  playMusic(new_music, new_duration);
  //writeToFile();
  //destroy();
}

function readNote(e) {
  if (e < WebMidi.noteNameToNumber("C7") && e >= WebMidi.noteNameToNumber("C2")) { // check if the note is between c3-c7
    if ((prev_note1 != -1) && (prev_note2 == -1)) {
      prev_note2 = e;
    }
    else if ((prev_note1 == -1) && (prev_note2 == -1)) {
      prev_note1 = e;
    }
    else{
      let note_index = mmodel.findIndex(t => {
        return ((t.firstindex == prev_note1) && (t.secondindex == prev_note2)); // return the index of mmodel
      });
      let trans_index = mmodel[note_index].transition.findIndex( r => {
        return r.index = e; // return the index of transition
      });
      p = mmodel[note_index].transition[trans_index].probability;
      c = mmodel[note_index].transition[trans_index].count;
      mmodel[note_index].transition[trans_index].probability = (p*c + 1)/(c+1);
      mmodel[note_index].transition[trans_index].count += 1;
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
