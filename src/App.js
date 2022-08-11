import logo from './logo.svg';
import './App.css';
// import { Buffer } from 'buffer'
import { useState } from 'react'
// import { MicrophoneStream } from 'microphone-stream'
// const micStream = require("microphone-stream");
// const micStream = require("microphone-stream");

import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
} from "@aws-sdk/client-transcribe-streaming";

const Buffer = require('buffer');

const MicrophoneStream = require('microphone-stream').default;


const client = new TranscribeStreamingClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'val',
    secretAccessKey: 'val',
  },
});



const API_HOST = 'taco';
// const API_HOST = process.env.REACT_APP_PHOTOBOT_API_HOST;

function App() {
  const [customLabelText, setCustomLabelText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fetchedPhotos, setFetchedPhotos] = useState([]);

  const uploadPhoto = () => {
    fetch(`${API_HOST}/upload`, {
      method: 'PUT',
      headers: {
        'custom-labels': customLabelText,
      },
      body: selectedFile
    }).then(res => res.text()).then((result) => {
        console.log('HERE!!! done posting');
        console.log(result);
      },
      (err) => {
        console.log('HERE!!! there was an error');
        console.log(err);
      }
    );

  }

  const searchPhotos = () => {
    fetch(`${API_HOST}/search?q=${searchText}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    }).then(res => res.json()).then((result) => {
        console.log('HERE!!! fetched photos');
        console.log(result);
        setFetchedPhotos(result);
      },
      (err) => {
        console.log('HERE!!! there was an error searching');
        console.log(err);      
      }
    );
  }

  const handleFileChange = (event) => {
    console.log('HERE!!! file change');
    console.log(event.target.files[0]);
    setSelectedFile(event.target.files[0]);
  }

  const handleUploadPhoto = (event) => {
    console.log('HERE!!!');
    console.log(event.target.input);
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
    searchPhotos();
    event.preventDefault();
  }





  // console.log('HERE!!! devices')
  // navigator.mediaDevices.getUserMedia({
  //   audio: true,
  //   video: false
  // }).then(res => {
  //   console.log(res)
  //   res.start()
  // });
  
  

  // const micStream = require("microphone-stream");
  // // this part should be put into an async function
  // micStream.setStream(
  //   await window.navigator.mediaDevices.getUserMedia({
  //     video: false,
  //     audio: true,
  //   })
  // );

  // const audioStream = async function* () {
  //   for await (const chunk of micStream) {
  //     yield { AudioEvent: { AudioChunk: pcmEncodeChunk(chunk) /* pcm Encoding is optional depending on the source */ } };
  //   }
  // };


  // const audioStream = async function* (device) {
  //   await device.start();
  //   while (device.ends !== true) {
  //     const chunk = await device.read();
  //     yield chunk; /* yield binary chunk */
  //   }
  // };
  


  // const command = new StartStreamTranscriptionCommand({
  //   // The language code for the input audio. Valid values are en-GB, en-US, es-US, fr-CA, and fr-FR
  //   LanguageCode: "en-US",
  //   // The encoding used for the input audio. The only valid value is pcm.
  //   MediaEncoding: "pcm",
  //   // The sample rate of the input audio in Hertz. We suggest that you use 8000 Hz for low-quality audio and 16000 Hz for
  //   // high-quality audio. The sample rate must match the sample rate in the audio file.
  //   MediaSampleRateHertz: 44100,
  //   AudioStream: audioStream(),
  // });

  // const myTestFunction = async () => {

  // }

  const myTranscribeFunciton = async () => {
  // async function myTranscribeFunciton ()  {

    console.log('HERE!!! in myTranscribeFunction')
    
    const micStream = new MicrophoneStream();

    // micStream.on('data', function(chunk) {
    //   // Optionally convert the Buffer back into a Float32Array
    //   // (This actually just creates a new DataView - the underlying audio data is not copied or modified.)
    //   // const raw = MicrophoneStream.toRaw(chunk)
    //   // console.log(raw)
  
    //   // note: if you set options.objectMode=true, the `data` event will output AudioBuffers instead of Buffers
    //  });

    // this part should be put into an async function
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
    const pcmEncodeChunk = (chunk) => {
      const input = micStream.toRaw(chunk);
      var offset = 0;
      var buffer = new ArrayBuffer(input.length * 2);
      var view = new DataView(buffer);
      for (var i = 0; i < input.length; i++, offset += 2) {
        var s = Math.max(-1, Math.min(1, input[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      }
      return Buffer.from(buffer);
    };
    const command = new StartStreamTranscriptionCommand({
      // The language code for the input audio. Valid values are en-GB, en-US, es-US, fr-CA, and fr-FR
      LanguageCode: "en-US",
      // The encoding used for the input audio. The only valid value is pcm.
      MediaEncoding: "pcm",
      // The sample rate of the input audio in Hertz. We suggest that you use 8000 Hz for low-quality audio and 16000 Hz for
      // high-quality audio. The sample rate must match the sample rate in the audio file.
      MediaSampleRateHertz: 44100,
      AudioStream: audioStream(),
    });
    const audResponse = await client.send(command);

    console.log('HERE!!! audResponse')
    console.log(audResponse)




    // const response = await client.send(command);
  }
  








  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Store and access your photos.
        </p>
      </header>
      <h3>Upload a photo</h3>

      <button onClick={myTranscribeFunciton}>TRANSCRIBE</button>

      <form onSubmit={handleUploadPhoto}>
        <label>
          Custom labels (comma separated):&nbsp;
          <input type="text" value={customLabelText} onChange={handleCustomLabelTextChange} />
        </label>
        <label>
          Your photo:&nbsp;
          <input type="file" onChange={handleFileChange} />
        </label>
        <button type="submit">Upload</button>
      </form>

      <h3>-OR- Search for a label (ie, "dog")</h3>
      <form onSubmit={handleSearchPhotos}>
        <label>
          Search by label:&nbsp;
          <input type="text" value={searchText} onChange={handleSearchTextChange} />
        </label>
        <input type="submit" value="Search Photos" />
      </form>


      <p>
        Put a photo here or something
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
