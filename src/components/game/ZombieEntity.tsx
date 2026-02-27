'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, ZombieData } from '@/lib/gameStore';
import { getTerrainHeight } from '@/components/simulation/Terrain';
import { useSimulationStore } from '@/lib/simulationStore';

interface Props { zombie: ZombieData; }

export default function ZombieEntity({ zombie }: Props) {
    const groupRef = useRef<THREE.Group>(null);
    const leftArmRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);
    const leftLegRef = useRef<THREE.Group>(null);
    const rightLegRef = useRef<THREE.Group>(null);
    const dyingTimer = useRef(0);

    const environment = useSimulationStore(s => s.environment);
    const targetedZombieId = useGameStore(s => s.targetedZombieId);
    const isTargeted = targetedZombieId === zombie.id;
    const isBrute = zombie.type === 'brute';
    const isBoss = zombie.type === 'boss';

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        if (zombie.state === 'dying') {
            dyingTimer.current += delta;
            groupRef.current.position.y -= delta * 1.4;
            if (groupRef.current.scale.y > 0) groupRef.current.scale.y = Math.max(0, 1 - dyingTimer.current / 1.0);
            return;
        }
        if (zombie.state === 'dead') return;

        const terrainY = getTerrainHeight(zombie.position.x, zombie.position.z, environment.terrain.seed, environment.terrain.heightScale);
        groupRef.current.position.set(zombie.position.x, terrainY, zombie.position.z);
        groupRef.current.rotation.y = zombie.rotation;

        const t = state.clock.elapsedTime + zombie.position.x * 0.3;
        const isChasing = zombie.state === 'chasing';
        const isAttacking = zombie.state === 'attacking';
        const isStunned = zombie.state === 'stunned';

        groupRef.current.rotation.z = isStunned ? Math.sin(t * 22) * 0.28 : 0;

        const spd = zombie.slowTimer > 0 ? (isBoss ? 2 : 5) : (isBoss ? 2.5 : (isBrute ? 6 : 9));
        if (isChasing) {
            if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t * spd) * (isBoss ? 0.3 : 0.52);
            if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t * spd + Math.PI) * (isBoss ? 0.3 : 0.52);
            if (leftArmRef.current) leftArmRef.current.rotation.x = (isBoss ? -0.8 : -1.5) + Math.sin(t * spd + 0.4) * 0.25;
            if (rightArmRef.current) rightArmRef.current.rotation.x = (isBoss ? -0.8 : -1.5) + Math.sin(t * spd) * 0.25;
            if (isBoss && groupRef.current) groupRef.current.rotation.z = Math.sin(t * spd * 0.5) * 0.08;
        } else if (isAttacking) {
            if (leftArmRef.current) leftArmRef.current.rotation.x = -1.8 + Math.sin(t * 7) * (isBoss ? 0.4 : 0.65);
            if (rightArmRef.current) rightArmRef.current.rotation.x = -1.8 + Math.sin(t * 7 + Math.PI / 2) * (isBoss ? 0.4 : 0.65);
            if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
            if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
            if (isBoss && groupRef.current) groupRef.current.rotation.z = 0;
        } else {
            if (leftArmRef.current) leftArmRef.current.rotation.x = -1.3 + Math.sin(t * 1.3) * 0.1;
            if (rightArmRef.current) rightArmRef.current.rotation.x = -1.3 + Math.sin(t * 1.3 + Math.PI) * 0.1;
            if (isBoss && groupRef.current) groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.05;
        }
    });

    if (zombie.state === 'dead') return null;

    const hpPct = zombie.hp / zombie.maxHp;
    const isFrosted = zombie.slowTimer > 0;

    // Visual palette differs for brutes and boss
    let skinColor = isFrosted ? '#4a9a7f' : '#4a7a3a';
    if (isBrute) skinColor = isFrosted ? '#3a7a6f' : '#3a5a20';
    if (isBoss) skinColor = isFrosted ? '#0f4f3f' : '#0a2a1a'; // Deep abyssal green

    const armorColor = isBrute ? '#2a1a08' : (isBoss ? '#05150c' : undefined);
    const eyeColor = zombie.state === 'attacking' ? '#ff0000' : (isBoss ? '#aa00ff' : '#cc2200');
    const modelScale = isBoss ? 2.8 : (isBrute ? 1.65 : 1.0);

    return (
        <group ref={groupRef} scale={[modelScale, modelScale, modelScale]}>
            {/* Target ring */}
            {isTargeted && (
                <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.7, 0.88, 28]} />
                    <meshStandardMaterial color={isBoss ? '#aa00ff' : '#ffdd00'} emissive={isBoss ? '#aa00ff' : '#ffdd00'} emissiveIntensity={1.8} transparent opacity={0.9} />
                </mesh>
            )}

            {/* HP bar */}
            <Html position={[0, isBoss ? 4.2 : (isBrute ? 3.2 : 2.5), 0]} center distanceFactor={10} occlude>
                <div style={{
                    width: isBoss ? 120 : (isBrute ? 70 : 50), height: isBoss ? 10 : 7,
                    background: '#330000', borderRadius: 3,
                    border: isTargeted ? '1px solid #ffdd00' : (isBoss ? '2px solid #5500aa' : (isBrute ? '1px solid #aa4400' : '1px solid #660000')),
                    overflow: 'hidden', pointerEvents: 'none'
                }}>
                    <div style={{
                        width: `${hpPct * 100}%`, height: '100%',
                        background: isBoss ? (hpPct > 0.5 ? '#aa00ff' : hpPct > 0.25 ? '#cc0088' : '#ff0000') : (hpPct > 0.5 ? '#22cc22' : hpPct > 0.25 ? '#ee9900' : '#cc2200'),
                        transition: 'width 0.1s'
                    }} />
                </div>
                {isBoss && <div style={{ textAlign: 'center', color: '#dd88ff', fontSize: 13, fontWeight: 900, marginTop: 2, letterSpacing: 2 }}>THE ABYSS</div>}
                {isBrute && !isBoss && <div style={{ textAlign: 'center', color: '#ff6622', fontSize: 8, fontWeight: 800, marginTop: 1 }}>BRUTE</div>}
            </Html>

            {isBoss ? (
                <>
                    {/* CTHULHU BOSS DESIGN */}
                    {/* Massive Bulbous Body */}
                    <mesh position={[0, 1.2, 0]} castShadow>
                        <boxGeometry args={[0.8, 1.2, 0.6]} />
                        <meshStandardMaterial color={skinColor} roughness={0.7} />
                    </mesh>

                    {/* Wings (back) */}
                    <mesh position={[-0.3, 1.4, -0.35]} rotation={[0.4, -0.6, -0.3]}>
                        <coneGeometry args={[0.3, 1.2, 3]} />
                        <meshStandardMaterial color="#05150c" roughness={0.9} />
                    </mesh>
                    <mesh position={[0.3, 1.4, -0.35]} rotation={[0.4, 0.6, 0.3]}>
                        <coneGeometry args={[0.3, 1.2, 3]} />
                        <meshStandardMaterial color="#05150c" roughness={0.9} />
                    </mesh>

                    {/* Domed Squid Head */}
                    <mesh position={[0, 2.1, 0.1]} castShadow>
                        <sphereGeometry args={[0.45, 16, 16]} />
                        <meshStandardMaterial color={skinColor} roughness={0.6} />
                    </mesh>

                    {/* Face Tentacles (Static but sway with head) */}
                    {[-0.2, -0.07, 0.07, 0.2].map((tx, i) => (
                        <mesh key={i} position={[tx, 1.6, 0.45]} rotation={[0.2, 0, 0]}>
                            <cylinderGeometry args={[0.04, 0.02, 0.6, 8]} />
                            <meshStandardMaterial color={skinColor} roughness={0.5} />
                        </mesh>
                    ))}

                    {/* Glowing Purple Eyes */}
                    {[-0.18, 0.18].map((ex, i) => (
                        <mesh key={i} position={[ex, 2.15, 0.52]}>
                            <sphereGeometry args={[0.06, 8, 8]} />
                            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={3} />
                        </mesh>
                    ))}
                </>
            ) : (
                <>
                    {/* Body */}
                    <mesh position={[0, 0.85, 0]} castShadow>
                        <boxGeometry args={[isBrute ? 0.54 : 0.42, 0.62, isBrute ? 0.38 : 0.30]} />
                        <meshStandardMaterial color={skinColor} roughness={0.85} />
                    </mesh>
                    {isBrute && (
                        <mesh position={[0, 0.85, 0.2]}>
                            <boxGeometry args={[0.48, 0.55, 0.06]} />
                            <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
                        </mesh>
                    )}
                    {/* Head */}
                    <mesh position={[0, 1.42, 0]} castShadow>
                        <boxGeometry args={[isBrute ? 0.36 : 0.28, isBrute ? 0.36 : 0.28, isBrute ? 0.34 : 0.27]} />
                        <meshStandardMaterial color={skinColor} roughness={0.9} />
                    </mesh>
                    {/* Eyes */}
                    {[-0.08, 0.08].map((ex, i) => (
                        <mesh key={i} position={[ex, 1.44, isBrute ? 0.18 : 0.14]}>
                            <sphereGeometry args={[0.045, 6, 6]} />
                            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={isBrute ? 2.5 : 1.5} />
                        </mesh>
                    ))}
                    {/* Brute horns */}
                    {isBrute && (
                        <>
                            <mesh position={[-0.12, 1.7, 0]} rotation={[0, 0, -0.4]}>
                                <coneGeometry args={[0.04, 0.22, 5]} />
                                <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
                            </mesh>
                            <mesh position={[0.12, 1.7, 0]} rotation={[0, 0, 0.4]}>
                                <coneGeometry args={[0.04, 0.22, 5]} />
                                <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
                            </mesh>
                        </>
                    )}
                </>
            )}
            {/* Left arm */}
            <group ref={leftArmRef} position={[-0.30, isBoss ? 1.4 : 0.88, 0]} rotation={[0, 0, 0.15]}>
                <mesh castShadow>
                    <boxGeometry args={[isBoss ? 0.2 : 0.14, isBoss ? 0.8 : 0.55, isBoss ? 0.2 : 0.13]} />
                    <meshStandardMaterial color={skinColor} roughness={0.88} />
                </mesh>
                <mesh position={[0, isBoss ? -0.4 : -0.30, 0]}>
                    <boxGeometry args={[isBoss ? 0.22 : 0.15, isBoss ? 0.2 : 0.14, isBoss ? 0.12 : 0.08]} />
                    <meshStandardMaterial color={armorColor ?? '#3a5a2a'} roughness={0.9} />
                </mesh>
            </group>
            {/* Right arm */}
            <group ref={rightArmRef} position={[0.30, isBoss ? 1.4 : 0.88, 0]} rotation={[0, 0, -0.15]}>
                <mesh castShadow>
                    <boxGeometry args={[isBoss ? 0.2 : 0.14, isBoss ? 0.8 : 0.55, isBoss ? 0.2 : 0.13]} />
                    <meshStandardMaterial color={skinColor} roughness={0.88} />
                </mesh>
                <mesh position={[0, isBoss ? -0.4 : -0.30, 0]}>
                    <boxGeometry args={[isBoss ? 0.22 : 0.15, isBoss ? 0.2 : 0.14, isBoss ? 0.12 : 0.08]} />
                    <meshStandardMaterial color={armorColor ?? '#3a5a2a'} roughness={0.9} />
                </mesh>
            </group>
            {/* Left leg */}
            <group ref={leftLegRef} position={[-0.15, isBoss ? 0.4 : 0.28, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[isBoss ? 0.22 : 0.16, isBoss ? 0.8 : 0.60, isBoss ? 0.2 : 0.15]} />
                    <meshStandardMaterial color={armorColor ?? '#2a3a1a'} roughness={0.9} />
                </mesh>
            </group>
            {/* Right leg */}
            <group ref={rightLegRef} position={[0.15, isBoss ? 0.4 : 0.28, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[isBoss ? 0.22 : 0.16, isBoss ? 0.8 : 0.60, isBoss ? 0.2 : 0.15]} />
                    <meshStandardMaterial color={armorColor ?? '#2a3a1a'} roughness={0.9} />
                </mesh>
            </group>
            {/* Frost slow overlay */}
            {isFrosted && (
                <mesh position={[0, 0.9, 0]}>
                    <boxGeometry args={[0.55, 0.75, 0.40]} />
                    <meshStandardMaterial color="#88ddff" transparent opacity={0.28} roughness={0.1} metalness={0.2} />
                </mesh>
            )}
            {/* Shadow DOT overlay */}
            {zombie.dotEffects.length > 0 && (
                <mesh position={[0, 0.9, 0]}>
                    <sphereGeometry args={[isBrute ? 0.62 : 0.45, 8, 8]} />
                    <meshStandardMaterial color="#660099" emissive="#440066" emissiveIntensity={0.8}
                        transparent opacity={0.28 + zombie.dotEffects[0].remaining / 20} depthWrite={false} />
                </mesh>
            )}
        </group>
    );
}

