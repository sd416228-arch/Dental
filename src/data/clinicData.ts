/**
 * Configurable Clinic Data and Settings for Denta Care
 * Centralized data source to eliminate hardcoded values and allow easy updating.
 */

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  shortDesc: string;
  fullDesc: string;
  duration: string;
  priceFrom: string;
  recommendedFrequency: string;
  iconName: string;
  popular?: boolean;
}

export interface ClinicLocation {
  id: string;
  name: string;
  city: string;
  address: string;
  postalCode: string;
  phone: string;
  email: string;
  hours: string;
  mapEmbedUrl: string;
  googleMapsDirectionsUrl: string;
  isMainBranch?: boolean;
}

export interface DentistProfile {
  id: string;
  name: string;
  role: string;
  qualifications: string;
  gdcNumber: string;
  experienceYears: number;
  specializations: string[];
  bio: string;
  image: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const CLINIC_CONFIG = {
  name: "Denta Care",
  tagline: "EVERY SMILE MATTERS",
  heroBadge: "Our skilled dentists use advanced technology to offer complete care in a comfortable and friendly environment.",
  openingHoursDisplay: "09:30 AM - 07:00 PM",
  daysOpenDisplay: "Sun - Fri",
  emergencyAvailable: true,
  phone: "+97714412345",
  phoneFormatted: "01-4412345",
  whatsappNumber: "9779841234567",
  whatsappFormatted: "+977 9841 234567",
  email: "care@dentacare.com.np",
  stats: {
    dentistsCount: "50+",
    dentistsLabel: "Expert Dentists",
    clinicsCount: "15+",
    clinicsLabel: "Dental Clinics across Nepal",
    countriesCount: "03+",
    countriesLabel: "Regional presence",
  },
  socials: {
    facebook: "https://facebook.com/dentacarenepal",
    instagram: "https://instagram.com/dentacarenepal",
    linkedin: "https://linkedin.com/company/dentacarenepal",
    twitter: "https://twitter.com/dentacarenepal",
  },
};

export const CLINIC_VISIONS = [
  {
    id: 1,
    title: "Our Vision",
    text: "At Denta Care, our vision is to blend advanced technology with compassionate care to create a welcoming space. We aim to inspire confident, healthy smiles through innovation and personalized treatment.",
  },
  {
    id: 2,
    title: "Patient-Centered Comfort",
    text: "We believe visiting the dentist should be stress-free and pain-free. Our gentle techniques, soothing clinics, and transparent treatment plans put you in control of your dental journey.",
  },
  {
    id: 3,
    title: "Pioneering Clinical Excellence",
    text: "From 3D digital imaging to gentle laser scaling, our continuous investment in medical equipment ensures faster healing times, pinpoint accuracy, and long-lasting dental outcomes.",
  },
];

export const SERVICES_LIST: ServiceItem[] = [
  {
    id: "checkup",
    name: "Dental Checkups & Diagnostics",
    category: "Preventative",
    shortDesc: "Comprehensive oral examinations with HD digital X-rays and oral cancer screening.",
    fullDesc: "Our thorough 12-point dental checkup evaluates teeth, gums, jaw joints, and soft tissue. We use ultra-low dose digital radiography to detect early cavities and bone loss before symptoms arise.",
    duration: "30-45 mins",
    priceFrom: "Rs. 500",
    recommendedFrequency: "Every 6 months",
    iconName: "Stethoscope",
    popular: true,
  },
  {
    id: "scaling-cleaning",
    name: "Scaling and Cleaning",
    category: "Hygiene",
    shortDesc: "Advanced ultrasonic plaque removal, stain polishing, and gum pocket therapy.",
    fullDesc: "Professional dental hygiene by experienced dental hygienists. Removes tartar build-up that daily brushing cannot reach, helping prevent gingivitis, bad breath, and periodontal disease.",
    duration: "45 mins",
    priceFrom: "Rs. 1,500",
    recommendedFrequency: "Every 3-6 months",
    iconName: "Sparkles",
    popular: true,
  },
  {
    id: "braces-ortho",
    name: "Braces & Orthodontics",
    category: "Alignment",
    shortDesc: "Discreet clear aligners and modern aesthetic ceramic braces for all ages.",
    fullDesc: "Straighten crooked teeth, close gaps, and correct crossbites with state-of-the-art aligner therapy and precision braces designed for discreet daily wear and quick results.",
    duration: "6-18 months",
    priceFrom: "Rs. 45,000",
    recommendedFrequency: "Custom plan",
    iconName: "Smile",
    popular: true,
  },
  {
    id: "dental-implants",
    name: "Dental Implants",
    category: "Restorative",
    shortDesc: "Permanent titanium and ceramic tooth replacements that look and feel 100% natural.",
    fullDesc: "The gold standard for replacing missing teeth. Precision surgically-placed titanium posts topped with handcrafted porcelain crowns that restore full chewing power and jawbone health.",
    duration: "2-4 visits",
    priceFrom: "Rs. 45,000",
    recommendedFrequency: "Lifetime solution",
    iconName: "Activity",
    popular: true,
  },
  {
    id: "teeth-whitening",
    name: "Teeth Whitening",
    category: "Cosmetics",
    shortDesc: "Enamel-safe in-clinic laser whitening and custom take-home whitening kits.",
    fullDesc: "Brighten your smile up to 8 shades in a single 60-minute appointment. Our pH-balanced whitening formula minimizes sensitivity while erasing tea, coffee, and age stains.",
    duration: "60 mins",
    priceFrom: "Rs. 7,500",
    recommendedFrequency: "Touch-up every 12 months",
    iconName: "Sun",
    popular: true,
  },
  {
    id: "root-canal",
    name: "Root Canal Treatment",
    category: "Endodontics",
    shortDesc: "Painless root therapy using rotary nickel-titanium tools to save your natural tooth.",
    fullDesc: "Eliminate dental infection and severe toothache while preserving your natural tooth root. Conducted under high magnification with local anesthesia for a virtually painless experience.",
    duration: "60-90 mins",
    priceFrom: "Rs. 4,500",
    recommendedFrequency: "Single procedure",
    iconName: "ShieldAlert",
  },
  {
    id: "tooth-extraction",
    name: "Tooth Extraction",
    category: "Oral Surgery",
    shortDesc: "Gentle extractions including wisdom teeth removal with sedation options.",
    fullDesc: "When a tooth is severely broken or impacted, our oral surgeons extract it gently using atraumatic techniques to preserve surrounding bone and accelerate healing.",
    duration: "30-60 mins",
    priceFrom: "Rs. 1,000",
    recommendedFrequency: "As needed",
    iconName: "Zap",
  },
  {
    id: "pediatric-dentistry",
    name: "Pediatric Dentistry",
    category: "Children",
    shortDesc: "Fun, caring, and gentle dental checkups, sealants, and cavity treatments for kids.",
    fullDesc: "We specialize in making our youngest patients feel relaxed, comfortable, and excited about oral hygiene. From fluoride varnishes to fissure sealants, we safeguard developing smiles.",
    duration: "30 mins",
    priceFrom: "Rs. 800",
    recommendedFrequency: "Every 6 months",
    iconName: "HeartHandshake",
  },
  {
    id: "general-dentistry",
    name: "General Dentistry & Fillings",
    category: "General",
    shortDesc: "Tooth-colored composite fillings, bonding, and routine restorative treatments.",
    fullDesc: "Natural-looking mercury-free composite fillings that blend seamlessly into your tooth structure, repairing chips, wear, and cavities with durable ceramic-resin materials.",
    duration: "45 mins",
    priceFrom: "Rs. 1,200",
    recommendedFrequency: "As needed",
    iconName: "ShieldCheck",
  },
];

export const CLINIC_LOCATIONS: ClinicLocation[] = [
  {
    id: "kathmandu-lazimpat",
    name: "Denta Care Kathmandu (Lazimpat HQ)",
    city: "Kathmandu",
    address: "Lazimpat Road, Near Radisson Hotel",
    postalCode: "44600",
    phone: "+977-1-4412345",
    email: "kathmandu@dentacare.com.np",
    hours: "Sun - Fri: 09:30 AM - 07:00 PM, Sat: 10:00 AM - 04:00 PM",
    isMainBranch: true,
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14128.539824495202!2d85.31295!3d27.72085!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb191b29a24687%3A0x6b63f538e788bc27!2sLazimpat%2C%20Kathmandu%2044600!5e0!3m2!1sen!2snp!4v1700000000000!5m2!1sen!2snp",
    googleMapsDirectionsUrl: "https://maps.google.com/?q=Lazimpat+Kathmandu+Nepal",
  },
  {
    id: "lalitpur-jhamsikhel",
    name: "Denta Care Lalitpur (Jhamsikhel)",
    city: "Lalitpur",
    address: "Jhamsikhel Marg, Sanepa-Patan",
    postalCode: "44700",
    phone: "+977-1-5534567",
    email: "lalitpur@dentacare.com.np",
    hours: "Sun - Fri: 09:30 AM - 07:00 PM",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14133.473523425514!2d85.3060!3d27.6800!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb182ffbfb6969%3A0xc47b91d2938a9d04!2sJhamsikhel%2C%20Lalitpur!5e0!3m2!1sen!2snp!4v1700000000000!5m2!1sen!2snp",
    googleMapsDirectionsUrl: "https://maps.google.com/?q=Jhamsikhel+Lalitpur+Nepal",
  },
  {
    id: "pokhara-newroad",
    name: "Denta Care Pokhara (New Road)",
    city: "Pokhara",
    address: "New Road, Near City Center Square",
    postalCode: "33700",
    phone: "+977-61-523456",
    email: "pokhara@dentacare.com.np",
    hours: "Sun - Fri: 09:30 AM - 06:30 PM",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14063.29292850978!2d83.9856!3d28.2163!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399594589d9c2237%3A0xc859b81b2a926d25!2sNew%20Road%2C%20Pokhara!5e0!3m2!1sen!2snp!4v1700000000000!5m2!1sen!2snp",
    googleMapsDirectionsUrl: "https://maps.google.com/?q=New+Road+Pokhara+Nepal",
  },
  {
    id: "chitwan-bharatpur",
    name: "Denta Care Chitwan (Narayangarh)",
    city: "Bharatpur",
    address: "Lions Chowk, Narayangarh, Bharatpur",
    postalCode: "44200",
    phone: "+977-56-523456",
    email: "chitwan@dentacare.com.np",
    hours: "Sun - Fri: 09:30 AM - 06:30 PM",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14157.887258079085!2d84.4250!3d27.6950!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3994fb252655bfd1%3A0x67ee1c8d551e155b!2sNarayangarh%2C%20Bharatpur!5e0!3m2!1sen!2snp!4v1700000000000!5m2!1sen!2snp",
    googleMapsDirectionsUrl: "https://maps.google.com/?q=Lions+Chowk+Narayangarh+Chitwan+Nepal",
  },
];

export const DENTISTS_LIST: DentistProfile[] = [
  {
    id: "dr-sushma-shrestha",
    name: "Dr. Sushma Shrestha",
    role: "Clinical Director & Orthodontist",
    qualifications: "BDS (BPKIHS), MDS Orthodontics (TU), Member NDA",
    gdcNumber: "NMC: 12489",
    experienceYears: 14,
    specializations: ["Clear Aligner Specialist", "Aesthetic Orthodontics", "Interceptive Care"],
    bio: "Dr. Shrestha specializes in digital smile design and clear aligner therapies, having treated over 1,200 successful smile transformations with a gentle touch.",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "dr-manish-adhikari",
    name: "Dr. Manish Adhikari",
    role: "Lead Implantologist & Oral Surgeon",
    qualifications: "BDS (KU), MDS Oral & Maxillofacial Surgery, ICOI Fellow",
    gdcNumber: "NMC: 16842",
    experienceYears: 16,
    specializations: ["Guided Implant Surgery", "Bone Grafting", "All-on-4 Rehabilitation"],
    bio: "Pioneering minimally invasive implant techniques using computer-guided 3D surgical templates for swift recovery times and permanent teeth replacement.",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "dr-anupa-karki",
    name: "Dr. Anupa Karki",
    role: "Senior Endodontist & Restorative Specialist",
    qualifications: "BDS, MDS Conservative Dentistry & Endodontics (BPKIHS)",
    gdcNumber: "NMC: 19521",
    experienceYears: 11,
    specializations: ["Microscopic Root Canals", "Tooth Preservation", "Bio-Ceramic Sealing"],
    bio: "Dedicated to saving natural teeth utilizing dental operating microscopes and gentle apex locator technology to ensure completely painless root canal procedures.",
    image: "https://images.unsplash.com/photo-1594824813576-4d04112e5fa7?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "dr-priya-shakya",
    name: "Dr. Priya Shakya",
    role: "Pediatric & Aesthetic Dentist",
    qualifications: "BDS (TU), Postgrad Cert Pediatric Dentistry",
    gdcNumber: "NMC: 23105",
    experienceYears: 8,
    specializations: ["Pediatric Anxiety Management", "Teeth Whitening", "Composite Bonding"],
    bio: "Renowned for her cheerful, calming presence that puts anxious children and nervous adults at ease right away with tailored gentle dentistry.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
  },
];

export const TESTIMONIALS = [
  {
    id: 1,
    author: "Prashant Thapa",
    city: "Kathmandu",
    treatment: "Clear Aligners & Whitening",
    rating: 5,
    date: "2 weeks ago",
    content: "The team at Denta Care Kathmandu completely transformed my smile! From the initial 3D digital scan to the final appointment, everything was comfortable and painless. Best dental facility in the city.",
  },
  {
    id: 2,
    author: "Bikash Gurung",
    city: "Pokhara",
    treatment: "Dental Implant",
    rating: 5,
    date: "1 month ago",
    content: "I had fractured a front tooth and was nervous about getting an implant. Dr. Adhikari was fantastic — thoroughly explained every step and the result looks 100% like my original tooth.",
  },
  {
    id: 3,
    author: "Alisha Maharjan",
    city: "Lalitpur",
    treatment: "Scaling & Root Canal",
    rating: 5,
    date: "Recent Patient",
    content: "Booking via WhatsApp was super fast and convenient. When I arrived at the Jhamsikhel clinic, the staff were warm and the procedure was completely painless.",
  },
];

export const FAQS_LIST: FaqItem[] = [
  {
    question: "What should I expect during my first dental checkup?",
    answer: "Your initial visit takes about 45 minutes. We review your medical history, perform a comprehensive 12-point examination of teeth and gums, capture low-radiation digital X-rays if needed, and discuss any recommendations with transparent pricing before doing any work.",
    category: "General",
  },
  {
    question: "How does the WhatsApp appointment request work?",
    answer: "When you choose 'Book via WhatsApp', your appointment details (service, preferred date, clinic branch) are automatically pre-formatted into a direct chat message with our reception team. You can send it with a single tap, and our receptionists confirm your slot directly in your chat within clinic hours.",
    category: "Booking",
  },
  {
    question: "Are dental implants and root canals painful?",
    answer: "No. Modern local anesthetics ensure you feel completely numb and pain-free during the procedure. For anxious patients, we also provide twilight conscious sedation so you can remain relaxed throughout your treatment.",
    category: "Treatments",
  },
  {
    question: "Do you offer emergency dental appointments?",
    answer: "Yes, we reserve daily emergency slots across all our clinics for severe toothaches, chipped teeth, trauma, and lost crowns. Call our helpline or send an urgent WhatsApp request for same-day evaluation.",
    category: "Emergency",
  },
  {
    question: "What payment options and plans are available?",
    answer: "We accept all major credit/debit cards, eSewa, Khalti, connectIPS, and bank transfers. We also offer 0% interest monthly installment plans spread across 6 to 12 months for treatments over Rs. 10,000.",
    category: "Payments",
  },
];
