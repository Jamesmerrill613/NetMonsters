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

function flip_model(model, camera_angle)
{
  var model_angle = Math.atan2(model.front.position.z, model.front.position.x);
  var relative_angle = model_angle + camera_angle;
  if (relative_angle > Math.PI){ relative_angle -= 2*Math.PI; }
  if (relative_angle < -1*Math.PI){ relative_angle += 2*Math.PI; }

  // >90, <180, not flipped
  if (((relative_angle > Math.PI/2) || (relative_angle < -1*Math.PI/2)) && !model.flipped) 
  {
    // console.log("flipping")
    model.front.rotation.y += Math.PI;
    model.flipped = true;
  }
  // <0, >-90, flipped
  else if ((relative_angle < Math.PI/2) && (relative_angle > -1*Math.PI/2) && model.flipped) 
  {
    // console.log("unflipping")
    model.front.rotation.y += Math.PI;
    model.flipped = false;
  }
}

function swap_model(model, camera_angle)
{
  var model_angle = Math.atan2(model.front.position.z, model.front.position.x);
  var relative_angle = model_angle + camera_angle;
  if (relative_angle > Math.PI){ relative_angle -= 2*Math.PI; }
  if (relative_angle < -1*Math.PI){ relative_angle += 2*Math.PI; }

  model.back.rotation.y = model.front.rotation.y + Math.PI;
  model.back.position.x = model.front.position.x;
  model.back.position.z = model.front.position.z;
  // console.log(relative_angle);
  // >120, <180, not flipped
  if ((relative_angle > 1*Math.PI/4) && (relative_angle < 3*Math.PI/4) && !model.swapped) 
  {
    // console.log("swapping")
    let temp = model.back.position.y;
    model.back.position.y = model.front.position.y;
    model.front.position.y = temp;
    model.swapped = true;
  }
  // >-60 || <-120, flipped
  else if (((relative_angle < 1*Math.PI/4) || (relative_angle > 3*Math.PI/4)) && model.swapped) 
  {
    // console.log("unswapping")
    let temp = model.back.position.y;
    model.back.position.y = model.front.position.y;
    model.front.position.y = temp;
    model.swapped = false;
  }
}


function render(args) {
  const { models, render_objs } = args;
  window.requestAnimationFrame(() => render(args));
  auto_resize(render_objs.renderer, render_objs.canvas, render_objs.camera);

  // Rotate Camera
  let clock_delta = render_objs.clock.getDelta();
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
  for (var model in models)
  {
    models[model].front.position.x += (Math.random()-0.5)*0.4;
    models[model].front.position.z += (Math.random()-0.5)*0.4;
  }

  // Rotate Pokemon
  for (var model in models)
  {
    models[model].front.rotation.y += rotation;
    flip_model(models[model], render_objs.camera_angle);
    swap_model(models[model], render_objs.camera_angle);
  }




  render_objs.renderer.render(render_objs.scene, render_objs.camera);
};

export {
  render
};