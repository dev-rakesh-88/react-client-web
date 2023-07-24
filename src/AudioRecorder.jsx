import { useState, useRef, useEffect } from "react";
import './AudioRecorder.css'
import nouns from "./utils/nouns.json"
const sheet = nouns.Sheet1
const mimeType = "audio/mp3";
const AudioRecorder = () => {
    const [permission, setPermission] = useState(false);
    const [stream, setStream] = useState(null);
    const mediaRecorder = useRef(null);
    const [recordingStatus, setRecordingStatus] = useState("inactive");
    const [word, setWord] = useState('')
    const [audioChunks, setAudioChunks] = useState([]);
    const [audio, setAudio] = useState(null);

    const getMicrophonePermission = async () => {
        if ("MediaRecorder" in window) {
            try {
                const streamData = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                });
                setPermission(true);
                setStream(streamData);
                await getWord()
                await startRecording(streamData)
            } catch (err) {
                alert(err.message);
            }
        } else {
            alert("The MediaRecorder API is not supported in your browser.");
        }
    };
    const startRecording = async (streamData) => {
        setRecordingStatus("recording");
        //create new Media recorder instance using the stream
        const media = new MediaRecorder(streamData, { type: mimeType });
        //set the MediaRecorder instance to the mediaRecorder ref
        mediaRecorder.current = media;
        //invokes the start method to start the recording process
        mediaRecorder.current.start();
        let localAudioChunks = [];
        mediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data === "undefined") return;
            if (event.data.size === 0) return;
            localAudioChunks.push(event.data);
        };
        setAudioChunks(localAudioChunks);
    };
    const stopRecording = () => {
        setRecordingStatus("inactive");
        //stops the recording instance
        mediaRecorder.current.stop();
        mediaRecorder.current.onstop = () => {
            //creates a blob file from the audiochunks data
            const audioBlob = new Blob(audioChunks, { type: mimeType });
            //creates a playable URL from the blob file.
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudio(audioUrl);
            setAudioChunks([]);
        };
    }
    function getRandomWord() {
        let min = 1;
        let max = sheet.length -1;
        min = Math.ceil(min);
        max = Math.floor(max);
        const index = Math.floor(Math.random() * (max - min + 1)) + min;
        const word = sheet[index].noun
        return word
    }

    function getWord () {
        let wordLength = 0;
        let word = ""
        while (wordLength < 3 || wordLength > 6) {
            word = getRandomWord()
            wordLength = word.length;
        }
        setWord(word)
    }
  
    return (
        <div id="main">
            <main>
            <h2>Read following text</h2>
                <div className="audio-controls" id="audio-controller">
                    {!permission ? (
                        <button onClick={getMicrophonePermission} type="button" id="get-text-btn">
                            Get me the text
                        </button>
                    ) : null}
                    {/* {permission && recordingStatus === "inactive" ? (
                        <button onClick={startRecording} type="button">
                            Start Recording
                        </button>
                    ) : null} */}
                    {permission && recordingStatus === "recording" ? (
                        <label id="word-label">
                            {word}
                        </label>
                    ) : null}
                    {recordingStatus === "recording" ? (
                        <button onClick={stopRecording} type="button" id="stop-btn">
                            Stop Recording
                        </button>
                    ) : null}
                    {/* {audio ? (
                        <div className="audio-container">
                            <audio src={audio} controls></audio>
                            <a download href={audio}>
                                Download Recording
                            </a>
                        </div>
                    ) : null} */}
                </div>
            </main>
        </div>
    );
};
export default AudioRecorder;