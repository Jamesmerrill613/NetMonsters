import * as threejs from 'three';
import * as ax from 'axios';
import { render } from './render';
import { create_player } from './models/player'
import { create_arena } from './models/arena'
async function get_sprite_texture(url)
{
  const loader = new threejs.TextureLoader();
  const texture = await loader.load(url);
  return texture
}

// async function create_arena()
// {
//   // console.log("Creating Arena");
//   let radius = 200
//   const geometry = new threejs.CylinderGeometry(radius, radius, 0.0, 360);
//   // const material = new threejs.MeshBasicMaterial( {color: 0x32A852} );
//   // const texture = await get_sprite_texture('https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/cd4c46ff-b405-472b-8116-a8fbb3ce5384/d9y2f7h-2dbe9ef8-f358-44de-b794-d8531c3ac70b.png/v1/fill/w_1024,h_1213,q_80,strp/pokemon_xy_oras_online_battle_floor_stock_by_skudde_textures_d9y2f7h-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTIxMyIsInBhdGgiOiJcL2ZcL2NkNGM0NmZmLWI0MDUtNDcyYi04MTE2LWE4ZmJiM2NlNTM4NFwvZDl5MmY3aC0yZGJlOWVmOC1mMzU4LTQ0ZGUtYjc5NC1kODUzMWMzYWM3MGIucG5nIiwid2lkdGgiOiI8PTEwMjQifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.vaXN_KS9d07BTi4vbBE_ov7DRQOhsdTvk7otB0lp2DE')
//   // const texture = await get_sprite_texture('https://scontent-den4-1.xx.fbcdn.net/v/t1.6435-9/s1080x2048/116629837_618043932249184_5447399576208662942_n.jpg?_nc_cat=109&ccb=1-5&_nc_sid=730e14&_nc_ohc=3IQjUHIkPHMAX_vvdsx&_nc_ht=scontent-den4-1.xx&oh=00_AT_LlUq6zhrskM7Z6zWfH2_9Gats7m-gtsRoTj6xi-cmDQ&oe=61F0B3E8')
//   // const texture = await get_sprite_texture('https://i.redd.it/o8a7u5vl6hb41.png')
//   // const texture = await get_sprite_texture('./grass.webp')
//   const texture = await get_sprite_texture('./stadium.jpeg')
//   const material = new threejs.MeshBasicMaterial({ map:texture,});
//   const obj = new threejs.Mesh( geometry, material );
  
//   // const sky_box_texture = await get_sprite_texture('./sky_box.jpeg') 
//   const sky_box_texture = await get_sprite_texture('./sky_box.jpeg') 
//   const s_geometry = new threejs.CylinderGeometry(radius, radius, 2000, 360);
//   const s_material = new threejs.MeshBasicMaterial( { map:sky_box_texture, side:threejs.DoubleSide} );
//   const sphere = new threejs.Mesh(s_geometry, s_material);
//   sphere.position.y = 25
  
//   obj.position.y = 0.0;
//   return {obj, radius, sphere};

// }

async function main()
{
  console.log("Launching Main");
  // console.log('Running Main');
  // Get document canvas
  let canvas = document.getElementById('battle_canvas');

  // Use THREE to create a WebGL 3D canvas
  let scene = new threejs.Scene();
  let renderer = new threejs.WebGLRenderer({ canvas: canvas });
  let camera = new threejs.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
  camera.mode = "orbit";
  camera.orbit_pos = new threejs.Vector3();
  camera.orbit_period = 40;
  camera.orbit_matrix = new threejs.Matrix4(); // Pre-allocate empty matrix for performance. Don't want to make one of these every frame.
  camera.my_target = 0;
  camera.time_between_modes = 6;
  camera.mode_cycle_period = 6;
  let clock = new threejs.Clock();
  
  // Set canvas size
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Create Area
  let arena = create_arena();
  arena.draw(scene)
  // scene.add(arena.obj);
  // scene.add(arena.sphere);

  // let id = 6; //Charzard
  // id = 3; // Venosour
  // id = 9; // Blastoise
  // id = 150; // Mewtwo
  // id = 25; // Pikachu
  // id = 149; //Dragonite
  // id = 890; //Eternatus
  // id = 321; //Wailord
  // id = 879; //Copperahah
  // id = 386 // Deoxys

  console.log("Creating Players")
  let players = [];
  let clamp = arena.radius * 0.4;
  let start_positions = [
    new threejs.Vector3(0, 0, -1).multiplyScalar(clamp),
    new threejs.Vector3(0, 0, 1).multiplyScalar(clamp),
    new threejs.Vector3(1, 0, 0).multiplyScalar(clamp),
    new threejs.Vector3(-1, 0, 0).multiplyScalar(clamp),    

    new threejs.Vector3(1, 0, 1).normalize().multiplyScalar(clamp),
    new threejs.Vector3(-1, 0, -1).normalize().multiplyScalar(clamp),
    new threejs.Vector3(-1, 0, 1).normalize().multiplyScalar(clamp),
    new threejs.Vector3(1, 0, -1).normalize().multiplyScalar(clamp),
    
    new threejs.Vector3(2, 0, 1).normalize().multiplyScalar(clamp),
    new threejs.Vector3(-2, 0, -1).normalize().multiplyScalar(clamp),
    new threejs.Vector3(-2, 0, 1).normalize().multiplyScalar(clamp),
    new threejs.Vector3(2, 0, -1).normalize().multiplyScalar(clamp),  
  
    new threejs.Vector3(1, 0, 2).normalize().multiplyScalar(clamp),
    new threejs.Vector3(-1, 0, -2).normalize().multiplyScalar(clamp),
    new threejs.Vector3(-1, 0, 2).normalize().multiplyScalar(clamp),
    new threejs.Vector3(1, 0, -2).normalize().multiplyScalar(clamp),
  ];
  let num_players = 3;
  let ids = [
    3,
    6,
    9,
    // // 150,
    // "eternatus-eternamax",
    // // "eevee",
    // 59,
    // "pidgey"
  ]
  for (let i = 0; i < num_players; i++)
  {
    let id = Math.floor(Math.random() * 905) + 1;
    if (i < ids.length) { id = ids[i]; }
    let player = await create_player(id)
    player.player_number = i;
    player.targeting = (player.player_number + 1 < num_players) ? player.player_number + 1 : 0

    players.push(player)
    players[i].set_position(start_positions[i])
    console.log(player.name)
  }

  var arena_height = 15
  for (let i = 0; i < players.length; i++)
  {
    // console.log("Adding to scene...")
    if (players[i].height > arena_height)
    {
      arena_height = players[i].height
    }

    // console.log("Adding to scene...")
    players[i].add_to_scene(scene);
  }
  arena_height *=3;
  if (arena_height > arena.radius*1.25){
    arena_height = arena.radius*1.25
  }
  if (arena_height < arena.radius*0.75){
    arena_height = arena.radius*0.75
  }
arena_height = 120
  // Add objects
  camera.position.z = arena.radius;
  // camera.position.y = 18; // Human height
  // camera.position.y = 60; // Stadium height
  camera.position.y = arena.height-1 // Drone hight


  let render_objs = { renderer, canvas, scene, camera, clock, arena};
  let attacks = [];

  console.log("Starting Render!");
  render({ players, attacks, render_objs });
}

async function run() {
  try {
    await main();
  } catch (err) {
    // console.log(err);
  }
}

run();