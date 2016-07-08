'use strict'

const express = require('express');
const axios = require('axios');
const apicache = require('apicache').options({debug: true}).middleware;;
const router = express.Router();
const _ = require('underscore');
const imdbScrapper = require('./info_imdb_scrapper');
const youtubeSearch = require('youtube-search');
const theMovieBaseUrl = require('../properties').theMovieBaseUrl;
const theMovieToken = require('../properties').theMovieToken;
const youtubeKey = require('../properties').youtubeKey;

router.get('/info/:id',apicache('1 day'), function(req, res){
    req.apicacheGroup = req.params.id;
    let id = req.params.id;

    axios({method: 'GET',url: `${theMovieBaseUrl}${id}?api_key=${theMovieToken}&language=en`}).then((result) => {
        let data = result.data;
        let promise = new Promise((resolve, reject) => {
            imdbScrapper.infoByTitle(data.imdb_id, resolve, reject);
        });
        promise.then((response) => {
            _.extend(data, response);
            res.send(data);
        }).catch((err) => {
            console.error(err);
            res.send(data);
        });

    }).catch((data) => {
        console.error(data);
        res.status(400).send('Ooops something went wrong');
    });
});

router.get('/similar/:id', apicache('1 day'), function(req, res){
    req.apicacheGroup = req.params.id;
    let id = req.params.id;

    axios({method: 'GET', url: `${theMovieBaseUrl}${id}/similar?api_key=${theMovieToken}&language=en&page=1`}).then((result) => {
        res.send(result.data);
    }).catch((data) => {
        console.error(data);
        res,status(400).send('Ooops something went wrong');
    });
});

router.get('/video/:name', apicache('1 day'), function(req, res){
    req.apicacheGroup = req.params.name;
    let name = req.params.name;

    let opt = {
        maxResults: 5,
        key: youtubeKey
    };
    console.log(youtubeKey+" "+name);
    youtubeSearch(name, opt, (err, results) => {
        if(err){
            console.error(err);
            res.status(400).send('Ooops something went wrong');
            return;
        }

        res.send(results);
    });
});

module.exports = router;