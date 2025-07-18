# NetMonsters - Launch Guide & Project Overview

## Project Description
NetMonsters is a real-time Pokemon battling game/physics engine with particle-based attacks and collisions. The project combines 3D graphics, physics simulation, and Pokemon data to create an interactive battling experience.

## Architecture Overview

### Frontend (THREE.js + Snowpack)
- **Entry Point**: `index.html` with canvas element
- **Main Script**: `index.js` using ES6 modules
- **Key Dependencies**: 
  - THREE.js for 3D graphics
  - Axios for HTTP requests
  - Snowpack for development server
- **Structure**:
  - `/models/` - Arena, Attack, Player classes
  - `render.js` - Main rendering loop
  - `collisions.js` - Collision detection
  - `attacks.js` - Attack system
  - `player_actions.js` - Player behavior
  - `colors.js` - Type-based coloring

### Backend (Express.js + PokeAPI)
- **Server**: Express.js on port 3000
- **API Endpoints**:
  - `/v1/net_monsters/get_pokemon` - Fetch Pokemon data
  - `/v1/net_monsters/rand_color` - Random color generator
- **Data Source**: pokeapi.co with local JSON caching
- **Database**: File-based caching system for Pokemon, moves, species, evolution chains

## Current Features
- 3D arena with stadium-like structure
- Multiple Pokemon players (up to 16 positions)
- Collision detection between players and attacks
- Particle-based attack system
- Camera system with multiple modes (orbit, fly, pan, follow)
- Pokemon sprites with type-based coloring
- Physics simulation with velocity and position updates

## Future Plans
- Neural networks using BRAIN.js for AI players
- Competent battle AI with custom networks
- Network saving/loading for AI competition

## How to Launch

### Prerequisites
Make sure you have Node.js and npm installed.

### Step 1: Install Dependencies

#### Backend Dependencies
```powershell
cd "c:\Users\james\Documents\NetMonsters\backend"
npm install
```

#### Frontend Dependencies
```powershell
cd "c:\Users\james\Documents\NetMonsters\frontend"
npm install
```

### Step 2: Start Backend Server
```powershell
cd "c:\Users\james\Documents\NetMonsters\backend"
npm start
```
This will start the Express server on port 3000.

### Step 3: Start Frontend Development Server
```powershell
cd "c:\Users\james\Documents\NetMonsters\frontend"
npm start
```
This will start the Snowpack development server and open the game in your browser.

## Current Status
⚠️ **Dependencies Not Installed**: Both frontend and backend need `npm install` before running.

### Missing Dependencies:
- **Backend**: axios@^0.21.4, express@^4.17.1
- **Frontend**: axios@^0.21.4, snowpack@^3.8.8, three@^0.137.0

## Game Controls & Features
- Camera automatically orbits around the arena
- Multiple Pokemon are spawned in the arena
- Pokemon have collision detection and physics
- Attack particles are rendered with type-based colors
- Arena includes stadium-like structure with bleachers and walls

## Technical Details
- Uses WebGL for 3D rendering
- Implements physics simulation for movement and collisions
- Fetches Pokemon data from PokeAPI with local caching
- Modular code structure for easy extension
- CORS enabled for frontend-backend communication

## Development Notes
- The project uses ES6 modules throughout
- Snowpack handles module resolution and hot reloading
- Backend caches Pokemon data locally to reduce API calls
- Camera system supports multiple viewing modes
- Physics engine handles player-player, player-attack, and attack-attack collisions

## Next Steps for Development
1. Install all dependencies
2. Test the launch process
3. Verify Pokemon data fetching works
4. Test 3D rendering and physics
5. Plan neural network integration
