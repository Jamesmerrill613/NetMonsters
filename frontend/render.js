import * as THREE from 'three';
import { Path } from "three";
import { detect_collision_between_two_spheres, detect_arena_collision, apply_player_on_attack_collision } from './collisions';
import { resolve_player_actions } from './player_actions';
import { resolve_player_attacks, update_attack_velocity, apply_particle_on_particle_collision } from './attacks';
import { Player } from './models/player';

var time_to_select_targets = 0;

function auto_resize(renderer, canvas, camera)
{
  if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) 
  {
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    camera.aspect = canvas.clientWidth /  canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
}

function detect_collisions(players, attacks, scene)
{
  for (let i = 0; i < players.length; i++)
  {
    // Players vs Players
    for (let j = i+1; j< players.length; j++)
    {
      if (Player.detect_player_on_player_collision(players[i], players[j]))
      {
        // console.log("Applying collision between", players[i].name, players[j].name)
        Player.apply_player_on_player_collision(players[i], players[j]);
      }
    }
    // Players vs Attacks
    for (let j = 0; j < attacks.length; j++)
    {
        if (players[i].player_number == attacks[j].player_number) { continue; }
        if (detect_collision_between_two_spheres(players[i], attacks[j]))
        {
            // console.log("%s hit by %s", players[i].name, attacks[j].name)
            apply_player_on_attack_collision(players[i], attacks[j]);
            attacks[j].active = false;
            // attacks[j].destroy(scene)
            // attacks.splice(j, 1);
            // j--;
        }
    }
  }
  // Attacks vs Attacks
  for (let i = 0; i < attacks.length; i++)
  {
    for (let j = i+1; j< attacks.length; j++)
    {
      if (attacks[i].move_id == attacks[j].move_id && attacks[i].player_number == attacks[j].player_number) { continue; }
      if (detect_collision_between_two_spheres(attacks[i], attacks[j]))
      {
        // Ignore collision between matching types
        // console.log("Attacks collided!")
        apply_particle_on_particle_collision(attacks[i], attacks[j]);
      }
    }
  }
}

var rotate_once = true;


// Cameras:
//    Orbit Origin Cam
//    Fly over
//    Pan over
//    Follow
//    Static

function update_camera(clock_delta, camera, players, arena)
{
  // camera.position.copy(new THREE.Vector3(0, 3*arena.height, -1))
  // camera.target = new THREE.Vector3(0, 0, 0)
  // camera.lookAt(camera.target)
  // return;
    switch(camera.mode)
    {
        case "orbit":
            // Rotate Camera
            let rotation = clock_delta * 2 * Math.PI / camera.orbit_period;
            camera.orbit_matrix.makeRotationY(rotation);
            camera.position.applyMatrix4(camera.orbit_matrix);
            camera.orbit_pos = camera.position.clone();
            let target = new THREE.Vector3();
            for (let player of players) { target.add(player.position) }
            target.multiplyScalar(1/players.length)
            camera.target = target;
            // camera.target = players[camera.my_target].position.clone().add(players[camera.my_target].orientation.clone().multiplyScalar(50))

            break;
        case "fly":
            break;
        case "pan":
            break;
        case "follow":
            let new_pos = players[camera.my_target].position.clone();
            new_pos.sub(players[camera.my_target].orientation.clone().multiplyScalar(20));
            new_pos.sub(players[camera.my_target].orientation.clone().multiplyScalar(players[camera.my_target].height).applyAxisAngle( new THREE.Vector3(0, 1, 0), Math.PI/2));
            new_pos.clampLength(0, arena.radius);
            if (new_pos.y < 0.01) { new_pos.y = 0.01; }
            camera.position.copy(new_pos.clone());
            camera.position.y += players[camera.my_target].height;
            camera.target = players[camera.my_target].position.clone().add(players[camera.my_target].orientation.clone().multiplyScalar(50))
            break;
        case "static":
            break;
        default:
            console.log("Missing Camera Mode!");

    }

    camera.time_between_modes -= clock_delta;
    if (camera.time_between_modes <= 0)
    {
        camera.time_between_modes = camera.mode_cycle_period;
        let new_mode = Math.floor(Math.random() * 5)
        // new_mode = 3;
        let target = Math.floor(Math.random() * players.length)
        switch(new_mode)
        {
            case 0:
                camera.mode = "orbit";
                let max_h = arena.height;
                let min_h = arena.face_height + arena.bleacher_height
                camera.orbit_pos.y = Math.random() * (max_h-min_h) + min_h;
                camera.position.copy(camera.orbit_pos.clone());
                break;
            case 1:
                // camera.mode = "fly";
                break;
            case 2:
                // camera.mode = "pan";
                break;
            case 3:
                camera.mode = "follow";
                camera.my_target = target
                break;
            case 4:
                // camera.mode = "static";
                break;
        }
    }

    camera.lookAt(camera.target);
}



function render(args) {
  const { players, attacks, render_objs } = args;
  window.requestAnimationFrame(() => render(args));
  auto_resize(render_objs.renderer, render_objs.canvas, render_objs.camera);
  
  let clock_delta = render_objs.clock.getDelta();
  if (clock_delta > 0.25) clock_delta = 0.25; // protection for changing tabs

  update_camera(clock_delta, render_objs.camera, players, render_objs.arena)

  // Set Targets
  time_to_select_targets -= clock_delta;
  if (time_to_select_targets <= 0)
  {
    for (let i = 0; i < players.length; i++)
    {
        if (players[i].current_action != "none") { continue; }
        let min_distance = 99999;
        for (let j = 0; j < players.length; j++)
        {
            if (i == j) { continue; }
            let distance = players[i].position.clone().sub(players[j].position.clone()).length()
            if (distance < min_distance)
            {
            min_distance = distance;
            players[i].targeting = j;
            }
        }
        // let r = Math.floor(Math.random() * players.length)
        // if (player.player_number != players[r].player_number) player.targeting = r;
        }
        time_to_select_targets = 3.0
  }


  // Move Pokemon
  resolve_player_actions(players, clock_delta); // Picks move/attack updates velocity
  resolve_player_attacks(players, clock_delta, attacks, render_objs.scene) //Creates new attacks if any
  for (let player of players)
  {
    // variable updates
    player.update_velocity(clock_delta);
    
    // Determine New Position
    detect_arena_collision(player, render_objs.arena)

    // Update Orientation
    if (players.length > 1) {player.set_orientation(players[player.targeting].position.clone()); }
    else { player.set_orientation(new THREE.Vector3(0, player.position.y*2, 0));}

    // render updates
    let angle = -1*Math.atan2(render_objs.camera.position.z - render_objs.camera.target.z, render_objs.camera.position.x - render_objs.camera.target.x) + Math.PI/2;
    if (angle > Math.PI) { angle -= 2*Math.PI; }
    player.update_position(clock_delta, angle); // Apply velocity to player position
    player.draw_orientation_line(render_objs.scene)
    player.draw_velocity_line(render_objs.scene)

  }


  for(let i = 0; i < attacks.length; i++)
  {
    update_attack_velocity(attacks[i], clock_delta, render_objs.scene);
    detect_arena_collision(attacks[i], render_objs.arena)
    if (!attacks[i].active)
    {
      attacks[i].destroy(render_objs.scene)
      attacks.splice(i, 1);
      i--;
    }
  }
  detect_collisions(players, attacks, render_objs.scene) // Detect collisions, update position and velocity as necessary

  // console.log(render_objs.renderer.info.memory.geometries)
  render_objs.renderer.render(render_objs.scene, render_objs.camera);
};

export {
  render
};