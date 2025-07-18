/**
 * API routes for NetMonsters
 */
const express = require('express');
const PokemonController = require('../controllers/pokemonController');

const router = express.Router();
const pokemonController = new PokemonController();

// Pokemon routes
router.get('/net_monsters/get_pokemon', (req, res) => pokemonController.getPokemon(req, res));
router.get('/net_monsters/rand_color', (req, res) => pokemonController.getRandomColor(req, res));

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

module.exports = router;
