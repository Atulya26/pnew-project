'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { Observer } from 'gsap/dist/Observer';
import { ExpoScaleEase } from 'gsap/dist/EasePack';
import type { Project } from '@/data/projects';

gsap.registerPlugin(Observer, ExpoScaleEase);

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

        // Calculate scale factors for smooth expo-scale-like animation
        const scaleX = previewRect.width / sourceRect.width;
        const scaleY = previewRect.height / sourceRect.height;

        // Calculate center points for transform-based animation
        const sourceCenterX = sourceRect.left + sourceRect.width / 2;
        const sourceCenterY = sourceRect.top + sourceRect.height / 2;
        const targetCenterX = previewRect.left + previewRect.width / 2;
        const targetCenterY = previewRect.top + previewRect.height / 2;

        // Initial state - position at source card location with transform origin
        gsap.set(container, {
            position: 'fixed',
            left: sourceRect.left,
            top: sourceRect.top,
            width: sourceRect.width,
            height: sourceRect.height,
            borderRadius: '4px',
            rotateY: -50, // Match gallery card skew
            transformOrigin: 'center center',
            willChange: 'transform, width, height, left, top',
        });

        gsap.set(overlay, { opacity: 0 });
        gsap.set('.detail-content', { opacity: 0, y: 60, scale: 0.95 });

        // Create opening timeline with expo-style smoothing
        const tl = gsap.timeline({
            defaults: { ease: 'expo.out' }
        });

        // Animate overlay with slight blur effect
        tl.to(overlay, {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
        }, 0);

        // First: straighten the rotation smoothly
        tl.to(container, {
            rotateY: 0,
            duration: 0.5,
            ease: 'power3.out',
        }, 0);

        // Then: scale and move to preview position with expo easing
        tl.to(container, {
            left: previewRect.left,
            top: previewRect.top,
            width: previewRect.width,
            height: previewRect.height,
            borderRadius: '20px',
            duration: 0.9,
            ease: 'expo.out',
        }, 0.05);

        // Subtle scale overshoot for premium feel
        tl.fromTo(heroImage,
            { scale: 1.2 },
            {
                scale: 1.05,
                duration: 1.1,
                ease: 'expo.out',
            },
            0
        );

        // Staggered content reveal with spring-like ease
        tl.to('.detail-content', {
            opacity: 0.85,
            y: 20,
            scale: 1,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.08,
        }, 0.35);

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
                defaults: { ease: 'expo.out' }
            });

            // Animate to fullscreen with expo easing
            tl.to(container, {
                left: 0,
                top: 0,
                width: '100vw',
                height: '100vh',
                borderRadius: '0px',
                duration: 0.8,
                ease: 'expo.out',
            }, 0);

            // Full zoom on hero with smooth deceleration
            if (heroImage) {
                tl.to(heroImage, {
                    scale: 1.15,
                    duration: 1,
                    ease: 'expo.out',
                }, 0);
            }

            // Full content reveal with stagger
            tl.to('.detail-content', {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                ease: 'power3.out',
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

        // IMMEDIATELY hide all content to prevent weird visuals
        gsap.set('.detail-content', { opacity: 0, visibility: 'hidden' });
        gsap.set(container, { overflow: 'hidden' });

        // Reset scroll container state immediately
        if (scrollContainer) {
            gsap.set(scrollContainer, { y: 0, scale: 1, scrollTop: 0 });
        }

        // Create smooth closing timeline
        const tl = gsap.timeline({
            onComplete: onClose,
        });

        // Reset hero image smoothly
        if (heroImage) {
            tl.to(heroImage, {
                scale: 1,
                y: 0,
                duration: 0.5,
                ease: 'power2.out',
            }, 0);
        }

        // Start fading overlay
        tl.to(overlay, {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
        }, 0.2);

        // Animate directly to target position using left/top/width/height
        // This avoids the stretching issues of scaleX/scaleY
        tl.to(container, {
            left: sourceRect.left,
            top: sourceRect.top,
            width: sourceRect.width,
            height: sourceRect.height,
            borderRadius: '4px',
            rotateY: -50, // Match gallery skew
            duration: 0.7,
            ease: 'expo.out',
            transformOrigin: 'center center',
        }, 0);
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
                                className="parallax-image relative w-full max-w-5xl aspect-[4/3] rounded-lg overflow-hidden shadow-2xl"
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
