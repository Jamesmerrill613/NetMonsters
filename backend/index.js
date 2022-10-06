const express = require('express');
const ax = require('axios');
const pokeapi = require("./pokeapi");
// import * as ax from 'axios';


const server = express();
const port = 3000;

function log()
{
    console.log("Server has started....");
}

function getRandColor(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    let r = Math.floor(Math.random() * 255)
    let g = Math.floor(Math.random() * 255)
    let b = Math.floor(Math.random() * 255)
    res.send({
    color: `rgb\(${r}\,${g}\,${b}\)`
  });
};

function pokemon_type_color(type)
{
  var color = 0xFFFFFF
  switch (type)
  {
    case 'normal': return 0xA8A77A;
    case 'fire': return 0xEE8130;
    case 'water': return 0x6390F0;
    case 'electric': return 0xF7D02C;
    case 'grass': return 0x7AC74C;
    case 'ice': return 0x96D9D6;
    case 'fighting': return 0xC22E28;
    case 'poison': return 0xA33EA1;
    case 'ground': return 0xE2BF65;
    case 'flying': return 0xA98FF3;
    case 'psychic': return 0xF95587;
    case 'bug': return 0xA6B91A;
    case 'rock': return 0xB6A136;
    case 'ghost': return 0x735797;
    case 'dragon': return 0x6F35FC;
    case 'dark': return 0x705746;
    case 'steel': return 0xB7B7CE;
    case 'fairy': return 0xD685AD;
  }
  console.log("Failed to match type color")
  console.log(type)
  return 0xFFFFFF
}

async function get_move_data(url)
{
  let res = await ax.get(url);
  let name = res.data.name;
  let accuracy = res.data.accuracy;
  let type = res.data.type.name;
  let power = res.data.power;
  let pp = res.data.pp;
  let damage_class = res.data.damage_class.name;
  return { name, accuracy, type, power, pp, damage_class }
}

async function get_evolution_name(species_url)
{
  const db_species = await ax.get(species_url);
  const db_chain = await ax.get(db_species.data.evolution_chain.url);
  let chain = db_chain.data.chain
  while ('evolves_to' in chain)
  {
    if (chain.evolves_to.length == 0) { break; }
    chain = chain.evolves_to[0]

  }
  return chain.species.name;
}

async function get_pokemon_from_online_db(id) {
  const res = await ax.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
  return res;
}

async function get_pokemon_data(id) {

  return await pokeapi.get_pokemon(id);


  const db_data = await get_pokemon_from_online_db(id);
  console.log("Catching %s", db_data.data.name)
  let evolves_to = await get_evolution_name(db_data.data.species.url);
  if (db_data.data.name != evolves_to)
  {
    console.log("Evolving to %s", evolves_to);
    return await get_pokemon_data(evolves_to)
  }

  let moves = [];
  // for (let i = db_data.data.moves.length-1 ; i >= 0; i--)
  // {
  //   let m = await get_move_data(db_data.data.moves[i].move.url)
  //   if (m.damage_class == "status")
  //   {
  //     continue;
  //   }
  //   moves.push(m);
  //   console.log(m.name)
  //   if (moves.length >= 4)
  //   {
  //     break;
  //   }
  // }

  while (moves.length < 4)
  {
    let i = Math.floor(Math.random() * db_data.data.moves.length);
    let m = await get_move_data(db_data.data.moves[i].move.url)
    if (m.damage_class == "status")
    {
      continue;
    }
    moves.push(m);
    // console.log("    %s", m.name)
  }

  const data = {
    id:id,
    name:db_data.data.name, 
    moves:moves, 
    height:db_data.data.height, 
    type:db_data.data.types[0].type.name, 
    sprites:{
      back:db_data.data.sprites.back_default,
      front:db_data.data.sprites.front_default
      },
    
      hp:db_data.data.stats[0].base_stat,
    attack:db_data.data.stats[1].base_stat,
    defense:db_data.data.stats[2].base_stat,
    special_attack:db_data.data.stats[3].base_stat,
    special_defense:db_data.data.stats[4].base_stat,
    speed:db_data.data.stats[5].base_stat,

    type:db_data.data.types[0].type.name,
    sub_type:(db_data.data.types.length > 1) ? sub_type = db_data.data.types[1].type.name : 'none',
    type_color:pokemon_type_color(db_data.data.types[0].type.name),
    weight:db_data.data.weight
    };

    if (data.sprites.back == null) {
      return await get_pokemon_data(6); //charizard
    }
  
  return data
}

async function get_pokemon(req, res) {
  console.log("Received request to get Pokemon")
  res.header("Access-Control-Allow-Origin", "*");

  let id = req.query.id

  const data = await get_pokemon_data(id)
  res.send(data);
}

server.get('/v1/net_monsters/get_pokemon', get_pokemon);
server.get('/v1/net_monsters/rand_color', getRandColor);

server.listen(port, log);
