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
                <a href="http://www.mywot.com"><img src="https://cdn-cf.mywot.net/files/friendbadges/friend_medium.png" alt="Friend of WOT" /></a>
                <hr></hr>
            </nav>
    );
    }
}

//{this.renderNav("history","History",{})}
//{this.renderNav("score","Score", {})}
export default Nav;
