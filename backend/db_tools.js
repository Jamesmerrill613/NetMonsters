var DB_PATH = "./pokemon_db/"
var POKEMON_ID_MAP = DB_PATH + "pokemon_id_map.json"
var SPECIES_ID_MAP = DB_PATH + "species_id_map.json"
const fs = require("fs")
var getDirName = require('path').dirname;



// Maps pokemon id to name
function update_pokemon_id_map(id, name)
{
    console.log("Updating Pokemon ID Map")
    let map = {};
    if (does_file_exist(POKEMON_ID_MAP)) { map = require(POKEMON_ID_MAP); }
    if (isNaN(id)) { return; }
    if (!(id in map)) { map[id] = name; }
    let contents = JSON.stringify(map, null, 4)
    write_file(POKEMON_ID_MAP, contents, error_msg_cb);
}

function get_name_from_pokemon_id_map(id)
{
    if (does_file_exist(POKEMON_ID_MAP)) 
    { 
        let map = require(POKEMON_ID_MAP);
        if (id in map) { return map[id]; }
    }
    return id;
}

// Maps pokemon id to name
function update_species_id_map(id, name)
{
    console.log("Updating Species ID Map")
    let map = {};
    if (does_file_exist(SPECIES_ID_MAP)) { map = require(SPECIES_ID_MAP); }
    if (isNaN(id)) { return; }
    if (!(id in map)) { map[id] = name; }
    let contents = JSON.stringify(map, null, 4)
    write_file(SPECIES_ID_MAP, contents, error_msg_cb);
}

function get_name_from_species_id_map(id)
{
    if (does_file_exist(SPECIES_ID_MAP)) 
    { 
        let map = require(SPECIES_ID_MAP);
        if (id in map) { return map[id]; }
    }
    return id;
}

// Return true if file exists in DB
function does_file_exist(filename)
{
    try {
        if (fs.existsSync(filename)) { return true; }
    } catch(err) { console.log(err); }
    return false;
}

// Check if json exists in DB
function pokemon_in_local_db(name)
{
    return does_file_exist(DB_PATH + "pokemon/" + name + ".json");
}
function move_in_local_db(name)
{
    return does_file_exist(DB_PATH + "move/" + name + ".json");
}
function species_in_local_db(name)
{
    return does_file_exist(DB_PATH + "species/" + name + ".json");
}
function evo_chain_in_local_db(name)
{
    return does_file_exist(DB_PATH + "evo_chain/" + name + ".json");
}

// Load json from DB
function load_pokemon_from_local_db(name)
{
    return require(DB_PATH + "pokemon/" + name + ".json")
}
function load_move_from_local_db(name)
{
    return require(DB_PATH + "move/" + name + ".json")
}
function load_species_from_local_db(name)
{
    return require(DB_PATH + "species/" + name + ".json")
}
function load_evo_chain_from_local_db(name)
{
    return require(DB_PATH + "evo_chain/" + name + ".json")
}

// Write JSON file
function error_msg_cb(err) 
{
    if (err) 
    {
        console.log("An error occurred while writing JSON Object to File.");
        return console.log(err);
    }
    // console.log("JSON file has been saved.");
}
function write_file(path, contents, cb)
{
    fs.mkdirSync(getDirName(path), { recursive: true}, cb);
    fs.writeFile(path, contents, 'utf8', cb);
}
function save_data_to_json(data, filename)
{
    let file = DB_PATH + filename + ".json";
    // console.log("Saving "+ filename + "to local DB");
    // console.log(data);
    const fs = require("fs");
    // let obj = JSON.parse(data)
    let content = JSON.stringify(data, null, 4)
    write_file(file, content, error_msg_cb);
}

// Save file to DB
function save_pokemon_to_local_db(data)
{
    save_data_to_json(data, "pokemon/" + data.name)
    update_pokemon_id_map(data.id, data.name)
}
function save_move_to_local_db(data)
{
    // console.log("Saving move " + data.name + " to DB");
    save_data_to_json(data, "move/" + data.name)
}
function save_species_to_local_db(data)
{
    save_data_to_json(data, "species/" + data.name)
}
function save_evo_chain_to_db(data)
{
    save_data_to_json(data, "evo_chain/" + data.name)
    update_species_id_map(data.id, data.name);
}

module.exports = {
    get_name_from_pokemon_id_map,
    get_name_from_species_id_map,
    pokemon_in_local_db,
    move_in_local_db,
    species_in_local_db,
    evo_chain_in_local_db,
    load_pokemon_from_local_db,
    load_move_from_local_db,
    load_species_from_local_db,
    load_evo_chain_from_local_db,
    save_pokemon_to_local_db,
    save_move_to_local_db,
    save_species_to_local_db,
    save_evo_chain_to_db
}