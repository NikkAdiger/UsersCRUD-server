const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://Admin:123321@ds247058.mlab.com:47058/library';
// const port = 8080;
const port = process.env.PORT || 8080;
const app = express();

var headers = require('./config/headers');
var db;
var ObjectID = require('mongodb').ObjectID;
app.use(bodyParser.urlencoded({extended: true}));

// app.use(express.static(__dirname + '/dist'));
// app.get('/*', function(req, res){
//     res.sendFile(__dirname + '/dist/index.html');
// })

//app.listen(process.env.PORT || 8080);

module.exports = MongoClient.connect(url, (err, client) => {
    if (err) return console.log(err);
    db = client.db('library');
    app.listen(port, () => {
        console.log('listening on:', port);
    })
});

app.use('*', function (req, res, next) {
    headers.setHeaders(res);
    next();
});

app.get('/', (req, res) => {
        var cursor = db.collection('quotes').find()
    }
);

app.get('/count', (req, res) => {
    db.collection('count').find().toArray((err, result) => {
        if (err) return console.log(err);
        res.send(result[0]);
    })
});

app.put('/count/:id', (req, res) => {
    const id = req.params.id;
    const details = {'_id': new ObjectID(id)};
    const count = {$set: {counts: req.body.counts}};
    db.collection('notes').updateOne(details, count, (err, result) => {
        if (err) {
            res.send({'error': 'An error has occurred'});
        } else {
            res.send(count);
        }
    });
});

app.get('/books', (req, res) => {
    db.collection('books').find().toArray((err, result) => {
        if (err) return console.log(err);

        res.send(result);
    })
});

app.post('/books', function (req, res) {

    var post = [];
    req.on('data', chuck => post.push(chuck)
    );

    req.on('end', function () {

        var body = JSON.parse(Buffer.concat(post));

        db.collection('books').insertOne(body, (err, result) => {
            if (err) {
                res.send({'error': 'An error has occurred'});
            } else {
                res.send(result.ops[0]);
            }
        });
    })
});

app.delete('/books/:id', (req, res) => {
    const id = req.params.id;
    const details = {'_id': new ObjectID(id)};

    db.collection('books').deleteOne(details, (err, result) => {
        if (err) {
            res.send({'error': 'An error has occurred'});
        } else {
            res.send(details);
        }
    });
});

app.put('/books/:id', (req, res) => {

    var post = [];
    req.on('data', chuck => post.push(chuck)
    );

    req.on('end', function () {

        var body = JSON.parse(Buffer.concat(post));
        var myquery = {_id: new ObjectID(body._id)};
        var newvalues = {
            $set: {
                author: body.author,
                tittle: body.tittle,
                date: body.date
            }
        };
        db.collection('books').findOneAndUpdate(myquery, newvalues, (err, result) => {
            if (err) {
                res.send({'error': 'An error has occurred'});
            } else {
                res.send(newvalues);
            }
        });
    })
});