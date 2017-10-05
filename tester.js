var fetch = require('node-fetch');

fetch(" http://localhost:5000/newsite/google_com/3",
    {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },

        method: "POST",
        body: JSON.stringify({0:{
            id:11111,
            visitCount:2,
            lastVisitTime:'2017-09-28T15:58:49.045Z',
            title:'Chrome Web Store - Extensions',
            url:'https://chrome.google.com/webstore/category/extensions?hl=en'},
            1:{
            id:22222,
            visitCount:183,
            lastVisitTime:'2017-09-28T15:57:04.884Z',
            title:'Safe Search',
            url:'https://search.norton.com/'}
        })

        })
  
    .then(function(res){ console.log(res.status) });