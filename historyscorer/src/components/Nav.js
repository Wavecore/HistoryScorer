import React, { Component } from 'react';
//import './Nav.css';


class Nav extends Component {
    constructor(props){
        super(props);
        this.move = props.move;
    }
    renderNav(destination,name,data){
        return(
            <button onClick={()=>{this.move(destination,data)}}>{name}</button>
        );
    }
    render() {
        return (
            <nav className="Nav">
                {this.renderNav("home","Home",{})}
                {this.renderNav("history","History",{})}
                {this.renderNav("score","Score",{"chrome.google.com":{"visitCount":2,"lastVisitTime":"2017-09-28T15:58:49.045Z","title":"Chrome Web Store - Extensions","url":"chrome.google.com"},"youtube.com":{"visitCount":183,"lastVisitTime":"2017-09-28T15:55:04.884Z","title":"Safe Search Norton","url":"youtube.com"},"amazon.com":{"visitCount":225,"lastVisitTime":"2017-09-28T15:57:04.884Z","title":"Amazon","url":"amazon.com"},"piazza.com":{"visitCount":30,"lastVisitTime":"2017-09-28T15:51:33.483Z","title":"SWE 432","url":"piazza.com"},"demo.com":{"visitCount":17,"lastVisitTime":"2017-09-28T15:52:33.483Z","title":"Demo","url":"demo.com"},"developer.mozilla.org":{"visitCount":17,"lastVisitTime":"2017-09-28T15:52:33.483Z","title":"Demo","url":"developer.mozilla.org"},"regexr.com":{"visitCount":375,"lastVisitTime":"2017-09-28T15:52:33.483Z","title":"Demo","url":"regexr.com"},"piratebay.com":{"visitCount":300,"lastVisitTime":"2017-09-28T15:52:33.483Z","title":"Demo","url":"piratebay.com"},"chia-anime.tv":{"visitCount":300,"lastVisitTime":"2017-09-28T15:52:33.483Z","title":"Demo","url":"chia-anime.tv"}}
                )}
            <hr></hr>
            </nav>
    );
    }
}

export default Nav;
