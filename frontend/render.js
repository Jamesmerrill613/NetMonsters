import * as threejs from 'three';
import { Path } from "three";

function auto_resize(renderer, canvas, camera)
{
  if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) 
  {
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    camera.aspect = canvas.clientWidth /  canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
}

function flip_model(player_object, camera_angle)
{
  var model_angle = Math.atan2(player_object.orientation.z, player_object.orientation.x);
  var relative_angle = model_angle + camera_angle;
  if (relative_angle >= Math.PI){relative_angle -= 2*Math.PI}
  if (relative_angle < -Math.PI){relative_angle += 2*Math.PI}

  var over_angle = Math.PI/8

  // >90, <180, not flipped
  if (((relative_angle >= Math.PI/2 + over_angle) || (relative_angle < -Math.PI/2 - over_angle)) && player_object.player_model.flipped) 
  {
    // console.log("flipping")
    player_object.player_model.front.rotation.y += Math.PI;
    player_object.player_model.flipped = false;
  }
  // <0, >-90, flipped
  else if ((relative_angle < Math.PI/2 - over_angle) && (relative_angle >= -Math.PI/2 + over_angle) && !player_object.player_model.flipped) 
  {
    // console.log("unflipping")
    player_object.player_model.front.rotation.y += Math.PI;
    player_object.player_model.flipped = true;
  }
}

function swap_model(player_object, camera_angle)
{
  var model_angle = Math.atan2(player_object.orientation.z, player_object.orientation.x);
  var relative_angle = model_angle + camera_angle;
  if (relative_angle >= Math.PI){relative_angle -= 2*Math.PI}
  if (relative_angle < -Math.PI){relative_angle += 2*Math.PI}
  
  var over_angle = Math.PI/8


  // >120, <180, not flipped
  if ((relative_angle < -1*Math.PI/4 - over_angle) && (relative_angle >= -3*Math.PI/4 + over_angle) && !player_object.player_model.swapped) 
  // if ((relative_angle < 0) && !player_object.player_model.flipped) 
  {
    // console.log("swapping")
    let temp = player_object.player_model.back.position.clone();
    player_object.player_model.back.position.copy(player_object.player_model.front.position);
    player_object.player_model.front.position.copy(temp.clone());
    player_object.player_model.swapped = true;
  }
  // >-60 || <-120, flipped
  else if (((relative_angle >= -1*Math.PI/4 + over_angle) || (relative_angle < -3*Math.PI/4 - over_angle)) && player_object.player_model.swapped) 
  // else if ((relative_angle > 0) && player_object.player_model.flipped) 
  {
    // console.log("unswapping")
    let temp = player_object.player_model.back.position.clone();
    player_object.player_model.back.position.copy(player_object.player_model.front.position);
    player_object.player_model.front.position.copy(temp);
    player_object.player_model.swapped = false;
  }
}

function update_player_position(player_object, rotation, camera_angle)
{
  // Update Rotation
  player_object.player_model.front.rotation.y += rotation;
  player_object.player_model.back.rotation.y = player_object.player_model.front.rotation.y + Math.PI;

  // Update New Position
  player_object.player_sphere.position.copy(player_object.position)
  if (player_object.player_model.swapped) 
  {
    player_object.player_model.back.position.copy(player_object.position);
  }
  else 
  {
    player_object.player_model.front.position.copy(player_object.position);
  }

  // Flip/Swap Front/Back
  flip_model(player_object, camera_angle);
  swap_model(player_object, camera_angle);
}

function update_velocity(player_object, clock_delta)
{
  let max_s = player_object.player_data.speed/10

  //Random velocity update (REPLACE WITH NETWORK SELECTION)
  let max = max_s;
  let min = -max_s;
  let delta_x = Math.random() * (max - min) + min;
  let delta_z = Math.random() * (max - min) + min;
  // let delta_x = 0
  // let delta_z = 0
  let delta_y = 0

  // Flying type can update vertical velocity
  if (player_object.player_data.type == 'flying' || player_object.player_data.sub_type == 'flying')
  {
    delta_y += Math.random() * (max - min) + min + 10;
  }

  // Player is above the surface
  if (player_object.position.y > player_object.player_data.height*0.5)
  {
    delta_y += -10
  }


  // Update rate controlled by clock
  delta_x *= clock_delta;
  delta_z *= clock_delta;
  delta_y *= clock_delta;

  // Apply Update
  player_object.velocity.add(new threejs.Vector3(delta_x, delta_y, delta_z))
  player_object.velocity.add(player_object.position.clone().normalize().multiplyScalar(-max_s*clock_delta))

  console.log(player_object.velocity)
  player_object.velocity.clampLength(0, player_object.player_data.speed);
}

function detect_collision_arena_wall(player_object, clock_delta, arena_radius)
{
  var new_position = player_object.position.clone().add(player_object.velocity.clone().multiplyScalar(clock_delta))
  // Wall Collision
  if (new_position.length() + player_object.player_data.height*0.5 > arena_radius)
  {
    //true
    new_position.clampLength(0, arena_radius - player_object.player_data.height*0.5)
    player_object.velocity.add(player_object.velocity.clone().multiplyScalar(-1).projectOnVector(new_position))
    // player_object.velocity.multiplyScalar(-0.5)
    // console.log("Wall collision")
    // console.log(new_position)
  }
  // Floor Collision
  if (new_position.y < player_object.player_data.height*0.5)
  {
    new_position.y = player_object.player_data.height*0.5
    player_object.velocity.y = -player_object.velocity.y*0.5
    // console.log("Floor collision")
    // console.log(new_position)
  }
    player_object.position.copy(new_position)
}

function detect_collision_players(players)
{
  for (let i = 0; i < players.length; i++)
  {
    for (let j = i+1; j< players.length; j++)
    {
      var pj = players[i].position.clone().sub(players[j].position)
      if (pj.length() < players[i].player_data.height/2 + players[j].player_data.height/2)
      {
        // console.log("COLLISION")
        // console.log(players[i].velocity)
        // console.log(players[j].velocity)
        //collision
        var pi = pj.clone().multiplyScalar(-1)
        let vi_pro_pi = players[i].velocity.clone().projectOnVector(pi);
        let vj_pro_pj = players[j].velocity.clone().projectOnVector(pj)
        let m_ij = players[i].player_data.weight + players[j].player_data.weight
        players[i].velocity.add(vj_pro_pj.multiplyScalar(2*players[j].player_data.weight/m_ij))
        players[i].velocity.sub(vi_pro_pi.multiplyScalar(2*players[i].player_data.weight/m_ij))

        players[j].velocity.add(vi_pro_pi.multiplyScalar(2*players[i].player_data.weight/m_ij))
        players[j].velocity.sub(vj_pro_pj.multiplyScalar(2*players[j].player_data.weight/m_ij))
        // console.log(players[i].velocity)
        // console.log(players[j].velocity)


        // Update Position
        let overlap = pj.clone().normalize().multiplyScalar(pj.length() - (players[i].player_data.height/2 + players[j].player_data.height/2))
        players[i].position.add(overlap.clone().multiplyScalar(-0.51))
        players[j].position.add(overlap.clone().multiplyScalar(0.51))
      }
    }
  }
}

function update_orientation(player_object, clock_delta)
{
  let max = 20;
  let min = -20;
  let delta_x = Math.random() * (max - min) + min;
  let delta_z = Math.random() * (max - min) + min;
  let delta_y = Math.random() * (max - min) + min;
  delta_x *= clock_delta;
  delta_y *= clock_delta;
  delta_z *= clock_delta;
  var origin_bias = (player_object.position.clone()).multiplyScalar(-clock_delta)

  let delta = new threejs.Vector3(delta_x, delta_y, delta_z).add(origin_bias)
  // let delta = new threejs.Vector3(0.01, 0, 0.01)
  player_object.orientation.add(delta).normalize()
}

function draw_orientation_line(player_object, scene)
{
  scene.remove(player_object.orientation_line)

  let relative_orientation = player_object.position.clone().add(player_object.orientation.clone().multiplyScalar(20))
  const geometry = new threejs.BufferGeometry().setFromPoints([player_object.position, relative_orientation]);
  const material = new threejs.LineBasicMaterial( { color: 0x0000ff } );
  player_object.orientation_line = new threejs.Line( geometry, material );

  scene.add(player_object.orientation_line)
}

var rotate_once = true;

function render(args) {
  const { players, render_objs } = args;
  window.requestAnimationFrame(() => render(args));
  auto_resize(render_objs.renderer, render_objs.canvas, render_objs.camera);
  
  let clock_delta = render_objs.clock.getDelta();

  // Rotate Camera
  var rotation = clock_delta * 2 * Math.PI / render_objs.period;
  
  // var rotation = 0
  // if (rotate_once) {
  //   rotation = Math.PI/2
  //   rotate_once = false;
  // }
  
  render_objs.camera_angle += rotation;
  // console.log(render_objs.camera_angle);
  if (render_objs.camera_angle > Math.PI) {
    render_objs.camera_angle -= 2*Math.PI;
  }
  // console.log(render_objs.camera_angle/Math.PI *180);
  render_objs.matrix.makeRotationY(rotation);
  render_objs.camera.position.applyMatrix4(render_objs.matrix);
  render_objs.camera.lookAt(0, 10, 0);
  // console.log(render_objs.camera.position)


  // Move Pokemon
  for (var player of players)
  {
    // variable updates
    update_velocity(player, clock_delta);
    update_orientation(player, clock_delta);

    // Determine New Position
    detect_collision_arena_wall(player, clock_delta, render_objs.arena.radius)


    // render updates
    update_player_position(player, rotation, render_objs.camera_angle);
    draw_orientation_line(player, render_objs.scene)

  }
  detect_collision_players(players)

  render_objs.renderer.render(render_objs.scene, render_objs.camera);
};

export {
  render
};