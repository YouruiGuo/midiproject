var num_ep = 100000;
var new_music = new Array();
var new_duration = new Array();

function episode(score_note, score_dur) {
  for (var i = 0; i < num_ep; i++) {
    result = generate_duration(new_dur);
    new_num = result[0];
    new_dur = result[1];
    learn = 1;
    new_episode = generate_music(new_num, learn);
    //console.log(new_episode);
    r = obtainData(new_episode, new_dur);
    note = r[0];
    dur = r[1];
    note_reward = get_note_reward(note, score_note);
    //console.log(i, note);
    if (note_reward > 0) {
      console.log(i, note_reward);
    }
    updateNoteValue(note_reward, new_episode);
    //updateDurValue(dur, new_dur);
  }
  learn = 0;
  // generate new piece
  result = generate_duration();
  new_num = result[0];
  new_duration = result[1];
  new_music = generate_music(new_num, learn);
  r = obtainData(new_music, new_duration);
  console.log(input_music);
  console.log(new_music,r[0]);
  return [new_music, new_duration];
}

// for bigram
/*
function generate_music(new_num) {
  var threshold = 0.1;
  var new_episode = [];
  for (var r = 0; r < new_num; r++) {
    e = Math.random();
    if (new_episode.length < 2) {
      // generate the first two notes whether with the first two notes of input
      // or any notes from octavelist.
      if (e < threshold) {
        new_episode.push(WebMidi.noteNameToNumber(octavelist[Math.floor(Math.random() * octavelist.length)]));
      }
      else {
        new_episode.push(input_music[new_episode.length]);
      }
    }
    else {
      n1 = new_episode[new_episode.length - 2];
      n2 = new_episode[new_episode.length - 1];
      for (x = 0; x < mmodel.length; x++) {
        if (mmodel[x].firstindex == n1 && mmodel[x].secondindex == n2) {
          note_index = x;
          break;
        }
      }

      if (e < threshold) {
        new_episode.push(WebMidi.noteNameToNumber(octavelist[Math.floor(Math.random() * octavelist.length)]));
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
          new_episode.push(WebMidi.noteNameToNumber(octavelist[Math.floor(Math.random() * octavelist.length)]));
        }
        else{
          new_episode.push(max_index);
        }
      }
    }
  }
  return new_episode;
}
*/

// for markov

function generate_music(new_num, learn) {
  new_episode = [];
  var threshold = 0.12;

  if (learn == 0) {
    threshold = 0.08;
  }
  for (var r = 0; r < new_num; r++) {
    e = Math.random();
    if (new_episode.length == 0) {
      // generate the first note whether with the first note of input or any notes from octavelist.
      //if (e < threshold) {
        new_episode.push(WebMidi.noteNameToNumber(octavelist[Math.floor(Math.random() * octavelist.length)]));
      //}
      //else {
      //  new_episode.push(input_music[0]);
      //}
    }
    else {
      n = new_episode[new_episode.length - 1];
      var note_index = -1;
      for (x = 0; x < mmodel.length; x++) {
        if (mmodel[x].index == n) {
          note_index = x;
          break;
        }
      }

      if (e < threshold) {
        new_episode.push(WebMidi.noteNameToNumber(octavelist[Math.floor(Math.random() * octavelist.length)]));
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
          new_episode.push(WebMidi.noteNameToNumber(octavelist[Math.floor(Math.random() * octavelist.length)]));
        }
        else{
          new_episode.push(max_index);
        }

      }
    }
  }
  return new_episode;
}


// TODO: Generate notes for 8 bars.

function generate_duration (thre) {
  var threshold = thre;
  var new_dur = [];
  var newnum = 0;
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
        a = dur_list[Math.floor(Math.random() * dur_list.length)];
        new_dur.push(a);
        time += note_duration[a];
        newnum += 1;
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
            if (dmodel[nl_to_num(x)].transition[i].probability > m) {
              m = dmodel[nl_to_num(x)].transition[i].probability;
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
  //console.log(newnum, new_dur);
  return [newnum, new_dur];
}

function get_note_reward(note, score_note){
  //console.log(note, score_note);
  score = Math.abs(note.slope, score_note.slope);

  if (score <= 0.008) {
    return 1;
  }
/*
  else if (score <= 0.3 && score > 0.1) {
    return 0.5;
  }
*/
  else {
    return 0;
  }

}

// for markov

function updateNoteValue(note_reward, new_episode) {
  prev = -1; // the first note
  for (var i = 0; i < new_episode.length; i++) {
    e = new_episode[i];

    if (prev == -1) {
      prev = e;
    }
    else{
      for (x = 0; x < mmodel.length; x++) {
        if (mmodel[x].index == prev) {
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
      mmodel[note_index].transition[trans_index].probability = (p*c + note_reward)/(c+1);
      mmodel[note_index].transition[trans_index].count += 1;
      prev = e;
    }
  }

}


// for bigram
/*
function updateNoteValue(note_reward, new_episode) {
  prev1 = -1; // the first note
  prev2 = -1; // the second note
  for (var i = 0; i < new_episode.length; i++) {
    e = new_episode[i];

    if ((prev1 != -1) && (prev2 == -1)) {
      prev2 = e;
    }
    else if ((prev1 == -1) && (prev2 == -1)) {
      prev1 = e;
    }
    else{
      for (x = 0; x < mmodel.length; x++) {
        if (mmodel[x].firstindex == prev1 && mmodel[x].secondindex == prev2) {
          note_index = x;
          break;
        }
      }
      for (y = 0; y < mmodel[note_index].transition.length; y++) {
        if (mmodel[note_index].transition[y].index == e) {
          trans_index = y;
          break;
        }
      }
      p = mmodel[note_index].transition[trans_index].probability;
      c = mmodel[note_index].transition[trans_index].count;
      mmodel[note_index].transition[trans_index].probability = (p*c + note_reward)/(c+1);
      mmodel[note_index].transition[trans_index].count += 1;
      prev1 = prev2;
      prev2 = e;
    }
  }

}
*/

function probability() {
  for (var i = 0; i < mmodel.length; i++) {
    for (var j = 0; j < mmodel[i].length; j++) {
      mmodel[i].transition[j].probability /= num_ep;
    }
  }
}
