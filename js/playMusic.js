
var music = new Array();

function sequence(new_music, new_dur) {
  offset = 0;
  for (var i = 0; i < new_music.length; i++) {
    var temp = {note: new_music[i], time: '+'+offset, duration: note_duration[new_dur[i]]};
    music.push(temp);
    offset = offset+note_duration[new_dur[i]];
  }
}

function playMusic(new_music, new_dur) {
  sequence(new_music, new_dur);
  output = WebMidi.outputs[0];
  //console.log(music);
  //currentTime = WebMidi.time;
  for (var i = 0; i < music.length; i++) {
    var options = {time: music[i].time, duration: music[i].duration, velocity: 0.7};
    output.playNote(music[i].note,2,options);
  }
  writeToFile(new_music, new_dur);

}

function writeToFile(new_music, new_dur) {
  // create a new midi file
  var midi = MidiConvert.create();
  offset = 0;
  midi.header = header;
  miditrack = midi.track().patch(32);
  miditrack.channelNumber = 2;
  for (var i = 0; i < new_music.length; i++) {
    var temp = {note: new_music[i], time: '+'+offset, duration: note_duration[new_dur[i]]};
    miditrack.note(temp.note, temp.time, temp.duration);
    offset = offset+note_duration[new_dur[i]];
  }
  //console.log(midi.toJSON());
  //var file = new File(midi, "output.mid", {type: "octet/stream", lastModified: Date.now()});
  jsonf = JSON.stringify(midi.toJSON());
  var blob = new Blob([JSON.stringify(midi.toJSON())], {type: "application/json"});
  var fileName = "output.txt";
  saveAs(blob, fileName);
  /*
  console.log(midi.fromJSON(jsonf));
  var blob = new Blob([jsonf.fromJSON()], {type: "octet/stream"});
  var fileName = "output.midi";
  saveAs(blob, fileName);*/
  //var file = new File([blob], "output.mid", {type: "octet/stream", lastModified: Date.now()});
  //FileSaver.saveAs(file);
  //fs.writeFileSync("output.mid", midi.encode(), "binary")
}
