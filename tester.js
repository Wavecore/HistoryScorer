var fetch = require('node-fetch');

fetch(" https://infinite-peak-34901.herokuapp.com/PUT/3650",
    {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "PUT"
    })
    .then(function(res){ console.log(res.status) });