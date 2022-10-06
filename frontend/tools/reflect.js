// Applies reflection to vector about the plane described by the normal vector
function reflect(vector, normal)
{
    // v - n * 2 * v.dot( n )
    return vector.sub(normal.clone().multiplyScalar(2 * vector.dot(normal)))
        
}

export {
    reflect
}