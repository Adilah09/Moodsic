# 🏫 IS216 Web Application Development II

---

## Section & Group Number
**Example:** G4 Group 15 

---

## Group Members

| Photo | Full Name | Role / Features Responsible For |
|:--:|:--|:--|
| <img src="photos/member1.jpg" width="80"> | Siti Adilah Binte Selamat | Frontend Developer - Weather API Development, Charts, Page Design |
| <img src="photos/member2.jpg" width="80"> | (Eryn) Ei Ngon Phoo Pwint | Backend Developer - Spotify API & Account Integration, Playlist Generation|
| <img src="photos/member3.jpg" width="80"> | Aaliya Navas | Database & Auth - Firebase Integration |
| <img src="photos/member4.jpg" width="80"> | Sreya Mohan Doss | Frontend Developer – Word Cloud Interaction |
| <img src="photos/member5.jpg" width="80"> | Kushala Kanakesh | UI/UX Designer - Layout & Color Themes, Page Design |
| <img src="photos/member6.jpg" width="80"> | Etienne Wong Ai Ting | Frontend Developer - Personality Quiz Development |

> Place all headshot thumbnails in the `/photos` folder (JPEG or PNG).

---

## Business Problem

Describe the **real-world business or community problem** your project addresses.

> *Example:*  
> Navigating the vast world of music to find a playlist that matches our exact mood can be a surprisingly frustrating chore. The paradox of choice on platforms like Spotify often leads to decision fatigue, pulling us out of the moment instead of enhancing it. 

> Moodsic is an interactive web application designed to solve this. It intelligently matches the users’ current mood, personality traits, and even the weather to personalized playlists by analyzing a unique blend of inputs. By removing the burden of choice, Moodsic creates a more intuitive, enjoyable, and emotionally-connected music listening experience.

---

## Web Solution Overview

### 🎯 Intended Users
Identify your target user groups.
 Spotify Users mainly gen-z 

### 💡 What Users Can Do & Benefits
Explain the core features and the benefit each provides.  

| Feature | Description | User Benefit |
|:--|:--|:--|
| Register & Login | Secure authentication system | Personalized experience and data security |
| Search & Filter | Find items by category or location | Saves time finding relevant results |
| Favorites | Bookmark preferred items or places | Quick access to commonly used data |
| Reviews | Submit ratings and comments | Builds trust and community feedback |

---

## Tech Stack

| Logo | Technology | Purpose / Usage |
|:--:|:--|:--|
| <img src="https://raw.githubusercontent.com/github/explore/main/topics/html/html.png" width="40"> | **HTML5** | Structure and content |
| <img src="https://raw.githubusercontent.com/github/explore/main/topics/css/css.png" width="40"> | **CSS3 / Bootstrap** | Styling and responsiveness |
| <img src="https://raw.githubusercontent.com/github/explore/main/topics/javascript/javascript.png" width="40"> | **JavaScript (ES6)** | Client-side logic and interactivity |
| <img src="https://firebase.google.com/downloads/brand-guidelines/PNG/logo-logomark.png" width="40"> | **Firebase** | Authentication and database services |
| <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" width="40"> | **React** | Building user interfaces with components |
| <img src="https://upload.wikimedia.org/wikipedia/commons/1/15/Logo_D3.svg" width="40"> | **Chart** | Data visualisation |

> Add or remove technologies depending on your project stack (e.g., Express.js, Supabase, MongoDB Atlas, AWS S3).

---

## Use Case & User Journey

Provide screenshots and captions showing how users interact with your app.

1. **Landing Page**  
   <img src="screenshots/landing.png" width="600">  
   - Displays the homepage with navigation options.

2. **Search Feature**  
   <img src="screenshots/search.png" width="600">  
   - Users can browse and filter items by criteria.

3. **User Dashboard**  
   <img src="screenshots/dashboard.png" width="600">  
   - Shows saved data and recent activities.

> Save screenshots inside `/screenshots` with clear filenames.

---

## Developers Setup Guide

Comprehensive steps to help other developers or evaluators run and test your project.

---

### 0) Prerequisites
- [Git](https://git-scm.com/) v2.4+  
- [Node.js](https://nodejs.org/) v18+ and npm v9+  
- Access to backend or cloud services used (Firebase, MongoDB Atlas, AWS S3, etc.)

---

### 1) Download the Project
```bash
git clone https://github.com/<org-or-user>/<repo-name>.git
cd <repo-name>
npm install
```

---

### 2) Configure Environment Variables
Create a `.env` file in the root directory with the following structure:

```bash
VITE_API_URL=<your_backend_or_firebase_url>
VITE_FIREBASE_API_KEY=<your_firebase_api_key>
VITE_FIREBASE_AUTH_DOMAIN=<your_auth_domain>
VITE_FIREBASE_PROJECT_ID=<your_project_id>
VITE_FIREBASE_STORAGE_BUCKET=<your_storage_bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<your_sender_id>
VITE_FIREBASE_APP_ID=<your_app_id>
```

> Never commit the `.env` file to your repository.  
> Instead, include a `.env.example` file with placeholder values.

---

### 3) Backend / Cloud Service Setup

#### Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project.
3. Enable the following:
   - **Authentication** → Email/Password sign-in
   - **Firestore Database** or **Realtime Database**
   - **Hosting (optional)** if you plan to deploy your web app
4. Copy the Firebase configuration into your `.env` file.

#### Optional: Express.js / MongoDB
If your app includes a backend:
1. Create a `/server` folder for backend code.
2. Inside `/server`, create a `.env` file with:
   ```bash
   MONGO_URI=<your_mongodb_connection_string>
   JWT_SECRET=<your_jwt_secret_key>
   ```
3. Start the backend:
   ```bash
   cd server
   npm install
   npm start
   ```

---

### 4) Run the Frontend
To start the development server:
```bash
npm run dev
```
The project will run on [http://localhost:5173](http://localhost:5173) by default.

To build and preview the production version:
```bash
npm run build
npm run preview
```

---

### 5) Testing the Application

#### Manual Testing
Perform the following checks before submission:

| Area | Test Description | Expected Outcome |
|:--|:--|:--|
| Authentication | Register, Login, Logout | User successfully signs in/out |
| CRUD Operations | Add, Edit, Delete data | Database updates correctly |
| Responsiveness | Test on mobile & desktop | Layout adjusts without distortion |
| Navigation | All menu links functional | Pages route correctly |
| Error Handling | Invalid inputs or missing data | User-friendly error messages displayed |

#### Automated Testing (Optional)
If applicable:
```bash
npm run test
```

---

### 6) Common Issues & Fixes

| Issue | Cause | Fix |
|:--|:--|:--|
| `Module not found` | Missing dependencies | Run `npm install` again |
| `Firebase: permission-denied` | Firestore security rules not set | Check rules under Firestore → Rules |
| `CORS policy error` | Backend not allowing requests | Enable your domain in CORS settings |
| `.env` variables undefined | Missing `VITE_` prefix | Rename variables to start with `VITE_` |
| `npm run dev` fails | Node version mismatch | Check Node version (`node -v` ≥ 18) |

---

## Group Reflection

Each member should contribute 2–3 sentences on their learning and project experience.

> - Adilah: This project has challenged my coding and teamwork skills while introducing me to new technologies that make websites visually engaging. Creating charts was a new experience for me, and I quickly learned how important it is to balance technical implementation with clear and appealing design. Collaborating with my team enhanced my communication and time management abilities, as we combined our strengths to bring the project to life. Overall, I’m proud of what we accomplished and excited to continue improving my development skills. 

> - Eryn: I gained practical experience working with real-world frameworks and authentication systems. I discovered how APIs function in production settings, including the challenges of permissions and paid access. One major challenge was handling Spotify’s authentication and token flow, which I resolved through documentation study and iterative testing. Collaborating closely with the frontend team improved my communication and project management skills, while reinforcing the importance of structured problem-solving and teamwork in a development environment.

> - Aaliya:

> - Sreya: By sharing my word cloud designs with my group mates and getting their feedback, I could design the word cloud feature so that it matched the theme of the application better, and make it more usable for the users as well. I also explored different libraries like D3.js and other frameworks like Tailwind. Although I did not use them, it was a good opportunity to learn about the available resources. All in all, this learning experience has definitely been valuable, and has reinforced my learning in this module.

> - Kushala: As the Frontend Developer and UI/UX Designer for Moodsic, I learned how to transform creative ideas into interactive, user-friendly interfaces that seamlessly blend emotion and music. Building features like Song of the Day taught me how to balance aesthetics with usability, making every click and effect feel intentional. Through continuous testing and feedback, I strengthened my skills in visual design and user-centered thinking. It was very rewarding seeing our vision come to life.

> - Etienne: 
 

As a team, reflect on:
- Key takeaways from working with real-world frameworks  
- Challenges faced and how they were resolved  
- Insights on teamwork, project management, and problem-solving 

> - 













moodsic/
├── legacy           ← old HTML/CSS/JS here
├── frontend/        ← React app (with navbar, stats, moods, etc.)
├── backend/         ← Node/Express app (with .env ignored)
└── README.md


open 2 terminals, run:
cd backend
npm install
# create .env from .env.example
cp .env.example .env
then fill in the keys 

cd frontend
npm install

**to run our app, must start both backend/frontend:
in backend directory: 
npm start

in frontend directory: 
npm start

** impt **
Do not commit .env — it contains spotify secret keys.
(i alr put in .gitignore but do check b4 u push)
Only commit code and .env.example.

open legacy folder to use mamp/wamp
for react-app, after npm start for both front/backend, should be able to see at localhost:3000

