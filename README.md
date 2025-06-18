# Resource-Driven Process Management Tool

## Setup

### 1. Backend
#### a) Copy and edit environment variables
```bash
cd src/backend
cp .envExample .env
# Edit .env and set your MongoDB URI 
# Your MongoDB collections and fields are defined in src/backend/src/routes
```
#### b) Install dependencies
```bash
npm install
```
### 2. Frontend

#### a) Install dependencies
```bash
cd src/frontend
npm install
```

### 3. Python-Service
The Python service is located under src/backend/python.
Install its dependencies:
```bash
pip install -r requirements.txt
```

## Running
Backend
```bash
cd src/backend
node src/server.js
```

Frontend
(start from test-project5.2)
````bash
npm run dev
````

Python Service (in folder python)
````bash
python test_rdpm.py 
````