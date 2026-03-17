'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Presentation,
  Link as LinkIcon,
  Trash2,
  ExternalLink,
  Plus,
  Loader2,
  File,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  saveStudyMaterial,
  getUserMaterials,
  deleteStudyMaterial,
  StudyMaterial,
  MaterialFormat,
  MaterialResourceType,
} from '@/lib/materialsFirebase';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function StudyMaterialsTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [viewingMaterial, setViewingMaterial] = useState<StudyMaterial | null>(null);

  // Link upload state
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');

  const loadMaterials = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const data = await getUserMaterials(user.uid);
      setMaterials(data);
    } catch (error) {
      console.error('Error loading materials:', error);
      toast({ title: 'Error', description: 'Failed to load study materials.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => { loadMaterials(); }, [loadMaterials]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
  };
  const triggerFileSelect = () => fileInputRef.current?.click();

  const getFormatAndResourceType = (file: File): { format: MaterialFormat; resourceType: MaterialResourceType } => {
    const type = file.type;
    const name = file.name.toLowerCase();
    if (type.startsWith('image/')) return { format: 'image', resourceType: 'image' };
    if (type === 'application/pdf' || name.endsWith('.pdf')) return { format: 'pdf', resourceType: 'raw' };
    if (
      type === 'application/vnd.ms-powerpoint' ||
      type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      name.endsWith('.ppt') || name.endsWith('.pptx')
    ) return { format: 'ppt', resourceType: 'raw' };
    return { format: 'pdf', resourceType: 'raw' };
  };

  const handleFileUpload = async (file: File) => {
    if (!user?.uid) return;
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please upload files smaller than 20MB.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const { format, resourceType } = getFormatAndResourceType(file);
      const timestamp = Math.round(Date.now() / 1000);
      const paramsToSign = { timestamp, folder: `studify_materials/${user.uid}` };

      const signRes = await fetch('/api/cloudinary-sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paramsToSign }),
      });
      if (!signRes.ok) throw new Error('Failed to get upload signature');
      const { signature } = await signRes.json();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', `studify_materials/${user.uid}`);
      formData.append('resource_type', resourceType);

      const cloudinaryName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryName}/${resourceType}/upload`;
      const uploadRes = await fetch(uploadUrl, { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error?.message || 'Upload failed');

      const newMaterial = await saveStudyMaterial(user.uid, {
        url: uploadData.secure_url,
        name: file.name,
        format,
        resourceType,
        size: file.size,
      });

      setMaterials(prev => [newMaterial, ...prev]);
      toast({ title: 'Upload successful', description: 'Your study material has been saved.' });
    } catch (error) {
      console.error('Upload Error:', error);
      toast({ title: 'Upload failed', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveLink = async () => {
    if (!user?.uid || !linkUrl.trim()) return;
    try { new URL(linkUrl); } catch {
      toast({ title: 'Invalid URL', description: 'Please enter a valid website link.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const newMaterial = await saveStudyMaterial(user.uid, {
        url: linkUrl,
        name: linkName.trim() || linkUrl,
        format: 'link',
        resourceType: 'link',
      });
      setMaterials(prev => [newMaterial, ...prev]);
      setShowLinkInput(false);
      setLinkUrl('');
      setLinkName('');
      toast({ title: 'Link saved', description: 'Your external study link has been added.' });
    } catch (error) {
      console.error('Save Link Error:', error);
      toast({ title: 'Save failed', description: 'Could not save the link.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.uid) return;
    const material = materials.find(m => m.id === id);
    try {
      // Delete from Cloudinary first (skip for external links which have no Cloudinary file)
      if (material && material.resourceType !== 'link') {
        try {
          await fetch('/api/cloudinary-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: material.url, resourceType: material.resourceType }),
          });
        } catch (cloudinaryError) {
          // Log but don't block — still remove from Firestore
          console.warn('Could not delete from Cloudinary:', cloudinaryError);
        }
      }

      await deleteStudyMaterial(user.uid, id);
      setMaterials(prev => prev.filter(m => m.id !== id));
      if (viewingMaterial?.id === id) setViewingMaterial(null);
      toast({ title: 'Deleted', description: 'The material was removed.' });
    } catch (error) {
      console.error('Delete Error:', error);
      toast({ title: 'Deletion failed', description: 'Could not delete the material.', variant: 'destructive' });
    }
  };

  const handleOpenMaterial = (material: StudyMaterial) => {
    if (material.format === 'image') {
      setViewingMaterial(material);
    } else if (material.format === 'pdf') {
      window.open(`/api/pdf-proxy?url=${encodeURIComponent(material.url)}`, '_blank', 'noopener noreferrer');
    } else {
      window.open(material.url, '_blank', 'noopener noreferrer');
    }
  };

  const getFormatIcon = (format: MaterialFormat) => {
    switch (format) {
      case 'pdf': return <FileText className="h-8 w-8 text-rose-500" />;
      case 'ppt': return <Presentation className="h-8 w-8 text-amber-500" />;
      case 'image': return <ImageIcon className="h-8 w-8 text-emerald-500" />;
      case 'link': return <LinkIcon className="h-8 w-8 text-primary" />;
      default: return <File className="h-8 w-8 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-8">

      {/* ── Inline Image Viewer Modal ── */}
      <Dialog open={!!viewingMaterial} onOpenChange={(open) => !open && setViewingMaterial(null)}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] bg-card border border-border rounded-[2rem] p-0 overflow-hidden flex flex-col gap-0">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-border flex-row items-center gap-3 shrink-0 space-y-0">
            {viewingMaterial && getFormatIcon(viewingMaterial.format)}
            <DialogTitle className="text-base font-black uppercase tracking-tight text-foreground truncate flex-1">
              {viewingMaterial?.name}
            </DialogTitle>
            <a
              href={viewingMaterial?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl hover:bg-muted/60 transition-colors text-muted-foreground hover:text-primary shrink-0"
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </DialogHeader>

          {/* Viewer body */}
          <div className="flex-1 min-h-0 bg-muted/20">
            {viewingMaterial?.format === 'image' && (
              <div className="relative w-full h-full">
                <Image
                  src={viewingMaterial.url}
                  alt={viewingMaterial.name}
                  fill
                  className="object-contain"
                  sizes="90vw"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Upload & Add Section ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* File Upload Dropzone */}
        <div
          onClick={triggerFileSelect}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "group relative flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-[2rem] border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden",
            isDragging ? "border-primary bg-primary/10 scale-[1.02]" : "border-border bg-card/50 hover:bg-card hover:border-primary/50",
            uploading && "opacity-50 pointer-events-none"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".pdf,.ppt,.pptx,image/*" />

          {uploading ? (
            <div className="flex flex-col items-center gap-4 relative z-10">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-sm font-black uppercase tracking-widest text-primary animate-pulse">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 relative z-10">
              <div className="p-4 rounded-3xl bg-primary/10 group-hover:bg-primary/20 transition-colors group-hover:scale-110 duration-500">
                <UploadCloud className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-foreground mb-1">Upload Material</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Drag &amp; drop or click to browse</p>
              </div>
              <div className="flex gap-3 mt-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-muted/60 px-2 py-1 rounded-md text-muted-foreground">PDF</span>
                <span className="text-[10px] font-black uppercase tracking-widest bg-muted/60 px-2 py-1 rounded-md text-muted-foreground">Images</span>
                <span className="text-[10px] font-black uppercase tracking-widest bg-muted/60 px-2 py-1 rounded-md text-muted-foreground">PPT</span>
              </div>
            </div>
          )}
        </div>

        {/* Save External Link Panel */}
        <div className="flex flex-col justify-center bg-card/50 border border-border rounded-[2rem] p-8 gap-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-bl from-accent/5 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-2xl text-accent"><LinkIcon className="h-6 w-6" /></div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-foreground">Save External Link</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Keep web resources organized</p>
            </div>
          </div>

          {!showLinkInput ? (
            <Button onClick={() => setShowLinkInput(true)} className="w-full h-14 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border text-foreground font-black uppercase tracking-widest transition-all duration-300 relative z-10" variant="outline">
              <Plus className="h-4 w-4 mr-2" /> Add URL
            </Button>
          ) : (
            <div className="space-y-4 relative z-10 animate-in fade-in slide-in-from-top-4">
              <Input placeholder="https://..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="h-12 bg-background border-border rounded-xl" />
              <Input placeholder="Link Title (Optional)" value={linkName} onChange={(e) => setLinkName(e.target.value)} className="h-12 bg-background border-border rounded-xl" />
              <div className="flex gap-2">
                <Button onClick={handleSaveLink} disabled={uploading || !linkUrl} className="flex-1 h-12 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-black uppercase tracking-widest">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
                <Button onClick={() => { setShowLinkInput(false); setLinkUrl(''); setLinkName(''); }} variant="ghost" className="h-12 w-12 rounded-xl hover:bg-muted/60 shrink-0">✕</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Materials Grid ── */}
      <div className="space-y-6">
        <h3 className="text-xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
          Your Library
          <span className="text-xs px-2 py-0.5 bg-muted/60 rounded-full text-muted-foreground">{materials.length}</span>
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-3xl bg-card border border-border animate-pulse" />)}
          </div>
        ) : materials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card/30 rounded-[3rem] border border-border border-dashed">
            <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h4 className="text-lg font-black uppercase tracking-tight text-muted-foreground/50">Your library is empty</h4>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 mt-2">Upload files or save links to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {materials.map((material) => (
              <div key={material.id} className="group flex items-center gap-4 bg-card hover:bg-card/80 border border-border hover:border-primary/30 p-4 rounded-3xl transition-all duration-300 shadow-sm hover:shadow-md">
                <button onClick={() => handleOpenMaterial(material)} className="p-3 bg-muted/40 rounded-2xl shrink-0 group-hover:scale-110 transition-transform hover:bg-muted/70">
                  {getFormatIcon(material.format)}
                </button>

                <div className="flex-1 min-w-0 pr-2">
                  <button onClick={() => handleOpenMaterial(material)} className="text-left w-full">
                    <h4 className="font-bold text-sm text-foreground truncate hover:text-primary transition-colors">{material.name}</h4>
                  </button>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-sm">{material.format}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/50">{material.createdAt.toDate().toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenMaterial(material)}
                    className="p-2 hover:bg-primary/10 rounded-xl transition-colors text-muted-foreground hover:text-primary"
                    title={material.format === 'link' || material.format === 'ppt' ? 'Open link' : 'View file'}
                  >
                    {material.format === 'link' || material.format === 'ppt'
                      ? <ExternalLink className="h-4 w-4" />
                      : <Eye className="h-4 w-4" />}
                  </button>
                  <button onClick={() => handleDelete(material.id)} className="p-2 hover:bg-rose-500/20 rounded-xl transition-colors text-muted-foreground hover:text-rose-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
