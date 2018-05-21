var express = require('express');
var path = require("path");
var bodyParser = require('body-parser');
var mongo = require("mongoose");

var db = mongo.connect("mongodb://localhost:27017/ChainPage", function (err, response) {
    if (err) { console.log(err); }
    else { console.log('Connected to ' + db, ' + ', response); }
});


var app = express()
app.use(bodyParser());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));


app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

var Schema = mongo.Schema;
var CommentSchema = new Schema({
    comment: { type: String },
    postedBy: { type: String },
    postedTime: { type: Number }
});
var VoteSchema = new Schema({
    vote: { type: String },
    postedBy: { type: String },
    postedTime: { type: Number }
});
var ListingSchema = new Schema({
    name: { type: String },
    businessName: { type: String },
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    country: { type: String },
    email: { type: String },
    phone: { type: String },
    webPage: { type: String },
    service: { type: String },
    servicingArea: { type: String },
    businessHour: { type: String },
    businessCategory: { type: String },
    formType: { type: String },
    postedBy: { type: String },
    postedTime: { type: Number },
    comments: [CommentSchema],
    votes: [VoteSchema]
});


var model = mongo.model('Listing', ListingSchema);

app.post("/api/saveListing", function (req, res) {
    var mod = new model(req.body);
    mod.save(function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send({ data: "Record has been Inserted..!!" });
        }
    });
})

app.post("/api/updateListing", function (req, res) {
    var mod = new model(req.body);
    model.findByIdAndUpdate(req.body.id, 
        { 
            name: req.body.name, businessName: req.body.businessName
            , street: req.body.street, city: req.body.city, state: req.body.state
            , zip: req.body.zip, country: req.body.country, email: req.body.email
            , phone: req.body.phone, webPage: req.body.webPage, service: req.body.service
            , servicingArea: req.body.servicingArea, businessHour: req.body.businessHour, businessCategory: req.body.businessCategory
            , formType: req.body.formType, postedBy: req.body.postedBy, postedTime: req.body.postedTime
        },
        function (err, data) {
            if (err) {
                res.send(err);
            }
            else {
                res.send({ data: "Record has been Updated..!!" });
            }
        });
})

app.post("/api/deleteListing", function (req, res) {
    model.remove({ _id: req.body.id }, function (err) {
        if (err) {
            res.send(err);
        }
        else {
            res.send({ data: "Record has been Deleted..!!" });
        }
    });
})

app.get("/api/getListings", function (req, res) {
    model.find({}, function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(data);
        }
    });
})

app.get("/api/getListingsByCat/:cat", function (req, res) {
    model.find({ businessCategory: req.params.cat }, function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(data);
        }
    });
})

app.get("/api/getListing/:id", function (req, res) {
    model.findOne({ _id: req.params.id }, function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(data);
        }
    });
})
app.post("/api/addComment", function (req, res) {
    console.log(req.body)
    model.update(
        { _id: req.body._id },
        { 
            "$push": {
                "comments": req.body.comment
            }
        }, function (err) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        else {
            // console.log(data);
            res.send({ data: "Comment has been inserted..!!" });
        }
    });
})
app.post("/api/updateComment", function (req, res) {
    model.update(
        { _id: req.body._id, "comments._id": req.body.comment._id },
        { 
            "$set": {
                "comments.$.comment": req.body.comment.comment,
                "comments.$.postedTime": req.body.comment.postedTime
            }
        }, function (err) {
        if (err) {
            res.send(err);
        }
        else {
            res.send({ data: "Comment has been updated..!!" });
        }
    });
})
app.post("/api/deleteComment", function (req, res) {
    model.findOneAndUpdate(
        { "comments._id": req.body.comment._id },
        { 
            "$pull": {
                "comments": {_id: req.body.comment._id}
            }
        },
        {new: true},
        function (err) {
        if (err) {
            res.send(err);
        }
        else {
            res.send({ data: "Comment has been deleted..!!" });
        }
    });
})
app.post("/api/addVote", function (req, res) {
    console.log(req.body)
    model.update(
        { _id: req.body._id },
        { 
            "$push": {
                "votes": req.body.vote
            }
        }, function (err) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        else {
            // console.log(data);
            res.send({ data: "Vote has been inserted..!!" });
        }
    });
})
app.post("/api/deleteVote", function (req, res) {
    model.findOneAndUpdate(
        { "votes._id": req.body.vote._id },
        { 
            "$pull": {
                "votes": {_id: req.body.vote._id}
            }
        },
        {new: true},
        function (err) {
        if (err) {
            res.send(err);
        }
        else {
            res.send({ data: "Vote has been deleted..!!" });
        }
    });
})
app.listen(8080, function () {

    console.log('Example app listening on port 8080!')
})  