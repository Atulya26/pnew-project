import type { Project } from '@/types/project'

// Dummy projects for local development/prototyping
export const dummyProjects: Project[] = [
    {
        id: '1',
        title: 'Finance App Redesign',
        description: 'A modern take on personal finance management with intuitive visualizations.',
        thoughts: 'The goal was to make financial data less intimidating. I focused on soft gradients and rounded corners to create a friendly feel. The color palette uses calming blues and greens to reduce anxiety around money management.',
        images: [
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
            'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
        ],
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        display_order: 0,
    },
    {
        id: '2',
        title: 'Health & Wellness Dashboard',
        description: 'Tracking fitness goals with beautiful data visualization and gamification.',
        thoughts: 'I wanted to gamify the health tracking experience without making it feel childish. The circular progress indicators and achievement badges provide motivation while maintaining a clean, professional aesthetic.',
        images: [
            'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
            'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
            'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80',
        ],
        created_at: '2024-02-10T14:30:00Z',
        updated_at: '2024-02-10T14:30:00Z',
        display_order: 1,
    },
    {
        id: '3',
        title: 'E-commerce Mobile App',
        description: 'Luxury fashion shopping experience with AR try-on features.',
        thoughts: 'The challenge was balancing the premium feel of luxury brands with usability. I used lots of white space, high-quality imagery, and subtle animations. The AR integration required careful UI consideration to not overwhelm users.',
        images: [
            'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80',
            'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
            'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80',
        ],
        created_at: '2024-03-05T09:15:00Z',
        updated_at: '2024-03-05T09:15:00Z',
        display_order: 2,
    },
    {
        id: '4',
        title: 'Smart Home Control',
        description: 'Unified interface for managing all connected home devices.',
        thoughts: 'Home automation can feel overwhelming with too many controls. I designed a simplified "scenes" approach where users activate moods rather than individual devices. The dark mode default reduces light pollution at night.',
        images: [
            'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80',
            'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
            'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80',
        ],
        created_at: '2024-03-20T16:45:00Z',
        updated_at: '2024-03-20T16:45:00Z',
        display_order: 3,
    },
    {
        id: '5',
        title: 'Music Streaming Concept',
        description: 'Reimagining how we discover and experience music.',
        thoughts: 'I explored how album artwork could become the hero element rather than just a thumbnail. The interface morphs colors based on the playing track, creating an immersive experience. Gesture-based navigation makes one-handed use effortless.',
        images: [
            'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&q=80',
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
            'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
            'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80',
        ],
        created_at: '2024-04-01T11:00:00Z',
        updated_at: '2024-04-01T11:00:00Z',
        display_order: 4,
    },
]
