import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import './styles.css';
import {FiUpload} from 'react-icons/fi';

interface Props {
  onFileUpload: (file:File) => void;
}

const Dropzone: React.FC<Props>= ({onFileUpload}) => {
  const [selectedFileUrl, setSelectedFileUrl] = useState('');
  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];;

    const fileUrl = URL.createObjectURL(file);

    setSelectedFileUrl(fileUrl);

    onFileUpload(file);
  }, [onFileUpload]);

  const {getRootProps, getInputProps} = useDropzone({
    onDrop,
    accept:'image/*'
  })

  return (
    <div {...getRootProps()} className="dropzone">
      <input {...getInputProps()} accept="image/*" />

      { selectedFileUrl 
          ? <img src={selectedFileUrl} alt="point thumbnail" />
          :(
            <p>
              <FiUpload />
              Imagem do estabelecimento 
            </p>
          )
      }
      
    </div>
  )
}

export default Dropzone;