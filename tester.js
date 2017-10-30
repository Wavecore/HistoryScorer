var fetch = require('node-fetch');

fetch("http://localhost:5000/convertRisks/?risks=101,201",
    {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },

        method: "GET"
    })
    .then(function(res) {
        console.log("result: " + res.status)
        res.json().then((json) => {
            console.log(json);
        });
    });