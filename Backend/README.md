# PDF Outline Extractor (Task_1A)

This tool extracts a clean, structured outline from PDF documents, including the **title** and **hierarchical headings (H1, H2, H3)**. It works **offline**, supports **multilingual documents**, and runs inside a lightweight **Docker container**.

## 🚀 Features

- 📑 Extracts Title + H1, H2, H3 headings
- 🌍 Multilingual support (e.g. Bengali, Japanese, English)
- 🧾 Output in clean JSON format
- 🐳 Runs completely offline in Docker (no internet access)

## 🛠 Folder Structure

```
Task_1A/
├── main.py          
├── Dockerfile       
├── requirements.txt 
├── input/          # Folder for input PDF files
├── output/         # Folder for output JSON files
└── README.md       
```

## 📦 Prerequisites

- Docker Desktop installed and running
- Git (for pushing to GitHub)

## 📋 Setup Instructions (step-by-step)

### Step 1: Clone or open the project

```bash
git clone https://github.com/Hrita0910/Pdf_extraction.git
cd Task_1A
```

### Step 2: Build Docker Image

```bash
docker build -t pdf-outline-solution:latest .
```

### Step 3: Run the container

```bash
docker run --rm `
  -v ${PWD}/input:/app/input `
  -v ${PWD}/output:/app/output `
  --network none `
  pdf-outline-solution:latest
```

## 🔧 Usage

1. Place your PDF files in the `input/` folder 
2. Run the Docker using Step 2 and Step 3 commands
3. Check the `output/` folder for generated JSON files
4. Each PDF will have a corresponding JSON file with the same name

## 👨‍💻 Tech Stack

- Python 3.10
- pdfplumber
- Docker
- JSON output format

## Note

Some pdfs and .json files are already inside the input and output folder, for testing purposes.

---
