// generate markov model for duration
var dmodel = [];

var bpm = 120; // the default bpm is 120.
var prev_dur = -1;
var noteon_list = new Array();
var input_dur = new Array();
var note_duration = {}
var dur_list = ["whole_note", "half_note", "quarter_note",
                "dotted_eighth_note", "eighth_note", "sixteenth_note"];

var new_dur = new Array();
var newnum = 0;
var eight_bars = 0;

function dur_initialization() {
  for (var i = 0; i < dur_list.length; i++) {
    var obj = {};
    obj.dur = dur_list[i];
    obj.transition = [];
    for (var j = 0; j < dur_list.length; j++) {
      var temp = {};
      temp.next_dur = dur_list[j];
      temp.count = 0;
      temp.probability = 0;
      obj.transition.push(temp);
    }
    dmodel.push(obj);
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
        c = dmodel[p].transition[n].count;
        pr = dmodel[p].transition[n].probability;
        dmodel[p].transition[n].probability = (p*c + 1)/(c+1);
        dmodel[p].transition[n].count += 1;
        prev_dur = next_dur;
      }
      input_dur.push(prev_dur);
      noteon_list.splice(i, 1);
    }
  }
  eight_bars = note_duration.whole_note * 8;
}
