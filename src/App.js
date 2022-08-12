import './App.css';
import { Buffer } from 'buffer'
import { useState, useRef } from 'react'
import { default as MicrophoneStream } from 'microphone-stream'
import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
} from "@aws-sdk/client-transcribe-streaming";

const client = new TranscribeStreamingClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.REACT_APP_TRANSCRIBE_ID,
    secretAccessKey: process.env.REACT_APP_TRANSCRIBE_KEY,
  },
});

const API_HOST = process.env.REACT_APP_PHOTOBOT_API_HOST;

const pcmEncodeChunk = (chunk) => {
  const input = MicrophoneStream.toRaw(chunk);
  var offset = 0;
  var buffer = new ArrayBuffer(input.length * 2);
  var view = new DataView(buffer);
  for (var i = 0; i < input.length; i++, offset += 2) {
    var s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return Buffer.from(buffer);
};

function App() {
  const [customLabelText, setCustomLabelText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fetchedPhotos, setFetchedPhotos] = useState([]);
  const [currentMicStream, setCurrentMicStream] = useState(null);
  const [disableMic, setDisableMic] = useState(false);
  const [searchPending, setSearchPending] = useState(false);
  const [uploadPending, setUploadPending] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState(null);
  const fileInput = useRef();

  const reader = new FileReader();
  reader.onloadend = () => setPreviewDataUrl(reader.result);

  const uploadPhoto = () => {
    setUploadPending(true);
    fetch(`${API_HOST}/upload`, {
      method: 'PUT',
      headers: {
        'custom-labels': customLabelText,
      },
      body: selectedFile
    }).then(res => res.text()).then((result) => {
        fileInput.current.value = null;
        setSelectedFile(null);
        setPreviewDataUrl(null);
        setUploadPending(false);
        setCustomLabelText('');
      },
      (err) => {
        console.log('HERE!!! there was an error');
        console.log(err);
        setUploadPending(false);
      }
    );
  }

  const searchPhotos = (text) => {
    if (!text) {
      setSearchPending(false);
      return;
    }
    setSearchPending(true);
    fetch(`${API_HOST}/search?q=${text}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    }).then(res => res.json()).then((result) => {
        setFetchedPhotos(result);
        setSearchPending(false);
      },
      (err) => {
        console.log('HERE!!! there was an error searching');
        console.log(err);
        setSearchPending(false);     
      }
    );
  }

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    reader.readAsDataURL(event.target.files[0]);
    setCustomLabelText('');
  }

  const handleUploadPhoto = (event) => {
    uploadPhoto();
    event.preventDefault();
  }

  const handleCustomLabelTextChange = (event) => {
    setCustomLabelText(event.target.value);
  }

  const handleSearchTextChange = (event) => {
    setSearchText(event.target.value);
  }

  const handleSearchPhotos = (event) => {
    searchPhotos(searchText);
    event.preventDefault();
  }

  const myTranscribeFunction = async () => {
    setSearchText('');
    const micStream = new MicrophoneStream();
    setCurrentMicStream(micStream);

    // this part should be put into an async function
    // micStream.resume()
    micStream.setStream(
      await window.navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      })
    );

    const audioStream = async function* () {
      for await (const chunk of micStream) {
        yield { AudioEvent: { AudioChunk: pcmEncodeChunk(chunk) /* pcm Encoding is optional depending on the source */ } };
      }
    };

    const command = new StartStreamTranscriptionCommand({
      LanguageCode: "en-US",
      MediaEncoding: "pcm",
      MediaSampleRateHertz: 44100,
      AudioStream: audioStream(),
    });
    const audResponse = await client.send(command);
    let transcript = '';
    for await (const event of audResponse.TranscriptResultStream) {
      if (event.TranscriptEvent) {
        // const message = event.TranscriptEvent;

        // Get multiple possible results
        const results = event.TranscriptEvent.Transcript.Results;

        // Print all the possible transcripts
        results.forEach((result) => {
          (result.Alternatives || []).forEach((alternative) => {
            transcript = alternative.Items.map((item) => item.Content).join(" ");
            setSearchText(transcript);
          });
        });
      }
    }

    setSearchPending(true);
    searchPhotos(transcript);
  }
  
  const myStopFunction = async () => {
    // add a little delay
    setDisableMic(true);
    setSearchPending(true);
    setTimeout(() => {
      currentMicStream.stop()
      setCurrentMicStream(null);
      setDisableMic(false);
    }, 2000)
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>
          Photobot
        </h1>
      </header>
      <h3>Upload a photo</h3>

      <form id='upload-form' onSubmit={handleUploadPhoto}>
        <label id='file-input-label' htmlFor='file-input'>
          {
            previewDataUrl 
            ? <img id='preview-image' src={previewDataUrl} />
            : <span>Choose a photo</span>
          }
          <input 
            ref={fileInput}
            id='file-input'
            type="file" 
            onChange={handleFileChange} 
          />
        </label>
        <label>
          Add some labels:&nbsp;
          <input type="text" value={customLabelText} onChange={handleCustomLabelTextChange} />
        </label>
        <button disabled={uploadPending || !selectedFile} type="submit">Upload</button>
      </form>

      <h3>-OR- Search for a label (ie, "dog")</h3>
      <form onSubmit={handleSearchPhotos}>
        Search by label:&nbsp;
        <input 
          placeholder={!!currentMicStream ? 'Listening...' : 'Type here or click the microphone'}
          type="text" 
          value={searchText} 
          onChange={handleSearchTextChange} 
        />
        <input 
          type="button"
          value="MIC"
          disabled={searchPending || disableMic || !!currentMicStream} 
          onClick={myTranscribeFunction}
        >
        </input>
        <input 
          type='button'
          value="STOP"
          disabled={searchPending || disableMic || !currentMicStream} 
          onClick={myStopFunction}>
        </input>
        <input 
          disabled={searchPending} 
          type="submit" 
          value={searchPending ? 'Searching...' : 'Search Photos'} 
        />
      </form>

      <p>
        Results will appear here
      </p>
      <div>
        {
          fetchedPhotos.map(photo => <img height="200px" src={photo.url} key={photo.url} />)
        }
      </div>
    </div>
  );
}

export default App;
