import { collection, addDoc, getDocs, doc, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ShopItem } from './types';
import { MALE_AVATARS, FEMALE_AVATARS } from './avatarUtils';

/**
 * Initialize shop with sample items
 * Run this once to populate the shop 
 */
export const initializeShopItems = async () => {
    try {
        const shopRef = collection(db, 'shopItems');
        
        // Clean up existing items to avoid duplicates and stale paths
        const existingDocs = await getDocs(shopRef);
        for (const existingDoc of existingDocs.docs) {
            await deleteDoc(doc(db, 'shopItems', existingDoc.id));
        }
        console.log('🧹 Cleaned up existing shop items');

        const shopItems: Omit<ShopItem, 'id'>[] = [
        // Boosters
        {
            name: '2x Quiz Multiplier',
            description: 'Double your coin earnings for the next 5 quizzes',
            price: 500,
            category: 'booster',
            icon: '⚡',
            metadata: {
                duration: 5,
                multiplier: 2
            },
            createdAt: Timestamp.now()
        },
        {
            name: 'Hint Pack',
            description: 'Get 10 hints to help you with tough quiz questions',
            price: 200,
            category: 'booster',
            icon: '💡',
            metadata: {
                duration: 10
            },
            createdAt: Timestamp.now()
        },
        {
            name: 'Time Extension',
            description: 'Add 30 extra seconds for your next 3 quizzes',
            price: 300,
            category: 'booster',
            icon: '⏱️',
            metadata: {
                duration: 3
            },
            createdAt: Timestamp.now()
        },
        {
            name: '3x Super Multiplier',
            description: 'TRIPLE your coin earnings for the next 3 quizzes',
            price: 1000,
            category: 'booster',
            icon: '🔥',
            metadata: {
                duration: 3,
                multiplier: 3
            },
            createdAt: Timestamp.now()
        },

        // Visual Customizations
        {
            name: 'Dark Blue Theme',
            description: 'Deep ocean blue color scheme for your dashboard',
            price: 300,
            category: 'visual',
            icon: '🌊',
            metadata: {
                themeColors: {
                    primary: '#1e40af',
                    secondary: '#3b82f6'
                }
            },
            createdAt: Timestamp.now()
        },
        {
            name: 'Sakura Theme',
            description: 'Beautiful cherry blossom pink theme',
            price: 500,
            category: 'visual',
            icon: '🌸',
            metadata: {
                themeColors: {
                    primary: '#ec4899',
                    secondary: '#f472b6'
                }
            },
            createdAt: Timestamp.now()
        },
        {
            name: 'Midnight Purple',
            description: 'Elegant purple night theme',
            price: 800,
            category: 'visual',
            icon: '🌙',
            metadata: {
                themeColors: {
                    primary: '#7c3aed',
                    secondary: '#a78bfa'
                }
            },
            createdAt: Timestamp.now()
        },
        {
            name: 'Forest Green',
            description: 'Calm and focused green theme',
            price: 400,
            category: 'visual',
            icon: '🌲',
            metadata: {
                themeColors: {
                    primary: '#059669',
                    secondary: '#10b981'
                }
            },
            createdAt: Timestamp.now()
        },

        // Profile Items
        {
            name: '"Quiz Master" Title',
            description: 'Show everyone you\'re the quiz expert',
            price: 1000,
            category: 'profile',
            icon: '👑',
            createdAt: Timestamp.now()
        },
        {
            name: '"Top Streaker" Title',
            description: 'Flex your impressive login streak',
            price: 1200,
            category: 'profile',
            icon: '🔥',
            createdAt: Timestamp.now()
        },
        {
            name: '"Brain Boss" Title',
            description: 'The ultimate knowledge champion',
            price: 1500,
            category: 'profile',
            icon: '🧠',
            createdAt: Timestamp.now()
        },
        {
            name: 'Golden Profile Frame',
            description: 'Make your profile shine with a golden border',
            price: 600,
            category: 'profile',
            icon: '✨',
            createdAt: Timestamp.now()
        },
        {
            name: 'Diamond Profile Frame',
            description: 'Ultra-rare diamond profile border',
            price: 2000,
            category: 'profile',
            icon: '💎',
            stock: 10, // Limited edition
            createdAt: Timestamp.now()
        },

        // Avatars - Male
        ...MALE_AVATARS.map((path, index) => ({
            name: `Male Avatar ${index + 1}`,
            description: 'A stylish male avatar for your profile',
            price: 500,
            category: 'avatar' as const,
            icon: path,
            metadata: { gender: 'male' },
            createdAt: Timestamp.now()
        })),

        // Avatars - Female
        ...FEMALE_AVATARS.map((path, index) => ({
            name: `Female Avatar ${index + 1}`,
            description: 'A stylish female avatar for your profile',
            price: 500,
            category: 'avatar' as const,
            icon: path,
            metadata: { gender: 'female' },
            createdAt: Timestamp.now()
        }))
    ];

        try {
            const shopRef = collection(db, 'shopItems');

            for (const item of shopItems) {
                await addDoc(shopRef, item);
                console.log(`Added: ${item.name}`);
            }

            console.log('✅ Shop items initialized successfully!');
            return { success: true, count: shopItems.length };
        } catch (error) {
            console.error('Error initializing shop items:', error);
            return { success: false, error };
        }
    } catch (error) {
        console.error('Error cleaning up shop items:', error);
        return { success: false, error };
    }
};
