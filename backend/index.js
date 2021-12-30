const express = require('express');
const ax = require('axios');
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

async function get_pokemon_from_online_db(id) {
  const res = await ax.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
  return res;
}

async function get_pokemon_data(id) {
  const db_data = await get_pokemon_from_online_db(id);

  const data = {
    id:id,
    name:db_data.data.name, 
    // moves:db_data.data.moves, 
    height:db_data.data.height, 
    type:db_data.data.types[0].type.name, 
    sprites:{
      back:db_data.data.sprites.back_default,
      front:db_data.data.sprites.front_default
      }
    };

    if (data.sprites.back == null) {
      return await get_pokemon_data(6); //charizard
    }
  
  return data
}

async function get_pokemon(req, res) {
  res.header("Access-Control-Allow-Origin", "*");

  let id = req.query.id

  // const db_data = await get_pokemon_from_online_db(id);

  // const data = {
  //   name:db_data.data.name, 
  //   // moves:db_data.data.moves, 
  //   height:db_data.data.height, 
  //   type:db_data.data.types[0].type.name, 
  //   sprites:{
  //     back:db_data.data.sprites.back_default,
  //     front:db_data.data.sprites.front_default
  //     }
  //   };


  const data = await get_pokemon_data(id)
  console.log(data)
  res.send(data);
}

server.get('/v1/net_monsters/get_pokemon', get_pokemon);
server.get('/v1/net_monsters/rand_color', getRandColor);



server.listen(port, log);
