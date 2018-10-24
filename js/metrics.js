// Metrics are composed by Zipf's law of pitch, duration, ...
// Compare the model of input music and generated music by MSE.

var metric_input_note = [];
var metric_new_note = [];
var metric_input_dur = [];
var metric_new_dur = [];

function obtainData(input_music, new_music, input_dur, new_dur) {
  metric_input_note = zipf(input_music);
  metric_new_note = zipf(new_music);
  metric_input_dur = zipf(input_dur);
  metric_new_dur = zipf(new_dur);

  r = getXY(metric_input_note);
  input_n = linearRegression(r[0], r[1]);
  console.log(input_n);

  r = getXY(metric_new_note);
  newnote = linearRegression(r[0], r[1]);
  console.log(newnote);

  r = getXY(metric_input_dur);
  input_dr = linearRegression(r[0], r[1]);
  console.log(input_dr);

  r = getXY(metric_new_dur);
  newdr = linearRegression(r[0], r[1]);
  console.log(newdr);
}

function getXY(data) {
  x = [];
  y = [];
  for (var i = 0; i < data.length; i++) {
    x.push(data[i].logrank);
    y.push(data[i].logcount);
  }
  return [y, x];
}

// this function is from http://trentrichardson.com/2010/04/06/compute-linear-regressions-in-javascript/
function linearRegression(y,x){
		var lr = {};
		var n = y.length;
		var sum_x = 0;
		var sum_y = 0;
		var sum_xy = 0;
		var sum_xx = 0;
		var sum_yy = 0;

		for (var i = 0; i < y.length; i++) {

			sum_x += x[i];
			sum_y += y[i];
			sum_xy += (x[i]*y[i]);
			sum_xx += (x[i]*x[i]);
			sum_yy += (y[i]*y[i]);
		}

		lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
		lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
		lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);

		return lr;
}

// plot for the zipfs distribution
function plot() {

}

function zipf(data) {
  var temp = [];
  for (var i = 0; i < data.length; i++) {
    j = 0;
    while (j < temp.length) {
      if (data[i] == temp[j].note) {
        temp[j].count += 1;
        break;
      }
      j++;
    }
    if (j == temp.length) {
      obj = {};
      obj.note = data[i];
      obj.count = 1;
      temp.push(obj);
    }
  }

  quicksort(temp, 0, temp.length - 1);
  for (var i = 0; i < temp.length; i++) {
    temp[i].logrank = Math.log(i+1);
    temp[i].logcount = Math.log(temp[i].count);
  }
  return temp;
}


// TODO: Implement quicksort
function quicksort(temp, lo, hi) {

  var pivot;
  var index;
  if (lo < hi){
    //console.log("aaaa");
    index = partition(temp, lo, hi);
    quicksort(temp, lo, index);
    quicksort(temp, index+1, hi);

  }
  else{
    return;
  }
}

function partition(arr, lo, hi){
  // first element of subarray
  var pivot = arr[lo];
  var i = lo;
  var j = hi;

  while(true){
    while (arr[i].count > pivot.count ) {
      i++;
    }
    while (arr[j].count < pivot.count ) {
      j--;
    }

    if (i < j){
    // swap ith and jth element
      var t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
      i++;
      j--;
    }
    else{
      return j;
    }
  }
}
