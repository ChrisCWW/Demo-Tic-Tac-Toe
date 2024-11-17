# 🎮 Tic Tac Toe ⭕️❌⭕️
A simple Tic-Tac-Toe game designed for both local and network play. Enjoy classic gameplay with a clean interface and responsive design.

## Table of Contents  
- [Getting Started](#getting-started)  
- [Play with friends](#play-with-friends)  
- [Screenshots](#screenshots)  
- [Tech Stack](#tech-stack)  

## Getting Started
This project is Dockerized for quick and easy setup. Follow these steps:  

1. **Install Docker**: Refer to the official [Docker Installation Guide](https://docs.docker.com/engine/install/).  

2. **Build and Run the Application**:  
```bash
docker compose build
docker compose up
```

3. **DONE**

If you prefer running the `frontend` and `backend` servers independently, refer to the steps below.

**Run Frontend Server**
```bash
# Navigate to frontend folder
cd tic-tac-toe-frontend

# Install dependencies and build
npm install
npm run build

# Copy public and static folders to standalone folder
cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/

# Start server
npm run start
```

**Run Backend Server**
```bash
# Navigate to backend folder
cd tic-tac-toe-backend

# Install dependencies
npm install

# Start backend server
npm start
```

## Play with Friends
1. Ensure both devices and the host are on the same network.
2. Go to http://${HOST_IP_ADRESS}:3000 in browser.
3. Challenge your friends to a match and enjoy the game!

## Screenshots
<p style='display: flex; column-gap: 8px'>
<video height="300" style='border-radius: 4px' autoplay>
<source src='assets/screenshots/screenshot_p1.mov' />
</video>
<video height="300" style='border-radius: 4px' autoplay>
<source src='assets/screenshots/screenshot_p2.mov' />
</video>
</p>

## Tech Stack
- **Frontend**: Next.js, React, TypeScript, HTML, CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Networking**: Socket.IO for real-time multiplayer functionality
- **Tools**: Docker and Docker Compose for seamless deployment