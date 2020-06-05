import React , { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import './styles.css';
import logo from '../../assets/logo.svg';
import { Link, useHistory} from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map , TileLayer , Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet'
import api from '../../services/api';
import Dropzone from '../../components/Dropzone';
import axios from 'axios';

interface ItemsData {
  id:number;
  title:string;
  image_url:string;
}

interface UfsData {
  id:number;
  sigla:string;
  nome:string;
}

interface CitiesData {
  id:number;
  nome:string;
}


const CreatePoint: React.FC = () =>{

  const [items, setItems] = useState<ItemsData[]>([]);
  const [ufs , setUfs] = useState<UfsData[]>([]);
  const [cities , setCities] = useState<CitiesData[]>([]);
  const [ufSelected, setUfSelected] = useState('0');
  const [citySelected, setCitySelected] = useState('0');
  const [itemsSelecteds, setItemsSelecteds] = useState<number[]>([]);
  const [inicialPosition,setInitialPosition] = useState<[number,number]>([0,0]);
  const [PositionMap,setPositionMap] = useState<[number,number]>([0,0]);
  const [selectedFile, setSelectedFile] = useState<File>()
  const [formData,setFormData] = useState({
    name:'',
    email:'',
    whatsapp:''
  });

  const history = useHistory();

  useEffect(()=>{
    navigator.geolocation.getCurrentPosition(position => {
      const {latitude, longitude} = position.coords;

      setInitialPosition([latitude,longitude])
    })
  },[])

  useEffect(()=>{
    api.get('items').then( response => {
      setItems(response.data);
    })
  },[])

  useEffect(()=>{
    axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then( response => {
      setUfs(response.data)
    })
  },[])

  useEffect(()=>{
    if(ufSelected === '0'){
      return
    }
    axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufSelected}/municipios`).then( response => {
      setCities(response.data)
    })
  },[ufSelected])

  function handleInput(event:ChangeEvent<HTMLInputElement>){
    const { name , value } = event.target; 

    setFormData({
      ...formData,
      [name]:value,
    })
  }

  function handleSelectItem(id:number){

    const alreadySelected = itemsSelecteds.findIndex(item => item === id);
    if(alreadySelected >= 0){
      setItemsSelecteds((state) => state.filter(item => item !== id));
      return
    }
    setItemsSelecteds([...itemsSelecteds, id])

  }

  function handleSelectUf(event:ChangeEvent<HTMLSelectElement>){
    const value = event.target.value;

    setUfSelected(value);
  }

  function handleSelectCity(event:ChangeEvent<HTMLSelectElement>){
    const value = event.target.value;

    setCitySelected(value);
  }

  function handleMapClick(event: LeafletMouseEvent){
    const { lat , lng } = event.latlng;

    setPositionMap([lat, lng])
  }

  async function handleSubmit(event:FormEvent){
    event.preventDefault();

    const { name, email , whatsapp } = formData;
    const items = itemsSelecteds;
    const city = citySelected;
    const uf = ufSelected;
    const [ latitude, longitude] = PositionMap;

    const data = new FormData();

    data.append('name',name);
    data.append('email',email);
    data.append('whatsapp',whatsapp);
    data.append('city',city);
    data.append('uf',uf);
    data.append('latitude',String(latitude));
    data.append('longitude',String(longitude));
    data.append('items', items.join(','));

    if(selectedFile){
      data.append('image', selectedFile);
    }
 
    await api.post('/points', data);
    alert('ponto cadastrado com sucesso!')
    history.push('/');
  }
  return (
    <div id="page-create-point">
        <header>
          <img src={logo} alt="ecoleta" />

          <Link to="/">
            <FiArrowLeft />
            Voltar para home
          </Link>
        </header>
        <form onSubmit={handleSubmit}>
          <h1>Cadastro do <br/> ponto de coleta</h1> 

          <Dropzone onFileUpload={setSelectedFile}/>

          <fieldset>
            <legend>
              <h2>dados</h2>
            </legend>
            <div className="field">
              <label htmlFor="name">Nome da entidade</label>
              <input type="text" name="name" id="name" onChange={handleInput}/>
            </div>
            <div className="field-group">
              <div className="field">
                <label htmlFor="email">email</label>
                <input type="email" name="email" id="email" onChange={handleInput}/>
              </div>
              <div className="field">
                <label htmlFor="whatsapp">whatsapp</label>
                <input type="text" name="whatsapp" id="whatsapp" onChange={handleInput} />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Endereço</h2>
              <span>selecione o endereço no mapa</span>
            </legend>
            <Map center={inicialPosition} zoom={14} onClick={handleMapClick}>
              <TileLayer 
                attribution='&amp;copy <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={PositionMap}/>
            </Map>
            <div className="field-group">
              <div className="field">
                <label htmlFor="uf">Estado (UF)</label>
                <select name="uf" value={ufSelected} id="uf" onChange={handleSelectUf} >
                <option value="0"> selecione uma Estado (UF)</option>
                  {ufs.map(uf =>
                    <option 
                      key={uf.id} 
                      value={uf.sigla}>{uf.nome} - ({uf.sigla})
                    </option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="city">Cidade</label>
                <select name="city" value={citySelected} id="city" onChange={handleSelectCity} >
                  <option value="0">Selecione uma cidade</option>
                  {cities.map(city =>
                    <option 
                      key={city.id} 
                      value={city.nome}>{city.nome}
                    </option>)}
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Ítens de coleta</h2>
              <span>selecione um ou mais itens abaixo</span>
            </legend>
            <ul className="items-grid">
              {
                items.map(item => (
                  <li 
                    key={item.id} 
                    onClick={()=> handleSelectItem(item.id)} 
                    className={itemsSelecteds.includes(item.id)?'selected':''}>
                      <img src={item.image_url} alt="oleo" />
                      <span>{item.title}</span>
                  </li>
                ))
              }
              
            </ul>
          </fieldset>
          <button type="submit">Cadastrar ponto de coleta</button>
        </form>
    </div>  
  )
}

export default CreatePoint;