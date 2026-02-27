'use client';

import { useEffect, useState, useRef } from 'react';

function dispatchKey(key: string, isDown: boolean) {
    window.dispatchEvent(new KeyboardEvent(isDown ? 'keydown' : 'keyup', { key }));
}

function dispatchClick() {
    window.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

export default function MobileControls() {
    const [isTouchTarget, setIsTouchTarget] = useState(false);
    const [joyPos, setJoyPos] = useState({ x: 0, y: 0 });
    const joyBaseRef = useRef<HTMLDivElement>(null);
    const activeKeys = useRef<Set<string>>(new Set());

    useEffect(() => {
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            setIsTouchTarget(true);
        }
    }, []);

    const updateKeys = (dx: number, dy: number, active: boolean) => {
        const threshold = 0.3;
        const keysToPress = new Set<string>();

        if (active) {
            if (dy < -threshold) keysToPress.add('w');
            if (dy > threshold) keysToPress.add('s');
            if (dx < -threshold) keysToPress.add('a');
            if (dx > threshold) keysToPress.add('d');
        }

        // Release keys that are no longer pressed
        activeKeys.current.forEach(k => {
            if (!keysToPress.has(k)) {
                dispatchKey(k, false);
                activeKeys.current.delete(k);
            }
        });

        // Press new keys
        keysToPress.forEach(k => {
            if (!activeKeys.current.has(k)) {
                dispatchKey(k, true);
                activeKeys.current.add(k);
            }
        });
    };

    const handleJoyStart = (e: React.TouchEvent | React.MouseEvent) => {
        if (!joyBaseRef.current) return;
        handleJoyMove(e);
    };

    const handleJoyMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (!joyBaseRef.current) return;
        const rect = joyBaseRef.current.getBoundingClientRect();

        let clientX = 0, clientY = 0;
        if ('touches' in e && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if ('clientX' in e) {
            // Mouse fallback for testing
            if ((e.buttons || 0) === 0) return handleJoyEnd();
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            return;
        }

        const maxR = rect.width / 2;
        const cx = rect.left + maxR;
        const cy = rect.top + maxR;

        let dx = clientX - cx;
        let dy = clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > maxR) {
            dx = (dx / dist) * maxR;
            dy = (dy / dist) * maxR;
        }

        setJoyPos({ x: dx, y: dy });
        updateKeys(dx / maxR, dy / maxR, true);
    };

    const handleJoyEnd = () => {
        setJoyPos({ x: 0, y: 0 });
        updateKeys(0, 0, false);
    };

    if (!isTouchTarget) return null;

    const ActionButton = ({ label, icon, onDown, onUp, color = '#4488ff', size = 50 }: any) => (
        <button
            onPointerDown={(e) => { e.preventDefault(); onDown(); }}
            onPointerUp={(e) => { e.preventDefault(); onUp?.(); }}
            onPointerLeave={(e) => { e.preventDefault(); onUp?.(); }}
            style={{
                width: size, height: size, borderRadius: '50%',
                background: `rgba(0,0,0,0.6)`,
                border: `2px solid ${color}`,
                color: '#fff', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                userSelect: 'none', pointerEvents: 'auto', outline: 'none',
                boxShadow: `0 0 10px ${color}40`,
            }}
        >
            <span style={{ fontSize: size * 0.4 }}>{icon}</span>
            {label && <span style={{ fontSize: 9, fontWeight: 'bold' }}>{label}</span>}
        </button>
    );

    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50, userSelect: 'none' }}>
            {/* Joystick */}
            <div
                ref={joyBaseRef}
                onTouchStart={handleJoyStart}
                onTouchMove={handleJoyMove}
                onTouchEnd={handleJoyEnd}
                onMouseDown={handleJoyStart}
                onMouseMove={handleJoyMove}
                onMouseUp={handleJoyEnd}
                onMouseLeave={handleJoyEnd}
                style={{
                    position: 'absolute', bottom: 40, left: 40, width: 120, height: 120,
                    borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                    border: '2px solid rgba(255,255,255,0.3)', pointerEvents: 'auto',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >
                <div style={{
                    width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.5)',
                    transform: `translate(${joyPos.x}px, ${joyPos.y}px)`,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)', transition: joyPos.x === 0 ? 'transform 0.1s' : 'none'
                }} />
            </div>

            {/* Action Buttons (Right Side) */}
            <div style={{
                position: 'absolute', bottom: 40, right: 40,
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15, pointerEvents: 'auto'
            }}>
                {/* Top row: Spells */}
                <div style={{ gridColumn: '1', gridRow: '1' }}>
                    <ActionButton icon="🔥" label="1" onDown={() => { dispatchKey('1', true); dispatchKey('1', false); }} color="#ff6644" />
                </div>
                <div style={{ gridColumn: '2', gridRow: '1' }}>
                    <ActionButton icon="⚡" label="2" onDown={() => { dispatchKey('2', true); dispatchKey('2', false); }} color="#aabbff" />
                </div>
                <div style={{ gridColumn: '3', gridRow: '1' }}>
                    <ActionButton icon="❄️" label="3" onDown={() => { dispatchKey('3', true); dispatchKey('3', false); }} color="#44ccff" />
                </div>

                {/* Bottom row: Utilities and Attack */}
                <div style={{ gridColumn: '1', gridRow: '2', display: 'flex', alignItems: 'flex-end' }}>
                    <ActionButton icon="🏃" label="Sprint"
                        onDown={() => dispatchKey('shift', true)}
                        onUp={() => dispatchKey('shift', false)}
                        color="#ffcc00" size={45} />
                </div>
                <div style={{ gridColumn: '2', gridRow: '2', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <ActionButton icon="🎯" label="Lock"
                        onDown={() => { dispatchKey('tab', true); dispatchKey('tab', false); }}
                        color="#ff0044" size={55} />
                </div>
                <div style={{ gridColumn: '3', gridRow: '2', display: 'flex', alignItems: 'flex-end' }}>
                    <ActionButton icon="🏹" label="Attack"
                        onDown={dispatchClick}
                        color="#44ff44" size={65} />
                </div>
            </div>
        </div>
    );
}
