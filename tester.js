var fetch = require('node-fetch');

fetch(" https://infinite-peak-34901.herokuapp.com/scores",
    {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },

        method: "PUT",
        body: JSON.stringify({
            id:88085,
            visitCount:2,
            lastVisitTime:'2017-09-28T15:58:49.045Z',
            title:'Chrome Web Store - Extensions',
            url:'https://chrome.google.com/webstore/category/extensions?hl=en',
            id:18321,
            visitCount:183,
            lastVisitTime:'2017-09-28T15:57:04.884Z',
            title:'Safe Search',
            url:'https://search.norton.com/'
        })

        })
  
    .then(function(res){ console.log(res.status) });