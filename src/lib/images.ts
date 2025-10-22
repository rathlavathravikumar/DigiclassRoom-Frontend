// Educational Images Configuration for DigiClassroom
// High-quality Unsplash images for educational content

export const educationalImages = {
  hero: {
    background: "photo-1522202176988-66273c2fd55f", // Students collaborating with laptops in modern digital classroom
  },
  features: {
    courses: "photo-1513475382585-d06e58bcb0e0", // Interactive online courses with multimedia content and digital learning materials
    assignments: "photo-1571019613454-1cb2f99b2d8b", // Students collaborating on digital assignments with tablets and modern technology
    tests: "photo-1606761568499-6d2451b23c66", // Virtual classroom with digital testing
    communication: "photo-1531482615713-2afd69097998", // Students communicating and collaborating
    notices: "photo-1507003211169-0a1dd7228f2d", // Digital notice board or announcements
    analytics: "photo-1551288049-bebda4e38f71", // Data analytics and performance tracking
    discussions: "photo-1531482615713-2afd69097998", // Students in collaborative discussions
    attendance: "photo-1523240795612-9a054b0db644", // Attendance tracking and classroom management
  },
  backgrounds: {
    library: "photo-1481627834876-b7833e8f5570", // Modern library with students studying
    classroom: "photo-1523240795612-9a054b0db644", // Modern classroom environment
    technology: "photo-1516321318423-f06f85e504b3", // Technology and digital learning
  },
  testimonials: {
    student1: "photo-1507003211169-0a1dd7228f2d", // Happy student testimonial
    teacher1: "photo-1573496359142-b8d87734a5a2", // Professional teacher
    admin1: "photo-1560250097-0b93528c311a", // Professional administrator
  }
};

// Image quality settings for different screen sizes
export const imageSizes = {
  mobile: { width: 400, quality: 85 },
  tablet: { width: 800, quality: 90 },
  desktop: { width: 1200, quality: 95 },
  hero: { width: 1920, quality: 95 }
};

// Generate responsive image URLs with Unsplash optimization
export const getResponsiveImageUrls = (imageId: string) => {
  const baseUrl = `https://images.unsplash.com/${imageId}`;
  
  return {
    mobile: `${baseUrl}?w=${imageSizes.mobile.width}&q=${imageSizes.mobile.quality}&auto=format&fit=crop`,
    tablet: `${baseUrl}?w=${imageSizes.tablet.width}&q=${imageSizes.tablet.quality}&auto=format&fit=crop`,
    desktop: `${baseUrl}?w=${imageSizes.desktop.width}&q=${imageSizes.desktop.quality}&auto=format&fit=crop`,
    hero: `${baseUrl}?w=${imageSizes.hero.width}&q=${imageSizes.hero.quality}&auto=format&fit=crop`,
    // Default fallback
    default: `${baseUrl}?w=800&q=90&auto=format&fit=crop`
  };
};

// Generate optimized image URL for specific dimensions
export const getOptimizedImageUrl = (
  imageId: string, 
  width: number = 800, 
  height?: number, 
  quality: number = 90
) => {
  const baseUrl = `https://images.unsplash.com/${imageId}`;
  let params = `w=${width}&q=${quality}&auto=format&fit=crop`;
  
  if (height) {
    params += `&h=${height}`;
  }
  
  return `${baseUrl}?${params}`;
};

// Preload critical images for better performance
export const preloadCriticalImages = () => {
  const criticalImages = [
    educationalImages.hero.background,
    educationalImages.features.assignments,
    educationalImages.features.tests
  ];
  
  criticalImages.forEach(imageId => {
    const img = new Image();
    img.src = getOptimizedImageUrl(imageId, 1200, undefined, 95);
  });
};

export default educationalImages;
