// Sample Listings Data for Canadian AI Classifieds
// This file contains realistic sample data for testing
// TODO: Replace with Firebase Firestore integration

const sampleListings = [
    // Electronics
    {
        id: 'listing-001',
        title: 'iPhone 14 Pro Max - 256GB Deep Purple',
        description: 'Excellent condition iPhone 14 Pro Max. Barely used for 3 months. Comes with original box, charging cable, and clear case. Always used with screen protector. Battery health at 100%. No scratches or dents. Selling because upgrading to newer model.',
        price: 1150,
        category: 'electronics',
        subcategory: 'phones',
        condition: 'Like New',
        images: [
            'https://picsum.photos/800/600?random=1',
            'https://picsum.photos/800/600?random=2',
            'https://picsum.photos/800/600?random=3'
        ],
        location: {
            city: 'Toronto',
            province: 'ON',
            address: 'Downtown Toronto',
            lat: 43.6532,
            lng: -79.3832
        },
        seller: {
            id: 'user-001',
            name: 'Sarah Johnson',
            avatar: 'https://i.pravatar.cc/150?img=1',
            verified: true,
            rating: 4.8,
            reviewCount: 24
        },
        status: 'active',
        views: 234,
        favorites: 18,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        featured: true
    },
    {
        id: 'listing-002',
        title: 'MacBook Pro 16" M2 Pro - 16GB RAM, 512GB SSD',
        description: 'Powerful MacBook Pro with M2 Pro chip. Perfect for developers and creative professionals. Includes original charger and USB-C adapter. AppleCare+ valid until December 2025. Very light usage, mostly for home office.',
        price: 2800,
        category: 'electronics',
        subcategory: 'computers',
        condition: 'Excellent',
        images: [
            'https://picsum.photos/800/600?random=4',
            'https://picsum.photos/800/600?random=5',
            'https://picsum.photos/800/600?random=6'
        ],
        location: {
            city: 'Vancouver',
            province: 'BC',
            address: 'West End',
            lat: 49.2827,
            lng: -123.1207
        },
        seller: {
            id: 'user-002',
            name: 'Michael Chen',
            avatar: 'https://i.pravatar.cc/150?img=12',
            verified: true,
            rating: 5.0,
            reviewCount: 31
        },
        status: 'active',
        views: 456,
        favorites: 45,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        featured: false
    },
    {
        id: 'listing-003',
        title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
        description: 'Premium noise-cancelling headphones in pristine condition. Used only a handful of times. Comes with carrying case, cables, and all original accessories. Industry-leading noise cancellation and amazing sound quality.',
        price: 325,
        category: 'electronics',
        subcategory: 'audio',
        condition: 'Like New',
        images: [
            'https://picsum.photos/800/600?random=7',
            'https://picsum.photos/800/600?random=8'
        ],
        location: {
            city: 'Montreal',
            province: 'QC',
            address: 'Plateau-Mont-Royal',
            lat: 45.5017,
            lng: -73.5673
        },
        seller: {
            id: 'user-003',
            name: 'Emma Dubois',
            avatar: 'https://i.pravatar.cc/150?img=5',
            verified: false,
            rating: 4.5,
            reviewCount: 8
        },
        status: 'active',
        views: 89,
        favorites: 12,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        featured: false
    },

    // Vehicles
    {
        id: 'listing-004',
        title: '2020 Honda Civic Sport - Low Mileage, One Owner',
        description: 'Beautiful Honda Civic Sport in excellent condition. Only 35,000 km! Regular maintenance at Honda dealership. Non-smoker, garage kept. Features include sunroof, backup camera, heated seats, and lane departure warning. Clean CarFax available.',
        price: 24500,
        category: 'vehicles',
        subcategory: 'cars',
        condition: 'Excellent',
        images: [
            'https://picsum.photos/800/600?random=9',
            'https://picsum.photos/800/600?random=10',
            'https://picsum.photos/800/600?random=11'
        ],
        location: {
            city: 'Calgary',
            province: 'AB',
            address: 'Northwest Calgary',
            lat: 51.0447,
            lng: -114.0719
        },
        seller: {
            id: 'user-004',
            name: 'David Thompson',
            avatar: 'https://i.pravatar.cc/150?img=8',
            verified: true,
            rating: 4.9,
            reviewCount: 15
        },
        status: 'active',
        views: 678,
        favorites: 56,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        featured: true
    },
    {
        id: 'listing-005',
        title: '2018 Toyota RAV4 AWD - Family SUV, Winter Tires Included',
        description: 'Reliable Toyota RAV4 with all-wheel drive, perfect for Canadian winters. 78,000 km. Comes with a complete set of winter tires on rims. Recent oil change and brake service. Great family vehicle with plenty of cargo space.',
        price: 28900,
        category: 'vehicles',
        subcategory: 'cars',
        condition: 'Good',
        images: [
            'https://picsum.photos/800/600?random=12',
            'https://picsum.photos/800/600?random=13'
        ],
        location: {
            city: 'Ottawa',
            province: 'ON',
            address: 'Kanata',
            lat: 45.4215,
            lng: -75.6972
        },
        seller: {
            id: 'user-005',
            name: 'Jennifer Wilson',
            avatar: 'https://i.pravatar.cc/150?img=9',
            verified: true,
            rating: 4.7,
            reviewCount: 12
        },
        status: 'active',
        views: 523,
        favorites: 38,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        featured: false
    },

    // Furniture
    {
        id: 'listing-006',
        title: 'Modern Grey Sectional Sofa - L-Shaped, Like New',
        description: 'Stunning modern sectional sofa in charcoal grey. Purchased from EQ3 last year for $3,200. Moving to smaller apartment and cannot take it with me. Super comfortable, pet-free and smoke-free home. Seats 5-6 people comfortably.',
        price: 1450,
        category: 'furniture',
        subcategory: 'living-room',
        condition: 'Like New',
        images: [
            'https://picsum.photos/800/600?random=14',
            'https://picsum.photos/800/600?random=15',
            'https://picsum.photos/800/600?random=16'
        ],
        location: {
            city: 'Toronto',
            province: 'ON',
            address: 'Midtown Toronto',
            lat: 43.7001,
            lng: -79.4163
        },
        seller: {
            id: 'user-006',
            name: 'Alex Martinez',
            avatar: 'https://i.pravatar.cc/150?img=14',
            verified: true,
            rating: 4.8,
            reviewCount: 19
        },
        status: 'active',
        views: 312,
        favorites: 29,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        featured: false
    },
    {
        id: 'listing-007',
        title: 'Solid Oak Dining Table with 6 Chairs - Rustic Farmhouse Style',
        description: 'Beautiful handcrafted solid oak dining table with matching chairs. Seats 6-8 people. Perfect for family dinners and entertaining. The wood has a gorgeous grain pattern and natural finish. Minor wear consistent with use, but very well maintained.',
        price: 850,
        category: 'furniture',
        subcategory: 'dining',
        condition: 'Good',
        images: [
            'https://picsum.photos/800/600?random=17',
            'https://picsum.photos/800/600?random=18'
        ],
        location: {
            city: 'Edmonton',
            province: 'AB',
            address: 'Old Strathcona',
            lat: 53.5461,
            lng: -113.4938
        },
        seller: {
            id: 'user-007',
            name: 'Robert Anderson',
            avatar: 'https://i.pravatar.cc/150?img=13',
            verified: false,
            rating: 4.3,
            reviewCount: 6
        },
        status: 'active',
        views: 187,
        favorites: 15,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        featured: false
    },

    // Real Estate
    {
        id: 'listing-008',
        title: 'Spacious 2-Bedroom Apartment - Downtown Vancouver',
        description: 'Modern 2-bedroom, 2-bathroom condo in the heart of Downtown Vancouver. 900 sq ft with stunning city views. Includes in-suite laundry, stainless steel appliances, granite countertops, and underground parking. Building has gym, concierge, and rooftop patio. Available March 1st.',
        price: 2850,
        category: 'realestate',
        subcategory: 'apartments',
        condition: 'Excellent',
        images: [
            'https://picsum.photos/800/600?random=19',
            'https://picsum.photos/800/600?random=20',
            'https://picsum.photos/800/600?random=21'
        ],
        location: {
            city: 'Vancouver',
            province: 'BC',
            address: 'Downtown Vancouver',
            lat: 49.2827,
            lng: -123.1207
        },
        seller: {
            id: 'user-008',
            name: 'Lisa Park',
            avatar: 'https://i.pravatar.cc/150?img=10',
            verified: true,
            rating: 5.0,
            reviewCount: 22
        },
        status: 'active',
        views: 892,
        favorites: 67,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        featured: true
    },

    // Fashion
    {
        id: 'listing-009',
        title: 'Canada Goose Expedition Parka - Men\'s Large, Navy',
        description: 'Authentic Canada Goose Expedition parka in navy blue, size large. Worn one season, in excellent condition. Perfect for harsh Canadian winters. Filled with premium down insulation. Retail price $1,795. Comes with authenticity card and original tags.',
        price: 950,
        category: 'fashion',
        subcategory: 'outerwear',
        condition: 'Like New',
        images: [
            'https://picsum.photos/800/600?random=22',
            'https://picsum.photos/800/600?random=23'
        ],
        location: {
            city: 'Winnipeg',
            province: 'MB',
            address: 'St. Vital',
            lat: 49.8951,
            lng: -97.1384
        },
        seller: {
            id: 'user-009',
            name: 'James Brown',
            avatar: 'https://i.pravatar.cc/150?img=15',
            verified: true,
            rating: 4.6,
            reviewCount: 11
        },
        status: 'active',
        views: 156,
        favorites: 23,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        featured: false
    },

    // Services
    {
        id: 'listing-010',
        title: 'Professional Photography Services - Events & Portraits',
        description: 'Experienced photographer offering services for weddings, corporate events, family portraits, and headshots. 10+ years of experience. Professional equipment and editing included. Portfolio available upon request. Flexible packages to suit your needs.',
        price: 350,
        category: 'services',
        subcategory: 'photography',
        condition: 'New',
        images: [
            'https://picsum.photos/800/600?random=24',
            'https://picsum.photos/800/600?random=25'
        ],
        location: {
            city: 'Halifax',
            province: 'NS',
            address: 'Downtown Halifax',
            lat: 44.6488,
            lng: -63.5752
        },
        seller: {
            id: 'user-010',
            name: 'Rachel Green',
            avatar: 'https://i.pravatar.cc/150?img=16',
            verified: true,
            rating: 4.9,
            reviewCount: 38
        },
        status: 'active',
        views: 203,
        favorites: 31,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        featured: false
    },

    // Jobs
    {
        id: 'listing-011',
        title: 'Full Stack Developer - React & Node.js (Remote/Hybrid)',
        description: 'Growing tech startup seeking talented Full Stack Developer. Work with modern tech stack: React, Node.js, PostgreSQL, AWS. Competitive salary $90K-$120K based on experience. Flexible remote/hybrid work. Great benefits including health, dental, and stock options.',
        price: 105000,
        category: 'jobs',
        subcategory: 'technology',
        condition: 'New',
        images: [
            'https://picsum.photos/800/600?random=26',
            'https://picsum.photos/800/600?random=27'
        ],
        location: {
            city: 'Toronto',
            province: 'ON',
            address: 'Liberty Village',
            lat: 43.6426,
            lng: -79.4194
        },
        seller: {
            id: 'user-011',
            name: 'TechStart Inc.',
            avatar: 'https://i.pravatar.cc/150?img=20',
            verified: true,
            rating: 4.7,
            reviewCount: 14
        },
        status: 'active',
        views: 512,
        favorites: 78,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        featured: true
    },

    // Hobbies
    {
        id: 'listing-012',
        title: 'Fender Stratocaster Electric Guitar - Sunburst Finish',
        description: 'Classic Fender Stratocaster in beautiful 3-color sunburst finish. Excellent playability and tone. Includes hard shell case, strap, and extra strings. Well maintained, minor wear on the body. Perfect for intermediate to advanced players.',
        price: 1200,
        category: 'hobbies',
        subcategory: 'musical-instruments',
        condition: 'Good',
        images: [
            'https://picsum.photos/800/600?random=28',
            'https://picsum.photos/800/600?random=29'
        ],
        location: {
            city: 'Quebec City',
            province: 'QC',
            address: 'Old Quebec',
            lat: 46.8139,
            lng: -71.2080
        },
        seller: {
            id: 'user-012',
            name: 'Marc Tremblay',
            avatar: 'https://i.pravatar.cc/150?img=18',
            verified: false,
            rating: 4.4,
            reviewCount: 7
        },
        status: 'active',
        views: 178,
        favorites: 25,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        featured: false
    }
];

// Category metadata
const categories = {
    'electronics': {
        name: 'Electronics',
        icon: '💻',
        subcategories: ['phones', 'computers', 'tablets', 'audio', 'cameras', 'gaming']
    },
    'vehicles': {
        name: 'Cars & Vehicles',
        icon: '🚗',
        subcategories: ['cars', 'trucks', 'motorcycles', 'rvs', 'parts']
    },
    'realestate': {
        name: 'Real Estate',
        icon: '🏠',
        subcategories: ['apartments', 'houses', 'condos', 'commercial', 'land']
    },
    'furniture': {
        name: 'Furniture',
        icon: '🛋️',
        subcategories: ['living-room', 'bedroom', 'dining', 'office', 'outdoor']
    },
    'jobs': {
        name: 'Jobs',
        icon: '💼',
        subcategories: ['technology', 'healthcare', 'education', 'retail', 'trades']
    },
    'services': {
        name: 'Services',
        icon: '🔧',
        subcategories: ['home-services', 'photography', 'tutoring', 'automotive', 'events']
    },
    'fashion': {
        name: 'Fashion',
        icon: '👕',
        subcategories: ['clothing', 'shoes', 'accessories', 'outerwear', 'jewelry']
    },
    'hobbies': {
        name: 'Hobbies',
        icon: '🎮',
        subcategories: ['musical-instruments', 'sports', 'books', 'collectibles', 'art']
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { sampleListings, categories };
}
