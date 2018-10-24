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

}
