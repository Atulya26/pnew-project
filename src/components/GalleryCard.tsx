'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

interface GalleryCardProps {
    index: number;
    image: string;
    title: string;
    style: React.CSSProperties;
    baseRotationY: number;
}

export default function GalleryCard({ index, image, title, style, baseRotationY }: GalleryCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [labelPosition, setLabelPosition] = useState<'top' | 'bottom'>('bottom');

    useEffect(() => {
        if (isHovered && cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // If card is in bottom half of screen, show label on top
            // If card is in top half, show label on bottom
            if (rect.top + rect.height / 2 > viewportHeight / 2) {
                setLabelPosition('top');
            } else {
                setLabelPosition('bottom');
            }
        }
    }, [isHovered]);

    return (
        <div
            ref={cardRef}
            className="gallery-card absolute flex items-center justify-center shadow-2xl cursor-pointer focus:outline-none"
            role="button"
            tabIndex={0}
            style={{
                width: 'clamp(280px, 20vw, 320px)',
                height: 'clamp(350px, 25vw, 400px)',
                transformStyle: 'preserve-3d',
                transition: 'filter 0.3s ease',
                ...style,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    // Placeholder for future click action
                    e.preventDefault();
                }
            }}
        >
            {/* Image */}
            <div className="absolute inset-0 overflow-hidden rounded">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 280px, 320px"
                    priority={index < 3}
                />
            </div>



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
                    {/* Extending line */}
                    <div
                        className="h-px bg-white"
                        style={{
                            width: '60px',
                            animation: 'lineExtend 0.3s ease forwards',
                        }}
                    />
                    {/* Title label */}
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
                        {title}
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
