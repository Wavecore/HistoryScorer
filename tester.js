var fetch = require('node-fetch');

fetch(" https://infinite-peak-34901.herokuapp.com/scores",
    {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method:  "GET",
        body:JSON.stringify({1:"hi",2:'Hello',3:"World"})
    })
    .then(function(res){ console.log(res.status) });