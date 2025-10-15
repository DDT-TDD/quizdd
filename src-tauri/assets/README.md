# Educational Quiz App Assets

This directory contains assets used by the educational quiz application, including images, audio files, and animations for questions.

## Directory Structure

```
assets/
├── images/
│   ├── mathematics/     # Math-related images (shapes, diagrams, etc.)
│   ├── geography/       # Maps, flags, landmarks
│   ├── english/         # Reading comprehension images, vocabulary aids
│   ├── science/         # Scientific diagrams, nature photos
│   └── general_knowledge/ # Miscellaneous educational images
├── audio/              # Audio files for pronunciation, sounds
└── animations/         # Lottie animations for rewards and feedback
```

## Asset Guidelines

### Images
- **Format**: PNG or JPEG preferred
- **Size**: Optimized for web (< 500KB per image)
- **Resolution**: 800x600px or similar aspect ratio
- **Content**: Child-appropriate, educational, clear and colorful

### Audio
- **Format**: MP3 or WAV
- **Quality**: 44.1kHz, 16-bit minimum
- **Duration**: Keep short (< 30 seconds for most clips)
- **Content**: Clear pronunciation, nature sounds, musical examples

### Animations
- **Format**: Lottie JSON files
- **Size**: Optimized for performance (< 100KB)
- **Duration**: 1-3 seconds for feedback, up to 5 seconds for rewards
- **Style**: Child-friendly, colorful, engaging

## Adding New Assets

1. Place files in the appropriate subject directory
2. Use descriptive filenames (e.g., `triangle_shape.png`, `uk_flag.png`)
3. Update the content seeder to reference new assets
4. Test assets in the application before deployment

## Asset Sources

When adding new assets, ensure they are:
- Royalty-free or properly licensed
- Educational and age-appropriate
- High quality and clear
- Accessible (good contrast, clear text)

## Sample Assets Needed

### Mathematics
- Basic shapes (circle, square, triangle, rectangle)
- Number representations (dots, objects for counting)
- Fraction diagrams
- Measurement tools (ruler, clock, scales)

### Geography
- World map
- Country flags
- Famous landmarks
- Continent outlines

### English
- Alphabet letters
- Common objects for vocabulary
- Story illustration scenes
- Phonics visual aids

### Science
- Animal photos (mammals, birds, fish, insects)
- Plant life cycle diagrams
- Human body parts
- Solar system diagram
- Weather symbols

### General Knowledge
- Historical figures
- Musical instruments
- Sports equipment
- Cultural symbols