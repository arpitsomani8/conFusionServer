const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Favorites = require('../models/favorites');
const Dishes = require('../models/dishes');
const cors = require('./cors');
const favoriteRouter = express.Router();
var authenticate = require('../authenticate');
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

.get(cors.cors,authenticate.verifyUser,(req,res,next) => {
    Favorites
    .findOne({'user': req.user._id})
    .populate('user')
    .populate('dishes')
    
    
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next) => {
    Favorites.findOne({'user': req.user._id})
    .populate('user')
    .populate('dishes')
    
    
    .then((favorites) => {
        if (favorites===null){
            Favorites.create({user: req.user._id, dishes:[]})
            .then((favorites) => {
                

                    for (var i=0; i<req.body.length; i++) {
                    
                    if (favorites.dishes.indexOf(req.body[i]._id) === -1) {
                    
                    favorites.dishes.push(req.body[i]._id);
                    
                    }
                    
                    }   
                             
                    favorites.save()
                .then((favorites) => {
                    console.log('Dish added to favorites');
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                })    

            },  (err) => next(err));
        }

        else {
            
        
                for (var i=0; i<req.body.length; i++) {
                if (favorites.dishes.indexOf(req.body[i]._id) !== -1) {
                    console.log('Not Updated Favorites!');
                    res.json(favorites);
                  } else {
                    favorites.dishes.push(req.body[i]._id)
                    favorites.save()
                    .then((favorites) => {
                        console.log('Dish added to favorites');
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    })   
                } 
            }
        }
    },(err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next) => {
    Favorites.findOne({'user': req.user._id})
    .then((favorites)=> {
        if (favorites!==null){
            Favorites.findByIdAndRemove(favorites._id)
            .then((favorites) => {
                console.log('Dish deleted from favorites');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))   
        }
        else{
            var err = new Error('Favorites already empty');
            err.status=200;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));

});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

.get(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites');
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next) => {
    Favorites.findOne({'user': req.user._id})
    .then ((favorites) => {
    if (favorites)
    {
        if (favorites.dishes.indexOf(req.params.dishId)===-1)
        {
            favorites.dishes.push(req.params.dishId)
        
        favorites.save()
        .then((favorites) => {
        console.log('Dish added to favorites');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err)) 
            .catch((err) => next(err));
    }
    else{
        res.statusCode=403;
        res.end('dish already in favorites');
    }
}
else{
    Favorites.create({user: req.user._id, dishes:[req.params.dishId]})
    .then((favorites) => {
        console.log('Dish added to favorites');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err)) 
            .catch((err) => next(err));
    }
}, (err) => next(err)) 
.catch((err) => next(err));


})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next) => {
    Favorites.findOne({'user': req.user._id})
    .then((favorites)=> {
        Favorites.findById(favorites._id)
        .then((favorites)=> {
            var index=0
            for(var i =0; i<favorites.dishes.length;i++){
                if(favorites.dishes[i]===req.params.dishId)
                {index=i;
                break;}
                favorites.dishes.splice(index,1);
                favorites.save()
                .then((favorites) => {
                    console.log('Dish added to favorites');
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorites);
                        }, (err) => next(err)) 
                        .catch((err) => next(err));
                }
            }, (err) => next(err)) 
            
            
        }, (err)=> next(err))
        .catch((err) => next(err));
    })


module.exports = favoriteRouter;