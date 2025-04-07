# BiteBuddy

BiteBuddy is a React Native mobile application built with Expo that helps users track their food intake and maintain healthy eating habits through a gamified companion system.

## Features

- **User Authentication**: Sign up and login functionality using Supabase Auth
- **Food Logging**: 
  - Manual entry of food details (name, serving size, macros, calories)
  - Photo capture to analyze food (simulated AI functionality)
- **Companion System**: Virtual pet whose health, happiness, and energy reflect your nutritional choices
- **Responsive UI**: Works seamlessly on both iOS and Android
- **Real-time Feedback**: See how your food choices affect your companion's stats

## Technology Stack

- **Frontend**: React Native, Expo
- **UI Components**: Custom UI components inspired by shadcn design system
- **State Management**: Zustand
- **Backend**: Supabase (Authentication, Database)
- **Camera Integration**: Expo Camera
- **Navigation**: Expo Router

## Prerequisites

- Node.js (>= 14.0.0)
- npm or yarn
- Expo CLI
- A Supabase account and project

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/bitebuddy.git
   cd bitebuddy
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure Supabase:
   - Create a new Supabase project
   - Set up the following tables in your Supabase database:
     - `users`: For user information
     - `companions`: For companion data
     - `food_logs`: For food entries
   - Update the `lib/supabase/supabase.ts` file with your Supabase URL and anon key:
     ```typescript
     const supabaseUrl = 'YOUR_SUPABASE_URL';
     const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
     ```

4. Start the development server:
   ```
   npm start
   ```

5. Run on device or emulator:
   - For iOS: `npm run ios`
   - For Android: `npm run android`
   - Or scan the QR code with the Expo Go app

## Project Structure

```
bitebuddy/
├── app/                      # App screens using Expo Router
│   ├── (tabs)/               # Tab navigation screens
│   ├── auth/                 # Authentication screens
│   ├── food/                 # Food-related screens
│   ├── companion/            # Companion-related screens
│   └── _layout.tsx           # Root layout
├── assets/                   # Static assets like images
├── lib/                      # Shared code
│   ├── components/           # UI components
│   ├── stores/               # Zustand state stores
│   ├── supabase/             # Supabase client and helpers
│   └── utils/                # Utility functions
├── types/                    # TypeScript type definitions
└── README.md                 # Project documentation
```

## Customization

- **Theme**: You can customize the app's colors in the UI components and screens.
- **Companion Behavior**: Adjust how the companion reacts to different foods by modifying the calculation functions in `lib/stores/companionStore.ts`.
- **Food Analysis**: Enhance the simulated AI analysis in `lib/stores/foodStore.ts` with real AI services.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/bitebuddy](https://github.com/yourusername/bitebuddy)
