// generate markov model for duration
var dmodel = new Array(6);
for (var i = 0; i < dmodel.length; i++) {
  dmodel[i] = new Array(6);
}

var bpm = 120; // the default bpm is 120.
var prev_dur = -1;
var noteon_list = new Array();
var input_dur = new Array();
var note_duration = {}
var dur_list = ["whole_note", "half_note", "quarter_note",
                "dotted_eighth_note", "eighth_note", "sixteenth_note"];

var new_dur = new Array();
var newnum = 0;
var threshold = 0.3;
var eight_bars = 0;

function dur_initialization() {
  for (var i = 0; i < dur_list.length; i++) {
    for (var j = 0; j < dur_list.length; j++) {
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
  if (i >= dur_list.length) {
    return dur_list.length-1;
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
      break;
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
  for (var i = 0; i < dur_list.length; i++) {
    for (var j = 0; j < dur_list.length; j++) {
      dmodel[i][j] /= total_num;
    }
  }

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
        p = nl_to_num(prev_dur);
        n = nl_to_num(next_dur);
        dmodel[p][n] += 1;
        prev_dur = next_dur;
      }
      input_dur.push(prev_dur);
      noteon_list.splice(i, 1);
    }
  }
  eight_bars = note_duration.whole_note * 8;
}

// TODO: Generate notes for 8 bars.

function generate_duration () {
  var time = 0;
  while (time < eight_bars) {
    if (eight_bars - time <= note_duration.sixteenth_note) {
      new_dur.push(dur_list[dur_list.length-1]);
      time += note_duration[dur_list[dur_list.length-1]];
      newnum += 1;
      break;
    }
    else {
      e = Math.random();
      if (new_dur.length == 0) {
        if (e < threshold) {
          a = dur_list[Math.floor(Math.random() * dur_list.length)];
          new_dur.push(a);
          time += note_duration[a];
          newnum += 1;
        }
        else {
          new_dur.push(input_dur[0]);
          time += note_duration[input_dur[0]];
          newnum += 1;
        }
      }
      else {
        x = new_dur[new_dur.length - 1];
        if (e < threshold) {
          a = dur_list[Math.floor(Math.random() * dur_list.length)];
          new_dur.push(a);
          time += note_duration[a];
          newnum += 1;
        }
        else {
          m = 0;
          mi = 2; //initialize to quater note
          for (var i = 0; i < dmodel.length; i++) {
            if (dmodel[nl_to_num(x)][i] > m) {
              m = dmodel[nl_to_num(x)][i];
              mi = i;
            }
          }
          new_dur.push(dur_list[mi]);
          time += note_duration[dur_list[mi]];
          newnum += 1;
        }
      }
    }
  }
  if (time > eight_bars) {
    t = time - note_duration[new_dur[new_dur.length - 1]];
    t = eight_bars - t;
    d = nl_to_num(t);
    new_dur.splice(-1,1);
    new_dur.push(note_length(d));
  }
  console.log(newnum, new_dur);
  return [newnum, input_dur, new_dur];
}
