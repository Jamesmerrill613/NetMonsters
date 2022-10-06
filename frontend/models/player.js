import * as THREE from 'three';
import * as ax from 'axios';
import { get_type_color } from '../colors'

var SPRITE_SCALE = 1.2;
var SPHERE_OPACITY = 0.4;
var SPRITE_Y_OFFSET_PERCENT = 0.05; // Pecentage of player height sprite is drawn offset from actual y (to avoid large sprites from clipping the ground)
var debug = false;


// pixel data
function getImageData( image ) {
    var canvas = document.createElement( 'canvas' );
    canvas.width = image.width;
    canvas.height = image.height;
    var context = canvas.getContext( '2d' );
    context.drawImage( image, 0, 0 );
    return context.getImageData( 0, 0, image.width, image.height );
}

function getPixel( imagedata, x, y ) {
    var position = ( x + imagedata.width * y ) * 4, data = imagedata.data;
    return { r: data[ position ], g: data[ position + 1 ], b: data[ position + 2 ], a: data[ position + 3 ] };
}

function get_whitespace_ratio( texture )
{
    let rows_white_space = 0;
    var imagedata = getImageData( texture.image );
    for (let y = 0; y < texture.image.height; y++ )
    {
        let is_white_space = true;
        for (let x = 0; x < texture.image.width; x++)
        {
            let color = getPixel( imagedata, x, y)
            if (color.a > 0)
            {
                is_white_space = false;
                x = texture.image.width;
            }
        }
        if (is_white_space)
        {
            rows_white_space++;
        }
    }
    return (imagedata.height - rows_white_space) / imagedata.height;
}

function LOG(msg)
{
    if (debug) { console.log(msg) }
}

function chance_is_female(gender_rate)
{
    let chance = gender_rate/8;
    if (Math.random() < chance) { return true; }
    return false;
}

function chance_is_shiny()
{
    let chance = 1/16;
    if (Math.random() < chance) { return true; }
    return false;
}

function check_flying_type(types)
{
    for (let type of types)
    {
        if (type == 'flying') { return true; }
    }
    return false;
}

async function get_texture(url)
{
    const loader = new THREE.TextureLoader();
    let texture = await loader.loadAsync(url);
    return texture;
}

function create_plane_mesh(img, size)
{
    LOG("Building plane mesh")
    let geometry = new THREE.PlaneGeometry(size, size);
    let material = new THREE.MeshBasicMaterial({map: img, transparent: true, opacity: 1.0, color: 0xFFFFFF, side:THREE.DoubleSide, depthWrite:false}); //right side
    let mesh = new THREE.Mesh(geometry, material);
    return mesh
}

function create_line(points, color)
{
    // LOG("Building Line")
    let geometry = new THREE.BufferGeometry().setFromPoints(points);
    let material = new THREE.LineBasicMaterial( { color: color } );
    let line = new THREE.Line( geometry, material );
    return line;
}

function create_sphere(radius, color)
{
    let geometry = new THREE.SphereGeometry(radius);
    let material = new THREE.MeshBasicMaterial( { color: color, opacity: 0, transparent: false, depthWrite:true} );
    let sphere = new THREE.Mesh(geometry, material);
    return sphere;
}

async function create_player(id)
{
    LOG("Creating Player")
    let res = await ax.get('http://localhost:3000/v1/net_monsters/get_pokemon', { params: { id:id }});
    let data = res.data

    // Evolve
    // if (data.species.evolves_to.length && Math.random() < 1.0 && !data.species.evolves_to.includes(data.name))
    // {
    //     let r = Math.floor(Math.random() * (data.species.evolves_to.length));
    //     if (!data.name.includes(data.species.evolves_to[r])) // some evo chain exceptions i.e. basculin
    //     {
    //         LOG("Getting evolution!", data.species.evolves_to[r])
    //         res = await ax.get('http://localhost:3000/v1/net_monsters/get_pokemon', { params: { id:res.data.species.evolves_to[r] }});
    //    }
    //    data = res.data;
    // }

    // Select Variant
    // if (data.species.varieties.length > 1 && Math.random() < 0.5)
    // {
    //     let r = Math.floor(Math.random() * (data.species.varieties.length -1)) + 1;
    //     LOG("Getting variant!", data.species.varieties[r])
    //     let gmax = false;
    //     let totem = false;
    //     let totem_sprites = res.data.sprites;        
    //     if (data.species.varieties[r].includes("gmax")) { gmax = true; }
    //     if (data.species.varieties[r].includes("totem")) { totem = true; }
    
    //     if (!gmax) { res = await ax.get('http://localhost:3000/v1/net_monsters/get_pokemon', { params: { id:res.data.species.varieties[r] }}); }
    //     if (totem) { res.data.sprites = totem_sprites; }
    //     if (res.data.sprites.front_default != null) { data = res.data; }
    // }
    
    LOG("Player found: " + data.name)

    data.is_female = chance_is_female(data.species.gender_rate);
    data.is_shiny =  chance_is_shiny();
    LOG("Gender and Shiny determined")
    let front = data.sprites.front_default;
    let back = data.sprites.back_default;
    if (data.is_shiny)
    {
        if (data.sprites.front_shiny != null) { front = data.sprites.front_shiny; }
        if (data.sprites.back_shiny != null) { back = data.sprites.back_shiny; }
    }
    if (data.is_female && !(data.is_shiny))
    {
        if (data.sprites.front_female != null) { front = data.sprites.front_female; }
        if (data.sprites.back_female != null) { back = data.sprites.back_female; }
    }
    if (data.is_female && data.is_shiny)
    {
        if (data.sprites.front_shiny_female != null) { front = data.sprites.front_shiny_female; }
        if (data.sprites.back_shiny_female != null) { back = data.sprites.back_shiny_female; }
    }

    LOG("Gender and Shiny selected")
    console.log(front);
    console.log(back);
    data.textures = {}
    data.textures.front = await get_texture(front);
    data.textures.front_flipped = await data.textures.front.clone();
    data.textures.front_flipped.repeat.set(-1, 1);
    data.textures.front_flipped.center.set(0.5, 0.5);

    if (back != null)
    {
        data.textures.back_flipped =  await get_texture(back);
        data.textures.back = await data.textures.back_flipped.clone();
        data.textures.back.repeat.set(-1, 1);
        data.textures.back.center.set(0.5, 0.5);

    }
    else
    {
        data.textures.back_flipped = await data.textures.front.clone();
        data.textures.back = await data.textures.front_flipped.clone();
        data.textures.back_flipped.repeat.set(-1, 1);
        data.textures.back_flipped.center.set(0.5, 0.5);
    }
    
    data.textures.front.magFilter = THREE.NearestFilter;
    data.textures.front_flipped.magFilter = THREE.NearestFilter;
    data.textures.back_flipped.magFilter = THREE.NearestFilter;
    data.textures.back.magFilter = THREE.NearestFilter;

    data.textures.front.needsUpdate = true;
    data.textures.front_flipped.needsUpdate = true;
    data.textures.back_flipped.needsUpdate = true;
    data.textures.back.needsUpdate = true;
    
    LOG("Gender and Shiny loaded")

    for (let face in data.textures)
    {
        data.textures[face].whitespace_ratio = get_whitespace_ratio(data.textures[face])
    }


    let player = new Player(data)
    LOG(player)
    return player
}

class Player
{
    constructor(data)
    {
        LOG("Constructing Player")
        this.id =       data.id;
        this.name =     data.name;
        this.height =   data.height;
        if (this.name.includes('gmax')) { this.height *= 0.25}
        if (this.name.includes('eternamax')) { this.height *= 0.15}
        if (this.height < 3) (this.height = 3)
        if (this.height > 100) (this.height = 100)
        this.radius =   this.height/2;
        this.weight =   data.weight;
        this.types =    data.types;
        this.color =    get_type_color(this.types[0]);
        this.moves =    this.#set_moves(data.moves)
        
        this.attack =   data.attack;
        this.defense =  data.defense;
        this.special_attack =   data.special_attack;
        this.special_defense =  data.special_defense;
        this.speed =    data.speed;
        
        this.position =     new THREE.Vector3();
        this.velocity =     new THREE.Vector3();
        this.orientation =  new THREE.Vector3();

        this.#create_model(data.textures, data.height);
        this.#create_orientation_line();
        this.#create_velocity_line();
        this.#create_sphere();

        LOG("Player ready")
        this.time_between_actions = 3;
        this.time_between_attacks = 1;

        this.can_fly = check_flying_type(this.types)
        // this.#override_moveset();
    }

    #override_moveset()
    {
        this.attack = 100;
        this.speed = 100;
        this.moves = 
        [
            {
                "name": "normal-physical",
                "id": Math.floor(Math.random()*100),
                "accuracy": 50,
                "damage_class": "physical",
                // "damage_class": "special",
                "power": 100,
                "pp": 15,
                "type": this.types[0], 
                "target": "selected-pokemon",
                "priority": 0            
            }
        ]
    }

    #set_moves(moves)
    {
        let my_moves = []
        for (let move of moves)
        {
            // console.log(move)
            if (
                move.accuracy > 0 &&
                (move.damage_class == "physical" || move.damage_class == "special") &&
                move.power > 0 &&
                move.target != "self" &&
                move.type != "null"
            )
            {my_moves.push(move)}
        }
        return my_moves
    }

    #create_model(textures, height)
    {
        LOG("Creating Sprite")
        this.model = {};
        this.model.flipped = false;       
        this.model.swapped = false;

        this.sprites = {};

        let scale = this.height/textures.front.whitespace_ratio;
        this.sprites.front = new THREE.Sprite(new THREE.SpriteMaterial( { map: textures.front, alphaTest: 0.01 } ));
        this.sprites.front.scale.set(scale, scale, scale);

        scale = this.height/textures.front_flipped.whitespace_ratio;
        this.sprites.front_flipped = new THREE.Sprite(new THREE.SpriteMaterial( { map: textures.front_flipped, alphaTest: 0.01 } ));
        this.sprites.front_flipped.scale.set(scale, scale, scale);
        
        scale = this.height/textures.back.whitespace_ratio;
        this.sprites.back = new THREE.Sprite(new THREE.SpriteMaterial( { map: textures.back, alphaTest: 0.01 } ));
        this.sprites.back.scale.set(scale, scale, scale);

        scale = this.height/textures.back_flipped.whitespace_ratio;
        this.sprites.back_flipped = new THREE.Sprite(new THREE.SpriteMaterial( { map: textures.back_flipped, alphaTest: 0.01 } ));
        this.sprites.back_flipped.scale.set(scale, scale, scale);
        
        for (let sprite in this.sprites)
        {
            this.sprites[sprite].position.set(0, -1000, 0)
        }
        this.sprites.front.position.copy(this.position)
    }

    #create_orientation_line()
    {
        // LOG("Creating Orientation Line")
        let relative_orientation = this.position.clone().add(this.orientation.clone().multiplyScalar(20))
        let points = [this.position.clone(), relative_orientation]
        this.orientation_line = create_line(points, 0xff0000)
    }

    #create_velocity_line()
    {
        LOG("Creating Velocity Line")
        let relative_orientation = this.position.clone().add(this.velocity.clone())
        let points = [this.position.clone(), relative_orientation]
        this.velocity_line = create_line(points, 0x0000ff)
    }

    #create_sphere()
    {
        this.draw_sphere = false;
        return;
        this.draw_sphere = true;
        console.log("Creating Sphere Hitbox")
        this.sphere = create_sphere(this.radius, this.color)
        LOG(this.sphere)
    }

    #flip_model(camera_angle)
    {
        let model_angle = Math.atan2(this.orientation.z, this.orientation.x);
        let relative_angle = model_angle + camera_angle;
        if (relative_angle >= Math.PI){relative_angle -= 2*Math.PI}
        if (relative_angle < -Math.PI){relative_angle += 2*Math.PI}
      
        let over_angle = Math.PI/32
      
        // >90, <180, not flipped
        if (((relative_angle >= Math.PI/2 + over_angle) || (relative_angle < -Math.PI/2 - over_angle)) && this.model.flipped) 
        {
            LOG("flipping")
            this.model.flipped = false;
            for (let sprite in this.sprites)
            {
                this.sprites[sprite].position.set(0, -1000, 0)
            }
        }
        // <0, >-90, flipped
        else if ((relative_angle < Math.PI/2 - over_angle) && (relative_angle >= -Math.PI/2 + over_angle) && !this.model.flipped) 
        {
            LOG("unflipping")
            this.model.flipped = true;
            for (let sprite in this.sprites)
            {
                this.sprites[sprite].position.set(0, -1000, 0)
            }
        }
    }

    #swap_model(camera_angle)
    {
        let model_angle = Math.atan2(this.orientation.z, this.orientation.x);
        let relative_angle = model_angle + camera_angle;
        if (relative_angle >= Math.PI){relative_angle -= 2*Math.PI}
        if (relative_angle < -Math.PI){relative_angle += 2*Math.PI}
        
        let over_angle = Math.PI/32
      
        // >120, <180, not flipped
        if ((relative_angle < -1*Math.PI/4 - over_angle) && (relative_angle >= -3*Math.PI/4 + over_angle) && !this.model.swapped) 
        // if ((relative_angle < 0) && !this.model.flipped) 
        {
            // LOG("swapping")
            this.model.swapped = true;
            for (let sprite in this.sprites)
            {
                this.sprites[sprite].position.set(0, -1000, 0)
            }
        }
        // >-60 || <-120, flipped
        else if (((relative_angle >= -1*Math.PI/4 + over_angle) || (relative_angle < -3*Math.PI/4 - over_angle)) && this.model.swapped) 
        // else if ((relative_angle > 0) && this.model.flipped) 
        {
            // LOG("unswapping")
            this.model.swapped = false;
            for (let sprite in this.sprites)
            {
                this.sprites[sprite].position.set(0, -1000, 0)
            }
        }
    }

    set_position(pos)
    {
        this.position.copy(pos.clone())
    }

    set_orientation(target)
    {
        this.orientation.copy(target.clone().sub(this.position).normalize())
    }

    update_velocity(clock_delta)
    {
        //Random velocity update (REPLACE WITH NETWORK SELECTION)
        let delta = new THREE.Vector3();
        let gravity = 98

        // Flying type can update vertical velocity
        if (this.can_fly) { gravity *= 0.1; }

        // Player is above the surface
        if (this.is_in_air()) { delta.y += -1*gravity; }

        // Player is on ground ~ apply friction
        if (this.is_ground_level()) { this.velocity.multiplyScalar(1-(0.9 * clock_delta)); }

        // Update rate controlled by clock
        delta.multiplyScalar(clock_delta)

        // Apply Update
        this.velocity.add(delta)
    }

    update_position(clock_delta, camera_angle)
    {
        // Apply Velocity
        this.position.add(this.velocity.clone().multiplyScalar(clock_delta));

        //Update Sphere Position
        if (this.draw_sphere) { this.sphere.position.copy(this.position); }

        //Flip/Swap if necessary
        this.#flip_model(camera_angle);
        this.#swap_model(camera_angle);

        let sprite_position = this.position.clone()
        sprite_position.y += SPRITE_Y_OFFSET_PERCENT * this.height;
        if (!this.model.flipped && !this.model.swapped) { this.sprites.front.position.copy(sprite_position); }
        if (this.model.flipped && !this.model.swapped) { this.sprites.front_flipped.position.copy(sprite_position); }
        if (!this.model.flipped && this.model.swapped) { this.sprites.back.position.copy(sprite_position); }
        if (this.model.flipped && this.model.swapped) { this.sprites.back_flipped.position.copy(sprite_position); }
    }

    draw_orientation_line(scene)
    {
        // Remove old line
        this.orientation_line.geometry.dispose();
        this.orientation_line.material.dispose();
        scene.remove(this.orientation_line)
      
        // Draw new line
        this.#create_orientation_line()
        scene.add(this.orientation_line)
    }

    draw_velocity_line(scene)
    {
        // Remove old line
        this.velocity_line.geometry.dispose();
        this.velocity_line.material.dispose();
        scene.remove(this.velocity_line)

        // Draw new line
        this.#create_velocity_line();
        scene.add(this.velocity_line)    
    }

    add_to_scene(scene)
    {
        if (this.draw_sphere) { scene.add(this.sphere); }
        // scene.add(this.model.front);
        // scene.add(this.model.back);
        scene.add(this.orientation_line);
        scene.add(this.sprites.front)
        scene.add(this.sprites.front_flipped)
        scene.add(this.sprites.back)
        scene.add(this.sprites.back_flipped)
    }

    is_ground_level()
    {
        if (this.position.y <= this.radius*1.01 && this.position.y > 0) { return true; }
        return false;
    }
    
    is_above_ground()
    {
        if (this.position.y >= 0) { return true; }
        return false;
    }
    
    is_in_air()
    {
        if (this.position.y >= this.radius*1.1) { return true; }
        return false;
    }

    static detect_player_on_player_collision(A, B)
    {
        {
            let A_pos = A.position.clone()
            let B_pos = B.position.clone()
            let pos = A_pos.clone().sub(B_pos.clone());
            if (pos.length() < A.radius + B.radius)
            {
                console.log("Collision detected between %s and %s", A.name, B.name);
                A.position = new THREE.Vector3().copy(A_pos)
                
                return true;
            }
        }    
    }

    static apply_player_on_player_collision(A, B)
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
        B.velocity.add(A2B_velocity.clone().multiplyScalar(2*A.weight/m_all)).sub(B2A_velocity.clone().multiplyScalar(2*A.weight/m_all));
    
        // Update Position
        let r_all = A.radius + B.radius
        let A_trans = A2B_incident.clone().normalize().multiplyScalar((A2B_incident.length() - (r_all))*(A.radius/r_all*1.01));
        let B_trans = B2A_incident.clone().normalize().multiplyScalar((B2A_incident.length() - (r_all))*(B.radius/r_all*1.01));
        A.position.add(A_trans)
        B.position.add(B_trans)
    }
}



export {
    create_player,
    Player
}