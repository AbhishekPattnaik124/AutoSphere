import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../Header/Header';
import './Dealers.css';

const SearchCars = () => {
  const [cars, setCars] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [dealer, setDealer] = useState({});
  const [message, setMessage] = useState("Loading cars...");
  const { id } = useParams();

  const curr_url = window.location.href;
  const root_url = curr_url.substring(0, curr_url.indexOf("searchcars"));
  const inventory_url = root_url + `djangoapp/inventory/${id}`;
  const dealer_url = root_url + `djangoapp/dealer/${id}`;

  const fetchDealer = async () => {
    const res = await fetch(dealer_url);
    const retobj = await res.json();
    if (retobj.status === 200) {
      setDealer(retobj.dealer);
    }
  };

  const fetchCars = async () => {
    const res = await fetch(inventory_url);
    const retobj = await res.json();
    if (retobj.status === 200) {
      setCars(retobj.cars);
      populateMakesAndModels(retobj.cars);
      if (retobj.cars.length > 0) {
        setMessage("");
      } else {
        setMessage("No cars found.");
      }
    }
  };

  const populateMakesAndModels = (cars) => {
    let tmpMakes = [];
    let tmpModels = [];
    cars.forEach(car => {
      if (!tmpMakes.includes(car.make)) tmpMakes.push(car.make);
      if (!tmpModels.includes(car.model)) tmpModels.push(car.model);
    });
    setMakes(tmpMakes);
    setModels(tmpModels);
  };

  const setCarsmatchingCriteria = async (matchingCars) => {
    setCars(matchingCars);
    if (matchingCars.length === 0) {
      setMessage("No cars match the criteria.");
    } else {
      setMessage("");
    }
  };

  const SearchCarsByMake = async () => {
    let make = document.getElementById("make").value;
    let url = inventory_url;
    if (make !== "All") {
      url = url + "?make=" + make;
    }
    const res = await fetch(url);
    const retobj = await res.json();
    if (retobj.status === 200) {
      setCarsmatchingCriteria(retobj.cars);
    }
  };

  const SearchCarsByModel = async () => {
    let model = document.getElementById("model").value;
    let url = inventory_url;
    if (model !== "All") {
      url = url + "?model=" + model;
    }
    const res = await fetch(url);
    const retobj = await res.json();
    if (retobj.status === 200) {
      setCarsmatchingCriteria(retobj.cars);
    }
  };

  const SearchCarsByYear = async () => {
    let year = document.getElementById("year").value;
    let url = inventory_url;
    if (year !== "All") {
      url = url + "?year=" + year;
    }
    const res = await fetch(url);
    const retobj = await res.json();
    if (retobj.status === 200) {
      setCarsmatchingCriteria(retobj.cars);
    }
  };

  const SearchCarsByMileage = async () => {
    let mileage = document.getElementById("mileage").value;
    let url = inventory_url;
    if (mileage !== "All") {
      url = url + "?mileage=" + mileage;
    }
    const res = await fetch(url);
    const retobj = await res.json();
    if (retobj.status === 200) {
      setCarsmatchingCriteria(retobj.cars);
    }
  };

  const SearchCarsByPrice = async () => {
    let price = document.getElementById("price").value;
    let url = inventory_url;
    if (price !== "All") {
      url = url + "?price=" + price;
    }
    const res = await fetch(url);
    const retobj = await res.json();
    if (retobj.status === 200) {
      setCarsmatchingCriteria(retobj.cars);
    }
  };

  const reset = () => {
    document.getElementById("make").value = "All";
    document.getElementById("model").value = "All";
    document.getElementById("year").value = "All";
    document.getElementById("mileage").value = "All";
    document.getElementById("price").value = "All";
    fetchCars();
  };

  useEffect(() => {
    fetchCars();
    fetchDealer();
  }, []);

  return (
    <div>
      <Header />
      <div style={{ margin: "20px" }}>
        <h1 style={{ color: "grey" }}>Cars Inventory of {dealer.full_name}</h1>
        <div style={{ marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
          <div>
            <label>Make: </label>
            <select id="make" onChange={SearchCarsByMake} style={{ padding: "5px", borderRadius: "5px" }}>
              <option value="All">All</option>
              {makes.map(make => <option key={make} value={make}>{make}</option>)}
            </select>
          </div>
          <div>
            <label>Model: </label>
            <select id="model" onChange={SearchCarsByModel} style={{ padding: "5px", borderRadius: "5px" }}>
              <option value="All">All</option>
              {models.map(model => <option key={model} value={model}>{model}</option>)}
            </select>
          </div>
          <div>
            <label>Year: </label>
            <select id="year" onChange={SearchCarsByYear} style={{ padding: "5px", borderRadius: "5px" }}>
              <option value="All">All</option>
              <option value="2024">2024 or newer</option>
              <option value="2023">2023 or newer</option>
              <option value="2022">2022 or newer</option>
              <option value="2021">2021 or newer</option>
              <option value="2020">2020 or newer</option>
            </select>
          </div>
          <div>
            <label>Mileage: </label>
            <select id="mileage" onChange={SearchCarsByMileage} style={{ padding: "5px", borderRadius: "5px" }}>
              <option value="All">All</option>
              <option value="50000">Under 50,000</option>
              <option value="100000">50,000 - 100,000</option>
              <option value="150000">100,000 - 150,000</option>
              <option value="200000">150,000 - 200,000</option>
              <option value="200001">Over 200,000</option>
            </select>
          </div>
          <div>
            <label>Price: </label>
            <select id="price" onChange={SearchCarsByPrice} style={{ padding: "5px", borderRadius: "5px" }}>
              <option value="All">All</option>
              <option value="20000">Under 20,000</option>
              <option value="40000">20,000 - 40,000</option>
              <option value="60000">40,000 - 60,000</option>
              <option value="80000">60,000 - 80,000</option>
              <option value="80001">Over 80,000</option>
            </select>
          </div>
          <button className='btn btn-secondary' onClick={reset} style={{ padding: "5px 15px", borderRadius: "5px" }}>Reset</button>
        </div>

        <div style={{ marginTop: "20px" }}>
          {cars.length === 0 ? (
            <p style={{ fontSize: "20px" }}>{message}</p>
          ) : (
            <table className='table'>
              <thead>
                <tr>
                  <th>Make</th>
                  <th>Model</th>
                  <th>Year</th>
                  <th>Mileage</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car, index) => (
                  <tr key={index}>
                    <td>{car.make}</td>
                    <td>{car.model}</td>
                    <td>{car.year}</td>
                    <td>{car.mileage.toLocaleString()}</td>
                    <td>${car.price.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchCars;
