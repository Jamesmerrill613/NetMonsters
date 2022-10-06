import * as THREE from 'three';
import { Vector3 } from 'three';
import { get_type_color } from '../colors.js'
import { randn_bm } from '../tools/normal_distribution'

// var STANDARD_ATTACK_RADIUS = 3.5;
// var STANDARD_ATTACK_VELOCITY = 1; // 100 power = 100 m/s velocity
var move_response_time = 100 // 200 / 100 speed = action every 2 second
var GRAVITY = 98;
var debug = 0;

function standard_projectile_cb(player, move, power, distance_to_target)
{
    let dmg_class = 'attack'
    if (move.damage_class == "special") { dmg_class = 'special_attack'}
    let STAB = 1.0;
    for (let type of player.types)
    {
        if (type == move.type) { STAB = 1.5; }
    }

    let modifiers = get_type_velocity_modifiers(move.type, move.damage_class)
    let size = (player[dmg_class]) / 20 * power * (0.5+randn_bm())*STAB; // ATTACK / 100 radius in meters

    let v_mag = (move.power + player[dmg_class])*(0.5+power) // POWER / 10 m/s ~ 30power -> 3m/s


    let target_vector = player.orientation.clone()
    target_vector.multiplyScalar(distance_to_target);
    if (modifiers.gravity > 0)
    {
        // Arc for gravity
        let v2 = v_mag*v_mag;
        let v4 = v2*v2;
        let G = modifiers.gravity * GRAVITY;
        let t_y = target_vector.y - player.height;
        target_vector.y = 0;
        let t_xz = target_vector.length();
        let t_xz2 = t_xz*t_xz;
        let root = (Math.sqrt(v4 - G*(G*t_xz2 + 2*v2*t_y)))
        let angle1 = Math.atan((v2 + root) /(G*t_xz))
        let angle2 = Math.atan((v2 - root) /(G*t_xz))
        let angle = angle1;
        if (Math.abs(angle2) > Math.abs(angle1)) { angle = angle2; }

        target_vector.normalize()
        target_vector.y = Math.cos(angle)
        if (modifiers.gravity < 0) { target_vector.y *= -1; }
    }
    
    // Trajectory
    let orientation = target_vector.normalize()
    let deviation = ((101-move.accuracy)/200)
    let x = (randn_bm() * 2 - 1) * deviation;
    let y = (randn_bm() * 2 - 1) * deviation;
    let z = (randn_bm() * 2 - 1) * deviation;
    let offset = new THREE.Vector3(x, y, z).normalize().multiplyScalar(deviation)

    // offset.add(new THREE.Vector3(0, modifiers.gravity * 0.25, 0))
    orientation.add(offset).normalize();

    let velocity = orientation.multiplyScalar(v_mag * (0.5+randn_bm())); 
    velocity.multiplyScalar(1 + modifiers.resistance)

    let position = player.position.clone().add(player.orientation.clone().multiplyScalar(size * 1.1));

    return new Attack_Particle(player, move, power, velocity, size, position);
}

function horizontal_arms_cb(player, move, power, distance_to_target)
{
    let dmg_class = 'attack'
    if (move.damage_class == "special") { dmg_class = 'special_attack'}
    let STAB = 1.0;
    for (let type of player.types)
    {
        if (type == move.type) { STAB = 1.5; }
    }

    let modifiers = get_type_velocity_modifiers(move.type, move.damage_class)
    let size = (player[dmg_class]) / 20 * power * (0.5+randn_bm())*STAB; // ATTACK / 100 radius in meters

    let v_mag = (move.power + player[dmg_class])*(0.5+power) // POWER / 10 m/s ~ 30power -> 3m/s

    //Position
    let ort_vector = player.orientation.clone().applyAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2)
    let offset_scalar = Math.random()
    let pos_offset = ort_vector.clone().multiplyScalar((offset_scalar-0.5)*player.height*12)
    let position = player.position.clone().add(pos_offset).add(new THREE.Vector3(randn_bm()-0.5, randn_bm()-0.5, randn_bm()-0.5))

    let target_vector = player.orientation.clone()
    target_vector.multiplyScalar(distance_to_target*1.1).sub(pos_offset);    
    if (modifiers.gravity > 0)
    {
        // Arc for gravity
        let v2 = v_mag*v_mag;
        let v4 = v2*v2;
        let G = modifiers.gravity * GRAVITY;
        let t_y = target_vector.y - player.height;
        target_vector.y = 0;
        let t_xz = target_vector.length();
        let t_xz2 = t_xz*t_xz;
        let root = (Math.sqrt(v4 - G*(G*t_xz2 + 2*v2*t_y)))
        let angle1 = Math.atan((v2 + root) /(G*t_xz))
        let angle2 = Math.atan((v2 - root) /(G*t_xz))
        let angle = angle1;
        if (Math.abs(angle2) > Math.abs(angle1)) { angle = angle2; }

        target_vector.normalize()
        target_vector.y = Math.cos(angle)
        if (modifiers.gravity < 0) { target_vector.y *= -1; }
    }
    
    // Trajectory
    let orientation = target_vector.normalize()
    let deviation = ((101-move.accuracy)/200)
    let x = (randn_bm() * 2 - 1) * deviation;
    let y = (randn_bm() * 2 - 1) * deviation;
    let z = (randn_bm() * 2 - 1) * deviation;
    let offset = new THREE.Vector3(x, y, z).normalize().multiplyScalar(deviation)

    // offset.add(new THREE.Vector3(0, modifiers.gravity * 0.25, 0))
    orientation.add(offset).normalize();

    let velocity = orientation.multiplyScalar(v_mag * 2.5*(Math.abs(offset_scalar-0.5)) * (0.5+randn_bm())); 
    velocity.multiplyScalar(1 + modifiers.resistance)

    return new Attack_Particle(player, move, power, velocity, size, position);
}


function standard_projectile(player, move, power)
{
    let dmg_class = 'attack'
    if (move.damage_class == "special") { dmg_class = 'special_attack'}

    player.current_action = "attack";
    player.current_action_cb = standard_projectile_cb;
    
    player.current_attack = move;
    player.current_attack_power = power;
    player.current_attack_projectiles_remaining = 2*move.power * (player[dmg_class] / 50) * (0.5+randn_bm()); // Dependant on POWER + Attack

    player.time_between_projectiles = 1 / player.current_attack_projectiles_remaining
    player.time_since_last_projectile = 0;

    let attack_duration = player.current_attack_projectiles_remaining * player.time_between_projectiles
    player.time_between_attacks += attack_duration + ((move_response_time / player.speed)*3);
    player.time_between_actions += attack_duration

    // console.log("%s used %s!", player.name, move.name);
    // console.log("%s move has %d\% accuracy", move.type, move.accuracy)
}

function horizontal_arms(player, move, power)
{
    let dmg_class = 'attack'
    if (move.damage_class == "special") { dmg_class = 'special_attack'}

    player.current_action = "attack";
    player.current_action_cb = horizontal_arms_cb;
    
    player.current_attack = move;
    player.current_attack_power = power;
    player.current_attack_projectiles_remaining = 2*move.power * (player[dmg_class] / 100) * (0.5+randn_bm()); // Dependant on POWER + Attack

    player.time_between_projectiles = 0.0001
    player.time_since_last_projectile = 0;

    let attack_duration = player.current_attack_projectiles_remaining * player.time_between_projectiles
    player.time_between_attacks += attack_duration + ((move_response_time / player.speed)*3);
    player.time_between_actions += attack_duration

    // console.log("%s used %s!", player.name, move.name);
    // console.log("%s move has %d\% accuracy", move.type, move.accuracy)
}

function get_type_velocity_modifiers(type, dmg_class)
{
    let gravity = 0; // m/s/s acceleration on y-axis
    let resistance = 0.1; // % veocity decay on all axis
    switch(type + '-' + dmg_class)
    {
        case 'normal-physical':     // push-force
            resistance = 0.3;
            break;
        case 'normal-special':      // life-force
            break;
        
        case 'fire-physical':       // burning embers
            resistance = 0.5; 
            gravity = -0.1;
            break; 
        case 'fire-special':        // smoke and flames
            resistance = 0.5
            gravity = -0.3;
            break;
        
        case 'water-physical':      // liquid water
            gravity = 1.0;
            resistance = 0.0;
            break;
        case 'water-special':       // gaseous water
            resistance = 0.5; 
            gravity = -0.1;
            break;
        
        case 'electric-physical':   // electric-power
            resistance = -0.1; 
            break;            
        case 'electric-special':    // magnetic force
            resistance = -0.1; 
            break;
        
        case 'grass-physical':      // plant matter
            gravity = 0.3;
            break;
        case 'grass-special':       // solar-force
            break;
        
        case 'ice-physical':        // ice and snow
            gravity = 1.0;
            resistance = 0.3;
            break;
        case 'ice-special':         // cold-force
            break;
        
        case 'fighting-physical':   // blunt force
            resistance = 1;
            break;
        case 'fighting-special':    // chi force
            resistance = 0.9;
            break;
        
        case 'poison-physical':     // liquid poison
            gravity = 1.0; 
            resistance = 0.3;
            break;
        case 'poison-special':      // gaseous poison
            break;            

        case 'ground-physical':     // solid material
            gravity = 1.0;
            break;
        case 'ground-special':      // mud slinging
            gravity = 1.0; 
            resistance = 0.3;
            break;
        
        case 'flying-physical':     // diving attack
            resistance = -0.1;
            break;
        case 'flying-special':      // wind
            resistance = -0.5;
            break;
        
        case 'psychic-physical':    // chi disruption
            break;
        case 'psychic-special':     // psyonic-force
            resistance = -0.1;
            break;
        
        case 'bug-physical':        // sting or bite
            resistance = 0.2;
        case 'bug-special':         // pollen dispersal
            break;
        
        case 'rock-physical':       // boulder smash
            gravity = 1.0;
            break;
        case 'rock-special':        // gemstone energy
            gravity = 0.0; 
            resistance = 0.4;
            break;
        
        case 'ghost-physical':      // jump scare
            break;
        case 'ghost-special':       // fear
            break;
        
        case 'dragon-physical':     // rage
            resistance = 0.1; 
            gravity = -0.1;
            break;
        case 'dragon-special':      //  magical-force
            resistance = -0.1;
            break;
        
        case 'dark-physical':       // light obscuring  
            gravity = 1.0;
            break;
        case 'dark-special':        // dread
            break;
        
        case 'steel-physical':      // blunt attack
            resistance = 0.7; 
            gravity = 0.4;
            break;
        case 'steel-special':       //  laser beam
            resistance = 0.4;
            break;
        
        case 'fairy-physical':      // physical abuse
            resistance = -0.2; 
            break;
        case 'fairy-special':       // mistic-power
            break;
        
        default: 
            console.log("Missing Attack Type and Damage Class!");
    }
    return { gravity, resistance }
}

class Attack_Particle
{
    // player obj
    // move obj
    // power range 0-1%
    constructor(player, move, power, velocity, size, position)
    {
        this.player_number = player.player_number
        this.move_id = move.id;
        this.name = move.name;
        this.type = move.type;


        this.power = (0.5+randn_bm())*power;
        this.initial_radius = size
        this.radius = size;
        // this.radius = STANDARD_ATTACK_RADIUS * Math.pow(this.power, 1/5);
        this.class = move.damage_class;
        this.active = true;
        this.weight = this.radius * 2;
        this.time_remaining = 5.0;

        this.model = this.#create_model();

        this.position = position
        this.#update_model();
        
        this.velocity = velocity.clone();
        // this.velocity = this.#trajectory(player.orientation.clone(), move.accuracy)
        // let combined_power = move.power + this.power;
        // if (this.class == 'physical') combined_power * player.attack / 50;
        // if (this.class == 'special') combined_power * player.special_attack / 50;
        // this.velocity.multiplyScalar(randn_bm()*2 * combined_power);
    }

    #create_model() 
    {
        let opacity = randn_bm()*2; // this.class == 'physical'
        if (this.class == 'special') { opacity = randn_bm(); }
        if (opacity > 1.0) { opacity = 1.0; }
        let geometry = new THREE.SphereGeometry(this.initial_radius);
        let material = new THREE.MeshBasicMaterial({ 
            color:get_type_color(this.type, 0.1), 
            opacity:opacity, 
            transparent:true });
        return new THREE.Mesh(geometry, material);
    }

    // #trajectory(orientation, accuracy)
    // {
    //     let deviation = ((105-accuracy)/500)
    //     let x = (randn_bm() * 2 - 1) * deviation;
    //     let y = (randn_bm() * 2 - 1) * deviation;
    //     let z = (randn_bm() * 2 - 1) * deviation;
    //     let offset = new THREE.Vector3(x, y, z).normalize().multiplyScalar(deviation)
    //     orientation.add(offset).normalize();
    //     return orientation
    // }

    destroy(scene)
    {
        this.model.geometry.dispose()
        this.model.material.dispose()
        scene.remove(this.model)
    }

    #update_model()
    {
        let scale = Math.pow(this.time_remaining/5.0, 1/3)
        this.model.position.copy(this.position)
        this.radius = this.initial_radius * scale;
        this.weight = this.radius*2
        this.model.scale.setScalar(scale)
    }

    #update_velocity(clock_delta)
    {
        let modifiers = get_type_velocity_modifiers(this.type, this.class)
        let new_velocity = this.velocity.clone();
        if (modifiers.gravity)
        {
            new_velocity.y += -1*GRAVITY * modifiers.gravity * clock_delta;
        }
        if (modifiers.resistance)
        {
            new_velocity.multiplyScalar(1-(modifiers.resistance * clock_delta));
        }
        this.velocity.copy(new_velocity);
    }

    update(clock_delta)
    {
        this.time_remaining -= clock_delta;
        if (this.time_remaining < 0) { this.active = false }

        this.position.add(this.velocity.clone().multiplyScalar(clock_delta));
        
        this.#update_velocity(clock_delta);
        let p_decay = clock_delta;

        
        // this.velocity.multiplyScalar(v_decay);
        this.power *= 1-p_decay;

        this.#update_model();
    }

}

export {
    standard_projectile,
    horizontal_arms
}