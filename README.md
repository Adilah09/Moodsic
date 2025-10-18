moodsic/
├── legacy           ← old HTML/CSS/JS here
├── frontend/        ← React app (with navbar, stats, moods, etc.)
├── backend/         ← Node/Express app (with .env ignored)
└── README.md

open 2 terminal, run:
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
(i alr put in .gitignore in frontend directory but do check b4 u push)
Only commit code and .env.example.