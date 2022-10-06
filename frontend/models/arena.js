import * as THREE from 'three';

var debug = true;
function LOG(msg)
{
    if (debug) { console.log(msg) }
}

var floor_color = 0xdcaf6b
var ortho_face_color = 0x42b286
var angle_face_color = 0x3dac82
var ortho_bleacher_color = 0xd06666
var angle_bleacher_color = 0xc05652
var ortho_wall_color = 0x9d7068
var angle_wall_color = 0x725a58
var ceiling_color = 0x8da0a8
var sky_box_color = 0xadd8eb

function create_arena()
{
    LOG("Creating Arena")
    return new Arena(2.0)
}

class Arena
{
    constructor(scale)
    {
        // Top = +Z
        // Bottom = -Z
        // Right = -X
        // Left = X
        this.height = 70*scale

        this.x_face = 35*scale
        this.z_face = 60*scale;        
        this.corner_face = 10*scale;        
        this.face_height = 15*scale;
        this.bleacher_height =10*scale

        this.scale = scale;
        this.radius = Math.min(this.x_face, this.z_face);

        LOG("Building Arena")
        this.#create_floor()
        this.#create_top_face()
        this.#create_bottom_face()
        this.#create_right_face()
        this.#create_left_face()
        this.#create_tr_face()
        this.#create_br_face()
        this.#create_bl_face()
        this.#create_tl_face()
        this.#create_top_bleacher()
        this.#create_bottom_bleacher()
        this.#create_right_bleacher()
        this.#create_left_bleacher()
        this.#create_tr_bleacher()
        this.#create_br_bleacher()
        this.#create_bl_bleacher()
        this.#create_tl_bleacher()
        this.#create_top_wall()
        this.#create_bottom_wall()
        this.#create_right_wall()
        this.#create_left_wall()
        this.#create_tr_wall()
        this.#create_br_wall()
        this.#create_bl_wall()
        this.#create_tl_wall()
        this.#create_ceiling()
        this.#create_sky_box()
    }

    draw(scene)
    {
        LOG("Drawing Arena")
        scene.add(this.floor)
        scene.add(this.top_face)
        scene.add(this.bottom_face)
        scene.add(this.right_face)
        scene.add(this.left_face)
        scene.add(this.tr_face)
        scene.add(this.br_face)
        scene.add(this.bl_face)
        scene.add(this.tl_face)
        scene.add(this.top_bleacher)
        scene.add(this.bottom_bleacher)
        scene.add(this.right_bleacher)
        scene.add(this.left_bleacher)
        scene.add(this.tr_bleacher)
        scene.add(this.br_bleacher)
        scene.add(this.bl_bleacher)
        scene.add(this.tl_bleacher)
        scene.add(this.top_wall)
        scene.add(this.bottom_wall)
        scene.add(this.right_wall)
        scene.add(this.left_wall)
        scene.add(this.tr_wall)
        scene.add(this.br_wall)
        scene.add(this.bl_wall)
        scene.add(this.tl_wall)
        scene.add(this.ceiling)
        // scene.add(this.sky_box)
    }

    #create_floor()
    {
        LOG("Building Floor")
        let geometry = new THREE.PlaneGeometry(2*this.x_face, 2*this.z_face);
        let material = new THREE.MeshBasicMaterial({color: floor_color })
        this.floor = new THREE.Mesh(geometry, material)
        this.floor.rotateX(-1 * Math.PI/2)
        this.floor.normal = new THREE.Vector3(0, 1, 0)
    }
    #create_top_face()
    {
        LOG("Building Top Face")
        let geometry = new THREE.PlaneGeometry(2*(this.x_face-this.corner_face), this.face_height);
        let material = new THREE.MeshBasicMaterial({color: ortho_face_color })
        this.top_face = new THREE.Mesh(geometry, material)
        this.top_face.rotateY(Math.PI)
        this.top_face.position.copy(new THREE.Vector3(0, this.face_height/2, this.z_face))
        this.top_face.normal = new THREE.Vector3(0, 0, -1)
    }
    #create_bottom_face()
    {
        LOG("Building Bottom Face")
        let geometry = new THREE.PlaneGeometry(2*(this.x_face-this.corner_face), this.face_height);
        let material = new THREE.MeshBasicMaterial({color: ortho_face_color })
        this.bottom_face = new THREE.Mesh(geometry, material)
        this.bottom_face.position.copy(new THREE.Vector3(0, this.face_height/2, -this.z_face))
        this.bottom_face.normal = new THREE.Vector3(0, 0, 1)
    }
    #create_right_face()
    {
        LOG("Building Right Face")
        let geometry = new THREE.PlaneGeometry(2*(this.z_face-this.corner_face), this.face_height);
        let material = new THREE.MeshBasicMaterial({color: ortho_face_color })
        this.right_face = new THREE.Mesh(geometry, material)
        this.right_face.rotateY(Math.PI/2)
        this.right_face.position.copy(new THREE.Vector3(-this.x_face, this.face_height/2, 0))
        this.right_face.normal = new THREE.Vector3(1, 0, 0)
    }
    #create_left_face()
    {
        LOG("Building Left Face")
        let geometry = new THREE.PlaneGeometry(2*(this.z_face-this.corner_face), this.face_height);
        let material = new THREE.MeshBasicMaterial({color: ortho_face_color })
        this.left_face = new THREE.Mesh(geometry, material)
        this.left_face.rotateY(-Math.PI/2)
        this.left_face.position.copy(new THREE.Vector3(this.x_face, this.face_height/2, 0))
        this.left_face.normal = new THREE.Vector3(-1, 0, 0)
    }
    #create_tr_face()
    {
        LOG("Building Top-Right Face")
        let geometry = new THREE.PlaneGeometry(this.corner_face*Math.SQRT2, this.face_height);
        let material = new THREE.MeshBasicMaterial({color: angle_face_color })
        this.tr_face = new THREE.Mesh(geometry, material)
        this.tr_face.rotateY(Math.PI*3/4)
        this.tr_face.position.copy(new THREE.Vector3(-(this.x_face-this.corner_face/2), this.face_height/2, (this.z_face-this.corner_face/2)))
        this.tr_face.normal = new THREE.Vector3(0.5, 0, -0.5)
    }
    #create_br_face()
    {
        LOG("Building Bottom-Right Face")
        let geometry = new THREE.PlaneGeometry(this.corner_face*Math.SQRT2, this.face_height);
        let material = new THREE.MeshBasicMaterial({color: angle_face_color })
        this.br_face = new THREE.Mesh(geometry, material)
        this.br_face.rotateY(Math.PI/4)
        this.br_face.position.copy(new THREE.Vector3(-(this.x_face-this.corner_face/2), this.face_height/2, -(this.z_face-this.corner_face/2)))
        this.br_face.normal = new THREE.Vector3(0.5, 0, 0.5)
    }
    #create_bl_face()
    {
        LOG("Building Bottom-Left Face")
        let geometry = new THREE.PlaneGeometry(this.corner_face*Math.SQRT2, this.face_height);
        let material = new THREE.MeshBasicMaterial({color: angle_face_color })
        this.bl_face = new THREE.Mesh(geometry, material)
        this.bl_face.rotateY(-1*Math.PI/4)
        this.bl_face.position.copy(new THREE.Vector3((this.x_face-this.corner_face/2), this.face_height/2, -(this.z_face-this.corner_face/2)))
        this.br_face.normal = new THREE.Vector3(-0.5, 0, 0.5)
    }
    #create_tl_face()
    {
        LOG("Building Top-Left Face")
        let geometry = new THREE.PlaneGeometry(this.corner_face*Math.SQRT2, this.face_height);
        let material = new THREE.MeshBasicMaterial({color: angle_face_color })
        this.tl_face = new THREE.Mesh(geometry, material)
        this.tl_face.rotateY(-1*Math.PI*3/4)
        this.tl_face.position.copy(new THREE.Vector3((this.x_face-this.corner_face/2), this.face_height/2, (this.z_face-this.corner_face/2)))
        this.tl_face.normal = new THREE.Vector3(-0.5, 0, -0.5)
    }
    #create_top_bleacher()
    {
        LOG("Building Top Bleacher")
        let geometry = new THREE.PlaneGeometry(2*(this.x_face-this.corner_face), this.bleacher_height*Math.SQRT2);
        let material = new THREE.MeshBasicMaterial({color: ortho_bleacher_color })
        this.top_bleacher = new THREE.Mesh(geometry, material)
        this.top_bleacher.rotateY(Math.PI)
        this.top_bleacher.rotateX(-1*Math.PI/4)
        this.top_bleacher.position.copy(new THREE.Vector3(0, this.face_height+this.bleacher_height/2, this.z_face+this.bleacher_height/2))
        this.top_bleacher.normal = new THREE.Vector3(0, 0.5, -0.5)
    }
    #create_bottom_bleacher()
    {
        LOG("Building Bottom Bleacher")
        let geometry = new THREE.PlaneGeometry(2*(this.x_face-this.corner_face), this.bleacher_height*Math.SQRT2);
        let material = new THREE.MeshBasicMaterial({color: ortho_bleacher_color })
        this.bottom_bleacher = new THREE.Mesh(geometry, material)
        this.bottom_bleacher.rotateX(-1*Math.PI*1/4)
        this.bottom_bleacher.position.copy(new THREE.Vector3(0, this.face_height+this.bleacher_height/2, -(this.z_face+this.bleacher_height/2)))
        this.bottom_bleacher.normal = new THREE.Vector3(0, 0.5, 0.5)
    }
    #create_right_bleacher()
    {
        LOG("Building Right Bleacer")
        let geometry = new THREE.PlaneGeometry(2*(this.z_face-this.corner_face), this.bleacher_height*Math.SQRT2);
        let material = new THREE.MeshBasicMaterial({color: ortho_bleacher_color })
        this.right_bleacher =  new THREE.Mesh(geometry, material)
        this.right_bleacher.rotateY(Math.PI/2)
        this.right_bleacher.rotateX(-1*Math.PI*1/4)
        this.right_bleacher.position.copy(new THREE.Vector3(-(this.x_face+this.bleacher_height/2), this.face_height+this.bleacher_height/2, 0))
        this.right_bleacher.normal = new THREE.Vector3(0.5, 0.5, 0)
    }
    #create_left_bleacher()
    {
        LOG("Building Left Bleacher")
        let geometry = new THREE.PlaneGeometry(2*(this.z_face-this.corner_face), this.bleacher_height*Math.SQRT2);
        let material = new THREE.MeshBasicMaterial({color: ortho_bleacher_color })
        this.left_bleacher = new THREE.Mesh(geometry, material)
        this.left_bleacher.rotateY(-1*Math.PI/2)
        this.left_bleacher.rotateX(-1*Math.PI*1/4)
        this.left_bleacher.position.copy(new THREE.Vector3((this.x_face+this.bleacher_height/2), this.face_height+this.bleacher_height/2, 0))
        this.left_bleacher.normal = new THREE.Vector3(-0.5, 0.5, 0)
    }
    #create_tr_bleacher(scle)
    {
        LOG("Building Top-Right Bleacher")
        let geometry = new THREE.PlaneGeometry((this.corner_face+this.bleacher_height)*Math.SQRT2, this.bleacher_height*Math.sqrt(1.5));
        let material = new THREE.MeshBasicMaterial({color: angle_bleacher_color })
        this.tr_bleacher = new THREE.Mesh(geometry, material)
        this.tr_bleacher.rotateY(Math.PI*3/4)
        this.tr_bleacher.rotateX(-1*Math.PI*1/5.1)
        this.tr_bleacher.position.copy(new THREE.Vector3(-(this.x_face - this.corner_face/2 + (this.bleacher_height)/4), this.face_height+this.bleacher_height/2, (this.z_face - this.corner_face/2 + (this.bleacher_height)/4)))
        this.tr_bleacher.normal = new THREE.Vector3(0.33, 0.34, -0.33)
    }
    #create_br_bleacher()
    {
        LOG("Building Bottom-Right Bleacher")
        let geometry = new THREE.PlaneGeometry((this.corner_face+this.bleacher_height)*Math.SQRT2, this.bleacher_height*Math.sqrt(1.5));
        let material = new THREE.MeshBasicMaterial({color: angle_bleacher_color })
        this.br_bleacher = new THREE.Mesh(geometry, material)
        this.br_bleacher.rotateY(Math.PI*1/4)
        this.br_bleacher.rotateX(-1*Math.PI*1/5.1)
        this.br_bleacher.position.copy(new THREE.Vector3(-(this.x_face - this.corner_face/2 + (this.bleacher_height)/4), this.face_height+this.bleacher_height/2, -(this.z_face - this.corner_face/2 + (this.bleacher_height)/4)))
        this.br_bleacher.normal = new THREE.Vector3(0.33, 0.34, 0.33)
    }
    #create_bl_bleacher()
    {
        LOG("Building Bottom-Left Bleacher")
        let geometry = new THREE.PlaneGeometry((this.corner_face+this.bleacher_height)*Math.SQRT2, this.bleacher_height*Math.sqrt(1.5));
        let material = new THREE.MeshBasicMaterial({color: angle_bleacher_color })
        this.bl_bleacher = new THREE.Mesh(geometry, material)
        this.bl_bleacher.rotateY(-1*Math.PI*1/4)
        this.bl_bleacher.rotateX(-1*Math.PI*1/5.1)
        this.bl_bleacher.position.copy(new THREE.Vector3((this.x_face - this.corner_face/2 + (this.bleacher_height)/4), this.face_height+this.bleacher_height/2, -(this.z_face - this.corner_face/2 + (this.bleacher_height)/4)))
        this.bl_bleacher.normal = new THREE.Vector3(0.33, 0.34, 0.33)
        this.bl_bleacher.normal = new THREE.Vector3(-0.33, 0.34, 0.33)
    }
    #create_tl_bleacher()
    {
        LOG("Building Top-Left Bleacher")
        let geometry = new THREE.PlaneGeometry((this.corner_face+this.bleacher_height)*Math.SQRT2, this.bleacher_height*Math.sqrt(1.5));
        let material = new THREE.MeshBasicMaterial({color: angle_bleacher_color })
        this.tl_bleacher = new THREE.Mesh(geometry, material)
        this.tl_bleacher.rotateY(-1*Math.PI*3/4)
        this.tl_bleacher.rotateX(-1*Math.PI*1/5.1)
        this.tl_bleacher.position.copy(new THREE.Vector3((this.x_face - this.corner_face/2 + (this.bleacher_height)/4), this.face_height+this.bleacher_height/2, (this.z_face - this.corner_face/2 + (this.bleacher_height)/4)))
        this.tl_bleacher.normal = new THREE.Vector3(-0.33, 0.34, -0.33)
    }
    #create_top_wall()
    {
        LOG("Building Top Wall")
        let geometry = new THREE.PlaneGeometry(2*(this.x_face-this.corner_face), this.height);
        let material = new THREE.MeshBasicMaterial({color: ortho_wall_color })
        this.top_wall = new THREE.Mesh(geometry, material)
        this.top_wall.rotateY(Math.PI)
        this.top_wall.position.copy(new THREE.Vector3(0, this.height/2, this.z_face+this.bleacher_height))
    }
    #create_bottom_wall(scale)
    {
        LOG("Building Bottom Wall")
        let geometry = new THREE.PlaneGeometry(2*(this.x_face-this.corner_face), this.height);
        let material = new THREE.MeshBasicMaterial({color: ortho_wall_color })
        this.bottom_wall = new THREE.Mesh(geometry, material)
        this.bottom_wall.position.copy(new THREE.Vector3(0, this.height/2, -(this.z_face+this.bleacher_height)))
    }
    #create_right_wall(scale)
    {
        LOG("Building Right Wall")
        let geometry = new THREE.PlaneGeometry(2*(this.z_face-this.corner_face), this.height);
        let material = new THREE.MeshBasicMaterial({color: ortho_wall_color })
        this.right_wall = new THREE.Mesh(geometry, material)
        this.right_wall.rotateY(Math.PI/2)
        this.right_wall.position.copy(new THREE.Vector3(-(this.x_face+this.bleacher_height), this.height/2, 0))
    }
    #create_left_wall(scale)
    {
        LOG("Building Left Wall")
        let geometry = new THREE.PlaneGeometry(2*(this.z_face-this.corner_face), this.height);
        let material = new THREE.MeshBasicMaterial({color: ortho_wall_color })
        this.left_wall = new THREE.Mesh(geometry, material)
        this.left_wall.rotateY(-1*Math.PI/2)
        this.left_wall.position.copy(new THREE.Vector3(this.x_face  +this.bleacher_height, this.height/2, 0))
    }
    #create_tr_wall(scale)
    {
        LOG("Building Top-Right Wall")
        let geometry = new THREE.PlaneGeometry((this.corner_face+this.bleacher_height)*Math.SQRT2, this.height);
        let material = new THREE.MeshBasicMaterial({color: angle_wall_color })
        this.tr_wall = new THREE.Mesh(geometry, material)
        this.tr_wall.rotateY(Math.PI*3/4)
        this.tr_wall.position.copy(new THREE.Vector3(-(this.x_face-(this.corner_face/2-this.bleacher_height/2)), this.height/2, (this.z_face-(this.corner_face-this.bleacher_height)/2)))
    }
    #create_br_wall(scale)
    {
        LOG("Building Bottom-Right Wall")
        let geometry = new THREE.PlaneGeometry((this.corner_face+this.bleacher_height)*Math.SQRT2, this.height);
        let material = new THREE.MeshBasicMaterial({color: angle_wall_color })
        this.br_wall = new THREE.Mesh(geometry, material)
        this.br_wall.rotateY(Math.PI*1/4)
        this.br_wall.position.copy(new THREE.Vector3(-(this.x_face-(this.corner_face-this.bleacher_height)/2), this.height/2, -(this.z_face-(this.corner_face-this.bleacher_height)/2)))
    }
    #create_bl_wall(scale)
    {
        LOG("Building Bottom-Left Wall")
        let geometry = new THREE.PlaneGeometry((this.corner_face+this.bleacher_height)*Math.SQRT2, this.height);
        let material = new THREE.MeshBasicMaterial({color: angle_wall_color })
        this.bl_wall = new THREE.Mesh(geometry, material)
        this.bl_wall.rotateY(-1*Math.PI*1/4)
        this.bl_wall.position.copy(new THREE.Vector3((this.x_face-(this.corner_face-this.bleacher_height)/2), this.height/2, -(this.z_face-(this.corner_face-this.bleacher_height)/2)))
    }
    #create_tl_wall(scale)
    {
        LOG("Building Top-Left Wall")
        let geometry = new THREE.PlaneGeometry((this.corner_face+this.bleacher_height)*Math.SQRT2, this.height);
        let material = new THREE.MeshBasicMaterial({color: angle_wall_color })
        this.tl_wall = new THREE.Mesh(geometry, material)
        this.tl_wall.rotateY(-1*Math.PI*3/4)
        this.tl_wall.position.copy(new THREE.Vector3((this.x_face-(this.corner_face-this.bleacher_height)/2), this.height/2, (this.z_face-(this.corner_face-this.bleacher_height)/2)))
    }
    #create_ceiling(scale)
    {
        LOG("Building Ceiling")
        let geometry = new THREE.PlaneGeometry((this.x_face+this.bleacher_height)*2, (this.z_face+this.bleacher_height)*2);
        let material = new THREE.MeshBasicMaterial({color: ceiling_color })
        this.ceiling = new THREE.Mesh(geometry, material)
        this.ceiling.rotateX(Math.PI/2)
        this.ceiling.position.copy(new THREE.Vector3(0, this.height, 0))
    }
    #create_sky_box(scale)
    {
        LOG("Building Sky Box")
        let geometry = new THREE.PlaneGeometry(20*Math.SQRT2*scale, Math.sqrt(151)*scale);
        let material = new THREE.MeshBasicMaterial({color: sky_box_color })
        this.sky_box = new THREE.Mesh(geometry, material)
        this.sky_box.position.copy(new THREE.Vector3(0*scale, 0*scale, 0*scale))
    }
}

export {
    create_arena
}