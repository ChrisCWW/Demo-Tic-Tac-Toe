import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import * as THREE from 'three';
import { RootState } from '@/lib/store/store';
import * as Game from '@/lib/utils/GameUtils';
import { images } from '@/lib/utils/assets';

// Define game settings
const fov = 50;
const boxSize = 50;
const boxGap = 2;
const boxTotal = boxSize + boxGap;
const boxGeo = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
const boxColor = new THREE.Color(0xfaf8ef);
const hoverColor = new THREE.Color(0xffdd55);

export function useThree(canvas: React.RefObject<HTMLDivElement>, boxCount: number = 3) {
  // THREE Components
  const scene = useRef<THREE.Scene>(new THREE.Scene());
  const camera = useRef<THREE.PerspectiveCamera>(new THREE.PerspectiveCamera());
  const renderer = useRef<THREE.WebGLRenderer>();
  const raycaster = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const circle = useRef<THREE.Texture>();
  const cross = useRef<THREE.Texture>();

  // Store data
  const mode = useSelector((state: RootState) => state.game.mode);
  const uid = useSelector((state: RootState) => state.index.uid);
  const board = useSelector((state: RootState) => state.game.board);
  const turn = useSelector((state: RootState) => state.game.turn);
  const players = useSelector((state: RootState) => state.game.players);

  const loadAssets = () => {
    const loader = new THREE.TextureLoader();
    loader.load(images.circle, (texture: THREE.Texture) => {
      circle.current = texture;
    });
    loader.load(images.cross, (texture: THREE.Texture) => {
      cross.current = texture;
    });
  }

  const addBoxesToScene = () => {
    for (let y = 0; y < boxCount; y++) {
      for (let x = 0; x < boxCount; x++) {
        const idx = Game.coordToIdx(boxCount, x, y);

        // Materials[5] is the box symbol
        const material = new THREE.MeshStandardMaterial({ color: boxColor });
        const textureMaterial = new THREE.MeshStandardMaterial({ color: boxColor });
        const materials = [material, material, material, material, material, textureMaterial];

        const mesh = new THREE.Mesh(boxGeo, materials);
        mesh.name = 'box';
        mesh.userData.idx = idx;
        mesh.position.set(x * boxTotal, y * boxTotal, 0)
        scene.current.add(mesh);
      }
    }  
  }
      
  useEffect(() => {  
    loadAssets();
    
    const cameraPosition = Game.cameraPos(boxSize * boxCount + (boxGap * boxCount - 1), boxSize, boxTotal, fov);
    camera.current.fov = fov;
    camera.current.position.copy(cameraPosition);

    if (!renderer.current) {
      renderer.current = new THREE.WebGLRenderer({ alpha: true });
      canvas.current?.appendChild(renderer.current.domElement);    
    }

    scene.current.clear();

    const light = new THREE.AmbientLight(0x404040, 25);
    scene.current.add(light);  
    const light2 = new THREE.DirectionalLight(0x404040, 30);
    light2.position.set(0, 0, boxSize * 2);
    scene.current.add(light2);  

    addBoxesToScene();

    return () => {
      renderer.current?.dispose();
    };
  }, []);
  
  useEffect(() => {  
    let animationID: number;

    function animate() {
      // Render Three animation
      animationID = requestAnimationFrame(animate);
      movement();
      renderer.current?.render(scene.current, camera.current);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationID);
    }
  }, [turn, board]);
      
  function movement() {
    const boxes = scene.current.getObjectsByProperty('name', 'box');

    // Calculate every box movement
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        const idx = Game.coordToIdx(boxCount, x, y);

        // find the box and its value
        const box = boxes.find((item) => item.userData.idx === idx) as THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial[]>;
        const value = board[y][x];
        if (!box || value <= 0) continue;

        // Change the picked box symbol 
        const texture = value === 1 ? circle.current : value === 2 ? cross.current : null
        if (!box.material[5]?.map) Game.changeMaterialTexture(box, value, texture);

        // Calculate the box movement
        Game.boxMovement(box, new THREE.Vector2(x, y), boxCount, boxTotal);
      }
    }
  }
  
    function moveTouch(e: MouseEvent) {
      if (!Game.isMyTurn(mode, turn, players, uid) || !renderer.current) return;

      // Find the intersect box
      const pointer = Game.canvasPointer(renderer.current, e);
      raycaster.current.setFromCamera(pointer, camera.current);
      const intersect = raycaster.current.intersectObjects(scene.current.children);
      const boxes = scene.current.getObjectsByProperty("name", "box");

      // Set box color
      for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[y].length; x++) {
          const idx = Game.coordToIdx(boxCount, x, y);
          const box = boxes.find((item) => item.userData.idx === idx) as THREE.Mesh;
          if (!intersect.length || !box || board[y][x] > 0) continue;
  
          if (box === intersect[0]?.object) {
            Game.changeMaterial(box, hoverColor);
          } else {
            Game.changeMaterial(box, boxColor);
          }
        }
      }
    }
  
    function startTouch(e: MouseEvent | TouchEvent) {
      if (!Game.isMyTurn(mode, turn, players, uid) || !renderer.current) return;

      // Find the picked box
      const pointer = Game.canvasPointer(renderer.current, e);
      raycaster.current.setFromCamera(pointer, camera.current);
      const intersect = raycaster.current.intersectObjects(scene.current.children);
      if (!intersect?.length) return;

      const box = (intersect[0].object as THREE.Mesh);
      const idx = box.userData.idx;
      const coord = Game.idxtoCoord(boxCount, idx);
  
      if (board[coord.y][coord.x] > 0) return;

      // Process if movement valid
      const value = Game.turnValue(turn);
      Game.changeMaterial(box, boxColor);

      // Return the coord of target box
      return { idx, coord, value };
    }

    const resetBoard = () => { 
      // Get boxes from scene and reset all the boxes
      const boxes = scene.current.getObjectsByProperty('name', 'box');

      for (let y = 0; y < boxCount; y++) {
        for (let x = 0; x < boxCount; x++) {
          const idx = Game.coordToIdx(boxCount, x, y);
          const box = boxes.find((item) => item.userData.idx === idx) as THREE.Mesh;
          if (!box) continue;
          Game.changeMaterial(box, boxColor);
          Game.changeMaterialTexture(box, 0, null);
          box.position.set(x * boxTotal, y * boxTotal, 0);
          box.rotation.x = 0;
          box.rotation.y = 0;
        }
      }    
    } 
  
    return { startTouch, moveTouch, resetBoard };
  }
  