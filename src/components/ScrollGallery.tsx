'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/dist/Observer';
import GalleryCard from './GalleryCard';
import CardDetail from './CardDetail';
import { projects, type Project } from '@/data/projects';

gsap.registerPlugin(Observer);

const CARD_SPACING = 180; // pixels between each card in 3D space (reduced for tighter layout)
const Y_OFFSET_PER_CARD = 64; // vertical offset per card
const Z_OFFSET_PER_CARD = 220; // depth offset per card
const ROTATION_Y = -50; // degrees

interface SelectedCard {
    project: Project;
    rect: DOMRect;
}

export default function ScrollGallery() {
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const scrollProgress = useRef(0);
    const targetProgress = useRef(0);
    const currentSkew = useRef(0); // Current skew value for smooth interpolation
    const currentCurve = useRef(0); // Current curve (rotateZ) value
    const cardOffsets = useRef<number[]>(new Array(projects.length).fill(0));
    const [mounted, setMounted] = useState(false);
    const [selectedCard, setSelectedCard] = useState<SelectedCard | null>(null);
    const [, forceUpdate] = useState(0);

    // Velocity skew settings
    const SKEW_MAX = 15; // Maximum skew in degrees
    const SKEW_SMOOTHING = 0.08; // How smoothly skew follows velocity

    // Curve (rotateZ) settings - subtle curve when scrolling fast
    const CURVE_MAX = 4; // Maximum curve in degrees (keep subtle)
    const CURVE_SMOOTHING = 0.06; // Slightly slower smoothing for curve

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleCardClick = useCallback((project: Project, rect: DOMRect) => {
        setSelectedCard({ project, rect });
    }, []);

    const handleCloseDetail = useCallback(() => {
        setSelectedCard(null);
    }, []);

    useEffect(() => {
        if (!mounted || !containerRef.current) return;

        const totalCards = projects.length;
        const loopLength = totalCards * CARD_SPACING;

        // Observer for wheel/touch/pointer events
        const observer = Observer.create({
            target: containerRef.current,
            type: 'wheel,touch,pointer',
            wheelSpeed: 1,
            onChangeY: (self) => {
                // Don't scroll if card detail is open
                if (selectedCard) return;
                targetProgress.current += self.deltaY * 0.5;
            },
            tolerance: 10,
            preventDefault: true,
        });

        // Animation loop using GSAP ticker
        let frameCount = 0;
        let lastProgress = scrollProgress.current;

        const tick = () => {
            // Smooth interpolation
            scrollProgress.current += (targetProgress.current - scrollProgress.current) * 0.08;

            // Calculate velocity (difference between frames)
            const velocity = scrollProgress.current - lastProgress;
            lastProgress = scrollProgress.current;

            // Calculate target skew based on velocity (same direction regardless of scroll)
            // Use Math.abs to keep consistent angle, then apply in NEGATIVE direction
            const absVelocity = Math.abs(velocity);
            const targetSkew = gsap.utils.clamp(-SKEW_MAX, 0, -absVelocity * 0.8);

            // Calculate target curve based on velocity (same direction, subtle)
            const targetCurve = gsap.utils.clamp(-CURVE_MAX, 0, -absVelocity * 0.3);

            // Smooth interpolation for skew
            currentSkew.current += (targetSkew - currentSkew.current) * SKEW_SMOOTHING;

            // Smooth interpolation for curve (slightly slower for flowing feel)
            currentCurve.current += (targetCurve - currentCurve.current) * CURVE_SMOOTHING;

            // Update each card position
            const cards = wrapperRef.current?.querySelectorAll('.gallery-card');
            if (!cards) return;

            cards.forEach((card, i) => {
                const htmlCard = card as HTMLElement;

                // Calculate position with wrapping
                let offset = i * CARD_SPACING - scrollProgress.current;

                // Wrap around for infinite scroll feel
                offset = ((offset % loopLength) + loopLength) % loopLength;
                if (offset > loopLength / 2) {
                    offset -= loopLength;
                }

                // Store offset for parallax calculation
                cardOffsets.current[i] = offset;

                const x = offset;
                const y = (offset / CARD_SPACING) * Y_OFFSET_PER_CARD;
                const z = (offset / CARD_SPACING) * Z_OFFSET_PER_CARD;

                // Brightness based on depth (closer = brighter)
                const normalizedZ = Math.abs(z) / (loopLength / 2);
                const brightness = Math.max(0.3, 1 - normalizedZ * 0.7);

                // Z-index based on depth
                const zIndex = Math.round(1000 - Math.abs(offset));

                // Apply transform with velocity-based skew and curve
                htmlCard.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${ROTATION_Y}deg) rotateZ(${currentCurve.current}deg) skewY(${currentSkew.current}deg)`;
                htmlCard.style.filter = `brightness(${brightness})`;
                htmlCard.style.zIndex = String(zIndex);
            });

            // Force update every 3 frames to update parallax offsets
            frameCount++;
            if (frameCount % 3 === 0) {
                forceUpdate(prev => prev + 1);
            }
        };

        gsap.ticker.add(tick);

        // Keyboard navigation
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedCard) return; // Don't navigate while detail is open
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                targetProgress.current += 100;
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                targetProgress.current -= 100;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            observer.kill();
            gsap.ticker.remove(tick);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [mounted, selectedCard]);

    if (!mounted) {
        return (
            <div className="w-screen h-screen bg-black flex items-center justify-center" role="status" aria-live="polite">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="w-screen h-screen overflow-hidden bg-black touch-none"
        >
            {/* Header - moved to right */}
            <div
                className="absolute z-50 font-sans text-right"
                style={{
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    top: '3vw',
                    right: '3vw',
                }}
            >
                <h1
                    className="text-white leading-none tracking-tight font-medium"
                    style={{
                        fontSize: 'clamp(24px, 4vw, 48px)',
                        lineHeight: 0.9,
                    }}
                >
                    Atulya
                </h1>
            </div>

            {/* Scroll hint - moved to left */}
            <div
                className="absolute z-50 flex items-center font-mono uppercase text-white"
                role="status"
                aria-label="Scroll to explore gallery"
                style={{
                    bottom: '3vw',
                    left: '3vw',
                    fontSize: '11px',
                    letterSpacing: '0.05em',
                }}
            >
                scroll to explore
            </div>

            {/* 3D Gallery Container */}
            <div
                className="relative w-full h-full flex items-center justify-center"
                style={{
                    perspective: '2000px',
                    perspectiveOrigin: '10% 10%',
                }}
            >
                <div
                    ref={wrapperRef}
                    className="relative flex items-center justify-center"
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: 'translateY(100px)',
                    }}
                >
                    {projects.map((project: Project, index: number) => (
                        <GalleryCard
                            key={project.id}
                            index={index}
                            project={project}
                            baseRotationY={ROTATION_Y}
                            scrollOffset={cardOffsets.current[index]}
                            isSelected={selectedCard?.project.id === project.id}
                            onCardClick={handleCardClick}
                            style={{
                                transform: `translate3d(${index * CARD_SPACING}px, ${index * Y_OFFSET_PER_CARD}px, ${index * Z_OFFSET_PER_CARD}px) rotateY(${ROTATION_Y}deg)`,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Card Detail Overlay */}
            {selectedCard && (
                <CardDetail
                    project={selectedCard.project}
                    sourceRect={selectedCard.rect}
                    onClose={handleCloseDetail}
                />
            )}
        </div>
    );
}
