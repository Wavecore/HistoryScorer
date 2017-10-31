var fetch = require('node-fetch');

fetch("http://localhost:5000/convertRisks/?risks=101,201",
    {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },

        method: "GET",
       // body: //JSON.stringify({0:"demo.com",1:"chrome.google.com",2:"does not exist"})
        //JSON.stringify(
            /*{0:{
         id:11111,
         visitCount:2,
         lastVisitTime:'2017-09-28T15:58:49.045Z',
         title:'Chrome Web Store - Extensions',
         url:'chrome.google.com'},
         1:{
             id:22222,
             visitCount:183,
             lastVisitTime:'2017-09-28T15:55:04.884Z',
             title:'Safe Search Norton',
             url:'www.youtube.com'},
         2:{
             id:222555,
             visitCount:225,
             lastVisitTime:'2017-09-28T15:57:04.884Z',
             title:'Amazon',
             url:'http://www2.amazon.com/folder/page.html?q=1'},
         3:{
             id:33333,
             visitCount:13,
             lastVisitTime:'2017-09-28T15:51:33.483Z',
             title:'SWE 432',
             url:'www.piazza.com/aa'},
         4:{
             id:44444,
             visitCount:17,
             lastVisitTime:'2017-09-28T15:52:33.483Z',
             title:'SWE 432',
             url:'http://www.piazza.com/bb'},
         5:{
             id:44444,
             visitCount:17,
             lastVisitTime:'2017-09-28T15:52:33.483Z',
             title:'Demo',
             url:'www.demo.com'},
         6:{
             id:44444,
             visitCount:17,
             lastVisitTime:'2017-09-28T15:52:33.483Z',
             title:'Demo',
             url:'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach'},
         7:{
             id:44444,
             visitCount:375,
             lastVisitTime:'2017-09-28T15:52:33.483Z',
             title:'Demo',
             url:'http://regexr.com/foo.html?q=bar'},
         8:{
             id:44444,
             visitCount:300,
             lastVisitTime:'2017-09-28T15:52:33.483Z',
             title:'Demo',
             url:'piratebay.com'},
            9:{
                id:44444,
                visitCount:300,
                lastVisitTime:'2017-09-28T15:52:33.483Z',
                title:'Demo',
                url:'chia-anime.tv'}
     }
     */
      //     {"chrome.google.com":{"visitCount":2,"lastVisitTime":"2017-09-28T15:58:49.045Z","title":"Chrome Web Store - Extensions","url":"chrome.google.com"},"youtube.com":{"visitCount":183,"lastVisitTime":"2017-09-28T15:55:04.884Z","title":"Safe Search Norton","url":"youtube.com"},"amazon.com":{"visitCount":225,"lastVisitTime":"2017-09-28T15:57:04.884Z","title":"Amazon","url":"amazon.com"},"piazza.com":{"visitCount":30,"lastVisitTime":"2017-09-28T15:51:33.483Z","title":"SWE 432","url":"piazza.com"},"demo.com":{"visitCount":17,"lastVisitTime":"2017-09-28T15:52:33.483Z","title":"Demo","url":"demo.com"},"developer.mozilla.org":{"visitCount":17,"lastVisitTime":"2017-09-28T15:52:33.483Z","title":"Demo","url":"developer.mozilla.org"},"regexr.com":{"visitCount":375,"lastVisitTime":"2017-09-28T15:52:33.483Z","title":"Demo","url":"regexr.com"},"piratebay.com":{"visitCount":300,"lastVisitTime":"2017-09-28T15:52:33.483Z","title":"Demo","url":"piratebay.com"},"chia-anime.tv":{"visitCount":300,"lastVisitTime":"2017-09-28T15:52:33.483Z","title":"Demo","url":"chia-anime.tv"}}
        //    )
    })
    .then(function(res) {
        console.log("result: " + res.status)
        res.json().then((json) => {
            console.log(json);
        });
    });