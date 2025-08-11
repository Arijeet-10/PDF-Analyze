# api_b_router.py

import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import re
import time
import datetime
import unicodedata
import tempfile
import shutil
import base64
from typing import List, Dict, Any

import fitz
import nltk
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from sentence_transformers import SentenceTransformer, util
from nltk.tokenize import sent_tokenize
from werkzeug.utils import secure_filename

# ==== Constants ====
N_TOP_SECTIONS = 5
CHUNK_SENT_WINDOW = 4
CHUNKS_PER_SECTION_LIMIT = 10
SECTION_CANDIDATE_LIMIT = 60
ALLOWED_EXTENSIONS = {'pdf'}

# Download NLTK data if not available
try:
    nltk.download('punkt_tab', quiet=True)
    nltk.download('punkt', quiet=True)
except:
    pass

# Initialize Router
router = APIRouter()

# Load embedding model at startup
print("Loading embedding model for Semantic Analyzer...")
model = SentenceTransformer("sentence-transformers/all-MiniLM-L12-v2")
print("Model loaded successfully.")

# ==== Helper Functions ====
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def clean_text(text, max_length=600):
    text = unicodedata.normalize("NFKC", text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text[:max_length]

def remove_bullet_prefix(text):
    return re.sub(r'(?m)^(\s*[\u2022o\-\*\d\.\)\•°º(]+\s*)+', '', text).strip()

def smart_sentence_chunks(text, window=CHUNK_SENT_WINDOW):
    sents = [s.strip() for s in sent_tokenize(text) if len(s.strip()) > 20]
    if not sents: 
        return []
    
    chunks = []
    for i in range(len(sents)):
        chunk = ' '.join(sents[i:i+window])
        if len(chunk) > 40:
            chunks.append(chunk)
        if i+window >= len(sents): 
            break
    
    seen = set()
    uniq_chunks = []
    for c in chunks:
        if c not in seen and len(uniq_chunks) < CHUNKS_PER_SECTION_LIMIT:
            uniq_chunks.append(c)
            seen.add(c)
    return uniq_chunks

def extract_sections(pdf_path, max_pages=30):
    generic_keywords = {'instructions', 'ingredients', 'notes', 'preparation', 'method'}
    doc = fitz.open(pdf_path)
    sections = []
    current_section = None
    
    for page_idx, page in enumerate(doc):
        if page_idx >= max_pages: 
            break
        blocks = page.get_text('dict')['blocks']
        
        for b in blocks:
            if b['type'] != 0: 
                continue
            for line in b['lines']:
                this_line = ''.join([span['text'] for span in line['spans']])
                max_size = max([span['size'] for span in line['spans']]) if line['spans'] else 0
                is_bold = any('Bold' in span['font'] for span in line['spans'])
                norm_line = this_line.strip()
                norm_lower = norm_line.lower().strip().rstrip(':').strip()
                is_generic = norm_lower in generic_keywords
                
                if (len(norm_line) >= 7 and len(norm_line) < 100
                    and (is_bold or max_size > 12)
                    and re.match(r"^[A-Z0-9][\w\s\-:,()&']+$", norm_line)
                    and not norm_lower.startswith("figure")
                    and not is_generic):
                    
                    if current_section:
                        current_section['end_page'] = page_idx + 1
                        sections.append(current_section)
                    
                    current_section = {
                        'title': norm_line,
                        'page_number': page_idx + 1,
                        'section_text': "",
                    }
                    continue
                
                if current_section:
                    current_section['section_text'] += norm_line + ' '
    
    if current_section:
        current_section['end_page'] = current_section.get('page_number', 1)
        sections.append(current_section)
    
    doc.close()
    return [s for s in sections if len(s["section_text"]) > 70]

def process_pdfs(pdf_paths: List[str], persona: str, job: str) -> Dict[str, Any]:
    query = f"{persona}. Task: {job}"
    query_embedding = model.encode([query], convert_to_tensor=True)
    
    chunk_records = []
    for doc_path in pdf_paths:
        for sec in extract_sections(doc_path, max_pages=30):
            chunks = smart_sentence_chunks(sec['section_text'], window=CHUNK_SENT_WINDOW)
            for chunk in chunks:
                chunk_records.append({
                    "document": os.path.basename(doc_path),
                    "section_title": sec["title"],
                    "page_number": sec["page_number"],
                    "chunk_text": clean_text(chunk, 650),
                })
            if len(chunk_records) > SECTION_CANDIDATE_LIMIT * CHUNKS_PER_SECTION_LIMIT:
                break
    
    if not chunk_records:
        raise ValueError("No chunks extracted from the PDFs.")
    
    batch_chunk_texts = [rec["chunk_text"] for rec in chunk_records]
    chunk_embeddings = model.encode(batch_chunk_texts, convert_to_tensor=True)
    
    sims = util.cos_sim(query_embedding, chunk_embeddings)[0].tolist()
    for i, sim in enumerate(sims):
        chunk_records[i]["similarity"] = round(sim, 4)
    
    best_per_section = {}
    for rec in chunk_records:
        key = (rec["document"], rec["section_title"], rec["page_number"])
        if key not in best_per_section or rec["similarity"] > best_per_section[key]["similarity"]:
            best_per_section[key] = rec
    
    top_sections = sorted(
        best_per_section.values(), key=lambda x: x["similarity"], reverse=True
    )[:N_TOP_SECTIONS]
    
    extracted_sections = []
    subsection_analysis = []
    for idx, s in enumerate(top_sections):
        cleaned_text = remove_bullet_prefix(s["chunk_text"])
        extracted_sections.append({
            "document": s["document"],
            "section_title": s["section_title"],
            "importance_rank": idx + 1,
            "page_number": s["page_number"],
            "similarity_score": s["similarity"]
        })
        subsection_analysis.append({
            "document": s["document"],
            "refined_text": cleaned_text,
            "page_number": s["page_number"],
            "similarity_score": s["similarity"]
        })
    
    return {
        "metadata": {
            "input_documents": [os.path.basename(p) for p in pdf_paths],
            "persona": persona,
            "job_to_be_done": job,
            "processing_timestamp": datetime.datetime.now().isoformat(),
            "total_chunks_processed": len(chunk_records)
        },
        "extracted_sections": extracted_sections,
        "subsection_analysis": subsection_analysis
    }

# ==== API Endpoints ====
@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.now().isoformat(),
        "model_loaded": model is not None
    }

@router.post("/process-pdfs")
async def process_pdfs_api(
    persona: str = Form(...),
    job: str = Form(...),
    files: List[UploadFile] = File(...)
):
    try:
        if not persona.strip() or not job.strip():
            raise HTTPException(status_code=400, detail="Persona and job cannot be empty")

        pdf_paths = []
        with tempfile.TemporaryDirectory() as temp_dir:
            for file in files:
                if allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    file_path = os.path.join(temp_dir, filename)
                    with open(file_path, "wb") as f:
                        shutil.copyfileobj(file.file, f)
                    pdf_paths.append(file_path)
                else:
                    raise HTTPException(status_code=400, detail=f"Invalid file type for {file.filename}. Only PDF allowed.")

            start_time = time.time()
            result = process_pdfs(pdf_paths, persona, job)
            processing_time = time.time() - start_time
            result["metadata"]["processing_time_seconds"] = round(processing_time, 2)

            return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@router.post("/process-pdfs-json")
async def process_pdfs_json(data: Dict[str, Any]):
    try:
        persona = data.get("persona", "").strip()
        job = data.get("job", "").strip()
        files_data = data.get("files", [])

        if not persona or not job:
            raise HTTPException(status_code=400, detail="Missing or empty 'persona' and 'job'")
        if not files_data:
            raise HTTPException(status_code=400, detail="No files provided")

        pdf_paths = []
        with tempfile.TemporaryDirectory() as temp_dir:
            for file_data in files_data:
                filename = secure_filename(file_data.get("filename", "document.pdf"))
                if not filename.lower().endswith(".pdf"):
                    continue
                try:
                    content = base64.b64decode(file_data.get("content", ""))
                    file_path = os.path.join(temp_dir, filename)
                    with open(file_path, "wb") as f:
                        f.write(content)
                    pdf_paths.append(file_path)
                except Exception as e:
                    raise HTTPException(status_code=400, detail=f"Failed to decode file {filename}: {str(e)}")

            if not pdf_paths:
                raise HTTPException(status_code=400, detail="No valid PDF files to process")

            start_time = time.time()
            result = process_pdfs(pdf_paths, persona, job)
            processing_time = time.time() - start_time
            result["metadata"]["processing_time_seconds"] = round(processing_time, 2)

            return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@router.get("/info")
def api_info():
    return {
        "api_version": "1.0",
        "model_name": "sentence-transformers/all-MiniLM-L12-v2",
        "max_file_size_mb": 50,
        "supported_formats": ["pdf"],
        "configuration": {
            "n_top_sections": N_TOP_SECTIONS,
            "chunk_sentence_window": CHUNK_SENT_WINDOW,
            "chunks_per_section_limit": CHUNKS_PER_SECTION_LIMIT,
            "section_candidate_limit": SECTION_CANDIDATE_LIMIT
        },
        "endpoints": {
            "/health": "GET - Health check",
            "/process-pdfs": "POST - Process PDFs (form data)",
            "/process-pdfs-json": "POST - Process PDFs (JSON)",
            "/info": "GET - API information"
        }
    }
