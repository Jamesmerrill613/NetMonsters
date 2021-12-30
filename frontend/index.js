import * as threejs from 'three';
import * as ax from 'axios';
import { render } from './render';


async function get_rand_color_from_server()
{
  const { data: { color }} = await ax.get('http://localhost:3000/v1/net_monsters/rand_color');
  console.log(`got a color: ${color}`);
  return color;
}

async function get_pokeomon_from_server(id)
{
  const res = await ax.get('http://localhost:3000/v1/net_monsters/get_pokemon', { params: { id:id }});
  console.log(JSON.stringify(res.data));
  return res.data
}

async function get_sprite_texture(url)
{
  const loader = new threejs.TextureLoader();
  const texture = await loader.load(url);
  return texture
}

async function create_cube()
{
  console.log('Creating Cube');

  const geometry = new threejs.BoxGeometry(1, 1, 1);
  const material = new threejs.MeshBasicMaterial({ color: await get_rand_color_from_server() });
  const cube = new threejs.Mesh(geometry, material);
  return cube;
}

async function create_arena()
{
  console.log("Creating Arena");

  const geometry = new threejs.CylinderGeometry(80, 80, 0.0, 360);
  // const material = new threejs.MeshBasicMaterial( {color: 0x32A852} );
  // const texture = await get_sprite_texture('https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/cd4c46ff-b405-472b-8116-a8fbb3ce5384/d9y2f7h-2dbe9ef8-f358-44de-b794-d8531c3ac70b.png/v1/fill/w_1024,h_1213,q_80,strp/pokemon_xy_oras_online_battle_floor_stock_by_skudde_textures_d9y2f7h-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTIxMyIsInBhdGgiOiJcL2ZcL2NkNGM0NmZmLWI0MDUtNDcyYi04MTE2LWE4ZmJiM2NlNTM4NFwvZDl5MmY3aC0yZGJlOWVmOC1mMzU4LTQ0ZGUtYjc5NC1kODUzMWMzYWM3MGIucG5nIiwid2lkdGgiOiI8PTEwMjQifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.vaXN_KS9d07BTi4vbBE_ov7DRQOhsdTvk7otB0lp2DE')
  const texture = await get_sprite_texture('https://scontent-den4-1.xx.fbcdn.net/v/t1.6435-9/s1080x2048/116629837_618043932249184_5447399576208662942_n.jpg?_nc_cat=109&ccb=1-5&_nc_sid=730e14&_nc_ohc=3IQjUHIkPHMAX_vvdsx&_nc_ht=scontent-den4-1.xx&oh=00_AT_LlUq6zhrskM7Z6zWfH2_9Gats7m-gtsRoTj6xi-cmDQ&oe=61F0B3E8')

  const material = new threejs.MeshBasicMaterial({ map:texture });
  const obj = new threejs.Mesh( geometry, material );
  obj.position.y = 0.0;
  return obj;

}

function create_plane_mesh(img, size)
{
  var geometry = new threejs.PlaneGeometry(size, size);
  var material = new threejs.MeshBasicMaterial({map: img, transparent: true, opacity: 1.0, color: 0xFFFFFF, side:threejs.DoubleSide }); //right side
  var model = new threejs.Mesh(geometry, material);
  return model
}

async function create_model(data)
{
  console.log("Creating Pokemon");
  const front_img = await get_sprite_texture(data.sprites.front);
  const back_img = await get_sprite_texture(data.sprites.back);
  
  var front = create_plane_mesh(front_img, data.height);
  var back = create_plane_mesh(back_img, data.height);

  var flipped = false;
  var swapped = false;
  var rotation = 0;

  var model = { front, back, flipped, swapped, rotation }
  return model;
}

async function main()
{
  console.log('Running Main');
  // Get document canvas
  const canvas = document.getElementById('battle_canvas');

  // Use THREE to create a WebGL 3D canvas
  const scene = new threejs.Scene();
  const renderer = new threejs.WebGLRenderer({ canvas: canvas });
  const camera = new threejs.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

  var period = 25; // rotation time in seconds
  var clock = new threejs.Clock();
  var matrix = new threejs.Matrix4(); // Pre-allocate empty matrix for performance. Don't want to make one of these every frame.
  
  // Set canvas size
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Create Area
  const arena = await create_arena();
  scene.add(arena);

  // Create Player
  var player1_id = 890;
  // var player1_id = Math.floor(Math.random() * 897) + 1;
  const player1_data = await get_pokeomon_from_server(player1_id);
  var player1_model = await create_model(player1_data);
  player1_model.front.position.set( 25, player1_data.height*0.45, 0)
  player1_model.back.position.set( 25, player1_data.height*-100, 0)
  scene.add(player1_model.front);
  scene.add(player1_model.back);
  
  
  var player2_id = 9;
  // var player2_id = Math.floor(Math.random() * 897) + 1;
  const player2_data = await get_pokeomon_from_server(player2_id);
  var player2_model = await create_model(player2_data)
  player2_model.front.position.set(-25, player2_data.height*0.45, 0)
  // player2_model.front.rotation.y = Math.PI;
  player2_model.back.position.set(-25, player2_data.height*-100, 0)
  scene.add(player2_model.front);
  scene.add(player2_model.back);

  var player3_id = 6;
  // var player3_id = Math.floor(Math.random() * 897) + 1;
  const player3_data = await get_pokeomon_from_server(player3_id);
  var player3_model = await create_model(player3_data)
  player3_model.front.position.set(0, player3_data.height*0.45, -25)
  // player3_model.front.rotation.y = Math.PI;
  player3_model.back.position.set(0, player3_data.height*-100, -25)
  scene.add(player3_model.front);
  scene.add(player3_model.back);



  // Add objects
  // const cube = await create_cube();
  camera.position.z = 250;
  camera.position.y = camera.position.z * 0.375;

  const camera_angle = 0;
  
  var models = { player1_model, player2_model, player3_model };
  var render_objs = { renderer, canvas, scene, camera, period, clock, matrix, camera_angle };

  render({ models, render_objs });
}

async function run() {
  try {
    await main();
  } catch (err) {
    console.log(err);
  }
}

run();