var express = require('express');
var path = require("path");
var bodyParser = require('body-parser');
var mongo = require("mongoose");
const https = require('https')
const fs = require('fs')
const ChainpageAppId = 1
const ChainpostAppId = 2
    // The chain page url
    //var gChainPageUrl = "http://localhost:4200";
var gChainPageUrl = "http://linkgear.net:8092";
// Change the port in "mongo.service.ts" under src/app/_services
// rebuild $ng serve
var gPort = 8080;
var gDbServer = 'localhost';
var httpsRun = false;

var prearg = "";
process.argv.forEach(function(val, index, array) {
        //console.log(`prearg = ${prearg}, val = ${val}`);
        if (/^(-{1,2}port)$/.test(prearg) && !isNaN(val))
            gPort = parseInt(val);
        else if (/^(-{1,2}chainpageurl)$/.test(prearg) && val)
            gChainPageUrl = val;
        else if (/^(-{1,2}dbserver)$/.test(prearg) && val)
            gDbServer = val;
        else if (/^(-{1,2}https)$/.test(val))
            httpsRun = true;

        prearg = val.toLowerCase();
    })
    //console.log(`chainPageSite = ${gChainPageSite}`)
    //console.log(`port = ${gPort}`)
    //console.log(`dbServer = ${gDbServer}`)

var db = mongo.connect(`mongodb://${gDbServer}:27017/ChainPage`, function(err, response) {
    if (err) { console.log(err); } else { console.log('Connected to ' + db, ' + ', response); }
});


var app = express()
    //app.use(bodyParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
    //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Origin', gChainPageUrl);
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
    businessMainCategory: { type: String },
    businessSubCategory: { type: String },
    formType: { type: String },
    postedBy: { type: String },
    postedTime: { type: Number },
    comments: [CommentSchema],
    votes: [VoteSchema],
    pictures: [String],
    viewCount: { type: Number },
    region: { type: String },
    notification: { type: Boolean}
});
// ListingSchema.index({name: 'text', businessName: 'text',
// street: 'text', city: 'text', state: 'text', zip: 'text',
// country: 'text', email: 'text', service: 'text', servicingArea: 'text',
// businessMainCategory: 'text', businessSubCategory: 'text',
// service: 'text', servicingArea: 'text'
// });
ListingSchema.index({ '$**': 'text' });

var ChainPostSchema = new Schema({
    Title: { type: String },
    Channel: { type: String },
    Narrative: { type: String },
    formType: { type: String },
    Tags: [String],
    //data example for tags: ["goods","services"]
    postedBy: { type: String },
    postedTime: { type: Number },
    pictures: [String],
    viewCount: { type: Number },
    comments: [CommentSchema],
    votes: [VoteSchema],
    notification: { type: Boolean}
});
ChainPostSchema.index({ Tags: 'text' });

var modelChainPage = mongo.model('Listing', ListingSchema);
var modelChainPost = mongo.model('Post', ChainPostSchema);

app.post("/api/saveListing", function(req, res) {
    //var mod = new modelChainPage(req.body);
    var model;
    if (req.body.appId == ChainpageAppId) {
        model = new modelChainPage(req.body);
    } else if (req.body.appId == ChainpostAppId) {
        model = new modelChainPost(req.body);
        console.log("====model====:" + model);
    }

    model.save(function(err, data) {
        if (err) {
            res.send(err);
        } else {
            console.log(data._id)
            res.send(data._id);
        }
    });
})

app.post("/api/updateListing", function(req, res) {
    //var mod = new model(req.body);
    // console.log(req.body._id)
    var model;
    if (req.body.appId == ChainpageAppId) {
        model = modelChainPage;
        model.update({ _id: req.body._id }, {
                "$set": {
                    name: req.body.name,
                    businessName: req.body.businessName,
                    street: req.body.street,
                    city: req.body.city,
                    state: req.body.state,
                    zip: req.body.zip,
                    country: req.body.country,
                    email: req.body.email,
                    phone: req.body.phone,
                    webPage: req.body.webPage,
                    service: req.body.service,
                    servicingArea: req.body.servicingArea,
                    businessHour: req.body.businessHour,
                    businessMainCategory: req.body.businessMainCategory,
                    businessSubCategory: req.body.businessSubCategory,
                    formType: req.body.formType,
                    postedBy: req.body.postedBy,
                    postedTime: req.body.postedTime,
                    pictures: req.body.pictures,
                    notification: req.body.notification
                }
            }, { upsert: true },
            function(err) {
                if (err) {
                    res.send(err);
                } else {
                    res.send({ data: "Record has been updated..!!" });
                }
            });
    } else if (req.body.appId == ChainpostAppId) {
        model = modelChainPost;
        model.update({ _id: req.body._id }, {
                "$set": {
                    Title: req.body.Title,
                    Channel: req.body.Channel,
                    Narrative: req.body.Narrative,
                    formType: req.body.formType,
                    Tags: req.body.Tags,
                    postedBy: req.body.postedBy,
                    postedTime: req.body.postedTime,
                    pictures: req.body.pictures,
                    notification: req.body.notification
                }
            }, { upsert: true },
            function(err) {
                if (err) {
                    res.send(err);
                } else {
                    res.send({ data: "Record has been updated..!!" });
                }
            });
    }

})

app.post("/api/deleteListing", function(req, res) {
    console.log("ID to be deleted: " + req.body.id)
    var model;
    if (req.body.appId == ChainpageAppId) {
        model = modelChainPage;
    } else if (req.body.appId == ChainpostAppId) {
        model = modelChainPost;
    }
    model.remove({ _id: req.body.id }, function(err) {
        if (err) {
            res.send(err);
        } else {
            res.send({ data: "Record has been Deleted..!!" });
        }
    });
})

app.get("/api/getListings/:appId", function(req, res) {
    // console.log(req.params.appId)
    var model;
    var filter = {};
    if (req.params.appId == ChainpageAppId) {
        model = modelChainPage;
    } else if (req.params.appId == ChainpostAppId) {
        model = modelChainPost;
        filter = { Narrative: 0 };
    }
    model.find({}, filter, function(err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send(data);
        }
    });
})

app.get("/api/getListingsByCat/:cat/:appId", function(req, res) {
    var model;
    if (req.params.appId == ChainpageAppId) {
        model = modelChainPage;
        model.find({ businessMainCategory: req.params.cat }, function(err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send(data);
            }
        });
    } else if (req.params.appId == ChainpostAppId) {
        model = modelChainPost;
        model.find({ Channel: req.params.cat }, function(err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send(data);
            }
        });
    }

})

app.get("/api/getListingsBySubcat/:subcat/:appId", function(req, res) {
    var model;
    if (req.params.appId == ChainpageAppId) {
        model = modelChainPage;
    } else if (req.params.appId == ChainpostAppId) {
        model = modelChainPost;
    }
    model.find({ businessSubCategory: req.params.subcat }, function(err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send(data);
        }
    });
})

app.get("/api/getListing/:id/:appId", function(req, res) {
    var model;
    if (req.params.appId == ChainpageAppId) {
        model = modelChainPage;
    } else if (req.params.appId == ChainpostAppId) {
        model = modelChainPost;
    }
    model.findOne({ _id: req.params.id }, function(err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send(data);
        }
    });
})
app.get("/api/getViewCount/:id/:appId", function(req, res) {
    var model;
    if (req.params.appId == ChainpageAppId) {
        model = modelChainPage;
    } else if (req.params.appId == ChainpostAppId) {
        model = modelChainPost;
    }
    model.findOne({ _id: req.params.id }, function(err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send(data);
        }
    });
})
app.post("/api/incrementViewCount", function(req, res) {
    console.log("record id: " + req.body.id)
    var model;
    if (req.body.appId == ChainpageAppId) {
        model = modelChainPage;
    } else if (req.body.appId == ChainpostAppId) {
        model = modelChainPost;
    }
    model.update({ _id: req.body.id }, {
            "$inc": {
                "viewCount": 1
            }
        }, { upsert: true },
        function(err) {
            if (err) {
                res.send(err);
            } else {
                res.send({ data: "View count has been incremented..!!" });
            }
        });
})
app.post("/api/addComment", function(req, res) {
    console.log(req.body)
    var model;
    if (req.body.appId == ChainpageAppId) {
        model = modelChainPage;
    } else if (req.body.appId == ChainpostAppId) {
        model = modelChainPost;
    }
    model.update({ _id: req.body._id }, {
        "$push": {
            "comments": req.body.comment
        }
    }, function(err) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            // console.log(data);
            res.send({ data: "Comment has been inserted..!!" });
        }
    });
})

app.post("/api/updateComment", function(req, res) {
    var model;
    if (req.body.appId == ChainpageAppId) {
        model = modelChainPage;
    } else if (req.body.appId == ChainpostAppId) {
        model = modelChainPost;
    }
    model.update({ _id: req.body._id, "comments._id": req.body.comment._id }, {
        "$set": {
            "comments.$.comment": req.body.comment.comment,
            "comments.$.postedTime": req.body.comment.postedTime
        }
    }, function(err) {
        if (err) {
            res.send(err);
        } else {
            res.send({ data: "Comment has been updated..!!" });
        }
    });
})
app.post("/api/deleteComment", function(req, res) {
    var model;
    if (req.body.appId == ChainpageAppId) {
        model = modelChainPage;
    } else if (req.body.appId == ChainpostAppId) {
        model = modelChainPost;
    }
    model.findOneAndUpdate({ "comments._id": req.body.comment._id }, {
            "$pull": {
                "comments": { _id: req.body.comment._id }
            }
        }, { new: true },
        function(err) {
            if (err) {
                res.send(err);
            } else {
                res.send({ data: "Comment has been deleted..!!" });
            }
        });
})
app.post("/api/addVote", function(req, res) {
    console.log(req.body)
    var model;
    if (req.body.appId == ChainpageAppId) {
        model = modelChainPage;
    } else if (req.body.appId == ChainpostAppId) {
        model = modelChainPost;
    }
    model.update({ _id: req.body._id }, {
        "$push": {
            "votes": req.body.vote
        }
    }, function(err) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            // console.log(data);
            res.send({ data: "Vote has been inserted..!!" });
        }
    });
})
app.post("/api/deleteVote", function(req, res) {
    var model;
    if (req.body.appId == ChainpageAppId) {
        model = modelChainPage;
    } else if (req.body.appId == ChainpostAppId) {
        model = modelChainPost;
    }
    model.findOneAndUpdate({ "votes._id": req.body.vote._id }, {
            "$pull": {
                "votes": { _id: req.body.vote._id }
            }
        }, { new: true },
        function(err) {
            if (err) {
                res.send(err);
            } else {
                res.send({ data: "Vote has been deleted..!!" });
            }
        });
})

app.get("/api/searchListings/:searchtext/:appId", function(req, res) {
    var model;
    console.log(req.params.searchtext + "" + req.params.appId)
    if (req.params.appId == ChainpageAppId) {
        model = modelChainPage;
    } else if (req.params.appId == ChainpostAppId) {
        model = modelChainPost;
    }
    model.find({ $text: { $search: req.params.searchtext } },
        function(err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send(data);
            }
        });
})

console.log(`https: ${httpsRun}`)
if (httpsRun) {
    const server = https.createServer({
        key: fs.readFileSync('keys/key.pem'),
        cert: fs.readFileSync('keys/cert.pem'),
    }, app)
    server.listen(gPort, function() {
        console.log(`dbServer app listening on HTTPS port ${gPort}.`)
    })
} else {
    app.listen(gPort, function() {
        console.log(`dbServer app listening on port ${gPort}.`)
    })
}