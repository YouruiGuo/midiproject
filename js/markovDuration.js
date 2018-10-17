// generate markov model for duration
var dmodel = new Array(6);
for (var i = 0; i < dmodel.length; i++) {
  dmodel[i] = new Array(6);
}

var bpm = 120;
var prev_dur = -1;
var noteon_list = new Array();
var input_dur = new Array();
var note_duration = {}
var dur_list = ["whole_note", "half_note", "quarter_note",
                "dotted_eighth_note", "eighth_note", "sixteenth_note"];

var new_dur = new Array();
var newnum = 0;
var threshold = 0.5;

function dur_initialization() {
  for (var i = 0; i < dmodel.length; i++) {
    for (var j = 0; j < dmodel.length; j++) {
      dmodel[i][j] = 0;
    }
  }
}

function get_notebpm () {
  one_beat = 60000/bpm;
  note_duration = {
    whole_note: 4*one_beat,
    half_note : 2*one_beat,
    quarter_note : one_beat,
    dotted_eighth_note : (3*one_beat)/4,
    eighth_note : one_beat/2,
    sixteenth_note : one_beat/4
  };
}
function nl_to_num (length) {
  for (var i = 0; i < dur_list.length; i++) {
    if (length == dur_list[i]) {
      return i;
    }
  }
}

function note_length (dur) {
  lt = 0;
  rt = 0;
  for (var i = 0; i < dur_list.length; i++) {
    if (dur < note_duration[dur_list[i]]) {
      lt = dur_list[i];
    }
    else {
      rt = dur_list[i];
    }
  }
  if (Math.abs(dur-note_duration[lt]) > Math.abs(dur-note_duration[rt])) {
    return rt;
  }
  else{
    return lt;
  }
}

function dur_probability(total_num) {
  for (var i = 0; i < dmodel.length; i++) {
    for (var j = 0; j < dmodel.length; j++) {
      mmodel[i][j] /= total_num;
    }
  }
  newnum = total_num;
}

function start_duration(e, timestamp) {
  var note_obj = {note: e, timestamp: timestamp};
  noteon_list.push(note_obj);
}

function stop_duration(e, timestamp) {
  for (var i = 0; i < noteon_list.length; i++) {
    if (noteon_list[i].note == e) {
      if (prev_dur == -1) {
        d = timestamp - noteon_list[i].timestamp;
        get_notebpm();
        prev_dur = note_length(d);
      }
      else{
        d = timestamp - noteon_list[i].timestamp;
        next_dur = note_length(d);
        dmodel[nl_to_num(prev_dur)][nl_to_num(next_dur)] += 1;
        prev_dur = next_dur;
      }
      input_dur.push(prev_dur);
      noteon_list.splice(i, 1);
    }
  }
}

function generate_duration () {
  for (var r = 0; r < newnum; r++) {
    e = Math.random();
    if (new_dur.length == 0) {
      if (e < threshold) {
        new_dur.push(dur_list[Math.floor(Math.random() * dur_list.length)]);
      }
      else {
        new_dur.push(input_dur[0]);
      }
    }
    else {
      x = new_dur[new_dur.length - 1];
      if (e < threshold) {
        new_dur.push(dur_list[Math.floor(Math.random() * dur_list.length)]);
      }
      else {
        m = 0;
        mi = 0;
        for (var i = 0; i < dmodel.length; i++) {
          if (dmodel[nl_to_num(x)][i] > m) {
            m = dmodel[nl_to_num(x)][i];
            mi = i;
          }
        }
        new_dur.push(dur_list[mi]);
      }
    }
  }
  console.log(new_dur);
  return new_dur;
}
