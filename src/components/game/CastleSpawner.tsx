'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getTerrainHeight } from '@/components/simulation/Terrain';
import { useSimulationStore } from '@/lib/simulationStore';
import { CAVE_POSITION } from '@/lib/gameStore';

export default function CastleSpawner() {
    const environment = useSimulationStore(s => s.environment);
    const mountRef = useRef<THREE.Group>(null);

    // Position castle on terrain
    useEffect(() => {
        if (!mountRef.current) return;
        const terrainY = getTerrainHeight(
            CAVE_POSITION.x, CAVE_POSITION.z,
            environment.terrain.seed,
            environment.terrain.heightScale
        );
        mountRef.current.position.set(CAVE_POSITION.x, terrainY, CAVE_POSITION.z);
    }, [environment]);

    // Animated torch light or glow from inside
    const glowRef = useRef<THREE.PointLight>(null);
    useFrame(({ clock }) => {
        if (glowRef.current) {
            glowRef.current.intensity = 1.0 + Math.sin(clock.elapsedTime * 3) * 0.3;
        }
    });

    return (
        <group ref={mountRef}>
            <group scale={[2, 2, 2]}>
                {/* Drawbridge extending outwards over ground */}
                <mesh position={[0, 0.1, 4]} rotation={[-0.1, 0, 0]} receiveShadow castShadow>
                    <boxGeometry args={[4, 0.2, 8]} />
                    <meshStandardMaterial color="#3a2510" roughness={0.9} /> {/* Dark wood */}
                </mesh>

                {/* Drawbridge Chains */}
                <mesh position={[-1.8, 2, 4]} rotation={[0.4, 0, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 5]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
                <mesh position={[1.8, 2, 4]} rotation={[0.4, 0, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 5]} />
                    <meshStandardMaterial color="#111" />
                </mesh>

                {/* Portcullis (Raised slightly for zombies to pass under) */}
                <group position={[0, 2.8, 0.2]}>
                    {/* Vertical bars */}
                    {[-1.5, -0.75, 0, 0.75, 1.5].map((x, i) => (
                        <mesh key={`v-${i}`} position={[x, 0, 0]} castShadow>
                            <boxGeometry args={[0.15, 3, 0.15]} />
                            <meshStandardMaterial color="#2d2d2d" metalness={0.6} roughness={0.4} />
                        </mesh>
                    ))}
                    {/* Horizontal spikes/bars */}
                    <mesh position={[0, -1.3, 0]} castShadow>
                        <boxGeometry args={[3.5, 0.2, 0.15]} />
                        <meshStandardMaterial color="#2d2d2d" metalness={0.6} roughness={0.4} />
                    </mesh>
                </group>

                {/* Main Castle Keep / Gateway Base */}
                <mesh position={[0, 3.5, -2]} castShadow receiveShadow>
                    <boxGeometry args={[9, 7, 5]} />
                    <meshStandardMaterial color="#555759" roughness={0.8} /> {/* Stone walls */}
                </mesh>

                {/* Castle Crenellations (Top ridges) */}
                {[[-4, 7.5, -4], [-2, 7.5, -4], [0, 7.5, -4], [2, 7.5, -4], [4, 7.5, -4],
                [-4, 7.5, 0], [-2, 7.5, 0], [0, 7.5, 0], [2, 7.5, 0], [4, 7.5, 0]].map((pos, i) => (
                    <mesh key={`cren-${i}`} position={pos as [number, number, number]} castShadow>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color="#555759" roughness={0.8} />
                    </mesh>
                ))}

                {/* Left Flanking Tower */}
                <group position={[-5, 0, 0]}>
                    <mesh position={[0, 4, 0]} castShadow receiveShadow>
                        <cylinderGeometry args={[2, 2.5, 8, 12]} />
                        <meshStandardMaterial color="#4a4c4e" roughness={0.8} />
                    </mesh>
                    <mesh position={[0, 9.5, 0]} castShadow>
                        <coneGeometry args={[2.5, 4, 12]} />
                        <meshStandardMaterial color="#3a1c1c" roughness={0.9} /> {/* Dark red roof */}
                    </mesh>
                </group>

                {/* Right Flanking Tower */}
                <group position={[5, 0, 0]}>
                    <mesh position={[0, 4, 0]} castShadow receiveShadow>
                        <cylinderGeometry args={[2, 2.5, 8, 12]} />
                        <meshStandardMaterial color="#4a4c4e" roughness={0.8} />
                    </mesh>
                    <mesh position={[0, 9.5, 0]} castShadow>
                        <coneGeometry args={[2.5, 4, 12]} />
                        <meshStandardMaterial color="#3a1c1c" roughness={0.9} />
                    </mesh>
                </group>

                {/* Castle Entrance Darkness (Portal to block void visibility) */}
                <mesh position={[0, 2.5, -0.2]}>
                    <planeGeometry args={[3.8, 5]} />
                    <meshStandardMaterial color="#020101" roughness={1} side={THREE.DoubleSide} />
                </mesh>

                {/* Eerie glow from within the castle entrance */}
                <pointLight
                    ref={glowRef}
                    position={[0, 2.0, -0.1]}
                    color="#ff4411"
                    intensity={1.2}
                    distance={15}
                    decay={2}
                />
            </group>
        </group>
    );
}
