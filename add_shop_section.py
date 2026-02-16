import re

# Read the Dashboard.tsx file
with open('src/components/Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Shop section to insert
shop_section = '''
          <TabsContent value="shop" className="mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold font-headline text-foreground/90 mb-2">
                Coin Shop 🛒
              </h2>
              <p className="text-muted-foreground">
                Spend your hard-earned coins on exciting goodies and power-ups!
              </p>
            </div>
            <ShopTab userData={userData} onPurchaseComplete={async () => {
              if (user) {
                const updatedUserData = await getUserData(user.uid);
                const updatedTransactions = await getTransactions(user.uid);
                setUserData(updatedUserData);
                setTransactions(updatedTransactions);
              }
            }} />
          </TabsContent>
'''

# Find the insertion point (after badges TabsContent and before analytics TabsContent)
pattern = r'(</TabsContent>\s*\n\s*\n)(\s*<TabsContent value="analytics")'
replacement = r'\1' + shop_section + r'\2'

# Replace
new_content = re.sub(pattern, replacement, content)

# Write back
with open('src/components/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Shop section added successfully!")
