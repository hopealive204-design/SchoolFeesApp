
import React, { useState, useEffect } from 'react';
import { PlatformConfig, PricingPlan, Testimonial, BlogPost } from '../types.ts';

type LandingPageSectionId = 'hero' | 'features' | 'testimonials' | 'pricing' | 'cta' | 'blog' | 'howItWorks';

interface LandingPageProps {
  platformConfig: PlatformConfig;
  onLoginClick: () => void;
  onSignUpClick: () => void;
}

// --- Local SVG Icons and Placeholders for visual flair ---
const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg width="40" height="40" viewBox="0 0 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const FeatureIcon: React.FC<{ type: PlatformConfig['websiteContent']['features'][0]['icon'] }> = ({ type }) => {
    switch(type) {
        case 'Communication': return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>;
        case 'Payments': return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 21z" /></svg>;
        case 'Analytics': return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3M3.75 14.25v-1.5c0-.621.504-1.125 1.125-1.125h15c.621 0 1.125.504 1.125 1.125v1.5m-16.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>;
        default: return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.455-2.456L12.75 18l1.178-.398a3.375 3.375 0 002.455-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.398a3.375 3.375 0 00-2.456 2.456z" /></svg>
    }
};

const DashboardMockupSVG = () => (
    <svg className="rounded-lg shadow-2xl transform rotate-3" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="600" rx="8" fill="#F9FAFB"/>
        <rect x="24" y="24" width="152" height="552" rx="4" fill="#FFFFFF"/>
        <rect x="40" y="40" width="120" height="16" rx="4" fill="#E5E7EB"/>
        <rect x="40" y="72" width="80" height="8" rx="2" fill="#F3F4F6"/>
        <rect x="40" y="88" width="80" height="8" rx="2" fill="#F3F4F6"/>
        <rect x="40" y="104" width="80" height="8" rx="2" fill="#F3F4F6"/>
        <rect x="192" y="24" width="584" height="64" rx="4" fill="#FFFFFF"/>
        <rect x="208" y="40" width="120" height="16" rx="4" fill="#D1D5DB"/>
        <circle cx="752" cy="56" r="16" fill="#E5E7EB"/>
        <rect x="192" y="104" width="184" height="120" rx="4" fill="#FFFFFF"/>
        <rect x="208" y="120" width="80" height="8" rx="2" fill="#D1D5DB"/>
        <rect x="208" y="144" width="120" height="16" rx="4" fill="#4B5563"/>
        <rect x="392" y="104" width="184" height="120" rx="4" fill="#FFFFFF"/>
        <rect x="408" y="120" width="80" height="8" rx="2" fill="#D1D5DB"/>
        <rect x="408" y="144" width="120" height="16" rx="4" fill="#4B5563"/>
        <rect x="592" y="104" width="184" height="120" rx="4" fill="#FFFFFF"/>
        <rect x="608" y="120" width="80" height="8" rx="2" fill="#D1D5DB"/>
        <rect x="608" y="144" width="120" height="16" rx="4" fill="#4B5563"/>
        <rect x="192" y="240" width="584" height="336" rx="4" fill="#FFFFFF"/>
        <rect x="208" y="256" width="120" height="16" rx="4" fill="#E5E7EB"/>
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

// --- Landing Page Sections ---
const Header: React.FC<LandingPageProps & { scrolled: boolean }> = ({ platformConfig, onLoginClick, onSignUpClick, scrolled }) => (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-secondary/90 backdrop-blur-sm shadow-lg' : 'bg-transparent'}`}>
        <div className="navbar container mx-auto px-6">
            <div className="navbar-start">
                 <a href="#" className="flex items-center space-x-2">
                    <LogoIcon className="text-white" />
                    <span className="text-2xl font-bold text-white">{platformConfig.websiteContent.siteTitle}</span>
                </a>
            </div>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 text-white">
                    {platformConfig.websiteContent.menuItems.map(item => (
                        <li key={item.link}><a href={item.link} className="hover:bg-white/10">{item.text}</a></li>
                    ))}
                </ul>
            </div>
            <div className="navbar-end">
                <button onClick={onLoginClick} className="btn btn-ghost text-white">Login</button>
                <button onClick={onSignUpClick} className="btn btn-primary ml-2">Sign Up</button>
            </div>
        </div>
    </header>
);

export const HeroSection: React.FC<{ hero: PlatformConfig['websiteContent']['hero'], onSignUpClick: () => void, previewMode?: boolean }> = ({ hero, onSignUpClick, previewMode }) => (
    <div className={`hero min-h-screen bg-secondary ${previewMode ? '!min-h-[600px]' : ''}`} style={{ backgroundImage: hero.backgroundImageUrl ? `url(${hero.backgroundImageUrl})` : ''}}>
        <div className="hero-overlay bg-opacity-70"></div>
        <div className="hero-content grid md:grid-cols-2 gap-8 items-center text-neutral-content w-full max-w-6xl">
            <div className="max-w-2xl text-center md:text-left">
                <h1 className="mb-5 text-5xl md:text-6xl font-extrabold leading-tight text-white">
                    {hero.title}
                </h1>
                <p className="mb-5 text-lg text-white/80">
                    {hero.subtitle}
                </p>
                <button onClick={onSignUpClick} className="btn btn-primary btn-lg">
                    Get Started for Free
                </button>
            </div>
            <div className="hidden md:block">
                <DashboardMockupSVG />
            </div>
        </div>
    </div>
);

const TrustedBy: React.FC<{ logos?: string[] }> = ({ logos }) => {
    if (!logos || logos.length === 0) return null;
    return (
        <section className="py-12 bg-base-200">
            <div className="container mx-auto px-6">
                <p className="text-center text-sm font-semibold text-base-content/60 uppercase tracking-wider">Trusted by innovative schools across Nigeria</p>
                <div className="mt-6 flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
                    {logos.map((logo, index) => <img key={index} src={logo} alt={`School logo ${index + 1}`} className="h-8 opacity-60" />)}
                </div>
            </div>
        </section>
    );
};

export const BlogSection: React.FC<{ blogPosts: BlogPost[] }> = ({ blogPosts }) => {
    const publishedPosts = blogPosts.filter(p => p.status === 'Published').slice(0, 3);
    if (publishedPosts.length === 0) return null;

    return (
        <section id="blog" className="py-20 bg-base-200">
            <div className="container mx-auto px-6">
                <h2 className="text-4xl font-bold text-center text-secondary mb-12">From Our Blog</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {publishedPosts.map(post => (
                        <a key={post.id} href={`/blog/${post.slug}`} className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow">
                            {post.imageUrl && <figure><img src={post.imageUrl} alt={post.title} className="h-48 w-full object-cover" /></figure>}
                            <div className="card-body">
                                <h3 className="card-title text-secondary">{post.title}</h3>
                                <p className="text-base-content/80 text-sm">{post.excerpt}</p>
                                <div className="card-actions justify-end">
                                    <span className="font-semibold text-primary">Read More &rarr;</span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};


export const FeaturesSection: React.FC<{ features: PlatformConfig['websiteContent']['features'] }> = ({ features }) => (
    <section id="features" className="py-20 bg-base-100">
        <div className="container mx-auto px-6 space-y-20">
            {features.map((feature, index) => (
                <div key={feature.id} className="grid md:grid-cols-2 gap-12 items-center fade-in-section">
                    <div className={index % 2 === 1 ? 'md:order-last' : ''}>
                        <div className="inline-flex items-center space-x-3 mb-3 p-3 bg-primary/10 text-primary rounded-box">
                            <FeatureIcon type={feature.icon} />
                            <h3 className="text-2xl font-bold">{feature.title}</h3>
                        </div>
                        <p className="text-base-content/80 text-lg">{feature.description}</p>
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
    <section id="howItWorks" className="py-20 bg-base-200">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-secondary">Get Started in 3 Simple Steps</h2>
            <p className="mt-4 text-lg text-base-content/70 max-w-2xl mx-auto">Simplify your school's finances in a matter of minutes.</p>
            <div className="mt-12 grid md:grid-cols-3 gap-8 text-left relative">
                <div className="absolute top-12 left-0 w-full h-0.5 bg-base-300 hidden md:block"></div>
                {[
                    { number: '1', title: 'Register Your School', desc: 'Create your school account in under 5 minutes. No payment required for your 7-day trial.' },
                    { number: '2', title: 'Set Up Fees & Students', desc: 'Easily define your fee structure and import your student data with our simple CSV upload tool.' },
                    { number: '3', title: 'Start Collecting Fees', desc: 'Invite parents to the portal and start accepting online payments immediately. Let automation do the rest!' },
                ].map(step => (
                    <div key={step.number} className="card bg-base-100 shadow-md z-10">
                        <div className="card-body">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold text-xl mb-4">{step.number}</div>
                          <h3 className="card-title text-secondary">{step.title}</h3>
                          <p className="text-base-content/80">{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export const TestimonialsSection: React.FC<{ testimonials: { title: string, items: Testimonial[] } }> = ({ testimonials }) => (
    <section id="testimonials" className="py-20 bg-base-100">
        <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center text-secondary mb-12">{testimonials.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.items.map((item, index) => (
                    <div key={index} className="card bg-base-200">
                      <div className="card-body">
                          <p className="text-lg text-base-content">"{item.quote}"</p>
                          <div className="mt-4">
                            <div className="font-semibold text-secondary">{item.name}</div>
                            <div className="text-sm text-base-content/70">{item.title}</div>
                          </div>
                      </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export const PricingSection: React.FC<{ plans: PricingPlan[], onSignUpClick: () => void }> = ({ plans, onSignUpClick }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    return (
        <section id="pricing" className="py-20 bg-base-200">
            <div className="container mx-auto px-6">
                <h2 className="text-4xl font-bold text-center text-secondary mb-4">Simple, Transparent Pricing</h2>
                <p className="text-center text-lg text-base-content/70 mb-8">Choose the plan that's right for your school. Save up with yearly billing.</p>
                <div className="flex justify-center items-center space-x-4 mb-12">
                    <span className={`font-semibold ${billingCycle === 'monthly' ? 'text-primary' : 'text-gray-500'}`}>Monthly</span>
                    <input type="checkbox" className="toggle toggle-primary" checked={billingCycle === 'yearly'} onChange={() => setBillingCycle(p => p === 'monthly' ? 'yearly' : 'monthly')} />
                    <span className={`font-semibold ${billingCycle === 'yearly' ? 'text-primary' : 'text-gray-500'}`}>Yearly</span>
                </div>
                <div className="flex flex-wrap justify-center items-stretch gap-8">
                    {plans.map(plan => {
                        const isPopular = plan.name.toLowerCase() === 'advanced';
                        const price = billingCycle === 'yearly' ? plan.prices.yearly : plan.prices.monthly;
                        return (
                             <div key={plan.id} className={`card w-full max-w-sm bg-base-100 shadow-md ${isPopular ? 'border-2 border-primary' : ''}`}>
                                <div className="card-body p-8">
                                    {isPopular && <div className="badge badge-primary absolute top-0 -translate-y-1/2">MOST POPULAR</div>}
                                    <h3 className="text-2xl font-semibold text-secondary">{plan.name}</h3>
                                    <p className="mt-4"><span className="text-4xl font-bold text-secondary">₦{price.toLocaleString()}</span><span className="text-lg font-normal text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span></p>
                                    <ul className="mt-6 space-y-4 text-gray-600 flex-grow">
                                        {plan.features.map((feature, i) => (<li key={i} className="flex items-center"><svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg><span>{feature}</span></li>))}
                                    </ul>
                                    <div className="card-actions mt-6">
                                       <button onClick={onSignUpClick} className={`btn w-full ${isPopular ? 'btn-primary' : 'btn-outline btn-primary'}`}>Get Started</button>
                                    </div>
                                </div>
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
            <h2 className="text-4xl font-bold mb-2">{cta.title}</h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">{cta.subtitle}</p>
            <button onClick={onSignUpClick} className="btn btn-primary btn-lg">{cta.buttonText}</button>
        </div>
    </section>
);

const Footer: React.FC<{ siteTitle: string, menuItems: { text: string, link: string }[] }> = ({ siteTitle, menuItems }) => (
    <footer className="footer p-10 bg-neutral text-neutral-content">
        <aside>
            <LogoIcon />
            <p className="font-bold text-lg">{siteTitle}</p>
            <p>Simplifying school finance management across Nigeria.</p>
        </aside> 
        <nav>
            <h6 className="footer-title">Navigate</h6> 
             {menuItems.map(item => <a key={item.link} href={item.link} className="link link-hover">{item.text}</a>)}
        </nav> 
        <nav>
            <h6 className="footer-title">Legal</h6> 
            <a className="link link-hover">Terms of use</a>
            <a className="link link-hover">Privacy policy</a>
        </nav> 
        <nav>
            <h6 className="footer-title">Contact</h6> 
            <a href="mailto:hello@schoolfees.ng" className="link link-hover">hello@schoolfees.ng</a>
        </nav>
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
        <div data-theme="light" className="font-sans bg-white">
            <Header platformConfig={platformConfig} onLoginClick={onLoginClick} onSignUpClick={onSignUpClick} scrolled={scrolled} />
            <main>
                {(websiteContent.sectionOrder || ['hero', 'features', 'howItWorks', 'testimonials', 'pricing', 'cta']).map(sectionId =>
                    componentMap[sectionId as LandingPageSectionId]
                )}
            </main>
            <Footer siteTitle={websiteContent.siteTitle} menuItems={websiteContent.menuItems} />
            <FloatingWhatsAppButton number={websiteContent.whatsappNumber} />
        </div>
    );
};

export default LandingPage;
