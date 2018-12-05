
function FileSelected(e) {
  var files = e.target.files;
	if (files.length > 0){
		var file = files[0];
		parseFile(file);
	}
}

function parseFile(file){
			//read the file
	var reader = new FileReader();
	reader.onload = function(e){
		var partsData = MidiConvert.parse(e.target.result);
		var mididata = JSON.stringify(partsData, undefined, 2);
    header = partsData.header;
    bpm = partsData.header.bpm;
    //console.log(bpm);
	};
	reader.readAsBinaryString(file);
}
