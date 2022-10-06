import * as THREE from 'three';

const rainbow = { base: 0xFF501F, dark: 0x1D1E1C, light: 0xEEE4E0 }
const arceus =  { base: 0x7038F8, dark: 0x6D7815, light: 0xC183C1 }
const unknown = { base: 0x68A090, dark: 0x44685E, light: 0x9DC1B7 }

const colors = {
 normal:    { base: 0xA8A878, dark: 0x6D6D4E, light: 0xC6C6A7, alt: {base: 0xE5D6D0, dark: 0x958B87, light: 0xEEE4E0}},
 fire:      { base: 0xF08030, dark: 0x9C531F, light: 0xF5AC78, alt: {base: 0xE24242, dark: 0x932B2B, light: 0xEC8484}},
 water:     { base: 0x6890F0, dark: 0x445E9C, light: 0x9DB7F5, alt: {base: 0x5BC7E5, dark: 0x445E9C, light: 0x94DBEE}},
 electric:  { base: 0xF8D030, dark: 0xA1871F, light: 0xFAE078, alt: {base: 0xFAB536, dark: 0xA37523, light: 0xFCCE7C}},
 grass:     { base: 0x78C850, dark: 0x4E8234, light: 0xA7DB8D, alt: {base: 0x7DB808, dark: 0x517805, light: 0xAAD15E}},
 ice:       { base: 0x98D8D8, dark: 0x638D8D, light: 0xBCE6E6 },
 fighting:  { base: 0xC03028, dark: 0x7D1F1A, light: 0xD67873, alt: {base: 0xFF501F, dark: 0xA63414, light: 0xFF8D6D}},
 poison:    { base: 0xA040A0, dark: 0x682A68, light: 0xC183C1 },
 ground:    { base: 0xE0C068, dark: 0x927D44, light: 0xEBD69D },
 flying:    { base: 0xA890F0, dark: 0x6D5E9C, light: 0xC6B7F5, alt: arceus },
 psychic:   { base: 0xF85888, dark: 0xA13959, light: 0xFA92B2, alt: {base: 0xA65E9A, dark: 0x6C3D64, light: 0xC596BD}},
 bug:       { base: 0xA8B820, dark: 0x6D7815, light: 0xC6D16E, alt: unknown},
 rock:      { base: 0xB8A038, dark: 0x786824, light: 0xD1C17D },
 ghost:     { base: 0x705898, dark: 0x493963, light: 0xA292BC },
 dragon:    { base: 0x7038F8, dark: 0x4924A1, light: 0xA27DFA, alt: {base: 0xC6A114, dark: 0x81690D, light: 0xDAC266}},
 dark:      { base: 0x705848, dark: 0x49392F, light: 0xA29288, alt: {base: 0x2C2E2B, dark: 0x1D1E1C, light: 0x767775}},
 steel:     { base: 0xB8B8D0, dark: 0x787887, light: 0xD1D1E0, alt: {base: 0x8A776E, dark: 0x5A4D48, light: 0xB3A6A1}},
 fairy:     { base: 0xEE99AC, dark: 0x9B6470, light: 0xF4BDC9, alt: {base: 0xE03A83, dark: 0x912555, light: 0xEA7EAE}}
}
function get_type_color(type, range=0)
{
    let value = 'base'
    let r = Math.random();
    if (r < 0.3) value = 'dark';
    if (r > 0.7) value = 'light';

    let c = colors[type][value]
    // if (Math.random() < 0.5 && 'alt' in colors[type]) c = colors[type].alt[value]
    let color = new THREE.Color(c);
    
    if (range > 0)
    {
        color.r += Math.random() * range - range/2;
        color.g += Math.random() * range - range/2;
        color.b += Math.random() * range - range/2;
    }
    return color
}

export {
    get_type_color
}