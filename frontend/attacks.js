import * as THREE from 'three';
import { get_type_color } from './colors.js'
import { get_type_effectiveness } from './tools/type_match_up.js';
// import { Attack } from './models/attack'

var attack_radius = 5.0

function apply_particle_on_particle_collision(A, B)
{
    //*****Normal Collision******/
    // B2A
    let B2A_incident = A.position.clone().sub(B.position);
    let B2A_velocity = B.velocity.clone().projectOnVector(B2A_incident);
    if (B2A_velocity.dot(B2A_incident) <= 0) { B2A_velocity = new THREE.Vector3(); }
    B2A_velocity.multiplyScalar(get_type_effectiveness(B.type, A.type));

    // A2B
    let A2B_incident = B.position.clone().sub(A.position);
    let A2B_velocity = A.velocity.clone().projectOnVector(A2B_incident)
    if (A2B_velocity.dot(A2B_incident) <= 0) { A2B_velocity = new THREE.Vector3();}
    A2B_velocity.multiplyScalar(get_type_effectiveness(A.type, B.type));

    // Update Velocity
    let m_all = A.weight + B.weight;
    A.velocity.add(B2A_velocity.clone().multiplyScalar(2*B.weight/m_all)).sub(A2B_velocity.clone().multiplyScalar(2*B.weight/m_all));
    B.velocity.add(A2B_velocity.clone().multiplyScalar(2*A.weight/m_all)).sub(B2A_velocity.clone().multiplyScalar(2*A.weight/m_all));

    // Update Position
    let r_all = A.radius + B.radius
    let A_trans = A2B_incident.clone().normalize().multiplyScalar((A2B_incident.length() - (r_all))*(A.radius/r_all*1.01));
    let B_trans = B2A_incident.clone().normalize().multiplyScalar((B2A_incident.length() - (r_all))*(B.radius/r_all*1.01));
    A.position.add(A_trans)
    B.position.add(B_trans)

    let B_mag = B2A_velocity.length() * (2*B.weight/m_all)
    let A_mag = A2B_velocity.length() * (2*A.weight/m_all)
    let mag_all = A_mag + B_mag;

    // console.log("Collision")
    // console.log(A_mag)
    // console.log(mag_all)
    // console.log(A_mag/mag_all)
    // console.log(A.time_remaining);
    A.time_remaining *= 1 - (0.4 * get_type_effectiveness(B.type, A.type))
    B.time_remaining *= 1 - (0.4 * get_type_effectiveness(A.type, B.type))
    // console.log(A.time_remaining)


}

function resolve_player_attacks(players, clock_delta, attacks, scene)
{
    for (let i = 0; i < players.length; i++)
    {
        if (players[i].current_action == "attack")
        {
            players[i].time_since_last_projectile -= clock_delta;
            while(players[i].time_since_last_projectile <= 0 && players[i].current_action == "attack")
            {
                players[i].time_since_last_projectile += players[i].time_between_projectiles;

                let move = players[i].current_attack
                let power = players[i].current_attack_power
                let distance_to_target = players[i].position.clone().sub(players[players[i].targeting].position.clone()).length()
                let new_attack = players[i].current_action_cb(players[i], move, power, distance_to_target)
                attacks.push(new_attack);
                scene.add(new_attack.model);
                players[i].current_attack_projectiles_remaining -= 1;
                if (players[i].current_attack_projectiles_remaining <= 0)
                {
                    players[i].current_action = "none";
                }
            }
        }
        
    }
}

function update_attack_velocity(attack, clock_delta, scene)
{
    // let delta = attack.velocity.clone().multiplyScalar(clock_delta)
    // let v_decay = 1-(0.1*clock_delta);
    // let p_decay = 1-(0.25*clock_delta);
    // switch(attack.type)
    // {
    //     default: 
    // }
    // attack.model.position.add(delta);
    // attack.velocity.multiplyScalar(v_decay);
    // attack.power *= p_decay;
    // attack.radius = attack_radius*attack.power;
    // // attack.geometry.radius = attack.radius;

    // attack.model.geometry.dispose();
    // attack.model.material.dispose();
    // scene.remove(attack.model); 
    // let geometry = new THREE.SphereGeometry(attack_radius*attack.power);
    // let material = new THREE.MeshBasicMaterial({color:get_type_color(attack.type), opacity:0.9*attack.power, transparent:true});
    // attack.model = new THREE.Mesh(geometry, material);
    // if (attack.power < 0.01) { attack.active = false; }   
    attack.update(clock_delta);
}

export {
    // standard_projectile,
    resolve_player_attacks,
    update_attack_velocity,
    apply_particle_on_particle_collision
}