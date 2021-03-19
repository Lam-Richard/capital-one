import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDotCircle, faMapMarkerAlt, faCoins, faCalendarAlt, faPlaneDeparture } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import debounce from 'lodash.debounce';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import { subDays } from 'date-fns';


const COUNTRY = "US";
const LOCALE = "en-US";


const MyDatePicker = ({startDate, setStartDate, endDate, setEndDate, trip}) => {

  let both_name = "w-1/3 h-1/2 border rounded-md mx-2 flex flex-row items-center";
  let one_name = "w-1/6 h-1/2 border rounded-md mx-2 flex flex-row items-center";
  return (
    <div className={trip === 'one-way' ? one_name : both_name}>
      <FontAwesomeIcon icon={faCalendarAlt} class="h-1/3 ml-5"/>
      <div className="flex flex-row items-center">
        <div className="ml-6 font-sans text-2xl w-8/12 flex flex-row">
          <DatePicker 
          className="text-2xl w-10/12 border rounded-md" 
          placeholder={startDate}
          selected={startDate} 
          excludeDates={Array.from(Array(100).keys()).map((value) => subDays(new Date(), value))}
          onChange={date => setStartDate(date)} />
        </div>
        {trip === 'one-way' ? null : 
        <React.Fragment>
          <div className="text-xl font-sans">To</div>

          <div className="ml-6 font-sans text-2xl w-8/12 flex flex-row">
            <DatePicker 
            className="text-2xl w-10/12 border rounded-md" 
            placeholder={endDate}
            selected={endDate} 
            excludeDates={Array.from(Array(100).keys()).map((value) => subDays(new Date(), value))}
            disabledDays={[{before: new Date()}]}
            onChange={date => setEndDate(date)} />
          </div>
        </React.Fragment>
        }
      </div>
    </div>

    
  )
}

const Search = ({result, setResult, handleSubmit}) => {
  return (
    <div 
    onClick={handleSubmit}
    className="mt-5 w-1/6 h-auto py-2 font-sans text-2xl bg-gradient-to-r from-green-400 to-blue-500
                border rounded-3xl shadow-xl text-center cursor-pointer hover:opacity-50">
        Find Flights
    </div>

  )
}

const Results = ({result}) => {

  const [carriers, setCarriers] = useState({});
  const [places, setPlaces] = useState({});
  const [currency, setCurrency] = useState("");
  const [realResult, setRealResult] = useState([]);
  const [asc, setAsc] = useState(true);

  useEffect(()=> {
    if (result.hasOwnProperty('Quotes') && asc) {
      console.log(asc);
      let real_result = Object.entries(result['Quotes']).sort((a,b) => a[1]['MinPrice'] - b[1]['MinPrice'])
      console.log("bruh", real_result);
      setRealResult(real_result);
    } else if (result.hasOwnProperty('Quotes') && asc == false) {
      console.log(asc);

      let real_result = Object.entries(result['Quotes']).sort((a,b) => b[1]['MinPrice'] - a[1]['MinPrice'])
      console.log("bruh", real_result);
      setRealResult(real_result);
    }
  },[result, asc])




  function format () {
    if (result.hasOwnProperty('Quotes')) {
      let tempCarriers = {};
      let tempPlaces = {};
      for (let i = 0; i < result['Carriers'].length; ++i) {
        tempCarriers[result['Carriers'][[i]]['CarrierId']] = ' ' + result['Carriers'][[i]]['Name']
      }
      setCarriers(tempCarriers);
  
      for (let j = 0; j < result['Places'].length; ++j) {
        tempPlaces[result['Places'][j]['PlaceId']] = result['Places'][[j]]['Name']
      }
      setPlaces(tempPlaces);
      setCurrency(result['Currencies'][0]['Symbol']);
    }
  }

  function fromQuotes() { 
    return (
      <React.Fragment>
        <div className="h-3/5 w-11/12 border mt-2 flex flex-col items-center justify-start rounded-lg shadow-md overflow-y-auto">
          <br></br>
          <form className="flex flex-row-wrap items-center font-sans ml-8 mb-10">
                <input type="radio" id="asc" name="asc" value="asc" defaultChecked 
                onChange={() => setAsc(true)} ></input>
                <label for="asc">&nbsp; By ascending price &nbsp;</label>
                <input type="radio" id="desc" name="asc" value="desc" onChange={()=> {
                  setAsc(false)
              }}></input>
                <label for="desc">&nbsp; By descending price</label>
          </form>

          {realResult.map((value, index) => {
            let real_value = value[1];
            let real_name;
            if (index === 0) {
              real_name = "h-1/6 w-11/12 mx-10 mx-3 flex flex-col justify-center items-center border border-green-400 rounded-lg mb-3";
            } else {
              real_name = "h-1/6 w-11/12 mx-10 mx-3 flex flex-col justify-center items-center border rounded-lg mb-3";
            }
            return (
            <div key={index} className={real_name}>
              <div className="flex flex-row justify-between w-full ">
                <span className=" font-special text-2xl ml-5 mt-2 flex items-center"> 
                  <div className="font-sans text-gray-400 text-xl flex items-center">Depart from &nbsp;</div> 
                  {places[real_value['OutboundLeg']['OriginId']]}
                   <div className="font-sans text-gray-400 text-xl flex items-center">&nbsp; to &nbsp;</div> 
                   {places[real_value['OutboundLeg']['DestinationId']]}</span>
                <div className=" mr-3 font-sans text-xl flex items-center">Starting at {currency}{real_value['MinPrice']}</div>
              </div>
              <div className="flex flex-row justify-between w-full ">
                <div className=" ml-5 font-sans text-xl flex items-center">Airline(s): {carriers[real_value['OutboundLeg']['CarrierIds'][0]]} {carriers[real_value['OutboundLeg']['CarrierIds'][0]] === carriers[real_value['OutboundLeg']['CarrierIds'][0]] ? null : carriers[real_value['OutboundLeg']['CarrierIds'][0]]}</div>
                {/* <div className=" mr-3 font-sans text-xl flex items-center">As of {moment(value['QuoteDateTime']).format('MM-DD-YYYY hh:mm:ss')}</div> */}
              </div>
            </div>
            )

          })}

        </div>
      </React.Fragment>
    )
  }
  
  useEffect(()=> {
    format();
    // console.log("Raw result: ", result)
    // console.log("Formatted carriers: ", carriers)
    // console.log("Formatted places: ", places)
  },[result])

  return (
    <React.Fragment>
      {result.hasOwnProperty('Quotes') ? fromQuotes() : null}
    </React.Fragment>
  )
}

const AsyncPicker = ({icon, placeholder, selected, setSelected, selector}) => {
  

  function handleQuery (query) {
    console.log("Query: ", query);
    if (query['inputValue'].length <= 2) {
      return "Start typing..."
    } else {
      return "No matches"
    }
  }

  return (
    <div className="w-1/5 h-1/2 border rounded-md mx-2 flex flex-row items-center">
      <FontAwesomeIcon icon={icon} class="h-1/3 ml-5"/>
      <div className="ml-3 font-sans text-2xl w-9/12">
        <AsyncSelect cacheOptions 
          noOptionsMessage={(value) => handleQuery(value)}
          loadOptions={debounce(selector, 200)} 
          placeholder={placeholder} 
          onChange={(value)=> setSelected(value)} ></AsyncSelect>
      </div>
    </div>
  )
}

const Picker = ({icon, placeholder, options, setSelected}) => {
  
  return (
    <div className="w-1/5 h-1/2 border rounded-md mx-2 flex flex-row items-center">
      <FontAwesomeIcon icon={icon} class="h-1/3 ml-5"/>
      <div className="ml-3 font-sans text-2xl w-9/12">
        <Select options={options} placeholder={placeholder}  onChange={(value)=> setSelected(value)}></Select>
      </div>
    </div>
  )
}

function App() {

  const [currencies, setCurrencies] = useState([]);
  const [asc, setAsc] = useState(true);

  
  useEffect(()=>{
    CurrenciesList().then((value)=> setCurrencies(value));
  },[])

  const [currency, setCurrency] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [result, setResult] = useState({});
  const [trip, setTrip] = useState('round-trip');


  useEffect(()=> {
    console.log({
      "from": from,
      "to": to,
      "currency": currency,
      "start date formatted": moment(startDate).format('YYYY-MM-DD'),
    })
    
  },[from, to, currency, startDate, endDate])

  async function getCurrencies() {
    let result = await fetch("https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/reference/v1.0/currencies", {
      "method": "GET",
      "headers": {
        "x-rapidapi-key": "c4183e431bmsh3821e76fa254d77p1fcadfjsn9872ab324399",
        "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com"
      }
    });
    return result.json();
  }

  async function CurrenciesList() {
    let options = [];
    let result = await getCurrencies().then((result) => {
      if (result.hasOwnProperty('Currencies')) {
        for (let i=0; i < result['Currencies'].length; ++i) {
          options.push({ value: result['Currencies'][i], label: result['Currencies'][i]['Code'] + " (" + result['Currencies'][i]['Symbol'] + ")"})
        }
      }
    }).then(()=> {
      return options;
    })
    return result;
  }

  async function getPlaces(query) {
    let result = await fetch(
      `https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/US/USD/en-US/?query=${query}`, {
      "method": "GET",
      "headers": {
        "x-rapidapi-key": "c4183e431bmsh3821e76fa254d77p1fcadfjsn9872ab324399",
        "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com"
      }
    });
    return result.json();
  }
  function PlacesList (input, callback) {
    if (input.length > 2) {
      let options = [];
      getPlaces(input).then((result) => {
        if (result.hasOwnProperty('Places')) {
          for (let i=0; i < result['Places'].length; ++i) {
            let label = result['Places'][i]['PlaceId'].replace("-sky", "")
            options.push({ value: result['Places'][i], label: result['Places'][i]['PlaceName'] + " (" + label + ")" })
          } 
        }
      }).then(()=> {
        callback(options);
      })  
    } else {
       callback([]);
    }
  }

  useEffect(()=> {
    if (trip !== 'round-trip') {
      setEndDate('');
    }
    console.log("Trip:", trip)
  },[trip])

  function handleSubmit () {
    if (trip === 'one-way') {
      if (!startDate || !from || !to || !currency) {
        alert("Please fill out all required fields.");
      }
      else {
        // Need a wrapper function that calls callBrowseQuotes
        // Wrapper function will need to store quotes into an array of objects in a state variable
        // And then if that array is ever non-empty, some rendering needs to happen
        callBrowseQuotes().then((value) => setResult(value));
      }
    }
    else if (trip === 'round-trip') {
      if (!startDate || !endDate || !from || !to || !currency) {
        alert("Please fill out all required fields.");
      }
      else if (startDate.getTime() >= endDate.getTime()) {
        alert("Time travel is not currently supported");
      }
      else {
        // Need a wrapper function that calls callBrowseQuotes
        // Wrapper function will need to store quotes into an array of objects in a state variable
        // And then if that array is ever non-empty, some rendering needs to happen
        callBrowseQuotes().then((value) => setResult(value));
      }
    }
   
  }

  async function callBrowseQuotes () {
    let real_from = from['value']['PlaceId']
    let real_to = to['value']['PlaceId']
    let real_start = moment(startDate).format("YYYY-MM-DD")
    let real_end;
    if (trip === 'round-trip') {
      real_end = moment(endDate).format("YYYY-MM-DD")
    } else {
      real_end = ''
    }
    let real_currency = currency['value']['Code']
    console.log("The reals:", {
      'real_from': real_from,
      'real_to': real_to,
      'real_start': real_start,
      'real_end': real_end,
      'real_currency': real_currency
    })
    let result = await fetch(`https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/${COUNTRY}/${real_currency}/${LOCALE}/${real_from}/${real_to}/${real_start}/${real_end}`, {
      "method": "GET",
      "headers": {
        "x-rapidapi-key": "c4183e431bmsh3821e76fa254d77p1fcadfjsn9872ab324399",
        "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com"
      }
    })
    return result.json();
  }
 
  return (
    <div className="w-screen h-screen border border-black flex justify-start 
                items-center flex-col">
      <br></br>
      <br></br>
      <br></br>
      <span className="w-auto h-auto font-sans text-6xl flex flex-row">
        <div>Flights &nbsp;</div>
        <FontAwesomeIcon icon={faPlaneDeparture}></FontAwesomeIcon>
      </span>

      <div className="w-11/12 h-1/6 border rounded-lg shadow-2xl mt-5 
                  flex flex-col justify-center">
          <br></br>
          <br></br>
          <br></br>
          <div className="flex flex row justify-start items-start">
            <form className="flex flex-row-wrap items-center font-sans ml-8">
                <input type="radio" id="round-trip" name="trip" value="round-trip" defaultChecked onChange={() => setTrip('round-trip')} ></input>
                <label for="round-trip">&nbsp; Round-trip &nbsp;</label>
                <input type="radio" id="one-way" name="trip" value="one-way" onChange={()=> {
                  setTrip('one-way');
                  setEndDate('');
              }}></input>
                <label for="one-way">&nbsp; One way</label>
            </form>
          </div>
          <div className="flex flex-row w-full h-full items-start ml-5">  
          <AsyncPicker icon={faDotCircle} placeholder={"Where from?"} selected={from} setSelected={setFrom} selector={PlacesList}/>
          <AsyncPicker icon={faMapMarkerAlt} placeholder={"Where to?"} selected={to} setSelected={setTo} selector={PlacesList}/>
          <MyDatePicker trip={trip} startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate}></MyDatePicker>
          <Picker icon={faCoins} placeholder={"Currency"} setSelected={setCurrency} options={currencies}/>
          </div>
      </div>
     <Search result={result} setResult={setResult} handleSubmit={handleSubmit}></Search>
     <Results result={result}></Results>
    </div>
  );
}

export default App;
