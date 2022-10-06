import * as THREE from 'three';
import { Vector3 } from 'three';
import { standard_projectile, horizontal_arms } from './models/attack';
import { randn_bm } from './tools/normal_distribution'

var max_weight = 20000; // kgs
// heaviest pokemon Cpperahah at 6500 kgs

var speed_stat_conversion = 1 // 100 speed * 0.1 = max velocity change of 10 m/s
var move_response_time = 100 // 200 / 100 speed = action every 2 second

function increment_time_after_move_action(player)
{
    player.time_between_actions += (move_response_time / player.speed);
}

function move(move_vector, player, power)
{
    //TODO: Convert to acceleration period, 
    let max_move = player.speed * speed_stat_conversion
    // let weight_ratio = (max_weight-player.weight)/max_weight;
    let weight_ratio = 1 - player.weight/max_weight;
    player.velocity.add(move_vector.multiplyScalar(max_move*power*weight_ratio));
}

function can_jump(player)
{
    if (player.can_fly && player.is_above_ground()) { return true; }
    if (player.is_ground_level()) { return true; }
    return false;
}

function jump(player, power)
{
    let move_vector = new THREE.Vector3(0, 1, 0);
    move(move_vector, player, power);
    increment_time_after_move_action(player, power);
    // console.log("%s, Jumped! %f\%", player.name, power.toFixed(2));
}

function can_dive(player)
{
    if (player.can_fly && player.is_in_air()) { return true; }
    return false;
}

function dive(player, power)
{
    let move_vector = new THREE.Vector3(0, -1, 0);
    move(move_vector, player, power);
    increment_time_after_move_action(player, power);
    // console.log("%s, Dived! %f\%", player.name, power.toFixed(2));
}

function can_charge(player)
{
    if (player.can_fly && player.is_above_ground()) { return true; }
    if (player.is_ground_level()) { return true; }
    return false;
}

function charge(player, power)
{
    let move_vector = player.orientation.clone();
    move_vector.y = 0;
    move_vector.normalize();
    move(move_vector, player, power);
    increment_time_after_move_action(player, power);
    // console.log("%s, Charged! %f\%", player.name, power.toFixed(2));
}

function can_backpedal(player)
{
    if (player.can_fly && player.is_above_ground()) { return true; }
    if (player.is_ground_level()) { return true; }
    return false;
}

function backpedal(player, power)
{
    let move_vector = player.orientation.clone();
    move_vector.y = 0;
    move_vector.x *= -1;
    move_vector.z *= -1;
    move_vector.normalize();
    move(move_vector, player, power);
    increment_time_after_move_action(player, power);
    // console.log("%s, Backpedaled! %f\%", player.name, power.toFixed(2));
}

function can_dodge(player)
{
    if (player.can_fly && player.is_above_ground()) { return true; }
    if (player.is_ground_level()) { return true; }
    return false;
}

function dodge_left(player, power)
{
    let move_vector = player.orientation.clone();
    let axis = new THREE.Vector3(0, 1, 0);
    move_vector.y = 0;
    move_vector.applyAxisAngle(axis, Math.PI/2);
    move_vector.normalize();
    move(move_vector, player, power);
    increment_time_after_move_action(player, power);
    // console.log("%s, Dodge Left! %f\%", player.name, power.toFixed(2));
}

function dodge_right(player, power)
{
    let move_vector = player.orientation.clone();
    let axis = new THREE.Vector3(0, 1, 0);
    move_vector.y = 0;
    move_vector.applyAxisAngle(axis, -Math.PI/2);
    move_vector.normalize();
    move(move_vector, player, power);
    increment_time_after_move_action(player, power);
    // console.log("%s, Dodge Right! %f\%", player.name, power.toFixed(2));
}

function slowdown(player, power)
{
    if (player.can_fly || player.is_ground_level())
    {
        let weight_ratio = (max_weight-player.weight)/max_weight;
        player.velocity.multiplyScalar(power*weight_ratio)
        increment_time_after_move_action(player, power);
    }
    // console.log("%s slowed down! %f\%", player.name, power.toFixed(2));
}

function do_nothing(player)
{
    // player.time_between_actions = 1.0;
}

function attack(player, power)
{
    if (player.moves.length > 0)
    {
        let i = Math.floor(Math.random() * player.moves.length) // 0, 1, 2, 3
        let move = player.moves[i];

        switch(Math.floor(Math.random()*2))
        {
            case 0: standard_projectile(player, move, power);
                break;
            case 1: horizontal_arms(player, move, power)
                break;
        }
    }
}

function perform_action(player)
{
    let action = Math.random()*20;

    let power = randn_bm();
    power =1.0;
    // // jump(player, power)
    // // return;
    // if (can_jump(player)) { 
    //     console.log("Jump!")
    //     jump(player, power); }
    // return;
    if (can_charge(player)) { charge(player, power); }
    return;

    if (action < 3) // Charge
    {
        if (can_charge(player)) { charge(player, power); }
        return;
    }
    if (action < 5) // Dodge Left
    {
        if (can_dodge(player)) { dodge_left(player, power); }
        return;
    }
    if (action < 7) // Dodge Right
    {
        if (can_dodge(player)) { dodge_right(player, power); }
        return;
    }
    if (action < 9) // Backpedal
    {
        if (can_backpedal(player)) { backpedal(player, power); }
        return;
    }
    if (action <= 12) // Jump
    { 
        if (can_jump(player)) { jump(player, power); }
        return;
    }
    if (action <= 15) // Dive
    {
        if (can_dive(player)) { dive(player, power); }
        return;
    }
    if (action <= 20) // Slow/Stop
    {
        slowdown(player, power);
        return;
    }
    // Do Nothing
    do_nothing(player); 
    return; 
}

function perform_attack(player)
{
    let power = randn_bm();
    attack(player, power);
}

function resolve_player_actions(players, clock_delta)
{
    for (let i = 0; i < players.length; i++)
    {
        players[i].time_between_actions -= clock_delta;
        if (players[i].time_between_actions <= 0)
        {
            players[i].time_between_actions = 0;
            perform_action(players[i]);
        }
        players[i].time_between_attacks -= clock_delta;
        if (players[i].time_between_attacks <= 0)
        {
            players[i].time_between_attacks = 0;
            perform_attack(players[i]);
        }
    }
}


export {
    resolve_player_actions
  };