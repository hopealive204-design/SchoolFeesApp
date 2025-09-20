import React, { useState, useEffect } from 'react';
// Fix: Add .ts extension to import path.
import { PlatformConfig, PricingPlan, Testimonial, BlogPost } from '../types.ts';

type LandingPageSectionId = 'hero' | 'features' | 'testimonials' | 'pricing' | 'cta' | 'blog' | 'howItWorks';

interface LandingPageProps {
  platformConfig: PlatformConfig;
  onLoginClick: () => void;
  onSignUpClick: () => void;
}

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg width="40" height="40" viewBox="0 0 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const FloatingWhatsAppButton: React.FC<{ number?: string }> = ({ number }) => {
    if (!number) return null;
    const formattedNumber = number.replace(/[^0-9+]/g, '');
    const whatsappUrl = `https://wa.me/${formattedNumber}`;

    return (
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-green-500 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition-transform transform hover:scale-110 z-50" aria-label="Chat on WhatsApp">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.651 4.383 1.826 6.265l-1.23 4.505 4.577-1.211zM14.02 12.316c-.078-.396-1.097-.624-1.212-.647-.115-.023-1.096-.547-1.266-.607-.17-.06-.294-.09-.419.09-.125.18-.475.607-.584.729-.11.125-.218.14-.418.046-.2-.093-.843-.311-1.604-.994-.593-.53-1-1.175-1.12-1.375-.124-.2-.013-.314.078-.403.082-.081.18-.21.27-.334.09-.125.124-.21.187-.354.063-.14.031-.26-.016-.354-.047-.093-.418-1.004-.572-1.375-.154-.371-.312-.32-.419-.324-.108-.004-.233-.005-.358-.005s-.325.046-.5.225c-.175.18-.651.641-.651 1.566 0 .925.666 1.813.75 1.938.084.125 1.32 2.015 3.2 2.829.422.174.757.278 1.016.354.516.152.975.132 1.325.08.4-.056 1.212-.493 1.383-.967.17-.474.17-.874.118-.967z" /></svg>
        </a>
    );
};

const Header: React.FC<LandingPageProps & { scrolled: boolean }> = ({ platformConfig, onLoginClick, onSignUpClick, scrolled }) => (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-secondary/90 backdrop-blur-sm shadow-lg' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <a href="#" className="flex items-center space-x-2">
                <LogoIcon className="text-white" />
                <span className="text-2xl font-bold text-white">{platformConfig.websiteContent.siteTitle}</span>
            </a>
            <nav className="hidden md:flex items-center space-x-8">
                {platformConfig.websiteContent.menuItems.map(item => (
                    <a key={item.link} href={item.link} className="text-gray-300 hover:text-white transition-colors">{item.text}</a>
                ))}
            </nav>
            <div className="flex items-center space-x-2">
                <button onClick={onLoginClick} className="px-4 py-2 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">Login</button>
                <button onClick={onSignUpClick} className="px-4 py-2 bg-white text-primary font-semibold rounded-lg shadow-md hover:bg-gray-200 transition-colors">Sign Up</button>
            </div>
        </div>
    </header>
);

// Fix: Added export to HeroSection to make it available for import in other files.
export const HeroSection: React.FC<{ hero: PlatformConfig['websiteContent']['hero'], onSignUpClick: () => void, previewMode?: boolean }> = ({ hero, onSignUpClick, previewMode }) => (
    <section className={`relative isolate overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24 bg-secondary text-white ${previewMode ? 'min-h-[600px]' : ''}`} style={{ backgroundImage: hero.backgroundImageUrl ? `url(${hero.backgroundImageUrl})` : '', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 -z-10 bg-secondary/70" />
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-8 items-center relative z-10">
            <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-300">
                    {hero.title}
                </h1>
                <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-xl mx-auto md:mx-0">
                    {hero.subtitle}
                </p>
                <button onClick={onSignUpClick} className="mt-8 px-8 py-4 bg-primary text-white font-bold rounded-lg shadow-lg hover:brightness-110 transform hover:scale-105 transition-all duration-300">
                    Get Started for Free
                </button>
            </div>
            <div className="hidden md:block">
                <img src="https://placehold.co/1200x800/EFEFEF/333333/png?text=Dashboard+Mockup" alt="Dashboard Mockup" className="rounded-lg shadow-2xl transform rotate-3" />
            </div>
        </div>
    </section>
);

const TrustedBy: React.FC<{ logos?: string[] }> = ({ logos }) => {
    if (!logos || logos.length === 0) return null;
    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-6">
                <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider">Trusted by innovative schools across Nigeria</p>
                <div className="mt-6 flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
                    {logos.map((logo, index) => <img key={index} src={logo} alt={`School logo ${index + 1}`} className="h-8 opacity-60" />)}
                </div>
            </div>
        </section>
    );
};

// Fix: Added BlogSection component and exported it to resolve import error in WebsiteEditor.
export const BlogSection: React.FC<{ blogPosts: BlogPost[] }> = ({ blogPosts }) => {
    const publishedPosts = blogPosts.filter(p => p.status === 'Published').slice(0, 3);
    if (publishedPosts.length === 0) return null;

    return (
        <section id="blog" className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl font-bold text-center text-secondary mb-12">From Our Blog</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {publishedPosts.map(post => (
                        <a key={post.id} href={`/blog/${post.slug}`} className="block bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                            {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="rounded-md h-48 w-full object-cover mb-4" />}
                            <h3 className="text-xl font-semibold text-secondary mb-2">{post.title}</h3>
                            <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                            <span className="font-semibold text-primary">Read More &rarr;</span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};


export const FeaturesSection: React.FC<{ features: PlatformConfig['websiteContent']['features'] }> = ({ features }) => (
    <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6 space-y-20">
            {features.map((feature, index) => (
                <div key={feature.id} className="grid md:grid-cols-2 gap-12 items-center fade-in-section">
                    <div className={index % 2 === 1 ? 'md:order-last' : ''}>
                        <div className="inline-flex items-center space-x-2 mb-3">
                            <span className="p-2 bg-primary/10 text-primary rounded-md">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            </span>
                             <h3 className="text-2xl font-bold text-secondary">{feature.title}</h3>
                        </div>
                        <p className="text-gray-600 text-lg">{feature.description}</p>
                    </div>
                     <div>
                        <img src={feature.imageUrl} alt={feature.title} className="rounded-lg shadow-xl" />
                    </div>
                </div>
            ))}
        </div>
    </section>
);

export const HowItWorksSection = () => (
    <section id="howItWorks" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-secondary">Get Started in 3 Simple Steps</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Simplify your school's finances in a matter of minutes.</p>
            <div className="mt-12 grid md:grid-cols-3 gap-8 text-left relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-300 hidden md:block"></div>
                {[
                    { number: '1', title: 'Register Your School', desc: 'Create your school account in under 5 minutes. No payment required for your 7-day trial.' },
                    { number: '2', title: 'Set Up Fees & Students', desc: 'Easily define your fee structure and import your student data with our simple CSV upload tool.' },
                    { number: '3', title: 'Start Collecting Fees', desc: 'Invite parents to the portal and start accepting online payments immediately. Let automation do the rest!' },
                ].map(step => (
                    <div key={step.number} className="bg-white p-6 rounded-lg shadow-md border z-10">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold text-xl mb-4">{step.number}</div>
                        <h3 className="text-xl font-semibold text-secondary mb-2">{step.title}</h3>
                        <p className="text-gray-600">{step.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export const TestimonialsSection: React.FC<{ testimonials: { title: string, items: Testimonial[] } }> = ({ testimonials }) => (
    <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-secondary mb-12">{testimonials.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.items.map((item, index) => (
                    <figure key={index} className="bg-gray-50 p-8 rounded-lg">
                        <blockquote className="border-l-4 border-primary pl-4">
                            <p className="text-lg text-gray-800">"{item.quote}"</p>
                        </blockquote>
                        <figcaption className="mt-6">
                            <div className="text-base text-secondary font-semibold">{item.name}</div>
                            <div className="text-gray-500 text-sm">{item.title}</div>
                        </figcaption>
                    </figure>
                ))}
            </div>
        </div>
    </section>
);

export const PricingSection: React.FC<{ plans: PricingPlan[], onSignUpClick: () => void }> = ({ plans, onSignUpClick }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    return (
        <section id="pricing" className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl font-bold text-center text-secondary mb-4">Simple, Transparent Pricing</h2>
                <p className="text-center text-gray-600 mb-8">Choose the plan that's right for your school. Save up with yearly billing.</p>
                <div className="flex justify-center items-center space-x-4 mb-12">
                    <span className={`font-semibold ${billingCycle === 'monthly' ? 'text-primary' : 'text-gray-500'}`}>Monthly</span>
                    <input type="checkbox" className="toggle toggle-primary" checked={billingCycle === 'yearly'} onChange={() => setBillingCycle(p => p === 'monthly' ? 'yearly' : 'monthly')} />
                    <span className={`font-semibold ${billingCycle === 'yearly' ? 'text-primary' : 'text-gray-500'}`}>Yearly</span>
                </div>
                <div className="flex flex-wrap justify-center items-stretch gap-8">
                    {plans.map(plan => {
                        const isPopular = plan.name === 'Advanced';
                        const price = billingCycle === 'yearly' ? plan.prices.yearly : plan.prices.monthly;
                        return (
                             <div key={plan.id} className={`border rounded-lg p-8 w-full max-w-sm flex flex-col shadow-sm relative ${isPopular ? 'border-primary border-2' : 'border-gray-200'}`}>
                                {isPopular && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>}
                                <h3 className="text-2xl font-semibold text-secondary">{plan.name}</h3>
                                <p className="mt-4"><span className="text-4xl font-bold text-secondary">₦{price.toLocaleString()}</span><span className="text-lg font-normal text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span></p>
                                <ul className="mt-6 space-y-4 text-gray-600 flex-grow">
                                    {plan.features.map((feature, i) => (<li key={i} className="flex items-center"><svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg><span>{feature}</span></li>))}
                                </ul>
                                <button onClick={onSignUpClick} className={`mt-8 w-full py-3 font-semibold rounded-lg transition-all ${isPopular ? 'bg-primary text-white hover:brightness-110' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>Get Started</button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    );
};

export const CTASection: React.FC<{ cta: PlatformConfig['websiteContent']['cta'], onSignUpClick: () => void }> = ({ cta, onSignUpClick }) => (
    <section id="cta" className="bg-secondary">
        <div className="container mx-auto px-6 py-16 text-center text-white">
            <h2 className="text-3xl font-bold mb-2">{cta.title}</h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">{cta.subtitle}</p>
            <button onClick={onSignUpClick} className="px-8 py-4 bg-primary text-white font-bold rounded-lg shadow-lg hover:brightness-110 transform hover:scale-105 transition-all duration-300">{cta.buttonText}</button>
        </div>
    </section>
);

const Footer: React.FC<{ siteTitle: string, menuItems: { text: string, link: string }[] }> = ({ siteTitle, menuItems }) => (
    <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-6 py-12">
            <div className="grid md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                    <h3 className="text-xl font-bold">{siteTitle}</h3>
                    <p className="text-gray-400 mt-2 text-sm">Simplifying school finance management across Nigeria.</p>
                </div>
                <div>
                    <h4 className="font-semibold uppercase text-gray-400">Navigate</h4>
                    <ul className="mt-4 space-y-2">
                        {menuItems.map(item => <li key={item.link}><a href={item.link} className="text-gray-300 hover:text-white">{item.text}</a></li>)}
                    </ul>
                </div>
                 <div>
                    <h4 className="font-semibold uppercase text-gray-400">Legal</h4>
                    <ul className="mt-4 space-y-2">
                        <li><a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a></li>
                        <li><a href="#" className="text-gray-300 hover:text-white">Terms of Service</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold uppercase text-gray-400">Contact Us</h4>
                     <ul className="mt-4 space-y-2">
                        <li><a href="mailto:hello@schoolfees.ng" className="text-gray-300 hover:text-white">hello@schoolfees.ng</a></li>
                    </ul>
                </div>
            </div>
            <div className="mt-8 border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} {siteTitle}. All Rights Reserved.</p>
            </div>
        </div>
    </footer>
);


const LandingPage: React.FC<LandingPageProps> = ({ platformConfig, onLoginClick, onSignUpClick }) => {
    const [scrolled, setScrolled] = useState(false);
    const { websiteContent, pricingPlans, blogPosts } = platformConfig;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fix: Change componentMap values to React.ReactElement to avoid JSX namespace error.
    const componentMap: { [key in LandingPageSectionId]?: React.ReactElement | null } = {
        hero: <HeroSection hero={websiteContent.hero} onSignUpClick={onSignUpClick} />,
        features: <FeaturesSection features={websiteContent.features} />,
        howItWorks: <HowItWorksSection />,
        testimonials: <TestimonialsSection testimonials={websiteContent.testimonials} />,
        pricing: <PricingSection plans={pricingPlans} onSignUpClick={onSignUpClick} />,
        cta: <CTASection cta={websiteContent.cta} onSignUpClick={onSignUpClick} />,
        blog: <BlogSection blogPosts={blogPosts} />,
    };

    return (
        <div className="font-sans bg-white">
            <Header platformConfig={platformConfig} onLoginClick={onLoginClick} onSignUpClick={onSignUpClick} scrolled={scrolled} />
            <main>
                <HeroSection hero={websiteContent.hero} onSignUpClick={onSignUpClick} />
                <TrustedBy logos={websiteContent.trustedByLogos} />
                {(websiteContent.sectionOrder || ['features', 'howItWorks', 'testimonials', 'pricing', 'cta']).map(sectionId =>
                    componentMap[sectionId as LandingPageSectionId]
                )}
            </main>
            <Footer siteTitle={websiteContent.siteTitle} menuItems={websiteContent.menuItems} />
            <FloatingWhatsAppButton number={websiteContent.whatsappNumber} />
        </div>
    );
};

export default LandingPage;