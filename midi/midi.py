from midiutil.MidiFile import MIDIFile
from collections import namedtuple
import json

line = []
with open('output.txt', 'r') as f:
    line = f.readline()
music = json.loads(line, object_hook=lambda d: namedtuple('X', d.keys())(*d.values()))
# print music
# create your MIDI object
mf = MIDIFile(1)     # only 1 track
track = 0   # the only track

time = 0    # start at the beginning
mf.addTrackName(track, time, "Sample Track")
mf.addTempo(track, time, music.header.bpm)

# add some notes
channel = music.tracks[0].channelNumber
volume = 100
notes = music.tracks[0].notes
one_beat = 60000.0/music.header.bpm

for note in notes:
    pitch = note.midi
    t = float(note.time[1:])
    time = t*1.0/one_beat
    duration = note.duration*1.0/one_beat
    mf.addNote(track, channel, pitch, time, duration, volume)

# write it to disk
with open("output.mid", 'wb') as outf:
    mf.writeFile(outf)
