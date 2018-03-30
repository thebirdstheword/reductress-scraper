var express = require("express");
var app = express();
// var db = require("./models");
var cheerio = require("cheerio");
var request = require("request");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");

//Use morgan logger for logging requests
var logger = require("morgan");
app.use(logger("dev"));

//handlebars set-up
var hbs = exphbs.create({
  // Specify helpers which are only registered on this instance.
  helpers: {
    foo: function(a) {
      return "FOO!" + a;
    },
    bar: function(b) {
      return "BAR!" + b;
    },
    inc: function(value) {
      return parseInt(value) + 1;
    },
    breaklines: function(text) {
      text = Handlebars.Utils.escapeExpression(text);
      text = text.replace(/(\r\n|\n|\r)/gm, "<br>");
      return new Handlebars.SafeString(text);
    }
  },
  defaultLayout: "main"
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

// Use body-parser for handling form submissions
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Sets up the Port
var PORT = 4020;
app.listen(PORT, function() {
  console.log("App listening on PORT " + PORT);
});

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// get routes
app.get("/", function(req, res) {
  res.render("index");
});

app.post("/scrape", function(req, res) {
  //scrape request
  request("https://www.reductress.com/", function(error, response, html) {
    if (error) throw error;
    var $ = cheerio.load(html);
    var results = [];
    $("header").each(function(i, element) {
      var result = {};
      var URL = $(element)
        .find($("h1"))
        .children()
        .attr("href");
      var title = $(element)
        .find($("h1"))
        .children()
        .text();
      var summary = $(element)
        .next()
        .find($(".entry-summary"))
        .children("p")
        .text();
      var image = $(element)
        .next()
        .find($("picture"))
        .children("source")
        .attr("data-srcset");

      result.title = title;
      result.URL = URL;
      result.summary = summary;
      result.image = image;
      result.buttonId = i;

      results.push(result);
      db.Article.create(result)
        .then(function(dbArticle) {
          // console.log(result)

          res.redirect("/articles");
        })
        .catch(function(err) {
          res.redirect("/articles");
        });
    });
  });
});
// })

app.get("/articles", function(req, res) {
  db.Article.find({}, function(err, response) {
    if (err) throw err;
    // console.log(response)
    res.render("index", {
      results: response
    });
  });
});
app.post("/saving", function(req, res) {
  console.log(req.body.URL, "line 109");
  db.Article.update({ URL: req.body.URL }, { $set: { saved: true } }, function(
    err,
    response
  ) {
    if (err) throw err;
    res.redirect("/articles");
  });
});

app.get("/saved", function(req, res) {
  db.Article.find({ saved: true }, function(err, response) {
    if (err) throw err;
    // console.log(response)
    res.render("saved", {
      results: response
    });
  });
});

app.post("/saved", function(req, res) {
  // console.log(req.body.URL)
  db.Article.update({ URL: req.body.URL }, { $set: { saved: false } }, function(
    err,
    response
  ) {
    if (err) throw err;
  });
  res.redirect("/saved");
});

app.post("/saveNote", function(req, res) {
  // console.log(req.body.URL)
  db.Article.update(
    { URL: req.body.URL },
    { $push: { note: req.body.note } },
    function(err, response) {
      if (err) throw err;
    }
  );
  res.redirect("/saved");
});
