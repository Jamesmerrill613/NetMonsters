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
  var model_angle = Math.atan2(player_object.position.z, player_object.position.x);
  var relative_angle = model_angle + camera_angle;
  if (relative_angle > Math.PI){ relative_angle -= 2*Math.PI; }
  if (relative_angle < -1*Math.PI){ relative_angle += 2*Math.PI; }

  // >90, <180, not flipped
  if (((relative_angle > Math.PI/2) || (relative_angle < -1*Math.PI/2)) && !player_object.player_model.flipped) 
  {
    // console.log("flipping")
    player_object.player_model.front.rotation.y += Math.PI;
    player_object.player_model.flipped = true;
  }
  // <0, >-90, flipped
  else if ((relative_angle < Math.PI/2) && (relative_angle > -1*Math.PI/2) && player_object.player_model.flipped) 
  {
    // console.log("unflipping")
    player_object.player_model.front.rotation.y += Math.PI;
    player_object.player_model.flipped = false;
  }
}

function swap_model(player_object, camera_angle)
{
  var model_angle = Math.atan2(player_object.position.z, player_object.position.x);
  var relative_angle = model_angle + camera_angle;
  if (relative_angle > Math.PI){ relative_angle -= 2*Math.PI; }
  if (relative_angle < -1*Math.PI){ relative_angle += 2*Math.PI; }
  
  // >120, <180, not flipped
  if ((relative_angle > 1*Math.PI/4) && (relative_angle < 3*Math.PI/4) && !player_object.player_model.swapped) 
  {
    // console.log("swapping")
    let temp = player_object.player_model.back.position.clone();
    player_object.player_model.back.position.copy(player_object.player_model.front.position);
    player_object.player_model.front.position.copy(temp.clone());
    player_object.player_model.swapped = true;
  }
  // >-60 || <-120, flipped
  else if (((relative_angle < 1*Math.PI/4) || (relative_angle > 3*Math.PI/4)) && player_object.player_model.swapped) 
  {
    // console.log("unswapping")
    let temp = player_object.player_model.back.position.clone();
    player_object.player_model.back.position.copy(player_object.player_model.front.position);
    player_object.player_model.front.position.copy(temp);
    player_object.player_model.swapped = false;
  }
}

function update_velocity(player_object)
{
  let max = 2;
  let min = -2;
  let delta_x = Math.random() * (max - min) + min;
  let delta_z = Math.random() * (max - min) + min;
  delta_x -= player_object.position.x/500;
  delta_z -= player_object.position.z/500;
  player_object.velocity.add(new threejs.Vector3(delta_x, 0, delta_z))

  let min_s = player_object.player_data.height
  let min_v = new threejs.Vector3(-1*min_s, 0, -1*min_s)
  let max_v = new threejs.Vector3(min_s, 0, min_s)

  player_object.velocity.clamp(min_v, max_v);
  // player_object.velocity.addZ(Math.random()-0.5)
  // console.log(player_object.velocity)
}

function update_position(player_object, clock_delta)
{
  player_object.position.add(player_object.velocity.clone().multiplyScalar(clock_delta))

  if (player_object.player_model.swapped) 
  {
    player_object.player_model.back.position.copy(player_object.position);
  }
  else 
  {
    player_object.player_model.front.position.copy(player_object.position);
  }
}

function render(args) {
  const { players, render_objs } = args;
  window.requestAnimationFrame(() => render(args));
  auto_resize(render_objs.renderer, render_objs.canvas, render_objs.camera);
  
  let clock_delta = render_objs.clock.getDelta();

  // Rotate Camera
  var rotation = clock_delta * 2 * Math.PI / render_objs.period;
  render_objs.camera_angle += rotation;
  // console.log(render_objs.camera_angle);
  if (render_objs.camera_angle > Math.PI) {
    render_objs.camera_angle -= 2*Math.PI;
  }
  // console.log(render_objs.camera_angle/Math.PI *180);
  render_objs.matrix.makeRotationY(rotation);
  render_objs.camera.position.applyMatrix4(render_objs.matrix);
  render_objs.camera.lookAt(0, 10, 0);

  // Move Pokemon
  for (var player in players)
  {
    update_velocity(players[player]);
    update_position(players[player], clock_delta);
    players[player].player_model.front.rotation.y += rotation;
    players[player].player_model.back.rotation.y = players[player].player_model.front.rotation.y + Math.PI;
    flip_model(players[player], render_objs.camera_angle);
    swap_model(players[player], render_objs.camera_angle);
  }

  render_objs.renderer.render(render_objs.scene, render_objs.camera);
};

export {
  render
};