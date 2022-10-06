import * as THREE from 'three';
import { render } from './render';
import { reflect } from './tools/reflect'

var debug = true;

function apply_player_on_attack_collision(A, B)
{
    // B2A
    let B2A_incident = A.position.clone().sub(B.position);
    let B2A_velocity = B.velocity.clone().projectOnVector(B2A_incident);
    if (B2A_velocity.dot(B2A_incident) <= 0) { B2A_velocity = new THREE.Vector3(); }
    // else { B2A_velocity.multiplyScalar(2*B.weight / (A.weight + B.weight)); }

    // A2B
    let A2B_incident = B.position.clone().sub(A.position);
    let A2B_velocity = A.velocity.clone().projectOnVector(A2B_incident)
    if (A2B_velocity.dot(A2B_incident) <= 0) { A2B_velocity = new THREE.Vector3();}
    // else { A2B_velocity.multiplyScalar(2*A.weight / (A.weight + B.weight)); }


    // Update Velocity
    let m_all = A.weight + B.weight;
    A.velocity.add(B2A_velocity.clone().multiplyScalar(2*B.weight/m_all)).sub(A2B_velocity.clone().multiplyScalar(2*B.weight/m_all));
    // B.velocity.add(A2B_velocity.clone().multiplyScalar(2*A.weight/m_all)).sub(B2A_velocity.clone().multiplyScalar(2*A.weight/m_all));

    // Update Position
    // let r_all = A.radius + B.radius
    // let A_trans = A2B_incident.clone().normalize().multiplyScalar((A2B_incident.length() - (r_all))*(A.radius/r_all*1.01));
    // let B_trans = B2A_incident.clone().normalize().multiplyScalar((B2A_incident.length() - (r_all))*(B.radius/r_all*1.01));
    // // A.position.add(A_trans)
    // B.position.add(B_trans)
}

function detect_collision_between_two_spheres(A, B)
{
    let A_pos = A.position.clone()
    let B_pos = B.position.clone()
    let pos = A_pos.clone().sub(B_pos.clone());
    if (pos.length() < A.radius + B.radius)
    {
        // console.log("Collision detected between %s and %s", A.name, B.name);
        A.position = new THREE.Vector3().copy(A_pos)
        return true;
    }
}

function detect_collision_arena_wall_players(player, arena)
{
    // Wall Collision
    let pos_xz = player.position.clone();
    pos_xz.y = 0;
    if (pos_xz.length() + player.radius > arena.radius)
    {
        let normal = pos_xz.clone().multiplyScalar(-1).normalize()
        let dot_prod = player.velocity.dot(normal)
        player.velocity.sub(normal.multiplyScalar(2*dot_prod));
        player.velocity.x *= 0.2;
        player.velocity.z *= 0.2

        pos_xz.clampLength(0, arena.radius - player.radius);
        player.position.x = pos_xz.x
        player.position.z = pos_xz.z
        // console.log("Wall collision")
    }
    // Floor Collision
    if (player.position.y < player.radius)
    {
        player.position.y = player.radius;
        player.velocity.y = -player.velocity.y*0.2;
        if (player.velocity.y > -0.1 &&  player.velocity.y < 0.1)
        {
            player.velocity.y = 0
        }
        // console.log("Floor collision")
    }
    // Ceiling Collision
    if (player.position.y + player.radius > arena.height)
    {
        player.position.y = arena.height - player.radius;
        player.velocity.y = -player.velocity.y*0.2;
    }
}

function detect_collision_arena_wall_attacks(attack, arena)
{
    // Wall Collision
    let pos_xz = attack.model.position.clone();
    pos_xz.y = 0;
    if (pos_xz.length() + attack.radius > arena.radius)
    {
        let normal = pos_xz.clone().multiplyScalar(-1).normalize()
        let dot_prod = attack.velocity.dot(normal)
        attack.velocity.sub(normal.multiplyScalar(2*dot_prod));
        attack.velocity.x *= 0.5;
        attack.velocity.z *= 0.5

        pos_xz.clampLength(0, arena.radius - attack.radius);
        pos_xz.y = attack.model.position.clone().y
        attack.model.position.copy(pos_xz)
    }
    // Floor Collision
    if (attack.model.position.clone().y < attack.radius)
    {
        let pos = attack.model.position.clone();
        pos.y = attack.radius;
        attack.position.copy(pos);
        attack.velocity.y = -attack.velocity.y/(attack.weight > 1 ? attack.weight : 1.1);
        if (attack.velocity.y > -0.01 &&  attack.velocity.y < 0.01)
        {
            attack.velocity.y = 0
        }
    }
        // Ceiling Collision
    if (attack.position.y + attack.radius > arena.height)
    {
        attack.position.y = arena.height - attack.radius;
        attack.velocity.y = -attack.velocity.y*0.2;
    }
        // console.log("Floor collision")

}

function detect_arena_collision(model, arena)
{
    let friction = 1/(0.1*model.weight + 1.1) // <- 0-1 factor to reduce velocity on all axis due to collision.
    // Floor Collision
    if (model.position.y - model.radius < 0)
    {
        model.position.y = model.radius // <- reset position
        reflect(model.velocity, new THREE.Vector3(0, 1, 0))
        model.velocity.multiplyScalar(friction)
        if (model.velocity.y > -0.01 &&  model.velocity.y < 0.01) { model.velocity.y = 0 } // <- Set 0 y velocity to prevent floor bouncing due to gravity
    }
    // Ceiling Collision
    if (model.position.y + model.radius > arena.height)
    {
        model.position.y = arena.height - model.radius; // <- reset position
        reflect(model.velocity, new THREE.Vector3(0, -1, 0))
        model.velocity.multiplyScalar(friction)
    }
    // Face Collision
    if (model.position.y < arena.height)
    {
        // Right
        if (model.position.x + model.radius > arena.x_face)
        {
            model.position.x = arena.x_face - model.radius;
            reflect(model.velocity, new THREE.Vector3(-1, 0, 0))
            model.velocity.multiplyScalar(friction)
        }
        // Left
        if (model.position.x - model.radius < -arena.x_face)
        {
            model.position.x = -arena.x_face + model.radius;
            reflect(model.velocity, new THREE.Vector3(1, 0, 0))
            model.velocity.multiplyScalar(friction)
        }
        // Top
        if (model.position.z + model.radius > arena.z_face)
        {
            model.position.z = arena.z_face - model.radius;
            reflect(model.velocity, new THREE.Vector3(0, 0, -1))
            model.velocity.multiplyScalar(friction)
        }
        // Bottom
        if (model.position.z - model.radius < -arena.z_face)
        {
            model.position.z = -arena.z_face + model.radius;
            reflect(model.velocity, new THREE.Vector3(0, 0, 1))
            model.velocity.multiplyScalar(friction)
        }



        let r_sin45 = model.radius*Math.sin(Math.PI/4)
        let x_pos = model.position.x
        let z_pos = model.position.z
        let x_corner = arena.x_face - arena.corner_face
        let z_corner = arena.z_face - arena.corner_face

        // TR
        let tr_face = ((x_pos + r_sin45) - x_corner) + ((z_pos + r_sin45) - z_corner) - arena.corner_face
        //    (x - (35 - 5)) + (z - (60 - 5)) - 5 + r        
        if (tr_face > 0)
        {
            console.log(tr_face)
            // console.log(model.position)
            // console.log(model.radius)
            model.position.add(new THREE.Vector3(-0.5, 0, -0.5).multiplyScalar(tr_face))
            reflect(model.velocity, new THREE.Vector3(-0.5, 0, -0.5))
            model.velocity.multiplyScalar(friction)
            // console.log(model.position)
        }
        // TL
        let tl_face = -1*((x_pos - r_sin45) + x_corner) + ((z_pos + r_sin45) - z_corner) - arena.corner_face
        if (tl_face > 0)
        {
            model.position.add(new THREE.Vector3(0.5, 0, -0.5).multiplyScalar(tl_face))
            reflect(model.velocity, new THREE.Vector3(0.5, 0, -0.5))
            model.velocity.multiplyScalar(friction)
        }
        // BR
        let br_face = ((x_pos + r_sin45) - x_corner) + -1*((z_pos - r_sin45) + z_corner) - arena.corner_face
        if (br_face > 0)
        {
            model.position.add(new THREE.Vector3(-0.5, 0, 0.5).multiplyScalar(br_face))
            reflect(model.velocity, new THREE.Vector3(-0.5, 0, 0.5))
            model.velocity.multiplyScalar(friction)
        }
        // BL
        let bl_face = -1*((x_pos - r_sin45) + x_corner) + -1*((z_pos - r_sin45) + z_corner) - arena.corner_face
        if (bl_face > 0)
        {
            model.position.add(new THREE.Vector3(0.5, 0, 0.5).multiplyScalar(bl_face))
            reflect(model.velocity, new THREE.Vector3(0.5, 0, 0.5))
            model.velocity.multiplyScalar(friction)
        }
    }
    // Bleacher Collision

    // Wall Collision
}


export {
    apply_player_on_attack_collision,
    detect_collision_between_two_spheres,
    detect_arena_collision, 
    
};