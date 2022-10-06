
function get_type_effectiveness(attack_type, defense_type)
{
    switch(attack_type)
    {
        case 'normal': return normal_effectiveness(defense_type);
        case 'fire': return fire_effectiveness(defense_type);
        case 'water': return water_effectiveness(defense_type);
        case 'electric': return electric_effectiveness(defense_type);
        case 'grass': return grass_effectiveness(defense_type);
        case 'ice': return ice_effectiveness(defense_type);
        case 'fighting': return fighting_effectiveness(defense_type);
        case 'poison': return poison_effectiveness(defense_type);
        case 'ground': return ground_effectiveness(defense_type);
        case 'flying': return flying_effectiveness(defense_type);
        case 'psychic': return psychic_effectiveness(defense_type);
        case 'bug': return bug_effectiveness(defense_type);
        case 'rock': return rock_effectiveness(defense_type);
        case 'ghost': return ghost_effectiveness(defense_type);
        case 'dragon': return dragon_effectiveness(defense_type);
        case 'dark': return dark_effectiveness(defense_type);
        case 'steel': return steel_effectiveness(defense_type);
        case 'fairy': return fairy_effectiveness(defense_type);
        default: 
            return 1;
    }
}

function normal_effectiveness(defense_type)
{
    switch(defense_type)
    {
        case 'rock':    return 0.5;
        case 'ghost':   return 0;
        case 'steel':   return 0.5;
        default: 
            return 1;
    }
}

function fire_effectiveness(defense_type)
{
    switch(defense_type)
    {
        case 'fire':    return 0.5;
        case 'water':   return 0.5;
        case 'grass':   return 2;
        case 'ice':     return 2;
        case 'bug':     return 2;
        case 'rock':    return 0.5;
        case 'dragon':  return 0.5;
        case 'steel':   return 2;
        default: 
            return 1;
    }
}

function water_effectiveness(defense_type)
{
    switch(defense_type)
    {
        case 'fire':    return 2;
        case 'water':   return 0.5;
        case 'grass':   return 0.5;
        case 'ground':  return 2;
        case 'rock':    return 2;
        case 'dragon':  return 0.5;
        default: 
            return 1;
    }
}

function electric_effectiveness(defense_type)
{
    switch(defense_type)
    {
        case 'water':   return 2;
        case 'electric':return 0.5;
        case 'grass':   return 0.5;
        case 'ground':  return 0;
        case 'flying':  return 2;
        case 'dragon':  return 0.5;
        default: 
            return 1;
    }
}

function grass_effectiveness(defense_type)
{
    switch(defense_type)
    {
        case 'fire':    return 0.5;
        case 'water':   return 2;
        case 'grass':   return 0.5;
        case 'poison':  return 0.5;
        case 'ground':  return 2;
        case 'flying':  return 0.5;
        case 'bug':     return 0.5;
        case 'rock':    return 2;
        case 'dragon':  return 0.5;
        case 'steel':   return 0.5;
        default: 
            return 1;
    }
}

function ice_effectiveness(defense_type)
{
    switch(defense_type)
    {
        case 'fire':    return 0.5;
        case 'water':   return 0.5;
        case 'grass':   return 2;
        case 'ice':     return 0.5;
        case 'ground':  return 2;
        case 'flying':  return 2;
        case 'dragon':  return 2;
        case 'steel':   return 0.5;
        default: 
            return 1;
    }
}

function fighting_effectiveness(defense_type)
{
    switch(defense_type)
    {
        case 'normal':  return 2;
        case 'ice':     return 2;
        case 'poison':  return 0.5;
        case 'flying':  return 0.5;
        case 'psychic': return 0.5;
        case 'bug':     return 0.5;
        case 'rock':    return 2;
        case 'ghost':   return 0;
        case 'dark':    return 2;
        case 'steel':   return 2;
        case 'fairy':   return 0.5;
        default: 
            return 1;
    }
}

function poison_effectiveness(defense_type)
{
    switch(defense_type)
    {
        case 'grass':   return 2;
        case 'poison':  return 0.5;
        case 'ground':  return 0.5;
        case 'rock':    return 0.5;
        case 'ghost':   return 0.5;
        case 'steel':   return 0;
        case 'fairy':   return 2;
        default: 
            return 1;
    }
}

function ground_effectiveness(defense_type)
{
    switch(defense_type)
    {
        case 'fire':    return 2;
        case 'electric':return 2;
        case 'grass':   return 0.5;
        case 'poison':  return 2;
        case 'flying':  return 0;
        case 'bug':     return 0.5;
        case 'rock':    return 2;
        case 'steel':   return 2;
        default: 
            return 1;
    }
}

function flying_effectiveness(defense_type)
{
    switch(defense_type)
    {
        case 'electric':return 0.5;
        case 'grass':   return 2;
        case 'fighting':return 2;
        case 'bug':     return 2;
        case 'rock':    return 0.5;
        case 'steel':   return 0.5;
        default: 
            return 1;
    }
}

function psychic_effectiveness(defense_type)
{
    switch(defense_type)
    {
        case 'fighting':return 2;
        case 'poison':  return 2;
        case 'psychic': return 0.5;
        case 'dark':    return 0;
        case 'steel':   return 0.5;
        default: 
            return 1;
    }
}

function bug_effectiveness(defense_type)
{
    switch(defense_type)
    {
        case 'fire':    return 0.5;
        case 'grass':   return 2;
        case 'fighting':return 0.5;
        case 'poison':  return 0.5;
        case 'flying':  return 0.5;
        case 'psychic': return 2;
        case 'ghost':   return 0.5;
        case 'dark':    return 2;
        case 'steel':   return 0.5;
        case 'fairy':   return 0.5;
        default: 
            return 1;
    }
}

function rock_effectiveness(defense_type)
{
    switch(defense_type)
    {
        case 'fire':    return 2;
        case 'ice':     return 2;
        case 'fighting':return 0.5;
        case 'ground':  return 0.5;
        case 'flying':  return 2;
        case 'bug':     return 2;
        case 'steel':   return 0.5;
        default: 
            return 1;
    }
}

function ghost_effectiveness(defense_type)
{
    switch(defense_type)
    {
        case 'normal':  return 0;
        case 'psychic': return 2;
        case 'ghost':   return 2;
        case 'dark':    return 0.5;
        default: 
            return 1;
    }
}

function dragon_effectiveness(defense_type)
{
    switch(defense_type)
    {
        case 'dragon':  return 2;
        case 'steel':   return 0.5;
        case 'fairy':   return 0;
        default: 
            return 1;
    }
}

function dark_effectiveness(defense_type)
{
    switch(defense_type)
    {
        case 'fighting':return 0.5;
        case 'psychic': return 2;
        case 'ghost':   return 2;
        case 'dark':    return 0.5;
        case 'fairy':   return 0.5;
        default: 
            return 1;
    }
}

function steel_effectiveness(defense_type)
{
    switch(defense_type)
    {
        case 'fire':    return 0.5;
        case 'water':   return 0.5;
        case 'electric':return 0.5;
        case 'ice':     return 2;
        case 'rock':    return 2;
        case 'steel':   return 0.5;
        case 'fairy':   return 2;
        default: 
            return 1;
    }
}

function fairy_effectiveness(defense_type)
{
    switch(defense_type)
    {
        case 'fire':    return 0.5;
        case 'fighting':return 2;
        case 'poison':  return 0.5;
        case 'dragon':  return 2;
        case 'dark':    return 2;
        case 'steel':   return 0.5;
        default: 
            return 1;
    }
}

export {
    get_type_effectiveness
}