'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import type { Project } from '@/data/projects';

interface GalleryCardProps {
    index: number;
    project: Project;
    style: React.CSSProperties;
    baseRotationY: number;
    scrollOffset?: number;
    isSelected?: boolean; // Hide card when it's selected/opened
    onCardClick?: (project: Project, rect: DOMRect) => void;
}

export default function GalleryCard({
    index,
    project,
    style,
    baseRotationY,
    scrollOffset = 0,
    isSelected = false,
    onCardClick
}: GalleryCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [labelPosition, setLabelPosition] = useState<'top' | 'bottom'>('bottom');

    // Parallax effect on the inner image during scroll
    useEffect(() => {
        if (imageRef.current) {
            // Subtle parallax movement based on scroll offset
            const parallaxY = scrollOffset * 0.15;
            const parallaxScale = 1 + Math.abs(scrollOffset) * 0.0001;
            imageRef.current.style.transform = `translateY(${parallaxY}px) scale(${Math.min(parallaxScale, 1.05)})`;
        }
    }, [scrollOffset]);

    useEffect(() => {
        if (isHovered && cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            if (rect.top + rect.height / 2 > viewportHeight / 2) {
                setLabelPosition('top');
            } else {
                setLabelPosition('bottom');
            }
        }
    }, [isHovered]);

    const handleClick = () => {
        if (cardRef.current && onCardClick) {
            const rect = cardRef.current.getBoundingClientRect();
            onCardClick(project, rect);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    };

    return (
        <div
            ref={cardRef}
            data-card-id={project.id}
            className="gallery-card absolute flex items-center justify-center shadow-2xl cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            role="button"
            tabIndex={0}
            style={{
                width: 'clamp(260px, 18vw, 300px)',
                height: 'clamp(347px, 24vw, 400px)', // 4:3 aspect ratio
                transformStyle: 'preserve-3d',
                transition: 'filter 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease',
                opacity: isSelected ? 0 : 1, // Hide when selected
                pointerEvents: isSelected ? 'none' : 'auto',
                ...style,
            }}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
            onKeyDown={handleKeyDown}
        >
            {/* Image with parallax container */}
            <div className="absolute inset-0 overflow-hidden rounded">
                <div
                    ref={imageRef}
                    className="absolute inset-[-10%] w-[120%] h-[120%] transition-transform duration-100 ease-out"
                >
                    <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 280px, 320px"
                        priority={index < 3}
                    />
                </div>
            </div>

            {/* Hover overlay glow */}
            {isHovered && (
                <div
                    className="absolute inset-0 rounded pointer-events-none"
                    style={{
                        boxShadow: '0 0 40px rgba(255,255,255,0.15), inset 0 0 0 1px rgba(255,255,255,0.1)',
                    }}
                />
            )}

            {/* Hover label with line - dynamic positioning */}
            {isHovered && (
                <div
                    className="absolute flex items-center pointer-events-none"
                    style={{
                        ...(labelPosition === 'top'
                            ? { top: '-40px', left: '0' }
                            : { bottom: '-40px', left: '0' }
                        ),
                        animation: 'fadeIn 0.3s ease forwards',
                    }}
                >
                    <div
                        className="h-px bg-white"
                        style={{
                            width: '60px',
                            animation: 'lineExtend 0.3s ease forwards',
                        }}
                    />
                    <div
                        className="text-white font-sans uppercase tracking-widest whitespace-nowrap ml-3"
                        style={{
                            fontSize: '11px',
                            fontWeight: 500,
                            letterSpacing: '0.15em',
                            animation: 'fadeIn 0.3s ease 0.1s forwards',
                            opacity: 0,
                        }}
                    >
                        {project.title}
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateX(-10px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes lineExtend {
                    from { width: 0; }
                    to { width: 60px; }
                }
            `}</style>
        </div>
    );
}
