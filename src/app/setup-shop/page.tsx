'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { initializeShopItems } from '@/lib/initializeShop';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function SetupShopPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleInitialize = async () => {
        setStatus('loading');
        setMessage('Adding shop items to database...');

        try {
            const result = await initializeShopItems();

            if (result.success) {
                setStatus('success');
                setMessage(`Successfully added ${result.count} items to the shop!`);
            } else {
                setStatus('error');
                setMessage('Failed to initialize shop items. Check console for errors.');
            }
        } catch (error) {
            setStatus('error');
            setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error('Shop initialization error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Shop Setup</h1>
                <p className="text-muted-foreground mb-8">Initialize your coin shop with sample items</p>

                <Card>
                    <CardHeader>
                        <CardTitle>Initialize Shop Items</CardTitle>
                        <CardDescription>
                            This will add 13 sample items to your shop across 3 categories:
                            Boosters, Visual Customizations, and Profile Items
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={handleInitialize}
                            disabled={status === 'loading' || status === 'success'}
                            className="w-full"
                            size="lg"
                        >
                            {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {status === 'success' && <CheckCircle2 className="mr-2 h-4 w-4" />}
                            {status === 'idle' && 'Initialize Shop Items'}
                            {status === 'loading' && 'Initializing...'}
                            {status === 'success' && 'Shop Initialized!'}
                            {status === 'error' && 'Try Again'}
                        </Button>

                        {message && (
                            <div className={`p-4 rounded-lg flex items-start gap-3 ${status === 'success' ? 'bg-green-50 text-green-900 border border-green-200' :
                                    status === 'error' ? 'bg-red-50 text-red-900 border border-red-200' :
                                        'bg-blue-50 text-blue-900 border border-blue-200'
                                }`}>
                                {status === 'success' && <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />}
                                {status === 'error' && <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
                                {status === 'loading' && <Loader2 className="h-5 w-5 flex-shrink-0 mt-0.5 animate-spin" />}
                                <div>
                                    <p className="font-medium">{message}</p>
                                    {status === 'success' && (
                                        <p className="text-sm mt-1">
                                            You can now go back to the Dashboard and click the Shop tab to see all items!
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="space-y-2 pt-4 border-t">
                                <h3 className="font-semibold">What was added:</h3>
                                <ul className="text-sm space-y-1 text-muted-foreground">
                                    <li>🔥 4 Booster items (200-1000 coins)</li>
                                    <li>🎨 4 Visual theme items (300-800 coins)</li>
                                    <li>👑 5 Profile customization items (600-2000 coins)</li>
                                </ul>
                                <Button
                                    variant="outline"
                                    className="w-full mt-4"
                                    onClick={() => window.location.href = '/'}
                                >
                                    Go to Dashboard →
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
