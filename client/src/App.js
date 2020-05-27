import axios from 'axios';
import React from 'react';
import './App.css';

function App() {
  // React state hook to locally store our formData
  // which is the file data we want to upload (but may not)
  const [formData, setFormData] = React.useState();


  // handle btn clicking & video upload
  const btnOnClick = () => {
    // send post request at 8080 with the file form data for upload
    axios.post('http://localhost:8080/api/upload', formData,
      {
        headers: {
          // [IMPORTANT] specify the content type as multipart
          // otherwise formidable on the backend doesn't pick up this data
          // as something that it needs to parse
          'content-type': 'multipart/form-data'
        }
      })
      // if we get a 200 response back
      .then(response => console.log('Success', response.data))
      // if we get some error response back
      .catch(err => console.error('Upload failed', err))
  }

  // handling file choosing
  const fileUpload = (e) => {
    // target files are the files that the user picked (can be one or more if allowed)
    const files = e.target.files;

    if (files === null || files.length === 0) {
      console.log("null files");
      return;
    }

    // appending the local file to our FormData Buffer to send to our backend
    const _formData = new FormData();
    _formData.append('video', files[0]);

    // using the local state hooks in order to set our formData for upload
    // without uploading right away (button onClick handles the actual sending)
    setFormData(_formData);
  }

  return (
    <div className="App">
      <div>
        <input type="file" onChange={fileUpload} accept="video/*,application/pdf,application/txt" />
        <label>
          Upload file
        </label>
        <button onClick={btnOnClick}>Submit</button>
      </div>
    </div>
  );
}

export default App;