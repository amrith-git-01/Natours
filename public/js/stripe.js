import axios from 'axios';
import { showAlert } from './alerts';
const Stripe = require('stripe');

export const bookTour = async tourId => {
  try{
    //get the checkout session from the server
    const stripe = Stripe('pk_test_51PomoIC6zkXNwy5OWnRq0ocRbav5l84irdxVgNoxOZoo5JmTbfPYifgcKg6nJfldxgLRen05K3ZrtKrqw8ANftIT00IxADTrb9');
    const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);


    //create check form + change credit card
    window.location.assign(session.data.session.url);
  }
  catch(err){
    console.log(err);
    showAlert('error', err);
  }
}