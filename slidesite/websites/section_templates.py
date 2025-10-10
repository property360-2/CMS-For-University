"""
Pre-built section templates for the visual editor
Users can pick from these modern website sections
"""

SECTION_TEMPLATES = {
    'hero': {
        'name': 'Hero Section',
        'icon': '🚀',
        'description': 'Large header with title, subtitle, and CTA button',
        'html': '''
            <div class="hero-section" style="text-align: center; padding: 80px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 16px;">
                <h1 style="font-size: 56px; font-weight: bold; margin-bottom: 20px;">Welcome to My Website</h1>
                <p style="font-size: 24px; margin-bottom: 30px; opacity: 0.9;">Build something amazing today</p>
                <a href="#" class="cta-button" style="display: inline-block; background: white; color: #667eea; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 18px;">Get Started</a>
            </div>
        ''',
        'default_styles': {
            'background_type': 'gradient',
            'background_gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'text_color': '#ffffff',
            'button_color': '#ffffff',
            'button_text_color': '#667eea'
        }
    },
    
    'two_column': {
        'name': 'Two Column Text + Image',
        'icon': '📱',
        'description': 'Text on left, image on right',
        'html': '''
            <div class="two-column" style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; padding: 60px 0;">
                <div>
                    <h2 style="font-size: 42px; font-weight: bold; margin-bottom: 20px;">Amazing Features</h2>
                    <p style="font-size: 18px; line-height: 1.8; color: #4b5563;">Create stunning websites with our easy-to-use builder. No coding required. Just drag, drop, and customize.</p>
                    <a href="#" style="display: inline-block; margin-top: 20px; color: #3b82f6; font-weight: 600; text-decoration: none;">Learn More →</a>
                </div>
                <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); aspect-ratio: 4/3; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">
                    🎨
                </div>
            </div>
        ''',
        'default_styles': {
            'layout': 'two_column',
            'gap': '40px'
        }
    },
    
    'three_features': {
        'name': 'Three Feature Cards',
        'icon': '⚡',
        'description': 'Three cards with icons and descriptions',
        'html': '''
            <div class="features-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; padding: 60px 0;">
                <div style="background: #f9fafb; padding: 40px 30px; border-radius: 16px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🚀</div>
                    <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 12px;">Fast</h3>
                    <p style="color: #6b7280; line-height: 1.6;">Lightning-fast performance for your users</p>
                </div>
                <div style="background: #f9fafb; padding: 40px 30px; border-radius: 16px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🎨</div>
                    <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 12px;">Beautiful</h3>
                    <p style="color: #6b7280; line-height: 1.6;">Stunning designs that impress</p>
                </div>
                <div style="background: #f9fafb; padding: 40px 30px; border-radius: 16px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
                    <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 12px;">Secure</h3>
                    <p style="color: #6b7280; line-height: 1.6;">Bank-level security for peace of mind</p>
                </div>
            </div>
        ''',
        'default_styles': {
            'layout': 'three_column'
        }
    },
    
    'testimonial': {
        'name': 'Testimonial / Review',
        'icon': '💬',
        'description': 'Customer testimonial with quote',
        'html': '''
            <div class="testimonial" style="background: #f9fafb; padding: 60px 40px; border-radius: 16px; text-align: center; margin: 40px 0;">
                <div style="font-size: 48px; margin-bottom: 20px;">⭐⭐⭐⭐⭐</div>
                <p style="font-size: 24px; font-style: italic; margin-bottom: 30px; color: #1f2937;">"This is the best website builder I've ever used. Highly recommended!"</p>
                <div style="display: flex; align-items: center; justify-content: center; gap: 16px;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;">JS</div>
                    <div style="text-align: left;">
                        <div style="font-weight: bold; font-size: 18px;">John Smith</div>
                        <div style="color: #6b7280;">CEO, TechCorp</div>
                    </div>
                </div>
            </div>
        ''',
        'default_styles': {
            'background_color': '#f9fafb'
        }
    },
    
    'cta': {
        'name': 'Call-to-Action',
        'icon': '📢',
        'description': 'Centered CTA with button',
        'html': '''
            <div class="cta-section" style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 80px 40px; border-radius: 16px; text-align: center; color: white;">
                <h2 style="font-size: 42px; font-weight: bold; margin-bottom: 20px;">Ready to Get Started?</h2>
                <p style="font-size: 20px; margin-bottom: 30px; opacity: 0.9;">Join thousands of happy customers today</p>
                <a href="#" style="display: inline-block; background: white; color: #3b82f6; padding: 18px 48px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 18px;">Start Free Trial</a>
            </div>
        ''',
        'default_styles': {
            'background_type': 'gradient',
            'background_gradient': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
        }
    },
    
    'stats': {
        'name': 'Statistics / Numbers',
        'icon': '📊',
        'description': 'Show impressive numbers',
        'html': '''
            <div class="stats-section" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; padding: 60px 0; text-align: center;">
                <div>
                    <div style="font-size: 48px; font-weight: bold; color: #3b82f6; margin-bottom: 8px;">10K+</div>
                    <div style="color: #6b7280; font-size: 18px;">Users</div>
                </div>
                <div>
                    <div style="font-size: 48px; font-weight: bold; color: #3b82f6; margin-bottom: 8px;">500+</div>
                    <div style="color: #6b7280; font-size: 18px;">Websites</div>
                </div>
                <div>
                    <div style="font-size: 48px; font-weight: bold; color: #3b82f6; margin-bottom: 8px;">99%</div>
                    <div style="color: #6b7280; font-size: 18px;">Satisfaction</div>
                </div>
                <div>
                    <div style="font-size: 48px; font-weight: bold; color: #3b82f6; margin-bottom: 8px;">24/7</div>
                    <div style="color: #6b7280; font-size: 18px;">Support</div>
                </div>
            </div>
        ''',
        'default_styles': {
            'layout': 'four_column'
        }
    },
    
    'image_gallery': {
        'name': 'Image Gallery',
        'icon': '🖼️',
        'description': 'Grid of images',
        'html': '''
            <div class="gallery" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 40px 0;">
                <div style="aspect-ratio: 1; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">📷</div>
                <div style="aspect-ratio: 1; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">🎨</div>
                <div style="aspect-ratio: 1; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">✨</div>
                <div style="aspect-ratio: 1; background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">🚀</div>
                <div style="aspect-ratio: 1; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">💎</div>
                <div style="aspect-ratio: 1; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">🌟</div>
            </div>
        ''',
        'default_styles': {
            'layout': 'gallery',
            'columns': 3,
            'gap': '20px'
        }
    },
    
    'faq': {
        'name': 'FAQ / Accordion',
        'icon': '❓',
        'description': 'Frequently asked questions',
        'html': '''
            <div class="faq-section" style="padding: 60px 0;">
                <h2 style="font-size: 42px; font-weight: bold; text-align: center; margin-bottom: 40px;">Frequently Asked Questions</h2>
                <div style="max-width: 800px; margin: 0 auto;">
                    <details style="background: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 16px; cursor: pointer;">
                        <summary style="font-weight: bold; font-size: 18px; margin-bottom: 10px;">How does it work?</summary>
                        <p style="color: #6b7280; line-height: 1.6; margin-top: 10px;">Simply sign up, choose a template, and start customizing. It's that easy!</p>
                    </details>
                    <details style="background: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 16px; cursor: pointer;">
                        <summary style="font-weight: bold; font-size: 18px; margin-bottom: 10px;">Is it free?</summary>
                        <p style="color: #6b7280; line-height: 1.6; margin-top: 10px;">Yes! We offer a free plan with all basic features included.</p>
                    </details>
                    <details style="background: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 16px; cursor: pointer;">
                        <summary style="font-weight: bold; font-size: 18px; margin-bottom: 10px;">Can I customize everything?</summary>
                        <p style="color: #6b7280; line-height: 1.6; margin-top: 10px;">Absolutely! Full control over colors, fonts, layouts, and more.</p>
                    </details>
                </div>
            </div>
        ''',
        'default_styles': {}
    },
    
    'pricing': {
        'name': 'Pricing Table',
        'icon': '💰',
        'description': 'Pricing plans comparison',
        'html': '''
            <div class="pricing-section" style="padding: 60px 0;">
                <h2 style="font-size: 42px; font-weight: bold; text-align: center; margin-bottom: 40px;">Choose Your Plan</h2>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; max-width: 1200px; margin: 0 auto;">
                    <div style="background: #f9fafb; padding: 40px 30px; border-radius: 16px; text-align: center;">
                        <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">Free</h3>
                        <div style="font-size: 48px; font-weight: bold; margin-bottom: 20px;">$0<span style="font-size: 18px; color: #6b7280;">/mo</span></div>
                        <ul style="list-style: none; padding: 0; margin-bottom: 30px; text-align: left;">
                            <li style="margin-bottom: 12px;">✅ 1 Website</li>
                            <li style="margin-bottom: 12px;">✅ Basic Templates</li>
                            <li style="margin-bottom: 12px;">✅ Community Support</li>
                        </ul>
                        <a href="#" style="display: block; background: #3b82f6; color: white; padding: 14px; border-radius: 10px; text-decoration: none; font-weight: bold;">Get Started</a>
                    </div>
                    <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 30px; border-radius: 16px; text-align: center; color: white; transform: scale(1.05); box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
                        <div style="background: white; color: #3b82f6; display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 16px;">POPULAR</div>
                        <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">Pro</h3>
                        <div style="font-size: 48px; font-weight: bold; margin-bottom: 20px;">$29<span style="font-size: 18px; opacity: 0.8;">/mo</span></div>
                        <ul style="list-style: none; padding: 0; margin-bottom: 30px; text-align: left;">
                            <li style="margin-bottom: 12px;">✅ Unlimited Websites</li>
                            <li style="margin-bottom: 12px;">✅ Premium Templates</li>
                            <li style="margin-bottom: 12px;">✅ Priority Support</li>
                            <li style="margin-bottom: 12px;">✅ Custom Domain</li>
                        </ul>
                        <a href="#" style="display: block; background: white; color: #3b82f6; padding: 14px; border-radius: 10px; text-decoration: none; font-weight: bold;">Get Started</a>
                    </div>
                    <div style="background: #f9fafb; padding: 40px 30px; border-radius: 16px; text-align: center;">
                        <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">Enterprise</h3>
                        <div style="font-size: 48px; font-weight: bold; margin-bottom: 20px;">$99<span style="font-size: 18px; color: #6b7280;">/mo</span></div>
                        <ul style="list-style: none; padding: 0; margin-bottom: 30px; text-align: left;">
                            <li style="margin-bottom: 12px;">✅ Everything in Pro</li>
                            <li style="margin-bottom: 12px;">✅ White Label</li>
                            <li style="margin-bottom: 12px;">✅ API Access</li>
                            <li style="margin-bottom: 12px;">✅ Dedicated Manager</li>
                        </ul>
                        <a href="#" style="display: block; background: #3b82f6; color: white; padding: 14px; border-radius: 10px; text-decoration: none; font-weight: bold;">Contact Sales</a>
                    </div>
                </div>
            </div>
        ''',
        'default_styles': {}
    },
    
    'contact_form': {
        'name': 'Contact Form',
        'icon': '📧',
        'description': 'Contact form with fields',
        'html': '''
            <div class="contact-section" style="background: #f9fafb; padding: 60px 40px; border-radius: 16px; max-width: 600px; margin: 40px auto;">
                <h2 style="font-size: 36px; font-weight: bold; text-align: center; margin-bottom: 30px;">Get In Touch</h2>
                <form style="display: flex; flex-direction: column; gap: 20px;">
                    <input type="text" placeholder="Your Name" style="padding: 16px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 16px;">
                    <input type="email" placeholder="Your Email" style="padding: 16px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 16px;">
                    <textarea placeholder="Your Message" rows="5" style="padding: 16px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 16px; resize: vertical;"></textarea>
                    <button type="submit" style="background: #3b82f6; color: white; padding: 18px; border: none; border-radius: 10px; font-weight: bold; font-size: 18px; cursor: pointer;">Send Message</button>
                </form>
            </div>
        ''',
        'default_styles': {
            'background_color': '#f9fafb'
        }
    },
    
    'team': {
        'name': 'Team Members',
        'icon': '👥',
        'description': 'Team member cards',
        'html': '''
            <div class="team-section" style="padding: 60px 0;">
                <h2 style="font-size: 42px; font-weight: bold; text-align: center; margin-bottom: 40px;">Meet Our Team</h2>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px;">
                    <div style="text-align: center;">
                        <div style="width: 120px; height: 120px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 36px; font-weight: bold;">JD</div>
                        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">John Doe</h3>
                        <p style="color: #6b7280; margin-bottom: 12px;">CEO & Founder</p>
                        <div style="display: flex; gap: 10px; justify-content: center;">
                            <a href="#" style="color: #3b82f6;">🔗</a>
                            <a href="#" style="color: #3b82f6;">🐦</a>
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <div style="width: 120px; height: 120px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 36px; font-weight: bold;">JS</div>
                        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">Jane Smith</h3>
                        <p style="color: #6b7280; margin-bottom: 12px;">CTO</p>
                        <div style="display: flex; gap: 10px; justify-content: center;">
                            <a href="#" style="color: #3b82f6;">🔗</a>
                            <a href="#" style="color: #3b82f6;">🐦</a>
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <div style="width: 120px; height: 120px; background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 36px; font-weight: bold;">MB</div>
                        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">Mike Brown</h3>
                        <p style="color: #6b7280; margin-bottom: 12px;">Designer</p>
                        <div style="display: flex; gap: 10px; justify-content: center;">
                            <a href="#" style="color: #3b82f6;">🔗</a>
                            <a href="#" style="color: #3b82f6;">🐦</a>
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <div style="width: 120px; height: 120px; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 36px; font-weight: bold;">SD</div>
                        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">Sarah Davis</h3>
                        <p style="color: #6b7280; margin-bottom: 12px;">Marketing</p>
                        <div style="display: flex; gap: 10px; justify-content: center;">
                            <a href="#" style="color: #3b82f6;">🔗</a>
                            <a href="#" style="color: #3b82f6;">🐦</a>
                        </div>
                    </div>
                </div>
            </div>
        ''',
        'default_styles': {}
    },
    
    'video': {
        'name': 'Video Section',
        'icon': '🎬',
        'description': 'Video embed placeholder',
        'html': '''
            <div class="video-section" style="padding: 60px 0;">
                <div style="max-width: 900px; margin: 0 auto; text-align: center;">
                    <h2 style="font-size: 36px; font-weight: bold; margin-bottom: 30px;">Watch Our Story</h2>
                    <div style="aspect-ratio: 16/9; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; font-size: 72px;">
                        ▶️
                    </div>
                    <p style="margin-top: 20px; color: #6b7280;">Click to add your video URL</p>
                </div>
            </div>
        ''',
        'default_styles': {}
    },
}


def get_template(template_key):
    """Get a section template by key"""
    return SECTION_TEMPLATES.get(template_key)


def get_all_templates():
    """Get all available section templates"""
    return SECTION_TEMPLATES