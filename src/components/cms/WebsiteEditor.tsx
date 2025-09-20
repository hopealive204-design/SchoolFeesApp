import React, { useState, useRef } from 'react';
import { PlatformConfig, Feature, LandingPageSection, Testimonial } from '../../types';
import { HeroSection, FeaturesSection, TestimonialsSection, PricingSection, CTASection, BlogSection } from '../LandingPage';

interface WebsiteEditorProps {
    platformConfig: PlatformConfig;
    setPlatformConfig: (action: React.SetStateAction<PlatformConfig>) => Promise<void>;
}

const EditorSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <details className="bg-white border rounded-lg group" open>
        <summary className="p-3 font-semibold cursor-pointer flex justify-between items-center">
            {title}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-open:rotate-180"><path d="m6 9 6 6 6-6"/></svg>
        </summary>
        <div className="p-4 border-t animate-fade-in space-y-4">
            {children}
        </div>
    </details>
);

const handleFileUpload = (file: File, callback: (base64: string) => void) => {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            callback(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
};

const ImageUploader: React.FC<{ label: string, imageUrl?: string, onImageSelect: (base64: string) => void, onRemove: () => void }> = ({ label, imageUrl, onImageSelect, onRemove }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 flex items-center space-x-4 p-2 border rounded-lg">
            {imageUrl ? <img src={imageUrl} alt="preview" className="w-16 h-10 object-cover rounded" /> : <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>}
            <div className="flex-grow">
                <input type="file" accept="image/*" onChange={e => e.target.files && handleFileUpload(e.target.files[0], onImageSelect)} className="text-xs" />
                {imageUrl && <button onClick={onRemove} className="text-xs text-red-500 hover:underline mt-1">Remove</button>}
            </div>
        </div>
    </div>
);


const HeroEditor: React.FC<{ hero: PlatformConfig['websiteContent']['hero'], onUpdate: (data: PlatformConfig['websiteContent']['hero']) => void }> = ({ hero, onUpdate }) => (
    <>
        <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" value={hero.title} onChange={e => onUpdate({ ...hero, title: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Subtitle</label>
            <textarea rows={3} value={hero.subtitle} onChange={e => onUpdate({ ...hero, subtitle: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <ImageUploader 
            label="Background Image" 
            imageUrl={hero.backgroundImageUrl}
            onImageSelect={base64 => onUpdate({ ...hero, backgroundImageUrl: base64 })}
            onRemove={() => onUpdate({ ...hero, backgroundImageUrl: undefined })}
        />
    </>
);

const FeaturesEditor: React.FC<{ features: Feature[], onUpdate: (data: Feature[]) => void }> = ({ features, onUpdate }) => {
    const handleFeatureUpdate = (id: string, field: keyof Omit<Feature, 'id'|'icon'>, value: any) => {
        onUpdate(features.map(f => f.id === id ? { ...f, [field]: value } : f));
    };

    return (
        <>
            {features.map(feature => (
                <div key={feature.id} className="p-3 border rounded-lg space-y-2 bg-gray-50/50">
                     <h5 className="font-semibold text-sm">{feature.title}</h5>
                     <div>
                        <label className="block text-xs font-medium text-gray-600">Title</label>
                        <input type="text" value={feature.title} onChange={e => handleFeatureUpdate(feature.id, 'title', e.target.value)} className="mt-1 block w-full p-1 border border-gray-300 rounded-md shadow-sm text-sm"/>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Description</label>
                        <textarea rows={2} value={feature.description} onChange={e => handleFeatureUpdate(feature.id, 'description', e.target.value)} className="mt-1 block w-full p-1 border border-gray-300 rounded-md shadow-sm text-sm"/>
                    </div>
                    <ImageUploader 
                        label="Feature Image" 
                        imageUrl={feature.imageUrl}
                        onImageSelect={base64 => handleFeatureUpdate(feature.id, 'imageUrl', base64)}
                        onRemove={() => handleFeatureUpdate(feature.id, 'imageUrl', undefined)}
                    />
                </div>
            ))}
        </>
    );
};

const TestimonialsEditor: React.FC<{ data: PlatformConfig['websiteContent']['testimonials'], onUpdate: (data: PlatformConfig['websiteContent']['testimonials']) => void }> = ({ data, onUpdate }) => {
    const handleItemUpdate = (index: number, field: keyof Testimonial, value: string) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        onUpdate({ ...data, items: newItems });
    };

    return (
        <>
            <div>
                <label className="block text-sm font-medium text-gray-700">Section Title</label>
                <input type="text" value={data.title} onChange={e => onUpdate({ ...data, title: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
            {data.items.map((item, index) => (
                 <div key={index} className="p-3 border rounded-lg space-y-2 bg-gray-50/50">
                    <label className="block text-xs font-medium text-gray-600">Quote</label>
                    <textarea rows={3} value={item.quote} onChange={e => handleItemUpdate(index, 'quote', e.target.value)} className="mt-1 block w-full p-1 border text-sm"/>
                    <label className="block text-xs font-medium text-gray-600">Name</label>
                    <input type="text" value={item.name} onChange={e => handleItemUpdate(index, 'name', e.target.value)} className="mt-1 block w-full p-1 border text-sm"/>
                    <label className="block text-xs font-medium text-gray-600">Title</label>
                    <input type="text" value={item.title} onChange={e => handleItemUpdate(index, 'title', e.target.value)} className="mt-1 block w-full p-1 border text-sm"/>
                </div>
            ))}
        </>
    );
}

const CTAEditor: React.FC<{ cta: PlatformConfig['websiteContent']['cta'], onUpdate: (data: PlatformConfig['websiteContent']['cta']) => void }> = ({ cta, onUpdate }) => (
    <>
        <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" value={cta.title} onChange={e => onUpdate({ ...cta, title: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Subtitle</label>
            <input type="text" value={cta.subtitle} onChange={e => onUpdate({ ...cta, subtitle: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Button Text</label>
            <input type="text" value={cta.buttonText} onChange={e => onUpdate({ ...cta, buttonText: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
    </>
);

const GeneralSiteEditor: React.FC<{
    content: Pick<PlatformConfig['websiteContent'], 'siteTitle' | 'logoUrl' | 'whatsappNumber' | 'menuItems'>,
    onUpdate: (data: any) => void
}> = ({ content, onUpdate }) => {
    const handleMenuItemChange = (index: number, field: 'text' | 'link', value: string) => {
        const newItems = [...content.menuItems];
        newItems[index] = { ...newItems[index], [field]: value };
        onUpdate({ menuItems: newItems });
    };
    
    return (
        <>
             <div>
                <label className="block text-sm font-medium text-gray-700">Site Title</label>
                <input type="text" value={content.siteTitle} onChange={e => onUpdate({ siteTitle: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                <input type="text" value={content.whatsappNumber || ''} onChange={e => onUpdate({ whatsappNumber: e.target.value })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
            <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Navigation Menu</h4>
                {content.menuItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center p-2 bg-gray-50/50 rounded-md">
                        <input type="text" placeholder="Text" value={item.text} onChange={e => handleMenuItemChange(index, 'text', e.target.value)} className="w-full p-1 border text-sm"/>
                        <input type="text" placeholder="Link (e.g., #features)" value={item.link} onChange={e => handleMenuItemChange(index, 'link', e.target.value)} className="w-full p-1 border text-sm"/>
                    </div>
                ))}
            </div>
        </>
    )
};


const WebsiteEditor: React.FC<WebsiteEditorProps> = ({ platformConfig, setPlatformConfig }) => {
    const [localContent, setLocalContent] = useState(platformConfig.websiteContent);
    const [activeEditor, setActiveEditor] = useState<'Sections' | 'Content'>('Content');
    const [isSaving, setIsSaving] = useState(false);

    const dragItem = useRef<LandingPageSection['id'] | null>(null);
    const dragOverItem = useRef<LandingPageSection['id'] | null>(null);

    const handleDragStart = (section: LandingPageSection['id']) => dragItem.current = section;
    const handleDragEnter = (section: LandingPageSection['id']) => dragOverItem.current = section;
    
    const handleDragEnd = () => {
        if (dragItem.current && dragOverItem.current && dragItem.current !== dragOverItem.current) {
            const newSectionOrder = [...localContent.sectionOrder];
            const dragItemIndex = newSectionOrder.indexOf(dragItem.current);
            const dragOverItemIndex = newSectionOrder.indexOf(dragOverItem.current);
            const [reorderedItem] = newSectionOrder.splice(dragItemIndex, 1);
            newSectionOrder.splice(dragOverItemIndex, 0, reorderedItem);
            setLocalContent(prev => ({ ...prev, sectionOrder: newSectionOrder as any }));
        }
        dragItem.current = null;
        dragOverItem.current = null;
    };


    const handleUpdate = (data: Partial<PlatformConfig['websiteContent']>) => {
        setLocalContent(prev => ({ ...prev, ...data }));
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await setPlatformConfig(prev => ({...prev, websiteContent: localContent }));
            alert('Website content saved successfully!');
        } catch (error) {
            console.error('Failed to save website content:', error);
            alert(`Error: Failed to save content. ${(error as Error).message}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    const dummyHandler = () => {};

    return (
        <div className="flex bg-gray-100 rounded-lg shadow-inner" style={{ height: 'calc(100vh - 200px)' }}>
            <div className="w-2/3 bg-white overflow-hidden relative shadow-md rounded-l-lg">
                <div className="absolute inset-0 overflow-y-auto">
                    <div className="origin-top-left transform scale-[0.6] sm:scale-[0.7] md:scale-[0.8]" style={{ width: '125%', height: '125%' }}>
                        {(localContent.sectionOrder || []).map(sectionId => {
                            switch (sectionId) {
                                case 'hero': return <HeroSection key="hero" hero={localContent.hero} onSignUpClick={dummyHandler} previewMode={true} />;
                                case 'features': return <FeaturesSection key="features" features={localContent.features} />;
                                case 'blog': return <BlogSection key="blog" blogPosts={platformConfig.blogPosts} />;
                                case 'testimonials': return <TestimonialsSection key="testimonials" testimonials={localContent.testimonials} />;
                                case 'pricing': return <PricingSection key="pricing" plans={platformConfig.pricingPlans} onSignUpClick={dummyHandler} />;
                                case 'cta': return <CTASection key="cta" cta={localContent.cta} onSignUpClick={dummyHandler} />;
                                case 'howItWorks': return <div key="howItWorks" className="p-8 text-center bg-gray-200">"How It Works" Section Placeholder</div>;
                                default: return null;
                            }
                        })}
                    </div>
                </div>
            </div>

            <div className="w-1/3 p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <h3 className="text-xl font-bold text-secondary">Website Editor</h3>
                    <button onClick={handleSave} disabled={isSaving} className="btn btn-primary btn-sm">
                        {isSaving && <span className="loading loading-spinner loading-xs"></span>}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
                <div className="flex border-b mb-2">
                    <button onClick={() => setActiveEditor('Content')} className={`px-4 py-2 text-sm font-medium ${activeEditor === 'Content' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Content</button>
                    <button onClick={() => setActiveEditor('Sections')} className={`px-4 py-2 text-sm font-medium ${activeEditor === 'Sections' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Layout</button>
                </div>

                <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                    {activeEditor === 'Sections' && (
                        <EditorSection title="Section Order">
                            <p className="text-xs text-gray-500 mb-2">Drag and drop to reorder the sections on your landing page.</p>
                            {(localContent.sectionOrder || []).map(sectionId => (
                                <div 
                                    key={sectionId} 
                                    className="bg-white border rounded-lg p-3 flex items-center cursor-move"
                                    draggable
                                    onDragStart={() => handleDragStart(sectionId)}
                                    onDragEnter={() => handleDragEnter(sectionId)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mr-3"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                    <span className="capitalize font-medium">{sectionId}</span>
                                </div>
                            ))}
                        </EditorSection>
                    )}
                     {activeEditor === 'Content' && (
                        <>
                           <EditorSection title="General Site Settings"><GeneralSiteEditor content={localContent} onUpdate={handleUpdate} /></EditorSection>
                           <EditorSection title="Hero Section"><HeroEditor hero={localContent.hero} onUpdate={data => handleUpdate({ hero: data })} /></EditorSection>
                           <EditorSection title="Features Section"><FeaturesEditor features={localContent.features} onUpdate={data => handleUpdate({ features: data })} /></EditorSection>
                           <EditorSection title="Testimonials Section"><TestimonialsEditor data={localContent.testimonials} onUpdate={data => handleUpdate({ testimonials: data })} /></EditorSection>
                           <EditorSection title="Call to Action"><CTAEditor cta={localContent.cta} onUpdate={data => handleUpdate({ cta: data })} /></EditorSection>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WebsiteEditor;
