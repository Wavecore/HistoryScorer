var fetch = require('node-fetch');

fetch(" http://localhost:5000/newsites/2",
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
            url:'chrome.google.com'},
            1:{
                id:22222,
                visitCount:183,
                lastVisitTime:'2017-09-28T15:55:04.884Z',
                title:'Safe Search',
                url:'search.norton.com'},
            2:{
                id:222555,
                visitCount:12,
                lastVisitTime:'2017-09-28T15:57:04.884Z',
                title:'Amazon',
                url:'http://www2.amazon.com/folder/page.html?q=1'},
            3:{
                id:33333,
                visitCount:13,
                lastVisitTime:'2017-09-28T15:51:33.483Z',
                title:'SWE 432',
                url:'http://www.piazza.com/aa'},
            4:{
                id:44444,
                visitCount:17,
                lastVisitTime:'2017-09-28T15:52:33.483Z',
                title:'SWE 432',
                url:'http://www.piazza.com/bb'}
        })

        })
  
    .then(function(res){ console.log("result: " + res.status) });