import {
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp,
    runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';
import { ShopItem, Purchase } from './types';

/**
 * Get all shop items from Firestore
 */
export const getShopItems = async (): Promise<ShopItem[]> => {
    try {
        const shopRef = collection(db, 'shopItems');
        // Simple query without orderBy to avoid composite index requirement
        const querySnapshot = await getDocs(shopRef);

        // Sort in memory by category and price
        const items = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as ShopItem));

        // Sort by category first, then by price
        return items.sort((a, b) => {
            if (a.category !== b.category) {
                return a.category.localeCompare(b.category);
            }
            return a.price - b.price;
        });
    } catch (error) {
        console.error('Error fetching shop items:', error);
        return [];
    }
};

/**
 * Get user's purchased items
 */
export const getUserPurchases = async (userId: string): Promise<Purchase[]> => {
    try {
        const purchasesRef = collection(db, `users/${userId}/purchases`);
        const q = query(purchasesRef, orderBy('purchasedAt', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Purchase));
    } catch (error) {
        console.error('Error fetching user purchases:', error);
        return [];
    }
};

/**
 * Get user's inventory (what they own)
 */
export const getUserInventory = async (userId: string): Promise<string[]> => {
    try {
        const purchases = await getUserPurchases(userId);
        return purchases.map(p => p.itemId);
    } catch (error) {
        console.error('Error fetching user inventory:', error);
        return [];
    }
};

/**
 * Check if user owns a specific item
 */
export const checkItemOwnership = async (userId: string, itemId: string): Promise<boolean> => {
    try {
        const inventory = await getUserInventory(userId);
        return inventory.includes(itemId);
    } catch (error) {
        console.error('Error checking item ownership:', error);
        return false;
    }
};

/**
 * Purchase an item
 */
export const purchaseItem = async (
    userId: string,
    itemId: string
): Promise<{ success: boolean; message: string; newBalance?: number }> => {
    try {
        return await runTransaction(db, async (transaction) => {
            // Get user data
            const userRef = doc(db, 'users', userId);
            const userDoc = await transaction.get(userRef);

            if (!userDoc.exists()) {
                return { success: false, message: 'User not found' };
            }

            const userData = userDoc.data();
            const currentBalance = userData.coins || 0;

            // Get shop item
            const itemRef = doc(db, 'shopItems', itemId);
            const itemDoc = await transaction.get(itemRef);

            if (!itemDoc.exists()) {
                return { success: false, message: 'Item not found' };
            }

            const item = { id: itemDoc.id, ...itemDoc.data() } as ShopItem;

            // Check if user already owns the item (for non-consumable items)
            const purchasesRef = collection(db, `users/${userId}/purchases`);
            const existingPurchase = await getDocs(query(purchasesRef, where('itemId', '==', itemId)));

            if (existingPurchase.size > 0 && item.category !== 'booster') {
                return { success: false, message: 'You already own this item' };
            }

            // Check if user has enough coins
            if (currentBalance < item.price) {
                return {
                    success: false,
                    message: `Insufficient coins. You need ${item.price - currentBalance} more coins.`
                };
            }

            // Check stock for limited items
            if (item.stock !== undefined && item.stock <= 0) {
                return { success: false, message: 'This item is out of stock' };
            }

            // Deduct coins
            const newBalance = currentBalance - item.price;
            transaction.update(userRef, { coins: newBalance });

            // Update stock if limited
            if (item.stock !== undefined) {
                transaction.update(itemRef, { stock: item.stock - 1 });
            }

            // Create purchase record
            const purchaseRef = doc(collection(db, `users/${userId}/purchases`));
            const purchase: Omit<Purchase, 'id'> = {
                userId,
                itemId: item.id,
                itemName: item.name,
                price: item.price,
                purchasedAt: Timestamp.now(),
                ...(item.metadata?.duration && {
                    usedCount: 0,
                    maxUses: item.metadata.duration
                }),
                ...(item.category === 'visual' || item.category === 'profile' ? { active: false } : {})
            };

            transaction.set(purchaseRef, purchase);

            // Create transaction record
            const transactionRef = doc(collection(db, `users/${userId}/transactions`));
            transaction.set(transactionRef, {
                amount: item.price,
                type: 'debit',
                category: 'shop',
                description: `Purchased: ${item.name}`,
                timestamp: Timestamp.now()
            });

            return {
                success: true,
                message: `Successfully purchased ${item.name}! You can find it under the customization tab.`,
                newBalance
            };
        });
    } catch (error) {
        console.error('Error purchasing item:', error);
        return {
            success: false,
            message: 'An error occurred during purchase. Please try again.'
        };
    }
};

/**
 * Activate a customization item (theme, avatar, etc.)
 */
export const activateCustomization = async (
    userId: string,
    itemId: string,
    customizationType: 'theme' | 'avatar' | 'title' | 'profileFrame'
): Promise<boolean> => {
    try {
        // Check if user owns the item
        const owns = await checkItemOwnership(userId, itemId);
        if (!owns) return false;

        // Update user's active customizations
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            [`activeCustomizations.${customizationType}`]: itemId
        });

        // Mark purchase as active
        const purchases = await getUserPurchases(userId);
        const purchase = purchases.find(p => p.itemId === itemId);
        if (purchase) {
            const purchaseRef = doc(db, `users/${userId}/purchases`, purchase.id);
            await updateDoc(purchaseRef, { active: true });
        }

        return true;
    } catch (error) {
        console.error('Error activating customization:', error);
        return false;
    }
};

/**
 * Deactivate a customization
 */
export const deactivateCustomization = async (
    userId: string,
    customizationType: 'theme' | 'avatar' | 'title' | 'profileFrame'
): Promise<boolean> => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            [`activeCustomizations.${customizationType}`]: null
        });
        return true;
    } catch (error) {
        console.error('Error deactivating customization:', error);
        return false;
    }
};

/**
 * Use a booster item
 */
export const consumeBooster = async (userId: string, purchaseId: string): Promise<boolean> => {
    try {
        const purchaseRef = doc(db, `users/${userId}/purchases`, purchaseId);
        const purchaseDoc = await getDoc(purchaseRef);

        if (!purchaseDoc.exists()) return false;

        const purchase = purchaseDoc.data() as Purchase;

        // Check if there are uses remaining
        if (purchase.usedCount !== undefined && purchase.maxUses !== undefined) {
            if (purchase.usedCount >= purchase.maxUses) {
                return false; // No uses remaining
            }

            // Increment used count
            await updateDoc(purchaseRef, {
                usedCount: purchase.usedCount + 1
            });

            return true;
        }

        return false;
    } catch (error) {
        console.error('Error using booster:', error);
        return false;
    }
};
/**
 * Get all boosters owned by a user
 */
export const getUserBoosters = async (userId: string): Promise<Purchase[]> => {
    try {
        const purchasesRef = collection(db, `users/${userId}/purchases`);
        // We can't easily filter by category since it's not on the purchase record,
        // so we'll fetch all and filter or just fetch items that have maxUses
        const querySnapshot = await getDocs(purchasesRef);
        return querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Purchase))
            .filter(p => p.maxUses !== undefined);
    } catch (error) {
        console.error('Error fetching user boosters:', error);
        return [];
    }
};

/**
 * Get active hint pack for a user
 */
export const getUserHintPack = async (userId: string): Promise<Purchase | null> => {
    try {
        const boosters = await getUserBoosters(userId);
        // Find the one named "Hint Pack" with uses remaining
        return boosters.find(b =>
            b.itemName === 'Hint Pack' &&
            b.usedCount !== undefined &&
            b.maxUses !== undefined &&
            b.usedCount < b.maxUses
        ) || null;
    } catch (error) {
        console.error('Error fetching user hint pack:', error);
        return null;
    }
};

/**
 * Get active multiplier booster for a user (2x or 3x)
 */
export const getActiveMultiplier = async (userId: string): Promise<{ multiplier: number; purchaseId: string } | null> => {
    try {
        const boosters = await getUserBoosters(userId);
        // Find multiplier boosters with uses remaining
        const multiplierBooster = boosters.find(b =>
            (b.itemName.includes('Multiplier') || b.itemName.includes('multiplier')) &&
            b.usedCount !== undefined &&
            b.maxUses !== undefined &&
            b.usedCount < b.maxUses
        );
        
        if (!multiplierBooster) return null;
        
        // Get the shop item to find multiplier value
        const itemRef = doc(db, 'shopItems', multiplierBooster.itemId);
        const itemDoc = await getDoc(itemRef);
        if (!itemDoc.exists()) return null;
        
        const item = itemDoc.data() as ShopItem;
        const multiplier = item.metadata?.multiplier || 1;
        
        return { multiplier, purchaseId: multiplierBooster.id };
    } catch (error) {
        console.error('Error fetching active multiplier:', error);
        return null;
    }
};

/**
 * Get active time extension booster
 */
export const getActiveTimeExtension = async (userId: string): Promise<{ extraSeconds: number; purchaseId: string } | null> => {
    try {
        const boosters = await getUserBoosters(userId);
        // Find time extension booster with uses remaining
        const timeBooster = boosters.find(b =>
            b.itemName.includes('Time Extension') &&
            b.usedCount !== undefined &&
            b.maxUses !== undefined &&
            b.usedCount < b.maxUses
        );
        
        if (!timeBooster) return null;
        
        // Time Extension adds 30 seconds per use
        return { extraSeconds: 30, purchaseId: timeBooster.id };
    } catch (error) {
        console.error('Error fetching time extension:', error);
        return null;
    }
};
