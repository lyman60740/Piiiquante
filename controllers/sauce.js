const express = require('express');
const auth = require('../middleware/auth');
const multer = require('multer');
const router = express.Router();

const Sauce = require('../models/sauce');

exports.addSauce = (req, res, next) => {
  const sauce = JSON.parse(req.body.sauce);
  delete sauce._id;
  delete sauce._userId;
  const newSauce = new Sauce({
    userId: sauce.userId,
    name: sauce.name,
    manufacturer: sauce.manufacturer,
    description: sauce.description,
    mainPepper: sauce.mainPepper,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`, // Url de l'image générée par multer
    heat: sauce.heat,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
  });

  newSauce.save()
  .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
  .catch(error => { res.status(400).json( { error })})
};

exports.getAllSauce = (req, res, next) => {
   Sauce.find().then(
     (sauces) => {
       res.status(200).json(sauces);
     }
   ).catch(
     (error) => {
       res.status(400).json({
         error: error
       });
     }
   );
 };
 exports.getOneSauce = (req, res, next) => {
  Sauce.findById(req.params.id)
  .then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.deleteSauce = (req, res, next) => {
  const sauceId = req.params.id;
  const userId = req.auth.userId;

  Sauce.findOne({_id: sauceId})
    .then(sauce => {
      if (sauce.userId !== userId) {
        return res.status(401).json({error: "Not authorized"});
      }
      Sauce.deleteOne({_id: sauceId})
        .then(() => {
          res.status(200).json({message: 'Deleted!'});
        })
        .catch(error => {
          res.status(400).json({error});
        });
    })
    .catch(error => {
      res.status(500).json({error});
    });
};

exports.modifySauce = (req, res, next) => {
  const sauceId = req.params.id;
  const userId = req.auth.userId;

  Sauce.findOne({_id: sauceId})
    .then(sauce => {
      if (sauce.userId !== userId) {
        return res.status(401).json({error: "Not authorized"});
      }
      const updatedSauce = {
        name: req.body.name,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        heat: req.body.heat,
        userId: req.body.userId
      };
      Sauce.updateOne({_id: sauceId}, updatedSauce)
        .then(() => {
          res.status(201).json({message: 'Sauce updated successfully!'});
        })
        .catch(error => {
          res.status(400).json({error});
        });
    })
    .catch(error => {
      res.status(500).json({error});
    });
};


exports.likeSauce = (req, res, next) => {
  const userId = req.body.userId;
  const like = req.body.like;

  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (like === 1) {
        if (!sauce.usersLiked.includes(userId)) {
          sauce.usersLiked.push(userId);
          if (sauce.usersDisliked.includes(userId)) {
            sauce.usersDisliked = sauce.usersDisliked.filter(user => user != userId)
            sauce.dislikes -= 1;
          }
          sauce.likes += 1;
        }
      } else if (like === -1) {
        if (!sauce.usersDisliked.includes(userId)) {
          sauce.usersDisliked.push(userId);
          if (sauce.usersLiked.includes(userId)) {
            sauce.usersLiked = sauce.usersLiked.filter(user => user != userId) //supprime le userrId du tableau des likes
            sauce.likes -= 1;
          }
          sauce.dislikes += 1;
        }
      } else if (like === 0) {
        if (sauce.usersLiked.includes(userId)) {
          sauce.usersLiked = sauce.usersLiked.filter(user => user != userId)
          sauce.likes -= 1;
        } else if (sauce.usersDisliked.includes(userId)) {
          sauce.usersDisliked = sauce.usersDisliked.filter(user => user != userId)
          sauce.dislikes -= 1;
        }
      }

      sauce.save()
        .then(() => {
          res.status(200).json({ message: 'Notation ajoutée avec succès!' });
        })
        .catch(error => {
          res.status(400).json({ error });
        });
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};


 //TODO utiliser postman pour tester ( pas faire confiance au front)
 //TODO Faire le cours sur la sécurité manquant