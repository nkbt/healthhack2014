// npm install jsdom
//             jQuery

var fs = require('fs');
var jsdom = require("jsdom");
var jquery = fs.readFileSync("./node_modules/jquery/dist/jquery.js", "utf-8");

fs.readFile('./Demultiplex_Stats.htm', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }

  jsdom.env({
    html: data,
    src: [jquery],
    done: function (errors, window) {
      var $ = window.$;
      var parsed = ""; $("table:eq(0) tr th").each(function (index) { parsed += this.innerHTML
 + "," } ); for(var i = 0; i < $("table:eq(1) tr").size(); i++) { $("table:eq(1) tr:nth-child(" + i + ") td").each(function (index) { parsed += this.innerHTML + ","; } ); parsed += "\n"; } $("body").empty(); $("body").append(parsed)
      console.log(parsed);

      fs.writeFile('./parsed.csv', parsed);
    }
  });  
});

