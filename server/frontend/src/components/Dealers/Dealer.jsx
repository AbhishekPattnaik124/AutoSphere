import React, { useState,useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import positive_icon from "../assets/positive.png"
import neutral_icon from "../assets/neutral.png"
import negative_icon from "../assets/negative.png"
import review_icon from "../assets/reviewbutton.png"
import Header from '../Header/Header';

const Dealer = () => {


  const [dealer, setDealer] = useState({});
  const [reviews, setReviews] = useState([]);
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [unreviewed, setUnreviewed] = useState(false);
  const [postReview, setPostReview] = useState(<></>)

  const [makeFilter, setMakeFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const filterCars = () => {
    let tempCars = cars;
    if(makeFilter) tempCars = tempCars.filter(car => car.make.toLowerCase().includes(makeFilter.toLowerCase()));
    if(modelFilter) tempCars = tempCars.filter(car => car.model.toLowerCase().includes(modelFilter.toLowerCase()));
    if(yearFilter) tempCars = tempCars.filter(car => car.year.toString().includes(yearFilter));
    setFilteredCars(tempCars);
  }

  useEffect(() => {
    filterCars();
  }, [makeFilter, modelFilter, yearFilter, cars]);

  let curr_url = window.location.href;
  let root_url = curr_url.substring(0,curr_url.indexOf("dealer"));
  let params = useParams();
  let id =params.id;
  let dealer_url = root_url+`djangoapp/dealer/${id}`;
  let reviews_url = root_url+`djangoapp/reviews/dealer/${id}`;
  let inventory_url = root_url+`djangoapp/inventory/${id}`;
  let post_review = root_url+`postreview/${id}`;
  
  const get_cars = async ()=>{
    const res = await fetch(inventory_url, {
      method: "GET"
    });
    const retobj = await res.json();
    
    if(Array.isArray(retobj)) {
      setCars(retobj)
    }
  }

  const get_dealer = async ()=>{
    const res = await fetch(dealer_url, {
      method: "GET"
    });
    const retobj = await res.json();
    
    if(retobj.status === 200) {
      let dealerobjs = Array.from(retobj.dealer)
      setDealer(dealerobjs[0])
    }
  }

  const get_reviews = async ()=>{
    const res = await fetch(reviews_url, {
      method: "GET"
    });
    const retobj = await res.json();
    
    if(retobj.status === 200) {
      if(retobj.reviews.length > 0){
        setReviews(retobj.reviews)
      } else {
        setUnreviewed(true);
      }
    }
  }

  const senti_icon = (sentiment)=>{
    let icon = sentiment === "positive"?positive_icon:sentiment==="negative"?negative_icon:neutral_icon;
    return icon;
  }

  useEffect(() => {
    get_dealer();
    get_reviews();
    get_cars();
    if(sessionStorage.getItem("username")) {
      setPostReview(<a href={post_review}><img src={review_icon} style={{width:'10%',marginLeft:'10px',marginTop:'10px'}} alt='Post Review'/></a>)

      
    }
  },[]);  


return(
  <div style={{margin:"20px"}}>
      <Header/>
      <div style={{marginTop:"10px"}}>
      <h1 style={{color:"grey"}}>{dealer.full_name}{postReview}</h1>
      <h4  style={{color:"grey"}}>{dealer['city']},{dealer['address']}, Zip - {dealer['zip']}, {dealer['state']} </h4>
      </div>
      <div style={{marginTop:"30px"}}>
        <h2 style={{color:"#2c3e50"}}>Car Inventory</h2>
        <div style={{marginBottom: "20px", display: "flex", gap: "10px"}}>
          <input type="text" placeholder="Filter Make" value={makeFilter} onChange={(e)=>setMakeFilter(e.target.value)} style={{padding: "8px", borderRadius: "5px", border: "1px solid #ddd"}} />
          <input type="text" placeholder="Filter Model" value={modelFilter} onChange={(e)=>setModelFilter(e.target.value)} style={{padding: "8px", borderRadius: "5px", border: "1px solid #ddd"}} />
          <input type="number" placeholder="Filter Year" value={yearFilter} onChange={(e)=>setYearFilter(e.target.value)} style={{padding: "8px", borderRadius: "5px", border: "1px solid #ddd"}} />
        </div>
        {filteredCars.length === 0 ? (
          <p>No cars matching filters.</p>
        ) : (
          <div className="inventory_container">
             <table className="table">
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
                  {filteredCars.map((car, index) => (
                    <tr key={index}>
                      <td>{car.make}</td>
                      <td>{car.model}</td>
                      <td>{car.year}</td>
                      <td>{car.mileage.toLocaleString()}</td>
                      <td>${car.price ? car.price.toLocaleString() : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}
      </div>

      <div style={{marginTop:"30px"}}>
      <h2 style={{color:"#2c3e50"}}>Customer Reviews</h2>
      <div class="reviews_panel">
      {reviews.length === 0 && unreviewed === false ? (
        <text>Loading Reviews....</text>
      ):  unreviewed === true? <div>No reviews yet! </div> :
      reviews.map(review => (
        <div className='review_panel'>
          <img src={senti_icon(review.sentiment)} className="emotion_icon" alt='Sentiment'/>
          <div className='review'>{review.review}</div>
          <div className="reviewer">{review.name} {review.car_make} {review.car_model} {review.car_year}</div>
        </div>
      ))}
      </div>
    </div>  
  </div>
)
}

export default Dealer
