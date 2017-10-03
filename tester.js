var fetch = require('node-fetch');

fetch("http://localhost:5000/PUT/3650",
    {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "PUT"
    })
    .then(function(res){ console.log(res.status) });