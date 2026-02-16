import re

# Read the shopFirebase.ts file
with open('src/lib/shopFirebase.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the getShopItems function
old_function = r'''export const getShopItems = async \(\): Promise<ShopItem\[\]> => \{
    try \{
        const shopRef = collection\(db, 'shopItems'\);
        const q = query\(shopRef, orderBy\('category'\), orderBy\('price'\)\);
        const querySnapshot = await getDocs\(q\);

        return querySnapshot\.docs\.map\(doc => \(\{
            id: doc\.id,
            \.\.\.doc\.data\(\)
        \} as ShopItem\)\);
    \} catch \(error\) \{
        console\.error\('Error fetching shop items:', error\);
        return \[\];
    \}
\};'''

new_function = '''export const getShopItems = async (): Promise<ShopItem[]> => {
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
};'''

# Replace
new_content = re.sub(old_function, new_function, content, flags=re.DOTALL)

# Also remove orderBy from imports
new_content = new_content.replace('    orderBy,\r\n', '')

# Write back
with open('src/lib/shopFirebase.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Shop query fixed - removed composite index requirement!")
