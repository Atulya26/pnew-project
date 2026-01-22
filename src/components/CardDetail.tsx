'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { Observer } from 'gsap/dist/Observer';
import type { Project } from '@/data/projects';

gsap.registerPlugin(Observer);

interface CardDetailProps {
    project: Project;
    sourceRect: DOMRect;
    onClose: () => void;
}

// Preview state dimensions
const PREVIEW_WIDTH = 80; // vw
const PREVIEW_HEIGHT = 70; // vh

export default function CardDetail({ project, sourceRect, onClose }: CardDetailProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const heroImageRef = useRef<HTMLDivElement>(null);
    const [isClosing, setIsClosing] = useState(false);
    const [isPreview, setIsPreview] = useState(true); // New: starts in preview mode
    const [isFullscreen, setIsFullscreen] = useState(false);
    const scrollPosition = useRef(0);
    const pullToCloseProgress = useRef(0);
    const observerRef = useRef<Observer | null>(null);

    // Calculate preview position (centered)
    const getPreviewRect = useCallback(() => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const width = (PREVIEW_WIDTH / 100) * vw;
        const height = (PREVIEW_HEIGHT / 100) * vh;
        return {
            width,
            height,
            left: (vw - width) / 2,
            top: (vh - height) / 2,
        };
    }, []);

    // Opening animation - Stage 1: Card to Preview
    useEffect(() => {
        const overlay = overlayRef.current;
        const container = containerRef.current;
        const heroImage = heroImageRef.current;

        if (!overlay || !container || !heroImage) return;

        const previewRect = getPreviewRect();

        // Initial state - position at source card location
        gsap.set(container, {
            position: 'fixed',
            left: sourceRect.left,
            top: sourceRect.top,
            width: sourceRect.width,
            height: sourceRect.height,
            borderRadius: '4px',
            willChange: 'transform, width, height, left, top',
        });

        gsap.set(overlay, { opacity: 0 });
        gsap.set('.detail-content', { opacity: 0, y: 40 });

        // Create opening timeline - Stage 1: to preview state
        const tl = gsap.timeline();

        // Animate overlay
        tl.to(overlay, {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
        }, 0);

        // Animate container to preview size (80% centered)
        tl.to(container, {
            left: previewRect.left,
            top: previewRect.top,
            width: previewRect.width,
            height: previewRect.height,
            borderRadius: '16px',
            duration: 0.6,
            ease: 'power3.out',
        }, 0);

        // Slight zoom on hero image
        tl.fromTo(heroImage,
            { scale: 1 },
            { scale: 1.05, duration: 0.7, ease: 'power2.out' },
            0
        );

        // Show title/description in preview (partial reveal)
        tl.to('.detail-content', {
            opacity: 0.8,
            y: 20,
            duration: 0.4,
            ease: 'power2.out',
        }, 0.3);

        return () => {
            tl.kill();
        };
    }, [sourceRect, getPreviewRect]);

    // Preview state observer - swipe to expand to fullscreen
    useEffect(() => {
        if (!isPreview || isFullscreen || !containerRef.current) return;

        const container = containerRef.current;
        const heroImage = heroImageRef.current;

        const previewObserver = Observer.create({
            target: container,
            type: 'wheel,touch,pointer',
            wheelSpeed: 1,
            onChangeY: (self) => {
                const delta = self.deltaY;

                // Swipe up (positive delta) - expand to fullscreen
                if (delta > 30) {
                    previewObserver.kill();
                    expandToFullscreen();
                }
                // Swipe down (negative delta) - close
                else if (delta < -30) {
                    previewObserver.kill();
                    handleClose();
                }
            },
            tolerance: 10,
            preventDefault: true,
        });

        const expandToFullscreen = () => {
            setIsPreview(false);

            const tl = gsap.timeline({
                onComplete: () => setIsFullscreen(true),
            });

            // Animate to fullscreen
            tl.to(container, {
                left: 0,
                top: 0,
                width: '100vw',
                height: '100vh',
                borderRadius: '0px',
                duration: 0.5,
                ease: 'power2.out',
            }, 0);

            // Full zoom on hero
            if (heroImage) {
                tl.to(heroImage, {
                    scale: 1.15,
                    duration: 0.6,
                    ease: 'power2.out',
                }, 0);
            }

            // Full content reveal
            tl.to('.detail-content', {
                opacity: 1,
                y: 0,
                duration: 0.4,
                ease: 'power2.out',
                stagger: 0.05,
            }, 0.2);
        };

        return () => {
            previewObserver.kill();
        };
    }, [isPreview, isFullscreen]);

    // Fullscreen scroll-based parallax and swipe-to-close
    useEffect(() => {
        if (!isFullscreen || !scrollContainerRef.current) return;

        const scrollContainer = scrollContainerRef.current;
        const heroImage = heroImageRef.current;

        const observer = Observer.create({
            target: scrollContainer,
            type: 'wheel,touch,pointer',
            wheelSpeed: 1,
            onChangeY: (self) => {
                if (isClosing) return;

                const delta = self.deltaY;

                // At top and pulling down (delta < 0) = close gesture
                if (scrollPosition.current <= 0 && delta < 0) {
                    pullToCloseProgress.current += Math.abs(delta) * 0.01;

                    // Visual feedback - rubber band effect
                    gsap.to(scrollContainer, {
                        y: Math.min(pullToCloseProgress.current * 50, 100),
                        scale: 1 - pullToCloseProgress.current * 0.02,
                        duration: 0.1,
                        ease: 'none',
                    });

                    // Threshold to close
                    if (pullToCloseProgress.current > 1.5) {
                        handleClose();
                    }
                    return;
                }

                // Reset pull progress if scrolling down
                if (delta > 0 && pullToCloseProgress.current > 0) {
                    pullToCloseProgress.current = 0;
                    gsap.to(scrollContainer, {
                        y: 0,
                        scale: 1,
                        duration: 0.3,
                        ease: 'power2.out',
                    });
                }

                // Normal scroll
                scrollPosition.current = Math.max(0, scrollPosition.current + delta * 0.8);

                // Apply scroll with parallax
                gsap.to(scrollContainer, {
                    scrollTop: scrollPosition.current,
                    duration: 0.1,
                    ease: 'none',
                });

                // Hero image parallax
                if (heroImage) {
                    const parallaxOffset = scrollPosition.current * 0.4;
                    gsap.to(heroImage, {
                        y: parallaxOffset,
                        scale: 1.15 + scrollPosition.current * 0.0002,
                        duration: 0.1,
                        ease: 'none',
                    });
                }

                // Parallax for gallery images
                document.querySelectorAll('.parallax-image').forEach((img, i) => {
                    const element = img as HTMLElement;
                    const rect = element.getBoundingClientRect();
                    const viewportCenter = window.innerHeight / 2;
                    const elementCenter = rect.top + rect.height / 2;
                    const distanceFromCenter = (elementCenter - viewportCenter) / window.innerHeight;

                    gsap.to(element, {
                        y: distanceFromCenter * -50 * (i % 2 === 0 ? 1 : -1),
                        duration: 0.2,
                        ease: 'none',
                    });
                });
            },
            tolerance: 5,
            preventDefault: true,
        });

        observerRef.current = observer;

        return () => {
            observer.kill();
        };
    }, [isFullscreen, isClosing]);

    // Close handler with smooth transform-based animation
    const handleClose = useCallback(() => {
        if (isClosing) return;
        setIsClosing(true);

        const overlay = overlayRef.current;
        const container = containerRef.current;
        const scrollContainer = scrollContainerRef.current;
        const heroImage = heroImageRef.current;

        if (!overlay || !container) {
            onClose();
            return;
        }

        // Kill any observers
        observerRef.current?.kill();

        // Get current container position
        const currentRect = container.getBoundingClientRect();

        // Calculate transform values for smooth animation
        const scaleX = sourceRect.width / currentRect.width;
        const scaleY = sourceRect.height / currentRect.height;

        // Calculate the center points
        const currentCenterX = currentRect.left + currentRect.width / 2;
        const currentCenterY = currentRect.top + currentRect.height / 2;
        const targetCenterX = sourceRect.left + sourceRect.width / 2;
        const targetCenterY = sourceRect.top + sourceRect.height / 2;

        const translateX = targetCenterX - currentCenterX;
        const translateY = targetCenterY - currentCenterY;

        // Create smooth closing timeline using transforms
        const tl = gsap.timeline({
            onComplete: onClose,
        });

        // First reset any pull-to-close transforms
        if (scrollContainer) {
            tl.to(scrollContainer, {
                y: 0,
                scale: 1,
                scrollTop: 0,
                duration: 0.2,
                ease: 'power2.out',
            }, 0);
        }

        // Fade out content quickly
        tl.to('.detail-content', {
            opacity: 0,
            duration: 0.15,
            ease: 'power2.in',
        }, 0);

        // Reset hero image
        if (heroImage) {
            tl.to(heroImage, {
                scale: 1,
                y: 0,
                duration: 0.3,
                ease: 'power2.out',
            }, 0);
        }

        // Smooth transform-based close animation with physics-like easing
        // First add border radius
        tl.to(container, {
            borderRadius: '8px',
            duration: 0.3,
            ease: 'power2.out',
        }, 0.1);

        // Then animate with transform for GPU acceleration and smoothness
        tl.to(container, {
            x: translateX,
            y: translateY,
            scaleX: scaleX,
            scaleY: scaleY,
            rotateY: -50, // Match gallery skew
            duration: 0.6,
            ease: 'power2.inOut', // Smooth deceleration
            transformOrigin: 'center center',
        }, 0.1);

        // Fade out overlay
        tl.to(overlay, {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.out',
        }, 0.2);
    }, [isClosing, onClose, sourceRect]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleClose]);

    return (
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-labelledby="detail-title">
            {/* Overlay */}
            <div
                ref={overlayRef}
                className="absolute inset-0 bg-black/95 backdrop-blur-md cursor-pointer"
                role="button"
                tabIndex={-1}
                aria-label="Close overlay"
                onClick={handleClose}
                onKeyDown={(e) => e.key === 'Enter' && handleClose()}
            />

            {/* Main Container */}
            <div
                ref={containerRef}
                className="overflow-hidden bg-black"
                style={{ willChange: 'transform, width, height' }}
            >
                {/* Scrollable Content */}
                <div
                    ref={scrollContainerRef}
                    className="w-full h-full overflow-hidden"
                    style={{ willChange: 'transform' }}
                >
                    {/* Hero Section */}
                    <section className="relative w-full h-full overflow-hidden">
                        <div
                            ref={heroImageRef}
                            className="absolute inset-0 w-full h-full"
                            style={{
                                transformOrigin: 'center center',
                                willChange: 'transform',
                            }}
                        >
                            <Image
                                src={project.images[0] || project.image}
                                alt={project.title}
                                fill
                                className="object-cover"
                                sizes="100vw"
                                priority
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                        </div>

                        {/* Hero Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 detail-content">
                            <div className="max-w-4xl">
                                <p className="text-white/50 text-sm uppercase tracking-widest mb-3">
                                    {project.year}
                                </p>
                                <h1
                                    id="detail-title"
                                    className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4"
                                    style={{ letterSpacing: '-0.03em' }}
                                >
                                    {project.title}
                                </h1>
                                <p className="text-white/70 text-lg md:text-xl max-w-xl leading-relaxed">
                                    {project.description}
                                </p>
                            </div>

                            {/* Scroll indicator - only show in preview */}
                            {isPreview && (
                                <div className="absolute bottom-8 right-8 md:right-16 flex flex-col items-center gap-2 text-white/40">
                                    <span className="text-xs uppercase tracking-widest">Swipe up</span>
                                    <div className="w-px h-8 bg-white/30 animate-pulse" />
                                </div>
                            )}

                            {/* Scroll indicator - fullscreen */}
                            {isFullscreen && (
                                <div className="absolute bottom-8 right-8 md:right-16 flex flex-col items-center gap-2 text-white/40">
                                    <span className="text-xs uppercase tracking-widest">Scroll</span>
                                    <div className="w-px h-8 bg-white/30 animate-pulse" />
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Gallery Sections - only render when fullscreen */}
                    {isFullscreen && project.images.slice(1).map((image, index) => (
                        <section
                            key={index}
                            className="relative w-full min-h-screen flex items-center justify-center p-8 md:p-16 detail-content"
                        >
                            <div
                                className="parallax-image relative w-full max-w-5xl aspect-[16/10] rounded-lg overflow-hidden shadow-2xl"
                                style={{ willChange: 'transform' }}
                            >
                                <Image
                                    src={image}
                                    alt={`${project.title} - Image ${index + 2}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 80vw"
                                />
                            </div>
                        </section>
                    ))}

                    {/* Footer Section - only when fullscreen */}
                    {isFullscreen && (
                        <section className="relative w-full py-32 flex items-center justify-center detail-content">
                            <div className="text-center">
                                <p className="text-white/30 text-sm uppercase tracking-widest mb-6">
                                    Pull down to close
                                </p>
                                <button
                                    onClick={handleClose}
                                    className="px-8 py-3 border border-white/20 text-white/70 text-sm uppercase tracking-widest hover:bg-white/10 transition-colors rounded"
                                >
                                    Back to Gallery
                                </button>
                            </div>
                        </section>
                    )}
                </div>

                {/* Close button - always visible */}
                <button
                    onClick={handleClose}
                    className="fixed top-6 right-6 z-[110] w-12 h-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all text-white border border-white/10"
                    aria-label="Close"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
