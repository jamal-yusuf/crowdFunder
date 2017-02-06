import React from 'react';
import {connect} from 'react-redux';
// import StripeCheckout from 'react-stripe-checkout';
import axios from 'axios';
import './viewProject.scss';

export default class Rewards extends React.Component {
  constructor(props) {
    super(props)


  }

  render() {
    return (
      <div className='rewardContainer'>

        <div className='rewards'>

          <div className='rewards-info'>
            <h2> Pledge $10 </h2>

            <p>At this level, we will add your name to the scrolling credits in the scratch versions of our game! See your name scroll past a bucolic campfire setting, in the company of adorable animated marshmallows. </p>
          </div>

        </div>

        <div className='rewards'>

          <div className='rewards-info'>
            <h2> Pledge $25 </h2>

            <p>We will list your name on the shout-out page of the website edition of the game! Find your name and click on it, and an animated marshmallow will appear and thank you by name, out loud! </p>
          </div>

        </div>

        <div className='rewards'>

          <div className='rewards-info'>
            <h2> Pledge $50 </h2>

            <p>Our winter-themed shout-out page works just like the summer one - find your name and click on it, and a chorus of animated marshmallows will appear in the game to thank you by name out loud! </p>
          </div>

        </div>
      </div>
    )
  }
}