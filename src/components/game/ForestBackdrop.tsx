'use client';

import { useSimulationStore } from '@/lib/simulationStore';
import { getTerrainHeight } from '@/components/simulation/Terrain';
import * as THREE from 'three';
import { useRef, useMemo } from 'react';

export default function ForestBackdrop() {
    const environment = useSimulationStore(s => s.environment);

    // Generate a ring of tall dark trees/hills around the perimeter
    const trees = useMemo(() => {
        const items = [];
        const numTrees = 120;
        const radius = 90; // Just inside the far clipping plane/fog

        for (let i = 0; i < numTrees; i++) {
            // angle from 0 to 2PI, but skip the section directly behind the camera if we want
            // Actually, a full circle is fine.
            const angle = (i / numTrees) * Math.PI * 2;

            // Add some noise to the radius and placement
            const r = radius + (Math.random() - 0.5) * 15;
            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;

            // Skip placing trees directly where the castle is (around z = -60)
            if (z < -45 && x > -20 && x < 20) continue;

            const y = getTerrainHeight(x, z, environment.terrain.seed, environment.terrain.heightScale);

            // Randomize size and exact shape
            const width = 8 + Math.random() * 6;
            const height = 15 + Math.random() * 25;

            items.push({ x, y, z, width, height });
        }
        return items;
    }, [environment.terrain.seed, environment.terrain.heightScale]);

    return (
        <group>
            {trees.map((t, i) => (
                <mesh key={i} position={[t.x, t.y + t.height / 2 - 2, t.z]}>
                    <coneGeometry args={[t.width, t.height, 5]} />
                    <meshStandardMaterial color="#0a120a" roughness={0.9} />
                </mesh>
            ))}

            {/* Distant Hills / Horizon blocking */}
            <mesh position={[0, -5, 0]}>
                <cylinderGeometry args={[110, 110, 40, 32, 1, true]} />
                <meshStandardMaterial color="#050a05" roughness={1} side={THREE.BackSide} />
            </mesh>
        </group>
    );
}
