import React, { Component } from 'react';
import './WebRanking.css';

class WebRanking extends Component {
    render() {
        return (
            <div>
                <aside>
                    <div>Top Scoring Site</div>
                    <img id="GoodIcon" src="Uiconstock-Socialmedia-Amazon.ico" class="image"></img><br />
                    <a id="GoodURL" href="http://amazon.com" target="_blank">amazon.com</a><br/>
                    <span>Trustworthiness: </span>
                    <div id="GoodTrustworhtiness"> 94</div>
                    <span>Child Safety: </span>
                    <div id="GoodChildSafety"> 94</div>
                    <span>Visits: </span>
                    <div id="GoodVisits"> 8341252</div>
                    <span>Risks: </span>
                    <div id="GoodRisks"> Online Tracking, Other</div>
                </aside>
                <aside>
                    <div>Worse Scoring Site</div>
                    <img id="BadIcon" src="tpb_logo.png" class="image"></img><br />
                    <a id="BadURL" href="http://piratebay.com" target="_blank">piratebay.com</a><br/>
                    <span>Trustworthiness: </span>
                    <div id="BadTrustworthiness"> 22</div>
                    <span>Child Safety: </span>
                    <div id="BadChildSafety"> 13</div>
                    <span>Visits: </span>
                    <div id="BadVisits"> 435932</div>
                    <span>Risks: </span>
                    <div id="BadRisks"> Malware or viruses, Phishing, Scam, Adult content</div>
                </aside>
            </div>
        );
    }
}

export default WebRanking;
