const api = "https://pokeapi.co/api/v2/"
const ax = require('axios');
const db = require("./db_tools.js");


// Returns data from PokeAPI for a single pokemon
// Can take id num or lowercase string name as parameter
async function get_pokemon(id)
{   
    let name = db.get_name_from_pokemon_id_map(id);
    console.log("Getting Pokemon:", id, name);
    if (db.pokemon_in_local_db(name)) { return db.load_pokemon_from_local_db(name)}
    console.log("Getting from PokeAPI:", name);
    let res = await ax.get(api + "pokemon/" + id);
    let data = {
        id:         res.data.id,
        name:       res.data.name,
        weight:     res.data.weight, // in in decagrams i.e. 905 = 90.5 kgs
        height:     res.data.height, // in decimeters i.e. 17 = 1.7 meters
        hp:         res.data.stats[0].base_stat,
        attack:     res.data.stats[2].base_stat,
        defense:    res.data.stats[3].base_stat,
        special_attack:     res.data.stats[4].base_stat,
        special_defense:    res.data.stats[5].base_stat,
        speed:              res.data.stats[0].base_stat,
        sprites: {
            front_default:      res.data.sprites.front_default,
            back_default:       res.data.sprites.back_default,
            front_shiny:        res.data.sprites.front_shiny,
            back_shiny:         res.data.sprites.back_shiny,
            front_female:       res.data.sprites.front_female,
            back_female:        res.data.sprites.back_female,
            front_shiny_female: res.data.sprites.front_shiny_female,
            back_shiny_female:  res.data.sprites.back_shiny_female,
        },
        species:    await get_species(res.data.species.name),
        abilities:  [],
        types:      [],
        moves:      [],
    };
    for(const a of res.data.abilities)
    {
        data.abilities.push(a.ability.name);
    }
    for(const t of res.data.types)
    {
        data.types.push(t.type.name)
    }
    for(const m of res.data.moves)
    {
        data.moves.push(await get_move(m.move.name))
    }
    db.save_pokemon_to_local_db(data);
    return data;
}

async function get_move(id)
{
    if (db.move_in_local_db(id)) { return db.load_move_from_local_db(id)}
    console.log("Getting move from PokeAPI:", id);
    let res = await ax.get(api + "move/" + id);
    let data = {
        name:           res.data.name,
        id:             res.data.id,
        accuracy:       res.data.accuracy,
        damage_class:   res.data.damage_class.name,
        power:          res.data.power,
        pp:             res.data.pp,
        type:           res.data.type.name,
        target:         res.data.target.name,
        priority:       res.data.priority,
    };
    db.save_move_to_local_db(data);
    return data;
}

async function get_species(id)
{
    if (db.species_in_local_db(id)) { return db.load_species_from_local_db(id)}
    console.log("Getting Species from PokeAPI:", id);
    let res = await ax.get(api + "pokemon-species/" + id);
    let data = {
        id:             res.data.id,
        name:           res.data.name,
        has_gender_differences: res.data.has_gender_differences,
        gender_rate:    res.data.gender_rate,
        is_baby:        res.data.is_baby,
        is_legendary:   res.data.is_legendary,
        is_mythical:    res.data.is_mythical,
        evolves_from:   (res.data.evolves_from_species) ? res.data.evolves_from_species.name : null,
        evolves_to:     [],
        varieties:      [],
    };
    for(const variety of res.data.varieties)
    {
        data.varieties.push(variety.pokemon.name)
    }
    if (res.data.evolution_chain != null)
    {
        let evo_chain_id = res.data.evolution_chain.url.split("/")[6]
        let chain = await get_evo_chain(evo_chain_id);
        data.evolves_to = recursive_parse_evo_chain(chain);
    }
    db.save_species_to_local_db(data);
    return data;
}

// Gets highest evolution(s) from chain
function recursive_parse_evo_chain(chain, name)
{
    let max_evolution = [];
    if (chain.evolves_to.length == 0) { return [ chain.name ]; }
    else
    {
        for (let i = 0; i < chain.evolves_to.length; i++)
        {
            let down_chain = recursive_parse_evo_chain(chain.evolves_to[i]);
            for (let j = 0; j < down_chain.length; j++)
            {
                max_evolution.push(down_chain[j]);
            }
        }
    }
    return max_evolution;
}

// Creates a chain of evolution pokemon names from evolution-chain API
function recursive_create_evo_chain(chain)
{
    let name = chain.species.name;
    console.log("Evolves to... " + chain.species.name);
    let evolves_to = [];
    for(let i = 0; i < chain.evolves_to.length; i++)
    {
        evolves_to.push(recursive_create_evo_chain(chain.evolves_to[i]));
    }
    data = { name: name, evolves_to: evolves_to }
    console.log( data );
    return data;
}

async function get_evo_chain(id)
{
    let name = db.get_name_from_species_id_map(id);
    if (db.evo_chain_in_local_db(name)) { return db.load_evo_chain_from_local_db(name); }
    console.log("Getting Evo Chain from PokeAPI:", id);
    let res = await ax.get(api + "evolution-chain/" + id);
    data = recursive_create_evo_chain(res.data.chain);
    data.id = id;
    db.save_evo_chain_to_db(data);
    return data;
}

module.exports = {
    get_pokemon,
    get_move,
    get_species,
    get_evo_chain
}