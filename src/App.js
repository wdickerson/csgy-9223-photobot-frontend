import logo from './logo.svg';
import './App.css';
import { useState } from 'react'

const API_DOMAIN = 'ybouz7fmod.execute-api.us-east-1.amazonaws.com/dev';

function App() {
  const [customLabelText, setCustomLabelText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fetchedPhotos, setFetchedPhotos] = useState([]);

  const uploadPhoto = () => {
    fetch(`https://${API_DOMAIN}/upload`, {
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
    fetch(`https://${API_DOMAIN}/search?q=${searchText}`, {
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

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Store and access your photos. Via CodePipeline!!
        </p>
      </header>
      <h3>Upload a photo</h3>

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

      <h3>-OR- Search for a post tag (ie, "python")</h3>
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
