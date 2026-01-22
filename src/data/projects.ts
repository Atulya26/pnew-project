export interface Project {
    id: number;
    title: string;
    image: string; // thumbnail
    images: string[]; // additional images for detail view
    description: string;
    year: string;
}

export const projects: Project[] = [
    {
        id: 0,
        title: 'Project Alpha',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=90',
            'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1200&q=90',
            'https://images.unsplash.com/photo-1614851099511-773084f6911d?w=1200&q=90',
        ],
        description: 'An exploration of abstract forms and vibrant color harmonies. This project pushes the boundaries of digital art.',
        year: '2024'
    },
    {
        id: 1,
        title: 'Project Beta',
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=90',
            'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&q=90',
            'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=1200&q=90',
        ],
        description: 'A deep dive into minimalist aesthetics and geometric precision. Clean lines meet bold statements.',
        year: '2024'
    },
    {
        id: 2,
        title: 'Project Gamma',
        image: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1200&q=90',
            'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=1200&q=90',
            'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&q=90',
        ],
        description: 'Fluid dynamics captured in still form. A study of motion, light, and organic patterns.',
        year: '2023'
    },
    {
        id: 3,
        title: 'Project Delta',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=90',
            'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=1200&q=90',
            'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=1200&q=90',
        ],
        description: 'Retro-futurism meets modern design sensibilities. A nostalgic journey through technology.',
        year: '2023'
    },
    {
        id: 4,
        title: 'Project Epsilon',
        image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=1200&q=90',
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=90',
            'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=90',
        ],
        description: 'Cosmic inspiration brought down to earth. Exploring the vastness of space through design.',
        year: '2023'
    },
    {
        id: 5,
        title: 'Project Zeta',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&q=90',
            'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1200&q=90',
            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=90',
        ],
        description: 'Mathematical beauty rendered visible. Fractals and algorithms creating art.',
        year: '2022'
    },
    {
        id: 6,
        title: 'Project Eta',
        image: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=1200&q=90',
            'https://images.unsplash.com/photo-1614851099511-773084f6911d?w=1200&q=90',
            'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1200&q=90',
        ],
        description: 'Light manipulation at its finest. Playing with reflections and refractions.',
        year: '2022'
    },
    {
        id: 7,
        title: 'Project Theta',
        image: 'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=1200&q=90',
            'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&q=90',
            'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=1200&q=90',
        ],
        description: 'Texture and depth in digital form. A tactile experience through the screen.',
        year: '2022'
    },
    {
        id: 8,
        title: 'Project Iota',
        image: 'https://images.unsplash.com/photo-1614851099511-773084f6911d?w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1614851099511-773084f6911d?w=1200&q=90',
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=90',
            'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&q=90',
        ],
        description: 'Aurora-inspired gradients and atmospheric design. Nature meets technology.',
        year: '2021'
    },
    {
        id: 9,
        title: 'Project Kappa',
        image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1200&q=90',
            'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=1200&q=90',
            'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=1200&q=90',
        ],
        description: 'Paint in motion. Digital brushstrokes creating emotional landscapes.',
        year: '2021'
    },
    {
        id: 10,
        title: 'Project Lambda',
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&q=90',
            'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=90',
            'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1200&q=90',
        ],
        description: 'Classical art reimagined. Old masters meet contemporary vision.',
        year: '2021'
    },
    {
        id: 11,
        title: 'Project Mu',
        image: 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=1200&q=90',
            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=90',
            'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=1200&q=90',
        ],
        description: 'The intersection of art and technology. Where creativity meets innovation.',
        year: '2020'
    },
];

